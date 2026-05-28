import { z } from 'zod';
import { LLMMessageSchema } from "./endpoints/internal-turn.js";
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
export const SseTextFrameSchema = z.object({
    type: z.literal('text'),
    delta: z.string(),
});
export const SseToolCallStartFrameSchema = z.object({
    type: z.literal('tool_call_start'),
    name: z.string().min(1),
    callId: z.string().min(1),
});
export const SseToolCallEndFrameSchema = z.object({
    type: z.literal('tool_call_end'),
    name: z.string().min(1),
    callId: z.string().min(1),
    ok: z.boolean(),
});
export const SseDoneFrameSchema = z.object({
    type: z.literal('done'),
    reply: z.string(),
    updatedHistory: z.array(LLMMessageSchema),
});
export const SseErrorFrameSchema = z.object({
    type: z.literal('error'),
    message: z.string(),
});
export const SseAbortedFrameSchema = z.object({
    type: z.literal('aborted'),
    reason: z.string().optional(),
});
/**
 * Discriminated union of all SSE frame types.
 * Use SseFrameSchema.safeParse(json) to validate incoming frames.
 */
export const SseFrameSchema = z.discriminatedUnion('type', [
    SseTextFrameSchema,
    SseToolCallStartFrameSchema,
    SseToolCallEndFrameSchema,
    SseDoneFrameSchema,
    SseErrorFrameSchema,
    SseAbortedFrameSchema,
]);
//# sourceMappingURL=sse-frames.js.map