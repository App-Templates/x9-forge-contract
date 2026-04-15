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
export type InternalQueryRequest = z.infer<typeof InternalQueryRequestSchema>;

export const InternalQueryResponseSchema = z.object({
  answer: z.string(),
});
export type InternalQueryResponse = z.infer<typeof InternalQueryResponseSchema>;

export const InternalQueryErrorResponseSchema = z.object({
  error: z.string(),
});
export type InternalQueryErrorResponse = z.infer<typeof InternalQueryErrorResponseSchema>;

export const internalQueryContract = {
  method: 'POST' as const,
  path: '/internal/query' as const,
  authType: 'secret' as const,
  bodySchema: InternalQueryRequestSchema,
  responseSchema: InternalQueryResponseSchema,
} as const;
