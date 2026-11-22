import { z } from 'zod';
export declare const DESIGN_AUDIT_DIMENSIONS: readonly ["accessibility", "performance", "theming", "responsive", "implementation_integrity"];
export type DesignAuditDimension = (typeof DESIGN_AUDIT_DIMENSIONS)[number];
export declare const DESIGN_CRITIQUE_HEURISTICS: readonly ["visibility_of_system_status", "match_system_real_world", "user_control_freedom", "consistency_standards", "error_prevention", "recognition_over_recall", "flexibility_efficiency", "aesthetic_minimalist_design", "error_recovery", "help_documentation"];
export type DesignCritiqueHeuristic = (typeof DESIGN_CRITIQUE_HEURISTICS)[number];
export declare const DESIGN_AUDIT_MAX = 20;
export declare const DESIGN_SCORE_PROBLEMS: readonly ["audit_total_below", "audit_dimension_below", "critique_total_below", "critique_too_few_scored", "brand_below", "not_at_examples_level", "color_not_token", "font_not_token"];
export type DesignScoreProblemCode = (typeof DESIGN_SCORE_PROBLEMS)[number];
export declare const DESIGN_SCORE_SCHEMA_ISSUES: readonly ["audit_total_mismatch", "critique_total_mismatch", "critique_max_mismatch", "colors_not_unique", "fonts_not_unique", "logos_not_unique", "thresholds_inconsistent"];
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
//# sourceMappingURL=design-score.d.ts.map