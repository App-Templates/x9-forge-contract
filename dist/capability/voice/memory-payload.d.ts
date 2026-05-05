import { z } from 'zod';
/**
 * Payload cap-voice POSTs to Memory v2 `/internal/memory/ingest` for async
 * voice-call fact extraction.
 *
 * **PHASE 42 = CONTRACT-ONLY STUB** per D-21.
 * Memory v2 does NOT yet have a `source_type="voice_call"` extractor branch
 * (Phase 43 scope per D-22). cap-voice posts this payload; Memory v2's
 * existing ingest endpoint accepts it (`sourceType` is `z.string()` at line
 * 35 of `services/memory/src/routes/internal-ingest.ts`), but no extraction
 * happens until Phase 43.
 *
 * Skip rules (D-23): cap-voice MUST NOT post this payload when
 *   - `outcome=wrong_number`, OR
 *   - transcript is empty / below min length, OR
 *   - the webhook was `call_initiation_failure`, OR
 *   - privacy policy forbids retention, OR
 *   - recipient explicitly requested no storage.
 *
 * @see docs/adr/ADR-cap-voice.md §15 (Memory v2 ingestion)
 * @see docs/adr/ADR-cap-voice.md §15.5 (skip rules)
 * @see docs/adr/ADR-cap-voice.md §16 (privacy and retention)
 */
export declare const VoiceCallMemoryIngestPayloadSchema: z.ZodObject<{
    source_type: z.ZodLiteral<"voice_call">;
    source_ref: z.ZodString;
    call_id: z.ZodString;
    agent_id: z.ZodString;
    owner_id: z.ZodString;
    tenant_id: z.ZodOptional<z.ZodString>;
    transcript: z.ZodString;
    transcript_metadata: z.ZodObject<{
        duration_sec: z.ZodOptional<z.ZodNumber>;
        speaker_turns: z.ZodOptional<z.ZodNumber>;
        language: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>;
    analysis_raw_from_elevenlabs: z.ZodOptional<z.ZodUnknown>;
    outcome_reconciled: z.ZodObject<{
        call_id: z.ZodString;
        outcome: z.ZodEnum<{
            unknown: "unknown";
            completed_task_done: "completed_task_done";
            completed_partial: "completed_partial";
            no_answer: "no_answer";
            voicemail_left: "voicemail_left";
            rejected: "rejected";
            wrong_number: "wrong_number";
            call_initiation_failed: "call_initiation_failed";
            escalated: "escalated";
        }>;
        task_completed: z.ZodBoolean;
        summary_for_stefano: z.ZodString;
        agreed_next_step: z.ZodOptional<z.ZodString>;
        follow_up_required: z.ZodBoolean;
        calendar_update_required: z.ZodBoolean;
        calendar_change_details: z.ZodOptional<z.ZodString>;
        recap_required: z.ZodBoolean;
        confirmed_email: z.ZodOptional<z.ZodString>;
        recipient_sentiment: z.ZodOptional<z.ZodString>;
        missing_information: z.ZodOptional<z.ZodString>;
        tool_failure: z.ZodBoolean;
        calendar_verified_during_call: z.ZodBoolean;
        calendar_hold_placed: z.ZodBoolean;
        calendar_hold_id: z.ZodOptional<z.ZodString>;
        recipient_consent_given: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    }, z.core.$strip>;
    privacy: z.ZodObject<{
        third_party: z.ZodBoolean;
        source_type: z.ZodLiteral<"voice_call">;
        privacy_level: z.ZodEnum<{
            standard: "standard";
            sensitive: "sensitive";
            restricted: "restricted";
        }>;
        retention_class: z.ZodDefault<z.ZodString>;
        call_transcription_allowed: z.ZodDefault<z.ZodBoolean>;
        voicemail_allowed: z.ZodDefault<z.ZodBoolean>;
        audio_retention_allowed: z.ZodDefault<z.ZodBoolean>;
        recipient_notice_required: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>;
    asserted_at: z.ZodString;
    source_observed_at: z.ZodString;
}, z.core.$strip>;
export type VoiceCallMemoryIngestPayload = z.infer<typeof VoiceCallMemoryIngestPayloadSchema>;
//# sourceMappingURL=memory-payload.d.ts.map