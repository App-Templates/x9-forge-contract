import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, realpathSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// The first import must run in its own process; a primed module cache masks cycles.
const bridgeRoot = fileURLToPath(new URL('../../', import.meta.url));
const options = {};
let reportPath;
for (let index = 2; index < process.argv.length; index++) {
  const argument = process.argv[index];
  if (!argument.startsWith('--') && index === 2) { reportPath = argument; continue; }
  assert.ok(['--consumer', '--install-root', '--expected-sha', '--expected-version', '--expected-bridge', '--report'].includes(argument), `Unknown option: ${argument}`);
  assert.ok(process.argv[index + 1] && !process.argv[index + 1].startsWith('--'), `Missing value: ${argument}`);
  options[argument.slice(2)] = process.argv[++index];
}
reportPath = options.report ?? reportPath;
const consumerMode = Object.keys(options).some(key => key !== 'report');
const readManifest = path => JSON.parse(readFileSync(join(path, 'package.json'), 'utf8'));
const distHashes = path => {
  const hashes = {};
  const walk = directory => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = join(directory, entry.name);
      assert.ok(!entry.isSymbolicLink(), 'Distribution must not contain symlinks');
      if (entry.isDirectory()) walk(file);
      else hashes[relative(join(path, 'dist'), file)] = createHash('sha256').update(readFileSync(file)).digest('hex');
    }
  };
  walk(join(path, 'dist'));
  return hashes;
};
let root = bridgeRoot;
let packageRoot = bridgeRoot;
let manifest = readManifest(bridgeRoot);
let provenance;
if (consumerMode) {
  for (const key of ['consumer', 'install-root', 'expected-sha', 'expected-version', 'expected-bridge']) assert.ok(options[key], `Required consumer option: ${key}`);
  assert.match(options['expected-sha'], /^[a-f0-9]{40}$/, 'Expected SHA must be immutable');
  root = realpathSync(resolve(options.consumer));
  const installRoot = realpathSync(resolve(options['install-root']));
  assert.ok(root === installRoot || root.startsWith(installRoot + sep), 'Consumer must belong to installation root');
  const expectedBridge = realpathSync(resolve(options['expected-bridge']));
  const entry = realpathSync(createRequire(join(root, 'package.json')).resolve('@x9-forge/contracts'));
  const installedRoot = dirname(dirname(entry));
  assert.ok(installedRoot !== expectedBridge && !installedRoot.startsWith(expectedBridge + sep), 'Installed package must be outside author bridge');
  assert.ok(installedRoot.startsWith(installRoot + sep + 'node_modules' + sep + '.pnpm' + sep), 'Installed package must be in native consumer virtual store');
  const dependency = `git+https://github.com/App-Templates/x9-forge-contract.git#${options['expected-sha']}`;
  assert.equal(readManifest(installRoot).pnpm?.overrides?.['@x9-forge/contracts'], dependency, 'Consumer override must pin expected Git SHA');
  const lock = readFileSync(join(installRoot, 'pnpm-lock.yaml'), 'utf8');
  const importerKey = relative(installRoot, root).split(sep).join('/') || '.';
  const importerHeader = `  ${importerKey}:`;
  const importerLines = lock.split('\n');
  const importerStart = importerLines.indexOf(importerHeader);
  assert.ok(importerStart >= 0, 'Native lock must include consumer importer');
  let importerEnd = importerStart + 1;
  while (importerEnd < importerLines.length && !/^(?:  \S|\S)/.test(importerLines[importerEnd])) importerEnd++;
  const importer = importerLines.slice(importerStart + 1, importerEnd).join('\n');
  const bridgeDependency = importer.match(/      ['"]?@x9-forge\/contracts['"]?:\n        specifier: ([^\n]+)\n        version: ([^\n]+)/);
  assert.ok(bridgeDependency, 'Native consumer importer must declare bridge dependency');
  const remote = `https://codeload.github.com/App-Templates/x9-forge-contract/tar.gz/${options['expected-sha']}`;
  assert.equal(bridgeDependency[1], dependency, 'Native consumer specifier must pin expected SHA');
  assert.ok(bridgeDependency[2].startsWith(remote + '(') || bridgeDependency[2] === remote, 'Native consumer resolution must use expected remote SHA');
  assert.equal(readFileSync(join(installRoot, 'node_modules/.pnpm/lock.yaml'), 'utf8'), lock, 'Installed virtual-store lock must match frozen consumer lock');
  packageRoot = installedRoot;
  manifest = readManifest(installedRoot);
  assert.equal(manifest.version, options['expected-version'], 'Installed version must match release');
  assert.equal(manifest.name, '@x9-forge/contracts', 'Installed package identity must match');
  const expected = readManifest(expectedBridge);
  assert.deepEqual(manifest.exports, expected.exports, 'Installed public export map must match release');
  const hashes = distHashes(installedRoot);
  assert.deepEqual(hashes, distHashes(expectedBridge), 'Every installed distribution file must match candidate');
  provenance = { consumer: root, installRoot, installedRoot, sha: options['expected-sha'], version: manifest.version, distFiles: Object.keys(hashes).length, hashes };
}
const MAX_PARALLEL = 8;
const TIMEOUT_MS = 15000;
const listJsFiles = directory => {
  const files = [];
  const walk = current => {
    for (const entry of readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = join(current, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.isFile() && entry.name.endsWith('.js')) files.push(relative(directory, file).split(sep).join('/').slice(0, -3));
    }
  };
  walk(directory);
  return files;
};
// Exact keys keep the full check; a `/*` key is a pattern, so every concrete module it exposes is checked on its own.
const tasks = [];
let narrowSubpaths = 0;
for (const [subpath, target] of Object.entries(manifest.exports)) {
  if (!subpath.includes('*')) {
    tasks.push({ subpath, specifier: manifest.name + (subpath === '.' ? '' : subpath.slice(1)), narrow: false });
    continue;
  }
  assert.ok(subpath.indexOf('*') === subpath.length - 1, `Unsupported export pattern: ${subpath}`);
  const importTarget = typeof target === 'string' ? target : target.import;
  assert.ok(typeof importTarget === 'string' && importTarget.endsWith('/*.js'), `Pattern must have an import target ending in /*.js: ${subpath}`);
  const directory = resolve(packageRoot, importTarget.slice(0, -'*.js'.length));
  const prefix = subpath.slice(1, -1);
  const modules = listJsFiles(directory);
  assert.ok(modules.length > 0, `Pattern ${subpath} must expose at least one module`);
  for (const module of modules) {
    narrowSubpaths++;
    tasks.push({ subpath: `${subpath.slice(0, -1)}${module}`, specifier: manifest.name + prefix + module, narrow: true });
  }
}
const runCheck = ({ subpath, specifier, narrow }, format) => new Promise(resolveCheck => {
  const expression = format === 'import' ? `await import(${JSON.stringify(specifier)})` : `require(${JSON.stringify(specifier)})`;
  const contextExpression = format === 'import' ? `await import('${manifest.name}/capability')` : `require('${manifest.name}/capability')`;
  const source = narrow
    ? `${expression};`
    : `${format === 'import' ? "import assert from 'node:assert/strict';" : "const assert = require('node:assert/strict');"}
      const first = ${expression};
      assert.ok(Object.keys(first).length > 0, 'Public entrypoint must expose its contract');
      const capability = ${contextExpression};
      const request = { identity: { tenantId: 'synthetic-tenant', ownerId: 'synthetic-owner', agentId: 'synthetic-agent' }, capability: 'ricerca', keys: ['SYNTHETIC_PROVIDER_KEY'] };
      assert.equal(capability.CapabilityCallContextRequestSchema.safeParse(request).success, true, 'Deferred canonical key schema must validate after first import');
      assert.equal(capability.CapabilityCallContextRequestSchema.safeParse({ ...request, keys: ['invalid key'] }).success, false, 'Deferred key restrictions must remain active');`;
  const args = [...(format === 'import' ? ['--input-type=module'] : []), '-e', source];
  const child = spawn(process.execPath, args, { cwd: root, env: process.env, stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  let spawnError;
  let timedOut = false;
  child.stderr.on('data', chunk => { if (stderr.length < 20000) stderr += chunk; });
  child.on('error', error => { spawnError = error; });
  const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, TIMEOUT_MS);
  child.on('close', (status, signal) => {
    clearTimeout(timer);
    let failure = null;
    try {
      assert.equal(status, 0, `${specifier} first ${format} must initialize; ${spawnError?.message ?? (timedOut ? 'timed out' : stderr)}`);
    } catch (error) { failure = { name: error.name, message: error.message }; }
    resolveCheck({ subpath, format, passed: failure === null, status, signal, failure });
  });
});
const jobs = tasks.flatMap(task => ['import', 'require'].map(format => ({ task, format })));
const results = new Array(jobs.length);
let nextJob = 0;
await Promise.all(Array.from({ length: Math.min(MAX_PARALLEL, jobs.length) }, async () => {
  while (nextJob < jobs.length) {
    const index = nextJob++;
    results[index] = await runCheck(jobs[index].task, jobs[index].format);
  }
}));
for (const result of results) console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.format} ${result.subpath}`);
const report = { node: process.version, publicSubpaths: Object.keys(manifest.exports).length, narrowSubpaths, passed: results.filter(value => value.passed).length, total: results.length, results };
if (provenance) report.provenance = provenance;
if (reportPath) writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(`${report.passed}/${report.total} first-entrypoint checks`);
assert.deepEqual(results.filter(value => !value.passed), [], 'Every public entrypoint must initialize independently');
