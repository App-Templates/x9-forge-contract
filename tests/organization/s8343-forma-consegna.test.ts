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
const outputForm = 'Prototipo navigabile con la lista della spesa, apribile da un link';
const section = {
  id: 'lista-spesa', title: 'Lista della spesa', expectedGoal: "L'utente tiene la lista della spesa",
  deliveryCriteria: ['Si aggiunge un prodotto alla lista'], milestone: 1,
};
const item = { ...section, owners: [{ buSlug: 'app', does: 'Costruisce la lista' }] };
const variants = [
  { name: 'section', schema: ActionPlanBuSectionSchema, piece: section },
  { name: 'work item', schema: ActionPlanWorkItemSchema, piece: item },
];

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

describe('s8343 principale', () => {
  it('s8343 principale: lista-spesa with a navigable prototype outputForm is saved in both variants', () => {
    for (const { schema, piece } of variants) {
      const input = { ...piece, outputForm };
      expect(schema.parse(input)).toStrictEqual(input);
    }
  });

  it('s8343 principale: the form is readable in the mandate and product/study stay untouched', () => {
    const value = mandate({ section: { ...section, outputForm }, item: { ...item, outputForm } });
    const parsed = ReconciledMandateSchema.parse(value);
    expect(parsed).toStrictEqual(value);
    expect(parsed.planSection.deliveryShape).toBe('product');
    expect(parsed.planSection.businessUnit.sections![0]!.outputForm).toBe(outputForm);
  });

  it('s8343 principale: the saved plan and submission carry the form through study and product', () => {
    const base = ActionPlanSchema.parse(savedPlan());
    const study = {
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
        ...unit, sections: [{ ...section, milestone: base.milestones[0]!.number, outputForm: 'Documento PDF' }],
      })),
    };
    expect(ActionPlanSchema.parse(study).businessUnits[0]!.sections![0]!.outputForm).toBe('Documento PDF');
    const { tenantId: _t, organizationId: _o, digest: _d, ...studyDraft } = study;
    expect(ActionPlanSubmissionSchema.parse(studyDraft).businessUnits[0]!.sections![0]!.outputForm).toBe('Documento PDF');
    const product = {
      ...study, deliveryShape: 'product' as const, businessUnits: base.businessUnits,
      workBreakdown: [{
        ...item, milestone: base.milestones[0]!.number, outputForm,
        owners: base.businessUnits.map((unit) => ({ buSlug: unit.buSlug, does: 'Builds the piece' })),
      }],
    };
    expect(ActionPlanSchema.parse(product).workBreakdown![0]!.outputForm).toBe(outputForm);
    const { tenantId: _pt, organizationId: _po, digest: _pd, ...productDraft } = product;
    expect(ActionPlanSubmissionSchema.parse(productDraft).workBreakdown![0]!.outputForm).toBe(outputForm);
  });

  it('s8343 principale: two pieces can declare different forms', () => {
    const second = { ...section, id: 'storico', outputForm: 'Dati in formato CSV' };
    const first = { ...section, outputForm };
    const value = mandate({ section: first, item });
    value.planSection.businessUnit.sections = [first, second];
    const parsed = ReconciledMandateSchema.parse(value);
    const forms = parsed.planSection.businessUnit.sections!.map((piece) => piece.outputForm);
    expect(forms).toStrictEqual([outputForm, 'Dati in formato CSV']);
  });
});

for (const { name, schema, piece } of variants) {
  describe(`s8343 ${name}`, () => {
    it('s8343 principale: a legacy piece gains no outputForm key', () => {
      const parsed = schema.parse(piece);
      expect(parsed).not.toHaveProperty('outputForm');
      expect(canonicalJson(parsed)).toBe(canonicalJson(piece));
    });

    it('s8343 principale: trims the text and accepts exactly 500 characters', () => {
      expect(schema.parse({ ...piece, outputForm: `  ${outputForm}  ` }).outputForm).toBe(outputForm);
      const longest = 'a'.repeat(500);
      expect(schema.parse({ ...piece, outputForm: longest }).outputForm).toBe(longest);
    });

    it('s8343 negativo: rejects empty, spaces only and over 500 characters', () => {
      for (const invalid of ['', ' \t\n ', 'a'.repeat(501), `${'a'.repeat(499)}  ` + 'b'.repeat(2)]) {
        const result = schema.safeParse({ ...piece, outputForm: invalid });
        expect(result.success).toBe(false);
        expect(result.error?.issues.some((issue) => issue.path[0] === 'outputForm')).toBe(true);
      }
    });

    it('s8343 negativo: rejects non-text values', () => {
      for (const invalid of [42, null, ['Prototipo'], { form: 'Prototipo' }]) {
        expect(schema.safeParse({ ...piece, outputForm: invalid }).success).toBe(false);
      }
    });
  });
}

it('s8343 legacy: saved plan and mandate stay identical without outputForm', () => {
  const raw = savedPlan();
  expect(canonicalJson(ActionPlanSchema.parse(raw))).toBe(canonicalJson(raw));
  const value = mandate({ section, item });
  expect(canonicalJson(ReconciledMandateSchema.parse(value))).toBe(canonicalJson(value));
});

it('s8343 export compilato: ESM and CJS keep both variants and reject an empty form', async () => {
  const modules = [
    await import('../../dist/organization/action-plan.js'),
    await import('../../dist/organization/action-plan.cjs'),
  ];
  for (const built of modules) {
    for (const { schema, piece } of [
      { schema: built.ActionPlanBuSectionSchema, piece: section },
      { schema: built.ActionPlanWorkItemSchema, piece: item },
    ]) {
      expect(schema.parse({ ...piece, outputForm })).toStrictEqual({ ...piece, outputForm });
      expect(schema.safeParse({ ...piece, outputForm: '   ' }).success).toBe(false);
      expect(schema.parse(piece)).not.toHaveProperty('outputForm');
    }
  }
});
