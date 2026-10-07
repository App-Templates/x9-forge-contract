"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentChannelAttestationSchema = exports.AgentChannelAttestationRequestSchema = exports.AgentExternalChannelKindSchema = void 0;
exports.isChannelAttestationCurrent = isChannelAttestationCurrent;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability/capability-call-context.cjs");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const channel_type_js_1 = require("../messaging/channel-type.cjs");
const agent_runtime_identity_js_1 = require("./agent-runtime-identity.cjs");
const agent_runtime_state_js_1 = require("./agent-runtime-state.cjs");
const agent_channel_configuration_js_1 = require("./agent-channel-configuration.cjs");
exports.AgentExternalChannelKindSchema = channel_type_js_1.ChannelTypeSchema.extract(['email', 'voice']);
const ownership = { scope: capability_call_context_js_1.CapabilityAgentScopeSchema.strict(), identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.strict() };
/** Service must authenticate and authorize this scope before observing its own handler. */
exports.AgentChannelAttestationRequestSchema = zod_1.z.object({
    ...ownership, kind: exports.AgentExternalChannelKindSchema, configVersion: agent_config_js_1.AgentConfigVersionSchema,
}).strict().refine((request) => request.identity.runtimeAgentId === request.scope.agentId, { message: 'Attestation request identity must match scope' });
/** Actual service observation, never inferred from persisted desired state or global health. */
exports.AgentChannelAttestationSchema = zod_1.z.object({
    ...ownership, applied: agent_channel_configuration_js_1.AgentChannelVersionedStateSchema.nullable(),
    channel: agent_runtime_state_js_1.AgentRuntimeChannelSchema.safeExtend({ kind: exports.AgentExternalChannelKindSchema }).strict(),
    observedAt: zod_1.z.iso.datetime({ offset: true }), error: agent_channel_configuration_js_1.AgentChannelFailureSchema.nullable(),
}).strict().superRefine((observation, ctx) => {
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (observation.identity.runtimeAgentId !== observation.scope.agentId)
        issue('identity', 'Attestation identity must match scope');
    if (observation.channel.state === 'loaded' && observation.applied?.state !== 'active')
        issue('applied', 'Loaded handler requires an active applied version');
    if (observation.channel.state === 'paused' && observation.applied?.state !== 'paused')
        issue('applied', 'Paused handler requires an applied pause');
    if (observation.channel.state === 'error' && observation.error === null)
        issue('error', 'Failed handler requires a fixed error code');
});
/** Binding/freshness only. Current error/not-ready observations do not prove readiness or channelsComplete.
 * Clock is injected for deterministic consumers; the service must observe on each request, not refresh a cached date.
 */
function isChannelAttestationCurrent(rawRequest, rawObservation, now, maximumAgeMs = 60_000) {
    const request = exports.AgentChannelAttestationRequestSchema.safeParse(rawRequest);
    const observation = exports.AgentChannelAttestationSchema.safeParse(rawObservation);
    if (!request.success || !observation.success || !Number.isFinite(maximumAgeMs))
        return false;
    const wanted = request.data;
    const actual = observation.data;
    if (!(0, capability_call_context_js_1.sameCapabilityScope)(wanted.scope, actual.scope) || wanted.identity.managementAgentId !== actual.identity.managementAgentId
        || wanted.kind !== actual.channel.kind || wanted.configVersion !== actual.applied?.version)
        return false;
    const age = now - Date.parse(actual.observedAt);
    return age >= 0 && age <= maximumAgeMs;
}
//# sourceMappingURL=agent-channel-attestation.js.map