import { z } from 'zod';
import { OwnerIdSchema } from '../agent/agent-identity.js';
import { AssetSha256Schema } from './asset.js';
import { ParticipantAgentIdentitySchema } from './participant-binding.js';

/** Channels through which an agent asks the owner for a decision. */
export const DECISION_REQUEST_CHANNELS = ['email', 'x9_conversation', 'forge_panel'] as const;
export const DecisionRequestChannelSchema = z.enum(DECISION_REQUEST_CHANNELS);
export type DecisionRequestChannel = z.infer<typeof DecisionRequestChannelSchema>;

export const DecisionRequestIdSchema = z.string().regex(/^[A-Za-z0-9_-]{6,64}$/);
export type DecisionRequestId = z.infer<typeof DecisionRequestIdSchema>;

const OptionIdSchema = z
  .string()
  .max(40)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

export const DecisionRequestOptionSchema = z.strictObject({
  optionId: OptionIdSchema,
  label: z.string().min(1).max(200),
  detail: z.string().min(1).max(2000).optional(),
});
export type DecisionRequestOption = z.infer<typeof DecisionRequestOptionSchema>;

/** What a decision is about: a plan, tied to the exact version and digest the owner read. */
export const DECISION_SUBJECT_KINDS = ['action_plan', 'vertical_plan', 'confirmation'] as const;
export const DecisionSubjectKindSchema = z.enum(DECISION_SUBJECT_KINDS);
export type DecisionSubjectKind = z.infer<typeof DecisionSubjectKindSchema>;

export const DecisionSubjectSchema = z.strictObject({
  kind: DecisionSubjectKindSchema,
  planId: DecisionRequestIdSchema,
  planVersion: z.number().int().min(1),
  digest: AssetSha256Schema,
});
export type DecisionSubject = z.infer<typeof DecisionSubjectSchema>;

/** Open question an agent puts to the owner, with the options to choose from. */
export const DecisionRequestSchema = z.strictObject({
  requestId: DecisionRequestIdSchema,
  tenantId: z.string().min(1),
  organizationId: z.string().min(1).max(64),
  projectId: z.string().min(1).max(64).optional(),
  subject: DecisionSubjectSchema.optional(),
  question: z.string().min(1).max(4000),
  options: z
    .array(DecisionRequestOptionSchema)
    .min(1)
    .max(10)
    .refine((options) => new Set(options.map((o) => o.optionId)).size === options.length, {
      message: 'optionId must be unique within a request',
    }),
  requestedBy: ParticipantAgentIdentitySchema,
  addressedTo: z.strictObject({ ownerId: OwnerIdSchema }),
  channel: DecisionRequestChannelSchema,
  createdAt: z.iso.datetime({ offset: true }),
});
export type DecisionRequest = z.infer<typeof DecisionRequestSchema>;

const outcomeBase = {
  requestId: DecisionRequestIdSchema,
  decidedBy: z.strictObject({ kind: z.literal('owner'), ownerId: OwnerIdSchema }),
  decidedAt: z.iso.datetime({ offset: true }),
  channel: DecisionRequestChannelSchema,
  sourceRef: z.string().min(1).max(512),
  subject: DecisionSubjectSchema.optional(),
};

/** Recorded owner answer to a decision request. */
export const DecisionOutcomeSchema = z.discriminatedUnion('outcome', [
  z.strictObject({ ...outcomeBase, outcome: z.literal('approved'), optionId: OptionIdSchema }),
  z.strictObject({ ...outcomeBase, outcome: z.literal('rejected'), reason: z.string().min(3).max(2000) }),
]);
export type DecisionOutcome = z.infer<typeof DecisionOutcomeSchema>;

/** True when the outcome decides the same plan version the request asked about (or neither names a subject). */
export function decisionOutcomeMatchesSubject(
  request: Pick<DecisionRequest, 'subject'>,
  outcome: Pick<DecisionOutcome, 'subject'>,
): boolean {
  const a = request.subject;
  const b = outcome.subject;
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;
  return a.kind === b.kind && a.planId === b.planId && a.planVersion === b.planVersion && a.digest === b.digest;
}

/** Word used in the email subject to tie a reply to its decision request: `[decisione <requestId>]`. */
export const DECISION_REQUEST_SUBJECT_LABEL = 'decisione' as const;

export function decisionRequestSubjectLabel(requestId: DecisionRequestId): string {
  return `[${DECISION_REQUEST_SUBJECT_LABEL} ${requestId}]`;
}

/** Owner email reply as read by the inbound reader (approve / refuse with reason / unclear). */
export const DecisionEmailReplySchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('approve'), requestId: DecisionRequestIdSchema, optionId: OptionIdSchema.optional() }),
  z.strictObject({ kind: z.literal('refuse'), requestId: DecisionRequestIdSchema, reason: z.string().min(3).max(2000) }),
  z.strictObject({
    kind: z.literal('unclear'),
    requestId: DecisionRequestIdSchema,
    why: z.enum(['missing_reason', 'no_decision', 'both']),
  }),
]);
export type DecisionEmailReply = z.infer<typeof DecisionEmailReplySchema>;

export type DecisionEmailReplyRejection =
  | 'mismatch'
  | 'unclear'
  | 'option_required'
  | 'unknown_option'
  | 'not_addressee'
  | 'before_request';

export type DecisionOutcomeFromEmailReply =
  | { ok: true; outcome: DecisionOutcome }
  | { ok: false; code: DecisionEmailReplyRejection };

/** The single rule that turns an email reply into the recorded outcome of a request. */
export function decisionOutcomeFromEmailReply(input: {
  request: DecisionRequest;
  reply: DecisionEmailReply;
  from: { ownerId: string };
  receivedAt: string;
  messageId: string;
}): DecisionOutcomeFromEmailReply {
  const { request, reply, from, receivedAt, messageId } = input;
  if (reply.requestId !== request.requestId) return { ok: false, code: 'mismatch' };
  if (from.ownerId !== request.addressedTo.ownerId) return { ok: false, code: 'not_addressee' };
  if (Date.parse(receivedAt) < Date.parse(request.createdAt)) return { ok: false, code: 'before_request' };
  if (reply.kind === 'unclear') return { ok: false, code: 'unclear' };

  const base = {
    requestId: request.requestId,
    decidedBy: { kind: 'owner' as const, ownerId: request.addressedTo.ownerId },
    decidedAt: receivedAt,
    channel: 'email' as const,
    sourceRef: messageId,
  };
  if (reply.kind === 'refuse') {
    return { ok: true, outcome: DecisionOutcomeSchema.parse({ ...base, outcome: 'rejected', reason: reply.reason }) };
  }
  let optionId = reply.optionId;
  if (optionId === undefined) {
    if (request.options.length !== 1) return { ok: false, code: 'option_required' };
    optionId = request.options[0]!.optionId;
  }
  if (!request.options.some((o) => o.optionId === optionId)) return { ok: false, code: 'unknown_option' };
  return { ok: true, outcome: DecisionOutcomeSchema.parse({ ...base, outcome: 'approved', optionId }) };
}
