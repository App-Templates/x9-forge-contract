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
assert.deepEqual(sl.socialJobRoute('verify', 'server'), { runner: 'executor', executor: 'server', tool: 'claude_p' });
assert.equal(sl.socialJobRoute('collect', 'server').runner, 'service');
assert.equal(sl.socialJobRoute('verify', 'mac').executor, 'laptop');
console.log('OK');
`;

describe('s3961 server verification route in package 1.283.0', () => {
  it('s3961 (a) package.json has a version in the 1.283.0-1.291.0 band', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.(283|284|285|287|288|289|290|291)\.0$/);
  });

  it('s3961 (b) the server verification route works from ESM', () => {
    const script = CHECK.replace('SL', `(await import('@x9-forge/contracts/capability/social-listening'))`);
    expect(node(script)).toBe('OK');
  });

  it('s3961 (b) the server verification route works from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${CHECK.replace('SL', `require('@x9-forge/contracts/capability/social-listening')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s3961 (c) the narrow imports map carries the package version', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    expect(map.versione).toBe(pkg.version);
  });

  it('s3961 (d) the CHANGELOG has v1.283.0 once above v1.282.0, naming 3960', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const title = '## v1.283.0';
    const first = text.indexOf(title);
    expect(first).toBeGreaterThan(text.indexOf('## Non rilasciato'));
    expect(text.indexOf(title, first + 1)).toBe(-1);
    const previous = text.indexOf('## v1.282.0');
    expect(previous).toBeGreaterThan(first);
    expect(text.slice(first, previous)).toContain('3960');
  });
});
