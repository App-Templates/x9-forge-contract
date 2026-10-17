import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const sourcePath = 'src/capability/dev/production-result.ts';
const testPath = 'tests/capability/dev/production-delivery.test.ts';
const suiteTitle = 'bridge226';
const textTitle = 'rejects empty or overlong delivery text';
const roundtripTitle = 'roundtrips delivery through finished response';
const referenceTitle = 'rejects missing or duplicate primary artifact';
const booleanFailure = 'AssertionError: expected';
const scenario = (id, anchor, replacement, title, assertion) => ({ id, anchor, replacement, title, assertion, failurePrefix: booleanFailure });
const deliveryShape = `    delivery: z.strictObject({
      summary: z.string().trim().min(1).max(1000),
      instructions: z.string().min(1).max(8000)
        .refine((text) => /\\S/u.test(text), { message: 'Instructions must contain non-whitespace text' }),
      primaryArtifactRef: DevProductionArtifactSchema.shape.artifactRef,
    }).optional(),`;
const referenceCondition = 'result.artifacts.filter((artifact) => artifact.artifactRef === result.delivery?.primaryArtifactRef).length !== 1';
const scenarios = [
  scenario('preserve-delivery', deliveryShape, '    delivery: z.unknown().optional().transform(() => undefined),', roundtripTitle, 'expect(retainsDelivery).toBe(true);'),
  scenario('summary-min', 'summary: z.string().trim().min(1).max(1000)', 'summary: z.string().trim().min(0).max(1000)', textTitle, 'expect(emptySummary).toBe(false);'),
  scenario('summary-max', 'summary: z.string().trim().min(1).max(1000)', 'summary: z.string().trim().min(1).max(1001)', textTitle, 'expect(longSummary).toBe(false);'),
  scenario('summary-trim', 'summary: z.string().trim().min(1).max(1000)', 'summary: z.string().min(1).max(1000)', roundtripTitle, 'expect(trimsSummary).toBe(true);'),
  // The whitespace refinement also rejects empty input; tighten min to exercise the valid one-character boundary independently.
  scenario('instructions-min', 'instructions: z.string().min(1).max(8000)', 'instructions: z.string().min(2).max(8000)', textTitle, 'expect(shortInstructions).toBe(true);'),
  scenario('instructions-max', 'instructions: z.string().min(1).max(8000)', 'instructions: z.string().min(1).max(8001)', textTitle, 'expect(longInstructions).toBe(false);'),
  scenario('instructions-nonblank', '/\\S/u.test(text)', 'true', textTitle, 'expect(blankInstructions).toBe(false);'),
  scenario('instructions-preserved', 'instructions: z.string().min(1).max(8000)', 'instructions: z.string().trim().min(1).max(8000)', 'preserves multiline instructions exactly', 'expect(preservesInstructions).toBe(true);'),
  scenario('instructions-newlines', 'instructions: z.string().min(1).max(8000)', "instructions: z.string().min(1).max(8000).transform((text) => text.replaceAll('\\n', ' '))", 'preserves multiline instructions exactly', 'expect(preservesInstructions).toBe(true);'),
  scenario('reference-missing', referenceCondition, referenceCondition.replace('!== 1', '> 1'), referenceTitle, 'expect(missingPrimary).toBe(false);'),
  scenario('reference-duplicate', referenceCondition, referenceCondition.replace('!== 1', '=== 0'), referenceTitle, 'expect(duplicatePrimary).toBe(false);'),
  scenario('delivery-strict', 'delivery: z.strictObject({', 'delivery: z.object({', roundtripTitle, 'expect(rejectsExtra).toBe(false);'),
  scenario('delivery-optional', deliveryShape, deliveryShape.replace('}).optional(),', '}),'), 'accepts legacy success without delivery', 'expect(legacy.success).toBe(true);'),
  scenario('delivery-no-default', deliveryShape, deliveryShape.replace('}).optional(),', "}).optional().default({ summary: 'Open', instructions: 'Open', primaryArtifactRef: 'artifact-main' }),"), 'accepts legacy success without delivery', 'expect(hasDelivery).toBe(false);'),
  scenario('reference-reuse', 'primaryArtifactRef: DevProductionArtifactSchema.shape.artifactRef,', 'primaryArtifactRef: z.string().min(1),', roundtripTitle, 'expect(schema.options[0].shape.delivery.unwrap().shape.primaryArtifactRef).toBe(DevProductionArtifactSchema.shape.artifactRef);'),
  ...[
    ['summary', 'summary: z.string().trim().min(1).max(1000)', 'summary: z.string().trim().min(1).max(1000).optional()'],
    ['instructions', ".refine((text) => /\\S/u.test(text), { message: 'Instructions must contain non-whitespace text' }),", ".refine((text) => /\\S/u.test(text), { message: 'Instructions must contain non-whitespace text' }).optional(),"],
    ['reference', 'primaryArtifactRef: DevProductionArtifactSchema.shape.artifactRef,', 'primaryArtifactRef: DevProductionArtifactSchema.shape.artifactRef.optional(),'],
  ].map(([id, anchor, replacement]) => scenario(`required-${id}`, anchor, replacement, roundtripTitle, id === 'reference'
    ? 'expect(schema.options[0].shape.delivery.unwrap().shape.primaryArtifactRef).toBe(DevProductionArtifactSchema.shape.artifactRef);'
    : 'expect(accepts({ [key]: undefined })).toBe(false);')),
  scenario('success-only', "    reason: z.string().min(1).max(1000),", "    reason: z.string().min(1).max(1000),\n    delivery: z.unknown().optional(),", 'rejects delivery on unsuccessful results', 'expect(schema.safeParse({ ...terminal, delivery }).success).toBe(false);'),
];
const hash = value => createHash('sha256').update(value).digest('hex');
const directory = realpathSync(mkdtempSync(join(tmpdir(), 'dev-production-delivery-mutation-')));
const workspace = join(directory, 'bridge');
const summaryPath = join(directory, 'summary.json');
const liveFiles = [sourcePath, testPath, 'tests/capability/dev/production-delivery.mutation.mjs'];
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
  // Each scenario identifies one unique assertion in the behavioral suite.
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
