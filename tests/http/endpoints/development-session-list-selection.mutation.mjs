import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const sourcePath = 'src/http/endpoints/internal-development-session-list.ts';
const testPath = 'tests/http/endpoints/development-session-list-selection.test.ts';
const suiteTitle = 'bridge229';
const scenarios = [
  { id: "omit-tenant", anchor: "sameCapabilityScope(binding.scope, query.data.scope)", replacement: "(binding.scope.ownerId === query.data.scope.ownerId && binding.scope.agentId === query.data.scope.agentId && binding.scope.userId === query.data.scope.userId)", title: "rejects each foreign scope component", assertion: "expect(selectDevelopmentSessionList(homogeneous(foreignTenant), { scope, limit: 5 })).toBeNull();", failurePrefix: 'AssertionError: ' },
  { id: "omit-owner", anchor: "sameCapabilityScope(binding.scope, query.data.scope)", replacement: "(binding.scope.tenantId === query.data.scope.tenantId && binding.scope.agentId === query.data.scope.agentId && binding.scope.userId === query.data.scope.userId)", title: "rejects each foreign scope component", assertion: "expect(selectDevelopmentSessionList(homogeneous(foreignOwner), { scope, limit: 5 })).toBeNull();", failurePrefix: 'AssertionError: ' },
  { id: "omit-agent", anchor: "sameCapabilityScope(binding.scope, query.data.scope)", replacement: "(binding.scope.tenantId === query.data.scope.tenantId && binding.scope.ownerId === query.data.scope.ownerId && binding.scope.userId === query.data.scope.userId)", title: "rejects each foreign scope component", assertion: "expect(selectDevelopmentSessionList(homogeneous(foreignAgent), { scope, limit: 5 })).toBeNull();", failurePrefix: 'AssertionError: ' },
  { id: "omit-limit", anchor: "  if (page.data.items.length > query.data.limit) return null;\n", replacement: "", title: "rejects oversized page and invalid query", assertion: "expect(selectDevelopmentSessionList(three, { scope, limit: 2 })).toBeNull();", failurePrefix: 'AssertionError: ' },
  { id: "filter-offline-revoked", anchor: "  return page.data;\n", replacement: "  return { ...page.data, items: page.data.items.filter(item => item.status === 'connected') };\n", title: "preserves offline and revoked states", assertion: "expect(selected?.items.map(item => item.status)).toEqual(['connected', 'offline', 'revoked']);", failurePrefix: 'AssertionError: ' },
  { id: "error-to-empty", anchor: "if (!query.success || !page.success) return null;", replacement: "if (!query.success || !page.success) return { items: [], nextCursor: null };", title: "distinguishes valid empty page from malformed input", assertion: "expect(selectDevelopmentSessionList(empty, { scope, extra: true })).toBeNull();", failurePrefix: 'AssertionError: ' },
  { id: "bypass-query-parse", anchor: "const query = DevelopmentSessionListQuerySchema.safeParse(expectedQuery);", replacement: "const query = { success: true, data: { limit: 20, ...(expectedQuery as object) } as DevelopmentSessionListQuery };", title: "distinguishes valid empty page from malformed input", assertion: "expect(selectDevelopmentSessionList(empty, { scope, extra: true })).toBeNull();", failurePrefix: 'AssertionError: ' },
  { id: "bypass-page-parse", anchor: "const page = DevelopmentSessionListSchema.safeParse(rawPage);", replacement: "const page = { success: true, data: rawPage as DevelopmentSessionList };", title: "distinguishes valid empty page from malformed input", assertion: "expect(selectDevelopmentSessionList({ items: [], nextCursor: null, extra: 1 }, { scope })).toBeNull();", failurePrefix: 'AssertionError: ' },
  { id: "return-raw", anchor: "  return page.data;\n", replacement: "  return rawPage as DevelopmentSessionList;\n", title: "returns independent page and preserves cursor", assertion: "expect(selected).not.toBe(raw);", failurePrefix: 'AssertionError: ' },
];
const hash = value => createHash('sha256').update(value).digest('hex');
const directory = realpathSync(mkdtempSync(join(tmpdir(), 'development-session-list-selection-mutation-')));
const workspace = join(directory, 'bridge');
const summaryPath = join(directory, 'summary.json');
const liveFiles = [sourcePath, testPath, 'tests/http/endpoints/development-session-list-selection.mutation.mjs'];
const before = Object.fromEntries(liveFiles.map(path => [path, hash(readFileSync(join(root, path)))]));
const summary = { mutants: { intercepted: 0, total: scenarios.length }, phases: { valid: 0, total: scenarios.length * 3 }, before, after: {}, scenarios: [], completed: false, reader: { passed: 0, total: 3 } };
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
  const index = uniqueIndex(text, item.assertion);
  const matcher = index + item.assertion.indexOf('.to') + 1;
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
  assert.ok(message.startsWith(expected.failurePrefix), `Unexpected assertion: ${message}`);
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
      const args = [join(root, 'node_modules/vitest/vitest.mjs'), 'run', testPath, '-t', `^${expected.fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, '--maxWorkers=1', '--no-cache', '--configLoader=runner', '--reporter=json', `--outputFile=${report}`];
      const sourceHash = hash(readFileSync(file));
      const child = spawnSync(process.execPath, args, { cwd: workspace, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
      writeFileSync(join(directory, `${item.id}-${name}.log`), `${child.stdout ?? ''}\n${child.stderr ?? ''}\n${child.error?.message ?? ''}`);
      assert.equal(hash(readFileSync(file)), sourceHash);
      const actualReport = JSON.parse(readFileSync(report, 'utf8'));
      validateReport(actualReport, child, expected, red);
      if (summary.reader.passed === 0) {
        for (const damage of [
          report => { report.testResults[0].assertionResults.forEach(test => { test.status = 'skipped'; }); },
          report => { report.testResults[0].assertionResults.forEach(test => { test.title = 'different'; }); },
          report => { report.numRuntimeErrorTestSuites = 1; },
        ]) {
          const damaged = structuredClone(actualReport);
          damage(damaged);
          assert.throws(() => validateReport(damaged, child, expected, red));
          summary.reader.passed++;
        }
      }
      entry.phases.push({ name, sourceHash, report, valid: true }); summary.phases.valid++; save();
    }
    phase('baseline', false);
    try { writeFileSync(file, mutate(original, item)); phase('mutant', true); summary.mutants.intercepted++; }
    finally { writeFileSync(file, original); assert.equal(hash(readFileSync(file)), hash(original)); phase('restored', false); }
  }
  assert.equal(summary.mutants.intercepted, scenarios.length);
  assert.equal(summary.phases.valid, scenarios.length * 3);
  assert.equal(summary.reader.passed, summary.reader.total);
  summary.completed = true;
} catch (error) {
  summary.error = { name: error.name, message: error.message }; process.exitCode = 1;
} finally {
  summary.after = Object.fromEntries(liveFiles.map(path => [path, hash(readFileSync(join(root, path)))]));
  if (JSON.stringify(summary.before) !== JSON.stringify(summary.after)) { summary.completed = false; process.exitCode = 1; }
  save();
  console.log(`mutants ${summary.mutants.intercepted}/${summary.mutants.total}; phases ${summary.phases.valid}/${summary.phases.total}; reader ${summary.reader.passed}/${summary.reader.total}`);
  console.log(`live source hashes before/after: ${JSON.stringify({ before: summary.before, after: summary.after })}`);
  console.log(`summary: ${summaryPath}`);
  if (summary.error) console.error(`${summary.error.name}: ${summary.error.message}`);
}
