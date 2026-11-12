"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryRecallBundleContract = exports.MEMORY_RECALL_ORGANIZATION_NOT_CONFIGURED_ERROR = exports.MEMORY_RECALL_REFUSED_HTTP_STATUSES = exports.MemoryRecallToolErrorCodeSchema = exports.MEMORY_RECALL_TOOL_ERROR_CODES = exports.INTERNAL_MEMORY_RECALL_BUNDLE_PATH = exports.InternalMemoryRecallBundleResponseSchema = exports.RecallBundleAuditSchema = exports.RecallBundleEntrySchema = exports.InternalMemoryRecallBundleRequestSchema = exports.MEMORY_RECALL_TOOL_TOP_K_DEFAULT = exports.MEMORY_RECALL_TOP_K_DEFAULT = exports.MEMORY_RECALL_TOP_K_MAX = exports.MEMORY_RECALL_TOP_K_MIN = exports.MEMORY_RECALL_QUERY_MAX_CHARS = void 0;
exports.memoryRecallToolErrorCodeOf = memoryRecallToolErrorCodeOf;
const zod_1 = require("zod");
const temporal_js_1 = require("../../memory/temporal.cjs");
const recall_js_1 = require("../../organization/recall.cjs");
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
exports.MEMORY_RECALL_QUERY_MAX_CHARS = 4096;
/** Minimum result count for recall callers and tool descriptions. */
exports.MEMORY_RECALL_TOP_K_MIN = 1;
/** Maximum result count for recall callers and tool descriptions. */
exports.MEMORY_RECALL_TOP_K_MAX = 20;
/** Route default when a recall bundle request omits topK. */
exports.MEMORY_RECALL_TOP_K_DEFAULT = 8;
/** Model tool default when the model omits topK. */
exports.MEMORY_RECALL_TOOL_TOP_K_DEFAULT = 5;
exports.InternalMemoryRecallBundleRequestSchema = zod_1.z.object({
    tenantId: zod_1.z.string().min(1).max(256),
    ownerId: zod_1.z.string().min(1).max(256),
    agentId: zod_1.z.string().min(1).max(64),
    userId: zod_1.z.string().min(1).max(256).optional(),
    mode: zod_1.z.enum(['fast', 'standard', 'deep']).default('standard'),
    taskType: zod_1.z.string().min(1).max(64).default('text'),
    query: zod_1.z.string().min(1).max(exports.MEMORY_RECALL_QUERY_MAX_CHARS),
    topK: zod_1.z.number().int()
        .min(exports.MEMORY_RECALL_TOP_K_MIN)
        .max(exports.MEMORY_RECALL_TOP_K_MAX)
        .default(exports.MEMORY_RECALL_TOP_K_DEFAULT),
    latencyBudgetMs: zod_1.z.number().int().min(50).max(2000).default(300),
    privacyLevelAllow: zod_1.z.array(zod_1.z.enum(RECALL_PRIVACY_LEVELS)).optional(),
    sourceTypeFilter: zod_1.z.string().max(64).optional(),
    createdAtWindow: zod_1.z
        .object({
        fromIso: zod_1.z.string().datetime({ offset: true }),
        toIso: zod_1.z.string().datetime({ offset: true }),
    })
        .optional(),
    temporal: temporal_js_1.RecallTemporalFilterSchema.optional(),
    organization: recall_js_1.OrganizationRecallContextSchema.optional(),
});
exports.RecallBundleEntrySchema = zod_1.z.object({
    id: zod_1.z.string(),
    resultType: zod_1.z.enum(['episode', 'fact', 'edge']),
    score: zod_1.z.number(),
    contentNormalized: zod_1.z.string(),
    privacyLevel: zod_1.z.string(),
    createdAt: zod_1.z.string(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
    // Episode-specific
    sourceType: zod_1.z.string().optional(),
    sourceRef: zod_1.z.string().optional(),
    sourceTimestamp: zod_1.z.string().optional(),
    // Fact-specific
    memoryType: zod_1.z.string().optional(),
    subtype: zod_1.z.string().optional(),
    slotKey: zod_1.z.string().optional(),
    confidence: zod_1.z.number().optional(),
    salience: zod_1.z.number().optional(),
    status: zod_1.z.string().optional(),
    // Edge-specific
    fromEntityId: zod_1.z.string().optional(),
    toEntityId: zod_1.z.string().optional(),
    edgeType: zod_1.z.string().optional(),
    strength: zod_1.z.number().nullable().optional(),
});
exports.RecallBundleAuditSchema = zod_1.z.object({
    mode: zod_1.z.string(),
    latencyMs: zod_1.z.number(),
    candidateCount: zod_1.z.number(),
    resultCount: zod_1.z.number(),
    qdrantUsed: zod_1.z.boolean(),
    postgresUsed: zod_1.z.boolean(),
    degraded: zod_1.z.boolean(),
    degradedReason: zod_1.z.string().nullable(),
    embeddingCacheHit: zod_1.z.boolean(),
    cacheHit: zod_1.z.boolean().optional(),
});
exports.InternalMemoryRecallBundleResponseSchema = zod_1.z.object({
    entries: zod_1.z.array(exports.RecallBundleEntrySchema),
    audit: exports.RecallBundleAuditSchema,
    organizationReferences: zod_1.z.array(recall_js_1.OrganizationRecallReferenceSchema).max(50).optional(),
});
exports.INTERNAL_MEMORY_RECALL_BUNDLE_PATH = '/internal/memory/recall/bundle';
/**
 * Fixed codes the memory_recall tool gives the model when the recall bundle
 * does not answer 2xx; these codes are never the response body.
 * richiamo_aziendale_non_attivo: organization recall is not configured; not retried.
 * richiamo_rifiutato: the bundle refused the organization context, not a fault;
 * the same call is never retried.
 * richiamo_non_riuscito: any other answer or no answer, a fault; retry later.
 */
exports.MEMORY_RECALL_TOOL_ERROR_CODES = [
    'richiamo_aziendale_non_attivo',
    'richiamo_non_riuscito',
    'richiamo_rifiutato',
];
exports.MemoryRecallToolErrorCodeSchema = zod_1.z.enum(exports.MEMORY_RECALL_TOOL_ERROR_CODES);
exports.MEMORY_RECALL_REFUSED_HTTP_STATUSES = [403];
/** The error field of the route's 503 response when organization recall is not configured. */
exports.MEMORY_RECALL_ORGANIZATION_NOT_CONFIGURED_ERROR = 'organization recall not configured';
function memoryRecallToolErrorCodeOf(answer) {
    const { status, organizationRecallNotConfigured } = answer;
    if (status === undefined)
        return 'richiamo_non_riuscito';
    if (status >= 200 && status < 300) {
        throw new RangeError('A successful recall bundle answer has no tool error code');
    }
    if (status === 503 && organizationRecallNotConfigured) {
        return 'richiamo_aziendale_non_attivo';
    }
    if (exports.MEMORY_RECALL_REFUSED_HTTP_STATUSES.some((refusedStatus) => refusedStatus === status)) {
        return 'richiamo_rifiutato';
    }
    return 'richiamo_non_riuscito';
}
exports.internalMemoryRecallBundleContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_RECALL_BUNDLE_PATH,
    authType: 'secret',
    bodySchema: exports.InternalMemoryRecallBundleRequestSchema,
    responseSchema: exports.InternalMemoryRecallBundleResponseSchema,
};
//# sourceMappingURL=internal-memory-recall-bundle.js.map