// Synthetic checks for the generic route needed by cap-meditation B3.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const path = resolve(root, 'src/http/endpoints/cap-tool-call.ts');
const original = readFileSync(path, 'utf8');
const cases = [
  ['remove path bounds', '.regex(/^[a-z][a-z0-9_]{0,127}$/)', ''],
  ['skip path validation', 'CapToolCallParamsSchema.parse({ tool }).tool', 'tool'],
  ['unresolved parameter', "capToolCallContract.path.replace(':tool', CapToolCallParamsSchema.parse({ tool }).tool)", 'capToolCallContract.path'],
  ['drift route', "path: '/call/:tool'", "path: '/changed/:tool'"],
  ['drift method', "method: 'POST'", "method: 'GET'"],
  ['remove authentication', "authType: 'secret'", "authType: 'none'"],
  ['wrong request schema', 'bodySchema: ToolCallRequestSchema', 'bodySchema: ToolCallResponseSchema'],
  ['wrong response schema', 'responseSchema: ToolCallResponseSchema', 'responseSchema: ToolCallRequestSchema'],
];
function test() {
  const reportPath = '/private/tmp/meditazione-b1-tool-mutation.json';
  const run = spawnSync('pnpm', ['exec', 'vitest', 'run', 'tests/http/cap-tool-call.test.ts', '--maxWorkers=1', '--reporter=json', `--outputFile=${reportPath}`], { cwd: root, encoding: 'utf8' });
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  return { status: run.status, failed: report.numFailedTests, total: report.numTotalTests };
}
const baseline = test();
if (baseline.status !== 0 || baseline.total !== 8) throw Error('Expected baseline 8/8');
const evidence = [];
for (const [name, needle, replacement] of cases) {
  if (original.split(needle).length !== 2) throw Error(`Non-unique mutation: ${name}`);
  try {
    writeFileSync(path, original.replace(needle, replacement));
    const result = test();
    if (result.status === 0 || result.failed < 1 || result.total !== 8) throw Error(`Mutation survived or invalid: ${name}`);
    evidence.push({ name, ...result });
  } finally { writeFileSync(path, original); }
}
const restored = test();
if (restored.status !== 0) throw Error('Restored baseline failed');
console.log(JSON.stringify({ baseline, attempted: cases.length, killed: evidence.length, evidence, restored }, null, 2));
