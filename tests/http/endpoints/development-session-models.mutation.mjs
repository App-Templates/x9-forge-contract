import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const sourcePath = 'src/http/endpoints/development-session-models.ts';
const testPath = 'tests/http/endpoints/development-session-models.test.ts';
const suiteTitle = 'development session models';
const scenarios = [];
function scenario(id, anchor, replacement, title, assertion, failure = 'true to be false') {
  scenarios.push({ id, anchor, replacement, title, assertion, failure });
}
const invalid = 'expect(valid(raw)).toBe(false);';
scenario('model-pairs', 'new Set(models.map(({ engine, modelId }) => JSON.stringify([engine, modelId]))).size === models.length', 'true', 'rejects duplicate model pairs after trimming', invalid);
scenario('effort-unique', 'new Set(efforts).size === efforts.length', 'true', 'rejects duplicate efforts after trimming', invalid);
scenario('engine-subset', 'models.every(({ engine }) => lease.availableEngines.includes(engine))', 'true', 'rejects engines absent from the lease attestation', invalid);
scenario('offline-models', "lease.status === 'connected' || models.length === 0", 'true', 'rejects models on offline and revoked leases but accepts empty lists', invalid);
scenario('lease-filter', 'isDevelopmentSessionUsable(parsed.data.lease, expectedBinding, engine, nowMs)', 'true', 'delegates selection to existing lease usability checks', 'expect(expired.length > 0).toBe(false);');
scenario('detached-models', '.map((model) => ({ ...model, reasoningEfforts: [...model.reasoningEfforts] }))', ".map((model, index) => Reflect.get(Object(raw), 'models')[index])", 'returns detached models and reasoning arrays', 'expect(JSON.stringify(raw) !== JSON.stringify(original)).toBe(false);');
scenario('detached-efforts', '.map((model) => ({ ...model, reasoningEfforts: [...model.reasoningEfforts] }))', ".map((model, index) => ({ ...model, reasoningEfforts: Reflect.get(Object(raw), 'models')[index].reasoningEfforts }))", 'returns detached models and reasoning arrays', 'expect(JSON.stringify(raw) !== JSON.stringify(original)).toBe(false);');
const metadata = "expect(contract.method === 'GET' && contract.path === '/internal/connect/development-sessions/:sessionId/models' && contract.authType === 'secret' && contract.responseSchema === http.DevelopmentSessionModelsSchema).toBe(true);";
for (const [id, anchor, replacement] of [
  ['method', "method: 'GET' as const", "method: 'POST' as const"],
  ['path', "path: '/internal/connect/development-sessions/:sessionId/models' as const", "path: '/internal/connect/development-sessions/:sessionId/other' as const"],
  ['auth', "authType: 'secret' as const", "authType: 'none' as const"],
]) scenario(id, anchor, replacement, 'exports the exact route metadata through public http', metadata, 'false to be true');
scenario('response-strict', 'models: z.array(SessionModelSchema).max(128),\n}).strict()', 'models: z.array(SessionModelSchema).max(128),\n})', 'rejects extra fields and tokens at every response boundary', ']) expect(valid(value)).toBe(false);');
scenario('model-strict', '}).strict();\n\n/** Trusted adapter', '});\n\n/** Trusted adapter', 'rejects extra fields and tokens at every response boundary', ']) expect(valid(value)).toBe(false);');
scenario('params-strict', 'paramsSchema: z.object({ sessionId: z.string().min(1) }).strict()', 'paramsSchema: z.object({ sessionId: z.string().min(1) })', 'accepts strict route params and scope query', "expect(contract.paramsSchema.safeParse({ sessionId: 'session', token: 'untrusted' }).success).toBe(false);");
scenario('query-strict', 'querySchema: z.object({ scope: CapabilityAgentScopeSchema }).strict()', 'querySchema: z.object({ scope: CapabilityAgentScopeSchema })', 'accepts strict route params and scope query', "expect(contract.querySchema.safeParse({ scope, token: 'untrusted' }).success).toBe(false);");
scenario('params-required', 'sessionId: z.string().min(1)', 'sessionId: z.string()', 'accepts strict route params and scope query', "expect(contract.paramsSchema.safeParse({ sessionId: '' }).success).toBe(false);");

const boundsTitle = 'trims names and rejects blank or oversized fields and arrays';
const fieldAssertion = 'expect(valid({ ...raw, models: [{ ...raw.models[0], [field]: value }] })).toBe(false);';
for (const [field, limit] of [['modelId', 200], ['label', 120]]) {
  const anchor = `${field}: z.string().trim().min(1).max(${limit})`;
  scenario(`${field}-min`, anchor, `${field}: z.string().trim().min(0).max(${limit})`, boundsTitle, fieldAssertion);
  scenario(`${field}-max`, anchor, `${field}: z.string().trim().min(1).max(${limit + 1})`, boundsTitle, fieldAssertion);
  scenario(`${field}-trim`, anchor, `${field}: z.string().min(1).max(${limit})`, 'trims all adapter strings', "expect(model.modelId !== 'id' || model.label !== 'label' || model.reasoningEfforts[0] !== 'effort').toBe(false);");
}
scenario('effort-min', 'z.array(z.string().trim().min(1).max(40))', 'z.array(z.string().trim().min(0).max(40))', boundsTitle, "for (const value of [' ', 'x'.repeat(41)]) expect(valid({ ...raw, models: [{ ...raw.models[0], reasoningEfforts: [value] }] })).toBe(false);");
scenario('effort-max', 'z.array(z.string().trim().min(1).max(40))', 'z.array(z.string().trim().min(1).max(41))', boundsTitle, "for (const value of [' ', 'x'.repeat(41)]) expect(valid({ ...raw, models: [{ ...raw.models[0], reasoningEfforts: [value] }] })).toBe(false);");
scenario('effort-trim', 'z.array(z.string().trim().min(1).max(40))', 'z.array(z.string().min(1).max(40))', 'trims all adapter strings', "expect(model.modelId !== 'id' || model.label !== 'label' || model.reasoningEfforts[0] !== 'effort').toBe(false);");
scenario('effort-count', '.max(16)', '.max(17)', boundsTitle, "expect(valid({ ...raw, models: [{ ...raw.models[0], reasoningEfforts: [...efforts, 'overflow'] }] })).toBe(false);");
scenario('model-count', 'models: z.array(SessionModelSchema).max(128)', 'models: z.array(SessionModelSchema).max(129)', boundsTitle, "expect(valid({ ...raw, models: [...models, { ...raw.models[0], modelId: 'overflow' }] })).toBe(false);");
scenario('invalid-response', 'if (!parsed.success) return [];', "if (!parsed.success) return [{ engine: 'claude', modelId: 'invalid', label: 'Invalid', reasoningEfforts: [] }];", 'selects fresh models and rejects invalid responses', 'expect(http.selectableDevelopmentSessionModels(null, raw.lease.binding, now).length > 0).toBe(false);');

const hash = value => createHash('sha256').update(value).digest('hex');
const directory = realpathSync(mkdtempSync(join(tmpdir(), 'development-session-models-mutation-')));
const workspace = join(directory, 'bridge');
const summaryPath = join(directory, 'summary.json');
const liveFiles = [sourcePath, 'src/http/endpoints/index.ts', testPath, 'tests/http/endpoints/development-session-models.mutation.mjs'];
const before = Object.fromEntries(liveFiles.map(path => [path, hash(readFileSync(join(root, path)))]));
const summary = { mutants: { intercepted: 0, total: scenarios.length }, phases: { valid: 0, total: scenarios.length * 3 }, before, after: {}, scenarios: [], completed: false };
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
try {
  mkdirSync(workspace);
  copyPublic();
  const file = join(workspace, sourcePath);
  const original = readFileSync(file, 'utf8');
  const tests = readFileSync(join(workspace, testPath), 'utf8');
  for (const item of scenarios) { mutate(original, item); assertionPosition(tests, item); }
  for (const item of scenarios) {
    const expected = { ...item, ...assertionPosition(tests, item), file: realpathSync(join(workspace, testPath)), fullName: `${suiteTitle} ${item.title}` };
    const entry = { id: item.id, phases: [] }; summary.scenarios.push(entry);
    function phase(name, red) {
      const report = join(directory, `${item.id}-${name}.json`);
      const args = ['-C', workspace, 'exec', 'vitest', 'run', testPath, '-t', `^${expected.fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, '--maxWorkers=1', '--no-cache', '--configLoader=runner', '--reporter=json', `--outputFile=${report}`];
      const sourceHash = hash(readFileSync(file));
      const child = spawnSync('pnpm', args, { cwd: workspace, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
      writeFileSync(join(directory, `${item.id}-${name}.log`), `${child.stdout ?? ''}\n${child.stderr ?? ''}\n${child.error?.message ?? ''}`);
      assert.equal(hash(readFileSync(file)), sourceHash);
      validateReport(JSON.parse(readFileSync(report, 'utf8')), child, expected, red);
      entry.phases.push({ name, sourceHash, report, valid: true }); summary.phases.valid++; save();
    }
    phase('baseline', false);
    try { writeFileSync(file, mutate(original, item)); phase('mutant', true); summary.mutants.intercepted++; }
    finally { writeFileSync(file, original); assert.equal(hash(readFileSync(file)), hash(original)); phase('restored', false); }
  }
  assert.equal(summary.mutants.intercepted, scenarios.length);
  assert.equal(summary.phases.valid, scenarios.length * 3);
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
