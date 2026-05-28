"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalTurnStreamContract = exports.InternalTurnStreamErrorResponseSchema = exports.InternalTurnStreamRequestSchema = void 0;
const zod_1 = require("zod");
const internal_turn_js_1 = require("./internal-turn.cjs");
Object.defineProperty(exports, "InternalTurnStreamRequestSchema", { enumerable: true, get: function () { return internal_turn_js_1.InternalTurnRequestSchema; } });
/**
 * SSE error response (non-200 — returned as JSON before the stream starts).
 * 400 = invalid body, 429 = rate limit.
 */
exports.InternalTurnStreamErrorResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: zod_1.z.string(),
});
exports.internalTurnStreamContract = {
    method: 'POST',
    path: '/internal/turn/stream',
    authType: 'secret',
    bodySchema: internal_turn_js_1.InternalTurnRequestSchema,
    /** Response is an SSE stream (Content-Type: text/event-stream). Frame schemas in sse-frames.ts (04-02). */
    responseType: 'sse',
};
//# sourceMappingURL=internal-turn-stream.js.map