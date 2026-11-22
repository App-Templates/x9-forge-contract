import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { AssetKeySchema } from '../../src/organization/asset.js';
import { DeliveryPackageSchema, deliveryPackagePaths, deliveryPackagePieceProblems } from '../../src/organization/delivery-package.js';

// CONSEGNA.json of R67 (consegna/67, dbed2995), the whole redo of Dispensa Pronta delivered without pieces.
const r67 = JSON.parse(readFileSync(new URL('./delivery-package-s8492-r67-consegna.json', import.meta.url), 'utf8'));
const screens: string[] = r67.keyScreens.map((s: { path: string }) => s.path);
const problemsOf = (pkg: Parameters<typeof deliveryPackagePieceProblems>[0], keys: string[]) => deliveryPackagePieceProblems(pkg, keys);

describe('s8492 pacchetto con piu pezzi', () => {
  it('s8492 regressione-r67-anteprima-e-schermate-di-ogni-pezzo', () => {
    // Today the package cannot say which screens show which piece: one email for a redo cannot show each piece.
    const pieces = [
      { key: 'stati-di-sistema', preview: r67.preview.path, keyScreens: screens.slice(0, 2) },
      { key: 'catalogo', preview: r67.preview.path, keyScreens: screens.slice(2, 4) },
    ];
    const parsed = DeliveryPackageSchema.safeParse({ ...r67, pieces });
    expect(parsed.success).toBe(true);
    expect(problemsOf(parsed.data!, ['stati-di-sistema', 'catalogo'])).toEqual([]);
    expect(problemsOf(parsed.data!, ['stati-di-sistema', 'catalogo', 'ricette'])).toEqual([{ key: 'ricette', missing: ['anteprima', 'schermate'] }]);
    // R67 as delivered, asked for two pieces: neither can be shown on its own.
    expect(problemsOf(DeliveryPackageSchema.parse(r67), ['stati-di-sistema', 'catalogo'])).toEqual([
      { key: 'stati-di-sistema', missing: ['anteprima', 'schermate'] }, { key: 'catalogo', missing: ['anteprima', 'schermate'] },
    ]);
    // The attachments do not change: a piece only points at files the package already lists.
    expect(deliveryPackagePaths(parsed.data!)).toEqual(deliveryPackagePaths(DeliveryPackageSchema.parse(r67)));
  });

  it('s8492 pezzo-con-file-fuori-dal-pacchetto-rifiutato', () => {
    const bad = (piece: object) => DeliveryPackageSchema.safeParse({ ...r67, pieces: [piece] }).success;
    expect(bad({ key: 'catalogo', preview: 'design/altro.html', keyScreens: [screens[0]] })).toBe(false);
    expect(bad({ key: 'catalogo', preview: r67.preview.path, keyScreens: ['design/altro.png'] })).toBe(false);
    expect(bad({ key: 'catalogo', preview: r67.preview.path, keyScreens: [] })).toBe(false);
    // The piece key follows AssetKeySchema exactly (kept local to avoid an import cycle).
    for (const key of ['catalogo', 'a'.repeat(40), 'a'.repeat(41), 'Catalogo', 'stati--sistema', '-x', 'x-']) {
      expect(bad({ key, preview: r67.preview.path, keyScreens: [screens[0]] }), key).toBe(AssetKeySchema.safeParse(key).success);
    }
    expect(bad({ key: 'Catalogo', preview: r67.preview.path, keyScreens: [screens[0]] })).toBe(false);
    expect(DeliveryPackageSchema.safeParse({ ...r67, pieces: [
      { key: 'catalogo', preview: r67.preview.path, keyScreens: [screens[0]] },
      { key: 'catalogo', preview: r67.preview.path, keyScreens: [screens[1]] },
    ] }).success).toBe(false);
    expect(bad({ key: 'catalogo', preview: 'design/NOTA.md', keyScreens: [screens[0]] })).toBe(false);
  });

  it('s8492 pacchetto-salvato-r67-con-un-pezzo-resta-uguale', () => {
    // R-37: the saved package reads the same and a single piece keeps today's rules.
    expect(DeliveryPackageSchema.parse(r67)).toEqual(r67);
    expect(problemsOf(DeliveryPackageSchema.parse(r67), ['stati-di-sistema'])).toEqual([]);
  });
});
