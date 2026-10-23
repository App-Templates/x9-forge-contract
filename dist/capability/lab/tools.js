import { z } from 'zod';
import { AssetRefSchema, AssetSha256Schema } from "../../organization/asset.js";
import { LabGapsRefSchema, ResearchResultSchema, ResearchStateSchema } from "../ricerca/research.js";
import { CompetenceGapSchema, CompetenceNodeViewSchema } from "./competence.js";
import { WikiClaimSchema, WikiPageSchema } from "./wiki.js";
/**
 * The tools of cap-lab (v1.29.0, Phase 54), called at `capToolCallPath(LAB_TOOLS.<tool>)`. The wiki is the one of
 * the agent of the tool call envelope.
 * `lab_ingest` takes a cap-ricerca result or an asset reference with already-read text excerpts.
 */
export const LAB_TOOLS = {
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
export const LabToolErrorSchema = z.enum(['invalid_request', 'not_configured', 'not_found', 'not_ready']);
export const LabIngestIdSchema = z.uuid();
/** Document provenance and excerpts supplied by the caller; the lab does not read asset bytes. */
export const LabIngestDocumentSchema = z.strictObject({
    asset: AssetRefSchema,
    title: z.string().min(1).max(200),
    excerpts: z.array(z.string().min(1).max(4000)).min(1).max(50),
});
export const LabIngestInputSchema = z.union([
    z.object({ result: ResearchResultSchema }).strict(),
    z.object({ document: LabIngestDocumentSchema }).strict(),
]);
export const LabIngestOutputSchema = z.object({
    ingestId: LabIngestIdSchema,
    state: z.literal('queued'),
}).strict();
export const LabIngestStatusInputSchema = z.object({ ingestId: LabIngestIdSchema }).strict();
export const LabIngestStatusOutputSchema = z.object({
    ingestId: LabIngestIdSchema,
    state: ResearchStateSchema,
    sourcesStored: z.number().int().nonnegative().optional(),
    pagesTouched: z.number().int().nonnegative().optional(),
    claimsAdded: z.number().int().nonnegative().optional(),
}).strict().refine(result => result.state === 'completed'
    ? result.sourcesStored !== undefined && result.pagesTouched !== undefined && result.claimsAdded !== undefined
    : result.sourcesStored === undefined && result.pagesTouched === undefined && result.claimsAdded === undefined, { message: 'counts are present only for completed ingests' });
export const LabQueryInputSchema = z.object({
    question: z.string().trim().min(1).max(2000),
    limit: z.number().int().min(1).max(50).optional(),
}).strict();
export const LabQueryOutputSchema = z.object({
    pages: z.array(WikiPageSchema).max(50),
    claims: z.array(WikiClaimSchema).max(200),
}).strict();
export const LabGapsInputSchema = z.object({ limit: z.number().int().min(1).max(50).optional() }).strict();
export const LabGapsOutputSchema = z.object({ gaps: z.array(CompetenceGapSchema).max(50) }).strict();
export const LabCompetenceInputSchema = z.object({}).strict();
export const LabCompetenceOutputSchema = z.object({ nodes: z.array(CompetenceNodeViewSchema).max(5000) }).strict();
/** Publication recipients always identify the client company explicitly. */
export const LabPublicationRecipientSchema = z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('client'), clientId: AssetRefSchema.shape.companyId }),
    z.strictObject({
        kind: z.literal('project'),
        clientId: AssetRefSchema.shape.companyId,
        projectId: AssetRefSchema.shape.projectId,
    }),
]);
export const LabPublishInputSchema = z.strictObject({
    slug: WikiPageSchema.shape.slug,
    version: WikiPageSchema.shape.version.optional(),
    recipient: LabPublicationRecipientSchema,
});
export const LabPublishOutputSchema = z.strictObject({
    slug: WikiPageSchema.shape.slug,
    version: WikiPageSchema.shape.version,
    digest: AssetSha256Schema,
    recipient: LabPublicationRecipientSchema,
    publishedAt: z.iso.datetime({ offset: true }),
});
export const LabReadPublishedInputSchema = z.strictObject({
    recipient: LabPublicationRecipientSchema,
    query: LabQueryInputSchema.shape.question.optional(),
    limit: LabQueryInputSchema.shape.limit,
});
export const LabReadPublishedOutputSchema = z.strictObject({
    pages: z.array(z.strictObject({
        slug: WikiPageSchema.shape.slug,
        version: WikiPageSchema.shape.version,
        digest: AssetSha256Schema,
        title: WikiPageSchema.shape.title,
        content: WikiPageSchema.shape.body,
    })).max(50),
});
export const LabBriefGapsInputSchema = z.strictObject({
    topics: z.array(LabQueryInputSchema.shape.question).min(1).max(20).refine(topics => new Set(topics).size === topics.length, { message: 'Brief topics must be unique' }),
    clientId: AssetRefSchema.shape.companyId,
    projectId: AssetRefSchema.shape.projectId.optional(),
});
export const LabBriefGapsOutputSchema = z.strictObject({
    gapsRef: LabGapsRefSchema,
    hasContext: z.boolean(),
    covered: z.array(z.strictObject({
        slug: WikiPageSchema.shape.slug,
        version: WikiPageSchema.shape.version,
    })).max(100),
    gaps: z.array(z.strictObject({ topic: LabQueryInputSchema.shape.question })).max(50),
});
/** Worker-owned paid execution, deliberately excluded from model-visible LAB_TOOLS. */
export const LAB_INTERNAL_TOOLS = { execute: 'lab_execute' };
/** Receiver validates the current full-scope SQL claim and its unexpired lease before effects. */
export const LabExecuteInputSchema = z.strictObject({ jobId: LabIngestIdSchema, leaseToken: z.uuid() });
export const LabExecuteOutputSchema = z.strictObject({ jobId: LabIngestIdSchema, state: ResearchStateSchema });
//# sourceMappingURL=tools.js.map