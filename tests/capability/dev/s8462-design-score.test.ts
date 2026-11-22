import { describe, expect, it } from 'vitest';
import {
  DESIGN_AUDIT_DIMENSIONS,
  DESIGN_CRITIQUE_HEURISTICS,
  DesignAuditScoreSchema,
  DesignBrandTokensSchema,
  DesignCritiqueScoreSchema,
  DesignRefereeVoteSchema,
  DesignScoreThresholdsSchema,
  designAuditTotal,
  designBrandTokenProblems,
  designCritiqueTotal,
  designRefereeProblems,
  designScoreGaps,
  designScoreProblems,
} from '../../../src/capability/design-score.js';

// Recommended values from the plan; the real ones are data in the model (task 8463).
const thresholds = DesignScoreThresholdsSchema.parse({
  dimensionMin: 3,
  auditTotalMin: 16,
  critiqueMin: 30,
  critiqueOutOf: 40,
  critiqueMinScored: 8,
  gapMax: 1,
});

const audit = (a: number, b: number, c: number, d: number, e: number) => {
  const scores = { accessibility: a, performance: b, theming: c, responsive: d, implementation_integrity: e };
  return DesignAuditScoreSchema.parse({ scores, total: a + b + c + d + e, max: 20 });
};

const critique = (values: Array<number | null>) => {
  const scores = Object.fromEntries(DESIGN_CRITIQUE_HEURISTICS.map((h, i) => [h, values[i] ?? null]));
  const scored = values.filter((v): v is number => v !== null);
  return DesignCritiqueScoreSchema.parse({
    scores,
    total: scored.reduce((s, v) => s + v, 0),
    max: scored.length * 4,
  });
};

const codes = (list: Array<{ code: string }>) => list.map((p) => p.code);
const good = audit(3, 3, 3, 3, 4);
const c30 = critique([3, 3, 3, 3, 3, 3, 3, 3, 3, 3]);

describe('s8462 design score', () => {
  it('s8462 regressione-r64-senza-punteggi-buoni', () => {
    // audit 15/20 (below 16)
    const low = audit(3, 3, 3, 3, 3);
    expect(codes(designScoreProblems({ audit: low, critique: c30 }, thresholds))).toEqual(['audit_total_below']);
    // one dimension at 2 even if the total is 16
    const dim = audit(2, 4, 4, 3, 3);
    expect(dim.total).toBe(16);
    expect(designScoreProblems({ audit: dim, critique: c30 }, thresholds)).toEqual([
      { code: 'audit_dimension_below', dimension: 'accessibility' },
    ]);
    // critique under the threshold (29/40)
    const c29 = critique([3, 3, 3, 3, 3, 3, 3, 3, 3, 2]);
    expect(codes(designScoreProblems({ audit: good, critique: c29 }, thresholds))).toEqual(['critique_total_below']);
    // declared total different from the sum is refused by the schema
    expect(DesignAuditScoreSchema.safeParse({ scores: good.scores, total: 19, max: 20 }).success).toBe(false);
    // the good shape has no problem
    expect(designScoreProblems({ audit: good, critique: c30 }, thresholds)).toEqual([]);
  });

  it('derives totals', () => {
    expect(DESIGN_AUDIT_DIMENSIONS).toHaveLength(5);
    expect(designAuditTotal(good.scores)).toBe(16);
    expect(designCritiqueTotal(critique([4, null, 2, null, 1, 0, 3, 3, 3, 3]).scores)).toEqual({ total: 19, max: 32, scored: 8 });
  });

  it('rejects wrong critique totals and out-of-range scores', () => {
    const scores = Object.fromEntries(DESIGN_CRITIQUE_HEURISTICS.map((h) => [h, 3]));
    expect(DesignCritiqueScoreSchema.safeParse({ scores, total: 30, max: 40 }).success).toBe(true);
    expect(DesignCritiqueScoreSchema.safeParse({ scores, total: 31, max: 40 }).success).toBe(false);
    expect(DesignCritiqueScoreSchema.safeParse({ scores, total: 30, max: 36 }).success).toBe(false);
    expect(DesignCritiqueScoreSchema.safeParse({ scores: { ...scores, error_recovery: 5 }, total: 32, max: 40 }).success).toBe(false);
    expect(DesignAuditScoreSchema.safeParse({ scores: { ...good.scores, extra: 1 }, total: 17, max: 20 }).success).toBe(false);
  });

  it('judges a critique with n/a entries in proportion', () => {
    const pass = critique([3, 3, 3, 3, 3, 3, 3, 3, null, null]); // 24/32
    const fail = critique([3, 3, 3, 3, 3, 3, 3, 2, null, null]); // 23/32
    expect(pass.max).toBe(32);
    expect(designScoreProblems({ audit: good, critique: pass }, thresholds)).toEqual([]);
    expect(codes(designScoreProblems({ audit: good, critique: fail }, thresholds))).toEqual(['critique_total_below']);
  });

  it('refuses a critique with too few scored heuristics', () => {
    const few = critique([4, 4, 4, 4, 4, 4, 4, null, null, null]); // 7 scored, 28/28
    expect(codes(designScoreProblems({ audit: good, critique: few }, thresholds))).toEqual(['critique_too_few_scored']);
  });

  it('checks the referee vote and the gaps', () => {
    const vote = DesignRefereeVoteSchema.parse({ audit: good, brand: 3, atExamplesLevel: true });
    expect(designRefereeProblems(vote, thresholds)).toEqual([]);
    const bad = DesignRefereeVoteSchema.parse({ audit: audit(3, 3, 2, 3, 3), brand: 2, atExamplesLevel: false });
    expect(codes(designRefereeProblems(bad, thresholds)).sort()).toEqual(
      ['audit_dimension_below', 'audit_total_below', 'brand_below', 'not_at_examples_level'].sort(),
    );
    expect(designRefereeProblems({ ...vote, brand: null }, thresholds)).toEqual([]);
    expect(DesignRefereeVoteSchema.safeParse({ audit: good, brand: 5, atExamplesLevel: true }).success).toBe(false);
    // gap exactly gapMax is allowed, above is reported
    expect(designScoreGaps(audit(3, 3, 3, 3, 4), audit(4, 3, 3, 3, 4), thresholds)).toEqual([]);
    expect(designScoreGaps(audit(3, 3, 3, 3, 4), audit(3, 3, 3, 3, 2), thresholds)).toEqual([
      { dimension: 'implementation_integrity', session: 4, referee: 2, gap: 2 },
    ]);
  });

  it('validates thresholds', () => {
    expect(DesignScoreThresholdsSchema.safeParse({ ...thresholds, dimensionMin: 5 }).success).toBe(false);
    expect(DesignScoreThresholdsSchema.safeParse({ ...thresholds, critiqueMin: 41 }).success).toBe(false);
    expect(DesignScoreThresholdsSchema.safeParse({ ...thresholds, extra: 1 }).success).toBe(false);
  });

  it('treats #ABC and #aabbcc as the same colour and fonts case-insensitively', () => {
    expect(DesignBrandTokensSchema.safeParse({ colors: ['#ABC', '#aabbcc'], fonts: ['Inter'], logoIds: ['l1'] }).success).toBe(false);
    expect(DesignBrandTokensSchema.safeParse({ colors: ['#abc'], fonts: ['Inter', 'inter'], logoIds: ['l1'] }).success).toBe(false);
    expect(DesignBrandTokensSchema.safeParse({ colors: ['red'], fonts: ['Inter'], logoIds: [] }).success).toBe(false);
    const tokens = DesignBrandTokensSchema.parse({ colors: ['#ABC', '#102030'], fonts: ['Inter'], logoIds: ['logo-1'] });
    expect(designBrandTokenProblems(tokens, { colors: ['#aabbcc', '#102030'], fonts: ['inter'] })).toEqual([]);
    expect(
      designBrandTokenProblems(tokens, { colors: ['#ff0000', '#AABBCC'], fonts: ['Comic'] }, { colors: [], fonts: [] }),
    ).toEqual([
      { code: 'color_not_token', value: '#ff0000' },
      { code: 'font_not_token', value: 'Comic' },
    ]);
    expect(
      designBrandTokenProblems(tokens, { colors: ['#FF0000'], fonts: ['Comic'] }, { colors: ['#f00'], fonts: ['comic'] }),
    ).toEqual([]);
  });
});
