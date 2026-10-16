import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
// Adapted from experience-receipt.mutation.mjs (179); it is an executable,
// so importing it would run its protocol as an unwanted side effect.
const sourcePath = 'src/organization/publication-operations.ts';
const publish = 'isPublishMaterialResponseForRequest';
const resolveMaterial = 'isResolveMaterialResponseForRequest';
const publishTest = 'tests/organization/publish-material-correlation.test.ts';
const resolveTest = 'tests/organization/resolve-material-correlation.test.ts';
const scenarios = [
  ...['context', 'sourceScope', 'slug', 'recipient.kind', 'recipient.id', 'digest', 'explicit'].map(field => ({
    id: `publish-${field}`, suite: publish, testPath: publishTest,
    title: field === 'explicit' ? 'rejects team explicit true versus false'
      : `rejects a valid receipt differing only in ${field === 'context' ? 'context.ownerId' : field}`,
    anchor: field === 'context'
      ? 'JSON.stringify(ref.context) === JSON.stringify(material.context)'
      : `&& ref.${field} === material.${field}`,
    replacement: field === 'context' ? 'true' : '',
    assertion: `expect(isPublishMaterialResponseForRequest(other, ${field === 'explicit' ? 'teamRequest' : 'request'})).toBe(false);`,
  })),
  {
    id: 'resolve-ref', suite: resolveMaterial, testPath: resolveTest,
    title: 'rejects reference mismatch in slug',
    anchor: 'JSON.stringify(response.data.ref) === JSON.stringify(request.data.ref)', replacement: 'true',
    assertion: 'expect(ResolveMaterialResponseSchema.safeParse(other).success).toBe(true);\n    expect(isResolveMaterialResponseForRequest(other, request)).toBe(false);\n  });\n\n  it(\'rejects response digest',
  },
  {
    id: 'resolve-digest', suite: resolveMaterial, testPath: resolveTest,
    title: 'rejects response digest differing from requested reference digest',
    anchor: '&& response.data.digest === request.data.ref.digest', replacement: '',
    assertion: "const other = { ...response, digest: 'b'.repeat(64) };\n    expect(ResolveMaterialResponseSchema.safeParse(other).success).toBe(true);\n    expect(isResolveMaterialResponseForRequest(other, request)).toBe(false);",
  },
  {
    id: 'resolve-status', suite: resolveMaterial, testPath: resolveTest,
    title: 'rejects refusal revoked',
    anchor: " || response.data.status !== 'ok'", replacement: '',
    assertion: 'expect(isResolveMaterialResponseForRequest(refusal, request)).toBe(false);',
  },
  {
    id: 'resolve-validation', suite: resolveMaterial, testPath: resolveTest,
    title: 'rejects invalid response 2',
    anchor: 'const response = ResolveMaterialResponseSchema.safeParse(raw);\n  const request = ResolveMaterialRequestSchema.safeParse(expected);',
    replacement: 'const response = { success: true, data: raw };\n  const request = { success: true, data: expected };',
    assertion: 'expect(isResolveMaterialResponseForRequest(raw, request)).toBe(false);',
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
  const matcher = index + scenario.assertion.lastIndexOf('.toBe(false)') + 1;
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
// from the recordId mutant recorded by runner 179. Unknown matcher/stack formats fail closed.
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
  assert.deepEqual(test.ancestorTitles, [expected.suite]);
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
  const expected = { file: join(directory, publishTest), suite: publish, title: scenarios[0].title, fullName: publish + ' ' + scenarios[0].title, line: 79, column: 65 };
  const failure = `${booleanFailure}\n    at ${expected.file}:79:65`;
  const make = (red = true) => ({
    success: !red, numPassedTests: red ? 0 : 1, numFailedTests: red ? 1 : 0,
    testResults: [{ name: expected.file, status: red ? 'failed' : 'passed', message: '', assertionResults: [{
      fullName: expected.fullName, title: expected.title, ancestorTitles: [expected.suite],
      status: red ? 'failed' : 'passed', failureMessages: red ? [failure] : [],
    }] }],
  });
  const checks = [];
  function check(name, run) { run(); checks.push(name); }
  check('observed boolean failure', () => validateReport(make(), 1, expected, true));
  check('green report', () => validateReport(make(false), 0, expected, false));
  const rejects = [
    ['success mismatch', r => { r.success = true; }],
    ['passed counter mismatch', r => { r.numPassedTests = 1; }],
    ['runtime suite counter', r => { r.numRuntimeErrorTestSuites = 1; }],
    ['wrong file', r => { r.testResults[0].name += '.other'; }],
    ['wrong suite status', r => { r.testResults[0].status = 'passed'; }],
    ['wrong short title', r => { r.testResults[0].assertionResults[0].title += ' other'; }],
    ['wrong ancestor', r => { r.testResults[0].assertionResults[0].ancestorTitles = ['other']; }],
    ['wrong test status', r => { r.testResults[0].assertionResults[0].status = 'passed'; }],
    ['missing heading', r => { r.testResults[0].assertionResults[0].failureMessages = [failure.replace('AssertionError: ', '')]; }],
    ['generic Error heading', r => { r.testResults[0].assertionResults[0].failureMessages = [failure.replace('AssertionError:', 'Error:')]; }],
    ['missing failure', r => { r.testResults[0].assertionResults[0].failureMessages = []; }],
    ['duplicate failure', r => { r.testResults[0].assertionResults[0].failureMessages.push(failure); }],
    ['missing frame', r => { r.testResults[0].assertionResults[0].failureMessages = [booleanFailure]; }],
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
    const report = make();
    validateReport(report, 1, expected, true);
    const original = structuredClone(report);
    change(report);
    assert.throws(() => validateReport(report, 1, expected, true), { name: 'AssertionError' });
    validateReport(original, 1, expected, true);
  });
  check('pending tests do not count as executed', () => {
    const report = make();
    report.testResults[0].assertionResults.push({ status: 'pending', title: 'not selected' });
    validateReport(report, 1, expected, true);
  });
  check('green failure messages rejected and restored', () => {
    const report = make(false);
    validateReport(report, 0, expected, false);
    report.testResults[0].assertionResults[0].failureMessages = [failure];
    assert.throws(() => validateReport(report, 0, expected, false), { name: 'AssertionError' });
    report.testResults[0].assertionResults[0].failureMessages = [];
    validateReport(report, 0, expected, false);
  });
  check('wrong exit', () => assert.throws(() => validateReport(make(), 2, expected, true)));
  check('missing anchor', () => assert.throws(() => mutate('missing', scenarios[0])));
  check('duplicate anchor', () => assert.throws(() => mutate(scenarios[0].anchor.repeat(2), scenarios[0])));
  check('all eleven unique mutations and restoration', () => {
    const original = readFileSync(join(root, sourcePath), 'utf8');
    const file = join(directory, 'restore.ts');
    const hashes = new Set();
    for (const scenario of scenarios) {
      const test = readFileSync(join(root, scenario.testPath), 'utf8');
      const position = assertionPosition(test, scenario);
      assert.ok(position.line > 0 && position.column > 0);
      for (const invalid of ['missing', scenario.assertion.repeat(2)]) {
        assert.throws(() => assertionPosition(invalid, scenario), { name: 'AssertionError' });
      }
      assert.deepEqual(assertionPosition(test, scenario), position);
      for (const invalid of ['missing', scenario.anchor.repeat(2)]) {
        assert.throws(() => mutate(invalid, scenario), { name: 'AssertionError' });
      }
      const changed = mutate(original, scenario);
      assert.notEqual(hash(changed), hash(original)); hashes.add(hash(changed));
      writeFileSync(file, changed);
      assert.throws(() => assertRestored(file, original), { name: 'AssertionError' });
      restore(file, original);
      assert.equal(readFileSync(file, 'utf8'), original);
    }
    assert.equal(hashes.size, 11);
  });
  check('private paths excluded', () => {
    for (const path of ['src/.env.local', 'src/secrets/value.ts', 'src/private.key', 'src/token.ts', 'dist/index.js', '../src/index.ts']) assert.equal(publicFile(path), false);
  });
  return { mode: 'self-test', passed: checks.length, total: checks.length, checks };
}

function protocol(directory, summary, save) {
  assert.ok(process.env.QRUN, 'Export QRUN pointing to the silent executor');
  const workspace = join(directory, 'bridge'); mkdirSync(workspace);
  copyPublic(workspace);
  const file = join(workspace, sourcePath);
  const original = readFileSync(file, 'utf8');
  summary.sourceHash = hash(original);
  summary.testHashes = Object.fromEntries([publishTest, resolveTest].map(path => [path, hash(readFileSync(join(workspace, path)))]));
  for (const scenario of scenarios) {
    mutate(original, scenario);
    assertionPosition(readFileSync(join(workspace, scenario.testPath), 'utf8'), scenario);
  }
  for (const scenario of scenarios) {
    const test = readFileSync(join(workspace, scenario.testPath), 'utf8');
    const expected = { ...assertionPosition(test, scenario), file: realpathSync(join(workspace, scenario.testPath)),
      suite: scenario.suite, title: scenario.title, fullName: scenario.suite + ' ' + scenario.title };
    const entry = { id: scenario.id, expected, phases: [] };
    summary.scenarios.push(entry);
    function phase(name, red) {
      const report = join(directory, `${scenario.id}-${name}.json`);
      const log = join(directory, `${scenario.id}-${name}.log`);
      const args = ['-C', workspace, 'exec', 'vitest', 'run', scenario.testPath, '-t',
        `^${expected.fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, '--maxWorkers=1', '--no-cache',
        '--configLoader=runner', '--reporter=json', `--outputFile=${report}`];
      const before = hash(readFileSync(file));
      const command = ['pnpm', ...args];
      const shellCommand = command.map(value => "'" + value.replaceAll("'", "'\"'\"'") + "'").join(' ');
      const child = spawnSync(process.env.QRUN, [shellCommand], { cwd: workspace, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
      writeFileSync(log, `${child.stdout ?? ''}\n${child.stderr ?? ''}\n${child.error?.message ?? ''}`);
      const record = { phase: name, sha: summary.sha, command, executor: process.env.QRUN, shellCommand,
        exit: child.status, signal: child.signal, sourceHash: before, sourceHashAfter: hash(readFileSync(file)),
        testHash: hash(readFileSync(join(workspace, scenario.testPath))), fullName: expected.fullName, report, log, verified: false };
      entry.phases.push(record); save();
      try {
        assert.equal(record.sourceHashAfter, before, 'Source changed during test');
        assert.equal(record.testHash, summary.testHashes[scenario.testPath], 'Test changed during test');
        assert.equal(child.signal, null); assert.equal(child.error, undefined);
        const result = JSON.parse(readFileSync(report, 'utf8'));
        record.reportHash = hash(readFileSync(report));
        record.logHash = hash(readFileSync(log));
        validateReport(result, child.status, expected, red);
        record.verified = true;
      } catch (error) {
        // A survivor, missing report, import failure or crash is a gap, never a kill.
        record.gap = { name: error.name, reason: error.message };
      }
      save();
      return record.verified;
    }
    const baseline = phase('baseline', false);
    try {
      if (baseline) {
        writeFileSync(file, mutate(original, scenario));
        phase('mutant', true);
      } else entry.gap = 'Baseline failed; mutant not attempted';
    } finally {
      restore(file, original);
      entry.restoredHash = hash(readFileSync(file)); save();
      phase('restored', false);
    }
  }
  summary.mutants = { proved: summary.scenarios.filter(s => s.phases.length === 3 && s.phases.every(p => p.verified)).length, total: 11 };
  summary.phases = { proved: summary.scenarios.flatMap(s => s.phases).filter(p => p.verified).length, total: 33 };
  save();
  assert.equal(summary.mutants.proved, 11, 'Unproved mutants: inspect recorded gaps');
  assert.equal(summary.phases.proved, 33);
}

const directory = realpathSync(mkdtempSync(join(tmpdir(), 'material-receipt-mutation-')));
const summaryPath = join(directory, 'summary.json');
const summary = { mode: 'protocol', sha: git(['rev-parse', 'HEAD']).trim(), node: process.version, scenarios: [], completed: false };
const save = () => writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n');
try {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--self-test'), 'Only --self-test is supported');
  if (process.argv[2] === '--self-test') Object.assign(summary, selfTest(directory));
  else protocol(directory, summary, save);
  summary.completed = true; save();
  console.log(`summary: ${summaryPath}`);
  console.log(summary.mode === 'self-test' ? `self-test ${summary.passed}/${summary.total}` : 'mutants 11/11; phases 33/33');
} catch (error) {
  summary.error = { name: error.name, message: error.message }; save();
  console.error(`Protocol failed; summary: ${summaryPath}`);
  process.exitCode = 1;
}
