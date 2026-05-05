import { z } from 'zod';
import { InternalTurnRequestSchema } from "./internal-turn.js";
/**
 * POST /internal/turn/stream — channel-agnostic streaming turn via SSE.
 * Direction: X9 cap-glasses -> X9 agent-core (internal)
 * Auth: X-Internal-Secret
 * Requirement: HTTP-05
 *
 * Request body is IDENTICAL to /internal/turn (same internalTurnSchema).
 * Response is a text/event-stream — SSE frame shapes defined in Plan 04-02
 * (src/http/sse-frames.ts). Individual frame shapes (TurnChunk: text,
 * tool_call_start, tool_call_end, done, error, aborted, heartbeat) are not
 * part of this plan.
 */
/** Re-export the request schema — same body as /internal/turn. */
export { InternalTurnRequestSchema as InternalTurnStreamRequestSchema };
export type { InternalTurnRequest as InternalTurnStreamRequest } from "./internal-turn.js";
/**
 * SSE error response (non-200 — returned as JSON before the stream starts).
 * 400 = invalid body, 429 = rate limit.
 */
export declare const InternalTurnStreamErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strip>;
export type InternalTurnStreamErrorResponse = z.infer<typeof InternalTurnStreamErrorResponseSchema>;
export declare const internalTurnStreamContract: {
    readonly method: "POST";
    readonly path: "/internal/turn/stream";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        channelId: z.ZodString;
        sessionId: z.ZodString;
        message: z.ZodString;
        history: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    /** Response is an SSE stream (Content-Type: text/event-stream). Frame schemas in sse-frames.ts (04-02). */
    readonly responseType: "sse";
};
//# sourceMappingURL=internal-turn-stream.d.ts.map