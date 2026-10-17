import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const sourcePath = 'src/capability/dev/production-config-match.ts';
const testPath = 'tests/capability/dev/production-config-match.test.ts';
const suiteTitle = 'isDevProductionJobForConfig';
const scenarios = [
  {
    "id": "tenantId",
    "title": "rejects tenantId with individually valid inputs",
    "anchor": "if (job.scope.tenantId !== config.tenantId) return false;",
    "replacement": ""
  },
  {
    "id": "ownerId",
    "title": "rejects ownerId with individually valid inputs",
    "anchor": "if (job.scope.ownerId !== config.ownerId) return false;",
    "replacement": ""
  },
  {
    "id": "agentId",
    "title": "rejects agentId with individually valid inputs",
    "anchor": "if (job.scope.agentId !== config.agentId) return false;",
    "replacement": ""
  },
  {
    "id": "projectId",
    "title": "rejects projectId with individually valid inputs",
    "anchor": "if (!config.production.allowedProjectIds.includes(job.projectId)) return false;",
    "replacement": ""
  },
  {
    "id": "configVersion",
    "title": "rejects configVersion with individually valid inputs",
    "anchor": "if (config.configVersion !== job.configVersion) return false;",
    "replacement": ""
  },
  {
    "id": "keyVersion",
    "title": "rejects keyVersion with individually valid inputs",
    "anchor": "if (config.keyVersion !== job.keyVersion) return false;",
    "replacement": ""
  },
  {
    "id": "appliedConfigVersion",
    "title": "rejects appliedConfigVersion with individually valid inputs",
    "anchor": "if (state.appliedConfigVersion !== config.configVersion) return false;",
    "replacement": ""
  },
  {
    "id": "sessionId",
    "title": "rejects sessionId with individually valid inputs",
    "anchor": "if (session.sessionId !== job.session.sessionId) return false;",
    "replacement": ""
  },
  {
    "id": "local-target-kind",
    "title": "rejects local target kind with individually valid inputs",
    "anchor": "if (session.target.kind !== job.session.target.kind) return false;",
    "replacement": ""
  },
  {
    "id": "cloud-target-kind",
    "title": "rejects cloud target kind with individually valid inputs",
    "anchor": "if (session.target.kind !== job.session.target.kind) return false;",
    "replacement": ""
  },
  {
    "id": "deviceId",
    "title": "rejects deviceId with individually valid inputs",
    "anchor": "if (session.target.kind === 'local' && job.session.target.kind === 'local'\n    && session.target.deviceId !== job.session.target.deviceId) return false;",
    "replacement": ""
  },
  {
    "id": "connectionRef",
    "title": "rejects connectionRef with individually valid inputs",
    "anchor": "if (session.target.kind === 'cloud' && job.session.target.kind === 'cloud'\n    && session.target.connectionRef !== job.session.target.connectionRef) return false;",
    "replacement": ""
  },
  {
    "id": "engine-subset",
    "title": "rejects engine subset with individually valid inputs",
    "anchor": "if (session.engines.length !== job.session.engines.length\n    || !session.engines.every(engine => job.session.engines.includes(engine))) return false;",
    "replacement": ""
  },
  {
    "id": "engine-superset",
    "title": "rejects engine superset with individually valid inputs",
    "anchor": "if (session.engines.length !== job.session.engines.length\n    || !session.engines.every(engine => job.session.engines.includes(engine))) return false;",
    "replacement": ""
  },
  {
    "id": "different-engine",
    "title": "rejects different engine with individually valid inputs",
    "anchor": "if (session.engines.length !== job.session.engines.length\n    || !session.engines.every(engine => job.session.engines.includes(engine))) return false;",
    "replacement": ""
  },
  {
    "id": "disabled-config",
    "title": "rejects disabled config with individually valid inputs",
    "anchor": "if (!config.enabled) return false;",
    "replacement": ""
  },
  {
    "id": "missing-production",
    "title": "rejects missing production with individually valid inputs",
    "anchor": "if (!config.production) return false;",
    "replacement": "if (!config.production) return true;"
  },
  {
    "id": "ready-state",
    "title": "rejects ready state with individually valid inputs",
    "anchor": "if (state.status !== 'applied') return false;",
    "replacement": "if (state.status !== 'applied' && state.status !== 'ready') return false;"
  },
  {
    "id": "pending-state",
    "title": "rejects pending state with individually valid inputs",
    "anchor": "if (state.status !== 'applied') return false;",
    "replacement": "if (state.status !== 'applied' && state.status !== 'pending') return false;"
  },
  {
    "id": "offline-state",
    "title": "rejects offline state with individually valid inputs",
    "anchor": "if (state.status !== 'applied') return false;",
    "replacement": "if (state.status !== 'applied' && state.status !== 'offline') return false;"
  },
  {
    "id": "revoked-state",
    "title": "rejects revoked state with individually valid inputs",
    "anchor": "if (state.status !== 'applied') return false;",
    "replacement": "if (state.status !== 'applied' && state.status !== 'revoked') return false;"
  },
  {
    "id": "job-schema",
    "title": "rejects an invalid job despite matching configuration",
    "anchor": "const parsedJob = DevProductionJobSchema.safeParse(rawJob);",
    "replacement": "const parsedJob = { success: true, data: rawJob };"
  },
  {
    "id": "config-schema",
    "title": "rejects an invalid config despite matching job",
    "anchor": "const parsedConfig = DevAgentConfigStateSchema.safeParse(rawConfigState);",
    "replacement": "const parsedConfig = { success: true, data: rawConfigState };"
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
  const assertion = 'expect(isDevProductionJobForConfig(job, configState)).toBe(false);';
  const index = test.indexOf(assertion, start);
  assert.ok(index > start && index < end);
  const matcher = index + assertion.indexOf('.toBe') + 1;
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
  assert.equal(message, 'AssertionError: expected true to be false // Object.is equality');
  const application = stack.filter(line => line.trim().startsWith('at ')).find(frame =>
    !frame.includes('/node_modules/') && !frame.includes('node:internal/') && frame.trim() !== 'at new Promise (<anonymous>)');
  assert.equal(application, `    at ${expected.file}:${expected.line}:${expected.column}`);
}

const directory = realpathSync(mkdtempSync(join(tmpdir(), 'production-config-match-mutation-')));
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
const livePaths = [sourcePath, testPath, 'tests/capability/dev/index.test.ts', 'tests/capability/dev/production-config-match.mutation.mjs', 'src/capability/dev/index.ts', 'src/capability/dev/production-job.ts', 'src/capability/dev/config-state.ts'];
const liveHashes = () => Object.fromEntries(livePaths.map(path => [path, hash(readFileSync(join(root, path)))]));
const summary = { mutants: { intercepted: 0, total: scenarios.length }, phases: { valid: 0, total: scenarios.length * 3 }, liveBefore: liveHashes(), scenarios: [] };
const save = () => writeFileSync(join(directory, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
try {
  for (const path of [sourcePath, testPath, 'src/capability/dev/index.ts', 'tests/setup.ts', 'vitest.config.ts', 'tsconfig.json', 'package.json']) copyPublic(path);
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
      const args = ['exec', 'vitest', 'run', testPath, '-t', `^${escaped}$`, '--maxWorkers=1', '--no-cache', '--configLoader=runner', '--reporter=json', `--outputFile=${report}`];
      const before = hash(readFileSync(source));
      const phaseRecord = { name, sourceHash: before, valid: false };
      record.phases.push(phaseRecord);
      save();
      assert.ok(process.env.QRUN, 'QRUN is required for verification');
      const child = spawnSync(process.env.QRUN, ['pnpm', ...args], {
        cwd: workspace, encoding: 'utf8',
        env: { ...process.env, NO_COLOR: '1', QRUN_LOG: join(directory, `${scenario.id}-${name}.qrun.log`) },
      });
      writeFileSync(join(directory, `${scenario.id}-${name}.log`), `${child.stdout ?? ''}\n${child.stderr ?? ''}\n${child.error?.message ?? ''}`);
      assert.equal(hash(readFileSync(source)), before);
      validateReport(JSON.parse(readFileSync(report, 'utf8')), child, expected, red);
      phaseRecord.valid = true;
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
  console.log(`mutants ${summary.mutants.intercepted}/${summary.mutants.total}; phases ${summary.phases.valid}/${summary.phases.total}`);
  console.log(`live source hashes before/after: ${JSON.stringify({ before: summary.liveBefore, after: summary.liveAfter })}`);
  console.log(`summary: ${join(directory, 'summary.json')}`);
  if (summary.error) console.error(summary.error);
}
