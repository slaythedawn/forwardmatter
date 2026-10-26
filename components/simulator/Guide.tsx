"use client";

import { engineFaces, flow, guide, hero, plain } from "@/lib/simulator/copy";
import type { EngineDossier, Evidence } from "@/lib/simulator/evidence";
import { headlineSetup, lookupCell, signed, type ModelGrid, type SimState, type Targets } from "@/lib/simulator/model";

export function Guide({
  evidence,
  grid,
  state,
  targets,
  onNotes,
}: {
  evidence: Evidence;
  grid: ModelGrid;
  state: SimState;
  targets: Targets;
  onNotes: () => void;
}) {
  const active = lookupCell(grid, headlineSetup(state), state.years, state.size);

  return (
    <>
      <section className="sim-block" id="how">
        <h2 className="sim-take">{guide.howTitle}</h2>
        <ol className="sim-flow">
          {flow.map((step, index) => (
            <li key={step.id}>
              <span className="sim-flow__n" aria-hidden="true">
                {index + 1}
              </span>
              <strong>{step.title}</strong>
              <span>{step.line}</span>
            </li>
          ))}
        </ol>
        <details className="sim-more">
          <summary>{guide.howMore}</summary>
          <p>{hero.body}</p>
        </details>
      </section>

      <section className="sim-block" id="engines">
        <h2 className="sim-take">{guide.enginesTitle}</h2>
        {evidence.engines.length === 0 ? (
          <p className="sim-note">{guide.empty}</p>
        ) : (
          <div className="sim-engine-grid">
            {evidence.engines.map((engine) => (
              <EngineCard
                key={engine.id}
                engine={engine}
                evidence={evidence}
                targets={targets}
                state={state}
                att={active.att[engine.id]}
              />
            ))}
          </div>
        )}
        <details className="sim-more">
          <summary>{plain.more}</summary>
          <p>{guide.enginesLede}</p>
          <button type="button" className="text-link sim-inline-btn" onClick={onNotes}>
            {guide.notes}
          </button>
        </details>
      </section>
    </>
  );
}

function EngineCard({
  engine,
  evidence,
  targets,
  state,
  att,
}: {
  engine: EngineDossier;
  evidence: Evidence;
  targets: Targets;
  state: SimState;
  att: number | undefined;
}) {
  const face = engineFaces[engine.id] ?? { chip: "In testing" as const, line: engine.does.split(/(?<=\.)\s/)[0] ?? engine.name };
  const layer = targets.pts.find((point) => point.k === engine.id);
  const target = layer?.on ? layer.v : 0;
  const stored = engine.id === "momentum" || att == null ? null : att;
  const span = Math.max(target, stored == null ? 0 : Math.abs(stored), 1);
  const holding = engine.id === "foundation" ? evidence.book.holdings[0] : undefined;

  return (
    <details className="sim-engine-card">
      <summary>
        <EngineMark id={engine.id} />
        <span className="sim-engine-card__name">{engine.name}</span>
        <span className={`sim-chip sim-chip--${face.chip === "Live" ? "live" : face.chip === "Gated" ? "gated" : "paper"}`}>{face.chip}</span>
        <span className="sim-engine-card__line">{face.line}</span>
        <span className="sim-pair" aria-hidden="true">
          <i style={{ width: `${(target / span) * 100}%` }} />
          <b style={{ width: stored == null ? "0%" : `${(Math.abs(stored) / span) * 100}%` }} />
        </span>
        <span className="sim-pair-key">
          <span><i />{plain.target}</span>
          <span><b />{plain.stored}</span>
        </span>
      </summary>
      <div className="sim-engine-card__body">
        <div className="sim-pair-key">
          <span><i />{plain.target} {layer?.on ? signed(target) : "off"}</span>
          <span><b />{plain.stored} {stored == null ? "—" : signed(stored)}</span>
        </div>
        <dl className="sim-spec">
          <div>
            <dt>Rule</dt>
            <dd>{engine.rule}</dd>
          </div>
          <div>
            <dt>What it holds or reads</dt>
            <dd>
              {engine.does} {engine.weight}
            </dd>
          </div>
          <div>
            <dt>Target</dt>
            <dd>{engine.target}</dd>
          </div>
          <div>
            <dt>Evidence</dt>
            <dd>{engine.evidence}</dd>
          </div>
          <div>
            <dt>Test</dt>
            <dd>{engine.status}</dd>
          </div>
          <div>
            <dt>Contribution</dt>
            <dd>
              {engine.contribution}
              {state.fee !== 5 || state.market !== 8 ? " The fee and the market reference change the target only." : ""}
            </dd>
          </div>
        </dl>
        {holding ? (
          <p className="sim-note">
            <b>{holding.name}.</b> {holding.weight} {holding.why}
          </p>
        ) : null}
      </div>
    </details>
  );
}

function EngineMark({ id }: { id: string }) {
  const common = { width: 28, height: 28, viewBox: "0 0 28 28", fill: "none", "aria-hidden": true as const };
  if (id === "foundation") {
    return (
      <svg {...common}>
        <rect x="4" y="16" width="6" height="8" fill="#1b2a3d" />
        <rect x="11" y="10" width="6" height="14" fill="#345984" />
        <rect x="18" y="6" width="6" height="18" fill="#8fb4dd" />
      </svg>
    );
  }
  if (id === "nowcaster") {
    return (
      <svg {...common}>
        <circle cx="14" cy="14" r="9" stroke="#1b2a3d" strokeWidth="1.6" />
        <path d="M14 8v6l4 2" stroke="#345984" strokeWidth="1.6" />
      </svg>
    );
  }
  if (id === "rx") {
    return (
      <svg {...common}>
        <path d="M8 18c4-8 8-8 12 0" stroke="#1b2a3d" strokeWidth="1.6" />
        <path d="M8 14h12" stroke="#345984" strokeWidth="1.6" />
        <circle cx="14" cy="14" r="2" fill="#345984" />
      </svg>
    );
  }
  if (id === "catalyst") {
    return (
      <svg {...common}>
        <path d="M14 5l2.2 6.2H23l-5.2 3.8 2 6.2L14 17.6 8.2 21.2l2-6.2L5 11.2h6.8z" stroke="#1b2a3d" strokeWidth="1.4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M5 18l5-6 4 3 8-8" stroke="#1b2a3d" strokeWidth="1.6" />
      <path d="M17 7h5v5" stroke="#345984" strokeWidth="1.6" />
    </svg>
  );
}
