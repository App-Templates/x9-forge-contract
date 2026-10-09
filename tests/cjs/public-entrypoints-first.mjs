import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The first import must run in its own process; a primed module cache masks cycles.
const root = fileURLToPath(new URL('../../', import.meta.url));
const manifest = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const results = [];
for (const subpath of Object.keys(manifest.exports)) {
  const specifier = manifest.name + (subpath === '.' ? '' : subpath.slice(1));
  for (const format of ['import', 'require']) {
    const expression = format === 'import' ? `await import(${JSON.stringify(specifier)})` : `require(${JSON.stringify(specifier)})`;
    const contextExpression = format === 'import' ? `await import('${manifest.name}/capability')` : `require('${manifest.name}/capability')`;
    const source = `${format === 'import' ? "import assert from 'node:assert/strict';" : "const assert = require('node:assert/strict');"}
      const first = ${expression};
      assert.ok(Object.keys(first).length > 0, 'Public entrypoint must expose its contract');
      const capability = ${contextExpression};
      const request = { identity: { tenantId: 'synthetic-tenant', ownerId: 'synthetic-owner', agentId: 'synthetic-agent' }, capability: 'ricerca', keys: ['SYNTHETIC_PROVIDER_KEY'] };
      assert.equal(capability.CapabilityCallContextRequestSchema.safeParse(request).success, true, 'Deferred canonical key schema must validate after first import');
      assert.equal(capability.CapabilityCallContextRequestSchema.safeParse({ ...request, keys: ['invalid key'] }).success, false, 'Deferred key restrictions must remain active');`;
    const args = [...(format === 'import' ? ['--input-type=module'] : []), '-e', source];
    const child = spawnSync(process.execPath, args, { cwd: root, env: process.env, encoding: 'utf8', timeout: 15000 });
    let failure = null;
    try {
      assert.equal(child.status, 0, `${specifier} first ${format} must initialize; ${child.error?.message ?? child.stderr}`);
    } catch (error) { failure = { name: error.name, message: error.message }; }
    const result = { subpath, format, passed: failure === null, status: child.status, signal: child.signal, failure };
    results.push(result);
    console.log(`${result.passed ? 'PASS' : 'FAIL'} ${format} ${subpath}`);
  }
}
const report = { node: process.version, publicSubpaths: Object.keys(manifest.exports).length, passed: results.filter(value => value.passed).length, total: results.length, results };
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(report, null, 2) + '\n');
console.log(`${report.passed}/${report.total} first-entrypoint checks`);
assert.deepEqual(results.filter(value => !value.passed), [], 'Every public entrypoint must initialize independently');
