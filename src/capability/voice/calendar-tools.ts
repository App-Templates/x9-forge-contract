import { z } from 'zod';

/**
 * Calendar-specific voice tool request/response schemas (ADR §13 / D-16).
 *
 * These 8 schemas complete the 4 calendar tools used inside a voice call:
 *   - get_calendar_availability (read)
 *   - check_calendar_conflicts (read)
 *   - block_calendar_slot + release_calendar_block (hold lifecycle, D-15)
 *
 * `create_calendar_event` / `update_calendar_event` share the generic
 * VoiceToolCallRequestSchema envelope — their bodies are domain-specific
 * calendar event shapes owned by cap-calendar (not the voice bridge).
 *
 * D-14 calendar-verification invariant: `block_calendar_slot` /
 * `create_calendar_event` / `update_calendar_event` MUST be preceded by
 * a successful `get_calendar_availability` or `check_calendar_conflicts`
 * call within the same `call_id`, otherwise the server rejects with
 * `CALENDAR_VERIFICATION_REQUIRED`. Enforcement lives in cap-voice;
 * bridge only types the shapes.
 */

// -- shared primitives ------------------------------------------------------

/** ISO-8601 timestamp with offset (we require offset to avoid TZ ambiguity). */
const IsoDateTimeSchema = z.string().datetime({ offset: true });

/** A half-open calendar interval [start, end). */
const CalendarIntervalSchema = z.object({
  start_iso: IsoDateTimeSchema,
  end_iso: IsoDateTimeSchema,
});
export type CalendarInterval = z.infer<typeof CalendarIntervalSchema>;

/** Calendar reference — the calendar a tool targets (e.g. "stefano@x9.bot"). */
const CalendarRefSchema = z.string().min(1);

// -- get_calendar_availability ---------------------------------------------

export const CalendarAvailabilityRequestSchema = z.object({
  call_id: z.string().min(1),
  calendar_id: CalendarRefSchema,
  range: CalendarIntervalSchema,
  /** Desired slot length in minutes. Used by cap-calendar to slice the range. */
  slot_minutes: z.number().int().positive().max(24 * 60),
  /** Timezone for resolution / display. IANA string. */
  timezone: z.string().min(1),
});
export type CalendarAvailabilityRequest = z.infer<typeof CalendarAvailabilityRequestSchema>;

export const CalendarAvailabilityResponseSchema = z.object({
  call_id: z.string().min(1),
  calendar_id: CalendarRefSchema,
  slots: z.array(CalendarIntervalSchema),
  /** cap-calendar data source identity (e.g. "google:primary"). */
  source: z.string().min(1),
});
export type CalendarAvailabilityResponse = z.infer<typeof CalendarAvailabilityResponseSchema>;

// -- check_calendar_conflicts ----------------------------------------------

export const CalendarConflictRequestSchema = z.object({
  call_id: z.string().min(1),
  calendar_id: CalendarRefSchema,
  /** Proposed slot to check. */
  proposed: CalendarIntervalSchema,
  timezone: z.string().min(1),
});
export type CalendarConflictRequest = z.infer<typeof CalendarConflictRequestSchema>;

export const CalendarConflictResponseSchema = z.object({
  call_id: z.string().min(1),
  has_conflict: z.boolean(),
  conflicts: z
    .array(
      z.object({
        event_id: z.string().min(1),
        summary: z.string(),
        interval: CalendarIntervalSchema,
      }),
    )
    .default([]),
});
export type CalendarConflictResponse = z.infer<typeof CalendarConflictResponseSchema>;

// -- block_calendar_slot (hold) --------------------------------------------

/**
 * Hold lifecycle status — value of the `status` column in the `calendar_holds`
 * table (D-27) and the response status of a successful hold operation.
 *
 * Named export (not inline `z.enum`) so Plan 05 consumers (cap-voice hold
 * state machine, cap-scheduler sweeper) can reference it without duplication.
 */
export const CalendarHoldStatusSchema = z.enum([
  'active',
  'promoted',
  'released',
  'expired',
  'cleanup_required',
]);
export type CalendarHoldStatus = z.infer<typeof CalendarHoldStatusSchema>;

/**
 * Final status of a release operation. Subset of {@link CalendarHoldStatusSchema}
 * (`released` on clean release, `cleanup_required` when the hold event could
 * not be deleted and sweeper retry is pending per D-15).
 */
export const CalendarHoldReleaseStatusSchema = z.enum(['released', 'cleanup_required']);
export type CalendarHoldReleaseStatus = z.infer<typeof CalendarHoldReleaseStatusSchema>;

export const CalendarHoldRequestSchema = z.object({
  call_id: z.string().min(1),
  /** D-17 idempotency key (mutating). */
  idempotency_key: z.string().min(1),
  calendar_id: CalendarRefSchema,
  start_iso: IsoDateTimeSchema,
  end_iso: IsoDateTimeSchema,
  /** Hold reason shown in GCal description (e.g. "X9 voice call hold"). */
  reason: z.string().min(1),
  /** Optional expiry — defaults applied by cap-voice sweeper per D-15. */
  expires_at: IsoDateTimeSchema.optional(),
});
export type CalendarHoldRequest = z.infer<typeof CalendarHoldRequestSchema>;

export const CalendarHoldResponseSchema = z.object({
  call_id: z.string().min(1),
  /** Persisted hold id (PK of calendar_holds table per D-27). */
  hold_id: z.string().min(1),
  /** Underlying calendar event id (Google Calendar or equivalent). */
  calendar_event_id: z.string().min(1),
  status: CalendarHoldStatusSchema,
  /** Echo of the hold interval — caller uses to confirm. */
  start_iso: IsoDateTimeSchema,
  end_iso: IsoDateTimeSchema,
  expires_at: IsoDateTimeSchema.optional(),
});
export type CalendarHoldResponse = z.infer<typeof CalendarHoldResponseSchema>;

// -- release_calendar_block -----------------------------------------------

export const CalendarHoldReleaseRequestSchema = z.object({
  call_id: z.string().min(1),
  /** D-17 idempotency key (mutating). */
  idempotency_key: z.string().min(1),
  hold_id: z.string().min(1),
  /** Release reason (e.g. "recipient_rejected", "call_ended_no_answer"). */
  reason: z.string().min(1),
});
export type CalendarHoldReleaseRequest = z.infer<typeof CalendarHoldReleaseRequestSchema>;

export const CalendarHoldReleaseResponseSchema = z.object({
  call_id: z.string().min(1),
  hold_id: z.string().min(1),
  released: z.boolean(),
  /** Final status after release — typically "released" or "cleanup_required". */
  status: CalendarHoldReleaseStatusSchema,
});
export type CalendarHoldReleaseResponse = z.infer<typeof CalendarHoldReleaseResponseSchema>;
