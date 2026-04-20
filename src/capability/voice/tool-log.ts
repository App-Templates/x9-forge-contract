import { z } from 'zod';
import { VoiceToolNameSchema, VoiceToolStatusSchema } from './tools.js';

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
export const VoiceToolCallSourceSchema = z.enum(['elevenlabs', 'system', 'retry', 'admin']);
export type VoiceToolCallSource = z.infer<typeof VoiceToolCallSourceSchema>;

export const VoiceCallToolLogSchema = z.object({
  /** Row id (generated cap-voice-side). */
  id: z.string().min(1),
  call_id: z.string().min(1),
  tool: VoiceToolNameSchema,
  tool_call_source: VoiceToolCallSourceSchema,
  /** Server-side authorization verdict (D-13). */
  authorized: z.boolean(),
  /** Populated when `authorized=false`. */
  authorization_error: z.string().optional(),
  status: VoiceToolStatusSchema,
  /** Request input payload (no PII redaction at bridge layer — done upstream). */
  input_json: z.unknown(),
  /** Response output payload. Unset on error. */
  output_json: z.unknown().optional(),
  /** Human-readable error when `status != "ok"`. */
  error: z.string().optional(),
  /** Execution duration — emitted as D-28 metric. */
  duration_ms: z.number().int().nonnegative().optional(),
  /** D-17 idempotency key (for mutating tools). */
  idempotency_key: z.string().optional(),
  /** RFC-3339 — when the log entry was written. */
  created_at: z.string().datetime({ offset: true }),
});
export type VoiceCallToolLog = z.infer<typeof VoiceCallToolLogSchema>;
