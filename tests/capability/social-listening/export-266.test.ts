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
  m.socialTopicTitleIssue('Come Emergent') === 'too_few_words' &&
  m.socialCostPerPost({ spentUsd: 0.3, postsSeen: 4 }) === 0.075 &&
  m.SocialJobInputSchema.safeParse({ kind: 'verify', topicId: 't', knownFacts: [] }).success === true;
console.log(ok ? 'OK' : 'KO');
`;

describe('s3676 social-listening 1.266.0 in the built package', () => {
  it('s3676 (a) package.json has version 1.266.0', () => {
    const pkg = JSON.parse(readFileSync(resolve(radice, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.26[6-9]\.0$/);
  });

  it('s3676 (b) the optimized round rules import from ESM', () => {
    expect(node(PROVA.replace('SPEC', `await import('${SUB}')`))).toBe('OK');
  });

  it('s3676 (b) the optimized round rules import from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${PROVA.replace('SPEC', `require('${SUB}')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s3676 (c) the narrow imports map carries version 1.266.0', () => {
    const mappa = JSON.parse(readFileSync(resolve(radice, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    const pkg = JSON.parse(readFileSync(resolve(radice, 'package.json'), 'utf8')) as { version: string };
    expect(mappa.versione).toBe(pkg.version);
  });

  it('s3676 (d) the CHANGELOG has v1.266.0 above v1.265.0 and names the symbols', () => {
    const testo = readFileSync(resolve(radice, 'CHANGELOG.md'), 'utf8');
    const nuova = testo.indexOf('## v1.266.0');
    expect(nuova).toBeGreaterThan(-1);
    expect(nuova).toBeLessThan(testo.indexOf('## v1.265.0'));
    const voce = testo.slice(nuova, testo.indexOf('## v1.265.0'));
    expect(voce).toContain('socialGroupResultIssues');
    expect(voce).toContain('knownFacts');
  });
});
