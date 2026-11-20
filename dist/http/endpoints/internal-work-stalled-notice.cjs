"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalWorkStalledNoticeContract = exports.InternalWorkStalledNoticeResponseSchema = exports.InternalWorkStalledNoticeErrorSchema = exports.INTERNAL_WORK_STALLED_NOTICE_ERRORS = exports.WorkStalledReceiptSchema = exports.InternalWorkStalledNoticeOutcomeSchema = exports.INTERNAL_WORK_STALLED_NOTICE_OUTCOMES = exports.InternalWorkStalledNoticeRequestSchema = exports.WorkStalledNoticeSchema = exports.WorkStalledWorkSchema = exports.WorkStalledReasonSchema = exports.WORK_STALLED_REASONS = exports.WORK_STALLED_MIN_OCCURRENCE = exports.INTERNAL_WORK_STALLED_NOTICE_PATH = void 0;
const zod_1 = require("zod");
const participant_binding_js_1 = require("../../organization/participant-binding.cjs");
exports.INTERNAL_WORK_STALLED_NOTICE_PATH = '/internal/work-stalled-notice';
/** The third request on the same work without progress stops the loop (decision of 19/11). */
exports.WORK_STALLED_MIN_OCCURRENCE = 3;
exports.WORK_STALLED_REASONS = ['repeated_request'];
exports.WorkStalledReasonSchema = zod_1.z.enum(exports.WORK_STALLED_REASONS);
const Timestamp = zod_1.z.iso.datetime({ offset: true });
/** Stable reference to the work: the Paperclip issue of the asker and, when the mandate names one, the piece key. Never read from a title. */
exports.WorkStalledWorkSchema = zod_1.z.strictObject({
    issueId: zod_1.z.uuid(),
    pieceKey: zod_1.z.string().min(1).max(40).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).optional(),
});
exports.WorkStalledNoticeSchema = zod_1.z.strictObject({
    organizationId: zod_1.z.string().min(1).max(64),
    agent: participant_binding_js_1.ParticipantAgentIdentitySchema,
    work: exports.WorkStalledWorkSchema,
    reason: exports.WorkStalledReasonSchema,
    occurrence: zod_1.z.number().int().min(exports.WORK_STALLED_MIN_OCCURRENCE).max(1000),
    since: Timestamp,
    observedAt: Timestamp,
}).refine((n) => Date.parse(n.since) <= Date.parse(n.observedAt), { path: ['since'], message: 'since must not be after observedAt' });
exports.InternalWorkStalledNoticeRequestSchema = zod_1.z.strictObject({
    tenantId: participant_binding_js_1.ParticipantBindingSchema.shape.tenantId,
    ownerId: participant_binding_js_1.ParticipantBindingSchema.shape.ownerId,
    notice: exports.WorkStalledNoticeSchema,
});
exports.INTERNAL_WORK_STALLED_NOTICE_OUTCOMES = ['sent', 'already_sent'];
exports.InternalWorkStalledNoticeOutcomeSchema = zod_1.z.enum(exports.INTERNAL_WORK_STALLED_NOTICE_OUTCOMES);
/** Opaque receipt: same work and same `since` give the same id, so a repeat returns it again. */
exports.WorkStalledReceiptSchema = zod_1.z.strictObject({ id: zod_1.z.string().regex(/^[0-9a-f]{64}$/), recordedAt: Timestamp });
exports.INTERNAL_WORK_STALLED_NOTICE_ERRORS = ['invalid_request', 'unauthorized', 'organization_unknown', 'email_unavailable', 'not_sent'];
exports.InternalWorkStalledNoticeErrorSchema = zod_1.z.enum(exports.INTERNAL_WORK_STALLED_NOTICE_ERRORS);
exports.InternalWorkStalledNoticeResponseSchema = zod_1.z.union([
    zod_1.z.strictObject({ ok: zod_1.z.literal(true), outcome: exports.InternalWorkStalledNoticeOutcomeSchema, receipt: exports.WorkStalledReceiptSchema }),
    zod_1.z.strictObject({ ok: zod_1.z.literal(false), error: exports.InternalWorkStalledNoticeErrorSchema }),
]);
exports.internalWorkStalledNoticeContract = {
    method: 'POST',
    path: exports.INTERNAL_WORK_STALLED_NOTICE_PATH,
    authType: 'secret',
    bodySchema: exports.InternalWorkStalledNoticeRequestSchema,
    responseSchema: exports.InternalWorkStalledNoticeResponseSchema,
};
//# sourceMappingURL=internal-work-stalled-notice.js.map