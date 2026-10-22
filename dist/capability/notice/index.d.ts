import { z } from 'zod';
/** Supported owner notice kinds. */
export declare const OwnerNoticeKindSchema: z.ZodEnum<{
    release_ready: "release_ready";
    decision_needed: "decision_needed";
    fault: "fault";
    daily_recap: "daily_recap";
}>;
/** A supported owner notice kind. */
export type OwnerNoticeKind = z.infer<typeof OwnerNoticeKindSchema>;
/** Display labels for owner notice kinds. */
export declare const OWNER_NOTICE_KIND_LABEL: Record<OwnerNoticeKind, string>;
/** Shared delivery policy and payload limits for owner notices. */
export declare const OWNER_NOTICE_LIMITS: {
    readonly perDevicePerDay: 20;
    readonly dedupeWindowHours: 24;
    readonly titleMax: 120;
    readonly textMax: 1500;
};
/** Device notice payload; the server derives the recipient from the registered device. */
export declare const OwnerNoticeBodySchema: z.ZodObject<{
    kind: z.ZodEnum<{
        release_ready: "release_ready";
        decision_needed: "decision_needed";
        fault: "fault";
        daily_recap: "daily_recap";
    }>;
    title: z.ZodString;
    text: z.ZodString;
    dedupeKey: z.ZodString;
}, z.core.$strict>;
/** Delivery or deduplication result, or an explicit failure reason. */
export declare const OwnerNoticeResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    ok: z.ZodLiteral<true>;
    delivered: z.ZodBoolean;
    deduped: z.ZodBoolean;
}, z.core.$strict>, z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strict>], "ok">;
/** Signed device endpoint requesting a notice in the owner's agent chat. */
export declare const ownerNoticeDeviceContract: {
    readonly method: "POST";
    readonly path: "/avvisi/api/notices";
    readonly authType: "device_signature";
    readonly bodySchema: z.ZodObject<{
        kind: z.ZodEnum<{
            release_ready: "release_ready";
            decision_needed: "decision_needed";
            fault: "fault";
            daily_recap: "daily_recap";
        }>;
        title: z.ZodString;
        text: z.ZodString;
        dedupeKey: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        ok: z.ZodLiteral<true>;
        delivered: z.ZodBoolean;
        deduped: z.ZodBoolean;
    }, z.core.$strict>, z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodString;
    }, z.core.$strict>], "ok">;
};
//# sourceMappingURL=index.d.ts.map