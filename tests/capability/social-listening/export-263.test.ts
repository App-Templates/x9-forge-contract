import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const radice = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const ENV = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };
const SUB = '@x9-forge/contracts/capability/social-listening';
const NOMI = [
  'SOCIAL_JOB_RESULT_ERRORS',
  'SocialJobResultErrorSchema',
  'readSocialGenericJob',
  'readSocialGenericOutput',
  'selectSocialRound',
  'SocialRoundQuerySchema',
  'SocialRoundReadResponseSchema',
  'socialRoundPath',
  'socialRoundReadContract',
];

function node(script: string): string {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: radice,
    env: ENV,
    encoding: 'utf8',
  }).trim();
}

const PROVA = `
const m = SPEC;
const ok = JSON.stringify(m.SOCIAL_JOB_RESULT_ERRORS) === JSON.stringify(['kind_mismatch', 'post_mismatch', 'topic_mismatch', 'job_not_running'])
  && m.SocialJobResultErrorSchema.safeParse('job_not_running').success === true
  && m.SocialJobResultErrorSchema.safeParse('altro').success === false
  && ['readSocialGenericJob', 'readSocialGenericOutput', 'selectSocialRound'].every((n) => typeof m[n] === 'function')
  && typeof m.SocialRoundQuerySchema.safeParse === 'function'
  && typeof m.SocialRoundReadResponseSchema.safeParse === 'function'
  && m.socialRoundPath('agente-1') === '/internal/capability/agents/agente-1/social-listening/round'
  && m.socialRoundReadContract.method === 'GET'
  && m.socialRoundReadContract.authType === 'secret'
  && typeof m.SOCIAL_LISTENING_TOOLS === 'object'
  && typeof m.socialCapDecision === 'function';
console.log(ok ? 'OK' : 'KO');
`;

describe('s3630 social-listening 1.263.0 in the built package', () => {
  it('s3630 (a) package.json has version 1.263.0', () => {
    const pkg = JSON.parse(readFileSync(resolve(radice, 'package.json'), 'utf8')) as { version: string };
    const [maggiore, minore] = pkg.version.split('.').map(Number);
    expect(maggiore).toBe(1);
    expect(minore).toBeGreaterThanOrEqual(260);
    expect(minore).toBeLessThanOrEqual(269);
    expect(pkg.version).toBe('1.263.0');
  });

  it('s3630 (b) the new symbols import from ESM', () => {
    expect(node(PROVA.replace('SPEC', `await import('${SUB}')`))).toBe('OK');
  });

  it('s3630 (b) the new symbols import from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${PROVA.replace('SPEC', `require('${SUB}')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s3630 (c) the narrow imports map carries the version and the nine symbols', () => {
    const mappa = JSON.parse(readFileSync(resolve(radice, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    expect(mappa.versione).toBe('1.263.0');
    const testo = JSON.stringify(mappa);
    const blocco = findBlock(mappa, SUB);
    expect(blocco, testo.slice(0, 80)).toBeDefined();
    for (const nome of NOMI) {
      const sub = blocco![nome];
      expect(typeof sub, nome).toBe('string');
      expect(sub, nome).toMatch(/\/(routes|job-io)$/);
    }
  });

  it('s3630 (d) the CHANGELOG has v1.263.0 above v1.262.0 and names the task and symbols', () => {
    const testo = readFileSync(resolve(radice, 'CHANGELOG.md'), 'utf8');
    const nuova = testo.indexOf('## v1.263.0');
    expect(nuova).toBeGreaterThan(-1);
    expect(nuova).toBeLessThan(testo.indexOf('## v1.262.0'));
    const voce = testo.slice(nuova, testo.indexOf('## v1.262.0'));
    for (const t of ['3616', 'readSocialGenericJob', 'socialRoundReadContract']) expect(voce).toContain(t);
  });

  it('s3630 (e) the 1.262.0 symbols are still exported', () => {
    expect(node(`const m = await import('${SUB}');
console.log(typeof m.SOCIAL_LISTENING_TOOLS === 'object' && typeof m.socialCapDecision === 'function' ? 'OK' : 'KO');`)).toBe('OK');
  });
});

function findBlock(obj: unknown, key: string): Record<string, string> | undefined {
  if (obj && typeof obj === 'object') {
    const o = obj as Record<string, unknown>;
    if (key in o && o[key] && typeof o[key] === 'object') return o[key] as Record<string, string>;
    for (const v of Object.values(o)) {
      const r = findBlock(v, key);
      if (r) return r;
    }
  }
  return undefined;
}
