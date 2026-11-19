import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const radice = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const ENV = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };
const leggi = (p: string): string => readFileSync(resolve(radice, p), 'utf8');

const SCRIPT_DEV = `
const m = await import('@x9-forge/contracts/capability/dev');
const e = await import('@x9-forge/contracts/http/endpoints/index');
console.log(JSON.stringify({
  tools: m.DEV_GENERIC_JOB_TOOLS,
  job: typeof m.DevGenericJobSchema?.parse,
  claim: typeof m.selectDevGenericClaim,
  old: typeof m.DevProductionJobSchema?.parse,
  contracts: [e.claimDevGenericJobContract, e.heartbeatDevGenericJobContract, e.completeDevGenericJobContract].map((c) => typeof c),
}));
`;
const SCRIPT_CJS = `
const { createRequire } = require('node:module');
const r = createRequire(process.cwd() + '/package.json');
const m = r('@x9-forge/contracts/capability/dev');
const e = r('@x9-forge/contracts/http/endpoints/index');
console.log(JSON.stringify({
  tools: m.DEV_GENERIC_JOB_TOOLS,
  job: typeof m.DevGenericJobSchema?.parse,
  claim: typeof m.selectDevGenericClaim,
  old: typeof m.DevProductionJobSchema?.parse,
  contracts: [e.claimDevGenericJobContract, e.heartbeatDevGenericJobContract, e.completeDevGenericJobContract].map((c) => typeof c),
}));
`;
const ATTESO = {
  tools: ['mlx_whisper', 'claude_p', 'ig_collect'],
  job: 'function',
  claim: 'function',
  old: 'function',
  contracts: ['object', 'object', 'object'],
};

function esegui(args: string[]): unknown {
  return JSON.parse(execFileSync(process.execPath, args, { cwd: radice, env: ENV, encoding: 'utf8' }));
}

describe('s3615 generic executor job is in the built package', () => {
  const versione = (JSON.parse(leggi('package.json')) as { version: string }).version;
  const changelog = leggi('CHANGELOG.md');

  it('s3615 package version equals the first changelog entry', () => {
    const prima = /^## v(\d+\.\d+\.\d+)/m.exec(changelog)?.[1];
    expect(prima).toBe(versione);
  });

  it('s3615 ESM exposes the generic job and channel names', () => {
    expect(esegui(['--input-type=module', '-e', SCRIPT_DEV])).toEqual(ATTESO);
  });

  it('s3615 CommonJS exposes the same names', () => {
    expect(esegui(['-e', SCRIPT_CJS])).toEqual(ATTESO);
  });

  it('s3615 the narrow imports map carries the package version', () => {
    const mappa = JSON.parse(leggi('dist/narrow-imports.json')) as { versione: string };
    expect(mappa.versione).toBe(versione);
  });

  it('s3615 first entry under Non rilasciato is the new one, followed by v1.227.0 line', () => {
    const dopo = changelog.split('## Non rilasciato')[1] ?? '';
    const titoli = dopo.match(/^## v\d+\.\d+\.\d+/gm) ?? [];
    expect(titoli[0]).toBe(`## v${versione}`);
    expect(titoli).toContain('## v1.227.0');
    expect(titoli.indexOf('## v1.227.0')).toBeGreaterThan(0);
  });
});
