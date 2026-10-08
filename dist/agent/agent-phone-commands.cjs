"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentPhoneRouteResultSchema = exports.AgentPhoneRoutingInventorySchema = exports.AgentPhoneInboundRouteEventSchema = exports.AgentPhoneApplyResultSchema = exports.AgentPhoneApplyCommandSchema = exports.AgentPhoneSnapshotSchema = void 0;
exports.isAgentPhoneSnapshotCurrent = isAgentPhoneSnapshotCurrent;
exports.isAgentPhoneApplyReady = isAgentPhoneApplyReady;
exports.isAgentPhoneResultForCommand = isAgentPhoneResultForCommand;
exports.resolveAgentPhoneRoute = resolveAgentPhoneRoute;
exports.isAgentPhoneRouteResultForEvent = isAgentPhoneRouteResultForEvent;
const zod_1 = require("zod");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const index_js_1 = require("../capability/voice-live/index.cjs");
const agent_channel_access_requests_js_1 = require("./agent-channel-access-requests.cjs");
const agent_channel_access_js_1 = require("./agent-channel-access.cjs");
const agent_phone_channel_js_1 = require("./agent-phone-channel.cjs");
const agent_runtime_state_js_1 = require("./agent-runtime-state.cjs");
const agent_runtime_source_js_1 = require("./agent-runtime-source.cjs");
const time = zod_1.z.iso.datetime({ offset: true });
const bindingOf = (value) => ({ scope: value.scope, identity: value.identity });
function currentDate(value, now, maximumAgeMs) {
    const age = now - Date.parse(value);
    return Number.isFinite(now) && Number.isFinite(maximumAgeMs) && age >= 0 && age <= maximumAgeMs;
}
/** Server-resolved state, not browser authority. Archived status comes from the owning agent record. */
exports.AgentPhoneSnapshotSchema = zod_1.z.object({
    configuration: agent_phone_channel_js_1.AgentPhoneChannelConfigurationSchema, observedAt: time,
    agentArchived: zod_1.z.boolean(), runtimeLoadState: agent_runtime_state_js_1.AgentRuntimeLoadStateSchema,
}).strict().superRefine((snapshot, ctx) => {
    const config = snapshot.configuration;
    const observations = [config.sharedNumber.observedAt, config.attestation?.observedAt];
    if (observations.some(value => value != null && Date.parse(value) > Date.parse(snapshot.observedAt)))
        ctx.addIssue({ code: 'custom', path: ['observedAt'], message: 'Snapshot cannot predate its evidence' }); // guard:snapshot-time
});
/** Phone has no Telegram request queue. Reuse C1 CAS/action/requestId and reject all request changes. */
exports.AgentPhoneApplyCommandSchema = agent_channel_access_requests_js_1.AgentChannelAccessApplyCommandSchema.safeExtend({
    requestChanges: zod_1.z.null(), expectedNumberVersion: agent_config_js_1.AgentConfigVersionSchema.nullable(),
    expectedRoutingIdentity: agent_phone_channel_js_1.AgentPhoneRoutingBindingSchema.shape.routingIdentity.nullable(),
}).strict();
function isAgentPhoneSnapshotCurrent(rawSnapshot, rawBinding, now, maximumAgeMs = 60_000) {
    const snapshot = exports.AgentPhoneSnapshotSchema.safeParse(rawSnapshot);
    if (!snapshot.success)
        return false;
    if (!(0, agent_channel_access_js_1.sameAgentChannelAccessBinding)(bindingOf(snapshot.data.configuration), rawBinding))
        return false; // guard:snapshot-binding
    return currentDate(snapshot.data.observedAt, now, maximumAgeMs);
}
/** Pure pre-effect CAS check. The producer must authenticate, resolve scope, and recheck after every await. */
function isAgentPhoneApplyReady(rawCommand, rawSnapshot, rawBinding, now, maximumAgeMs = 60_000) {
    const command = exports.AgentPhoneApplyCommandSchema.safeParse(rawCommand), snapshot = exports.AgentPhoneSnapshotSchema.safeParse(rawSnapshot);
    if (!command.success || !snapshot.success)
        return false;
    if (!isAgentPhoneSnapshotCurrent(snapshot.data, rawBinding, now, maximumAgeMs))
        return false; // guard:apply-current
    const intent = command.data, current = snapshot.data, config = current.configuration;
    if (current.agentArchived)
        return false; // guard:apply-archived
    if (intent.desiredVersion !== config.desired.version || intent.expectedAppliedVersion !== (config.applied?.version ?? null))
        return false; // guard:apply-versions
    if (intent.expectedNumberVersion !== config.sharedNumber.version || intent.expectedRoutingIdentity !== (config.routing?.routingIdentity ?? null))
        return false; // guard:apply-routing-cas
    if (config.desired.state === 'paused')
        return true; // guard:pause-independent
    if (current.runtimeLoadState !== 'loaded')
        return false; // guard:apply-runtime
    if (config.routing === null || config.sharedNumber.status !== 'available')
        return false; // guard:apply-resource
    if (!currentDate(config.sharedNumber.observedAt ?? '', now, maximumAgeMs))
        return false; // guard:apply-number-time
    return true;
}
/** C1 outcome vocabulary and sanitized errors, with phone-specific snapshot correlation. */
exports.AgentPhoneApplyResultSchema = agent_channel_access_js_1.AgentChannelAccessBindingSchema.safeExtend({
    ...exports.AgentPhoneApplyCommandSchema.shape, kind: zod_1.z.literal('phone'),
    replayed: agent_channel_access_requests_js_1.AgentChannelAccessApplyResultSchema.shape.replayed,
    outcome: agent_channel_access_requests_js_1.AgentChannelAccessApplyResultSchema.shape.outcome, completedAt: time,
    snapshot: exports.AgentPhoneSnapshotSchema, error: agent_channel_access_requests_js_1.AgentChannelAccessApplyResultSchema.shape.error,
}).strict().superRefine((result, ctx) => {
    const config = result.snapshot.configuration;
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (!(0, agent_channel_access_js_1.sameAgentChannelAccessBinding)(bindingOf(result), bindingOf(config)))
        issue('snapshot', 'Receipt belongs to another agent'); // guard:receipt-binding
    if (result.desiredVersion !== config.desired.version)
        issue('desiredVersion', 'Receipt must match the saved phone version'); // guard:receipt-desired
    if (result.expectedAppliedVersion !== null && result.expectedAppliedVersion > result.desiredVersion)
        issue('expectedAppliedVersion', 'Previous applied version cannot exceed desired'); // guard:receipt-order
    if (Date.parse(result.completedAt) < Date.parse(result.snapshot.observedAt))
        issue('completedAt', 'Receipt cannot predate its snapshot'); // guard:receipt-time
    if (result.outcome === 'failed' && result.error === null)
        issue('error', 'Failure requires a fixed error code'); // guard:receipt-failure
    if (result.outcome === 'applied' && (result.error !== null || !(0, agent_phone_channel_js_1.isPhoneChannelConfigurationApplied)(config, Date.parse(result.completedAt))))
        issue('outcome', 'Applied requires current actual phone evidence without error'); // guard:receipt-applied
    if (result.outcome === 'applied' && config.desired.state === 'active' && (result.snapshot.agentArchived || result.snapshot.runtimeLoadState !== 'loaded'))
        issue('snapshot', 'An archived or stopped agent cannot expose an active applied phone'); // guard:receipt-agent
    if (result.outcome === 'applied' && config.desired.state === 'active' && (result.expectedNumberVersion !== config.sharedNumber.version || result.expectedRoutingIdentity !== (config.routing?.routingIdentity ?? null)))
        issue('snapshot', 'Active receipt must match the expected line and routing generation'); // guard:receipt-routing
});
/** Full correlation is separate from durable idempotency, which remains the producer's responsibility. */
function isAgentPhoneResultForCommand(rawCommand, rawResult, rawBinding, now, maximumAgeMs = 60_000) {
    const command = exports.AgentPhoneApplyCommandSchema.safeParse(rawCommand), result = exports.AgentPhoneApplyResultSchema.safeParse(rawResult);
    if (!command.success || !result.success)
        return false;
    const intent = command.data, actual = result.data;
    if (!isAgentPhoneSnapshotCurrent(actual.snapshot, rawBinding, now, maximumAgeMs))
        return false; // guard:result-current
    if (!currentDate(actual.completedAt, now, maximumAgeMs))
        return false; // guard:result-time
    if (actual.requestId !== intent.requestId || actual.desiredVersion !== intent.desiredVersion || actual.expectedAppliedVersion !== intent.expectedAppliedVersion)
        return false; // guard:result-command
    if (actual.expectedNumberVersion !== intent.expectedNumberVersion || actual.expectedRoutingIdentity !== intent.expectedRoutingIdentity)
        return false; // guard:result-routing
    return true;
}
/** Payload from an already verified provider event; this schema never verifies a signature or grants admission. */
exports.AgentPhoneInboundRouteEventSchema = zod_1.z.object({
    callId: index_js_1.VoiceLiveCallStartRequestSchema.shape.call_id,
    toNumber: index_js_1.VoiceLiveCallStartRequestSchema.shape.to_number,
    fromNumber: index_js_1.VoiceLiveCallStartRequestSchema.shape.to_number.nullable(),
    routingIdentity: agent_phone_channel_js_1.AgentPhoneRoutingBindingSchema.shape.routingIdentity, receivedAt: time,
}).strict();
/** Completeness is authoritative for ambiguity detection; a partial inventory cannot prove a unique route. */
exports.AgentPhoneRoutingInventorySchema = zod_1.z.object({
    source: agent_runtime_source_js_1.AgentRuntimeSourceSchema.strict(), snapshots: zod_1.z.array(exports.AgentPhoneSnapshotSchema).max(2048),
}).strict().superRefine((inventory, ctx) => {
    if (inventory.source.observedAt !== null && inventory.snapshots.some(snapshot => Date.parse(snapshot.observedAt) > Date.parse(inventory.source.observedAt)))
        ctx.addIssue({ code: 'custom', path: ['source'], message: 'Inventory cannot predate a route snapshot' }); // guard:inventory-time
});
/** Resolves one current active door only. Rubrica/voice/provider authentication still gate effects after resolution. */
function resolveAgentPhoneRoute(rawEvent, rawInventory, now, maximumAgeMs = 60_000) {
    const event = exports.AgentPhoneInboundRouteEventSchema.safeParse(rawEvent), inventory = exports.AgentPhoneRoutingInventorySchema.safeParse(rawInventory);
    if (!event.success || !inventory.success)
        return null;
    const source = inventory.data.source;
    if (source.availability !== 'available' || source.completeness !== 'complete')
        return null; // guard:route-source
    if (!currentDate(event.data.receivedAt, now, maximumAgeMs) || !currentDate(source.observedAt ?? '', now, maximumAgeMs))
        return null; // guard:route-times
    const matches = inventory.data.snapshots.filter(snapshot => snapshot.configuration.routing?.routingIdentity === event.data.routingIdentity && snapshot.configuration.routing.number === event.data.toNumber);
    if (matches.length !== 1)
        return null; // guard:route-unique
    const selected = matches[0];
    if (selected.agentArchived || selected.runtimeLoadState !== 'loaded')
        return null; // guard:route-agent
    if (selected.configuration.desired.state !== 'active')
        return null; // guard:route-active
    if (!(0, agent_phone_channel_js_1.isPhoneChannelConfigurationApplied)(selected.configuration, now, maximumAgeMs))
        return null; // guard:route-applied
    return selected;
}
/** Correlated routing observation, including an explicit unresolved result. Never a caller admission receipt. */
exports.AgentPhoneRouteResultSchema = zod_1.z.object({
    event: exports.AgentPhoneInboundRouteEventSchema, snapshot: exports.AgentPhoneSnapshotSchema.nullable(), resolvedAt: time,
}).strict().superRefine((result, ctx) => {
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (Date.parse(result.resolvedAt) < Date.parse(result.event.receivedAt))
        issue('resolvedAt', 'Route result cannot predate its event'); // guard:route-result-event-time
    if (result.snapshot === null)
        return;
    const config = result.snapshot.configuration;
    if (Date.parse(result.resolvedAt) < Date.parse(result.snapshot.observedAt))
        issue('resolvedAt', 'Route result cannot predate its snapshot'); // guard:route-result-snapshot-time
    if (config.routing?.routingIdentity !== result.event.routingIdentity || config.routing.number !== result.event.toNumber)
        issue('snapshot', 'Selected route must match the exact selector and shared number'); // guard:route-result-selection
    if (result.snapshot.agentArchived || result.snapshot.runtimeLoadState !== 'loaded')
        issue('snapshot', 'Selected agent must be current and loaded'); // guard:route-result-agent
    if (config.desired.state !== 'active' || !(0, agent_phone_channel_js_1.isPhoneChannelConfigurationApplied)(config, Date.parse(result.resolvedAt)))
        issue('snapshot', 'Selection requires an active applied door with current evidence'); // guard:route-result-active
});
function isAgentPhoneRouteResultForEvent(rawEvent, rawResult, now, maximumAgeMs = 60_000) {
    const event = exports.AgentPhoneInboundRouteEventSchema.safeParse(rawEvent), result = exports.AgentPhoneRouteResultSchema.safeParse(rawResult);
    if (!event.success || !result.success)
        return false;
    if (JSON.stringify(event.data) !== JSON.stringify(result.data.event))
        return false; // guard:route-result-correlation
    if (!currentDate(result.data.resolvedAt, now, maximumAgeMs))
        return false; // guard:route-result-current
    if (!currentDate(result.data.event.receivedAt, now, maximumAgeMs))
        return false; // guard:route-result-event-current
    return true;
}
//# sourceMappingURL=agent-phone-commands.js.map