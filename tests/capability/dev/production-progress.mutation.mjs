import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const sourcePath = 'src/capability/dev/production-progress.ts';
const testPath = 'tests/capability/dev/production-progress.test.ts';
const suiteTitle = 'dev production progress';
const scenarios = [
  {
    "id": "1",
    "title": "accepts queued",
    "anchor": "phase: z.enum(['queued', 'running', 'blocked', 'stopping']),",
    "replacement": "phase: z.enum(['running', 'blocked', 'stopping']),"
  },
  {
    "id": "2",
    "title": "accepts running",
    "anchor": "phase: z.enum(['queued', 'running', 'blocked', 'stopping']),",
    "replacement": "phase: z.enum(['queued', 'blocked', 'stopping']),"
  },
  {
    "id": "3",
    "title": "accepts blocked",
    "anchor": "phase: z.enum(['queued', 'running', 'blocked', 'stopping']),",
    "replacement": "phase: z.enum(['queued', 'running', 'stopping']),"
  },
  {
    "id": "4",
    "title": "accepts stopping",
    "anchor": "phase: z.enum(['queued', 'running', 'blocked', 'stopping']),",
    "replacement": "phase: z.enum(['queued', 'running', 'blocked']),"
  },
  {
    "id": "5",
    "title": "accepts one of one still running",
    "anchor": "tasks.completed <= tasks.total",
    "replacement": "tasks.completed < tasks.total"
  },
  {
    "id": "6",
    "title": "trims message",
    "anchor": "z.string().trim().min(1).max(1000)",
    "replacement": "z.string().min(1).max(1000)"
  },
  {
    "id": "7",
    "title": "rejects zero total",
    "anchor": "total: z.number().int().min(1)",
    "replacement": "total: z.number().int().min(0)"
  },
  {
    "id": "8",
    "title": "rejects negative completed",
    "anchor": "completed: z.number().int().min(0)",
    "replacement": "completed: z.number().int()"
  },
  {
    "id": "9",
    "title": "rejects completed fraction",
    "anchor": "completed: z.number().int().min(0)",
    "replacement": "completed: z.number().min(0)"
  },
  {
    "id": "10",
    "title": "rejects total fraction",
    "anchor": "total: z.number().int().min(1)",
    "replacement": "total: z.number().min(1)"
  },
  {
    "id": "11",
    "title": "rejects completed exceeds total",
    "anchor": "tasks.completed <= tasks.total",
    "replacement": "true"
  },
  {
    "id": "12",
    "title": "rejects task extras",
    "anchor": "tasks: z.strictObject({",
    "replacement": "tasks: z.object({"
  },
  {
    "id": "13",
    "title": "rejects sequence zero",
    "anchor": "sequence: z.number().int().min(1)",
    "replacement": "sequence: z.number().int().min(0)"
  },
  {
    "id": "14",
    "title": "rejects sequence fraction",
    "anchor": "sequence: z.number().int().min(1)",
    "replacement": "sequence: z.number().min(1)"
  },
  {
    "id": "15",
    "title": "rejects invalid timestamp",
    "anchor": "updatedAt: z.iso.datetime()",
    "replacement": "updatedAt: z.string()"
  },
  {
    "id": "16",
    "title": "rejects succeeded phase",
    "anchor": "phase: z.enum(['queued', 'running', 'blocked', 'stopping'])",
    "replacement": "phase: z.enum(['queued', 'running', 'blocked', 'stopping', 'succeeded'])"
  },
  {
    "id": "17",
    "title": "rejects finished phase",
    "anchor": "phase: z.enum(['queued', 'running', 'blocked', 'stopping'])",
    "replacement": "phase: z.enum(['queued', 'running', 'blocked', 'stopping', 'finished'])"
  },
  {
    "id": "18",
    "title": "rejects empty message",
    "anchor": "z.string().trim().min(1).max(1000)",
    "replacement": "z.string().trim().max(1000)"
  },
  {
    "id": "19",
    "title": "rejects blank message",
    "anchor": "z.string().trim().min(1).max(1000)",
    "replacement": "z.string().min(1).max(1000)"
  },
  {
    "id": "20",
    "title": "rejects long message",
    "anchor": "z.string().trim().min(1).max(1000)",
    "replacement": "z.string().trim().min(1)"
  },
  {
    "id": "21",
    "title": "rejects artifacts",
    "anchor": "DevProductionProgressSchema = z.strictObject({",
    "replacement": "DevProductionProgressSchema = z.object({"
  },
  {
    "id": "22",
    "title": "inherits scope validation",
    "anchor": "scope: JobShape.scope,",
    "replacement": "scope: z.unknown(),"
  },
  {
    "id": "23",
    "title": "inherits jobId validation",
    "anchor": "jobId: JobShape.jobId,",
    "replacement": "jobId: z.unknown(),"
  },
  {
    "id": "24",
    "title": "inherits requestId validation",
    "anchor": "requestId: JobShape.requestId,",
    "replacement": "requestId: z.unknown(),"
  },
  {
    "id": "25",
    "title": "inherits projectId validation",
    "anchor": "projectId: JobShape.projectId,",
    "replacement": "projectId: z.unknown(),"
  },
  {
    "id": "26",
    "title": "inherits reportVersion validation",
    "anchor": "reportVersion: JobShape.reportVersion,",
    "replacement": "reportVersion: z.unknown(),"
  },
  {
    "id": "27",
    "title": "inherits reportDigest validation",
    "anchor": "reportDigest: JobShape.reportDigest,",
    "replacement": "reportDigest: z.unknown(),"
  },
  {
    "id": "28",
    "title": "rejects different jobId",
    "anchor": "&& progress.jobId === job.jobId",
    "replacement": ""
  },
  {
    "id": "29",
    "title": "rejects different requestId",
    "anchor": "&& progress.requestId === job.requestId",
    "replacement": ""
  },
  {
    "id": "30",
    "title": "rejects different projectId",
    "anchor": "&& progress.projectId === job.projectId",
    "replacement": ""
  },
  {
    "id": "31",
    "title": "rejects different reportVersion",
    "anchor": "&& progress.reportVersion === job.reportVersion",
    "replacement": ""
  },
  {
    "id": "32",
    "title": "rejects different reportDigest",
    "anchor": "&& progress.reportDigest === job.reportDigest",
    "replacement": ""
  },
  {
    "id": "33",
    "title": "rejects different tenantId",
    "anchor": "sameCapabilityScope(progress.scope, job.scope)",
    "replacement": "(progress.scope.ownerId === job.scope.ownerId && progress.scope.agentId === job.scope.agentId)"
  },
  {
    "id": "34",
    "title": "rejects different ownerId",
    "anchor": "sameCapabilityScope(progress.scope, job.scope)",
    "replacement": "(progress.scope.tenantId === job.scope.tenantId && progress.scope.agentId === job.scope.agentId)"
  },
  {
    "id": "35",
    "title": "rejects different agentId",
    "anchor": "sameCapabilityScope(progress.scope, job.scope)",
    "replacement": "(progress.scope.tenantId === job.scope.tenantId && progress.scope.ownerId === job.scope.ownerId)"
  },
  {
    "id": "36",
    "title": "rejects invalid progress before correlation",
    "anchor": "const parsedProgress = DevProductionProgressSchema.safeParse(raw);",
    "replacement": "const parsedProgress = { success: true, data: raw };"
  },
  {
    "id": "37",
    "title": "rejects invalid job before correlation",
    "anchor": "const parsedJob = DevProductionJobSchema.safeParse(expectedJob);",
    "replacement": "const parsedJob = { success: true, data: expectedJob };"
  }
];
const hash = value => createHash('sha256').update(value).digest('hex');
function uniqueIndex(text, anchor) {
  const index = text.indexOf(anchor);
  assert.ok(index >= 0 && text.indexOf(anchor, index + anchor.length) === -1, `Non-unique anchor: ${anchor}`);
  return index;
}
function mutate(text, scenario) {
  const index = uniqueIndex(text, scenario.anchor);
  return text.slice(0, index) + scenario.replacement + text.slice(index + scenario.anchor.length);
}
function assertionPosition(test, title) {
  const start = uniqueIndex(test, `it('${title}', () => {`);
  const end = test.indexOf('\n  });', start);
  assert.ok(end > start);
  const matcher = test.lastIndexOf('.toBe(true)', end) + 1;
  assert.ok(matcher > start && matcher < end);
  return { line: test.slice(0, matcher).split('\n').length, column: matcher - test.lastIndexOf('\n', matcher) };
}
function validateReport(report, child, expected, red) {
  assert.equal(child.error, undefined);
  assert.equal(child.signal, null);
  assert.equal(child.status, red ? 1 : 0);
  assert.equal(report.success, !red);
  assert.equal(report.numPassedTests, red ? 0 : 1);
  assert.equal(report.numFailedTests, red ? 1 : 0);
  assert.equal(report.numRuntimeErrorTestSuites ?? 0, 0);
  assert.deepEqual(report.unhandledErrors ?? [], []);
  assert.equal(report.testResults.length, 1);
  const suite = report.testResults[0];
  assert.equal(suite.name, expected.file);
  assert.equal(suite.status, red ? 'failed' : 'passed');
  assert.equal(suite.message, '');
  const active = suite.assertionResults.filter(test => ['passed', 'failed'].includes(test.status));
  assert.equal(active.length, 1, 'Exactly one active test is required');
  const test = active[0];
  assert.equal(test.fullName, `${suiteTitle} ${expected.title}`);
  assert.equal(test.title, expected.title);
  assert.deepEqual(test.ancestorTitles, [suiteTitle]);
  assert.equal(test.status, red ? 'failed' : 'passed');
  if (!red) { assert.deepEqual(test.failureMessages, []); return; }
  assert.equal(test.failureMessages.length, 1);
  const [message, ...stack] = test.failureMessages[0].split('\n');
  assert.equal(message, 'AssertionError: expected false to be true // Object.is equality');
  const application = stack.filter(line => line.trim().startsWith('at ')).find(frame =>
    !frame.includes('/node_modules/') && !frame.includes('node:internal/') && frame.trim() !== 'at new Promise (<anonymous>)');
  assert.equal(application, `    at ${expected.file}:${expected.line}:${expected.column}`);
}

const directory = realpathSync(mkdtempSync(join(tmpdir(), 'production-progress-mutation-')));
const workspace = join(directory, 'bridge');
mkdirSync(workspace);
const copied = new Set();
// Explicit entry points include the new, uncommitted test; only their public
// relative dependencies and the actual Vitest bootstrap/config are copied.
function copyPublic(path) {
  assert.ok(/^(?:src\/.*\.ts|tests\/.*\.ts|package\.json|tsconfig\.json|vitest\.config\.ts)$/.test(path));
  assert.ok(!path.split('/').some(part => /^(?:\.\.|\.env.*|secrets?|dist|coverage|vendor|node_modules)$/i.test(part)
    || /(?:migration|fixture|dump|seed|lock)/i.test(part)));
  // Credential schemas are public contracts required by capability-call-context;
  // private credentials, key files and the agent credential module are excluded.
  assert.ok(path !== 'src/agent/agent-credentials.ts' && !/\.(?:pem|key|p12|pfx|crt|cer|der)$/i.test(path));
  if (copied.has(path)) return;
  let current = root;
  for (const part of path.split('/')) {
    current = join(current, part);
    assert.ok(!lstatSync(current).isSymbolicLink(), 'Public inputs must not traverse symlinks');
  }
  assert.ok(lstatSync(current).isFile());
  copied.add(path);
  const destination = join(workspace, path);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(current, destination);
  if (!path.endsWith('.ts')) return;
  const text = readFileSync(current, 'utf8');
  for (const match of text.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)) {
    const dependency = relative(root, resolve(dirname(current), match[1])).replace(/\.js$/, '.ts');
    copyPublic(dependency);
  }
}
const livePaths = [sourcePath, testPath, 'src/capability/dev/index.ts', 'tests/capability/dev/index.test.ts', 'tests/capability/dev/production-progress.mutation.mjs'];
const liveHashes = () => Object.fromEntries(livePaths.map(path => [path, hash(readFileSync(join(root, path)))]));
const summary = { mutants: { intercepted: 0, total: scenarios.length }, phases: { valid: 0, total: scenarios.length * 3 }, liveBefore: liveHashes(), scenarios: [] };
const save = () => writeFileSync(join(directory, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
try {
  for (const path of [sourcePath, testPath, 'tests/setup.ts', 'vitest.config.ts', 'tsconfig.json', 'package.json']) copyPublic(path);
  symlinkSync(join(root, 'node_modules'), join(workspace, 'node_modules'), 'dir');
  const source = join(workspace, sourcePath);
  const original = readFileSync(source, 'utf8');
  const testText = readFileSync(join(workspace, testPath), 'utf8');
  for (const scenario of scenarios) { mutate(original, scenario); assertionPosition(testText, scenario.title); }
  for (const scenario of scenarios) {
    const expected = { ...assertionPosition(testText, scenario.title), title: scenario.title, file: realpathSync(join(workspace, testPath)) };
    const record = { id: scenario.id, phases: [] };
    summary.scenarios.push(record);
    function phase(name, red) {
      const report = join(directory, `${scenario.id}-${name}.json`);
      const fullName = `${suiteTitle} ${scenario.title}`;
      const escaped = fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const args = ['exec', 'vitest', 'run', testPath, '-t', `^${escaped}$`, '--maxWorkers=1', '--no-cache', '--configLoader=runner', '--reporter=json', `--outputFile=${report}`];
      const before = hash(readFileSync(source));
      const child = spawnSync('pnpm', args, { cwd: workspace, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
      writeFileSync(join(directory, `${scenario.id}-${name}.log`), `${child.stdout ?? ''}\n${child.stderr ?? ''}\n${child.error?.message ?? ''}`);
      assert.equal(hash(readFileSync(source)), before);
      validateReport(JSON.parse(readFileSync(report, 'utf8')), child, expected, red);
      record.phases.push({ name, sourceHash: before, valid: true });
      summary.phases.valid++;
      save();
    }
    phase('baseline', false);
    try {
      writeFileSync(source, mutate(original, scenario));
      phase('mutant', true);
      summary.mutants.intercepted++;
    } finally {
      writeFileSync(source, original);
      assert.equal(hash(readFileSync(source)), hash(original));
      phase('restored', false);
    }
  }
  assert.equal(summary.mutants.intercepted, summary.mutants.total);
  assert.equal(summary.phases.valid, summary.phases.total);
} catch (error) {
  summary.error = { name: error.name, message: error.message };
  process.exitCode = 1;
} finally {
  summary.liveAfter = liveHashes();
  try { assert.deepEqual(summary.liveAfter, summary.liveBefore); }
  catch (error) { summary.liveError = error.message; process.exitCode = 1; }
  save();
  console.log(`mutants ${summary.mutants.intercepted}/${summary.mutants.total}; phases ${summary.phases.valid}/${summary.phases.total}`);
  console.log(`live source hashes before/after: ${JSON.stringify({ before: summary.liveBefore, after: summary.liveAfter })}`);
  console.log(`summary: ${join(directory, 'summary.json')}`);
  if (summary.error) console.error(summary.error);
}
