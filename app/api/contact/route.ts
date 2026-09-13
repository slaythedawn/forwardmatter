/* Receives an enquiry from the contact form and delivers it to Forward Matter.
 *
 * Delivery is decided by whichever environment variable is set, checked in this
 * order. All are set in the hosting project, never in the repo:
 *
 *   RESEND_API_KEY   send the enquiry as email through Resend. Needs CONTACT_TO.
 *   CONTACT_TO       who the email is addressed to. Required for the email
 *                    route — there is no default, because a default would mean a
 *                    real address sitting in a public repository.
 *   CONTACT_FROM     the from address. Must be on a Resend-verified domain.
 *                    Unset, this uses Resend's shared onboarding@resend.dev,
 *                    which only delivers to the address that owns the Resend
 *                    account — which is why CONTACT_TO must be that address
 *                    until forwardmatter.com is verified in Resend.
 *   CONTACT_WEBHOOK_URL  POST the enquiry as JSON instead (CRM, Slack, Zapier).
 *
 * With none of them set this returns 503 and the form shows its error. It does
 * not accept-and-log: an enquiry that silently vanishes while the visitor reads
 * "Thank you" is worse than one that visibly failed.
 *
 * No acknowledgement is sent to the enquirer. Anything this endpoint mailed to a
 * submitted address would make it a way to deliver attacker-chosen text over our
 * domain, and the form already confirms receipt on the page.
 */
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Enquiry = {
  name: string;
  firm: string;
  email: string;
  role: string;
  orgType: string;
  message: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LIMITS: Record<keyof Enquiry, number> = {
  name: 120,
  firm: 160,
  email: 254,
  role: 120,
  orgType: 80,
  message: 4000,
};

const LABELS: [keyof Enquiry, string][] = [
  ["name", "Name"],
  ["firm", "Firm"],
  ["email", "Email"],
  ["role", "Role"],
  ["orgType", "Organisation type"],
  ["message", "Message"],
];

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string,
  );
}

function textOf(enquiry: Enquiry) {
  return LABELS.filter(([key]) => enquiry[key])
    .map(([key, label]) => `${label}: ${enquiry[key]}`)
    .join("\n");
}

function htmlOf(enquiry: Enquiry) {
  const rows = LABELS.filter(([key]) => enquiry[key])
    .map(
      ([key, label]) =>
        "<tr>" +
        `<td style="padding:6px 16px 6px 0;color:#546171;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td>` +
        `<td style="padding:6px 0;color:#242d38"><strong>${escapeHtml(enquiry[key])}</strong></td>` +
        "</tr>",
    )
    .join("");
  return (
    '<div style="font-family:ui-sans-serif,system-ui,sans-serif;font-size:15px;line-height:1.6">' +
    '<p style="margin:0 0 14px">New enquiry from forwardmatter.com</p>' +
    `<table style="border-collapse:collapse">${rows}</table></div>`
  );
}

async function sendEmail(enquiry: Enquiry, to: string) {
  const from = process.env.CONTACT_FROM || "Forward Matter <onboarding@resend.dev>";
  const who = enquiry.firm || enquiry.name || enquiry.email;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      // So replying in the mail client goes to the enquirer, not to Resend.
      reply_to: enquiry.email,
      subject: `Enquiry — ${who}`,
      text: textOf(enquiry),
      html: htmlOf(enquiry),
    }),
  });

  if (!response.ok) {
    throw new Error(`resend ${response.status} ${(await response.text()).slice(0, 200)}`);
  }
}

async function sendWebhook(enquiry: Enquiry, url: string) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...enquiry, receivedAt: new Date().toISOString() }),
  });
  if (!response.ok) throw new Error(`webhook responded ${response.status}`);
}

/* The static export is hosted on a different origin to the API, so the browser
   preflights its POST. Only origins named in CONTACT_ALLOWED_ORIGINS may call
   it; same-origin requests never reach this. */
function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = (process.env.CONTACT_ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!origin || !allowed.includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

export async function POST(request: Request) {
  const cors = corsHeaders(request.headers.get("origin"));
  const fail = (error: string, status: number) =>
    NextResponse.json({ error }, { status, headers: cors });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return fail("We could not read that enquiry.", 400);
  }

  const body = (raw ?? {}) as Record<string, unknown>;

  /* Honeypot: a field hidden from people and left empty by them, which bots
     fill in because they fill everything. Accepted so the bot does not retry,
     and dropped. */
  if (clean(body.website, 200)) {
    return NextResponse.json({ ok: true }, { headers: cors });
  }

  const enquiry: Enquiry = {
    name: clean(body.name, LIMITS.name),
    firm: clean(body.firm, LIMITS.firm),
    email: clean(body.email, LIMITS.email),
    role: clean(body.role, LIMITS.role),
    orgType: clean(body.orgType, LIMITS.orgType),
    message: clean(body.message, LIMITS.message),
  };

  if (!enquiry.name || !enquiry.firm || !enquiry.email) {
    return fail("Name, firm and email are all required.", 400);
  }
  if (!EMAIL.test(enquiry.email)) {
    return fail("That email address does not look right.", 400);
  }

  const to = process.env.CONTACT_TO;
  const webhook = process.env.CONTACT_WEBHOOK_URL;

  try {
    if (process.env.RESEND_API_KEY && to) {
      await sendEmail(enquiry, to);
    } else if (webhook) {
      await sendWebhook(enquiry, webhook);
    } else {
      console.error("Contact enquiry not delivered: no RESEND_API_KEY + CONTACT_TO, no CONTACT_WEBHOOK_URL");
      return fail("Enquiries are not reaching us right now. Please email us instead.", 503);
    }
  } catch (cause) {
    console.error("Contact delivery failed", cause);
    return fail("We could not send that enquiry. Please email us instead.", 502);
  }

  return NextResponse.json({ ok: true }, { headers: cors });
}
