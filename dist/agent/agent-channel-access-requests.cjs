"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentChannelAccessApplyResultSchema = exports.AgentChannelAccessRequestResultSchema = exports.AgentChannelAccessSnapshotSchema = exports.AgentChannelAccessRequestSourceSchema = exports.AgentChannelAccessApplyCommandSchema = exports.AgentChannelAccessRequestChangesSchema = exports.AgentChannelAccessRequestOperationSchema = exports.AgentChannelAccessErrorResponseSchema = exports.AgentChannelAccessErrorCodeSchema = exports.AgentTelegramAccessRequestQueueSchema = exports.AgentTelegramAccessRequestSchema = void 0;
exports.isAgentChannelAccessSnapshotCurrent = isAgentChannelAccessSnapshotCurrent;
exports.isAgentChannelAccessApplyReady = isAgentChannelAccessApplyReady;
exports.isAgentChannelAccessResultForCommand = isAgentChannelAccessResultForCommand;
const zod_1 = require("zod");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const agent_management_js_1 = require("./agent-management.cjs");
const agent_channel_configuration_js_1 = require("./agent-channel-configuration.cjs");
const agent_channel_attestation_js_1 = require("./agent-channel-attestation.cjs");
const agent_channel_access_js_1 = require("./agent-channel-access.cjs");
const time = zod_1.z.iso.datetime({ offset: true });
const bindingOf = (value) => ({ scope: value.scope, identity: value.identity });
/** Only authenticated Telegram update metadata, never ordinary message contents or an automatic permission. */
exports.AgentTelegramAccessRequestSchema = zod_1.z.object({
    requestId: agent_management_js_1.AgentManagementRequestIdSchema, chatId: agent_channel_access_js_1.AgentTelegramAdmittedChatSchema.shape.chatId,
    type: agent_channel_access_js_1.AgentTelegramAdmittedChatSchema.shape.type, name: agent_channel_access_js_1.AgentTelegramAdmittedChatSchema.shape.name,
    requestedAt: time, updateId: zod_1.z.number().int().nonnegative(),
}).strict().refine(request => (request.type === 'private') === !request.chatId.startsWith('-'), { message: 'Request chat identity must retain its private/group sign' });
exports.AgentTelegramAccessRequestQueueSchema = agent_channel_access_js_1.AgentChannelAccessBindingSchema.safeExtend({
    kind: zod_1.z.literal('telegram'), version: agent_config_js_1.AgentConfigVersionSchema, observedAt: time,
    requests: zod_1.z.array(exports.AgentTelegramAccessRequestSchema).max(512),
}).superRefine((queue, ctx) => {
    for (const field of ['requestId', 'chatId', 'updateId']) {
        if (new Set(queue.requests.map(request => request[field])).size !== queue.requests.length) {
            ctx.addIssue({ code: 'custom', path: ['requests'], message: 'Pending requests require unique ids, chats and updates' });
        }
    }
    if (queue.requests.some(request => Date.parse(request.requestedAt) > Date.parse(queue.observedAt))) {
        ctx.addIssue({ code: 'custom', path: ['observedAt'], message: 'A queue cannot observe a future request' });
    }
});
exports.AgentChannelAccessErrorCodeSchema = zod_1.z.enum([
    'invalid_request', 'agent_not_found', 'identity_mismatch', 'stale_version', 'request_not_found',
    'idempotency_conflict', 'command_in_progress', 'source_unavailable', 'address_book_unavailable',
    'queue_limit', 'not_supported', 'load_failed', 'apply_failed', 'reconcile_pending',
]);
exports.AgentChannelAccessErrorResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false), error: exports.AgentChannelAccessErrorCodeSchema, currentVersion: agent_config_js_1.AgentConfigVersionSchema.nullable().optional(),
}).strict().refine(result => (result.error === 'stale_version') === (result.currentVersion !== undefined), { message: 'Current version is present exactly for stale_version' });
exports.AgentChannelAccessRequestOperationSchema = zod_1.z.object({
    requestId: agent_management_js_1.AgentManagementRequestIdSchema, action: zod_1.z.enum(['admit', 'ignore']),
}).strict();
/** Operations are staged until the saved door policy is explicitly applied; cancellation submits no command. */
exports.AgentChannelAccessRequestChangesSchema = zod_1.z.object({
    expectedQueueVersion: agent_config_js_1.AgentConfigVersionSchema,
    operations: zod_1.z.array(exports.AgentChannelAccessRequestOperationSchema).min(1).max(512)
        .refine(operations => new Set(operations.map(operation => operation.requestId)).size === operations.length, { message: 'One operation for each pending request' }),
}).strict();
exports.AgentChannelAccessApplyCommandSchema = zod_1.z.object({
    action: zod_1.z.literal('apply-channel'), requestId: agent_management_js_1.AgentManagementRequestIdSchema,
    desiredVersion: agent_config_js_1.AgentConfigVersionSchema, expectedAppliedVersion: agent_config_js_1.AgentConfigVersionSchema.nullable(),
    requestChanges: exports.AgentChannelAccessRequestChangesSchema.nullable(),
}).strict().refine(command => command.expectedAppliedVersion === null || command.desiredVersion >= command.expectedAppliedVersion, { message: 'Desired door version cannot be older than the expected applied version' });
/** Unavailable never means an empty queue; email has no Telegram start-request producer. */
exports.AgentChannelAccessRequestSourceSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.object({ status: zod_1.z.literal('available'), queue: exports.AgentTelegramAccessRequestQueueSchema }).strict(),
    zod_1.z.object({ status: zod_1.z.literal('unavailable'), error: exports.AgentChannelAccessErrorCodeSchema }).strict(),
    zod_1.z.object({ status: zod_1.z.literal('not-applicable') }).strict(),
]);
/** Composes existing config/attestation contracts: it neither changes legacy attestation nor copies saved into applied. */
exports.AgentChannelAccessSnapshotSchema = zod_1.z.object({
    configuration: agent_channel_configuration_js_1.AgentChannelConfigurationSchema, observedAt: time,
    requests: exports.AgentChannelAccessRequestSourceSchema, attestation: agent_channel_attestation_js_1.AgentChannelAttestationSchema.nullable(),
}).strict().superRefine((snapshot, ctx) => {
    const config = snapshot.configuration;
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });
    if ((config.kind === 'email') !== (snapshot.requests.status === 'not-applicable'))
        issue('requests', 'Request producer belongs to another door');
    if (snapshot.requests.status === 'available') {
        if (!(0, agent_channel_access_js_1.sameAgentChannelAccessBinding)(bindingOf(snapshot.requests.queue), bindingOf(config)))
            issue('requests', 'Request queue belongs to another agent');
        if (Date.parse(snapshot.requests.queue.observedAt) > Date.parse(snapshot.observedAt))
            issue('observedAt', 'Snapshot predates its queue observation');
    }
    if (config.observedAt !== null && Date.parse(config.observedAt) > Date.parse(snapshot.observedAt))
        issue('observedAt', 'Snapshot predates its channel observation');
    const actual = snapshot.attestation;
    if (config.kind === 'email' && config.observation !== null && actual === null)
        issue('attestation', 'Observed email requires its producer attestation');
    if (actual !== null) {
        if (!(0, agent_channel_access_js_1.sameAgentChannelAccessBinding)(bindingOf(actual), bindingOf(config)) || actual.channel.kind !== config.kind)
            issue('attestation', 'Attestation belongs to another agent or door');
        if (JSON.stringify(actual.applied) !== JSON.stringify(config.applied))
            issue('attestation', 'Attested applied version/state differs from configuration evidence');
        if (config.observation !== null && (JSON.stringify(actual.channel) !== JSON.stringify(config.observation)
            || actual.observedAt !== config.observedAt || JSON.stringify(actual.error) !== JSON.stringify(config.error)))
            issue('attestation', 'Attestation differs from the actual dated channel evidence');
        if (Date.parse(actual.observedAt) > Date.parse(snapshot.observedAt))
            issue('observedAt', 'Snapshot predates its producer observation');
    }
});
/** Current explicit policy evidence, independent of provider readiness or a successful end-to-end user message. */
function isAgentChannelAccessSnapshotCurrent(rawSnapshot, rawBinding, rawKind, now, maximumAgeMs = 60_000) {
    const snapshot = exports.AgentChannelAccessSnapshotSchema.safeParse(rawSnapshot), kind = agent_channel_configuration_js_1.AgentBirthChannelKindSchema.safeParse(rawKind);
    if (!snapshot.success || !kind.success || !Number.isFinite(maximumAgeMs))
        return false;
    const config = snapshot.data.configuration;
    if (config.kind !== kind.data || !(0, agent_channel_access_js_1.sameAgentChannelAccessBinding)(bindingOf(config), rawBinding)
        || config.access === undefined || !(0, agent_channel_configuration_js_1.isChannelConfigurationApplied)(config))
        return false;
    const age = now - Date.parse(config.observedAt ?? '');
    return age >= 0 && age <= maximumAgeMs;
}
/** Runs against a fresh, authorized saved/effective snapshot BEFORE runtime effects; auth is the producer's duty. */
function isAgentChannelAccessApplyReady(rawCommand, rawSnapshot) {
    const command = exports.AgentChannelAccessApplyCommandSchema.safeParse(rawCommand), snapshot = exports.AgentChannelAccessSnapshotSchema.safeParse(rawSnapshot);
    if (!command.success || !snapshot.success)
        return false;
    const intent = command.data, current = snapshot.data, config = current.configuration;
    if (intent.desiredVersion !== config.desired.version || intent.expectedAppliedVersion !== (config.applied?.version ?? null))
        return false;
    const changes = intent.requestChanges;
    if (changes === null)
        return true;
    if (current.requests.status !== 'available' || current.requests.queue.version !== changes.expectedQueueVersion)
        return false;
    const queue = current.requests.queue;
    return changes.operations.every(operation => {
        const request = queue.requests.find(entry => entry.requestId === operation.requestId);
        if (!request)
            return false;
        if (operation.action === 'ignore')
            return true;
        const policy = config.access?.desiredPolicy;
        return policy?.kind === 'telegram' && policy.chats.some(chat => chat.chatId === request.chatId && chat.type === request.type);
    });
}
const OutcomeSchema = zod_1.z.enum(['applied', 'pending', 'failed']);
exports.AgentChannelAccessRequestResultSchema = exports.AgentChannelAccessRequestOperationSchema.extend({ state: OutcomeSchema });
exports.AgentChannelAccessApplyResultSchema = agent_channel_access_js_1.AgentChannelAccessBindingSchema.safeExtend({
    kind: agent_channel_configuration_js_1.AgentBirthChannelKindSchema, action: zod_1.z.literal('apply-channel'), requestId: agent_management_js_1.AgentManagementRequestIdSchema,
    desiredVersion: agent_config_js_1.AgentConfigVersionSchema, expectedAppliedVersion: agent_config_js_1.AgentConfigVersionSchema.nullable(),
    requestChanges: exports.AgentChannelAccessRequestChangesSchema.nullable(), replayed: zod_1.z.boolean(), outcome: OutcomeSchema,
    completedAt: time, snapshot: exports.AgentChannelAccessSnapshotSchema,
    requestResults: zod_1.z.array(exports.AgentChannelAccessRequestResultSchema), error: exports.AgentChannelAccessErrorCodeSchema.nullable(),
}).superRefine((result, ctx) => {
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });
    const config = result.snapshot.configuration, changes = result.requestChanges;
    if (!(0, agent_channel_access_js_1.sameAgentChannelAccessBinding)(bindingOf(result), bindingOf(config)) || result.kind !== config.kind)
        issue('snapshot', 'Receipt belongs to another agent or door');
    if (result.desiredVersion !== config.desired.version)
        issue('desiredVersion', 'Receipt differs from saved desired version');
    if (result.expectedAppliedVersion !== null && result.expectedAppliedVersion > result.desiredVersion)
        issue('expectedAppliedVersion', 'Receipt describes an impossible previous version');
    if (Date.parse(result.completedAt) < Date.parse(result.snapshot.observedAt))
        issue('completedAt', 'Receipt predates its observation');
    if (result.outcome === 'applied' && (!(0, agent_channel_configuration_js_1.isChannelConfigurationApplied)(config) || config.access === undefined || result.error !== null))
        issue('outcome', 'Applied receipt requires actual explicit policy evidence and no error');
    if (result.outcome === 'failed' && result.error === null)
        issue('error', 'Failure requires a fixed error code');
    if (changes !== null && result.kind !== 'telegram')
        issue('requestChanges', 'Only Telegram has start requests');
    const operations = changes?.operations ?? [];
    if (new Set(result.requestResults.map(item => item.requestId)).size !== result.requestResults.length
        || result.requestResults.length !== operations.length
        || result.requestResults.some(item => !operations.some(operation => operation.requestId === item.requestId && operation.action === item.action)))
        issue('requestResults', 'Receipt must describe exactly the requested operations');
    if (result.outcome === 'applied' && result.requestResults.some(item => item.state !== 'applied'))
        issue('requestResults', 'Global applied cannot hide a pending or failed request operation');
    if (result.requestResults.some(item => item.state === 'failed') && result.outcome !== 'failed')
        issue('outcome', 'A failed request operation cannot be hidden');
    if (result.outcome === 'applied' && changes !== null) {
        const source = result.snapshot.requests;
        if (source.status !== 'available' || source.queue.version <= changes.expectedQueueVersion
            || source.queue.requests.some(request => operations.some(operation => operation.requestId === request.requestId)))
            issue('requests', 'Applied operations require an advanced queue without the processed requests');
    }
});
/** Complete command correlation after authenticated producer resolution; replay does not authorize another agent. */
function isAgentChannelAccessResultForCommand(rawCommand, rawResult, rawBinding, rawKind) {
    const command = exports.AgentChannelAccessApplyCommandSchema.safeParse(rawCommand), result = exports.AgentChannelAccessApplyResultSchema.safeParse(rawResult);
    const kind = agent_channel_configuration_js_1.AgentBirthChannelKindSchema.safeParse(rawKind);
    if (!command.success || !result.success || !kind.success)
        return false;
    const intent = command.data, actual = result.data;
    if (!(0, agent_channel_access_js_1.sameAgentChannelAccessBinding)(bindingOf(actual), rawBinding) || actual.kind !== kind.data
        || actual.requestId !== intent.requestId || actual.desiredVersion !== intent.desiredVersion
        || actual.expectedAppliedVersion !== intent.expectedAppliedVersion)
        return false;
    const wantedChanges = intent.requestChanges, actualChanges = actual.requestChanges;
    if (wantedChanges === null || actualChanges === null)
        return wantedChanges === actualChanges;
    return wantedChanges.expectedQueueVersion === actualChanges.expectedQueueVersion
        && wantedChanges.operations.length === actualChanges.operations.length
        && wantedChanges.operations.every(operation => actualChanges.operations.some(item => item.requestId === operation.requestId && item.action === operation.action));
}
//# sourceMappingURL=agent-channel-access-requests.js.map