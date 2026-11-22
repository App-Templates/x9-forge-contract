"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.designTasteProblems = exports.designTasteAppFailures = exports.DesignTasteThresholdsSchema = exports.DesignTasteScoreSchema = exports.designTasteTotal = exports.DESIGN_TASTE_APP_CHECK_IDS = exports.DESIGN_TASTE_MAX = exports.DESIGN_TASTE_GRID_ITEMS = exports.designBrandTokenProblems = exports.DesignBrandTokensSchema = exports.designScoreGaps = exports.designRefereeProblems = exports.designScoreProblems = exports.DesignScoreThresholdsSchema = exports.DesignRefereeVoteSchema = exports.DesignCritiqueScoreSchema = exports.DesignAuditScoreSchema = exports.designCritiqueTotal = exports.designAuditTotal = exports.DESIGN_SCORE_SCHEMA_ISSUES = exports.DESIGN_SCORE_PROBLEMS = exports.DESIGN_AUDIT_MAX = exports.DESIGN_CRITIQUE_HEURISTICS = exports.DESIGN_AUDIT_DIMENSIONS = void 0;
const zod_1 = require("zod");
// Scores of the design skills (Impeccable audit and critique) and the brand tokens, as contract types.
// Thresholds are NOT constants here: the caller passes them (they live in the model, as data, so
// changing "good enough" never means changing a check).
// Impeccable audit: 5 dimensions, each 0-4, total out of 20.
exports.DESIGN_AUDIT_DIMENSIONS = ['accessibility', 'performance', 'theming', 'responsive', 'implementation_integrity'];
// Impeccable critique: 10 heuristics, each 0-4 or null (n/a), total out of 4 x the scored ones.
exports.DESIGN_CRITIQUE_HEURISTICS = [
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
exports.DESIGN_AUDIT_MAX = 20;
const SCORE_MAX = 4;
// Codes consumers key on (R-14): schema refusals and check results.
exports.DESIGN_SCORE_PROBLEMS = [
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
exports.DESIGN_SCORE_SCHEMA_ISSUES = ['audit_total_mismatch', 'critique_total_mismatch', 'critique_max_mismatch', 'colors_not_unique', 'fonts_not_unique', 'logos_not_unique', 'thresholds_inconsistent', 'taste_total_mismatch'];
// Identity helper: a message outside the list above does not compile.
const schemaIssue = (code) => code;
const ScoreSchema = zod_1.z.number().int().min(0).max(SCORE_MAX);
const designAuditTotal = (scores) => exports.DESIGN_AUDIT_DIMENSIONS.reduce((sum, key) => sum + scores[key], 0);
exports.designAuditTotal = designAuditTotal;
// n/a heuristics lower the maximum: a total is never read as /40 on a partial set.
const designCritiqueTotal = (scores) => {
    let total = 0;
    let scored = 0;
    for (const key of exports.DESIGN_CRITIQUE_HEURISTICS) {
        const value = scores[key];
        if (value === null)
            continue;
        total += value;
        scored += 1;
    }
    return { total, max: scored * SCORE_MAX, scored };
};
exports.designCritiqueTotal = designCritiqueTotal;
exports.DesignAuditScoreSchema = zod_1.z
    .strictObject({
    scores: zod_1.z.strictObject(Object.fromEntries(exports.DESIGN_AUDIT_DIMENSIONS.map((key) => [key, ScoreSchema]))),
    total: zod_1.z.number().int().min(0).max(exports.DESIGN_AUDIT_MAX),
    max: zod_1.z.literal(exports.DESIGN_AUDIT_MAX),
})
    .superRefine((audit, ctx) => {
    // a declared total that is not the sum would let a weak design look good
    if (audit.total !== (0, exports.designAuditTotal)(audit.scores))
        ctx.addIssue({ code: 'custom', path: ['total'], message: schemaIssue('audit_total_mismatch') });
});
exports.DesignCritiqueScoreSchema = zod_1.z
    .strictObject({
    scores: zod_1.z.strictObject(Object.fromEntries(exports.DESIGN_CRITIQUE_HEURISTICS.map((key) => [key, ScoreSchema.nullable()]))),
    total: zod_1.z.number().int().min(0).max(exports.DESIGN_CRITIQUE_HEURISTICS.length * SCORE_MAX),
    max: zod_1.z.number().int().min(0).max(exports.DESIGN_CRITIQUE_HEURISTICS.length * SCORE_MAX),
})
    .superRefine((critique, ctx) => {
    const derived = (0, exports.designCritiqueTotal)(critique.scores);
    if (critique.total !== derived.total)
        ctx.addIssue({ code: 'custom', path: ['total'], message: schemaIssue('critique_total_mismatch') });
    if (critique.max !== derived.max)
        ctx.addIssue({ code: 'custom', path: ['max'], message: schemaIssue('critique_max_mismatch') });
});
// The referee's vote uses the same audit grid; brand is 0-4 or null when no brand applies.
exports.DesignRefereeVoteSchema = zod_1.z.strictObject({
    audit: exports.DesignAuditScoreSchema,
    brand: ScoreSchema.nullable(),
    atExamplesLevel: zod_1.z.boolean(),
});
exports.DesignScoreThresholdsSchema = zod_1.z
    .strictObject({
    dimensionMin: zod_1.z.number().int().min(0).max(SCORE_MAX),
    auditTotalMin: zod_1.z.number().int().min(0).max(exports.DESIGN_AUDIT_MAX),
    critiqueMin: zod_1.z.number().int().min(0).max(exports.DESIGN_CRITIQUE_HEURISTICS.length * SCORE_MAX),
    critiqueOutOf: zod_1.z.number().int().min(1).max(exports.DESIGN_CRITIQUE_HEURISTICS.length * SCORE_MAX),
    // blocks "almost everything is n/a" as a way around the critique
    critiqueMinScored: zod_1.z.number().int().min(1).max(exports.DESIGN_CRITIQUE_HEURISTICS.length),
    // largest accepted distance between session and referee, per audit dimension
    gapMax: zod_1.z.number().int().min(0).max(SCORE_MAX),
})
    .superRefine((t, ctx) => {
    if (t.critiqueMin > t.critiqueOutOf)
        ctx.addIssue({ code: 'custom', path: ['critiqueMin'], message: schemaIssue('thresholds_inconsistent') });
});
const auditProblems = (audit, thresholds) => {
    const problems = [];
    if (audit.total < thresholds.auditTotalMin)
        problems.push({ code: 'audit_total_below' });
    for (const key of exports.DESIGN_AUDIT_DIMENSIONS) {
        if (audit.scores[key] < thresholds.dimensionMin)
            problems.push({ code: 'audit_dimension_below', dimension: key });
    }
    return problems;
};
const designScoreProblems = (input, thresholds) => {
    const { audit, critique } = input;
    const problems = auditProblems(audit, thresholds);
    // proportion, not raw total: n/a heuristics lower the maximum (cross-multiplied to stay in integers)
    if (critique.total * thresholds.critiqueOutOf < thresholds.critiqueMin * critique.max)
        problems.push({ code: 'critique_total_below' });
    if ((0, exports.designCritiqueTotal)(critique.scores).scored < thresholds.critiqueMinScored)
        problems.push({ code: 'critique_too_few_scored' });
    return problems;
};
exports.designScoreProblems = designScoreProblems;
const designRefereeProblems = (vote, thresholds) => {
    const problems = auditProblems(vote.audit, thresholds);
    if (vote.brand !== null && vote.brand < thresholds.dimensionMin)
        problems.push({ code: 'brand_below' });
    if (!vote.atExamplesLevel)
        problems.push({ code: 'not_at_examples_level' });
    return problems;
};
exports.designRefereeProblems = designRefereeProblems;
// Where session and referee disagree by more than gapMax: the human looks at those first.
const designScoreGaps = (session, referee, thresholds) => {
    const gaps = [];
    for (const dimension of exports.DESIGN_AUDIT_DIMENSIONS) {
        const gap = Math.abs(session.scores[dimension] - referee.scores[dimension]);
        if (gap > thresholds.gapMax)
            gaps.push({ dimension, session: session.scores[dimension], referee: referee.scores[dimension], gap });
    }
    return gaps;
};
exports.designScoreGaps = designScoreGaps;
// "#ABC" and "#aabbcc" are the same colour: compare the expanded lower-case form.
const normalizeColor = (color) => {
    const hex = '#' + color.slice(1).toLowerCase();
    return hex.length === 4 ? '#' + [...hex.slice(1)].map((c) => c + c).join('') : hex;
};
const normalizeFont = (font) => font.trim().toLowerCase();
const ColorSchema = zod_1.z.string().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
const FontSchema = zod_1.z.string().trim().min(1).max(100);
const isUnique = (values) => new Set(values).size === values.length;
exports.DesignBrandTokensSchema = zod_1.z
    .strictObject({
    colors: zod_1.z.array(ColorSchema).min(1).max(64),
    fonts: zod_1.z.array(FontSchema).min(1).max(8),
    logoIds: zod_1.z.array(zod_1.z.string().min(1).max(200)).max(32),
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
const designBrandTokenProblems = (tokens, used, deviations = { colors: [], fonts: [] }) => {
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
exports.designBrandTokenProblems = designBrandTokenProblems;
// Taste grid: the decided taste (typography, controls, imagery, colour/material, delight, composition),
// 6 items each 0-4. Impeccable measures correctness; this grid measures whether the result looks good.
exports.DESIGN_TASTE_GRID_ITEMS = ['typography', 'controls', 'imagery', 'color_material', 'delight', 'composition'];
exports.DESIGN_TASTE_MAX = exports.DESIGN_TASTE_GRID_ITEMS.length * SCORE_MAX;
// The Taste checks (consistency.mjs) that are valid on an app, with the grid item each one feeds.
// Site-only checks are left out on purpose: on an app they would fail every time. One list here, so
// the executor and the referee judge the same checks (a decision in one place only).
exports.DESIGN_TASTE_APP_CHECK_IDS = {
    'font-load': 'typography', 'heading-scale': 'typography', 'body-size': 'typography',
    'button-styles': 'controls', 'button-shape': 'controls', 'fake-button': 'controls', 'label-centre': 'controls',
    'link-styles': 'controls', 'card-family': 'controls', nesting: 'controls',
    'empty-visual': 'imagery',
    'text-contrast': 'color_material', 'button-contrast': 'color_material',
    hover: 'delight', 'focus-ring': 'delight', 'a11y-name': 'delight', 'reduced-motion': 'delight', 'scroll-reveal': 'delight',
    'container-edges': 'composition', 'off-viewport': 'composition', collide: 'composition', 'tap-size': 'composition',
    'cut-text': 'composition', hole: 'composition', tilt: 'composition',
};
const designTasteTotal = (scores) => exports.DESIGN_TASTE_GRID_ITEMS.reduce((sum, key) => sum + scores[key], 0);
exports.designTasteTotal = designTasteTotal;
exports.DesignTasteScoreSchema = zod_1.z
    .strictObject({
    scores: zod_1.z.strictObject(Object.fromEntries(exports.DESIGN_TASTE_GRID_ITEMS.map((key) => [key, ScoreSchema]))),
    total: zod_1.z.number().int().min(0).max(exports.DESIGN_TASTE_MAX),
    max: zod_1.z.literal(exports.DESIGN_TASTE_MAX),
})
    .superRefine((taste, ctx) => {
    // a declared total that is not the sum would let an ugly design look good
    if (taste.total !== (0, exports.designTasteTotal)(taste.scores))
        ctx.addIssue({ code: 'custom', path: ['total'], message: schemaIssue('taste_total_mismatch') });
});
// Like the other thresholds these are model data, never constants of a check.
exports.DesignTasteThresholdsSchema = zod_1.z.strictObject({
    itemMin: zod_1.z.number().int().min(0).max(SCORE_MAX),
    totalMin: zod_1.z.number().int().min(0).max(exports.DESIGN_TASTE_MAX),
    // ceiling of an item that has a FAIL among its Taste checks: a grid score cannot outvote a failed check
    itemMaxWithFail: zod_1.z.number().int().min(0).max(SCORE_MAX),
});
/** Failed Taste checks that count on an app, once each, with the grid item they belong to. */
const designTasteAppFailures = (failedIds) => {
    const seen = new Set();
    const failures = [];
    for (const id of failedIds) {
        // hasOwn: an id such as "toString" must not match an inherited property
        if (seen.has(id) || !Object.hasOwn(exports.DESIGN_TASTE_APP_CHECK_IDS, id))
            continue;
        seen.add(id);
        const known = id;
        failures.push({ id: known, item: exports.DESIGN_TASTE_APP_CHECK_IDS[known] });
    }
    return failures;
};
exports.designTasteAppFailures = designTasteAppFailures;
const designTasteProblems = (taste, thresholds, failedIds = []) => {
    const problems = [];
    if (taste.total < thresholds.totalMin)
        problems.push({ code: 'taste_total_below' });
    const failedItems = new Set((0, exports.designTasteAppFailures)(failedIds).map(({ item }) => item));
    for (const item of exports.DESIGN_TASTE_GRID_ITEMS) {
        if (taste.scores[item] < thresholds.itemMin)
            problems.push({ code: 'taste_item_below', item });
        if (failedItems.has(item) && taste.scores[item] > thresholds.itemMaxWithFail)
            problems.push({ code: 'taste_item_above_failed_check', item });
    }
    return problems;
};
exports.designTasteProblems = designTasteProblems;
//# sourceMappingURL=design-score.js.map