"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyApprovalReplySchema = exports.PolicyApprovalRequestSchema = exports.POLICY_APPROVAL_SUBJECT_LABEL = exports.PolicyApprovalChannelSchema = exports.POLICY_APPROVAL_CHANNELS = void 0;
exports.policyApprovalSubjectLabel = policyApprovalSubjectLabel;
exports.policyApprovalFromReply = policyApprovalFromReply;
const zod_1 = require("zod");
const agent_identity_js_1 = require("./agent-identity.cjs");
const agent_management_js_1 = require("./agent-management.cjs");
const agent_scope_policy_js_1 = require("./agent-scope-policy.cjs");
exports.POLICY_APPROVAL_CHANNELS = ['email', 'telegram'];
exports.PolicyApprovalChannelSchema = zod_1.z.enum(exports.POLICY_APPROVAL_CHANNELS);
exports.POLICY_APPROVAL_SUBJECT_LABEL = 'approvazione';
function policyApprovalSubjectLabel(id) {
    return `[${exports.POLICY_APPROVAL_SUBJECT_LABEL} ${id}]`;
}
/** A pending operation presented to its human addressee. */
exports.PolicyApprovalRequestSchema = zod_1.z.strictObject({
    approval: agent_scope_policy_js_1.PolicyApprovalSchema.refine((approval) => approval.status === 'pending', {
        message: 'Only pending approvals can be requested',
    }),
    channel: exports.PolicyApprovalChannelSchema,
    addressedTo: zod_1.z.strictObject({ ownerId: agent_identity_js_1.OwnerIdSchema }),
    text: zod_1.z.string().min(1).max(2000).refine((text) => text === text.trim(), {
        message: 'Text must not have leading or trailing whitespace',
    }),
});
exports.PolicyApprovalReplySchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({ kind: zod_1.z.literal('approve'), approvalId: agent_management_js_1.AgentManagementRequestIdSchema }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('refuse'),
        approvalId: agent_management_js_1.AgentManagementRequestIdSchema,
        reason: zod_1.z.string().min(3).max(2000),
    }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('unclear'), approvalId: agent_management_js_1.AgentManagementRequestIdSchema }),
]);
/** Resolve a reply from an authenticated human, within the pending approval's lifetime. */
function policyApprovalFromReply(input) {
    const { request, reply, from, receivedAt } = input;
    if (reply.approvalId !== request.approval.approvalId)
        return { ok: false, code: 'mismatch' };
    if (from.ownerId !== request.addressedTo.ownerId)
        return { ok: false, code: 'not_addressee' };
    if (Date.parse(receivedAt) > Date.parse(request.approval.expiresAt))
        return { ok: false, code: 'expired' };
    if (Date.parse(receivedAt) < Date.parse(request.approval.requestedAt))
        return { ok: false, code: 'before_request' };
    if (reply.kind === 'unclear')
        return { ok: false, code: 'unclear' };
    return {
        ok: true,
        approval: agent_scope_policy_js_1.PolicyApprovalSchema.parse({
            ...request.approval,
            status: reply.kind === 'approve' ? 'approved' : 'rejected',
            decidedBy: from.ownerId,
            decidedAt: receivedAt,
        }),
    };
}
//# sourceMappingURL=policy-approval-request.js.map