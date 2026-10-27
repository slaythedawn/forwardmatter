import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SimulatorGate } from "@/components/SimulatorGate";
import { simulatorPage } from "@/content/site";
import "./simulator.css";

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
    <div className="page sim-page">
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
