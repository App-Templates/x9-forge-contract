import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
// @ts-expect-error lo strumento è un .mjs senza tipi
import { misuraSottopercorsi } from '../../scripts/import-heap.mjs';

interface Misura {
  chiave: string;
  file: string;
  heapMb: number;
  moduli: number;
}
interface Voce {
  heap_mb: number;
  moduli: number;
  motivo: string;
}

const radice = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const budgets = JSON.parse(readFileSync(resolve(radice, 'tests/memory/import-heap-budgets.json'), 'utf8')) as {
  voci: Record<string, Voce>;
};
const exportKeys = Object.keys(
  (JSON.parse(readFileSync(resolve(radice, 'package.json'), 'utf8')) as { exports: Record<string, unknown> }).exports,
);

let misure: Misura[] = [];

describe('s5894 import heap per subpath', () => {
  beforeAll(async () => {
    misure = (await misuraSottopercorsi({ radice })) as Misura[];
  }, 100_000);

  it('s5894 every export of package.json has a budget and every budget names an export', () => {
    const senzaTetto = exportKeys.filter((k) => !(k in budgets.voci));
    const senzaChiave = Object.keys(budgets.voci).filter((k) => !exportKeys.includes(k));
    expect({ senzaTetto, senzaChiave }).toEqual({ senzaTetto: [], senzaChiave: [] });
    expect(misure.map((m) => m.chiave).sort()).toEqual([...exportKeys].sort());
  });

  it('s5894 every subpath loads within its heap and module budget', () => {
    const fuori = misure
      .filter((m) => {
        const tetto = budgets.voci[m.chiave];
        return !tetto || m.heapMb > tetto.heap_mb || m.moduli > tetto.moduli;
      })
      .map((m) => {
        const tetto = budgets.voci[m.chiave];
        return `${m.chiave}: ${m.heapMb} MB / ${m.moduli} moduli contro ${tetto?.heap_mb ?? 'nessun tetto'} MB / ${tetto?.moduli ?? '-'}`;
      });
    expect(fuori, fuori.join('\n')).toEqual([]);
  });

  it('s5894 no budget is looser than its measure by more than 25% plus 1 MB', () => {
    const larghi = misure
      .filter((m) => {
        const tetto = budgets.voci[m.chiave];
        return tetto !== undefined && tetto.heap_mb > m.heapMb * 1.25 + 1;
      })
      .map((m) => `${m.chiave}: tetto ${budgets.voci[m.chiave]?.heap_mb} MB, misura ${m.heapMb} MB`);
    expect(larghi, larghi.join('\n')).toEqual([]);
  });

  it('s5894 the probe isolates zod and counts modules', () => {
    const auth = misure.find((m) => m.chiave === './auth');
    expect(auth).toBeDefined();
    expect(auth?.heapMb).toBeLessThan(1);
    expect(auth?.moduli).toBe(3);
  });
});
