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
assert.equal(sl.socialJobRoute('collect', 'server').runner, 'service');
assert.equal(sl.socialServerVerifyEstimate([]), 0.25);
assert.equal(typeof sl.socialPostFromMetaMedia, 'function');
assert.equal(sl.SOCIAL_META_MEDIA_FIELDS.length, 9);
console.log('OK');
`;

describe('s3939 social listening server track in package 1.274.0', () => {
  it('s3939 (a) package.json has a version in the 1.274.0-1.294.0 band', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.(27[4-9]|28[0-9]|29[0-4])\.0$/);
  });

  it('s3939 (b) the symbols work from ESM', () => {
    const script = CHECK.replace('SL', `(await import('@x9-forge/contracts/capability/social-listening'))`);
    expect(node(script)).toBe('OK');
  });

  it('s3939 (b) the symbols work from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${CHECK.replace('SL', `require('@x9-forge/contracts/capability/social-listening')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s3939 (c) the narrow imports map carries the package version', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    expect(map.versione).toBe(pkg.version);
  });

  it('s3939 (d) the CHANGELOG has v1.274.0 once above v1.273.0, naming 3937 and 3938', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const title = '## v1.274.0';
    const first = text.indexOf(title);
    expect(first).toBeGreaterThan(text.indexOf('## Non rilasciato'));
    expect(text.indexOf(title, first + 1)).toBe(-1);
    const previous = text.indexOf('## v1.273.0');
    expect(previous).toBeGreaterThan(first);
    const block = text.slice(first, previous);
    expect(block).toContain('3937');
    expect(block).toContain('3938');
  });
});
