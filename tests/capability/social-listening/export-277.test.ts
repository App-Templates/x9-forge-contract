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
assert.equal(sl.SOCIAL_COSTS_TOOLS.report, 'social_costs_report');
assert.equal(
  sl.SocialCostsReportInputSchema.safeParse({ verticalId: 'tech', from: '2026-11-01', to: '2026-11-30' }).success,
  true,
);
assert.equal(
  sl.SocialCostsReportInputSchema.safeParse({ verticalId: 'tech', from: '2026-11-30', to: '2026-11-01' }).success,
  false,
);
const report = {
  verticalId: 'tech',
  from: '2026-11-01',
  to: '2026-11-30',
  rounds: [{ day: '2026-11-03', track: 'server', postsSeen: 10, spentUsd: 0.875, costPerPostUsd: 0.0875 }],
  serverCostPerPostUsd: 0.0875,
  authors: [{
    provider: 'instagram',
    handle: 'someone',
    verticalId: 'tech',
    addedAt: '2026-11-01T08:00:00+00:00',
    postsPerDay: 2,
    monthlyUsd: 5.25,
  }],
};
const parsed = sl.SocialCostsReportOutputSchema.safeParse(report);
assert.equal(parsed.success, true, JSON.stringify(parsed.error?.issues));
console.log('OK');
`;

describe('s3950 social listening costs report tool in package 1.277.0', () => {
  it('s3950 (a) package.json has a version in the 1.277.0-1.291.0 band', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.(27[7-9]|28[0-9]|29[01])\.0$/);
  });

  it('s3950 (b) the symbols work from ESM', () => {
    const script = CHECK.replace('SL', `(await import('@x9-forge/contracts/capability/social-listening'))`);
    expect(node(script)).toBe('OK');
  });

  it('s3950 (b) the symbols work from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${CHECK.replace('SL', `require('@x9-forge/contracts/capability/social-listening')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s3950 (c) the narrow imports map carries the package version', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    expect(map.versione).toBe(pkg.version);
  });

  it('s3950 (d) the CHANGELOG has v1.277.0 once above v1.276.0, naming 3949', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const title = '## v1.277.0';
    const first = text.indexOf(title);
    expect(first).toBeGreaterThan(text.indexOf('## Non rilasciato'));
    expect(text.indexOf(title, first + 1)).toBe(-1);
    const previous = text.indexOf('## v1.276.0');
    expect(previous).toBeGreaterThan(first);
    expect(text.slice(first, previous)).toContain('3949');
  });
});
