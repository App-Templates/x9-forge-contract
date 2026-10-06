import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const result = spawnSync(process.execPath, [fileURLToPath(new URL('./smoke.cjs', import.meta.url))], { encoding: 'utf8' });
assert.equal(result.status, 0, result.stderr);
assert.ok(result.stdout.includes('BRIDGE-130 CJS public subpaths: 6/6 assertions passed'),
  'The standard CJS smoke must execute all canonical runtime assertions before exiting');
console.log('BRIDGE-130 standard CJS wiring: 2/2 assertions passed');
