import { z } from 'zod';
/**
 * POST /internal/query — internal query endpoint (cap-voice fallback).
 * Direction: X9 internal (cap-voice -> agent-core)
 * Auth: X-Internal-Secret
 * Requirement: HTTP-06
 *
 * Real internalQuerySchema from agent-core (services/agent-core/src/index.ts:162-166):
 *   - question: string min 1
 *   - sessionId?: string (defaults to "internal" server-side)
 *   - context?: string (prepended to question as "[Context: ...]")
 *
 * Response: `{ answer: string }` on success, `{ error: string }` on failure.
 */
export const InternalQueryRequestSchema = z.object({
    question: z.string().min(1),
    sessionId: z.string().optional(),
    context: z.string().optional(),
});
export const InternalQueryResponseSchema = z.object({
    answer: z.string(),
});
export const InternalQueryErrorResponseSchema = z.object({
    error: z.string(),
});
export const internalQueryContract = {
    method: 'POST',
    path: '/internal/query',
    authType: 'secret',
    bodySchema: InternalQueryRequestSchema,
    responseSchema: InternalQueryResponseSchema,
};
//# sourceMappingURL=internal-query.js.map