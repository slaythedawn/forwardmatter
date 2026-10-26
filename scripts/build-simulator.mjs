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
    foundation.status = "F-2 not yet run";
    foundation.weight =
      "Setting A: 20% Lilly sleeve and the rest core, 1.0× gross, 15% cash. Setting B: the same mix at up to 1.2×. Look-through is about 25% of the invested book, trimmed above 30%. A loss of 7.5% of NAV halves the sleeve. Per-name cap 7.5%, except this sleeve.";
    foundation.target =
      "+5 to +10 points a year above an 8% global healthcare reference, F-2 not yet run. Base +6.5, upside +10. Foundation only: 14.5% gross, 8.8% net of the 5% fee.";
    foundation.evidence =
      "F-2 has not been run. The selection rules face a pre-registered point-in-time test on a frozen, survivor-free universe. Until that test is run, the simulator credits only the haircut share of history. Earlier point-in-time tests of simpler selection landed about level with the sector.";
    foundation.contribution =
      "Settings A and B are foundation outcomes. The FDA Reader's small trades add about 0.5 points in those stored paths. Nowcaster and the Prescription Reader are credited nothing there.";
  }
  const nowcaster = evidence.engines?.find((engine) => engine.id === "nowcaster");
  if (nowcaster) {
    nowcaster.weight =
      "A tilt of up to half the sleeve, inside the exposure ceiling. An optional call or put spread is capped at 1.5% of NAV premium per results day.";
  }
  const catalyst = evidence.engines?.find((engine) => engine.id === "catalyst");
  if (catalyst) {
    catalyst.name = "Catalyst";
    catalyst.status = "Timing tests have not passed. FDA calls after the training cut-off are the gate.";
    catalyst.evidence +=
      " The 64–67% reading of past documents is an upper bound, because the model may recall outcomes. Only meetings after the training cut-off count toward the gate. Timing the run-up did not repeat. None of eight readout rules passed on 4,112 events.";
  }
  const momentum = evidence.engines?.find((engine) => engine.id === "momentum");
  if (momentum) {
    momentum.name = "Momentum";
    momentum.status = "Modest, after a multiple-testing correction";
    momentum.evidence +=
      " The result is only modestly above chance. Judged after a multiple-testing correction, it misses the 27-test bar.";
    momentum.contribution =
      "It runs on paper under pre-registered rules. The stored grid does not give it a separate attribution row. In settings A and B it is credited nothing. Its points appear in the target stack only when the layer is switched on, and that line is arithmetic, not a new set of paths.";
  }
  const holding = evidence.book?.holdings?.[0];
  if (holding) {
    holding.weight =
      "A 20% dedicated sleeve, about 25% look-through of the invested book. Trimmed if look-through goes above 30%. A loss of 7.5% of NAV from its high halves the position. 15% is the conservative fallback. Every other name is capped at 7.5%.";
  }
  if (evidence.brief?.points) {
    evidence.brief.points = evidence.brief.points.map((point) =>
      point.includes("12.5%")
        ? "A mechanical name, the large-pharma stock with the best 12-to-1 month momentum each November, takes the disciplined median from 11.3% to 8.9% and the conviction hybrid from 14.4% to 11.1%. That gap is the conviction sleeve. It is a judgement, which is why it is named, sized and given its own loss budget."
        : point,
    );
  }
  const walk = (value) => {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.forEach(walk);
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
    .replaceAll("Event bots", "Event engines")
    .replaceAll("no bots", "no engines")
    .replaceAll("The bots see", "The engines see")
    .replaceAll("Same bot design", "Same engine design")
    .replaceAll("NVO fell about 80%", "Novo Nordisk fell about 75%")
    .replaceAll("from day one", "before it carries capital")
    .replaceAll("Catalyst engine", "Catalyst")
    .replaceAll("Momentum into results", "Momentum");
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
