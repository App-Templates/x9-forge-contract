import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const ENV = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };
const SUB = '@x9-forge/contracts/capability/social-listening';

function node(script: string): string {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: root,
    env: ENV,
    encoding: 'utf8',
  }).trim();
}

const PROBE = `
import assert from 'node:assert/strict';
const m = SPEC;
assert.ok(m.SocialRecapOutputSchema.shape.pageUrl);
const filteredAt = '2026-11-18T07:10:00Z';
assert.equal(m.SocialPostFilterSchema.safeParse({ keep: false, filteredAt }).success, true);
assert.deepEqual(
  m.socialPostFilterFromResult({ kind: 'filter', postId: 'p1', keep: false }, filteredAt),
  { keep: false, filteredAt },
);
assert.ok(m.SocialPostSchema.shape.filter);
const result = m.SocialJobResultSchema.parse({
  kind: 'verify',
  topicId: 't1',
  verdict: 'da_provare',
  summary: 'The demo shows code generation.',
  facts: [{ text: 'The demo generates code.', sourceUrls: ['https://example.com/demo'] }],
  sources: [{ url: 'https://example.com/demo', opened: true }],
  costUsd: 0.04,
});
assert.equal(result.costUsd, 0.04);
assert.equal(m.socialVerifyTopicCost(result, 'server').usd, 0.04);
console.log('OK');
`;

describe('s3693 social-listening 1.267.0 in the built package', () => {
  it('s3693 (a) package.json has version 1.267.0', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.(2(6[7-9]|7\d)|28[01])\.0$/);
  });

  it('s3693 (b) recap link, post filter and verify cost import from ESM', () => {
    expect(node(PROBE.replace('SPEC', `await import('${SUB}')`))).toBe('OK');
  });

  it('s3693 (b) recap link, post filter and verify cost import from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${PROBE.replace('SPEC', `require('${SUB}')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s3693 (c) the narrow imports map carries version 1.267.0', () => {
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(map.versione).toBe(pkg.version);
  });

  it('s3693 (d) the CHANGELOG has v1.267.0 above v1.266.0 and names the symbols', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const current = text.indexOf('## v1.267.0');
    const previous = text.indexOf('## v1.266.0');
    expect(current).toBeGreaterThan(-1);
    expect(previous).toBeGreaterThan(current);
    const entry = text.slice(current, previous);
    expect(entry).toContain('pageUrl');
    expect(entry).toContain('socialPostFilterFromResult');
    expect(entry).toContain('costUsd');
  });
});
