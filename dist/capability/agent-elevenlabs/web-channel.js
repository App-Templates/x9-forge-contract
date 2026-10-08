import { z } from 'zod';
import { CapabilityAgentScopeSchema, CapabilityPersonScopeSchema, sameCapabilityScope } from "../capability-call-context.js";
import { AgentConfigVersionSchema } from "../ricerca/agent-config.js";
import { AgentManagementRequestIdSchema } from "../../agent/agent-management.js";
/** Independent Web admission policy; this does not pause the provider or other doors. */
export const ElevenLabsWebAccessSchema = z.enum(['owner', 'invited', 'public']);
export const ElevenLabsWebPolicySchema = z.object({
    scope: CapabilityAgentScopeSchema,
    version: AgentConfigVersionSchema,
    access: ElevenLabsWebAccessSchema,
    paused: z.boolean(),
}).strict();
/** First execution advances the Web policy exactly once; replay returns that same revision. */
export const ElevenLabsWebPolicyChangeSchema = z.object({
    requestId: AgentManagementRequestIdSchema,
    scope: CapabilityAgentScopeSchema,
    expectedVersion: AgentConfigVersionSchema,
    access: ElevenLabsWebAccessSchema,
    paused: z.boolean(),
}).strict();
export const ElevenLabsWebPolicyResultSchema = z.object({
    ok: z.literal(true),
    requestId: AgentManagementRequestIdSchema,
    replayed: z.boolean(),
    policy: ElevenLabsWebPolicySchema,
}).strict();
/** A readback is current only for the full scope, command and exactly next revision. */
export function isElevenLabsWebPolicyResultCurrent(request, result) {
    const command = ElevenLabsWebPolicyChangeSchema.safeParse(request);
    const response = ElevenLabsWebPolicyResultSchema.safeParse(result);
    if (!command.success || !response.success)
        return false;
    const expected = command.data;
    const actual = response.data;
    return actual.requestId === expected.requestId
        && sameCapabilityScope(actual.policy.scope, expected.scope)
        && actual.policy.version === expected.expectedVersion + 1
        && actual.policy.access === expected.access
        && actual.policy.paused === expected.paused;
}
/** Server-owned record, not an authorization token or proof of an authenticated viewer. */
export const ElevenLabsWebInvitationSchema = z.object({
    invitationId: AgentManagementRequestIdSchema,
    scope: CapabilityAgentScopeSchema,
    revision: AgentConfigVersionSchema,
    recipientUserId: CapabilityPersonScopeSchema.shape.userId,
    createdAt: z.iso.datetime({ offset: true }),
    expiresAt: z.iso.datetime({ offset: true }),
    revokedAt: z.iso.datetime({ offset: true }).nullable(),
}).strict().superRefine((invitation, ctx) => {
    if (Date.parse(invitation.createdAt) >= Date.parse(invitation.expiresAt)) {
        ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Invitation expiry must follow creation' });
    }
    if (invitation.revokedAt !== null && Date.parse(invitation.revokedAt) < Date.parse(invitation.createdAt)) {
        ctx.addIssue({ code: 'custom', path: ['revokedAt'], message: 'Revocation cannot precede creation' });
    }
});
/**
 * Call only with a freshly loaded server record and server-resolved scope, authenticated person and revision.
 * Recheck after every awaited operation. This validates the invitation; it never grants a provider lease.
 */
export function isElevenLabsWebInvitationCurrent(invitation, expectedScope, authenticatedUserId, currentRevision, now) {
    const record = ElevenLabsWebInvitationSchema.safeParse(invitation);
    const scope = CapabilityAgentScopeSchema.safeParse(expectedScope);
    const person = CapabilityPersonScopeSchema.shape.userId.safeParse(authenticatedUserId);
    const revision = AgentConfigVersionSchema.safeParse(currentRevision);
    const time = now.getTime();
    if (!record.success || !scope.success || !person.success || !revision.success || !Number.isFinite(time))
        return false;
    const current = record.data;
    return sameCapabilityScope(current.scope, scope.data)
        && current.recipientUserId === person.data
        && current.revision === revision.data
        && current.revokedAt === null
        && Date.parse(current.createdAt) <= time
        && Date.parse(current.expiresAt) > time;
}
//# sourceMappingURL=web-channel.js.map