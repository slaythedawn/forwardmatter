"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowIcon } from "./ArrowIcon";
import { simulatorPage } from "@/content/site";

/* The simulator is served encrypted (see scripts/build-simulator.mjs). The key is
 * derived from the passphrase here, in the browser, and the decrypted document is
 * rendered in a sandboxed frame. Nothing about the attempt leaves the page, and a
 * wrong passphrase simply fails to decrypt: there is no server to ask and no
 * plain copy to find.
 *
 * The payload path is relative so it resolves on the normal build (/simulator ->
 * /simulator/payload.json) and on the static export (simulator.html at the host's
 * root -> simulator/payload.json) alike. */
const PAYLOAD_URL = "simulator/payload.json";

type Payload = { v: number; iter: number; salt: string; iv: string; data: string };

const fromBase64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

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
  const [html, setHtml] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [height, setHeight] = useState(900);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!html) return;
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      const next = Number(event.data?.fmSimHeight);
      if (Number.isFinite(next) && next > 200) setHeight(Math.ceil(next));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [html]);

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
      setHtml(await decrypt(payload, passphrase));
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

  if (html) {
    return (
      <div className="simulator__frame-wrap">
        <iframe
          ref={frame}
          className="simulator__frame"
          title={simulatorPage.frameTitle}
          sandbox="allow-scripts"
          srcDoc={html}
          style={{ height }}
        />
      </div>
    );
  }

  return (
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
  );
}
