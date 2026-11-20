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
assert.equal(typeof sl.socialFilterJobInput, 'function');
assert.equal(typeof sl.socialGroupJobInput, 'function');
assert.equal(typeof sl.socialVerifyJobInput, 'function');
assert.equal(sl.socialPostExcerpt('a😀b', 2), 'a😀');
console.log('OK');
`;

describe('s3936 social listening job material in package 1.273.0', () => {
  it('s3936 (a) package.json has a version in the 1.273.0-1.284.0 band', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.(27[3-9]|28[0-5])\.0$/);
  });

  it('s3936 (b) the symbols work from ESM', () => {
    const script = CHECK.replace('SL', `(await import('@x9-forge/contracts/capability/social-listening'))`);
    expect(node(script)).toBe('OK');
  });

  it('s3936 (b) the symbols work from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${CHECK.replace('SL', `require('@x9-forge/contracts/capability/social-listening')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s3936 (c) the narrow imports map carries the package version', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    expect(map.versione).toBe(pkg.version);
  });

  it('s3936 (d) the CHANGELOG has v1.273.0 once above v1.272.0, naming 3933, 3934 and 3935', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const title = '## v1.273.0';
    const first = text.indexOf(title);
    expect(first).toBeGreaterThan(-1);
    expect(text.indexOf(title, first + 1)).toBe(-1);
    const previous = text.indexOf('## v1.272.0');
    expect(previous).toBeGreaterThan(first);
    const block = text.slice(first, previous);
    expect(block).toContain('3933');
    expect(block).toContain('3934');
    expect(block).toContain('3935');
  });
});
