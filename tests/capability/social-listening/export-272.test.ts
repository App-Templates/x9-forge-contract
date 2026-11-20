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
assert.deepEqual([...sl.SOCIAL_ROUND_ENDED_STATES], ['done', 'failed', 'cap_reached']);
assert.equal(sl.socialRoundEnded('done'), true);
assert.equal(
  sl.socialRoundFreshness({ roundDay: '2026-11-19', nowIso: '2026-11-19T10:00:00Z', timezone: 'Europe/Rome', roundTime: '07:00' }).state,
  'today',
);
console.log('OK');
`;

describe('s3932 round end and freshness in package 1.272.0', () => {
  it('s3932 (a) package.json has a version in the 1.272.0-1.279.0 band', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.27[2-9]\.0$/);
  });

  it('s3932 (b) the symbols work from ESM', () => {
    const script = CHECK.replace('SL', `(await import('@x9-forge/contracts/capability/social-listening'))`);
    expect(node(script)).toBe('OK');
  });

  it('s3932 (b) the symbols work from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${CHECK.replace('SL', `require('@x9-forge/contracts/capability/social-listening')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s3932 (c) the narrow imports map carries the package version', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    expect(map.versione).toBe(pkg.version);
  });

  it('s3932 (d) the CHANGELOG has v1.272.0 once above v1.271.0, naming 3930 and 3931', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const t = '## v1.272.0';
    const first = text.indexOf(t);
    expect(first).toBeGreaterThan(-1);
    expect(text.indexOf(t, first + 1)).toBe(-1);
    const prev = text.indexOf('## v1.271.0');
    expect(prev).toBeGreaterThan(first);
    const block = text.slice(first, prev);
    expect(block).toContain('3930');
    expect(block).toContain('3931');
  });
});
