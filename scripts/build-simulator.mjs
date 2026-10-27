/**
 * Encrypts the Matter Engine model grid for /simulator.
 *
 * The grid is local and git-ignored (simulator-src/grid.json by default).
 * This script prepares display strings, then encrypts the JSON with
 * AES-256-GCM. The key is PBKDF2 (200,000 rounds, SHA-256) of the access
 * phrase. The phrase is read from the environment and is never written here.
 *
 *   SIMULATOR_PASSPHRASE='...' npm run build:simulator
 *
 * Optional: SIMULATOR_GRID=/path/to/grid-lly20.json
 * Optional: SIMULATOR_GRID_FALLBACK=/path/to/grid-lly15.json
 * Optional: SIMULATOR_EVIDENCE=/path/to/evidence.json
 * Optional: SIMULATOR_PASSPHRASE_FILE=/path/to/phrase (mode 0600). The phrase is not printed.
 *
 * Commit the new public/simulator/payload.json. Anyone who kept an older
 * payload can still open it with the phrase it was built with. A new file
 * is not a revocation of an old one.
 */
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function alignEvidence(evidence) {
  const foundation = evidence.engines?.find((engine) => engine.id === "foundation");
  if (foundation) {
    foundation.status = "Built · validating. Next test: F-2 not yet run.";
    foundation.weight =
      "Setting A: a 20% dedicated Lilly sleeve and the rest core, 1.0× gross, 15% cash. Lilly is about 22% of fund capital. Setting B: the same mix at up to 1.2×, where Lilly is about 31% of fund capital. The 7.5% loss budget is a share of fund capital. It applies to the dedicated sleeve only and is checked at month-end. If it is reached, the sleeve is halved and stays at the halved target. Lilly held inside the core does not count toward the budget. The 30% ceiling counts all Lilly, including the holding inside the core. It is checked at every month-end, and the sleeve is reset to its target at the annual rebalance. Per-name cap 7.5%, except this sleeve.";
    foundation.rebalance =
      "Quarterly, and after each dated event in a held name. The Lilly sleeve is reset to its target at the annual rebalance. Its 30% ceiling and its 7.5% loss budget are checked at month-end.";
    foundation.target =
      "+5 to +10 points a year above an 8% global healthcare reference, F-2 not yet run. Base +6.5, upside +10. Foundation only: 14.5% gross, 8.8% net of the 5% fee.";
    foundation.evidence =
      "F-2 has not been run. The selection rules face a pre-registered point-in-time test on a frozen, survivor-free universe. Until that test is run, the simulator credits only the haircut share of history. Earlier point-in-time tests of simpler selection landed about level with the sector.";
    foundation.contribution =
      "Settings A and B are foundation outcomes. The FDA Reader's small trades add about 0.5 points in the modelled figure. Nowcaster and the Prescription Reader are credited nothing there.";
  }
  const nowcaster = evidence.engines?.find((engine) => engine.id === "nowcaster");
  if (nowcaster) {
    nowcaster.status = "Built · validating";
    nowcaster.weight =
      "A tilt of up to half the sleeve, inside the exposure ceiling. An optional call or put spread is capped at 1.5% of NAV premium per results day.";
  }
  const rx = evidence.engines?.find((engine) => engine.id === "rx");
  if (rx) rx.status = "Unlocks at A$5m";
  const catalyst = evidence.engines?.find((engine) => engine.id === "catalyst");
  if (catalyst) {
    catalyst.name = "Catalyst";
    catalyst.status = "Built · validating. Only post-cut-off FDA meetings count.";
    catalyst.evidence +=
      " The 64–67% reading of past documents is an upper bound, because the model may recall outcomes. Only meetings after the training cut-off count toward the gate. Timing the run-up did not repeat. None of eight readout rules passed on 4,112 events.";
  }
  const momentum = evidence.engines?.find((engine) => engine.id === "momentum");
  if (momentum) {
    momentum.name = "Momentum";
    momentum.status = "Built · validating";
    momentum.evidence +=
      " The result is only modestly above chance. Judged after a multiple-testing correction, it misses the 27-test bar.";
    momentum.contribution =
      "It is built and in validation under pre-registered rules. The modelled figure does not give it a separate row, so the card shows its target. Counted in the modelled figure once its test passes. Its points appear in the target stack only when the layer is switched on, and that line is arithmetic, not a new set of paths. Eight rails plus a human veto sit over the book.";
  }
  const holding = evidence.book?.holdings?.[0];
  if (holding) {
    holding.weight =
      "A 20% dedicated sleeve, about 25% look-through of the invested book. As a share of fund capital, Lilly is about 22% in the disciplined setting and about 31% in the leveraged setting. The 7.5% loss budget is a share of fund capital. It applies to the dedicated sleeve only and is checked at month-end. If it is reached, the sleeve is halved and stays at the halved target. Lilly held inside the core does not count toward the budget. The 30% ceiling counts all Lilly, including the holding inside the core. It is checked at every month-end, and the sleeve is reset to its target at the annual rebalance. 15% is the conservative fallback. Every other name is capped at 7.5%.";
    if (typeof holding.exits === "string") {
      holding.exits = holding.exits
        .replace(
          "The committee reviews within one business day and the position is cut to the 7.5% cap unless the thesis is re-underwritten. ",
          "The committee reviews a broken thesis, and the position is cut to the 7.5% cap unless the thesis is re-underwritten. ",
        )
        .replace(
          "Risk: the loss budget, agreed between the parties before the first allocation, or the portfolio drawdown rail, halves the position first.",
          "Risk: the 7.5% loss budget applies to the dedicated sleeve only and is checked at month-end. If it is reached, the sleeve is halved and stays at the halved target. Eight rails plus a human veto can also halve exposure. One rail does that after a −25% fall.",
        );
    }
  }
  const g1 = evidence.register?.find((row) => row.id === "G-1");
  if (g1) {
    g1.rule = "Ten fresh seeds of 1,000 paths each on the 20% sleeve.";
    g1.result =
      "Disciplined 10.9–11.6%, hybrid 13.9–14.7%. No seed moves a median more than 0.5 points.";
  }
  const f3 = evidence.register?.find((row) => row.id === "F-3");
  if (f3) {
    f3.result = "Disciplined 8.9%, hybrid 11.1% net (modelled)";
  }
  const seeds = evidence.studies?.find((study) => study.id === "seeds");
  if (seeds) {
    seeds.caveat =
      "Modelled. The rows above are an earlier harness. The strategy simulator's own seed check, recorded as G-1, is ten fresh seeds of 1,000 paths each on the 20% sleeve: medians of 10.9–11.6% for disciplined and 13.9–14.7% for the hybrid, and no seed moving a median more than 0.5 points.";
  }
  if (evidence.brief?.points) {
    evidence.brief.points = evidence.brief.points.map((point) => {
      if (point.includes("12.5%")) {
        return "A mechanical name, the large-pharma stock with the best 12-to-1 month momentum each November, takes the disciplined median from 11.3% to 8.9% and the conviction hybrid from 14.4% to 11.1%. That gap is the conviction sleeve. It is a judgement, which is why it is named, sized and given its own loss budget.";
      }
      if (point.includes("keep 40%")) {
        return `${point} At A$1m the haircut line is 11.3 / 10.2 / 9.2% for disciplined and 14.4 / 12.9 / 11.3% for the hybrid.`;
      }
      return point;
    });
  }
  const walk = (value) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "string") value[index] = publicPhrase(item);
        else walk(item);
      });
      return;
    }
    if (value && typeof value === "object") Object.keys(value).forEach((key) => {
      const next = value[key];
      if (typeof next === "string") value[key] = publicPhrase(next);
      else walk(next);
    });
  };
  walk(evidence);
}

function publicPhrase(text) {
  return text
    .replaceAll("Stored paths", "Modelled")
    .replaceAll("stored paths", "modelled paths")
    .replaceAll("Stored path", "Modelled path")
    .replaceAll("stored path", "modelled path")
    .replaceAll("Event bots", "Event engines")
    .replaceAll("no bots", "no engines")
    .replaceAll("The bots see", "The engines see")
    .replaceAll("Same bot design", "Same engine design")
    .replaceAll("NVO fell about 80%", "Novo Nordisk fell about 75%")
    .replaceAll("from day one", "before it carries capital")
    .replaceAll("Catalyst engine", "Catalyst")
    .replaceAll("Momentum into results", "Momentum")
    .replaceAll("The rails act on the engines and on strategy exposure.", "Eight rails plus a human veto act on the engines and on strategy exposure.")
    .replaceAll("inside the per-name caps and the rails.", "inside the per-name caps, with eight rails plus a human veto.")
    .replaceAll("on paper", "in validation")
    .replaceAll("paper gate", "next test")
    .replaceAll("paper record", "validation record")
    .replaceAll("Paper calls", "Validation calls")
    .replaceAll("Paper record", "Validation record")
    .replaceAll("Paper inputs", "Validation inputs")
    .replaceAll("Paper only", "Validation only")
    .replaceAll("Paper.", "In validation.")
    .replaceAll("returns it to paper", "returns it to validation")
    .replaceAll("returns to paper", "returns to validation")
    .replaceAll("paper only", "validation only")
    .replaceAll("paper test", "validation test")
    .replaceAll("Kept as paper", "Kept in validation")
    .replaceAll("first paper record", "first validation record")
    .replaceAll("run on paper", "run in validation")
    .replaceAll("stay gated", "stay in validation")
    .replaceAll("stays gated", "stays in validation")
    .replaceAll("gated", "in validation")
    .replaceAll(
      "These medians are not the strategy simulator's 12.5%, 16.3% and 22.6%.",
      "These medians are not the strategy simulator's 11.3% disciplined, 14.4% hybrid, or 18.7% strong at A$10m.",
    )
    .replaceAll(
      "It is not the strategy simulator's disciplined 12.5%.",
      "It is not the strategy simulator's disciplined 11.3%.",
    );
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pass = process.env.SIMULATOR_PASSPHRASE || (process.env.SIMULATOR_PASSPHRASE_FILE ? readFileSync(process.env.SIMULATOR_PASSPHRASE_FILE, "utf8").trim() : "");
if (!pass || pass.length < 8) {
  console.error("Set SIMULATOR_PASSPHRASE (at least 8 characters) in the environment.");
  process.exit(1);
}

function prepareGrid(gridPath) {
  let raw;
  try {
    raw = readFileSync(gridPath);
  } catch {
    console.error(`Could not read the model grid at ${gridPath}.`);
    console.error("Place the grid there (it is git-ignored) or set SIMULATOR_GRID.");
    process.exit(1);
  }
  const prepared = spawnSync("python3", [resolve(root, "scripts/prepare-grid.py")], {
    input: raw,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (prepared.status !== 0) {
    console.error(prepared.stderr?.toString() || "prepare-grid.py failed");
    process.exit(prepared.status || 1);
  }
  const grid = JSON.parse(prepared.stdout.toString("utf8"));
  if (grid?.meta?.paths !== 2000 || grid?.meta?.seed !== 1 || !grid?.setups?.disc) {
    console.error("The grid does not look like the Matter Engine model (paths, seed, setups).");
    process.exit(1);
  }
  return grid;
}

const gridPath = resolve(root, process.env.SIMULATOR_GRID || "simulator-src/grid.json");
const preparedGrid = prepareGrid(gridPath);
const fallbackPath = process.env.SIMULATOR_GRID_FALLBACK;
const fallbackGrid = fallbackPath ? prepareGrid(resolve(root, fallbackPath)) : null;
if (fallbackGrid && !(fallbackGrid.meta?.lly_w < preparedGrid.meta?.lly_w)) {
  console.error("The fallback grid must be the smaller Lilly sleeve.");
  process.exit(1);
}

const evidencePath = resolve(root, process.env.SIMULATOR_EVIDENCE || "simulator-src/evidence.json");
let evidence;
try {
  evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
} catch {
  console.error(`Could not read the evidence file at ${evidencePath}.`);
  console.error("Place it there (it is git-ignored) or set SIMULATOR_EVIDENCE.");
  process.exit(1);
}
if (!evidence?.studies || !evidence?.register || !evidence?.method?.points) {
  console.error("The evidence file is missing studies, the register or the method.");
  process.exit(1);
}
if (!Array.isArray(evidence.engines) || evidence.engines.length < 5 || !evidence.book?.holdings?.length) {
  console.error("The evidence file is missing the engine dossiers or the foundation book.");
  process.exit(1);
}
alignEvidence(evidence);
const evidenceText = JSON.stringify(evidence);
if (/greenlink|performance fee|your firm|\bthe fund\b|\bAFSL\b|\bHMC\b/i.test(evidenceText)) {
  console.error("Refusing to encrypt evidence that breaks the public copy rules.");
  process.exit(1);
}

const plain = Buffer.from(JSON.stringify({ grid: preparedGrid, evidence, fallback: fallbackGrid }));

const ITER = 200_000;
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(pass, salt, ITER, 32, "sha256");
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
const data = Buffer.concat([cipher.update(plain), cipher.final(), cipher.getAuthTag()]);

const payload = {
  v: 3,
  iter: ITER,
  salt: salt.toString("base64"),
  iv: iv.toString("base64"),
  data: data.toString("base64"),
  built: new Date().toISOString().slice(0, 10),
};
const out = resolve(root, "public/simulator/payload.json");
mkdirSync(dirname(out), { recursive: true });
const body = JSON.stringify(payload);
if (/"setups"|"sc_strong"|2017-12\.\.2026-09|greenlink|performance fee/i.test(body)) {
  console.error("Refusing to write a payload that still contains plaintext model markers.");
  process.exit(1);
}
writeFileSync(out, body);
console.log(`Encrypted ${plain.length} bytes of model grid and evidence into public/simulator/payload.json`);
