import { z } from 'zod';
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
export declare const SseTextFrameSchema: z.ZodObject<{
    type: z.ZodLiteral<"text">;
    delta: z.ZodString;
}, z.core.$strip>;
export type SseTextFrame = z.infer<typeof SseTextFrameSchema>;
export declare const SseToolCallStartFrameSchema: z.ZodObject<{
    type: z.ZodLiteral<"tool_call_start">;
    name: z.ZodString;
    callId: z.ZodString;
}, z.core.$strip>;
export type SseToolCallStartFrame = z.infer<typeof SseToolCallStartFrameSchema>;
export declare const SseToolCallEndFrameSchema: z.ZodObject<{
    type: z.ZodLiteral<"tool_call_end">;
    name: z.ZodString;
    callId: z.ZodString;
    ok: z.ZodBoolean;
}, z.core.$strip>;
export type SseToolCallEndFrame = z.infer<typeof SseToolCallEndFrameSchema>;
export declare const SseDoneFrameSchema: z.ZodObject<{
    type: z.ZodLiteral<"done">;
    reply: z.ZodString;
    updatedHistory: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<{
            tool: "tool";
            system: "system";
            user: "user";
            assistant: "assistant";
        }>;
        content: z.ZodString;
        toolCallId: z.ZodOptional<z.ZodString>;
        toolName: z.ZodOptional<z.ZodString>;
        toolCalls: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type SseDoneFrame = z.infer<typeof SseDoneFrameSchema>;
export declare const SseErrorFrameSchema: z.ZodObject<{
    type: z.ZodLiteral<"error">;
    message: z.ZodString;
}, z.core.$strip>;
export type SseErrorFrame = z.infer<typeof SseErrorFrameSchema>;
export declare const SseAbortedFrameSchema: z.ZodObject<{
    type: z.ZodLiteral<"aborted">;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SseAbortedFrame = z.infer<typeof SseAbortedFrameSchema>;
/**
 * Discriminated union of all SSE frame types.
 * Use SseFrameSchema.safeParse(json) to validate incoming frames.
 */
export declare const SseFrameSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"text">;
    delta: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"tool_call_start">;
    name: z.ZodString;
    callId: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"tool_call_end">;
    name: z.ZodString;
    callId: z.ZodString;
    ok: z.ZodBoolean;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"done">;
    reply: z.ZodString;
    updatedHistory: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<{
            tool: "tool";
            system: "system";
            user: "user";
            assistant: "assistant";
        }>;
        content: z.ZodString;
        toolCallId: z.ZodOptional<z.ZodString>;
        toolName: z.ZodOptional<z.ZodString>;
        toolCalls: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"error">;
    message: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"aborted">;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>], "type">;
export type SseFrame = z.infer<typeof SseFrameSchema>;
//# sourceMappingURL=sse-frames.d.ts.map