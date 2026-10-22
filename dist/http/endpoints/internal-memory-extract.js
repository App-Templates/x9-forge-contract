import { z } from 'zod';
/**
 * POST /internal/memory/extract — async memory extraction endpoint.
 * Direction: X9 internal (agent-core -> memory-svc)
 * Auth: X-Internal-Secret
 * Feature flag: MEMORY_V2_EXTRACT_ENABLED (503 when disabled)
 *
 * Triggers the v2 extraction pipeline (ADR §12.2): LLM extraction →
 * taxonomy mapping → slot-key → entity resolution → promotion gate →
 * conflict detection → DB write.
 *
 * Phase 36.9 — async extraction pipeline.
 */
export const InternalMemoryExtractRequestSchema = z.object({
    tenantId: z.string().min(1).max(256),
    ownerId: z.string().min(1).max(256),
    agentId: z.string().min(1).max(64),
    userId: z.string().min(1).max(256).optional(),
    sessionId: z.string().min(1).max(256),
    userMessage: z.string().min(1),
    assistantReply: z.string().min(1),
    sourceTimestamp: z.string().datetime({ offset: true }),
    isOnboarding: z.boolean().default(false),
});
export const InternalMemoryExtractResponseSchema = z.object({
    status: z.string(),
    factsWritten: z.number(),
    rulesWritten: z.number(),
    entitiesCreated: z.number(),
    candidatesDiscarded: z.number(),
    needsReview: z.number(),
});
export const InternalMemoryExtractErrorResponseSchema = z.object({
    error: z.string(),
});
export const INTERNAL_MEMORY_EXTRACT_PATH = '/internal/memory/extract';
export const internalMemoryExtractContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_EXTRACT_PATH,
    authType: 'secret',
    bodySchema: InternalMemoryExtractRequestSchema,
    responseSchema: InternalMemoryExtractResponseSchema,
};
//# sourceMappingURL=internal-memory-extract.js.map