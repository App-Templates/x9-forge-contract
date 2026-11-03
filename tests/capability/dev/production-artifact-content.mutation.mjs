import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const sourcePath = 'src/capability/dev/production-artifact-content.ts';
const testPath = 'tests/capability/dev/production-artifact-content.test.ts';
const suiteTitle = 'dev production artifact content';
const scenarios = [
  {
    "id": "1",
    "title": "reuses artifact schema",
    "anchor": "artifact: DevProductionArtifactSchema,",
    "replacement": "artifact: DevProductionArtifactSchema.clone(),"
  },
  {
    "id": "2",
    "title": "rejects extras",
    "anchor": "DevProductionArtifactChunkSchema = z.strictObject({",
    "replacement": "DevProductionArtifactChunkSchema = z.object({"
  },
  {
    "id": "3",
    "title": "rejects negative offset",
    "anchor": "offset: z.number().int().min(0),",
    "replacement": "offset: z.number().int(),"
  },
  {
    "id": "4",
    "title": "rejects fractional offset",
    "anchor": "offset: z.number().int().min(0),",
    "replacement": "offset: z.number().min(0),"
  },
  {
    "id": "5",
    "title": "rejects invalid alphabet",
    "anchor": ".regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/)",
    "replacement": ""
  },
  {
    "id": "6",
    "title": "rejects invalid padding",
    "anchor": ".regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/)",
    "replacement": ".regex(/^[A-Za-z0-9+/=]*$/)"
  },
  {
    "id": "7",
    "title": "rejects empty content",
    "anchor": "bytes < 1",
    "replacement": "bytes < 0"
  },
  {
    "id": "8",
    "title": "rejects over limit",
    "anchor": "bytes > 262144",
    "replacement": "false"
  },
  {
    "id": "9",
    "title": "accepts exact limit",
    "anchor": "bytes > 262144",
    "replacement": "bytes >= 262144"
  },
  {
    "id": "10",
    "title": "accepts two padding characters",
    "anchor": "endsWith('==') ? 2",
    "replacement": "endsWith('==') ? 0"
  },
  {
    "id": "11",
    "title": "accepts one padding character",
    "anchor": "endsWith('=') ? 1",
    "replacement": "endsWith('=') ? 0"
  },
  {
    "id": "12",
    "title": "accepts no padding",
    "anchor": "? 1 : 0;",
    "replacement": "? 1 : 1;"
  },
  {
    "id": "13",
    "title": "accepts no padding",
    "anchor": "length / 4 * 3 - padding",
    "replacement": "length / 4 * 2 - padding"
  },
  {
    "id": "14",
    "title": "rejects overflow",
    "anchor": "end > chunk.artifact.bytes",
    "replacement": "false"
  },
  {
    "id": "15",
    "title": "accepts last chunk",
    "anchor": "end > chunk.artifact.bytes",
    "replacement": "end >= chunk.artifact.bytes"
  },
  {
    "id": "16",
    "title": "rejects premature eof",
    "anchor": "chunk.eof !== (end === chunk.artifact.bytes)",
    "replacement": "false"
  },
  {
    "id": "17",
    "title": "rejects missing final eof",
    "anchor": "chunk.eof !== (end === chunk.artifact.bytes)",
    "replacement": "chunk.eof && end !== chunk.artifact.bytes"
  },
  {
    "id": "18",
    "title": "accepts last chunk",
    "anchor": "end === chunk.artifact.bytes",
    "replacement": "end < chunk.artifact.bytes"
  },
  {
    "id": "19",
    "title": "rejects nonboolean eof",
    "anchor": "eof: z.boolean(),",
    "replacement": "eof: z.coerce.boolean(),"
  },
  {
    "id": "20",
    "title": "accepts first chunk",
    "anchor": "offset: z.number().int().min(0),",
    "replacement": "offset: z.number().int().min(1),"
  }
];
const hash = value => createHash('sha256').update(value).digest('hex');
function uniqueIndex(text, anchor) {
  const index = text.indexOf(anchor);
  assert.ok(index >= 0 && text.indexOf(anchor, index + anchor.length) === -1, `Non-unique anchor: ${anchor}`);
  return index;
}
function mutate(text, scenario) {
  const index = uniqueIndex(text, scenario.anchor);
  return text.slice(0, index) + scenario.replacement + text.slice(index + scenario.anchor.length);
}
function assertionPosition(test, title) {
  const start = uniqueIndex(test, `it('${title}', () => {`);
  const end = test.indexOf('\n  });', start);
  assert.ok(end > start);
  const matcher = test.lastIndexOf('.toBe(true)', end) + 1;
  assert.ok(matcher > start && matcher < end);
  return { line: test.slice(0, matcher).split('\n').length, column: matcher - test.lastIndexOf('\n', matcher) };
}
function validateReport(report, child, expected, red) {
  assert.equal(child.error, undefined);
  assert.equal(child.signal, null);
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
  assert.equal(active.length, 1, 'Exactly one active test is required');
  const test = active[0];
  assert.equal(test.fullName, `${suiteTitle} ${expected.title}`);
  assert.equal(test.title, expected.title);
  assert.deepEqual(test.ancestorTitles, [suiteTitle]);
  assert.equal(test.status, red ? 'failed' : 'passed');
  if (!red) { assert.deepEqual(test.failureMessages, []); return; }
  assert.equal(test.failureMessages.length, 1);
  const [message, ...stack] = test.failureMessages[0].split('\n');
  assert.equal(message, 'AssertionError: expected false to be true // Object.is equality');
  const application = stack.filter(line => line.trim().startsWith('at ')).find(frame =>
    !frame.includes('/node_modules/') && !frame.includes('node:internal/') && frame.trim() !== 'at new Promise (<anonymous>)');
  assert.equal(application, `    at ${expected.file}:${expected.line}:${expected.column}`);
}

const directory = realpathSync(mkdtempSync(join(tmpdir(), 'production-artifact-content-mutation-')));
const workspace = join(directory, 'bridge');
mkdirSync(workspace);
const copied = new Set();
// Explicit entry points include the new, uncommitted test; only their public
// relative dependencies and the actual Vitest bootstrap/config are copied.
function copyPublic(path) {
  assert.ok(/^(?:src\/.*\.ts|tests\/.*\.ts|package\.json|tsconfig\.json|vitest\.config\.ts)$/.test(path));
  assert.ok(!path.split('/').some(part => /^(?:\.\.|\.env.*|secrets?|dist|coverage|vendor|node_modules)$/i.test(part)
    || /(?:migration|fixture|dump|seed|lock)/i.test(part)));
  // Credential schemas are public contracts required by capability-call-context;
  // private credentials, key files and the agent credential module are excluded.
  assert.ok(path !== 'src/agent/agent-credentials.ts' && !/\.(?:pem|key|p12|pfx|crt|cer|der)$/i.test(path));
  if (copied.has(path)) return;
  let current = root;
  for (const part of path.split('/')) {
    current = join(current, part);
    assert.ok(!lstatSync(current).isSymbolicLink(), 'Public inputs must not traverse symlinks');
  }
  assert.ok(lstatSync(current).isFile());
  copied.add(path);
  const destination = join(workspace, path);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(current, destination);
  if (!path.endsWith('.ts')) return;
  const text = readFileSync(current, 'utf8');
  for (const match of text.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)) {
    const dependency = relative(root, resolve(dirname(current), match[1])).replace(/\.js$/, '.ts');
    copyPublic(dependency);
  }
}
for (const path of [sourcePath, testPath, 'tests/setup.ts', 'vitest.config.ts', 'tsconfig.json', 'package.json']) copyPublic(path);
const livePaths = [...new Set([sourcePath, testPath, 'src/capability/dev/index.ts', 'tests/capability/dev/production-artifact-content.mutation.mjs', ...copied])];
const liveHashes = () => Object.fromEntries(livePaths.map(path => [path, hash(readFileSync(join(root, path)))]));
const summary = { mutants: { intercepted: 0, total: scenarios.length }, phases: { valid: 0, total: scenarios.length * 3 }, liveBefore: liveHashes(), scenarios: [], reader: { passed: 0, total: 3 } };
const save = () => writeFileSync(join(directory, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
try {
  for (const path of [sourcePath, testPath, 'tests/setup.ts', 'vitest.config.ts', 'tsconfig.json', 'package.json']) copyPublic(path);
  symlinkSync(join(root, 'node_modules'), join(workspace, 'node_modules'), 'dir');
  const source = join(workspace, sourcePath);
  const original = readFileSync(source, 'utf8');
  const testText = readFileSync(join(workspace, testPath), 'utf8');
  for (const scenario of scenarios) { mutate(original, scenario); assertionPosition(testText, scenario.title); }
  for (const scenario of scenarios) {
    const expected = { ...assertionPosition(testText, scenario.title), title: scenario.title, file: realpathSync(join(workspace, testPath)) };
    const record = { id: scenario.id, phases: [] };
    summary.scenarios.push(record);
    function phase(name, red) {
      const report = join(directory, `${scenario.id}-${name}.json`);
      const fullName = `${suiteTitle} ${scenario.title}`;
      const escaped = fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const args = [join(root, 'node_modules/vitest/vitest.mjs'), 'run', testPath, '-t', `^${escaped}$`, '--maxWorkers=1', '--no-cache', '--configLoader=runner', '--reporter=json', `--outputFile=${report}`];
      const before = hash(readFileSync(source));
      const child = spawnSync(process.execPath, args, { cwd: workspace, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
      writeFileSync(join(directory, `${scenario.id}-${name}.log`), `${child.stdout ?? ''}\n${child.stderr ?? ''}\n${child.error?.message ?? ''}`);
      assert.equal(hash(readFileSync(source)), before);
      const actual = JSON.parse(readFileSync(report, 'utf8'));
      validateReport(actual, child, expected, red);
      if (summary.reader.passed === 0 && !red) {
        const controls = [
          report => { report.testResults[0].assertionResults.forEach(test => { test.status = 'skipped'; }); },
          report => { const test = report.testResults[0].assertionResults.find(test => test.status === 'passed'); test.title = 'wrong title'; test.fullName = 'wrong title'; },
          report => { report.numRuntimeErrorTestSuites = 1; },
        ];
        for (const corrupt of controls) {
          const hostile = structuredClone(actual);
          corrupt(hostile);
          assert.throws(() => validateReport(hostile, child, expected, false), { name: 'AssertionError' });
          summary.reader.passed++;
        }
      }
      record.phases.push({ name, sourceHash: before, valid: true });
      summary.phases.valid++;
      save();
    }
    phase('baseline', false);
    try {
      writeFileSync(source, mutate(original, scenario));
      phase('mutant', true);
      summary.mutants.intercepted++;
    } finally {
      writeFileSync(source, original);
      assert.equal(hash(readFileSync(source)), hash(original));
      phase('restored', false);
    }
  }
  assert.equal(summary.reader.passed, summary.reader.total);
  assert.equal(summary.mutants.intercepted, summary.mutants.total);
  assert.equal(summary.phases.valid, summary.phases.total);
} catch (error) {
  summary.error = { name: error.name, message: error.message };
  process.exitCode = 1;
} finally {
  summary.liveAfter = liveHashes();
  try { assert.deepEqual(summary.liveAfter, summary.liveBefore); }
  catch (error) { summary.liveError = error.message; process.exitCode = 1; }
  save();
  console.log(`reader controls ${summary.reader.passed}/${summary.reader.total}`);
  console.log(`mutants ${summary.mutants.intercepted}/${summary.mutants.total}; phases ${summary.phases.valid}/${summary.phases.total}`);
  console.log(`live source hashes before/after: ${JSON.stringify({ before: summary.liveBefore, after: summary.liveAfter })}`);
  console.log(`summary: ${join(directory, 'summary.json')}`);
  if (summary.error) console.error(summary.error);
}
