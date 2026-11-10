import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, relative, sep } from 'node:path';
import { spawn } from 'node:child_process';

const PROBE = `
import { registerHooks } from 'node:module';
import { pathToFileURL } from 'node:url';
let contati = 0;
registerHooks({
  load(url, context, next) {
    if (url.includes('/dist/')) contati += 1;
    return next(url, context);
  },
});
await import('zod');
globalThis.gc();
const base = process.memoryUsage().heapUsed;
contati = 0;
await import(pathToFileURL(process.argv[1]).href);
globalThis.gc();
const heap = process.memoryUsage().heapUsed - base;
process.stdout.write(JSON.stringify({ heapMb: Math.round(heap / 1048576 * 10) / 10, moduli: contati }));
`;

async function filesUnder(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await filesUnder(full)));
    else out.push(full);
  }
  return out;
}

function importTarget(value) {
  if (typeof value === 'string') return value;
  return value?.import ?? value?.default ?? null;
}

// Una chiave per voce di `exports`; una chiave con `*` vale tutti i file dist che il modello raggiunge,
// tolti quelli già bersaglio di una chiave esatta.
async function expandExports(radice, chiavi) {
  const pkg = JSON.parse(await readFile(resolve(radice, 'package.json'), 'utf8'));
  const voci = Object.entries(pkg.exports).filter(([chiave]) => !chiavi || chiavi.includes(chiave));
  const exact = new Set();
  for (const [chiave, value] of Object.entries(pkg.exports)) {
    const target = importTarget(value);
    if (target && !chiave.includes('*')) exact.add(resolve(radice, target));
  }
  const result = [];
  for (const [chiave, value] of voci) {
    const target = importTarget(value);
    if (!target) continue;
    if (!chiave.includes('*') && !target.includes('*')) {
      result.push({ chiave, files: [resolve(radice, target)] });
      continue;
    }
    const [prefix, suffix] = target.split('*');
    const base = resolve(radice, prefix);
    const all = await filesUnder(dirname(base + 'x')).catch(() => []);
    const files = all.filter((f) => f.startsWith(base) && f.endsWith(suffix) && !exact.has(f));
    result.push({ chiave, files });
  }
  return result;
}

function misuraFile(radice, file) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      process.execPath,
      ['--expose-gc', '--input-type=module', '-e', PROBE, file],
      { cwd: radice, env: { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' } },
    );
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) return reject(new Error(`misura di ${file} fallita (${code}): ${err.trim().split('\n').slice(-5).join('\n')}`));
      try {
        resolvePromise(JSON.parse(out));
      } catch {
        reject(new Error(`uscita non valida per ${file}: ${out}`));
      }
    });
  });
}

async function inParallelo(compiti, parallelo) {
  const risultati = new Array(compiti.length);
  let prossimo = 0;
  async function lavora() {
    while (prossimo < compiti.length) {
      const i = prossimo++;
      risultati[i] = await compiti[i]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(parallelo, compiti.length) }, lavora));
  return risultati;
}

export async function misuraSottopercorsi({ radice, chiavi, parallelo = 4 }) {
  const voci = await expandExports(radice, chiavi);
  const compiti = voci.flatMap(({ chiave, files }) =>
    files.map((file) => async () => ({ chiave, file, ...(await misuraFile(radice, file)) })),
  );
  const misure = await inParallelo(compiti, parallelo);
  const perChiave = new Map();
  for (const m of misure) {
    const peggiore = perChiave.get(m.chiave);
    if (!peggiore || m.heapMb > peggiore.heapMb) perChiave.set(m.chiave, m);
  }
  return voci
    .filter(({ chiave }) => perChiave.has(chiave))
    .map(({ chiave }) => {
      const m = perChiave.get(chiave);
      return { chiave, file: relative(radice, m.file).split(sep).join('/'), heapMb: m.heapMb, moduli: m.moduli };
    });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const radice = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  console.log(JSON.stringify(await misuraSottopercorsi({ radice }), null, 2));
}
