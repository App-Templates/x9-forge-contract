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
/**
 * SSE error response (non-200 — returned as JSON before the stream starts).
 * 400 = invalid body, 429 = rate limit.
 */
export const InternalTurnStreamErrorResponseSchema = z.object({
    ok: z.literal(false),
    error: z.string(),
});
export const internalTurnStreamContract = {
    method: 'POST',
    path: '/internal/turn/stream',
    authType: 'secret',
    bodySchema: InternalTurnRequestSchema,
    /** Response is an SSE stream (Content-Type: text/event-stream). Frame schemas in sse-frames.ts (04-02). */
    responseType: 'sse',
};
//# sourceMappingURL=internal-turn-stream.js.map