import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  ActionPlanBusinessUnitSchema,
  ActionPlanDraftSchema,
  ActionPlanSchema,
  actionPlanCanonicalJson,
  type ActionPlan,
  type ActionPlanBusinessUnit,
  type ActionPlanBuSection,
} from '../../src/organization/action-plan.js';
import { ReconciledMandateSchema } from '../../src/organization/business-unit-mandate.js';

const unit: ActionPlanBusinessUnit = {
  buSlug: 'design',
  typeId: 'design',
  mandate: 'Design the user experience for the project.',
  competencies: ['user experience'],
  lead: { role: 'capo-bu' },
  executor: 'agent',
  referent: { personRef: 'project-owner', entryVersion: 1 },
  firstActivities: ['Review the approved materials'],
  start: { kind: 'now' },
};

const sections: [ActionPlanBuSection, ActionPlanBuSection] = [
  {
    id: 'search',
    title: 'Product search',
    expectedGoal: 'The user can find a product by name.',
    deliveryCriteria: ['A name query shows matching products.'],
    milestone: 1,
    needsFrom: [{ buSlug: 'dati', what: 'Searchable product fields' }],
  },
  {
    id: 'comparison',
    title: 'Product comparison',
    expectedGoal: 'The user can compare two products.',
    deliveryCriteria: ['Two selected products display the same comparison fields.'],
    milestone: 2,
  },
];

describe('Action plan business unit sections', () => {
  it('(a) preserves a now business unit with two valid sections', () => {
    const input = { ...unit, sections };
    expect(ActionPlanBusinessUnitSchema.parse(input)).toEqual(input);
  });

  it('(b) preserves the absence of sections in an existing business unit', () => {
    const parsed = ActionPlanBusinessUnitSchema.parse(unit);
    expect(parsed).toEqual(unit);
    expect('sections' in parsed).toBe(false);
  });

  it('(c) rejects duplicate section ids with an issue under sections', () => {
    const result = ActionPlanBusinessUnitSchema.safeParse({
      ...unit,
      sections: [sections[0], { ...sections[1], id: sections[0].id }],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        path: ['sections'],
        message: 'Section ids must be unique within the business unit',
      }),
    ]));
  });

  it('(d) rejects unknown keys, empty criteria or goals, and more than twenty sections', () => {
    const invalidSections = [
      [{ ...sections[0], unknown: true }],
      [{ ...sections[0], deliveryCriteria: [] }],
      [{ ...sections[0], expectedGoal: '' }],
      Array.from({ length: 21 }, (_, index) => ({ ...sections[0], id: `section-${index}` })),
    ];
    for (const invalid of invalidSections) {
      expect(ActionPlanBusinessUnitSchema.safeParse({ ...unit, sections: invalid }).success).toBe(false);
    }
  });

  it('(e) preserves sections in the reconciled mandate business unit', () => {
    const input = {
      tenantId: 'tenant-1',
      organizationId: 'organization-1',
      clientId: 'client-1',
      projectId: 'project-1',
      planSection: {
        planId: 'plan_001',
        planVersion: 1,
        planDigest: 'a'.repeat(64),
        businessUnit: { ...unit, sections },
      },
      decision: { requestId: 'decision_001', planVersion: 1 },
      referent: unit.referent,
      notebookPages: [],
      reconciliation: { outcome: 'agrees' },
      reconciledAt: '2026-11-04T10:00:00+01:00',
    };
    const parsed = ReconciledMandateSchema.parse(input);
    expect(parsed).toEqual(input);
    expect(parsed.planSection.businessUnit.sections).toEqual(sections);
  });

  it('(f) preserves the production v3 fixture canonical text and sha256 digest', () => {
    const fixture: ActionPlan = JSON.parse(readFileSync(
      new URL('./fixtures/action-plan-v3-forma.json', import.meta.url), 'utf8',
    ));
    const parsed = ActionPlanSchema.parse(fixture);
    const canonical = actionPlanCanonicalJson(parsed);
    expect(parsed).toEqual(fixture);
    expect(canonical).toBe(actionPlanCanonicalJson(fixture));
    expect(createHash('sha256').update(canonical).digest('hex')).toBe(fixture.digest);
  });

  it('(g) exposes the mini-brief and user goal descriptions in the Director JSON schema', () => {
    const schema = z.toJSONSchema(ActionPlanDraftSchema);
    expect(schema).toHaveProperty(
      'properties.businessUnits.items.properties.sections.description',
      expect.stringContaining('mini-brief'),
    );
    expect(schema).toHaveProperty(
      'properties.businessUnits.items.properties.sections.items.properties.expectedGoal.description',
      expect.stringContaining("cosa potrà fare l'utente"),
    );
  });
});
