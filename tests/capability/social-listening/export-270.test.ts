import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const ENV = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };
const SPEC = '@x9-forge/contracts/http';

function node(script: string): string {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: root,
    env: ENV,
    encoding: 'utf8',
  }).trim();
}

const CHECK = `
import assert from 'node:assert/strict';
const compose = MOD.composeOrdinaryCapabilityAgentConfigPut;
assert.equal(typeof compose, 'function');
const scope = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'agent-a' };
const authority = { scope, capability: 'cap-social-listening', parameters: [{
  key: 'round.runsOn', type: 'enum', label: 'Setting', description: 'Capability setting', status: 'decided',
  reference: 'consumer', appliesWhen: 'next_apply', consumes: true, optional: false, editableBy: ['owner'],
  options: [{ value: 'mac', label: 'Mac' }, { value: 'server', label: 'Server' }], platformDefault: 'mac',
}] };
const result = compose({ state: null, authority, values: {}, requestId: 'export-270' });
assert.equal(result.ok, true);
assert.equal(result.write.expectedVersion, null);
assert.equal(result.write.configuration.version, 1);
console.log('OK');
`;

describe('s3718 the ordinary-v2 composition in package 1.270.0', () => {
  it('s3718 (a) package.json has a version in the 1.270.0-1.288.0 band', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.(27\d|28[0-8])\.0$/);
  });

  it('s3718 (b) the composition works from ESM', () => {
    expect(node(CHECK.replace('MOD', `(await import('${SPEC}'))`))).toBe('OK');
  });

  it('s3718 (b) the composition works from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${CHECK.replace('MOD', `require('${SPEC}')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s3718 (c) the narrow imports map carries the package version', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    expect(map.versione).toBe(pkg.version);
  });

  it('s3718 (d) the CHANGELOG has v1.270.0 once above v1.269.0, naming 3717', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const t = '## v1.270.0';
    const first = text.indexOf(t);
    expect(first).toBeGreaterThan(-1);
    expect(text.indexOf(t, first + 1)).toBe(-1);
    const prev = text.indexOf('## v1.269.0');
    expect(prev).toBeGreaterThan(first);
    expect(text.slice(first, prev)).toContain('3717');
  });
});
