import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const sourcePath = 'src/capability/dev/production-job.ts';
const testPath = 'tests/capability/dev/production-role-report.test.ts';
const suiteTitle = 'bridge221 production role models in the approved report';
const scenarios = [];
function scenario(id, anchor, replacement, title, assertion, failure) {
  scenarios.push({ id, anchor, replacement, title, assertion, failure });
}
scenario(
  'parse-presence', '  roleModels: DevProductionRoleModelsSchema.optional(),\n', '',
  'round-trips the six role choices through the job',
  'expect(parsed.success).toBe(true);', 'false to be true',
);
scenario(
  'report-inclusion', "key !== 'reportDigest'", "key !== 'reportDigest' && key !== 'roleModels'",
  'binds engine, model and reasoning of a role in the text',
  'expect(canonicalize(changed) === base).toBe(false);', 'true to be false',
);
scenario(
  'role-ignored', 'job.session = { ...parsed.session, engines: [...parsed.session.engines].sort() };',
  "job.session = { ...parsed.session, engines: [...parsed.session.engines].sort() };\n  if (parsed.roleModels) job.roleModels = { ...parsed.roleModels, presentation: { engine: 'codex', modelId: 'fixed' } };",
  'binds each of the six roles in the SHA-256 of the text',
  'expect(sha(canonicalize(changed)) === baseSha).toBe(false);', 'true to be false',
);
scenario(
  'engines-guard', 'Object.values(job.roleModels).every((choice) => job.session.engines.includes(choice.engine))', 'true',
  'rejects a role engine outside the session engines',
  'expect(DevProductionJobSchema.safeParse(outside).success).toBe(false);', 'true to be false',
);

const hash = value => createHash('sha256').update(value).digest('hex');
const directory = realpathSync(mkdtempSync(join(tmpdir(), 'production-role-report-mutation-')));
const workspace = join(directory, 'bridge');
const summaryPath = join(directory, 'summary.json');
const liveFiles = [sourcePath, 'src/http/endpoints/internal-dev-production.ts', testPath, 'tests/capability/dev/production-role-report.mutation.mjs'];
const liveHashes = () => Object.fromEntries(liveFiles.map(path => [path, hash(readFileSync(join(root, path)))]));
const summary = {
  mutants: { intercepted: 0, total: scenarios.length }, phases: { valid: 0, total: scenarios.length * 3 },
  reader: { passed: 0, total: 3 }, before: liveHashes(), after: {}, scenarios: [], completed: false,
};
const save = () => writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n');
function uniqueIndex(text, anchor) {
  const index = text.indexOf(anchor);
  assert.ok(index >= 0 && text.indexOf(anchor, index + anchor.length) === -1, `Nonunique anchor: ${anchor}`);
  return index;
}
function mutate(text, item) {
  const index = uniqueIndex(text, item.anchor);
  const mutated = text.slice(0, index) + item.replacement + text.slice(index + item.anchor.length);
  assert.notEqual(mutated, text);
  return mutated;
}
function assertionPosition(text, item) {
  // Locate the assertion inside the named case only; the same expression may repeat elsewhere.
  const start = uniqueIndex(text, `it('${item.title}',`);
  const end = text.indexOf("\n  it('", start + 1);
  const body = text.slice(start, end === -1 ? text.length : end);
  const matcher = start + uniqueIndex(body, item.assertion) + item.assertion.indexOf('.toBe') + 1;
  return { line: text.slice(0, matcher).split('\n').length, column: matcher - text.lastIndexOf('\n', matcher) };
}
function copyPublic() {
  const copied = new Set();
  function copy(path) {
    assert.ok(!path.startsWith('/') && !path.split('/').includes('..'));
    assert.ok(/^(?:src\/.*\.ts|tests\/.*\.ts|package\.json|tsconfig[^/]*\.json|vitest[^/]*\.config\.ts)$/.test(path));
    assert.ok(!path.split('/').some(part => /^(?:\.env.*|secrets?|dist|coverage|vendor|node_modules)$/i.test(part)
      || /(?:migration|fixture|dump|seed|lock)/i.test(part)));
    // Credential schemas are public contracts; the agent credential module and key files are never copied.
    assert.ok(path !== 'src/agent/agent-credentials.ts' && !/\.(?:pem|key|p12|pfx|crt|cer|der)$/i.test(path));
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
    const text = readFileSync(current, 'utf8');
    for (const match of text.matchAll(/\b(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)) {
      copy(relative(root, resolve(dirname(current), match[1].replace(/\.js$/, '.ts'))));
    }
  }
  // Explicit entry points include the new, uncommitted source/test; only public dependencies follow.
  for (const path of ['package.json', 'tsconfig.json', 'vitest.config.ts', 'tests/setup.ts', testPath, sourcePath]) copy(path);
  symlinkSync(join(root, 'node_modules'), join(workspace, 'node_modules'), 'dir');
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
  assert.equal(test.title, expected.title);
  assert.equal(test.fullName, expected.fullName);
  assert.deepEqual(test.ancestorTitles, [suiteTitle]);
  assert.equal(test.status, red ? 'failed' : 'passed');
  if (!red) { assert.deepEqual(test.failureMessages, []); return; }
  assert.equal(test.failureMessages.length, 1);
  const [message, ...stack] = test.failureMessages[0].split('\n');
  assert.equal(message, `AssertionError: expected ${expected.failure} // Object.is equality`);
  const frame = stack.filter(line => line.trim().startsWith('at '))
    .find(line => !line.includes('/node_modules/') && !line.includes('node:internal/') && line.trim() !== 'at new Promise (<anonymous>)');
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
    const expected = {
      ...item, ...assertionPosition(tests, item), file: realpathSync(join(workspace, testPath)), fullName: `${suiteTitle} ${item.title}`,
    };
    const entry = { id: item.id, phases: [] };
    summary.scenarios.push(entry);
    function phase(name, red) {
      const report = join(directory, `${item.id}-${name}.json`);
      const args = [
        join(root, 'node_modules/vitest/vitest.mjs'), 'run', testPath, '-t', `^${expected.fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
        '--maxWorkers=1', '--no-cache', '--configLoader=runner', '--reporter=json', `--outputFile=${report}`,
      ];
      const sourceHash = hash(readFileSync(file));
      const child = spawnSync(process.execPath, args, { cwd: workspace, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
      writeFileSync(join(directory, `${item.id}-${name}.log`), `${child.stdout ?? ''}\n${child.stderr ?? ''}\n${child.error?.message ?? ''}`);
      assert.equal(hash(readFileSync(file)), sourceHash);
      const actual = JSON.parse(readFileSync(report, 'utf8'));
      validateReport(actual, child, expected, red);
      if (summary.reader.passed === 0) {
        // The reader must refuse reports with no active case, a wrong title or a runtime error.
        for (const damage of [
          copy => { copy.testResults[0].assertionResults.forEach(test => { test.status = 'skipped'; }); },
          copy => { copy.testResults[0].assertionResults.forEach(test => { test.title = 'different'; }); },
          copy => { copy.numRuntimeErrorTestSuites = 1; },
        ]) {
          const damaged = structuredClone(actual);
          damage(damaged);
          assert.throws(() => validateReport(damaged, child, expected, red));
          summary.reader.passed++;
        }
      }
      entry.phases.push({ name, sourceHash, report, valid: true });
      summary.phases.valid++;
      save();
    }
    phase('baseline', false);
    try { writeFileSync(file, mutate(original, item)); phase('mutant', true); summary.mutants.intercepted++; }
    finally { writeFileSync(file, original); assert.equal(hash(readFileSync(file)), hash(original)); phase('restored', false); }
  }
  assert.equal(summary.mutants.intercepted, summary.mutants.total);
  assert.equal(summary.phases.valid, summary.phases.total);
  assert.equal(summary.reader.passed, summary.reader.total);
  summary.completed = true;
} catch (error) {
  summary.error = { name: error.name, message: error.message };
  process.exitCode = 1;
} finally {
  summary.after = liveHashes();
  if (JSON.stringify(summary.before) !== JSON.stringify(summary.after)) { summary.completed = false; process.exitCode = 1; }
  save();
  console.log(`mutants ${summary.mutants.intercepted}/${summary.mutants.total}; phases ${summary.phases.valid}/${summary.phases.total}; reader ${summary.reader.passed}/${summary.reader.total}`);
  console.log(`live source hashes before/after: ${JSON.stringify({ before: summary.before, after: summary.after })}`);
  console.log(`summary: ${summaryPath}`);
  if (summary.error) console.error(`${summary.error.name}: ${summary.error.message}`);
}
