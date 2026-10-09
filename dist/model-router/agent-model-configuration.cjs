"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentModelsStateSchema = exports.AgentModelSourceObservationSchema = exports.AgentModelBootstrapSourceExpectationSchema = exports.AgentModelBootstrapSourceSchema = exports.AgentModelInitialSourceSchema = exports.AgentModelRuntimeAttestationSchema = exports.AgentRuntimeModelSelectionSchema = exports.AgentContextWithModelProvenanceWriteSchema = exports.AgentContextWithModelProvenanceSchema = exports.AgentContextWithModelsWriteSchema = exports.AgentContextWithModelsSchema = exports.sameModelAgentIdentity = exports.createAgentModelsConfigurationWithProvenance = exports.AgentModelsConfigurationWithProvenanceSchema = exports.AgentModelsConfigurationSchema = exports.AgentModelsProvenanceSchema = exports.AgentModelBindingSchema = exports.AgentModelSourceSchema = exports.AgentModelSelectionSchema = exports.ModelSelectionTierSchema = exports.AgentModelBootstrapPreconditionSchema = exports.AgentModelBootstrapSourceVersionSchema = exports.ModelSlotIdSchema = exports.AGENT_CHAT_MODEL_SLOT_ID = void 0;
exports.isAgentModelBootstrapSourceCurrent = isAgentModelBootstrapSourceCurrent;
exports.isAgentModelInitialSourceCurrent = isAgentModelInitialSourceCurrent;
exports.isAgentModelSourceObservationCurrent = isAgentModelSourceObservationCurrent;
exports.isAgentModelApplyConfirmed = isAgentModelApplyConfirmed;
exports.isAgentModelRuntimeConfigurationMatching = isAgentModelRuntimeConfigurationMatching;
exports.isAgentModelCommandSourceCurrent = isAgentModelCommandSourceCurrent;
const zod_1 = require("zod");
const agent_context_identity_js_1 = require("../agent/agent-context-identity.cjs");
const capability_call_context_js_1 = require("../capability/capability-call-context.cjs");
const agent_runtime_identity_js_1 = require("../agent/agent-runtime-identity.cjs");
const agent_management_js_1 = require("../agent/agent-management.cjs");
const agent_context_file_js_1 = require("../agent/agent-context-file.cjs");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const parameters_js_1 = require("../capability/parameters.cjs");
const capability_model_settings_js_1 = require("./capability-model-settings.cjs");
const model_slot_js_1 = require("./model-slot.cjs");
const model_consumers_js_1 = require("./model-consumers.cjs");
var model_slot_js_2 = require("./model-slot.cjs");
Object.defineProperty(exports, "AGENT_CHAT_MODEL_SLOT_ID", { enumerable: true, get: function () { return model_slot_js_2.AGENT_CHAT_MODEL_SLOT_ID; } });
Object.defineProperty(exports, "ModelSlotIdSchema", { enumerable: true, get: function () { return model_slot_js_2.ModelSlotIdSchema; } });
Object.defineProperty(exports, "AgentModelBootstrapSourceVersionSchema", { enumerable: true, get: function () { return model_slot_js_2.AgentModelBootstrapSourceVersionSchema; } });
Object.defineProperty(exports, "AgentModelBootstrapPreconditionSchema", { enumerable: true, get: function () { return model_slot_js_2.AgentModelBootstrapPreconditionSchema; } });
const model_catalog_js_1 = require("./model-catalog.cjs");
const agent_model_configuration_values_js_1 = require("./agent-model-configuration-values.cjs");
var agent_model_configuration_values_js_2 = require("./agent-model-configuration-values.cjs");
Object.defineProperty(exports, "ModelSelectionTierSchema", { enumerable: true, get: function () { return agent_model_configuration_values_js_2.ModelSelectionTierSchema; } });
Object.defineProperty(exports, "AgentModelSelectionSchema", { enumerable: true, get: function () { return agent_model_configuration_values_js_2.AgentModelSelectionSchema; } });
Object.defineProperty(exports, "AgentModelSourceSchema", { enumerable: true, get: function () { return agent_model_configuration_values_js_2.AgentModelSourceSchema; } });
Object.defineProperty(exports, "AgentModelBindingSchema", { enumerable: true, get: function () { return agent_model_configuration_values_js_2.AgentModelBindingSchema; } });
Object.defineProperty(exports, "AgentModelsProvenanceSchema", { enumerable: true, get: function () { return agent_model_configuration_values_js_2.AgentModelsProvenanceSchema; } });
Object.defineProperty(exports, "AgentModelsConfigurationSchema", { enumerable: true, get: function () { return agent_model_configuration_values_js_2.AgentModelsConfigurationSchema; } });
Object.defineProperty(exports, "AgentModelsConfigurationWithProvenanceSchema", { enumerable: true, get: function () { return agent_model_configuration_values_js_2.AgentModelsConfigurationWithProvenanceSchema; } });
Object.defineProperty(exports, "createAgentModelsConfigurationWithProvenance", { enumerable: true, get: function () { return agent_model_configuration_values_js_2.createAgentModelsConfigurationWithProvenance; } });
Object.defineProperty(exports, "sameModelAgentIdentity", { enumerable: true, get: function () { return agent_model_configuration_values_js_2.sameModelAgentIdentity; } });
const contextModels = { modelConfiguration: agent_model_configuration_values_js_1.AgentModelsConfigurationSchema.optional() };
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
    if (!(0, agent_model_configuration_values_js_1.sameModelAgentIdentity)(config.identity, declared.identity)) {
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
exports.AgentContextWithModelProvenanceSchema = agent_context_identity_js_1.AgentContextWithIdentitySchema.and(exports.AgentContextWithModelsSchema.safeExtend({ modelConfiguration: agent_model_configuration_values_js_1.AgentModelsConfigurationWithProvenanceSchema }));
exports.AgentContextWithModelProvenanceWriteSchema = agent_context_identity_js_1.AgentContextWithIdentityWriteSchema.and(exports.AgentContextWithModelsWriteSchema.safeExtend({ modelConfiguration: agent_model_configuration_values_js_1.AgentModelsConfigurationWithProvenanceSchema }));
exports.AgentRuntimeModelSelectionSchema = zod_1.z.object({
    slotId: model_slot_js_1.ModelSlotIdSchema,
    capability: parameters_js_1.CapabilityAgentParametersSchema.shape.capability,
    function: model_catalog_js_1.ModelFunctionSchema,
    tier: agent_model_configuration_values_js_1.ModelSelectionTierSchema,
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
const ModelInitialSourceBaseSchema = zod_1.z.object({
    schemaVersion: zod_1.z.literal(1), identity: agent_model_configuration_values_js_1.CompleteModelIdentitySchema, scope: ModelSourceScopeSchema,
    authority: zod_1.z.literal('runtime-loaded'),
    sourceVersion: model_slot_js_1.AgentModelBootstrapSourceVersionSchema,
    observedAt: zod_1.z.iso.datetime({ offset: true }), validUntil: zod_1.z.iso.datetime({ offset: true }),
    coverage: zod_1.z.enum(['complete', 'partial']),
    selections: zod_1.z.array(agent_model_configuration_values_js_1.AgentModelSelectionSchema).max(64), missingSlots: zod_1.z.array(model_slot_js_1.ModelSlotIdSchema).max(64),
    /** Absence of a service must be observed at the same generation; active unknown models remain missing. */
    excludedSlots: zod_1.z.array(zod_1.z.object({ slotId: model_slot_js_1.ModelSlotIdSchema, state: zod_1.z.enum(['not-installed', 'not-applicable']), reason: zod_1.z.string().trim().min(1).max(500) }).strict()).max(64).optional(),
}).strict();
const checkLoadedModelSource = (source, ctx) => {
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
};
/** Loaded selections before first Forge apply; an explicit role is strictly rejected. */
exports.AgentModelInitialSourceSchema = ModelInitialSourceBaseSchema.superRefine(checkLoadedModelSource);
exports.AgentModelBootstrapSourceSchema = ModelInitialSourceBaseSchema.extend({ role: zod_1.z.literal('master') }).superRefine(checkLoadedModelSource);
exports.AgentModelBootstrapSourceExpectationSchema = zod_1.z.object({ identity: agent_model_configuration_values_js_1.CompleteModelIdentitySchema, scope: ModelSourceScopeSchema, sourceVersion: model_slot_js_1.AgentModelBootstrapSourceVersionSchema }).strict();
/** Caller supplies a fresh server-side generation recheck after awaits. Parsing alone cannot prove runtime authority. */
function isAgentModelBootstrapSourceCurrent(input, expected, now = new Date()) {
    return isLoadedModelSourceCurrent(input, expected, exports.AgentModelBootstrapSourceSchema, now);
}
/** Bootstrap-equivalent validity; callers still recheck the actual generation after awaits. */
function isAgentModelInitialSourceCurrent(input, expected, now = new Date()) {
    return isLoadedModelSourceCurrent(input, expected, exports.AgentModelInitialSourceSchema, now);
}
function isLoadedModelSourceCurrent(input, expected, sourceSchema, now) {
    const parsed = sourceSchema.safeParse(input);
    const target = exports.AgentModelBootstrapSourceExpectationSchema.safeParse(expected);
    if (!parsed.success || !target.success)
        return false;
    const source = parsed.data;
    const expectation = target.data;
    const time = now.getTime();
    if (source.coverage !== 'complete' || source.selections.length === 0 || !Number.isFinite(time) || time < Date.parse(source.observedAt) - 5_000 || time >= Date.parse(source.validUntil))
        return false;
    return source.sourceVersion === expectation.sourceVersion && (0, agent_model_configuration_values_js_1.sameModelAgentIdentity)(source.identity, expectation.identity) && (0, capability_call_context_js_1.sameCapabilityScope)(source.scope, expectation.scope);
}
/** Loaded modern source generation; never inferred from Forge's configuration version. */
exports.AgentModelSourceObservationSchema = exports.AgentModelBootstrapSourceExpectationSchema.safeExtend({
    observedAt: zod_1.z.iso.datetime({ offset: true }), validUntil: zod_1.z.iso.datetime({ offset: true }),
}).superRefine((source, ctx) => {
    if (source.scope.agentId !== source.identity.runtimeAgentId)
        ctx.addIssue({ code: 'custom', path: ['scope', 'agentId'], message: 'Observed model source scope must name its runtime identity' });
    if (Date.parse(source.validUntil) <= Date.parse(source.observedAt))
        ctx.addIssue({ code: 'custom', path: ['validUntil'], message: 'Observed source validity must end after observation' });
});
/** A fresh HTTP generation is necessary for a command; producers still recheck after every await. */
function isAgentModelSourceObservationCurrent(input, expected, now = new Date()) {
    const parsed = exports.AgentModelSourceObservationSchema.safeParse(input);
    const target = exports.AgentModelBootstrapSourceExpectationSchema.safeParse(expected);
    if (!parsed.success || !target.success)
        return false;
    const source = parsed.data;
    const expectation = target.data;
    const time = now.getTime();
    const observed = Date.parse(source.observedAt);
    if (!Number.isFinite(time) || time < observed - 5_000 || time > observed + 60_000 || time >= Date.parse(source.validUntil))
        return false;
    return source.sourceVersion === expectation.sourceVersion && (0, agent_model_configuration_values_js_1.sameModelAgentIdentity)(source.identity, expectation.identity) && (0, capability_call_context_js_1.sameCapabilityScope)(source.scope, expectation.scope);
}
exports.AgentModelsStateSchema = zod_1.z.object({
    identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.strict(),
    versions: agent_management_js_1.AgentConfigVersionStateSchema.nullable(),
    saved: agent_model_configuration_values_js_1.AgentModelsConfigurationSchema.nullable(),
    runtime: exports.AgentModelRuntimeAttestationSchema.nullable(),
    /** Absent on existing consumers; explicit null means no qualified loaded Master source. */
    bootstrapSource: exports.AgentModelBootstrapSourceSchema.nullable().optional(),
    /** Actual generation of an already saved, scoped runtime configuration; no default for old producers. */
    sourceObservation: exports.AgentModelSourceObservationSchema.nullable().optional(),
    /** Before persisted authority exists; this source does not assign the Master role. */
    initialSource: exports.AgentModelInitialSourceSchema.nullable().optional(),
}).strict().superRefine((state, ctx) => {
    if (state.initialSource != null) {
        if (!(0, agent_model_configuration_values_js_1.sameModelAgentIdentity)(state.identity, state.initialSource.identity))
            ctx.addIssue({ code: 'custom', path: ['initialSource', 'identity'], message: 'Initial source belongs to this state identity' });
        if (state.saved !== null || state.runtime !== null || state.versions !== null)
            ctx.addIssue({ code: 'custom', path: ['initialSource'], message: 'Initial source cannot claim a saved or applied version' });
        if (state.bootstrapSource != null || state.sourceObservation != null)
            ctx.addIssue({ code: 'custom', path: ['initialSource'], message: 'Initial source cannot coexist with another model authority' });
    }
    if (state.sourceObservation != null) {
        const source = state.sourceObservation;
        if (state.saved === null || state.saved.provenance === undefined)
            ctx.addIssue({ code: 'custom', path: ['sourceObservation'], message: 'Modern source observation requires saved scoped model authority' });
        if (!(0, agent_model_configuration_values_js_1.sameModelAgentIdentity)(state.identity, source.identity))
            ctx.addIssue({ code: 'custom', path: ['sourceObservation', 'identity'], message: 'Observed source belongs to this state identity' });
        if (state.saved?.provenance !== undefined && !(0, capability_call_context_js_1.sameCapabilityScope)(state.saved.provenance.scope, source.scope))
            ctx.addIssue({ code: 'custom', path: ['sourceObservation', 'scope'], message: 'Observed source belongs to the saved model scope' });
    }
    if (state.bootstrapSource != null) {
        if (!(0, agent_model_configuration_values_js_1.sameModelAgentIdentity)(state.identity, state.bootstrapSource.identity))
            ctx.addIssue({ code: 'custom', path: ['bootstrapSource', 'identity'], message: 'Bootstrap source belongs to this state identity' });
        if (state.saved !== null || state.runtime !== null || state.versions !== null)
            ctx.addIssue({ code: 'custom', path: ['bootstrapSource'], message: 'Bootstrap source cannot claim a saved or applied version' });
    }
    if (state.saved !== null) {
        if (!(0, agent_model_configuration_values_js_1.sameModelAgentIdentity)(state.identity, state.saved.identity))
            ctx.addIssue({ code: 'custom', path: ['saved', 'identity'], message: 'Saved models belong to another agent' });
        if (state.saved.configVersion !== state.versions?.desired)
            ctx.addIssue({ code: 'custom', path: ['saved', 'configVersion'], message: 'Saved model version must be the desired version' });
    }
    if (state.runtime !== null) {
        if (!(0, agent_model_configuration_values_js_1.sameModelAgentIdentity)(state.identity, state.runtime.identity))
            ctx.addIssue({ code: 'custom', path: ['runtime', 'identity'], message: 'Runtime models belong to another agent' });
        if (state.runtime.configVersion !== state.versions?.applied)
            ctx.addIssue({ code: 'custom', path: ['runtime', 'configVersion'], message: 'Runtime model version must be the applied version' });
    }
});
/** No side effects: null, timeout, stale or mismatched evidence remains unconfirmed; identical replays are valid. */
function isAgentModelApplyConfirmed(configuration, requestedCommand, processedResult, runtimeEvidence, now = new Date()) {
    const config = agent_model_configuration_values_js_1.AgentModelsConfigurationSchema.safeParse(configuration);
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
    if (request.modelConfiguration !== undefined) {
        const authority = agent_model_configuration_values_js_1.AgentModelsConfigurationWithProvenanceSchema.safeParse(saved);
        if (!authority.success || !(0, agent_management_js_1.sameAgentCommand)(request, { ...request, modelConfiguration: authority.data }))
            return false;
    }
    if (request.desiredVersion !== saved.configVersion || response.versions?.applied !== saved.configVersion || actual.configVersion !== saved.configVersion)
        return false;
    if (response.requestId !== request.requestId || actual.requestId !== request.requestId)
        return false;
    if (response.agentId !== saved.identity.managementAgentId || response.identity === undefined || !(0, agent_model_configuration_values_js_1.sameModelAgentIdentity)(saved.identity, response.identity) || !(0, agent_model_configuration_values_js_1.sameModelAgentIdentity)(saved.identity, actual.identity))
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
    const config = agent_model_configuration_values_js_1.AgentModelsConfigurationSchema.safeParse(configuration);
    const evidence = exports.AgentModelRuntimeAttestationSchema.safeParse(runtimeEvidence);
    if (!config.success || !evidence.success)
        return false;
    const saved = config.data;
    const actual = evidence.data;
    if (!(0, agent_model_configuration_values_js_1.sameModelAgentIdentity)(saved.identity, actual.identity) || saved.configVersion !== actual.configVersion)
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
/** Recheck the actual runtime source after awaits, before committing explicit model authority. */
function isAgentModelCommandSourceCurrent(input, freshSource, now = new Date()) {
    const command = agent_management_js_1.AgentManagementCommandSchema.safeParse(input);
    const source = zod_1.z.union([exports.AgentModelSourceObservationSchema, exports.AgentModelBootstrapSourceExpectationSchema]).safeParse(freshSource);
    if (!command.success || command.data.action !== 'apply-config' || command.data.modelConfiguration === undefined || !source.success)
        return false;
    const configuration = command.data.modelConfiguration;
    if ('observedAt' in source.data)
        return isAgentModelSourceObservationCurrent(source.data, { identity: configuration.identity, scope: configuration.provenance.scope, sourceVersion: command.data.modelExpectedSourceVersion }, now);
    return command.data.modelExpectedSourceVersion === source.data.sourceVersion && (0, agent_model_configuration_values_js_1.sameModelAgentIdentity)(configuration.identity, source.data.identity) && (0, capability_call_context_js_1.sameCapabilityScope)(configuration.provenance.scope, source.data.scope);
}
//# sourceMappingURL=agent-model-configuration.js.map