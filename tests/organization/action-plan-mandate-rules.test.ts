import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ActionPlanSchema,
  ActionPlanSubmissionSchema,
  actionPlanCanonicalJson,
  canonicalJson,
  type ActionPlanDraft,
} from '../../src/organization/action-plan.js';
import { ReconciledMandateSchema, type ReconciledMandate } from '../../src/organization/business-unit-mandate.js';

function unit(buSlug: string, signOffKey: string) {
  return {
    buSlug,
    typeId: 'marketing' as const,
    mandate: `Role and perimeter of ${buSlug}.`,
    competencies: ['craft'],
    lead: { role: 'capo-bu' as const },
    reviewer: { role: 'director' as const },
    executor: 'agent' as const,
    referent: { personRef: 'mario-rossi', entryVersion: 3 },
    firstActivities: ['First steps'],
    start: { kind: 'now' as const },
    signOffs: [{ key: signOffKey, signer: 'referent' as const, form: 'decision_request' as const }],
  };
}

function item(id: string, buSlug: string) {
  return {
    id,
    title: `Item ${id}`,
    expectedGoal: 'The owner can use it.',
    deliveryCriteria: ['It works.'],
    milestone: 1,
    owners: [{ buSlug, does: 'Builds it.' }],
  };
}

function plan(): ActionPlanDraft {
  const design = { ...unit('orto-design', 'design'), gapRule: 'mark_and_proceed' as const };
  return {
    planId: 'plan_001',
    version: 1,
    clientId: 'client-1',
    projectId: 'orto-facile',
    dossier: [{ slug: 'orto-ricerca', version: 2 }, { slug: 'orto-mercato', version: 1 }],
    deliveryShape: 'product',
    objective: { request: 'Orto Facile', expectedResult: 'An app', measure: 'Active users' },
    analysis: {
      startingPoint: 'Nothing yet',
      marketAndAlternatives: { text: 'Existing apps', sources: ['https://example.org/research'] },
      recommendedMethod: { method: 'Design first', why: 'Cheaper' },
    },
    strategy: { approach: 'Small', choices: ['Web first'], discardedAlternatives: [] },
    objectiveTree: {
      project: { expectedResult: 'An app', deliveryCriteria: ['Live'] },
      businessUnits: ['orto-design', 'orto-web'].map((buSlug) => ({
        buSlug, expectedResult: 'Done', deliveryCriteria: ['Accepted'], indicators: [],
      })),
    },
    workBreakdown: [item('design', 'orto-design'), item('web', 'orto-web')],
    milestones: [{
      number: 1, delivery: 'First release', buSlug: 'orto-web', closeCriterion: 'Live', blockedBy: [],
    }],
    criticalPath: [1],
    businessUnits: [design, unit('orto-web', 'web')],
    exchanges: [{
      fromBu: 'orto-design', toBu: 'orto-web', what: 'Screens', format: 'Figma export', key: 'design',
    }],
    budget: { currency: 'EUR', total: 0, perBu: [{ buSlug: 'orto-design', cap: 0 }, { buSlug: 'orto-web', cap: 0 }] },
    risks: [],
    assumptions: [],
    missingMaterials: [],
    questions: [{
      question: 'Which palette?', unlocks: 'Screens', askTo: { kind: 'referent', personRef: 'mario-rossi' },
    }],
    sourceCoverage: [{ topic: 'Seasonal crops', status: 'partial', pages: ['orto-ricerca'] }],
    ifApproved: {
      startNow: ['orto-design', 'orto-web'], startLater: [],
      verticalPlanDueBy: [], updates: { how: 'Weekly report', every: 'Friday' },
    },
  };
}

function mandateOf(planDraft: ActionPlanDraft, buSlug: string): ReconciledMandate {
  const businessUnit = planDraft.businessUnits.find((candidate) => candidate.buSlug === buSlug)!;
  return {
    tenantId: 'tenant-1',
    organizationId: 'good-choice',
    clientId: 'client-1',
    projectId: 'orto-facile',
    planSection: {
      planId: 'plan_001',
      planVersion: 1,
      planDigest: 'a'.repeat(64),
      businessUnit,
      deliveryShape: 'product',
      workBreakdown: planDraft.workBreakdown,
      exchanges: planDraft.exchanges,
      questions: planDraft.questions,
      sourceCoverage: planDraft.sourceCoverage,
    },
    decision: { requestId: 'decision_001', planVersion: 1 },
    referent: businessUnit.referent,
    notebookPages: [],
    reconciliation: { outcome: 'agrees' },
    reconciledAt: '2026-11-12T10:00:00+01:00',
  };
}

describe('s6346 mandato-regole: plan gap rule, sign-offs, exchange keys, question addressees and source coverage', () => {
  it('(a) accepts the new optional fields and returns them unchanged', () => {
    const input = plan();
    expect(ActionPlanSubmissionSchema.parse(input)).toEqual(input);
  });

  it.each<[string, (draft: ActionPlanDraft) => void, string]>([
    ['a sign-off key the unit does not have', (draft) => { draft.businessUnits[0].signOffs![0].key = 'web'; }, 'businessUnits.0.signOffs.0.key'],
    ['two sign-offs on the same key', (draft) => {
      draft.businessUnits[0].signOffs!.push({ key: 'design', signer: 'owner', form: 'decision_request' });
    }, 'businessUnits.0.signOffs'],
    ['an exchange key that does not exist', (draft) => { draft.exchanges[0].key = 'nowhere'; }, 'exchanges.0.key'],
    ['a question addressed to a unit outside the plan', (draft) => {
      draft.questions[0].askTo = { kind: 'business_unit', buSlug: 'orto-ghost' };
    }, 'questions.0.askTo.buSlug'],
    ['a coverage page outside the dossier', (draft) => { draft.sourceCoverage![0].pages = ['orto-altro']; }, 'sourceCoverage.0.pages.0'],
    ['a sign-off form other than the decision request', (draft) => {
      (draft.businessUnits[0].signOffs![0] as { form: string }).form = 'email';
    }, 'businessUnits.0.signOffs.0.form'],
    ['an invented gap rule', (draft) => {
      (draft.businessUnits[0] as { gapRule: string }).gapRule = 'ignore';
    }, 'businessUnits.0.gapRule'],
  ])('(b) rejects %s', (_name, mutate, path) => {
    const input = plan();
    mutate(input);
    const result = ActionPlanSubmissionSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toContain(path);
  });

  it('(b) accepts a sign-off on an owned work breakdown item and an exchange on any plan piece', () => {
    const input = plan();
    input.exchanges[0].key = 'web';
    expect(ActionPlanSubmissionSchema.safeParse(input).success).toBe(true);
  });

  it('(c) the mandate of a unit carries its exchange, question and coverage', () => {
    const value = mandateOf(plan(), 'orto-web');
    expect(ReconciledMandateSchema.parse(value)).toEqual(value);
  });

  it('(c) rejects a mandate exchange between two other units', () => {
    const value = mandateOf(plan(), 'orto-web');
    value.planSection.exchanges = [{ fromBu: 'orto-design', toBu: 'orto-brand', what: 'Logo', format: 'SVG' }];
    const result = ReconciledMandateSchema.safeParse(value);
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toContain('planSection.exchanges.0');
  });

  it('(R-37) a saved plan keeps its shape and its canonical text', () => {
    const fixture = JSON.parse(readFileSync(
      new URL('./fixtures/action-plan-v3-forma.json', import.meta.url), 'utf8',
    )) as { digest: string } & Record<string, unknown>;
    const parsed = ActionPlanSchema.parse(fixture);
    const { digest: _digest, ...content } = fixture;
    expect(actionPlanCanonicalJson(parsed)).toBe(canonicalJson(content));
    expect(parsed.sourceCoverage).toBeUndefined();
    expect(parsed.businessUnits.every((candidate) => candidate.gapRule === undefined && candidate.signOffs === undefined)).toBe(true);
  });

  it('(R-37) a mandate saved on 11/11 passes and does not acquire the new keys', () => {
    const value = mandateOf(plan(), 'orto-web');
    delete value.planSection.exchanges;
    delete value.planSection.questions;
    delete value.planSection.sourceCoverage;
    const parsed = ReconciledMandateSchema.parse(value);
    expect(parsed).toEqual(value);
    expect(Object.keys(parsed.planSection)).not.toEqual(expect.arrayContaining(['exchanges']));
    expect(canonicalJson(parsed)).toBe(canonicalJson(value));
  });
});
