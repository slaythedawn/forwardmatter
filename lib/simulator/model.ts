/**
 * Matter Engine strategy simulator: target stack, log-scale interpolation and
 * formatting. Numbers come from the decrypted model grid. This module holds no
 * grid data.
 *
 * Target fee: 5% of assets, so the fee in points is 5 × (1 + gross return).
 * That matches the approved simulator. Display of an exact grid cell uses the
 * precomputed `d` strings (Python round-half-even, then a 0-decimal format for
 * the rate KPIs). Cells between simulated sizes use the same log blend as the
 * reference, then ordinary half-up rounding.
 */

export type LayerKey = "foundation" | "nowcaster" | "rx" | "catalyst" | "momentum";

export type LayerDef = {
  k: LayerKey;
  n: string;
  d: string;
  lo: number;
  hi: number;
  base: number;
  up: number;
  minSize?: number;
};

export const LAYERS: readonly LayerDef[] = [
  {
    k: "foundation",
    n: "Foundation (stock picker / core)",
    d: "Healthcare stock selection; measured against a global healthcare ETF (IXJ) in AUD",
    lo: 5,
    hi: 10,
    base: 6.5,
    up: 10,
  },
  {
    k: "nowcaster",
    n: "Nowcaster",
    d: "Results-day nowcasting across the large-pharma names",
    lo: 1,
    hi: 4,
    base: 2.5,
    up: 4,
  },
  {
    k: "rx",
    n: "Prescription Reader",
    d: "Weekly script data on key franchises; paid feed from A$5m",
    lo: 1,
    hi: 5,
    base: 2.5,
    up: 5,
    minSize: 5,
  },
  {
    k: "catalyst",
    n: "Catalyst engine",
    d: "FDA advisory-committee reader, trial-registry change detection, defined-risk options, post-crash trades",
    lo: 2,
    hi: 7,
    base: 5,
    up: 7,
  },
  {
    k: "momentum",
    n: "Momentum into results",
    d: "Tilts towards strong 20-day momentum into results days",
    lo: 1,
    hi: 3,
    base: 2,
    up: 3,
  },
];

export const MARKET_REFERENCE = 8;
export const FEE_RATE = 5;
export const AREIT_RATE = 6;
export const CREDIT_RATE = 10;
export const HEALTHCARE_ETF_RATE = 8;

export const YEAR_WORDS = ["one year", "two years", "three years", "four years", "five years"] as const;

export type SimMode = "targets" | "modelled";
export type SetupId = "disc" | "hyb" | "sc" | "rec" | "nocredit";
export type Signal = "weak" | "base" | "strong";
export type ConvictionPick = "lly" | "pit";

export type SimState = {
  mode: SimMode;
  size: number;
  years: number;
  setup: SetupId;
  sig: Signal;
  pick: ConvictionPick;
  on: Record<LayerKey, boolean>;
  val: Record<LayerKey, number>;
};

export type DisplayFields = {
  med: string;
  gross: string;
  p30: string;
  areit: string;
  credit: string;
  dd10: string;
  ploss: string;
};

export type Cell = {
  med: number;
  gross: number;
  nodata: number;
  p30: number;
  areit: number;
  credit: number;
  dd10: number;
  ploss: number;
  p10: number;
  p90: number;
  endmed: number;
  att: Record<string, number>;
  fan: number[][];
  d?: DisplayFields;
  exact: boolean;
};

export type SetupBlock = {
  label: string;
  grid: Record<string, Omit<Cell, "exact">>;
  lev?: number;
  rail?: number | null;
  data?: number;
};

export type ModelMeta = {
  generated?: string;
  paths: number;
  seed: number;
  sizes: number[];
  years: number[];
  fee?: number;
  leads?: Record<string, number>;
  fwd?: Record<string, number>;
};

export type ModelGrid = {
  meta: ModelMeta;
  setups: Record<string, SetupBlock>;
};

export type TargetPoint = LayerDef & { on: boolean; v: number };

export type Targets = {
  pts: TargetPoint[];
  gross: number;
  fee: number;
  net: number;
  foNet: number;
  upNet: number;
  up: number;
};

const NUMERIC: (keyof Omit<Cell, "att" | "fan" | "d" | "exact">)[] = [
  "med",
  "gross",
  "nodata",
  "p30",
  "areit",
  "credit",
  "dd10",
  "ploss",
  "p10",
  "p90",
  "endmed",
];

export function defaultState(): SimState {
  const on = {} as Record<LayerKey, boolean>;
  const val = {} as Record<LayerKey, number>;
  for (const layer of LAYERS) {
    on[layer.k] = true;
    val[layer.k] = layer.base;
  }
  return {
    mode: "targets",
    size: 10,
    years: 3,
    setup: "disc",
    sig: "strong",
    pick: "lly",
    on,
    val,
  };
}

export function rxAvailable(size: number): boolean {
  return size >= 5;
}

/** Points of fee on a gross annual return, matching the reference rounding. */
export function feePoints(gross: number): number {
  return Math.round(FEE_RATE * (1 + gross / 100) * 10 + 1e-9) / 10;
}

export function computeTargets(state: Pick<SimState, "size" | "on" | "val">): Targets {
  const pts: TargetPoint[] = [];
  let gross = MARKET_REFERENCE;
  for (const layer of LAYERS) {
    const on = state.on[layer.k] && (!layer.minSize || rxAvailable(state.size));
    const v = on ? state.val[layer.k] : 0;
    pts.push({ ...layer, on, v });
    if (on) gross += state.val[layer.k];
  }
  const fee = feePoints(gross);
  const net = gross - fee;
  const fo = MARKET_REFERENCE + (state.on.foundation ? state.val.foundation : 0);
  const foNet = fo - feePoints(fo);
  let up = MARKET_REFERENCE;
  for (const layer of LAYERS) {
    if (!layer.minSize || rxAvailable(state.size)) up += layer.up;
  }
  const upNet = up - feePoints(up);
  return { pts, gross, fee, net, foNet, upNet, up };
}

export function setupKey(state: Pick<SimState, "setup" | "sig" | "pick">): string {
  let key: string = state.setup;
  if (key === "sc") key = `sc_${state.sig}`;
  if (state.pick === "pit" && (key === "disc" || key === "hyb" || key.startsWith("sc_"))) key += "_pit";
  return key;
}

export function normalizeLabel(label: string): string {
  return label
    .replace(/\[(\w+)\]/g, "($1 signal)")
    .replace("Recommended (earlier preset)", "Six-sleeve portfolio")
    .replace("ETF in the fund", "ETF in the same mandate");
}

export function normalizeGrid(grid: ModelGrid): ModelGrid {
  const setups: ModelGrid["setups"] = {};
  for (const [key, setup] of Object.entries(grid.setups)) {
    setups[key] = { ...setup, label: normalizeLabel(setup.label) };
  }
  return { ...grid, setups };
}

export function isModelGrid(value: unknown): value is ModelGrid {
  if (!value || typeof value !== "object") return false;
  const grid = value as ModelGrid;
  if (!grid.meta || !grid.setups) return false;
  if (grid.meta.paths !== 2000 || grid.meta.seed !== 1) return false;
  if (!Array.isArray(grid.meta.sizes) || grid.meta.sizes.length < 2) return false;
  const required = ["disc", "hyb", "sc_strong", "nocredit", "rec"];
  return required.every((key) => grid.setups[key]?.grid && typeof grid.setups[key].label === "string");
}

/**
 * Log-scale blend between the neighbouring simulated capital sizes.
 * Exact sizes return the stored cell. Sizes outside the grid clamp to the ends.
 */
export function lookupCell(grid: ModelGrid, key: string, years: number, size: number): Cell {
  const setup = grid.setups[key];
  if (!setup) throw new Error(`Unknown setup ${key}`);
  const sizes = grid.meta.sizes;
  const stored = setup.grid[`${years}|${size}`];
  if (stored) {
    return { ...stored, att: { ...stored.att }, fan: stored.fan, exact: true };
  }
  let i = 0;
  while (i < sizes.length - 2 && sizes[i + 1] < size) i += 1;
  const a = sizes[i];
  const b = sizes[i + 1];
  const span = Math.log(b) - Math.log(a);
  const t = Math.min(1, Math.max(0, (Math.log(size) - Math.log(a)) / span));
  const A = setup.grid[`${years}|${a}`];
  const B = setup.grid[`${years}|${b}`];
  if (!A || !B) throw new Error(`Missing neighbour for ${key} ${years}y A$${size}m`);
  const mix = (p: number, q: number) => p + (q - p) * t;
  const att: Record<string, number> = {};
  for (const engine of Object.keys(A.att)) att[engine] = mix(A.att[engine], B.att[engine]);
  const fan = A.fan.map((row, j) => row.map((v, m) => mix(v, B.fan[j][m])));
  const blended = { att, fan, exact: false as const } as Cell;
  for (const field of NUMERIC) {
    blended[field] = mix(A[field], B[field]);
  }
  return blended;
}

export function r1(x: number): string {
  return (Math.round(x * 10 + 1e-9) / 10).toFixed(1);
}

export function r0(x: number): string {
  const v = Math.round(x + 1e-9);
  return (v === 0 ? 0 : v).toString();
}

export function neg(value: string): string {
  return value.replace(/^-/, "−");
}

export function disp(cell: Cell, field: keyof DisplayFields, decimals: boolean): string {
  if (cell.exact && cell.d && cell.d[field] != null) return neg(cell.d[field]);
  const raw = cell[field];
  return neg(decimals ? r1(raw) : r0(raw));
}

export function signed(x: number, fmt: (n: number) => string = r1): string {
  return (x >= 0 ? "+" : "−") + fmt(Math.abs(x));
}

/** Australian millions, same trimming rules as the approved simulator. */
export function money(aud: number): string {
  const m = aud / 1e6;
  if (m >= 100) return `A$${m.toFixed(0)}m`;
  if (m >= 10) return `A$${m.toFixed(1).replace(/\.0$/, "")}m`;
  return `A$${m.toFixed(2).replace(/0$/, "").replace(/\.0$/, "")}m`;
}

export function compound(aud: number, rate: number, years: number): number {
  return aud * Math.pow(1 + rate / 100, years);
}

/** Slider position 0..1000 maps to A$1m..A$100m on a log scale, then snaps. */
export function sliderToSize(slider: number): number {
  let value = Math.exp(Math.log(1) + (slider / 1000) * Math.log(100));
  if (value < 10) value = Math.round(value * 10) / 10;
  else if (value < 50) value = Math.round(value);
  else value = Math.round(value / 5) * 5;
  return value;
}

export function sizeToSlider(size: number): number {
  return Math.round((Math.log(size) / Math.log(100)) * 1000);
}

const SETUPS: readonly SetupId[] = ["disc", "hyb", "sc", "rec", "nocredit"];
const SIGNALS: readonly Signal[] = ["weak", "base", "strong"];
const PICKS: readonly ConvictionPick[] = ["lly", "pit"];

export function applyHash(base: SimState, hash: string): SimState {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const next: SimState = { ...base, on: { ...base.on }, val: { ...base.val } };
  const mode = params.get("mode");
  if (mode === "targets" || mode === "modelled") next.mode = mode;
  const setup = params.get("setup");
  if (setup && (SETUPS as readonly string[]).includes(setup)) next.setup = setup as SetupId;
  const sig = params.get("sig");
  if (sig && (SIGNALS as readonly string[]).includes(sig)) next.sig = sig as Signal;
  const pick = params.get("pick");
  if (pick && (PICKS as readonly string[]).includes(pick)) next.pick = pick as ConvictionPick;
  if (params.has("size")) {
    const size = Number(params.get("size"));
    if (Number.isFinite(size)) next.size = Math.min(100, Math.max(1, size));
  }
  if (params.has("years")) {
    const years = Number(params.get("years"));
    if (Number.isFinite(years)) next.years = Math.min(5, Math.max(1, Math.round(years)));
  }
  return next;
}

export function stateToHash(state: SimState): string {
  const params = new URLSearchParams();
  params.set("mode", state.mode);
  params.set("size", String(state.size));
  params.set("years", String(state.years));
  params.set("setup", state.setup);
  params.set("sig", state.sig);
  params.set("pick", state.pick);
  return params.toString();
}

export function smoothPath(rate: number, years: number): number[] {
  return Array.from({ length: years * 12 }, (_, month) => Math.pow(1 + rate / 100, (month + 1) / 12));
}
