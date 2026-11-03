import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = realpathSync(fileURLToPath(new URL('../../../', import.meta.url)));
const sourcePath = 'src/capability/dev/config-state.ts';
const testPath = 'tests/capability/dev/production-config.test.ts';
const mutationPath = 'tests/capability/dev/production-config.mutation.mjs';
const group = 'production config';
const scenarios = [
  ...['tenantId', 'ownerId', 'agentId'].map(field => ({
    id: field, title: `rejects a different ${field}`,
    anchor: `if (scope.${field} !== cfg.${field})`, replacement: 'if (false)',
  })),
  { id: 'projects-nonempty', title: 'rejects an empty project list',
    anchor: 'allowedProjectIds: z.array(z.string().min(1)).min(1)',
    replacement: 'allowedProjectIds: z.array(z.string().min(1))' },
  { id: 'project-nonempty', title: 'rejects an empty project identifier',
    anchor: 'allowedProjectIds: z.array(z.string().min(1)).min(1)',
    replacement: 'allowedProjectIds: z.array(z.string()).min(1)' },
  { id: 'projects-unique', title: 'rejects duplicate project identifiers',
    anchor: '(ids) => new Set(ids).size === ids.length', replacement: '() => true' },
  { id: 'production-strict', title: 'rejects extra production fields',
    anchor: 'production: z.strictObject({', replacement: 'production: z.object({' },
];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const original = readFileSync(join(root, sourcePath), 'utf8');
const tests = readFileSync(join(root, testPath), 'utf8');
const directory = realpathSync(mkdtempSync(join(tmpdir(), 'production-config-mutation-')));
const workspace = join(directory, 'bridge');
const summary = { mutants: { passed: 0, total: scenarios.length }, phases: { passed: 0, total: 3 * scenarios.length }, reader: { passed: 0, total: 0 }, scenarios: [], completed: false };
const save = () => writeFileSync(join(directory, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
const liveHashes = new Map();

function unique(text, anchor) {
  const index = text.indexOf(anchor);
  assert.ok(index >= 0 && text.indexOf(anchor, index + anchor.length) === -1, `Nonunique anchor: ${anchor}`);
  return index;
}
function mutate(scenario) {
  const index = unique(original, scenario.anchor);
  return original.slice(0, index) + scenario.replacement + original.slice(index + scenario.anchor.length);
}
function expectedAssertion(scenario) {
  const start = unique(tests, `it('${scenario.title}', () => {`);
  const end = tests.indexOf('\n  });', start);
  assert.ok(end > start);
  const body = tests.slice(start, end);
  const matcher = start + unique(body, '.toBe(false)') + 1;
  return {
    file: realpathSync(join(workspace, testPath)), title: scenario.title,
    fullName: `${group} ${scenario.title}`,
    line: tests.slice(0, matcher).split('\n').length,
    column: matcher - tests.lastIndexOf('\n', matcher),
  };
}

// Copy only public TypeScript import dependencies and explicitly named test/config files.
// Untracked new tests are included; no worktree source is ever mutated.
function copyPublic(path, dependencies = false) {
  assert.ok(/^(?:src\/.*\.ts|tests\/.*\.(?:ts|mutation\.mjs)|package\.json|vitest\.config\.ts|tsconfig(?:\.[\w-]+)?\.json)$/.test(path));
  assert.ok(!path.split('/').some(part => part.startsWith('.') || /^(?:secrets?|dist|coverage|vendor|node_modules|env\.ts)$/i.test(part)));
  if (liveHashes.has(path)) return;
  let current = root;
  for (const part of path.split('/')) {
    current = join(current, part);
    assert.ok(!lstatSync(current).isSymbolicLink(), 'Public files must not traverse symlinks');
  }
  assert.ok(lstatSync(current).isFile());
  const bytes = readFileSync(current);
  liveHashes.set(path, digest(bytes));
  mkdirSync(dirname(join(workspace, path)), { recursive: true });
  copyFileSync(current, join(workspace, path));
  if (dependencies) {
    const imports = bytes.toString().matchAll(/(?:\bfrom\s*|\bimport\s*)['"]([^'"]+)['"]/g);
    for (const [, specifier] of imports) {
      if (!specifier.startsWith('.')) continue;
      const absolute = resolve(dirname(current), specifier.replace(/\.js$/, '.ts'));
      const relative = absolute.slice(root.length + 1);
      assert.ok(absolute.startsWith(root + '/') && /^(?:src|tests)\//.test(relative));
      copyPublic(relative, true);
    }
  }
}

const booleanFailure = 'AssertionError: expected true to be false // Object.is equality';
function validate(report, exit, expected, red) {
  assert.equal(exit, red ? 1 : 0, 'Unexpected exit');
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
  assert.equal(active.length, 1, 'Exactly one active test required');
  const test = active[0];
  assert.equal(test.fullName, expected.fullName);
  assert.equal(test.title, expected.title);
  assert.deepEqual(test.ancestorTitles, [group]);
  assert.equal(test.status, red ? 'failed' : 'passed');
  if (!red) { assert.deepEqual(test.failureMessages, []); return; }
  assert.equal(test.failureMessages.length, 1);
  const [message, ...stack] = test.failureMessages[0].split('\n');
  assert.equal(message, booleanFailure);
  const frame = stack.filter(line => line.trim().startsWith('at ')).find(line =>
    !line.includes('/node_modules/') && !line.includes('node:internal/') && line.trim() !== 'at new Promise (<anonymous>)');
  assert.equal(frame, `    at ${expected.file}:${expected.line}:${expected.column}`, 'Wrong first application assertion');
}

function readerSelfTest(green, red, expected) {
  const checks = [
    ['green', green, 0, false, () => {}, true],
    ['red', red, 1, true, () => {}, true],
    ['zero active', red, 1, true, r => { r.testResults[0].assertionResults.forEach(t => { t.status = 'pending'; }); }],
    ['foreign title', red, 1, true, r => { r.testResults[0].assertionResults.find(t => t.status === 'failed').fullName += ' wrong'; }],
    ['foreign file', red, 1, true, r => { r.testResults[0].name += '.wrong'; }],
    ['runtime error', red, 1, true, r => { r.numRuntimeErrorTestSuites = 1; }],
    ['unhandled error', red, 1, true, r => { r.unhandledErrors = ['synthetic']; }],
    ['collection error', red, 1, true, r => { r.testResults[0].message = 'Cannot import module'; }],
    ['wrong message', red, 1, true, r => { r.testResults[0].assertionResults.find(t => t.status === 'failed').failureMessages = ['TypeError: synthetic']; }],
    ['wrong frame', red, 1, true, r => { r.testResults[0].assertionResults.find(t => t.status === 'failed').failureMessages = [`${booleanFailure}\n    at ${expected.file}:1:1`]; }],
    ['false red exit', green, 1, true, () => {}],
    ['wrong exit', red, 0, true, () => {}],
  ];
  summary.reader.total = checks.length;
  for (const [name, report, exit, isRed, change, accepted] of checks) {
    const copy = structuredClone(report); change(copy);
    if (accepted) validate(copy, exit, expected, isRed);
    else assert.throws(() => validate(copy, exit, expected, isRed), { name: 'AssertionError' }, name);
    summary.reader.passed++;
  }
}

try {
  assert.equal(process.argv.length, 2, 'No flags supported');
  const require = createRequire(import.meta.url);
  summary.vitestVersion = JSON.parse(readFileSync(require.resolve('vitest/package.json'), 'utf8')).version;
  assert.equal(summary.vitestVersion, '3.2.4', 'The report reader requires Vitest 3.2.4');
  mkdirSync(workspace);
  for (const path of [sourcePath, testPath, 'tests/setup.ts']) copyPublic(path, true);
  copyPublic(mutationPath);
  for (const path of ['package.json', 'vitest.config.ts', 'tsconfig.json']) copyPublic(path);
  symlinkSync(join(root, 'node_modules'), join(workspace, 'node_modules'), 'dir');
  const file = join(workspace, sourcePath);
  for (const scenario of scenarios) { mutate(scenario); expectedAssertion(scenario); }
  for (const scenario of scenarios) {
    const expected = expectedAssertion(scenario);
    const entry = { id: scenario.id, expected, phases: [] };
    summary.scenarios.push(entry);
    function phase(name, red) {
      const reportPath = join(directory, `${scenario.id}-${name}.json`);
      const escaped = expected.fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const args = ['exec', 'vitest', 'run', testPath, '-t', `^${escaped}$`, '--maxWorkers=1', '--no-cache', '--configLoader=runner', '--reporter=json', `--outputFile=${reportPath}`];
      const before = digest(readFileSync(file));
      const child = spawnSync('pnpm', args, { cwd: workspace, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
      writeFileSync(join(directory, `${scenario.id}-${name}.log`), `${child.stdout ?? ''}\n${child.stderr ?? ''}\n${child.error?.message ?? ''}`);
      const record = { name, exit: child.status, signal: child.signal, reportPath, sourceHash: before, valid: false };
      entry.phases.push(record); save();
      assert.equal(child.signal, null); assert.equal(child.error, undefined);
      assert.equal(digest(readFileSync(file)), before);
      const report = JSON.parse(readFileSync(reportPath, 'utf8'));
      validate(report, child.status, expected, red);
      record.valid = true; summary.phases.passed++; save();
      return report;
    }
    const green = phase('baseline', false);
    try {
      writeFileSync(file, mutate(scenario));
      const red = phase('mutant', true);
      if (summary.reader.total === 0) readerSelfTest(green, red, expected);
    } finally {
      writeFileSync(file, original);
      assert.equal(digest(readFileSync(file)), digest(original));
      phase('restored', false);
    }
    summary.mutants.passed++; save();
  }
  summary.completed = true;
} catch (error) {
  summary.error = { name: error.name, message: error.message };
  process.exitCode = 1;
} finally {
  try {
    for (const [path, before] of liveHashes) assert.equal(digest(readFileSync(join(root, path))), before, `Live source changed: ${path}`);
    summary.liveSourceHashes = Object.fromEntries(liveHashes);
    summary.liveHashesUnchanged = true;
  } catch (error) {
    summary.completed = false; summary.error = { name: error.name, message: error.message }; process.exitCode = 1;
  }
  save();
  console.log(`mutants ${summary.mutants.passed}/${summary.mutants.total}; phases ${summary.phases.passed}/${summary.phases.total}; reader ${summary.reader.passed}/${summary.reader.total}; summary: ${join(directory, 'summary.json')}`);
  if (summary.error) console.error(summary.error.message);
}
