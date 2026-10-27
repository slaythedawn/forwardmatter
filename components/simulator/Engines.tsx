"use client";

import { descriptions, workspace } from "@/lib/simulator/copy";
import type { EngineDossier, Evidence } from "@/lib/simulator/evidence";
import {
  applyPreset,
  computeTargets,
  defaultState,
  disp,
  headlineSetup,
  lookupCell,
  r1,
  signed,
  type ModelGrid,
  type SimState,
  type Targets,
} from "@/lib/simulator/model";

const PUBLISHED = [
  { key: "disc", label: "A · Disciplined", kind: "Modelled" },
  { key: "hyb", label: "B · Conviction hybrid", kind: "Modelled" },
  { key: "sc_strong", label: "C · At scale, strong", kind: "Modelled" },
] as const;

export function EnginesPanel({
  evidence,
  grid,
  state,
  targets,
}: {
  evidence: Evidence;
  grid: ModelGrid;
  state: SimState;
  targets: Targets;
}) {
  const base = computeTargets(applyPreset(defaultState(), "base"));
  const foundation = computeTargets(applyPreset(defaultState(), "conservative"));
  const published = PUBLISHED.map((item) => ({ ...item, cell: lookupCell(grid, item.key, 3, 10) }));
  const active = lookupCell(grid, headlineSetup(state), state.years, state.size);

  return (
    <div className="sim-engines">
      <section className="sim-sec">
        <p className="eyebrow eyebrow--accent">The book</p>
        <h2 className="sim-h2">{workspace.enginesTitle}</h2>
        <p className="sim-lede">{workspace.enginesLede}</p>

        <p className="sim-kicker">{workspace.published}</p>
        <dl className="sim-run sim-run--five">
          <div>
            <dd>{r1(base.net)}%</dd>
            <dt>Base target, net of the 5% fee</dt>
          </div>
          <div>
            <dd>{r1(foundation.net)}%</dd>
            <dt>Foundation only, target</dt>
          </div>
          {published.map((item) => (
            <div key={item.key}>
              <dd>{disp(item.cell, "med", true)}%</dd>
              <dt>
                {item.label}, {item.kind.toLowerCase()}
              </dt>
            </div>
          ))}
        </dl>
        <p className="sim-note">{workspace.publishedNote}</p>
      </section>

      <section className="sim-sec">
        <p className="sim-kicker">{workspace.questionKicker}</p>
        <h2 className="sim-h2">{evidence.brief.questionTitle}</h2>
        <p className="sim-lede">{evidence.brief.question}</p>
        <div className="sim-table-wrap">
          <table className="sim-table">
            <caption>Chance of 30% or more, modelled, A$10m, three years</caption>
            <thead>
              <tr>
                <th>Setting</th>
                <th className="num">Median</th>
                <th className="num">Chance of 30% or more</th>
                <th className="num">Chance of beating A-REITs</th>
                <th className="num">Chance of beating credit</th>
                <th className="num">1-in-10 fall</th>
              </tr>
            </thead>
            <tbody>
              {published.map((item) => (
                <tr key={item.key}>
                  <td>{item.label}</td>
                  <td className="num">{disp(item.cell, "med", true)}%</td>
                  <td className="num">{disp(item.cell, "p30", false)}%</td>
                  <td className="num">{disp(item.cell, "areit", false)}%</td>
                  <td className="num">{disp(item.cell, "credit", false)}%</td>
                  <td className="num">{disp(item.cell, "dd10", false)}%</td>
                </tr>
              ))}
              <tr>
                <td>A-REITs, assumption</td>
                <td className="num">6%</td>
                <td className="num" />
                <td className="num" />
                <td className="num" />
                <td className="num" />
              </tr>
              <tr>
                <td>Property-secured credit, assumption</td>
                <td className="num">10%</td>
                <td className="num" />
                <td className="num" />
                <td className="num" />
                <td className="num" />
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="sim-sec">
        <p className="sim-kicker">{workspace.belowKicker}</p>
        <h2 className="sim-h2">{evidence.brief.belowTitle}</h2>
        <p className="sim-lede">{evidence.brief.below}</p>
        <ul className="sim-list">
          {evidence.brief.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section className="sim-sec">
        <p className="sim-kicker">The settings</p>
        <h2 className="sim-h2">{workspace.settingsTitle}</h2>
        <p className="sim-lede">{workspace.settingsLede}</p>
        <div className="sim-cards">
          {(["disc", "hyb", "sc"] as const).map((id) => {
            const key = id === "sc" ? "sc_strong" : id;
            const cell = published.find((item) => item.key === key)?.cell;
            const copy = descriptions[id];
            return (
              <article key={id} className="sim-card">
                <p className="sim-kicker">{copy.title.replace(/\.$/, "")}</p>
                <p className="sim-card__fig">{cell ? `${disp(cell, "med", true)}%` : ""}</p>
                <p className="sim-card__cap">Median a year, modelled, A$10m, three years</p>
                <p>{copy.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="sim-sec">
        <p className="sim-kicker">Layer 1</p>
        <h2 className="sim-h2">{workspace.bookTitle}</h2>
        <p className="sim-lede">{evidence.book.intro}</p>
        {evidence.book.holdings.map((holding) => (
          <article key={holding.name} className="sim-holding">
            <header>
              <p className="sim-kicker">{holding.role}</p>
              <h3>{holding.name}</h3>
            </header>
            <p>{holding.weight}</p>
            <p>{holding.why}</p>
            <p className="sim-note">{holding.exits}</p>
          </article>
        ))}
        <p className="sim-callout">{evidence.book.unpublished}</p>
        <h3 className="sim-h3">{workspace.screenTitle}</h3>
        <div className="sim-table-wrap">
          <table className="sim-table">
            <thead>
              <tr>
                <th>Screen</th>
                <th>Test</th>
              </tr>
            </thead>
            <tbody>
              {evidence.book.screen.map((row) => (
                <tr key={row.id}>
                  <td>
                    {row.id} {row.name}
                  </td>
                  <td>{row.test}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {evidence.engines.map((engine) => (
        <EngineBlock key={engine.id} engine={engine} targets={targets} state={state} att={active.att[engine.id]} />
      ))}

      <section className="sim-sec">
        <p className="sim-kicker">The record</p>
        <h2 className="sim-h2">{workspace.signalsTitle}</h2>
        <div className="sim-table-wrap">
          <table className="sim-table">
            <thead>
              <tr>
                <th>Signal</th>
                <th>How it was tested</th>
                <th>Result</th>
                <th>Where it stands</th>
              </tr>
            </thead>
            <tbody>
              {evidence.signals.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>{row.method}</td>
                  <td>{row.result}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sim-sec">
        <p className="sim-kicker">Left out</p>
        <h2 className="sim-h2">{workspace.avoidTitle}</h2>
        <ol className="sim-avoid">
          {evidence.avoid.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="sim-sec">
        <p className="sim-kicker">Allocation</p>
        <h2 className="sim-h2">{workspace.tiersTitle}</h2>
        <div className="sim-cards">
          {evidence.tiers.map((tier) => (
            <article key={tier.range} className="sim-card">
              <p className="sim-kicker">{tier.range}</p>
              <h3>{tier.title}</h3>
              <ul className="sim-list">
                {tier.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function EngineBlock({
  engine,
  targets,
  state,
  att,
}: {
  engine: EngineDossier;
  targets: Targets;
  state: SimState;
  att: number | undefined;
}) {
  const layer = targets.pts.find((point) => point.k === engine.id);
  const hurdle = layer ? (layer.on ? `${signed(layer.v)} pts in this target stack` : "Switched off in this target stack") : "";
  const stored =
    engine.id === "momentum" || att == null
      ? "No separate row in the stored attribution."
      : `${signed(att)} pts in the modelled figure at this capital and horizon.`;

  return (
    <section className="sim-sec sim-engine">
      <header className="sim-engine__head">
        <p className="sim-kicker">
          {engine.code} · {engine.status}
        </p>
        <h2 className="sim-h2">{engine.name}</h2>
      </header>
      <dl className="sim-spec">
        <div>
          <dt>Weight</dt>
          <dd>{engine.weight}</dd>
        </div>
        <div>
          <dt>Rule</dt>
          <dd>{engine.rule}</dd>
        </div>
        <div>
          <dt>Rebalance</dt>
          <dd>{engine.rebalance}</dd>
        </div>
      </dl>
      <p>{engine.does}</p>
      <p>
        <b>Target. </b>
        {engine.target}
      </p>
      <p>
        <b>Evidence. </b>
        {engine.evidence}
      </p>
      <div className="sim-callout">
        <p>
          <b>In this run. </b>
          {hurdle ? `${hurdle}. ` : ""}
          {stored} {engine.contribution}
          {state.fee !== 5 || state.market !== 8 ? " The fee and the market reference change the target only." : ""}
        </p>
      </div>
    </section>
  );
}
