import { z } from 'zod';
import { RecallTemporalFilterSchema } from "../../memory/temporal.js";
import { OrganizationRecallContextSchema, OrganizationRecallReferenceSchema, } from "../../organization/recall.js";
/**
 * POST /internal/memory/recall/bundle — v2 recall endpoint.
 * Direction: X9 internal (agent-core / cap-voice -> memory-svc) + Forge console.
 * Auth: X-Internal-Secret
 *
 * Returns scored memory entries (episodes / facts / edges) for the requesting
 * (tenant, owner, agent) triple. Standard mode embeds the query and searches
 * Qdrant with a tenant/owner/agent payload filter (ADR §22); temporal modes
 * (Phase 41) bypass Qdrant and query Postgres bitemporally with the SAME
 * triple scoping — cross-agent isolation is a CORE multi-tenancy invariant.
 *
 * Mirrors services/memory/src/routes/internal-recall-bundle.ts
 * (recallBundleRequestSchema). Added v1.11.2 (R-14: path constants live here).
 */
const RECALL_PRIVACY_LEVELS = [
    'standard',
    'sensitive',
    'secret',
    'third_party',
    'voice_biometric',
];
/** Maximum query length for recall callers and tool descriptions. */
export const MEMORY_RECALL_QUERY_MAX_CHARS = 4096;
/** Minimum result count for recall callers and tool descriptions. */
export const MEMORY_RECALL_TOP_K_MIN = 1;
/** Maximum result count for recall callers and tool descriptions. */
export const MEMORY_RECALL_TOP_K_MAX = 20;
/** Route default when a recall bundle request omits topK. */
export const MEMORY_RECALL_TOP_K_DEFAULT = 8;
/** Model tool default when the model omits topK. */
export const MEMORY_RECALL_TOOL_TOP_K_DEFAULT = 5;
export const InternalMemoryRecallBundleRequestSchema = z.object({
    tenantId: z.string().min(1).max(256),
    ownerId: z.string().min(1).max(256),
    agentId: z.string().min(1).max(64),
    userId: z.string().min(1).max(256).optional(),
    mode: z.enum(['fast', 'standard', 'deep']).default('standard'),
    taskType: z.string().min(1).max(64).default('text'),
    query: z.string().min(1).max(MEMORY_RECALL_QUERY_MAX_CHARS),
    topK: z.number().int()
        .min(MEMORY_RECALL_TOP_K_MIN)
        .max(MEMORY_RECALL_TOP_K_MAX)
        .default(MEMORY_RECALL_TOP_K_DEFAULT),
    latencyBudgetMs: z.number().int().min(50).max(2000).default(300),
    privacyLevelAllow: z.array(z.enum(RECALL_PRIVACY_LEVELS)).optional(),
    sourceTypeFilter: z.string().max(64).optional(),
    createdAtWindow: z
        .object({
        fromIso: z.string().datetime({ offset: true }),
        toIso: z.string().datetime({ offset: true }),
    })
        .optional(),
    temporal: RecallTemporalFilterSchema.optional(),
    organization: OrganizationRecallContextSchema.optional(),
});
export const RecallBundleEntrySchema = z.object({
    id: z.string(),
    resultType: z.enum(['episode', 'fact', 'edge']),
    score: z.number(),
    contentNormalized: z.string(),
    privacyLevel: z.string(),
    createdAt: z.string(),
    metadata: z.record(z.string(), z.unknown()),
    // Episode-specific
    sourceType: z.string().optional(),
    sourceRef: z.string().optional(),
    sourceTimestamp: z.string().optional(),
    // Fact-specific
    memoryType: z.string().optional(),
    subtype: z.string().optional(),
    slotKey: z.string().optional(),
    confidence: z.number().optional(),
    salience: z.number().optional(),
    status: z.string().optional(),
    // Edge-specific
    fromEntityId: z.string().optional(),
    toEntityId: z.string().optional(),
    edgeType: z.string().optional(),
    strength: z.number().nullable().optional(),
});
export const RecallBundleAuditSchema = z.object({
    mode: z.string(),
    latencyMs: z.number(),
    candidateCount: z.number(),
    resultCount: z.number(),
    qdrantUsed: z.boolean(),
    postgresUsed: z.boolean(),
    degraded: z.boolean(),
    degradedReason: z.string().nullable(),
    embeddingCacheHit: z.boolean(),
    cacheHit: z.boolean().optional(),
});
export const InternalMemoryRecallBundleResponseSchema = z.object({
    entries: z.array(RecallBundleEntrySchema),
    audit: RecallBundleAuditSchema,
    organizationReferences: z.array(OrganizationRecallReferenceSchema).max(50).optional(),
});
export const INTERNAL_MEMORY_RECALL_BUNDLE_PATH = '/internal/memory/recall/bundle';
/**
 * Fixed codes the memory_recall tool gives the model when the recall bundle
 * does not answer 2xx; these codes are never the response body.
 * richiamo_aziendale_non_attivo: organization recall is not configured; not retried.
 * richiamo_rifiutato: the bundle refused the organization context, not a fault;
 * the same call is never retried.
 * richiamo_non_riuscito: any other answer or no answer, a fault; retry later.
 */
export const MEMORY_RECALL_TOOL_ERROR_CODES = [
    'richiamo_aziendale_non_attivo',
    'richiamo_non_riuscito',
    'richiamo_rifiutato',
];
export const MemoryRecallToolErrorCodeSchema = z.enum(MEMORY_RECALL_TOOL_ERROR_CODES);
export const MEMORY_RECALL_REFUSED_HTTP_STATUSES = [403];
/** The error field of the route's 503 response when organization recall is not configured. */
export const MEMORY_RECALL_ORGANIZATION_NOT_CONFIGURED_ERROR = 'organization recall not configured';
export function memoryRecallToolErrorCodeOf(answer) {
    const { status, organizationRecallNotConfigured } = answer;
    if (status === undefined)
        return 'richiamo_non_riuscito';
    if (status >= 200 && status < 300) {
        throw new RangeError('A successful recall bundle answer has no tool error code');
    }
    if (status === 503 && organizationRecallNotConfigured) {
        return 'richiamo_aziendale_non_attivo';
    }
    if (MEMORY_RECALL_REFUSED_HTTP_STATUSES.some((refusedStatus) => refusedStatus === status)) {
        return 'richiamo_rifiutato';
    }
    return 'richiamo_non_riuscito';
}
export const internalMemoryRecallBundleContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_RECALL_BUNDLE_PATH,
    authType: 'secret',
    bodySchema: InternalMemoryRecallBundleRequestSchema,
    responseSchema: InternalMemoryRecallBundleResponseSchema,
};
//# sourceMappingURL=internal-memory-recall-bundle.js.map