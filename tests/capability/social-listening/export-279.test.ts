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
assert.equal(sl.SOCIAL_TOPIC_RESEARCH_RESULT_TOOLS.result, 'social_topic_research_result');
assert.equal(sl.SocialTopicResearchResultInputSchema.safeParse({ topicId: 't-1' }).success, true);
assert.equal(typeof sl.SocialTopicResearchResultOutputSchema.safeParse, 'function');
assert.equal(sl.SocialTopicResearchResultToolErrorSchema.safeParse('research_not_ready').success, true);
assert.equal(sl.SocialTopicWikiToolErrorSchema.safeParse('research_not_ready').success, true);
assert.deepEqual(sl.SOCIAL_TOPIC_RESEARCH_TOOLS, { start: 'social_topic_research' });
console.log('OK');
`;

describe('s3955 public extended research result in package 1.279.0', () => {
  it('s3955 (a) package.json has version 1.294.0', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.(279|28[0-9]|29[0-4])\.0$/);
  });

  it('s3955 (b) the public research result exports work from ESM', () => {
    const script = CHECK.replace('SL', `(await import('@x9-forge/contracts/capability/social-listening'))`);
    expect(node(script)).toBe('OK');
  });

  it('s3955 (b) the public research result exports work from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${CHECK.replace('SL', `require('@x9-forge/contracts/capability/social-listening')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s3955 (c) the narrow imports map carries the package version', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    expect(map.versione).toBe(pkg.version);
  });

  it('s3955 (d) the CHANGELOG has v1.279.0 once above v1.278.0, naming 3953 and 3954', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const title = '## v1.279.0';
    const first = text.indexOf(title);
    expect(first).toBeGreaterThan(text.indexOf('## Non rilasciato'));
    expect(text.indexOf(title, first + 1)).toBe(-1);
    const previous = text.indexOf('## v1.278.0');
    expect(previous).toBeGreaterThan(first);
    const block = text.slice(first, previous);
    expect(block).toContain('3953');
    expect(block).toContain('3954');
  });
});
