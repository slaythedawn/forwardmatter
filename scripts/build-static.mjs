/**
 * Builds a flat, host-anywhere static export into `out/`.
 *
 * Two things the default build does that a static host cannot:
 *   - the /api/contact route handler, which needs a server (moved aside here, and
 *     the form falls back to its client-only success state)
 *   - absolute asset paths like /_next/..., which only resolve when the site is
 *     served from a domain root (rewritten to relative here)
 *
 * This is for sharing a preview. Deploy the default `npm run build` for real.
 */
import { execFileSync } from "node:child_process";
import { existsSync, renameSync, rmSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const API_DIR = "app/api";
const API_STASH = ".api-stash";

async function htmlFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith(".html")) found.push(path);
  }
  return found;
}

function stashApi() {
  if (existsSync(API_DIR)) {
    rmSync(API_STASH, { recursive: true, force: true });
    renameSync(API_DIR, API_STASH);
  }
}

function restoreApi() {
  if (existsSync(API_STASH)) {
    rmSync(API_DIR, { recursive: true, force: true });
    renameSync(API_STASH, API_DIR);
  }
}

stashApi();
try {
  rmSync("out", { recursive: true, force: true });
  execFileSync("npx", ["next", "build"], {
    stdio: "inherit",
    env: { ...process.env, STATIC_EXPORT: "1", NEXT_PUBLIC_STATIC_EXPORT: "1" },
  });
} finally {
  restoreApi();
}

// Next writes its bundles to `_next/`, but some static hosts reserve paths that
// begin with an underscore, so the directory is renamed and every reference to it
// rewritten. ASSET_DIR must not contain regex metacharacters.
const ASSET_DIR = "next-assets";
renameSync(join("out", "_next"), join("out", ASSET_DIR));

async function sourceFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await sourceFiles(path)));
    else if (/\.(html|js|txt)$/.test(entry.name)) found.push(path);
  }
  return found;
}

// Absolute asset references -> relative, so the export works under any path.
// Every exported page sits at the root of `out/`, so a bare relative path is right.
for (const file of await sourceFiles("out")) {
  const before = await readFile(file, "utf8");
  const after = before
    .replaceAll("/_next/", `${ASSET_DIR}/`)
    .replaceAll("_next/", `${ASSET_DIR}/`)
    .replace(/(["'(])\/(media|people|vendor)\//g, "$1$2/")
    .replace(/(["'(])\/(icon\.svg|favicon\.ico)/g, "$1$2");
  if (after !== before) await writeFile(file, after);
}

// Next ships a `noModule` legacy polyfill bundle that every browser able to run
// this site's modules ignores. It contains literal U+FFFD characters that some
// static hosts reject as corruption, so the preview build drops it.
for (const file of await sourceFiles("out")) {
  if (!file.endsWith(".html")) continue;
  const before = await readFile(file, "utf8");
  const after = before.replace(/<script[^>]*polyfills-[^>]*><\/script>/g, "");
  if (after !== before) await writeFile(file, after);
}
for (const file of await sourceFiles(join("out", ASSET_DIR))) {
  if (/\/polyfills-[^/]*\.js$/.test(file)) rmSync(file);
}

console.log(`\nStatic export written to out/ (bundles under out/${ASSET_DIR})`);
