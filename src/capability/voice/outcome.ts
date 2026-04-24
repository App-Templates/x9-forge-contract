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
export const VoiceCallOutcomeKindSchema = z.enum([
  'completed_task_done',
  'completed_partial',
  'no_answer',
  'voicemail_left',
  'rejected',
  'wrong_number',
  'call_initiation_failed',
  'escalated',
  'unknown',
]);
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
export const KnownSentiments = ['positive', 'neutral', 'negative', 'unknown'] as const;
export type KnownVoiceRecipientSentiment = (typeof KnownSentiments)[number];

/** Strict schema for canonical values (use at sites that produce / assert sentiment). */
export const VoiceRecipientSentimentSchema = z.enum([
  'positive',
  'neutral',
  'negative',
  'unknown',
]);
export type VoiceRecipientSentiment = z.infer<typeof VoiceRecipientSentimentSchema>;

/** Lenient schema for parsing provider payload fields (never canonical alone). */
export const VoiceRecipientSentimentLenientSchema = z.string().min(1).optional();

/** Normalize any provider-supplied string to a canonical sentiment value. */
export function normalizeSentiment(v: string | undefined | null): KnownVoiceRecipientSentiment {
  if (v === 'positive' || v === 'negative' || v === 'neutral' || v === 'unknown') return v;
  return 'unknown';
}

export const VoiceCallOutcomeSchema = z.object({
  call_id: z.string().min(1),
  outcome: VoiceCallOutcomeKindSchema,
  /** Whether the declared brief goal was achieved. */
  task_completed: z.boolean(),
  /** Short human-readable recap for Stefano (shown in Telegram). */
  summary_for_stefano: z.string(),
  /** What the recipient agreed to do next (free-form). */
  agreed_next_step: z.string().optional(),
  follow_up_required: z.boolean(),
  calendar_update_required: z.boolean(),
  calendar_change_details: z.string().optional(),
  recap_required: z.boolean(),
  /** If a recap email was agreed, the confirmed address. */
  confirmed_email: z.string().optional(),
  /**
   * Recipient sentiment hint from ElevenLabs analysis (hint-only, D-09).
   * Widened 2026-04-24 P2 Bug F — accepts any string from ElevenLabs to
   * prevent Zod parse errors on provider drift. Consumers call
   * normalizeSentiment() to get a canonical KnownVoiceRecipientSentiment.
   * @see feedback_external_provider_schema_lenient.md
   */
  recipient_sentiment: VoiceRecipientSentimentLenientSchema,
  /** Info the caller still needs after this call. */
  missing_information: z.string().optional(),
  /** True iff any X9 tool call had status=error (deterministic — D-09). */
  tool_failure: z.boolean(),
  /**
   * True iff an X9 get_calendar_availability or check_calendar_conflicts
   * call succeeded for this `call_id` (deterministic — D-14 + D-09).
   */
  calendar_verified_during_call: z.boolean(),
  /** True iff an X9 block_calendar_slot call succeeded (deterministic). */
  calendar_hold_placed: z.boolean(),
  /** If hold placed, persisted hold_id from calendar_holds table. */
  calendar_hold_id: z.string().optional(),
  /**
   * GDPR consent marker (where applicable). Null when recipient explicitly
   * neither granted nor refused (e.g. call ended before consent prompt).
   * Widened 2026-04-24 P2 Bug F — ElevenLabs analysis sometimes emits
   * null here; strict z.boolean() previously caused Zod parse throw in
   * cap-voice ingest-stub, leaving rows stuck pending.
   */
  recipient_consent_given: z.boolean().nullable().optional(),
});
export type VoiceCallOutcome = z.infer<typeof VoiceCallOutcomeSchema>;
