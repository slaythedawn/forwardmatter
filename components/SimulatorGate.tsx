"use client";

import { useState } from "react";
import { Simulator } from "./simulator/Simulator";
import { ArrowIcon } from "./ArrowIcon";
import { simulatorPage } from "@/content/site";
import { isEvidence, type Evidence } from "@/lib/simulator/evidence";
import { isModelGrid, type ModelGrid } from "@/lib/simulator/model";

/* The model grid is served encrypted (see scripts/build-simulator.mjs). The key
 * is derived from the access phrase here, in the browser. A wrong phrase fails
 * to decrypt. Nothing about the attempt leaves the page.
 *
 * The payload path is relative so it resolves on the normal build
 * (/simulator -> /simulator/payload.json) and on the static export alike. */
const PAYLOAD_URL = "simulator/payload.json";

type Payload = { v: number; iter: number; salt: string; iv: string; data: string };

const fromBase64 = (value: string) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));

async function decrypt(payload: Payload, passphrase: string) {
  const enc = new TextEncoder();
  const material = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, [
    "deriveKey",
  ]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: fromBase64(payload.salt), iterations: payload.iter, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(payload.iv) },
    key,
    fromBase64(payload.data),
  );
  return new TextDecoder().decode(plain);
}

export function SimulatorGate() {
  const [bundle, setBundle] = useState<{ grid: ModelGrid; evidence: Evidence } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const passphrase = String(new FormData(event.currentTarget).get("passphrase") ?? "").trim();
    try {
      const response = await fetch(PAYLOAD_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("payload");
      const payload = (await response.json()) as Payload;
      if (payload.v !== 3) throw new Error("shape");
      const parsed = JSON.parse(await decrypt(payload, passphrase)) as { grid?: unknown; evidence?: unknown };
      if (!isModelGrid(parsed.grid) || !isEvidence(parsed.evidence)) throw new Error("shape");
      setBundle({ grid: parsed.grid, evidence: parsed.evidence });
    } catch (cause) {
      setError(
        cause instanceof Error && cause.message === "payload"
          ? simulatorPage.gate.unavailable
          : simulatorPage.gate.wrong,
      );
    } finally {
      setBusy(false);
    }
  }

  if (bundle) return <Simulator bundle={bundle} />;

  return (
    <>
      <section className="about-hero simulator__hero">
        <div className="eyebrow">{simulatorPage.eyebrow}</div>
        <h1 className="h1 h1--about">
          {simulatorPage.titleLead}
          <span className="accent">{simulatorPage.titleAccent}</span>
        </h1>
        <p className="lead">{simulatorPage.lead}</p>
      </section>
      <section className="section--tail simulator">
        <div className="card simulator__gate">
          <div className="eyebrow eyebrow--sm">{simulatorPage.gate.eyebrow}</div>
          <h2 className="simulator__gate-title">{simulatorPage.gate.title}</h2>
          <p className="body-15">{simulatorPage.gate.body}</p>
          <form className="simulator__form" onSubmit={onSubmit}>
            <label className="field">
              <span className="field__label">{simulatorPage.gate.label}</span>
              <input
                id="simulator-passphrase"
                type="password"
                name="passphrase"
                autoComplete="current-password"
                required
                autoFocus
              />
            </label>
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {busy ? simulatorPage.gate.opening : simulatorPage.gate.button}
              <ArrowIcon className="btn__icon" />
            </button>
            {error ? (
              <p className="contact-form__error" role="alert">
                {error}
              </p>
            ) : null}
          </form>
          <p className="simulator__gate-note">{simulatorPage.gate.note}</p>
        </div>
        <p className="simulator__legal">{simulatorPage.legal}</p>
      </section>
    </>
  );
}
