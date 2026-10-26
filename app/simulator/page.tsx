import type { Metadata } from "next";
import { Figtree, IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SimulatorGate } from "@/components/SimulatorGate";
import { simulatorPage } from "@/content/site";
import "./simulator.css";

const sans = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--fm-sans",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--fm-serif",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--fm-mono",
  display: "swap",
});

/* An internal page for people we have given the access phrase to. It is kept out
 * of the sitemap and marked noindex. The model grid is served encrypted (see
 * components/SimulatorGate.tsx and scripts/build-simulator.mjs). */
export const metadata: Metadata = {
  title: simulatorPage.metaTitle,
  description: simulatorPage.lead,
  robots: { index: false, follow: false, nocache: true },
};

export default function SimulatorPage() {
  return (
    <div className={`page fm-doc ${sans.variable} ${serif.variable} ${mono.variable}`}>
      <div className="container">
        <SiteHeader page="simulator" />

        <main id="main">
          <SimulatorGate />
        </main>

        <SiteFooter page="simulator" />
      </div>
    </div>
  );
}
