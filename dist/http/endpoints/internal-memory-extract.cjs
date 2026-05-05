"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryExtractContract = exports.INTERNAL_MEMORY_EXTRACT_PATH = exports.InternalMemoryExtractErrorResponseSchema = exports.InternalMemoryExtractResponseSchema = exports.InternalMemoryExtractRequestSchema = void 0;
const zod_1 = require("zod");
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
exports.InternalMemoryExtractRequestSchema = zod_1.z.object({
    tenantId: zod_1.z.string().min(1).max(256),
    ownerId: zod_1.z.string().min(1).max(256),
    agentId: zod_1.z.string().min(1).max(64),
    userId: zod_1.z.string().min(1).max(256).optional(),
    sessionId: zod_1.z.string().min(1).max(256),
    userMessage: zod_1.z.string().min(1),
    assistantReply: zod_1.z.string().min(1),
    sourceTimestamp: zod_1.z.string().datetime({ offset: true }),
    isOnboarding: zod_1.z.boolean().default(false),
});
exports.InternalMemoryExtractResponseSchema = zod_1.z.object({
    status: zod_1.z.string(),
    factsWritten: zod_1.z.number(),
    rulesWritten: zod_1.z.number(),
    entitiesCreated: zod_1.z.number(),
    candidatesDiscarded: zod_1.z.number(),
    needsReview: zod_1.z.number(),
});
exports.InternalMemoryExtractErrorResponseSchema = zod_1.z.object({
    error: zod_1.z.string(),
});
exports.INTERNAL_MEMORY_EXTRACT_PATH = '/internal/memory/extract';
exports.internalMemoryExtractContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_EXTRACT_PATH,
    authType: 'secret',
    bodySchema: exports.InternalMemoryExtractRequestSchema,
    responseSchema: exports.InternalMemoryExtractResponseSchema,
};
//# sourceMappingURL=internal-memory-extract.js.map