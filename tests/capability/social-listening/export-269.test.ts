import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const ENV = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };
const SPEC = '@x9-forge/contracts/capability/paperclip/communication-channels';

function node(script: string): string {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: root,
    env: ENV,
    encoding: 'utf8',
  }).trim();
}

const CHECK = `
import assert from 'node:assert/strict';
const text = MOD.communicationSection();
assert.ok(text.includes('li porta il sistema sull\\'incarico alla chiusura'));
assert.ok(text.includes('sessione di sviluppo'));
for (const bad of ['lo lego al mio commento', 'carico il file', 'registro il file', 'reopen']) {
  assert.ok(!text.includes(bad), bad);
}
console.log('OK');
`;

describe('s3714 the channels text in package 1.269.0', () => {
  it('s3714 (a) package.json has version 1.289.0', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.(2(69|7\d)|28[0-9])\.0$/);
  });

  it('s3714 (b) the channels text is the new one from ESM', () => {
    expect(node(CHECK.replace('MOD', `(await import('${SPEC}'))`))).toBe('OK');
  });

  it('s3714 (b) the channels text is the new one from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${CHECK.replace('MOD', `require('${SPEC}')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s3714 (c) the narrow imports map carries version 1.269.0', () => {
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    expect(map.versione).toBe((JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string }).version);
  });

  it('s3714 (d) the CHANGELOG has v1.269.0 once above v1.268.0, naming 7426, no v1.239.0', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const t = '## v1.269.0';
    const first = text.indexOf(t);
    expect(first).toBeGreaterThan(-1);
    expect(text.indexOf(t, first + 1)).toBe(-1);
    const prev = text.indexOf('## v1.268.0');
    expect(prev).toBeGreaterThan(first);
    expect(text.slice(first, prev)).toContain('7426');
    expect(text).not.toContain('## v1.239.0');
  });
});
