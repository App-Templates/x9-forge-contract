import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ActionPlanBuSectionSchema,
  ActionPlanSchema,
  ActionPlanSubmissionSchema,
  ActionPlanWorkItemSchema,
  canonicalJson,
} from '../../src/organization/action-plan.js';
import { ReconciledMandateSchema } from '../../src/organization/business-unit-mandate.js';

// Code fixture in the documented lista-spesa shape, not a production capture.
const specifications = {
  inputData: ['Catalogo prodotti fornito dal referente'],
  technicalConstraints: ['La lista si conserva al riavvio'],
  outOfScope: ['Acquisto e pagamento dei prodotti'],
};
const section = {
  id: 'lista-spesa', title: 'Lista della spesa', expectedGoal: "L'utente tiene la lista della spesa",
  deliveryCriteria: ['Si aggiunge un prodotto alla lista'], milestone: 1,
};
const item = { ...section, owners: [{ buSlug: 'app', does: 'Costruisce la lista' }] };
const variants = [
  { name: 'section', schema: ActionPlanBuSectionSchema, piece: section },
  { name: 'work item', schema: ActionPlanWorkItemSchema, piece: item },
];
const categories = ['inputData', 'technicalConstraints', 'outOfScope'] as const;

function savedPlan() {
  return JSON.parse(readFileSync(new URL('./fixtures/action-plan-v3-forma.json', import.meta.url), 'utf8'));
}

function mandate(pieces: { section: unknown; item: unknown }) {
  return {
    tenantId: 'tenant-1', organizationId: 'organization-1', clientId: 'client-1', projectId: 'project-1',
    planSection: {
      planId: 'plan_001', planVersion: 1, planDigest: 'a'.repeat(64), deliveryShape: 'product',
      businessUnit: {
        buSlug: 'app', typeId: 'sviluppo', mandate: 'Build the shopping list.', competencies: ['development'],
        lead: { role: 'capo-bu' }, executor: 'agent',
        referent: { personRef: 'stefano', entryVersion: 1 }, firstActivities: ['Read the plan'],
        start: { kind: 'now' }, sections: [pieces.section],
      },
      workBreakdown: [pieces.item],
    },
    decision: { requestId: 'decision_001', planVersion: 1 },
    referent: { personRef: 'stefano', entryVersion: 1 }, notebookPages: [],
    reconciliation: { outcome: 'agrees' }, reconciledAt: '2026-11-21T10:00:00+01:00',
  };
}

describe('s8342 principale', () => {
  it('s8342 principale: lista-spesa keeps the three explicit lists in both piece variants', () => {
    for (const { schema, piece } of variants) {
      const input = { ...piece, specifications };
      expect(schema.parse(input)).toStrictEqual(input);
    }
  });

  it('preserves specifications from the saved plan and submission through the mandate', () => {
    const base = ActionPlanSchema.parse(savedPlan());
    const input = {
      ...base,
      deliveryShape: 'study' as const,
      dossier: [{ slug: 'dossier-progetto', version: 1 }],
      objectiveTree: {
        ...base.objectiveTree,
        businessUnits: base.businessUnits.map((unit) => ({
          buSlug: unit.buSlug, expectedResult: 'Deliver the piece', deliveryCriteria: ['Accepted'], indicators: [],
        })),
      },
      businessUnits: base.businessUnits.map((unit) => ({
        ...unit, sections: [{ ...section, milestone: base.milestones[0]!.number, specifications }],
      })),
    };
    const parsed = ActionPlanSchema.parse(input);
    expect(parsed.businessUnits[0]!.sections![0]!.specifications).toStrictEqual(specifications);
    const { tenantId: _tenant, organizationId: _organization, digest: _digest, ...draft } = input;
    expect(ActionPlanSubmissionSchema.parse(draft).businessUnits[0]!.sections![0]!.specifications)
      .toStrictEqual(specifications);
    const product = {
      ...input, deliveryShape: 'product' as const, businessUnits: base.businessUnits,
      workBreakdown: [{
        ...item, milestone: base.milestones[0]!.number, specifications,
        owners: base.businessUnits.map((unit) => ({ buSlug: unit.buSlug, does: 'Builds the piece' })),
      }],
    };
    expect(ActionPlanSchema.parse(product).workBreakdown![0]!.specifications).toStrictEqual(specifications);
    const { tenantId: _productTenant, organizationId: _productOrganization, digest: _productDigest, ...productDraft } = product;
    expect(ActionPlanSubmissionSchema.parse(productDraft).workBreakdown![0]!.specifications).toStrictEqual(specifications);
    const value = mandate({ section: { ...section, specifications }, item: { ...item, specifications } });
    expect(ReconciledMandateSchema.parse(value)).toStrictEqual(value);
  });
});

for (const { name, schema, piece } of variants) {
  describe(`s8342 ${name}`, () => {
    it('s8342 principale: keeps three empty lists without inserting values', () => {
      const empty = { inputData: [], technicalConstraints: [], outOfScope: [] };
      expect(schema.parse({ ...piece, specifications: empty })).toStrictEqual({ ...piece, specifications: empty });
    });

    it('s8342 principale: a legacy piece gains no specifications key', () => {
      const parsed = schema.parse(piece);
      expect(parsed).not.toHaveProperty('specifications');
      expect(canonicalJson(parsed)).toBe(canonicalJson(piece));
    });

    for (const category of categories) {
      it(`s8342 negativo: rejects missing ${category}`, () => {
        const missing: Partial<typeof specifications> = { ...specifications };
        delete missing[category];
        const result = schema.safeParse({ ...piece, specifications: missing });
        expect(result.success).toBe(false);
        expect(result.error?.issues.map((issue) => issue.path.join('.'))).toContain(`specifications.${category}`);
      });

      it(`s8342 negativo: rejects invalid text and list values in ${category}`, () => {
        for (const invalid of [[''], [' \t\n '], ['a'.repeat(501)], [42], 'text', null, Array(21).fill('Valid text')]) {
          const result = schema.safeParse({ ...piece, specifications: { ...specifications, [category]: invalid } });
          expect(result.success).toBe(false);
          expect(result.error?.issues.some((issue) => issue.path[0] === 'specifications' && issue.path[1] === category))
            .toBe(true);
        }
      });

      it(`s8342 principale: accepts the limits and trims ${category}`, () => {
        const list = Array.from({ length: 20 }, () => 'a'.repeat(500));
        const atLimit = { ...specifications, [category]: list };
        expect(schema.parse({ ...piece, specifications: atLimit })).toStrictEqual({ ...piece, specifications: atLimit });
        const trimmed = schema.parse({ ...piece, specifications: { ...specifications, [category]: ['  Dato  '] } });
        expect(trimmed.specifications?.[category]).toStrictEqual(['Dato']);
      });
    }

    it('s8342 negativo: rejects an unknown category and malformed specifications', () => {
      for (const invalid of [{ ...specifications, extra: [] }, null, [], 'text']) {
        const result = schema.safeParse({ ...piece, specifications: invalid });
        expect(result.success).toBe(false);
        expect(result.error?.issues.some((issue) => issue.path[0] === 'specifications')).toBe(true);
      }
    });
  });
}

it('s8342 legacy: saved plan and mandate stay identical without specifications', () => {
  const raw = savedPlan();
  expect(canonicalJson(ActionPlanSchema.parse(raw))).toBe(canonicalJson(raw));
  const value = mandate({ section, item });
  expect(canonicalJson(ReconciledMandateSchema.parse(value))).toBe(canonicalJson(value));
});

it('s8342 export compilato: ESM and CJS keep both variants and reject a missing category', async () => {
  const modules = [
    await import('../../dist/organization/action-plan.js'),
    await import('../../dist/organization/action-plan.cjs'),
  ];
  const { inputData: _input, ...missing } = specifications;
  for (const built of modules) {
    for (const { schema, piece } of [
      { schema: built.ActionPlanBuSectionSchema, piece: section },
      { schema: built.ActionPlanWorkItemSchema, piece: item },
    ]) {
      expect(schema.parse({ ...piece, specifications })).toStrictEqual({ ...piece, specifications });
      expect(schema.safeParse({ ...piece, specifications: missing }).success).toBe(false);
      expect(schema.parse(piece)).not.toHaveProperty('specifications');
    }
  }
});
