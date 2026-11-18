import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const cleanEnv = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };
const capabilityExports = [
  'paperclipCommentoPiuRecente',
  'paperclipIdentificatoriNudi',
  'paperclipTurnoSoloDisposizione',
  'paperclipWakeReasonKind',
  'paperclipWakeEndsChildWait',
  'PaperclipCursoreCommentiSchema',
  'PaperclipAllegatoCaricaSchema',
  'classifyPaperclipWakeAnswer',
  'paperclipWakeIdempotencyKey',
  'paperclipProdottoDaAllegato',
];
const paperclipExports = [
  'paperclipDestinatarioPerRuolo',
  'decidePaperclipAsk',
  'PaperclipAddressedAskSchema',
  'PaperclipIssueStatusSchema',
];
const dispositionExports = ['turnFailRun', 'TURN_FAILURE_CAUSES'];

function packageVersion(): string {
  return (JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string }).version;
}

function runtimeExports(mode: 'esm' | 'cjs', specifier: string): string[] {
  const script = mode === 'esm'
    ? 'const m = await import(process.argv[1]); process.stdout.write(JSON.stringify(Object.keys(m)));'
    : 'process.stdout.write(JSON.stringify(Object.keys(require(process.argv[1]))));';
  const args = mode === 'esm' ? ['--input-type=module', '-e', script, specifier] : ['-e', script, specifier];
  return JSON.parse(execFileSync(process.execPath, args, {
    cwd: root,
    env: cleanEnv,
    encoding: 'utf8',
  })) as string[];
}

describe('s7420 pacchetto-1-236-0', () => {
  it('s7420_version: package and first CHANGELOG release are 1.236.0', () => {
    const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const firstRelease = /^## v(\d+\.\d+\.\d+)/m.exec(changelog)?.[1];
    expect(changelog).toContain('## v1.236.0');
    expect(packageVersion()).toBe(firstRelease);
  });

  it('s7420_esm: built contracts are exported with a clean environment', () => {
    expect(runtimeExports('esm', '@x9-forge/contracts/capability')).toEqual(expect.arrayContaining(capabilityExports));
    expect(runtimeExports('esm', '@x9-forge/contracts/capability/paperclip')).toEqual(expect.arrayContaining(paperclipExports));
    expect(runtimeExports('esm', './dist/capability/paperclip/turn-disposition.js')).toEqual(expect.arrayContaining(dispositionExports));
  });

  it('s7420_cjs: built contracts are exported with a clean environment', () => {
    expect(runtimeExports('cjs', '@x9-forge/contracts/capability')).toEqual(expect.arrayContaining(capabilityExports));
    expect(runtimeExports('cjs', '@x9-forge/contracts/capability/paperclip')).toEqual(expect.arrayContaining(paperclipExports));
    expect(runtimeExports('cjs', './dist/capability/paperclip/turn-disposition.cjs')).toEqual(expect.arrayContaining(dispositionExports));
  });

  it('s7420_map: narrow imports map matches the package version', () => {
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as { versione: string };
    expect(map.versione).toBe(packageVersion());
  });
});
