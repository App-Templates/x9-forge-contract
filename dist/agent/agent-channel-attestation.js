import { z } from 'zod';
import { CapabilityAgentScopeSchema, sameCapabilityScope } from "../capability/capability-call-context.js";
import { AgentConfigVersionSchema } from "../capability/ricerca/agent-config.js";
import { ChannelTypeSchema } from "../messaging/channel-type.js";
import { AgentRuntimeIdentitySchema } from "./agent-runtime-identity.js";
import { AgentRuntimeChannelSchema } from "./agent-runtime-state.js";
import { AgentChannelVersionedStateSchema, AgentChannelFailureSchema } from "./agent-channel-configuration.js";
export const AgentExternalChannelKindSchema = ChannelTypeSchema.extract(['email', 'voice']);
const ownership = { scope: CapabilityAgentScopeSchema.strict(), identity: AgentRuntimeIdentitySchema.strict() };
/** Service must authenticate and authorize this scope before observing its own handler. */
export const AgentChannelAttestationRequestSchema = z.object({
    ...ownership, kind: AgentExternalChannelKindSchema, configVersion: AgentConfigVersionSchema,
}).strict().refine((request) => request.identity.runtimeAgentId === request.scope.agentId, { message: 'Attestation request identity must match scope' });
/** Actual service observation, never inferred from persisted desired state or global health. */
export const AgentChannelAttestationSchema = z.object({
    ...ownership, applied: AgentChannelVersionedStateSchema.nullable(),
    channel: AgentRuntimeChannelSchema.safeExtend({ kind: AgentExternalChannelKindSchema }).strict(),
    observedAt: z.iso.datetime({ offset: true }), error: AgentChannelFailureSchema.nullable(),
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
export function isChannelAttestationCurrent(rawRequest, rawObservation, now, maximumAgeMs = 60_000) {
    const request = AgentChannelAttestationRequestSchema.safeParse(rawRequest);
    const observation = AgentChannelAttestationSchema.safeParse(rawObservation);
    if (!request.success || !observation.success || !Number.isFinite(maximumAgeMs))
        return false;
    const wanted = request.data;
    const actual = observation.data;
    if (!sameCapabilityScope(wanted.scope, actual.scope) || wanted.identity.managementAgentId !== actual.identity.managementAgentId
        || wanted.kind !== actual.channel.kind || wanted.configVersion !== actual.applied?.version)
        return false;
    const age = now - Date.parse(actual.observedAt);
    return age >= 0 && age <= maximumAgeMs;
}
//# sourceMappingURL=agent-channel-attestation.js.map