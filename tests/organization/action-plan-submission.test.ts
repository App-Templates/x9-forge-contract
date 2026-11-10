import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ActionPlanDraftSchema,
  ActionPlanSchema,
  ActionPlanSubmissionSchema,
  type ActionPlanDraft,
} from '../../src/organization/action-plan.js';

function draftPlan(): ActionPlanDraft {
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
    milestones: [{
      number: 1, delivery: 'Interview report', buSlug: 'vendite', dueDate: '2026-11-01',
      closeCriterion: 'Report accepted', blockedBy: [],
    }],
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
      startNow: ['vendite'], startLater: [{ buSlug: 'supporto', after: 'First contract' }],
      verticalPlanDueBy: [{ buSlug: 'vendite', dueDate: '2026-10-25' }],
      updates: { how: 'Weekly report', every: 'Friday' },
    },
  };
}

describe('ActionPlanSubmissionSchema', () => {
  it('(a) accepts a valid draft and preserves its contents', () => {
    const input = draftPlan();
    expect(ActionPlanSubmissionSchema.parse(input)).toEqual(input);
  });

  it('(b) requires sections for a business unit that starts now', () => {
    const input = draftPlan();
    delete input.businessUnits[0].sections;
    const result = ActionPlanSubmissionSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([expect.objectContaining({
      code: 'custom',
      path: ['businessUnits', 0, 'sections'],
      message: 'Business unit vendite starts now and needs its sections: the mission split into what this unit builds',
    })]);
  });

  it('(c) accepts a planned business unit without sections and dependencies on it', () => {
    const input = draftPlan();
    const { sections: _sections, ...unit } = input.businessUnits[0];
    input.businessUnits.push({
      ...unit,
      buSlug: 'supporto',
      start: { kind: 'planned', unlockedBy: { milestone: 1, delivery: 'First contract' } },
    });
    input.objectiveTree.businessUnits.push({
      buSlug: 'supporto', expectedResult: 'Ready support', deliveryCriteria: ['Support desk open'], indicators: [],
    });
    input.businessUnits[0].sections![0].needsFrom = [{ buSlug: 'supporto', what: 'Lead profile' }];
    expect(ActionPlanSubmissionSchema.parse(input)).toEqual(input);
  });

  it('(d) rejects a section whose milestone does not exist in the plan', () => {
    const input = draftPlan();
    input.businessUnits[0].sections![0].milestone = 99;
    const result = ActionPlanSubmissionSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([expect.objectContaining({
      code: 'custom',
      path: ['businessUnits', 0, 'sections', 0, 'milestone'],
      message: 'Section buyer-interviews milestone 99 does not exist in the plan',
    })]);
  });

  it('(e) rejects dependencies on an unknown business unit and on the unit itself', () => {
    const input = draftPlan();
    input.businessUnits[0].sections![0].needsFrom = [
      { buSlug: 'missing', what: 'Product fields' },
      { buSlug: 'vendite', what: 'Lead profile' },
    ];
    const result = ActionPlanSubmissionSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({
        code: 'custom',
        path: ['businessUnits', 0, 'sections', 0, 'needsFrom', 0, 'buSlug'],
        message: 'Section buyer-interviews needs work from missing, which is not another existing business unit',
      }),
      expect.objectContaining({
        code: 'custom',
        path: ['businessUnits', 0, 'sections', 0, 'needsFrom', 1, 'buSlug'],
        message: 'Section buyer-interviews needs work from vendite, which is not another existing business unit',
      }),
    ]);
  });

  it('(f) preserves old drafts without sections and the saved production v3 plan', () => {
    const input = draftPlan();
    delete input.businessUnits[0].sections;
    expect(ActionPlanDraftSchema.parse(input)).toEqual(input);
    const fixture: unknown = JSON.parse(readFileSync(
      new URL('./fixtures/action-plan-v3-forma.json', import.meta.url), 'utf8',
    ));
    expect(ActionPlanSchema.parse(fixture)).toEqual(fixture);
  });

  it('(g) keeps the draft extensible with an optional clientId for cap-email', () => {
    const extended = ActionPlanDraftSchema.extend({ clientId: ActionPlanDraftSchema.shape.clientId.optional() });
    const { clientId: _clientId, ...input } = draftPlan();
    delete input.businessUnits[0].sections;
    expect(extended.parse(input)).toEqual(input);
  });
});
