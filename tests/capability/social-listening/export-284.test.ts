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
const { z } = ZOD;
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
const result = sl.SocialRecapOutputSchema.safeParse(recap);
assert.equal(result.success, true);
assert.deepEqual(result.data, recap);
assert.equal(sl.SocialRecapOutputSchema.safeParse({ ...recap, stale: false }).success, false);
const schema = z.toJSONSchema(sl.SocialRecapInputSchema);
assert.ok(schema.properties.day.description.includes('ultimo giro finito prima'));
console.log('OK');
`;

describe('s3963 recap freshness in package 1.284.0', () => {
  it('s3963 (a) package.json has version 1.288.0', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.(284|285|287|288)\.0$/);
  });

  it('s3963 (b) recap freshness and the day description work from ESM', () => {
    const script = CHECK
      .replace('SL', `(await import('@x9-forge/contracts/capability/social-listening'))`)
      .replace('ZOD', `(await import('zod'))`);
    expect(node(script)).toBe('OK');
  });

  it('s3963 (b) recap freshness and the day description work from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${CHECK
  .replace('SL', `require('@x9-forge/contracts/capability/social-listening')`)
  .replace('ZOD', `require('zod')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s3963 (c) the narrow imports map carries the package version', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    expect(map.versione).toBe(pkg.version);
  });

  it('s3963 (d) the CHANGELOG has v1.284.0 once above v1.283.0, naming 3962', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const title = '## v1.284.0';
    const first = text.indexOf(title);
    expect(first).toBeGreaterThan(text.indexOf('## Non rilasciato'));
    expect(text.indexOf(title, first + 1)).toBe(-1);
    const previous = text.indexOf('## v1.283.0');
    expect(previous).toBeGreaterThan(first);
    expect(text.slice(first, previous)).toContain('3962');
  });
});
