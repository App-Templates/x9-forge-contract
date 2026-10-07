"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentModelsStateSchema = exports.AgentModelRuntimeAttestationSchema = exports.AgentRuntimeModelSelectionSchema = exports.AgentContextWithModelsWriteSchema = exports.AgentContextWithModelsSchema = exports.AgentModelsConfigurationSchema = exports.AgentModelSelectionSchema = exports.ModelSelectionTierSchema = exports.ModelSlotIdSchema = void 0;
exports.sameModelAgentIdentity = sameModelAgentIdentity;
exports.isAgentModelApplyConfirmed = isAgentModelApplyConfirmed;
const zod_1 = require("zod");
const agent_runtime_identity_js_1 = require("../agent/agent-runtime-identity.cjs");
const agent_management_js_1 = require("../agent/agent-management.cjs");
const agent_context_file_js_1 = require("../agent/agent-context-file.cjs");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const parameters_js_1 = require("../capability/parameters.cjs");
const capability_model_settings_js_1 = require("./capability-model-settings.cjs");
const model_tier_js_1 = require("./model-tier.cjs");
const model_catalog_js_1 = require("./model-catalog.cjs");
/** Stable server-owned slot identifiers, including existing agent_chat/mem0_* slots. */
exports.ModelSlotIdSchema = zod_1.z.string().regex(/^[a-z][a-z0-9._-]{0,63}$/);
exports.ModelSelectionTierSchema = zod_1.z.enum([...model_tier_js_1.MODEL_TIERS, 'fallback']);
exports.AgentModelSelectionSchema = zod_1.z.object({ slotId: exports.ModelSlotIdSchema, settings: capability_model_settings_js_1.CapabilityModelSettingsSchema }).strict();
exports.AgentModelsConfigurationSchema = zod_1.z.object({
    schemaVersion: zod_1.z.literal(1),
    identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.strict(),
    configVersion: agent_config_js_1.AgentConfigVersionSchema,
    selections: zod_1.z.array(exports.AgentModelSelectionSchema).min(1).max(64),
}).strict().superRefine((config, ctx) => {
    if (new Set(config.selections.map(entry => entry.slotId)).size !== config.selections.length)
        ctx.addIssue({ code: 'custom', path: ['selections'], message: 'Duplicate model slot' });
});
/** Compare the canonical mapping, including the optional Vault numeric identity. */
function sameModelAgentIdentity(left, right) {
    return left.managementAgentId === right.managementAgentId && left.runtimeAgentId === right.runtimeAgentId && left.vaultAgentId === right.vaultAgentId;
}
const contextModels = { modelConfiguration: exports.AgentModelsConfigurationSchema.optional() };
const checkContext = (context, ctx) => {
    if (context.modelConfiguration === undefined)
        return;
    const config = context.modelConfiguration;
    if (context.configVersion !== config.configVersion)
        ctx.addIssue({ code: 'custom', path: ['modelConfiguration', 'configVersion'], message: 'Explicit models require the same saved context version' });
    if (context.agentId !== config.identity.managementAgentId && context.agentId !== config.identity.runtimeAgentId)
        ctx.addIssue({ code: 'custom', path: ['modelConfiguration', 'identity'], message: 'Models belong to the declared context agent' });
};
/** Explicit, validated models are authoritative; malformed/null values never fall back to legacy llmConfig. */
exports.AgentContextWithModelsSchema = agent_context_file_js_1.AgentContextFileSchema.safeExtend(contextModels).superRefine(checkContext);
exports.AgentContextWithModelsWriteSchema = agent_context_file_js_1.AgentContextFileWriteSchema.safeExtend(contextModels).superRefine(checkContext);
exports.AgentRuntimeModelSelectionSchema = zod_1.z.object({
    slotId: exports.ModelSlotIdSchema,
    capability: parameters_js_1.CapabilityAgentParametersSchema.shape.capability,
    function: model_catalog_js_1.ModelFunctionSchema,
    tier: exports.ModelSelectionTierSchema,
    descriptor: model_catalog_js_1.ModelDescriptorSchema,
}).strict();
/** Producer evidence of the selections actually installed for each function/tier, not a global reload count. */
exports.AgentModelRuntimeAttestationSchema = zod_1.z.object({
    identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.strict(),
    configVersion: agent_config_js_1.AgentConfigVersionSchema,
    requestId: agent_management_js_1.AgentManagementRequestIdSchema,
    observedAt: zod_1.z.iso.datetime({ offset: true }),
    selections: zod_1.z.array(exports.AgentRuntimeModelSelectionSchema).min(1).max(256),
}).strict().superRefine((evidence, ctx) => {
    if (new Set(evidence.selections.map(entry => `${entry.slotId}:${entry.tier}`)).size !== evidence.selections.length)
        ctx.addIssue({ code: 'custom', path: ['selections'], message: 'Duplicate runtime slot/tier' });
});
exports.AgentModelsStateSchema = zod_1.z.object({
    identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.strict(),
    versions: agent_management_js_1.AgentConfigVersionStateSchema.nullable(),
    saved: exports.AgentModelsConfigurationSchema.nullable(),
    runtime: exports.AgentModelRuntimeAttestationSchema.nullable(),
}).strict().superRefine((state, ctx) => {
    if (state.saved !== null) {
        if (!sameModelAgentIdentity(state.identity, state.saved.identity))
            ctx.addIssue({ code: 'custom', path: ['saved', 'identity'], message: 'Saved models belong to another agent' });
        if (state.saved.configVersion !== state.versions?.desired)
            ctx.addIssue({ code: 'custom', path: ['saved', 'configVersion'], message: 'Saved model version must be the desired version' });
    }
    if (state.runtime !== null) {
        if (!sameModelAgentIdentity(state.identity, state.runtime.identity))
            ctx.addIssue({ code: 'custom', path: ['runtime', 'identity'], message: 'Runtime models belong to another agent' });
        if (state.runtime.configVersion !== state.versions?.applied)
            ctx.addIssue({ code: 'custom', path: ['runtime', 'configVersion'], message: 'Runtime model version must be the applied version' });
    }
});
/** No side effects: null, timeout, stale or mismatched evidence remains unconfirmed; identical replays are valid. */
function isAgentModelApplyConfirmed(configuration, requestedCommand, processedResult, runtimeEvidence, now = new Date()) {
    const config = exports.AgentModelsConfigurationSchema.safeParse(configuration);
    const command = agent_management_js_1.AgentManagementCommandSchema.safeParse(requestedCommand);
    const result = agent_management_js_1.AgentManagementCommandResultSchema.safeParse(processedResult);
    const attestation = exports.AgentModelRuntimeAttestationSchema.safeParse(runtimeEvidence);
    if (!config.success || !command.success || !result.success || !attestation.success)
        return false;
    const saved = config.data;
    const request = command.data;
    const response = result.data;
    const actual = attestation.data;
    if (request.action !== 'apply-config' || response.action !== 'apply-config')
        return false;
    if (request.desiredVersion !== saved.configVersion || response.versions?.applied !== saved.configVersion || actual.configVersion !== saved.configVersion)
        return false;
    if (response.requestId !== request.requestId || actual.requestId !== request.requestId)
        return false;
    if (response.agentId !== saved.identity.managementAgentId || response.identity === undefined || !sameModelAgentIdentity(saved.identity, response.identity) || !sameModelAgentIdentity(saved.identity, actual.identity))
        return false;
    if (response.outcome !== 'ok' || !response.results.some(entry => entry.target.kind === 'runtime' && entry.target.targetId === saved.identity.runtimeAgentId && entry.outcome === 'ok'))
        return false;
    const timestamp = now.getTime();
    const observed = Date.parse(actual.observedAt);
    if (!Number.isFinite(timestamp) || timestamp < observed - 5_000 || timestamp > observed + 60_000)
        return false;
    if (actual.selections.length !== saved.selections.length * 4)
        return false;
    return saved.selections.every(slot => [...model_tier_js_1.MODEL_TIERS, 'fallback'].every(tier => {
        const selection = actual.selections.find(entry => entry.slotId === slot.slotId && entry.tier === tier);
        const expected = tier === 'fallback' ? slot.settings.fallback : slot.settings.tiers[tier];
        return selection !== undefined && selection.capability === slot.settings.capability && selection.function === slot.settings.function && (0, model_catalog_js_1.sameModelDescriptor)(selection.descriptor, expected);
    }));
}
//# sourceMappingURL=agent-model-configuration.js.map