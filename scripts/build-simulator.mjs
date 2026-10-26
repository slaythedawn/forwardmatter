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
 * Optional: SIMULATOR_GRID=/path/to/grid.json
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

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pass = process.env.SIMULATOR_PASSPHRASE;
if (!pass || pass.length < 8) {
  console.error("Set SIMULATOR_PASSPHRASE (at least 8 characters) in the environment.");
  process.exit(1);
}

const gridPath = resolve(root, process.env.SIMULATOR_GRID || "simulator-src/grid.json");
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

const plain = prepared.stdout;
const parsed = JSON.parse(plain.toString("utf8"));
if (parsed?.meta?.paths !== 2000 || parsed?.meta?.seed !== 1 || !parsed?.setups?.disc) {
  console.error("The grid does not look like the Matter Engine model (paths, seed, setups).");
  process.exit(1);
}

const ITER = 200_000;
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(pass, salt, ITER, 32, "sha256");
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
const data = Buffer.concat([cipher.update(plain), cipher.final(), cipher.getAuthTag()]);

const payload = {
  v: 2,
  iter: ITER,
  salt: salt.toString("base64"),
  iv: iv.toString("base64"),
  data: data.toString("base64"),
  built: new Date().toISOString().slice(0, 10),
};
const out = resolve(root, "public/simulator/payload.json");
mkdirSync(dirname(out), { recursive: true });
const body = JSON.stringify(payload);
if (/"setups"|"sc_strong"|2017-12\.\.2026-09/.test(body)) {
  console.error("Refusing to write a payload that still contains plaintext model markers.");
  process.exit(1);
}
writeFileSync(out, body);
console.log(`Encrypted ${plain.length} bytes of model grid into public/simulator/payload.json`);
