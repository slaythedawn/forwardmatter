"use client";

import { useState } from "react";
import { engineFaces, flow, guide, hero, plain, story, strategyCards } from "@/lib/simulator/copy";
import type { EngineDossier, Evidence, RegisterRow } from "@/lib/simulator/evidence";
import { LAYERS, headlineSetup, lookupCell, money, signed, type ModelGrid, type SimState, type Targets } from "@/lib/simulator/model";
import { UniverseDialog } from "./Universe";

const REGISTER_ENGINE: Record<string, string> = {
  foundation: "Foundation",
  nowcaster: "Nowcaster",
  rx: "Prescription Reader",
  catalyst: "Catalyst",
  momentum: "Momentum",
};

export function Guide({
  evidence,
  grid,
  state,
  targets,
  onPick,
}: {
  evidence: Evidence;
  grid: ModelGrid;
  state: SimState;
  targets: Targets;
  onPick: (setup: "disc" | "hyb" | "sc") => void;
}) {
  const active = lookupCell(grid, headlineSetup(state), state.years, state.size);
  const ordered = [...evidence.engines].sort((a, b) => Number(b.id === "foundation") - Number(a.id === "foundation"));

  return (
    <>
      <section className="sim-block" id="what">
        <h2 className="sim-take">
          {story.title} <span>{story.line}</span>
        </h2>
        <div className="sim-stackvis" aria-hidden="true">
          <div className="sim-stackvis__core">Foundation · the stock picker · target +6.5</div>
          <div className="sim-stackvis__row">
            {LAYERS.filter((layer) => layer.k !== "foundation").map((layer) => (
              <span key={layer.k}>
                {layer.n.split(" ")[0]}
                <b>+{layer.base.toFixed(1)}</b>
              </span>
            ))}
          </div>
        </div>
        <p className="sim-note">{story.proof} {hero.takeaway}</p>
      </section>

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
        <p className="sim-pair-key sim-pair-key--legend">
          <span>
            <i />
            {plain.target}
          </span>
          <span>
            <b />
            {plain.stored}
          </span>
        </p>
        {evidence.engines.length === 0 ? (
          <p className="sim-note">{guide.empty}</p>
        ) : (
          <div className="sim-engine-grid">
            {ordered.map((engine) => (
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
        </details>
      </section>

      <section className="sim-block" id="strategies">
        <h2 className="sim-take">Three ways to run it.</h2>
        <div className="sim-strategies">
          {strategyCards.map((card) => {
            const key = card.id === "sc" ? "sc_strong" : card.id;
            const cell = lookupCell(grid, key, state.years, state.size);
            const selected = state.mode === "modelled" && state.setup === card.id;
            return (
              <button
                key={card.id}
                type="button"
                className={`sim-strategy${selected ? " is-on" : ""}`}
                aria-pressed={selected}
                onClick={() => onPick(card.id)}
              >
                <span className="sim-kicker">{card.who}</span>
                <strong>{card.title}</strong>
                <b>{cell.d?.med ? `${cell.d.med}%` : `${cell.med.toFixed(1)}%`}</b>
                <span>
                  Middle of 2,000 paths, {money(state.size * 1e6)}, {state.years} yr{state.years > 1 ? "s" : ""}.
                </span>
                <span>{card.does}</span>
              </button>
            );
          })}
        </div>
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
  const face = engineFaces[engine.id] ?? {
    chip: "Built · validating" as const,
    line: engine.does.split(/(?<=\.)\s/)[0] ?? engine.name,
    next: engine.status,
  };
  const layer = LAYERS.find((item) => item.k === engine.id);
  const designed = layer?.base ?? (targets.pts.find((point) => point.k === engine.id)?.v ?? 0);
  const stored = engine.id === "momentum" || att == null || Math.abs(att) < 0.05 ? null : att;
  const span = Math.max(designed, stored == null ? 0 : Math.abs(stored), 1);
  const [panel, setPanel] = useState<"test" | "rules" | null>(null);
  const [universe, setUniverse] = useState(false);
  const tests = evidence.register.filter((row) => row.engine === REGISTER_ENGINE[engine.id]);

  return (
    <article className={`sim-engine-card${engine.id === "foundation" ? " sim-engine-card--core" : ""}`}>
      <div className="sim-engine-card__face">
        <EngineMark id={engine.id} />
        <span className="sim-engine-card__name">{engine.name}</span>
        <span className={`sim-chip sim-chip--${face.chip.startsWith("Live") || face.chip === "Validated" ? "live" : "built"}`}>
          {face.chip}
        </span>
        <span className="sim-engine-card__line">{face.line}</span>
        <span className="sim-pair" aria-hidden="true">
          <i style={{ width: `${(designed / span) * 100}%` }} />
          {stored != null ? <b style={{ width: `${(Math.abs(stored) / span) * 100}%` }} /> : <b style={{ width: "0%" }} />}
        </span>
        <span className="sim-pair-key">
          <span>
            <i />
            {plain.target} +{designed.toFixed(1)}
          </span>
          <span>
            <b />
            {plain.stored} {stored == null ? "shows its target until the next test" : signed(stored)}
          </span>
        </span>
      </div>
      <div className="sim-engine-card__actions">
        <button type="button" aria-pressed={panel === "test"} onClick={() => setPanel(panel === "test" ? null : "test")}>
          See the test
        </button>
        <button type="button" aria-pressed={panel === "rules"} onClick={() => setPanel(panel === "rules" ? null : "rules")}>
          Rules
        </button>
        {engine.id === "foundation" ? (
          <button type="button" onClick={() => setUniverse(true)}>
            The universe
          </button>
        ) : null}
      </div>
      {panel === "rules" ? (
        <div className="sim-engine-card__body">
          <p>{engine.rule}</p>
          <p className="sim-note">{engine.rebalance} Eight rails plus a human veto sit over the book.</p>
        </div>
      ) : null}
      {panel === "test" ? (
        <div className="sim-engine-card__body">
          <p>
            <b>Next test.</b> {face.next}
          </p>
          {tests.length === 0 ? <p className="sim-note">Universe list loading</p> : null}
          {tests.map((row) => (
            <TestRow key={row.id} row={row} />
          ))}
          {state.fee !== 5 || state.market !== 8 ? (
            <p className="sim-note">The fee and the market reference change the target only.</p>
          ) : null}
        </div>
      ) : null}
      {universe ? <UniverseDialog onClose={() => setUniverse(false)} /> : null}
    </article>
  );
}

function TestRow({ row }: { row: RegisterRow }) {
  const status =
    row.status === "COMPLETE"
      ? "Validated"
      : row.status === "SCHEDULED"
        ? "Next test"
        : row.status === "RUNNING"
          ? "In validation"
          : row.status === "REGISTERED"
            ? "Registered"
            : "In validation";
  return (
    <article className="sim-test">
      <header>
        <span className={`sim-chip sim-chip--${status === "Validated" ? "live" : "built"}`}>{status}</span>
        <strong>
          {row.id} · {row.test}
        </strong>
      </header>
      <p>{row.rule}</p>
      <p>
        <b>Result.</b> {row.result}
      </p>
      <p className="sim-note">
        <b>Next.</b> {row.next}
      </p>
    </article>
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
