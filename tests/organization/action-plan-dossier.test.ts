import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  ActionPlanDossierPageSchema,
  ActionPlanDraftSchema,
  ActionPlanSchema,
  ActionPlanSubmissionSchema,
  actionPlanCanonicalJson,
  type ActionPlanDraft,
} from '../../src/organization/action-plan.js';
import type * as ActionPlanContracts from '../../src/organization/action-plan.js';

const require = createRequire(import.meta.url);

function savedPlan(): unknown {
  // The production plan approved on November 9 predates the dossier field.
  return JSON.parse(readFileSync(new URL('./fixtures/action-plan-v3-forma.json', import.meta.url), 'utf8'));
}

function submission(): ActionPlanDraft {
  const { digest: _digest, tenantId: _tenantId, organizationId: _organizationId, ...draft } =
    ActionPlanSchema.parse(savedPlan());
  return {
    ...draft,
    businessUnits: draft.businessUnits.map((unit) => ({
      ...unit,
      sections: [{
        id: 'initial-review',
        title: 'Review the dossier',
        expectedGoal: 'The owner can assess the evidence for this unit.',
        deliveryCriteria: ['The dossier review is documented.'],
        milestone: draft.milestones[0].number,
      }],
    })),
    dossier: [{ slug: 'fonti-alimentari', version: 1 }, { slug: 'diritti-dati', version: 2 }],
    deliveryShape: 'study',
  };
}

describe('Action plan dossier', () => {
  it('s5944 a submission without dossier is refused on actionPlan.dossier', () => {
    const actionPlan = submission();
    delete actionPlan.dossier;
    const result = z.strictObject({ actionPlan: ActionPlanSubmissionSchema }).safeParse({ actionPlan });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ code: 'custom', path: ['actionPlan', 'dossier'] }),
    ]);
  });

  it('s5944 a submission with dossier pages parses', () => {
    const input = submission();
    expect(ActionPlanSubmissionSchema.parse(input)).toEqual(input);
  });

  it('s5944 duplicated dossier slugs are refused', () => {
    const input = submission();
    input.dossier = [{ slug: 'fonti-alimentari', version: 1 }, { slug: 'fonti-alimentari', version: 2 }];
    for (const schema of [ActionPlanDraftSchema, ActionPlanSubmissionSchema]) {
      const result = schema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.issues).toEqual([
        expect.objectContaining({ path: ['dossier'], message: 'Dossier page slugs must be unique' }),
      ]);
    }
    expect(ActionPlanSchema.safeParse({ ...ActionPlanSchema.parse(savedPlan()), dossier: input.dossier }).success)
      .toBe(false);
  });

  it('s5944 a saved plan without dossier parses', () => {
    const fixture = savedPlan();
    const parsed = ActionPlanSchema.parse(fixture);
    expect(parsed.planId).toBe('plan_2880531b-8048-4666-853a-2c25fd762ecd');
    expect(parsed).toEqual(fixture);
    expect(parsed).not.toHaveProperty('dossier');
    expect(createHash('sha256').update(actionPlanCanonicalJson(parsed)).digest('hex')).toBe(parsed.digest);
    const draft = submission();
    delete draft.dossier;
    expect(ActionPlanDraftSchema.parse(draft)).toEqual(draft);
  });

  it('s5944 the CommonJS dist refuses a submission without dossier', () => {
    const commonJs: typeof ActionPlanContracts = require('../../dist/organization/action-plan.cjs');
    const input = submission();
    expect(commonJs.ActionPlanSubmissionSchema.parse(input)).toEqual(input);
    delete input.dossier;
    const result = commonJs.ActionPlanSubmissionSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([expect.objectContaining({ path: ['dossier'] })]);
    expect(commonJs.ActionPlanSchema.parse(savedPlan())).toEqual(savedPlan());
  });

  it('s5944 an empty dossier is refused only for a new submission', () => {
    const input = { ...submission(), dossier: [] };
    const result = ActionPlanSubmissionSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([expect.objectContaining({ path: ['dossier'] })]);
    expect(ActionPlanDraftSchema.parse(input)).toEqual(input);
    const saved = { ...ActionPlanSchema.parse(savedPlan()), dossier: [] };
    expect(ActionPlanSchema.parse(saved)).toEqual(saved);
  });

  it('s5944 dossier accepts fifty pages and refuses fifty-one', () => {
    const pages = Array.from({ length: 50 }, (_, index) => ({ slug: `page-${index}`, version: 1 }));
    expect(ActionPlanSubmissionSchema.parse({ ...submission(), dossier: pages }).dossier).toEqual(pages);
    const result = ActionPlanSubmissionSchema.safeParse({
      ...submission(), dossier: [...pages, { slug: 'page-50', version: 1 }],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([expect.objectContaining({ path: ['dossier'], code: 'too_big' })]);
  });

  it('s5944 dossier pages require wiki slugs, positive integer versions and no extra keys', () => {
    const page = { slug: 'fonti-alimentari', version: 1 };
    expect(ActionPlanDossierPageSchema.parse(page)).toEqual(page);
    for (const invalid of [
      { ...page, slug: 'Invalid slug' },
      { ...page, slug: 'a'.repeat(121) },
      { ...page, version: 0 },
      { ...page, version: 1.5 },
      { slug: page.slug },
      { ...page, title: 'Unexpected field' },
    ]) {
      expect(ActionPlanDossierPageSchema.safeParse(invalid).success).toBe(false);
    }
  });
});
