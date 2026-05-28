"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceCallToolLogSchema = exports.VoiceToolCallSourceSchema = void 0;
const zod_1 = require("zod");
const tools_js_1 = require("./tools.cjs");
/**
 * Voice-call tool log entry — shape of a row in `call_tool_calls` per D-27.
 *
 * Every tool invocation during a voice call is persisted for:
 *   - deterministic reconciliation (D-09 truth order);
 *   - D-14 calendar-verification invariant enforcement;
 *   - D-28 SLO metrics (`tool_latency_ms`, `tool_failure_rate`,
 *     `unauthorized_tool_attempt_count`).
 *
 * `tool_call_source` distinguishes model-originated calls (elevenlabs),
 * system-originated (cap-voice internal), retries (sweeper/compensation),
 * and admin-initiated re-runs.
 *
 * @see docs/adr/ADR-cap-voice.md §17 / D-27 (call_tool_calls additions)
 */
/** Named enum for the source column (no inline `z.enum`). */
exports.VoiceToolCallSourceSchema = zod_1.z.enum(['elevenlabs', 'system', 'retry', 'admin']);
exports.VoiceCallToolLogSchema = zod_1.z.object({
    /** Row id (generated cap-voice-side). */
    id: zod_1.z.string().min(1),
    call_id: zod_1.z.string().min(1),
    tool: tools_js_1.VoiceToolNameSchema,
    tool_call_source: exports.VoiceToolCallSourceSchema,
    /** Server-side authorization verdict (D-13). */
    authorized: zod_1.z.boolean(),
    /** Populated when `authorized=false`. */
    authorization_error: zod_1.z.string().optional(),
    status: tools_js_1.VoiceToolStatusSchema,
    /** Request input payload (no PII redaction at bridge layer — done upstream). */
    input_json: zod_1.z.unknown(),
    /** Response output payload. Unset on error. */
    output_json: zod_1.z.unknown().optional(),
    /** Human-readable error when `status != "ok"`. */
    error: zod_1.z.string().optional(),
    /** Execution duration — emitted as D-28 metric. */
    duration_ms: zod_1.z.number().int().nonnegative().optional(),
    /** D-17 idempotency key (for mutating tools). */
    idempotency_key: zod_1.z.string().optional(),
    /** RFC-3339 — when the log entry was written. */
    created_at: zod_1.z.string().datetime({ offset: true }),
});
//# sourceMappingURL=tool-log.js.map