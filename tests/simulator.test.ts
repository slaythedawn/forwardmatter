import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  applyHash,
  computeTargets,
  defaultState,
  disp,
  feePoints,
  isModelGrid,
  lookupCell,
  money,
  normalizeGrid,
  normalizeLabel,
  r1,
  setupKey,
  sliderToSize,
  sizeToSlider,
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
  assert.equal(disp(disc, "med", true), "12.5");
  assert.equal(disp(hybrid, "med", true), "16.3");
  assert.equal(disp(strong, "med", true), "22.6");
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
  assert.equal(payload.v, 2);
  assert.equal(payload.iter, 200_000);
  assert.ok(payload.salt.length > 8 && payload.iv.length > 8 && payload.data.length > 1000);
  const raw = readFileSync(join(root, "public/simulator/payload.json"), "utf8");
  assert.doesNotMatch(raw, /"setups"|"sc_strong"|2017-12\.\.2026-09/);
  const ignore = spawnSync("git", ["check-ignore", "-q", "simulator-src/grid.json"], { cwd: root });
  assert.equal(ignore.status, 0);
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
