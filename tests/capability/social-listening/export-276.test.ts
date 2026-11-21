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
const http = HTTP;
assert.equal(sl.SOCIAL_ASCOLTO_PAGE_PATH, '/agents/{slug}/ascolto');
assert.equal(sl.socialAscoltoPagePath('x9'), '/agents/x9/ascolto');
const recap = {
  verticalId: 'ai',
  day: '2026-11-03',
  track: 'mac',
  finishedAt: '2026-11-03T14:40:00+00:00',
  counts: { funziona: 2, da_provare: 6, non_funziona: 0, fuffa: 2 },
  postsSeen: 10,
  spentUsd: 0.875,
  topics: [],
};
const parsed = sl.SocialRecapOutputSchema.safeParse({ ...recap, costPerPostUsd: 0.0875 });
assert.equal(parsed.success, true);
assert.equal(parsed.data.costPerPostUsd, 0.0875);
assert.equal(sl.SocialRecapOutputSchema.safeParse(recap).success, true);
assert.equal(sl.SocialRecapOutputSchema.safeParse({ ...recap, costPerPostUsd: 0.09 }).success, false);
assert.equal(http.socialAgentSpendContract.path, '/internal/capability/agents/:agentId/spend');
console.log('OK');
`;

describe('s3948 social listening spend, recap cost per post and Ascolto page path in package 1.276.0', () => {
  it('s3948 (a) package.json has a version in the 1.276.0-1.291.0 band', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.(27[6-9]|28[0-9]|29[01])\.0$/);
  });

  it('s3948 (b) the symbols work from ESM', () => {
    const script = CHECK
      .replace('SL', `(await import('@x9-forge/contracts/capability/social-listening'))`)
      .replace('HTTP', `(await import('@x9-forge/contracts/http'))`);
    expect(node(script)).toBe('OK');
  });

  it('s3948 (b) the symbols work from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${CHECK
  .replace('SL', `require('@x9-forge/contracts/capability/social-listening')`)
  .replace('HTTP', `require('@x9-forge/contracts/http')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s3948 (c) the narrow imports map carries the package version', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    expect(map.versione).toBe(pkg.version);
  });

  it('s3948 (d) the CHANGELOG has v1.276.0 once above v1.275.0, naming 3945 through 3947', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const title = '## v1.276.0';
    const first = text.indexOf(title);
    expect(first).toBeGreaterThan(text.indexOf('## Non rilasciato'));
    expect(text.indexOf(title, first + 1)).toBe(-1);
    const previous = text.indexOf('## v1.275.0');
    expect(previous).toBeGreaterThan(first);
    const block = text.slice(first, previous);
    expect(block).toContain('3945');
    expect(block).toContain('3946');
    expect(block).toContain('3947');
  });
});
