import { z } from 'zod';
import { type AgentManagementRequestId } from "./agent-management.js";
import { type PolicyApproval } from "./agent-scope-policy.js";
export declare const POLICY_APPROVAL_CHANNELS: readonly ["email", "telegram"];
export declare const PolicyApprovalChannelSchema: z.ZodEnum<{
    email: "email";
    telegram: "telegram";
}>;
export type PolicyApprovalChannel = z.infer<typeof PolicyApprovalChannelSchema>;
export declare const POLICY_APPROVAL_SUBJECT_LABEL: "approvazione";
export declare function policyApprovalSubjectLabel(id: AgentManagementRequestId): string;
/** A pending operation presented to its human addressee. */
export declare const PolicyApprovalRequestSchema: z.ZodObject<{
    approval: z.ZodObject<{
        approvalId: z.ZodString;
        identity: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        capability: z.ZodString;
        tool: z.ZodString;
        access: z.ZodEnum<{
            read: "read";
            write: "write";
        }>;
        policyVersion: z.ZodNumber;
        requestedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
        status: z.ZodEnum<{
            revoked: "revoked";
            pending: "pending";
            expired: "expired";
            approved: "approved";
            rejected: "rejected";
        }>;
        decidedBy: z.ZodOptional<z.ZodString>;
        decidedAt: z.ZodOptional<z.ZodISODateTime>;
    }, z.core.$strict>;
    channel: z.ZodEnum<{
        email: "email";
        telegram: "telegram";
    }>;
    addressedTo: z.ZodObject<{
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    }, z.core.$strict>;
    text: z.ZodString;
}, z.core.$strict>;
export type PolicyApprovalRequest = z.infer<typeof PolicyApprovalRequestSchema>;
export declare const PolicyApprovalReplySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"approve">;
    approvalId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"refuse">;
    approvalId: z.ZodString;
    reason: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"unclear">;
    approvalId: z.ZodString;
}, z.core.$strict>], "kind">;
export type PolicyApprovalReply = z.infer<typeof PolicyApprovalReplySchema>;
export type PolicyApprovalReplyRejection = 'mismatch' | 'not_addressee' | 'expired' | 'before_request' | 'unclear';
export type PolicyApprovalFromReply = {
    ok: true;
    approval: PolicyApproval;
} | {
    ok: false;
    code: PolicyApprovalReplyRejection;
};
/** Resolve a reply from an authenticated human, within the pending approval's lifetime. */
export declare function policyApprovalFromReply(input: {
    request: PolicyApprovalRequest;
    reply: PolicyApprovalReply;
    from: {
        ownerId: string;
    };
    receivedAt: string;
}): PolicyApprovalFromReply;
//# sourceMappingURL=policy-approval-request.d.ts.map