/**
 * Mutazione dei controlli della busta di run (OrganizationRunEnvelopeSchema): ogni scenario toglie UN controllo dal
 * sorgente, esegue il file di test che lo copre e pretende che fallisca. Un mutante sopravvissuto = un controllo senza prova.
 * Uso: node tests/organization/organization-run-envelope.mutation.mjs   (dalla radice del ponte; ripristina sempre il sorgente)
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const SOURCE = 'src/organization/tool-call-correlation.ts';
const TEST = 'tests/organization/tool-call-correlation.test.ts';

const scenarios = [
  {
    id: 'envelope-strict',
    file: SOURCE,
    test: TEST,
    anchor: 'OrganizationRunEnvelopeSchema = z.strictObject({',
    replacement: 'OrganizationRunEnvelopeSchema = z.object({',
  },
  {
    id: 'envelope-tenant-min',
    file: SOURCE,
    test: TEST,
    anchor: "  context: OrganizationRunContextSchema,\n  tenantId: z.string().min(1),",
    replacement: '  context: OrganizationRunContextSchema,\n  tenantId: z.string(),',
  },
  {
    id: 'envelope-context-schema',
    file: SOURCE,
    test: TEST,
    anchor: '  context: OrganizationRunContextSchema,\n',
    replacement: '  context: z.unknown(),\n',
  },
];

const run = (test) => spawnSync('npx', ['vitest', 'run', test, '--testTimeout=60000'], { cwd: root, encoding: 'utf8' });
const originals = new Map();
const restore = () => { for (const [file, text] of originals) writeFileSync(join(root, file), text); };
process.on('SIGINT', () => { restore(); process.exit(130); });
process.on('SIGTERM', () => { restore(); process.exit(143); });

const survivors = [];
try {
  for (const test of new Set(scenarios.map((s) => s.test))) {
    const baseline = run(test);
    assert.equal(baseline.status, 0, `baseline must pass: ${test}\n${baseline.stdout}${baseline.stderr}`);
  }
  for (const scenario of scenarios) {
    const path = join(root, scenario.file);
    const original = originals.get(scenario.file) ?? readFileSync(path, 'utf8');
    originals.set(scenario.file, original);
    assert.equal(original.split(scenario.anchor).length, 2, `anchor must be unique: ${scenario.id}`);
    writeFileSync(path, original.replace(scenario.anchor, () => scenario.replacement));
    const result = run(scenario.test);
    writeFileSync(path, original);
    const killed = result.status !== 0 && /FAIL|Failed Tests/.test(`${result.stdout}${result.stderr}`);
    console.log(`${killed ? 'killed  ' : 'SURVIVED'} ${scenario.id}`);
    if (!killed) survivors.push(scenario.id);
  }
} finally {
  restore();
}
console.log(`${scenarios.length - survivors.length}/${scenarios.length} killed`);
if (survivors.length > 0) {
  console.error(`survivors: ${survivors.join(', ')}`);
  process.exit(1);
}
