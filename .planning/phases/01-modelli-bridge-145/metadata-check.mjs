import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const manifest = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'));
assert.equal(manifest.version, '1.45.0', 'Release must identify version 1.45.0');
console.log('1/1 release metadata assertion');
