import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = realpathSync(fileURLToPath(new URL('../../../', import.meta.url)));
const sourcePath = 'src/capability/connect/development-session-pairing.ts';
const testPath = 'tests/capability/connect/development-session-pairing.test.ts';
const suiteTitle = 'development session pairing';
const scenarios = [
  {
    "id": "guard-1",
    "title": "rejects different pairingId",
    "anchor": "actual.pairingId === wanted.pairingId",
    "replacement": "true",
    "assertion": "expect(rejected1).toBe(false);"
  },
  {
    "id": "guard-2",
    "title": "rejects different nonce",
    "anchor": "actual.nonce === wanted.nonce",
    "replacement": "true",
    "assertion": "expect(rejected2).toBe(false);"
  },
  {
    "id": "guard-3",
    "title": "rejects different issuedAt",
    "anchor": "actual.issuedAt === wanted.issuedAt",
    "replacement": "true",
    "assertion": "expect(rejected3).toBe(false);"
  },
  {
    "id": "guard-4",
    "title": "rejects different expiresAt",
    "anchor": "actual.expiresAt === wanted.expiresAt",
    "replacement": "true",
    "assertion": "expect(rejected4).toBe(false);"
  },
  {
    "id": "guard-5",
    "title": "rejects different sessionId",
    "anchor": "a.sessionId === b.sessionId",
    "replacement": "true",
    "assertion": "expect(rejected5).toBe(false);"
  },
  {
    "id": "guard-6",
    "title": "rejects different tenantId",
    "anchor": "a.scope.tenantId === b.scope.tenantId",
    "replacement": "true",
    "assertion": "expect(rejected6).toBe(false);"
  },
  {
    "id": "guard-7",
    "title": "rejects different ownerId",
    "anchor": "a.scope.ownerId === b.scope.ownerId",
    "replacement": "true",
    "assertion": "expect(rejected7).toBe(false);"
  },
  {
    "id": "guard-8",
    "title": "rejects different agentId",
    "anchor": "a.scope.agentId === b.scope.agentId",
    "replacement": "true",
    "assertion": "expect(rejected8).toBe(false);"
  },
  {
    "id": "guard-9",
    "title": "rejects different target kind",
    "anchor": "a.target.kind !== b.target.kind",
    "replacement": "false",
    "assertion": "expect(rejected9).toBe(false);"
  },
  {
    "id": "guard-10",
    "title": "rejects different local device",
    "anchor": "a.target.deviceId !== b.target.deviceId",
    "replacement": "false",
    "assertion": "expect(rejected10).toBe(false);"
  },
  {
    "id": "guard-11",
    "title": "rejects different cloud reference",
    "anchor": "a.target.connectionRef !== b.target.connectionRef",
    "replacement": "false",
    "assertion": "expect(rejected11).toBe(false);"
  },
  {
    "id": "guard-12",
    "title": "rejects engine subset",
    "anchor": "a.engines.length === b.engines.length",
    "replacement": "true",
    "assertion": "expect(rejected12).toBe(false);"
  },
  {
    "id": "guard-13",
    "title": "rejects a single different engine",
    "anchor": "a.engines.every((engine) => b.engines.includes(engine))",
    "replacement": "true",
    "assertion": "expect(rejected13).toBe(false);"
  },
  {
    "id": "guard-14",
    "title": "rejects malformed consent through parsing",
    "anchor": "const consent = DevelopmentSessionConsentSchema.safeParse(raw);",
    "replacement": "const consent = { success: true, data: raw };",
    "assertion": "expect(rejected14).toBe(false);"
  },
  {
    "id": "guard-15",
    "title": "rejects malformed expected through parsing",
    "anchor": "const challenge = DevelopmentSessionPairingChallengeSchema.safeParse(expected);",
    "replacement": "const challenge = { success: true, data: expected };",
    "assertion": "expect(rejected15).toBe(false);"
  },
  {
    "id": "guard-16",
    "title": "rejects nonfinite NaN",
    "anchor": "if (!Number.isFinite(nowMs)) return false;",
    "replacement": "",
    "assertion": "expect(rejected16).toBe(false);"
  },
  {
    "id": "guard-17",
    "title": "rejects expired clock",
    "anchor": "if (nowMs >= Date.parse(wanted.expiresAt)) return false;",
    "replacement": "",
    "assertion": "expect(rejected17).toBe(false);"
  },
  {
    "id": "guard-18",
    "title": "rejects the exact clock expiry",
    "anchor": "nowMs >= Date.parse(wanted.expiresAt)",
    "replacement": "nowMs > Date.parse(wanted.expiresAt)",
    "assertion": "expect(rejected18).toBe(false);"
  },
  {
    "id": "guard-19",
    "title": "rejects future consent",
    "anchor": "if (Date.parse(consent.data.consentedAt) > nowMs) return false;",
    "replacement": "",
    "assertion": "expect(rejected19).toBe(false);"
  },
  {
    "id": "guard-20",
    "title": "rejects challenge extra",
    "anchor": "expiresAt: z.string().datetime(),\n}).strict()",
    "replacement": "expiresAt: z.string().datetime(),\n})",
    "assertion": "expect(rejected20).toBe(false);"
  },
  {
    "id": "guard-21",
    "title": "rejects consent extra",
    "anchor": "consentedAt: z.string().datetime(),\n}).strict()",
    "replacement": "consentedAt: z.string().datetime(),\n})",
    "assertion": "expect(rejected21).toBe(false);"
  },
  {
    "id": "guard-22",
    "title": "validates the reused binding",
    "anchor": "binding: DevelopmentSessionBindingSchema,",
    "replacement": "binding: z.unknown(),",
    "assertion": "expect(rejected22).toBe(false);"
  },
  {
    "id": "guard-23",
    "title": "requires a nonempty pairing id",
    "anchor": "pairingId: z.string().min(1),",
    "replacement": "pairingId: z.string(),",
    "assertion": "expect(rejected23).toBe(false);"
  },
  {
    "id": "guard-24",
    "title": "reuses the device nonce format",
    "anchor": "nonce: DeviceNonceSchema,",
    "replacement": "nonce: z.string(),",
    "assertion": "expect(rejected24).toBe(false);"
  },
  {
    "id": "guard-25",
    "title": "requires ISO issuedAt",
    "anchor": "issuedAt: z.string().datetime(),",
    "replacement": "issuedAt: z.string(),",
    "assertion": "expect(rejected25).toBe(false);"
  },
  {
    "id": "guard-26",
    "title": "requires ISO expiresAt",
    "anchor": "expiresAt: z.string().datetime(),",
    "replacement": "expiresAt: z.string(),",
    "assertion": "expect(rejected26).toBe(false);"
  },
  {
    "id": "guard-27",
    "title": "requires ISO consentedAt",
    "anchor": "consentedAt: z.string().datetime(),",
    "replacement": "consentedAt: z.string(),",
    "assertion": "expect(rejected27).toBe(false);"
  },
  {
    "id": "guard-28",
    "title": "rejects reversed challenge lifetime",
    "anchor": "Date.parse(challenge.expiresAt) > Date.parse(challenge.issuedAt)",
    "replacement": "true",
    "assertion": "expect(rejected28).toBe(false);"
  },
  {
    "id": "guard-29",
    "title": "rejects equal challenge endpoints",
    "anchor": "Date.parse(challenge.expiresAt) > Date.parse(challenge.issuedAt)",
    "replacement": "Date.parse(challenge.expiresAt) >= Date.parse(challenge.issuedAt)",
    "assertion": "expect(rejected29).toBe(false);"
  },
  {
    "id": "guard-30",
    "title": "validates the nested challenge",
    "anchor": "challenge: DevelopmentSessionPairingChallengeSchema,",
    "replacement": "challenge: z.unknown(),",
    "assertion": "expect(rejected30).toBe(false);"
  },
  {
    "id": "guard-31",
    "title": "rejects consent before issuance",
    "anchor": "Date.parse(consent.consentedAt) >= Date.parse(consent.challenge.issuedAt)",
    "replacement": "true",
    "assertion": "expect(rejected31).toBe(false);"
  },
  {
    "id": "guard-32",
    "title": "rejects consent after expiry",
    "anchor": "Date.parse(consent.consentedAt) < Date.parse(consent.challenge.expiresAt)",
    "replacement": "true",
    "assertion": "expect(rejected32).toBe(false);"
  },
  {
    "id": "guard-33",
    "title": "rejects consent exactly at expiry",
    "anchor": "Date.parse(consent.consentedAt) < Date.parse(consent.challenge.expiresAt)",
    "replacement": "Date.parse(consent.consentedAt) <= Date.parse(consent.challenge.expiresAt)",
    "assertion": "expect(rejected33).toBe(false);"
  }
];
const hash = value => createHash('sha256').update(value).digest('hex');
function uniqueIndex(text, anchor) {
  const index = text.indexOf(anchor);
  assert.ok(index >= 0 && text.indexOf(anchor, index + anchor.length) === -1, 'Anchor must be unique');
  return index;
}
function mutate(text, scenario) {
  const index = uniqueIndex(text, scenario.anchor);
  return text.slice(0, index) + scenario.replacement + text.slice(index + scenario.anchor.length);
}
function position(text, scenario) {
  const index = uniqueIndex(text, scenario.assertion);
  const matcher = index + scenario.assertion.indexOf('.toBe') + 1;
  return { line: text.slice(0, matcher).split('\n').length, column: matcher - text.lastIndexOf('\n', matcher) };
}
function git(args) {
  const child = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  assert.equal(child.status, 0, 'Git metadata unavailable');
  return child.stdout;
}
function publicFile(path) {
  // Public TypeScript contracts include credential *schemas*, never credentials.
  return /^(?:src\/.*\.ts$|tests\/setup\.ts$|tests\/capability\/connect\/development-session-pairing\.(?:test\.ts|mutation\.mjs)$|package\.json$|vitest\.config\.ts$|tsconfig[^/]*\.json$)/.test(path)
    && !path.split('/').some(part => part.startsWith('.')
      || /^(?:secrets?|credentials|dist|coverage|vendor|node_modules|migrations|fixtures|dumps|seeds)$/i.test(part))
    && !/\.(?:pem|p12|pfx|crt|cer|der)$/i.test(path);
}
function inventory() {
  const files = new Set(git(['ls-files', '-z']).split('\0').filter(Boolean).filter(publicFile));
  // Include new public files even before the runner commits the task.
  for (const path of [sourcePath, testPath, 'tests/capability/connect/development-session-pairing.mutation.mjs',
    'src/capability/connect/index.ts', 'tests/setup.ts', 'package.json', 'vitest.config.ts']) files.add(path);
  return [...files].sort();
}
function checkedPath(path) {
  assert.ok(publicFile(path), 'Only public files may be copied');
  let current = root;
  for (const part of path.split('/')) {
    current = join(current, part);
    assert.ok(!lstatSync(current).isSymbolicLink(), 'Public files must not traverse symlinks');
  }
  assert.ok(lstatSync(current).isFile());
  return current;
}
const failureMessage = 'AssertionError: expected true to be false // Object.is equality';
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
  assert.equal(suite.message, '', 'Collection/runtime failure');
  const active = suite.assertionResults.filter(test => ['passed', 'failed'].includes(test.status));
  assert.equal(active.length, 1, 'Exactly one active test required');
  const test = active[0];
  assert.equal(test.fullName, expected.fullName);
  assert.equal(test.title, expected.title);
  assert.deepEqual(test.ancestorTitles, [suiteTitle]);
  assert.equal(test.status, red ? 'failed' : 'passed');
  if (!red) { assert.deepEqual(test.failureMessages, []); return; }
  assert.equal(test.failureMessages.length, 1);
  const [message, ...stack] = test.failureMessages[0].split('\n');
  assert.equal(message, failureMessage);
  const first = stack.filter(line => line.trim().startsWith('at ')).find(frame =>
    !frame.includes('/node_modules/') && !frame.includes('node:internal/') && frame.trim() !== 'at new Promise (<anonymous>)');
  assert.equal(first, `    at ${expected.file}:${expected.line}:${expected.column}`, 'Wrong application assertion frame');
}
function readerSelfTest(green, red, expected) {
  let passed = 0;
  const check = run => { run(); passed++; };
  check(() => validateReport(structuredClone(green), 0, expected, false));
  check(() => validateReport(structuredClone(red), 1, expected, true));
  const changes = [
    r => { r.testResults[0].assertionResults.forEach(t => { t.status = 'pending'; }); },
    r => { r.testResults[0].assertionResults.find(t => t.status === 'failed').fullName += ' foreign'; },
    r => { r.testResults[0].assertionResults.find(t => t.status === 'failed').title += ' foreign'; },
    r => { r.testResults[0].name += '.foreign'; },
    r => { r.numRuntimeErrorTestSuites = 1; },
    r => { r.unhandledErrors = ['Unhandled rejection']; },
    r => { r.testResults[0].message = 'Failed to load module'; },
    r => { r.testResults[0].assertionResults.find(t => t.status === 'failed').failureMessages = ['TypeError: invalid']; },
    r => { r.testResults[0].assertionResults.find(t => t.status === 'failed').failureMessages = [`${failureMessage}\n    at /foreign.ts:1:1`]; },
    r => { r.numFailedTests = 0; },
  ];
  for (const change of changes) check(() => {
    const report = structuredClone(red); change(report);
    assert.throws(() => validateReport(report, 1, expected, true), { name: 'AssertionError' });
  });
  check(() => assert.throws(() => validateReport(structuredClone(green), 1, expected, true), { name: 'AssertionError' }));
  check(() => assert.throws(() => validateReport(structuredClone(red), 0, expected, true), { name: 'AssertionError' }));
  return { passed, total: changes.length + 4 };
}

assert.equal(process.argv.length, 2, 'This protocol takes no flags');
const directory = realpathSync(mkdtempSync(join(tmpdir(), 'development-session-pairing-')));
const workspace = join(directory, 'bridge');
const summaryPath = join(directory, 'summary.json');
const summary = { sha: git(['rev-parse', 'HEAD']).trim(), node: process.version, scenarios: [], completed: false };
const save = () => writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n');
const files = inventory();
const liveHashes = Object.fromEntries(files.map(path => [path, hash(readFileSync(checkedPath(path)))]));
summary.liveHashesBefore = liveHashes;
let intercepted = 0;
let validPhases = 0;
try {
  mkdirSync(workspace);
  for (const path of files) {
    mkdirSync(dirname(join(workspace, path)), { recursive: true });
    copyFileSync(checkedPath(path), join(workspace, path));
  }
  symlinkSync(join(root, 'node_modules'), join(workspace, 'node_modules'), 'dir');
  const version = JSON.parse(readFileSync(join(root, 'node_modules/vitest/package.json'), 'utf8')).version;
  assert.equal(version, '3.2.4', 'Protocol requires the real Vitest 3.2.4 reporter');
  summary.vitest = version;
  const file = join(workspace, sourcePath);
  const original = readFileSync(file, 'utf8');
  const testText = readFileSync(join(workspace, testPath), 'utf8');
  for (const scenario of scenarios) { mutate(original, scenario); position(testText, scenario); }
  for (const scenario of scenarios) {
    const expected = { ...position(testText, scenario), file: realpathSync(join(workspace, testPath)), title: scenario.title,
      fullName: `${suiteTitle} ${scenario.title}` };
    const entry = { id: scenario.id, expected, phases: [] };
    summary.scenarios.push(entry);
    function phase(name, red) {
      const reportPath = join(directory, `${scenario.id}-${name}.json`);
      const logPath = join(directory, `${scenario.id}-${name}.log`);
      const pattern = `^${expected.fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`;
      const args = ['-C', workspace, 'exec', 'vitest', 'run', testPath, '-t', pattern, '--maxWorkers=1', '--no-cache',
        '--configLoader=runner', '--reporter=json', `--outputFile=${reportPath}`];
      const before = hash(readFileSync(file));
      const child = spawnSync('pnpm', args, { cwd: workspace, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
      writeFileSync(logPath, `${child.stdout ?? ''}\n${child.stderr ?? ''}\n${child.error?.message ?? ''}`);
      const record = { name, command: ['pnpm', ...args], exit: child.status, signal: child.signal,
        sourceHash: before, reportPath, logPath, verified: false };
      entry.phases.push(record); save();
      assert.equal(hash(readFileSync(file)), before, 'Test process changed the source');
      assert.equal(child.error, undefined); assert.equal(child.signal, null);
      const report = JSON.parse(readFileSync(reportPath, 'utf8'));
      validateReport(report, child.status, expected, red);
      record.verified = true; validPhases++; save();
      return report;
    }
    const green = phase('baseline', false);
    let red;
    try {
      writeFileSync(file, mutate(original, scenario));
      red = phase('mutant', true);
    } finally {
      writeFileSync(file, original);
      assert.equal(hash(readFileSync(file)), hash(original), 'Copy restoration hash mismatch');
      phase('restored', false);
    }
    intercepted++;
    if (!summary.reader) summary.reader = readerSelfTest(green, red, expected);
    save();
  }
  assert.equal(intercepted, scenarios.length);
  assert.equal(validPhases, 3 * scenarios.length);
  assert.equal(summary.reader.passed, summary.reader.total);
  summary.completed = true;
} catch (error) {
  summary.error = { name: error.name, message: error.message };
  process.exitCode = 1;
} finally {
  try {
    summary.liveHashesAfter = Object.fromEntries(files.map(path => [path, hash(readFileSync(checkedPath(path)))]));
    assert.deepEqual(summary.liveHashesAfter, liveHashes, 'Live public files changed');
  } catch (error) {
    summary.completed = false; summary.hashError = error.message; process.exitCode = 1;
  }
  summary.mutants = { proved: intercepted, total: scenarios.length };
  summary.phases = { proved: validPhases, total: 3 * scenarios.length };
  save();
  console.log(`mutants ${intercepted}/${scenarios.length}; phases ${validPhases}/${3 * scenarios.length}; reader ${summary.reader?.passed ?? 0}/${summary.reader?.total ?? 14}; completed ${summary.completed}; summary ${summaryPath}`);
}
