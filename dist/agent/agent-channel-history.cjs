"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentChannelHistoryRoundTripEvidenceSchema = exports.AgentChannelHistoryOwnerParticipantSchema = exports.AgentChannelHistoryResponseSchema = exports.AgentChannelHistoryVerificationSchema = exports.AgentChannelHistoryEntrySchema = exports.AgentChannelHistoryContentStateSchema = exports.AgentChannelHistoryKindSchema = void 0;
exports.isAgentChannelHistoryCurrent = isAgentChannelHistoryCurrent;
exports.isAgentChannelHistoryVerificationCurrent = isAgentChannelHistoryVerificationCurrent;
exports.isAgentChannelHistoryRoundTripVerified = isAgentChannelHistoryRoundTripVerified;
const zod_1 = require("zod");
const agent_channel_configuration_js_1 = require("./agent-channel-configuration.cjs");
const agent_channel_access_js_1 = require("./agent-channel-access.cjs");
const agent_management_js_1 = require("./agent-management.cjs");
const agent_channel_access_requests_js_1 = require("./agent-channel-access-requests.cjs");
/** One canonical owner-scoped history for all four doors; never a raw provider log. */
exports.AgentChannelHistoryKindSchema = zod_1.z.enum(['telegram', 'email', 'phone', 'web']);
const time = zod_1.z.iso.datetime({ offset: true });
const bindingOf = (value) => ({ scope: value.scope, identity: value.identity });
exports.AgentChannelHistoryContentStateSchema = zod_1.z.enum(['available', 'not-retained', 'expired', 'unavailable', 'not-applicable']);
exports.AgentChannelHistoryEntrySchema = agent_channel_access_js_1.AgentChannelAccessBindingSchema.safeExtend({
    entryId: agent_management_js_1.AgentManagementRequestIdSchema, kind: exports.AgentChannelHistoryKindSchema,
    conversationId: agent_management_js_1.AgentManagementRequestIdSchema,
    /** Set only by the existing server operation, not an arbitrary historical event. */
    requestId: agent_management_js_1.AgentManagementRequestIdSchema.nullable(),
    direction: zod_1.z.enum(['inbound', 'outbound']), participantName: agent_channel_access_js_1.AgentChannelAccessNameSchema.nullable(),
    status: zod_1.z.enum(['active', 'completed', 'failed', 'unknown']),
    startedAt: time, endedAt: time.nullable(), durationSeconds: zod_1.z.number().finite().nonnegative().nullable(),
    /** Availability only. Contents and transport URLs require separate authorized reads. */
    content: zod_1.z.object({ audio: exports.AgentChannelHistoryContentStateSchema, transcript: exports.AgentChannelHistoryContentStateSchema }).strict(),
}).superRefine((entry, ctx) => {
    const terminal = entry.status === 'completed' || entry.status === 'failed';
    if (terminal !== (entry.endedAt !== null))
        ctx.addIssue({ code: 'custom', path: ['endedAt'], message: 'Only an attested terminal record has an ending' }); // guard:terminal-time
    if (entry.endedAt === null && entry.durationSeconds !== null)
        ctx.addIssue({ code: 'custom', path: ['durationSeconds'], message: 'Elapsed duration is unknown until an attested ending' }); // guard:unknown-duration
    if (entry.endedAt !== null) {
        const elapsed = Date.parse(entry.endedAt) - Date.parse(entry.startedAt);
        if (elapsed < 0)
            ctx.addIssue({ code: 'custom', path: ['endedAt'], message: 'Ending cannot precede start' }); // guard:chronology
        if (entry.durationSeconds !== null && entry.durationSeconds * 1000 > elapsed)
            ctx.addIssue({ code: 'custom', path: ['durationSeconds'], message: 'Conversation duration cannot exceed the attested elapsed interval' }); // guard:elapsed-duration
    }
});
exports.AgentChannelHistoryVerificationSchema = zod_1.z.object({
    requestId: agent_management_js_1.AgentManagementRequestIdSchema, entryId: agent_management_js_1.AgentManagementRequestIdSchema,
    completedAt: time, outcome: zod_1.z.enum(['completed', 'failed']),
}).strict();
const available = agent_channel_access_js_1.AgentChannelAccessBindingSchema.safeExtend({
    status: zod_1.z.literal('available'), kind: exports.AgentChannelHistoryKindSchema, observedAt: time,
    entries: zod_1.z.array(exports.AgentChannelHistoryEntrySchema).max(100),
    /** null means the source did not attest a total; do not fabricate a denominator. */
    total: zod_1.z.number().int().nonnegative().nullable(), nextCursor: agent_management_js_1.AgentManagementRequestIdSchema.nullable(),
    lastVerification: exports.AgentChannelHistoryVerificationSchema.nullable(),
}).superRefine((history, ctx) => {
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (history.entries.some(entry => !(0, agent_channel_access_js_1.sameAgentChannelAccessBinding)(bindingOf(entry), bindingOf(history))))
        issue('entries', 'Stored entries belong to another full binding'); // guard:entry-binding
    if (history.entries.some(entry => entry.kind !== history.kind))
        issue('entries', 'Stored entries belong to another door'); // guard:entry-kind
    if (new Set(history.entries.map(entry => entry.entryId)).size !== history.entries.length)
        issue('entries', 'Stored entry ids must be unique'); // guard:entry-unique
    if (history.total !== null && history.total < history.entries.length)
        issue('total', 'Attested total cannot be smaller than the returned page'); // guard:total
    if (history.entries.length === 0 && history.nextCursor !== null)
        issue('nextCursor', 'An empty page cannot promise a following cursor'); // guard:empty-cursor
    if (history.entries.some(entry => Date.parse(entry.startedAt) > Date.parse(history.observedAt)
        || (entry.endedAt !== null && Date.parse(entry.endedAt) > Date.parse(history.observedAt))))
        issue('observedAt', 'History cannot observe future events'); // guard:observed-events
    const verification = history.lastVerification;
    if (verification !== null) {
        const entry = history.entries.find(value => value.entryId === verification.entryId);
        if (!entry || entry.requestId !== verification.requestId || entry.endedAt !== verification.completedAt
            || entry.status !== verification.outcome)
            issue('lastVerification', 'Verification must describe its correlated terminal stored operation'); // guard:verification-record
    }
});
const unavailable = agent_channel_access_js_1.AgentChannelAccessBindingSchema.safeExtend({
    status: zod_1.z.literal('unavailable'), kind: exports.AgentChannelHistoryKindSchema,
    observedAt: time.nullable(), error: agent_channel_access_requests_js_1.AgentChannelAccessErrorCodeSchema,
});
exports.AgentChannelHistoryResponseSchema = zod_1.z.discriminatedUnion('status', [available, unavailable]);
/** A producer still authenticates the caller and attests each stored fact. */
function isAgentChannelHistoryCurrent(rawHistory, rawBinding, rawKind, now, maximumAgeMs = 60_000) {
    const history = exports.AgentChannelHistoryResponseSchema.safeParse(rawHistory);
    const binding = agent_channel_access_js_1.AgentChannelAccessBindingSchema.safeParse(rawBinding);
    const kind = exports.AgentChannelHistoryKindSchema.safeParse(rawKind);
    if (!history.success || history.data.status !== 'available' || !binding.success || !kind.success
        || !Number.isFinite(maximumAgeMs))
        return false; // guard:current-parse
    const actual = history.data;
    return (0, agent_channel_access_js_1.sameAgentChannelAccessBinding)(bindingOf(actual), binding.data) // guard:current-binding
        && actual.kind === kind.data // guard:current-kind
        && Date.parse(actual.observedAt) <= now // guard:current-future
        && now - Date.parse(actual.observedAt) < maximumAgeMs; // guard:current-fresh
}
/** Correlation/freshness only, NOT resource generation or a completed user round trip.
 * Compose the appropriate end-to-end evidence guard before displaying a healthy door. */
function isAgentChannelHistoryVerificationCurrent(rawHistory, rawBinding, rawKind, expectedRequestId, now, maximumAgeMs = 60_000) {
    if (!isAgentChannelHistoryCurrent(rawHistory, rawBinding, rawKind, now, maximumAgeMs))
        return false; // guard:verification-current
    const history = exports.AgentChannelHistoryResponseSchema.safeParse(rawHistory);
    const requestId = agent_management_js_1.AgentManagementRequestIdSchema.safeParse(expectedRequestId);
    if (!history.success || history.data.status !== 'available' || !requestId.success)
        return false;
    const verification = history.data.lastVerification;
    return verification !== null // guard:verification-present
        && verification.outcome === 'completed' // guard:verification-success
        && verification.requestId === requestId.data // guard:verification-request
        && now - Date.parse(verification.completedAt) < maximumAgeMs; // guard:verification-fresh
}
/** Internal server evidence, NEVER the public history DTO. Existing writers attest actual events;
 * these schemas do not authenticate accounts, deliver replies or establish a new ledger/store.
 */
/** Expected participant comes from the existing owners registry, not from the request body or admitted-chat list. */
exports.AgentChannelHistoryOwnerParticipantSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.object({ kind: zod_1.z.literal('telegram'), userId: agent_channel_access_js_1.AgentTelegramChatIdSchema.refine(id => !id.startsWith('-')) }).strict(),
    zod_1.z.object({ kind: zod_1.z.literal('email'), address: agent_channel_access_js_1.AgentChannelEmailAddressSchema }).strict(),
]);
exports.AgentChannelHistoryRoundTripEvidenceSchema = zod_1.z.object({
    requestId: agent_management_js_1.AgentManagementRequestIdSchema, entryId: agent_management_js_1.AgentManagementRequestIdSchema,
    participant: exports.AgentChannelHistoryOwnerParticipantSchema,
    configuration: agent_channel_configuration_js_1.AgentChannelConfigurationSchema,
    owner: agent_channel_access_js_1.AgentChannelAccessBindingSchema.shape.scope.pick({ tenantId: true, ownerId: true }).strict(),
    requestedAt: time, receivedAt: time, turnCompletedAt: time, replyDeliveredAt: time,
}).strict();
/** TG/email only: phone/web require their canonical C2/C3 conversation-completion evidence separately. */
function isAgentChannelHistoryRoundTripVerified(rawHistory, rawBinding, rawKind, expectedRequestId, rawEvidence, rawCurrentConfiguration, rawExpectedOwnerParticipant, now, maximumAgeMs = 60_000) {
    if (!isAgentChannelHistoryVerificationCurrent(rawHistory, rawBinding, rawKind, expectedRequestId, now, maximumAgeMs))
        return false; // guard:trip-history
    const evidence = exports.AgentChannelHistoryRoundTripEvidenceSchema.safeParse(rawEvidence);
    const current = agent_channel_configuration_js_1.AgentChannelConfigurationSchema.safeParse(rawCurrentConfiguration);
    const history = exports.AgentChannelHistoryResponseSchema.safeParse(rawHistory);
    if (!evidence.success || !current.success || !history.success || history.data.status !== 'available')
        return false; // guard:trip-parse
    const ownerParticipant = exports.AgentChannelHistoryOwnerParticipantSchema.safeParse(rawExpectedOwnerParticipant);
    if (!ownerParticipant.success || ownerParticipant.data.kind !== rawKind || JSON.stringify(evidence.data.participant) !== JSON.stringify(ownerParticipant.data))
        return false; // guard:trip-participant
    const proof = evidence.data, frozen = proof.configuration, actual = current.data;
    const binding = bindingOf(history.data);
    if (frozen.kind !== rawKind || actual.kind !== rawKind)
        return false; // guard:trip-kind
    if (!(0, agent_channel_access_js_1.sameAgentChannelAccessBinding)(bindingOf(frozen), binding) || !(0, agent_channel_access_js_1.sameAgentChannelAccessBinding)(bindingOf(actual), binding))
        return false; // guard:trip-binding
    if (proof.owner.ownerId !== binding.scope.ownerId || proof.owner.tenantId !== binding.scope.tenantId)
        return false; // guard:trip-owner
    if (proof.requestId !== expectedRequestId || proof.entryId !== history.data.lastVerification.entryId)
        return false; // guard:trip-operation
    const verificationEntryId = history.data.lastVerification.entryId;
    const entry = history.data.entries.find(value => value.entryId === verificationEntryId);
    if (entry.direction !== 'inbound')
        return false; // guard:trip-inbound
    const requested = Date.parse(proof.requestedAt), received = Date.parse(proof.receivedAt), turn = Date.parse(proof.turnCompletedAt), delivered = Date.parse(proof.replyDeliveredAt);
    if (requested > received || received > turn || turn > delivered || proof.receivedAt !== entry.startedAt || proof.replyDeliveredAt !== entry.endedAt)
        return false; // guard:trip-stages
    for (const [config, at] of [[frozen, requested], [actual, now]]) {
        if (config.applied?.state !== 'active' || config.desired.state !== 'active' || config.applied.version !== config.desired.version
            || config.resource === null || config.access?.appliedPolicy == null || config.error !== null)
            return false; // guard:trip-applied
        if (config.observation?.state !== 'loaded' || config.observation.loaded !== true || config.observation.readiness !== 'ready' || config.observedAt === null)
            return false; // guard:trip-loaded
        const age = at - Date.parse(config.observedAt);
        if (age < 0 || age >= maximumAgeMs)
            return false; // guard:trip-fresh
    }
    const facts = (config) => ({ scope: config.scope, identity: config.identity, kind: config.kind, applied: config.applied,
        resource: config.resource, policy: config.access.appliedPolicy, channelId: config.observation.channelId });
    return JSON.stringify(facts(frozen)) === JSON.stringify(facts(actual)); // guard:trip-generation
}
//# sourceMappingURL=agent-channel-history.js.map