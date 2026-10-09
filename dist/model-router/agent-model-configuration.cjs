"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentModelsStateSchema = exports.AgentModelBootstrapSourceExpectationSchema = exports.AgentModelBootstrapSourceSchema = exports.AgentModelRuntimeAttestationSchema = exports.AgentRuntimeModelSelectionSchema = exports.AgentContextWithModelProvenanceWriteSchema = exports.AgentContextWithModelProvenanceSchema = exports.AgentContextWithModelsWriteSchema = exports.AgentContextWithModelsSchema = exports.AgentModelsConfigurationWithProvenanceSchema = exports.AgentModelsConfigurationSchema = exports.AgentModelsProvenanceSchema = exports.AgentModelBindingSchema = exports.AgentModelSourceSchema = exports.AgentModelSelectionSchema = exports.ModelSelectionTierSchema = exports.AgentModelBootstrapPreconditionSchema = exports.AgentModelBootstrapSourceVersionSchema = exports.ModelSlotIdSchema = exports.AGENT_CHAT_MODEL_SLOT_ID = void 0;
exports.createAgentModelsConfigurationWithProvenance = createAgentModelsConfigurationWithProvenance;
exports.sameModelAgentIdentity = sameModelAgentIdentity;
exports.isAgentModelBootstrapSourceCurrent = isAgentModelBootstrapSourceCurrent;
exports.isAgentModelApplyConfirmed = isAgentModelApplyConfirmed;
exports.isAgentModelRuntimeConfigurationMatching = isAgentModelRuntimeConfigurationMatching;
const zod_1 = require("zod");
const agent_context_identity_js_1 = require("../agent/agent-context-identity.cjs");
const capability_call_context_js_1 = require("../capability/capability-call-context.cjs");
const agent_runtime_identity_js_1 = require("../agent/agent-runtime-identity.cjs");
const agent_management_js_1 = require("../agent/agent-management.cjs");
const agent_context_file_js_1 = require("../agent/agent-context-file.cjs");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const parameters_js_1 = require("../capability/parameters.cjs");
const capability_model_settings_js_1 = require("./capability-model-settings.cjs");
const model_tier_js_1 = require("./model-tier.cjs");
const model_slot_js_1 = require("./model-slot.cjs");
const model_consumers_js_1 = require("./model-consumers.cjs");
var model_slot_js_2 = require("./model-slot.cjs");
Object.defineProperty(exports, "AGENT_CHAT_MODEL_SLOT_ID", { enumerable: true, get: function () { return model_slot_js_2.AGENT_CHAT_MODEL_SLOT_ID; } });
Object.defineProperty(exports, "ModelSlotIdSchema", { enumerable: true, get: function () { return model_slot_js_2.ModelSlotIdSchema; } });
Object.defineProperty(exports, "AgentModelBootstrapSourceVersionSchema", { enumerable: true, get: function () { return model_slot_js_2.AgentModelBootstrapSourceVersionSchema; } });
Object.defineProperty(exports, "AgentModelBootstrapPreconditionSchema", { enumerable: true, get: function () { return model_slot_js_2.AgentModelBootstrapPreconditionSchema; } });
const model_catalog_js_1 = require("./model-catalog.cjs");
exports.ModelSelectionTierSchema = zod_1.z.enum([...model_tier_js_1.MODEL_TIERS, 'fallback', 'primary']);
exports.AgentModelSelectionSchema = zod_1.z.object({ slotId: model_slot_js_1.ModelSlotIdSchema, settings: capability_model_settings_js_1.CapabilityModelSettingsSchema }).strict();
/** Complete declared model authority; legacy runtime mappings remain optional elsewhere. */
const CompleteModelIdentitySchema = agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.extend({
    managementAgentId: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.shape.managementAgentId.refine(value => value.trim().length > 0, 'Model identity must not be blank'),
    runtimeAgentId: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.shape.runtimeAgentId.refine(value => value.trim().length > 0, 'Model identity must not be blank'),
    vaultAgentId: zod_1.z.number().int().positive(),
}).strict();
/** Source-neutral metadata: the store resolves this declared source and verifies its current version. */
exports.AgentModelSourceSchema = zod_1.z.object({
    identity: CompleteModelIdentitySchema,
    sourceVersion: agent_config_js_1.AgentConfigVersionSchema,
}).strict();
/** Custom remains custom even when its descriptor equals the source's descriptor. */
exports.AgentModelBindingSchema = zod_1.z.discriminatedUnion('origin', [
    zod_1.z.object({ slotId: model_slot_js_1.ModelSlotIdSchema, origin: zod_1.z.literal('master'), source: exports.AgentModelSourceSchema }).strict(),
    zod_1.z.object({ slotId: model_slot_js_1.ModelSlotIdSchema, origin: zod_1.z.literal('custom'), source: zod_1.z.never().optional() }).strict(),
]);
/** One explicit binding per selection; scope is declared authority, never provider credentials. */
exports.AgentModelsProvenanceSchema = zod_1.z.object({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema.refine(scope => [scope.agentId, scope.ownerId, scope.tenantId].every(value => value.trim().length > 0), 'Model scope must not be blank'),
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
    if (!CompleteModelIdentitySchema.safeParse(config.identity).success) {
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
    identity: CompleteModelIdentitySchema,
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
const contextModels = { modelConfiguration: exports.AgentModelsConfigurationSchema.optional() };
const checkContext = (context, ctx) => {
    if (context.modelConfiguration === undefined)
        return;
    const config = context.modelConfiguration;
    if (context.configVersion !== config.configVersion)
        ctx.addIssue({ code: 'custom', path: ['modelConfiguration', 'configVersion'], message: 'Explicit models require the same saved context version' });
    if (context.agentId !== config.identity.managementAgentId && context.agentId !== config.identity.runtimeAgentId)
        ctx.addIssue({ code: 'custom', path: ['modelConfiguration', 'identity'], message: 'Models belong to the declared context agent' });
    if (config.provenance === undefined)
        return;
    const authority = agent_context_identity_js_1.AgentContextIdentitySchema.safeParse({
        agentId: context.agentId, ownerId: context['ownerId'], tenantId: context['tenantId'], identity: context['identity'], role: context['role'],
        ...(context['masterAgentId'] === undefined ? {} : { masterAgentId: context['masterAgentId'] }),
    });
    if (!authority.success) {
        ctx.addIssue({ code: 'custom', path: ['modelConfiguration', 'provenance'], message: 'Explicit model provenance requires canonical context authority' });
        return;
    }
    const declared = authority.data;
    if (!sameModelAgentIdentity(config.identity, declared.identity)) {
        ctx.addIssue({ code: 'custom', path: ['modelConfiguration', 'identity'], message: 'Models must match every context identity field' });
    }
    if (!(0, capability_call_context_js_1.sameCapabilityScope)(config.provenance.scope, { agentId: declared.agentId, ownerId: declared.ownerId, tenantId: declared.tenantId })) {
        ctx.addIssue({ code: 'custom', path: ['modelConfiguration', 'provenance', 'scope'], message: 'Models belong to another owner or tenant' });
    }
    for (const [index, binding] of config.provenance.bindings.entries()) {
        if (binding.origin === 'master' && (declared.role !== 'erede' || binding.source.identity.runtimeAgentId !== declared.masterAgentId)) {
            ctx.addIssue({ code: 'custom', path: ['modelConfiguration', 'provenance', 'bindings', index, 'source'], message: 'Inherited model source must match the declared runtime Master' });
        }
    }
};
/** Explicit, validated models are authoritative; malformed/null values never fall back to legacy llmConfig. */
exports.AgentContextWithModelsSchema = agent_context_file_js_1.AgentContextFileSchema.safeExtend(contextModels).superRefine(checkContext);
exports.AgentContextWithModelsWriteSchema = agent_context_file_js_1.AgentContextFileWriteSchema.safeExtend(contextModels).superRefine(checkContext);
/** Complete identity/channel guards plus mandatory, scoped model provenance. */
exports.AgentContextWithModelProvenanceSchema = agent_context_identity_js_1.AgentContextWithIdentitySchema.and(exports.AgentContextWithModelsSchema.safeExtend({ modelConfiguration: exports.AgentModelsConfigurationWithProvenanceSchema }));
exports.AgentContextWithModelProvenanceWriteSchema = agent_context_identity_js_1.AgentContextWithIdentityWriteSchema.and(exports.AgentContextWithModelsWriteSchema.safeExtend({ modelConfiguration: exports.AgentModelsConfigurationWithProvenanceSchema }));
exports.AgentRuntimeModelSelectionSchema = zod_1.z.object({
    slotId: model_slot_js_1.ModelSlotIdSchema,
    capability: parameters_js_1.CapabilityAgentParametersSchema.shape.capability,
    function: model_catalog_js_1.ModelFunctionSchema,
    tier: exports.ModelSelectionTierSchema,
    descriptor: model_catalog_js_1.ModelDescriptorSchema,
    embeddingDimensions: zod_1.z.number().int().positive().optional(),
}).strict().superRefine((selection, ctx) => {
    if (selection.embeddingDimensions !== undefined && selection.function !== 'embedding')
        ctx.addIssue({ code: 'custom', path: ['embeddingDimensions'], message: 'Vector dimension belongs only to embedding' });
});
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
/** Read-only generation of the actually loaded Master, never a saved/applied configuration version. */
const ModelSourceScopeSchema = capability_call_context_js_1.CapabilityAgentScopeSchema.refine(scope => [scope.agentId, scope.ownerId, scope.tenantId].every(value => value.trim().length > 0), 'Source scope must not be blank');
exports.AgentModelBootstrapSourceSchema = zod_1.z.object({
    schemaVersion: zod_1.z.literal(1), identity: CompleteModelIdentitySchema, scope: ModelSourceScopeSchema,
    role: zod_1.z.literal('master'), authority: zod_1.z.literal('runtime-loaded'),
    sourceVersion: model_slot_js_1.AgentModelBootstrapSourceVersionSchema,
    observedAt: zod_1.z.iso.datetime({ offset: true }), validUntil: zod_1.z.iso.datetime({ offset: true }),
    coverage: zod_1.z.enum(['complete', 'partial']),
    selections: zod_1.z.array(exports.AgentModelSelectionSchema).max(64), missingSlots: zod_1.z.array(model_slot_js_1.ModelSlotIdSchema).max(64),
    /** Absence of a service must be observed at the same generation; active unknown models remain missing. */
    excludedSlots: zod_1.z.array(zod_1.z.object({ slotId: model_slot_js_1.ModelSlotIdSchema, state: zod_1.z.enum(['not-installed', 'not-applicable']), reason: zod_1.z.string().trim().min(1).max(500) }).strict()).max(64).optional(),
}).strict().superRefine((source, ctx) => {
    if (source.scope.agentId !== source.identity.runtimeAgentId)
        ctx.addIssue({ code: 'custom', path: ['scope'], message: 'Source scope names its runtime exactly' });
    if (Date.parse(source.validUntil) <= Date.parse(source.observedAt))
        ctx.addIssue({ code: 'custom', path: ['validUntil'], message: 'Source validity ends after observation' });
    const present = source.selections.map(selection => selection.slotId);
    const all = [...present, ...source.missingSlots, ...(source.excludedSlots ?? []).map(slot => slot.slotId)];
    const registered = (0, model_consumers_js_1.registeredModelConsumers)().map(consumer => consumer.slotId);
    if (new Set(all).size !== all.length || all.length !== registered.length || registered.some(slot => !all.includes(slot)))
        ctx.addIssue({ code: 'custom', path: ['selections'], message: 'Every registered slot is present or missing exactly once' });
    if ((source.coverage === 'complete') !== (source.missingSlots.length === 0) || (source.coverage === 'complete' && source.selections.length === 0))
        ctx.addIssue({ code: 'custom', path: ['coverage'], message: 'Complete means no missing consumer' });
    for (const [index, selection] of source.selections.entries()) {
        const consumer = (0, model_consumers_js_1.findModelConsumerDefinition)(selection.slotId);
        const actual = selection.settings;
        if (consumer === undefined || consumer.capability !== actual.capability || consumer.function !== actual.function || !(0, capability_model_settings_js_1.sameModelFeatures)(consumer.requirements, actual.requirements) || consumer.routing !== (actual.mode === 'single' ? 'single' : actual.mode === 'failover' ? 'failover' : 'tiered'))
            ctx.addIssue({ code: 'custom', path: ['selections', index], message: 'Source settings must match the canonical consumer and its requirements' });
    }
});
exports.AgentModelBootstrapSourceExpectationSchema = zod_1.z.object({ identity: CompleteModelIdentitySchema, scope: ModelSourceScopeSchema, sourceVersion: model_slot_js_1.AgentModelBootstrapSourceVersionSchema }).strict();
/** Caller supplies a fresh server-side generation recheck after awaits. Parsing alone cannot prove runtime authority. */
function isAgentModelBootstrapSourceCurrent(input, expected, now = new Date()) {
    const parsed = exports.AgentModelBootstrapSourceSchema.safeParse(input);
    const target = exports.AgentModelBootstrapSourceExpectationSchema.safeParse(expected);
    if (!parsed.success || !target.success)
        return false;
    const source = parsed.data;
    const expectation = target.data;
    const time = now.getTime();
    if (source.coverage !== 'complete' || source.selections.length === 0 || !Number.isFinite(time) || time < Date.parse(source.observedAt) - 5_000 || time >= Date.parse(source.validUntil))
        return false;
    return source.sourceVersion === expectation.sourceVersion && sameModelAgentIdentity(source.identity, expectation.identity) && (0, capability_call_context_js_1.sameCapabilityScope)(source.scope, expectation.scope);
}
exports.AgentModelsStateSchema = zod_1.z.object({
    identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.strict(),
    versions: agent_management_js_1.AgentConfigVersionStateSchema.nullable(),
    saved: exports.AgentModelsConfigurationSchema.nullable(),
    runtime: exports.AgentModelRuntimeAttestationSchema.nullable(),
    /** Absent on existing consumers; explicit null means no qualified loaded Master source. */
    bootstrapSource: exports.AgentModelBootstrapSourceSchema.nullable().optional(),
}).strict().superRefine((state, ctx) => {
    if (state.bootstrapSource != null) {
        if (!sameModelAgentIdentity(state.identity, state.bootstrapSource.identity))
            ctx.addIssue({ code: 'custom', path: ['bootstrapSource', 'identity'], message: 'Bootstrap source belongs to this state identity' });
        if (state.saved !== null || state.runtime !== null || state.versions !== null)
            ctx.addIssue({ code: 'custom', path: ['bootstrapSource'], message: 'Bootstrap source cannot claim a saved or applied version' });
    }
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
    return isAgentModelRuntimeConfigurationMatching(saved, actual, now);
}
/** Fresh exact installed positions, including vector dimension, independent of transport/receipt. */
function isAgentModelRuntimeConfigurationMatching(configuration, runtimeEvidence, now = new Date()) {
    const config = exports.AgentModelsConfigurationSchema.safeParse(configuration);
    const evidence = exports.AgentModelRuntimeAttestationSchema.safeParse(runtimeEvidence);
    if (!config.success || !evidence.success)
        return false;
    const saved = config.data;
    const actual = evidence.data;
    if (!sameModelAgentIdentity(saved.identity, actual.identity) || saved.configVersion !== actual.configVersion)
        return false;
    const timestamp = now.getTime();
    const observed = Date.parse(actual.observedAt);
    if (!Number.isFinite(timestamp) || timestamp < observed - 5_000 || timestamp > observed + 60_000)
        return false;
    if (actual.selections.length !== saved.selections.reduce((count, slot) => count + (0, capability_model_settings_js_1.modelSettingsSelections)(slot.settings).length, 0))
        return false;
    return saved.selections.every(slot => (0, capability_model_settings_js_1.modelSettingsSelections)(slot.settings).every(({ tier, descriptor }) => {
        const selection = actual.selections.find(entry => entry.slotId === slot.slotId && entry.tier === tier);
        const dimensionMatches = slot.settings.mode !== 'single' || slot.settings.function !== 'embedding' || selection?.embeddingDimensions === slot.settings.embeddingDimensions;
        return selection !== undefined && dimensionMatches && selection.capability === slot.settings.capability && selection.function === slot.settings.function && (0, model_catalog_js_1.sameModelDescriptor)(selection.descriptor, descriptor);
    }));
}
//# sourceMappingURL=agent-model-configuration.js.map