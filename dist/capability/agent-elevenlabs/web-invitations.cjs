"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsWebPublicInvitationSchema = exports.ElevenLabsWebInvitationListSchema = exports.ElevenLabsWebInvitationRecordSchema = exports.ElevenLabsWebPendingInvitationSchema = exports.ElevenLabsWebRevokeDraftSchema = exports.ElevenLabsWebInviteDraftSchema = exports.ElevenLabsWebRecipientLookupSchema = void 0;
exports.isElevenLabsWebInvitationListCurrent = isElevenLabsWebInvitationListCurrent;
exports.projectElevenLabsWebInvitationList = projectElevenLabsWebInvitationList;
exports.isElevenLabsWebInvitationRecipientCurrent = isElevenLabsWebInvitationRecipientCurrent;
const zod_1 = require("zod");
const web_channel_js_1 = require("./web-channel.cjs");
const agent_channel_access_js_1 = require("../../agent/agent-channel-access.cjs");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
/** Existing registry lookup only, supplied by Forge. An outage is not a not-registered result. */
exports.ElevenLabsWebRecipientLookupSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.object({ status: zod_1.z.literal('registered'), email: agent_channel_access_js_1.AgentChannelEmailAddressSchema, recipientUserId: web_channel_js_1.ElevenLabsWebInvitationSchema.shape.recipientUserId, observedAt: web_channel_js_1.ElevenLabsWebInvitationSchema.shape.createdAt }).strict(),
    zod_1.z.object({ status: zod_1.z.literal('not-registered'), email: agent_channel_access_js_1.AgentChannelEmailAddressSchema, observedAt: web_channel_js_1.ElevenLabsWebInvitationSchema.shape.createdAt }).strict(),
    zod_1.z.object({ status: zod_1.z.literal('unavailable') }).strict(),
]);
/** No account/user ID, scope, authorization or timestamps may come from the browser. */
exports.ElevenLabsWebInviteDraftSchema = zod_1.z.object({
    requestId: web_channel_js_1.ElevenLabsWebInvitationSchema.shape.invitationId, email: agent_channel_access_js_1.AgentChannelEmailAddressSchema,
    expectedVersion: web_channel_js_1.ElevenLabsWebInvitationSchema.shape.revision,
}).strict();
exports.ElevenLabsWebRevokeDraftSchema = zod_1.z.object({
    requestId: web_channel_js_1.ElevenLabsWebInvitationSchema.shape.invitationId, invitationId: web_channel_js_1.ElevenLabsWebInvitationSchema.shape.invitationId,
    expectedVersion: web_channel_js_1.ElevenLabsWebInvitationSchema.shape.revision,
}).strict();
/** Same C3 metadata validators; a pending record has no principal and can never be submitted as C3 authority. */
function invitationTimes(value, ctx) {
    if (Date.parse(value.createdAt) >= Date.parse(value.expiresAt))
        ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Expiry must follow creation' }); // guard:invite-expiry
    if (value.revokedAt !== null && Date.parse(value.revokedAt) < Date.parse(value.createdAt))
        ctx.addIssue({ code: 'custom', path: ['revokedAt'], message: 'Revocation cannot precede creation' }); // guard:invite-revocation
}
exports.ElevenLabsWebPendingInvitationSchema = zod_1.z.object(web_channel_js_1.ElevenLabsWebInvitationSchema.shape).omit({ recipientUserId: true }).strict().superRefine(invitationTimes);
exports.ElevenLabsWebInvitationRecordSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.object({ status: zod_1.z.literal('registered'), email: agent_channel_access_js_1.AgentChannelEmailAddressSchema, invitation: web_channel_js_1.ElevenLabsWebInvitationSchema }).strict(),
    zod_1.z.object({ status: zod_1.z.literal('pending-registration'), email: agent_channel_access_js_1.AgentChannelEmailAddressSchema, pending: exports.ElevenLabsWebPendingInvitationSchema, invitation: zod_1.z.null() }).strict(),
]);
exports.ElevenLabsWebInvitationListSchema = agent_channel_access_js_1.AgentChannelAccessBindingSchema.safeExtend({
    status: zod_1.z.literal('available'), version: web_channel_js_1.ElevenLabsWebInvitationSchema.shape.revision,
    observedAt: web_channel_js_1.ElevenLabsWebInvitationSchema.shape.createdAt, entries: zod_1.z.array(exports.ElevenLabsWebInvitationRecordSchema).max(512),
}).strict().superRefine((list, ctx) => {
    const records = list.entries.map(entry => entry.status === 'registered' ? entry.invitation : entry.pending);
    const issue = (message) => ctx.addIssue({ code: 'custom', path: ['entries'], message });
    if (records.some(record => !(0, capability_call_context_js_1.sameCapabilityScope)(record.scope, list.scope)))
        issue('Invitations belong to another full scope'); // guard:invite-list-scope
    if (new Set(records.map(record => record.invitationId)).size !== records.length)
        issue('Current invitation ids must be unique'); // guard:invite-list-id
    if (new Set(list.entries.map(entry => entry.email)).size !== records.length)
        issue('Current invitation mailboxes must be unique'); // guard:invite-list-email
    if (records.some(record => record.revision > list.version))
        issue('Stored revision cannot exceed the source version'); // guard:invite-list-version
    if (records.some(record => Date.parse(record.createdAt) > Date.parse(list.observedAt) || (record.revokedAt !== null && Date.parse(record.revokedAt) > Date.parse(list.observedAt))))
        issue('Cannot observe future stored events'); // guard:invite-list-events
});
const PublicMetadata = zod_1.z.object(exports.ElevenLabsWebPendingInvitationSchema.shape).omit({ scope: true });
exports.ElevenLabsWebPublicInvitationSchema = PublicMetadata.safeExtend({
    email: agent_channel_access_js_1.AgentChannelEmailAddressSchema, status: zod_1.z.enum(['active', 'pending-registration', 'revoked', 'expired']),
}).strict().superRefine(invitationTimes).superRefine((entry, ctx) => {
    if ((entry.status === 'revoked') !== (entry.revokedAt !== null))
        ctx.addIssue({ code: 'custom', path: ['status'], message: 'Revocation state and timestamp must agree' }); // guard:invite-public-state
});
/** Correlation only, not a writer, registry lookup, admission decision or account-link flow. */
function isElevenLabsWebInvitationListCurrent(rawList, rawBinding, now, maximumAgeMs = 60_000) {
    const list = exports.ElevenLabsWebInvitationListSchema.safeParse(rawList), binding = agent_channel_access_js_1.AgentChannelAccessBindingSchema.safeParse(rawBinding);
    if (!list.success || !binding.success || !Number.isFinite(now) || !Number.isFinite(maximumAgeMs) || maximumAgeMs <= 0)
        return false; // guard:invite-current-parse
    const { scope, identity, observedAt } = list.data;
    return (0, agent_channel_access_js_1.sameAgentChannelAccessBinding)({ scope, identity }, binding.data) // guard:invite-current-binding
        && Date.parse(observedAt) <= now && now - Date.parse(observedAt) < maximumAgeMs; // guard:invite-current-time
}
function projectElevenLabsWebInvitationList(rawList, rawBinding, now) {
    if (!isElevenLabsWebInvitationListCurrent(rawList, rawBinding, now))
        return null; // guard:invite-project-current
    const list = exports.ElevenLabsWebInvitationListSchema.parse(rawList);
    return list.entries.map(entry => {
        const record = entry.status === 'registered' ? entry.invitation : entry.pending;
        const status = record.revokedAt !== null ? 'revoked' : Date.parse(record.expiresAt) <= now ? 'expired' : entry.status === 'registered' ? 'active' : 'pending-registration'; // guard:invite-project-status
        return exports.ElevenLabsWebPublicInvitationSchema.parse({ invitationId: record.invitationId, revision: record.revision, email: entry.email, status,
            createdAt: record.createdAt, expiresAt: record.expiresAt, revokedAt: record.revokedAt }); // guard:invite-project-filter
    });
}
/** Returns only the existing C3 record for an exact currently registered target; pending never grants access.
 * Producers also authenticate ownership and apply current admission/contact policy, then recheck after await.
 */
function isElevenLabsWebInvitationRecipientCurrent(rawRecord, rawLookup, expectedScope, expectedEmail, expectedRevision, now) {
    const record = exports.ElevenLabsWebInvitationRecordSchema.safeParse(rawRecord), lookup = exports.ElevenLabsWebRecipientLookupSchema.safeParse(rawLookup);
    const scope = capability_call_context_js_1.CapabilityAgentScopeSchema.safeParse(expectedScope), email = agent_channel_access_js_1.AgentChannelEmailAddressSchema.safeParse(expectedEmail);
    if (!record.success || record.data.status !== 'registered' || !lookup.success || lookup.data.status !== 'registered' || !scope.success || !email.success)
        return false; // guard:invite-recipient-parse
    if (record.data.email !== email.data || lookup.data.email !== email.data)
        return false; // guard:invite-recipient-target
    if (Date.parse(lookup.data.observedAt) > now || now - Date.parse(lookup.data.observedAt) >= 60_000)
        return false; // guard:invite-recipient-time
    return (0, web_channel_js_1.isElevenLabsWebInvitationCurrent)(record.data.invitation, scope.data, lookup.data.recipientUserId, expectedRevision, new Date(now)); // guard:invite-recipient-c3
}
//# sourceMappingURL=web-invitations.js.map