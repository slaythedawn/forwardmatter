"use client";

import { useState } from "react";
import { ArrowIcon } from "./ArrowIcon";
import { contactCopy, contactFields, orgTypes } from "@/content/site";

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

    try {
      const response = await fetch("/api/contact", {
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
    <form className="contact-form" onSubmit={onSubmit} noValidate={false}>
      {sent ? (
        <div className="contact-form__thanks" role="status">
          <h3>{contactCopy.thanksTitle}</h3>
          <p>{contactCopy.thanksBody}</p>
        </div>
      ) : (
        <div className="contact-form__grid">
          {contactFields.map((field) => (
            <label className="field" key={field.name}>
              <span className="field__label">{field.label}</span>
              <input
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
            <select name="orgType" defaultValue={orgTypes[0]}>
              {orgTypes.map((type) => (
                <option value={type} key={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="field field--full">
            <span className="field__label">{contactCopy.messageLabel}</span>
            <textarea name="message" rows={4} placeholder={contactCopy.messagePlaceholder} />
          </label>

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
