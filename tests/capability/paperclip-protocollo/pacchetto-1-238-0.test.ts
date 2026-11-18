import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const cleanEnv = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };
const exportedNames = ['listDevSessionAssetsContract', 'DevSessionAssetsListResponseSchema', 'DEV_SESSION_ASSETS_LIST_MAX'];

function packageVersion(): string {
  return (JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string }).version;
}

function loadList(mode: 'esm' | 'cjs'): { names: string[]; max: unknown } {
  const body = "process.stdout.write(JSON.stringify({ names: Object.keys(m), max: m.DEV_SESSION_ASSETS_LIST_MAX }));";
  const script = mode === 'esm'
    ? `const m = await import('./dist/http/endpoints/internal-dev-session-assets-list.js'); ${body}`
    : `const m = require('./dist/http/endpoints/internal-dev-session-assets-list.cjs'); ${body}`;
  const args = mode === 'esm' ? ['--input-type=module', '-e', script] : ['-e', script];
  return JSON.parse(execFileSync(process.execPath, args, {
    cwd: root,
    env: cleanEnv,
    encoding: 'utf8',
  })) as { names: string[]; max: unknown };
}

describe('s7425 pacchetto-1-238-0', () => {
  it('s7425_version: package and first CHANGELOG release are 1.238.0', () => {
    const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const firstRelease = /^## v(\d+\.\d+\.\d+)/m.exec(changelog)?.[1];
    expect(firstRelease).toBe('1.238.0');
    expect(packageVersion()).toBe(firstRelease);
  });

  it('s7425_esm: the assets list contract is exported with a clean environment', () => {
    const { names, max } = loadList('esm');
    expect(names).toEqual(expect.arrayContaining(exportedNames));
    expect(max).toBe(60);
  });

  it('s7425_cjs: the assets list contract is exported with a clean environment', () => {
    const { names, max } = loadList('cjs');
    expect(names).toEqual(expect.arrayContaining(exportedNames));
    expect(max).toBe(60);
  });

  it('s7425_map: narrow imports map matches the package version', () => {
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as { versione: string };
    expect(map.versione).toBe(packageVersion());
  });
});
