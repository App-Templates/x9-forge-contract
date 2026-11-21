import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import * as SourcePlan from '../../src/organization/action-plan.js';
import * as SourceMandate from '../../src/organization/business-unit-mandate.js';
import { mandateCriterionId } from '../../src/capability/dev/session-acceptance-mandate.js';

type Contracts = Pick<typeof SourcePlan, 'ActionPlanSchema' | 'actionPlanCanonicalJson' | 'canonicalJson'>
  & Pick<typeof SourceMandate, 'ReconciledMandateSchema'>;
const require = createRequire(import.meta.url);
const source: Contracts = { ...SourcePlan, ...SourceMandate };

async function variants(): Promise<{ name: string; contracts: Contracts }[]> {
  const [esmPlan, esmMandate] = await Promise.all([
    import('../../dist/organization/action-plan.js'),
    import('../../dist/organization/business-unit-mandate.js'),
  ]);
  const cjsPlan: typeof SourcePlan = require('../../dist/organization/action-plan.cjs');
  const cjsMandate: typeof SourceMandate = require('../../dist/organization/business-unit-mandate.cjs');
  return [
    { name: 'source', contracts: source },
    { name: 'ESM', contracts: { ...esmPlan, ...esmMandate } },
    { name: 'CJS', contracts: { ...cjsPlan, ...cjsMandate } },
  ];
}

function savedPlan(): SourcePlan.ActionPlan {
  // Read the existing fixture verbatim: parsing it here would conceal added defaults.
  return JSON.parse(readFileSync(new URL('./fixtures/action-plan-v3-forma.json', import.meta.url), 'utf8'));
}

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex');

function expectNoNewFields(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(expectNoNewFields);
  } else if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      expect(['requirements', 'specifications', 'outputForm']).not.toContain(key);
      expectNoNewFields(child);
    }
  }
}

function mandateOf(plan: SourcePlan.ActionPlan, buSlug: string): SourceMandate.ReconciledMandate {
  // Same preparation as mandateOf in action-plan-mandate-rules.test.ts, scoped to this fixture's unit.
  // This mandate is derived test data, never a saved production mandate or a production export.
  const businessUnit = plan.businessUnits.find((unit) => unit.buSlug === buSlug)!;
  return {
    tenantId: plan.tenantId, organizationId: plan.organizationId,
    clientId: plan.clientId, projectId: plan.projectId,
    planSection: {
      planId: plan.planId, planVersion: plan.version, planDigest: plan.digest, businessUnit,
      ...(plan.deliveryShape === undefined ? {} : { deliveryShape: plan.deliveryShape }),
      ...(plan.workBreakdown === undefined ? {} : { workBreakdown: plan.workBreakdown }),
      exchanges: plan.exchanges.filter((exchange) => exchange.fromBu === buSlug || exchange.toBu === buSlug),
      questions: plan.questions,
      ...(plan.sourceCoverage === undefined ? {} : { sourceCoverage: plan.sourceCoverage }),
    },
    decision: { requestId: 'decision_s8344', planVersion: plan.version },
    referent: businessUnit.referent, notebookPages: [],
    reconciliation: { outcome: 'agrees' }, reconciledAt: '2026-11-21T10:00:00+01:00',
  };
}

function withPieces(shape: SourcePlan.ActionPlanDeliveryShape, enriched: boolean): SourcePlan.ActionPlan {
  const base = savedPlan();
  function piece(id: string): SourcePlan.ActionPlanBuSection {
    const deliveryCriteria = ['The shopping list is usable', 'The saved list can be reopened'];
    return {
      id, title: 'Shopping list', expectedGoal: 'The user keeps a shopping list',
      deliveryCriteria, milestone: base.milestones[0]!.number,
      ...(enriched ? {
        requirements: deliveryCriteria.map((text, index) => ({
          id: mandateCriterionId(id, index), text, attestor: 'referente' as const,
          proof: 'Referent checks the delivered preview', origin: 'mandato' as const,
        })),
        specifications: {
          inputData: ['Existing product names'], technicalConstraints: ['Use the existing application'],
          outOfScope: ['Automatic purchases'],
        },
        outputForm: shape === 'study' ? 'PDF with the shopping list specification' : 'Navigable shopping list prototype',
      } : {}),
    };
  }
  // The saved fixture predates sections and workBreakdown. These explicit code variants exercise
  // absent fields inside both kinds of piece, including a child item; they are not production snapshots.
  const plan: SourcePlan.ActionPlan = {
    ...base, deliveryShape: shape,
    ...(shape === 'study' ? {
      businessUnits: base.businessUnits.map((unit) => ({ ...unit, sections: [piece(`list-${unit.buSlug}`)] })),
    } : {
      workBreakdown: [
        { ...piece('shopping'), owners: [] },
        {
          ...piece('shopping-list'), parentId: 'shopping',
          owners: base.businessUnits.map((unit) => ({ buSlug: unit.buSlug, does: 'Contributes to the list' })),
        },
      ],
    }),
  };
  plan.digest = sha256(source.actionPlanCanonicalJson(plan));
  return plan;
}

it('s8344 principale: the unchanged saved fixture has identical keys, canonical text and digest in source/ESM/CJS', async () => {
  const raw = savedPlan();
  const { digest, ...content } = raw;
  const canonical = source.canonicalJson(content);
  const baseline = source.ActionPlanSchema.parse(raw);
  for (const { name, contracts } of await variants()) {
    const parsed = contracts.ActionPlanSchema.parse(raw);
    expect(parsed, name).toStrictEqual(raw);
    expect(parsed, name).toStrictEqual(baseline);
    expectNoNewFields(parsed);
    expect(contracts.actionPlanCanonicalJson(parsed), name).toBe(canonical);
    expect(sha256(contracts.actionPlanCanonicalJson(parsed)), name).toBe(digest);
  }
});

it('s8344 principale: mandates derived from the unchanged fixture keep all keys in source/ESM/CJS', async () => {
  const raw = savedPlan();
  const exports = await variants();
  for (const unit of raw.businessUnits) {
    const input = mandateOf(raw, unit.buSlug);
    const baseline = source.ReconciledMandateSchema.parse(input);
    for (const { name, contracts } of exports) {
      const parsed = contracts.ReconciledMandateSchema.parse(input);
      expect(parsed, name).toStrictEqual(input);
      expect(parsed, name).toStrictEqual(baseline);
      expectNoNewFields(parsed);
      expect(contracts.canonicalJson(parsed), name).toBe(source.canonicalJson(input));
    }
  }
});

describe.each(['study', 'product'] as const)('s8344 %s derived pieces', (shape) => {
  it('s8344 negativo: a default must break source/ESM/CJS equality in the plan and its mandates', async () => {
    const raw = withPieces(shape, false);
    const baseline = source.ActionPlanSchema.parse(raw);
    const exports = await variants();
    for (const { name, contracts } of exports) {
      expect(contracts.ActionPlanSchema.parse(raw), name).toStrictEqual(baseline);
      for (const unit of raw.businessUnits) {
        const input = mandateOf(raw, unit.buSlug);
        expect(contracts.ReconciledMandateSchema.parse(input), name)
          .toStrictEqual(source.ReconciledMandateSchema.parse(input));
      }
    }
  });

  it('s8344 negativo: legacy nested pieces gain none of the three new keys in source/ESM/CJS', async () => {
    const raw = withPieces(shape, false);
    for (const { name, contracts } of await variants()) {
      const parsed = contracts.ActionPlanSchema.parse(raw);
      expect(parsed, name).toStrictEqual(raw);
      expectNoNewFields(parsed);
      for (const unit of raw.businessUnits) {
        const input = mandateOf(raw, unit.buSlug);
        const mandate = contracts.ReconciledMandateSchema.parse(input);
        expect(mandate, name).toStrictEqual(input);
        expectNoNewFields(mandate);
      }
    }
  });

  it('s8344 negativo: a default must change the legacy canonical text and fingerprint in source/ESM/CJS', async () => {
    const raw = withPieces(shape, false);
    const canonical = source.actionPlanCanonicalJson(raw);
    for (const { name, contracts } of await variants()) {
      const parsed = contracts.ActionPlanSchema.parse(raw);
      // Check the fingerprint first so M1 also fails on its digest, independently of deep equality.
      expect(sha256(contracts.actionPlanCanonicalJson(parsed)), name).toBe(raw.digest);
      expect(contracts.actionPlanCanonicalJson(parsed), name).toBe(canonical);
      for (const unit of raw.businessUnits) {
        const input = mandateOf(raw, unit.buSlug);
        expect(contracts.canonicalJson(contracts.ReconciledMandateSchema.parse(input)), name)
          .toBe(source.canonicalJson(input));
      }
    }
  });

  it('s8344 principale: enriched pieces carry requirements, specifications and outputForm into mandates in source/ESM/CJS', async () => {
    const raw = withPieces(shape, true);
    const baseline = source.ActionPlanSchema.parse(raw);
    for (const { name, contracts } of await variants()) {
      const parsed = contracts.ActionPlanSchema.parse(raw);
      expect(parsed, name).toStrictEqual(raw);
      expect(parsed, name).toStrictEqual(baseline);
      expect(contracts.actionPlanCanonicalJson(parsed), name).toBe(source.actionPlanCanonicalJson(raw));
      expect(sha256(contracts.actionPlanCanonicalJson(parsed)), name).toBe(raw.digest);
      for (const unit of raw.businessUnits) {
        const input = mandateOf(raw, unit.buSlug);
        const mandate = contracts.ReconciledMandateSchema.parse(input);
        expect(mandate, name).toStrictEqual(input);
        expect(mandate, name).toStrictEqual(source.ReconciledMandateSchema.parse(input));
        expect(contracts.canonicalJson(mandate), name).toBe(source.canonicalJson(input));
      }
    }
  });
});
