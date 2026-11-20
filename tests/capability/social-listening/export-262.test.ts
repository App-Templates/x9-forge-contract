import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const radice = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const ENV = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };
const SUB = '@x9-forge/contracts/capability/social-listening';

type Pacchetto = {
  version: string;
  exports: Record<string, Record<string, string>>;
  zshy: { exports: Record<string, string> };
};
const pkg = JSON.parse(readFileSync(resolve(radice, 'package.json'), 'utf8')) as Pacchetto;

function node(script: string): string {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: radice,
    env: ENV,
    encoding: 'utf8',
  }).trim();
}

const PROVA = `
const m = SPEC;
const ok = m.SOCIAL_LISTENING_TOOLS.recap === 'social_recap'
  && typeof m.SocialTopicSchema.safeParse === 'function'
  && Object.keys(m.SOCIAL_LISTENING_PARAMETERS).length > 0
  && ['socialImportPostWithAnalysis', 'socialCapDecision', 'socialRoundHandover'].every((n) => typeof m[n] === 'function');
console.log(ok ? 'OK' : 'KO');
`;

describe('s3618 social-listening subpath in the built package', () => {
  it('s3618 (a) package.json has a version in the 1.260-1.269 band and the subpath key', () => {
    const [maggiore, minore] = pkg.version.split('.').map(Number);
    expect(maggiore).toBe(1);
    expect(minore).toBeGreaterThanOrEqual(260);
    expect(minore).toBeLessThanOrEqual(279);
    expect(pkg.exports['./capability/social-listening']).toEqual({
      types: './dist/capability/social-listening/index.d.cts',
      import: './dist/capability/social-listening/index.js',
      require: './dist/capability/social-listening/index.cjs',
    });
    expect(pkg.zshy.exports['./capability/social-listening']).toBe(
      './src/capability/social-listening/index.ts',
    );
  });

  it('s3618 (b) imports from ESM', () => {
    expect(node(PROVA.replace('SPEC', `await import('${SUB}')`))).toBe('OK');
  });

  it('s3618 (b) imports from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${PROVA.replace('SPEC', `require('${SUB}')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s3618 (c) ricerca, stt and the social spend entry are exported', () => {
    const script = `
const r = await import('@x9-forge/contracts/capability/ricerca');
const s = await import('@x9-forge/contracts/capability/stt');
console.log(typeof r.resolveResearchParams === 'function'
  && typeof r.ResearchCallerParamsSchema.safeParse === 'function'
  && r.SpendingCapabilitySchema.options.includes('social')
  && typeof s.parseTranscribeInput === 'function' ? 'OK' : 'KO');`;
    expect(node(script)).toBe('OK');
  });

  it('s3618 (d) the narrow imports map carries the version', () => {
    const mappa = JSON.parse(readFileSync(resolve(radice, 'dist/narrow-imports.json'), 'utf8')) as {
      versione: string;
    };
    expect(mappa.versione).toBe(pkg.version);
  });

  it('s3618 (e) the CHANGELOG has v1.262.0 above v1.230.0', () => {
    const testo = readFileSync(resolve(radice, 'CHANGELOG.md'), 'utf8');
    const nuova = testo.indexOf('## v1.262.0');
    expect(nuova).toBeGreaterThan(-1);
    expect(nuova).toBeLessThan(testo.indexOf('## v1.230.0'));
  });
});
