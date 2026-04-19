import { z } from 'zod';

/**
 * 12-tool voice surface per ADR §13.1 / D-16.
 *
 * Exported as a named Zod enum so consumers can reference `VoiceToolNameSchema`
 * instead of inline `z.enum([...])` — R-14 compliance.
 */
export const VoiceToolNameSchema = z.enum([
  'search_context',
  'get_calendar_availability',
  'check_calendar_conflicts',
  'update_calendar_event',
  'create_calendar_event',
  'block_calendar_slot',
  'release_calendar_block',
  'send_recap_email',
  'draft_recap_email',
  'create_reminder',
  'notify_stefano',
  'log_call_outcome',
]);
export type VoiceToolName = z.infer<typeof VoiceToolNameSchema>;

/**
 * Mutating tools per D-17 — every call MUST carry `idempotency_key`.
 * Exported as a runtime Set so `.superRefine()` can gate without duplication.
 *
 * Idempotency key format (enforced caller-side):
 *   `${call_id}:${tool_name}:${normalized_action_hash}`
 */
export const MUTATING_VOICE_TOOLS: ReadonlySet<VoiceToolName> = new Set<VoiceToolName>([
  'update_calendar_event',
  'create_calendar_event',
  'block_calendar_slot',
  'release_calendar_block',
  'send_recap_email',
  'create_reminder',
  'log_call_outcome',
]);

/**
 * Server-side tool-execution status. Distinct from `ToolCallResponse.status`
 * (the generic capability-tool response) because voice adds authorization and
 * idempotency-replay outcomes.
 */
export const VoiceToolStatusSchema = z.enum([
  'ok',
  'error',
  'unauthorized',
  'invariant_rejected',
  'idempotency_replay',
]);
export type VoiceToolStatus = z.infer<typeof VoiceToolStatusSchema>;

/**
 * Generic voice-tool request envelope. Tool-specific `input` shape is
 * composed at the downstream endpoint (calendar-tools.ts etc).
 *
 * `.superRefine` enforces D-17: mutating tools require `idempotency_key`.
 *
 * @see docs/adr/ADR-cap-voice.md §13.3 (mutating tool requirements)
 */
export const VoiceToolCallRequestSchema = z
  .object({
    /** Canonical call id bound to this tool invocation. */
    call_id: z.string().min(1),
    /** Forge agent id (keyed in vault / workspace). */
    agent_id: z.string().min(1),
    /** Tool name — constrained to the 12-tool surface. */
    tool: VoiceToolNameSchema,
    /**
     * Idempotency key per D-17. REQUIRED for mutating tools (enforced by
     * superRefine below). Format: `${call_id}:${tool}:${action_hash}`.
     */
    idempotency_key: z.string().min(1).optional(),
    /** Tool-specific input shape — narrowed at consumer boundary. */
    input: z.record(z.string(), z.unknown()),
  })
  .superRefine((val, ctx) => {
    if (MUTATING_VOICE_TOOLS.has(val.tool) && !val.idempotency_key) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['idempotency_key'],
        message: `idempotency_key required for mutating tool "${val.tool}" (D-17)`,
      });
    }
  });
export type VoiceToolCallRequest = z.infer<typeof VoiceToolCallRequestSchema>;

/**
 * Generic voice-tool response envelope. Echoed back to ElevenLabs / caller.
 */
export const VoiceToolCallResponseSchema = z.object({
  call_id: z.string().min(1),
  tool: VoiceToolNameSchema,
  status: VoiceToolStatusSchema,
  /** Tool-specific output on success. Normalized by caller. */
  output: z.unknown().optional(),
  /** Human-readable error (never leak secrets — see D-28 log hygiene). */
  error: z.string().optional(),
  /** Server-side execution duration — emitted as metric per D-28. */
  duration_ms: z.number().int().nonnegative().optional(),
  /** True when a prior `idempotency_key` hit cached the result (D-17). */
  idempotency_replayed: z.boolean().optional(),
});
export type VoiceToolCallResponse = z.infer<typeof VoiceToolCallResponseSchema>;
