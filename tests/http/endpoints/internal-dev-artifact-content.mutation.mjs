import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const sourcePath = 'src/http/endpoints/internal-dev-artifact-content.ts';
const testPath = 'tests/http/endpoints/internal-dev-artifact-content.test.ts';
const suiteTitle = 'internal dev artifact content';
const scenarios = [
  {
    "id": "1",
    "title": "exports POST method",
    "anchor": "method: 'POST'",
    "replacement": "method: 'GET'",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "2",
    "title": "exports exact path",
    "anchor": "path: '/internal/capability/agents/:agentId/dev/jobs/:jobId/artifacts/read'",
    "replacement": "path: '/internal/capability/agents/:agentId/dev/jobs/:jobId/artifacts/wrong'",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "3",
    "title": "requires secret authentication",
    "anchor": "authType: 'secret'",
    "replacement": "authType: 'token'",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "4",
    "title": "reuses response schema",
    "anchor": "responseSchema: DevProductionArtifactChunkSchema,",
    "replacement": "responseSchema: DevProductionArtifactChunkSchema.clone(),",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "5",
    "title": "reuses body schema",
    "anchor": "bodySchema: DevProductionArtifactReadSchema,",
    "replacement": "bodySchema: DevProductionArtifactReadSchema.clone(),",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "6",
    "title": "reuses agent schema",
    "anchor": "agentId: CapabilityAgentParamsSchema.shape.agentId,",
    "replacement": "agentId: CapabilityAgentParamsSchema.shape.agentId.clone(),",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "7",
    "title": "reuses job schema",
    "anchor": "jobId: DevProductionJobSchema.shape.jobId,",
    "replacement": "jobId: DevProductionJobSchema.shape.jobId.clone(),",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "8",
    "title": "reuses scope schema",
    "anchor": "scope: CapabilityAgentScopeSchema,",
    "replacement": "scope: CapabilityAgentScopeSchema.clone(),",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "9",
    "title": "reuses request schema",
    "anchor": "requestId: DevProductionJobSchema.shape.requestId,",
    "replacement": "requestId: DevProductionJobSchema.shape.requestId.clone(),",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "10",
    "title": "reuses artifact reference schema",
    "anchor": "artifactRef: DevProductionArtifactSchema.shape.artifactRef,",
    "replacement": "artifactRef: DevProductionArtifactSchema.shape.artifactRef.clone(),",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "11",
    "title": "reuses offset schema",
    "anchor": "offset: DevProductionArtifactChunkSchema.shape.offset,",
    "replacement": "offset: DevProductionArtifactChunkSchema.shape.offset.clone(),",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "12",
    "title": "rejects extra params",
    "anchor": "paramsSchema: z.strictObject({",
    "replacement": "paramsSchema: z.object({",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "13",
    "title": "rejects missing agent",
    "anchor": "agentId: CapabilityAgentParamsSchema.shape.agentId,",
    "replacement": "agentId: CapabilityAgentParamsSchema.shape.agentId.optional(),",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "14",
    "title": "rejects missing job",
    "anchor": "jobId: DevProductionJobSchema.shape.jobId,",
    "replacement": "jobId: DevProductionJobSchema.shape.jobId.optional(),",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "15",
    "title": "rejects extra body",
    "anchor": "DevProductionArtifactReadSchema = z.strictObject({",
    "replacement": "DevProductionArtifactReadSchema = z.object({",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "16",
    "title": "rejects missing requestId",
    "anchor": "requestId: DevProductionJobSchema.shape.requestId,",
    "replacement": "requestId: DevProductionJobSchema.shape.requestId.optional(),",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "17",
    "title": "rejects zero length",
    "anchor": "length: z.number().int().min(1).max(262144),",
    "replacement": "length: z.number().int().min(0).max(262144),",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "18",
    "title": "rejects fractional length",
    "anchor": "length: z.number().int().min(1).max(262144),",
    "replacement": "length: z.number().min(1).max(262144),",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "19",
    "title": "rejects excessive length",
    "anchor": "length: z.number().int().min(1).max(262144),",
    "replacement": "length: z.number().int().min(1),",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "20",
    "title": "accepts maximum length",
    "anchor": "length: z.number().int().min(1).max(262144),",
    "replacement": "length: z.number().int().min(1).max(262143),",
    "path": "src/http/endpoints/internal-dev-artifact-content.ts"
  },
  {
    "id": "21",
    "title": "exports through HTTP barrel",
    "anchor": "export * from './internal-dev-artifact-content.js';",
    "replacement": "// Artifact read export removed.",
    "path": "src/http/endpoints/index.ts"
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

const directory = realpathSync(mkdtempSync(join(tmpdir(), 'internal-dev-artifact-content-mutation-')));
const workspace = join(directory, 'bridge');
mkdirSync(workspace);
const copied = new Set();
// Explicit entry points include the new, uncommitted test; only their public
// relative dependencies and the actual Vitest bootstrap/config are copied.
function copyPublic(path, dependencies = true) {
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
  if (!dependencies || !path.endsWith('.ts')) return;
  const text = readFileSync(current, 'utf8');
  // Only static declarations are dependencies; assertion strings may contain
  // export text whose relative path belongs to the barrel, not to this file.
  for (const match of text.matchAll(/^[\t ]*(?:import|export)\s+(?:[^;'"`]*?\bfrom\s*)?['"](\.[^'"]+)['"]/gm)) {
    // Type-only declarations are erased and need no runtime dependency copy.
    if (/^[\t ]*(?:import|export)\s+type\b/.test(match[0])) continue;
    const dependency = relative(root, resolve(dirname(current), match[1])).replace(/\.js$/, '.ts');
    copyPublic(dependency);
  }
}
const livePaths = [sourcePath, testPath, 'src/http/endpoints/index.ts', 'tests/http/endpoints/internal-dev-artifact-content.mutation.mjs'];
const liveHashes = () => Object.fromEntries(livePaths.map(path => [path, hash(readFileSync(join(root, path)))]));
const summary = { mutants: { intercepted: 0, total: scenarios.length }, phases: { valid: 0, total: scenarios.length * 3 }, liveBefore: liveHashes(), scenarios: [], reader: { passed: 0, total: 4 } };
const save = () => writeFileSync(join(directory, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
try {
  for (const path of [sourcePath, testPath, 'tests/setup.ts', 'vitest.config.ts', 'tsconfig.json', 'package.json']) copyPublic(path);
  copyPublic('src/http/endpoints/index.ts', false);
  copyPublic('src/http/index.ts', false);
  for (const path of copied) if (!livePaths.includes(path)) livePaths.push(path);
  summary.liveBefore = liveHashes();
  symlinkSync(join(root, 'node_modules'), join(workspace, 'node_modules'), 'dir');
  const originals = new Map([sourcePath, 'src/http/endpoints/index.ts'].map(path => [path, readFileSync(join(workspace, path), 'utf8')]));
  const testText = readFileSync(join(workspace, testPath), 'utf8');
  for (const scenario of scenarios) { mutate(originals.get(scenario.path), scenario); assertionPosition(testText, scenario.title); }
  for (const scenario of scenarios) {
    const source = join(workspace, scenario.path);
    const original = originals.get(scenario.path);
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
        summary.reader.passed++;
        for (const corrupt of [
          report => { for (const test of report.testResults[0].assertionResults) test.status = 'skipped'; },
          report => { const test = report.testResults[0].assertionResults.find(test => test.status === 'passed'); test.fullName += ' foreign'; },
          report => { report.numRuntimeErrorTestSuites = 1; },
        ]) {
          const invalid = structuredClone(actual);
          corrupt(invalid);
          assert.throws(() => validateReport(invalid, child, expected, false));
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
  console.log(`reader checks ${summary.reader.passed}/${summary.reader.total}`);
  console.log(`mutants ${summary.mutants.intercepted}/${summary.mutants.total}; phases ${summary.phases.valid}/${summary.phases.total}`);
  console.log(`live source hashes before/after: ${JSON.stringify({ before: summary.liveBefore, after: summary.liveAfter })}`);
  console.log(`summary: ${join(directory, 'summary.json')}`);
  if (summary.error) console.error(summary.error);
}
