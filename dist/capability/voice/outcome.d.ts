import { z } from 'zod';
/**
 * Reconciled call outcome (ADR §14.2 — 16 fields).
 *
 * This is the canonical post-call record persisted by cap-voice after
 * reconciling ElevenLabs analysis with X9's deterministic tool log
 * (D-09 reconciliation order).
 *
 * Stored in `calls.outcome_reconciled_json` per D-27. Raw ElevenLabs
 * analysis is stored separately in `calls.analysis_raw_json` (hint only).
 *
 * @see docs/adr/ADR-cap-voice.md §14.2 (required fields)
 * @see docs/adr/ADR-cap-voice.md §14.3 (reconciliation rule)
 * @see docs/adr/ADR-cap-voice.md §7 / D-09 (canonical reconciliation order)
 */
/** Call-outcome discriminator. Exported as a named schema (no inline enum). */
export declare const VoiceCallOutcomeKindSchema: z.ZodEnum<{
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
export type VoiceCallOutcomeKind = z.infer<typeof VoiceCallOutcomeKindSchema>;
/**
 * Known recipient sentiment values — exported for consumers that reason on
 * canonical values (e.g. reconciler.ts, prompts, analytics).
 * Widened 2026-04-24 P2 Bug F — ElevenLabs analysis is an external provider
 * (hint-only per D-09). The schema now accepts any string to handle provider
 * drift without Zod parse errors. Consumers MUST normalize via
 * `normalizeSentiment()` before any equality-based logic.
 * @see feedback_external_provider_schema_lenient.md
 */
export declare const KnownSentiments: readonly ["positive", "neutral", "negative", "unknown"];
export type KnownVoiceRecipientSentiment = (typeof KnownSentiments)[number];
/** Strict schema for canonical values (use at sites that produce / assert sentiment). */
export declare const VoiceRecipientSentimentSchema: z.ZodEnum<{
    unknown: "unknown";
    positive: "positive";
    neutral: "neutral";
    negative: "negative";
}>;
export type VoiceRecipientSentiment = z.infer<typeof VoiceRecipientSentimentSchema>;
/** Lenient schema for parsing provider payload fields (never canonical alone). */
export declare const VoiceRecipientSentimentLenientSchema: z.ZodOptional<z.ZodString>;
/** Normalize any provider-supplied string to a canonical sentiment value. */
export declare function normalizeSentiment(v: string | undefined | null): KnownVoiceRecipientSentiment;
export declare const VoiceCallOutcomeSchema: z.ZodObject<{
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
export type VoiceCallOutcome = z.infer<typeof VoiceCallOutcomeSchema>;
//# sourceMappingURL=outcome.d.ts.map