import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const radice = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const ENV = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };
const SOTTO = './capability/social-listening';
const NOME = '@x9-forge/contracts/capability/social-listening';

type Pacchetto = {
  version: string;
  exports: Record<string, { types: string; import: string; require: string }>;
  zshy: { exports: Record<string, string> };
};
const pacchetto = JSON.parse(readFileSync(resolve(radice, 'package.json'), 'utf8')) as Pacchetto;

function nodeEsm(script: string): string {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: radice,
    env: ENV,
    encoding: 'utf8',
  });
}

describe('s3605 social-listening export', () => {
  it('s3605 (a) package.json has the version and the subpath keys', () => {
    expect(pacchetto.version).toMatch(/^1\.26\d\.0$/);
    expect(pacchetto.version).toBe('1.260.0');
    expect(pacchetto.zshy.exports[SOTTO]).toBe('./src/capability/social-listening/index.ts');
    expect(pacchetto.exports[SOTTO]).toEqual({
      types: './dist/capability/social-listening/index.d.cts',
      import: './dist/capability/social-listening/index.js',
      require: './dist/capability/social-listening/index.cjs',
    });
  });

  it('s3605 (b) the built package imports from ESM', () => {
    const out = nodeEsm(`
      const m = await import(${JSON.stringify(NOME)});
      console.log(JSON.stringify([
        m.SOCIAL_LISTENING_TOOLS.recap,
        typeof m.SocialTopicSchema.safeParse,
        Object.keys(m.SOCIAL_LISTENING_PARAMETERS).length > 0,
      ]));
    `);
    expect(JSON.parse(out)).toEqual(['social_recap', 'function', true]);
  });

  it('s3605 (b) the built package imports from CommonJS', () => {
    const out = nodeEsm(`
      import { createRequire } from 'node:module';
      const m = createRequire(process.cwd() + '/package.json')(${JSON.stringify(NOME)});
      console.log(JSON.stringify([
        m.SOCIAL_LISTENING_TOOLS.recap,
        typeof m.SocialTopicSchema.safeParse,
        Object.keys(m.SOCIAL_LISTENING_PARAMETERS).length > 0,
      ]));
    `);
    expect(JSON.parse(out)).toEqual(['social_recap', 'function', true]);
  });

  it('s3605 (c) ricerca exports the caller params and the social spend entry', () => {
    const out = nodeEsm(`
      const m = await import('@x9-forge/contracts/capability/ricerca');
      console.log(JSON.stringify([
        typeof m.resolveResearchParams,
        typeof m.ResearchCallerParamsSchema.safeParse,
        m.SpendingCapabilitySchema.options.includes('social'),
      ]));
    `);
    expect(JSON.parse(out)).toEqual(['function', 'function', true]);
  });

  it('s3605 (d) the narrow imports map carries the package version', () => {
    const mappa = JSON.parse(readFileSync(resolve(radice, 'dist/narrow-imports.json'), 'utf8')) as { versione: string };
    expect(mappa.versione).toBe(pacchetto.version);
  });

  it('s3605 (e) the CHANGELOG has the v1.260.0 entry above v1.223.0', () => {
    const log = readFileSync(resolve(radice, 'CHANGELOG.md'), 'utf8');
    const nuova = log.indexOf('## v1.260.0');
    const vecchia = log.indexOf('## v1.223.0');
    expect(nuova).toBeGreaterThan(-1);
    expect(vecchia).toBeGreaterThan(nuova);
  });
});
