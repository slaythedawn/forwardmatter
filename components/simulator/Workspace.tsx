"use client";

import { workspace } from "@/lib/simulator/copy";
import type { Evidence, Study } from "@/lib/simulator/evidence";
import {
  COMPARE_KEYS,
  compound,
  disp,
  formatCount,
  formatHistory,
  money,
  neg,
  r1,
  lookupCell,
  runAccounting,
  yearEnds,
  targetYearEnds,
  type Cell,
  type CompareKey,
  type ModelGrid,
  type OutcomeKind,
  type PresetId,
  type SimState,
  type Targets,
  type WorkspaceView,
} from "@/lib/simulator/model";

const COMPARE_LABELS: Record<CompareKey, string> = {
  disc: "A · Disciplined",
  disc_pit: "A · Disciplined, mechanical",
  hyb: "B · Conviction hybrid",
  hyb_pit: "B · Hybrid, mechanical",
  sc_weak: "C · Scale, weak",
  sc_base: "C · Scale, base",
  sc_strong: "C · Scale, strong",
  sc_weak_pit: "C · Scale, weak, mechanical",
  sc_base_pit: "C · Scale, base, mechanical",
  sc_strong_pit: "C · Scale, strong, mechanical",
  rec: "Six-sleeve portfolio",
  nocredit: "No-credit baseline",
  target: "Your target (arithmetic)",
};

export function RunStrip({ grid }: { grid: ModelGrid }) {
  const run = runAccounting(grid.meta, Object.keys(grid.setups).length);
  const facts = [
    [formatCount(run.total), "paths in the grid"],
    [formatCount(run.paths), "paths in every cell"],
    [String(run.seed), "seed"],
    [`${run.setups} × ${run.sizes} × ${run.horizons}`, "setups, sizes, horizons"],
    [formatHistory(run.history) || "History on file", "monthly sample"],
    [run.generated ? run.generated.slice(0, 10) : "—", "grid built"],
  ];
  return (
    <dl className="sim-run">
      {facts.map(([value, label]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ViewTabs({
  view,
  onChange,
}: {
  view: WorkspaceView;
  onChange: (view: WorkspaceView) => void;
}) {
  return (
    <div className="sim-tabs" role="tablist" aria-label={workspace.label}>
      {workspace.views.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={view === item.id}
          onClick={() => onChange(item.id as WorkspaceView)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function Assumptions({
  state,
  onPreset,
  onFee,
  onMarket,
}: {
  state: SimState;
  onPreset: (preset: PresetId) => void;
  onFee: (fee: number) => void;
  onMarket: (market: number) => void;
}) {
  const moved = state.fee !== 5 || state.market !== 8;
  return (
    <div className="sim-assume">
      <div className="sim-field">
        <span className="sim-lab">{workspace.scenarioPresets}</span>
        <div className="sim-seg" role="group" aria-label={workspace.scenarioPresets}>
          {workspace.presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              aria-pressed={state.preset === preset.id}
              onClick={() => onPreset(preset.id as PresetId)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
      <label className="sim-field">
        <span className="sim-lab">
          {workspace.fee} · {r1(state.fee)}%
        </span>
        <input
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={state.fee}
          aria-label={workspace.feeAria}
          onChange={(event) => onFee(Number(event.target.value))}
        />
      </label>
      <label className="sim-field">
        <span className="sim-lab">
          {workspace.market} · {r1(state.market)}%
        </span>
        <input
          type="range"
          min={0}
          max={15}
          step={0.5}
          value={state.market}
          aria-label={workspace.marketAria}
          onChange={(event) => onMarket(Number(event.target.value))}
        />
      </label>
      <p className="sim-note">{moved ? workspace.arithmetic + " " : ""}{workspace.gridLock}</p>
      {state.stress ? <p className="sim-note">{workspace.stressNote}</p> : null}
    </div>
  );
}

export function YearTable({
  kind,
  cell,
  targets,
  years,
  start,
}: {
  kind: OutcomeKind;
  cell: Cell | null;
  targets: Targets;
  years: number;
  start: number;
}) {
  if (kind !== "target" && cell) {
    const rows = yearEnds(cell.fan, years);
    return (
      <div className="sim-table-wrap">
        <table className="sim-table">
          <caption className="sim-lab">{workspace.yearTitle}</caption>
          <thead>
            <tr>
              <th>Year</th>
              <th className="num">p10</th>
              <th className="num">p25</th>
              <th className="num">p50</th>
              <th className="num">p75</th>
              <th className="num">p90</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.year}>
                <td>Year {row.year}</td>
                <td className="num">{money(start * row.p10)}</td>
                <td className="num">{money(start * row.p25)}</td>
                <td className="num">{money(start * row.p50)}</td>
                <td className="num">{money(start * row.p75)}</td>
                <td className="num">{money(start * row.p90)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="sim-note">{workspace.yearLede}</p>
      </div>
    );
  }
  const rows = targetYearEnds(targets.net, targets.foNet, targets.upNet, years, start);
  return (
    <div className="sim-table-wrap">
      <table className="sim-table">
        <caption className="sim-lab">
          {workspace.yearTitle} · {workspace.arithmetic}
        </caption>
        <thead>
          <tr>
            <th>Year</th>
            <th className="num">Foundation</th>
            <th className="num">Your target</th>
            <th className="num">Upside</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.year}>
              <td>Year {row.year}</td>
              <td className="num">{money(row.foundation)}</td>
              <td className="num">{money(row.target)}</td>
              <td className="num">{money(row.upside)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="sim-note">{workspace.yearTargetLede}</p>
    </div>
  );
}

export function OddsTable({ cell }: { cell: Cell }) {
  const items: [string, string][] = [
    ["p10 net", `${neg(r1(cell.p10))}%`],
    ["p50 net", `${disp(cell, "med", true)}%`],
    ["p90 net", `${neg(r1(cell.p90))}%`],
    ["P(loss)", `${disp(cell, "ploss", false)}%`],
    ["P(beat A-REITs)", `${disp(cell, "areit", false)}%`],
    ["P(beat credit)", `${disp(cell, "credit", false)}%`],
    ["1-in-10 drawdown", `${disp(cell, "dd10", false)}%`],
  ];
  return (
    <div className="sim-table-wrap">
      <table className="sim-table">
        <caption className="sim-lab">{workspace.oddsTitle}</caption>
        <tbody>
          {items.map(([label, value]) => (
            <tr key={label}>
              <th>{label}</th>
              <td className="num">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function columnCell(grid: ModelGrid, key: CompareKey, state: SimState, targets: Targets) {
  if (key === "target") return { label: COMPARE_LABELS.target, kind: "target" as const, targets, cell: null as Cell | null };
  let cell: Cell | null = null;
  if (grid.setups[key]) {
    try {
      cell = lookupCell(grid, key, state.years, state.size);
    } catch {
      cell = null;
    }
  }
  return { label: grid.setups[key]?.label || COMPARE_LABELS[key], kind: "modelled" as const, targets, cell };
}

export function ComparePanel({
  grid,
  state,
  targets,
  onChange,
}: {
  grid: ModelGrid;
  state: SimState;
  targets: Targets;
  onChange: (index: number, key: CompareKey) => void;
}) {
  const start = state.size * 1e6;
  const columns = state.compare.map((key) => columnCell(grid, key, state, targets));
  const lines: { label: string; values: string[]; arithmetic: boolean[] }[] = [
    {
      label: "Kind",
      values: columns.map((column) => (column.kind === "target" ? "Target arithmetic" : "Modelled")),
      arithmetic: columns.map((column) => column.kind === "target"),
    },
    {
      label: "Net a year",
      values: columns.map((column) =>
        column.kind === "target" ? `${r1(column.targets.net)}%` : column.cell ? `${disp(column.cell, "med", true)}%` : "—",
      ),
      arithmetic: columns.map((column) => column.kind === "target"),
    },
    {
      label: "p10 / p90",
      values: columns.map((column) =>
        column.kind === "target" || !column.cell ? "—" : `${neg(r1(column.cell.p10))}% / ${neg(r1(column.cell.p90))}%`,
      ),
      arithmetic: columns.map((column) => column.kind === "target"),
    },
    {
      label: "Ending value",
      values: columns.map((column) => {
        if (column.kind === "target") return money(compound(start, column.targets.net, state.years));
        if (!column.cell) return "—";
        return money(start * column.cell.endmed);
      }),
      arithmetic: columns.map((column) => column.kind === "target"),
    },
    {
      label: "P(loss)",
      values: columns.map((column) => (column.kind === "modelled" && column.cell ? `${disp(column.cell, "ploss", false)}%` : "—")),
      arithmetic: columns.map((column) => column.kind === "target"),
    },
    {
      label: "P(beat A-REITs)",
      values: columns.map((column) => (column.kind === "modelled" && column.cell ? `${disp(column.cell, "areit", false)}%` : "—")),
      arithmetic: columns.map((column) => column.kind === "target"),
    },
    {
      label: "P(beat credit)",
      values: columns.map((column) => (column.kind === "modelled" && column.cell ? `${disp(column.cell, "credit", false)}%` : "—")),
      arithmetic: columns.map((column) => column.kind === "target"),
    },
    {
      label: "1-in-10 drawdown",
      values: columns.map((column) => (column.kind === "modelled" && column.cell ? `${disp(column.cell, "dd10", false)}%` : "—")),
      arithmetic: columns.map((column) => column.kind === "target"),
    },
  ];
  return (
    <section className="sim-sec">
      <h2 className="sim-h2">{workspace.compareTitle}</h2>
      <p className="sim-lede">{workspace.compareLede}</p>
      <div className="sim-compare-picks">
        {state.compare.map((key, index) => (
          <label key={index} className="sim-field">
            <span className="sim-lab">Column {index + 1}</span>
            <select value={key} onChange={(event) => onChange(index, event.target.value as CompareKey)}>
              {COMPARE_KEYS.map((option) => (
                <option key={option} value={option}>
                  {COMPARE_LABELS[option]}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="sim-table-wrap">
        <table className="sim-table">
          <thead>
            <tr>
              <th></th>
              {columns.map((column, index) => (
                <th key={index}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.label}>
                <th>{line.label}</th>
                {line.values.map((value, index) => (
                  <td key={index} className="num">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function compareCsv(grid: ModelGrid, state: SimState, targets: Targets): string {
  const columns = state.compare.map((key) => columnCell(grid, key, state, targets));
  const header = ["Field", ...columns.map((column) => column.label)];
  const net = columns.map((column) =>
    column.kind === "target" ? `${r1(column.targets.net)}% target arithmetic` : column.cell ? `${disp(column.cell, "med", true)}% modelled` : "",
  );
  return [header, ["Net a year", ...net]].map((line) => line.map(csvCell).join(",")).join("\n");
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function StudyBlock({ study }: { study: Study }) {
  return (
    <article className="sim-study">
      <header className="sim-study__head">
        <span className={`sim-chip sim-chip--${study.kind === "backtested" ? "paper" : "modelled"}`}>
          {study.kind === "backtested" ? "Backtested" : "Modelled"}
        </span>
        <h3>{study.title}</h3>
      </header>
      <p className="sim-note">
        <b>{study.period}.</b> {study.rules}
      </p>
      <p className="sim-note">{study.sample}</p>
      <div className="sim-table-wrap">
        <table className="sim-table">
          <thead>
            <tr>
              <th>Case</th>
              {study.columns.map((column) => (
                <th key={column} className="num">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {study.rows.map((item) => (
              <tr key={item.name}>
                <td>{item.name}</td>
                {item.cells.map((cell, index) => (
                  <td key={index} className="num">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="sim-callout">{study.caveat}</p>
    </article>
  );
}

export function BacktestsPanel({ evidence }: { evidence: Evidence }) {
  return (
    <section className="sim-sec">
      <h2 className="sim-h2">Backtests and head-to-head results</h2>
      <p className="sim-lede">{workspace.backtestsLede}</p>
      {evidence.studies.map((study) => (
        <StudyBlock key={study.id} study={study} />
      ))}
    </section>
  );
}

export function SourcesPanel({ evidence }: { evidence: Evidence }) {
  const engines = [...new Set(evidence.register.map((row) => row.engine))];
  return (
    <section className="sim-sec">
      <h2 className="sim-h2">Sources and the validation register</h2>
      <p className="sim-lede">
        {workspace.sourcesLede} As at {evidence.asOf}. FM-RE-002 and FM-TS-002.
      </p>
      <div className="sim-gates">
        {engines.map((engine) => {
          const rows = evidence.register.filter((row) => row.engine === engine);
          return (
            <article key={engine} className="sim-gate">
              <h3>{engine}</h3>
              {rows.map((row) => (
                <p key={row.id}>
                  <b>
                    {row.id} · {row.status}
                  </b>
                  <br />
                  {row.test}. {row.result}
                </p>
              ))}
            </article>
          );
        })}
      </div>
      <h3 className="sim-h2">Data feeds</h3>
      <div className="sim-table-wrap">
        <table className="sim-table">
          <thead>
            <tr>
              <th>Feed</th>
              <th>Source</th>
              <th>Refresh</th>
              <th>Used by</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {evidence.sources.map((source) => (
              <tr key={source.id}>
                <td>
                  {source.id} {source.feed}
                </td>
                <td>{source.source}</td>
                <td>{source.refresh}</td>
                <td>{source.usedBy}</td>
                <td>{source.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="sim-h2">Full register</h3>
      <div className="sim-table-wrap">
        <table className="sim-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Test</th>
              <th>Rule and data</th>
              <th>Result</th>
              <th>Status</th>
              <th>Next</th>
            </tr>
          </thead>
          <tbody>
            {evidence.register.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.test}</td>
                <td>{row.rule}</td>
                <td>{row.result}</td>
                <td>{row.status}</td>
                <td>{row.next}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="sim-h2">Nineteen registry rules, pre-registered</h3>
      <p className="sim-note">Fixed on 24 October 2026, before the registry history was examined. All 19 are registered and run together.</p>
      <div className="sim-table-wrap">
        <table className="sim-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Signal</th>
              <th>Trade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {evidence.rules.map((rule) => (
              <tr key={rule.id}>
                <td>{rule.id}</td>
                <td>{rule.signal}</td>
                <td>{rule.trade}</td>
                <td>{rule.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function MethodPanel({ grid, evidence }: { grid: ModelGrid; evidence: Evidence }) {
  const run = runAccounting(grid.meta, Object.keys(grid.setups).length);
  return (
    <section className="sim-sec">
      <h2 className="sim-h2">{evidence.method.title}</h2>
      <p className="sim-lede">{workspace.methodLede}</p>
      <dl className="sim-run">
        <div>
          <dt>Paths</dt>
          <dd>{formatCount(run.total)}</dd>
        </div>
        <div>
          <dt>Per cell</dt>
          <dd>{formatCount(run.paths)}</dd>
        </div>
        <div>
          <dt>Seed</dt>
          <dd>{run.seed}</dd>
        </div>
        <div>
          <dt>Block</dt>
          <dd>{run.block ? `${run.block} months` : "—"}</dd>
        </div>
      </dl>
      {evidence.method.points.map((point) => (
        <p key={point.slice(0, 24)} className="sim-note">
          {point}
        </p>
      ))}
      <h3 className="sim-h2">What is credited</h3>
      <ul className="sim-list">
        {evidence.method.credited.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h3 className="sim-h2">What is not credited</h3>
      <ul className="sim-list">
        {evidence.method.notCredited.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function scenarioCsv(state: SimState, targets: Targets, cell: Cell | null): string {
  const kind = state.mode === "modelled" ? (state.stress ? "stress percentile, modelled" : "modelled") : "target arithmetic";
  const net = state.mode === "modelled" && cell ? (state.stress ? neg(r1(cell.p10)) : disp(cell, "med", true)) : r1(targets.net);
  return ["field,value", `kind,"${kind}"`, `net_percent,${net}`, `fee_percent,${state.fee}`, `market_percent,${state.market}`].join("\n");
}
