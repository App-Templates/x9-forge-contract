"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionEmailReplySchema = exports.DECISION_REQUEST_SUBJECT_LABEL = exports.DecisionOutcomeSchema = exports.DecisionRequestSchema = exports.DecisionSubjectSchema = exports.DeliveryDecisionSubjectSchema = exports.DecisionSubjectKindSchema = exports.DECISION_SUBJECT_KINDS = exports.DecisionRequestOptionSchema = exports.DecisionRequestIdSchema = exports.DecisionRequestChannelSchema = exports.DECISION_REQUEST_CHANNELS = void 0;
exports.decisionOutcomeMatchesSubject = decisionOutcomeMatchesSubject;
exports.decisionRequestSubjectLabel = decisionRequestSubjectLabel;
exports.decisionOutcomeFromEmailReply = decisionOutcomeFromEmailReply;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
const asset_js_1 = require("./asset.cjs");
const participant_binding_js_1 = require("./participant-binding.cjs");
/** Channels through which an agent asks the owner for a decision. */
exports.DECISION_REQUEST_CHANNELS = ['email', 'x9_conversation', 'forge_panel'];
exports.DecisionRequestChannelSchema = zod_1.z.enum(exports.DECISION_REQUEST_CHANNELS);
exports.DecisionRequestIdSchema = zod_1.z.string().regex(/^[A-Za-z0-9_-]{6,64}$/);
const OptionIdSchema = zod_1.z
    .string()
    .max(40)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
exports.DecisionRequestOptionSchema = zod_1.z.strictObject({
    optionId: OptionIdSchema,
    label: zod_1.z.string().min(1).max(200),
    detail: zod_1.z.string().min(1).max(2000).optional(),
});
/** What a decision is about: an exact plan version or an immutable delivery. */
exports.DECISION_SUBJECT_KINDS = ['action_plan', 'vertical_plan', 'confirmation', 'delivery'];
exports.DecisionSubjectKindSchema = zod_1.z.enum(exports.DECISION_SUBJECT_KINDS);
const PlanDecisionSubjectSchema = zod_1.z.strictObject({
    kind: exports.DecisionSubjectKindSchema.exclude(['delivery']),
    planId: exports.DecisionRequestIdSchema,
    planVersion: zod_1.z.number().int().min(1),
    digest: asset_js_1.AssetSha256Schema,
});
/** The consumer must resolve this saved asset to immutable content, never a moving branch or generic URL. */
exports.DeliveryDecisionSubjectSchema = zod_1.z.strictObject({
    kind: zod_1.z.literal('delivery'),
    organizationId: zod_1.z.string().min(1).max(64),
    projectId: asset_js_1.AssetRefSchema.shape.projectId,
    buSlug: asset_js_1.AssetRefSchema.shape.buSlug.unwrap(),
    deliveryRef: zod_1.z.strictObject({
        assetId: asset_js_1.AssetRefSchema.shape.assetId,
        sha256: asset_js_1.AssetSha256Schema,
    }),
});
exports.DecisionSubjectSchema = zod_1.z.discriminatedUnion('kind', [
    PlanDecisionSubjectSchema,
    exports.DeliveryDecisionSubjectSchema,
]);
const ReferentSchema = zod_1.z.strictObject({ kind: zod_1.z.literal('referent'), email: zod_1.z.email() });
/** Open question an agent puts to the owner or delivery referent, with the options to choose from. */
exports.DecisionRequestSchema = zod_1.z.strictObject({
    requestId: exports.DecisionRequestIdSchema,
    tenantId: zod_1.z.string().min(1),
    organizationId: zod_1.z.string().min(1).max(64),
    projectId: zod_1.z.string().min(1).max(64).optional(),
    subject: exports.DecisionSubjectSchema.optional(),
    question: zod_1.z.string().min(1).max(4000),
    options: zod_1.z
        .array(exports.DecisionRequestOptionSchema)
        .min(1)
        .max(10)
        .refine((options) => new Set(options.map((o) => o.optionId)).size === options.length, {
        message: 'optionId must be unique within a request',
    }),
    requestedBy: participant_binding_js_1.ParticipantAgentIdentitySchema,
    addressedTo: zod_1.z.union([zod_1.z.strictObject({ ownerId: agent_identity_js_1.OwnerIdSchema }), ReferentSchema]),
    channel: exports.DecisionRequestChannelSchema,
    createdAt: zod_1.z.iso.datetime({ offset: true }),
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
    requestId: exports.DecisionRequestIdSchema,
    decidedBy: zod_1.z.union([zod_1.z.strictObject({ kind: zod_1.z.literal('owner'), ownerId: agent_identity_js_1.OwnerIdSchema }), ReferentSchema]),
    decidedAt: zod_1.z.iso.datetime({ offset: true }),
    channel: exports.DecisionRequestChannelSchema,
    sourceRef: zod_1.z.string().min(1).max(512),
    subject: exports.DecisionSubjectSchema.optional(),
};
/** Recorded human answer to a decision request. */
exports.DecisionOutcomeSchema = zod_1.z.discriminatedUnion('outcome', [
    zod_1.z.strictObject({ ...outcomeBase, outcome: zod_1.z.literal('approved'), optionId: OptionIdSchema }),
    zod_1.z.strictObject({ ...outcomeBase, outcome: zod_1.z.literal('rejected'), reason: zod_1.z.string().min(3).max(2000) }),
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
function decisionOutcomeMatchesSubject(request, outcome) {
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
exports.DECISION_REQUEST_SUBJECT_LABEL = 'decisione';
function decisionRequestSubjectLabel(requestId) {
    return `[${exports.DECISION_REQUEST_SUBJECT_LABEL} ${requestId}]`;
}
/** Human email reply already interpreted by the lead (approve / refuse with reason / unclear). */
exports.DecisionEmailReplySchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({ kind: zod_1.z.literal('approve'), requestId: exports.DecisionRequestIdSchema, optionId: OptionIdSchema.optional() }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('refuse'), requestId: exports.DecisionRequestIdSchema, reason: zod_1.z.string().min(3).max(2000) }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('unclear'),
        requestId: exports.DecisionRequestIdSchema,
        why: zod_1.z.enum(['missing_reason', 'no_decision', 'both']),
    }),
]);
/** Records an already interpreted reply; the consumer verifies the BU's authorized referent. */
function decisionOutcomeFromEmailReply(input) {
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
        return { ok: true, outcome: exports.DecisionOutcomeSchema.parse({ ...base, outcome: 'rejected', reason: reply.reason }) };
    }
    let optionId = reply.optionId;
    if (optionId === undefined) {
        if (request.options.length !== 1)
            return { ok: false, code: 'option_required' };
        optionId = request.options[0].optionId;
    }
    if (!request.options.some((o) => o.optionId === optionId))
        return { ok: false, code: 'unknown_option' };
    return { ok: true, outcome: exports.DecisionOutcomeSchema.parse({ ...base, outcome: 'approved', optionId }) };
}
//# sourceMappingURL=decision-request.js.map