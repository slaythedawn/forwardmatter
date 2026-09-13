import Link from "next/link";
import { ArrowIcon } from "../ArrowIcon";
import { BrainField } from "../BrainField";
import { credibility, hero } from "@/content/site";

export function Hero() {
  return (
    <>
      <section className="hero">
        <div className="hero__col">
          <div className="eyebrow">{hero.eyebrow}</div>
          <h1 className="h1">
            {hero.titleLead}
            <span className="accent">{hero.titleAccent}</span>
          </h1>
          <p className="lead">{hero.body}</p>
          <div className="hero__actions">
            <Link href="#contact" className="btn btn--primary">
              {hero.ctaLabel}
              <ArrowIcon className="btn__icon" />
            </Link>
            <Link href="#technology" className="text-link">
              {hero.secondaryLabel}
            </Link>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__stage">
            <div className="hero__glow" />
            <div className="hero__field">
              <BrainField count={hero.particleCount} />
            </div>
          </div>
          <div className="flow-pill">
            <span>Signals</span>
            <ArrowIcon className="flow-pill__icon" />
            <span>Matter Engine</span>
            <ArrowIcon className="flow-pill__icon" />
            <span className="flow-pill__last">Probability</span>
          </div>
        </div>
      </section>

      <div className="credibility">
        <div className="eyebrow eyebrow--sm eyebrow--strong">{credibility.label}</div>
        <div className="credibility__items">
          {credibility.items.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </>
  );
}
