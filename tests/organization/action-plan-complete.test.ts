import { describe, expect, it } from 'vitest';
import { ActionPlanSchema, CompleteActionPlanSchema } from '../../src/organization/action-plan.js';

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

function basePlan() {
  return {
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
    milestones: [
      {
        number: 1, delivery: 'Interview report', buSlug: 'vendite', dueDate: '2026-11-01',
        closeCriterion: 'Report accepted', blockedBy: [],
      },
      {
        number: 2, delivery: 'First contract', buSlug: 'vendite', dueDate: '2026-12-01',
        closeCriterion: 'Contract signed', blockedBy: [1],
      },
    ],
    criticalPath: [1, 2],
    businessUnits: [nowUnit],
    exchanges: [{ fromBu: 'vendite', toBu: 'supporto', what: 'Lead profile', format: 'Document' }],
    budget: { currency: 'EUR', total: 1000, perBu: [{ buSlug: 'vendite', cap: 800 }] },
    risks: [],
    assumptions: [],
    missingMaterials: [{ what: 'Product overview', kind: 'asset', owner: 'Client', neededBy: '2026-10-30' }],
    questions: [{ question: 'Which segment?', unlocks: 'Buyer interviews' }],
    ifApproved: {
      startNow: ['vendite'], startLater: [{ buSlug: 'supporto', after: 'First contract' }],
      verticalPlanDueBy: [{ buSlug: 'vendite', dueDate: '2026-10-25' }],
      updates: { how: 'Weekly report', every: 'Friday' },
    },
  };
}

function completePlan() {
  return {
    ...basePlan(),
    marketingPlan: { audience: 'Small manufacturers', channels: ['Email'], messages: ['Save time on quotes'] },
    launchPlan: { launchDate: '2026-12-15', steps: ['Announce to the first ten leads'] },
    financialPlan: {
      revenueModel: 'Monthly subscription',
      costs: [{ item: 'Outreach tooling', amount: 200 }],
      breakEven: 'Month six',
    },
  };
}

function issuePaths(input: unknown): string[] {
  const result = CompleteActionPlanSchema.safeParse(input);
  expect(result.success).toBe(false);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
}

describe('CompleteActionPlanSchema', () => {
  it('accepts a complete valid plan', () => {
    expect(CompleteActionPlanSchema.safeParse(completePlan()).success).toBe(true);
  });

  it('keeps the plan without marketing, launch and financial parts valid for ActionPlanSchema only', () => {
    const plan = basePlan();
    expect(ActionPlanSchema.safeParse(plan).success).toBe(true);
    expect(CompleteActionPlanSchema.safeParse(plan).success).toBe(false);
  });

  it.each([
    { marketingPlan: { audience: 'A', channels: [], messages: ['m'] } },
    { launchPlan: { launchDate: '2026-02-30', steps: ['s'] } },
    { launchPlan: { launchDate: '2026-12-15', steps: [] } },
    { financialPlan: { revenueModel: 'R', costs: [], breakEven: 'B' } },
    { financialPlan: { revenueModel: 'R', costs: [{ item: 'I', amount: -1 }], breakEven: 'B' } },
  ])('rejects invalid new part %j', (change) => {
    expect(CompleteActionPlanSchema.safeParse({ ...completePlan(), ...change }).success).toBe(false);
  });

  it('rejects a business unit without indicators', () => {
    const plan = completePlan();
    const [treeUnit] = plan.objectiveTree.businessUnits;
    const objectiveTree = { ...plan.objectiveTree, businessUnits: [{ ...treeUnit!, indicators: [] }] };
    expect(issuePaths({ ...plan, objectiveTree })).toContain('objectiveTree.businessUnits');
  });

  it('rejects a business unit missing from the objective tree', () => {
    const plan = completePlan();
    const objectiveTree = { ...plan.objectiveTree, businessUnits: [] };
    expect(issuePaths({ ...plan, objectiveTree })).toContain('objectiveTree.businessUnits');
  });

  it('rejects duplicate milestone numbers', () => {
    const plan = completePlan();
    const milestones = [plan.milestones[0]!, { ...plan.milestones[1]!, number: 1, blockedBy: [] }];
    expect(issuePaths({ ...plan, milestones })).toContain('milestones');
  });

  it('rejects blockedBy pointing to milestone 99', () => {
    const plan = completePlan();
    const milestones = [plan.milestones[0]!, { ...plan.milestones[1]!, blockedBy: [99] }];
    expect(issuePaths({ ...plan, milestones })).toContain('milestones.1.blockedBy.0');
  });

  it('rejects a milestone blocked by itself', () => {
    const plan = completePlan();
    const milestones = [{ ...plan.milestones[0]!, blockedBy: [1] }, plan.milestones[1]!];
    expect(issuePaths({ ...plan, milestones })).toContain('milestones.0.blockedBy.0');
  });

  it('rejects a critical path with milestone 99', () => {
    expect(issuePaths({ ...completePlan(), criticalPath: [1, 99] })).toContain('criticalPath.1');
  });

  it('rejects a business unit without a budget cap', () => {
    const plan = completePlan();
    expect(issuePaths({ ...plan, budget: { ...plan.budget, perBu: [] } })).toContain('budget.perBu');
  });

  it('rejects a business unit with two budget caps', () => {
    const plan = completePlan();
    const perBu = [{ buSlug: 'vendite', cap: 100 }, { buSlug: 'vendite', cap: 100 }];
    expect(issuePaths({ ...plan, budget: { ...plan.budget, perBu } })).toContain('budget.perBu');
  });

  it('rejects caps adding up above the total', () => {
    const plan = completePlan();
    expect(issuePaths({ ...plan, budget: { ...plan.budget, total: 500 } })).toContain('budget.total');
  });

  it('rejects a business unit without a reviewer', () => {
    const plan = completePlan();
    const { reviewer: _reviewer, ...unit } = plan.businessUnits[0]!;
    expect(issuePaths({ ...plan, businessUnits: [unit] })).toContain('businessUnits.0.reviewer');
  });

  it('rejects a missing material without owner', () => {
    const plan = completePlan();
    const material = { what: 'Dataset', kind: 'data', neededBy: '2026-10-30' };
    expect(issuePaths({ ...plan, missingMaterials: [material] })).toContain('missingMaterials.0.owner');
  });

  it('rejects a missing material without neededBy', () => {
    const plan = completePlan();
    const material = { what: 'Dataset', kind: 'data', owner: 'Client' };
    expect(issuePaths({ ...plan, missingMaterials: [material] })).toContain('missingMaterials.0.neededBy');
  });
});
