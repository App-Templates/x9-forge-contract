"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalTurnContract = exports.InternalTurnErrorResponseSchema = exports.InternalTurnResponseSchema = exports.InternalTurnRequestSchema = exports.LLMMessageSchema = void 0;
const zod_1 = require("zod");
/**
 * POST /internal/turn — channel-agnostic synchronous turn.
 * Direction: X9 cap-glasses/cap-* -> X9 agent-core (internal)
 * Auth: X-Internal-Secret
 * Requirement: HTTP-04
 *
 * Real internalTurnSchema from agent-core (services/agent-core/src/index.ts:176-192):
 *   - channelId: regex /^[a-z0-9-]{1,64}$/
 *   - sessionId: regex /^[a-z0-9-]{1,64}$/
 *   - message: string min 1
 *   - history?: array of LLMMessage objects
 *
 * Response: `{ ok: true, reply: string, updatedHistory: LLMMessage[] }`
 *
 * LLMMessageSchema is shared with /internal/turn/stream (HTTP-05) and exposed
 * from the endpoints barrel for consumers (cap-glasses agent-bridge mirror type).
 */
/** LLM message shape as exchanged in turn history. */
exports.LLMMessageSchema = zod_1.z.object({
    role: zod_1.z.enum(['system', 'user', 'assistant', 'tool']),
    content: zod_1.z.string(),
    toolCallId: zod_1.z.string().optional(),
    toolName: zod_1.z.string().optional(),
    toolCalls: zod_1.z
        .array(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        input: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
    }))
        .optional(),
});
exports.InternalTurnRequestSchema = zod_1.z.object({
    channelId: zod_1.z.string().regex(/^[a-z0-9-]{1,64}$/),
    sessionId: zod_1.z.string().regex(/^[a-z0-9-]{1,64}$/),
    message: zod_1.z.string().min(1),
    history: zod_1.z.array(exports.LLMMessageSchema).optional(),
});
exports.InternalTurnResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    reply: zod_1.z.string(),
    updatedHistory: zod_1.z.array(exports.LLMMessageSchema),
});
exports.InternalTurnErrorResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: zod_1.z.string(),
});
exports.internalTurnContract = {
    method: 'POST',
    path: '/internal/turn',
    authType: 'secret',
    bodySchema: exports.InternalTurnRequestSchema,
    responseSchema: exports.InternalTurnResponseSchema,
};
//# sourceMappingURL=internal-turn.js.map