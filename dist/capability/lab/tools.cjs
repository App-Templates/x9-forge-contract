"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabCompetenceOutputSchema = exports.LabCompetenceInputSchema = exports.LabGapsOutputSchema = exports.LabGapsInputSchema = exports.LabQueryOutputSchema = exports.LabQueryInputSchema = exports.LabIngestOutputSchema = exports.LabIngestInputSchema = exports.LAB_TOOLS = void 0;
const zod_1 = require("zod");
const research_js_1 = require("../ricerca/research.cjs");
const competence_js_1 = require("./competence.cjs");
const wiki_js_1 = require("./wiki.cjs");
/**
 * The tools of cap-lab (v1.28.0, Phase 54), called at `capToolCallPath(LAB_TOOLS.<tool>)`. The wiki is the one of
 * the agent of the tool call envelope.
 * `lab_ingest` takes a cap-ricerca result as cap-ricerca defines it (imported, never copied).
 */
exports.LAB_TOOLS = {
    /** Store a research result: raw sources, then pages and claims updated. */
    ingest: 'lab_ingest',
    /** Ask the wiki: the pages and claims that answer. */
    query: 'lab_query',
    /** The open gaps: the next questions for research. */
    gaps: 'lab_gaps',
    /** The competence graph with levels and scores. */
    competence: 'lab_competence',
};
exports.LabIngestInputSchema = zod_1.z.object({ result: research_js_1.ResearchResultSchema }).strict();
exports.LabIngestOutputSchema = zod_1.z.object({
    sourcesStored: zod_1.z.number().int().nonnegative(),
    pagesTouched: zod_1.z.number().int().nonnegative(),
    claimsAdded: zod_1.z.number().int().nonnegative(),
}).strict();
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