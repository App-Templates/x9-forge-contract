import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Adapted from the non-exported protocol in experience-receipt.mutation.mjs.
const root = fileURLToPath(new URL('../../../', import.meta.url));
const sourcePath = 'src/http/endpoints/internal-memory-knowledge.ts';
const testPath = 'tests/http/endpoints/internal-memory-knowledge-correlation.test.ts';
const scenarios = ['publish', 'withdraw'].flatMap(operation => {
  const kind = operation === 'publish' ? 'Publish' : 'Withdraw';
  const ref = operation === 'publish' ? 'publication.ref' : 'ref';
  const common = { operation, helper: `isKnowledge${kind}ReceiptForRequest` };
  return [
    ...['slug', 'version', 'digest'].map(field => ({
      ...common, id: `${operation}-${field}`, title: `rejects mismatched ${field}`,
      anchor: `&& receipt.data.${field} === request.data.${ref}.${field}`,
      replacement: '', assertion: 'expect(correlate(mismatched, request)).toBe(false);',
    })),
    {
      ...common, id: `${operation}-raw`, title: 'rejects extra field in receipt or expected payload',
      anchor: 'const receipt = InternalMemoryKnowledgeReceiptSchema.safeParse(raw);',
      replacement: 'const receipt = { success: true, data: raw };',
      assertion: 'expect(correlate({ ...receipt, extra: true }, request)).toBe(false);',
    },
    {
      ...common, id: `${operation}-expected`, title: 'rejects extra field in receipt or expected payload',
      anchor: `const request = InternalMemoryKnowledge${kind}RequestSchema.safeParse(expected);`,
      replacement: 'const request = { success: true, data: expected };',
      assertion: 'expect(correlate(receipt, { ...request, extra: true })).toBe(false);',
    },
  ];
});
const hash = value => createHash('sha256').update(value).digest('hex');
function uniqueIndex(text, anchor) {
  const index = text.indexOf(anchor);
  assert.ok(index >= 0 && text.indexOf(anchor, index + anchor.length) === -1, 'Anchor must occur exactly once');
  return index;
}
function mutate(text, scenario) {
  const start = uniqueIndex(text, `export function ${scenario.helper}(raw: unknown, expected: unknown): boolean {`);
  const end = text.indexOf('\n}', start);
  assert.ok(end > start, 'Helper end missing');
  const body = text.slice(start, end);
  const index = start + uniqueIndex(body, scenario.anchor);
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
// Named gates let the self-test remove every guard independently. Production
// always uses all guards; the selector is private to the synthetic self-test.
function validateReport(report, exit, expected, red, select = () => true) {
  function gate(id, valid) { if (select(id)) assert.ok(valid, id); }
  gate('exit', exit === (red ? 1 : 0));
  gate('success', report.success === !red);
  gate('passed', report.numPassedTests === (red ? 0 : 1));
  gate('failed', report.numFailedTests === (red ? 1 : 0));
  gate('runtime', (report.numRuntimeErrorTestSuites ?? 0) === 0);
  gate('unhandled', Array.isArray(report.unhandledErrors ?? []) && (report.unhandledErrors ?? []).length === 0);
  gate('suites', Array.isArray(report.testResults) && report.testResults.length === 1);
  const suite = report.testResults?.[0];
  gate('file', suite?.name === expected.file);
  gate('suite-status', suite?.status === (red ? 'failed' : 'passed'));
  gate('suite-message', suite?.message === '');
  const results = suite?.assertionResults;
  gate('results', Array.isArray(results));
  gate('statuses', Array.isArray(results) && results.every(t => ['passed', 'failed', 'pending', 'skipped', 'todo', 'disabled'].includes(t.status)));
  const executed = Array.isArray(results) ? results.filter(t => ['passed', 'failed'].includes(t.status)) : [];
  gate('executed', executed.length === 1);
  const test = executed[0];
  gate('full-name', test?.fullName === expected.fullName);
  gate('title', test?.title === expected.title);
  gate('heading', JSON.stringify(test?.ancestorTitles) === JSON.stringify([expected.heading]));
  gate('test-status', test?.status === (red ? 'failed' : 'passed'));
  gate('messages', Array.isArray(test?.failureMessages) && test.failureMessages.length === (red ? 1 : 0));
  if (!red) return;
  const [message, ...stack] = typeof test?.failureMessages?.[0] === 'string' ? test.failureMessages[0].split('\n') : [];
  gate('assertion-error', message === booleanFailure);
  const application = stack.filter(line => line.trim().startsWith('at ')).find(frame => !frame.includes('/node_modules/')
    && !frame.includes('node:internal/') && frame.trim() !== 'at new Promise (<anonymous>)');
  gate('frame', application === `    at ${expected.file}:${expected.line}:${expected.column}`);
}

function selfTest(directory) {
  const expected = { file: join(directory, testPath), title: scenarios[0].title,
    heading: 'publish receipt correlation', fullName: 'publish receipt correlation ' + scenarios[0].title, line: 79, column: 65 };
  const failure = `${booleanFailure}\n    at ${expected.file}:79:65`;
  const make = (red = true) => ({
    success: !red, numPassedTests: red ? 0 : 1, numFailedTests: red ? 1 : 0,
    testResults: [{ name: expected.file, status: red ? 'failed' : 'passed', message: '', assertionResults: [{
      fullName: expected.fullName, title: expected.title, ancestorTitles: [expected.heading],
      status: red ? 'failed' : 'passed', failureMessages: red ? [failure] : [],
    }] }],
  });
  const checks = [];
  function check(name, run) { run(); checks.push(name); }
  const suite = r => r.testResults[0];
  const test = r => suite(r).assertionResults[0];
  const negatives = [
    ['exit', () => {}, 2],
    ['success', r => { r.success = true; }],
    ['passed', r => { r.numPassedTests = 1; }],
    ['failed', r => { r.numFailedTests = 0; }],
    ['runtime', r => { r.numRuntimeErrorTestSuites = 1; }],
    ['unhandled', r => { r.unhandledErrors = ['Error: failure']; }],
    ['suites', r => { r.testResults.push(structuredClone(suite(r))); }],
    ['file', r => { suite(r).name += '.foreign'; }],
    ['suite-status', r => { suite(r).status = 'passed'; }],
    ['suite-message', r => { suite(r).message = 'Cannot find module'; }],
    ['results', r => { suite(r).assertionResults = null; }],
    ['statuses', r => { suite(r).assertionResults.push({ status: 'foreign' }); }],
    ['executed', r => { suite(r).assertionResults = []; }],
    ['full-name', r => { test(r).fullName += ' foreign'; }],
    ['title', r => { test(r).title += ' foreign'; }],
    ['heading', r => { test(r).ancestorTitles = ['foreign']; }],
    ['test-status', r => { test(r).status = 'passed'; }],
    ['messages', r => { test(r).failureMessages.push(failure); }],
    ['assertion-error', r => { test(r).failureMessages = [failure.replace('AssertionError:', 'Error:')]; }],
    ['frame', r => { test(r).failureMessages = [`${booleanFailure}\n    at ${directory}/src/foreign.ts:1:1\n    at ${expected.file}:79:65`]; }],
  ];
  const observed = new Set();
  validateReport(make(), 1, expected, true, id => { observed.add(id); return true; });
  assert.deepEqual([...observed].sort(), negatives.map(([id]) => id).sort());
  for (const [id, change, exit = 1] of negatives) check(`guard mutation: ${id}`, () => {
    const report = make(); change(report);
    assert.throws(() => validateReport(report, exit, expected, true), { name: 'AssertionError' });
    // Isolate the guard, then delete it: the same counterexample must escape.
    assert.throws(() => validateReport(report, exit, expected, true, name => name === id), { name: 'AssertionError', message: id });
    validateReport(report, exit, expected, true, () => false);
  });
  check('green and skipped entries', () => {
    for (const red of [false, true]) {
      const report = make(red);
      suite(report).assertionResults.push({ status: 'skipped', title: 'irrelevant' }, { status: 'pending' });
      validateReport(report, red ? 1 : 0, expected, red);
    }
  });
  check('green failure messages rejected', () => {
    const report = make(false); test(report).failureMessages = [failure];
    assert.throws(() => validateReport(report, 0, expected, false), { name: 'AssertionError', message: 'messages' });
    validateReport(report, 0, expected, false, id => id !== 'messages');
  });
  for (const [name, change] of [
    ['two executed', r => { suite(r).assertionResults.push(structuredClone(test(r))); }],
    ['TypeError', r => { test(r).failureMessages = ['TypeError: invalid input']; }],
    ['wrong line', r => { test(r).failureMessages = [failure.replace(':79:65', ':78:65')]; }],
    ['wrong column', r => { test(r).failureMessages = [failure.replace(':79:65', ':79:64')]; }],
    ['missing frame', r => { test(r).failureMessages = [booleanFailure]; }],
  ]) check(name, () => {
    const report = make(); change(report);
    assert.throws(() => validateReport(report, 1, expected, true), { name: 'AssertionError' });
  });
  check('ten distinct mutations, anchors and restoration', () => {
    const original = readFileSync(join(root, sourcePath), 'utf8');
    const testSource = readFileSync(join(root, testPath), 'utf8');
    const file = join(directory, 'restore.ts');
    const hashes = new Set();
    for (const scenario of scenarios) {
      assertionPosition(testSource, scenario);
      const changed = mutate(original, scenario);
      assert.notEqual(hash(changed), hash(original)); hashes.add(hash(changed));
      assert.throws(() => mutate('', scenario), { name: 'AssertionError' });
      assert.throws(() => mutate(original + original, scenario), { name: 'AssertionError' });
      assert.throws(() => mutate(original, { ...scenario, anchor: 'missing anchor' }), { name: 'AssertionError' });
      assert.throws(() => mutate(mutate(original, { ...scenario, replacement: scenario.anchor.repeat(2) }), scenario), { name: 'AssertionError' });
      writeFileSync(file, changed);
      assert.throws(() => assertRestored(file, original), { name: 'AssertionError' });
      restore(file, original);
      assert.equal(readFileSync(file, 'utf8'), original);
    }
    assert.equal(hashes.size, 10);
  });
  check('private paths excluded', () => {
    for (const path of ['src/.env.local', 'src/secrets/value.ts', 'src/private.key', 'src/token.ts', 'dist/index.js', '../src/index.ts']) assert.equal(publicFile(path), false);
  });
  return { mode: 'self-test', passed: checks.length, total: checks.length, checks, guardMutations: { proved: negatives.length, total: negatives.length } };
}

function protocol(directory, summary, save) {
  // The caller supplies the quiet executor; no author-specific path is embedded.
  const qrun = process.env['QRUN'];
  assert.ok(qrun, 'Export QRUN with the quiet executor path before running the protocol');
  const quote = value => "'" + value.replaceAll("'", "'\"'\"'") + "'";
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
    const expected = { ...assertionPosition(test, scenario), file: realpathSync(join(workspace, testPath)), title: scenario.title, heading: `${scenario.operation} receipt correlation`, fullName: `${scenario.operation} receipt correlation ${scenario.title}` };
    const entry = { id: scenario.id, fullName: expected.fullName, phases: [] };
    summary.scenarios.push(entry);
    function phase(name, red) {
      const report = join(directory, `${scenario.id}-${name}.json`);
      const log = join(directory, `${scenario.id}-${name}.log`);
      const args = ['-C', workspace, 'exec', 'vitest', 'run', testPath, '-t', `^${expected.fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, '--maxWorkers=1', '--no-cache', '--configLoader=runner', '--reporter=json', `--outputFile=${report}`];
      const before = hash(readFileSync(file));
      const command = ['pnpm', ...args];
      const child = spawnSync(qrun, [command.map(quote).join(' ')], { cwd: workspace, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
      writeFileSync(log, `${child.stdout ?? ''}\n${child.stderr ?? ''}\n${child.error?.message ?? ''}`);
      const record = { phase: name, sha: summary.sha, command, executor: qrun, exit: child.status, signal: child.signal, sourceHash: before, sourceHashAfter: hash(readFileSync(file)), fullName: expected.fullName, report, log, verified: false };
      entry.phases.push(record); save();
      assert.equal(record.sourceHashAfter, before);
      assert.equal(child.signal, null); assert.equal(child.error, undefined);
      validateReport(JSON.parse(readFileSync(report, 'utf8')), child.status, expected, red);
      record.verified = true; save();
    }
    phase('baseline', false);
    try {
      const mutant = mutate(original, scenario);
      assert.notEqual(hash(mutant), hash(original));
      entry.mutantHash = hash(mutant);
      writeFileSync(file, mutant);
      phase('mutant', true);
    } finally {
      restore(file, original);
      entry.restoredHash = hash(readFileSync(file)); save();
      phase('restored', false);
    }
  }
  assert.equal(summary.scenarios.filter(s => s.phases.length === 3 && s.phases.every(p => p.verified)).length, 10);
  summary.mutants = { proved: 10, total: 10 };
  summary.phases = { proved: 30, total: 30 };
}

const directory = realpathSync(mkdtempSync(join(tmpdir(), 'knowledge-receipt-mutation-')));
const summaryPath = join(directory, 'summary.json');
const summaryLog = join(directory, 'summary.log');
const summary = { mode: process.argv[2] === '--self-test' ? 'self-test' : 'protocol', sha: git(['rev-parse', 'HEAD']).trim(), node: process.version, scenarios: [], mutants: { proved: 0, total: 10 }, phases: { proved: 0, total: 30 }, completed: false };
const save = () => {
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n');
  writeFileSync(summaryLog, [
    `mode: ${summary.mode}; SHA: ${summary.sha}; completed: ${summary.completed}`,
    ...(summary.checks ?? []),
    ...summary.scenarios.flatMap(s => s.phases.map(p => `${s.id} ${p.phase}: ${p.verified ? 'verified' : 'unverified'}; report: ${p.report}; log: ${p.log}`)),
    ...(summary.error ? [`${summary.error.name}: ${summary.error.message}`] : []),
  ].join('\n') + '\n');
};
try {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--self-test'), 'Only --self-test is supported');
  if (process.argv[2] === '--self-test') Object.assign(summary, selfTest(directory));
  else protocol(directory, summary, save);
  summary.completed = true; save();
  console.log(`summary: ${summaryPath}`);
  console.log(summary.mode === 'self-test' ? `self-test ${summary.passed}/${summary.total}` : 'mutants 10/10; phases 30/30');
} catch (error) {
  summary.error = { name: error.name, message: error.message }; save();
  console.error(`Protocol failed; summary: ${summaryPath}`);
  process.exitCode = 1;
}
