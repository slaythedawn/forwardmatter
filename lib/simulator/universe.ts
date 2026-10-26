/**
 * Foundation reference universe. Tickers, companies, exchanges, sub-sectors
 * and sleeves only. Launch weights from the older A$10m list are not stored.
 */

export type UniverseSleeve = "Core" | "Momentum" | "Next-wave" | "Quality" | "Defensive" | "Event" | "Watch list";

export type ModelTag = "" | "In modelled backtest" | "Modelled basket";

export type UniverseName = {
  ticker: string;
  company: string;
  exchange: string;
  subSector: string;
  sleeve: UniverseSleeve;
  tag: ModelTag;
};

export const UNIVERSE_SLEEVES: readonly UniverseSleeve[] = [
  "Core",
  "Momentum",
  "Next-wave",
  "Quality",
  "Defensive",
  "Event",
  "Watch list",
];

/** Names the equal-weight v4 baskets actually trade, apart from the three added below. */
const IN_MODELLED_BACKTEST = new Set([
  "LLY",
  "ABBV",
  "VRTX",
  "ARGX",
  "AMGN",
  "INSM",
  "MDGL",
  "ALNY",
  "NTRA",
  "VKTX",
  "TLX.AX",
  "MCK",
  "COR",
  "PME.AX",
  "HCA",
  "JNJ",
  "NOVN.SW",
]);

const REFERENCE: Omit<UniverseName, "tag">[] = [
  { ticker: "LLY", company: "Eli Lilly", exchange: "NYSE", subSector: "Large pharma (obesity/GLP-1)", sleeve: "Core" },
  { ticker: "AMGN", company: "Amgen", exchange: "NASDAQ", subSector: "Large biotech (obesity)", sleeve: "Core" },
  { ticker: "VRTX", company: "Vertex", exchange: "NASDAQ", subSector: "Large biotech (cystic fibrosis)", sleeve: "Core" },
  { ticker: "ARGX", company: "argenx", exchange: "NASDAQ", subSector: "Biotech (immunology, FcRn)", sleeve: "Core" },
  { ticker: "ABBV", company: "AbbVie", exchange: "NYSE", subSector: "Large pharma (immunology)", sleeve: "Core" },
  { ticker: "REGN", company: "Regeneron", exchange: "NASDAQ", subSector: "Large biotech (antibodies)", sleeve: "Core" },
  { ticker: "PRAX", company: "Praxis Precision Medicines", exchange: "NASDAQ", subSector: "Biotech", sleeve: "Momentum" },
  { ticker: "MRNA", company: "Moderna", exchange: "NASDAQ", subSector: "Biotech (mRNA)", sleeve: "Momentum" },
  { ticker: "TXG", company: "10x Genomics", exchange: "NASDAQ", subSector: "Life-science tools", sleeve: "Momentum" },
  { ticker: "SYRE", company: "Spyre Therapeutics", exchange: "NASDAQ", subSector: "Biotech", sleeve: "Momentum" },
  { ticker: "TWST", company: "Twist Bioscience", exchange: "NASDAQ", subSector: "Life-science tools", sleeve: "Momentum" },
  { ticker: "ORKA", company: "Oruka Therapeutics", exchange: "NASDAQ", subSector: "Biotech", sleeve: "Momentum" },
  { ticker: "RVMD", company: "Revolution Medicines", exchange: "NASDAQ", subSector: "Biotech (oncology)", sleeve: "Momentum" },
  { ticker: "IOVA", company: "Iovance Biotherapeutics", exchange: "NASDAQ", subSector: "Biotech (cell therapy)", sleeve: "Momentum" },
  { ticker: "IBRX", company: "ImmunityBio", exchange: "NASDAQ", subSector: "Biotech (immuno-oncology)", sleeve: "Momentum" },
  { ticker: "GH", company: "Guardant Health", exchange: "NASDAQ", subSector: "Diagnostics", sleeve: "Momentum" },
  { ticker: "NTRA", company: "Natera", exchange: "NASDAQ", subSector: "Diagnostics (cell-free DNA)", sleeve: "Next-wave" },
  { ticker: "INSM", company: "Insmed", exchange: "NASDAQ", subSector: "Biotech (respiratory)", sleeve: "Next-wave" },
  { ticker: "MDGL", company: "Madrigal", exchange: "NASDAQ", subSector: "Biotech (MASH)", sleeve: "Next-wave" },
  { ticker: "TLX.AX", company: "Telix", exchange: "ASX", subSector: "Radiopharmaceuticals", sleeve: "Next-wave" },
  { ticker: "VKTX", company: "Viking", exchange: "NASDAQ", subSector: "Biotech (obesity)", sleeve: "Next-wave" },
  { ticker: "ALNY", company: "Alnylam", exchange: "NASDAQ", subSector: "Biotech (RNAi)", sleeve: "Next-wave" },
  { ticker: "RYTM", company: "Rhythm", exchange: "NASDAQ", subSector: "Biotech (rare obesity)", sleeve: "Next-wave" },
  { ticker: "XLV", company: "Health Care Select Sector SPDR", exchange: "NYSE Arca", subSector: "Healthcare ETF, event-sleeve parking", sleeve: "Event" },
  { ticker: "MCK", company: "McKesson", exchange: "NYSE", subSector: "Drug distribution", sleeve: "Quality" },
  { ticker: "MEDP", company: "Medpace", exchange: "NASDAQ", subSector: "CRO", sleeve: "Quality" },
  { ticker: "PME.AX", company: "Pro Medicus", exchange: "ASX", subSector: "Health IT (imaging software)", sleeve: "Quality" },
  { ticker: "COR", company: "Cencora", exchange: "NYSE", subSector: "Drug distribution", sleeve: "Quality" },
  { ticker: "HCA", company: "HCA Healthcare", exchange: "NYSE", subSector: "Hospitals", sleeve: "Quality" },
  { ticker: "JNJ", company: "Johnson & Johnson", exchange: "NYSE", subSector: "Large diversified pharma", sleeve: "Defensive" },
  { ticker: "MRK", company: "Merck", exchange: "NYSE", subSector: "Large pharma", sleeve: "Defensive" },
  { ticker: "NOVN.SW", company: "Novartis", exchange: "SIX Swiss", subSector: "Large pharma", sleeve: "Defensive" },
  { ticker: "", company: "Lonza", exchange: "", subSector: "Peptide and biologics manufacturing (CDMO)", sleeve: "Watch list" },
  { ticker: "", company: "Bachem", exchange: "", subSector: "Peptide API manufacturing", sleeve: "Watch list" },
  { ticker: "", company: "Novo Nordisk", exchange: "", subSector: "Large pharma (obesity)", sleeve: "Watch list" },
  { ticker: "", company: "Pfizer", exchange: "", subSector: "Large pharma", sleeve: "Watch list" },
  { ticker: "", company: "CSL", exchange: "", subSector: "Plasma and biotech", sleeve: "Watch list" },
  { ticker: "", company: "UnitedHealth", exchange: "", subSector: "Managed care", sleeve: "Watch list" },
];

/** In the modelled baskets, and not on the reference list. */
const MODEL_ONLY: Omit<UniverseName, "tag">[] = [
  { ticker: "GPCR", company: "Structure Therapeutics", exchange: "NASDAQ", subSector: "Biotech (oral GLP-1)", sleeve: "Next-wave" },
  { ticker: "ISRG", company: "Intuitive Surgical", exchange: "NASDAQ", subSector: "Surgical robotics", sleeve: "Quality" },
  { ticker: "AZN", company: "AstraZeneca", exchange: "NASDAQ", subSector: "Large pharma", sleeve: "Defensive" },
];

function tagFor(ticker: string, modelOnly: boolean): ModelTag {
  if (modelOnly) return "Modelled basket";
  return IN_MODELLED_BACKTEST.has(ticker) ? "In modelled backtest" : "";
}

export const UNIVERSE: readonly UniverseName[] = [
  ...REFERENCE.map((row) => ({ ...row, tag: tagFor(row.ticker, false) })),
  ...MODEL_ONLY.map((row) => ({ ...row, tag: tagFor(row.ticker, true) })),
];

/** Stocks the foundation can own. Excludes the event-sleeve ETF and the watch list. */
export function ownableNames(rows: readonly UniverseName[] = UNIVERSE): UniverseName[] {
  return rows.filter((row) => row.sleeve !== "Watch list" && row.sleeve !== "Event");
}

export const TESTED_UNIVERSE = 996;
export const DELISTED_IN_TEST = 319;
