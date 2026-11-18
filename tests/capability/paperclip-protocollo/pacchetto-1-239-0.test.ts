import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const cleanEnv = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };

function packageVersion(): string {
  return (JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string }).version;
}

function loadSection(mode: 'esm' | 'cjs'): string {
  const body = 'process.stdout.write(m.communicationSection());';
  const script = mode === 'esm'
    ? `const m = await import('./dist/capability/paperclip/communication-channels.js'); ${body}`
    : `const m = require('./dist/capability/paperclip/communication-channels.cjs'); ${body}`;
  const args = mode === 'esm' ? ['--input-type=module', '-e', script] : ['-e', script];
  return execFileSync(process.execPath, args, {
    cwd: root,
    env: cleanEnv,
    encoding: 'utf8',
  });
}

describe('s7427 pacchetto-1-239-0', () => {
  it('s7427_version: package and first CHANGELOG release are 1.239.0', () => {
    const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const firstRelease = /^## v(\d+\.\d+\.\d+)/m.exec(changelog)?.[1];
    expect(firstRelease).toBe('1.239.0');
    expect(packageVersion()).toBe(firstRelease);
  });

  for (const mode of ['esm', 'cjs'] as const) {
    it(`s7427_${mode}: built channels describe system delivery with a clean environment`, () => {
      const section = loadSection(mode);
      expect(section).toContain("li porta il sistema sull'incarico alla chiusura");
      expect(section).toContain('sessione di sviluppo');
      expect(section).not.toContain('lo lego al mio commento');
      expect(section).not.toContain('reopen');
    });
  }

  it('s7427_map: narrow imports map matches the package version', () => {
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as { versione: string };
    expect(map.versione).toBe(packageVersion());
  });
});
