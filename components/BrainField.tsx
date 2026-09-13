"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "brain-field": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        count?: string | number;
        palette?: string;
        fill?: string | number;
      };
    }
  }
}

/**
 * Decorative particle brain for the home hero.
 *
 * The element is purely ornamental: it is aria-hidden, never takes pointer
 * events, and is skipped entirely when the visitor prefers reduced motion or
 * the canvas API is unavailable, leaving the static radial highlight behind it.
 */
export function BrainField({ count }: { count: number }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const canvasSupported =
      typeof document !== "undefined" && !!document.createElement("canvas").getContext?.("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(canvasSupported && !reduced);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Script src="/vendor/brain-field.js" strategy="afterInteractive" />
      <brain-field
        count={count}
        palette="steel"
        fill="1.28"
        aria-hidden="true"
        style={{ width: "100%", height: "100%" }}
      />
    </>
  );
}
