import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const sourcePath = 'src/capability/dev/production-config-match.ts';
const testPath = 'tests/capability/dev/production-job-model-availability.test.ts';
const selfPath = 'tests/capability/dev/production-job-model-availability.mutation.mjs';
const suiteTitle = 'bridge230';
const testTitles = [
  'accepts six explicit available role choices',
  'rejects a removed model for each role',
  'rejects unavailable reasoning choice',
  'rejects foreign or expired session catalog',
  'rejects malformed or legacy job without explicit choices',
  'preserves existing config matching behavior',
];
const scenarios = [
  {
    id: 'extra-property-allowed',
    anchor: '  const parsed = DevProductionJobSchema.safeParse(rawJob);\n',
    replacement: '  const parsed = { success: true as const, data: rawJob as DevProductionJob };\n',
    title: 'rejects malformed or legacy job without explicit choices',
    assertion: "expect(isDevProductionJobModelsUsable({ ...job(), unexpected: true }, catalog(), now), 'extra property').toBe(false);",
    label: 'extra property',
  },
  {
    id: 'legacy-accepted',
    anchor: '  if (job.roleModels === undefined) return false;\n',
    replacement: '  if (job.roleModels === undefined) return true;\n',
    title: 'rejects malformed or legacy job without explicit choices',
    assertion: "expect(isDevProductionJobModelsUsable(legacy, catalog(), now), 'legacy job').toBe(false);",
    label: 'legacy job',
  },
  {
    id: 'delegation-forced-true',
    anchor: '  return isDevProductionRoleModelsUsable(\n',
    replacement: '  return true || isDevProductionRoleModelsUsable(\n',
    title: 'rejects a removed model for each role',
    assertion: "expect(isDevProductionJobModelsUsable(job(), reduced, now), `removed ${role}`).toBe(false);",
    label: 'removed coordination',
  },
  {
    id: 'catalog-binding-instead-of-session',
    anchor: '    job.session,\n',
    replacement: '    (rawCatalog as { lease: { binding: unknown } }).lease.binding,\n',
    title: 'rejects foreign or expired session catalog',
    assertion: "expect(isDevProductionJobModelsUsable(job(), foreignOwner, now), 'foreign owner').toBe(false);",
    label: 'foreign owner',
  },
  {
    id: 'fixed-valid-clock',
    anchor: '    nowMs,\n',
    replacement: "    Date.parse('2026-10-16T10:01:00Z'),\n",
    title: 'rejects foreign or expired session catalog',
    assertion: "expect(isDevProductionJobModelsUsable(job(), expired, Date.parse('2026-10-16T10:02:00Z')), 'expired lease').toBe(false);",
    label: 'expired lease',
  },
];
const hash = value => createHash('sha256').update(value).digest('hex');
const directory = realpathSync(mkdtempSync(join(tmpdir(), 'dev-production-job-model-availability-mutation-')));
const workspace = join(directory, 'bridge');
const summaryPath = join(directory, 'summary.json');
const liveFiles = [sourcePath, testPath, selfPath];
const before = Object.fromEntries(liveFiles.map(path => [path, hash(readFileSync(join(root, path)))]));
const readerTotal = 3;
const summary = { mutants: { intercepted: 0, total: scenarios.length }, phases: { valid: 0, total: scenarios.length * 3 }, before, after: {}, scenarios: [], completed: false, reader: { passed: 0, total: readerTotal } };
const save = () => writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n');
function uniqueIndex(text, anchor) {
  const index = text.indexOf(anchor);
  assert.ok(index >= 0 && text.indexOf(anchor, index + anchor.length) === -1, `Nonunique anchor: ${anchor}`);
  return index;
}
function mutate(text, item) {
  const index = uniqueIndex(text, item.anchor);
  return text.slice(0, index) + item.replacement + text.slice(index + item.anchor.length);
}
function assertionPosition(text, item) {
  const index = uniqueIndex(text, item.assertion);
  const matcher = index + item.assertion.lastIndexOf('.toBe') + 1;
  return { line: text.slice(0, matcher).split('\n').length, column: matcher - text.lastIndexOf('\n', matcher) };
}
function copyPublic() {
  const copied = new Set();
  function copy(path) {
    assert.ok(!path.startsWith('/') && !path.split('/').includes('..'));
    assert.ok(/^(?:src\/.*\.ts|tests\/.*\.ts|package\.json|tsconfig[^/]*\.json|vitest[^/]*\.config\.ts)$/.test(path));
    assert.ok(!path.split('/').some(part => /^(?:\.env.*|secrets?|dist|coverage|vendor|node_modules)$/i.test(part)));
    if (copied.has(path)) return;
    copied.add(path);
    let current = root;
    for (const part of path.split('/')) {
      current = join(current, part);
      assert.ok(!lstatSync(current).isSymbolicLink(), 'Public dependencies must not traverse symlinks');
    }
    assert.ok(lstatSync(current).isFile());
    mkdirSync(dirname(join(workspace, path)), { recursive: true });
    copyFileSync(current, join(workspace, path));
    if (!path.endsWith('.ts')) return;
    const source = readFileSync(current, 'utf8');
    for (const match of source.matchAll(/\b(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)) {
      copy(relative(root, resolve(dirname(current), match[1].replace(/\.js$/, '.ts'))));
    }
  }
  for (const path of ['package.json', 'tsconfig.json', 'vitest.config.ts', 'tests/setup.ts', testPath, sourcePath]) copy(path);
  symlinkSync(join(root, 'node_modules'), join(workspace, 'node_modules'), 'dir');
}
function validateReport(report, child, expected, red) {
  assert.equal(child.error, undefined); assert.equal(child.signal, null);
  assert.equal(child.status, red ? 1 : 0);
  assert.equal(report.success, !red);
  assert.equal(report.numPassedTests, red ? 0 : 1);
  assert.equal(report.numFailedTests, red ? 1 : 0);
  // Vitest reports the five siblings excluded by -t as pending/skipped.
  // Only those exact siblings may be skipped; the selected case must be active.
  assert.equal(report.numTotalTests, testTitles.length);
  assert.equal(report.numPendingTests, testTitles.length - 1);
  assert.equal(report.numTodoTests ?? 0, 0);
  assert.equal(report.numRuntimeErrorTestSuites ?? 0, 0);
  assert.deepEqual(report.unhandledErrors ?? [], []);
  assert.equal(report.testResults.length, 1);
  const suite = report.testResults[0];
  assert.equal(suite.name, expected.file);
  assert.equal(suite.status, red ? 'failed' : 'passed');
  assert.equal(suite.message, '');
  const active = suite.assertionResults.filter(test => ['passed', 'failed'].includes(test.status));
  assert.equal(active.length, 1);
  assert.equal(suite.assertionResults.length, testTitles.length);
  assert.deepEqual(suite.assertionResults.map(test => test.title).sort(), [...testTitles].sort());
  for (const sibling of suite.assertionResults.filter(test => test.title !== expected.title)) {
    assert.equal(sibling.status, 'skipped');
    assert.equal(sibling.fullName, `${suiteTitle} ${sibling.title}`);
    assert.deepEqual(sibling.ancestorTitles, [suiteTitle]);
    assert.deepEqual(sibling.failureMessages, []);
  }
  const test = active[0];
  assert.equal(test.title, expected.title); assert.equal(test.fullName, expected.fullName);
  assert.deepEqual(test.ancestorTitles, [suiteTitle]);
  assert.equal(test.status, red ? 'failed' : 'passed');
  if (!red) { assert.deepEqual(test.failureMessages, []); return; }
  assert.equal(test.failureMessages.length, 1);
  const [message, ...stack] = test.failureMessages[0].split('\n');
  assert.ok(message.startsWith('AssertionError: ') && message.includes(expected.label) && message.includes('expected true to be false'), `Unexpected assertion: ${message}`);
  const frame = stack.filter(line => line.trim().startsWith('at ')).find(line => !line.includes('/node_modules/') && !line.includes('node:internal/') && line.trim() !== 'at new Promise (<anonymous>)');
  assert.equal(frame, `    at ${expected.file}:${expected.line}:${expected.column}`);
}
try {
  mkdirSync(workspace);
  copyPublic();
  const file = join(workspace, sourcePath);
  const original = readFileSync(file, 'utf8');
  const tests = readFileSync(join(workspace, testPath), 'utf8');
  for (const item of scenarios) { mutate(original, item); assertionPosition(tests, item); }
  for (const item of scenarios) {
    const expected = { ...item, ...assertionPosition(tests, item), file: realpathSync(join(workspace, testPath)), fullName: `${suiteTitle} ${item.title}` };
    const entry = { id: item.id, phases: [] }; summary.scenarios.push(entry);
    function phase(name, red) {
      const report = join(directory, `${item.id}-${name}.json`);
      const args = [join(root, 'node_modules/vitest/vitest.mjs'), 'run', testPath, '-t', `^${expected.fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, '--maxWorkers=1', '--no-cache', '--configLoader=runner', '--reporter=json', `--outputFile=${report}`];
      const sourceHash = hash(readFileSync(file));
      const child = spawnSync(process.execPath, args, { cwd: workspace, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
      writeFileSync(join(directory, `${item.id}-${name}.log`), `${child.stdout ?? ''}\n${child.stderr ?? ''}\n${child.error?.message ?? ''}`);
      assert.equal(hash(readFileSync(file)), sourceHash);
      const actualReport = JSON.parse(readFileSync(report, 'utf8'));
      validateReport(actualReport, child, expected, red);
      if (summary.reader.passed === 0) {
        // Reader self-check: zero active tests, wrong title and runtime error must all be rejected.
        for (const damage of [
          report => { report.testResults[0].assertionResults.forEach(test => { test.status = 'skipped'; }); },
          report => { report.testResults[0].assertionResults.forEach(test => { test.title = 'different'; }); },
          report => { report.numRuntimeErrorTestSuites = 1; },
        ]) {
          const damaged = structuredClone(actualReport);
          damage(damaged);
          assert.throws(() => validateReport(damaged, child, expected, red));
          summary.reader.passed++;
        }
      }
      entry.phases.push({ name, sourceHash, report, valid: true }); summary.phases.valid++; save();
    }
    phase('baseline', false);
    try { writeFileSync(file, mutate(original, item)); phase('mutant', true); summary.mutants.intercepted++; }
    finally { writeFileSync(file, original); assert.equal(hash(readFileSync(file)), hash(original)); phase('restored', false); }
  }
  assert.equal(summary.mutants.intercepted, scenarios.length);
  assert.equal(summary.phases.valid, scenarios.length * 3);
  assert.equal(summary.reader.passed, summary.reader.total);
  summary.completed = true;
} catch (error) {
  summary.error = { name: error.name, message: error.message }; process.exitCode = 1;
} finally {
  summary.after = Object.fromEntries(liveFiles.map(path => [path, hash(readFileSync(join(root, path)))]));
  if (JSON.stringify(summary.before) !== JSON.stringify(summary.after)) { summary.completed = false; process.exitCode = 1; }
  save();
  console.log(`mutants ${summary.mutants.intercepted}/${summary.mutants.total}`);
  console.log(`phases ${summary.phases.valid}/${summary.phases.total}`);
  console.log(`reader ${summary.reader.passed}/${summary.reader.total}`);
  console.log(`live source hashes before/after: ${JSON.stringify({ before: summary.before, after: summary.after })}`);
  console.log(`summary: ${summaryPath}`);
  if (summary.error) console.error(`${summary.error.name}: ${summary.error.message}`);
}
