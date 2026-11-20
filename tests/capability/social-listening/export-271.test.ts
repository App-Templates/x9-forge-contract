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
const dev = DEV;
const sl = SL;
assert.ok(dev.DEV_GENERIC_JOB_TOOLS.includes('ig_collect'));
assert.equal(sl.SOCIAL_JOB_TOOL.collect, 'ig_collect');
assert.equal(typeof sl.socialGenericJobFor, 'function');
console.log('OK');
`;

describe('s3669 ig_collect and the social listening generic job in package 1.271.0', () => {
  it('s3669 (a) package.json has a version in the 1.271.0-1.279.0 band', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.27[1-9]\.0$/);
  });

  it('s3669 (b) the symbols work from ESM', () => {
    const script = CHECK.replace('DEV', `(await import('@x9-forge/contracts/capability/dev'))`).replace(
      'SL',
      `(await import('@x9-forge/contracts/capability/social-listening'))`,
    );
    expect(node(script)).toBe('OK');
  });

  it('s3669 (b) the symbols work from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${CHECK.replace('DEV', `require('@x9-forge/contracts/capability/dev')`).replace(
  'SL',
  `require('@x9-forge/contracts/capability/social-listening')`,
)}`;
    expect(node(script)).toBe('OK');
  });

  it('s3669 (c) the narrow imports map carries the package version', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    expect(map.versione).toBe(pkg.version);
  });

  it('s3669 (d) the CHANGELOG has v1.271.0 once above v1.270.0, naming 3667 and 3668', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const t = '## v1.271.0';
    const first = text.indexOf(t);
    expect(first).toBeGreaterThan(-1);
    expect(text.indexOf(t, first + 1)).toBe(-1);
    const prev = text.indexOf('## v1.270.0');
    expect(prev).toBeGreaterThan(first);
    const block = text.slice(first, prev);
    expect(block).toContain('3667');
    expect(block).toContain('3668');
  });
});
