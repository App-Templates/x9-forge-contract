// Only public temporary copies are mutated; no live source is modified.
const scenarios = [
  {
    "title": "rejects empty artifact reference",
    "assertion": "expect(artifactSchema.safeParse({ ...artifact, artifactRef: '' }).success).toBe(false);",
    "value": false,
    "anchor": "artifactRef: z.string().min(1)",
    "replacement": "artifactRef: z.string()"
  },
  {
    "title": "rejects empty media type",
    "assertion": "expect(artifactSchema.safeParse({ ...artifact, mediaType: '' }).success).toBe(false);",
    "value": false,
    "anchor": "mediaType: z.string().min(1)",
    "replacement": "mediaType: z.string()"
  },
  {
    "title": "rejects zero bytes",
    "assertion": "expect(artifactSchema.safeParse({ ...artifact, bytes: 0 }).success).toBe(false);",
    "value": false,
    "anchor": "bytes: z.number().int().positive().finite()",
    "replacement": "bytes: z.number().int().finite()"
  },
  {
    "title": "rejects fractional bytes",
    "assertion": "expect(artifactSchema.safeParse({ ...artifact, bytes: 1.5 }).success).toBe(false);",
    "value": false,
    "anchor": "bytes: z.number().int().positive().finite()",
    "replacement": "bytes: z.number().positive().finite()"
  },
  {
    "title": "rejects infinite bytes",
    "assertion": "expect(artifactSchema.safeParse({ ...artifact, bytes: Infinity }).success).toBe(false);",
    "value": false,
    "anchor": "bytes: z.number().int().positive().finite()",
    "replacement": "bytes: z.union([z.number().int().positive(), z.literal(Infinity)])"
  },
  {
    "title": "rejects uppercase artifact digest",
    "assertion": "expect(artifactSchema.safeParse({ ...artifact, sha256: 'B'.repeat(64) }).success).toBe(false);",
    "value": false,
    "anchor": "sha256: JobShape.reportDigest",
    "replacement": "sha256: z.string().regex(/^[0-9a-fA-F]{64}$/)"
  },
  {
    "title": "rejects short artifact digest",
    "assertion": "expect(artifactSchema.safeParse({ ...artifact, sha256: 'b'.repeat(63) }).success).toBe(false);",
    "value": false,
    "anchor": "sha256: JobShape.reportDigest",
    "replacement": "sha256: z.string().regex(/^[0-9a-f]{63,64}$/)"
  },
  {
    "title": "rejects nonhex artifact digest",
    "assertion": "expect(artifactSchema.safeParse({ ...artifact, sha256: 'g'.repeat(64) }).success).toBe(false);",
    "value": false,
    "anchor": "sha256: JobShape.reportDigest",
    "replacement": "sha256: z.string().regex(/^[0-9a-z]{64}$/)"
  },
  {
    "title": "rejects artifact extras",
    "assertion": "expect(artifactSchema.safeParse({ ...artifact, extra: true }).success).toBe(false);",
    "value": false,
    "anchor": "DevProductionArtifactSchema = z.strictObject({",
    "replacement": "DevProductionArtifactSchema = z.object({"
  },
  {
    "title": "rejects empty artifacts",
    "assertion": "expect(schema.safeParse({ ...result, artifacts: [] }).success).toBe(false);",
    "value": false,
    "anchor": "artifacts: z.array(DevProductionArtifactSchema).min(1)",
    "replacement": "artifacts: z.array(DevProductionArtifactSchema)"
  },
  {
    "title": "requires artifacts",
    "assertion": "expect(schema.safeParse({ ...result, artifacts: undefined }).success).toBe(false);",
    "value": false,
    "anchor": "artifacts: z.array(DevProductionArtifactSchema).min(1)",
    "replacement": "artifacts: z.array(DevProductionArtifactSchema).min(1).optional()"
  },
  {
    "title": "requires verification",
    "assertion": "expect(schema.safeParse({ ...result, verification: undefined }).success).toBe(false);",
    "value": false,
    "anchor": "verification: z.discriminatedUnion('kind', [TestsVerificationSchema, VisualVerificationSchema])",
    "replacement": "verification: z.discriminatedUnion('kind', [TestsVerificationSchema, VisualVerificationSchema]).default({ kind: 'tests', passed: 1, total: 1 })"
  },
  {
    "title": "rejects zero test counts",
    "assertion": "expect(schema.safeParse({ ...result, verification: { ...testsProof, passed: 0, total: 0 } }).success).toBe(false);",
    "value": false,
    "anchor": "passed: z.number().int().positive(),\n  total: z.number().int().positive()",
    "replacement": "passed: z.number().int(),\n  total: z.number().int()"
  },
  {
    "title": "rejects fractional test counts",
    "assertion": "expect(schema.safeParse({ ...result, verification: { ...testsProof, passed: 1.5, total: 1.5 } }).success).toBe(false);",
    "value": false,
    "anchor": "passed: z.number().int().positive(),\n  total: z.number().int().positive()",
    "replacement": "passed: z.number().positive(),\n  total: z.number().positive()"
  },
  {
    "title": "rejects partial tests",
    "assertion": "expect(schema.safeParse({ ...result, verification: { ...testsProof, passed: 2 } }).success).toBe(false);",
    "value": false,
    "anchor": "proof.passed === proof.total",
    "replacement": "true"
  },
  {
    "title": "rejects tests proof extras",
    "assertion": "expect(schema.safeParse({ ...result, verification: { ...testsProof, extra: true } }).success).toBe(false);",
    "value": false,
    "anchor": "TestsVerificationSchema = z.strictObject({",
    "replacement": "TestsVerificationSchema = z.object({"
  },
  {
    "title": "rejects visual proof extras",
    "assertion": "expect(schema.safeParse({ ...result, productKind: 'presentation', verification: { ...visualProof, extra: true } }).success).toBe(false);",
    "value": false,
    "anchor": "VisualVerificationSchema = z.strictObject({",
    "replacement": "VisualVerificationSchema = z.object({"
  },
  {
    "title": "rejects empty previewRef",
    "assertion": "expect(schema.safeParse({ ...result, productKind: 'presentation', verification: { ...visualProof, previewRef: '' } }).success).toBe(false);",
    "value": false,
    "anchor": "previewRef: z.string().min(1)",
    "replacement": "previewRef: z.string()"
  },
  {
    "title": "rejects missing previewRef",
    "assertion": "expect(schema.safeParse({ ...result, productKind: 'presentation', verification: { ...visualProof, previewRef: undefined } }).success).toBe(false);",
    "value": false,
    "anchor": "previewRef: z.string().min(1)",
    "replacement": "previewRef: z.string().min(1).optional()"
  },
  {
    "title": "rejects empty reviewRef",
    "assertion": "expect(schema.safeParse({ ...result, productKind: 'presentation', verification: { ...visualProof, reviewRef: '' } }).success).toBe(false);",
    "value": false,
    "anchor": "  reviewRef: z.string().min(1)",
    "replacement": "  reviewRef: z.string()"
  },
  {
    "title": "rejects missing reviewRef",
    "assertion": "expect(schema.safeParse({ ...result, productKind: 'presentation', verification: { ...visualProof, reviewRef: undefined } }).success).toBe(false);",
    "value": false,
    "anchor": "  reviewRef: z.string().min(1)",
    "replacement": "  reviewRef: z.string().min(1).optional()"
  },
  {
    "title": "rejects empty ownerAcceptanceRef",
    "assertion": "expect(schema.safeParse({ ...result, productKind: 'presentation', verification: { ...visualProof, ownerAcceptanceRef: '' } }).success).toBe(false);",
    "value": false,
    "anchor": "ownerAcceptanceRef: z.string().min(1)",
    "replacement": "ownerAcceptanceRef: z.string()"
  },
  {
    "title": "rejects missing ownerAcceptanceRef",
    "assertion": "expect(schema.safeParse({ ...result, productKind: 'presentation', verification: { ...visualProof, ownerAcceptanceRef: undefined } }).success).toBe(false);",
    "value": false,
    "anchor": "ownerAcceptanceRef: z.string().min(1)",
    "replacement": "ownerAcceptanceRef: z.string().min(1).optional()"
  },
  {
    "title": "rejects wrong proof for code",
    "assertion": "expect(schema.safeParse({ ...result, productKind: 'code', verification: visualProof }).success).toBe(false);",
    "value": false,
    "anchor": "result.verification.kind !== expected",
    "replacement": "false"
  },
  {
    "title": "rejects wrong proof for automation",
    "assertion": "expect(schema.safeParse({ ...result, productKind: 'automation', verification: visualProof }).success).toBe(false);",
    "value": false,
    "anchor": "result.verification.kind !== expected",
    "replacement": "false"
  },
  {
    "title": "rejects wrong proof for presentation",
    "assertion": "expect(schema.safeParse({ ...result, productKind: 'presentation', verification: testsProof }).success).toBe(false);",
    "value": false,
    "anchor": "result.verification.kind !== expected",
    "replacement": "false"
  },
  {
    "title": "rejects wrong proof for design",
    "assertion": "expect(schema.safeParse({ ...result, productKind: 'design', verification: testsProof }).success).toBe(false);",
    "value": false,
    "anchor": "result.verification.kind !== expected",
    "replacement": "false"
  },
  {
    "title": "rejects empty jobId",
    "assertion": "expect(schema.safeParse({ ...result, jobId: '' }).success).toBe(false);",
    "value": false,
    "anchor": "jobId: JobShape.jobId",
    "replacement": "jobId: z.string()"
  },
  {
    "title": "rejects malformed requestId",
    "assertion": "expect(schema.safeParse({ ...result, requestId: 'short' }).success).toBe(false);",
    "value": false,
    "anchor": "requestId: JobShape.requestId",
    "replacement": "requestId: z.string()"
  },
  {
    "title": "rejects empty projectId",
    "assertion": "expect(schema.safeParse({ ...result, projectId: '' }).success).toBe(false);",
    "value": false,
    "anchor": "projectId: JobShape.projectId",
    "replacement": "projectId: z.string()"
  },
  {
    "title": "rejects empty sessionId",
    "assertion": "expect(schema.safeParse({ ...result, sessionId: '' }).success).toBe(false);",
    "value": false,
    "anchor": "sessionId: JobShape.session.shape.sessionId",
    "replacement": "sessionId: z.string()"
  },
  {
    "title": "rejects zero reportVersion",
    "assertion": "expect(schema.safeParse({ ...result, reportVersion: 0 }).success).toBe(false);",
    "value": false,
    "anchor": "reportVersion: JobShape.reportVersion",
    "replacement": "reportVersion: z.number().int()"
  },
  {
    "title": "rejects uppercase reportDigest",
    "assertion": "expect(schema.safeParse({ ...result, reportDigest: 'A'.repeat(64) }).success).toBe(false);",
    "value": false,
    "anchor": "reportDigest: JobShape.reportDigest",
    "replacement": "reportDigest: z.string()"
  },
  {
    "title": "rejects fractional reportVersion",
    "assertion": "expect(schema.safeParse({ ...result, reportVersion: 1.5 }).success).toBe(false);",
    "value": false,
    "anchor": "reportVersion: JobShape.reportVersion",
    "replacement": "reportVersion: z.number().min(1)"
  },
  {
    "title": "rejects unknown product",
    "assertion": "expect(schema.safeParse({ ...failed, productKind: 'unknown' }).success).toBe(false);",
    "value": false,
    "anchor": "productKind: DevProductionKindSchema",
    "replacement": "productKind: z.string()"
  },
  {
    "title": "rejects invalid finish time",
    "assertion": "expect(schema.safeParse({ ...result, finishedAt: 'yesterday' }).success).toBe(false);",
    "value": false,
    "anchor": "finishedAt: z.iso.datetime()",
    "replacement": "finishedAt: z.string()"
  },
  {
    "title": "rejects result extras",
    "assertion": "expect(schema.safeParse({ ...result, extra: true }).success).toBe(false);",
    "value": false,
    "anchor": "ResultBaseSchema = z.strictObject({",
    "replacement": "ResultBaseSchema = z.object({"
  },
  {
    "title": "rejects scope extras",
    "assertion": "expect(schema.safeParse({ ...result, scope: { ...scope, extra: true } }).success).toBe(false);",
    "value": false,
    "anchor": "scope: CapabilityAgentScopeSchema",
    "replacement": "scope: CapabilityAgentScopeSchema.loose()"
  },
  {
    "title": "rejects missing tenant",
    "assertion": "expect(schema.safeParse({ ...result, scope: { ownerId: scope.ownerId, agentId: scope.agentId } }).success).toBe(false);",
    "value": false,
    "anchor": "scope: CapabilityAgentScopeSchema",
    "replacement": "scope: CapabilityAgentScopeSchema.partial()"
  },
  {
    "title": "rejects empty reason",
    "assertion": "expect(schema.safeParse({ ...failed, reason: '' }).success).toBe(false);",
    "value": false,
    "anchor": "reason: z.string().min(1).max(1000)",
    "replacement": "reason: z.string().max(1000)"
  },
  {
    "title": "rejects oversized reason",
    "assertion": "expect(schema.safeParse({ ...failed, reason: 'x'.repeat(1001) }).success).toBe(false);",
    "value": false,
    "anchor": "reason: z.string().min(1).max(1000)",
    "replacement": "reason: z.string().min(1)"
  },
  {
    "title": "rejects different tenantId",
    "assertion": "expect(matches(candidate, job)).toBe(false);",
    "value": false,
    "anchor": "sameCapabilityScope(result.scope, job.scope)",
    "replacement": "sameCapabilityScope({ ...result.scope, tenantId: job.scope.tenantId }, job.scope)"
  },
  {
    "title": "rejects different ownerId",
    "assertion": "expect(matches(candidate, job)).toBe(false);",
    "value": false,
    "anchor": "sameCapabilityScope(result.scope, job.scope)",
    "replacement": "sameCapabilityScope({ ...result.scope, ownerId: job.scope.ownerId }, job.scope)"
  },
  {
    "title": "rejects different agentId",
    "assertion": "expect(matches(candidate, job)).toBe(false);",
    "value": false,
    "anchor": "sameCapabilityScope(result.scope, job.scope)",
    "replacement": "sameCapabilityScope({ ...result.scope, agentId: job.scope.agentId }, job.scope)"
  },
  {
    "title": "rejects different jobId",
    "assertion": "expect(matches(candidate, job)).toBe(false);",
    "value": false,
    "anchor": "result.jobId === job.jobId",
    "replacement": "true"
  },
  {
    "title": "rejects different requestId",
    "assertion": "expect(matches(candidate, job)).toBe(false);",
    "value": false,
    "anchor": "result.requestId === job.requestId",
    "replacement": "true"
  },
  {
    "title": "rejects different projectId",
    "assertion": "expect(matches(candidate, job)).toBe(false);",
    "value": false,
    "anchor": "result.projectId === job.projectId",
    "replacement": "true"
  },
  {
    "title": "rejects different sessionId",
    "assertion": "expect(matches(candidate, job)).toBe(false);",
    "value": false,
    "anchor": "result.sessionId === job.session.sessionId",
    "replacement": "true"
  },
  {
    "title": "rejects different productKind",
    "assertion": "expect(matches(candidate, job)).toBe(false);",
    "value": false,
    "anchor": "result.productKind === job.productKind",
    "replacement": "true"
  },
  {
    "title": "rejects different reportVersion",
    "assertion": "expect(matches(candidate, job)).toBe(false);",
    "value": false,
    "anchor": "result.reportVersion === job.reportVersion",
    "replacement": "true"
  },
  {
    "title": "rejects different reportDigest",
    "assertion": "expect(matches(candidate, job)).toBe(false);",
    "value": false,
    "anchor": "result.reportDigest === job.reportDigest",
    "replacement": "true"
  },
  {
    "title": "rejects malformed result in correlator",
    "assertion": "expect(matches({ ...result, finishedAt: 'bad' }, job)).toBe(false);",
    "value": false,
    "anchor": "DevProductionResultSchema.safeParse(raw)",
    "replacement": "DevProductionResultSchema.safeParse({ ...Object(raw), finishedAt: '2026-10-16T01:02:03Z' })"
  },
  {
    "title": "rejects malformed job in correlator",
    "assertion": "expect(matches(result, { ...job, instruction: '' })).toBe(false);",
    "value": false,
    "anchor": "DevProductionJobSchema.safeParse(expectedJob)",
    "replacement": "DevProductionJobSchema.safeParse({ ...Object(expectedJob), instruction: 'mutant' })"
  }
];

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { availableParallelism, tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = realpathSync(fileURLToPath(new URL('../../../', import.meta.url)));
const sourcePath = 'src/capability/dev/production-result.ts';
const testPath = 'tests/capability/dev/production-result.test.ts';
const ancestor = 'dev production result';
const hash = value => createHash('sha256').update(value).digest('hex');
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function uniqueIndex(text, anchor) {
  const index = text.indexOf(anchor);
  assert.ok(index >= 0 && text.indexOf(anchor, index + anchor.length) < 0, `Anchor must occur once: ${anchor}`);
  return index;
}
function mutate(original, scenario) {
  const index = uniqueIndex(original, scenario.anchor);
  const result = original.slice(0, index) + scenario.replacement + original.slice(index + scenario.anchor.length);
  assert.notEqual(hash(result), hash(original));
  return result;
}
function assertionPosition(test, scenario) {
  const start = uniqueIndex(test, `it(${JSON.stringify(scenario.title)}, () => {`);
  const end = test.indexOf('\n  });', start);
  assert.ok(end > start, 'Named test must have a complete body');
  const index = start + uniqueIndex(test.slice(start, end), scenario.assertion);
  const matcher = index + scenario.assertion.indexOf('.toBe') + 1;
  return { line: test.slice(0, matcher).split('\n').length, column: matcher - test.lastIndexOf('\n', matcher) };
}
function publicPath(path) {
  return !path.split('/').some(part => part.startsWith('.') || /^(?:secrets?|credentials?|node_modules|dist|coverage|vendor)$/i.test(part))
    && !/\.(?:pem|key|p12|pfx|crt|cer|der)$/i.test(path)
    && !/(?:^|\/)env\.ts$/.test(path);
}
function publicFiles() {
  const paths = [];
  function visit(relative) {
    assert.ok(publicPath(relative), `Non-public path: ${relative}`);
    const absolute = join(root, relative);
    const stat = lstatSync(absolute);
    assert.ok(!stat.isSymbolicLink(), `Public sources must not traverse symlinks: ${relative}`);
    if (stat.isDirectory()) {
      for (const child of readdirSync(absolute)) {
        const path = `${relative}/${child}`;
        if (publicPath(path)) visit(path);
      }
    } else if (stat.isFile() && /\.(?:ts|mts|cts)$/.test(relative)) paths.push(relative);
  }
  visit('src');
  paths.push(testPath, 'tests/capability/dev/index.test.ts', 'tests/setup.ts',
    'src/capability/dev/production-result.ts', 'src/capability/dev/index.ts', 'package.json', 'vitest.config.ts');
  for (const name of readdirSync(root)) {
    if (/^tsconfig[^/]*\.json$/.test(name) && publicPath(name)) paths.push(name);
  }
  return [...new Set(paths)].sort();
}
function snapshot(paths) {
  return Object.fromEntries(paths.map(path => [path, hash(readFileSync(join(root, path)))]));
}
function copyPublic(paths, workspace) {
  for (const path of paths) {
    assert.ok(publicPath(path));
    let current = root;
    for (const part of path.split('/')) {
      current = join(current, part);
      assert.ok(!lstatSync(current).isSymbolicLink(), 'Public files must not traverse symlinks');
    }
    mkdirSync(dirname(join(workspace, path)), { recursive: true });
    copyFileSync(join(root, path), join(workspace, path));
  }
  symlinkSync(join(root, 'node_modules'), join(workspace, 'node_modules'), 'dir');
}
function failureMessage(value) {
  return value ? 'AssertionError: expected false to be true // Object.is equality'
    : 'AssertionError: expected true to be false // Object.is equality';
}
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
  const active = suite.assertionResults.filter(test => ['passed', 'failed'].includes(test.status));
  assert.equal(active.length, 1, 'Exactly one active test required');
  const test = active[0];
  assert.equal(test.fullName, expected.fullName);
  assert.equal(test.title, expected.title);
  assert.deepEqual(test.ancestorTitles, [ancestor]);
  assert.equal(test.status, red ? 'failed' : 'passed');
  if (!red) { assert.deepEqual(test.failureMessages, []); return; }
  assert.equal(test.failureMessages.length, 1);
  const [message, ...stack] = test.failureMessages[0].split('\n');
  assert.equal(message, failureMessage(expected.value));
  const application = stack.filter(line => line.trim().startsWith('at '))
    .find(frame => !frame.includes('/node_modules/') && !frame.includes('node:internal/')
      && frame.trim() !== 'at new Promise (<anonymous>)');
  assert.equal(application, `    at ${expected.file}:${expected.line}:${expected.column}`,
    'First application frame must identify the selected assertion');
}
function readerChecks(green, red, expected) {
  let passed = 0;
  const checks = [
    ['green report', () => validateReport(structuredClone(green), 0, expected, false)],
    ['red report', () => validateReport(structuredClone(red), 1, expected, true)],
  ];
  const changes = [
    ['zero active tests', r => { r.testResults[0].assertionResults.forEach(t => { t.status = 'pending'; }); }],
    ['different full title', r => { r.testResults[0].assertionResults.find(t => t.status === 'failed').fullName += ' foreign'; }],
    ['different title', r => { r.testResults[0].assertionResults.find(t => t.status === 'failed').title += ' foreign'; }],
    ['different file', r => { r.testResults[0].name += '.foreign'; }],
    ['collection error', r => { r.testResults[0].message = 'Cannot find module'; }],
    ['runtime failure', r => { r.testResults[0].assertionResults.find(t => t.status === 'failed').failureMessages = ['TypeError: invalid runtime']; }],
    ['unhandled error', r => { r.unhandledErrors = ['unhandled runtime error']; }],
    ['runtime error count', r => { r.numRuntimeErrorTestSuites = 1; }],
    ['wrong counter', r => { r.numFailedTests = 0; }],
    ['foreign first frame', r => {
      const test = r.testResults[0].assertionResults.find(t => t.status === 'failed');
      test.failureMessages = [`${failureMessage(expected.value)}\n    at ${expected.file}.foreign:1:1\n    at ${expected.file}:${expected.line}:${expected.column}`];
    }],
    ['wrong assertion location', r => {
      const test = r.testResults[0].assertionResults.find(t => t.status === 'failed');
      test.failureMessages = [`${failureMessage(expected.value)}\n    at ${expected.file}:${expected.line + 1}:${expected.column}`];
    }],
    ['two active tests', r => { r.testResults[0].assertionResults.push(structuredClone(r.testResults[0].assertionResults.find(t => t.status === 'failed'))); }],
  ];
  for (const [name, change] of changes) checks.push([name, () => {
    const report = structuredClone(red); change(report);
    assert.throws(() => validateReport(report, 1, expected, true), { name: 'AssertionError' });
  }]);
  checks.push(['false red exit', () => assert.throws(() => validateReport(structuredClone(green), 1, expected, true))]);
  checks.push(['wrong red exit', () => assert.throws(() => validateReport(structuredClone(red), 0, expected, true))]);
  for (const [, check] of checks) { check(); passed++; }
  return { passed, total: checks.length, checks: checks.map(([name]) => name) };
}

const directory = realpathSync(mkdtempSync(join(tmpdir(), 'dev-production-result-mutation-')));
const summaryPath = join(directory, 'summary.json');
// Each slot owns an isolated public copy; phases of one scenario stay sequential (green -> red -> green).
const slots = Math.max(1, Math.min(4, availableParallelism() - 1));
const summary = { completed: false, node: process.version, slots, mutants: { passed: 0, total: scenarios.length },
  phases: { passed: 0, total: 3 * scenarios.length }, reader: { passed: 0, total: 16 }, scenarios: [] };
const save = () => writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n');
function run(command, args, cwd) {
  return new Promise(resolve => {
    const child = spawn(command, args, { cwd, env: { ...process.env, NO_COLOR: '1' } });
    let stdout = ''; let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', error => resolve({ status: null, signal: null, error, stdout, stderr }));
    child.on('close', (status, signal) => resolve({ status, signal, error: undefined, stdout, stderr }));
  });
}
let paths;
let before;
try {
  assert.equal(process.argv.length, 2, 'This reproducer accepts no flags');
  paths = publicFiles(); before = snapshot(paths);
  const workspaces = Array.from({ length: slots }, (_, slot) => join(directory, `bridge-${slot + 1}`));
  for (const workspace of workspaces) { mkdirSync(workspace); copyPublic(paths, workspace); }
  const version = JSON.parse(readFileSync(join(workspaces[0], 'node_modules/vitest/package.json'), 'utf8')).version;
  assert.equal(version, '3.2.4', 'The reader is qualified for Vitest 3.2.4');
  const original = readFileSync(join(workspaces[0], sourcePath), 'utf8');
  const test = readFileSync(join(workspaces[0], testPath), 'utf8');
  summary.sourceHash = hash(original);
  summary.testHash = hash(test);
  for (const scenario of scenarios) { mutate(original, scenario); assertionPosition(test, scenario); }
  async function runScenario(workspace, index) {
    const scenario = scenarios[index];
    const file = join(workspace, sourcePath);
    assert.equal(hash(readFileSync(file)), hash(original), 'Slot source must start green');
    const expected = { ...scenario, ...assertionPosition(test, scenario), file: realpathSync(join(workspace, testPath)), fullName: `${ancestor} ${scenario.title}` };
    const entry = { id: index + 1, title: scenario.title, workspace, phases: [] };
    summary.scenarios[index] = entry;
    async function phase(name, red) {
      const reportPath = join(directory, `${index + 1}-${name}.json`);
      const logPath = join(directory, `${index + 1}-${name}.log`);
      const args = [join(workspace, 'node_modules/vitest/vitest.mjs'), 'run', testPath, '-t', `^${escape(expected.fullName)}$`,
        '--maxWorkers=1', '--no-cache', '--configLoader=runner', '--reporter=json', `--outputFile=${reportPath}`];
      const sourceBefore = hash(readFileSync(file));
      const child = await run(process.execPath, args, workspace);
      writeFileSync(logPath, `${child.stdout}\n${child.stderr}\n${child.error?.message ?? ''}`);
      const record = { name, exit: child.status, signal: child.signal, sourceBefore, sourceAfter: hash(readFileSync(file)), reportPath, logPath, valid: false };
      entry.phases.push(record); save();
      assert.equal(child.error, undefined); assert.equal(child.signal, null);
      assert.equal(record.sourceBefore, record.sourceAfter);
      assert.ok(existsSync(reportPath), 'Vitest must produce a real JSON report');
      const report = JSON.parse(readFileSync(reportPath, 'utf8'));
      validateReport(report, child.status, expected, red);
      record.valid = true; summary.phases.passed++; save();
      return report;
    }
    const green = await phase('baseline', false);
    let red;
    try {
      writeFileSync(file, mutate(original, scenario));
      red = await phase('mutant', true);
    } finally {
      writeFileSync(file, original);
      assert.equal(hash(readFileSync(file)), hash(original), 'Temporary source must be restored');
      await phase('restored', false);
    }
    if (index === 0) summary.reader = readerChecks(green, red, expected);
    summary.mutants.passed++; save();
  }
  let next = 0;
  let failure;
  async function worker(workspace) {
    while (failure === undefined && next < scenarios.length) {
      const index = next++;
      try { await runScenario(workspace, index); } catch (error) { failure ??= error; }
    }
  }
  await Promise.all(workspaces.map(worker));
  if (failure !== undefined) throw failure;
  assert.equal(summary.mutants.passed, summary.mutants.total);
  assert.equal(summary.phases.passed, summary.phases.total);
  assert.equal(summary.reader.passed, summary.reader.total);
  summary.completed = true;
} catch (error) {
  summary.error = { name: error.name, message: error.message };
  process.exitCode = 1;
} finally {
  if (before) {
    try { assert.deepEqual(snapshot(paths), before, 'Live public file hashes must remain unchanged'); summary.liveHashesUnchanged = true; }
    catch (error) { summary.completed = false; summary.error = { name: error.name, message: error.message }; process.exitCode = 1; }
  }
  save();
  console.log(`mutants ${summary.mutants.passed}/${summary.mutants.total}; phases ${summary.phases.passed}/${summary.phases.total}; reader ${summary.reader.passed}/${summary.reader.total}`);
  console.log(`summary: ${summaryPath}`);
}
