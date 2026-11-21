import { describe, expect, it } from 'vitest';
import {
  DELIVERY_PACKAGE_ATTACHMENT_MAX_BYTES,
  DELIVERY_PACKAGE_FILE_MAX_BYTES,
  DELIVERY_PACKAGE_MAX_KEY_SCREENS,
  DeliveryPackageSchema,
  deliveryPackagePaths,
} from '../../src/organization/delivery-package.js';
import {
  BUSINESS_UNIT_DELIVERY_EMAIL_DEFAULTS,
  DeliveryEmailModelSchema,
  deliveryPackageMeets,
} from '../../src/organization/business-unit-type.js';

const screens = (count: number) => Array.from({ length: count }, (_, index) => ({
  path: `schermate/schermata-${index + 1}.png`,
  caption: `Schermata ${index + 1} di Dispensa Pronta`,
}));

// Representative delivery shape from the task; the original GOO-180 manifest is unavailable.
const delivery = (count = 12) => ({
  version: 1 as const,
  title: 'Dispensa Pronta',
  forReferent: {
    whatIs: 'Il design di Dispensa Pronta.',
    whatToLook: 'Ogni schermata e il percorso della demo.',
    whatToDecide: 'Approvare il design proposto.',
    limits: ['La demo mostra il percorso senza salvare dati.'],
  },
  keyScreens: screens(count),
  overviewSheet: { path: 'schermate.pdf' },
  preview: {
    path: 'demo.html',
    walkthrough: [
      { screen: 'dispensa', caption: 'La dispensa disponibile' },
      { screen: 'prodotto', caption: 'Il dettaglio del prodotto', clickText: 'Apri prodotto' },
      { screen: 'lista-spesa', caption: 'La lista della spesa', clickText: 'Aggiungi alla lista' },
    ],
  },
});

const savedModel = { keyScreens: { min: 6, max: 8 }, overviewSheet: true, preview: true };

describe('delivery package with every contract screen', () => {
  it('s8220 pacchetto-di-dodici-schermate', () => {
    const raw = delivery();
    const pkg = DeliveryPackageSchema.parse(raw);
    expect(pkg).toEqual(raw);
    expect(deliveryPackagePaths(pkg)).toEqual([
      'schermate/schermata-1.png', 'schermate/schermata-2.png', 'schermate/schermata-3.png',
      'schermate/schermata-4.png', 'schermate/schermata-5.png', 'schermate/schermata-6.png',
      'schermate/schermata-7.png', 'schermate/schermata-8.png', 'schermate/schermata-9.png',
      'schermate/schermata-10.png', 'schermate/schermata-11.png', 'schermate/schermata-12.png',
      'schermate.pdf', 'demo.html',
    ]);
    expect(deliveryPackageMeets({ deliveryEmail: BUSINESS_UNIT_DELIVERY_EMAIL_DEFAULTS.design }, pkg, { screens: 12 }))
      .toEqual([]);
  });

  it('s8220 quaranta-si-quarantuno-no', () => {
    expect(DELIVERY_PACKAGE_MAX_KEY_SCREENS).toBe(40);
    expect(DeliveryPackageSchema.safeParse(delivery(40)).success).toBe(true);
    expect(DeliveryPackageSchema.safeParse(delivery(41)).success).toBe(false);
  });

  it('s8220 percorso-senza-comando', () => {
    const raw = delivery();
    const first = { screen: 'dispensa', caption: 'La dispensa' };
    const second = { screen: 'prodotto', caption: 'Il prodotto' };
    const parseSteps = (walkthrough: unknown) => DeliveryPackageSchema.safeParse({
      ...raw, preview: { path: 'demo.html', walkthrough },
    });
    expect(parseSteps([first, second]).success).toBe(false);
    expect(parseSteps([first, { ...second, clickText: 'Apri prodotto' }]).success).toBe(true);
    expect(parseSteps([first]).success).toBe(true);
    expect(parseSteps([first, { ...first, clickText: 'Apri di nuovo' }]).success).toBe(false);
    expect(parseSteps([{ ...first, extra: true }]).success).toBe(false);
    expect(parseSteps([]).success).toBe(false);
    const steps = Array.from({ length: 41 }, (_, index) => ({
      screen: `screen-${index}`, caption: 'Screen', clickText: 'Next',
    }));
    expect(parseSteps(steps.slice(0, 40)).success).toBe(true);
    expect(parseSteps(steps).success).toBe(false);
    expect(parseSteps([{ screen: 's'.repeat(40), caption: 'c'.repeat(140), clickText: 'x'.repeat(80) }]).success)
      .toBe(true);
    for (const step of [
      { ...first, screen: '' }, { ...first, screen: 's'.repeat(41) },
      { ...first, caption: '' }, { ...first, caption: 'c'.repeat(141) },
      { ...first, clickText: '' }, { ...first, clickText: 'x'.repeat(81) },
    ]) expect(parseSteps([step]).success).toBe(false);
  });

  it('s8220 modello-chiede-percorso-e-tutte', () => {
    const design = BUSINESS_UNIT_DELIVERY_EMAIL_DEFAULTS.design;
    expect(design).toEqual({
      keyScreens: { min: 1, max: 40 }, overviewSheet: true, preview: true, walkthrough: true,
    });
    const pkg = DeliveryPackageSchema.parse(delivery());
    expect(deliveryPackageMeets({ deliveryEmail: design }, { ...pkg, preview: { path: 'demo.html' } }))
      .toEqual(['manca il percorso della demo']);
    expect(deliveryPackageMeets({ deliveryEmail: design }, { ...pkg, keyScreens: screens(5) }, { screens: 12 }))
      .toEqual(['servono tutte le schermate del contratto: 12, ce ne sono 5']);
    expect(deliveryPackageMeets({ deliveryEmail: savedModel }, { ...pkg, keyScreens: screens(5) }))
      .toEqual(['servono almeno 6 schermate chiave, ce ne sono 5']);
    expect(deliveryPackageMeets({ deliveryEmail: savedModel }, { ...pkg, keyScreens: screens(9) }, { screens: 12 }))
      .toEqual([
        'al massimo 8 schermate chiave, ce ne sono 9',
        'servono tutte le schermate del contratto: 12, ce ne sono 9',
      ]);
    expect(deliveryPackageMeets({ deliveryEmail: design }, {
      ...pkg, keyScreens: [], overviewSheet: undefined, preview: undefined,
    }, { screens: 12 })).toEqual([
      'servono almeno 1 schermate chiave, ce ne sono 0',
      'servono tutte le schermate del contratto: 12, ce ne sono 0',
      'manca il foglio unico', "manca l'anteprima",
    ]);
  });

  it('s8220 pacchetto-salvato', () => {
    const saved = { ...delivery(2), preview: { path: 'demo.html' } };
    expect(DeliveryPackageSchema.parse(saved)).toEqual(saved);
    expect(DeliveryEmailModelSchema.parse(savedModel)).toEqual(savedModel);
    expect(deliveryPackageMeets({ deliveryEmail: savedModel }, saved))
      .toEqual(['servono almeno 6 schermate chiave, ce ne sono 2']);
    expect(deliveryPackageMeets({ deliveryEmail: savedModel }, {
      ...saved, overviewSheet: undefined, preview: undefined,
    })).toEqual([
      'servono almeno 6 schermate chiave, ce ne sono 2',
      'manca il foglio unico', "manca l'anteprima",
    ]);
  });

  it('s8220 soglie-di-peso', () => {
    expect(DELIVERY_PACKAGE_FILE_MAX_BYTES).toBe(26214400);
    expect(DELIVERY_PACKAGE_ATTACHMENT_MAX_BYTES).toBe(31457280);
  });
});
