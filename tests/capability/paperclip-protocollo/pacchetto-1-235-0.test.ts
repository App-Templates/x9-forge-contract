import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const radice = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const NOME = '@x9-forge/contracts';
const ENV = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };
const VERSIONE = '1.235.0';

const NOMI_CAPABILITY = [
  'paperclipPercorsoSenzaPrefisso',
  'paperclipTransizioneAmmessa',
  'paperclipEsitoCreazione',
  'paperclipRipresaAmmessa',
  'paperclipCorsaPuoScrivere',
  'PaperclipDocumentoChiaveSchema',
  'PaperclipApprovalCreaCorpoSchema',
  'PaperclipAgentIdSchema',
];
const NOMI_PAPERCLIP = ['PaperclipAgentIdSchema', 'PaperclipIssueStatusSchema'];

function versionePacchetto(): string {
  return (JSON.parse(readFileSync(resolve(radice, 'package.json'), 'utf8')) as { version: string }).version;
}

function esporta(modo: 'esm' | 'cjs', sub: string): string[] {
  const args =
    modo === 'esm'
      ? ['--input-type=module', '-e', `const m = await import('${NOME}/${sub}'); console.log(JSON.stringify(Object.keys(m)));`]
      : ['-e', `console.log(JSON.stringify(Object.keys(require('${NOME}/${sub}'))));`];
  const out = execFileSync(process.execPath, args, { cwd: radice, env: ENV, encoding: 'utf8' });
  return JSON.parse(out.trim().split('\n').pop() ?? '[]') as string[];
}

describe('s7408 pacchetto-1-235-0', () => {
  it('s7408_versione: package.json e prima voce del CHANGELOG sono 1.235.0', () => {
    const changelog = readFileSync(resolve(radice, 'CHANGELOG.md'), 'utf8');
    const prima = /^## v(\d+\.\d+\.\d+)/m.exec(changelog)?.[1];
    expect(prima).toBe(VERSIONE);
    expect(versionePacchetto()).toBe(prima);
  });

  it('s7408_esm: i nomi nuovi sono importabili da ESM', () => {
    expect(esporta('esm', 'capability')).toEqual(expect.arrayContaining(NOMI_CAPABILITY));
    expect(esporta('esm', 'capability/paperclip')).toEqual(expect.arrayContaining(NOMI_PAPERCLIP));
  });

  it('s7408_cjs: i nomi nuovi sono importabili da CommonJS', () => {
    expect(esporta('cjs', 'capability')).toEqual(expect.arrayContaining(NOMI_CAPABILITY));
    expect(esporta('cjs', 'capability/paperclip')).toEqual(expect.arrayContaining(NOMI_PAPERCLIP));
  });

  it('s7408_mappa: dist/narrow-imports.json porta la versione di package.json', () => {
    const mappa = JSON.parse(readFileSync(resolve(radice, 'dist/narrow-imports.json'), 'utf8')) as { versione: string };
    expect(mappa.versione).toBe(versionePacchetto());
  });
});
