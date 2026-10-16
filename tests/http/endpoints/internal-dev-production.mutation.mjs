// Mutation scenarios are paired with named, single-assertion contract tests.
const scenarios = [
  {
    "id": "P001",
    "title": "submit exact method",
    "anchor": "  method: 'POST' as const,",
    "replacement": "  method: 'changed' as const,",
    "expected": true
  },
  {
    "id": "P002",
    "title": "submit exact path",
    "anchor": "  path: '/internal/capability/agents/:agentId/dev/jobs' as const,",
    "replacement": "  path: 'changed' as const,",
    "expected": true
  },
  {
    "id": "P003",
    "title": "submit exact authType",
    "anchor": "  path: '/internal/capability/agents/:agentId/dev/jobs' as const,\n  authType: 'secret' as const,",
    "replacement": "  path: '/internal/capability/agents/:agentId/dev/jobs' as const,\n  authType: 'token' as const,",
    "expected": true
  },
  {
    "id": "P004",
    "title": "get exact method",
    "anchor": "  method: 'GET' as const,",
    "replacement": "  method: 'changed' as const,",
    "expected": true
  },
  {
    "id": "P005",
    "title": "get exact path",
    "anchor": "  path: '/internal/capability/agents/:agentId/dev/jobs/:jobId' as const,",
    "replacement": "  path: 'changed' as const,",
    "expected": true
  },
  {
    "id": "P006",
    "title": "get exact authType",
    "anchor": "  path: '/internal/capability/agents/:agentId/dev/jobs/:jobId' as const,\n  authType: 'secret' as const,",
    "replacement": "  path: '/internal/capability/agents/:agentId/dev/jobs/:jobId' as const,\n  authType: 'token' as const,",
    "expected": true
  },
  {
    "id": "P007",
    "title": "reuses submit params",
    "anchor": "paramsSchema: CapabilityAgentParamsSchema,",
    "replacement": "paramsSchema: CapabilityAgentParamsSchema.strict(),",
    "expected": true
  },
  {
    "id": "P008",
    "title": "reuses submission body",
    "anchor": "bodySchema: DevProductionSubmissionSchema,",
    "replacement": "bodySchema: DevProductionSubmissionSchema.clone(),",
    "expected": true
  },
  {
    "id": "P009",
    "title": "reuses job schema",
    "anchor": "job: DevProductionJobSchema,",
    "replacement": "job: DevProductionJobSchema.clone(),",
    "expected": true
  },
  {
    "id": "P010",
    "title": "reuses signed approval schema",
    "anchor": "approval: SignedApprovalPermitSchema,",
    "replacement": "approval: SignedApprovalPermitSchema.clone(),",
    "expected": true
  },
  {
    "id": "P011",
    "title": "reuses result schema",
    "anchor": "result: DevProductionResultSchema",
    "replacement": "result: DevProductionResultSchema.clone()",
    "expected": true
  },
  {
    "id": "P012",
    "title": "reuses get agent schema",
    "anchor": "agentId: CapabilityAgentParamsSchema.shape.agentId,",
    "replacement": "agentId: CapabilityAgentParamsSchema.shape.agentId.clone(),",
    "expected": true
  },
  {
    "id": "P013",
    "title": "reuses scope schema",
    "anchor": "scope: CapabilityAgentScopeSchema",
    "replacement": "scope: CapabilityAgentScopeSchema.clone()",
    "expected": true
  },
  {
    "id": "P015",
    "title": "submission is strict",
    "anchor": "DevProductionSubmissionSchema = z.strictObject({",
    "replacement": "DevProductionSubmissionSchema = z.object({",
    "expected": false
  },
  {
    "id": "P016",
    "title": "submission rejects invalid job",
    "anchor": "job: DevProductionJobSchema,",
    "replacement": "job: z.unknown(),",
    "expected": false
  },
  {
    "id": "P017",
    "title": "submission rejects invalid approval",
    "anchor": "approval: SignedApprovalPermitSchema,",
    "replacement": "approval: z.unknown(),",
    "expected": false
  },
  {
    "id": "P018",
    "title": "submission requires job",
    "anchor": "job: DevProductionJobSchema,",
    "replacement": "job: DevProductionJobSchema.optional(),",
    "expected": false
  },
  {
    "id": "P019",
    "title": "submission requires approval",
    "anchor": "approval: SignedApprovalPermitSchema,",
    "replacement": "approval: SignedApprovalPermitSchema.optional(),",
    "expected": false
  },
  {
    "id": "P021",
    "title": "queued has no artifacts",
    "anchor": "responseSchema: z.strictObject({\n    jobId:",
    "replacement": "responseSchema: z.object({\n    jobId:",
    "expected": false
  },
  {
    "id": "P022",
    "title": "queued is not succeeded",
    "anchor": "status: z.literal('queued'),",
    "replacement": "status: z.string(),",
    "expected": false
  },
  {
    "id": "P023",
    "title": "queued requires job identity",
    "anchor": "jobId: z.string().min(1),\n    requestId:",
    "replacement": "jobId: z.string(),\n    requestId:",
    "expected": false
  },
  {
    "id": "P024",
    "title": "queued validates request identity",
    "anchor": "requestId: ApprovalRequestIdSchema,\n    status:",
    "replacement": "requestId: z.string(),\n    status:",
    "expected": false
  },
  {
    "id": "P025",
    "title": "get params are strict",
    "anchor": "paramsSchema: z.strictObject({",
    "replacement": "paramsSchema: z.object({",
    "expected": false
  },
  {
    "id": "P026",
    "title": "get requires job identity",
    "anchor": "jobId: z.string().min(1),\n  }),\n  querySchema:",
    "replacement": "jobId: z.string(),\n  }),\n  querySchema:",
    "expected": false
  },
  {
    "id": "P027",
    "title": "get query is strict",
    "anchor": "querySchema: z.strictObject({",
    "replacement": "querySchema: z.object({",
    "expected": false
  },
  {
    "id": "P028",
    "title": "get requires scope",
    "anchor": "scope: CapabilityAgentScopeSchema",
    "replacement": "scope: CapabilityAgentScopeSchema.optional()",
    "expected": false
  },
  {
    "id": "P029",
    "title": "get rejects incomplete scope",
    "anchor": "scope: CapabilityAgentScopeSchema",
    "replacement": "scope: z.unknown()",
    "expected": false
  },
  {
    "id": "P031",
    "title": "pending has no artifacts",
    "anchor": "z.strictObject({\n      status: z.literal('pending'),",
    "replacement": "z.object({\n      status: z.literal('pending'),",
    "expected": false
  },
  {
    "id": "P032",
    "title": "pending validates job identity",
    "anchor": "jobId: z.string().min(1),\n      requestId:",
    "replacement": "jobId: z.string(),\n      requestId:",
    "expected": false
  },
  {
    "id": "P033",
    "title": "pending validates request identity",
    "anchor": "requestId: ApprovalRequestIdSchema,\n    }),",
    "replacement": "requestId: z.string(),\n    }),",
    "expected": false
  },
  {
    "id": "P035",
    "title": "finished envelope is strict",
    "anchor": "z.strictObject({ status: z.literal('finished'), result:",
    "replacement": "z.object({ status: z.literal('finished'), result:",
    "expected": false
  },
  {
    "id": "P036",
    "title": "finished validates result",
    "anchor": "result: DevProductionResultSchema",
    "replacement": "result: z.unknown()",
    "expected": false
  },
  {
    "id": "P037",
    "title": "finished requires result",
    "anchor": "result: DevProductionResultSchema",
    "replacement": "result: DevProductionResultSchema.optional()",
    "expected": false
  },
  {
    "id": "P039",
    "title": "nominal correlation uses A11",
    "anchor": "return check.ok;",
    "replacement": "return false;",
    "expected": true
  },
  {
    "id": "P040",
    "title": "A11 call receives the permit",
    "anchor": "checkApprovalPermit(signed.data.permit, {",
    "replacement": "checkApprovalPermit(signed.data, {",
    "expected": true
  },
  {
    "id": "P041",
    "title": "A11 rejection is returned",
    "anchor": "return check.ok;",
    "replacement": "return true;",
    "expected": false
  },
  {
    "id": "P042",
    "title": "A11 result is not inverted",
    "anchor": "return check.ok;",
    "replacement": "return !check.ok;",
    "expected": true
  },
  {
    "id": "P043",
    "title": "independent A11 client",
    "anchor": "client: 'dev',",
    "replacement": "client: signed.data.permit.client,",
    "expected": true
  },
  {
    "id": "P044",
    "title": "independent A11 type",
    "anchor": "type: 'dev.produce',",
    "replacement": "type: signed.data.permit.type,",
    "expected": true
  },
  {
    "id": "P045",
    "title": "independent A11 scope",
    "anchor": "scope: job.scope,",
    "replacement": "scope: signed.data.permit,",
    "expected": true
  },
  {
    "id": "P046",
    "title": "independent A11 request",
    "anchor": "requestId: job.requestId,",
    "replacement": "requestId: signed.data.permit.requestId,",
    "expected": true
  },
  {
    "id": "P047",
    "title": "independent A11 text",
    "anchor": "textSha256: text.data,",
    "replacement": "textSha256: signed.data.permit.textSha256,",
    "expected": true
  },
  {
    "id": "P048",
    "title": "independent A11 bindings",
    "anchor": "bindings: devProductionApprovalBindings(job),",
    "replacement": "bindings: signed.data.permit.bindings,",
    "expected": true
  },
  {
    "id": "P049",
    "title": "A11 is actually invoked",
    "anchor": "const check = checkApprovalPermit(signed.data.permit, {",
    "replacement": "const check = ((..._args: unknown[]) => ({ ok: true }))(signed.data.permit, {",
    "expected": true
  },
  {
    "id": "P050",
    "title": "rejects changed tenantId",
    "anchor": "scope: job.scope,",
    "replacement": "scope: { ...job.scope, tenantId: signed.data.permit.tenantId },",
    "expected": false
  },
  {
    "id": "P051",
    "title": "rejects changed ownerId",
    "anchor": "scope: job.scope,",
    "replacement": "scope: { ...job.scope, ownerId: signed.data.permit.ownerId },",
    "expected": false
  },
  {
    "id": "P052",
    "title": "rejects changed agentId",
    "anchor": "scope: job.scope,",
    "replacement": "scope: { ...job.scope, agentId: signed.data.permit.agentId },",
    "expected": false
  },
  {
    "id": "P057",
    "title": "rejects changed binding jobId",
    "anchor": "bindings: devProductionApprovalBindings(job),",
    "replacement": "bindings: { ...devProductionApprovalBindings(job), jobId: signed.data.permit.bindings.jobId },",
    "expected": false
  },
  {
    "id": "P058",
    "title": "rejects changed binding projectId",
    "anchor": "bindings: devProductionApprovalBindings(job),",
    "replacement": "bindings: { ...devProductionApprovalBindings(job), projectId: signed.data.permit.bindings.projectId },",
    "expected": false
  },
  {
    "id": "P059",
    "title": "rejects changed binding sessionId",
    "anchor": "bindings: devProductionApprovalBindings(job),",
    "replacement": "bindings: { ...devProductionApprovalBindings(job), sessionId: signed.data.permit.bindings.sessionId },",
    "expected": false
  },
  {
    "id": "P060",
    "title": "rejects changed binding sessionKind",
    "anchor": "bindings: devProductionApprovalBindings(job),",
    "replacement": "bindings: { ...devProductionApprovalBindings(job), sessionKind: signed.data.permit.bindings.sessionKind },",
    "expected": false
  },
  {
    "id": "P061",
    "title": "rejects changed binding sessionTarget",
    "anchor": "bindings: devProductionApprovalBindings(job),",
    "replacement": "bindings: { ...devProductionApprovalBindings(job), sessionTarget: signed.data.permit.bindings.sessionTarget },",
    "expected": false
  },
  {
    "id": "P062",
    "title": "rejects changed binding engines",
    "anchor": "bindings: devProductionApprovalBindings(job),",
    "replacement": "bindings: { ...devProductionApprovalBindings(job), engines: signed.data.permit.bindings.engines },",
    "expected": false
  },
  {
    "id": "P063",
    "title": "rejects changed binding productKind",
    "anchor": "bindings: devProductionApprovalBindings(job),",
    "replacement": "bindings: { ...devProductionApprovalBindings(job), productKind: signed.data.permit.bindings.productKind },",
    "expected": false
  },
  {
    "id": "P064",
    "title": "rejects changed binding reportVersion",
    "anchor": "bindings: devProductionApprovalBindings(job),",
    "replacement": "bindings: { ...devProductionApprovalBindings(job), reportVersion: signed.data.permit.bindings.reportVersion },",
    "expected": false
  },
  {
    "id": "P065",
    "title": "rejects changed binding reportDigest",
    "anchor": "bindings: devProductionApprovalBindings(job),",
    "replacement": "bindings: { ...devProductionApprovalBindings(job), reportDigest: signed.data.permit.bindings.reportDigest },",
    "expected": false
  },
  {
    "id": "P066",
    "title": "rejects changed binding configVersion",
    "anchor": "bindings: devProductionApprovalBindings(job),",
    "replacement": "bindings: { ...devProductionApprovalBindings(job), configVersion: signed.data.permit.bindings.configVersion },",
    "expected": false
  },
  {
    "id": "P067",
    "title": "rejects changed binding keyVersion",
    "anchor": "bindings: devProductionApprovalBindings(job),",
    "replacement": "bindings: { ...devProductionApprovalBindings(job), keyVersion: signed.data.permit.bindings.keyVersion },",
    "expected": false
  },
  {
    "id": "P068",
    "title": "rejects expired permit",
    "anchor": "}, nowMs);",
    "replacement": "}, Date.parse(signed.data.permit.issuedAt));",
    "expected": false
  },
  {
    "id": "P069",
    "title": "rejects future permit",
    "anchor": "}, nowMs);",
    "replacement": "}, Date.parse(signed.data.permit.issuedAt));",
    "expected": false
  },
  {
    "id": "P070",
    "title": "rejects NaN clock",
    "anchor": " || !Number.isFinite(nowMs)",
    "replacement": "",
    "expected": true
  },
  {
    "id": "P071",
    "title": "rejects positive infinity clock",
    "anchor": " || !Number.isFinite(nowMs)",
    "replacement": "",
    "expected": true
  },
  {
    "id": "P072",
    "title": "rejects negative infinity clock",
    "anchor": " || !Number.isFinite(nowMs)",
    "replacement": "",
    "expected": true
  },
  {
    "id": "P073",
    "title": "parses signed envelope",
    "anchor": "SignedApprovalPermitSchema.safeParse(rawSignedPermit)",
    "replacement": "SignedApprovalPermitSchema.safeParse({ ...Object(rawSignedPermit), signature: \"s\".repeat(86) })",
    "expected": false
  },
  {
    "id": "P074",
    "title": "parses expected job",
    "anchor": "DevProductionJobSchema.safeParse(expectedJob)",
    "replacement": "DevProductionJobSchema.safeParse(Object.fromEntries(Object.entries(Object(expectedJob)).filter(([key]) => key !== \"extra\")))",
    "expected": false
  },
  {
    "id": "P075",
    "title": "parses expected digest",
    "anchor": "ApprovalTextSha256Schema.safeParse(expectedTextSha256)",
    "replacement": "ApprovalTextSha256Schema.safeParse(String(expectedTextSha256).toLowerCase())",
    "expected": false
  },
  {
    "id": "P030",
    "title": "accepts pending without artifacts",
    "anchor": "status: z.literal('pending'),",
    "replacement": "status: z.literal('queued'),",
    "expected": true
  },
  {
    "id": "P034",
    "title": "accepts validated finished result",
    "anchor": "status: z.literal('finished'), result:",
    "replacement": "status: z.literal('done'), result:",
    "expected": true
  }
];

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// Run the complete persistent Vitest session under the required quiet executor.
// The child marker prevents recursion; no scenario or phase is omitted.
assert.equal(process.argv.length, 2, 'This reproducer accepts no flags');
if (process.env.DEV_PRODUCTION_MUTATION_CHILD !== '1') {
  assert.ok(process.env.QRUN, 'QRUN is required for every verification command');
  const child = spawnSync(process.env.QRUN, [process.execPath, fileURLToPath(import.meta.url)], {
    stdio: 'inherit',
    env: { ...process.env, DEV_PRODUCTION_MUTATION_CHILD: '1',
      QRUN_LOG: join(tmpdir(), `dev-production-session-${process.pid}.qrun`) },
  });
  assert.equal(child.error, undefined);
  assert.equal(child.signal, null);
  process.exit(child.status ?? 1);
}
const root = realpathSync(fileURLToPath(new URL('../../../', import.meta.url)));
const sourcePath = 'src/http/endpoints/internal-dev-production.ts';
const testPath = 'tests/http/endpoints/internal-dev-production.test.ts';
const barrelPath = 'src/http/endpoints/index.ts';
const prefix = 'internal dev production ';
const hash = value => createHash('sha256').update(value).digest('hex');
const directory = realpathSync(mkdtempSync(join(tmpdir(), 'dev-production-mutation-')));
const workspace = join(directory, 'bridge');
const summary = { mutants: 0, phases: 0, readerPassed: 0, readerTotal: 0, total: scenarios.length, completed: false, scenarios: [] };
const save = () => writeFileSync(join(directory, 'summary.json'), JSON.stringify(summary, null, 2));
const liveHashes = new Map();
function publicFile(path) {
  return /^(?:src\/.*\.ts|tests\/http\/endpoints\/internal-dev-production\.(?:test\.ts|mutation\.mjs)|tests\/setup\.ts|package\.json|tsconfig(?:\.eslint)?\.json|vitest\.config\.ts)$/.test(path)
    && !path.split('/').some(part => /^(?:\.{1,2}|\.env.*|secrets?|dist|coverage|vendor|node_modules)$/i.test(part))
    && !/\.(?:key|pem|p12|pfx|crt|cer|der)$/.test(path);
}
function copyPublic() {
  const listing = readdirSync(join(root, 'src'), { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => join(entry.parentPath, entry.name).slice(root.length + 1).split('\\').join('/'));
  assert.ok(listing.length > 0, 'src listing must not be empty');
  const paths = new Set([...listing.filter(publicFile), sourcePath, barrelPath, testPath,
    'tests/http/endpoints/internal-dev-production.mutation.mjs', 'tests/setup.ts', 'package.json',
    'vitest.config.ts', 'tsconfig.json', 'tsconfig.eslint.json']);
  mkdirSync(workspace);
  for (const path of paths) {
    assert.ok(publicFile(path), `Non-public path: ${path}`);
    let current = root;
    for (const part of path.split('/')) {
      current = join(current, part);
      assert.equal(lstatSync(current).isSymbolicLink(), false, 'Public copies cannot traverse symlinks');
    }
    assert.ok(lstatSync(current).isFile());
    const bytes = readFileSync(current);
    liveHashes.set(path, hash(bytes));
    mkdirSync(dirname(join(workspace, path)), { recursive: true });
    copyFileSync(current, join(workspace, path));
  }
  symlinkSync(join(root, 'node_modules'), join(workspace, 'node_modules'), 'dir');
}
function uniqueIndex(text, anchor) {
  const index = text.indexOf(anchor);
  assert.ok(index >= 0 && text.indexOf(anchor, index + anchor.length) < 0, `Anchor must be unique: ${anchor}`);
  return index;
}
function mutate(original, scenario) {
  const index = uniqueIndex(original, scenario.anchor);
  const changed = original.slice(0, index) + scenario.replacement + original.slice(index + scenario.anchor.length);
  assert.notEqual(hash(changed), hash(original));
  return changed;
}
function expectedFor(test, scenario) {
  const marker = uniqueIndex(test, ` // ${scenario.id}\n`);
  const start = test.lastIndexOf('\n', marker) + 1;
  const matcher = test.indexOf('.toBe(', start) + 1;
  assert.ok(matcher > start && matcher < marker);
  assert.ok(test.includes(`it(${JSON.stringify(scenario.title)}, () => {`), 'Named test must exist');
  return { file: realpathSync(join(workspace, testPath)), title: scenario.title,
    fullName: prefix + scenario.title, line: test.slice(0, matcher).split('\n').length,
    column: matcher - test.lastIndexOf('\n', matcher), expected: scenario.expected };
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
  assert.equal(suite.message, '', 'Collection/runtime failure');
  const active = suite.assertionResults.filter(test => ['passed', 'failed'].includes(test.status));
  assert.equal(active.length, 1, 'Exactly one active test is required');
  const test = active[0];
  assert.equal(test.title, expected.title);
  assert.equal(test.fullName, expected.fullName);
  assert.deepEqual(test.ancestorTitles, ['internal dev production']);
  assert.equal(test.status, red ? 'failed' : 'passed');
  if (!red) { assert.deepEqual(test.failureMessages, []); return; }
  assert.equal(test.failureMessages.length, 1);
  const [message, ...stack] = test.failureMessages[0].split('\n');
  assert.equal(message, `AssertionError: expected ${!expected.expected} to be ${expected.expected} // Object.is equality`);
  const application = stack.filter(line => line.trim().startsWith('at ')).find(frame =>
    !frame.includes('/node_modules/') && !frame.includes('node:internal/') && frame.trim() !== 'at new Promise (<anonymous>)');
  assert.equal(application, `    at ${expected.file}:${expected.line}:${expected.column}`,
    'First application frame must identify the expected assertion');
}
function selfTest(green, red, expected) {
  const check = run => { summary.readerTotal++; run(); summary.readerPassed++; };
  check(() => validateReport(structuredClone(green), 0, expected, false));
  check(() => validateReport(structuredClone(red), 1, expected, true));
  for (const change of [
    r => { r.testResults[0].assertionResults.forEach(test => { test.status = 'pending'; }); },
    r => { r.testResults[0].assertionResults.find(test => test.status === 'failed').fullName += ' foreign'; },
    r => { r.testResults[0].assertionResults.find(test => test.status === 'failed').title += ' foreign'; },
    r => { r.testResults[0].name += '.foreign'; },
    r => { r.numRuntimeErrorTestSuites = 1; },
    r => { r.unhandledErrors = ['runtime error']; },
    r => { r.testResults[0].message = 'Failed to collect: missing import'; },
    r => { r.testResults[0].assertionResults.find(test => test.status === 'failed').failureMessages = ['Error: Test timed out']; },
    r => { const test = r.testResults[0].assertionResults.find(test => test.status === 'failed'); test.failureMessages[0] = test.failureMessages[0].replace(`${expected.file}:${expected.line}:`, `${expected.file}:999999:`); },
    r => { r.numFailedTests = 0; },
    r => { r.success = true; },
  ]) check(() => {
    const report = structuredClone(red); change(report);
    assert.throws(() => validateReport(report, 1, expected, true), { name: 'AssertionError' });
  });
  check(() => assert.throws(() => validateReport(structuredClone(red), 0, expected, true)));
  check(() => assert.throws(() => validateReport(structuredClone(green), 1, expected, true)));
}
let vitest;
let specifications;
async function phase(scenario, name, expected, red) {
  const reportPath = join(directory, `${scenario.id}-${name}.json`);
  const escaped = expected.fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const before = hash(readFileSync(join(workspace, sourcePath)));
  assert.equal(existsSync(reportPath), false, 'Each phase needs a fresh report');
  // Same anchored selection as CLI -t; one isolated test run per phase.
  // Keep Vite's transform server and the worker alive, not the test module state.
  vitest.setGlobalTestNamePattern(`^${escaped}$`);
  vitest.config.outputFile = reportPath;
  vitest.invalidateFile(join(workspace, sourcePath));
  vitest.invalidateFile(join(workspace, testPath));
  process.exitCode = 0;
  await vitest.runTestSpecifications(specifications);
  const exit = process.exitCode;
  assert.equal(hash(readFileSync(join(workspace, sourcePath))), before);
  assert.ok(existsSync(reportPath), `Missing Vitest report: ${reportPath}`);
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  // Vitest itself sets exitCode on assertion/runtime failures, independently of
  // the JSON reader. Never infer a successful mutation from that code alone.
  validateReport(report, exit, expected, red);
  summary.phases++; save();
  return report;
}
try {
  assert.equal(process.argv.length, 2, 'This reproducer accepts no flags');
  assert.equal(JSON.parse(readFileSync(join(root, 'node_modules/vitest/package.json'), 'utf8')).version, '3.2.4');
  copyPublic();
  const { createVitest } = await import('vitest/node');
  vitest = await createVitest('test', {
    root: workspace, config: join(workspace, 'vitest.config.ts'), configLoader: 'runner',
    watch: false, cache: false, maxWorkers: 1, minWorkers: 1,
    pool: 'forks', poolOptions: { forks: { singleFork: true } }, isolate: true,
    reporters: ['json'],
  });
  await vitest.init();
  specifications = await vitest.globTestSpecifications([testPath]);
  assert.equal(specifications.length, 1, 'Exactly one test module required');
  const source = join(workspace, sourcePath);
  const original = readFileSync(source, 'utf8');
  const test = readFileSync(join(workspace, testPath), 'utf8');
  for (const scenario of scenarios) { mutate(original, scenario); expectedFor(test, scenario); }
  for (const scenario of scenarios) {
    const expected = expectedFor(test, scenario);
    const green = await phase(scenario, 'baseline', expected, false);
    let red;
    try {
      writeFileSync(source, mutate(original, scenario));
      red = await phase(scenario, 'mutant', expected, true);
    } finally {
      writeFileSync(source, original);
      assert.equal(hash(readFileSync(source)), hash(original));
      await phase(scenario, 'restored', expected, false);
    }
    if (summary.mutants === 0) selfTest(green, red, expected);
    summary.mutants++;
    summary.scenarios.push({ id: scenario.id, title: scenario.title, validPhases: 3 }); save();
  }
  assert.equal(summary.mutants, scenarios.length);
  assert.equal(summary.phases, 3 * scenarios.length);
  assert.equal(summary.readerPassed, summary.readerTotal);
  summary.completed = true;
} catch (error) {
  summary.error = { name: error.name, message: error.message };
  process.exitCode = 1;
} finally {
  if (vitest) await vitest.close();
  for (const [path, before] of liveHashes) {
    if (hash(readFileSync(join(root, path))) !== before) {
      summary.error = { message: `Live source changed: ${path}` }; summary.completed = false; process.exitCode = 1;
    }
  }
  save();
  console.log(`mutants ${summary.mutants}/${summary.total}; phases ${summary.phases}/${3 * summary.total}; reader ${summary.readerPassed}/${summary.readerTotal}; report ${join(directory, 'summary.json')}`);
  if (summary.error) console.error(summary.error.message);
}
