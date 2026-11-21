import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ActionPlanBusinessUnitSchema,
  ActionPlanDraftSchema,
  ActionPlanSchema,
  ActionPlanSubmissionSchema,
  actionPlanCanonicalJson,
  type ActionPlan,
  type ActionPlanBusinessUnit,
  type ActionPlanDraft,
} from '../../src/organization/action-plan.js';
import { ReconciledMandateSchema } from '../../src/organization/business-unit-mandate.js';

const sha = 'b'.repeat(64);
const material = {
  assetId: 'asset_email_01',
  sha256: sha,
  name: 'listino.pdf',
  mediaType: 'application/pdf',
  sizeBytes: 2048,
  origin: { kind: 'email', messageId: '<msg-1@example.org>', attachmentName: 'listino.pdf' },
  tenantId: 'tenant-1',
  companyId: 'company-1',
  projectId: 'project-1',
  createdAt: '2026-11-04T10:00:00+01:00',
};
const sources = { pages: [{ slug: 'dossier-progetto', version: 2 }], materials: [material] };
const costSection = {
  id: 'costi',
  title: 'Costi',
  expectedGoal: 'The owner can read the cost of the project.',
  deliveryCriteria: ['Voci di costo con fonte'],
  milestone: 2,
  documentSources: sources,
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

describe('s8392 fonti del documento', () => {
  it('s8392 fonti-per-pezzo', () => {
    expect(ActionPlanBusinessUnitSchema.parse(unit)).toEqual(unit);
    const parsed = ReconciledMandateSchema.parse(mandate(unit));
    expect(parsed.planSection.businessUnit.sections?.[0]?.documentSources).toEqual(sources);
    const plan = draft([costSection]);
    expect(ActionPlanSubmissionSchema.safeParse(plan).error?.issues ?? []).toEqual([]);
    expect(ActionPlanDraftSchema.parse(plan).businessUnits[0]?.sections?.[0]?.documentSources).toEqual(sources);
    const full = { ...plan, digest: 'c'.repeat(64), tenantId: 'tenant-1', organizationId: 'organization-1' } as ActionPlan;
    const kept = ActionPlanSchema.parse(full).businessUnits[0]?.sections?.[0]?.documentSources;
    expect(kept?.pages[0]).toEqual({ slug: 'dossier-progetto', version: 2 });
    expect(kept?.materials[0]?.assetId).toBe('asset_email_01');
    expect(kept?.materials[0]?.sha256).toBe(sha);
    for (const only of [{ pages: sources.pages, materials: [] }, { pages: [], materials: [material] }]) {
      expect(ActionPlanBusinessUnitSchema.safeParse({ ...unit, sections: [{ ...costSection, documentSources: only }] }).success).toBe(true);
    }
  });

  it.each<[string, unknown, string[]]>([
    ['fonti-vuote', { pages: [], materials: [] }, ['pages']],
    ['versione-assente', { pages: [{ slug: 'dossier-progetto' }], materials: [] }, ['pages', '0', 'version']],
    ['versione-zero', { pages: [{ slug: 'dossier-progetto', version: 0 }], materials: [] }, ['pages', '0', 'version']],
    ['impronta-malformata', { pages: [], materials: [{ ...material, sha256: 'xyz' }] }, ['materials', '0', 'sha256']],
    ['campo-in-piu', { ...sources, approved: true }, []],
    ['pagina-duplicata', { pages: [sources.pages[0], sources.pages[0]], materials: [] }, ['pages', '1']],
    ['asset-duplicato', { pages: [], materials: [material, { ...material }] }, ['materials', '1']],
  ])('s8392 %s', (_label, bad, path) => {
    const result = ActionPlanBusinessUnitSchema.safeParse({ ...unit, sections: [{ ...costSection, documentSources: bad }] });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => (
      issue.path.join('.').startsWith(['sections', 0, 'documentSources', ...path].join('.'))
    ))).toBe(true);
  });

  it('s8392 versioni-diverse', () => {
    const two = { pages: [{ slug: 'dossier-progetto', version: 1 }, { slug: 'dossier-progetto', version: 2 }], materials: [] };
    expect(ActionPlanBusinessUnitSchema.parse({ ...unit, sections: [{ ...costSection, documentSources: two }] })
      .sections?.[0]?.documentSources).toEqual(two);
  });

  it('s8392 vecchio-identico', () => {
    const fixture: ActionPlan = JSON.parse(readFileSync(
      new URL('./fixtures/action-plan-v3-forma.json', import.meta.url), 'utf8',
    ));
    const parsed = ActionPlanSchema.parse(fixture);
    expect(parsed).toEqual(fixture);
    expect(actionPlanCanonicalJson(parsed)).toBe(actionPlanCanonicalJson(fixture));
    for (const bu of parsed.businessUnits) {
      for (const section of bu.sections ?? []) expect('documentSources' in section).toBe(false);
    }
  });

  it('s8392 dichiarazione-non-giudizio', () => {
    const parsed = ActionPlanBusinessUnitSchema.parse(unit);
    const text = JSON.stringify(parsed.sections?.[0]?.documentSources);
    expect(text).not.toMatch(/approved|receipt|status/);
    expect(parsed.sections?.[0] && 'documentFormat' in parsed.sections[0]).toBe(false);
    expect(parsed.sections?.[0]?.documentSources).toEqual(sources);
  });
});
