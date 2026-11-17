"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCIAL_IMPORT_ANALYSIS_ERRORS = void 0;
exports.socialImportPostAnalysis = socialImportPostAnalysis;
exports.socialImportPostWithAnalysis = socialImportPostWithAnalysis;
const zod_1 = require("zod");
const import_js_1 = require("./import.cjs");
const post_js_1 = require("./post.cjs");
const verdict_js_1 = require("./verdict.cjs");
exports.SOCIAL_IMPORT_ANALYSIS_ERRORS = [
    'invalid_row', 'invalid_timestamp', 'empty_reason', 'invalid_analysis',
];
/** Historical analysis is data: preserve text, omit unknown links, and never truncate. */
function socialImportPostAnalysis(row) {
    const parsed = import_js_1.SocialLegacyAnalysisRowSchema.safeParse(row);
    if (!parsed.success) {
        // The legacy schema already validates timestamps. Only its analysis-date refinement
        // maps to invalid_timestamp; malformed row structure remains invalid_row.
        const invalidTimestamp = parsed.error.issues.every(issue => issue.path.length === 1 && issue.path[0] === 'analizzato_il' && issue.code === 'custom');
        return { ok: false, error: invalidTimestamp ? 'invalid_timestamp' : 'invalid_row' };
    }
    const legacy = parsed.data;
    const reason = legacy.perche.trim();
    if (reason === '')
        return { ok: false, error: 'empty_reason' };
    const analyzedAt = (0, import_js_1.socialImportTimestamp)(legacy.analizzato_il);
    if (analyzedAt === null)
        return { ok: false, error: 'invalid_timestamp' };
    const relevance = legacy.per_stefano.trim();
    const analysis = verdict_js_1.SocialPostAnalysisSchema.safeParse({
        verdict: (0, import_js_1.socialImportVerdict)(legacy.verdetto),
        reason,
        ...(relevance !== '' ? { relevance } : {}),
        facts: [],
        tools: legacy.strumenti.map(tool => ({
            name: tool.nome,
            whatItDoes: tool.cosa_fa,
            ...(tool.link !== '' ? { link: tool.link } : {}),
        })),
        analyzedAt,
    });
    return analysis.success
        ? { ok: true, analysis: analysis.data }
        : { ok: false, error: 'invalid_analysis' };
}
/** Reuse the legacy post mapper: identity is admitted exclusively from the caller's context. */
function socialImportPostWithAnalysis(row, ctx) {
    const analysis = socialImportPostAnalysis(row);
    if (!analysis.ok)
        return analysis;
    let imported;
    try {
        imported = (0, import_js_1.socialImportPost)(row, ctx);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError)
            return { ok: false, error: 'invalid_row' };
        throw error;
    }
    const post = post_js_1.SocialPostSchema.safeParse({ ...imported, analysis: analysis.analysis });
    return post.success
        ? { ok: true, post: post.data }
        : { ok: false, error: 'invalid_row' };
}
//# sourceMappingURL=import-analysis.js.map