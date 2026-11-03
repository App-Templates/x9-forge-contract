"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentModelsConfigurationWithProvenanceSchema = exports.AgentModelsConfigurationSchema = exports.AgentModelsProvenanceSchema = exports.AgentModelBindingSchema = exports.AgentModelSourceSchema = exports.CompleteModelIdentitySchema = exports.AgentModelSelectionSchema = exports.ModelSelectionTierSchema = void 0;
exports.createAgentModelsConfigurationWithProvenance = createAgentModelsConfigurationWithProvenance;
exports.sameModelAgentIdentity = sameModelAgentIdentity;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability/capability-call-context.cjs");
const agent_runtime_identity_js_1 = require("../agent/agent-runtime-identity.cjs");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const capability_model_settings_js_1 = require("./capability-model-settings.cjs");
const model_tier_js_1 = require("./model-tier.cjs");
const model_slot_js_1 = require("./model-slot.cjs");
exports.ModelSelectionTierSchema = zod_1.z.enum([...model_tier_js_1.MODEL_TIERS, 'fallback', 'primary']);
exports.AgentModelSelectionSchema = zod_1.z.object({ slotId: model_slot_js_1.ModelSlotIdSchema, settings: capability_model_settings_js_1.CapabilityModelSettingsSchema }).strict();
/** Complete declared model authority; legacy runtime mappings remain optional elsewhere. */
exports.CompleteModelIdentitySchema = agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.extend({
    managementAgentId: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.shape.managementAgentId.refine(value => value.trim().length > 0, 'Model identity must not be blank'),
    runtimeAgentId: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.shape.runtimeAgentId.refine(value => value.trim().length > 0, 'Model identity must not be blank'),
    vaultAgentId: zod_1.z.number().int().positive(),
}).strict();
/** Source-neutral metadata: the store resolves this declared source and verifies its current version. */
exports.AgentModelSourceSchema = zod_1.z.object({
    identity: exports.CompleteModelIdentitySchema,
    sourceVersion: agent_config_js_1.AgentConfigVersionSchema,
}).strict();
/** Custom remains custom even when its descriptor equals the source's descriptor. */
exports.AgentModelBindingSchema = zod_1.z.discriminatedUnion('origin', [
    zod_1.z.object({ slotId: model_slot_js_1.ModelSlotIdSchema, origin: zod_1.z.literal('master'), source: exports.AgentModelSourceSchema }).strict(),
    zod_1.z.object({ slotId: model_slot_js_1.ModelSlotIdSchema, origin: zod_1.z.literal('custom'), source: zod_1.z.never().optional() }).strict(),
]);
/** One explicit binding per selection; scope is declared authority, never provider credentials. */
exports.AgentModelsProvenanceSchema = zod_1.z.object({
    scope: zod_1.z.lazy(() => capability_call_context_js_1.CapabilityAgentScopeSchema).refine(scope => [scope.agentId, scope.ownerId, scope.tenantId].every(value => value.trim().length > 0), 'Model scope must not be blank'),
    bindings: zod_1.z.array(exports.AgentModelBindingSchema).min(1).max(64),
}).strict().superRefine((value, ctx) => {
    if (new Set(value.bindings.map(binding => binding.slotId)).size !== value.bindings.length) {
        ctx.addIssue({ code: 'custom', path: ['bindings'], message: 'Duplicate model binding' });
    }
});
exports.AgentModelsConfigurationSchema = zod_1.z.object({
    schemaVersion: zod_1.z.literal(1),
    identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.strict(),
    configVersion: agent_config_js_1.AgentConfigVersionSchema,
    selections: zod_1.z.array(exports.AgentModelSelectionSchema).min(1).max(64),
    /** Absent on 1.43 legacy; malformed explicit provenance is never discarded. */
    provenance: exports.AgentModelsProvenanceSchema.optional(),
}).strict().superRefine((config, ctx) => {
    if (new Set(config.selections.map(entry => entry.slotId)).size !== config.selections.length)
        ctx.addIssue({ code: 'custom', path: ['selections'], message: 'Duplicate model slot' });
    if (config.provenance === undefined)
        return;
    const provenance = config.provenance;
    if (!exports.CompleteModelIdentitySchema.safeParse(config.identity).success) {
        ctx.addIssue({ code: 'custom', path: ['identity'], message: 'Explicit model provenance requires complete identity' });
    }
    if (provenance.scope.agentId !== config.identity.runtimeAgentId) {
        ctx.addIssue({ code: 'custom', path: ['provenance', 'scope'], message: 'Model scope must name the declared runtime' });
    }
    if (provenance.bindings.length !== config.selections.length || config.selections.some(selection => !provenance.bindings.some(binding => binding.slotId === selection.slotId))) {
        ctx.addIssue({ code: 'custom', path: ['provenance', 'bindings'], message: 'Every model selection requires exactly one binding' });
    }
    const ownIds = new Set([config.identity.managementAgentId, config.identity.runtimeAgentId]);
    const sources = [];
    for (const [index, binding] of provenance.bindings.entries()) {
        if (binding.origin !== 'master')
            continue;
        const source = binding.source.identity;
        if (ownIds.has(source.managementAgentId) || ownIds.has(source.runtimeAgentId) || source.vaultAgentId === config.identity.vaultAgentId) {
            ctx.addIssue({ code: 'custom', path: ['provenance', 'bindings', index, 'source'], message: 'A model source cannot be the destination agent' });
        }
        if (sources.some(previous => (previous.managementAgentId === source.managementAgentId || previous.runtimeAgentId === source.runtimeAgentId || previous.managementAgentId === source.runtimeAgentId || previous.runtimeAgentId === source.managementAgentId || previous.vaultAgentId === source.vaultAgentId) && !sameModelAgentIdentity(previous, source))) {
            ctx.addIssue({ code: 'custom', path: ['provenance', 'bindings', index, 'source'], message: 'Model source identity mapping is ambiguous' });
        }
        sources.push(source);
    }
});
/** Modern store/writer boundary: provenance and all three identifiers are mandatory. */
exports.AgentModelsConfigurationWithProvenanceSchema = exports.AgentModelsConfigurationSchema.safeExtend({
    identity: exports.CompleteModelIdentitySchema,
    provenance: exports.AgentModelsProvenanceSchema,
});
/** Parsing returns detached metadata and supplies no source, binding or model defaults. */
function createAgentModelsConfigurationWithProvenance(input) {
    return exports.AgentModelsConfigurationWithProvenanceSchema.parse(input);
}
/** Compare the canonical mapping, including the optional Vault numeric identity. */
function sameModelAgentIdentity(left, right) {
    return left.managementAgentId === right.managementAgentId && left.runtimeAgentId === right.runtimeAgentId && left.vaultAgentId === right.vaultAgentId;
}
//# sourceMappingURL=agent-model-configuration-values.js.map