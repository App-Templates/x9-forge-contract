// Reproducer for the additive production job; only temporary public copies are mutated.
const scenarios = [
  {
    "title": "rejects another version",
    "anchor": "version: z.literal(1)",
    "replacement": "version: z.number()",
    "assertion": "expect(schema.safeParse({ ...job, version: 2 }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects empty jobId",
    "anchor": "jobId: z.string().min(1)",
    "replacement": "jobId: z.string()",
    "assertion": "expect(schema.safeParse({ ...job, jobId: '' }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects empty projectId",
    "anchor": "projectId: z.string().min(1)",
    "replacement": "projectId: z.string()",
    "assertion": "expect(schema.safeParse({ ...job, projectId: '' }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects malformed request id",
    "anchor": "requestId: ApprovalRequestIdSchema",
    "replacement": "requestId: z.string()",
    "assertion": "expect(schema.safeParse({ ...job, requestId: 'short' }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects unknown product kind",
    "anchor": "z.enum(['code', 'automation', 'presentation', 'design'])",
    "replacement": "z.string()",
    "assertion": "expect(schema.safeParse({ ...job, productKind: 'shell' }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects empty instruction",
    "anchor": "instruction: z.string().min(1).max(16000)",
    "replacement": "instruction: z.string().max(16000)",
    "assertion": "expect(schema.safeParse({ ...job, instruction: '' }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects oversized instruction",
    "anchor": "instruction: z.string().min(1).max(16000)",
    "replacement": "instruction: z.string().min(1)",
    "assertion": "expect(schema.safeParse({ ...job, instruction: 'x'.repeat(16001) }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects zero report version",
    "anchor": "reportVersion: z.number().int().min(1)",
    "replacement": "reportVersion: z.number().int()",
    "assertion": "expect(schema.safeParse({ ...job, reportVersion: 0 }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects fractional report version",
    "anchor": "reportVersion: z.number().int().min(1)",
    "replacement": "reportVersion: z.number().min(1)",
    "assertion": "expect(schema.safeParse({ ...job, reportVersion: 1.5 }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects uppercase digest",
    "anchor": "reportDigest: ApprovalTextSha256Schema",
    "replacement": "reportDigest: z.string()",
    "assertion": "expect(schema.safeParse({ ...job, reportDigest: 'A'.repeat(64) }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects short digest",
    "anchor": "reportDigest: ApprovalTextSha256Schema",
    "replacement": "reportDigest: z.string()",
    "assertion": "expect(schema.safeParse({ ...job, reportDigest: 'a'.repeat(63) }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects non hex digest",
    "anchor": "reportDigest: ApprovalTextSha256Schema",
    "replacement": "reportDigest: z.string()",
    "assertion": "expect(schema.safeParse({ ...job, reportDigest: 'g'.repeat(64) }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects invalid configVersion",
    "anchor": "configVersion: DevSignedCommandV2Schema.shape.configVersion",
    "replacement": "configVersion: z.number()",
    "assertion": "expect(schema.safeParse({ ...job, configVersion: -1 }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects invalid keyVersion",
    "anchor": "keyVersion: DevSignedCommandV2Schema.shape.keyVersion",
    "replacement": "keyVersion: z.number()",
    "assertion": "expect(schema.safeParse({ ...job, keyVersion: 0 }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects zero maxDurationSeconds",
    "anchor": "maxDurationSeconds: z.number().int().positive()",
    "replacement": "maxDurationSeconds: z.number().int().nonnegative()",
    "assertion": "expect(schema.safeParse({ ...job, limits: { ...job.limits, maxDurationSeconds: 0 } }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects fractional maxDurationSeconds",
    "anchor": "maxDurationSeconds: z.number().int().positive()",
    "replacement": "maxDurationSeconds: z.number().positive()",
    "assertion": "expect(schema.safeParse({ ...job, limits: { ...job.limits, maxDurationSeconds: 1.5 } }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects infinite maxDurationSeconds",
    "anchor": "maxDurationSeconds: z.number().int().positive()",
    "replacement": "maxDurationSeconds: z.custom<number>((value) => typeof value === 'number' && value > 0 && (Number.isInteger(value) || value === Infinity))",
    "assertion": "expect(schema.safeParse({ ...job, limits: { ...job.limits, maxDurationSeconds: Infinity } }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects zero maxAttempts",
    "anchor": "maxAttempts: z.number().int().positive()",
    "replacement": "maxAttempts: z.number().int().nonnegative()",
    "assertion": "expect(schema.safeParse({ ...job, limits: { ...job.limits, maxAttempts: 0 } }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects fractional maxAttempts",
    "anchor": "maxAttempts: z.number().int().positive()",
    "replacement": "maxAttempts: z.number().positive()",
    "assertion": "expect(schema.safeParse({ ...job, limits: { ...job.limits, maxAttempts: 1.5 } }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects infinite maxAttempts",
    "anchor": "maxAttempts: z.number().int().positive()",
    "replacement": "maxAttempts: z.custom<number>((value) => typeof value === 'number' && value > 0 && (Number.isInteger(value) || value === Infinity))",
    "assertion": "expect(schema.safeParse({ ...job, limits: { ...job.limits, maxAttempts: Infinity } }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects zero maxTasks",
    "anchor": "maxTasks: z.number().int().positive()",
    "replacement": "maxTasks: z.number().int().nonnegative()",
    "assertion": "expect(schema.safeParse({ ...job, limits: { ...job.limits, maxTasks: 0 } }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects fractional maxTasks",
    "anchor": "maxTasks: z.number().int().positive()",
    "replacement": "maxTasks: z.number().positive()",
    "assertion": "expect(schema.safeParse({ ...job, limits: { ...job.limits, maxTasks: 1.5 } }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects infinite maxTasks",
    "anchor": "maxTasks: z.number().int().positive()",
    "replacement": "maxTasks: z.custom<number>((value) => typeof value === 'number' && value > 0 && (Number.isInteger(value) || value === Infinity))",
    "assertion": "expect(schema.safeParse({ ...job, limits: { ...job.limits, maxTasks: Infinity } }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects crossed tenantId",
    "anchor": "sameCapabilityScope(job.scope, job.session.scope)",
    "replacement": "sameCapabilityScope(job.scope, { ...job.session.scope, tenantId: job.scope.tenantId })",
    "assertion": "expect(schema.safeParse({ ...job, session: { ...job.session, scope: { ...scope, tenantId: 'foreign' } } }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects crossed ownerId",
    "anchor": "sameCapabilityScope(job.scope, job.session.scope)",
    "replacement": "sameCapabilityScope(job.scope, { ...job.session.scope, ownerId: job.scope.ownerId })",
    "assertion": "expect(schema.safeParse({ ...job, session: { ...job.session, scope: { ...scope, ownerId: 'foreign' } } }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects crossed agentId",
    "anchor": "sameCapabilityScope(job.scope, job.session.scope)",
    "replacement": "sameCapabilityScope(job.scope, { ...job.session.scope, agentId: job.scope.agentId })",
    "assertion": "expect(schema.safeParse({ ...job, session: { ...job.session, scope: { ...scope, agentId: 'foreign' } } }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects model supplied extra",
    "anchor": "export const DevProductionJobSchema = z.strictObject({",
    "replacement": "export const DevProductionJobSchema = z.object({",
    "assertion": "expect(schema.safeParse({ ...job, extra: true }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects model supplied command",
    "anchor": "export const DevProductionJobSchema = z.strictObject({",
    "replacement": "export const DevProductionJobSchema = z.object({",
    "assertion": "expect(schema.safeParse({ ...job, command: 'run' }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects model supplied path",
    "anchor": "export const DevProductionJobSchema = z.strictObject({",
    "replacement": "export const DevProductionJobSchema = z.object({",
    "assertion": "expect(schema.safeParse({ ...job, path: '/tmp/work' }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects model supplied argv",
    "anchor": "export const DevProductionJobSchema = z.strictObject({",
    "replacement": "export const DevProductionJobSchema = z.object({",
    "assertion": "expect(schema.safeParse({ ...job, argv: ['run'] }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects model supplied shell",
    "anchor": "export const DevProductionJobSchema = z.strictObject({",
    "replacement": "export const DevProductionJobSchema = z.object({",
    "assertion": "expect(schema.safeParse({ ...job, shell: 'sh' }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects model supplied root",
    "anchor": "export const DevProductionJobSchema = z.strictObject({",
    "replacement": "export const DevProductionJobSchema = z.object({",
    "assertion": "expect(schema.safeParse({ ...job, root: '/tmp' }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects model supplied url",
    "anchor": "export const DevProductionJobSchema = z.strictObject({",
    "replacement": "export const DevProductionJobSchema = z.object({",
    "assertion": "expect(schema.safeParse({ ...job, url: 'https://example.com' }).success).toBe(false);",
    "value": false
  },
  {
    "title": "rejects extra limits",
    "anchor": "limits: z.strictObject({",
    "replacement": "limits: z.object({",
    "assertion": "expect(schema.safeParse({ ...job, limits: { ...job.limits, extra: true } }).success).toBe(false);",
    "value": false
  },
  {
    "title": "sorts engines independently of input order",
    "anchor": "[...job.session.engines].sort().join(',')",
    "replacement": "[...job.session.engines].join(',')",
    "assertion": "expect(bindings(job).engines === bindings({ ...job, session: { ...job.session, engines: ['claude', 'codex'] } }).engines).toBe(true);",
    "value": true
  },
  {
    "title": "binds changes to jobId",
    "anchor": "    jobId: job.jobId,",
    "replacement": "    jobId: 'job-1',",
    "assertion": "expect(bindings({ ...job, jobId: 'job-2' }).jobId !== bindings(job).jobId).toBe(true);",
    "value": true
  },
  {
    "title": "binds changes to projectId",
    "anchor": "    projectId: job.projectId,",
    "replacement": "    projectId: 'project-1',",
    "assertion": "expect(bindings({ ...job, projectId: 'project-2' }).projectId !== bindings(job).projectId).toBe(true);",
    "value": true
  },
  {
    "title": "binds changes to sessionId",
    "anchor": "    sessionId: job.session.sessionId,",
    "replacement": "    sessionId: 'session-1',",
    "assertion": "expect(bindings({ ...job, session: { ...job.session, sessionId: 'session-2' } }).sessionId !== bindings(job).sessionId).toBe(true);",
    "value": true
  },
  {
    "title": "binds changes to sessionKind",
    "anchor": "    sessionKind: job.session.target.kind,",
    "replacement": "    sessionKind: 'local',",
    "assertion": "expect(bindings({ ...job, session: { ...job.session, target: { kind: 'cloud', connectionRef: 'device-1' } } }).sessionKind !== bindings(job).sessionKind).toBe(true);",
    "value": true
  },
  {
    "title": "binds changes to sessionTarget",
    "anchor": "    sessionTarget: job.session.target.kind === 'local' ? job.session.target.deviceId : job.session.target.connectionRef,",
    "replacement": "    sessionTarget: 'device-1',",
    "assertion": "expect(bindings({ ...job, session: { ...job.session, target: { kind: 'local', deviceId: 'device-2' } } }).sessionTarget !== bindings(job).sessionTarget).toBe(true);",
    "value": true
  },
  {
    "title": "binds changes to engines",
    "anchor": "    engines: [...job.session.engines].sort().join(','),",
    "replacement": "    engines: 'claude,codex',",
    "assertion": "expect(bindings({ ...job, session: { ...job.session, engines: ['claude'] } }).engines !== bindings(job).engines).toBe(true);",
    "value": true
  },
  {
    "title": "binds changes to productKind",
    "anchor": "    productKind: job.productKind,",
    "replacement": "    productKind: 'code',",
    "assertion": "expect(bindings({ ...job, productKind: 'design' }).productKind !== bindings(job).productKind).toBe(true);",
    "value": true
  },
  {
    "title": "binds changes to reportVersion",
    "anchor": "    reportVersion: job.reportVersion,",
    "replacement": "    reportVersion: 1,",
    "assertion": "expect(bindings({ ...job, reportVersion: 2 }).reportVersion !== bindings(job).reportVersion).toBe(true);",
    "value": true
  },
  {
    "title": "binds changes to reportDigest",
    "anchor": "    reportDigest: job.reportDigest,",
    "replacement": "    reportDigest: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',",
    "assertion": "expect(bindings({ ...job, reportDigest: 'b'.repeat(64) }).reportDigest !== bindings(job).reportDigest).toBe(true);",
    "value": true
  },
  {
    "title": "binds changes to configVersion",
    "anchor": "    configVersion: job.configVersion,",
    "replacement": "    configVersion: 0,",
    "assertion": "expect(bindings({ ...job, configVersion: 1 }).configVersion !== bindings(job).configVersion).toBe(true);",
    "value": true
  },
  {
    "title": "binds changes to keyVersion",
    "anchor": "    keyVersion: job.keyVersion,",
    "replacement": "    keyVersion: 1,",
    "assertion": "expect(bindings({ ...job, keyVersion: 2 }).keyVersion !== bindings(job).keyVersion).toBe(true);",
    "value": true
  },
  {
    "title": "binds changed cloud reference",
    "anchor": "job.session.target.kind === 'local' ? job.session.target.deviceId : job.session.target.connectionRef",
    "replacement": "job.session.target.kind === 'local' ? job.session.target.deviceId : 'cloud-1'",
    "assertion": "expect(bindings({ ...job, session: { ...job.session, target: { kind: 'cloud', connectionRef: 'cloud-2' } } }).sessionTarget === 'cloud-2').toBe(true);",
    "value": true
  },
  {
    "title": "validates job before binding",
    "anchor": "const job = DevProductionJobSchema.parse(raw);",
    "replacement": "const job = raw as DevProductionJob;",
    "assertion": "expect(rejects(() => bindings({ ...job, instruction: '' }))).toBe(true);",
    "value": true
  },
  {
    "title": "validates approval binding constraints",
    "anchor": "return ApprovalBindingsSchema.parse({",
    "replacement": "return ({",
    "assertion": "expect(rejects(() => bindings({ ...job, jobId: 'x'.repeat(257) }))).toBe(true);",
    "value": true
  },
  {
    "title": "routes code to night",
    "anchor": "kind === 'code' || kind === 'automation' ? 'night' : 'session'",
    "replacement": "kind === 'code' ? 'session' : (kind === 'code' || kind === 'automation' ? 'night' : 'session')",
    "assertion": "expect(mode('code') === 'night').toBe(true);",
    "value": true
  },
  {
    "title": "routes automation to night",
    "anchor": "kind === 'code' || kind === 'automation' ? 'night' : 'session'",
    "replacement": "kind === 'automation' ? 'session' : (kind === 'code' || kind === 'automation' ? 'night' : 'session')",
    "assertion": "expect(mode('automation') === 'night').toBe(true);",
    "value": true
  },
  {
    "title": "routes presentation to session",
    "anchor": "kind === 'code' || kind === 'automation' ? 'night' : 'session'",
    "replacement": "kind === 'presentation' ? 'night' : (kind === 'code' || kind === 'automation' ? 'night' : 'session')",
    "assertion": "expect(mode('presentation') === 'session').toBe(true);",
    "value": true
  },
  {
    "title": "routes design to session",
    "anchor": "kind === 'code' || kind === 'automation' ? 'night' : 'session'",
    "replacement": "kind === 'design' ? 'night' : (kind === 'code' || kind === 'automation' ? 'night' : 'session')",
    "assertion": "expect(mode('design') === 'session').toBe(true);",
    "value": true
  },
  {
    "title": "rejects invalid execution kind",
    "anchor": "const kind = DevProductionKindSchema.parse(raw);",
    "replacement": "const kind = raw;",
    "assertion": "expect(rejects(() => mode('shell'))).toBe(true);",
    "value": true
  }
];

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, lstatSync, readdirSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '../../..'));
const sourcePath = 'src/capability/dev/production-job.ts';
const testPath = 'tests/capability/dev/production-job.test.ts';
const prefix = 'dev production job ';
const hash = (text) => createHash('sha256').update(text).digest('hex');
const directory = realpathSync(mkdtempSync(join(tmpdir(), 'production-job-')));
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
  return /^(?:src\/.*\.ts|tests\/capability\/dev\/(?:production-job\.(?:test\.ts|mutation\.mjs)|index\.test\.ts|signed-command\.test\.ts)|tests\/setup\.ts|package\.json|vitest\.config\.ts|tsconfig[^/]*\.json)$/.test(path)
    && !path.split('/').some(part => part.startsWith('.') || /^(?:secrets?|credentials?|dist|coverage|vendor|node_modules)$/i.test(part))
    && !/\.(?:pem|key|p12|pfx|crt|cer|der)$/i.test(path);
}
function sourceFiles(directory, prefix = 'src') {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = `${prefix}/${entry.name}`;
    if (entry.isSymbolicLink() || entry.name.startsWith('.') || /^(?:secrets?|credentials?|dist|coverage|vendor|node_modules)$/i.test(entry.name)) return [];
    return entry.isDirectory() ? sourceFiles(join(directory, entry.name), path) : publicPath(path) ? [path] : [];
  });
}
const paths = [...new Set([
  ...sourceFiles(join(root, 'src')),
  ...git(['ls-files', '-z', '--', 'src', 'package.json', 'vitest.config.ts', 'tsconfig.json', 'tsconfig.eslint.json']).split('\0').filter(Boolean).filter(publicPath),
  sourcePath, 'src/capability/dev/index.ts', testPath, 'tests/capability/dev/index.test.ts', 'tests/capability/dev/signed-command.test.ts', 'tests/setup.ts', 'tests/capability/dev/production-job.mutation.mjs',
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
  assert.deepEqual(test.ancestorTitles, ['dev production job']);
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
