import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const radice = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const NOME = '@x9-forge/contracts';
const ENV = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' };

// Le chiavi di prima della 1.122.0 e il file `dist` ESM a cui puntavano.
const CHIAVI_DI_OGGI: [string, string][] = [
  ['.', 'index.js'],
  ['./auth', 'auth/index.js'],
  ['./agent', 'agent/index.js'],
  ['./capability', 'capability/index.js'],
  ['./capability/dev', 'capability/dev/index.js'],
  ['./voice', 'capability/voice/index.js'],
  ['./capability/stt', 'capability/stt/index.js'],
  ['./capability/tts', 'capability/tts/index.js'],
  ['./capability/voice-live', 'capability/voice-live/index.js'],
  ['./capability/ricerca', 'capability/ricerca/index.js'],
  ['./capability/lab', 'capability/lab/index.js'],
  ['./capability/video', 'capability/video/index.js'],
  ['./http', 'http/index.js'],
  ['./memory', 'memory/index.js'],
  ['./organization', 'organization/index.js'],
  ['./organization/business-unit-lead', 'organization/business-unit-lead.js'],
  ['./organization/business-unit-type', 'organization/business-unit-type.js'],
  ['./messaging', 'messaging/index.js'],
  ['./model-router', 'model-router/index.js'],
  ['./rag', 'rag/index.js'],
  ['./vault', 'vault/index.js'],
  ['./capability/parameters', 'capability/parameters.js'],
  ['./capability/presentation', 'capability/presentation.js'],
  ['./capability/paperclip', 'capability/paperclip/index.js'],
];

const MODULI_STRETTI = [
  'http/endpoints/internal-paperclip-seats',
  'capability/tool-call',
  'organization/business-unit-lead',
  'model-router/model-catalog',
];

function node(script: string, args: string[] = []): string {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script, ...args], {
    cwd: radice,
    env: ENV,
    encoding: 'utf8',
  });
}

describe('s5895 narrow subpaths', () => {
  it('s5895 every domain folder of src has its narrow subpath', () => {
    const cartelle = readdirSync(resolve(radice, 'src'), { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
    const exportsPkg = (JSON.parse(readFileSync(resolve(radice, 'package.json'), 'utf8')) as {
      exports: Record<string, { types: string; import: string; require: string }>;
    }).exports;
    const senza = cartelle.filter((d) => !(`./${d}/*` in exportsPkg));
    expect(senza).toEqual([]);
    for (const d of cartelle) {
      const voce = exportsPkg[`./${d}/*`]!;
      expect(voce).toEqual({
        types: `./dist/${d}/*.d.cts`,
        import: `./dist/${d}/*.js`,
        require: `./dist/${d}/*.cjs`,
      });
      const modulo = readdirSync(resolve(radice, 'dist', d)).find((f) => f.endsWith('.js') && f !== 'index.js');
      expect(modulo, `nessun modulo in dist/${d}`).toBeDefined();
      const risolto = node(
        'process.stdout.write(import.meta.resolve(process.argv[1]))',
        [`${NOME}/${d}/${modulo!.slice(0, -3)}`],
      );
      expect(risolto.endsWith(`/dist/${d}/${modulo}`)).toBe(true);
    }
  });

  it('s5895 a narrow subpath gives the same object as the barrel', () => {
    const esm = JSON.parse(
      node(
        `const fuori = {};
for (const sotto of JSON.parse(process.argv[1])) {
  const dominio = sotto.split('/')[0];
  const stretto = await import(process.argv[2] + '/' + sotto);
  const barile = await import(process.argv[2] + '/' + dominio);
  const nomi = Object.keys(stretto);
  fuori[sotto] = { nomi: nomi.length, diversi: nomi.filter((n) => stretto[n] !== barile[n]) };
}
process.stdout.write(JSON.stringify(fuori));`,
        [JSON.stringify(MODULI_STRETTI), NOME],
      ),
    ) as Record<string, { nomi: number; diversi: string[] }>;
    for (const sotto of MODULI_STRETTI) {
      expect(esm[sotto]!.nomi, `${sotto} senza esportazioni`).toBeGreaterThan(0);
      expect(esm[sotto]!.diversi, `${sotto} (ESM)`).toEqual([]);
    }
    const cjs = JSON.parse(
      execFileSync(
        process.execPath,
        [
          '-e',
          `const fuori = {};
for (const sotto of JSON.parse(process.argv[1])) {
  const dominio = sotto.split('/')[0];
  const stretto = require(process.argv[2] + '/' + sotto);
  const barile = require(process.argv[2] + '/' + dominio);
  const nomi = Object.keys(stretto);
  fuori[sotto] = { nomi: nomi.length, diversi: nomi.filter((n) => stretto[n] !== barile[n]) };
}
process.stdout.write(JSON.stringify(fuori));`,
          JSON.stringify(MODULI_STRETTI),
          NOME,
        ],
        { cwd: radice, env: ENV, encoding: 'utf8' },
      ),
    ) as Record<string, { nomi: number; diversi: string[] }>;
    for (const sotto of MODULI_STRETTI) {
      expect(cjs[sotto]!.nomi, `${sotto} senza esportazioni`).toBeGreaterThan(0);
      expect(cjs[sotto]!.diversi, `${sotto} (CJS)`).toEqual([]);
    }
  });

  it("s5895 today's subpaths resolve to the same files", () => {
    const risolti = JSON.parse(
      node(
        `const fuori = {};
for (const chiave of JSON.parse(process.argv[1])) {
  const specificatore = chiave === '.' ? process.argv[2] : process.argv[2] + chiave.slice(1);
  fuori[chiave] = import.meta.resolve(specificatore);
}
process.stdout.write(JSON.stringify(fuori));`,
        [JSON.stringify(CHIAVI_DI_OGGI.map(([k]) => k)), NOME],
      ),
    ) as Record<string, string>;
    const diversi = CHIAVI_DI_OGGI.filter(([k, file]) => !risolti[k]!.endsWith(file.slice(1))).map(
      ([k, file]) => `${k}: atteso ${file}, risolto ${risolti[k]}`,
    );
    expect(CHIAVI_DI_OGGI).toHaveLength(24);
    expect(diversi, diversi.join('\n')).toEqual([]);
  });

  it('s5895 a narrow subpath loads only its own graph', () => {
    const moduli = Number(
      node(
        `import { registerHooks } from 'node:module';
let contati = 0;
registerHooks({
  load(url, context, next) {
    if (url.includes('/dist/')) contati += 1;
    return next(url, context);
  },
});
await import(process.argv[1]);
process.stdout.write(String(contati));`,
        [`${NOME}/http/endpoints/internal-memory-extract`],
      ),
    );
    expect(moduli).toBe(1);
  });

  it('s5895 the types of a narrow subpath exist', () => {
    const mancanti = MODULI_STRETTI.flatMap((sotto) =>
      ['.d.ts', '.d.cts'].map((ext) => `dist/${sotto}${ext}`).filter((f) => !existsSync(resolve(radice, f))),
    );
    expect(mancanti).toEqual([]);
  });
});
