"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabExecuteOutputSchema = exports.LabExecuteInputSchema = exports.LAB_INTERNAL_TOOLS = exports.LabBriefGapsOutputSchema = exports.LabBriefGapsInputSchema = exports.LabReadPublishedOutputSchema = exports.LabReadPublishedInputSchema = exports.LabPublishOutputSchema = exports.LabPublishInputSchema = exports.LabPublicationRecipientSchema = exports.LabCompetenceOutputSchema = exports.LabCompetenceInputSchema = exports.LabGapsOutputSchema = exports.LabGapsInputSchema = exports.LabQueryOutputSchema = exports.LabQueryInputSchema = exports.LabIngestStatusOutputSchema = exports.LabIngestStatusInputSchema = exports.LabIngestOutputSchema = exports.LabIngestInputSchema = exports.LabIngestDocumentSchema = exports.LabIngestIdSchema = exports.LabToolErrorSchema = exports.LAB_TOOLS = void 0;
const zod_1 = require("zod");
const asset_js_1 = require("../../organization/asset.cjs");
const research_js_1 = require("../ricerca/research.cjs");
const competence_js_1 = require("./competence.cjs");
const wiki_js_1 = require("./wiki.cjs");
/**
 * The tools of cap-lab (v1.29.0, Phase 54), called at `capToolCallPath(LAB_TOOLS.<tool>)`. The wiki is the one of
 * the agent of the tool call envelope.
 * `lab_ingest` takes a cap-ricerca result or an asset reference with already-read text excerpts.
 */
exports.LAB_TOOLS = {
    /** Queue a research result or document for digestion into raw sources, pages and claims. */
    ingest: 'lab_ingest',
    /** State of a queued ingest, with final counts when completed. */
    ingestStatus: 'lab_ingest_status',
    /** Ask the wiki: the pages and claims that answer. */
    query: 'lab_query',
    /** The open gaps: the next questions for research. */
    gaps: 'lab_gaps',
    /** The competence graph with levels and scores. */
    competence: 'lab_competence',
    /** Publish a versioned page for a client or project. */
    publish: 'lab_publish',
    /** Read pages published for a client or project. */
    readPublished: 'lab_read_published',
    /** Compare brief topics with published knowledge before researching. */
    briefGaps: 'lab_brief_gaps',
};
/** Why a lab tool call failed, as the bridge tool-call error text. */
exports.LabToolErrorSchema = zod_1.z.enum(['invalid_request', 'not_configured', 'not_found', 'not_ready']);
exports.LabIngestIdSchema = zod_1.z.uuid();
/** Document provenance and excerpts supplied by the caller; the lab does not read asset bytes. */
exports.LabIngestDocumentSchema = zod_1.z.strictObject({
    asset: asset_js_1.AssetRefSchema,
    title: zod_1.z.string().min(1).max(200),
    excerpts: zod_1.z.array(zod_1.z.string().min(1).max(4000)).min(1).max(50),
});
exports.LabIngestInputSchema = zod_1.z.union([
    zod_1.z.object({ result: research_js_1.ResearchResultSchema }).strict(),
    zod_1.z.object({ document: exports.LabIngestDocumentSchema }).strict(),
]);
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
/** Publication recipients always identify the client company explicitly. */
exports.LabPublicationRecipientSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({ kind: zod_1.z.literal('client'), clientId: asset_js_1.AssetRefSchema.shape.companyId }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('project'),
        clientId: asset_js_1.AssetRefSchema.shape.companyId,
        projectId: asset_js_1.AssetRefSchema.shape.projectId,
    }),
]);
exports.LabPublishInputSchema = zod_1.z.strictObject({
    slug: wiki_js_1.WikiPageSchema.shape.slug,
    version: wiki_js_1.WikiPageSchema.shape.version.optional(),
    recipient: exports.LabPublicationRecipientSchema,
});
exports.LabPublishOutputSchema = zod_1.z.strictObject({
    slug: wiki_js_1.WikiPageSchema.shape.slug,
    version: wiki_js_1.WikiPageSchema.shape.version,
    digest: asset_js_1.AssetSha256Schema,
    recipient: exports.LabPublicationRecipientSchema,
    publishedAt: zod_1.z.iso.datetime({ offset: true }),
});
exports.LabReadPublishedInputSchema = zod_1.z.strictObject({
    recipient: exports.LabPublicationRecipientSchema,
    query: exports.LabQueryInputSchema.shape.question.optional(),
    limit: exports.LabQueryInputSchema.shape.limit,
});
exports.LabReadPublishedOutputSchema = zod_1.z.strictObject({
    pages: zod_1.z.array(zod_1.z.strictObject({
        slug: wiki_js_1.WikiPageSchema.shape.slug,
        version: wiki_js_1.WikiPageSchema.shape.version,
        digest: asset_js_1.AssetSha256Schema,
        title: wiki_js_1.WikiPageSchema.shape.title,
        content: wiki_js_1.WikiPageSchema.shape.body,
    })).max(50),
});
exports.LabBriefGapsInputSchema = zod_1.z.strictObject({
    topics: zod_1.z.array(exports.LabQueryInputSchema.shape.question).min(1).max(20).refine(topics => new Set(topics).size === topics.length, { message: 'Brief topics must be unique' }),
    clientId: asset_js_1.AssetRefSchema.shape.companyId,
    projectId: asset_js_1.AssetRefSchema.shape.projectId.optional(),
});
exports.LabBriefGapsOutputSchema = zod_1.z.strictObject({
    gapsRef: research_js_1.LabGapsRefSchema,
    hasContext: zod_1.z.boolean(),
    covered: zod_1.z.array(zod_1.z.strictObject({
        slug: wiki_js_1.WikiPageSchema.shape.slug,
        version: wiki_js_1.WikiPageSchema.shape.version,
    })).max(100),
    gaps: zod_1.z.array(zod_1.z.strictObject({ topic: exports.LabQueryInputSchema.shape.question })).max(50),
});
/** Worker-owned paid execution, deliberately excluded from model-visible LAB_TOOLS. */
exports.LAB_INTERNAL_TOOLS = { execute: 'lab_execute' };
/** Receiver validates the current full-scope SQL claim and its unexpired lease before effects. */
exports.LabExecuteInputSchema = zod_1.z.strictObject({ jobId: exports.LabIngestIdSchema, leaseToken: zod_1.z.uuid() });
exports.LabExecuteOutputSchema = zod_1.z.strictObject({ jobId: exports.LabIngestIdSchema, state: research_js_1.ResearchStateSchema });
//# sourceMappingURL=tools.js.map