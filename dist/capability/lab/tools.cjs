"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabCompetenceOutputSchema = exports.LabCompetenceInputSchema = exports.LabGapsOutputSchema = exports.LabGapsInputSchema = exports.LabQueryOutputSchema = exports.LabQueryInputSchema = exports.LabIngestStatusOutputSchema = exports.LabIngestStatusInputSchema = exports.LabIngestOutputSchema = exports.LabIngestInputSchema = exports.LabIngestIdSchema = exports.LabToolErrorSchema = exports.LAB_TOOLS = void 0;
const zod_1 = require("zod");
const research_js_1 = require("../ricerca/research.cjs");
const competence_js_1 = require("./competence.cjs");
const wiki_js_1 = require("./wiki.cjs");
/**
 * The tools of cap-lab (v1.29.0, Phase 54), called at `capToolCallPath(LAB_TOOLS.<tool>)`. The wiki is the one of
 * the agent of the tool call envelope.
 * `lab_ingest` takes a cap-ricerca result as cap-ricerca defines it (imported, never copied).
 */
exports.LAB_TOOLS = {
    /** Queue a research result for digestion into raw sources, pages and claims. */
    ingest: 'lab_ingest',
    /** State of a queued ingest, with final counts when completed. */
    ingestStatus: 'lab_ingest_status',
    /** Ask the wiki: the pages and claims that answer. */
    query: 'lab_query',
    /** The open gaps: the next questions for research. */
    gaps: 'lab_gaps',
    /** The competence graph with levels and scores. */
    competence: 'lab_competence',
};
/** Why a lab tool call failed, as the bridge tool-call error text. */
exports.LabToolErrorSchema = zod_1.z.enum(['invalid_request', 'not_configured', 'not_found', 'not_ready']);
exports.LabIngestIdSchema = zod_1.z.uuid();
exports.LabIngestInputSchema = zod_1.z.object({ result: research_js_1.ResearchResultSchema }).strict();
exports.LabIngestOutputSchema = zod_1.z.object({
    ingestId: exports.LabIngestIdSchema,
    state: zod_1.z.literal('queued'),
}).strict();
exports.LabIngestStatusInputSchema = zod_1.z.object({ ingestId: exports.LabIngestIdSchema }).strict();
exports.LabIngestStatusOutputSchema = zod_1.z.object({
    ingestId: exports.LabIngestIdSchema,
    state: research_js_1.ResearchStateSchema,
    sourcesStored: zod_1.z.number().int().nonnegative().optional(),
    pagesTouched: zod_1.z.number().int().nonnegative().optional(),
    claimsAdded: zod_1.z.number().int().nonnegative().optional(),
}).strict().refine(result => result.state === 'completed'
    ? result.sourcesStored !== undefined && result.pagesTouched !== undefined && result.claimsAdded !== undefined
    : result.sourcesStored === undefined && result.pagesTouched === undefined && result.claimsAdded === undefined, { message: 'counts are present only for completed ingests' });
exports.LabQueryInputSchema = zod_1.z.object({
    question: zod_1.z.string().trim().min(1).max(2000),
    limit: zod_1.z.number().int().min(1).max(50).optional(),
}).strict();
exports.LabQueryOutputSchema = zod_1.z.object({
    pages: zod_1.z.array(wiki_js_1.WikiPageSchema).max(50),
    claims: zod_1.z.array(wiki_js_1.WikiClaimSchema).max(200),
}).strict();
exports.LabGapsInputSchema = zod_1.z.object({ limit: zod_1.z.number().int().min(1).max(50).optional() }).strict();
exports.LabGapsOutputSchema = zod_1.z.object({ gaps: zod_1.z.array(competence_js_1.CompetenceGapSchema).max(50) }).strict();
exports.LabCompetenceInputSchema = zod_1.z.object({}).strict();
exports.LabCompetenceOutputSchema = zod_1.z.object({ nodes: zod_1.z.array(competence_js_1.CompetenceNodeViewSchema).max(5000) }).strict();
//# sourceMappingURL=tools.js.map