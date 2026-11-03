import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const source = 'src/capability/connect/development-session.ts';
const barrel = 'src/capability/connect/index.ts';
const testPath = 'tests/capability/connect/development-session.test.ts';
const mutationPath = 'tests/capability/connect/development-session.mutation.mjs';
const prefix = 'development session ';
const scenarios = [];
function scenario(id, title, anchor, replacement, expected = false, file = source) {
  scenarios.push({ id, title, anchor, replacement, expected, file });
}
scenario('engine-enum', 'rejects unknown engine', "z.enum(['claude', 'codex'])", "z.enum(['claude', 'codex', 'other'])");
scenario('minimum', 'rejects empty engines', '.min(1).max(2)', '.max(2)');
scenario('maximum', 'reports the two engine limit', '.min(1).max(2)', '.min(1)', true);
scenario('unique', 'rejects duplicate engines', 'new Set(engines).size === engines.length', 'true');
scenario('device-required', 'requires local device', 'deviceId: DeviceIdSchema', 'deviceId: DeviceIdSchema.optional()');
scenario('device-schema', 'reuses device validation', 'deviceId: DeviceIdSchema', 'deviceId: z.string()');
scenario('reference-required', 'requires cloud reference', 'connectionRef: z.string().min(1)', 'connectionRef: z.string().min(1).optional()');
scenario('reference-minimum', 'rejects empty cloud reference', 'connectionRef: z.string().min(1)', 'connectionRef: z.string()');
scenario('local-strict', 'rejects local cross fields', "z.object({ kind: z.literal('local'), deviceId: DeviceIdSchema }).strict()", "z.object({ kind: z.literal('local'), deviceId: DeviceIdSchema })");
scenario('cloud-strict', 'rejects cloud cross fields', "z.object({ kind: z.literal('cloud'), connectionRef: z.string().min(1) }).strict()", "z.object({ kind: z.literal('cloud'), connectionRef: z.string().min(1) })");
scenario('target-kind', 'accepts local with claude', "kind: z.literal('local')", "kind: z.literal('remote')", true);
scenario('scope-required', 'requires scope', 'scope: z.lazy(() => CapabilityAgentScopeSchema),', 'scope: z.lazy(() => CapabilityAgentScopeSchema).optional(),');
for (const [field, title] of [['tenantId', 'requires tenant'], ['ownerId', 'requires owner'], ['agentId', 'requires agent']]) {
  scenario(`scope-${field}`, title, 'scope: z.lazy(() => CapabilityAgentScopeSchema),', `scope: z.lazy(() => CapabilityAgentScopeSchema.partial({ ${field}: true })),`);
}
scenario('scope-strict', 'rejects scope extras', 'scope: z.lazy(() => CapabilityAgentScopeSchema),', 'scope: z.lazy(() => CapabilityAgentScopeSchema.strip()),');
scenario('session-required', 'requires session id', 'sessionId: z.string().min(1),', 'sessionId: z.string().min(1).optional(),');
scenario('session-minimum', 'rejects empty session id', 'sessionId: z.string().min(1),', 'sessionId: z.string(),');
scenario('target-required', 'requires target', 'target: DevelopmentSessionTargetSchema,', 'target: DevelopmentSessionTargetSchema.optional(),');
scenario('engines-required', 'requires engines', 'engines: DevelopmentSessionEnginesSchema,', 'engines: DevelopmentSessionEnginesSchema.optional(),');
scenario('binding-strict', 'rejects binding token', 'engines: DevelopmentSessionEnginesSchema,\n}).strict();', 'engines: DevelopmentSessionEnginesSchema,\n});');
scenario('public-export', 'exports all session schemas from the public barrel', "export * from './development-session.js';", '', true, barrel);

const hash = (value) => createHash('sha256').update(value).digest('hex');
const originals = new Map();
function publicPath(path) {
  return !path.split('/').some((part) => part.startsWith('.') || /^(?:secrets?|credentials|dist|coverage|vendor|node_modules)$/i.test(part));
}
function copyFile(path, directory) {
  assert.ok(publicPath(path), 'Only public files may be copied');
  let current = root;
  for (const part of path.split('/')) {
    current = join(current, part);
    assert.ok(!lstatSync(current).isSymbolicLink(), 'Public files must not traverse symlinks');
  }
  assert.ok(lstatSync(current).isFile());
  const contents = readFileSync(current);
  originals.set(path, hash(contents));
  mkdirSync(dirname(join(directory, path)), { recursive: true });
  copyFileSync(current, join(directory, path));
}
function copySources(path, directory) {
  for (const entry of readdirSync(join(root, path), { withFileTypes: true })) {
    const child = `${path}/${entry.name}`;
    if (!publicPath(child)) continue;
    assert.ok(!entry.isSymbolicLink(), 'Source symlinks are not public copies');
    if (entry.isDirectory()) copySources(child, directory);
    else if (entry.isFile() && /\.ts$/.test(child)) copyFile(child, directory);
  }
}
function uniqueIndex(text, anchor) {
  const index = text.indexOf(anchor);
  assert.ok(index >= 0 && text.indexOf(anchor, index + anchor.length) === -1, `Non-unique anchor: ${anchor}`);
  return index;
}
function expectedAssertion(test, scenario, directory) {
  let assertion;
  if (scenario.title === 'accepts local with claude') {
    assertion = 'expect(capability.DevelopmentSessionBindingSchema.safeParse({ ...binding, target, engines }).success).toBe(true);';
    assert.ok(test.includes('it(`accepts ${target.kind} with ${engines.join(\'+\')}`'));
  } else {
    const start = uniqueIndex(test, `it('${scenario.title}',`);
    assertion = test.slice(start, test.indexOf('\n  });', start)).split('\n').find((line) => line.trim().startsWith('expect(')).trim();
  }
  const index = uniqueIndex(test, assertion);
  const matcher = index + assertion.indexOf('.toBe') + 1;
  return { file: join(directory, testPath), title: scenario.title, fullName: prefix + scenario.title,
    line: test.slice(0, matcher).split('\n').length, column: matcher - test.lastIndexOf('\n', matcher), expected: scenario.expected };
}
function validateReport(report, exit, expected, red) {
  assert.equal(exit, red ? 1 : 0, 'Unexpected process exit');
  assert.equal(report.success, !red);
  assert.equal(report.numPassedTests, red ? 0 : 1);
  assert.equal(report.numFailedTests, red ? 1 : 0);
  assert.equal(report.numRuntimeErrorTestSuites ?? 0, 0);
  assert.deepEqual(report.unhandledErrors ?? [], []);
  assert.equal(report.testResults.length, 1);
  const suite = report.testResults[0];
  assert.equal(suite.name, expected.file);
  assert.equal(suite.status, red ? 'failed' : 'passed');
  assert.equal(suite.message, '', 'Collection/runtime error');
  const active = suite.assertionResults.filter((test) => ['passed', 'failed'].includes(test.status));
  assert.equal(active.length, 1, 'Exactly one active test is required');
  const test = active[0];
  assert.equal(test.fullName, expected.fullName);
  assert.equal(test.title, expected.title);
  assert.deepEqual(test.ancestorTitles, ['development session']);
  assert.equal(test.status, red ? 'failed' : 'passed');
  if (!red) { assert.deepEqual(test.failureMessages, []); return; }
  assert.equal(test.failureMessages.length, 1);
  const [message, ...stack] = test.failureMessages[0].split('\n');
  assert.equal(message, `AssertionError: expected ${!expected.expected} to be ${expected.expected} // Object.is equality`);
  const application = stack.filter((line) => line.trim().startsWith('at ')).find((line) =>
    !line.includes('/node_modules/') && !line.includes('node:internal/') && line.trim() !== 'at new Promise (<anonymous>)');
  assert.equal(application, `    at ${expected.file}:${expected.line}:${expected.column}`, 'Wrong first application assertion frame');
}
function readerChecks(green, red, expected) {
  let count = 0;
  const checks = [
    ['zero active', (r) => { r.testResults[0].assertionResults.forEach((t) => { t.status = 'pending'; }); }],
    ['wrong title', (r) => { r.testResults[0].assertionResults.find((t) => t.status === 'failed').fullName += ' other'; }],
    ['wrong file', (r) => { r.testResults[0].name += '.other'; }],
    ['runtime error', (r) => { r.numRuntimeErrorTestSuites = 1; }],
    ['unhandled error', (r) => { r.unhandledErrors = [{ message: 'runtime error' }]; }],
    ['collection error', (r) => { r.testResults[0].message = 'Cannot find module'; }],
    ['wrong frame', (r) => { const t = r.testResults[0].assertionResults.find((t) => t.status === 'failed'); t.failureMessages[0] = t.failureMessages[0].replace(expected.file, `${expected.file}.other`); }],
    ['wrong assertion', (r) => { r.testResults[0].assertionResults.find((t) => t.status === 'failed').failureMessages = ['TypeError: broken']; }],
  ];
  for (const [name, change] of checks) {
    const copy = structuredClone(red); change(copy);
    assert.throws(() => validateReport(copy, 1, expected, true), { name: 'AssertionError' }, name); count++;
  }
  assert.throws(() => validateReport(structuredClone(green), 1, expected, true)); count++;
  assert.throws(() => validateReport(structuredClone(red), 0, expected, true)); count++;
  return { passed: count, total: checks.length + 2 };
}
function run(directory, scenario, phase, expected) {
  const reportPath = join(directory, `${scenario.id}-${phase}.json`);
  const pattern = `^${expected.fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`;
  const child = spawnSync(process.execPath, [join(root, 'node_modules/vitest/vitest.mjs'), 'run', testPath,
    '-t', pattern, '--maxWorkers=1', '--no-cache', '--reporter=json', `--outputFile=${reportPath}`],
  { cwd: directory, encoding: 'utf8' });
  assert.ifError(child.error);
  assert.equal(child.signal, null, 'Test process was interrupted');
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  validateReport(report, child.status, expected, phase === 'mutant');
  return report;
}

assert.equal(process.argv.length, 2, 'Invoke without flags');
assert.equal(JSON.parse(readFileSync(join(root, 'node_modules/vitest/package.json'), 'utf8')).version, '3.2.4');
// Vitest reports canonical paths (macOS: /private/var, not /var), so resolve the temp root first.
const directory = mkdtempSync(join(realpathSync(tmpdir()), 'development-session-mutation-'));
let caught = 0;
let phases = 0;
let readers;
try {
  copySources('src', directory);
  for (const path of [source, barrel, testPath, mutationPath, 'tests/setup.ts', 'package.json', 'vitest.config.ts',
    ...readdirSync(root).filter((name) => /^tsconfig(?:\.[^/]*)?\.json$/.test(name))]) copyFile(path, directory);
  symlinkSync(resolve(root, 'node_modules'), join(directory, 'node_modules'), 'dir');
  const test = readFileSync(join(directory, testPath), 'utf8');
  for (const scenario of scenarios) {
    const file = join(directory, scenario.file);
    const original = readFileSync(file, 'utf8');
    const index = uniqueIndex(original, scenario.anchor);
    const expected = expectedAssertion(test, scenario, directory);
    const green = run(directory, scenario, 'baseline', expected); phases++;
    let red;
    try {
      writeFileSync(file, original.slice(0, index) + scenario.replacement + original.slice(index + scenario.anchor.length));
      red = run(directory, scenario, 'mutant', expected); phases++; caught++;
    } finally {
      writeFileSync(file, original);
      assert.equal(hash(readFileSync(file)), hash(original));
    }
    run(directory, scenario, 'restored', expected); phases++;
    if (!readers) readers = readerChecks(green, red, expected);
  }
  assert.equal(caught, scenarios.length);
  assert.equal(phases, 3 * scenarios.length);
  console.log(`${caught}/${scenarios.length} mutants caught; ${phases}/${3 * scenarios.length} valid phases; reader checks ${readers.passed}/${readers.total}`);
  console.log(`Public copies and real Vitest JSON reports: ${directory}`);
} finally {
  for (const [path, before] of originals) assert.equal(hash(readFileSync(join(root, path))), before, `Live source changed: ${path}`);
}
