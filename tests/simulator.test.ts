import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { evidenceTextOk, isEvidence } from "../lib/simulator/evidence";
import { UNIVERSE, ownableNames } from "../lib/simulator/universe";
import {
  applyHash,
  applyPreset,
  computeTargets,
  defaultState,
  disp,
  isFoundationOnly,
  feePoints,
  headlineSetup,
  formatHistory,
  isCanonicalBase,
  isModelGrid,
  lookupCell,
  money,
  normalizeGrid,
  normalizeLabel,
  openingState,
  outcomeKind,
  r1,
  runAccounting,
  setupKey,
  sliderToSize,
  sizeToSlider,
  stateToHash,
  yearEnds,
  type Cell,
  type ModelGrid,
} from "../lib/simulator/model";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("canonical target stack at the A$10m default", () => {
  const targets = computeTargets(defaultState());
  assert.equal(r1(targets.net), "20.2");
  assert.equal(r1(targets.foNet), "8.8");
  assert.equal(r1(targets.upNet), "30.1");
  assert.equal(r1(targets.gross), "26.5");
  assert.equal(r1(targets.fee), "6.3");
  assert.equal(feePoints(targets.gross), targets.fee);
  assert.equal(money(10e6), "A$10m");
});

test("foundation alone is the market reference plus the stock-picking hurdle", () => {
  const state = defaultState();
  state.on.nowcaster = false;
  state.on.rx = false;
  state.on.catalyst = false;
  state.on.momentum = false;
  const targets = computeTargets(state);
  assert.equal(r1(targets.net), "8.8");
  assert.equal(r1(targets.foNet), "8.8");
});

test("the Prescription Reader is off below A$5m and the base target is not 20.2", () => {
  const state = defaultState();
  state.size = 1.5;
  const targets = computeTargets(state);
  assert.equal(targets.pts.find((layer) => layer.k === "rx")?.on, false);
  assert.notEqual(r1(targets.net), "20.2");
  state.size = 5;
  const atFive = computeTargets(state);
  assert.equal(atFive.pts.find((layer) => layer.k === "rx")?.on, true);
  assert.equal(r1(atFive.net), "20.2");
  assert.equal(r1(atFive.upNet), "30.1");
});

test("upside excludes the Prescription Reader below A$5m", () => {
  const state = defaultState();
  state.size = 1.5;
  const targets = computeTargets(state);
  assert.equal(targets.up, 32);
  assert.notEqual(r1(targets.upNet), "30.1");
});

test("capital slider snaps on a log scale and round-trips the presets", () => {
  for (const size of [1, 1.5, 2, 10, 25, 100]) {
    assert.equal(sliderToSize(sizeToSlider(size)), size);
  }
  assert.equal(sliderToSize(0), 1);
  assert.equal(sliderToSize(1000), 100);
  const between = sliderToSize(sizeToSlider(12));
  assert.ok(between > 10 && between < 15);
});

test("setup key and hash restore the modelled strong case at A$10m", () => {
  const state = applyHash(defaultState(), "#mode=modelled&setup=sc&sig=strong&size=10&years=3&pick=lly");
  assert.equal(setupKey(state), "sc_strong");
  assert.equal(state.mode, "modelled");
  assert.equal(state.size, 10);
  const mechanical = applyHash(state, "#pick=pit");
  assert.equal(setupKey(mechanical), "sc_strong_pit");
  const six = applyHash(defaultState(), "#setup=rec&pick=pit");
  assert.equal(setupKey(six), "rec");
});

test("log interpolation blends on log(size) and clamps outside the grid", () => {
  const grid = sampleGrid();
  const exact = lookupCell(grid, "disc", 3, 1.5);
  assert.equal(exact.exact, true);
  assert.equal(exact.med, 16);

  const size = Math.exp((Math.log(1) + Math.log(1.5)) / 2);
  const mid = lookupCell(grid, "disc", 3, size);
  assert.equal(mid.exact, false);
  const t = (Math.log(size) - Math.log(1)) / (Math.log(1.5) - Math.log(1));
  assert.ok(Math.abs(t - 0.5) < 1e-12);
  assert.ok(Math.abs(mid.med - (10 + (16 - 10) * t)) < 1e-12);
  assert.ok(Math.abs(mid.fan[2][1] - (1.3 + (1.8 - 1.3) * t)) < 1e-12);
  assert.ok(Math.abs(mid.att.foundation - (1 + (4 - 1) * t)) < 1e-12);

  const below = lookupCell(grid, "disc", 3, 0.5);
  assert.equal(below.exact, false);
  assert.equal(below.med, 10);
  const above = lookupCell(grid, "disc", 3, 9);
  assert.equal(above.med, 20);
});

test("exact cells show the prepared display string, not a second rounding", () => {
  const cell = sampleCell(12.35, true);
  cell.d = {
    med: "12.3",
    gross: "18.3",
    p30: "2",
    areit: "78",
    credit: "62",
    dd10: "-22",
    ploss: "6",
  };
  assert.equal(disp(cell, "med", true), "12.3");
  assert.equal(disp(cell, "dd10", false), "−22");
  const blended = { ...cell, exact: false, d: undefined };
  assert.equal(disp(blended, "med", true), r1(12.35));
});

test("public labels drop internal preset names", () => {
  assert.equal(normalizeLabel("Strategies at scale [strong]"), "Strategies at scale (strong signal)");
  assert.equal(normalizeLabel("Recommended (earlier preset)"), "Six-sleeve portfolio");
  assert.equal(
    normalizeLabel("No-credit baseline (global healthcare ETF in the fund, 8% gross)"),
    "No-credit baseline (global healthcare ETF in the same mandate, 8% gross)",
  );
  const grid = normalizeGrid(sampleGrid());
  assert.equal(grid.setups.sc_strong.label, "Strategies at scale (strong signal)");
  assert.equal(isModelGrid(grid), true);
});

test("canonical modelled medians from the local grid", (ctx) => {
  const gridPath = join(root, process.env.SIMULATOR_GRID || "simulator-src/grid.json");
  if (!existsSync(gridPath)) {
    ctx.skip("simulator-src/grid.json is git-ignored and is not on this machine");
    return;
  }
  const prepared = prepare(gridPath);
  assert.equal(isModelGrid(prepared), true);
  const disc = lookupCell(prepared, "disc", 3, 1.5);
  const hybrid = lookupCell(prepared, "hyb", 3, 1.5);
  const strong = lookupCell(prepared, "sc_strong", 3, 10);
  assert.equal(disp(disc, "med", true), "11.3");
  assert.equal(disp(hybrid, "med", true), "14.5");
  assert.equal(disp(strong, "med", true), "18.7");
  assert.equal(disp(strong, "areit", false), "84");
  assert.equal(disp(lookupCell(prepared, "disc", 3, 10), "areit", false), "75");
  const atOne = {
    disc: lookupCell(prepared, "disc", 3, 1),
    hyb: lookupCell(prepared, "hyb", 3, 1),
    strong: lookupCell(prepared, "sc_strong", 3, 1),
    base: lookupCell(prepared, "nocredit", 3, 1),
  };
  assert.equal(disp(atOne.disc, "med", true), "11.3");
  assert.equal(disp(atOne.hyb, "med", true), "14.4");
  assert.equal(disp(atOne.strong, "med", true), "14.6");
  assert.equal(r1(atOne.strong.nodata), "19.2");
  assert.equal(r1(atOne.disc.att.foundation), "7.2");
  assert.equal(r1(atOne.hyb.att.foundation), "11.2");
  assert.equal(r1(atOne.hyb.att.catalyst), "0.5");
  assert.equal(disp(atOne.base, "med", true), "3.0");
  assert.equal(money(1e6 * atOne.hyb.endmed), "A$1.5m");
  const fallbackPath = join(root, "simulator-src/grid-lly15.json");
  if (existsSync(fallbackPath)) {
    const smaller = prepare(fallbackPath);
    const fallbackHybrid = lookupCell(smaller, "hyb", 3, 1);
    const fallbackStrong = lookupCell(smaller, "sc_strong", 3, 1);
    assert.equal(disp(fallbackHybrid, "med", true), "13.9");
    assert.equal(disp(fallbackStrong, "med", true), "13.8");
    assert.equal(r1(fallbackStrong.nodata), "18.5");
    assert.equal(disp(lookupCell(smaller, "sc_strong", 3, 10), "med", true), "18.1");
  }
  assert.equal(disc.exact && hybrid.exact && strong.exact, true);
  assert.equal(prepared.meta.paths, 2000);
  assert.equal(prepared.meta.seed, 1);

  const left = prepared.setups.disc.grid["3|10"];
  const right = prepared.setups.disc.grid["3|15"];
  const size = 12;
  const blended = lookupCell(prepared, "disc", 3, size);
  const t = (Math.log(size) - Math.log(10)) / (Math.log(15) - Math.log(10));
  assert.equal(blended.exact, false);
  assert.ok(Math.abs(blended.med - (left.med + (right.med - left.med) * t)) < 1e-9);
  assert.equal(blended.fan.length, left.fan.length);
  assert.equal(blended.fan[0].length, left.fan[0].length);
});

test("the shipped payload is ciphertext and the grid file is not tracked", () => {
  const payload = JSON.parse(readFileSync(join(root, "public/simulator/payload.json"), "utf8")) as {
    v: number;
    iter: number;
    salt: string;
    iv: string;
    data: string;
  };
  assert.equal(payload.v, 3);
  assert.equal(payload.iter, 200_000);
  assert.ok(payload.salt.length > 8 && payload.iv.length > 8 && payload.data.length > 1000);
  const raw = readFileSync(join(root, "public/simulator/payload.json"), "utf8");
  assert.doesNotMatch(raw, /"setups"|"sc_strong"|2017-12\.\.2026-09|greenlink|performance fee/i);
  const ignore = spawnSync("git", ["check-ignore", "-q", "simulator-src/grid.json"], { cwd: root });
  assert.equal(ignore.status, 0);
  const evidenceIgnore = spawnSync("git", ["check-ignore", "-q", "simulator-src/evidence.json"], { cwd: root });
  assert.equal(evidenceIgnore.status, 0);
});

test("simulator and site copy do not describe Forward Matter as a fund", () => {
  const files = [
    join(root, "lib/simulator/copy.ts"),
    ...walk(join(root, "components/simulator")),
    join(root, "components/SimulatorGate.tsx"),
    join(root, "app/simulator/page.tsx"),
    join(root, "content/site.ts"),
    join(root, "app/layout.tsx"),
    join(root, "app/manifest.ts"),
  ];
  const banned = [
    /performance fee/i,
    /greenlink/i,
    /\byour firm\b/i,
    /\bour fund\b/i,
    /\bthe fund\b/i,
    /\bfund launch\b/i,
    /\bunit holders?\b/i,
    /\bunitholders?\b/i,
    /\bAFSL\b/,
    /\bour own book\b/i,
    /\bour licence\b/i,
    /\bour license\b/i,
  ];
  for (const file of files) {
    let text = readFileSync(file, "utf8");
    text = text.replace(/sophisticated investors within the meaning of the Corporations Act 2001 \(Cth\)/g, "");
    for (const pattern of banned) {
      assert.equal(pattern.test(text), false, `${file} matches ${pattern}`);
    }
  }
});

test("scenario presets keep the canonical targets and do not pretend to re-simulate", () => {
  const base = applyPreset(defaultState(), "base");
  assert.equal(r1(computeTargets(base).net), "20.2");
  assert.equal(r1(computeTargets(base).upNet), "30.1");
  assert.equal(outcomeKind(base), "target");
  assert.equal(isCanonicalBase(base), true);

  const upside = applyPreset(defaultState(), "upside");
  assert.equal(r1(computeTargets(upside).net), "30.1");
  assert.equal(outcomeKind(upside), "target");

  const conservative = applyPreset(defaultState(), "conservative");
  assert.equal(r1(computeTargets(conservative).net), "8.8");
  assert.equal(conservative.on.foundation, true);
  assert.equal(conservative.on.nowcaster, false);
  assert.equal(isFoundationOnly(conservative), true);
  const atOpening = applyPreset(openingState(), "conservative");
  assert.equal(r1(computeTargets(atOpening).net), "8.8");
  assert.equal(isFoundationOnly(atOpening), true);

  const nocredit = applyPreset(defaultState(), "nocredit");
  assert.equal(nocredit.mode, "modelled");
  assert.equal(nocredit.setup, "disc");
  assert.notEqual(setupKey(nocredit), "nocredit");
  assert.equal(outcomeKind(nocredit), "modelled");

  const kept = applyPreset({ ...defaultState(), setup: "hyb", size: 1 }, "nocredit");
  assert.equal(kept.setup, "hyb");
  assert.equal(kept.size, 1);
  assert.equal(kept.mode, "modelled");

  const stress = applyPreset(defaultState(), "stress");
  assert.equal(outcomeKind(stress), "stress");
  assert.equal(stress.mode, "modelled");

  const custom = { ...defaultState(), fee: 0, market: 8 };
  const moved = computeTargets(custom);
  assert.equal(r1(moved.gross), "26.5");
  assert.equal(r1(moved.fee), "0.0");
  assert.equal(r1(moved.net), "26.5");
  assert.equal(outcomeKind(custom), "target");
  assert.equal(isCanonicalBase(custom), false);
});

test("the stored grid accounts for 1,320,000 paths and log interpolation is not a new run", () => {
  const account = runAccounting(
    { paths: 2000, seed: 1, sizes: [1, 1.5, 2, 3, 5, 7.5, 10, 15, 25, 50, 100], years: [1, 2, 3, 4, 5], history: "2017-12..2026-09", block: 6 },
    12,
  );
  assert.equal(account.total, 1_320_000);
  assert.equal(account.paths, 2000);
  assert.equal(account.seed, 1);
  assert.equal(formatHistory(account.history), "Dec 2017 – Sep 2026");

  const fan = [
    Array.from({ length: 24 }, (_, i) => 1 + i / 100),
    Array.from({ length: 24 }, (_, i) => 1.1 + i / 100),
    Array.from({ length: 24 }, (_, i) => 1.2 + i / 100),
    Array.from({ length: 24 }, (_, i) => 1.3 + i / 100),
    Array.from({ length: 24 }, (_, i) => 1.4 + i / 100),
  ];
  const ends = yearEnds(fan, 2);
  assert.equal(ends.length, 2);
  assert.equal(ends[0].year, 1);
  assert.equal(ends[0].p10, fan[0][11]);
  assert.equal(ends[1].p50, fan[2][23]);
  assert.equal(yearEnds(fan, 3).length, 2);
});

test("the simulator opens at A$1m on a strategy, never the baseline", () => {
  const open = openingState();
  assert.equal(open.size, 1);
  assert.equal(open.setup, "hyb");
  assert.equal(open.mode, "modelled");
  assert.equal(open.sleeve, "20");
  assert.equal(headlineSetup(open), "hyb");
  assert.equal(headlineSetup({ ...open, setup: "nocredit", sig: "strong", pick: "lly" }), "hyb");
  assert.equal(headlineSetup({ ...open, setup: "sc", sig: "strong", pick: "lly" }), "sc_strong");

  const coerced = applyHash(openingState(), "#setup=nocredit&size=1&years=3&preset=nocredit");
  assert.equal(coerced.setup, "hyb");
  assert.equal(coerced.size, 1);
  assert.equal(coerced.years, 3);
  assert.equal(coerced.mode, "modelled");

  const chip = applyHash(openingState(), "#size=2");
  assert.equal(chip.setup, "hyb");
  assert.equal(chip.size, 2);
  assert.equal(chip.sleeve, "20");
  assert.equal(applyHash(openingState(), "#sleeve=15").sleeve, "15");
});

test("a shared link restores the fee, the workspace and the comparison", () => {
  const state = applyPreset(defaultState(), "upside");
  state.view = "engines";
  state.compare = ["hyb", "nocredit", "target"];
  state.fee = 4;
  const restored = applyHash(defaultState(), `#${stateToHash(state)}`);
  assert.equal(restored.view, "engines");
  assert.equal(restored.fee, 4);
  assert.deepEqual(restored.compare, ["hyb", "nocredit", "target"]);
  assert.equal(restored.val.foundation, 10);
  assert.equal(restored.preset, "upside");
});

test("public copy uses the v4 sleeve and does not sum the targets", () => {
  const text = [
    readFileSync(join(root, "lib/simulator/copy.ts"), "utf8"),
    ...walk(join(root, "components/simulator")).map((path) => readFileSync(path, "utf8")),
  ].join("\n");
  assert.equal(/from day one/i.test(text), false);
  assert.equal(/earning nothing/i.test(text), false);
  assert.equal(/35% conviction/i.test(text), false);
  assert.equal(/The figure is the strategy/i.test(text), false);
  assert.match(text, /20% Lilly sleeve/);
  assert.match(text, /Lilly 15%, conservative/);
  assert.match(text, /F-2 not yet run/);
  assert.match(text, /about 75%/);
  assert.match(text, /not added/);
  assert.match(text, /checked at month-end/);
  assert.match(text, /stays at the halved target/);
  assert.match(text, /does not count toward the budget/);
  assert.match(text, /about 22%/);
  assert.match(text, /about 31% in the leveraged setting/);
  assert.match(text, /fund capital/);
  assert.equal(/7\.5% of NAV/.test(text), false);
  assert.equal(/from the sleeve's high/.test(text), false);
  assert.equal(/from its high/.test(text), false);
  assert.equal(/\bdaily\b/i.test(text), false);
  assert.equal(/pre-order/i.test(text), false);
  const build = readFileSync(join(root, "scripts/build-simulator.mjs"), "utf8");
  assert.match(build, /Ten fresh seeds of 1,000 paths each/);
  assert.match(build, /10\.9–11\.6%/);
  assert.match(build, /13\.9–14\.7%/);
  assert.match(build, /no seed moving a median more than 0\.5 points/);
  assert.match(text, /11\.3 \/ 10\.2 \/ 9\.2%/);
  assert.match(text, /14\.4 \/ 12\.9 \/ 11\.3%/);
  assert.match(build, /11\.3 \/ 10\.2 \/ 9\.2%/);
  assert.match(build, /14\.4 \/ 12\.9 \/ 11\.3%/);
  assert.match(text, /eight rails plus a human veto/i);
  assert.match(text, /Built · validating/);
  assert.match(text, /Unlocks at A\$5m/);
  assert.match(text, /Target shown\. Counted in the modelled figure once its test passes\./);
  assert.match(text, /1\.32 million simulated paths and 27 registered tests/);
  assert.equal(/Stored paths/.test(text), false);
  assert.equal(/Live from A\$5m/.test(text), false);
  assert.match(text, /Show targets/);
  assert.match(text, /See the test/);
  assert.match(text, /Compare strategies/);
  assert.match(text, /Universe list loading/);
  assert.equal(/\bpaper\b/i.test(text), false);
  assert.equal(/\bgated\b/i.test(text), false);
  assert.equal(/The modelled core stands on its own/.test(text), false);
  assert.equal(/Five engines\. Open one/.test(text), false);
});

test("the foundation universe is names only, with the modelled tags", () => {
  assert.equal(ownableNames().length, 34);
  assert.equal(UNIVERSE.length, 41);
  assert.deepEqual(
    UNIVERSE.filter((row) => row.tag === "Modelled basket").map((row) => row.ticker).sort(),
    ["AZN", "GPCR", "ISRG"],
  );
  assert.equal(UNIVERSE.find((row) => row.ticker === "LLY")?.tag, "In modelled backtest");
  assert.equal(UNIVERSE.find((row) => row.company === "Lonza")?.ticker, "");
  assert.equal(UNIVERSE.some((row) => row.sleeve === "Watch list"), true);
  const src = readFileSync(join(root, "lib/simulator/universe.ts"), "utf8");
  assert.equal(/launch_weight|weight_pct/.test(src), false);
});

test("evidence is rejected when it names a partner or a performance fee", () => {
  assert.equal(evidenceTextOk({ note: "Greenlink" }), false);
  assert.equal(evidenceTextOk({ note: "no performance fee" }), false);
  assert.equal(evidenceTextOk({ note: "a partner's fund or mandate" }), true);
  const evidencePath = join(root, "simulator-src/evidence.json");
  if (!existsSync(evidencePath)) return;
  const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
  assert.equal(isEvidence(evidence), true);
  const kinds = new Set(evidence.studies.map((study: { kind: string }) => study.kind));
  assert.equal(kinds.has("modelled") && kinds.has("backtested"), true);
  const book = evidence.book as { holdings: { name: string }[]; screen: unknown[] };
  assert.equal(book.holdings.length, 1);
  assert.match(book.holdings[0].name, /Lilly/);
  const engines = evidence.engines as { id: string }[];
  assert.deepEqual(
    engines.map((engine) => engine.id),
    ["foundation", "nowcaster", "rx", "catalyst", "momentum"],
  );
});

function sampleCell(med: number, exact: boolean): Cell {
  return {
    med,
    gross: med + 6,
    nodata: med,
    p30: 2.1,
    areit: 78.55,
    credit: 61.75,
    dd10: -21.7,
    ploss: 5.75,
    p10: 2,
    p90: 20,
    endmed: 1.4,
    att: { foundation: med > 12 ? 4 : 1, nowcaster: 0 },
    fan: [
      [1, 1.05],
      [1, 1.1],
      [1, med > 12 ? 1.8 : 1.3],
      [1, 1.9],
      [1, 2],
    ],
    exact,
  };
}

function sampleGrid(): ModelGrid {
  const row = (med: number) => {
    const cell = sampleCell(med, true);
    const { exact: _exact, ...stored } = cell;
    return stored;
  };
  return {
    meta: { paths: 2000, seed: 1, sizes: [1, 1.5, 2], years: [3], generated: "2026-10-26 09:23 AEDT" },
    setups: {
      disc: {
        label: "Disciplined",
        grid: { "3|1": row(10), "3|1.5": row(16), "3|2": row(20) },
      },
      hyb: { label: "Conviction hybrid", grid: { "3|1": row(1), "3|1.5": row(1), "3|2": row(1) } },
      sc_strong: {
        label: "Strategies at scale [strong]",
        grid: { "3|1": row(1), "3|1.5": row(1), "3|2": row(1) },
      },
      nocredit: {
        label: "No-credit baseline (global healthcare ETF in the fund, 8% gross)",
        grid: { "3|1": row(1), "3|1.5": row(1), "3|2": row(1) },
      },
      rec: { label: "Recommended (earlier preset)", grid: { "3|1": row(1), "3|1.5": row(1), "3|2": row(1) } },
    },
  };
}

function prepare(gridPath: string): ModelGrid {
  const result = spawnSync("python3", [join(root, "scripts/prepare-grid.py")], {
    input: readFileSync(gridPath),
    maxBuffer: 64 * 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr?.toString());
  return JSON.parse(result.stdout.toString("utf8")) as ModelGrid;
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}
