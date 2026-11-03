import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, cpSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const sourcePath = 'src/http/endpoints/internal-development-session-list.ts';
const testPath = 'tests/http/endpoints/internal-development-session-list.test.ts';
const suiteTitle = 'development session list';
const scenarios = [
  {
    "id": "1",
    "title": "exports GET metadata",
    "anchor": "method: 'GET' as const",
    "replacement": "method: 'POST' as const"
  },
  {
    "id": "2",
    "title": "exports path metadata",
    "anchor": "path: '/internal/connect/development-sessions' as const",
    "replacement": "path: '/internal/connect/development-session' as const"
  },
  {
    "id": "3",
    "title": "exports secret metadata",
    "anchor": "authType: 'secret' as const",
    "replacement": "authType: 'token' as const"
  },
  {
    "id": "4",
    "title": "has no body schema",
    "anchor": "querySchema: DevelopmentSessionListQuerySchema,",
    "replacement": "bodySchema: DevelopmentSessionListQuerySchema,\n  querySchema: DevelopmentSessionListQuerySchema,"
  },
  {
    "id": "5",
    "title": "has no params schema",
    "anchor": "responseSchema: DevelopmentSessionListSchema,",
    "replacement": "paramsSchema: DevelopmentSessionListQuerySchema,\n  responseSchema: DevelopmentSessionListSchema,"
  },
  {
    "id": "6",
    "title": "defaults limit to twenty",
    "anchor": ".default(20)",
    "replacement": ".default(19)"
  },
  {
    "id": "7",
    "title": "rejects empty cursor",
    "anchor": "cursor: z.string().trim().min(1).max(512).optional(),",
    "replacement": "cursor: z.string().trim().max(512).optional(),"
  },
  {
    "id": "8",
    "title": "rejects blank cursor",
    "anchor": "cursor: z.string().trim().min(1).max(512).optional(),",
    "replacement": "cursor: z.string().min(1).max(512).optional(),"
  },
  {
    "id": "9",
    "title": "rejects oversized cursor",
    "anchor": "cursor: z.string().trim().min(1).max(512).optional(),",
    "replacement": "cursor: z.string().trim().min(1).optional(),"
  },
  {
    "id": "10",
    "title": "trims cursor",
    "anchor": "cursor: z.string().trim().min(1).max(512).optional(),",
    "replacement": "cursor: z.string().min(1).max(512).optional(),"
  },
  {
    "id": "11",
    "title": "rejects empty nextCursor",
    "anchor": "nextCursor: z.string().trim().min(1).max(512).nullable(),",
    "replacement": "nextCursor: z.string().trim().max(512).nullable(),"
  },
  {
    "id": "12",
    "title": "rejects blank nextCursor",
    "anchor": "nextCursor: z.string().trim().min(1).max(512).nullable(),",
    "replacement": "nextCursor: z.string().min(1).max(512).nullable(),"
  },
  {
    "id": "13",
    "title": "rejects oversized nextCursor",
    "anchor": "nextCursor: z.string().trim().min(1).max(512).nullable(),",
    "replacement": "nextCursor: z.string().trim().min(1).nullable(),"
  },
  {
    "id": "14",
    "title": "trims nextCursor",
    "anchor": "nextCursor: z.string().trim().min(1).max(512).nullable(),",
    "replacement": "nextCursor: z.string().min(1).max(512).nullable(),"
  },
  {
    "id": "15",
    "title": "requires nullable next cursor",
    "anchor": "nextCursor: z.string().trim().min(1).max(512).nullable(),",
    "replacement": "nextCursor: z.string().trim().min(1).max(512).optional(),"
  },
  {
    "id": "16",
    "title": "rejects zero limit",
    "anchor": "limit: z.number().int().min(1).max(50).default(20),",
    "replacement": "limit: z.number().int().max(50).default(20),"
  },
  {
    "id": "17",
    "title": "rejects fractional limit",
    "anchor": "limit: z.number().int().min(1).max(50).default(20),",
    "replacement": "limit: z.number().min(1).max(50).default(20),"
  },
  {
    "id": "18",
    "title": "rejects oversized limit",
    "anchor": "limit: z.number().int().min(1).max(50).default(20),",
    "replacement": "limit: z.number().int().min(1).default(20),"
  },
  {
    "id": "19",
    "title": "rejects query extras",
    "anchor": "}).strict();\n\nexport const DevelopmentSessionListSchema",
    "replacement": "});\n\nexport const DevelopmentSessionListSchema"
  },
  {
    "id": "20",
    "title": "rejects response extras",
    "anchor": "}).strict()\n  .refine",
    "replacement": "})\n  .refine"
  },
  {
    "id": "21",
    "title": "rejects oversized page",
    "anchor": "items: z.array(DevelopmentSessionLeaseSchema).max(50),",
    "replacement": "items: z.array(DevelopmentSessionLeaseSchema),"
  },
  {
    "id": "22",
    "title": "rejects duplicate session IDs",
    "anchor": "new Set(items.map(({ binding }) => binding.sessionId)).size === items.length",
    "replacement": "true"
  },
  {
    "id": "23",
    "title": "rejects mixed tenantId",
    "anchor": "binding.scope.tenantId === first.binding.scope.tenantId",
    "replacement": "true"
  },
  {
    "id": "24",
    "title": "rejects mixed ownerId",
    "anchor": "binding.scope.ownerId === first.binding.scope.ownerId",
    "replacement": "true"
  },
  {
    "id": "25",
    "title": "rejects mixed agentId",
    "anchor": "binding.scope.agentId === first.binding.scope.agentId",
    "replacement": "true"
  },
  {
    "id": "26",
    "title": "reuses the exact lease item schema",
    "anchor": "items: z.array(DevelopmentSessionLeaseSchema).max(50),",
    "replacement": "items: z.array(z.lazy(() => DevelopmentSessionLeaseSchema)).max(50),"
  },
  {
    "id": "27",
    "title": "reuses the exact scope schema",
    "anchor": "scope: CapabilityAgentScopeSchema,",
    "replacement": "scope: z.lazy(() => CapabilityAgentScopeSchema),"
  },
  {
    "id": "28",
    "title": "reuses public response and query schemas",
    "anchor": "responseSchema: DevelopmentSessionListSchema,",
    "replacement": "responseSchema: DevelopmentSessionListQuerySchema,"
  },
  {
    "id": "29",
    "title": "accepts empty pages with or without a cursor",
    "anchor": "if (!first) return true;",
    "replacement": "if (!first) return false;"
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


let readerChecks = 0;
function checkReader() {
  const expected = { title: scenarios[0].title, file: 'contract.test.ts', line: 1, column: 1 };
  const child = { status: 0, signal: null };
  const assertion = { title: expected.title, fullName: `${suiteTitle} ${expected.title}`, ancestorTitles: [suiteTitle], status: 'passed', failureMessages: [] };
  const good = { success: true, numPassedTests: 1, numFailedTests: 0, numRuntimeErrorTestSuites: 0, unhandledErrors: [], testResults: [{ name: expected.file, status: 'passed', message: '', assertionResults: [assertion] }] };
  validateReport(good, child, expected, false);
  for (const corrupt of [
    report => { report.testResults[0].assertionResults = []; },
    report => { report.testResults[0].assertionResults[0].fullName = 'different title'; },
    report => { report.numRuntimeErrorTestSuites = 1; },
  ]) {
    const bad = structuredClone(good); corrupt(bad);
    assert.throws(() => validateReport(bad, child, expected, false));
    readerChecks++;
  }
}

const directory = realpathSync(mkdtempSync(join(tmpdir(), 'development-session-list-mutation-')));
const workspace = join(directory, 'bridge');
mkdirSync(workspace);
const copied = new Set();
// Explicit entry points include the new, uncommitted test; only their public
// relative dependencies and the actual Vitest bootstrap/config are copied.
function copyPublic(path) {
  assert.ok(/^(?:src\/.*\.ts|tests\/.*\.ts|package\.json|tsconfig\.json|vitest\.config\.ts)$/.test(path));
  assert.ok(!path.split('/').some(part => /^(?:\.\.|\.env.*|secrets?|dist|coverage|vendor|node_modules)$/i.test(part)
    || /(?:migration|fixture|dump|seed|lock)/i.test(part)));
  // Only public TypeScript contracts are followed, including credential schemas
  // required by the HTTP barrel; no credential values or private key files are copied.
  assert.ok(!/\.(?:pem|key|p12|pfx|crt|cer|der)$/i.test(path));
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
const livePaths = [sourcePath, testPath, 'src/http/endpoints/index.ts', 'tests/http/endpoints/internal-development-session-list.mutation.mjs'];
const liveHashes = () => Object.fromEntries(livePaths.map(path => [path, hash(readFileSync(join(root, path)))]));
const summary = { mutants: { intercepted: 0, total: scenarios.length }, phases: { valid: 0, total: scenarios.length * 3 }, liveBefore: liveHashes(), scenarios: [] };
const save = () => writeFileSync(join(directory, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
try {
  checkReader();
  for (const path of [sourcePath, testPath, 'tests/setup.ts', 'vitest.config.ts', 'tsconfig.json', 'package.json']) copyPublic(path);
  const originalSource = readFileSync(join(workspace, sourcePath), 'utf8');
  const testText = readFileSync(join(workspace, testPath), 'utf8');
  for (const scenario of scenarios) { mutate(originalSource, scenario); assertionPosition(testText, scenario.title); }
  // One private copy per scenario lets scenarios run concurrently while the
  // three phases of each scenario stay strictly sequential.
  const run = (cwd, args) => new Promise(done => {
    const child = spawn(join(root, 'node_modules/.bin/vitest'), args, { cwd, env: { ...process.env, NO_COLOR: '1' } });
    let output = '';
    const result = { status: null, signal: null, error: undefined };
    child.stdout.on('data', chunk => { output += chunk; });
    child.stderr.on('data', chunk => { output += chunk; });
    child.on('error', error => { result.error = error; });
    child.on('close', (status, signal) => { done({ ...result, status, signal, output }); });
  });
  async function runScenario(scenario) {
    const local = join(directory, `scenario-${scenario.id}`);
    cpSync(workspace, local, { recursive: true });
    symlinkSync(join(root, 'node_modules'), join(local, 'node_modules'), 'dir');
    const source = join(local, sourcePath);
    const original = readFileSync(source, 'utf8');
    const expected = { ...assertionPosition(testText, scenario.title), title: scenario.title, file: realpathSync(join(local, testPath)) };
    const record = { id: scenario.id, phases: [] };
    summary.scenarios.push(record);
    async function phase(name, red) {
      const report = join(directory, `${scenario.id}-${name}.json`);
      const fullName = `${suiteTitle} ${scenario.title}`;
      const escaped = fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const args = ['run', testPath, '-t', `^${escaped}$`, '--maxWorkers=1', '--no-cache', '--configLoader=runner', '--reporter=json', `--outputFile=${report}`];
      const before = hash(readFileSync(source));
      const child = await run(local, args);
      writeFileSync(join(directory, `${scenario.id}-${name}.log`), `${child.output}\n${child.error?.message ?? ''}`);
      assert.equal(hash(readFileSync(source)), before);
      validateReport(JSON.parse(readFileSync(report, 'utf8')), child, expected, red);
      record.phases.push({ name, sourceHash: before, valid: true });
      summary.phases.valid++;
      save();
    }
    await phase('baseline', false);
    try {
      writeFileSync(source, mutate(original, scenario));
      await phase('mutant', true);
      summary.mutants.intercepted++;
    } finally {
      writeFileSync(source, original);
      assert.equal(hash(readFileSync(source)), hash(original));
    }
    await phase('restored', false);
  }
  const queue = [...scenarios];
  const failures = [];
  await Promise.all(Array.from({ length: 6 }, async () => {
    for (let scenario = queue.shift(); scenario; scenario = queue.shift()) {
      try { await runScenario(scenario); } catch (error) { failures.push(error); queue.length = 0; }
    }
  }));
  if (failures.length) throw failures[0];
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
  console.log(`reader checks ${readerChecks}/3`);
  console.log(`mutants ${summary.mutants.intercepted}/${summary.mutants.total}; phases ${summary.phases.valid}/${summary.phases.total}`);
  console.log(`live source hashes before/after: ${JSON.stringify({ before: summary.liveBefore, after: summary.liveAfter })}`);
  console.log(`summary: ${join(directory, 'summary.json')}`);
  if (summary.error) console.error(summary.error);
}
