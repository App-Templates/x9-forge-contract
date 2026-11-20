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
const ok =
  m.SOCIAL_CREATORS_TOOLS.rank === 'social_creators_rank' &&
  m.SOCIAL_FAVORITES_TOOLS.list === 'social_favorite_list' &&
  m.socialVideoExternalRef('cluster-1') === 'social:cluster-1' &&
  m.SocialTopicSaveWikiInputSchema.safeParse({ topicId: 'c', ownerConfirmed: false }).success === false &&
  m.SOCIAL_TOPIC_RESEARCH_TOOLS.start === 'social_topic_research' &&
  typeof m.socialListeningConfigFromOrdinary === 'function';
console.log(ok ? 'OK' : 'KO');
`;

describe('s3649 social-listening 1.265.0 in the built package', () => {
  it('s3649 (a) package.json has a version in the 1.265.0-1.287.0 band', () => {
    const pkg = JSON.parse(readFileSync(resolve(radice, 'package.json'), 'utf8')) as { version: string };
    const [maggiore, minore] = pkg.version.split('.').map(Number);
    expect(maggiore).toBe(1);
    expect(minore).toBeGreaterThanOrEqual(265);
    expect(minore).toBeLessThanOrEqual(283);
  });

  it('s3649 (b) the new symbols import from ESM', () => {
    expect(node(PROVA.replace('SPEC', `await import('${SUB}')`))).toBe('OK');
  });

  it('s3649 (b) the new symbols import from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${PROVA.replace('SPEC', `require('${SUB}')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s3649 (c) the narrow imports map carries the package.json version', () => {
    const mappa = JSON.parse(readFileSync(resolve(radice, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    const pkg = JSON.parse(readFileSync(resolve(radice, 'package.json'), 'utf8')) as { version: string };
    expect(mappa.versione).toBe(pkg.version);
  });

  it('s3649 (d) the CHANGELOG has v1.265.0 above v1.264.0 and names the symbols', () => {
    const testo = readFileSync(resolve(radice, 'CHANGELOG.md'), 'utf8');
    const nuova = testo.indexOf('## v1.265.0');
    expect(nuova).toBeGreaterThan(-1);
    expect(nuova).toBeLessThan(testo.indexOf('## v1.264.0'));
    const voce = testo.slice(nuova, testo.indexOf('## v1.264.0'));
    expect(voce).toContain('social_creators_rank');
    expect(voce).toContain('socialListeningConfigFromOrdinary');
  });
});
