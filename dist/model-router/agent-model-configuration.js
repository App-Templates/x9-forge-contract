import { z } from 'zod';
import { AgentContextIdentitySchema, AgentContextWithIdentitySchema, AgentContextWithIdentityWriteSchema } from "../agent/agent-context-identity.js";
import { CapabilityAgentScopeSchema, sameCapabilityScope } from "../capability/capability-call-context.js";
import { AgentRuntimeIdentitySchema } from "../agent/agent-runtime-identity.js";
import { AgentConfigVersionStateSchema, AgentManagementCommandSchema, AgentManagementCommandResultSchema, AgentManagementRequestIdSchema, sameAgentCommand } from "../agent/agent-management.js";
import { AgentContextFileSchema, AgentContextFileWriteSchema } from "../agent/agent-context-file.js";
import { AgentConfigVersionSchema } from "../capability/ricerca/agent-config.js";
import { CapabilityAgentParametersSchema } from "../capability/parameters.js";
import { modelSettingsSelections, sameModelFeatures } from "./capability-model-settings.js";
import { ModelSlotIdSchema, AgentModelBootstrapSourceVersionSchema } from "./model-slot.js";
import { findModelConsumerDefinition, registeredModelConsumers } from "./model-consumers.js";
export { AGENT_CHAT_MODEL_SLOT_ID, ModelSlotIdSchema, AgentModelBootstrapSourceVersionSchema, AgentModelBootstrapPreconditionSchema } from "./model-slot.js";
import { ModelDescriptorSchema, ModelFunctionSchema, sameModelDescriptor } from "./model-catalog.js";
import { ModelSelectionTierSchema, AgentModelSelectionSchema, CompleteModelIdentitySchema, AgentModelsConfigurationSchema, AgentModelsConfigurationWithProvenanceSchema, sameModelAgentIdentity } from "./agent-model-configuration-values.js";
export { ModelSelectionTierSchema, AgentModelSelectionSchema, AgentModelSourceSchema, AgentModelBindingSchema, AgentModelsProvenanceSchema, AgentModelsConfigurationSchema, AgentModelsConfigurationWithProvenanceSchema, createAgentModelsConfigurationWithProvenance, sameModelAgentIdentity } from "./agent-model-configuration-values.js";
const contextModels = { modelConfiguration: AgentModelsConfigurationSchema.optional() };
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
    const authority = AgentContextIdentitySchema.safeParse({
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
    if (!sameCapabilityScope(config.provenance.scope, { agentId: declared.agentId, ownerId: declared.ownerId, tenantId: declared.tenantId })) {
        ctx.addIssue({ code: 'custom', path: ['modelConfiguration', 'provenance', 'scope'], message: 'Models belong to another owner or tenant' });
    }
    for (const [index, binding] of config.provenance.bindings.entries()) {
        if (binding.origin === 'master' && (declared.role !== 'erede' || binding.source.identity.runtimeAgentId !== declared.masterAgentId)) {
            ctx.addIssue({ code: 'custom', path: ['modelConfiguration', 'provenance', 'bindings', index, 'source'], message: 'Inherited model source must match the declared runtime Master' });
        }
    }
};
/** Explicit, validated models are authoritative; malformed/null values never fall back to legacy llmConfig. */
export const AgentContextWithModelsSchema = AgentContextFileSchema.safeExtend(contextModels).superRefine(checkContext);
export const AgentContextWithModelsWriteSchema = AgentContextFileWriteSchema.safeExtend(contextModels).superRefine(checkContext);
/** Complete identity/channel guards plus mandatory, scoped model provenance. */
export const AgentContextWithModelProvenanceSchema = AgentContextWithIdentitySchema.and(AgentContextWithModelsSchema.safeExtend({ modelConfiguration: AgentModelsConfigurationWithProvenanceSchema }));
export const AgentContextWithModelProvenanceWriteSchema = AgentContextWithIdentityWriteSchema.and(AgentContextWithModelsWriteSchema.safeExtend({ modelConfiguration: AgentModelsConfigurationWithProvenanceSchema }));
export const AgentRuntimeModelSelectionSchema = z.object({
    slotId: ModelSlotIdSchema,
    capability: CapabilityAgentParametersSchema.shape.capability,
    function: ModelFunctionSchema,
    tier: ModelSelectionTierSchema,
    descriptor: ModelDescriptorSchema,
    embeddingDimensions: z.number().int().positive().optional(),
}).strict().superRefine((selection, ctx) => {
    if (selection.embeddingDimensions !== undefined && selection.function !== 'embedding')
        ctx.addIssue({ code: 'custom', path: ['embeddingDimensions'], message: 'Vector dimension belongs only to embedding' });
});
/** Producer evidence of the selections actually installed for each function/tier, not a global reload count. */
export const AgentModelRuntimeAttestationSchema = z.object({
    identity: AgentRuntimeIdentitySchema.strict(),
    configVersion: AgentConfigVersionSchema,
    requestId: AgentManagementRequestIdSchema,
    observedAt: z.iso.datetime({ offset: true }),
    selections: z.array(AgentRuntimeModelSelectionSchema).min(1).max(256),
}).strict().superRefine((evidence, ctx) => {
    if (new Set(evidence.selections.map(entry => `${entry.slotId}:${entry.tier}`)).size !== evidence.selections.length)
        ctx.addIssue({ code: 'custom', path: ['selections'], message: 'Duplicate runtime slot/tier' });
});
/** Read-only generation of the actually loaded Master, never a saved/applied configuration version. */
const ModelSourceScopeSchema = CapabilityAgentScopeSchema.refine(scope => [scope.agentId, scope.ownerId, scope.tenantId].every(value => value.trim().length > 0), 'Source scope must not be blank');
const ModelInitialSourceBaseSchema = z.object({
    schemaVersion: z.literal(1), identity: CompleteModelIdentitySchema, scope: ModelSourceScopeSchema,
    authority: z.literal('runtime-loaded'),
    sourceVersion: AgentModelBootstrapSourceVersionSchema,
    observedAt: z.iso.datetime({ offset: true }), validUntil: z.iso.datetime({ offset: true }),
    coverage: z.enum(['complete', 'partial']),
    selections: z.array(AgentModelSelectionSchema).max(64), missingSlots: z.array(ModelSlotIdSchema).max(64),
    /** Absence of a service must be observed at the same generation; active unknown models remain missing. */
    excludedSlots: z.array(z.object({ slotId: ModelSlotIdSchema, state: z.enum(['not-installed', 'not-applicable']), reason: z.string().trim().min(1).max(500) }).strict()).max(64).optional(),
}).strict();
const checkLoadedModelSource = (source, ctx) => {
    if (source.scope.agentId !== source.identity.runtimeAgentId)
        ctx.addIssue({ code: 'custom', path: ['scope'], message: 'Source scope names its runtime exactly' });
    if (Date.parse(source.validUntil) <= Date.parse(source.observedAt))
        ctx.addIssue({ code: 'custom', path: ['validUntil'], message: 'Source validity ends after observation' });
    const present = source.selections.map(selection => selection.slotId);
    const all = [...present, ...source.missingSlots, ...(source.excludedSlots ?? []).map(slot => slot.slotId)];
    const registered = registeredModelConsumers().map(consumer => consumer.slotId);
    if (new Set(all).size !== all.length || all.length !== registered.length || registered.some(slot => !all.includes(slot)))
        ctx.addIssue({ code: 'custom', path: ['selections'], message: 'Every registered slot is present or missing exactly once' });
    if ((source.coverage === 'complete') !== (source.missingSlots.length === 0) || (source.coverage === 'complete' && source.selections.length === 0))
        ctx.addIssue({ code: 'custom', path: ['coverage'], message: 'Complete means no missing consumer' });
    for (const [index, selection] of source.selections.entries()) {
        const consumer = findModelConsumerDefinition(selection.slotId);
        const actual = selection.settings;
        if (consumer === undefined || consumer.capability !== actual.capability || consumer.function !== actual.function || !sameModelFeatures(consumer.requirements, actual.requirements) || consumer.routing !== (actual.mode === 'single' ? 'single' : actual.mode === 'failover' ? 'failover' : 'tiered'))
            ctx.addIssue({ code: 'custom', path: ['selections', index], message: 'Source settings must match the canonical consumer and its requirements' });
    }
};
/** Loaded selections before first Forge apply; an explicit role is strictly rejected. */
export const AgentModelInitialSourceSchema = ModelInitialSourceBaseSchema.superRefine(checkLoadedModelSource);
export const AgentModelBootstrapSourceSchema = ModelInitialSourceBaseSchema.extend({ role: z.literal('master') }).superRefine(checkLoadedModelSource);
export const AgentModelBootstrapSourceExpectationSchema = z.object({ identity: CompleteModelIdentitySchema, scope: ModelSourceScopeSchema, sourceVersion: AgentModelBootstrapSourceVersionSchema }).strict();
/** Caller supplies a fresh server-side generation recheck after awaits. Parsing alone cannot prove runtime authority. */
export function isAgentModelBootstrapSourceCurrent(input, expected, now = new Date()) {
    return isLoadedModelSourceCurrent(input, expected, AgentModelBootstrapSourceSchema, now);
}
/** Bootstrap-equivalent validity; callers still recheck the actual generation after awaits. */
export function isAgentModelInitialSourceCurrent(input, expected, now = new Date()) {
    return isLoadedModelSourceCurrent(input, expected, AgentModelInitialSourceSchema, now);
}
function isLoadedModelSourceCurrent(input, expected, sourceSchema, now) {
    const parsed = sourceSchema.safeParse(input);
    const target = AgentModelBootstrapSourceExpectationSchema.safeParse(expected);
    if (!parsed.success || !target.success)
        return false;
    const source = parsed.data;
    const expectation = target.data;
    const time = now.getTime();
    if (source.coverage !== 'complete' || source.selections.length === 0 || !Number.isFinite(time) || time < Date.parse(source.observedAt) - 5_000 || time >= Date.parse(source.validUntil))
        return false;
    return source.sourceVersion === expectation.sourceVersion && sameModelAgentIdentity(source.identity, expectation.identity) && sameCapabilityScope(source.scope, expectation.scope);
}
/** Loaded modern source generation; never inferred from Forge's configuration version. */
export const AgentModelSourceObservationSchema = AgentModelBootstrapSourceExpectationSchema.safeExtend({
    observedAt: z.iso.datetime({ offset: true }), validUntil: z.iso.datetime({ offset: true }),
}).superRefine((source, ctx) => {
    if (source.scope.agentId !== source.identity.runtimeAgentId)
        ctx.addIssue({ code: 'custom', path: ['scope', 'agentId'], message: 'Observed model source scope must name its runtime identity' });
    if (Date.parse(source.validUntil) <= Date.parse(source.observedAt))
        ctx.addIssue({ code: 'custom', path: ['validUntil'], message: 'Observed source validity must end after observation' });
});
/** A fresh HTTP generation is necessary for a command; producers still recheck after every await. */
export function isAgentModelSourceObservationCurrent(input, expected, now = new Date()) {
    const parsed = AgentModelSourceObservationSchema.safeParse(input);
    const target = AgentModelBootstrapSourceExpectationSchema.safeParse(expected);
    if (!parsed.success || !target.success)
        return false;
    const source = parsed.data;
    const expectation = target.data;
    const time = now.getTime();
    const observed = Date.parse(source.observedAt);
    if (!Number.isFinite(time) || time < observed - 5_000 || time > observed + 60_000 || time >= Date.parse(source.validUntil))
        return false;
    return source.sourceVersion === expectation.sourceVersion && sameModelAgentIdentity(source.identity, expectation.identity) && sameCapabilityScope(source.scope, expectation.scope);
}
export const AgentModelsStateSchema = z.object({
    identity: AgentRuntimeIdentitySchema.strict(),
    versions: AgentConfigVersionStateSchema.nullable(),
    saved: AgentModelsConfigurationSchema.nullable(),
    runtime: AgentModelRuntimeAttestationSchema.nullable(),
    /** Absent on existing consumers; explicit null means no qualified loaded Master source. */
    bootstrapSource: AgentModelBootstrapSourceSchema.nullable().optional(),
    /** Actual generation of an already saved, scoped runtime configuration; no default for old producers. */
    sourceObservation: AgentModelSourceObservationSchema.nullable().optional(),
    /** Before persisted authority exists; this source does not assign the Master role. */
    initialSource: AgentModelInitialSourceSchema.nullable().optional(),
}).strict().superRefine((state, ctx) => {
    if (state.initialSource != null) {
        if (!sameModelAgentIdentity(state.identity, state.initialSource.identity))
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
        if (!sameModelAgentIdentity(state.identity, source.identity))
            ctx.addIssue({ code: 'custom', path: ['sourceObservation', 'identity'], message: 'Observed source belongs to this state identity' });
        if (state.saved?.provenance !== undefined && !sameCapabilityScope(state.saved.provenance.scope, source.scope))
            ctx.addIssue({ code: 'custom', path: ['sourceObservation', 'scope'], message: 'Observed source belongs to the saved model scope' });
    }
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
export function isAgentModelApplyConfirmed(configuration, requestedCommand, processedResult, runtimeEvidence, now = new Date()) {
    const config = AgentModelsConfigurationSchema.safeParse(configuration);
    const command = AgentManagementCommandSchema.safeParse(requestedCommand);
    const result = AgentManagementCommandResultSchema.safeParse(processedResult);
    const attestation = AgentModelRuntimeAttestationSchema.safeParse(runtimeEvidence);
    if (!config.success || !command.success || !result.success || !attestation.success)
        return false;
    const saved = config.data;
    const request = command.data;
    const response = result.data;
    const actual = attestation.data;
    if (request.action !== 'apply-config' || response.action !== 'apply-config')
        return false;
    if (request.modelConfiguration !== undefined) {
        const authority = AgentModelsConfigurationWithProvenanceSchema.safeParse(saved);
        if (!authority.success || !sameAgentCommand(request, { ...request, modelConfiguration: authority.data }))
            return false;
    }
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
export function isAgentModelRuntimeConfigurationMatching(configuration, runtimeEvidence, now = new Date()) {
    const config = AgentModelsConfigurationSchema.safeParse(configuration);
    const evidence = AgentModelRuntimeAttestationSchema.safeParse(runtimeEvidence);
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
    if (actual.selections.length !== saved.selections.reduce((count, slot) => count + modelSettingsSelections(slot.settings).length, 0))
        return false;
    return saved.selections.every(slot => modelSettingsSelections(slot.settings).every(({ tier, descriptor }) => {
        const selection = actual.selections.find(entry => entry.slotId === slot.slotId && entry.tier === tier);
        const dimensionMatches = slot.settings.mode !== 'single' || slot.settings.function !== 'embedding' || selection?.embeddingDimensions === slot.settings.embeddingDimensions;
        return selection !== undefined && dimensionMatches && selection.capability === slot.settings.capability && selection.function === slot.settings.function && sameModelDescriptor(selection.descriptor, descriptor);
    }));
}
/** Recheck the actual runtime source after awaits, before committing explicit model authority. */
export function isAgentModelCommandSourceCurrent(input, freshSource, now = new Date()) {
    const command = AgentManagementCommandSchema.safeParse(input);
    const source = z.union([AgentModelSourceObservationSchema, AgentModelBootstrapSourceExpectationSchema]).safeParse(freshSource);
    if (!command.success || command.data.action !== 'apply-config' || command.data.modelConfiguration === undefined || !source.success)
        return false;
    const configuration = command.data.modelConfiguration;
    if ('observedAt' in source.data)
        return isAgentModelSourceObservationCurrent(source.data, { identity: configuration.identity, scope: configuration.provenance.scope, sourceVersion: command.data.modelExpectedSourceVersion }, now);
    return command.data.modelExpectedSourceVersion === source.data.sourceVersion && sameModelAgentIdentity(configuration.identity, source.data.identity) && sameCapabilityScope(configuration.provenance.scope, source.data.scope);
}
//# sourceMappingURL=agent-model-configuration.js.map