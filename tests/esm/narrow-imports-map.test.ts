import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const radice = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const NOME = '@x9-forge/contracts';
const ENV = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };
const PESANTI = ['http', 'capability', 'agent', 'organization', 'model-router'].map((d) => `${NOME}/${d}`).concat(NOME);

type Mappa = { formato: string; versione: string; barili: Record<string, Record<string, string>> };
const mappa = JSON.parse(readFileSync(resolve(radice, 'dist/narrow-imports.json'), 'utf8')) as Mappa;
const pacchetto = JSON.parse(readFileSync(resolve(radice, 'package.json'), 'utf8')) as {
  version: string;
  exports: Record<string, unknown>;
};
const chiaviEsatte = Object.keys(pacchetto.exports).filter((k) => !k.includes('*'));
const specificatori = chiaviEsatte.map((k) => (k === '.' ? NOME : `${NOME}/${k.slice(2)}`));

function node(script: string, args: string[]): string {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script, ...args], {
    cwd: radice,
    env: ENV,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

describe('s5896 narrow imports map', () => {
  it('s5896 every runtime export of every barrel is in the map', () => {
    const veri = JSON.parse(
      node(
        `const fuori = {};
for (const s of JSON.parse(process.argv[1])) fuori[s] = Object.keys(await import(s)).filter((n) => n !== 'default').sort();
process.stdout.write(JSON.stringify(fuori));`,
        [JSON.stringify(specificatori)],
      ),
    ) as Record<string, string[]>;
    expect(Object.keys(mappa.barili).sort()).toEqual([...specificatori].sort());
    for (const s of specificatori) {
      expect(Object.keys(mappa.barili[s]!).sort(), s).toEqual(veri[s]);
    }
  });

  it('s5896 every narrow import gives the same object as its barrel', () => {
    const diversi = JSON.parse(
      node(
        `const fuori = {};
const mappa = JSON.parse(process.argv[1]);
for (const [barile, voci] of Object.entries(mappa)) {
  const b = await import(barile);
  const moduli = new Map();
  for (const [nome, stretto] of Object.entries(voci)) {
    if (!moduli.has(stretto)) moduli.set(stretto, await import(stretto));
    if (moduli.get(stretto)[nome] !== b[nome]) (fuori[barile] ??= []).push(nome);
  }
}
process.stdout.write(JSON.stringify(fuori));`,
        [JSON.stringify(mappa.barili)],
      ),
    ) as Record<string, string[]>;
    expect(diversi).toEqual({});
  });

  it('s5896 no entry of a heavy barrel points back to it', () => {
    for (const barile of PESANTI) {
      const voci = Object.entries(mappa.barili[barile]!);
      expect(voci.length, barile).toBeGreaterThan(0);
      expect(voci.filter(([, stretto]) => PESANTI.includes(stretto)), barile).toEqual([]);
    }
  });

  it('s5896 the map names the version of package.json', () => {
    expect(mappa.formato).toBe('x9-narrow-imports-v1');
    expect(mappa.versione).toBe(pacchetto.version);
  });

  it('s5896 the generator fails on a name it cannot place', () => {
    const tmp = mkdtempSync(resolve(tmpdir(), 'narrow-'));
    try {
      mkdirSync(resolve(tmp, 'src/http'), { recursive: true });
      mkdirSync(resolve(tmp, 'esterno'));
      writeFileSync(
        resolve(tmp, 'package.json'),
        JSON.stringify({
          name: NOME,
          version: '0.0.1',
          type: 'module',
          zshy: { exports: { './http': './src/http/index.ts' } },
          exports: { './http': {}, './http/*': {} },
        }),
      );
      writeFileSync(
        resolve(tmp, 'tsconfig.json'),
        JSON.stringify({
          compilerOptions: { target: 'ES2023', module: 'NodeNext', moduleResolution: 'NodeNext', skipLibCheck: true, noEmit: true },
          include: ['src/**/*', 'esterno/**/*'],
        }),
      );
      writeFileSync(resolve(tmp, 'esterno/fuori.ts'), 'export const fuori = 1;\n');
      const generatore = resolve(radice, 'scripts/generate-narrow-imports.mjs');
      writeFileSync(resolve(tmp, 'src/http/propria.ts'), 'export const propria = 1;\n');
      writeFileSync(resolve(tmp, 'src/http/index.ts'), "export * from './propria.js';\n");
      execFileSync(process.execPath, [generatore, '--root', tmp], { env: ENV });
      const buona = JSON.parse(readFileSync(resolve(tmp, 'dist/narrow-imports.json'), 'utf8')) as Mappa;
      expect(buona.barili[`${NOME}/http`]).toEqual({ propria: `${NOME}/http/propria` });

      writeFileSync(resolve(tmp, 'src/http/index.ts'), "export * from './propria.js';\nexport * from '../../esterno/fuori.js';\n");
      let errore = '';
      try {
        execFileSync(process.execPath, [generatore, '--root', tmp], { env: ENV, stdio: 'pipe' });
      } catch (e) {
        errore = String((e as { stderr?: Buffer }).stderr);
      }
      expect(errore).toContain('Cannot place fuori');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
