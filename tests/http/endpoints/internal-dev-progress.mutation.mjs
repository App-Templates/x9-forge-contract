import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const sourcePath = 'src/http/endpoints/internal-dev-progress.ts';
const testPath = 'tests/http/endpoints/internal-dev-progress.test.ts';
const suiteTitle = 'internal dev progress';
const scenarios = [];
function scenario(id, anchor, replacement, title, assertion, failure = 'true to be false') {
  scenarios.push({ id, anchor, replacement, title, assertion, failure });
}
const metadataTitle = 'exports exact metadata and domain schema without a body';
for (const [id, anchor, replacement, assertion] of [
  ['method', "method: 'GET' as const", "method: 'POST' as const", "expect(contract.method === 'GET').toBe(true);"],
  ['path', "path: '/internal/capability/agents/:agentId/dev/jobs/:jobId/progress' as const", "path: '/internal/capability/agents/:agentId/dev/jobs/:jobId/other' as const", "expect(contract.path === '/internal/capability/agents/:agentId/dev/jobs/:jobId/progress').toBe(true);"],
  ['auth', "authType: 'secret' as const", "authType: 'none' as const", "expect(contract.authType === 'secret').toBe(true);"],
  ['response-identity', 'responseSchema: DevProductionProgressSchema,', 'responseSchema: z.unknown(),', 'expect(contract.responseSchema === DevProductionProgressSchema).toBe(true);'],
]) scenario(id, anchor, replacement, metadataTitle, assertion, 'false to be true');
scenario('no-body', 'responseSchema: DevProductionProgressSchema,', 'responseSchema: DevProductionProgressSchema, bodySchema: z.unknown(),', metadataTitle, "expect('bodySchema' in contract).toBe(false);");
for (const [id, anchor, replacement, assertion] of [
  ['agent-reuse', 'agentId: CapabilityAgentParamsSchema.shape.agentId,', 'agentId: CapabilityAgentParamsSchema.shape.agentId.clone(),', 'expect(contract.paramsSchema.shape.agentId === CapabilityAgentParamsSchema.shape.agentId).toBe(true);'],
  ['job-reuse', 'jobId: DevProductionJobSchema.shape.jobId,', 'jobId: DevProductionJobSchema.shape.jobId.clone(),', 'expect(contract.paramsSchema.shape.jobId === DevProductionJobSchema.shape.jobId).toBe(true);'],
  ['scope-reuse', 'scope: CapabilityAgentScopeSchema }', 'scope: CapabilityAgentScopeSchema.clone() }', 'expect(contract.querySchema.shape.scope === CapabilityAgentScopeSchema).toBe(true);'],
]) scenario(id, anchor, replacement, 'reuses public parameter and scope schema objects', assertion, 'false to be true');
scenario('params-strict', '  }).strict(),', '  }),', 'rejects extra parameters', 'expect(contract.paramsSchema.safeParse({ ...params, extra: true }).success).toBe(false);');
scenario('query-strict', 'querySchema: z.object({ scope: CapabilityAgentScopeSchema }).strict()', 'querySchema: z.object({ scope: CapabilityAgentScopeSchema })', 'rejects extra query fields', 'expect(contract.querySchema.safeParse({ scope, extra: true }).success).toBe(false);');
for (const [id, anchor, replacement] of [
  ['agent-empty', 'agentId: CapabilityAgentParamsSchema.shape.agentId,', 'agentId: z.string(),'],
  ['job-empty', 'jobId: DevProductionJobSchema.shape.jobId,', 'jobId: z.string(),'],
]) scenario(id, anchor, replacement, 'rejects missing and empty parameters', 'expect(contract.paramsSchema.safeParse(value).success).toBe(false);');
scenario('scope-required', 'scope: CapabilityAgentScopeSchema }', 'scope: z.unknown().optional() }', 'rejects missing empty and incomplete scope', 'expect(contract.querySchema.safeParse(value).success).toBe(false);');
scenario('scope-strict', 'scope: CapabilityAgentScopeSchema }', 'scope: CapabilityAgentScopeSchema.strip() }', 'rejects extra scope fields', 'expect(contract.querySchema.safeParse({ scope: { ...scope, extra: true } }).success).toBe(false);');
scenario('valid-params', 'agentId: CapabilityAgentParamsSchema.shape.agentId,', 'agentId: z.never(),', 'accepts valid parameters and scope', 'expect(contract.paramsSchema.safeParse(params).success).toBe(true);', 'false to be true');
scenario('valid-scope', 'scope: CapabilityAgentScopeSchema }', 'scope: z.never() }', 'accepts valid parameters and scope', 'expect(contract.querySchema.safeParse({ scope }).success).toBe(true);', 'false to be true');
scenario('running-blocked', 'responseSchema: DevProductionProgressSchema,', 'responseSchema: z.never(),', 'accepts running and blocked snapshots with real counters', 'expect(valid(raw)).toBe(true);', 'false to be true');
for (const [id, title, assertion] of [
  ['counters', 'rejects invalid task counters', 'expect(valid({ ...progress, tasks })).toBe(false);'],
  ['final-result', 'rejects succeeded results with artifacts', "expect(valid({ ...progress, phase: 'succeeded', artifacts: [{ name: 'result.zip' }] })).toBe(false);"],
  ['unbound-queued', 'rejects queued responses without scope and identity', "expect(valid({ phase: 'queued', message: 'Waiting', tasks: { completed: 0, total: 1 } })).toBe(false);"],
]) scenario(id, 'responseSchema: DevProductionProgressSchema,', 'responseSchema: z.unknown(),', title, assertion);

const hash = value => createHash('sha256').update(value).digest('hex');
const directory = realpathSync(mkdtempSync(join(tmpdir(), 'internal-dev-progress-mutation-')));
const workspace = join(directory, 'bridge');
const summaryPath = join(directory, 'summary.json');
const liveFiles = [sourcePath, 'src/http/endpoints/index.ts', testPath, 'tests/http/endpoints/internal-dev-progress.mutation.mjs'];
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
