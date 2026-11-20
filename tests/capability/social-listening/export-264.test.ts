import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const radice = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const ENV = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };
const SUB = '@x9-forge/contracts/capability/social-listening';

function node(script: string): string {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: radice,
    env: ENV,
    encoding: 'utf8',
  }).trim();
}

const PROVA = `
const m = SPEC;
const t = m.shortenSocialTopicTitle('Pulizia Android TV da pubblicità con coding agent');
console.log(t === 'Pulizia Android TV' && m.SOCIAL_TOPIC_TITLE_MAX === 31 ? 'OK' : 'KO ' + t);
`;

describe('s3633 social-listening 1.264.0 in the built package', () => {
  it('s3633 (a) package.json has a version in the 1.264.0-1.284.0 band', () => {
    const pkg = JSON.parse(readFileSync(resolve(radice, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.(2(6[4-9]|7\d)|28[0-4])\.\d+$/);
  });

  it('s3633 (b) the short title closes on the last full word from ESM', () => {
    expect(node(PROVA.replace('SPEC', `await import('${SUB}')`))).toBe('OK');
  });

  it('s3633 (b) the short title closes on the last full word from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${PROVA.replace('SPEC', `require('${SUB}')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s3633 (c) the narrow imports map carries version 1.264.0', () => {
    const mappa = JSON.parse(readFileSync(resolve(radice, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    const pkg = JSON.parse(readFileSync(resolve(radice, 'package.json'), 'utf8')) as { version: string };
    expect(mappa.versione).toBe(pkg.version);
  });

  it('s3633 (d) the CHANGELOG has v1.264.0 above v1.263.0 and names the function', () => {
    const testo = readFileSync(resolve(radice, 'CHANGELOG.md'), 'utf8');
    const nuova = testo.indexOf('## v1.264.0');
    expect(nuova).toBeGreaterThan(-1);
    expect(nuova).toBeLessThan(testo.indexOf('## v1.263.0'));
    expect(testo.slice(nuova, testo.indexOf('## v1.263.0'))).toContain('shortenSocialTopicTitle');
  });
});
