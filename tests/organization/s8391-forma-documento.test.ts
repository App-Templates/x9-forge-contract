import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ActionPlanBusinessUnitSchema,
  ActionPlanDocumentFormatSchema,
  ActionPlanDraftSchema,
  ActionPlanSchema,
  ActionPlanSubmissionSchema,
  actionPlanCanonicalJson,
  type ActionPlan,
  type ActionPlanBusinessUnit,
  type ActionPlanDraft,
} from '../../src/organization/action-plan.js';
import { ReconciledMandateSchema } from '../../src/organization/business-unit-mandate.js';

const documentFormat = {
  mediaType: 'application/pdf',
  parts: ['Ipotesi', 'Costi'],
  length: { unit: 'pages', min: 2, max: 8 },
};
const costSection = {
  id: 'costi',
  title: 'Costi',
  expectedGoal: 'The owner can read the cost of the project.',
  deliveryCriteria: ['Voci di costo con fonte'],
  milestone: 2,
  documentFormat,
};
const unit: ActionPlanBusinessUnit = {
  buSlug: 'finanza',
  typeId: 'marketing',
  mandate: 'Deliver the financial analysis.',
  competencies: ['finance'],
  lead: { role: 'capo-bu' },
  executor: 'agent',
  referent: { personRef: 'stefano', entryVersion: 3 },
  firstActivities: ['Start'],
  sections: [costSection as never],
  start: { kind: 'now' },
};

function draft(sections: unknown): ActionPlanDraft {
  return {
    planId: 'plan_001',
    version: 1,
    clientId: 'client-1',
    projectId: 'project-1',
    dossier: [{ slug: 'buyer-research', version: 1 }],
    deliveryShape: 'study',
    objective: { request: 'Find clients', expectedResult: 'One contract', measure: 'Signed contracts' },
    analysis: {
      startingPoint: 'New service',
      marketAndAlternatives: { text: 'Direct outreach', sources: ['https://example.org/research'] },
      recommendedMethod: { method: 'Interview buyers', why: 'Validate demand' },
    },
    strategy: { approach: 'Start small', choices: ['Direct sales'], discardedAlternatives: [] },
    objectiveTree: {
      project: { expectedResult: 'One client', deliveryCriteria: ['Signed agreement'] },
      businessUnits: [{
        buSlug: 'vendite', expectedResult: 'Qualified leads', deliveryCriteria: ['Ten interviews'],
        indicators: [{ name: 'Interviews', source: 'CRM' }],
      }],
    },
    milestones: [1, 2].map((number) => ({
      number, delivery: 'Report', buSlug: 'vendite', dueDate: '2026-11-01', closeCriterion: 'Report accepted', blockedBy: [],
    })),
    criticalPath: [1],
    businessUnits: [{
      buSlug: 'vendite',
      typeId: 'marketing',
      mandate: 'Portare i primi clienti.',
      competencies: ['outreach'],
      lead: { role: 'capo-bu' },
      reviewer: { role: 'director' },
      executor: 'agent',
      referent: { personRef: 'mario-rossi', entryVersion: 3 },
      firstActivities: ['Elenco dei contatti'],
      sections: sections as never,
      start: { kind: 'now' },
    }],
    exchanges: [],
    budget: { currency: 'EUR', total: 0, perBu: [{ buSlug: 'vendite', cap: 0 }] },
    risks: [],
    assumptions: [],
    missingMaterials: [],
    questions: [],
    ifApproved: {
      startNow: ['vendite'], startLater: [],
      verticalPlanDueBy: [{ buSlug: 'vendite', dueDate: '2026-10-25' }],
      updates: { how: 'Weekly report', every: 'Friday' },
    },
  };
}

function mandate(businessUnit: ActionPlanBusinessUnit) {
  return {
    tenantId: 'tenant-1', organizationId: 'organization-1', clientId: 'client-1', projectId: 'project-1',
    planSection: { planId: 'plan_001', planVersion: 1, planDigest: 'a'.repeat(64), businessUnit },
    decision: { requestId: 'decision_001', planVersion: 1 },
    referent: businessUnit.referent,
    notebookPages: [],
    reconciliation: { outcome: 'agrees' },
    reconciledAt: '2026-11-04T10:00:00+01:00',
  };
}

describe('s8391 forma del documento', () => {
  it('s8391 forma-del-documento', () => {
    expect(ActionPlanBusinessUnitSchema.parse(unit)).toEqual(unit);
    const input = mandate(unit);
    const parsed = ReconciledMandateSchema.parse(input);
    expect(parsed.planSection.businessUnit.sections?.[0]?.documentFormat).toEqual(documentFormat);
    const plan = draft([costSection]);
    const submission = ActionPlanSubmissionSchema.safeParse(plan);
    expect(submission.error?.issues ?? []).toEqual([]);
    expect(ActionPlanDraftSchema.parse(plan).businessUnits[0]?.sections?.[0]?.documentFormat).toEqual(documentFormat);
    const withFormat = {
      ...plan, digest: 'c'.repeat(64), tenantId: 'tenant-1', organizationId: 'organization-1',
    } as ActionPlan;
    const kept = ActionPlanSchema.parse(withFormat);
    expect(kept.businessUnits[0]?.sections?.[0]?.documentFormat).toEqual(documentFormat);
    expect(actionPlanCanonicalJson(kept)).toContain('"documentFormat"');
  });

  it('s8391 vecchio-identico', () => {
    const fixture: ActionPlan = JSON.parse(readFileSync(
      new URL('./fixtures/action-plan-v3-forma.json', import.meta.url), 'utf8',
    ));
    const parsed = ActionPlanSchema.parse(fixture);
    expect(parsed).toEqual(fixture);
    expect(actionPlanCanonicalJson(parsed)).toBe(actionPlanCanonicalJson(fixture));
    for (const bu of parsed.businessUnits) {
      for (const section of bu.sections ?? []) expect('documentFormat' in section).toBe(false);
    }
  });

  it.each<[string, unknown, string[]]>([
    ['tipo-non-mime', { ...documentFormat, mediaType: 'PDF' }, ['mediaType']],
    ['parti-vuote', { ...documentFormat, parts: [] }, ['parts']],
    ['parti-duplicate', { ...documentFormat, parts: ['Costi', 'Costi'] }, ['parts']],
    ['min-maggiore-max', { ...documentFormat, length: { unit: 'pages', min: 9, max: 8 } }, ['length']],
    ['unita-sconosciuta', { ...documentFormat, length: { unit: 'chars', min: 1, max: 8 } }, ['length', 'unit']],
    ['campo-in-piu', { ...documentFormat, color: 'blue' }, []],
  ])('s8391 %s', (_label, bad, path) => {
    const result = ActionPlanBusinessUnitSchema.safeParse({
      ...unit, sections: [{ ...costSection, documentFormat: bad }],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => (
      issue.path.join('.').startsWith(['sections', 0, 'documentFormat', ...path].join('.'))
    ))).toBe(true);
  });

  it('s8391 unita-diverse', () => {
    const words = { ...documentFormat, length: { unit: 'words', min: 0, max: 1200 } };
    expect(ActionPlanDocumentFormatSchema.parse(words)).toEqual(words);
    expect(ActionPlanDocumentFormatSchema.parse(documentFormat).length).toEqual({ unit: 'pages', min: 2, max: 8 });
  });
});
