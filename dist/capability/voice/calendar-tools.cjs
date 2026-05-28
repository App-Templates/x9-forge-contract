"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarHoldReleaseResponseSchema = exports.CalendarHoldReleaseRequestSchema = exports.CalendarHoldResponseSchema = exports.CalendarHoldRequestSchema = exports.CalendarHoldReleaseStatusSchema = exports.CalendarHoldStatusSchema = exports.CalendarConflictResponseSchema = exports.CalendarConflictRequestSchema = exports.CalendarAvailabilityResponseSchema = exports.CalendarAvailabilityRequestSchema = void 0;
const zod_1 = require("zod");
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
const IsoDateTimeSchema = zod_1.z.string().datetime({ offset: true });
/** A half-open calendar interval [start, end). */
const CalendarIntervalSchema = zod_1.z.object({
    start_iso: IsoDateTimeSchema,
    end_iso: IsoDateTimeSchema,
});
/** Calendar reference — the calendar a tool targets (e.g. "stefano@x9.bot"). */
const CalendarRefSchema = zod_1.z.string().min(1);
// -- get_calendar_availability ---------------------------------------------
exports.CalendarAvailabilityRequestSchema = zod_1.z.object({
    call_id: zod_1.z.string().min(1),
    calendar_id: CalendarRefSchema,
    range: CalendarIntervalSchema,
    /** Desired slot length in minutes. Used by cap-calendar to slice the range. */
    slot_minutes: zod_1.z.number().int().positive().max(24 * 60),
    /** Timezone for resolution / display. IANA string. */
    timezone: zod_1.z.string().min(1),
});
exports.CalendarAvailabilityResponseSchema = zod_1.z.object({
    call_id: zod_1.z.string().min(1),
    calendar_id: CalendarRefSchema,
    slots: zod_1.z.array(CalendarIntervalSchema),
    /** cap-calendar data source identity (e.g. "google:primary"). */
    source: zod_1.z.string().min(1),
});
// -- check_calendar_conflicts ----------------------------------------------
exports.CalendarConflictRequestSchema = zod_1.z.object({
    call_id: zod_1.z.string().min(1),
    calendar_id: CalendarRefSchema,
    /** Proposed slot to check. */
    proposed: CalendarIntervalSchema,
    timezone: zod_1.z.string().min(1),
});
exports.CalendarConflictResponseSchema = zod_1.z.object({
    call_id: zod_1.z.string().min(1),
    has_conflict: zod_1.z.boolean(),
    conflicts: zod_1.z
        .array(zod_1.z.object({
        event_id: zod_1.z.string().min(1),
        summary: zod_1.z.string(),
        interval: CalendarIntervalSchema,
    }))
        .default([]),
});
// -- block_calendar_slot (hold) --------------------------------------------
/**
 * Hold lifecycle status — value of the `status` column in the `calendar_holds`
 * table (D-27) and the response status of a successful hold operation.
 *
 * Named export (not inline `z.enum`) so Plan 05 consumers (cap-voice hold
 * state machine, cap-scheduler sweeper) can reference it without duplication.
 */
exports.CalendarHoldStatusSchema = zod_1.z.enum([
    'active',
    'promoted',
    'released',
    'expired',
    'cleanup_required',
]);
/**
 * Final status of a release operation. Subset of {@link CalendarHoldStatusSchema}
 * (`released` on clean release, `cleanup_required` when the hold event could
 * not be deleted and sweeper retry is pending per D-15).
 */
exports.CalendarHoldReleaseStatusSchema = zod_1.z.enum(['released', 'cleanup_required']);
exports.CalendarHoldRequestSchema = zod_1.z.object({
    call_id: zod_1.z.string().min(1),
    /** D-17 idempotency key (mutating). */
    idempotency_key: zod_1.z.string().min(1),
    calendar_id: CalendarRefSchema,
    start_iso: IsoDateTimeSchema,
    end_iso: IsoDateTimeSchema,
    /** Hold reason shown in GCal description (e.g. "X9 voice call hold"). */
    reason: zod_1.z.string().min(1),
    /** Optional expiry — defaults applied by cap-voice sweeper per D-15. */
    expires_at: IsoDateTimeSchema.optional(),
});
exports.CalendarHoldResponseSchema = zod_1.z.object({
    call_id: zod_1.z.string().min(1),
    /** Persisted hold id (PK of calendar_holds table per D-27). */
    hold_id: zod_1.z.string().min(1),
    /** Underlying calendar event id (Google Calendar or equivalent). */
    calendar_event_id: zod_1.z.string().min(1),
    status: exports.CalendarHoldStatusSchema,
    /** Echo of the hold interval — caller uses to confirm. */
    start_iso: IsoDateTimeSchema,
    end_iso: IsoDateTimeSchema,
    expires_at: IsoDateTimeSchema.optional(),
});
// -- release_calendar_block -----------------------------------------------
exports.CalendarHoldReleaseRequestSchema = zod_1.z.object({
    call_id: zod_1.z.string().min(1),
    /** D-17 idempotency key (mutating). */
    idempotency_key: zod_1.z.string().min(1),
    hold_id: zod_1.z.string().min(1),
    /** Release reason (e.g. "recipient_rejected", "call_ended_no_answer"). */
    reason: zod_1.z.string().min(1),
});
exports.CalendarHoldReleaseResponseSchema = zod_1.z.object({
    call_id: zod_1.z.string().min(1),
    hold_id: zod_1.z.string().min(1),
    released: zod_1.z.boolean(),
    /** Final status after release — typically "released" or "cleanup_required". */
    status: exports.CalendarHoldReleaseStatusSchema,
});
//# sourceMappingURL=calendar-tools.js.map