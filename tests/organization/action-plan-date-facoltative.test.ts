import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  ActionPlanDraftSchema,
  ActionPlanSchema,
  ActionPlanSubmissionSchema,
  actionPlanCanonicalJson,
  type ActionPlan,
} from '../../src/organization/action-plan.js';

const require = createRequire(import.meta.url);
const commonJs: typeof import('../../src/organization/action-plan.js') = require('../../dist/organization/action-plan.cjs');

type Milestone = ActionPlan['milestones'][number];

function draftPlan(milestone: Record<string, unknown>) {
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
    milestones: [milestone],
    criticalPath: [1],
    businessUnits: [{
      buSlug: 'vendite',
      typeId: 'marketing',
      mandate: 'Portare i primi clienti.',
      competencies: ['outreach', 'trattativa'],
      lead: { role: 'capo-bu' },
      reviewer: { role: 'director' },
      executor: 'agent',
      referent: { personRef: 'mario-rossi', entryVersion: 3 },
      firstActivities: ['Elenco dei contatti'],
      sections: [{
        id: 'buyer-interviews',
        title: 'Buyer interviews',
        expectedGoal: 'The owner can identify qualified leads.',
        deliveryCriteria: ['Ten interviews are documented in the report.'],
        milestone: 1,
      }],
      start: { kind: 'now' },
    }],
    exchanges: [{ fromBu: 'vendite', toBu: 'supporto', what: 'Lead profile', format: 'Document' }],
    budget: { currency: 'EUR', total: 0, perBu: [{ buSlug: 'vendite', cap: 0 }] },
    risks: [],
    assumptions: [],
    missingMaterials: [{ what: 'Product overview', kind: 'asset' }],
    questions: [{ question: 'Which segment?', unlocks: 'Buyer interviews' }],
    ifApproved: {
      startNow: ['vendite'], startLater: [],
      verticalPlanDueBy: [{ buSlug: 'vendite', dueDate: '2026-10-25' }],
      updates: { how: 'Weekly report', every: 'Friday' },
    },
  };
}

const withDate = { number: 1, delivery: 'Interview report', buSlug: 'vendite', dueDate: '2026-11-01', closeCriterion: 'Report accepted', blockedBy: [] };
const withoutDate = { number: 1, delivery: 'Interview report', buSlug: 'vendite', closeCriterion: 'Report accepted', blockedBy: [] };

const savedPlan = (milestone: Record<string, unknown>) => ({
  ...draftPlan(milestone), digest: 'a'.repeat(64), tenantId: 'tenant-1', organizationId: 'organization-1',
});

function readFixture(): ActionPlan {
  return JSON.parse(readFileSync(new URL('./fixtures/action-plan-v3-forma.json', import.meta.url), 'utf8'));
}

describe('milestone dueDate is optional', () => {
  it('(a) a milestone without dueDate is accepted by plan, draft and submission schemas', () => {
    expect(ActionPlanSchema.safeParse(savedPlan(withoutDate)).success).toBe(true);
    expect(ActionPlanDraftSchema.safeParse(draftPlan(withoutDate)).success).toBe(true);
    const submission = ActionPlanSubmissionSchema.safeParse(draftPlan(withoutDate));
    expect(submission.success).toBe(true);
    expect(submission.data?.milestones[0]).not.toHaveProperty('dueDate');
  });

  it('(a2) a milestone with dueDate keeps it', () => {
    expect(ActionPlanDraftSchema.parse(draftPlan(withDate)).milestones[0]?.dueDate).toBe('2026-11-01');
  });

  it('(b) an impossible calendar day is still rejected', () => {
    for (const schema of [ActionPlanSchema, ActionPlanDraftSchema, ActionPlanSubmissionSchema]) {
      const input = schema === ActionPlanSchema ? savedPlan({ ...withDate, dueDate: '2026-02-30' }) : draftPlan({ ...withDate, dueDate: '2026-02-30' });
      const result = schema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['milestones', 0, 'dueDate']);
    }
  });

  it('(c) the production v3 fixture keeps its canonical text and sha256 digest', () => {
    const fixture = readFixture();
    const parsed = ActionPlanSchema.parse(fixture);
    expect(parsed).toEqual(fixture);
    const { digest: _digest, ...content } = fixture;
    const canonical = actionPlanCanonicalJson(parsed);
    expect(canonical).toBe(actionPlanCanonicalJson(fixture));
    expect(canonical).toContain('"dueDate"');
    expect(JSON.parse(canonical)).toEqual(content);
    expect(createHash('sha256').update(canonical).digest('hex')).toBe(fixture.digest);
    expect(parsed.milestones.every((milestone: Milestone) => milestone.dueDate !== undefined)).toBe(true);
  });

  it('(d) a plan without dates has a canonical text without dueDate in the milestones and a stable digest', () => {
    const plan = ActionPlanSchema.parse(savedPlan(withoutDate));
    const canonical = actionPlanCanonicalJson(plan);
    expect(JSON.parse(canonical).milestones[0]).not.toHaveProperty('dueDate');
    expect(canonical).not.toContain('"dueDate":null');
    const digest = (text: string) => createHash('sha256').update(text).digest('hex');
    expect(digest(actionPlanCanonicalJson(plan))).toBe(digest(canonical));
    expect(digest(actionPlanCanonicalJson(ActionPlanSchema.parse(savedPlan(withoutDate))))).toBe(digest(canonical));
  });

  it('(e) the CommonJS build accepts a milestone without dueDate and rejects a wrong day', () => {
    expect(commonJs.ActionPlanSchema.safeParse(savedPlan(withoutDate)).success).toBe(true);
    expect(commonJs.ActionPlanDraftSchema.safeParse(draftPlan(withoutDate)).success).toBe(true);
    expect(commonJs.ActionPlanSubmissionSchema.safeParse(draftPlan(withoutDate)).success).toBe(true);
    expect(commonJs.ActionPlanDraftSchema.safeParse(draftPlan({ ...withDate, dueDate: '2026-02-30' })).success).toBe(false);
  });

  it('(f) the Director JSON schema does not require dueDate in the milestones', () => {
    const schema = z.toJSONSchema(ActionPlanDraftSchema) as {
      properties: { milestones: { items: { required: string[]; properties: { dueDate: { description?: string } } } } };
    };
    const milestones = schema.properties.milestones.items;
    expect(milestones.required).not.toContain('dueDate');
    expect(milestones.required).toEqual(expect.arrayContaining(['number', 'delivery', 'buSlug', 'closeCriterion', 'blockedBy']));
    expect(milestones.properties.dueDate.description).toBe('giorno della tappa, se esiste');
  });
});
