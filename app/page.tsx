import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CaseStudy } from "@/components/sections/CaseStudy";
import { CatalystPanel } from "@/components/sections/CatalystPanel";
import { ClosingBlock } from "@/components/sections/ClosingBlock";
import { Hero } from "@/components/sections/Hero";
import { IntelligenceSystem } from "@/components/sections/IntelligenceSystem";
import { PlatformSection } from "@/components/sections/PlatformSection";

export default function HomePage() {
  return (
    <div className="page">
      <div className="container">
        <SiteHeader page="home" />
        <main id="main">
          <Hero />
          <IntelligenceSystem />
          <CatalystPanel />
          <PlatformSection />
          <CaseStudy />
          <ClosingBlock />
        </main>
        <SiteFooter page="home" />
      </div>
    </div>
  );
}
