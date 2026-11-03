// Reproducer for the lease contract; mutates only temporary public copies.
const scenarios = [
  {
    "title": "rejects empty lease id",
    "anchor": "leaseId: z.string().min(1)",
    "replacement": "leaseId: z.string()",
    "assertion": "expect(schema.safeParse({ ...lease, leaseId: '' }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects empty consent reference",
    "anchor": "consentRef: z.string().min(1)",
    "replacement": "consentRef: z.string()",
    "assertion": "expect(schema.safeParse({ ...lease, consentRef: '' }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects unknown status",
    "anchor": "status: z.enum(['connected', 'offline', 'revoked'])",
    "replacement": "status: z.string()",
    "assertion": "expect(schema.safeParse({ ...lease, status: 'ready' }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects non ISO issuedAt",
    "anchor": "issuedAt: z.string().datetime()",
    "replacement": "issuedAt: z.string()",
    "assertion": "expect(schema.safeParse({ ...lease, issuedAt: 'October 16, 2026 10:00:00 GMT' }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects non ISO lastSeenAt",
    "anchor": "lastSeenAt: z.string().datetime()",
    "replacement": "lastSeenAt: z.string()",
    "assertion": "expect(schema.safeParse({ ...lease, lastSeenAt: 'October 16, 2026 10:01:00 GMT' }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects non ISO expiresAt",
    "anchor": "expiresAt: z.string().datetime()",
    "replacement": "expiresAt: z.string()",
    "assertion": "expect(schema.safeParse({ ...lease, expiresAt: 'October 16, 2026 10:02:00 GMT' }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects duplicate available engines",
    "anchor": "new Set(engines).size === engines.length",
    "replacement": "true",
    "assertion": "expect(schema.safeParse({ ...lease, availableEngines: ['claude', 'claude'] }).success).toBe(false);",
    "value": false
  },
  {
    "title": "reports available engine upper bound",
    "anchor": "z.array(DevelopmentSessionEngineSchema).max(2)",
    "replacement": "z.array(DevelopmentSessionEngineSchema)",
    "assertion": "expect(schema.safeParse({ ...lease, availableEngines: ['claude', 'codex', 'claude'] }).error?.issues.some((issue) => issue.code === 'too_big') ?? false).toBe(true);",
    "value": true
  },
  {
    "title": "rejects extra lease fields",
    "anchor": "}).strict()",
    "replacement": "}).strip()",
    "assertion": "expect(schema.safeParse({ ...lease, extra: true }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects issuance after last seen",
    "anchor": "Date.parse(lease.issuedAt) <= Date.parse(lease.lastSeenAt)",
    "replacement": "true",
    "assertion": "expect(schema.safeParse({ ...lease, issuedAt: '2026-10-16T10:01:00.001Z' }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects last seen at expiry",
    "anchor": "Date.parse(lease.lastSeenAt) < Date.parse(lease.expiresAt)",
    "replacement": "true",
    "assertion": "expect(schema.safeParse({ ...lease, lastSeenAt: lease.expiresAt }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects unattached available engine",
    "anchor": "lease.availableEngines.every((engine) => lease.binding.engines.includes(engine))",
    "replacement": "true",
    "assertion": "expect(schema.safeParse({ ...lease, binding: { ...binding, engines: ['claude'] } }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects offline lease",
    "anchor": "if (actual.status !== 'connected') return false;",
    "replacement": "",
    "assertion": "expect(usable({ ...lease, status: 'offline' }, binding, 'claude', now)).toBe(false);",
    "value": false
  },
  {
    "title": "rejects exact expiry",
    "anchor": "if (nowMs >= Date.parse(actual.expiresAt)) return false;",
    "replacement": "if (nowMs > Date.parse(actual.expiresAt)) return false;",
    "assertion": "expect(usable(lease, binding, 'claude', Date.parse(lease.expiresAt))).toBe(false);",
    "value": false
  },
  {
    "title": "rejects clock before last seen",
    "anchor": "if (nowMs < Date.parse(actual.lastSeenAt)) return false;",
    "replacement": "",
    "assertion": "expect(usable(lease, binding, 'claude', now - 1)).toBe(false);",
    "value": false
  },
  {
    "title": "rejects NaN clock independently",
    "anchor": "if (!Number.isFinite(nowMs)) return false;",
    "replacement": "",
    "assertion": "expect(usable(lease, binding, 'claude', Number.NaN)).toBe(false);",
    "value": false
  },
  {
    "title": "rejects engine without attestation",
    "anchor": "if (!actual.availableEngines.includes(selected.data)) return false;",
    "replacement": "",
    "assertion": "expect(usable({ ...lease, availableEngines: ['claude'] }, binding, 'codex', now)).toBe(false);",
    "value": false
  },
  {
    "title": "rejects foreign target kind",
    "anchor": "if (a.target.kind !== b.target.kind) return false;",
    "replacement": "",
    "assertion": "expect(usable(lease, { ...binding, target: cloud }, 'claude', now)).toBe(false);",
    "value": false
  },
  {
    "title": "rejects foreign device",
    "anchor": "a.target.deviceId !== b.target.deviceId",
    "replacement": "false",
    "assertion": "expect(usable(lease, { ...binding, target: { ...local, deviceId: 'device-2' } }, 'claude', now)).toBe(false);",
    "value": false
  },
  {
    "title": "rejects foreign connection",
    "anchor": "a.target.connectionRef !== b.target.connectionRef",
    "replacement": "false",
    "assertion": "expect(usable({ ...lease, binding: { ...binding, target: cloud } }, { ...binding, target: { ...cloud, connectionRef: 'connection-2' } }, 'claude', now)).toBe(false);",
    "value": false
  },
  {
    "title": "rejects foreign session",
    "anchor": "a.sessionId === b.sessionId",
    "replacement": "true",
    "assertion": "expect(usable(lease, { ...binding, sessionId: 'session-2' }, 'claude', now)).toBe(false);",
    "value": false
  },
  {
    "title": "rejects foreign tenantId",
    "anchor": "a.scope.tenantId === b.scope.tenantId",
    "replacement": "true",
    "assertion": "expect(usable(lease, { ...binding, scope: { ...scope, tenantId: 'foreign' } }, 'claude', now)).toBe(false);",
    "value": false
  },
  {
    "title": "rejects foreign ownerId",
    "anchor": "a.scope.ownerId === b.scope.ownerId",
    "replacement": "true",
    "assertion": "expect(usable(lease, { ...binding, scope: { ...scope, ownerId: 'foreign' } }, 'claude', now)).toBe(false);",
    "value": false
  },
  {
    "title": "rejects foreign agentId",
    "anchor": "a.scope.agentId === b.scope.agentId",
    "replacement": "true",
    "assertion": "expect(usable(lease, { ...binding, scope: { ...scope, agentId: 'foreign' } }, 'claude', now)).toBe(false);",
    "value": false
  },
  {
    "title": "rejects expanded expected engines",
    "anchor": "a.engines.length === b.engines.length",
    "replacement": "true",
    "assertion": "expect(usable({ ...lease, binding: { ...binding, engines: ['claude'] }, availableEngines: ['claude'] }, binding, 'claude', now)).toBe(false);",
    "value": false
  },
  {
    "title": "rejects different expected engine set",
    "anchor": "a.engines.every((allowed) => b.engines.includes(allowed))",
    "replacement": "true",
    "assertion": "expect(usable({ ...lease, binding: { ...binding, engines: ['claude'] }, availableEngines: ['claude'] }, { ...binding, engines: ['codex'] }, 'claude', now)).toBe(false);",
    "value": false
  }
];

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '../../..'));
const sourcePath = 'src/capability/connect/development-session-state.ts';
const testPath = 'tests/capability/connect/development-session-state.test.ts';
const prefix = 'development session lease ';
const hash = (text) => createHash('sha256').update(text).digest('hex');
const directory = realpathSync(mkdtempSync(join(tmpdir(), 'development-session-state-')));
const workspace = join(directory, 'bridge');
const summaryPath = join(directory, 'summary.json');
const summary = { mutations: { passed: 0, total: scenarios.length }, phases: { passed: 0, total: scenarios.length * 3 }, reader: { passed: 0, total: 0 }, scenarios: [], complete: false };
const save = () => writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n');
function git(args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, 'Git metadata unavailable');
  return result.stdout;
}
function uniqueIndex(text, anchor) {
  const index = text.indexOf(anchor);
  assert.ok(index >= 0 && text.indexOf(anchor, index + 1) === -1, `Anchor must be unique: ${anchor}`);
  return index;
}
function mutate(text, scenario) {
  const index = uniqueIndex(text, scenario.anchor);
  return text.slice(0, index) + scenario.replacement + text.slice(index + scenario.anchor.length);
}
function position(test, scenario) {
  const index = uniqueIndex(test, scenario.assertion);
  const matcher = index + scenario.assertion.indexOf('.toBe') + 1;
  return { line: test.slice(0, matcher).split('\n').length, column: matcher - test.lastIndexOf('\n', matcher) };
}
function publicPath(path) {
  return /^(?:src\/.*\.ts|tests\/capability\/connect\/development-session-state\.(?:test\.ts|mutation\.mjs)|tests\/setup\.ts|package\.json|vitest\.config\.ts|tsconfig[^/]*\.json)$/.test(path)
    && !path.split('/').some(part => part.startsWith('.') || /^(?:secrets?|credentials?|dist|coverage|vendor|node_modules)$/i.test(part))
    && !/\.(?:pem|key|p12|pfx|crt|cer|der)$/i.test(path);
}
const paths = [...new Set([
  ...git(['ls-files', '-z', '--', 'src', 'package.json', 'vitest.config.ts', 'tsconfig.json', 'tsconfig.eslint.json']).split('\0').filter(Boolean).filter(publicPath),
  sourcePath, testPath, 'tests/setup.ts', 'tests/capability/connect/development-session-state.mutation.mjs',
])];
const before = new Map();
function liveHashes() {
  return new Map(paths.map(path => [path, hash(readFileSync(join(root, path)))]));
}
function copyPublic() {
  mkdirSync(workspace);
  for (const path of paths) {
    assert.ok(publicPath(path), `Non-public path: ${path}`);
    let current = root;
    for (const part of path.split('/')) {
      current = join(current, part);
      assert.equal(lstatSync(current).isSymbolicLink(), false, 'No symlink traversal');
    }
    assert.ok(lstatSync(current).isFile());
    before.set(path, hash(readFileSync(current)));
    mkdirSync(dirname(join(workspace, path)), { recursive: true });
    copyFileSync(current, join(workspace, path));
  }
  symlinkSync(join(root, 'node_modules'), join(workspace, 'node_modules'), 'dir');
}
function validateReport(report, exit, expected, red) {
  assert.equal(exit, red ? 1 : 0, 'Unexpected exit code');
  assert.equal(report.success, !red);
  assert.equal(report.numPassedTests, red ? 0 : 1);
  assert.equal(report.numFailedTests, red ? 1 : 0);
  assert.equal(report.numRuntimeErrorTestSuites ?? 0, 0);
  assert.deepEqual(report.unhandledErrors ?? [], []);
  assert.equal(report.testResults.length, 1);
  const suite = report.testResults[0];
  assert.equal(suite.name, expected.file);
  assert.equal(suite.status, red ? 'failed' : 'passed');
  assert.equal(suite.message, '', 'Collection/runtime failure');
  const active = suite.assertionResults.filter(test => ['passed', 'failed'].includes(test.status));
  assert.equal(active.length, 1, 'Exactly one active test required');
  const test = active[0];
  assert.equal(test.fullName, expected.fullName);
  assert.equal(test.title, expected.title);
  assert.deepEqual(test.ancestorTitles, ['development session lease']);
  assert.equal(test.status, red ? 'failed' : 'passed');
  if (!red) { assert.deepEqual(test.failureMessages, []); return; }
  assert.equal(test.failureMessages.length, 1);
  const [message, ...stack] = test.failureMessages[0].split('\n');
  const booleanFailure = expected.value
    ? 'AssertionError: expected false to be true // Object.is equality'
    : 'AssertionError: expected true to be false // Object.is equality';
  assert.equal(message, booleanFailure);
  const application = stack.filter(line => line.trim().startsWith('at ')).find(frame =>
    !frame.includes('/node_modules/') && !frame.includes('node:internal/') && frame.trim() !== 'at new Promise (<anonymous>)');
  assert.equal(application, `    at ${expected.file}:${expected.line}:${expected.column}`, 'Unexpected first application assertion frame');
}
function readerSelfTest(green, red, expected) {
  const checks = [
    ['green report', () => validateReport(structuredClone(green), 0, expected, false)],
    ['red report', () => validateReport(structuredClone(red), 1, expected, true)],
  ];
  const rejects = [
    ['zero active', r => { r.testResults[0].assertionResults.forEach(t => { t.status = 'pending'; }); }],
    ['foreign title', r => { r.testResults[0].assertionResults.find(t => t.status === 'failed').fullName += ' foreign'; }],
    ['foreign file', r => { r.testResults[0].name += '.foreign'; }],
    ['runtime suite', r => { r.numRuntimeErrorTestSuites = 1; }],
    ['unhandled error', r => { r.unhandledErrors = ['runtime failure']; }],
    ['collection error', r => { r.testResults[0].message = 'Cannot find module'; }],
    ['wrong failure', r => { r.testResults[0].assertionResults.find(t => t.status === 'failed').failureMessages = ['TypeError: invalid input']; }],
    ['wrong frame', r => { const t = r.testResults[0].assertionResults.find(t => t.status === 'failed'); t.failureMessages[0] = t.failureMessages[0].replace(`${expected.file}:${expected.line}:${expected.column}`, `${expected.file}:1:1`); }],
    ['counter mismatch', r => { r.numFailedTests = 0; }],
  ];
  for (const [name, change] of rejects) checks.push([name, () => {
    const report = structuredClone(red); change(report);
    assert.throws(() => validateReport(report, 1, expected, true), { name: 'AssertionError' });
  }]);
  checks.push(['false red exit', () => assert.throws(() => validateReport(structuredClone(red), 0, expected, true), { name: 'AssertionError' })]);
  checks.push(['green with red exit', () => assert.throws(() => validateReport(structuredClone(green), 1, expected, true), { name: 'AssertionError' })]);
  summary.reader.total = checks.length;
  for (const [name, run] of checks) { run(); summary.reader.passed++; summary.reader.last = name; save(); }
}
try {
  assert.equal(process.argv.length, 2, 'No arguments supported');
  assert.equal(JSON.parse(readFileSync(join(root, 'node_modules/vitest/package.json'), 'utf8')).version, '3.2.4');
  summary.sha = git(['rev-parse', 'HEAD']).trim();
  copyPublic();
  const file = join(workspace, sourcePath);
  const original = readFileSync(file, 'utf8');
  const test = readFileSync(join(workspace, testPath), 'utf8');
  for (const scenario of scenarios) { mutate(original, scenario); position(test, scenario); }
  for (const [index, scenario] of scenarios.entries()) {
    const expected = { ...position(test, scenario), file: realpathSync(join(workspace, testPath)), title: scenario.title, fullName: prefix + scenario.title, value: scenario.value };
    const entry = { title: expected.fullName, phases: [] }; summary.scenarios.push(entry);
    function phase(name, red) {
      const reportPath = join(directory, `${index}-${name}.json`);
      const logPath = join(directory, `${index}-${name}.log`);
      const args = ['-C', workspace, 'exec', 'vitest', 'run', testPath, '-t', `^${expected.fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, '--maxWorkers=1', '--no-cache', '--configLoader=runner', '--reporter=json', `--outputFile=${reportPath}`];
      const sourceHash = hash(readFileSync(file));
      const child = spawnSync('pnpm', args, { cwd: workspace, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
      writeFileSync(logPath, `${child.stdout ?? ''}\n${child.stderr ?? ''}\n${child.error?.message ?? ''}`);
      const record = { name, exit: child.status, signal: child.signal, reportPath, logPath, sourceHash, valid: false };
      entry.phases.push(record); save();
      assert.equal(child.error, undefined); assert.equal(child.signal, null);
      assert.equal(hash(readFileSync(file)), sourceHash);
      assert.ok(existsSync(reportPath), 'Missing Vitest JSON report');
      const report = JSON.parse(readFileSync(reportPath, 'utf8'));
      validateReport(report, child.status, expected, red);
      record.valid = true; summary.phases.passed++; save();
      return report;
    }
    const green = phase('baseline', false);
    try {
      writeFileSync(file, mutate(original, scenario));
      const red = phase('mutant', true);
      if (index === 0) readerSelfTest(green, red, expected);
    } finally {
      writeFileSync(file, original);
      assert.equal(hash(readFileSync(file)), hash(original));
      phase('restored', false);
    }
    summary.mutations.passed++; save();
  }
  assert.equal(summary.mutations.passed, summary.mutations.total);
  assert.equal(summary.phases.passed, summary.phases.total);
  assert.ok(summary.reader.total > 0);
  assert.equal(summary.reader.passed, summary.reader.total);
  summary.complete = true;
} catch (error) {
  summary.error = error instanceof Error ? error.message : String(error);
  process.exitCode = 1;
} finally {
  try { if (before.size > 0) assert.deepEqual(liveHashes(), before, 'Live source/test/config hashes changed'); }
  catch (error) { summary.error = String(error); summary.complete = false; process.exitCode = 1; }
  save();
  console.log(`${summary.mutations.passed}/${summary.mutations.total} mutants caught; ${summary.phases.passed}/${summary.phases.total} valid phases; ${summary.reader.passed}/${summary.reader.total} reader checks; ${summaryPath}`);
  if (summary.error) console.error(summary.error);
}
