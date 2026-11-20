"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalLimitNoticeContract = exports.InternalLimitNoticeResponseSchema = exports.InternalLimitNoticeErrorSchema = exports.INTERNAL_LIMIT_NOTICE_ERRORS = exports.InternalLimitNoticeOutcomeSchema = exports.INTERNAL_LIMIT_NOTICE_OUTCOMES = exports.InternalLimitNoticeRequestSchema = exports.INTERNAL_LIMIT_NOTICE_PATH = void 0;
const zod_1 = require("zod");
const limit_notice_js_1 = require("../../capability/paperclip/limit-notice.cjs");
const participant_binding_js_1 = require("../../organization/participant-binding.cjs");
exports.INTERNAL_LIMIT_NOTICE_PATH = '/internal/limit-notice';
/**
 * Delivery of a daily limit notice to the owner. Spend notices have their own
 * path in agent-core and are refused here.
 */
exports.InternalLimitNoticeRequestSchema = zod_1.z
    .strictObject({
    tenantId: participant_binding_js_1.ParticipantBindingSchema.shape.tenantId,
    ownerId: participant_binding_js_1.ParticipantBindingSchema.shape.ownerId,
    notice: limit_notice_js_1.LimitNoticeSchema,
})
    .superRefine((value, ctx) => {
    const { notice } = value;
    if (!notice.recipients.includes('owner')) {
        ctx.addIssue({ code: 'custom', path: ['notice', 'recipients'], message: 'recipients must include owner' });
    }
    if (notice.limit !== 'daily_runs' && notice.limit !== 'daily_cost') {
        ctx.addIssue({
            code: 'custom',
            path: ['notice', 'limit'],
            message: 'only daily_runs and daily_cost are delivered here; spend notices have their own path',
        });
    }
    if (notice.agent === undefined) {
        ctx.addIssue({ code: 'custom', path: ['notice', 'agent'], message: 'agent is required' });
    }
});
exports.INTERNAL_LIMIT_NOTICE_OUTCOMES = ['sent', 'already_sent'];
exports.InternalLimitNoticeOutcomeSchema = zod_1.z.enum(exports.INTERNAL_LIMIT_NOTICE_OUTCOMES);
exports.INTERNAL_LIMIT_NOTICE_ERRORS = [
    'invalid_request',
    'unauthorized',
    'organization_unknown',
    'email_unavailable',
    'not_sent',
];
exports.InternalLimitNoticeErrorSchema = zod_1.z.enum(exports.INTERNAL_LIMIT_NOTICE_ERRORS);
exports.InternalLimitNoticeResponseSchema = zod_1.z.union([
    zod_1.z.strictObject({ ok: zod_1.z.literal(true), outcome: exports.InternalLimitNoticeOutcomeSchema }),
    zod_1.z.strictObject({ ok: zod_1.z.literal(false), error: exports.InternalLimitNoticeErrorSchema }),
]);
exports.internalLimitNoticeContract = {
    method: 'POST',
    path: exports.INTERNAL_LIMIT_NOTICE_PATH,
    authType: 'secret',
    bodySchema: exports.InternalLimitNoticeRequestSchema,
    responseSchema: exports.InternalLimitNoticeResponseSchema,
};
//# sourceMappingURL=internal-limit-notice.js.map