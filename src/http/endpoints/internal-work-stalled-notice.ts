import { z } from 'zod';
import { ParticipantAgentIdentitySchema, ParticipantBindingSchema } from '../../organization/participant-binding.js';

export const INTERNAL_WORK_STALLED_NOTICE_PATH = '/internal/work-stalled-notice' as const;
/** The third request on the same work without progress stops the loop (decision of 19/11). */
export const WORK_STALLED_MIN_OCCURRENCE = 3;
export const WORK_STALLED_REASONS = ['repeated_request'] as const;
export const WorkStalledReasonSchema = z.enum(WORK_STALLED_REASONS);
const Timestamp = z.iso.datetime({ offset: true });

/** Stable reference to the work: the Paperclip issue of the asker and, when the mandate names one, the piece key. Never read from a title. */
export const WorkStalledWorkSchema = z.strictObject({
  issueId: z.uuid(),
  pieceKey: z.string().min(1).max(40).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).optional(),
});
export const WorkStalledNoticeSchema = z.strictObject({
  organizationId: z.string().min(1).max(64),
  agent: ParticipantAgentIdentitySchema,
  work: WorkStalledWorkSchema,
  reason: WorkStalledReasonSchema,
  occurrence: z.number().int().min(WORK_STALLED_MIN_OCCURRENCE).max(1000),
  since: Timestamp,
  observedAt: Timestamp,
}).refine((n) => Date.parse(n.since) <= Date.parse(n.observedAt), { path: ['since'], message: 'since must not be after observedAt' });
export type WorkStalledNotice = z.infer<typeof WorkStalledNoticeSchema>;

export const InternalWorkStalledNoticeRequestSchema = z.strictObject({
  tenantId: ParticipantBindingSchema.shape.tenantId,
  ownerId: ParticipantBindingSchema.shape.ownerId,
  notice: WorkStalledNoticeSchema,
});
export type InternalWorkStalledNoticeRequest = z.infer<typeof InternalWorkStalledNoticeRequestSchema>;

export const INTERNAL_WORK_STALLED_NOTICE_OUTCOMES = ['sent', 'already_sent'] as const;
export const InternalWorkStalledNoticeOutcomeSchema = z.enum(INTERNAL_WORK_STALLED_NOTICE_OUTCOMES);
/** Opaque receipt: same work and same `since` give the same id, so a repeat returns it again. */
export const WorkStalledReceiptSchema = z.strictObject({ id: z.string().regex(/^[0-9a-f]{64}$/), recordedAt: Timestamp });
export const INTERNAL_WORK_STALLED_NOTICE_ERRORS = ['invalid_request', 'unauthorized', 'organization_unknown', 'email_unavailable', 'not_sent'] as const;
export const InternalWorkStalledNoticeErrorSchema = z.enum(INTERNAL_WORK_STALLED_NOTICE_ERRORS);
export const InternalWorkStalledNoticeResponseSchema = z.union([
  z.strictObject({ ok: z.literal(true), outcome: InternalWorkStalledNoticeOutcomeSchema, receipt: WorkStalledReceiptSchema }),
  z.strictObject({ ok: z.literal(false), error: InternalWorkStalledNoticeErrorSchema }),
]);
export type InternalWorkStalledNoticeResponse = z.infer<typeof InternalWorkStalledNoticeResponseSchema>;

export const internalWorkStalledNoticeContract = {
  method: 'POST' as const,
  path: INTERNAL_WORK_STALLED_NOTICE_PATH,
  authType: 'secret' as const,
  bodySchema: InternalWorkStalledNoticeRequestSchema,
  responseSchema: InternalWorkStalledNoticeResponseSchema,
} as const;
