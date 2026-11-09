import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ACTION_PLAN_DELIVERY_SHAPES,
  ActionPlanDeliveryShapeSchema,
  ActionPlanDraftSchema,
  ActionPlanSchema,
  ActionPlanSubmissionSchema,
  ActionPlanWorkBreakdownSchema,
  actionPlanCanonicalJson,
  type ActionPlan,
  type ActionPlanDraft,
} from '../../src/organization/action-plan.js';
import * as organization from '../../src/organization/index.js';

function unit(buSlug: string, typeId: string, start: ActionPlanDraft['businessUnits'][number]['start'] = { kind: 'now' }) {
  return {
    buSlug,
    typeId,
    mandate: `La BU ${buSlug} costruisce la sua parte del prodotto.`,
    competencies: ['competenza'],
    lead: { role: 'capo-bu' as const },
    reviewer: { role: 'director' as const },
    executor: 'agent' as const,
    referent: { personRef: 'stefano', entryVersion: 1 },
    firstActivities: ['Leggere il mini-brief'],
    start,
  };
}

function objective(buSlug: string) {
  return {
    buSlug,
    expectedResult: `Parte ${buSlug} pronta`,
    deliveryCriteria: ['Consegnata'],
    indicators: [{ name: 'Avanzamento', source: 'Paperclip' }],
  };
}

/** A product plan: design and app build the scan; app has the search. */
function productPlan(): ActionPlanDraft {
  return {
    planId: 'plan_good_1',
    version: 1,
    clientId: 'client-1',
    projectId: 'good-choice',
    deliveryShape: 'product',
    dossier: [{ slug: 'dossier-progetto', version: 1 }],
    objective: { request: 'App per scegliere prodotti', expectedResult: 'App usabile', measure: 'Utenti attivi' },
    analysis: {
      startingPoint: 'Nessuna app',
      marketAndAlternatives: { text: 'App di scansione esistenti', sources: ['https://example.org/market'] },
      recommendedMethod: { method: 'MVP', why: 'Validare' },
    },
    strategy: { approach: 'Prima la scansione', choices: ['Mobile'], discardedAlternatives: [] },
    objectiveTree: {
      project: { expectedResult: 'App in prova', deliveryCriteria: ['Cento scansioni riuscite'] },
      businessUnits: [objective('design'), objective('app')],
    },
    milestones: [
      { number: 1, delivery: 'Disegni', buSlug: 'design', dueDate: '2026-11-20', closeCriterion: 'Approvati', blockedBy: [] },
      { number: 2, delivery: 'App', buSlug: 'app', dueDate: '2026-12-10', closeCriterion: 'In prova', blockedBy: [1] },
    ],
    criticalPath: [1, 2],
    businessUnits: [unit('design', 'design'), unit('app', 'sviluppo')],
    workBreakdown: [
      {
        id: 'scansione', title: 'Scansione', expectedGoal: "L'utente scansiona un prodotto",
        deliveryCriteria: ['Il codice letto apre la scheda'], milestone: 2, owners: [],
      },
      {
        id: 'scansione-fotocamera', parentId: 'scansione', title: 'Fotocamera', expectedGoal: "L'utente inquadra il codice",
        deliveryCriteria: ['Lettura in meno di 2 secondi'], milestone: 2,
        owners: [{ buSlug: 'design', does: 'Disegna la schermata' }, { buSlug: 'app', does: 'Costruisce la lettura' }],
      },
      {
        id: 'ricerca', title: 'Ricerca', expectedGoal: "L'utente cerca per nome",
        deliveryCriteria: ['Risultati in 1 secondo'], milestone: 2, owners: [{ buSlug: 'app', does: 'Costruisce la ricerca' }],
      },
    ],
    exchanges: [],
    budget: { currency: 'EUR', total: 0, perBu: [] },
    risks: [],
    assumptions: [],
    missingMaterials: [],
    questions: [],
    ifApproved: {
      startNow: ['design', 'app'], startLater: [], verticalPlanDueBy: [],
      updates: { how: 'Email', every: 'Venerdì' },
    },
  };
}

function studyPlan(): ActionPlanDraft {
  const plan = productPlan();
  delete plan.workBreakdown;
  plan.deliveryShape = 'study';
  plan.businessUnits = plan.businessUnits.map((bu) => ({
    ...bu,
    sections: [{
      id: `capitolo-${bu.buSlug}`, title: 'Capitolo', expectedGoal: 'Stefano legge il capitolo',
      deliveryCriteria: ['Consegnato'], milestone: 1,
    }],
  }));
  return plan;
}

function issues(input: unknown) {
  const result = ActionPlanSubmissionSchema.safeParse(input);
  expect(result.success).toBe(false);
  return result.error!.issues.map((issue) => ({ path: issue.path, message: issue.message }));
}

describe('deliveryShape and workBreakdown (1.92.0)', () => {
  it('exports the delivery shapes as a constant from the organization subpath', () => {
    expect(ACTION_PLAN_DELIVERY_SHAPES).toEqual(['product', 'study']);
    expect(organization.ACTION_PLAN_DELIVERY_SHAPES).toBe(ACTION_PLAN_DELIVERY_SHAPES);
    expect(organization.ActionPlanWorkItemSchema).toBeDefined();
    expect(organization.ActionPlanObjectiveSchema).toBeDefined();
    expect(ActionPlanDeliveryShapeSchema.safeParse('analysis').success).toBe(false);
  });

  it('accepts a valid product plan and a valid study plan unchanged', () => {
    const product = productPlan();
    expect(ActionPlanSubmissionSchema.parse(product)).toEqual(product);
    const study = studyPlan();
    expect(ActionPlanSubmissionSchema.parse(study)).toEqual(study);
  });

  it('requires deliveryShape in a submission but not in a saved plan or draft', () => {
    const input = productPlan();
    delete input.deliveryShape;
    expect(issues(input)).toEqual([expect.objectContaining({ path: ['deliveryShape'] })]);
    expect(ActionPlanDraftSchema.parse(input)).toEqual(input);
  });

  it('product: rejects a plan without workBreakdown, with the path', () => {
    const input = productPlan();
    delete input.workBreakdown;
    expect(issues(input)).toEqual([expect.objectContaining({
      path: ['workBreakdown'], message: expect.stringContaining('A product plan needs workBreakdown'),
    })]);
  });

  it('product: rejects sections per business unit (one source only)', () => {
    const input = productPlan();
    input.businessUnits[0].sections = studyPlan().businessUnits[0].sections;
    expect(issues(input)).toEqual([expect.objectContaining({
      path: ['businessUnits', 0, 'sections'], message: expect.stringContaining('move these sections into workBreakdown items owned by design'),
    })]);
  });

  it('product: rejects an owner that is not a business unit, and a duplicate owner', () => {
    const input = productPlan();
    input.workBreakdown![2].owners = [{ buSlug: 'backend', does: 'API' }];
    input.workBreakdown![1].owners.push({ buSlug: 'app', does: 'Ancora' });
    expect(issues(input)).toEqual([
      { path: ['workBreakdown', 1, 'owners', 2, 'buSlug'], message: 'Work breakdown item scansione-fotocamera lists app twice: one entry per business unit' },
      { path: ['workBreakdown', 2, 'owners', 0, 'buSlug'], message: 'Work breakdown item ricerca is owned by backend, which is not a business unit of the plan' },
    ]);
  });

  it('product: rejects a parentId that does not exist or points to itself', () => {
    const input = productPlan();
    input.workBreakdown![1].parentId = 'manca';
    input.workBreakdown![2].parentId = 'ricerca';
    const found = issues(input);
    expect(found).toContainEqual({
      path: ['workBreakdown', 1, 'parentId'],
      message: 'Work breakdown item scansione-fotocamera has parentId manca, which is not another item of workBreakdown',
    });
    expect(found).toContainEqual({
      path: ['workBreakdown', 2, 'parentId'],
      message: 'Work breakdown item ricerca has parentId ricerca, which is not another item of workBreakdown',
    });
  });

  it('product: rejects a cycle through parentId', () => {
    const input = productPlan();
    input.workBreakdown![0].parentId = 'scansione-fotocamera';
    const found = issues(input);
    expect(found).toContainEqual({
      path: ['workBreakdown', 0, 'parentId'],
      message: 'Work breakdown item scansione is its own ancestor through parentId: the breakdown must be a tree',
    });
    expect(found).toContainEqual(expect.objectContaining({ path: ['workBreakdown', 1, 'parentId'] }));
  });

  it('product: a leaf needs an owner, a parent does not', () => {
    const input = productPlan();
    input.workBreakdown![2].owners = [];
    input.businessUnits[1].start = { kind: 'planned', unlockedBy: { milestone: 1, delivery: 'Disegni' } };
    input.workBreakdown![1].owners = [{ buSlug: 'design', does: 'Disegna' }];
    expect(issues(input)).toEqual([{
      path: ['workBreakdown', 2, 'owners'],
      message: 'Work breakdown item ricerca is a leaf and needs at least one owner: the business unit that builds it and what it does',
    }]);
  });

  it('product: rejects a milestone that does not exist', () => {
    const input = productPlan();
    input.workBreakdown![2].milestone = 7;
    expect(issues(input)).toEqual([{
      path: ['workBreakdown', 2, 'milestone'],
      message: 'Work breakdown item ricerca milestone 7 does not exist in the plan',
    }]);
  });

  it('product: every unit that starts now owns an item; a planned one may not', () => {
    const input = productPlan();
    input.workBreakdown![1].owners = [{ buSlug: 'app', does: 'Costruisce' }];
    expect(issues(input)).toEqual([{
      path: ['businessUnits', 0],
      message: 'Business unit design starts now but owns no workBreakdown item: add it as owner of the items it builds, with what it does',
    }]);
    input.businessUnits[0].start = { kind: 'planned', unlockedBy: { milestone: 1, delivery: 'Disegni' } };
    expect(ActionPlanSubmissionSchema.safeParse(input).success).toBe(true);
  });

  it('every business unit needs its objectiveTree entry (product and study)', () => {
    for (const input of [productPlan(), studyPlan()]) {
      input.objectiveTree.businessUnits = [objective('app')];
      expect(issues(input)).toEqual([{
        path: ['objectiveTree', 'businessUnits'],
        message: 'Business unit design needs its entry in objectiveTree.businessUnits: what this unit must obtain, delivery criteria and indicators',
      }]);
    }
  });

  it('study: rejects a workBreakdown and keeps requiring sections for units that start now', () => {
    const input = studyPlan();
    input.workBreakdown = productPlan().workBreakdown;
    expect(issues(input)).toEqual([expect.objectContaining({ path: ['workBreakdown'] })]);
    const noSections = studyPlan();
    delete noSections.businessUnits[1].sections;
    expect(issues(noSections)).toEqual([expect.objectContaining({ path: ['businessUnits', 1, 'sections'] })]);
  });

  it('shape of the breakdown: unique ids, at most 60 items, strict items', () => {
    const items = productPlan().workBreakdown!;
    expect(ActionPlanWorkBreakdownSchema.safeParse([items[0], items[0]]).success).toBe(false);
    expect(ActionPlanWorkBreakdownSchema.safeParse(
      Array.from({ length: 61 }, (_, index) => ({ ...items[2], id: `voce-${index}` })),
    ).success).toBe(false);
    expect(ActionPlanWorkBreakdownSchema.safeParse([{ ...items[2], extra: true }]).success).toBe(false);
    expect(ActionPlanWorkBreakdownSchema.safeParse([]).success).toBe(false);
  });

  it('saved plans: the production v3 fixture stays valid and its canonical text does not change', () => {
    const fixture = JSON.parse(readFileSync(
      new URL('./fixtures/action-plan-v3-forma.json', import.meta.url), 'utf8',
    )) as ActionPlan;
    expect(ActionPlanSchema.parse(fixture)).toEqual(fixture);
    const { digest: _d, tenantId: _t, organizationId: _o, ...draft } = fixture;
    expect(ActionPlanDraftSchema.parse(draft)).toEqual(draft);
    expect(actionPlanCanonicalJson(ActionPlanSchema.parse(fixture))).toBe(actionPlanCanonicalJson(fixture));
  });

  it('saved plans round-trip deliveryShape and workBreakdown identically', () => {
    const fixture = JSON.parse(readFileSync(
      new URL('./fixtures/action-plan-v3-forma.json', import.meta.url), 'utf8',
    )) as ActionPlan;
    const withBreakdown = { ...fixture, deliveryShape: 'product' as const, workBreakdown: productPlan().workBreakdown };
    expect(ActionPlanSchema.parse(withBreakdown)).toEqual(withBreakdown);
  });
});
