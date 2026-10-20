"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionEmailReplySchema = exports.DECISION_REQUEST_SUBJECT_LABEL = exports.DecisionOutcomeSchema = exports.DecisionRequestSchema = exports.DecisionRequestOptionSchema = exports.DecisionRequestIdSchema = exports.DecisionRequestChannelSchema = exports.DECISION_REQUEST_CHANNELS = void 0;
exports.decisionRequestSubjectLabel = decisionRequestSubjectLabel;
exports.decisionOutcomeFromEmailReply = decisionOutcomeFromEmailReply;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
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
/** Open question an agent puts to the owner, with the options to choose from. */
exports.DecisionRequestSchema = zod_1.z.strictObject({
    requestId: exports.DecisionRequestIdSchema,
    tenantId: zod_1.z.string().min(1),
    organizationId: zod_1.z.string().min(1).max(64),
    projectId: zod_1.z.string().min(1).max(64).optional(),
    question: zod_1.z.string().min(1).max(4000),
    options: zod_1.z
        .array(exports.DecisionRequestOptionSchema)
        .min(1)
        .max(10)
        .refine((options) => new Set(options.map((o) => o.optionId)).size === options.length, {
        message: 'optionId must be unique within a request',
    }),
    requestedBy: participant_binding_js_1.ParticipantAgentIdentitySchema,
    addressedTo: zod_1.z.strictObject({ ownerId: agent_identity_js_1.OwnerIdSchema }),
    channel: exports.DecisionRequestChannelSchema,
    createdAt: zod_1.z.iso.datetime({ offset: true }),
});
const outcomeBase = {
    requestId: exports.DecisionRequestIdSchema,
    decidedBy: zod_1.z.strictObject({ kind: zod_1.z.literal('owner'), ownerId: agent_identity_js_1.OwnerIdSchema }),
    decidedAt: zod_1.z.iso.datetime({ offset: true }),
    channel: exports.DecisionRequestChannelSchema,
    sourceRef: zod_1.z.string().min(1).max(512),
};
/** Recorded owner answer to a decision request. */
exports.DecisionOutcomeSchema = zod_1.z.discriminatedUnion('outcome', [
    zod_1.z.strictObject({ ...outcomeBase, outcome: zod_1.z.literal('approved'), optionId: OptionIdSchema }),
    zod_1.z.strictObject({ ...outcomeBase, outcome: zod_1.z.literal('rejected'), reason: zod_1.z.string().min(3).max(2000) }),
]);
/** Word used in the email subject to tie a reply to its decision request: `[decisione <requestId>]`. */
exports.DECISION_REQUEST_SUBJECT_LABEL = 'decisione';
function decisionRequestSubjectLabel(requestId) {
    return `[${exports.DECISION_REQUEST_SUBJECT_LABEL} ${requestId}]`;
}
/** Owner email reply as read by the inbound reader (approve / refuse with reason / unclear). */
exports.DecisionEmailReplySchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({ kind: zod_1.z.literal('approve'), requestId: exports.DecisionRequestIdSchema, optionId: OptionIdSchema.optional() }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('refuse'), requestId: exports.DecisionRequestIdSchema, reason: zod_1.z.string().min(3).max(2000) }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('unclear'),
        requestId: exports.DecisionRequestIdSchema,
        why: zod_1.z.enum(['missing_reason', 'no_decision', 'both']),
    }),
]);
/** The single rule that turns an email reply into the recorded outcome of a request. */
function decisionOutcomeFromEmailReply(input) {
    const { request, reply, from, receivedAt, messageId } = input;
    if (reply.requestId !== request.requestId)
        return { ok: false, code: 'mismatch' };
    if (from.ownerId !== request.addressedTo.ownerId)
        return { ok: false, code: 'not_addressee' };
    if (Date.parse(receivedAt) < Date.parse(request.createdAt))
        return { ok: false, code: 'before_request' };
    if (reply.kind === 'unclear')
        return { ok: false, code: 'unclear' };
    const base = {
        requestId: request.requestId,
        decidedBy: { kind: 'owner', ownerId: request.addressedTo.ownerId },
        decidedAt: receivedAt,
        channel: 'email',
        sourceRef: messageId,
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