/**
 * Shape of the evidence bundled with the encrypted model grid.
 * The register, studies and method text are not stored in this file.
 */

export type StudyKind = "modelled" | "backtested";

export type StudyRow = { name: string; cells: string[] };

export type Study = {
  id: string;
  kind: StudyKind;
  title: string;
  period: string;
  rules: string;
  sample: string;
  columns: string[];
  rows: StudyRow[];
  caveat: string;
};

export type RegisterRow = {
  id: string;
  engine: string;
  test: string;
  rule: string;
  result: string;
  status: string;
  next: string;
};

export type SourceRow = {
  id: string;
  feed: string;
  source: string;
  refresh: string;
  usedBy: string;
  cost: string;
};

export type RuleRow = { id: string; signal: string; trade: string; status: string };

export type ScreenRow = { id: string; name: string; test: string };

export type Holding = { name: string; role: string; weight: string; why: string; exits: string };

export type EngineDossier = {
  id: string;
  code: string;
  name: string;
  status: string;
  weight: string;
  rule: string;
  rebalance: string;
  does: string;
  target: string;
  evidence: string;
  contribution: string;
};

export type SignalRow = { name: string; method: string; result: string; status: string };

export type Tier = { range: string; title: string; points: string[] };

export type Evidence = {
  asOf: string;
  method: { title: string; points: string[]; credited: string[]; notCredited: string[] };
  sources: SourceRow[];
  register: RegisterRow[];
  rules: RuleRow[];
  studies: Study[];
  brief: { questionTitle: string; question: string; belowTitle: string; below: string; points: string[] };
  book: { intro: string; screen: ScreenRow[]; holdings: Holding[]; unpublished: string };
  engines: EngineDossier[];
  signals: SignalRow[];
  avoid: string[];
  tiers: Tier[];
};

const BANNED = [/greenlink/i, /performance fee/i, /\byour firm\b/i, /\bour fund\b/i, /\bthe fund\b/i, /\bAFSL\b/, /\bHMC\b/];

export function evidenceTextOk(value: unknown): boolean {
  const text = JSON.stringify(value);
  return BANNED.every((pattern) => !pattern.test(text));
}

export function isEvidence(value: unknown): value is Evidence {
  if (!value || typeof value !== "object") return false;
  const evidence = value as Evidence;
  if (!evidence.method || !Array.isArray(evidence.method.points) || evidence.method.points.length < 3) return false;
  if (!Array.isArray(evidence.sources) || evidence.sources.length < 5) return false;
  if (!Array.isArray(evidence.register) || evidence.register.length < 10) return false;
  if (!Array.isArray(evidence.rules) || evidence.rules.length < 10) return false;
  if (!Array.isArray(evidence.studies) || evidence.studies.length < 2) return false;
  const kinds = new Set(evidence.studies.map((study) => study.kind));
  if (!kinds.has("modelled") || !kinds.has("backtested")) return false;
  for (const study of evidence.studies) {
    if (!study.title || !study.period || !study.rules || !Array.isArray(study.rows) || study.rows.length < 1) return false;
    if (study.columns.length < 1) return false;
  }
  if (!evidence.brief || !Array.isArray(evidence.brief.points) || evidence.brief.points.length < 3 || !evidence.brief.question || !evidence.brief.below) return false;
  if (!evidence.book || !Array.isArray(evidence.book.screen) || evidence.book.screen.length < 6 || !Array.isArray(evidence.book.holdings) || evidence.book.holdings.length < 1) return false;
  if (!Array.isArray(evidence.engines) || evidence.engines.length < 5) return false;
  for (const engine of evidence.engines) {
    if (!engine.id || !engine.name || !engine.does || !engine.rule || !engine.target || !engine.evidence || !engine.status) return false;
  }
  if (!Array.isArray(evidence.signals) || evidence.signals.length < 4) return false;
  if (!Array.isArray(evidence.avoid) || evidence.avoid.length < 4) return false;
  if (!Array.isArray(evidence.tiers) || evidence.tiers.length < 3) return false;
  return evidenceTextOk(evidence);
}
