// B1 mutation evidence: restore each source before trying the next mutation.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sources = [
  'src/http/endpoints/internal-agent-turn.ts',
  'src/capability/tool-call.ts',
  'src/capability/capability-context.ts',
];
const needle = 'userId: InternalMemoryExtractRequestSchema.shape.userId,';
const replacements = {
  'drop identity': '',
  'remove memory bounds': 'userId: z.string().optional(),',
  'require identity': 'userId: InternalMemoryExtractRequestSchema.shape.userId.unwrap(),',
};
function test() {
  const run = spawnSync('pnpm', ['exec', 'vitest', 'run', 'tests/capability/meditation-user-id.test.ts', '--reporter=json'], { cwd: root, encoding: 'utf8' });
  // A module/import error is not evidence that an assertion caught a mutation.
  const report = JSON.parse(run.stdout.slice(run.stdout.indexOf('{')));
  return { status: run.status, failed: report.numFailedTests, total: report.numTotalTests };
}
const baseline = test();
if (baseline.status !== 0 || baseline.failed !== 0 || baseline.total !== 10) throw new Error('B1 baseline must pass 10/10 tests');
const evidence = [];
for (const source of sources) {
  const path = resolve(root, source);
  const original = readFileSync(path, 'utf8');
  if (original.split(needle).length !== 2) throw new Error(`Mutation marker not unique: ${source}`);
  for (const [mutation, replacement] of Object.entries(replacements)) {
    try {
      writeFileSync(path, original.replace(needle, replacement));
      const result = test();
      if (result.status === 0 || result.failed < 1 || result.total !== 10) throw new Error(`Mutation survived or failed to run: ${source} / ${mutation}`);
      evidence.push({ source, mutation, failedAssertions: result.failed, tests: result.total });
    } finally {
      writeFileSync(path, original);
    }
  }
}
const restored = test();
if (restored.status !== 0 || restored.failed !== 0) throw new Error('Restored B1 tests failed');
console.log(JSON.stringify({ baseline, killed: evidence.length, attempted: 9, evidence, restored }, null, 2));
