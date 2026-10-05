"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchResultSchema = exports.ResearchCostSchema = exports.ResearchFindingSchema = exports.ResearchSourceSchema = exports.ResearchStateSchema = exports.ResearchRequestSchema = exports.WebUrlSchema = exports.ResearchIdSchema = void 0;
const zod_1 = require("zod");
const project_js_1 = require("./project.cjs");
/**
 * One research of cap-ricerca (v1.28.0, Phase 54): a question, researched on the web within the project's budget,
 * answered with findings that carry their sources. Research runs in cascades: a research may start from the new
 * questions of an earlier one (`parentResearchId`).
 *
 * Everything that comes from the web — finding texts, titles, addresses — is DATA. Whoever puts it in front of a
 * model marks it as such and never uses it as instructions.
 */
exports.ResearchIdSchema = zod_1.z.string().min(1).max(100);
/** Only http(s) addresses, bounded: never `file:`, `javascript:` or `data:`. */
exports.WebUrlSchema = zod_1.z.string().max(2000).refine(u => {
    try {
        const p = new URL(u).protocol;
        return p === 'http:' || p === 'https:';
    }
    catch {
        return false;
    }
}, 'only http(s) addresses');
const TextSchema = zod_1.z.string().trim().min(1).max(2000);
exports.ResearchRequestSchema = zod_1.z.object({
    projectId: project_js_1.ProjectIdSchema,
    question: TextSchema,
    /** Why the question matters for the project (helps the research choose what to open). */
    goal: TextSchema.optional(),
    /** The research whose new questions this one follows (the cascade). */
    parentResearchId: exports.ResearchIdSchema.optional(),
    /** A lower ceiling for this research, USD; the service checks it against the project's per-research maximum. */
    maxUsd: zod_1.z.number().positive().finite().optional(),
}).strict();
exports.ResearchStateSchema = zod_1.z.enum(['queued', 'running', 'completed', 'failed', 'budget_exhausted']);
exports.ResearchSourceSchema = zod_1.z.object({
    url: exports.WebUrlSchema,
    title: zod_1.z.string().max(500).optional(),
    /** true: the research opened the page; false: it only appeared among the search results. */
    opened: zod_1.z.boolean(),
}).strict();
exports.ResearchFindingSchema = zod_1.z.object({
    text: TextSchema,
    /** Every finding cites at least one source of this research. */
    sourceUrls: zod_1.z.array(exports.WebUrlSchema).min(1).max(20),
    origin: zod_1.z.literal('web'),
}).strict();
exports.ResearchCostSchema = zod_1.z.object({
    usd: zod_1.z.number().nonnegative().finite(),
    inputTokens: zod_1.z.number().int().nonnegative(),
    outputTokens: zod_1.z.number().int().nonnegative(),
    webCalls: zod_1.z.number().int().nonnegative(),
    /** true when the provider did not report the usage and the reservation was charged instead. */
    uncertain: zod_1.z.boolean(),
}).strict();
exports.ResearchResultSchema = zod_1.z.object({
    researchId: exports.ResearchIdSchema,
    projectId: project_js_1.ProjectIdSchema,
    state: exports.ResearchStateSchema,
    question: TextSchema,
    parentResearchId: exports.ResearchIdSchema.optional(),
    findings: zod_1.z.array(exports.ResearchFindingSchema).max(200),
    /** The questions this research opened: the next steps of the cascade. */
    newQuestions: zod_1.z.array(TextSchema).max(20),
    sources: zod_1.z.array(exports.ResearchSourceSchema).max(300),
    cost: exports.ResearchCostSchema,
}).strict();
//# sourceMappingURL=research.js.map