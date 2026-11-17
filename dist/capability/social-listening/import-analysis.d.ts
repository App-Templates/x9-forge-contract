import { type SocialPost } from "./post.js";
import { type SocialPostAnalysis } from "./verdict.js";
export declare const SOCIAL_IMPORT_ANALYSIS_ERRORS: readonly ["invalid_row", "invalid_timestamp", "empty_reason", "invalid_analysis"];
export type SocialImportAnalysisError = typeof SOCIAL_IMPORT_ANALYSIS_ERRORS[number];
export type SocialImportPostAnalysisResult = {
    ok: true;
    analysis: SocialPostAnalysis;
} | {
    ok: false;
    error: SocialImportAnalysisError;
};
/** Historical analysis is data: preserve text, omit unknown links, and never truncate. */
export declare function socialImportPostAnalysis(row: unknown): SocialImportPostAnalysisResult;
export type SocialImportPostWithAnalysisResult = {
    ok: true;
    post: SocialPost;
} | {
    ok: false;
    error: SocialImportAnalysisError;
};
/** Reuse the legacy post mapper: identity is admitted exclusively from the caller's context. */
export declare function socialImportPostWithAnalysis(row: unknown, ctx: {
    identity: unknown;
}): SocialImportPostWithAnalysisResult;
//# sourceMappingURL=import-analysis.d.ts.map