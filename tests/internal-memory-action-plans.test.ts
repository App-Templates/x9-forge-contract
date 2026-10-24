import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import {
  ACTION_PLAN_ERROR_CODES,
  ActionPlanErrorResponseSchema,
  ActionPlanReadRequestSchema,
  ActionPlanReadResponseSchema,
  ActionPlanSaveRequestSchema,
  ActionPlanSaveResponseSchema,
  INTERNAL_MEMORY_ACTION_PLANS_PATH,
  INTERNAL_MEMORY_ACTION_PLAN_READ_PATH,
  internalMemoryActionPlanReadContract,
  internalMemoryActionPlanSaveContract,
} from '../src/http/endpoints/index.js';
import { ActionPlanSchema } from '../src/organization/action-plan.js';

const context = {
  schemaVersion: 1, runId: 'run-1', organizationId: 'organization-1', ownerId: 'owner-1',
  identity: { managementAgentId: 'director', runtimeAgentId: 'director' }, issuer: 'x9',
  issuedAt: '2026-10-24T07:00:00.000Z', expiresAt: '2026-10-24T09:00:00.000Z',
};
const nowUnit = {
  buSlug: 'vendite',
  typeId: 'vendite-b2b',
  mandate: 'Portare i primi clienti.',
  competencies: ['outreach', 'trattativa'],
  lead: { role: 'capo-bu' },
  reviewer: { role: 'director' },
  executor: 'agent',
  referent: { personRef: 'mario-rossi', entryVersion: 3 },
  firstActivities: ['Elenco dei contatti'],
  start: { kind: 'now' },
};
function completePlan() {
  return ActionPlanSchema.parse({
    planId: 'plan_001',
    version: 1,
    digest: 'a'.repeat(64),
    tenantId: 'tenant-1',
    organizationId: 'organization-1',
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
  });
}

describe('internal memory action plans contract', () => {
  it('exports save and read contracts from source and from the built CommonJS index', () => {
    expect(INTERNAL_MEMORY_ACTION_PLANS_PATH).toBe('/internal/memory/action-plans');
    expect(INTERNAL_MEMORY_ACTION_PLAN_READ_PATH).toBe('/internal/memory/action-plans/read');
    expect(internalMemoryActionPlanSaveContract).toEqual({
      method: 'POST', path: INTERNAL_MEMORY_ACTION_PLANS_PATH, authType: 'secret',
      bodySchema: ActionPlanSaveRequestSchema, responseSchema: ActionPlanSaveResponseSchema,
    });
    expect(internalMemoryActionPlanReadContract).toEqual({
      method: 'POST', path: INTERNAL_MEMORY_ACTION_PLAN_READ_PATH, authType: 'secret',
      bodySchema: ActionPlanReadRequestSchema, responseSchema: ActionPlanReadResponseSchema,
    });
    const built = createRequire(import.meta.url)('../dist/http/endpoints/index.cjs') as Record<string, unknown>;
    expect(built.internalMemoryActionPlanSaveContract).toMatchObject({ method: 'POST', path: INTERNAL_MEMORY_ACTION_PLANS_PATH });
    expect(built.internalMemoryActionPlanReadContract).toMatchObject({ method: 'POST', path: INTERNAL_MEMORY_ACTION_PLAN_READ_PATH });
  }, 30_000);

  it('saves a plan only with the signed context', () => {
    expect(ActionPlanSaveRequestSchema.safeParse({ context, plan: completePlan() }).success).toBe(true);
    expect(ActionPlanSaveRequestSchema.safeParse({ plan: completePlan() }).success).toBe(false);
    expect(ActionPlanSaveRequestSchema.safeParse({ context, plan: completePlan(), tenantId: 'tenant-1' }).success).toBe(false);
    expect(ActionPlanSaveRequestSchema.safeParse({ context, plan: { ...completePlan(), businessUnits: [] } }).success).toBe(false);
  });

  it('answers the receipt with digest and created', () => {
    expect(ActionPlanSaveResponseSchema.safeParse({ planId: 'plan_001', version: 1, digest: 'a'.repeat(64), created: true }).success).toBe(true);
    expect(ActionPlanSaveResponseSchema.safeParse({ planId: 'plan_001', version: 1, digest: 'a'.repeat(64) }).success).toBe(false);
  });

  it('reads a version or the latest, and answers ok with the plan or not_found', () => {
    expect(ActionPlanReadRequestSchema.safeParse({ context, planId: 'plan_001' }).success).toBe(true);
    expect(ActionPlanReadRequestSchema.safeParse({ context, planId: 'plan_001', version: 2 }).success).toBe(true);
    expect(ActionPlanReadRequestSchema.safeParse({ context, planId: 'plan_001', version: 0 }).success).toBe(false);
    expect(ActionPlanReadRequestSchema.safeParse({ planId: 'plan_001' }).success).toBe(false);
    expect(ActionPlanReadResponseSchema.safeParse({ status: 'ok', plan: completePlan(), latestVersion: 1 }).success).toBe(true);
    expect(ActionPlanReadResponseSchema.safeParse({ status: 'not_found' }).success).toBe(true);
    expect(ActionPlanReadResponseSchema.safeParse({ status: 'ok' }).success).toBe(false);
  });

  it('names its refusals', () => {
    expect(ACTION_PLAN_ERROR_CODES).toEqual(['action_plan_conflict', 'action_plan_digest_mismatch', 'action_plan_scope_mismatch', 'identity_uncertain']);
    expect(ActionPlanErrorResponseSchema.safeParse({ code: 'action_plan_conflict', message: 'x' }).success).toBe(true);
    expect(ActionPlanErrorResponseSchema.safeParse({ code: 'other', message: 'x' }).success).toBe(false);
  });
});
