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
export declare const InternalMemoryExtractRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    agentId: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodString;
    userMessage: z.ZodString;
    assistantReply: z.ZodString;
    sourceTimestamp: z.ZodString;
    isOnboarding: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type InternalMemoryExtractRequest = z.infer<typeof InternalMemoryExtractRequestSchema>;
export declare const InternalMemoryExtractResponseSchema: z.ZodObject<{
    status: z.ZodString;
    factsWritten: z.ZodNumber;
    rulesWritten: z.ZodNumber;
    entitiesCreated: z.ZodNumber;
    candidatesDiscarded: z.ZodNumber;
    needsReview: z.ZodNumber;
}, z.core.$strip>;
export type InternalMemoryExtractResponse = z.infer<typeof InternalMemoryExtractResponseSchema>;
export declare const InternalMemoryExtractErrorResponseSchema: z.ZodObject<{
    error: z.ZodString;
}, z.core.$strip>;
export type InternalMemoryExtractErrorResponse = z.infer<typeof InternalMemoryExtractErrorResponseSchema>;
export declare const INTERNAL_MEMORY_EXTRACT_PATH: "/internal/memory/extract";
export declare const internalMemoryExtractContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/extract";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        agentId: z.ZodString;
        userId: z.ZodOptional<z.ZodString>;
        sessionId: z.ZodString;
        userMessage: z.ZodString;
        assistantReply: z.ZodString;
        sourceTimestamp: z.ZodString;
        isOnboarding: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        status: z.ZodString;
        factsWritten: z.ZodNumber;
        rulesWritten: z.ZodNumber;
        entitiesCreated: z.ZodNumber;
        candidatesDiscarded: z.ZodNumber;
        needsReview: z.ZodNumber;
    }, z.core.$strip>;
};
//# sourceMappingURL=internal-memory-extract.d.ts.map