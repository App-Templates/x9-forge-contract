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

// Verification fields reconstructed from the saved 03/11 topic; no live data is read.
const CHECK = `
import assert from 'node:assert/strict';
const sl = SL;
const savedResult = {
  kind: 'verify',
  topicId: 'cluster-1',
  verdict: 'da_provare',
  summary: 'Le skill di Claude Code per design, scrittura e montaggio.',
  facts: [{ text: 'Le skill si installano da una cartella.', sourceUrls: ['https://example.com/post/1'] }],
  sources: [{ url: 'https://example.com/post/1', title: 'Post', opened: true }],
};
const analysis = {
  postId: 'p1',
  verdict: 'fuffa',
  reason: 'The post promises results without showing evidence.',
  tools: [{ name: 'Design tool', link: 'https://example.com/tool', whatItDoes: 'Builds interfaces from a brief.' }],
};
const parsedAnalysis = sl.SocialVerifyPostAnalysisSchema.safeParse(analysis);
assert.equal(parsedAnalysis.success, true);
assert.deepEqual(parsedAnalysis.data, analysis);
const result = { ...savedResult, postAnalyses: [analysis] };
const parsed = sl.SocialJobResultSchema.safeParse(result);
assert.equal(parsed.success, true);
assert.deepEqual(parsed.data, result);
assert.equal(sl.SocialJobResultSchema.safeParse({
  ...savedResult, postAnalyses: [analysis, { ...analysis, reason: 'Another claim for the same post.' }],
}).success, false);
const legacy = sl.SocialJobResultSchema.safeParse(savedResult);
assert.equal(legacy.success, true);
assert.deepEqual(legacy.data, savedResult);
console.log('OK');
`;

describe('s9896 optional verify postAnalyses in package 1.294.0', () => {
  it('s9896 (a) package.json has version 1.294.0 (M1)', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.294\.0$/);
  });

  it('s9896 (b) verify postAnalyses work from ESM (M2)', () => {
    const script = CHECK.replace('SL', `(await import('@x9-forge/contracts/capability/social-listening'))`);
    expect(node(script)).toBe('OK');
  });

  it('s9896 (b) verify postAnalyses work from CommonJS (M2)', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${CHECK.replace('SL', `require('@x9-forge/contracts/capability/social-listening')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s9896 (c) the narrow imports map carries the package version', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    expect(map.versione).toBe(pkg.version);
  });

  it('s9896 (d) the CHANGELOG has v1.294.0 once above v1.293.0, naming 9897 (M3)', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const title = '## v1.294.0';
    const first = text.indexOf(title);
    expect(first).toBeGreaterThan(text.indexOf('## Non rilasciato'));
    expect(text.indexOf(title, first + 1)).toBe(-1);
    const previous = text.indexOf('## v1.293.0');
    expect(previous).toBeGreaterThan(first);
    expect(text.slice(first, previous)).toContain('9897');
  });
});
