// Engine fixture runner: bundles src/lib/saju-engine.ts with the esbuild that
// ships via vite (no new dependencies) and asserts tests/engine-fixtures.json.
// Usage: npm run test:engine
import { buildSync } from 'esbuild';
import { readFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.cache/saju-test');
mkdirSync(outDir, { recursive: true });
const outfile = resolve(outDir, 'saju-engine.mjs');

buildSync({
  entryPoints: [resolve(root, 'src/lib/saju-engine.ts')],
  bundle: true,
  format: 'esm',
  outfile,
  logLevel: 'silent',
});

const { computeSaju } = await import(pathToFileURL(outfile).href);
const { cases } = JSON.parse(readFileSync(resolve(root, 'tests/engine-fixtures.json'), 'utf8'));

let pass = 0, fail = 0, pending = 0;
for (const c of cases) {
  if (c.status === 'pending') { pending++; continue; }
  const r = computeSaju(c.input);
  const errors = [];
  for (const [role, expected] of Object.entries(c.expect)) {
    const actual = r[role]?.hanja ?? '(null)';
    if (actual !== expected) errors.push(`${role}: expected ${expected}, got ${actual}`);
  }
  if (errors.length) {
    fail++;
    console.error(`✗ ${c.name}`);
    for (const e of errors) console.error(`    ${e}`);
  } else {
    pass++;
    console.log(`✓ ${c.name}`);
  }
}

console.log(`\n${pass} passed, ${fail} failed, ${pending} pending KASI verification (see KASI-CHECKLIST.md)`);
if (fail > 0) process.exit(1);
