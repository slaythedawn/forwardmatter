"use client";

import { useState } from "react";
import { guide, hero } from "@/lib/simulator/copy";
import type { EngineDossier, Evidence } from "@/lib/simulator/evidence";
import {
  applyPreset,
  computeTargets,
  defaultState,
  headlineSetup,
  lookupCell,
  r1,
  signed,
  type ModelGrid,
  type SimState,
  type Targets,
} from "@/lib/simulator/model";

export function Guide({
  evidence,
  grid,
  state,
  targets,
  onRun,
  onNotes,
}: {
  evidence: Evidence;
  grid: ModelGrid;
  state: SimState;
  targets: Targets;
  onRun: () => void;
  onNotes: () => void;
}) {
  const published = computeTargets(applyPreset(defaultState(), "base"));
  const upside = computeTargets(applyPreset(defaultState(), "upside"));
  const active = lookupCell(grid, headlineSetup(state), state.years, state.size);

  return (
    <>
      <section className="sim-block" id="how">
        <div className="section-head">
          <div className="eyebrow section-head__eyebrow">{hero.kicker}</div>
          <div className="section-head__body">
            <h1 className="h2 h2--small">{hero.title}</h1>
            <p className="body-17">{hero.body}</p>
          </div>
        </div>
        <div className="sim-steps">
          {hero.steps.map((step) => (
            <article className="card sim-step" key={step.title}>
              <h3 className="h3">{step.title}</h3>
              <p className="body-15">{step.body}</p>
            </article>
          ))}
        </div>
        <div className="sim-stats sim-stats--guide">
          <div>
            <b>{r1(published.net)}%</b>
            <span>{hero.baseStatLabel}</span>
          </div>
          <div>
            <b>{r1(upside.net)}%</b>
            <span>{hero.upsideStatLabel}</span>
          </div>
          <div>
            <b>{hero.stats[1].value}</b>
            <span>{hero.stats[1].label}</span>
          </div>
        </div>
        <p className="sim-note">
          {hero.stats[0].value} {hero.stats[0].label}. {hero.pills.join(" · ")}
        </p>
      </section>

      <section className="sim-block" id="engines">
        <div className="section-head">
          <div className="eyebrow section-head__eyebrow">{guide.enginesKicker}</div>
          <div className="section-head__body">
            <h2 className="h2 h2--small">{guide.enginesTitle}</h2>
            <p className="body-17">{guide.enginesLede}</p>
          </div>
        </div>
        {evidence.engines.length === 0 ? (
          <p className="sim-note">{guide.empty}</p>
        ) : (
          <div className="sim-engine-grid">
            {evidence.engines.map((engine, index) => (
              <EngineCard
                key={engine.id}
                engine={engine}
                evidence={evidence}
                targets={targets}
                state={state}
                att={active.att[engine.id]}
                startOpen={index === 0}
              />
            ))}
          </div>
        )}
        <p className="sim-note">
          <button type="button" className="text-link sim-inline-btn" onClick={onNotes}>
            {guide.notes}
          </button>
        </p>
      </section>

      <section className="sim-block sim-block--tight" id="simulator">
        <div className="section-head">
          <div className="eyebrow section-head__eyebrow">{guide.toolKicker}</div>
          <div className="section-head__body">
            <h2 className="h2 h2--small">{guide.toolTitle}</h2>
            <p className="body-17">{guide.toolLede}</p>
            <button type="button" className="btn btn--secondary sim-run-btn" onClick={onRun}>
              {guide.run}
            </button>
          </div>
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
  startOpen,
}: {
  engine: EngineDossier;
  evidence: Evidence;
  targets: Targets;
  state: SimState;
  att: number | undefined;
  startOpen: boolean;
}) {
  const layer = targets.pts.find((point) => point.k === engine.id);
  const hurdle = layer ? (layer.on ? `${signed(layer.v)} pts in this target stack` : "Switched off in this target stack") : "";
  const stored =
    engine.id === "momentum" || att == null
      ? "No separate row in the stored attribution."
      : `${signed(att)} pts in the stored paths at this capital and horizon.`;
  const holding = engine.id === "foundation" ? evidence.book.holdings[0] : undefined;
  const reads = engine.does.split(/(?<=\.)\s/)[0] ?? engine.does;
  const [open, setOpen] = useState(startOpen);

  return (
    <details
      className="card sim-engine-card"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <span className="sim-engine-card__name">{engine.name}</span>
        <span className="sim-engine-card__status">{engine.status}</span>
        <span className="sim-engine-card__line">{reads}</span>
      </summary>
      <div className="sim-engine-card__body">
        <dl className="sim-spec">
          <div>
            <dt>Rule</dt>
            <dd>{engine.rule}</dd>
          </div>
          <div>
            <dt>What it holds or reads</dt>
            <dd>
              {engine.does} Weight: {engine.weight}. Rebalance: {engine.rebalance}.
            </dd>
          </div>
          <div>
            <dt>Target layer</dt>
            <dd>{engine.target}</dd>
          </div>
          <div>
            <dt>Evidence</dt>
            <dd>{engine.evidence}</dd>
          </div>
          <div>
            <dt>Test status</dt>
            <dd>{engine.status}</dd>
          </div>
          <div>
            <dt>Contribution</dt>
            <dd>
              {engine.contribution} {hurdle ? `${hurdle}. ` : ""}
              {stored}
              {state.fee !== 5 || state.market !== 8 ? " The fee and the market reference change the target only." : ""}
            </dd>
          </div>
        </dl>
        {holding ? (
          <div className="sim-holding">
            <p className="eyebrow eyebrow--sm">{holding.role}</p>
            <h3 className="h3">{holding.name}</h3>
            <p className="body-15">{holding.weight}</p>
            <p className="body-15">{holding.why}</p>
            <p className="sim-note">{holding.exits}</p>
          </div>
        ) : null}
      </div>
    </details>
  );
}
