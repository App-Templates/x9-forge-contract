import { describe, expect, it } from 'vitest';
import {
  BUSINESS_UNIT_DELIVERY_EMAIL_DEFAULTS,
  BusinessUnitTypeCardSchema,
  DeliveryEmailModelSchema,
  deliveryPackageMeets,
  type BusinessUnitTypeCard,
} from '../src/organization/business-unit-type.js';
import { DeliveryPackageSchema } from '../src/organization/delivery-package.js';

const valid: BusinessUnitTypeCard = {
  typeId: 'design',
  label: 'Design',
  capabilities: ['cap-design', 'cap-ricerca'],
  skills: ['brand-review'],
  model: 'advanced',
  sessionEngine: 'claude',
  budget: { currency: 'EUR', monthlyCap: 500, warnPercent: 80 },
  deliveryCriteria: ['Tavole riviste', 'Asset esportati'],
  reviewerTypeId: 'sviluppo',
  version: 1,
};

describe('BusinessUnitTypeCardSchema', () => {
  it('accepts a valid card', () => {
    expect(BusinessUnitTypeCardSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a card without reviewer', () => {
    const { reviewerTypeId: _r, ...rest } = valid;
    expect(BusinessUnitTypeCardSchema.safeParse(rest).success).toBe(true);
  });

  it('rejects uppercase and empty typeId', () => {
    expect(BusinessUnitTypeCardSchema.safeParse({ ...valid, typeId: 'Design' }).success).toBe(false);
    expect(BusinessUnitTypeCardSchema.safeParse({ ...valid, typeId: '' }).success).toBe(false);
  });

  it('rejects duplicate capabilities', () => {
    expect(BusinessUnitTypeCardSchema.safeParse({ ...valid, capabilities: ['a', 'a'] }).success).toBe(false);
  });

  it('rejects duplicate skills', () => {
    expect(BusinessUnitTypeCardSchema.safeParse({ ...valid, skills: ['a', 'a'] }).success).toBe(false);
  });

  it('rejects warnPercent 0 and 101', () => {
    for (const warnPercent of [0, 101]) {
      expect(
        BusinessUnitTypeCardSchema.safeParse({ ...valid, budget: { ...valid.budget, warnPercent } }).success,
      ).toBe(false);
    }
  });

  it('rejects empty deliveryCriteria', () => {
    expect(BusinessUnitTypeCardSchema.safeParse({ ...valid, deliveryCriteria: [] }).success).toBe(false);
  });

  it('rejects extra keys', () => {
    expect(BusinessUnitTypeCardSchema.safeParse({ ...valid, extra: 1 }).success).toBe(false);
    expect(
      BusinessUnitTypeCardSchema.safeParse({ ...valid, budget: { ...valid.budget, extra: 1 } }).success,
    ).toBe(false);
  });

  it('rejects version 0', () => {
    expect(BusinessUnitTypeCardSchema.safeParse({ ...valid, version: 0 }).success).toBe(false);
  });

  it('rejects unknown model tier and engine', () => {
    expect(BusinessUnitTypeCardSchema.safeParse({ ...valid, model: 'gigantic' }).success).toBe(false);
    expect(BusinessUnitTypeCardSchema.safeParse({ ...valid, sessionEngine: 'gpt' }).success).toBe(false);
  });

  it('round-trips through parse', () => {
    const parsed = BusinessUnitTypeCardSchema.parse(valid);
    expect(BusinessUnitTypeCardSchema.parse(JSON.parse(JSON.stringify(parsed)))).toEqual(valid);
  });
});

describe('business unit delivery email', () => {
  const design = DeliveryEmailModelSchema.parse(BUSINESS_UNIT_DELIVERY_EMAIL_DEFAULTS.design);
  const incomplete = DeliveryPackageSchema.parse({
    version: 1,
    title: 'Design delivery',
    forReferent: {
      whatIs: 'The proposed interface',
      whatToLook: 'Navigation and visual hierarchy',
      whatToDecide: 'Approve the interface',
      limits: [],
    },
    keyScreens: [
      { path: 'screens/home.png', caption: 'Home screen' },
      { path: 'screens/detail.png', caption: 'Detail screen' },
    ],
  });

  it('preserves the saved card without deliveryEmail', () => {
    const saved = JSON.parse(JSON.stringify(valid));
    expect(BusinessUnitTypeCardSchema.parse(saved)).toEqual(valid);
    expect(deliveryPackageMeets(valid, incomplete)).toEqual([]);
  });

  it('defines and accepts the design delivery email default', () => {
    expect(design).toEqual({ keyScreens: { min: 6, max: 8 }, overviewSheet: true, preview: true });
    expect(BusinessUnitTypeCardSchema.parse({ ...valid, deliveryEmail: design }).deliveryEmail).toEqual(design);
    expect(Object.keys(BUSINESS_UNIT_DELIVERY_EMAIL_DEFAULTS)).toEqual(['design']);
  });

  it('rejects a minimum greater than the maximum', () => {
    expect(DeliveryEmailModelSchema.safeParse({ ...design, keyScreens: { min: 5, max: 3 } }).success).toBe(false);
  });

  it('rejects unknown delivery email and key screen keys', () => {
    expect(BusinessUnitTypeCardSchema.safeParse({
      ...valid, deliveryEmail: { ...design, extra: true },
    }).success).toBe(false);
    expect(DeliveryEmailModelSchema.safeParse({
      ...design, keyScreens: { min: 6, max: 8, extra: true },
    }).success).toBe(false);
  });

  it('requires integer screen bounds from zero through eight', () => {
    for (const key of ['min', 'max'] as const) {
      for (const value of [-1, 0.5, 9]) {
        expect(DeliveryEmailModelSchema.safeParse({
          ...design, keyScreens: { min: 0, max: 8, [key]: value },
        }).success).toBe(false);
      }
    }
    for (const count of [0, 8]) {
      expect(DeliveryEmailModelSchema.safeParse({
        ...design, keyScreens: { min: count, max: count },
      }).success).toBe(true);
    }
    for (const key of ['overviewSheet', 'preview'] as const) {
      expect(DeliveryEmailModelSchema.safeParse({ ...design, [key]: 'true' }).success).toBe(false);
    }
  });

  it('reports the three missing design delivery requirements in order', () => {
    expect(deliveryPackageMeets({ deliveryEmail: design }, incomplete)).toEqual([
      'servono almeno 6 schermate chiave, ce ne sono 2',
      'manca il foglio unico',
      "manca l'anteprima",
    ]);
  });

  it('accepts a complete package at both design screen boundaries', () => {
    for (const count of [6, 8]) {
      const complete = DeliveryPackageSchema.parse({
        ...incomplete,
        keyScreens: Array.from({ length: count }, (_, index) => ({
          path: `screens/screen-${index}.png`, caption: `Screen ${index}`,
        })),
        overviewSheet: { path: 'overview.pdf' },
        preview: { path: 'preview.html' },
      });
      expect(deliveryPackageMeets({ deliveryEmail: design }, complete)).toEqual([]);
    }
  });

  it('reports the maximum and missing attachments in order', () => {
    expect(deliveryPackageMeets({ deliveryEmail: { ...design, keyScreens: { min: 0, max: 1 } } }, incomplete)).toEqual([
      'al massimo 1 schermate chiave, ce ne sono 2',
      'manca il foglio unico',
      "manca l'anteprima",
    ]);
  });

  it('does not require attachments when both requirements are false', () => {
    expect(deliveryPackageMeets({ deliveryEmail: {
      keyScreens: { min: 0, max: 8 }, overviewSheet: false, preview: false,
    } }, incomplete)).toEqual([]);
  });
});
