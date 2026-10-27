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

type Stage = "fetch" | "unlock" | "render" | null;

/* The site header is sticky, so a scroll target sits just below it. */
const headerOffset = () => (document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0) + 12;

export function SimulatorGate() {
  const [html, setHtml] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<Stage>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [height, setHeight] = useState(900);
  const frame = useRef<HTMLIFrameElement>(null);

  // Once open, the simulator takes the page: the page hero and the duplicate legal line give way to it.
  useEffect(() => {
    if (!html) return;
    document.body.classList.add("sim-open");
    return () => document.body.classList.remove("sim-open");
  }, [html]);

  useEffect(() => {
    if (!html) return;
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      const next = Number(event.data?.fmSimHeight);
      if (Number.isFinite(next) && next > 200) {
        setHeight(Math.ceil(next));
        setReady(true);
        setStage(null);
      }
      // The simulator asks for a scroll when it changes tab or jumps to a strategy, since
      // the frame is sized to its content and the page, not the frame, does the scrolling.
      const to = Number(event.data?.fmSimScrollTo);
      if (Number.isFinite(to) && frame.current) {
        const top = frame.current.getBoundingClientRect().top + window.scrollY + to - headerOffset();
        const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (Math.abs(window.scrollY - top) > 4) window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [html]);

  // The frame is as tall as its content, so it cannot see what the page shows. Tell it, so its animations
  // (the money growing, the counters) play when each part comes into view rather than all at once on load.
  useEffect(() => {
    if (!html || !ready) return;
    let queued = false;
    const send = () => {
      queued = false;
      const box = frame.current?.getBoundingClientRect();
      if (!box) return;
      frame.current?.contentWindow?.postMessage({ fmSimViewport: { y: -box.top, h: window.innerHeight } }, "*");
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(send);
    };
    send();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [html, ready]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setStage("fetch");
    const passphrase = String(new FormData(event.currentTarget).get("passphrase") ?? "").trim();
    try {
      const response = await fetch(PAYLOAD_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("payload");
      const payload = (await response.json()) as Payload;
      setStage("unlock");
      // Let the progress state paint before the key derivation takes the main thread.
      await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 30)));
      const doc = await decrypt(payload, passphrase);
      setStage("render");
      setHtml(doc);
    } catch (cause) {
      setStage(null);
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
      <div className={`simulator__frame-wrap${ready ? "" : " is-loading"}`}>
        {ready ? null : <Progress label={simulatorPage.gate.stages.render} />}
        <iframe
          ref={frame}
          className="simulator__frame"
          title={simulatorPage.frameTitle}
          sandbox="allow-scripts allow-downloads"
          allow="clipboard-write"
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
        <button type="submit" className="btn btn--primary" disabled={busy} aria-busy={busy}>
          {busy ? (
            <>
              <span className="spinner" aria-hidden="true" />
              {simulatorPage.gate.opening}
            </>
          ) : (
            simulatorPage.gate.button
          )}
          {busy ? null : <ArrowIcon className="btn__icon" />}
        </button>
        {busy && stage ? <Progress label={simulatorPage.gate.stages[stage]} /> : null}
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

function Progress({ label }: { label: string }) {
  return (
    <div className="sim-progress" role="status" aria-live="polite">
      <div className="sim-progress__bar" aria-hidden="true">
        <span />
      </div>
      <span className="sim-progress__label">{label}</span>
    </div>
  );
}
