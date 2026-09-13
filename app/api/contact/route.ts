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

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Server-side validation of the enquiry form.
 *
 * Delivery is deliberately pluggable: set CONTACT_WEBHOOK_URL to forward the
 * enquiry to a CRM, inbox relay or Slack hook. With no URL configured the
 * enquiry is logged and accepted, so the form never breaks in a preview
 * environment.
 */
export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "We could not read that enquiry." }, { status: 400 });
  }

  const body = (raw ?? {}) as Record<string, unknown>;
  const enquiry: Enquiry = {
    name: clean(body.name, LIMITS.name),
    firm: clean(body.firm, LIMITS.firm),
    email: clean(body.email, LIMITS.email),
    role: clean(body.role, LIMITS.role),
    orgType: clean(body.orgType, LIMITS.orgType),
    message: clean(body.message, LIMITS.message),
  };

  const missing = (["name", "firm", "email"] as const).filter((field) => !enquiry[field]);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "Name, firm and email are all required." },
      { status: 400 },
    );
  }

  if (!EMAIL.test(enquiry.email)) {
    return NextResponse.json({ error: "That email address does not look right." }, { status: 400 });
  }

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    try {
      const forwarded = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...enquiry, receivedAt: new Date().toISOString() }),
      });
      if (!forwarded.ok) throw new Error(`Webhook responded ${forwarded.status}`);
    } catch (cause) {
      console.error("Contact webhook failed", cause);
      return NextResponse.json(
        { error: "We could not send that enquiry. Please email us instead." },
        { status: 502 },
      );
    }
  } else {
    console.info("Contact enquiry received (no CONTACT_WEBHOOK_URL configured)", {
      firm: enquiry.firm,
      orgType: enquiry.orgType,
    });
  }

  return NextResponse.json({ ok: true });
}
