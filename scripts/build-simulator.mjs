/**
 * Encrypts the simulator for the password-locked /simulator page.
 *
 * The simulator itself lives in simulator-src/app.html. This script encrypts it once
 * with a random content key (AES-256-GCM), then locks a copy of that key under each
 * access phrase (key derived by PBKDF2, 200,000 rounds, SHA-256). The result is
 * public/simulator/payload.json. The page fetches it and, in the visitor's browser,
 * tries the phrase entered against each locked copy, so the plain simulator is never
 * served and no server-side secret is needed.
 *
 * One phrase per person or group, from the environment, never stored in the repository:
 *
 *   SIMULATOR_PASSPHRASE='...' SIMULATOR_PASSPHRASE2='...' npm run build:simulator
 *
 * Every variable named SIMULATOR_PASSPHRASE, SIMULATOR_PASSPHRASE2, SIMULATOR_PASSPHRASE3
 * and so on is used. To remove someone's access, remove their variable, rebuild and commit
 * the new payload.json. Anyone holding an old payload.json and an old phrase can still open
 * that old copy, so treat removal as stopping future versions, not as a revocation.
 */
import crypto from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const names = Object.keys(process.env)
  .filter((k) => /^SIMULATOR_PASSPHRASE\d*$/.test(k))
  .sort((a, b) => (Number(a.slice(20)) || 1) - (Number(b.slice(20)) || 1));
const phrases = names.map((k) => process.env[k] ?? "");
if (!phrases.length || phrases.some((p) => p.length < 8)) {
  console.error("Set SIMULATOR_PASSPHRASE (and optionally SIMULATOR_PASSPHRASE2, 3, ...), each at least 8 characters.");
  process.exit(1);
}
if (new Set(phrases).size !== phrases.length) {
  console.error("Two of the SIMULATOR_PASSPHRASE variables hold the same phrase; give each person their own.");
  process.exit(1);
}

const ITER = 200_000;
const seal = (key, plain) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(plain), cipher.final(), cipher.getAuthTag()]);
  return { iv: iv.toString("base64"), data: data.toString("base64") };
};

const plain = readFileSync("simulator-src/app.html");
const contentKey = crypto.randomBytes(32);
const body = seal(contentKey, plain);
const keys = phrases.map((phrase) => {
  const salt = crypto.randomBytes(16);
  const wrapped = seal(crypto.pbkdf2Sync(phrase, salt, ITER, 32, "sha256"), contentKey);
  return { salt: salt.toString("base64"), iv: wrapped.iv, key: wrapped.data };
});

mkdirSync("public/simulator", { recursive: true });
writeFileSync(
  "public/simulator/payload.json",
  JSON.stringify({ v: 2, iter: ITER, iv: body.iv, data: body.data, keys, built: new Date().toISOString().slice(0, 10) }),
);
console.log(`Encrypted ${plain.length} bytes of simulator for ${keys.length} access phrase(s) (${names.join(", ")}) into public/simulator/payload.json`);
