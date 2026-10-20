import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SimulatorGate } from "@/components/SimulatorGate";
import { simulatorPage } from "@/content/site";

/* An internal page for people we have given the passphrase to. It is kept out of
 * the sitemap and marked noindex; the simulator itself is served encrypted (see
 * components/SimulatorGate.tsx and scripts/build-simulator.mjs). */
export const metadata: Metadata = {
  title: simulatorPage.metaTitle,
  description: simulatorPage.lead,
  robots: { index: false, follow: false, nocache: true },
};

export default function SimulatorPage() {
  return (
    <div className="page">
      <div className="container">
        <SiteHeader page="simulator" />

        <main id="main">
          <section className="about-hero simulator__hero">
            <div className="eyebrow">{simulatorPage.eyebrow}</div>
            <h1 className="h1 h1--about">
              {simulatorPage.titleLead}
              <span className="accent">{simulatorPage.titleAccent}</span>
            </h1>
            <p className="lead">{simulatorPage.lead}</p>
          </section>

          <section className="section--tail simulator">
            <SimulatorGate />
            <p className="simulator__legal">{simulatorPage.legal}</p>
          </section>
        </main>

        <SiteFooter page="simulator" />
      </div>
    </div>
  );
}
