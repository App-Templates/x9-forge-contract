"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsWebInvitationSchema = exports.ElevenLabsWebPolicyResultSchema = exports.ElevenLabsWebPolicyChangeSchema = exports.ElevenLabsWebPolicySchema = exports.ElevenLabsWebAccessSchema = void 0;
exports.isElevenLabsWebPolicyResultCurrent = isElevenLabsWebPolicyResultCurrent;
exports.isElevenLabsWebInvitationCurrent = isElevenLabsWebInvitationCurrent;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
const agent_management_js_1 = require("../../agent/agent-management.cjs");
/** Independent Web admission policy; this does not pause the provider or other doors. */
exports.ElevenLabsWebAccessSchema = zod_1.z.enum(['owner', 'invited', 'public']);
exports.ElevenLabsWebPolicySchema = zod_1.z.object({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    version: agent_config_js_1.AgentConfigVersionSchema,
    access: exports.ElevenLabsWebAccessSchema,
    paused: zod_1.z.boolean(),
    /** Omitted legacy commands preserve the stored flag; explicit false is meaningful. */
    enabled: zod_1.z.boolean().optional(),
}).strict();
/** First execution advances the Web policy exactly once; replay returns that same revision. */
exports.ElevenLabsWebPolicyChangeSchema = zod_1.z.object({
    requestId: agent_management_js_1.AgentManagementRequestIdSchema,
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    expectedVersion: agent_config_js_1.AgentConfigVersionSchema,
    access: exports.ElevenLabsWebAccessSchema,
    paused: zod_1.z.boolean(),
    /** Omitted legacy commands preserve the stored flag; explicit false is meaningful. */
    enabled: zod_1.z.boolean().optional(),
}).strict();
exports.ElevenLabsWebPolicyResultSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    requestId: agent_management_js_1.AgentManagementRequestIdSchema,
    replayed: zod_1.z.boolean(),
    policy: exports.ElevenLabsWebPolicySchema,
}).strict();
/** A readback is current only for the full scope, command and exactly next revision. */
function isElevenLabsWebPolicyResultCurrent(request, result) {
    const command = exports.ElevenLabsWebPolicyChangeSchema.safeParse(request);
    const response = exports.ElevenLabsWebPolicyResultSchema.safeParse(result);
    if (!command.success || !response.success)
        return false;
    const expected = command.data;
    const actual = response.data;
    return actual.requestId === expected.requestId
        && (0, capability_call_context_js_1.sameCapabilityScope)(actual.policy.scope, expected.scope)
        && actual.policy.version === expected.expectedVersion + 1
        && actual.policy.access === expected.access
        && actual.policy.paused === expected.paused
        && (expected.enabled === undefined || actual.policy.enabled === expected.enabled);
}
/** Server-owned record, not an authorization token or proof of an authenticated viewer. */
exports.ElevenLabsWebInvitationSchema = zod_1.z.object({
    invitationId: agent_management_js_1.AgentManagementRequestIdSchema,
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    revision: agent_config_js_1.AgentConfigVersionSchema,
    recipientUserId: capability_call_context_js_1.CapabilityPersonScopeSchema.shape.userId,
    createdAt: zod_1.z.iso.datetime({ offset: true }),
    expiresAt: zod_1.z.iso.datetime({ offset: true }),
    revokedAt: zod_1.z.iso.datetime({ offset: true }).nullable(),
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
function isElevenLabsWebInvitationCurrent(invitation, expectedScope, authenticatedUserId, currentRevision, now) {
    const record = exports.ElevenLabsWebInvitationSchema.safeParse(invitation);
    const scope = capability_call_context_js_1.CapabilityAgentScopeSchema.safeParse(expectedScope);
    const person = capability_call_context_js_1.CapabilityPersonScopeSchema.shape.userId.safeParse(authenticatedUserId);
    const revision = agent_config_js_1.AgentConfigVersionSchema.safeParse(currentRevision);
    const time = now.getTime();
    if (!record.success || !scope.success || !person.success || !revision.success || !Number.isFinite(time))
        return false;
    const current = record.data;
    return (0, capability_call_context_js_1.sameCapabilityScope)(current.scope, scope.data)
        && current.recipientUserId === person.data
        && current.revision === revision.data
        && current.revokedAt === null
        && Date.parse(current.createdAt) <= time
        && Date.parse(current.expiresAt) > time;
}
//# sourceMappingURL=web-channel.js.map