import { z } from 'zod';
import { RecallTemporalFilterSchema } from "../../memory/temporal.js";
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
export const InternalMemoryRecallBundleRequestSchema = z.object({
    tenantId: z.string().min(1).max(256),
    ownerId: z.string().min(1).max(256),
    agentId: z.string().min(1).max(64),
    userId: z.string().min(1).max(256).optional(),
    mode: z.enum(['fast', 'standard', 'deep']).default('standard'),
    taskType: z.string().min(1).max(64).default('text'),
    query: z.string().min(1).max(4096),
    topK: z.number().int().min(1).max(20).default(8),
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
});
export const INTERNAL_MEMORY_RECALL_BUNDLE_PATH = '/internal/memory/recall/bundle';
export const internalMemoryRecallBundleContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_RECALL_BUNDLE_PATH,
    authType: 'secret',
    bodySchema: InternalMemoryRecallBundleRequestSchema,
    responseSchema: InternalMemoryRecallBundleResponseSchema,
};
//# sourceMappingURL=internal-memory-recall-bundle.js.map