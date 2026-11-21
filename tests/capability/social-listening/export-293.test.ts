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
const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const url = 'https://example.com/post/1';
const topic = {
  topicId: 'cluster-1',
  verticalId: 'ai',
  day: '2026-11-03',
  title: 'Skill di Claude Code',
  category: 'coding',
  summary: 'Le skill raccolgono procedure riutilizzabili.',
  verdict: 'da_provare',
  facts: [{ text: 'Si installano localmente.', sourceUrls: [url] }],
  sources: [{ url, opened: true }],
  heat: 7.6,
  postIds: ['p1', 'p2', 'p3'],
  creators: ['creator.one', 'creator.two', 'creator.three'],
  cost: { usd: 0, track: 'mac', uncertain: true },
  computedAt: '2026-11-03T20:29:03.000Z',
};
const angle = 'Mostra il prima e il dopo di una skill in 20 secondi';
const posts = [{
  postId: 'p1',
  handle: 'creator.one',
  link: 'https://www.instagram.com/reel/p1/',
  verdict: 'funziona',
  reason: 'Mostra un flusso che si riproduce in pochi minuti.',
  tools: [{ name: 'Designeer', link: 'https://designeer.example/', whatItDoes: 'genera interfacce' }],
}];
const creator = {
  handle: 'creator.one',
  topics: 2,
  counts: { funziona: 1, da_provare: 1, non_funziona: 0, fuffa: 0 },
  truthScore: 80,
  lastDay: '2026-11-03',
};
const rank = (c) => ({ fromDay: '2026-11-01', toDay: '2026-11-03', creators: [c] });
const postVerdicts = { funziona: 2, da_provare: 1, non_funziona: 0, fuffa: 1 };
const withPv = sl.SocialCreatorsRankOutputSchema.safeParse(rank({ ...creator, postVerdicts }));
assert.equal(withPv.success, true);
assert.deepEqual(withPv.data.creators[0].postVerdicts, postVerdicts);
assert.equal(sl.SocialCreatorsRankOutputSchema.safeParse(rank({ ...creator, postVerdicts: { ...postVerdicts, altro: 1 } })).success, false);
assert.equal(sl.SocialCreatorsRankOutputSchema.safeParse(rank(creator)).success, true);
console.log('OK');
`;

describe('s9835 per-creator post verdicts in package 1.293.0', () => {
  it('s9835 (a) package.json has version 1.293.0', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.293\.0$/);
  });

  it('s9835 (b) creator postVerdicts work from ESM', () => {
    const script = CHECK.replace('SL', `(await import('@x9-forge/contracts/capability/social-listening'))`);
    expect(node(script)).toBe('OK');
  });

  it('s9835 (b) creator postVerdicts work from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${CHECK.replace('SL', `require('@x9-forge/contracts/capability/social-listening')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s9835 (c) the narrow imports map carries the package version', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    expect(map.versione).toBe(pkg.version);
  });

  it('s9835 (d) the CHANGELOG has v1.293.0 once above v1.292.0, naming 9834', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const title = '## v1.293.0';
    const first = text.indexOf(title);
    expect(first).toBeGreaterThan(text.indexOf('## Non rilasciato'));
    expect(text.indexOf(title, first + 1)).toBe(-1);
    const previous = text.indexOf('## v1.292.0');
    expect(previous).toBeGreaterThan(first);
    expect(text.slice(first, previous)).toContain('9834');
  });
});
