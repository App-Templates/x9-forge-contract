"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryRecallBundleContract = exports.INTERNAL_MEMORY_RECALL_BUNDLE_PATH = exports.InternalMemoryRecallBundleResponseSchema = exports.RecallBundleAuditSchema = exports.RecallBundleEntrySchema = exports.InternalMemoryRecallBundleRequestSchema = void 0;
const zod_1 = require("zod");
const temporal_js_1 = require("../../memory/temporal.cjs");
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
exports.InternalMemoryRecallBundleRequestSchema = zod_1.z.object({
    tenantId: zod_1.z.string().min(1).max(256),
    ownerId: zod_1.z.string().min(1).max(256),
    agentId: zod_1.z.string().min(1).max(64),
    userId: zod_1.z.string().min(1).max(256).optional(),
    mode: zod_1.z.enum(['fast', 'standard', 'deep']).default('standard'),
    taskType: zod_1.z.string().min(1).max(64).default('text'),
    query: zod_1.z.string().min(1).max(4096),
    topK: zod_1.z.number().int().min(1).max(20).default(8),
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
});
exports.INTERNAL_MEMORY_RECALL_BUNDLE_PATH = '/internal/memory/recall/bundle';
exports.internalMemoryRecallBundleContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_RECALL_BUNDLE_PATH,
    authType: 'secret',
    bodySchema: exports.InternalMemoryRecallBundleRequestSchema,
    responseSchema: exports.InternalMemoryRecallBundleResponseSchema,
};
//# sourceMappingURL=internal-memory-recall-bundle.js.map