import { z } from 'zod';
/**
 * 13-tool voice surface per ADR §13.1 / D-16.
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
    'confirm_recipient_email',
    'draft_recap_email',
    'create_reminder',
    'notify_stefano',
    'log_call_outcome',
]);
/**
 * Mutating tools per D-17 — every call MUST carry `idempotency_key`.
 * Exported as a runtime Set so `.superRefine()` can gate without duplication.
 *
 * Idempotency key format (enforced caller-side):
 *   `${call_id}:${tool_name}:${normalized_action_hash}`
 *
 * NOTE: `confirm_recipient_email` is intentionally excluded — it is a brief-
 * population prerequisite, not a downstream mutation. No idempotency_key
 * required. See ADR §13.5 (Bug A server-authoritative recipient_email).
 */
export const MUTATING_VOICE_TOOLS = new Set([
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
/**
 * confirm_recipient_email input — RFC-5322 email address confirmed by the
 * user during the call. Populates VoiceCallBrief.recipient_email server-side,
 * closing the foot-gun where the LLM could forge a `to` param on send_recap_email.
 *
 * @see ADR-cap-voice §13 (D-16 — server-authoritative recipient_email)
 * @see services/cap-voice/src/tools/confirm-recipient-email.ts (consumer)
 */
export const ConfirmRecipientEmailInputSchema = z.object({
    email: z.string().email(),
});
/**
 * confirm_recipient_email output. `shadow: true` when CAP_VOICE_SHADOW_MODE=true
 * (no DB write occurred); `message` is a human-readable summary for logs.
 */
export const ConfirmRecipientEmailOutputSchema = z.object({
    confirmed: z.boolean(),
    email: z.string().email(),
    shadow: z.boolean().optional(),
    message: z.string().optional(),
});
/**
 * send_recap_email input — narrowed from the generic `z.record(z.string(), z.unknown())`
 * envelope (D-16). Bug C fold-in (Phase 46.1) makes the recap body server-composed,
 * so the LLM only supplies an optional intent hint. Subject + body are produced
 * server-side via `composeRecapBody()` — zero hallucination surface.
 *
 * @see docs/adr/ADR-cap-voice.md §13.5 (server-authoritative D-16 pattern)
 * @see project_bug_c_decided_fold_in_m46_2026_04_23.md
 */
export const SendRecapEmailInputSchema = z.object({
    intent: z.string().max(200).optional(),
});
/**
 * send_recap_email output. `body_source` is currently `template`-only; M47+
 * may widen to `z.enum(['template', 'llm_synthesis'])` after observing template
 * adequacy on N live calls (Phase 46.1 D-15 — deferred).
 */
export const SendRecapEmailOutputSchema = z.object({
    sent: z.boolean(),
    recipient_email: z.string().email(),
    subject: z.string(),
    message_id: z.string(),
    body_source: z.enum(['template']),
    shadow: z.boolean().optional(),
});
//# sourceMappingURL=tools.js.map