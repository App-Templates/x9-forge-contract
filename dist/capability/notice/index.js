import { z } from 'zod';
/** Supported owner notice kinds. */
export const OwnerNoticeKindSchema = z.enum(['release_ready', 'decision_needed', 'fault']);
/** Display labels for owner notice kinds. */
export const OWNER_NOTICE_KIND_LABEL = {
    release_ready: '🚀 Pronto per il rilascio',
    decision_needed: '🧭 Serve una tua scelta',
    fault: '🛑 Guasto da guardare',
};
/** Shared delivery policy and payload limits for owner notices. */
export const OWNER_NOTICE_LIMITS = { perDevicePerDay: 20, dedupeWindowHours: 24, titleMax: 120, textMax: 1500 };
/** Device notice payload; the server derives the recipient from the registered device. */
export const OwnerNoticeBodySchema = z.object({
    kind: OwnerNoticeKindSchema,
    title: z.string().min(1).max(OWNER_NOTICE_LIMITS.titleMax).refine((title) => !title.includes('\n'), { message: 'Title must not contain a newline' }),
    text: z.string().min(1).max(OWNER_NOTICE_LIMITS.textMax),
    dedupeKey: z.string().regex(/^[a-z0-9][a-z0-9:._-]{2,127}$/),
}).strict();
/** Delivery or deduplication result, or an explicit failure reason. */
export const OwnerNoticeResponseSchema = z.discriminatedUnion('ok', [
    z.object({ ok: z.literal(true), delivered: z.boolean(), deduped: z.boolean() }).strict(),
    z.object({ ok: z.literal(false), error: z.string().min(1).max(500) }).strict(),
]);
/** Signed device endpoint requesting a notice in the owner's agent chat. */
export const ownerNoticeDeviceContract = {
    method: 'POST',
    path: '/avvisi/api/notices',
    authType: 'device_signature',
    bodySchema: OwnerNoticeBodySchema,
    responseSchema: OwnerNoticeResponseSchema,
};
//# sourceMappingURL=index.js.map