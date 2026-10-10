import { z } from 'zod';
import { AgentContextIdentitySchema, AgentContextWithIdentitySchema, AgentContextWithIdentityWriteSchema } from "../agent/agent-context-identity.js";
import { CapabilityAgentScopeSchema, sameCapabilityScope } from "../capability/capability-call-context.js";
import { AgentRuntimeIdentitySchema } from "../agent/agent-runtime-identity.js";
import { AgentConfigVersionStateSchema, AgentManagementCommandSchema, AgentManagementCommandResultSchema, AgentManagementRequestIdSchema } from "../agent/agent-management.js";
import { AgentContextFileSchema, AgentContextFileWriteSchema } from "../agent/agent-context-file.js";
import { AgentConfigVersionSchema } from "../capability/ricerca/agent-config.js";
import { CapabilityAgentParametersSchema } from "../capability/parameters.js";
import { CapabilityModelSettingsSchema } from "./capability-model-settings.js";
import { MODEL_TIERS } from "./model-tier.js";
import { ModelDescriptorSchema, ModelFunctionSchema, sameModelDescriptor } from "./model-catalog.js";
/** Canonical conversation slot; memory/audio slots are added with their qualified consumers. */
export const AGENT_CHAT_MODEL_SLOT_ID = 'agent_chat';
/** Generic syntax stays additive for existing custom and future consumer slots. */
export const ModelSlotIdSchema = z.string().regex(/^[a-z][a-z0-9._-]{0,63}$/);
export const ModelSelectionTierSchema = z.enum([...MODEL_TIERS, 'fallback']);
export const AgentModelSelectionSchema = z.object({ slotId: ModelSlotIdSchema, settings: CapabilityModelSettingsSchema }).strict();
/** Complete declared model authority; legacy runtime mappings remain optional elsewhere. */
const CompleteModelIdentitySchema = AgentRuntimeIdentitySchema.extend({
    managementAgentId: AgentRuntimeIdentitySchema.shape.managementAgentId.refine(value => value.trim().length > 0, 'Model identity must not be blank'),
    runtimeAgentId: AgentRuntimeIdentitySchema.shape.runtimeAgentId.refine(value => value.trim().length > 0, 'Model identity must not be blank'),
    vaultAgentId: z.number().int().positive(),
}).strict();
/** Source-neutral metadata: the store resolves this declared source and verifies its current version. */
export const AgentModelSourceSchema = z.object({
    identity: CompleteModelIdentitySchema,
    sourceVersion: AgentConfigVersionSchema,
}).strict();
/** Custom remains custom even when its descriptor equals the source's descriptor. */
export const AgentModelBindingSchema = z.discriminatedUnion('origin', [
    z.object({ slotId: ModelSlotIdSchema, origin: z.literal('master'), source: AgentModelSourceSchema }).strict(),
    z.object({ slotId: ModelSlotIdSchema, origin: z.literal('custom'), source: z.never().optional() }).strict(),
]);
/** One explicit binding per selection; scope is declared authority, never provider credentials. */
export const AgentModelsProvenanceSchema = z.object({
    scope: CapabilityAgentScopeSchema.refine(scope => [scope.agentId, scope.ownerId, scope.tenantId].every(value => value.trim().length > 0), 'Model scope must not be blank'),
    bindings: z.array(AgentModelBindingSchema).min(1).max(64),
}).strict().superRefine((value, ctx) => {
    if (new Set(value.bindings.map(binding => binding.slotId)).size !== value.bindings.length) {
        ctx.addIssue({ code: 'custom', path: ['bindings'], message: 'Duplicate model binding' });
    }
});
export const AgentModelsConfigurationSchema = z.object({
    schemaVersion: z.literal(1),
    identity: AgentRuntimeIdentitySchema.strict(),
    configVersion: AgentConfigVersionSchema,
    selections: z.array(AgentModelSelectionSchema).min(1).max(64),
    /** Absent on 1.43 legacy; malformed explicit provenance is never discarded. */
    provenance: AgentModelsProvenanceSchema.optional(),
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
export const AgentModelsConfigurationWithProvenanceSchema = AgentModelsConfigurationSchema.safeExtend({
    identity: CompleteModelIdentitySchema,
    provenance: AgentModelsProvenanceSchema,
});
/** Parsing returns detached metadata and supplies no source, binding or model defaults. */
export function createAgentModelsConfigurationWithProvenance(input) {
    return AgentModelsConfigurationWithProvenanceSchema.parse(input);
}
/** Compare the canonical mapping, including the optional Vault numeric identity. */
export function sameModelAgentIdentity(left, right) {
    return left.managementAgentId === right.managementAgentId && left.runtimeAgentId === right.runtimeAgentId && left.vaultAgentId === right.vaultAgentId;
}
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
}).strict();
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
export const AgentModelsStateSchema = z.object({
    identity: AgentRuntimeIdentitySchema.strict(),
    versions: AgentConfigVersionStateSchema.nullable(),
    saved: AgentModelsConfigurationSchema.nullable(),
    runtime: AgentModelRuntimeAttestationSchema.nullable(),
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
    return saved.selections.every(slot => [...MODEL_TIERS, 'fallback'].every(tier => {
        const selection = actual.selections.find(entry => entry.slotId === slot.slotId && entry.tier === tier);
        const expected = tier === 'fallback' ? slot.settings.fallback : slot.settings.tiers[tier];
        return selection !== undefined && selection.capability === slot.settings.capability && selection.function === slot.settings.function && sameModelDescriptor(selection.descriptor, expected);
    }));
}
//# sourceMappingURL=agent-model-configuration.js.map