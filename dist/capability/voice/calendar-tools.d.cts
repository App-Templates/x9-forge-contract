import { z } from 'zod';
/** A half-open calendar interval [start, end). */
declare const CalendarIntervalSchema: z.ZodObject<{
    start_iso: z.ZodString;
    end_iso: z.ZodString;
}, z.core.$strip>;
export type CalendarInterval = z.infer<typeof CalendarIntervalSchema>;
export declare const CalendarAvailabilityRequestSchema: z.ZodObject<{
    call_id: z.ZodString;
    calendar_id: z.ZodString;
    range: z.ZodObject<{
        start_iso: z.ZodString;
        end_iso: z.ZodString;
    }, z.core.$strip>;
    slot_minutes: z.ZodNumber;
    timezone: z.ZodString;
}, z.core.$strip>;
export type CalendarAvailabilityRequest = z.infer<typeof CalendarAvailabilityRequestSchema>;
export declare const CalendarAvailabilityResponseSchema: z.ZodObject<{
    call_id: z.ZodString;
    calendar_id: z.ZodString;
    slots: z.ZodArray<z.ZodObject<{
        start_iso: z.ZodString;
        end_iso: z.ZodString;
    }, z.core.$strip>>;
    source: z.ZodString;
}, z.core.$strip>;
export type CalendarAvailabilityResponse = z.infer<typeof CalendarAvailabilityResponseSchema>;
export declare const CalendarConflictRequestSchema: z.ZodObject<{
    call_id: z.ZodString;
    calendar_id: z.ZodString;
    proposed: z.ZodObject<{
        start_iso: z.ZodString;
        end_iso: z.ZodString;
    }, z.core.$strip>;
    timezone: z.ZodString;
}, z.core.$strip>;
export type CalendarConflictRequest = z.infer<typeof CalendarConflictRequestSchema>;
export declare const CalendarConflictResponseSchema: z.ZodObject<{
    call_id: z.ZodString;
    has_conflict: z.ZodBoolean;
    conflicts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        event_id: z.ZodString;
        summary: z.ZodString;
        interval: z.ZodObject<{
            start_iso: z.ZodString;
            end_iso: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type CalendarConflictResponse = z.infer<typeof CalendarConflictResponseSchema>;
/**
 * Hold lifecycle status — value of the `status` column in the `calendar_holds`
 * table (D-27) and the response status of a successful hold operation.
 *
 * Named export (not inline `z.enum`) so Plan 05 consumers (cap-voice hold
 * state machine, cap-scheduler sweeper) can reference it without duplication.
 */
export declare const CalendarHoldStatusSchema: z.ZodEnum<{
    active: "active";
    promoted: "promoted";
    released: "released";
    expired: "expired";
    cleanup_required: "cleanup_required";
}>;
export type CalendarHoldStatus = z.infer<typeof CalendarHoldStatusSchema>;
/**
 * Final status of a release operation. Subset of {@link CalendarHoldStatusSchema}
 * (`released` on clean release, `cleanup_required` when the hold event could
 * not be deleted and sweeper retry is pending per D-15).
 */
export declare const CalendarHoldReleaseStatusSchema: z.ZodEnum<{
    released: "released";
    cleanup_required: "cleanup_required";
}>;
export type CalendarHoldReleaseStatus = z.infer<typeof CalendarHoldReleaseStatusSchema>;
export declare const CalendarHoldRequestSchema: z.ZodObject<{
    call_id: z.ZodString;
    idempotency_key: z.ZodString;
    calendar_id: z.ZodString;
    start_iso: z.ZodString;
    end_iso: z.ZodString;
    reason: z.ZodString;
    expires_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CalendarHoldRequest = z.infer<typeof CalendarHoldRequestSchema>;
export declare const CalendarHoldResponseSchema: z.ZodObject<{
    call_id: z.ZodString;
    hold_id: z.ZodString;
    calendar_event_id: z.ZodString;
    status: z.ZodEnum<{
        active: "active";
        promoted: "promoted";
        released: "released";
        expired: "expired";
        cleanup_required: "cleanup_required";
    }>;
    start_iso: z.ZodString;
    end_iso: z.ZodString;
    expires_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CalendarHoldResponse = z.infer<typeof CalendarHoldResponseSchema>;
export declare const CalendarHoldReleaseRequestSchema: z.ZodObject<{
    call_id: z.ZodString;
    idempotency_key: z.ZodString;
    hold_id: z.ZodString;
    reason: z.ZodString;
}, z.core.$strip>;
export type CalendarHoldReleaseRequest = z.infer<typeof CalendarHoldReleaseRequestSchema>;
export declare const CalendarHoldReleaseResponseSchema: z.ZodObject<{
    call_id: z.ZodString;
    hold_id: z.ZodString;
    released: z.ZodBoolean;
    status: z.ZodEnum<{
        released: "released";
        cleanup_required: "cleanup_required";
    }>;
}, z.core.$strip>;
export type CalendarHoldReleaseResponse = z.infer<typeof CalendarHoldReleaseResponseSchema>;
export {};
//# sourceMappingURL=calendar-tools.d.ts.map