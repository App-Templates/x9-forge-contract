"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalAgentVoiceSourceContract = exports.AgentVoiceSourceParamsSchema = exports.AgentVoiceSourceSchema = void 0;
exports.internalAgentVoiceSourcePath = internalAgentVoiceSourcePath;
const zod_1 = require("zod");
const agent_runtime_identity_js_1 = require("../../agent/agent-runtime-identity.cjs");
const agent_workspace_js_1 = require("../../agent/agent-workspace.cjs");
const agent_voice_settings_js_1 = require("../../capability/voice/agent-voice-settings.cjs");
const internal_agents_management_js_1 = require("./internal-agents-management.cjs");
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
exports.AgentVoiceSourceSchema = zod_1.z.strictObject({
    /** Runtime id of the loaded agent (the key agent-core holds it by). */
    agentId: zod_1.z.string().min(1),
    ownerId: zod_1.z.string().min(1),
    tenantId: zod_1.z.string().min(1),
    /** Forge's explicit root identity: management id, runtime id, vault id. A context without it has no source. */
    identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema,
    displayName: zod_1.z.string().trim().min(1).max(200),
    voiceConfiguration: agent_voice_settings_js_1.AgentVoiceConfigSchema.nullable(),
    /** Applied workspace attestation + its path, only when the agent has one (the primary agent has none). */
    workspace: agent_workspace_js_1.AgentWorkspaceDescriptorSchema.optional(),
    workspacePath: zod_1.z.string().min(1).optional(),
});
/** `:agentId` is the RUNTIME id of the loaded agent: the one capabilities receive in their call envelope. */
exports.AgentVoiceSourceParamsSchema = internal_agents_management_js_1.AgentManagementParamsSchema;
function internalAgentVoiceSourcePath(runtimeAgentId) {
    const params = exports.AgentVoiceSourceParamsSchema.parse({ agentId: runtimeAgentId });
    return `/internal/agents/${params.agentId}/voice-source`;
}
/** capability → agent-core, X-Internal-Secret as every internal call. Answers 404 for an agent that is not loaded. */
exports.internalAgentVoiceSourceContract = {
    method: 'GET',
    path: '/internal/agents/:agentId/voice-source',
    authType: 'secret',
    paramsSchema: exports.AgentVoiceSourceParamsSchema,
    responseSchema: exports.AgentVoiceSourceSchema,
};
//# sourceMappingURL=internal-agent-voice-source.js.map