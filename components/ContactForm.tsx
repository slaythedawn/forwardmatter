"use client";

import { useState } from "react";
import { ArrowIcon } from "./ArrowIcon";
import { contactCopy, contactFields, orgTypes } from "@/content/site";

/* Where the enquiry is posted.
 *
 * The normal build posts to its own /api/contact. The static export has no
 * server of its own, so it needs the full URL of a deployed one — set
 * NEXT_PUBLIC_CONTACT_ENDPOINT at build time, and add that export's origin to
 * CONTACT_ALLOWED_ORIGINS on the API side so the preflight passes.
 *
 * With neither, the form has nowhere to send. It still shows the success state,
 * because the static export exists to show the design — but it says the enquiry
 * was not sent, rather than letting someone believe it reached us. */
const ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || "";
const STATIC = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";
const UNWIRED = STATIC && !ENDPOINT;

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

    if (UNWIRED) {
      setSent(true);
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(ENDPOINT || "/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "We could not send that enquiry.");
      }
      setSent(true);
    } catch (cause) {
      setError(
        cause instanceof Error && cause.message
          ? cause.message
          : "We could not send that enquiry. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      {sent ? (
        <div className="contact-form__thanks" role="status">
          <h3>{contactCopy.thanksTitle}</h3>
          <p>{UNWIRED ? contactCopy.thanksPreview : contactCopy.thanksBody}</p>
        </div>
      ) : (
        <div className="contact-form__grid">
          {contactFields.map((field) => (
            <label className="field" key={field.name}>
              <span className="field__label">{field.label}</span>
              <input
                id={`contact-${field.name}`}
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                autoComplete={
                  field.name === "email"
                    ? "email"
                    : field.name === "name"
                      ? "name"
                      : field.name === "firm"
                        ? "organization"
                        : "organization-title"
                }
              />
            </label>
          ))}

          <label className="field field--full">
            <span className="field__label">Organisation type</span>
            <select id="contact-orgType" name="orgType" defaultValue={orgTypes[0]}>
              {orgTypes.map((type) => (
                <option value={type} key={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="field field--full">
            <span className="field__label">{contactCopy.messageLabel}</span>
            <textarea
              id="contact-message"
              name="message"
              rows={4}
              placeholder={contactCopy.messagePlaceholder}
            />
          </label>

          {/* Honeypot: hidden from people, filled in by bots, dropped server-side. */}
          <div className="honeypot" aria-hidden="true">
            <label htmlFor="contact-website">Website</label>
            <input id="contact-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          {error ? (
            <p className="contact-form__error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="contact-form__actions">
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? "Sending…" : contactCopy.submitLabel}
              <ArrowIcon className="btn__icon" />
            </button>
            <span className="contact-form__note">{contactCopy.note}</span>
          </div>
        </div>
      )}
    </form>
  );
}
