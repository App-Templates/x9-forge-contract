import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  ActionPlanBusinessUnitSchema,
  ActionPlanReferentProposalSchema,
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

const plannedUnit = {
  ...nowUnit,
  buSlug: 'supporto',
  roleAgents: [{ role: 'Operatore di supporto', competencies: ['ticket'] }],
  start: { kind: 'planned', unlockedBy: { milestone: 2, delivery: 'Primo cliente acquisito' } },
};

describe('ActionPlanBusinessUnitSchema', () => {
  it('accepts a unit that starts now', () => {
    expect(ActionPlanBusinessUnitSchema.parse(nowUnit)).toEqual(nowUnit);
  });

  it('accepts a planned unit with role agents', () => {
    expect(ActionPlanBusinessUnitSchema.parse(plannedUnit)).toEqual(plannedUnit);
  });

  it('accepts a reviewer that is another unit', () => {
    expect(ActionPlanBusinessUnitSchema.safeParse({ ...nowUnit, reviewer: { buSlug: 'qualita' } }).success).toBe(true);
  });

  it('rejects a referent carrying an extra address field', () => {
    const referent = { ...nowUnit.referent, ['em' + 'ail']: 'a@b.it' };
    expect(ActionPlanBusinessUnitSchema.safeParse({ ...nowUnit, referent }).success).toBe(false);
  });

  it('rejects a planned start without unlockedBy', () => {
    expect(ActionPlanBusinessUnitSchema.safeParse({ ...nowUnit, start: { kind: 'planned' } }).success).toBe(false);
  });

  it('rejects duplicate competencies', () => {
    expect(ActionPlanBusinessUnitSchema.safeParse({ ...nowUnit, competencies: ['a', 'a'] }).success).toBe(false);
  });

  it('rejects a lead with the director role', () => {
    expect(ActionPlanBusinessUnitSchema.safeParse({ ...nowUnit, lead: { role: 'director' } }).success).toBe(false);
  });

  it('accepts only a lead type of the catalog (1.65.0)', () => {
    for (const typeId of ['dati', 'design', 'sviluppo', 'finanza', 'marketing']) {
      expect(ActionPlanBusinessUnitSchema.safeParse({ ...nowUnit, typeId }).success).toBe(true);
    }
    // A type Forge does not know, the Director and Ricerca/Lab are not units of a plan.
    for (const typeId of ['vendite-b2b', 'director', 'ricerca-lab', 'Dati']) {
      expect(ActionPlanBusinessUnitSchema.safeParse({ ...nowUnit, typeId }).success).toBe(false);
    }
  });

  it('rejects an executor outside the list', () => {
    expect(ActionPlanBusinessUnitSchema.safeParse({ ...nowUnit, executor: 'human' }).success).toBe(false);
  });
});

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

describe('ActionPlanSchema', () => {
  const proposal = {
    personRef: 'mario-rossi', name: 'Mario Rossi', role: 'Sales manager',
    email: 'mario.rossi@example.org', level: 'client',
  };

  it('accepts two valid referent proposals and preserves their data', () => {
    const referentProposals = [proposal, { ...proposal, level: 'business_unit', buSlug: 'vendite' }];
    const plan = { ...completePlan(), referentProposals };
    expect(ActionPlanSchema.parse(plan)).toEqual(plan);
    expect(ActionPlanReferentProposalSchema.parse(proposal)).toEqual(proposal);
  });

  it('enforces referent proposal uniqueness, scope and count', () => {
    const plan = completePlan();
    for (const referentProposals of [
      [proposal, { ...proposal, email: 'other@example.org' }],
      [{ ...proposal, level: 'business_unit', buSlug: 'vendite' }, { ...proposal, level: 'business_unit', buSlug: 'vendite' }],
      [{ ...proposal, buSlug: 'vendite' }],
      [{ ...proposal, level: 'business_unit' }],
      [{ ...proposal, level: 'project', buSlug: 'vendite' }],
      Array.from({ length: 21 }, (_, index) => ({ ...proposal, personRef: `person-${index}` })),
    ]) {
      expect(ActionPlanSchema.safeParse({ ...plan, referentProposals }).success, JSON.stringify(referentProposals)).toBe(false);
    }
    expect(ActionPlanSchema.safeParse({
      ...plan, referentProposals: Array.from({ length: 20 }, (_, index) => ({ ...proposal, personRef: `person-${index}` })),
    }).success).toBe(true);
  });

  it('accepts the same person at different levels and business units', () => {
    const referentProposals = [
      proposal,
      { ...proposal, level: 'project' },
      { ...proposal, level: 'business_unit', buSlug: 'vendite' },
      { ...proposal, level: 'business_unit', buSlug: 'supporto' },
      { ...proposal, personRef: 'anna-verdi' },
    ];
    expect(ActionPlanSchema.parse({ ...completePlan(), referentProposals }).referentProposals).toEqual(referentProposals);
    expect(ActionPlanSchema.safeParse({ ...completePlan(), referentProposals: [] }).success).toBe(true);
  });

  it.each([
    { email: 'invalid-email' }, { extra: true }, { projectId: 'project-1' },
    { level: 'unknown' }, { personRef: 'Bad_Slug' }, { personRef: '' }, { personRef: 'x'.repeat(41) },
    { name: '' }, { name: 'x'.repeat(121) }, { role: '' }, { role: 'x'.repeat(121) },
    { level: 'business_unit', buSlug: 'Bad_Slug' },
    { level: 'business_unit', buSlug: 'x'.repeat(31) },
  ])('rejects invalid referent proposal fields %j', (change) => {
    expect(ActionPlanSchema.safeParse({ ...completePlan(), referentProposals: [{ ...proposal, ...change }] }).success).toBe(false);
  });

  it('accepts a complete plan with one immediately starting unit', () => {
    const plan = completePlan();
    expect(ActionPlanSchema.parse(plan)).toEqual(plan);
    expect(plan.businessUnits).toHaveLength(1);
    expect(plan.businessUnits[0]?.start).toEqual({ kind: 'now' });
  });

  // All fields belonging to the eleven parts are mandatory, including paired fields.
  it.each([
    'objective', 'analysis', 'strategy', 'objectiveTree', 'milestones', 'criticalPath',
    'businessUnits', 'exchanges', 'budget', 'risks', 'assumptions', 'missingMaterials',
    'questions', 'ifApproved',
  ])('rejects a plan missing required part field %s', (key) => {
    const incomplete: Record<string, unknown> = { ...completePlan() };
    delete incomplete[key];
    expect(ActionPlanSchema.safeParse(incomplete).success).toBe(false);
  });

  it.each([
    { digest: 'g'.repeat(64) }, { digest: 'a'.repeat(63) },
    { version: 0 }, { version: 1.5 }, { extra: true }, { planId: 'short' },
    { tenantId: '' }, { organizationId: '' }, { organizationId: 'x'.repeat(65) },
    { clientId: '' }, { clientId: 'x'.repeat(65) },
    { projectId: '' }, { projectId: 'x'.repeat(65) },
  ])('rejects invalid metadata %j', (change) => {
    expect(ActionPlanSchema.safeParse({ ...completePlan(), ...change }).success).toBe(false);
  });

  it('keeps nested objects strict and text between one and 2000 characters', () => {
    const plan = completePlan();
    for (const objective of [
      { ...plan.objective, extra: true },
      { ...plan.objective, request: '' },
      { ...plan.objective, request: 'x'.repeat(2001) },
    ]) {
      expect(ActionPlanSchema.safeParse({ ...plan, objective }).success).toBe(false);
    }
    expect(ActionPlanSchema.safeParse({
      ...plan, objective: { ...plan.objective, request: 'x'.repeat(2000) },
    }).success).toBe(true);
  });

  it('requires one to thirty HTTP or HTTPS analysis sources', () => {
    const plan = completePlan();
    for (const sources of [[], ['ftp://example.org/file'], ['not-a-url'], Array(31).fill('https://example.org')]) {
      expect(ActionPlanSchema.safeParse({
        ...plan, analysis: { ...plan.analysis, marketAndAlternatives: { text: 'Research', sources } },
      }).success).toBe(false);
    }
    expect(ActionPlanSchema.safeParse({
      ...plan,
      analysis: { ...plan.analysis, marketAndAlternatives: { text: 'Research', sources: ['http://example.org'] } },
    }).success).toBe(true);
  });

  it('enforces bounded collections, calendar dates and nonnegative budgets', () => {
    const plan = completePlan();
    const milestone = plan.milestones[0]!;
    const treeUnit = plan.objectiveTree.businessUnits[0]!;
    const invalidChanges = [
      { businessUnits: [] }, { businessUnits: Array(21).fill(plan.businessUnits[0]) },
      { milestones: [] }, { milestones: Array(51).fill(milestone) },
      { milestones: [{ ...milestone, number: 0 }] },
      { milestones: [{ ...milestone, dueDate: '2026-02-30' }] },
      { milestones: [{ ...milestone, blockedBy: [1.5] }] },
      { criticalPath: [] }, { criticalPath: Array(51).fill(1) }, { criticalPath: [1.5] },
      { strategy: { ...plan.strategy, choices: [] } },
      { strategy: { ...plan.strategy, choices: Array(21).fill('Choice') } },
      { strategy: { ...plan.strategy, discardedAlternatives: Array(21).fill('Alternative') } },
      { objectiveTree: { ...plan.objectiveTree, project: { expectedResult: 'Result', deliveryCriteria: [] } } },
      { objectiveTree: { ...plan.objectiveTree, businessUnits: [{ ...treeUnit, deliveryCriteria: [] }] } },
      { objectiveTree: { ...plan.objectiveTree, businessUnits: [{ ...treeUnit, indicators: Array(21).fill({ name: 'Metric', source: 'CRM' }) }] } },
      { risks: Array(31).fill('Risk') }, { assumptions: Array(31).fill('Assumption') },
      { budget: { ...plan.budget, total: -1 } },
      { budget: { ...plan.budget, perBu: [{ buSlug: 'vendite', cap: -1 }] } },
      { missingMaterials: [{ what: 'Access', kind: 'other' }] },
      { missingMaterials: [{ what: 'Access', kind: 'access', neededBy: 'tomorrow' }] },
      { ifApproved: { ...plan.ifApproved, startNow: ['Bad_Slug'] } },
      { ifApproved: { ...plan.ifApproved, verticalPlanDueBy: [{ buSlug: 'vendite', dueDate: '2026-13-01' }] } },
    ];
    for (const change of invalidChanges) {
      expect(ActionPlanSchema.safeParse({ ...plan, ...change }).success, JSON.stringify(change)).toBe(false);
    }
  });

  it('accepts optional details without imposing cross-field business rules', () => {
    const plan = completePlan();
    const { reviewer: _reviewer, ...unit } = plan.businessUnits[0]!;
    expect(ActionPlanSchema.safeParse({
      ...plan, criticalPath: [99], businessUnits: [unit], budget: { currency: 'EUR', total: 5, perBu: [] },
      missingMaterials: [
        { what: 'Dataset', kind: 'data', owner: 'Client', blocks: { buSlug: 'supporto', milestone: 99 }, neededBy: '2026-11-01' },
        { what: 'Access', kind: 'access' },
      ],
      opportunities: ['Expand to a second segment'],
    }).success).toBe(true);
  });
});

describe('actionPlanCanonicalJson', () => {
  it('preserves the saved canonical JSON and SHA-256 when referent proposals are absent', () => {
    // Frozen before referent proposals were added; independent of the current schema.
    const savedCanonical = [
      '{"analysis":{"marketAndAlternatives":{"sources":["https://example.org/research"],"text":"Direct outreach"},"re',
      'commendedMethod":{"method":"Interview buyers","why":"Validate demand"},"startingPoint":"New service"},"assumpt',
      'ions":[],"budget":{"currency":"EUR","perBu":[{"buSlug":"vendite","cap":0}],"total":0},"businessUnits":[{"buSlu',
      'g":"vendite","competencies":["outreach","trattativa"],"executor":"agent","firstActivities":["Elenco dei contat',
      'ti"],"lead":{"role":"capo-bu"},"mandate":"Portare i primi clienti.","referent":{"entryVersion":3,"personRef":"',
      'mario-rossi"},"reviewer":{"role":"director"},"start":{"kind":"now"},"typeId":"marketing"}],"clientId":"client-',
      '1","criticalPath":[1],"exchanges":[{"format":"Document","fromBu":"vendite","toBu":"supporto","what":"Lead prof',
      'ile"}],"ifApproved":{"startLater":[{"after":"First contract","buSlug":"supporto"}],"startNow":["vendite"],"upd',
      'ates":{"every":"Friday","how":"Weekly report"},"verticalPlanDueBy":[{"buSlug":"vendite","dueDate":"2026-10-25"',
      '}]},"milestones":[{"blockedBy":[],"buSlug":"vendite","closeCriterion":"Report accepted","delivery":"Interview ',
      'report","dueDate":"2026-11-01","number":1}],"missingMaterials":[{"kind":"asset","what":"Product overview"}],"o',
      'bjective":{"expectedResult":"One contract","measure":"Signed contracts","request":"Find clients"},"objectiveTr',
      'ee":{"businessUnits":[{"buSlug":"vendite","deliveryCriteria":["Ten interviews"],"expectedResult":"Qualified le',
      'ads","indicators":[{"name":"Interviews","source":"CRM"}]}],"project":{"deliveryCriteria":["Signed agreement"],',
      '"expectedResult":"One client"}},"organizationId":"organization-1","planId":"plan_001","projectId":"project-1",',
      '"questions":[{"question":"Which segment?","unlocks":"Buyer interviews"}],"risks":[],"strategy":{"approach":"St',
      'art small","choices":["Direct sales"],"discardedAlternatives":[]},"tenantId":"tenant-1","version":1}',
    ].join('');
    const savedDigest = '0e8afb37b9eddb02e052caddff1fa6593ff7dc46410f7e671fbf051a1fd6eca5';
    const savedPlan = { ...JSON.parse(savedCanonical), digest: savedDigest };
    const plan = ActionPlanSchema.parse(savedPlan);
    expect(plan).not.toHaveProperty('referentProposals');
    expect(plan.digest).toBe(savedDigest);
    const canonical = actionPlanCanonicalJson(plan);
    expect(canonical).toBe(savedCanonical);
    expect(createHash('sha256').update(canonical).digest('hex')).toBe(savedDigest);
  });

  it('sorts keys recursively including objects inside arrays and excludes digest', () => {
    const plan = completePlan();
    const { planId, ...rest } = plan;
    const milestone = plan.milestones[0]!;
    const reordered = {
      ...rest,
      objective: { measure: plan.objective.measure, expectedResult: plan.objective.expectedResult, request: plan.objective.request },
      milestones: [{
        blockedBy: milestone.blockedBy, closeCriterion: milestone.closeCriterion, dueDate: milestone.dueDate,
        buSlug: milestone.buSlug, delivery: milestone.delivery, number: milestone.number,
      }],
      planId,
    };
    const canonical = actionPlanCanonicalJson(plan);
    expect(actionPlanCanonicalJson(reordered)).toBe(canonical);
    expect(actionPlanCanonicalJson({ ...plan, digest: 'b'.repeat(64) })).toBe(canonical);
    expect(JSON.parse(canonical)).not.toHaveProperty('digest');
    expect(canonical.startsWith('{"analysis":')).toBe(true);
    expect(canonical).toContain('"objective":{"expectedResult":"One contract","measure":"Signed contracts","request":"Find clients"}');
    expect(actionPlanCanonicalJson({ ...plan, version: 2 })).not.toBe(canonical);
  });

  it('preserves array order in the digest input', () => {
    const plan = completePlan();
    const first = { ...plan, strategy: { ...plan.strategy, choices: ['First', 'Second'] } };
    const reversed = { ...plan, strategy: { ...plan.strategy, choices: ['Second', 'First'] } };
    expect(actionPlanCanonicalJson(first)).not.toBe(actionPlanCanonicalJson(reversed));
  });
});
