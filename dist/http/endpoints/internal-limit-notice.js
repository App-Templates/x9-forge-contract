import { z } from 'zod';
import { LimitNoticeSchema } from "../../capability/paperclip/limit-notice.js";
import { ParticipantBindingSchema } from "../../organization/participant-binding.js";
export const INTERNAL_LIMIT_NOTICE_PATH = '/internal/limit-notice';
/**
 * Delivery of a daily limit notice to the owner. Spend notices have their own
 * path in agent-core and are refused here.
 */
export const InternalLimitNoticeRequestSchema = z
    .strictObject({
    tenantId: ParticipantBindingSchema.shape.tenantId,
    ownerId: ParticipantBindingSchema.shape.ownerId,
    notice: LimitNoticeSchema,
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
export const INTERNAL_LIMIT_NOTICE_OUTCOMES = ['sent', 'already_sent'];
export const InternalLimitNoticeOutcomeSchema = z.enum(INTERNAL_LIMIT_NOTICE_OUTCOMES);
export const INTERNAL_LIMIT_NOTICE_ERRORS = [
    'invalid_request',
    'unauthorized',
    'organization_unknown',
    'email_unavailable',
    'not_sent',
];
export const InternalLimitNoticeErrorSchema = z.enum(INTERNAL_LIMIT_NOTICE_ERRORS);
export const InternalLimitNoticeResponseSchema = z.union([
    z.strictObject({ ok: z.literal(true), outcome: InternalLimitNoticeOutcomeSchema }),
    z.strictObject({ ok: z.literal(false), error: InternalLimitNoticeErrorSchema }),
]);
export const internalLimitNoticeContract = {
    method: 'POST',
    path: INTERNAL_LIMIT_NOTICE_PATH,
    authType: 'secret',
    bodySchema: InternalLimitNoticeRequestSchema,
    responseSchema: InternalLimitNoticeResponseSchema,
};
//# sourceMappingURL=internal-limit-notice.js.map