"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownerNoticeDeviceContract = exports.OwnerNoticeResponseSchema = exports.OwnerNoticeBodySchema = exports.OWNER_NOTICE_LIMITS = exports.OWNER_NOTICE_KIND_LABEL = exports.OwnerNoticeKindSchema = void 0;
const zod_1 = require("zod");
/** Supported owner notice kinds. */
exports.OwnerNoticeKindSchema = zod_1.z.enum(['release_ready', 'decision_needed', 'fault']);
/** Display labels for owner notice kinds. */
exports.OWNER_NOTICE_KIND_LABEL = {
    release_ready: '🚀 Pronto per il rilascio',
    decision_needed: '🧭 Serve una tua scelta',
    fault: '🛑 Guasto da guardare',
};
/** Shared delivery policy and payload limits for owner notices. */
exports.OWNER_NOTICE_LIMITS = { perDevicePerDay: 20, dedupeWindowHours: 24, titleMax: 120, textMax: 1500 };
/** Device notice payload; the server derives the recipient from the registered device. */
exports.OwnerNoticeBodySchema = zod_1.z.object({
    kind: exports.OwnerNoticeKindSchema,
    title: zod_1.z.string().min(1).max(exports.OWNER_NOTICE_LIMITS.titleMax).refine((title) => !title.includes('\n'), { message: 'Title must not contain a newline' }),
    text: zod_1.z.string().min(1).max(exports.OWNER_NOTICE_LIMITS.textMax),
    dedupeKey: zod_1.z.string().regex(/^[a-z0-9][a-z0-9:._-]{2,127}$/),
}).strict();
/** Delivery or deduplication result, or an explicit failure reason. */
exports.OwnerNoticeResponseSchema = zod_1.z.discriminatedUnion('ok', [
    zod_1.z.object({ ok: zod_1.z.literal(true), delivered: zod_1.z.boolean(), deduped: zod_1.z.boolean() }).strict(),
    zod_1.z.object({ ok: zod_1.z.literal(false), error: zod_1.z.string().min(1).max(500) }).strict(),
]);
/** Signed device endpoint requesting a notice in the owner's agent chat. */
exports.ownerNoticeDeviceContract = {
    method: 'POST',
    path: '/avvisi/api/notices',
    authType: 'device_signature',
    bodySchema: exports.OwnerNoticeBodySchema,
    responseSchema: exports.OwnerNoticeResponseSchema,
};
//# sourceMappingURL=index.js.map