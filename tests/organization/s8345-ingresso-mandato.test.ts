import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import * as SourceBirth from '../../src/organization/mandate-birth.js';
import * as SourcePlan from '../../src/organization/action-plan.js';
import * as SourceMandate from '../../src/organization/business-unit-mandate.js';

type Birth = Pick<typeof SourceBirth, 'actionPlanContractProblems' | 'mandateContractProblems'>;
const require = createRequire(import.meta.url);

async function variants(): Promise<{ name: string; birth: Birth }[]> {
  const esm = await import('../../dist/organization/mandate-birth.js');
  const cjs: Birth = require('../../dist/organization/mandate-birth.cjs');
  return [{ name: 'source', birth: SourceBirth }, { name: 'ESM', birth: esm }, { name: 'CJS', birth: cjs }];
}

const savedPlan = (): SourcePlan.ActionPlan =>
  JSON.parse(readFileSync(new URL('./fixtures/action-plan-v3-forma.json', import.meta.url), 'utf8'));

const METADATA = ['requirements', 'specifications', 'outputForm'] as const;
const criteria = ['The list is usable', 'The list can be reopened', 'The list can be shared'];
// Documented GOO-172 shape with test values: three deliveryCriteria and none of the new metadata.
const legacyPiece = (id: string): SourcePlan.ActionPlanBuSection => ({
  id, title: 'Shopping list', expectedGoal: 'The user keeps a list', deliveryCriteria: criteria, milestone: 1,
});
const completePiece = (id: string) => ({
  ...legacyPiece(id),
  requirements: criteria.map((text, index) => ({
    id: `${id}.${index + 1}`, text, attestor: 'referente' as const, proof: 'Referent checks the preview', origin: 'mandato' as const,
  })),
  specifications: { inputData: ['Product names'], technicalConstraints: ['Existing app'], outOfScope: ['Purchases'] },
  outputForm: 'Navigable prototype',
});

function mandateOf(planSection: Partial<SourceMandate.ReconciledMandate['planSection']>, buSlug = 'app'): SourceMandate.ReconciledMandate {
  const plan = savedPlan();
  const businessUnit = { ...plan.businessUnits.find((unit) => unit.buSlug === buSlug)!, ...planSection.businessUnit };
  return {
    tenantId: plan.tenantId, organizationId: plan.organizationId, clientId: plan.clientId, projectId: plan.projectId,
    planSection: { planId: plan.planId, planVersion: plan.version, planDigest: plan.digest, ...planSection, businessUnit },
    decision: { requestId: 'decision_s8345', planVersion: plan.version },
    referent: businessUnit.referent, notebookPages: [],
    reconciliation: { outcome: 'agrees' }, reconciledAt: '2026-11-21T10:00:00+01:00',
  };
}

const studyMandate = (piece: SourcePlan.ActionPlanBuSection) =>
  mandateOf({ businessUnit: { ...savedPlan().businessUnits[2]!, sections: [piece] } });

describe('s8345 ingresso del Mandato', () => {
  it('s8345 principale: a GOO-172 section with three criteria and no metadata lists the three exact paths, and is still readable', async () => {
    const mandate = studyMandate(legacyPiece('lista'));
    // The historical reader keeps accepting the same data: entry strictness never leaks into the saved schema.
    expect(SourceMandate.ReconciledMandateSchema.safeParse(mandate).success).toBe(true);
    for (const { name, birth } of await variants()) {
      expect(birth.mandateContractProblems(mandate.planSection), name).toStrictEqual(
        METADATA.map((field) => `businessUnit.sections.0.${field}`),
      );
    }
  });

  it('s8345 negativo: complete pieces give zero problems and stay readable', async () => {
    const mandate = studyMandate(completePiece('lista'));
    expect(SourceMandate.ReconciledMandateSchema.safeParse(mandate).success).toBe(true);
    for (const { name, birth } of await variants()) {
      expect(birth.mandateContractProblems(mandate.planSection), name).toStrictEqual([]);
    }
  });

  it('s8345 negativo: a mandate without named pieces reports its container, never an empty success', async () => {
    for (const { name, birth } of await variants()) {
      expect(birth.mandateContractProblems(mandateOf({}).planSection), name).toStrictEqual(['businessUnit.sections']);
      expect(birth.mandateContractProblems(
        mandateOf({ deliveryShape: 'product', workBreakdown: [{ ...legacyPiece('x'), owners: [{ buSlug: 'design', does: 'x' }] }] }).planSection,
      ), name).toStrictEqual(['workBreakdown']);
    }
  });

  it('s8345 negativo: product mandate asks only the pieces of its own unit and skips owner-less parents', async () => {
    const mandate = mandateOf({
      deliveryShape: 'product',
      workBreakdown: [
        { ...legacyPiece('parent'), owners: [] },
        { ...legacyPiece('mine'), parentId: 'parent', owners: [{ buSlug: 'app', does: 'builds' }] },
        { ...legacyPiece('other'), parentId: 'parent', owners: [{ buSlug: 'design', does: 'draws' }] },
      ],
    });
    for (const { name, birth } of await variants()) {
      expect(birth.mandateContractProblems(mandate.planSection), name).toStrictEqual(
        METADATA.map((field) => `workBreakdown.1.${field}`),
      );
    }
  });

  it('s8345 plan: study sections and product leaves are checked, a plan without pieces is refused', async () => {
    const base = savedPlan();
    const study: SourcePlan.ActionPlan = {
      ...base, deliveryShape: 'study',
      businessUnits: base.businessUnits.map((unit, index) => (index === 0 ? { ...unit, sections: [completePiece('a'), legacyPiece('b')] } : unit)),
    };
    const product: SourcePlan.ActionPlan = {
      ...base, deliveryShape: 'product',
      workBreakdown: [{ ...completePiece('ok'), owners: [{ buSlug: 'app', does: 'builds' }] }],
    };
    for (const { name, birth } of await variants()) {
      // Units that start now without sections are reported by container; the incomplete section by field.
      expect(birth.actionPlanContractProblems(study), name).toStrictEqual([
        ...base.businessUnits.slice(1).map((_, index) => `businessUnits.${index + 1}.sections`),
        ...METADATA.map((field) => `businessUnits.0.sections.1.${field}`),
      ]);
      expect(birth.actionPlanContractProblems(product), name).toStrictEqual([]);
      expect(birth.actionPlanContractProblems(base), name).toStrictEqual(['businessUnits.0.sections', ...base.businessUnits.slice(1).map((_, i) => `businessUnits.${i + 1}.sections`)]);
      expect(birth.actionPlanContractProblems({ ...base, deliveryShape: 'product' }), name).toStrictEqual(['workBreakdown']);
    }
  });
});
