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
assert.equal(dev.DEV_SESSION_ATTESTATION_FILE, 'ATTESTAZIONE.json');
assert.equal(dev.DevSessionAcceptanceSchema.safeParse({}).success, false);
const catalog = Object.keys(dev.DEV_SESSION_ACCEPTANCE_CATALOG);
assert.equal(catalog.length, 19);
assert.ok(catalog.includes('D-01'));
assert.ok(Object.keys(dev.DEV_SESSION_TEMPLATES).includes('sviluppo-pezzo-app'));
assert.equal(typeof dev.devSessionAcceptanceVerdict, 'function');
assert.equal(typeof dev.DevSessionManifestAttestationSchema.safeParse, 'function');
console.log('OK');
`;

describe('s3928 dev session acceptance contracts in package 1.282.0', () => {
  it('s3928 (a) package.json has a version in the 1.282.0-1.289.0 band', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.(282|283|284|285|287|288|289)\.0$/);
  });

  it('s3928 (b) the session acceptance exports work from ESM', () => {
    const script = CHECK.replace('DEV', `(await import('@x9-forge/contracts/capability/dev'))`);
    expect(node(script)).toBe('OK');
  });

  it('s3928 (b) the session acceptance exports work from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${CHECK.replace('DEV', `require('@x9-forge/contracts/capability/dev')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s3928 (c) the narrow imports map carries the package version', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    expect(map.versione).toBe(pkg.version);
  });

  it('s3928 (d) the CHANGELOG has v1.282.0 once above v1.281.0, naming 3924 and 3927', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const title = '## v1.282.0';
    const first = text.indexOf(title);
    expect(first).toBeGreaterThan(text.indexOf('## Non rilasciato'));
    expect(text.indexOf(title, first + 1)).toBe(-1);
    const previous = text.indexOf('## v1.281.0');
    expect(previous).toBeGreaterThan(first);
    const block = text.slice(first, previous);
    expect(block).toContain('3924');
    expect(block).toContain('3927');
  });
});
