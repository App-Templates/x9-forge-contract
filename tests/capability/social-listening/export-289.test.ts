import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const ENV = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };

function node(script: string): string {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: root,
    env: ENV,
    encoding: 'utf8',
  }).trim();
}

const CHECK = `
import assert from 'node:assert/strict';
const sl = SL;
const recap = {
  verticalId: 'ai',
  day: '2026-11-03',
  track: 'server',
  finishedAt: '2026-11-03T14:40:00+00:00',
  counts: { funziona: 0, da_provare: 0, non_funziona: 0, fuffa: 0 },
  postsSeen: 0,
  spentUsd: 0,
  topics: [],
};
const endReason = { code: 'mac_not_arrived', text: 'il Mac non ha preso il lavoro' };
const result = sl.SocialRecapOutputSchema.safeParse({ ...recap, endReason });
assert.equal(result.success, true);
assert.deepEqual(result.data, { ...recap, endReason });
const legacy = sl.SocialRecapOutputSchema.safeParse(recap);
assert.equal(legacy.success, true);
assert.deepEqual(legacy.data, recap);
assert.equal(sl.SocialRecapEndReasonSchema.safeParse(endReason).success, true);
assert.equal(sl.SocialRecapEndReasonSchema.safeParse({ code: 'X', text: 'a' }).success, false);
console.log('OK');
`;

describe('s9861 optional recap endReason in package 1.289.0', () => {
  it('s9861 (a) package.json has version 1.291.0', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.(289|290|291|292|293)\.0$/);
  });

  it('s9861 (b) recap endReason and legacy recaps work from ESM', () => {
    const script = CHECK.replace('SL', `(await import('@x9-forge/contracts/capability/social-listening'))`);
    expect(node(script)).toBe('OK');
  });

  it('s9861 (b) recap endReason and legacy recaps work from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${CHECK.replace('SL', `require('@x9-forge/contracts/capability/social-listening')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s9861 (c) the narrow imports map carries the package version', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    expect(map.versione).toBe(pkg.version);
  });

  it('s9861 (d) the CHANGELOG has v1.289.0 once above v1.288.0, naming 9860', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const title = '## v1.289.0';
    const first = text.indexOf(title);
    expect(first).toBeGreaterThan(text.indexOf('## Non rilasciato'));
    expect(text.indexOf(title, first + 1)).toBe(-1);
    const previous = text.indexOf('## v1.288.0');
    expect(previous).toBeGreaterThan(first);
    expect(text.slice(first, previous)).toContain('9860');
  });
});
