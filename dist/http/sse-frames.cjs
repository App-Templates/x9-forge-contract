"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SseFrameSchema = exports.SseAbortedFrameSchema = exports.SseErrorFrameSchema = exports.SseDoneFrameSchema = exports.SseToolCallEndFrameSchema = exports.SseToolCallStartFrameSchema = exports.SseTextFrameSchema = void 0;
const zod_1 = require("zod");
const internal_turn_js_1 = require("./endpoints/internal-turn.cjs");
/**
 * SSE frame shapes emitted by POST /internal/turn/stream.
 * Discriminated union on the `type` field.
 * Requirement: HTTP-05 (SSE frame shape typing)
 *
 * Frame types from agent-core turn-processor.ts TurnChunk:
 * - text: streaming text delta
 * - tool_call_start: tool dispatch started
 * - tool_call_end: tool dispatch completed (ok/fail)
 * - done: turn complete with final reply + updated history
 * - error: turn failed with error message
 * - aborted: turn aborted (client disconnect or timeout)
 *
 * Heartbeat frames (`: heartbeat\n\n`) are SSE comments, not JSON data.
 * They are handled at the SSE protocol level, not as typed frames.
 */
exports.SseTextFrameSchema = zod_1.z.object({
    type: zod_1.z.literal('text'),
    delta: zod_1.z.string(),
});
exports.SseToolCallStartFrameSchema = zod_1.z.object({
    type: zod_1.z.literal('tool_call_start'),
    name: zod_1.z.string().min(1),
    callId: zod_1.z.string().min(1),
});
exports.SseToolCallEndFrameSchema = zod_1.z.object({
    type: zod_1.z.literal('tool_call_end'),
    name: zod_1.z.string().min(1),
    callId: zod_1.z.string().min(1),
    ok: zod_1.z.boolean(),
});
exports.SseDoneFrameSchema = zod_1.z.object({
    type: zod_1.z.literal('done'),
    reply: zod_1.z.string(),
    updatedHistory: zod_1.z.array(internal_turn_js_1.LLMMessageSchema),
});
exports.SseErrorFrameSchema = zod_1.z.object({
    type: zod_1.z.literal('error'),
    message: zod_1.z.string(),
});
exports.SseAbortedFrameSchema = zod_1.z.object({
    type: zod_1.z.literal('aborted'),
    reason: zod_1.z.string().optional(),
});
/**
 * Discriminated union of all SSE frame types.
 * Use SseFrameSchema.safeParse(json) to validate incoming frames.
 */
exports.SseFrameSchema = zod_1.z.discriminatedUnion('type', [
    exports.SseTextFrameSchema,
    exports.SseToolCallStartFrameSchema,
    exports.SseToolCallEndFrameSchema,
    exports.SseDoneFrameSchema,
    exports.SseErrorFrameSchema,
    exports.SseAbortedFrameSchema,
]);
//# sourceMappingURL=sse-frames.js.map