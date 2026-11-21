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
const pageUrl = 'https://forge.example/agents/a/ascolto';
const pageLine = 'Apri la pagina Ascolto: https://forge.example/agents/a/ascolto';
assert.equal(sl.SOCIAL_ASCOLTO_PAGE_LINE_PREFIX, 'Apri la pagina Ascolto: ');
assert.equal(sl.socialAscoltoPageLine(pageUrl), pageLine);
const recap = {
  verticalId: 'ai',
  day: '2026-11-03',
  requestedDay: '2026-11-20',
  stale: true,
  track: 'mac',
  finishedAt: '2026-11-03T14:40:00+00:00',
  counts: { funziona: 2, da_provare: 6, non_funziona: 0, fuffa: 2 },
  postsSeen: 10,
  spentUsd: 0.875,
  topics: [],
};
const parsed = sl.SocialRecapOutputSchema.parse({ ...recap, pageUrl, pageLine });
assert.deepEqual(Object.keys(parsed).slice(0, 3), ['pageLine', 'pageUrl', 'verticalId']);
assert.equal(parsed.pageLine, pageLine);
assert.equal(parsed.pageUrl, pageUrl);
assert.equal(sl.SocialRecapOutputSchema.safeParse({ ...recap, pageUrl, pageLine: 'Wrong link' }).success, false);
assert.deepEqual(sl.SocialRecapOutputSchema.parse({ ...recap, pageUrl }), { ...recap, pageUrl });
console.log('OK');
`;

describe('s9701 recap page link first in package 1.285.0', () => {
  it('s9701 (a) package.json has version 1.291.0', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.(285|287|288|289|290|291)\.0$/);
  });

  it('s9701 (b) the recap page line works from ESM', () => {
    const script = CHECK.replace('SL', `(await import('@x9-forge/contracts/capability/social-listening'))`);
    expect(node(script)).toBe('OK');
  });

  it('s9701 (b) the recap page line works from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${CHECK.replace('SL', `require('@x9-forge/contracts/capability/social-listening')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s9701 (c) the CHANGELOG contains v1.285.0', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    expect(text).toContain('## v1.285.0');
  });

  it('s9701 (d) the narrow imports map has version 1.285.0', () => {
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    expect(map.versione).toBe('1.285.0');
  });
});
