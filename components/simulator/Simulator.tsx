"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { EnginesPanel } from "./Engines";
import { FanChart } from "./FanChart";
import { MetricBars, type BarRow } from "./MetricBars";
import {
  Assumptions,
  BacktestsPanel,
  ComparePanel,
  MethodPanel,
  OddsTable,
  RunStrip,
  SourcesPanel,
  ViewTabs,
  YearTable,
  compareCsv,
  scenarioCsv,
} from "./Workspace";
import type { Evidence } from "@/lib/simulator/evidence";
import { workspace } from "@/lib/simulator/copy";
import {
  attributionEngines,
  benches,
  chips,
  descriptions,
  gates,
  guide,
  hero,
  legal,
  plain,
  scaleWarnAbove,
  scaleWarnBelow,
  sections,
  shell,
} from "@/lib/simulator/copy";
import { Guide } from "./Guide";
import {
  AREIT_RATE,
  applyHash,
  applyPreset,
  compound,
  computeTargets,
  disp,
  headlineSetup,
  LAYERS,
  lookupCell,
  money,
  neg,
  normalizeGrid,
  openingState,
  r1,
  rxAvailable,
  signed,
  sizeToSlider,
  sliderToSize,
  smoothPath,
  stateToHash,
  outcomeKind,
  type Cell,
  type CompareKey,
  type LayerKey,
  type ModelGrid,
  type PresetId,
  type SimState,
  type WorkspaceView,
} from "@/lib/simulator/model";

function Chip({ kind, children }: { kind: "target" | "modelled"; children: string }) {
  return <span className={`sim-chip sim-chip--${kind}`}>{children}</span>;
}

function SectionHead({
  kicker,
  title,
  lede,
  aside,
}: {
  n?: string;
  kicker: string;
  title: string;
  lede?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="sim-sec__head">
      <div>
        <div className="eyebrow eyebrow--accent">{kicker}</div>
        <h2 className="sim-h2">{title}</h2>
        {lede ? (
          <details className="sim-more">
            <summary>{plain.more}</summary>
            <p>{lede}</p>
          </details>
        ) : null}
      </div>
      {aside}
    </div>
  );
}

export function Simulator({ bundle }: { bundle: { grid: ModelGrid; evidence: Evidence } }) {
  const grid = useMemo(() => normalizeGrid(bundle.grid), [bundle.grid]);
  const evidence = bundle.evidence;
  const [state, setState] = useState<SimState>(() =>
    typeof window === "undefined" ? openingState() : applyHash(openingState(), window.location.hash),
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const next = `#${stateToHash(state)}`;
    if (window.location.hash !== next) {
      window.history.replaceState(null, "", next);
    }
  }, [state]);

  useEffect(() => {
    const onHash = () => setState((current) => applyHash(current, window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const targets = computeTargets(state);
  const modelled = state.mode === "modelled";
  const key = headlineSetup(state);
  const cell = modelled ? lookupCell(grid, key, state.years, state.size) : null;
  const base = lookupCell(grid, "nocredit", state.years, state.size);
  const setup = modelled ? grid.setups[key] : null;
  const start = state.size * 1e6;
  const yearsWord = ["one year", "two years", "three years", "four years", "five years"][state.years - 1];
  const rxOn = rxAvailable(state.size);
  const lly = state.pick === "lly" && state.setup !== "rec" && state.setup !== "nocredit";
  const pickLocked = state.setup === "rec" || state.setup === "nocredit";

  function patch(partial: Partial<SimState>) {
    setState((current) => ({ ...current, ...partial }));
  }

  function setLayer(layer: LayerKey, on: boolean) {
    setState((current) => ({ ...current, preset: "custom", stress: false, on: { ...current.on, [layer]: on } }));
  }

  function setValue(layer: LayerKey, value: number) {
    setState((current) => ({ ...current, preset: "custom", stress: false, val: { ...current.val, [layer]: value } }));
  }

  const kind = outcomeKind(state);
  const end =
    kind === "stress" && cell
      ? compound(start, cell.p10, state.years)
      : modelled && cell
        ? start * cell.endmed
        : compound(start, targets.net, state.years);
  const headlineRate = kind === "stress" && cell ? neg(r1(cell.p10)) : modelled && cell ? disp(cell, "med", true) : r1(targets.net);
  const canonicalFee = state.fee === 5 && state.market === 8;
  const grossRate = modelled && cell ? disp(cell, "gross", true) : r1(targets.gross);

  let warn = "";
  if (modelled && state.setup === "sc" && state.size < 5) warn = scaleWarnBelow;
  if (modelled && state.setup === "sc" && state.size >= 5) warn = scaleWarnAbove;

  const runDate = grid.meta.generated ? `Simulation run ${grid.meta.generated.slice(0, 10)}` : "";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function downloadCsv() {
    const body = state.view === "compare" ? compareCsv(grid, state, targets) : scenarioCsv(state, targets, cell);
    const url = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "matter-engine-scenario.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const scaleKey = state.setup === "sc" ? key : "sc_strong";
  const scaleCell = state.size < 5 ? lookupCell(grid, scaleKey, state.years, state.size) : null;
  const scaleName =
    state.setup === "sc" ? (shell.signals.find((item) => item.id === state.sig)?.label ?? "Strong") : "Strong";
  const gapSetups = [
    ["disc", "Disciplined"],
    ["hyb", "Conviction hybrid"],
    ["sc_strong", "Strategies at scale (strong)"],
  ] as const;

  const setupName = modelled && setup ? setup.label : descriptions[state.setup === "nocredit" ? "hyb" : state.setup].title.replace(/\.$/, "");

  return (
    <div className="sim">
      <section className="sim-hero-outcome" id="outcome">
        <p className="sim-take">
          {hero.title} <span>{hero.takeaway}</span>
        </p>
        <div className="sim-hero-outcome__grid">
          <div>
            <p className="sim-outcome__kicker">
              {modelled ? "Modelled" : "Target"} · {setupName} · {money(start)} · {yearsWord}
            </p>
            <p className="sim-hero-outcome__big">
              {money(start)} <span>becomes</span> {money(end)}
            </p>
            <p className="sim-hero-outcome__rate">
              <b>{headlineRate}%</b>
              {modelled ? " a year, middle of 2,000 paths" : " a year, target"}
            </p>
            {scaleCell ? (
              <p className="sim-cost">
                {scaleName} at {money(start)} is {disp(scaleCell, "med", true)}% after the A$45k a year data cost, or {r1(scaleCell.nodata)}% without it.
              </p>
            ) : null}
          </div>
          <div className="sim-hero-outcome__side">
            <div className="sim-row">
              <div>
                {setupName}
                <small>{modelled ? "Selected strategy" : "Selected setup, target"}</small>
              </div>
              <div className="sim-row__val">
                {headlineRate}%
              </div>
            </div>
            <div className="sim-row sim-row--base">
              <div>
                {guide.baseline}
                <small>{guide.baselineSub}</small>
              </div>
              <div className="sim-row__val">
                {disp(base, "med", true)}%
                <small>{money(compound(start, base.med, state.years))}</small>
              </div>
            </div>
            <div className="sim-mini">
              {gapSetups.map(([id, label]) => (
                <div key={id}>
                  <b>{disp(lookupCell(grid, id, state.years, state.size), "med", true)}%</b>
                  <span>{label}</span>
                </div>
              ))}
              <div className="is-base">
                <b>{disp(base, "med", true)}%</b>
                <span>ETF, no engine credit</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Guide
        evidence={evidence}
        grid={grid}
        state={state}
        targets={targets}
        onNotes={() => {
          patch({ view: "engines" });
          document.getElementById("scenario")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />

      <div className="sim-app" id="scenario">
        <div className="sim-app__bar">
          <div className="sim-brand">
            <span className="sim-brand__dot" aria-hidden="true" />
            <b>{shell.product}</b>
            <span>{shell.name}</span>
          </div>
          <p className="sim-notice">{shell.notice}</p>
          <div className="sim-export">
            <button type="button" className="sim-textbtn" onClick={() => void copyLink()}>
              {copied ? workspace.copied : workspace.exportCopy}
            </button>
            <button type="button" className="sim-textbtn" onClick={downloadCsv}>
              {workspace.exportCsv}
            </button>
            <button type="button" className="sim-textbtn" onClick={() => window.print()}>
              {workspace.exportPrint}
            </button>
          </div>
        </div>

        <div className="sim-console">
          <div className="sim-field">
            <span className="sim-lab">{shell.view}</span>
            <div className="sim-seg" role="group" aria-label={shell.view}>
              {(["targets", "modelled"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={state.mode === mode}
                  onClick={() => patch({ mode })}
                >
                  {mode === "targets" ? shell.targets : shell.modelled}
                </button>
              ))}
            </div>
          </div>
          <div className="sim-field">
            <span className="sim-lab">{shell.capital}</span>
            <div className="sim-seg" role="group" aria-label={shell.presets}>
              {shell.presetLabels.map((preset) => (
                <button
                  key={preset.size}
                  type="button"
                  aria-pressed={state.size === preset.size}
                  onClick={() => patch({ size: preset.size })}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div className="sim-field">
            <span className="sim-lab">{shell.horizon}</span>
            <div className="sim-seg" role="group" aria-label={shell.horizon}>
              {shell.years.map((item) => (
                <button
                  key={item.years}
                  type="button"
                  aria-pressed={state.years === item.years}
                  onClick={() => patch({ years: item.years })}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          {modelled ? (
            <div className="sim-field">
              <span className="sim-lab">{shell.setting}</span>
              <div className="sim-seg" role="group" aria-label={shell.setting}>
                {shell.setups.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={state.setup === item.id}
                    onClick={() => patch({ setup: item.id as SimState["setup"] })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="sim-sub">
          <div className="sim-field sim-field--size">
            <span className="sim-lab">{shell.capital}</span>
            <div className="sim-size">
              <input
                type="range"
                min={0}
                max={1000}
                step={1}
                value={sizeToSlider(state.size)}
                aria-label={shell.capitalAria}
                onChange={(event) => patch({ size: sliderToSize(Number(event.target.value)) })}
              />
              <span className="sim-size__val">{money(start)}</span>
            </div>
          </div>
          {modelled && state.setup === "sc" ? (
            <div className="sim-field">
              <span className="sim-lab">{shell.signal}</span>
              <div className="sim-seg" role="group" aria-label={shell.signal}>
                {shell.signals.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={state.sig === item.id}
                    onClick={() => patch({ sig: item.id as SimState["sig"] })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {modelled ? (
            <div className="sim-field">
              <span className="sim-lab">{shell.conviction}</span>
              <div className="sim-seg" role="group" aria-label={shell.conviction}>
                {shell.picks.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={state.pick === item.id}
                    disabled={pickLocked}
                    onClick={() => patch({ pick: item.id as SimState["pick"] })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {warn ? <p className="sim-warn">{warn}</p> : null}
        </div>

        <details className="sim-more sim-run-fold">
          <summary>{plain.showRun}</summary>
          <RunStrip grid={grid} />
        </details>
        <ViewTabs view={state.view} onChange={(view: WorkspaceView) => patch({ view })} />
        <Assumptions
          state={state}
          onPreset={(preset: PresetId) => setState((current) => applyPreset(current, preset))}
          onFee={(fee) => patch({ fee, preset: "custom", stress: false })}
          onMarket={(market) => patch({ market, preset: "custom", stress: false })}
        />

        {state.view === "engines" ? (
          <EnginesPanel evidence={evidence} grid={grid} state={state} targets={targets} />
        ) : null}
        {state.view === "compare" ? (
          <ComparePanel
            grid={grid}
            state={state}
            targets={targets}
            onChange={(index, key: CompareKey) =>
              setState((current) => {
                const compare = [...current.compare] as SimState["compare"];
                compare[index] = key;
                return { ...current, compare };
              })
            }
          />
        ) : null}
        {state.view === "backtests" ? <BacktestsPanel evidence={evidence} /> : null}
        {state.view === "sources" ? <SourcesPanel evidence={evidence} /> : null}
        {state.view === "method" ? <MethodPanel grid={grid} evidence={evidence} /> : null}

        {state.view === "scenario" ? (
        <>
          {modelled && cell ? (
            <Kpis
              items={[
                ["Median net a year", `${disp(cell, "med", true)}%`, cell.med >= 0 ? "pos" : "neg", "Middle of 2,000 paths"],
                [plain.loss, `${disp(cell, "ploss", false)}%`, "", "Ending below the start"],
                [plain.thirty, `${disp(cell, "p30", false)}%`, "", "Over the horizon"],
                [plain.areit, `${disp(cell, "areit", false)}%`, "", "Against a 6% assumption"],
                [plain.credit, `${disp(cell, "credit", false)}%`, "", "Against a 10% assumption"],
                [plain.fall, `${disp(cell, "dd10", false)}%`, "neg", "Peak to trough"],
              ]}
            />
          ) : (
            <Kpis
              items={[
                ["Net a year", `${r1(targets.net)}%`, "pos", canonicalFee ? "Target, net of the 5% fee" : "Target arithmetic, not a simulation"],
                ["Ending value", money(end), "", `${money(start)} after ${state.years} yr${state.years > 1 ? "s" : ""}`],
                [plain.thirty, "—", "na", "Targets carry no probabilities"],
                [plain.areit, "—", "na", "Not simulated"],
                [plain.credit, "—", "na", "Not simulated"],
                [plain.fall, "—", "na", "Not simulated"],
              ]}
            />
          )}
          <details className="sim-more">
            <summary>{plain.showNote}</summary>
            <p>
              {modelled && cell
                ? `Not a forecast. ${
                    lly
                      ? "Depends on the disclosed LLY conviction position keeping 40% of its historical lead. "
                      : ""
                  }${cell.exact ? "" : "Between grid points, values are interpolated. "}`
                : `A target is a hurdle, not a forecast.${
                    rxOn ? "" : " The Prescription Reader starts at A$5m. With every layer at base, the target is 20.2% net."
                  }`}
            </p>
          </details>

        {modelled ? (
          <section className="sim-sec">
            <SectionHead
              n={sections.rulebook.n}
              kicker={sections.rulebook.kicker}
              title={sections.rulebook.title}
              aside={<Chip kind="modelled">{chips.modelled}</Chip>}
            />
            <details className="sim-more">
              <summary>{plain.showRules}</summary>
              <div className="sim-callout">
              <strong>{descriptions[state.setup].title}</strong> {descriptions[state.setup].body}
              {lly
                ? " Conviction position: Eli Lilly (LLY)."
                : pickLocked
                  ? ""
                  : " Conviction position replaced by a mechanical pick: each November, the large pharma name with the best 12-1 momentum, held for a year (no hindsight)."}
              </div>
            </details>
          </section>
        ) : (
          <section className="sim-sec">
            <SectionHead
              n={sections.stack.n}
              kicker={sections.stack.kicker}
              title={sections.stack.title}
              lede={sections.stack.lede}
              aside={<Chip kind="target">{chips.target}</Chip>}
            />
            <div className="sim-table-wrap">
              <table className="sim-table">
                <thead>
                  <tr>
                    <th>Layer</th>
                    <th>On</th>
                    <th>Target range</th>
                    <th>Your setting</th>
                    <th className="num">Points a year</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      Global healthcare market
                      <small>Reference assumption (IXJ). Moves with the control above. Target arithmetic.</small>
                    </td>
                    <td>—</td>
                    <td className="num">0–15</td>
                    <td className="num">{r1(state.market)}</td>
                    <td className="num">{r1(state.market)}</td>
                  </tr>
                  {targets.pts.map((layer) => {
                    const locked = Boolean(layer.minSize && !rxOn);
                    return (
                      <tr key={layer.k} className={layer.on ? undefined : "is-off"}>
                        <td>
                          {layer.n}
                          <small>
                            {layer.d}
                            {locked ? <b className="sim-unlock"> · unlocks at A$5m</b> : null}
                          </small>
                        </td>
                        <td>
                          <label className="sim-sw">
                            <input
                              type="checkbox"
                              checked={state.on[layer.k] && !locked}
                              disabled={locked}
                              aria-label={`${layer.n} on`}
                              onChange={(event) => setLayer(layer.k, event.target.checked)}
                            />
                            <span />
                          </label>
                        </td>
                        <td className="num">
                          +{layer.lo} to +{layer.hi}
                        </td>
                        <td>
                          <input
                            className="sim-range"
                            type="range"
                            min={layer.lo}
                            max={layer.hi}
                            step={0.5}
                            value={state.val[layer.k]}
                            disabled={!layer.on}
                            aria-label={`${layer.n} target`}
                            onChange={(event) => setValue(layer.k, Number(event.target.value))}
                          />{" "}
                          <span className="num">+{state.val[layer.k].toFixed(1)}</span>
                        </td>
                        <td className="num">{layer.on ? `+${layer.v.toFixed(1)}` : "off"}</td>
                      </tr>
                    );
                  })}
                  <tr className="is-total">
                    <td>Gross</td>
                    <td />
                    <td />
                    <td />
                    <td className="num">{r1(targets.gross)}</td>
                  </tr>
                  <tr>
                    <td>
                      Less 5% fee on assets
                      <small>5% × (1 + gross)</small>
                    </td>
                    <td />
                    <td />
                    <td />
                    <td className="num">−{r1(targets.fee)}</td>
                  </tr>
                  <tr className="is-total">
                    <td>Net TARGET a year</td>
                    <td />
                    <td />
                    <td />
                    <td className="num">{r1(targets.net)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <details className="sim-more">
              <summary>{plain.more}</summary>
              <p>{sections.stack.note}</p>
            </details>
          </section>
        )}

        <section className="sim-sec">
          <SectionHead
            n={sections.range.n}
            kicker={sections.range.kicker}
            title={sections.range.title}
          />
          {modelled && cell ? (
            <FanChart
              years={state.years}
              start={start}
              label={`Modelled paths of value over ${yearsWord}`}
              series={[
                { v: cell.fan[4], c: "var(--sim-p2)", short: "1 in 10 better", w: 1.2 },
                { v: cell.fan[2], c: "var(--sim-acc)", short: "median", w: 2.6 },
                { v: cell.fan[0], c: "var(--sim-p2)", short: "1 in 10 worse", w: 1.2 },
                {
                  v: smoothPath(AREIT_RATE, state.years),
                  c: "var(--sim-grey)",
                  short: "A-REITs 6%",
                  dash: "2 3",
                },
              ]}
              bands={[
                { lo: cell.fan[0], hi: cell.fan[4], c: "rgba(143,180,221,0.28)" },
                { lo: cell.fan[1], hi: cell.fan[3], c: "rgba(47,85,128,0.18)" },
              ]}
            />
          ) : (
            <FanChart
              years={state.years}
              start={start}
              label={`Target paths of value over ${yearsWord}`}
              series={[
                { v: smoothPath(targets.upNet, state.years), c: "var(--sim-p1)", short: "upside", dash: "5 4" },
                { v: smoothPath(targets.net, state.years), c: "var(--sim-acc)", short: "target", w: 2.6 },
                { v: smoothPath(targets.foNet, state.years), c: "var(--sim-cmp)", short: "foundation" },
                { v: smoothPath(AREIT_RATE, state.years), c: "var(--sim-grey)", short: "A-REITs", dash: "2 3" },
              ]}
              bands={[]}
            />
          )}
          <div className="sim-legend">
            {modelled ? (
              <>
                <span><i style={{ background: "var(--sim-acc)" }} />Median path</span>
                <span><i style={{ background: "rgba(47,85,128,0.45)" }} />Middle half of paths</span>
                <span><i style={{ background: "rgba(143,180,221,0.7)" }} />8 in 10 paths</span>
                <span><i style={{ background: "var(--sim-grey)" }} />A-REITs 6% assumption</span>
              </>
            ) : (
              <>
                <span><i style={{ background: "var(--sim-acc)" }} />Your stacked target</span>
                <span><i style={{ background: "var(--sim-cmp)" }} />Foundation only</span>
                <span><i style={{ background: "var(--sim-p1)" }} />Upside ambition</span>
                <span><i style={{ background: "var(--sim-grey)" }} />A-REITs 6% assumption</span>
              </>
            )}
          </div>
          <YearTable kind={kind} cell={cell} targets={targets} years={state.years} start={start} />
          {cell && modelled ? <OddsTable cell={cell} /> : null}
        </section>

        <div className="sim-split">
          <section className="sim-sec">
            <SectionHead
              n={sections.beside.n}
              kicker={sections.beside.kicker}
              title={sections.beside.title}
              aside={<Chip kind={modelled ? "modelled" : "target"}>{modelled ? chips.modelled : chips.target}</Chip>}
            />
            <MetricBars
              label="Comparison with property and credit"
              rows={
                modelled && cell && base && setup
                  ? [
                      {
                        name: "Matter Engine",
                        sub: `${setup.label}, median net`,
                        value: cell.med,
                        text: `${disp(cell, "med", true)}%`,
                      },
                      ...benches.map((item) => ({
                        name: item.name,
                        sub: item.sub,
                        value: item.value,
                        text: `${r1(item.value)}%`,
                        color: item.color,
                      })),
                      {
                        name: guide.baseline,
                        sub: "Comparison only, after the 5% fee",
                        value: base.med,
                        text: `${disp(base, "med", true)}%`,
                        color: "var(--sim-p1)",
                      },
                    ]
                  : [
                      { name: "Matter Engine", sub: "Your stacked target, net", value: targets.net, text: `${r1(targets.net)}%` },
                      ...benches.map((item) => ({
                        name: item.name,
                        sub: item.sub,
                        value: item.value,
                        text: `${r1(item.value)}%`,
                        color: item.color,
                      })),
                    ]
              }
            />
            <details className="sim-more">
              <summary>{plain.more}</summary>
              <p>{sections.beside.note}</p>
            </details>
          </section>
          <section className="sim-sec">
            <SectionHead
              n={sections.bridge.n}
              kicker={sections.bridge.kicker}
              title={sections.bridge.title}
              aside={<Chip kind={modelled ? "modelled" : "target"}>{modelled ? chips.modelled : chips.target}</Chip>}
            />
            <MetricBars label="Gross to net" rows={modelled && cell && setup ? feeRowsModelled(cell, setup.data ?? 0) : feeRowsTarget(targets)} />
            <details className="sim-more">
              <summary>{plain.more}</summary>
              <p>{modelled ? sections.bridge.modelledNote : sections.bridge.targetNote}</p>
            </details>
          </section>
        </div>

        <section className="sim-sec">
          <SectionHead
            n={sections.source.n}
            kicker={sections.source.kicker}
            title={sections.source.title}
            aside={<Chip kind={modelled ? "modelled" : "target"}>{modelled ? chips.modelled : chips.target}</Chip>}
          />
          <MetricBars
            label="Where the return comes from"
            rows={modelled && cell ? attributionModelled(cell, state) : attributionTarget(targets, rxOn)}
          />
          <details className="sim-more">
            <summary>{plain.more}</summary>
            <p>{modelled ? sections.source.modelledNote : sections.source.targetNote}</p>
            <p>{sections.source.bridge}</p>
          </details>
        </section>

        <section className="sim-sec">
          <SectionHead
            n={sections.gates.n}
            kicker={sections.gates.kicker}
            title={sections.gates.title}
            lede={sections.gates.lede}
            aside={<span className="sim-aside">{sections.gates.asOf}</span>}
          />
          <details className="sim-more">
            <summary>{plain.showGates}</summary>
          <div className="sim-gates">
            {gates.map((gate) => (
              <article className="sim-gate" key={gate.name}>
                <span className={`sim-chip sim-chip--${gate.tone}`}>{gate.tone}</span>
                {gate.status.toLowerCase() !== gate.tone ? <div className="sim-gate__status">{gate.status}</div> : null}
                <h3>{gate.name}</h3>
                <p>
                  <b>Gate:</b> {gate.gate}
                </p>
                <p>{gate.detail}</p>
              </article>
            ))}
          </div>
          <p className="sim-note">{sections.gates.note}</p>
          <p className="sim-bridge">{sections.gates.bridge}</p>
          </details>
        </section>

        <section className="sim-sec">
          <SectionHead
            n={sections.conviction.n}
            kicker={sections.conviction.kicker}
            title={sections.conviction.title}
            aside={<Chip kind="modelled">{chips.modelled}</Chip>}
          />
          <details className="sim-more">
            <summary>{plain.showConviction}</summary>
            <div className="sim-callout sim-callout--amb">
              <Conviction grid={grid} state={state} />
            </div>
          </details>
        </section>
        </>
        ) : null}
      </div>

      <details className="sim-more sim-legal-fold">
        <summary>{plain.showNotices}</summary>
        <section className="sim-legal">
          {legal.map((item) => (
            <p key={item.title}>
              <b>{item.title}</b> {item.body}
            </p>
          ))}
          {runDate ? <p>{runDate}.</p> : null}
        </section>
      </details>
    </div>
  );
}

function OutcomeRows({
  rows,
  start,
  years,
}: {
  rows: [string, string, number][];
  start: number;
  years: number;
}) {
  return (
    <>
      {rows.map(([name, sub, rate]) => (
        <div className={`sim-row${name.startsWith("Healthcare ETF") ? " sim-row--base" : ""}`} key={name}>
          <div>
            {name}
            <small>{sub}</small>
          </div>
          <div className="sim-row__val">
            {money(compound(start, rate, years))}
            <small>{signed(rate)}% a yr</small>
          </div>
        </div>
      ))}
    </>
  );
}

function Kpis({ items }: { items: [string, string, string, string][] }) {
  return (
    <div className="sim-kpis">
      {items.map(([label, value, tone, note]) => (
        <div className="sim-kpi" key={label}>
          <div className="sim-lab">{label}</div>
          <div className={`sim-kpi__v${tone ? ` is-${tone}` : ""}`}>{value}</div>
          {note ? <small>{note}</small> : <small>&nbsp;</small>}
        </div>
      ))}
    </div>
  );
}

function feeRowsTarget(targets: ReturnType<typeof computeTargets>): BarRow[] {
  const rows: BarRow[] = [
    { name: "Global healthcare market", sub: "Reference assumption", value: targets.gross === 0 ? 0 : targets.pts.length ? targets.gross - targets.pts.reduce((sum, layer) => sum + layer.v, 0) : 0, base: 0, text: `+${r1(targets.gross - targets.pts.reduce((sum, layer) => sum + (layer.on ? layer.v : 0), 0))}`, color: "var(--sim-cmp)" },
  ];
  let base = targets.gross - targets.pts.reduce((sum, layer) => sum + layer.v, 0);
  for (const layer of targets.pts) {
    if (!layer.on) continue;
    rows.push({ name: layer.n, sub: "Target", value: layer.v, base, text: `+${layer.v.toFixed(1)}` });
    base += layer.v;
  }
  rows.push({ name: "Gross target", value: targets.gross, base: 0, text: r1(targets.gross), color: "var(--sim-navy)" });
  rows.push({
    name: `Less ${r1(targets.fee)} pt fee on assets`,
    sub: "Platform and strategy fee, proposed. Target arithmetic.",
    value: -targets.fee,
    base: targets.gross,
    text: `−${r1(targets.fee)}`,
    color: "var(--sim-neg)",
    textColor: "var(--sim-neg)",
  });
  rows.push({
    name: "Net target",
    value: targets.net,
    base: 0,
    text: `${r1(targets.net)}%`,
    color: "var(--sim-pos)",
    textColor: "var(--sim-pos)",
  });
  return rows;
}

function feeRowsModelled(cell: Cell, dataCost: number): BarRow[] {
  const feeGap = cell.gross - cell.nodata;
  const dataGap = cell.nodata - cell.med;
  return [
    { name: "Median before fees", sub: "Gross, modelled", value: cell.gross, base: 0, text: `${disp(cell, "gross", true)}%`, color: "var(--sim-navy)" },
    {
      name: "Less 5% fee on assets",
      sub: "Platform and strategy fee, proposed",
      value: -feeGap,
      base: cell.gross,
      text: `−${r1(feeGap)}`,
      color: "var(--sim-neg)",
      textColor: "var(--sim-neg)",
    },
    {
      name: "Less data costs",
      sub: dataCost > 500 ? "~A$45k a year paid feed" : "~A$500 a year free/cheap data",
      value: -dataGap,
      base: cell.nodata,
      text: `−${r1(Math.max(dataGap, 0))}`,
      color: "var(--sim-neg)",
      textColor: "var(--sim-neg)",
    },
    {
      name: "Median after fees",
      sub: "Net, modelled",
      value: cell.med,
      base: 0,
      text: `${disp(cell, "med", true)}%`,
      color: "var(--sim-pos)",
      textColor: "var(--sim-pos)",
    },
  ];
}

function attributionTarget(targets: ReturnType<typeof computeTargets>, rxOn: boolean): BarRow[] {
  const market = targets.gross - targets.pts.reduce((sum, layer) => sum + layer.v, 0);
  return [
    { name: "Market reference", sub: "Global healthcare, your setting. Target arithmetic.", value: market, text: `+${r1(market)}`, color: "var(--sim-cmp)" },
    ...LAYERS.map((layer) => {
      const point = targets.pts.find((item) => item.k === layer.k);
      const on = Boolean(point?.on);
      const sub = on ? "Target contribution, gross" : layer.minSize && !rxOn ? "Unlocks at A$5m" : "Switched off";
      return {
        name: layer.n,
        sub,
        value: point?.v ?? 0,
        text: on ? `+${(point?.v ?? 0).toFixed(1)}` : "off",
        color: on ? "var(--sim-acc)" : "var(--sim-grey)",
      };
    }),
  ];
}

function attributionModelled(cell: Cell, state: SimState): BarRow[] {
  const rows: BarRow[] = attributionEngines.map((engine) => {
    const value = cell.att[engine.key] || 0;
    const off = Math.abs(value) < 0.005;
    const paper = off && (engine.key === "nowcaster" || engine.key === "rx") && state.setup !== "nocredit";
    return {
      name: engine.name,
      sub: paper ? "On paper in this setting: credited 0" : engine.sub,
      value,
      text: off ? "0.0" : signed(value),
      color: value >= 0 ? "var(--sim-acc)" : "var(--sim-neg)",
      textColor: value < 0 ? "var(--sim-neg)" : undefined,
    };
  });
  rows.push({
    name: "Momentum into results",
    sub: "Not modelled as a separate engine: TARGET only",
    value: 0,
    text: "—",
    color: "var(--sim-grey)",
  });
  return rows;
}

function Conviction({ grid, state }: { grid: ModelGrid; state: SimState }) {
  const pair = (a: string, b: string) => {
    const left = lookupCell(grid, a, state.years, state.size);
    const right = lookupCell(grid, b, state.years, state.size);
    return `${disp(left, "med", true)}% with LLY → ${disp(right, "med", true)}% with a mechanical pick`;
  };
  const lead = grid.meta.leads?.LLY;
  const drift = grid.meta.fwd?.LLY;
  const leadText = typeof lead === "number" ? r1(lead) : "—";
  const driftText = typeof drift === "number" ? r1(drift) : "—";
  return (
    <p>
      <b>Eli Lilly (LLY) is a disclosed conviction position</b>: about 35% of NAV (about 40% including its core
      weight), with a loss budget to be agreed with a partner's fund or mandate. Every other name is capped at 7.5%.
      The modelled settings assume LLY keeps 40% of its {leadText}-point-a-year historical lead over global healthcare
      (a forward drift of {driftText}% a year in AUD), so they depend on it.{" "}
      <b>
        Sensitivity at {money(state.size * 1e6)}, {state.years} yr{state.years > 1 ? "s" : ""}:
      </b>{" "}
      Disciplined {pair("disc", "disc_pit")}; Conviction hybrid {pair("hyb", "hyb_pit")}; Strategies at scale (
      {state.sig}) {pair(`sc_${state.sig}`, `sc_${state.sig}_pit`)}. Defined-risk options only on binary events; AUD
      50% hedged; human veto on every trade.
    </p>
  );
}
