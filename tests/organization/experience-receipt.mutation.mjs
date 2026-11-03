import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const sourcePath = 'src/organization/experience.ts';
const testPath = 'tests/organization/experience-receipt-correlation.test.ts';
const prefix = 'isExperienceReceiptForEvent ';
const scenarios = [
  ...['recordId', 'version', 'digest'].map(field => ({
    id: field,
    title: `rejects an individually valid receipt with different ${field}`,
    anchor: `&& receipt.data.${field} === event.data.${field}`,
    replacement: '',
    assertion: 'expect(isExperienceReceiptForEvent(other, runOutcomeEvent)).toBe(false);',
  })),
  {
    id: 'receipt-safeParse',
    title: 'rejects invalid disposition with matching correlation fields',
    anchor: 'const receipt = ExperienceReceiptSchema.safeParse(raw);',
    replacement: 'const receipt = { success: true, data: raw };',
    assertion: "expect(isExperienceReceiptForEvent({ ...receipt, disposition: 'pending' }, runOutcomeEvent)).toBe(false);",
  },
  {
    id: 'event-safeParse',
    title: 'rejects invalid expected with matching correlation fields',
    anchor: 'const event = OrganizationExperienceEventSchema.safeParse(expected);',
    replacement: 'const event = { success: true, data: expected };',
    assertion: "expect(isExperienceReceiptForEvent(receipt, { ...runOutcomeEvent, tenantId: '' })).toBe(false);",
  },
];
const hash = value => createHash('sha256').update(value).digest('hex');
function uniqueIndex(text, anchor) {
  const index = text.indexOf(anchor);
  assert.ok(index >= 0 && text.indexOf(anchor, index + anchor.length) === -1, 'Anchor must occur exactly once');
  return index;
}
function mutate(text, scenario) {
  const index = uniqueIndex(text, scenario.anchor);
  return text.slice(0, index) + scenario.replacement + text.slice(index + scenario.anchor.length);
}
function assertionPosition(test, scenario) {
  const index = uniqueIndex(test, scenario.assertion);
  const matcher = index + scenario.assertion.indexOf('.toBe') + 1;
  return { line: test.slice(0, matcher).split('\n').length, column: matcher - test.lastIndexOf('\n', matcher) };
}
function assertRestored(file, original) {
  assert.equal(hash(readFileSync(file)), hash(original), 'Restored source hash mismatch');
}
function restore(file, original) {
  writeFileSync(file, original);
  assertRestored(file, original);
}
function publicFile(path) {
  // Allow only the public source/test/config hierarchy, never private material or generated output.
  return /^(?:src\/|tests\/|package\.json$|tsconfig[^/]*\.json$|vitest[^/]*\.config\.ts$)/.test(path)
    && !path.split('/').some(part => /^(?:\.|\.\.|\.env.*|secrets?|dist|coverage|vendor|node_modules)$/i.test(part)
      || /(?:key|token|credential|lock|migration|fixture|dump|seed)/i.test(part))
    && !/\.(?:pem|p12|pfx|crt|cer|der)$/i.test(path);
}
function git(args) {
  const child = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  assert.equal(child.status, 0, 'Git metadata unavailable');
  return child.stdout;
}
function copyPublic(destination) {
  for (const path of git(['ls-files', '-z']).split('\0').filter(Boolean).filter(publicFile)) {
    assert.ok(!path.startsWith('/') && !path.split('/').includes('..'));
    const original = join(root, path);
    // Reject symlinked directories as well as symlinked files before reading anything.
    let current = root;
    for (const part of path.split('/')) {
      current = join(current, part);
      assert.ok(!lstatSync(current).isSymbolicLink(), 'Tracked public files must not traverse symlinks');
    }
    assert.ok(lstatSync(original).isFile());
    mkdirSync(dirname(join(destination, path)), { recursive: true });
    copyFileSync(original, join(destination, path));
  }
  symlinkSync(join(root, 'node_modules'), join(destination, 'node_modules'), 'dir');
}

// Exact message and V8 frame format observed in the Vitest 3.2.4 JSON report
// from the recordId mutant. Unknown matcher/stack formats fail closed.
const booleanFailure = 'AssertionError: expected true to be false // Object.is equality';
function validateReport(report, exit, expected, red) {
  assert.equal(exit, red ? 1 : 0, 'Unexpected process exit');
  assert.equal(report.success, !red);
  assert.equal(report.numPassedTests, red ? 0 : 1);
  assert.equal(report.numFailedTests, red ? 1 : 0);
  assert.equal(report.numRuntimeErrorTestSuites ?? 0, 0);
  assert.deepEqual(report.unhandledErrors ?? [], []);
  assert.equal(report.testResults.length, 1, 'Exactly one test file required');
  const suite = report.testResults[0];
  assert.equal(suite.name, expected.file);
  assert.equal(suite.status, red ? 'failed' : 'passed');
  assert.equal(suite.message, '', 'Suite/runtime error');
  const executed = suite.assertionResults.filter(test => ['passed', 'failed'].includes(test.status));
  assert.equal(executed.length, 1, 'Exactly one executed test required');
  const test = executed[0];
  assert.equal(test.fullName, expected.fullName);
  assert.equal(test.title, expected.title);
  assert.deepEqual(test.ancestorTitles, ['isExperienceReceiptForEvent']);
  assert.equal(test.status, red ? 'failed' : 'passed');
  if (!red) { assert.deepEqual(test.failureMessages, []); return; }
  assert.equal(test.failureMessages.length, 1);
  const [message, ...stack] = test.failureMessages[0].split('\n');
  assert.equal(message, booleanFailure);
  const frames = stack.filter(line => line.trim().startsWith('at '));
  const application = frames.find(frame => !frame.includes('/node_modules/')
    && !frame.includes('node:internal/') && frame.trim() !== 'at new Promise (<anonymous>)');
  assert.equal(application, `    at ${expected.file}:${expected.line}:${expected.column}`,
    'First application frame must be the selected boolean assertion');
}

function selfTest(directory) {
  const expected = { file: join(directory, testPath), title: scenarios[0].title, fullName: prefix + scenarios[0].title, line: 79, column: 65 };
  const failure = `${booleanFailure}\n    at ${expected.file}:79:65`;
  const make = (red = true) => ({
    success: !red, numPassedTests: red ? 0 : 1, numFailedTests: red ? 1 : 0,
    testResults: [{ name: expected.file, status: red ? 'failed' : 'passed', message: '', assertionResults: [{
      fullName: expected.fullName, title: expected.title, ancestorTitles: ['isExperienceReceiptForEvent'],
      status: red ? 'failed' : 'passed', failureMessages: red ? [failure] : [],
    }] }],
  });
  const checks = [];
  function check(name, run) { run(); checks.push(name); }
  check('observed boolean failure', () => validateReport(make(), 1, expected, true));
  check('green report', () => validateReport(make(false), 0, expected, false));
  const rejects = [
    ['import failure', r => { r.testResults[0].message = 'Cannot find module'; }],
    ['runtime TypeError', r => { r.testResults[0].assertionResults[0].failureMessages = ['TypeError: invalid input']; }],
    ['zero executed', r => { r.testResults[0].assertionResults[0].status = 'pending'; }],
    ['foreign title', r => { r.testResults[0].assertionResults[0].fullName += ' foreign'; }],
    ['foreign frame', r => { r.testResults[0].assertionResults[0].failureMessages = [`${booleanFailure}\n    at ${directory}/src/wrong.ts:1:1\n    at ${expected.file}:79:65`]; }],
    ['wrong assertion line', r => { r.testResults[0].assertionResults[0].failureMessages = [failure.replace(':79:65', ':78:65')]; }],
    ['wrong assertion column', r => { r.testResults[0].assertionResults[0].failureMessages = [failure.replace(':79:65', ':79:64')]; }],
    ['wrong boolean expectation', r => { r.testResults[0].assertionResults[0].failureMessages = [failure.replace('true to be false', 'false to be true')]; }],
    ['two executed', r => { r.testResults[0].assertionResults.push(structuredClone(r.testResults[0].assertionResults[0])); }],
    ['unhandled error', r => { r.unhandledErrors = ['runtime failure']; }],
    ['counter mismatch', r => { r.numFailedTests = 0; }],
    ['second suite', r => { r.testResults.push(structuredClone(r.testResults[0])); }],
  ];
  for (const [name, change] of rejects) check(name, () => {
    const report = make(); change(report);
    assert.throws(() => validateReport(report, 1, expected, true), { name: 'AssertionError' });
  });
  check('wrong exit', () => assert.throws(() => validateReport(make(), 2, expected, true)));
  check('missing anchor', () => assert.throws(() => mutate('missing', scenarios[0])));
  check('duplicate anchor', () => assert.throws(() => mutate(scenarios[0].anchor.repeat(2), scenarios[0])));
  check('all five unique mutations and restoration', () => {
    const original = readFileSync(join(root, sourcePath), 'utf8');
    const file = join(directory, 'restore.ts');
    const hashes = new Set();
    for (const scenario of scenarios) {
      const changed = mutate(original, scenario);
      assert.notEqual(hash(changed), hash(original)); hashes.add(hash(changed));
      writeFileSync(file, changed);
      assert.throws(() => assertRestored(file, original), { name: 'AssertionError' });
      restore(file, original);
      assert.equal(readFileSync(file, 'utf8'), original);
    }
    assert.equal(hashes.size, 5);
  });
  check('private paths excluded', () => {
    for (const path of ['src/.env.local', 'src/secrets/value.ts', 'src/private.key', 'src/token.ts', 'dist/index.js', '../src/index.ts']) assert.equal(publicFile(path), false);
  });
  return { mode: 'self-test', passed: checks.length, total: checks.length, checks };
}

function protocol(directory, summary, save) {
  const workspace = join(directory, 'bridge'); mkdirSync(workspace);
  copyPublic(workspace);
  const file = join(workspace, sourcePath);
  const original = readFileSync(file, 'utf8');
  const test = readFileSync(join(workspace, testPath), 'utf8');
  summary.sourceHash = hash(original);
  summary.testHash = hash(test);
  // Validate every anchor before starting any test process.
  for (const scenario of scenarios) { mutate(original, scenario); assertionPosition(test, scenario); }
  for (const scenario of scenarios) {
    const expected = { ...assertionPosition(test, scenario), file: realpathSync(join(workspace, testPath)), title: scenario.title, fullName: prefix + scenario.title };
    const entry = { id: scenario.id, fullName: expected.fullName, phases: [] };
    summary.scenarios.push(entry);
    function phase(name, red) {
      const report = join(directory, `${scenario.id}-${name}.json`);
      const log = join(directory, `${scenario.id}-${name}.log`);
      const args = ['-C', workspace, 'exec', 'vitest', 'run', testPath, '-t', `^${expected.fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, '--maxWorkers=1', '--no-cache', '--configLoader=runner', '--reporter=json', `--outputFile=${report}`];
      const before = hash(readFileSync(file));
      const child = spawnSync('pnpm', args, { cwd: workspace, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
      writeFileSync(log, `${child.stdout ?? ''}\n${child.stderr ?? ''}\n${child.error?.message ?? ''}`);
      const record = { phase: name, sha: summary.sha, command: ['pnpm', ...args], exit: child.status, signal: child.signal, sourceHash: before, sourceHashAfter: hash(readFileSync(file)), fullName: expected.fullName, report, log, verified: false };
      entry.phases.push(record); save();
      assert.equal(record.sourceHashAfter, before);
      assert.equal(child.signal, null); assert.equal(child.error, undefined);
      validateReport(JSON.parse(readFileSync(report, 'utf8')), child.status, expected, red);
      record.verified = true; save();
    }
    phase('baseline', false);
    try {
      writeFileSync(file, mutate(original, scenario));
      phase('mutant', true);
    } finally {
      restore(file, original);
      entry.restoredHash = hash(readFileSync(file)); save();
      phase('restored', false);
    }
  }
  assert.equal(summary.scenarios.filter(s => s.phases.length === 3 && s.phases.every(p => p.verified)).length, 5);
  summary.mutants = { proved: 5, total: 5 };
  summary.phases = { proved: 15, total: 15 };
}

const directory = realpathSync(mkdtempSync(join(tmpdir(), 'experience-receipt-mutation-')));
const summaryPath = join(directory, 'summary.json');
const summary = { mode: 'protocol', sha: git(['rev-parse', 'HEAD']).trim(), node: process.version, scenarios: [], completed: false };
const save = () => writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n');
try {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--self-test'), 'Only --self-test is supported');
  if (process.argv[2] === '--self-test') Object.assign(summary, selfTest(directory));
  else protocol(directory, summary, save);
  summary.completed = true; save();
  console.log(`summary: ${summaryPath}`);
  console.log(summary.mode === 'self-test' ? `self-test ${summary.passed}/${summary.total}` : 'mutants 5/5; phases 15/15');
} catch (error) {
  summary.error = { name: error.name, message: error.message }; save();
  console.error(`Protocol failed; summary: ${summaryPath}`);
  process.exitCode = 1;
}
