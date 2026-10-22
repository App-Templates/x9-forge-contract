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
export declare const InternalQueryRequestSchema: z.ZodObject<{
    question: z.ZodString;
    sessionId: z.ZodOptional<z.ZodString>;
    context: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type InternalQueryRequest = z.infer<typeof InternalQueryRequestSchema>;
export declare const InternalQueryResponseSchema: z.ZodObject<{
    answer: z.ZodString;
}, z.core.$strip>;
export type InternalQueryResponse = z.infer<typeof InternalQueryResponseSchema>;
export declare const InternalQueryErrorResponseSchema: z.ZodObject<{
    error: z.ZodString;
}, z.core.$strip>;
export type InternalQueryErrorResponse = z.infer<typeof InternalQueryErrorResponseSchema>;
export declare const internalQueryContract: {
    readonly method: "POST";
    readonly path: "/internal/query";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        question: z.ZodString;
        sessionId: z.ZodOptional<z.ZodString>;
        context: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        answer: z.ZodString;
    }, z.core.$strip>;
};
//# sourceMappingURL=internal-query.d.ts.map