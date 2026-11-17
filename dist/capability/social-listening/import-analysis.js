import { z } from 'zod';
import { SocialLegacyAnalysisRowSchema, socialImportPost, socialImportTimestamp, socialImportVerdict, } from "./import.js";
import { SocialPostSchema } from "./post.js";
import { SocialPostAnalysisSchema } from "./verdict.js";
export const SOCIAL_IMPORT_ANALYSIS_ERRORS = [
    'invalid_row', 'invalid_timestamp', 'empty_reason', 'invalid_analysis',
];
/** Historical analysis is data: preserve text, omit unknown links, and never truncate. */
export function socialImportPostAnalysis(row) {
    const parsed = SocialLegacyAnalysisRowSchema.safeParse(row);
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
    const analyzedAt = socialImportTimestamp(legacy.analizzato_il);
    if (analyzedAt === null)
        return { ok: false, error: 'invalid_timestamp' };
    const relevance = legacy.per_stefano.trim();
    const analysis = SocialPostAnalysisSchema.safeParse({
        verdict: socialImportVerdict(legacy.verdetto),
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
export function socialImportPostWithAnalysis(row, ctx) {
    const analysis = socialImportPostAnalysis(row);
    if (!analysis.ok)
        return analysis;
    let imported;
    try {
        imported = socialImportPost(row, ctx);
    }
    catch (error) {
        if (error instanceof z.ZodError)
            return { ok: false, error: 'invalid_row' };
        throw error;
    }
    const post = SocialPostSchema.safeParse({ ...imported, analysis: analysis.analysis });
    return post.success
        ? { ok: true, post: post.data }
        : { ok: false, error: 'invalid_row' };
}
//# sourceMappingURL=import-analysis.js.map