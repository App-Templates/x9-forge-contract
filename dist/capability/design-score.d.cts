import { z } from 'zod';
export declare const DESIGN_AUDIT_DIMENSIONS: readonly ["accessibility", "performance", "theming", "responsive", "implementation_integrity"];
export type DesignAuditDimension = (typeof DESIGN_AUDIT_DIMENSIONS)[number];
export declare const DESIGN_CRITIQUE_HEURISTICS: readonly ["visibility_of_system_status", "match_system_real_world", "user_control_freedom", "consistency_standards", "error_prevention", "recognition_over_recall", "flexibility_efficiency", "aesthetic_minimalist_design", "error_recovery", "help_documentation"];
export type DesignCritiqueHeuristic = (typeof DESIGN_CRITIQUE_HEURISTICS)[number];
export declare const DESIGN_AUDIT_MAX = 20;
export declare const DESIGN_SCORE_PROBLEMS: readonly ["audit_total_below", "audit_dimension_below", "critique_total_below", "critique_too_few_scored", "brand_below", "not_at_examples_level", "color_not_token", "font_not_token", "taste_total_below", "taste_item_below", "taste_item_above_failed_check", "verdict_approves_below_thresholds"];
export type DesignScoreProblemCode = (typeof DESIGN_SCORE_PROBLEMS)[number];
export declare const DESIGN_SCORE_SCHEMA_ISSUES: readonly ["audit_total_mismatch", "critique_total_mismatch", "critique_max_mismatch", "colors_not_unique", "fonts_not_unique", "logos_not_unique", "thresholds_inconsistent", "taste_total_mismatch", "check_ids_not_unique"];
export declare const designAuditTotal: (scores: Record<DesignAuditDimension, number>) => number;
export declare const designCritiqueTotal: (scores: Record<DesignCritiqueHeuristic, number | null>) => {
    total: number;
    max: number;
    scored: number;
};
export declare const DesignAuditScoreSchema: z.ZodObject<{
    scores: z.ZodObject<Record<"accessibility" | "performance" | "theming" | "responsive" | "implementation_integrity", z.ZodNumber>, z.core.$strict>;
    total: z.ZodNumber;
    max: z.ZodLiteral<20>;
}, z.core.$strict>;
export type DesignAuditScore = z.infer<typeof DesignAuditScoreSchema>;
export declare const DesignCritiqueScoreSchema: z.ZodObject<{
    scores: z.ZodObject<Record<"visibility_of_system_status" | "match_system_real_world" | "user_control_freedom" | "consistency_standards" | "error_prevention" | "recognition_over_recall" | "flexibility_efficiency" | "aesthetic_minimalist_design" | "error_recovery" | "help_documentation", z.ZodNullable<z.ZodNumber>>, z.core.$strict>;
    total: z.ZodNumber;
    max: z.ZodNumber;
}, z.core.$strict>;
export type DesignCritiqueScore = z.infer<typeof DesignCritiqueScoreSchema>;
export declare const DesignRefereeVoteSchema: z.ZodObject<{
    audit: z.ZodObject<{
        scores: z.ZodObject<Record<"accessibility" | "performance" | "theming" | "responsive" | "implementation_integrity", z.ZodNumber>, z.core.$strict>;
        total: z.ZodNumber;
        max: z.ZodLiteral<20>;
    }, z.core.$strict>;
    brand: z.ZodNullable<z.ZodNumber>;
    atExamplesLevel: z.ZodBoolean;
}, z.core.$strict>;
export type DesignRefereeVote = z.infer<typeof DesignRefereeVoteSchema>;
export declare const DesignScoreThresholdsSchema: z.ZodObject<{
    dimensionMin: z.ZodNumber;
    auditTotalMin: z.ZodNumber;
    critiqueMin: z.ZodNumber;
    critiqueOutOf: z.ZodNumber;
    critiqueMinScored: z.ZodNumber;
    gapMax: z.ZodNumber;
}, z.core.$strict>;
export type DesignScoreThresholds = z.infer<typeof DesignScoreThresholdsSchema>;
export type DesignScoreProblem = {
    code: DesignScoreProblemCode;
    dimension?: DesignAuditDimension;
};
export declare const designScoreProblems: (input: {
    audit: DesignAuditScore;
    critique: DesignCritiqueScore;
}, thresholds: DesignScoreThresholds) => DesignScoreProblem[];
export declare const designRefereeProblems: (vote: DesignRefereeVote, thresholds: DesignScoreThresholds) => DesignScoreProblem[];
export declare const designScoreGaps: (session: DesignAuditScore, referee: DesignAuditScore, thresholds: DesignScoreThresholds) => Array<{
    dimension: DesignAuditDimension;
    session: number;
    referee: number;
    gap: number;
}>;
export declare const DesignBrandTokensSchema: z.ZodObject<{
    colors: z.ZodArray<z.ZodString>;
    fonts: z.ZodArray<z.ZodString>;
    logoIds: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type DesignBrandTokens = z.infer<typeof DesignBrandTokensSchema>;
export declare const DesignBrandDeviationsSchema: z.ZodObject<{
    colors: z.ZodArray<z.ZodObject<{
        value: z.ZodString;
        reason: z.ZodString;
    }, z.core.$strict>>;
    fonts: z.ZodArray<z.ZodObject<{
        value: z.ZodString;
        reason: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type DesignBrandDeviations = z.infer<typeof DesignBrandDeviationsSchema>;
export declare const designBrandDeviationValues: (d: DesignBrandDeviations) => {
    colors: string[];
    fonts: string[];
};
export declare const designBrandTokenProblems: (tokens: DesignBrandTokens, used: {
    colors: string[];
    fonts: string[];
}, deviations?: {
    colors: string[];
    fonts: string[];
}) => Array<{
    code: "color_not_token" | "font_not_token";
    value: string;
}>;
export declare const DESIGN_TASTE_GRID_ITEMS: readonly ["typography", "controls", "imagery", "color_material", "delight", "composition"];
export type DesignTasteGridItem = (typeof DESIGN_TASTE_GRID_ITEMS)[number];
export declare const DESIGN_TASTE_MAX: number;
export declare const DESIGN_TASTE_APP_CHECK_IDS: {
    readonly 'font-load': "typography";
    readonly 'heading-scale': "typography";
    readonly 'body-size': "typography";
    readonly 'button-styles': "controls";
    readonly 'button-shape': "controls";
    readonly 'fake-button': "controls";
    readonly 'label-centre': "controls";
    readonly 'link-styles': "controls";
    readonly 'card-family': "controls";
    readonly nesting: "controls";
    readonly 'empty-visual': "imagery";
    readonly 'text-contrast': "color_material";
    readonly 'button-contrast': "color_material";
    readonly hover: "delight";
    readonly 'focus-ring': "delight";
    readonly 'a11y-name': "delight";
    readonly 'reduced-motion': "delight";
    readonly 'scroll-reveal': "delight";
    readonly 'container-edges': "composition";
    readonly 'off-viewport': "composition";
    readonly collide: "composition";
    readonly 'tap-size': "composition";
    readonly 'cut-text': "composition";
    readonly hole: "composition";
    readonly tilt: "composition";
};
export type DesignTasteAppCheckId = keyof typeof DESIGN_TASTE_APP_CHECK_IDS;
export declare const designTasteTotal: (scores: Record<DesignTasteGridItem, number>) => number;
export declare const DesignTasteScoreSchema: z.ZodObject<{
    scores: z.ZodObject<Record<"typography" | "controls" | "imagery" | "color_material" | "delight" | "composition", z.ZodNumber>, z.core.$strict>;
    total: z.ZodNumber;
    max: z.ZodLiteral<number>;
}, z.core.$strict>;
export type DesignTasteScore = z.infer<typeof DesignTasteScoreSchema>;
export declare const DesignTasteThresholdsSchema: z.ZodObject<{
    itemMin: z.ZodNumber;
    totalMin: z.ZodNumber;
    itemMaxWithFail: z.ZodNumber;
}, z.core.$strict>;
export type DesignTasteThresholds = z.infer<typeof DesignTasteThresholdsSchema>;
export type DesignTasteProblem = {
    code: 'taste_total_below' | 'taste_item_below' | 'taste_item_above_failed_check';
    item?: DesignTasteGridItem;
};
/** Failed Taste checks that count on an app, once each, with the grid item they belong to. */
export declare const designTasteAppFailures: (failedIds: readonly string[]) => Array<{
    id: DesignTasteAppCheckId;
    item: DesignTasteGridItem;
}>;
export declare const designTasteProblems: (taste: DesignTasteScore, thresholds: DesignTasteThresholds, failedIds?: readonly string[]) => DesignTasteProblem[];
export declare const DESIGN_REFEREE_VERDICTS: readonly ["APPROVA", "RIFARE"];
export type DesignRefereeVerdict = (typeof DESIGN_REFEREE_VERDICTS)[number];
export declare const DesignRefereeJudgementSchema: z.ZodObject<{
    taste: z.ZodObject<{
        scores: z.ZodObject<Record<"typography" | "controls" | "imagery" | "color_material" | "delight" | "composition", z.ZodNumber>, z.core.$strict>;
        total: z.ZodNumber;
        max: z.ZodLiteral<number>;
    }, z.core.$strict>;
    audit: z.ZodObject<{
        scores: z.ZodObject<Record<"accessibility" | "performance" | "theming" | "responsive" | "implementation_integrity", z.ZodNumber>, z.core.$strict>;
        total: z.ZodNumber;
        max: z.ZodLiteral<20>;
    }, z.core.$strict>;
    critique: z.ZodObject<{
        scores: z.ZodObject<Record<"visibility_of_system_status" | "match_system_real_world" | "user_control_freedom" | "consistency_standards" | "error_prevention" | "recognition_over_recall" | "flexibility_efficiency" | "aesthetic_minimalist_design" | "error_recovery" | "help_documentation", z.ZodNullable<z.ZodNumber>>, z.core.$strict>;
        total: z.ZodNumber;
        max: z.ZodNumber;
    }, z.core.$strict>;
    brand: z.ZodNullable<z.ZodNumber>;
    examplesLevel: z.ZodNumber;
    tasteFailedIds: z.ZodArray<z.ZodString>;
    copyLint: z.ZodObject<{
        words: z.ZodNumber;
        failedIds: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    verdict: z.ZodEnum<{
        APPROVA: "APPROVA";
        RIFARE: "RIFARE";
    }>;
}, z.core.$strict>;
export type DesignRefereeJudgement = z.infer<typeof DesignRefereeJudgementSchema>;
export type DesignRefereeJudgementProblem = {
    code: DesignScoreProblemCode;
    dimension?: DesignAuditDimension;
    item?: DesignTasteGridItem;
};
export declare const designRefereeJudgementProblems: (judgement: DesignRefereeJudgement, thresholds: {
    score: DesignScoreThresholds;
    taste: DesignTasteThresholds;
}) => DesignRefereeJudgementProblem[];
//# sourceMappingURL=design-score.d.ts.map