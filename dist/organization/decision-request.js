import { z } from 'zod';
import { OwnerIdSchema } from "../agent/agent-identity.js";
import { AssetRefSchema, AssetSha256Schema } from "./asset.js";
import { ParticipantAgentIdentitySchema } from "./participant-binding.js";
/** Channels through which an agent asks the owner for a decision. */
export const DECISION_REQUEST_CHANNELS = ['email', 'x9_conversation', 'forge_panel'];
export const DecisionRequestChannelSchema = z.enum(DECISION_REQUEST_CHANNELS);
export const DecisionRequestIdSchema = z.string().regex(/^[A-Za-z0-9_-]{6,64}$/);
const OptionIdSchema = z
    .string()
    .max(40)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
export const DecisionRequestOptionSchema = z.strictObject({
    optionId: OptionIdSchema,
    label: z.string().min(1).max(200),
    detail: z.string().min(1).max(2000).optional(),
});
/** What a decision is about: an exact plan version or an immutable delivery. */
export const DECISION_SUBJECT_KINDS = ['action_plan', 'vertical_plan', 'confirmation', 'delivery'];
export const DecisionSubjectKindSchema = z.enum(DECISION_SUBJECT_KINDS);
const PlanDecisionSubjectSchema = z.strictObject({
    kind: DecisionSubjectKindSchema.exclude(['delivery']),
    planId: DecisionRequestIdSchema,
    planVersion: z.number().int().min(1),
    digest: AssetSha256Schema,
});
/** The consumer must resolve this saved asset to immutable content, never a moving branch or generic URL. */
export const DeliveryDecisionSubjectSchema = z.strictObject({
    kind: z.literal('delivery'),
    organizationId: z.string().min(1).max(64),
    projectId: AssetRefSchema.shape.projectId,
    buSlug: AssetRefSchema.shape.buSlug.unwrap(),
    deliveryRef: z.strictObject({
        assetId: AssetRefSchema.shape.assetId,
        sha256: AssetSha256Schema,
    }),
});
export const DecisionSubjectSchema = z.discriminatedUnion('kind', [
    PlanDecisionSubjectSchema,
    DeliveryDecisionSubjectSchema,
]);
const ReferentSchema = z.strictObject({ kind: z.literal('referent'), email: z.email() });
/** Open question an agent puts to the owner or delivery referent, with the options to choose from. */
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
    addressedTo: z.union([z.strictObject({ ownerId: OwnerIdSchema }), ReferentSchema]),
    channel: DecisionRequestChannelSchema,
    createdAt: z.iso.datetime({ offset: true }),
}).superRefine((request, ctx) => {
    if (request.subject?.kind === 'delivery') {
        if (!('kind' in request.addressedTo)) {
            ctx.addIssue({ code: 'custom', path: ['addressedTo'], message: 'Delivery requires a referent' });
        }
        if (request.channel !== 'email') {
            ctx.addIssue({ code: 'custom', path: ['channel'], message: 'Delivery requires email' });
        }
        if (request.organizationId !== request.subject.organizationId) {
            ctx.addIssue({ code: 'custom', path: ['subject', 'organizationId'], message: 'Delivery organization must match the request' });
        }
        if (request.projectId !== request.subject.projectId) {
            ctx.addIssue({ code: 'custom', path: ['subject', 'projectId'], message: 'Delivery project must match the request' });
        }
    }
    else if (!('ownerId' in request.addressedTo)) {
        ctx.addIssue({ code: 'custom', path: ['addressedTo'], message: 'A plan or unbound request requires the owner' });
    }
});
const outcomeBase = {
    requestId: DecisionRequestIdSchema,
    decidedBy: z.union([z.strictObject({ kind: z.literal('owner'), ownerId: OwnerIdSchema }), ReferentSchema]),
    decidedAt: z.iso.datetime({ offset: true }),
    channel: DecisionRequestChannelSchema,
    sourceRef: z.string().min(1).max(512),
    subject: DecisionSubjectSchema.optional(),
};
/** Recorded human answer to a decision request. */
export const DecisionOutcomeSchema = z.discriminatedUnion('outcome', [
    z.strictObject({ ...outcomeBase, outcome: z.literal('approved'), optionId: OptionIdSchema }),
    z.strictObject({ ...outcomeBase, outcome: z.literal('rejected'), reason: z.string().min(3).max(2000) }),
]).superRefine((outcome, ctx) => {
    if (outcome.subject?.kind === 'delivery') {
        if (outcome.decidedBy.kind !== 'referent') {
            ctx.addIssue({ code: 'custom', path: ['decidedBy'], message: 'Delivery requires a referent decision' });
        }
        if (outcome.channel !== 'email') {
            ctx.addIssue({ code: 'custom', path: ['channel'], message: 'Delivery requires email' });
        }
        if (outcome.sourceRef.trim().length === 0) {
            ctx.addIssue({ code: 'custom', path: ['sourceRef'], message: 'Delivery requires a nonblank message receipt' });
        }
    }
    else if (outcome.decidedBy.kind !== 'owner') {
        ctx.addIssue({ code: 'custom', path: ['decidedBy'], message: 'A plan or unbound outcome requires the owner' });
    }
});
/** True when the outcome decides the same exact subject (or neither names one). */
export function decisionOutcomeMatchesSubject(request, outcome) {
    const a = request.subject;
    const b = outcome.subject;
    if (a === undefined && b === undefined)
        return true;
    if (a === undefined || b === undefined)
        return false;
    if (a.kind === 'delivery' || b.kind === 'delivery') {
        return a.kind === 'delivery' && b.kind === 'delivery'
            && a.organizationId === b.organizationId && a.projectId === b.projectId && a.buSlug === b.buSlug
            && a.deliveryRef.assetId === b.deliveryRef.assetId && a.deliveryRef.sha256 === b.deliveryRef.sha256;
    }
    return a.kind === b.kind && a.planId === b.planId && a.planVersion === b.planVersion && a.digest === b.digest;
}
/** Word used in the email subject to tie a reply to its decision request: `[decisione <requestId>]`. */
export const DECISION_REQUEST_SUBJECT_LABEL = 'decisione';
export function decisionRequestSubjectLabel(requestId) {
    return `[${DECISION_REQUEST_SUBJECT_LABEL} ${requestId}]`;
}
/** Human email reply already interpreted by the lead (approve / refuse with reason / unclear). */
export const DecisionEmailReplySchema = z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('approve'), requestId: DecisionRequestIdSchema, optionId: OptionIdSchema.optional() }),
    z.strictObject({ kind: z.literal('refuse'), requestId: DecisionRequestIdSchema, reason: z.string().min(3).max(2000) }),
    z.strictObject({
        kind: z.literal('unclear'),
        requestId: DecisionRequestIdSchema,
        why: z.enum(['missing_reason', 'no_decision', 'both']),
    }),
]);
/** Records an already interpreted reply; the consumer verifies the BU's authorized referent. */
export function decisionOutcomeFromEmailReply(input) {
    const { request, reply, from, receivedAt, messageId } = input;
    if (reply.requestId !== request.requestId)
        return { ok: false, code: 'mismatch' };
    const delivery = request.subject?.kind === 'delivery';
    if (delivery) {
        if (!('email' in from) || !('email' in request.addressedTo)
            || from.email.trim().toLowerCase() !== request.addressedTo.email.trim().toLowerCase()) {
            return { ok: false, code: 'not_addressee' };
        }
    }
    else if (!('ownerId' in from) || !('ownerId' in request.addressedTo)
        || from.ownerId !== request.addressedTo.ownerId) {
        return { ok: false, code: 'not_addressee' };
    }
    if (Date.parse(receivedAt) < Date.parse(request.createdAt))
        return { ok: false, code: 'before_request' };
    if (reply.kind === 'unclear')
        return { ok: false, code: 'unclear' };
    const base = {
        requestId: request.requestId,
        decidedBy: 'email' in request.addressedTo
            ? { kind: 'referent', email: request.addressedTo.email }
            : { kind: 'owner', ownerId: request.addressedTo.ownerId },
        decidedAt: receivedAt,
        channel: 'email',
        sourceRef: messageId,
        ...(delivery ? { subject: request.subject } : {}),
    };
    if (reply.kind === 'refuse') {
        return { ok: true, outcome: DecisionOutcomeSchema.parse({ ...base, outcome: 'rejected', reason: reply.reason }) };
    }
    let optionId = reply.optionId;
    if (optionId === undefined) {
        if (request.options.length !== 1)
            return { ok: false, code: 'option_required' };
        optionId = request.options[0].optionId;
    }
    if (!request.options.some((o) => o.optionId === optionId))
        return { ok: false, code: 'unknown_option' };
    return { ok: true, outcome: DecisionOutcomeSchema.parse({ ...base, outcome: 'approved', optionId }) };
}
//# sourceMappingURL=decision-request.js.map