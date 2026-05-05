import { z } from 'zod';
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
export declare const VoiceToolCallSourceSchema: z.ZodEnum<{
    elevenlabs: "elevenlabs";
    system: "system";
    retry: "retry";
    admin: "admin";
}>;
export type VoiceToolCallSource = z.infer<typeof VoiceToolCallSourceSchema>;
export declare const VoiceCallToolLogSchema: z.ZodObject<{
    id: z.ZodString;
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
    tool_call_source: z.ZodEnum<{
        elevenlabs: "elevenlabs";
        system: "system";
        retry: "retry";
        admin: "admin";
    }>;
    authorized: z.ZodBoolean;
    authorization_error: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
        error: "error";
        ok: "ok";
        unauthorized: "unauthorized";
        invariant_rejected: "invariant_rejected";
        idempotency_replay: "idempotency_replay";
    }>;
    input_json: z.ZodUnknown;
    output_json: z.ZodOptional<z.ZodUnknown>;
    error: z.ZodOptional<z.ZodString>;
    duration_ms: z.ZodOptional<z.ZodNumber>;
    idempotency_key: z.ZodOptional<z.ZodString>;
    created_at: z.ZodString;
}, z.core.$strip>;
export type VoiceCallToolLog = z.infer<typeof VoiceCallToolLogSchema>;
//# sourceMappingURL=tool-log.d.ts.map