import { z } from 'zod';
import { OwnerIdSchema } from "./agent-identity.js";
import { AgentManagementRequestIdSchema } from "./agent-management.js";
import { PolicyApprovalSchema } from "./agent-scope-policy.js";
export const POLICY_APPROVAL_CHANNELS = ['email', 'telegram'];
export const PolicyApprovalChannelSchema = z.enum(POLICY_APPROVAL_CHANNELS);
export const POLICY_APPROVAL_SUBJECT_LABEL = 'approvazione';
export function policyApprovalSubjectLabel(id) {
    return `[${POLICY_APPROVAL_SUBJECT_LABEL} ${id}]`;
}
/** A pending operation presented to its human addressee. */
export const PolicyApprovalRequestSchema = z.strictObject({
    approval: PolicyApprovalSchema.refine((approval) => approval.status === 'pending', {
        message: 'Only pending approvals can be requested',
    }),
    channel: PolicyApprovalChannelSchema,
    addressedTo: z.strictObject({ ownerId: OwnerIdSchema }),
    text: z.string().min(1).max(2000).refine((text) => text === text.trim(), {
        message: 'Text must not have leading or trailing whitespace',
    }),
});
export const PolicyApprovalReplySchema = z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('approve'), approvalId: AgentManagementRequestIdSchema }),
    z.strictObject({
        kind: z.literal('refuse'),
        approvalId: AgentManagementRequestIdSchema,
        reason: z.string().min(3).max(2000),
    }),
    z.strictObject({ kind: z.literal('unclear'), approvalId: AgentManagementRequestIdSchema }),
]);
/** Resolve a reply from an authenticated human, within the pending approval's lifetime. */
export function policyApprovalFromReply(input) {
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
        approval: PolicyApprovalSchema.parse({
            ...request.approval,
            status: reply.kind === 'approve' ? 'approved' : 'rejected',
            decidedBy: from.ownerId,
            decidedAt: receivedAt,
        }),
    };
}
//# sourceMappingURL=policy-approval-request.js.map