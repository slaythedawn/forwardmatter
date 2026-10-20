/**
 * Encrypts the simulator for the password-locked /simulator page.
 *
 * The simulator itself lives in simulator-src/app.html. This script encrypts it
 * with AES-256-GCM under a key derived from the passphrase (PBKDF2, 200,000
 * rounds, SHA-256) and writes the ciphertext to public/simulator/payload.json.
 * The page fetches that file and decrypts it in the visitor's browser, so the
 * plain simulator is never served and no server-side secret is needed: it works
 * on the normal build and on the static export alike.
 *
 * The passphrase is never stored in the repository. Set it when you run this:
 *
 *   SIMULATOR_PASSPHRASE='...' npm run build:simulator
 *
 * and commit the new payload.json. Changing the passphrase is the same command
 * with a new value. Anyone holding the old passphrase can still open old copies
 * of payload.json they saved, so treat a rotation as a new file, not a revocation.
 */
import crypto from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const pass = process.env.SIMULATOR_PASSPHRASE;
if (!pass || pass.length < 8) {
  console.error("Set SIMULATOR_PASSPHRASE (at least 8 characters) in the environment.");
  process.exit(1);
}

const ITER = 200_000;
const plain = readFileSync("simulator-src/app.html");
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(pass, salt, ITER, 32, "sha256");
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
const data = Buffer.concat([cipher.update(plain), cipher.final(), cipher.getAuthTag()]);

mkdirSync("public/simulator", { recursive: true });
writeFileSync(
  "public/simulator/payload.json",
  JSON.stringify({
    v: 1,
    iter: ITER,
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
    data: data.toString("base64"),
    built: new Date().toISOString().slice(0, 10),
  }),
);
console.log(`Encrypted ${plain.length} bytes of simulator into public/simulator/payload.json`);
