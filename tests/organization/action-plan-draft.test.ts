import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  ActionPlanDraftSchema,
  ActionPlanSchema,
  actionPlanCanonicalJson,
} from '../../src/organization/action-plan.js';

const nowUnit = {
  buSlug: 'vendite',
  typeId: 'marketing',
  mandate: 'Portare i primi clienti.',
  competencies: ['outreach', 'trattativa'],
  lead: { role: 'capo-bu' },
  reviewer: { role: 'director' },
  executor: 'agent',
  referent: { personRef: 'mario-rossi', entryVersion: 3 },
  firstActivities: ['Elenco dei contatti'],
  start: { kind: 'now' },
};

function draftPlan(): Record<string, unknown> {
  return {
    planId: 'plan_001',
    version: 1,
    clientId: 'client-1',
    projectId: 'project-1',
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
    milestones: [{
      number: 1, delivery: 'Interview report', buSlug: 'vendite', dueDate: '2026-11-01',
      closeCriterion: 'Report accepted', blockedBy: [],
    }],
    criticalPath: [1],
    businessUnits: [nowUnit],
    exchanges: [{ fromBu: 'vendite', toBu: 'supporto', what: 'Lead profile', format: 'Document' }],
    budget: { currency: 'EUR', total: 0, perBu: [{ buSlug: 'vendite', cap: 0 }] },
    risks: [],
    assumptions: [],
    missingMaterials: [{ what: 'Product overview', kind: 'asset' }],
    questions: [{ question: 'Which segment?', unlocks: 'Buyer interviews' }],
    ifApproved: {
      startNow: ['vendite'], startLater: [{ buSlug: 'supporto', after: 'First contract' }],
      verticalPlanDueBy: [{ buSlug: 'vendite', dueDate: '2026-10-25' }],
      updates: { how: 'Weekly report', every: 'Friday' },
    },
  };
}

function reverseKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(reverseKeys);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).reverse().map(([k, v]) => [k, reverseKeys(v)]),
    );
  }
  return value;
}

describe('ActionPlanDraftSchema', () => {
  it('(a) accepts the plan without digest, tenant and organization', () => {
    expect(ActionPlanDraftSchema.safeParse(draftPlan()).success).toBe(true);
  });

  it.each([
    ['digest', 'a'.repeat(64)],
    ['tenantId', 'tenant-1'],
    ['organizationId', 'organization-1'],
  ])('(b) rejects a draft carrying %s as an unrecognized key', (field, value) => {
    const result = ActionPlanDraftSchema.safeParse({ ...draftPlan(), [field]: value });
    expect(result.success).toBe(false);
    const issue = result.error?.issues.find((i) => i.code === 'unrecognized_keys');
    expect(issue).toBeDefined();
    expect((issue as { keys?: string[] }).keys).toContain(field);
  });

  it('(c) accepts a draft without planId and version, and rejects version 0', () => {
    const { planId: _planId, version: _version, ...rest } = draftPlan();
    expect(ActionPlanDraftSchema.safeParse(rest).success).toBe(true);
    expect(ActionPlanDraftSchema.safeParse({ ...draftPlan(), version: 0 }).success).toBe(false);
  });

  it('(d) completed by the service passes ActionPlanSchema with a stable digest', () => {
    const complete = (draft: Record<string, unknown>) => {
      const base = { ...draft, tenantId: 'tenant-1', organizationId: 'organization-1', digest: 'a'.repeat(64) };
      const plan = ActionPlanSchema.parse(base);
      const digest = createHash('sha256').update(actionPlanCanonicalJson(plan)).digest('hex');
      return { plan: ActionPlanSchema.parse({ ...plan, digest }), digest };
    };
    const first = complete(ActionPlanDraftSchema.parse(draftPlan()));
    const reordered = complete(ActionPlanDraftSchema.parse(reverseKeys(draftPlan())));
    expect(first.digest).toMatch(/^[0-9a-f]{64}$/);
    expect(reordered.digest).toBe(first.digest);
  });
});
