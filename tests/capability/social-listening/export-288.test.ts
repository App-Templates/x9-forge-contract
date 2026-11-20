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
assert.equal(sl.socialCostVsEstimate({ costPerPostUsd: 0.09 }).near, true);
const round = sl.socialRoundOptimization({
  day: '2026-11-20',
  track: 'server',
  topics: 3,
  factsReused: 2,
  factsNew: 5,
  postsSeen: 10,
  postsKept: 6,
  postsDiscarded: 4,
  spentUsd: 0.6,
});
assert.equal(sl.SocialRoundOptimizationSchema.safeParse(round).success, true);
assert.equal(sl.socialP0Table([]).missing.length, 3);
console.log('OK');
`;

describe('s9803 optimized round estimate, report and P0 table in package 1.288.0', () => {
  it('s9803 (a) package.json has version 1.289.0', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.(288|289)\.0$/);
  });

  it('s9803 (b) the three groups work from ESM', () => {
    const script = CHECK.replace('SL', `(await import('@x9-forge/contracts/capability/social-listening'))`);
    expect(node(script)).toBe('OK');
  });

  it('s9803 (b) the three groups work from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${CHECK.replace('SL', `require('@x9-forge/contracts/capability/social-listening')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s9803 (c) the narrow imports map carries the package version', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    expect(map.versione).toBe(pkg.version);
  });

  it('s9803 (d) the CHANGELOG has v1.288.0 once above v1.287.0, naming 9800, 9801 and 9802', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const title = '## v1.288.0';
    const first = text.indexOf(title);
    expect(first).toBeGreaterThan(text.indexOf('## Non rilasciato'));
    expect(text.indexOf(title, first + 1)).toBe(-1);
    const previous = text.indexOf('## v1.287.0');
    expect(previous).toBeGreaterThan(first);
    const block = text.slice(first, previous);
    for (const id of ['9800', '9801', '9802']) expect(block).toContain(id);
  });
});
