/**
 * Approved simulator copy. Forward Matter supplies the platform.
 * The strategy runs inside a partner's fund or mandate.
 * Fee language in here is the proposed platform fee only.
 */

export const hero = {
  kicker: "Matter Engine",
  title: "The figure is the strategy.",
  takeaway: "The healthcare ETF is the comparison beside it.",
  body: "Forward Matter supplies the platform. The Matter Engine strategy runs inside a partner's fund or mandate. A foundation of healthcare stocks aims to beat the market. Four engines trade dates that are known in advance: results days, FDA committee votes and trial readouts. You set a hurdle for each layer. The page then shows a target, or a modelled outcome from stored paths. The healthcare ETF is the comparison beside that figure. It is never the result. No engine carries capital until it passes its gate.",
  steps: [
    {
      title: "The platform",
      body: "Forward Matter is a quantitative, automated trading platform. Systematic, rules-based, and already built.",
    },
    {
      title: "The mandate",
      body: "The strategy runs inside a partner's fund or mandate, under that partner's arrangements. This page does not offer a product.",
    },
    {
      title: "The figure",
      body: "A target is a hurdle we will measure. A modelled figure is the middle of 2,000 stored paths. Neither is a forecast or a guarantee.",
    },
  ],
  stats: [
    { value: "+5–10", label: "pts a year: Foundation target over global healthcare" },
    { value: "118", label: "Monthly trial-registry snapshots, 2017–2026" },
  ],
  baseStatLabel: "Base target a year at A$10m, net of the 5% fee. The page opens at A$1m.",
  upsideStatLabel: "Upside ambition at A$10m, net of the 5% fee. Not a promise.",
  pills: ["Wholesale clients only", "Confidential · October 2026"],
} as const;

export const shell = {
  product: "Matter Engine",
  name: "Simulator",
  notice: "Targets and modelled results. Not a forecast.",
  view: "View",
  targets: "Targets",
  modelled: "Modelled",
  capital: "Capital allocated",
  capitalAria: "Capital allocated to the strategy",
  presets: "Presets",
  presetLabels: [
    { size: 1, label: "A$1m" },
    { size: 1.5, label: "A$1.5m" },
    { size: 2, label: "A$2m" },
    { size: 10, label: "A$10m" },
    { size: 25, label: "A$25m" },
  ],
  horizon: "Horizon",
  years: [
    { years: 1, label: "1 yr" },
    { years: 2, label: "2" },
    { years: 3, label: "3" },
    { years: 4, label: "4" },
    { years: 5, label: "5" },
  ],
  setting: "Modelled setting",
  setups: [
    { id: "disc", label: "A · Disciplined" },
    { id: "hyb", label: "B · Conviction hybrid" },
    { id: "sc", label: "C · Strategies at scale" },
    { id: "rec", label: "Six-sleeve portfolio" },
  ],
  signal: "Signal assumption (C)",
  signals: [
    { id: "weak", label: "Weak" },
    { id: "base", label: "Base" },
    { id: "strong", label: "Strong" },
  ],
  conviction: "Conviction position",
  picks: [
    { id: "lly", label: "LLY (disclosed conviction)" },
    { id: "pit", label: "Mechanical pick (sensitivity)" },
  ],
} as const;

export const sections = {
  outcome: {
    n: "01",
    kicker: "Outcome",
    title: "The strategy is the figure. The ETF is the comparison.",
    lede: "The number in front of you is the Matter Engine setup you have selected. The healthcare ETF, held in the same mandate with no engine credit, sits beside it so you can see the gap. A target is a hurdle. A modelled figure is the middle of 2,000 stored paths.",
  },
  stack: {
    n: "02",
    kicker: "The stack",
    title: "Switch a layer off, and the hurdle changes.",
    lede: "The foundation is on from the first allocation. Each engine adds points around dated events, against a hurdle of its own.",
    note: "Targets are gross points a year over an 8% reference return for the global healthcare market, before the 5% fee. The fee is charged on assets, so it is 5% × (1 + gross return). They are hurdles Forward Matter will measure itself against, not forecasts; none of the trading engines has a live record yet.",
  },
  rulebook: {
    n: "02",
    kicker: "The setting",
    title: "The rules are fixed before the run.",
  },
  range: {
    n: "03",
    kicker: "The paths",
    title: "Read the middle path, and the paths around it.",
    targetNote: "Target paths compound smoothly. Real returns will not.",
    modelledNote: "Percentiles of value, month by month, across 2,000 simulated paths, net of fees. These are the selected strategy, not the baseline.",
  },
  beside: {
    n: "04",
    kicker: "Context",
    title: "Set this beside property and credit.",
    note: "A-REITs (6% a year), the global healthcare ETF (8% a year, the market reference, held directly before our fee) and property-secured private credit (10% a year) are benchmark assumptions for context, not forecasts. These investments have different risk, income, security and liquidity.",
  },
  bridge: {
    n: "05",
    kicker: "What is kept",
    title: "See what the fee and the data cost take.",
    targetNote:
      "Points a year. Data costs (~A$500 a year in the first allocation, ~A$45k at scale) are not deducted from targets.",
    modelledNote:
      "Differences between medians of the same 2,000 paths run with and without each cost, so the steps are approximate.",
  },
  source: {
    n: "06",
    kicker: "Attribution",
    title: "See which layer is earning the points.",
    targetNote:
      "Each engine's target is set as a hurdle and will be measured from day one by running the strategy with and without it, every reporting period.",
    modelledNote:
      "Median net return a year with the engine, minus the same paths without it (points). Interactions mean the rows do not add exactly to the total. Negative rows show where an engine costs more than it earns under that assumption.",
    bridge: "Attribution shows what each engine adds. The gates decide whether it trades at all.",
  },
  gates: {
    n: "07",
    kicker: "The gates",
    title: "A built engine is not yet a funded engine.",
    lede: "The technology is already built: a point-in-time archive of monthly ClinicalTrials.gov registry snapshots, a survivor-free universe, a readout library and a live, time-stamped call record. The gates decide what it is allowed to trade.",
    asOf: "Status at 26 October 2026 (AEDT)",
    note: "Every rule is pre-registered before it sees outcomes, tested walk-forward on point-in-time, survivor-free data, corrected for multiple testing (Holm), and run on paper with time-stamped calls before it carries capital. Kill switches, an append-only decision log and with/without attribution apply from day one.",
    bridge: "Inside those rules, one position is sized on conviction rather than by formula, and it is disclosed as such.",
  },
  conviction: {
    n: "08",
    kicker: "One name",
    title: "One holding is sized on conviction, and it is named.",
  },
} as const;

export const chips = {
  target: "Target",
  modelled: "Modelled · illustrative",
} as const;

export const descriptions: Record<string, { title: string; body: string }> = {
  disc: {
    title: "A · Disciplined.",
    body: "35% conviction position + 65% diversified healthcare core, no leverage, 15% cash reserve, −25% strategy drawdown rail that halves exposure. The trading engines run on paper and are credited nothing; the FDA Reader trades small (3% a trade). Free data only (~A$500 a year).",
  },
  hyb: {
    title: "B · Conviction hybrid.",
    body: "35% conviction position + 65% diversified healthcare core at 1.2× with the −25% rail. The trading engines run on paper and are credited nothing; the FDA Reader trades small. Free data only (~A$500 a year).",
  },
  sc: {
    title: "C · Strategies at scale.",
    body: 'Setting B with the trading engines switched on at the chosen signal assumption and the ~A$45k-a-year paid prescription feed. "Strong" assumes results-day accuracy of 65%, 54% on weekly script releases and a 75% FDA Reader. These are assumptions, not measured results; the engines only carry money once they pass their gates.',
  },
  rec: {
    title: "Six-sleeve portfolio.",
    body: "A diversified healthcare portfolio in six sleeves (core, momentum, next-approval, biotech, quality, defensives) at 1.2× with the −25% rail: a broad, rules-based alternative to the conviction settings.",
  },
  nocredit: {
    title: "Healthcare ETF, no engine credit.",
    body: "A comparison only. A plain global healthcare ETF in the same mandate and fee structure, with no credit for stock selection or any engine. It is what the Foundation has to beat. It is never the headline.",
  },
};

export const scaleWarnBelow =
  "The paid prescription feed (~A$45k a year) is bought only once capital allocated to the strategy reaches A$5m and the Nowcaster passes its paper gate. Below A$5m this setting is shown for comparison only, carrying the full feed cost.";

export const scaleWarnAbove =
  "The engines are switched on at an assumed signal strength, not a measured one. Each carries capital only after passing its gate.";

export const gates: { name: string; tone: "live" | "paper" | "gated"; status: string; gate: string; detail: string }[] = [
  {
    name: "Foundation (stock picker)",
    tone: "live",
    status: "Live from first allocation",
    gate: "Reported every period against IXJ in AUD. Selection rules also go through a point-in-time test on a frozen, survivor-free universe (~996 names incl. 319 delisted).",
    detail: "Core portfolio inside per-name caps (7.5% for every name except the disclosed conviction position).",
  },
  {
    name: "Nowcaster",
    tone: "paper",
    status: "Paper",
    gate: "Results-day hit rate ≥58% over 20+ events, pooled across large-pharma names, positive after costs.",
    detail: "Free data did not clear the bar, so the Nowcaster trades on full data only, and only once it passes its gate.",
  },
  {
    name: "Prescription Reader",
    tone: "gated",
    status: "Scale-gated: starts with the paid feed at A$5m+",
    gate: "Strategy capacity ≥A$5m and Nowcaster paper gate passed → buy the ~A$45k/yr weekly feed; then a pre-registered test on purchased data plus ≥8 live calls with a positive result.",
    detail:
      "A weekly script history from 235 public IQVIA relays and a broker tracker is already assembled; the engine runs on paper until the feed is bought.",
  },
  {
    name: "Catalyst: FDA Reader",
    tone: "live",
    status: "Live record starting, 3% a trade",
    gate: "Live record beats the 68% break-even over ≥20 scored calls, then full size.",
    detail: "Every call time-stamped before the open; first live meeting scored from 30 October 2026.",
  },
  {
    name: "Catalyst: registry change detector",
    tone: "gated",
    status: "Pre-registered test",
    gate: "19 pre-registered rules; same sign in 2017–20, Holm-adjusted p<0.05 in 2021–26, positive after costs; then paper.",
    detail: "Built on monthly ClinicalTrials.gov registry snapshots, 2017–2026.",
  },
  {
    name: "Catalyst: readout options and post-crash trades",
    tone: "paper",
    status: "Paper",
    gate: "Positive after executable bid/ask (options) or real borrow quotes (shorts) over a 12-month paper record.",
    detail: "Built on 4,112 readout 8-K filings; options priced at tradable bid/ask. Defined risk only.",
  },
  {
    name: "Momentum into results",
    tone: "paper",
    status: "Paper",
    gate: "Pre-registered paper test over 4–6 quarters (~60 events a year): hit rate ≥55% and positive after costs.",
    detail: "Strongest of nine free signals tested (53–56%).",
  },
];

export const legal: { title: string; body: string }[] = [
  {
    title: "Wholesale clients only.",
    body: "This simulator is provided to wholesale clients and sophisticated investors within the meaning of the Corporations Act 2001 (Cth) only. It is not an offer of financial products or securities. The strategy runs within a partner's fund or mandate under its existing licensing arrangements; details are provided separately.",
  },
  {
    title: "General advice warning.",
    body: "This is general information only and does not take into account your objectives, financial situation or needs. Consider whether it is appropriate for you and seek independent advice before making any investment decision.",
  },
  {
    title: "Target returns.",
    body: "Figures marked TARGET are objectives set by Forward Matter. They are not forecasts, projections or guarantees and may not be achieved. They assume an 8% a year reference return for global healthcare and that each trading engine passes its gate and performs to target, which none has yet demonstrated live. The ~30% net upside is an ambition, not a promise. Actual returns may be materially lower and may be negative.",
  },
  {
    title: "Modelled results.",
    body: "Figures marked MODELLED / ILLUSTRATIVE come from a Monte Carlo simulation (2,000 paths, 6-month block bootstrap of December 2017 to September 2026 monthly history, two-state biotech regime, AUD 50% hedged, 5% fee on assets). Forward drifts are assumptions: Eli Lilly keeps 40% of its historical lead over global healthcare. They are hypothetical, have inherent limitations, are not a forecast and do not reflect actual trading.",
  },
  {
    title: "Past performance.",
    body: "Past performance, including the historical market data the simulation resamples, is not a reliable indicator of future performance. No hindsight backtest is used as a headline figure.",
  },
  {
    title: "Risks and fees.",
    body: "Listed equities and derivatives can lose all capital invested. The strategy is concentrated in healthcare and holds a disclosed conviction position in one company; clinical, regulatory and pricing events can cause sudden losses, and overnight gaps can move losses past any risk limit. Currency moves affect AUD returns. Nothing here is secured. The proposed platform and strategy fee is 5% a year of capital allocated to the strategy, to be agreed between the parties.",
  },
];

export const flow = [
  { id: "signals", title: "Signals", line: "Dates, scripts, filings and prices." },
  { id: "score", title: "Score", line: "Each engine turns a signal into a call." },
  { id: "position", title: "Position", line: "The book is sized inside the mandate." },
  { id: "rails", title: "Rails", line: "A drawdown rail, and a gate on every engine." },
] as const;

export type EngineChip = "Live" | "In testing" | "Gated";

/** One line and a status, keyed by engine id so a later pack can edit them here. */
export const engineFaces: Record<string, { chip: EngineChip; line: string }> = {
  foundation: { chip: "Live", line: "Healthcare stocks, measured against the market." },
  nowcaster: { chip: "In testing", line: "Reads the print on results day." },
  rx: { chip: "Gated", line: "Weekly scripts. The paid feed starts at A$5m." },
  catalyst: { chip: "In testing", line: "FDA days, trial changes, defined-risk options." },
  momentum: { chip: "In testing", line: "Tilts toward strength into results." },
};

export const plain = {
  loss: "Chance of a loss",
  thirty: "Chance of 30% or more",
  areit: "Chance of beating A-REITs",
  credit: "Chance of beating credit",
  fall: "1-in-10 worst fall",
  worse: "1 in 10 worse",
  lower: "Lower half",
  middle: "Middle",
  upper: "Upper half",
  better: "1 in 10 better",
  year: "Year by year",
  target: "Target",
  stored: "Stored paths",
  more: "More",
  showNote: "Show the note",
  showRules: "Show the rules",
  showGates: "Show the gates",
  showConviction: "Show the named holding",
  showNotices: "Important notices",
  showRun: "Paths and seed",
  showMethod: "Show what the paths are",
} as const;

export const guide = {
  enginesKicker: "The strategy",
  enginesTitle: "Five engines. Open one.",
  enginesLede:
    "Five layers. The Foundation picks the stocks. The Nowcaster, the Prescription Reader, the Catalyst engine and Momentum into results trade the dates. Open a card for the rule, what it holds or reads, the target, the evidence, the test and what it contributes.",
  howTitle: "Signals, then a score, then a position, then the rails.",
  howMore: "How this runs",
  toolKicker: "The simulator",
  toolTitle: "The one thing to notice here",
  toolLede:
    "The figure in the outcome is the Matter Engine strategy, opening on Conviction hybrid at A$1,000,000. The healthcare ETF, with no engine credit, is only the comparison. Changing the capital does not switch you to that baseline.",
  run: "Run the numbers",
  notes: "Screens, signals and what stays out",
  empty: "The engine notes are not in this copy of the simulator.",
  baseline: "Healthcare ETF in the same mandate, no engine credit",
  baselineSub: "Comparison only. Same capital, same horizon, no engine credit.",
} as const;

export const workspace = {
  label: "Workspace",
  views: [
    { id: "scenario", label: "Scenario" },
    { id: "engines", label: "Engine notes" },
    { id: "compare", label: "Compare" },
    { id: "backtests", label: "Backtests" },
    { id: "sources", label: "Sources" },
    { id: "method", label: "Method" },
  ],
  enginesTitle: "The detail behind the five cards.",
  enginesLede:
    "Holdings are named only where the current specification names them. The cards above are the overview. This is the rest of the book: the screens, the signals, and what stays out.",
  published: "Published figures",
  publishedNote:
    "A$10m over three years, net of the 5% fee used in the stored run. The controls above change the working scenario. They do not replace these figures.",
  bookTitle: "What is in the book",
  screenTitle: "How a name earns its place",
  signalsTitle: "Readers and data signals",
  avoidTitle: "What stays out",
  tiersTitle: "How capital is staged",
  settingsTitle: "Three settings, each a fixed rule.",
  settingsLede:
    "A and B credit the foundation. The trading engines run on paper, except the FDA Reader at 3% a trade. C is the same book at A$10m with the engines on under a stated signal assumption.",
  questionKicker: "The 30% question",
  belowKicker: "Why the forward figure sits below the history",
  scenarioPresets: "Scenario",
  presets: [
    { id: "base", label: "Base" },
    { id: "upside", label: "Upside" },
    { id: "conservative", label: "Conservative" },
    { id: "nocredit", label: "ETF comparison" },
    { id: "stress", label: "Stress" },
  ],
  fee: "Platform fee, proposed",
  feeAria: "Proposed platform fee, percent of assets. Changes the target only.",
  market: "Market reference",
  marketAria: "Healthcare market reference, percent a year. Changes the target only.",
  arithmetic: "Target arithmetic. Not a simulation.",
  gridLock:
    "Modelled paths are the stored grid: 2,000 paths a cell, seed 1, a 5% fee and an 8% healthcare reference. Moving the fee, the reference or a layer hurdle recalculates the target. It does not draw new paths.",
  stressNote: "Stress is the 10th percentile of the stored paths, and the 1-in-10 drawdown. It is not a separate simulation.",
  exportCopy: "Copy link",
  exportCsv: "Download CSV",
  exportPrint: "Print",
  copied: "Link copied",
  yearTitle: "Year by year",
  yearLede: "Each column is a percentile of the stored paths at that year-end. The path is monthly inside the fan chart.",
  yearTargetLede: "Compounded from the target rate. No distribution sits behind these figures.",
  oddsTitle: "Odds on the stored paths",
  compareTitle: "Three scenarios, same capital and horizon.",
  compareLede: "Each modelled column is a cell in the stored grid. A target column is arithmetic on the hurdles you set, and its probabilities are left blank.",
  backtestsLede:
    "Historical and head-to-head results, labelled as modelled or backtested. None of this is a live track record. The head-to-head harness is a separate run from the strategy simulator grid.",
  sourcesLede: "Data feeds and the validation register. Status words are the register's own. A completed test is not a live track record.",
  methodLede: "What the stored paths are, what the target stack is, and what neither of them claims.",
} as const;

export const benches = [
  { name: "A-REITs", sub: "S&P/ASX 200 A-REIT, assumption", value: 6, color: "var(--sim-grey)" },
  { name: "Global healthcare ETF", sub: "IXJ, 8% reference, held directly", value: 8, color: "var(--sim-cmp)" },
  { name: "Property-secured credit", sub: "Private credit, assumption", value: 10, color: "var(--sim-grey)" },
] as const;

export const attributionEngines: { key: string; name: string; sub: string }[] = [
  { key: "foundation", name: "Foundation (stock selection)", sub: "Selection credit vs an 8% healthcare drift" },
  { key: "nowcaster", name: "Nowcaster", sub: "Results-day tilts and option spreads" },
  { key: "rx", name: "Prescription Reader", sub: "Weekly script trades, net of the paid feed" },
  { key: "catalyst", name: "Catalyst engine", sub: "FDA Reader (3% a trade) and catalyst timing" },
];
