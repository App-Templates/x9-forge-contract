"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalQueryContract = exports.InternalQueryErrorResponseSchema = exports.InternalQueryResponseSchema = exports.InternalQueryRequestSchema = void 0;
const zod_1 = require("zod");
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
exports.InternalQueryRequestSchema = zod_1.z.object({
    question: zod_1.z.string().min(1),
    sessionId: zod_1.z.string().optional(),
    context: zod_1.z.string().optional(),
});
exports.InternalQueryResponseSchema = zod_1.z.object({
    answer: zod_1.z.string(),
});
exports.InternalQueryErrorResponseSchema = zod_1.z.object({
    error: zod_1.z.string(),
});
exports.internalQueryContract = {
    method: 'POST',
    path: '/internal/query',
    authType: 'secret',
    bodySchema: exports.InternalQueryRequestSchema,
    responseSchema: exports.InternalQueryResponseSchema,
};
//# sourceMappingURL=internal-query.js.map