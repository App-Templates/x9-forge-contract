import { z } from 'zod';
import { AgentRuntimeIdentitySchema } from "../../agent/agent-runtime-identity.js";
import { AgentWorkspaceDescriptorSchema } from "../../agent/agent-workspace.js";
import { AgentVoiceConfigSchema } from "../../capability/voice/agent-voice-settings.js";
import { AgentManagementParamsSchema } from "./internal-agents-management.js";
/**
 * The applied voice source of a LOADED agent, as agent-core holds it.
 *
 * Capabilities that speak for an agent (cap-voice: admission of a call, channel attestation, caller identity) take its
 * applied voice from the one place that holds every loaded agent — agent-core — instead of scanning another service's
 * disk. The answer has the same shape for an agent loaded from its context file and for the primary agent loaded from
 * its stack environment: the consumer never knows which, and there is no per-agent special case.
 *
 * Non-secret projection only: no credentials, no keys, no tokens. `voiceConfiguration` is the agent's applied/desired
 * voice with its versions, or null when none was ever applied («unconfigured», never an invented default).
 */
export const AgentVoiceSourceSchema = z.strictObject({
    /** Runtime id of the loaded agent (the key agent-core holds it by). */
    agentId: z.string().min(1),
    ownerId: z.string().min(1),
    tenantId: z.string().min(1),
    /** Forge's explicit root identity: management id, runtime id, vault id. A context without it has no source. */
    identity: AgentRuntimeIdentitySchema,
    displayName: z.string().trim().min(1).max(200),
    voiceConfiguration: AgentVoiceConfigSchema.nullable(),
    /** Applied workspace attestation + its path, only when the agent has one (the primary agent has none). */
    workspace: AgentWorkspaceDescriptorSchema.optional(),
    workspacePath: z.string().min(1).optional(),
});
/** `:agentId` is the RUNTIME id of the loaded agent: the one capabilities receive in their call envelope. */
export const AgentVoiceSourceParamsSchema = AgentManagementParamsSchema;
export function internalAgentVoiceSourcePath(runtimeAgentId) {
    const params = AgentVoiceSourceParamsSchema.parse({ agentId: runtimeAgentId });
    return `/internal/agents/${params.agentId}/voice-source`;
}
/** capability → agent-core, X-Internal-Secret as every internal call. Answers 404 for an agent that is not loaded. */
export const internalAgentVoiceSourceContract = {
    method: 'GET',
    path: '/internal/agents/:agentId/voice-source',
    authType: 'secret',
    paramsSchema: AgentVoiceSourceParamsSchema,
    responseSchema: AgentVoiceSourceSchema,
};
//# sourceMappingURL=internal-agent-voice-source.js.map