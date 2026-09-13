import Image from "next/image";
import { caseStudy } from "@/content/site";

export function CaseStudy() {
  return (
    <section className="section--tail">
      <div className="case">
        <div className="case__media">
          <Image
            src="/media/case-vial.webp"
            alt="An unbranded medicine vial and injector pen"
            fill
            sizes="(max-width: 720px) 100vw, 50vw"
            style={{ objectFit: "cover", objectPosition: "60% center" }}
            priority={false}
          />
          <div className="case__tag">Case study</div>
        </div>

        <div className="case__copy">
          <div className="eyebrow eyebrow--sm">{caseStudy.eyebrow}</div>
          <h2 className="h2 h2--small">{caseStudy.title}</h2>
          <p className="case__body">{caseStudy.body}</p>

          <div className="well case__chart">
            <div className="case__chart-head">
              <span className="case__chart-title">{caseStudy.chartTitle}</span>
              <span className="case__chart-source">{caseStudy.chartSource}</span>
            </div>
            {/*
              The viewBox is stretched horizontally, so the line uses
              vector-effect="non-scaling-stroke" to keep an even 2px weight.
              Only the four labelled points are real; nothing is drawn between them.
            */}
            <svg
              viewBox="0 0 300 100"
              preserveAspectRatio="none"
              role="img"
              aria-label={caseStudy.chartAlt}
            >
              <defs>
                <linearGradient id="fmCaseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5b82b4" stopOpacity="0.42" />
                  <stop offset="100%" stopColor="#5b82b4" stopOpacity="0.04" />
                </linearGradient>
              </defs>
              <path d="M6 100 L6 90 L108 63 L210 40 L294 14 L294 100 Z" fill="url(#fmCaseFill)" />
              <path
                d="M6 90 L108 63 L210 40 L294 14"
                fill="none"
                stroke="#345984"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              {[
                [6, 90, 3, "#8fb4dd"],
                [108, 63, 3, "#8fb4dd"],
                [210, 40, 3, "#8fb4dd"],
                [294, 14, 3.5, "#345984"],
              ].map(([cx, cy, r, fill]) => (
                <circle
                  key={String(cx)}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={fill as string}
                  stroke="#e6ebf0"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            <div className="case__chart-labels">
              {caseStudy.points.map((point) => (
                <span key={point.label}>
                  {point.label}
                  <br />
                  <strong>{point.value}</strong>
                </span>
              ))}
            </div>
          </div>

          <div className="case__criteria">
            <div className="eyebrow eyebrow--sm case__criteria-head">{caseStudy.criteriaHead}</div>
            {caseStudy.criteria.map((criterion) => (
              <div className="case__criterion" key={criterion.lead}>
                <span className="case__criterion-dot" />
                <span>
                  <strong>{criterion.lead}</strong> {criterion.body}
                </span>
              </div>
            ))}
          </div>

          <p className="case__asat">{caseStudy.asAt}</p>
        </div>
      </div>
    </section>
  );
}
