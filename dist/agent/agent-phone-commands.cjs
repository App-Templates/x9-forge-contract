"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentPhoneRouteResultSchema = exports.AgentPhoneRuntimeRouteResultSchema = exports.AgentPhoneRoutingInventorySchema = exports.AgentPhoneRuntimeRoutingInventorySchema = exports.AgentPhoneInboundRouteEventSchema = exports.AgentPhoneApplyResultSchema = exports.AgentPhoneRuntimeApplyResultSchema = exports.AgentPhoneApplyCommandSchema = exports.AgentPhoneSnapshotSchema = exports.AgentPhoneRuntimeSnapshotSchema = void 0;
exports.isAgentPhoneRuntimeSnapshotCurrent = isAgentPhoneRuntimeSnapshotCurrent;
exports.isAgentPhoneSnapshotCurrent = isAgentPhoneSnapshotCurrent;
exports.isAgentPhoneRuntimeApplyReady = isAgentPhoneRuntimeApplyReady;
exports.isAgentPhoneApplyReady = isAgentPhoneApplyReady;
exports.isAgentPhoneRuntimeResultForCommand = isAgentPhoneRuntimeResultForCommand;
exports.isAgentPhoneResultForCommand = isAgentPhoneResultForCommand;
exports.resolveAgentPhoneRuntimeRoute = resolveAgentPhoneRuntimeRoute;
exports.resolveAgentPhoneRoute = resolveAgentPhoneRoute;
exports.isAgentPhoneRuntimeRouteResultForEvent = isAgentPhoneRuntimeRouteResultForEvent;
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
/** Runtime evidence only. X9 cannot assert the archival status owned by Forge. */
exports.AgentPhoneRuntimeSnapshotSchema = zod_1.z.object({
    configuration: agent_phone_channel_js_1.AgentPhoneChannelConfigurationSchema, observedAt: time,
    runtimeLoadState: agent_runtime_state_js_1.AgentRuntimeLoadStateSchema,
}).strict().superRefine((snapshot, ctx) => {
    const config = snapshot.configuration;
    const observations = [config.sharedNumber.observedAt, config.attestation?.observedAt];
    if (observations.some(value => value != null && Date.parse(value) > Date.parse(snapshot.observedAt)))
        ctx.addIssue({ code: 'custom', path: ['observedAt'], message: 'Snapshot cannot predate its evidence' }); // guard:snapshot-time
});
/** Public composition requires archival status from the owning agent record, never a default. */
exports.AgentPhoneSnapshotSchema = exports.AgentPhoneRuntimeSnapshotSchema.safeExtend({ agentArchived: zod_1.z.boolean() });
/** Phone has no Telegram request queue. Reuse C1 CAS/action/requestId and reject all request changes. */
exports.AgentPhoneApplyCommandSchema = agent_channel_access_requests_js_1.AgentChannelAccessApplyCommandSchema.safeExtend({
    requestChanges: zod_1.z.null(), expectedNumberVersion: agent_config_js_1.AgentConfigVersionSchema.nullable(),
    expectedRoutingIdentity: agent_phone_channel_js_1.AgentPhoneRoutingBindingSchema.shape.routingIdentity.nullable(),
}).strict();
function phoneSnapshotCurrent(snapshot, rawBinding, now, maximumAgeMs) {
    if (!(0, agent_channel_access_js_1.sameAgentChannelAccessBinding)(bindingOf(snapshot.configuration), rawBinding))
        return false; // guard:snapshot-binding
    return currentDate(snapshot.observedAt, now, maximumAgeMs);
}
function isAgentPhoneRuntimeSnapshotCurrent(rawSnapshot, rawBinding, now, maximumAgeMs = 60_000) {
    const snapshot = exports.AgentPhoneRuntimeSnapshotSchema.safeParse(rawSnapshot);
    return snapshot.success && phoneSnapshotCurrent(snapshot.data, rawBinding, now, maximumAgeMs);
}
function isAgentPhoneSnapshotCurrent(rawSnapshot, rawBinding, now, maximumAgeMs = 60_000) {
    const snapshot = exports.AgentPhoneSnapshotSchema.safeParse(rawSnapshot);
    return snapshot.success && phoneSnapshotCurrent(snapshot.data, rawBinding, now, maximumAgeMs);
}
/** Pure runtime CAS check, not caller admission. Authenticate and recheck authority after every await. */
function phoneApplyReady(rawCommand, current, rawBinding, now, maximumAgeMs) {
    const command = exports.AgentPhoneApplyCommandSchema.safeParse(rawCommand);
    if (!command.success || !phoneSnapshotCurrent(current, rawBinding, now, maximumAgeMs))
        return false; // guard:apply-current
    const intent = command.data, config = current.configuration;
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
    return currentDate(config.sharedNumber.observedAt ?? '', now, maximumAgeMs); // guard:apply-number-time
}
function isAgentPhoneRuntimeApplyReady(rawCommand, rawSnapshot, rawBinding, now, maximumAgeMs = 60_000) {
    const snapshot = exports.AgentPhoneRuntimeSnapshotSchema.safeParse(rawSnapshot);
    return snapshot.success && phoneApplyReady(rawCommand, snapshot.data, rawBinding, now, maximumAgeMs);
}
function isAgentPhoneApplyReady(rawCommand, rawSnapshot, rawBinding, now, maximumAgeMs = 60_000) {
    const snapshot = exports.AgentPhoneSnapshotSchema.safeParse(rawSnapshot);
    if (!snapshot.success || snapshot.data.agentArchived)
        return false; // guard:apply-archived
    return phoneApplyReady(rawCommand, snapshot.data, rawBinding, now, maximumAgeMs);
}
/** C1 outcome vocabulary and sanitized errors, with phone-specific snapshot correlation. */
exports.AgentPhoneRuntimeApplyResultSchema = agent_channel_access_js_1.AgentChannelAccessBindingSchema.safeExtend({
    ...exports.AgentPhoneApplyCommandSchema.shape, kind: zod_1.z.literal('phone'),
    replayed: agent_channel_access_requests_js_1.AgentChannelAccessApplyResultSchema.shape.replayed,
    outcome: agent_channel_access_requests_js_1.AgentChannelAccessApplyResultSchema.shape.outcome, completedAt: time,
    snapshot: exports.AgentPhoneRuntimeSnapshotSchema, error: agent_channel_access_requests_js_1.AgentChannelAccessApplyResultSchema.shape.error,
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
    if (result.outcome === 'applied' && config.desired.state === 'active' && (result.snapshot.runtimeLoadState !== 'loaded'))
        issue('snapshot', 'An archived or stopped agent cannot expose an active applied phone'); // guard:receipt-agent
    if (result.outcome === 'applied' && config.desired.state === 'active' && (result.expectedNumberVersion !== config.sharedNumber.version || result.expectedRoutingIdentity !== (config.routing?.routingIdentity ?? null)))
        issue('snapshot', 'Active receipt must match the expected line and routing generation'); // guard:receipt-routing
});
exports.AgentPhoneApplyResultSchema = exports.AgentPhoneRuntimeApplyResultSchema.safeExtend({ snapshot: exports.AgentPhoneSnapshotSchema }).superRefine((result, ctx) => {
    if (result.outcome === 'applied' && result.snapshot.configuration.desired.state === 'active' && result.snapshot.agentArchived) {
        ctx.addIssue({ code: 'custom', path: ['snapshot'], message: 'An archived agent cannot expose an active applied phone' }); // guard:receipt-archived
    }
});
/** Full correlation is separate from durable idempotency, which remains the producer's responsibility. */
function phoneResultForCommand(rawCommand, actual, rawBinding, now, maximumAgeMs) {
    const command = exports.AgentPhoneApplyCommandSchema.safeParse(rawCommand);
    if (!command.success)
        return false;
    const intent = command.data;
    if (!phoneSnapshotCurrent(actual.snapshot, rawBinding, now, maximumAgeMs))
        return false; // guard:result-current
    if (!currentDate(actual.completedAt, now, maximumAgeMs))
        return false; // guard:result-time
    if (actual.requestId !== intent.requestId || actual.desiredVersion !== intent.desiredVersion || actual.expectedAppliedVersion !== intent.expectedAppliedVersion)
        return false; // guard:result-command
    if (actual.expectedNumberVersion !== intent.expectedNumberVersion || actual.expectedRoutingIdentity !== intent.expectedRoutingIdentity)
        return false; // guard:result-routing
    return true;
}
function isAgentPhoneRuntimeResultForCommand(rawCommand, rawResult, rawBinding, now, maximumAgeMs = 60_000) {
    const result = exports.AgentPhoneRuntimeApplyResultSchema.safeParse(rawResult);
    return result.success && phoneResultForCommand(rawCommand, result.data, rawBinding, now, maximumAgeMs);
}
function isAgentPhoneResultForCommand(rawCommand, rawResult, rawBinding, now, maximumAgeMs = 60_000) {
    const result = exports.AgentPhoneApplyResultSchema.safeParse(rawResult);
    return result.success && phoneResultForCommand(rawCommand, result.data, rawBinding, now, maximumAgeMs);
}
/** Payload from an already verified provider event; this schema never verifies a signature or grants admission. */
exports.AgentPhoneInboundRouteEventSchema = zod_1.z.object({
    callId: index_js_1.VoiceLiveCallStartRequestSchema.shape.call_id,
    toNumber: index_js_1.VoiceLiveCallStartRequestSchema.shape.to_number,
    fromNumber: index_js_1.VoiceLiveCallStartRequestSchema.shape.to_number.nullable(),
    routingIdentity: agent_phone_channel_js_1.AgentPhoneRoutingBindingSchema.shape.routingIdentity, receivedAt: time,
}).strict();
/** Completeness is authoritative for ambiguity detection; a partial inventory cannot prove a unique route. */
exports.AgentPhoneRuntimeRoutingInventorySchema = zod_1.z.object({
    source: agent_runtime_source_js_1.AgentRuntimeSourceSchema.strict(), snapshots: zod_1.z.array(exports.AgentPhoneRuntimeSnapshotSchema).max(2048),
}).strict().superRefine((inventory, ctx) => {
    if (inventory.source.observedAt !== null && inventory.snapshots.some(snapshot => Date.parse(snapshot.observedAt) > Date.parse(inventory.source.observedAt)))
        ctx.addIssue({ code: 'custom', path: ['source'], message: 'Inventory cannot predate a route snapshot' }); // guard:inventory-time
});
exports.AgentPhoneRoutingInventorySchema = exports.AgentPhoneRuntimeRoutingInventorySchema.safeExtend({ snapshots: zod_1.z.array(exports.AgentPhoneSnapshotSchema).max(2048) });
/** Resolves one current active door only. Rubrica/voice/provider authentication still gate effects after resolution. */
function selectPhoneRoute(rawEvent, inventory, now, maximumAgeMs) {
    const event = exports.AgentPhoneInboundRouteEventSchema.safeParse(rawEvent);
    if (!event.success)
        return null;
    const source = inventory.source;
    if (source.availability !== 'available' || source.completeness !== 'complete')
        return null; // guard:route-source
    if (!currentDate(event.data.receivedAt, now, maximumAgeMs) || !currentDate(source.observedAt ?? '', now, maximumAgeMs))
        return null; // guard:route-times
    const matches = inventory.snapshots.filter(snapshot => snapshot.configuration.routing?.routingIdentity === event.data.routingIdentity && snapshot.configuration.routing.number === event.data.toNumber);
    if (matches.length !== 1)
        return null; // guard:route-unique
    const selected = matches[0];
    if (selected.runtimeLoadState !== 'loaded')
        return null; // guard:route-agent
    if (selected.configuration.desired.state !== 'active')
        return null; // guard:route-active
    if (!(0, agent_phone_channel_js_1.isPhoneChannelConfigurationApplied)(selected.configuration, now, maximumAgeMs))
        return null; // guard:route-applied
    return selected;
}
/** A runtime candidate is not admission: Forge archival, Rubrica and caller authority still gate effects. */
function resolveAgentPhoneRuntimeRoute(rawEvent, rawInventory, now, maximumAgeMs = 60_000) {
    const inventory = exports.AgentPhoneRuntimeRoutingInventorySchema.safeParse(rawInventory);
    return inventory.success ? selectPhoneRoute(rawEvent, inventory.data, now, maximumAgeMs) : null;
}
function resolveAgentPhoneRoute(rawEvent, rawInventory, now, maximumAgeMs = 60_000) {
    const inventory = exports.AgentPhoneRoutingInventorySchema.safeParse(rawInventory);
    if (!inventory.success)
        return null;
    const selected = selectPhoneRoute(rawEvent, inventory.data, now, maximumAgeMs);
    return selected && !selected.agentArchived ? selected : null; // guard:route-archived
}
/** Correlated routing observation, including an explicit unresolved result. Never a caller admission receipt. */
exports.AgentPhoneRuntimeRouteResultSchema = zod_1.z.object({
    event: exports.AgentPhoneInboundRouteEventSchema, snapshot: exports.AgentPhoneRuntimeSnapshotSchema.nullable(), resolvedAt: time,
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
    if (result.snapshot.runtimeLoadState !== 'loaded')
        issue('snapshot', 'Selected agent must be current and loaded'); // guard:route-result-agent
    if (config.desired.state !== 'active' || !(0, agent_phone_channel_js_1.isPhoneChannelConfigurationApplied)(config, Date.parse(result.resolvedAt)))
        issue('snapshot', 'Selection requires an active applied door with current evidence'); // guard:route-result-active
});
exports.AgentPhoneRouteResultSchema = exports.AgentPhoneRuntimeRouteResultSchema.safeExtend({ snapshot: exports.AgentPhoneSnapshotSchema.nullable() }).superRefine((result, ctx) => {
    if (result.snapshot?.agentArchived)
        ctx.addIssue({ code: 'custom', path: ['snapshot'], message: 'Selected agent must not be archived' }); // guard:route-result-archived
});
function phoneRouteResultForEvent(rawEvent, result, now, maximumAgeMs) {
    const event = exports.AgentPhoneInboundRouteEventSchema.safeParse(rawEvent);
    if (!event.success)
        return false;
    if (JSON.stringify(event.data) !== JSON.stringify(result.event))
        return false; // guard:route-result-correlation
    if (!currentDate(result.resolvedAt, now, maximumAgeMs))
        return false; // guard:route-result-current
    return currentDate(result.event.receivedAt, now, maximumAgeMs); // guard:route-result-event-current
}
function isAgentPhoneRuntimeRouteResultForEvent(rawEvent, rawResult, now, maximumAgeMs = 60_000) {
    const result = exports.AgentPhoneRuntimeRouteResultSchema.safeParse(rawResult);
    return result.success && phoneRouteResultForEvent(rawEvent, result.data, now, maximumAgeMs);
}
function isAgentPhoneRouteResultForEvent(rawEvent, rawResult, now, maximumAgeMs = 60_000) {
    const result = exports.AgentPhoneRouteResultSchema.safeParse(rawResult);
    return result.success && phoneRouteResultForEvent(rawEvent, result.data, now, maximumAgeMs);
}
//# sourceMappingURL=agent-phone-commands.js.map