import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const sourcePath = 'src/http/endpoints/internal-dev-cancel.ts';
const testPath = 'tests/http/endpoints/internal-dev-cancel.test.ts';
const suiteTitle = 'internal dev cancel';
const scenarios = [
  {
    "id": "method",
    "anchor": "method: 'POST' as const",
    "replacement": "method: 'GET' as const",
    "title": "exports exact metadata and request receipt identities",
    "assertion": "expect(contract.method === 'POST').toBe(true);",
    "failure": "false to be true"
  },
  {
    "id": "path",
    "anchor": "path: '/internal/capability/agents/:agentId/dev/jobs/:jobId/cancel' as const",
    "replacement": "path: '/internal/capability/agents/:agentId/dev/jobs/:jobId/other' as const",
    "title": "exports exact metadata and request receipt identities",
    "assertion": "expect(contract.path === '/internal/capability/agents/:agentId/dev/jobs/:jobId/cancel').toBe(true);",
    "failure": "false to be true"
  },
  {
    "id": "auth",
    "anchor": "authType: 'secret' as const",
    "replacement": "authType: 'none' as const",
    "title": "exports exact metadata and request receipt identities",
    "assertion": "expect(contract.authType === 'secret').toBe(true);",
    "failure": "false to be true"
  },
  {
    "id": "body-identity",
    "anchor": "bodySchema: DevProductionCancelRequestSchema,",
    "replacement": "bodySchema: DevProductionCancelRequestSchema.clone(),",
    "title": "exports exact metadata and request receipt identities",
    "assertion": "expect(contract.bodySchema === requestSchema).toBe(true);",
    "failure": "false to be true"
  },
  {
    "id": "receipt-identity",
    "anchor": "responseSchema: DevProductionCancelReceiptSchema,",
    "replacement": "responseSchema: DevProductionCancelReceiptSchema.clone(),",
    "title": "exports exact metadata and request receipt identities",
    "assertion": "expect(contract.responseSchema === receiptSchema).toBe(true);",
    "failure": "false to be true"
  },
  {
    "id": "request-strict",
    "anchor": "DevProductionCancelRequestSchema = z.strictObject({",
    "replacement": "DevProductionCancelRequestSchema = z.object({",
    "title": "rejects commands tokens and permits in requests",
    "assertion": "expect(requestValid({ ...request, [field]: 'unexpected' })).toBe(false);",
    "failure": "true to be false"
  },
  {
    "id": "receipt-strict",
    "anchor": "DevProductionCancelReceiptSchema = z.strictObject({",
    "replacement": "DevProductionCancelReceiptSchema = z.object({",
    "title": "rejects extra receipt fields including terminal effects",
    "assertion": "expect(receiptValid({ ...receipt, [field]: 'unexpected' })).toBe(false);",
    "failure": "true to be false"
  },
  {
    "id": "params-strict",
    "anchor": "paramsSchema: z.strictObject({",
    "replacement": "paramsSchema: z.object({",
    "title": "rejects extra parameters",
    "assertion": "expect(contract.paramsSchema.safeParse({ ...params, runId: 'native-run' }).success).toBe(false);",
    "failure": "true to be false"
  },
  {
    "id": "reason-min",
    "anchor": "reason: z.string().trim().min(1).max(500),",
    "replacement": "reason: z.string().trim().max(500),",
    "title": "rejects empty reasons",
    "assertion": "expect(requestValid({ ...request, reason: '' })).toBe(false);",
    "failure": "true to be false"
  },
  {
    "id": "reason-max",
    "anchor": "reason: z.string().trim().min(1).max(500),",
    "replacement": "reason: z.string().trim().min(1),",
    "title": "rejects overlong reasons",
    "assertion": "expect(requestValid({ ...request, reason: 'x'.repeat(501) })).toBe(false);",
    "failure": "true to be false"
  },
  {
    "id": "reason-trim",
    "anchor": "reason: z.string().trim().min(1).max(500),",
    "replacement": "reason: z.string().min(1).max(500),",
    "title": "rejects empty reasons",
    "assertion": "expect(requestValid({ ...request, reason: '   ' })).toBe(false);",
    "failure": "true to be false"
  },
  {
    "id": "receipt-status",
    "anchor": "status: z.literal('stop_requested'),",
    "replacement": "status: z.string(),",
    "title": "rejects cancelled and succeeded receipts",
    "assertion": "expect(receiptValid({ ...receipt, status })).toBe(false);",
    "failure": "true to be false"
  },
  {
    "id": "timestamp-iso",
    "anchor": "requestedAt: z.iso.datetime(),",
    "replacement": "requestedAt: z.string(),",
    "title": "rejects missing or invalid request timestamps",
    "assertion": "expect(receiptValid({ ...receipt, requestedAt })).toBe(false);",
    "failure": "true to be false"
  },
  {
    "id": "timestamp-required",
    "anchor": "requestedAt: z.iso.datetime(),",
    "replacement": "requestedAt: z.iso.datetime().optional(),",
    "title": "rejects missing or invalid request timestamps",
    "assertion": "expect(receiptValid({ jobId: receipt.jobId, requestId: receipt.requestId, status: receipt.status })).toBe(false);",
    "failure": "true to be false"
  },
  {
    "id": "status-required",
    "anchor": "status: z.literal('stop_requested'),",
    "replacement": "status: z.literal('stop_requested').optional(),",
    "title": "rejects missing receipt status",
    "assertion": "expect(receiptValid({ jobId: receipt.jobId, requestId: receipt.requestId, requestedAt: receipt.requestedAt })).toBe(false);",
    "failure": "true to be false"
  },
  {
    "id": "scope-required",
    "anchor": "scope: CapabilityAgentScopeSchema,",
    "replacement": "scope: CapabilityAgentScopeSchema.optional(),",
    "title": "rejects missing or incomplete scope",
    "assertion": "expect(requestValid({ requestId: request.requestId, reason: request.reason })).toBe(false);",
    "failure": "true to be false"
  },
  {
    "id": "scope-strict",
    "anchor": "scope: CapabilityAgentScopeSchema,",
    "replacement": "scope: CapabilityAgentScopeSchema.strip(),",
    "title": "rejects extra scope identity fields",
    "assertion": "expect(requestValid({ ...request, scope: { ...scope, userId: 'user-1' } })).toBe(false);",
    "failure": "true to be false"
  },
  {
    "id": "request-id-required",
    "anchor": "scope: CapabilityAgentScopeSchema,\n  requestId: DevProductionJobSchema.shape.requestId,",
    "replacement": "scope: CapabilityAgentScopeSchema,\n  requestId: DevProductionJobSchema.shape.requestId.optional(),",
    "title": "rejects missing request id in requests",
    "assertion": "expect(requestValid({ scope, reason: request.reason })).toBe(false);",
    "failure": "true to be false"
  },
  {
    "id": "receipt-request-id-required",
    "anchor": "jobId: DevProductionJobSchema.shape.jobId,\n  requestId: DevProductionJobSchema.shape.requestId,",
    "replacement": "jobId: DevProductionJobSchema.shape.jobId,\n  requestId: DevProductionJobSchema.shape.requestId.optional(),",
    "title": "rejects missing receipt identities",
    "assertion": "expect(receiptValid({ jobId: receipt.jobId, status: receipt.status, requestedAt: receipt.requestedAt })).toBe(false);",
    "failure": "true to be false"
  },
  {
    "id": "request-id-format",
    "anchor": "scope: CapabilityAgentScopeSchema,\n  requestId: DevProductionJobSchema.shape.requestId,",
    "replacement": "scope: CapabilityAgentScopeSchema,\n  requestId: z.string(),",
    "title": "rejects invalid request ids",
    "assertion": "expect(requestValid({ ...request, requestId })).toBe(false);",
    "failure": "true to be false"
  },
  {
    "id": "receipt-request-id-format",
    "anchor": "jobId: DevProductionJobSchema.shape.jobId,\n  requestId: DevProductionJobSchema.shape.requestId,",
    "replacement": "jobId: DevProductionJobSchema.shape.jobId,\n  requestId: z.string(),",
    "title": "rejects invalid request ids",
    "assertion": "expect(receiptValid({ ...receipt, requestId })).toBe(false);",
    "failure": "true to be false"
  },
  {
    "id": "scope-identity",
    "anchor": "scope: CapabilityAgentScopeSchema,",
    "replacement": "scope: CapabilityAgentScopeSchema.clone(),",
    "title": "reuses canonical scope and identity schemas",
    "assertion": "expect(requestSchema.shape.scope === CapabilityAgentScopeSchema).toBe(true);",
    "failure": "false to be true"
  },
  {
    "id": "request-id-identity",
    "anchor": "scope: CapabilityAgentScopeSchema,\n  requestId: DevProductionJobSchema.shape.requestId,",
    "replacement": "scope: CapabilityAgentScopeSchema,\n  requestId: DevProductionJobSchema.shape.requestId.clone(),",
    "title": "reuses canonical scope and identity schemas",
    "assertion": "expect(requestSchema.shape.requestId === DevProductionJobSchema.shape.requestId).toBe(true);",
    "failure": "false to be true"
  },
  {
    "id": "receipt-request-id-identity",
    "anchor": "jobId: DevProductionJobSchema.shape.jobId,\n  requestId: DevProductionJobSchema.shape.requestId,",
    "replacement": "jobId: DevProductionJobSchema.shape.jobId,\n  requestId: DevProductionJobSchema.shape.requestId.clone(),",
    "title": "reuses canonical scope and identity schemas",
    "assertion": "expect(receiptSchema.shape.requestId === DevProductionJobSchema.shape.requestId).toBe(true);",
    "failure": "false to be true"
  },
  {
    "id": "receipt-job-identity",
    "anchor": "jobId: DevProductionJobSchema.shape.jobId,\n  requestId: DevProductionJobSchema.shape.requestId,",
    "replacement": "jobId: DevProductionJobSchema.shape.jobId.clone(),\n  requestId: DevProductionJobSchema.shape.requestId,",
    "title": "reuses canonical scope and identity schemas",
    "assertion": "expect(receiptSchema.shape.jobId === DevProductionJobSchema.shape.jobId).toBe(true);",
    "failure": "false to be true"
  },
  {
    "id": "param-agent-identity",
    "anchor": "agentId: CapabilityAgentParamsSchema.shape.agentId,",
    "replacement": "agentId: CapabilityAgentParamsSchema.shape.agentId.clone(),",
    "title": "reuses canonical scope and identity schemas",
    "assertion": "expect(contract.paramsSchema.shape.agentId === CapabilityAgentParamsSchema.shape.agentId).toBe(true);",
    "failure": "false to be true"
  },
  {
    "id": "param-job-identity",
    "anchor": "    jobId: DevProductionJobSchema.shape.jobId,",
    "replacement": "    jobId: DevProductionJobSchema.shape.jobId.clone(),",
    "title": "reuses canonical scope and identity schemas",
    "assertion": "expect(contract.paramsSchema.shape.jobId === DevProductionJobSchema.shape.jobId).toBe(true);",
    "failure": "false to be true"
  }
];

const hash = value => createHash('sha256').update(value).digest('hex');
const directory = realpathSync(mkdtempSync(join(tmpdir(), 'internal-dev-cancel-mutation-')));
const workspace = join(directory, 'bridge');
const summaryPath = join(directory, 'summary.json');
const liveFiles = [sourcePath, 'src/http/endpoints/index.ts', testPath, 'tests/http/endpoints/internal-dev-cancel.mutation.mjs'];
const before = Object.fromEntries(liveFiles.map(path => [path, hash(readFileSync(join(root, path)))]));
const summary = { mutants: { intercepted: 0, total: scenarios.length }, phases: { valid: 0, total: scenarios.length + 2 }, before, after: {}, scenarios: [], completed: false };
const save = () => writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n');
function uniqueIndex(text, anchor) {
  const index = text.indexOf(anchor);
  assert.ok(index >= 0 && text.indexOf(anchor, index + anchor.length) === -1, `Nonunique anchor: ${anchor}`);
  return index;
}
function mutate(text, item) {
  const index = uniqueIndex(text, item.anchor);
  return text.slice(0, index) + item.replacement + text.slice(index + item.anchor.length);
}
function assertionPosition(text, item) {
  // Assertions can repeat in different cases; locate inside the named active case.
  const start = uniqueIndex(text, `it('${item.title}',`);
  const end = text.indexOf("\n  it('", start + 1);
  const body = text.slice(start, end === -1 ? text.length : end);
  const index = start + uniqueIndex(body, item.assertion);
  const matcher = index + item.assertion.indexOf('.toBe') + 1;
  return { line: text.slice(0, matcher).split('\n').length, column: matcher - text.lastIndexOf('\n', matcher) };
}
function copyPublic() {
  const copied = new Set();
  function copy(path, dependencies = true) {
    assert.ok(!path.startsWith('/') && !path.split('/').includes('..'));
    assert.ok(/^(?:src\/.*\.ts|tests\/.*\.ts|package\.json|tsconfig[^/]*\.json|vitest[^/]*\.config\.ts)$/.test(path));
    assert.ok(!path.split('/').some(part => /^(?:\.env.*|secrets?|dist|coverage|vendor|node_modules)$/i.test(part)));
    if (copied.has(path)) return;
    copied.add(path);
    let current = root;
    for (const part of path.split('/')) {
      current = join(current, part);
      assert.ok(!lstatSync(current).isSymbolicLink(), 'Public dependencies must not traverse symlinks');
    }
    assert.ok(lstatSync(current).isFile());
    mkdirSync(dirname(join(workspace, path)), { recursive: true });
    copyFileSync(current, join(workspace, path));
    if (!dependencies || !path.endsWith('.ts')) return;
    const source = readFileSync(current, 'utf8');
    for (const match of source.matchAll(/\b(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)) {
      const target = relative(root, resolve(dirname(current), match[1].replace(/\.js$/, '.ts')));
      copy(target);
    }
  }
  // Walk only public dependencies, explicitly including the new untracked source/test.
  for (const path of ['package.json', 'tsconfig.json', 'vitest.config.ts', 'tests/setup.ts', testPath, sourcePath]) copy(path);
  symlinkSync(join(root, 'node_modules'), join(workspace, 'node_modules'), 'dir');
}
function validateReport(report, child, expected, red) {
  assert.equal(child.error, undefined); assert.equal(child.signal, null);
  assert.equal(child.status, red ? 1 : 0);
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
  for (const title of ['accepts distinct requests for two owners and agents', 'accepts a stop request receipt without a terminal result']) {
    assert.equal(suite.assertionResults.filter(test => test.title === title).length, 1, 'Nominal case must remain collectable');
  }
  const active = suite.assertionResults.filter(test => ['passed', 'failed'].includes(test.status));
  assert.equal(active.length, 1);
  const test = active[0];
  assert.equal(test.title, expected.title); assert.equal(test.fullName, expected.fullName);
  assert.deepEqual(test.ancestorTitles, [suiteTitle]);
  assert.equal(test.status, red ? 'failed' : 'passed');
  if (!red) { assert.deepEqual(test.failureMessages, []); return; }
  assert.equal(test.failureMessages.length, 1);
  const [message, ...stack] = test.failureMessages[0].split('\n');
  assert.equal(message, `AssertionError: expected ${expected.failure} // Object.is equality`);
  const frame = stack.filter(line => line.trim().startsWith('at ')).find(line => !line.includes('/node_modules/') && !line.includes('node:internal/') && line.trim() !== 'at new Promise (<anonymous>)');
  assert.equal(frame, `    at ${expected.file}:${expected.line}:${expected.column}`);
}
function validateWholeReport(report, child, expectedTests) {
  assert.equal(child.error, undefined); assert.equal(child.signal, null); assert.equal(child.status, 0);
  assert.equal(report.success, true);
  assert.equal(report.numFailedTests, 0);
  assert.equal(report.numPassedTests, expectedTests);
  assert.equal(report.numRuntimeErrorTestSuites ?? 0, 0);
  assert.deepEqual(report.unhandledErrors ?? [], []);
  assert.equal(report.testResults.length, 1);
  const suite = report.testResults[0];
  assert.equal(suite.name, realpathSync(join(workspace, testPath)));
  assert.equal(suite.status, 'passed');
  assert.equal(suite.assertionResults.length, expectedTests);
  assert.ok(suite.assertionResults.every(test => test.status === 'passed' && test.failureMessages.length === 0));
}
const vitestBin = join(workspace, 'node_modules', '.bin', 'vitest');
function whole(name) {
  const report = join(directory, `whole-${name}.json`);
  const expectedTests = (readFileSync(join(workspace, testPath), 'utf8').match(/^\s*it\('/gm) ?? []).length;
  const args = ['run', testPath, '--maxWorkers=1', '--no-cache', '--configLoader=runner', '--reporter=json', `--outputFile=${report}`];
  const child = spawnSync(vitestBin, args, { cwd: workspace, encoding: 'utf8', timeout: 60000, env: { ...process.env, NO_COLOR: '1' } });
  writeFileSync(join(directory, `whole-${name}.log`), `${child.stdout ?? ''}\n${child.stderr ?? ''}\n${child.error?.message ?? ''}`);
  validateWholeReport(JSON.parse(readFileSync(report, 'utf8')), child, expectedTests);
  summary.scenarios.push({ id: `whole-${name}`, phases: [{ name, valid: true }] }); summary.phases.valid++; save();
}
try {
  mkdirSync(workspace);
  copyPublic();
  const file = join(workspace, sourcePath);
  const original = readFileSync(file, 'utf8');
  const tests = readFileSync(join(workspace, testPath), 'utf8');
  for (const item of scenarios) { mutate(original, item); assertionPosition(tests, item); }
  whole('baseline');
  for (const item of scenarios) {
    const expected = { ...item, ...assertionPosition(tests, item), file: realpathSync(join(workspace, testPath)), fullName: `${suiteTitle} ${item.title}` };
    const entry = { id: item.id, phases: [] }; summary.scenarios.push(entry);
    function phase(name, red) {
      const report = join(directory, `${item.id}-${name}.json`);
      const args = ['run', testPath, '-t', `^${expected.fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, '--maxWorkers=1', '--no-cache', '--configLoader=runner', '--reporter=json', `--outputFile=${report}`];
      const sourceHash = hash(readFileSync(file));
      const child = spawnSync(vitestBin, args, { cwd: workspace, encoding: 'utf8', timeout: 60000, env: { ...process.env, NO_COLOR: '1' } });
      writeFileSync(join(directory, `${item.id}-${name}.log`), `${child.stdout ?? ''}\n${child.stderr ?? ''}\n${child.error?.message ?? ''}`);
      assert.equal(hash(readFileSync(file)), sourceHash);
      validateReport(JSON.parse(readFileSync(report, 'utf8')), child, expected, red);
      entry.phases.push({ name, sourceHash, report, valid: true }); summary.phases.valid++; save();
    }
    try { writeFileSync(file, mutate(original, item)); phase('mutant', true); summary.mutants.intercepted++; }
    finally { writeFileSync(file, original); assert.equal(hash(readFileSync(file)), hash(original)); }
  }
  whole('restored');
  assert.equal(summary.mutants.intercepted, scenarios.length);
  assert.equal(summary.phases.valid, scenarios.length + 2);
  summary.completed = true;
} catch (error) {
  summary.error = { name: error.name, message: error.message }; process.exitCode = 1;
} finally {
  summary.after = Object.fromEntries(liveFiles.map(path => [path, hash(readFileSync(join(root, path)))]));
  if (JSON.stringify(summary.before) !== JSON.stringify(summary.after)) { summary.completed = false; process.exitCode = 1; }
  save();
  console.log(`mutants ${summary.mutants.intercepted}/${summary.mutants.total}; phases ${summary.phases.valid}/${summary.phases.total}`);
  console.log(`live source hashes before/after: ${JSON.stringify({ before: summary.before, after: summary.after })}`);
  console.log(`summary: ${summaryPath}`);
  if (summary.error) console.error(`${summary.error.name}: ${summary.error.message}`);
}
