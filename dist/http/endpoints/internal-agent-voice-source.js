import { z } from 'zod';
import { AgentRuntimeIdentitySchema } from "../../agent/agent-runtime-identity.js";
import { managementAgentIdOf } from "../../agent/agent-channel-configuration.js";
import { AgentContextWithWorkspaceSchema, AgentWorkspaceDescriptorSchema } from "../../agent/agent-workspace.js";
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
    /** As written in the context; the caller identity is validated by the capability (name rules are its own). */
    displayName: z.string().max(1000),
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
/**
 * The source of ONE loaded agent, from its validated context. Used by agent-core to answer the contract above and by
 * consumers' fixtures, so the projection exists once: whitelisted fields only, no credential, no token, no raw context.
 *
 * Returns null — «no source», never a reconstruction — when the context is not a valid one, has no tenant, or has no
 * Forge management identity (explicit, or the concordant pair of its channel configurations). The runtime id is the
 * id the agent is loaded by; the vault id is only carried when Forge wrote it.
 */
export function agentVoiceSourceOf(context) {
    const parsed = AgentContextWithWorkspaceSchema.safeParse(context);
    if (!parsed.success)
        return null;
    const ctx = parsed.data;
    const managementAgentId = managementAgentIdOf(ctx);
    if (managementAgentId === null || ctx.tenantId === undefined)
        return null;
    const projection = AgentVoiceSourceSchema.safeParse({
        agentId: ctx.agentId,
        ownerId: ctx.ownerId,
        tenantId: ctx.tenantId,
        identity: {
            managementAgentId, runtimeAgentId: ctx.agentId,
            ...(ctx.identity?.vaultAgentId === undefined ? {} : { vaultAgentId: ctx.identity.vaultAgentId }),
        },
        displayName: ctx.displayName,
        voiceConfiguration: ctx.voiceConfiguration ?? null,
        ...(ctx.workspace === undefined ? {} : { workspace: ctx.workspace, workspacePath: ctx.workspacePath }),
    });
    return projection.success ? projection.data : null;
}
//# sourceMappingURL=internal-agent-voice-source.js.map