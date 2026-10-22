import { z } from 'zod';
/**
 * 13-tool voice surface per ADR §13.1 / D-16.
 *
 * Exported as a named Zod enum so consumers can reference `VoiceToolNameSchema`
 * instead of inline `z.enum([...])` — R-14 compliance.
 */
export declare const VoiceToolNameSchema: z.ZodEnum<{
    search_context: "search_context";
    get_calendar_availability: "get_calendar_availability";
    check_calendar_conflicts: "check_calendar_conflicts";
    update_calendar_event: "update_calendar_event";
    create_calendar_event: "create_calendar_event";
    block_calendar_slot: "block_calendar_slot";
    release_calendar_block: "release_calendar_block";
    send_recap_email: "send_recap_email";
    confirm_recipient_email: "confirm_recipient_email";
    draft_recap_email: "draft_recap_email";
    create_reminder: "create_reminder";
    notify_stefano: "notify_stefano";
    log_call_outcome: "log_call_outcome";
}>;
export type VoiceToolName = z.infer<typeof VoiceToolNameSchema>;
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
export declare const MUTATING_VOICE_TOOLS: ReadonlySet<VoiceToolName>;
/**
 * Server-side tool-execution status. Distinct from `ToolCallResponse.status`
 * (the generic capability-tool response) because voice adds authorization and
 * idempotency-replay outcomes.
 */
export declare const VoiceToolStatusSchema: z.ZodEnum<{
    error: "error";
    ok: "ok";
    unauthorized: "unauthorized";
    invariant_rejected: "invariant_rejected";
    idempotency_replay: "idempotency_replay";
}>;
export type VoiceToolStatus = z.infer<typeof VoiceToolStatusSchema>;
/**
 * Generic voice-tool request envelope. Tool-specific `input` shape is
 * composed at the downstream endpoint (calendar-tools.ts etc).
 *
 * `.superRefine` enforces D-17: mutating tools require `idempotency_key`.
 *
 * @see docs/adr/ADR-cap-voice.md §13.3 (mutating tool requirements)
 */
export declare const VoiceToolCallRequestSchema: z.ZodObject<{
    call_id: z.ZodString;
    agent_id: z.ZodString;
    tool: z.ZodEnum<{
        search_context: "search_context";
        get_calendar_availability: "get_calendar_availability";
        check_calendar_conflicts: "check_calendar_conflicts";
        update_calendar_event: "update_calendar_event";
        create_calendar_event: "create_calendar_event";
        block_calendar_slot: "block_calendar_slot";
        release_calendar_block: "release_calendar_block";
        send_recap_email: "send_recap_email";
        confirm_recipient_email: "confirm_recipient_email";
        draft_recap_email: "draft_recap_email";
        create_reminder: "create_reminder";
        notify_stefano: "notify_stefano";
        log_call_outcome: "log_call_outcome";
    }>;
    idempotency_key: z.ZodOptional<z.ZodString>;
    input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;
export type VoiceToolCallRequest = z.infer<typeof VoiceToolCallRequestSchema>;
/**
 * Generic voice-tool response envelope. Echoed back to ElevenLabs / caller.
 */
export declare const VoiceToolCallResponseSchema: z.ZodObject<{
    call_id: z.ZodString;
    tool: z.ZodEnum<{
        search_context: "search_context";
        get_calendar_availability: "get_calendar_availability";
        check_calendar_conflicts: "check_calendar_conflicts";
        update_calendar_event: "update_calendar_event";
        create_calendar_event: "create_calendar_event";
        block_calendar_slot: "block_calendar_slot";
        release_calendar_block: "release_calendar_block";
        send_recap_email: "send_recap_email";
        confirm_recipient_email: "confirm_recipient_email";
        draft_recap_email: "draft_recap_email";
        create_reminder: "create_reminder";
        notify_stefano: "notify_stefano";
        log_call_outcome: "log_call_outcome";
    }>;
    status: z.ZodEnum<{
        error: "error";
        ok: "ok";
        unauthorized: "unauthorized";
        invariant_rejected: "invariant_rejected";
        idempotency_replay: "idempotency_replay";
    }>;
    output: z.ZodOptional<z.ZodUnknown>;
    error: z.ZodOptional<z.ZodString>;
    duration_ms: z.ZodOptional<z.ZodNumber>;
    idempotency_replayed: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type VoiceToolCallResponse = z.infer<typeof VoiceToolCallResponseSchema>;
/**
 * confirm_recipient_email input — RFC-5322 email address confirmed by the
 * user during the call. Populates VoiceCallBrief.recipient_email server-side,
 * closing the foot-gun where the LLM could forge a `to` param on send_recap_email.
 *
 * @see ADR-cap-voice §13 (D-16 — server-authoritative recipient_email)
 * @see services/cap-voice/src/tools/confirm-recipient-email.ts (consumer)
 */
export declare const ConfirmRecipientEmailInputSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export type ConfirmRecipientEmailInput = z.infer<typeof ConfirmRecipientEmailInputSchema>;
/**
 * confirm_recipient_email output. `shadow: true` when CAP_VOICE_SHADOW_MODE=true
 * (no DB write occurred); `message` is a human-readable summary for logs.
 */
export declare const ConfirmRecipientEmailOutputSchema: z.ZodObject<{
    confirmed: z.ZodBoolean;
    email: z.ZodString;
    shadow: z.ZodOptional<z.ZodBoolean>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ConfirmRecipientEmailOutput = z.infer<typeof ConfirmRecipientEmailOutputSchema>;
/**
 * send_recap_email input — narrowed from the generic `z.record(z.string(), z.unknown())`
 * envelope (D-16). Bug C fold-in (Phase 46.1) makes the recap body server-composed,
 * so the LLM only supplies an optional intent hint. Subject + body are produced
 * server-side via `composeRecapBody()` — zero hallucination surface.
 *
 * @see docs/adr/ADR-cap-voice.md §13.5 (server-authoritative D-16 pattern)
 * @see project_bug_c_decided_fold_in_m46_2026_04_23.md
 */
export declare const SendRecapEmailInputSchema: z.ZodObject<{
    intent: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SendRecapEmailInput = z.infer<typeof SendRecapEmailInputSchema>;
/**
 * send_recap_email output. `body_source` is currently `template`-only; M47+
 * may widen to `z.enum(['template', 'llm_synthesis'])` after observing template
 * adequacy on N live calls (Phase 46.1 D-15 — deferred).
 */
export declare const SendRecapEmailOutputSchema: z.ZodObject<{
    sent: z.ZodBoolean;
    recipient_email: z.ZodString;
    subject: z.ZodString;
    message_id: z.ZodString;
    body_source: z.ZodEnum<{
        template: "template";
    }>;
    shadow: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type SendRecapEmailOutput = z.infer<typeof SendRecapEmailOutputSchema>;
//# sourceMappingURL=tools.d.ts.map