import { z } from 'zod';
// Scores of the design skills (Impeccable audit and critique) and the brand tokens, as contract types.
// Thresholds are NOT constants here: the caller passes them (they live in the model, as data, so
// changing "good enough" never means changing a check).
// Impeccable audit: 5 dimensions, each 0-4, total out of 20.
export const DESIGN_AUDIT_DIMENSIONS = ['accessibility', 'performance', 'theming', 'responsive', 'implementation_integrity'];
// Impeccable critique: 10 heuristics, each 0-4 or null (n/a), total out of 4 x the scored ones.
export const DESIGN_CRITIQUE_HEURISTICS = [
    'visibility_of_system_status',
    'match_system_real_world',
    'user_control_freedom',
    'consistency_standards',
    'error_prevention',
    'recognition_over_recall',
    'flexibility_efficiency',
    'aesthetic_minimalist_design',
    'error_recovery',
    'help_documentation',
];
export const DESIGN_AUDIT_MAX = 20;
const SCORE_MAX = 4;
// Codes consumers key on (R-14): schema refusals and check results.
export const DESIGN_SCORE_PROBLEMS = [
    'audit_total_below',
    'audit_dimension_below',
    'critique_total_below',
    'critique_too_few_scored',
    'brand_below',
    'not_at_examples_level',
    'color_not_token',
    'font_not_token',
    // Taste grid: appended last so codes already consumed keep their position.
    'taste_total_below',
    'taste_item_below',
    'taste_item_above_failed_check',
];
export const DESIGN_SCORE_SCHEMA_ISSUES = ['audit_total_mismatch', 'critique_total_mismatch', 'critique_max_mismatch', 'colors_not_unique', 'fonts_not_unique', 'logos_not_unique', 'thresholds_inconsistent', 'taste_total_mismatch'];
// Identity helper: a message outside the list above does not compile.
const schemaIssue = (code) => code;
const ScoreSchema = z.number().int().min(0).max(SCORE_MAX);
export const designAuditTotal = (scores) => DESIGN_AUDIT_DIMENSIONS.reduce((sum, key) => sum + scores[key], 0);
// n/a heuristics lower the maximum: a total is never read as /40 on a partial set.
export const designCritiqueTotal = (scores) => {
    let total = 0;
    let scored = 0;
    for (const key of DESIGN_CRITIQUE_HEURISTICS) {
        const value = scores[key];
        if (value === null)
            continue;
        total += value;
        scored += 1;
    }
    return { total, max: scored * SCORE_MAX, scored };
};
export const DesignAuditScoreSchema = z
    .strictObject({
    scores: z.strictObject(Object.fromEntries(DESIGN_AUDIT_DIMENSIONS.map((key) => [key, ScoreSchema]))),
    total: z.number().int().min(0).max(DESIGN_AUDIT_MAX),
    max: z.literal(DESIGN_AUDIT_MAX),
})
    .superRefine((audit, ctx) => {
    // a declared total that is not the sum would let a weak design look good
    if (audit.total !== designAuditTotal(audit.scores))
        ctx.addIssue({ code: 'custom', path: ['total'], message: schemaIssue('audit_total_mismatch') });
});
export const DesignCritiqueScoreSchema = z
    .strictObject({
    scores: z.strictObject(Object.fromEntries(DESIGN_CRITIQUE_HEURISTICS.map((key) => [key, ScoreSchema.nullable()]))),
    total: z.number().int().min(0).max(DESIGN_CRITIQUE_HEURISTICS.length * SCORE_MAX),
    max: z.number().int().min(0).max(DESIGN_CRITIQUE_HEURISTICS.length * SCORE_MAX),
})
    .superRefine((critique, ctx) => {
    const derived = designCritiqueTotal(critique.scores);
    if (critique.total !== derived.total)
        ctx.addIssue({ code: 'custom', path: ['total'], message: schemaIssue('critique_total_mismatch') });
    if (critique.max !== derived.max)
        ctx.addIssue({ code: 'custom', path: ['max'], message: schemaIssue('critique_max_mismatch') });
});
// The referee's vote uses the same audit grid; brand is 0-4 or null when no brand applies.
export const DesignRefereeVoteSchema = z.strictObject({
    audit: DesignAuditScoreSchema,
    brand: ScoreSchema.nullable(),
    atExamplesLevel: z.boolean(),
});
export const DesignScoreThresholdsSchema = z
    .strictObject({
    dimensionMin: z.number().int().min(0).max(SCORE_MAX),
    auditTotalMin: z.number().int().min(0).max(DESIGN_AUDIT_MAX),
    critiqueMin: z.number().int().min(0).max(DESIGN_CRITIQUE_HEURISTICS.length * SCORE_MAX),
    critiqueOutOf: z.number().int().min(1).max(DESIGN_CRITIQUE_HEURISTICS.length * SCORE_MAX),
    // blocks "almost everything is n/a" as a way around the critique
    critiqueMinScored: z.number().int().min(1).max(DESIGN_CRITIQUE_HEURISTICS.length),
    // largest accepted distance between session and referee, per audit dimension
    gapMax: z.number().int().min(0).max(SCORE_MAX),
})
    .superRefine((t, ctx) => {
    if (t.critiqueMin > t.critiqueOutOf)
        ctx.addIssue({ code: 'custom', path: ['critiqueMin'], message: schemaIssue('thresholds_inconsistent') });
});
const auditProblems = (audit, thresholds) => {
    const problems = [];
    if (audit.total < thresholds.auditTotalMin)
        problems.push({ code: 'audit_total_below' });
    for (const key of DESIGN_AUDIT_DIMENSIONS) {
        if (audit.scores[key] < thresholds.dimensionMin)
            problems.push({ code: 'audit_dimension_below', dimension: key });
    }
    return problems;
};
export const designScoreProblems = (input, thresholds) => {
    const { audit, critique } = input;
    const problems = auditProblems(audit, thresholds);
    // proportion, not raw total: n/a heuristics lower the maximum (cross-multiplied to stay in integers)
    if (critique.total * thresholds.critiqueOutOf < thresholds.critiqueMin * critique.max)
        problems.push({ code: 'critique_total_below' });
    if (designCritiqueTotal(critique.scores).scored < thresholds.critiqueMinScored)
        problems.push({ code: 'critique_too_few_scored' });
    return problems;
};
export const designRefereeProblems = (vote, thresholds) => {
    const problems = auditProblems(vote.audit, thresholds);
    if (vote.brand !== null && vote.brand < thresholds.dimensionMin)
        problems.push({ code: 'brand_below' });
    if (!vote.atExamplesLevel)
        problems.push({ code: 'not_at_examples_level' });
    return problems;
};
// Where session and referee disagree by more than gapMax: the human looks at those first.
export const designScoreGaps = (session, referee, thresholds) => {
    const gaps = [];
    for (const dimension of DESIGN_AUDIT_DIMENSIONS) {
        const gap = Math.abs(session.scores[dimension] - referee.scores[dimension]);
        if (gap > thresholds.gapMax)
            gaps.push({ dimension, session: session.scores[dimension], referee: referee.scores[dimension], gap });
    }
    return gaps;
};
// "#ABC" and "#aabbcc" are the same colour: compare the expanded lower-case form.
const normalizeColor = (color) => {
    const hex = '#' + color.slice(1).toLowerCase();
    return hex.length === 4 ? '#' + [...hex.slice(1)].map((c) => c + c).join('') : hex;
};
const normalizeFont = (font) => font.trim().toLowerCase();
const ColorSchema = z.string().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
const FontSchema = z.string().trim().min(1).max(100);
const isUnique = (values) => new Set(values).size === values.length;
export const DesignBrandTokensSchema = z
    .strictObject({
    colors: z.array(ColorSchema).min(1).max(64),
    fonts: z.array(FontSchema).min(1).max(8),
    logoIds: z.array(z.string().min(1).max(200)).max(32),
})
    .superRefine((tokens, ctx) => {
    if (!isUnique(tokens.colors.map(normalizeColor)))
        ctx.addIssue({ code: 'custom', path: ['colors'], message: schemaIssue('colors_not_unique') });
    if (!isUnique(tokens.fonts.map(normalizeFont)))
        ctx.addIssue({ code: 'custom', path: ['fonts'], message: schemaIssue('fonts_not_unique') });
    if (!isUnique(tokens.logoIds))
        ctx.addIssue({ code: 'custom', path: ['logoIds'], message: schemaIssue('logos_not_unique') });
});
// Used colours/fonts that are neither tokens nor deviations declared in D-08.
export const designBrandTokenProblems = (tokens, used, deviations = { colors: [], fonts: [] }) => {
    const colors = new Set([...tokens.colors, ...deviations.colors].map(normalizeColor));
    const fonts = new Set([...tokens.fonts, ...deviations.fonts].map(normalizeFont));
    const problems = [];
    for (const color of used.colors)
        if (!colors.has(normalizeColor(color)))
            problems.push({ code: 'color_not_token', value: color });
    for (const font of used.fonts)
        if (!fonts.has(normalizeFont(font)))
            problems.push({ code: 'font_not_token', value: font });
    return problems;
};
// Taste grid: the decided taste (typography, controls, imagery, colour/material, delight, composition),
// 6 items each 0-4. Impeccable measures correctness; this grid measures whether the result looks good.
export const DESIGN_TASTE_GRID_ITEMS = ['typography', 'controls', 'imagery', 'color_material', 'delight', 'composition'];
export const DESIGN_TASTE_MAX = DESIGN_TASTE_GRID_ITEMS.length * SCORE_MAX;
// The Taste checks (consistency.mjs) that are valid on an app, with the grid item each one feeds.
// Site-only checks are left out on purpose: on an app they would fail every time. One list here, so
// the executor and the referee judge the same checks (a decision in one place only).
export const DESIGN_TASTE_APP_CHECK_IDS = {
    'font-load': 'typography', 'heading-scale': 'typography', 'body-size': 'typography',
    'button-styles': 'controls', 'button-shape': 'controls', 'fake-button': 'controls', 'label-centre': 'controls',
    'link-styles': 'controls', 'card-family': 'controls', nesting: 'controls',
    'empty-visual': 'imagery',
    'text-contrast': 'color_material', 'button-contrast': 'color_material',
    hover: 'delight', 'focus-ring': 'delight', 'a11y-name': 'delight', 'reduced-motion': 'delight', 'scroll-reveal': 'delight',
    'container-edges': 'composition', 'off-viewport': 'composition', collide: 'composition', 'tap-size': 'composition',
    'cut-text': 'composition', hole: 'composition', tilt: 'composition',
};
export const designTasteTotal = (scores) => DESIGN_TASTE_GRID_ITEMS.reduce((sum, key) => sum + scores[key], 0);
export const DesignTasteScoreSchema = z
    .strictObject({
    scores: z.strictObject(Object.fromEntries(DESIGN_TASTE_GRID_ITEMS.map((key) => [key, ScoreSchema]))),
    total: z.number().int().min(0).max(DESIGN_TASTE_MAX),
    max: z.literal(DESIGN_TASTE_MAX),
})
    .superRefine((taste, ctx) => {
    // a declared total that is not the sum would let an ugly design look good
    if (taste.total !== designTasteTotal(taste.scores))
        ctx.addIssue({ code: 'custom', path: ['total'], message: schemaIssue('taste_total_mismatch') });
});
// Like the other thresholds these are model data, never constants of a check.
export const DesignTasteThresholdsSchema = z.strictObject({
    itemMin: z.number().int().min(0).max(SCORE_MAX),
    totalMin: z.number().int().min(0).max(DESIGN_TASTE_MAX),
    // ceiling of an item that has a FAIL among its Taste checks: a grid score cannot outvote a failed check
    itemMaxWithFail: z.number().int().min(0).max(SCORE_MAX),
});
/** Failed Taste checks that count on an app, once each, with the grid item they belong to. */
export const designTasteAppFailures = (failedIds) => {
    const seen = new Set();
    const failures = [];
    for (const id of failedIds) {
        // hasOwn: an id such as "toString" must not match an inherited property
        if (seen.has(id) || !Object.hasOwn(DESIGN_TASTE_APP_CHECK_IDS, id))
            continue;
        seen.add(id);
        const known = id;
        failures.push({ id: known, item: DESIGN_TASTE_APP_CHECK_IDS[known] });
    }
    return failures;
};
export const designTasteProblems = (taste, thresholds, failedIds = []) => {
    const problems = [];
    if (taste.total < thresholds.totalMin)
        problems.push({ code: 'taste_total_below' });
    const failedItems = new Set(designTasteAppFailures(failedIds).map(({ item }) => item));
    for (const item of DESIGN_TASTE_GRID_ITEMS) {
        if (taste.scores[item] < thresholds.itemMin)
            problems.push({ code: 'taste_item_below', item });
        if (failedItems.has(item) && taste.scores[item] > thresholds.itemMaxWithFail)
            problems.push({ code: 'taste_item_above_failed_check', item });
    }
    return problems;
};
//# sourceMappingURL=design-score.js.map