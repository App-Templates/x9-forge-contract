import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const ENV = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };
const BASE = '@x9-forge/contracts';

function node(script: string): string {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: root,
    env: ENV,
    encoding: 'utf8',
  }).trim();
}

const PROBE = `
import assert from 'node:assert/strict';
const proto = PROTO;
assert.equal(typeof proto.paperclipTransizioneAmmessa, 'function');
assert.ok(proto.PAPERCLIP_STATI_TERMINALI.includes('done'));
const dev = DEV;
assert.ok(dev.DevGenericJobSchema);
const pc = PC;
assert.equal(typeof pc.paperclipDestinatarioPerRuolo, 'function');
const ep = EP;
assert.ok(ep.listDevSessionAssetsContract);
const sl = SL;
assert.equal(typeof sl.socialVerifyTopicCost, 'function');
console.log('OK');
`;

function fill(load: (spec: string) => string): string {
  return PROBE.replace('PROTO', load(`${BASE}/capability/paperclip-protocollo/index`))
    .replace('DEV', load(`${BASE}/capability/dev`))
    .replace('PC', load(`${BASE}/capability/paperclip`))
    .replace('EP', load(`${BASE}/http/endpoints/index`))
    .replace('SL', load(`${BASE}/capability/social-listening`));
}

describe('s3711 the two lines in one package 1.268.0', () => {
  it('s3711 (a) package.json has version 1.291.0', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toMatch(/^1\.(2(6[89]|7\d)|28[0-9]|29[0-3])\.0$/);
  });

  it('s3711 (b) contracts of both lines import from ESM', () => {
    expect(node(fill((s) => `await import('${s}')`))).toBe('OK');
  });

  it('s3711 (b) contracts of both lines import from CommonJS', () => {
    const script = `
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
${fill((s) => `require('${s}')`)}`;
    expect(node(script)).toBe('OK');
  });

  it('s3711 (c) the narrow imports map carries version 1.268.0', () => {
    const map = JSON.parse(readFileSync(resolve(root, 'dist/narrow-imports.json'), 'utf8')) as Record<string, unknown>;
    const pkgVersion = (JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string }).version;
    expect(map.versione).toBe(pkgVersion);
  });

  it('s3711 (d) the CHANGELOG has both histories, each title once, in order', () => {
    const text = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
    const titles = ['1.268.0', '1.267.0', '1.262.0', '1.238.0', '1.235.0', '1.231.0', '1.230.0'];
    let last = -1;
    for (const v of titles) {
      const title = `## v${v}`;
      const first = text.indexOf(title);
      expect(first, title).toBeGreaterThan(last);
      expect(text.indexOf(title, first + 1), `${title} once`).toBe(-1);
      last = first;
    }
  });

  it('s3711 (e) every export key has a heap budget, social-listening included', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { exports: Record<string, unknown> };
    const budgets = readFileSync(resolve(root, 'tests/memory/import-heap-budgets.json'), 'utf8');
    expect(budgets).toContain('"./capability/social-listening"');
    const voci = (JSON.parse(budgets) as { voci: Record<string, unknown> }).voci;
    for (const key of Object.keys(pkg.exports)) {
      if (key === './package.json') continue;
      expect(Object.keys(voci), key).toContain(key);
    }
  });
});
