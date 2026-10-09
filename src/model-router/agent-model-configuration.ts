import { z } from 'zod';
import { AgentContextIdentitySchema, AgentContextWithIdentitySchema, AgentContextWithIdentityWriteSchema } from '../agent/agent-context-identity.js';
import { CapabilityAgentScopeSchema, sameCapabilityScope } from '../capability/capability-call-context.js';
import { AgentRuntimeIdentitySchema, type AgentRuntimeIdentity } from '../agent/agent-runtime-identity.js';
import { AgentConfigVersionStateSchema, AgentManagementCommandSchema, AgentManagementCommandResultSchema, AgentManagementRequestIdSchema } from '../agent/agent-management.js';
import { AgentContextFileSchema, AgentContextFileWriteSchema } from '../agent/agent-context-file.js';
import { AgentConfigVersionSchema } from '../capability/ricerca/agent-config.js';
import { CapabilityAgentParametersSchema } from '../capability/parameters.js';
import { CapabilityModelSettingsSchema, modelSettingsSelections, sameModelFeatures } from './capability-model-settings.js';
import { MODEL_TIERS } from './model-tier.js';
import { ModelSlotIdSchema, AgentModelBootstrapSourceVersionSchema } from './model-slot.js';
import { findModelConsumerDefinition, registeredModelConsumers } from './model-consumers.js';
export { AGENT_CHAT_MODEL_SLOT_ID, ModelSlotIdSchema, AgentModelBootstrapSourceVersionSchema, AgentModelBootstrapPreconditionSchema } from './model-slot.js';
import { ModelDescriptorSchema, ModelFunctionSchema, sameModelDescriptor } from './model-catalog.js';

export const ModelSelectionTierSchema = z.enum([...MODEL_TIERS, 'fallback', 'primary']);
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
export type AgentModelSource = z.infer<typeof AgentModelSourceSchema>;

/** Custom remains custom even when its descriptor equals the source's descriptor. */
export const AgentModelBindingSchema = z.discriminatedUnion('origin', [
  z.object({ slotId: ModelSlotIdSchema, origin: z.literal('master'), source: AgentModelSourceSchema }).strict(),
  z.object({ slotId: ModelSlotIdSchema, origin: z.literal('custom'), source: z.never().optional() }).strict(),
]);
export type AgentModelBinding = z.infer<typeof AgentModelBindingSchema>;

/** One explicit binding per selection; scope is declared authority, never provider credentials. */
export const AgentModelsProvenanceSchema = z.object({
  scope: CapabilityAgentScopeSchema.refine(scope => [scope.agentId, scope.ownerId, scope.tenantId].every(value => value.trim().length > 0), 'Model scope must not be blank'),
  bindings: z.array(AgentModelBindingSchema).min(1).max(64),
}).strict().superRefine((value, ctx) => {
  if (new Set(value.bindings.map(binding => binding.slotId)).size !== value.bindings.length) {
    ctx.addIssue({ code: 'custom', path: ['bindings'], message: 'Duplicate model binding' });
  }
});
export type AgentModelsProvenance = z.infer<typeof AgentModelsProvenanceSchema>;

export const AgentModelsConfigurationSchema = z.object({
  schemaVersion: z.literal(1),
  identity: AgentRuntimeIdentitySchema.strict(),
  configVersion: AgentConfigVersionSchema,
  selections: z.array(AgentModelSelectionSchema).min(1).max(64),
  /** Absent on 1.43 legacy; malformed explicit provenance is never discarded. */
  provenance: AgentModelsProvenanceSchema.optional(),
}).strict().superRefine((config, ctx) => {
  if (new Set(config.selections.map(entry => entry.slotId)).size !== config.selections.length) ctx.addIssue({ code: 'custom', path: ['selections'], message: 'Duplicate model slot' });
  if (config.provenance === undefined) return;
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
  const sources: AgentModelSource['identity'][] = [];
  for (const [index, binding] of provenance.bindings.entries()) {
    if (binding.origin !== 'master') continue;
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
export type AgentModelsConfiguration = z.infer<typeof AgentModelsConfigurationSchema>;

/** Modern store/writer boundary: provenance and all three identifiers are mandatory. */
export const AgentModelsConfigurationWithProvenanceSchema = AgentModelsConfigurationSchema.safeExtend({
  identity: CompleteModelIdentitySchema,
  provenance: AgentModelsProvenanceSchema,
});
export type AgentModelsConfigurationWithProvenance = z.infer<typeof AgentModelsConfigurationWithProvenanceSchema>;
export type AgentModelsConfigurationWithProvenanceInput = z.input<typeof AgentModelsConfigurationWithProvenanceSchema>;

/** Parsing returns detached metadata and supplies no source, binding or model defaults. */
export function createAgentModelsConfigurationWithProvenance(input: AgentModelsConfigurationWithProvenanceInput): AgentModelsConfigurationWithProvenance {
  return AgentModelsConfigurationWithProvenanceSchema.parse(input);
}


/** Compare the canonical mapping, including the optional Vault numeric identity. */
export function sameModelAgentIdentity(left: AgentRuntimeIdentity, right: AgentRuntimeIdentity): boolean {
  return left.managementAgentId === right.managementAgentId && left.runtimeAgentId === right.runtimeAgentId && left.vaultAgentId === right.vaultAgentId;
}

const contextModels = { modelConfiguration: AgentModelsConfigurationSchema.optional() };
const checkContext = (context: { agentId: string; configVersion?: number | undefined; modelConfiguration?: AgentModelsConfiguration | undefined } & Record<string, unknown>, ctx: z.RefinementCtx): void => {
  if (context.modelConfiguration === undefined) return;
  const config = context.modelConfiguration;
  if (context.configVersion !== config.configVersion) ctx.addIssue({ code: 'custom', path: ['modelConfiguration', 'configVersion'], message: 'Explicit models require the same saved context version' });
  if (context.agentId !== config.identity.managementAgentId && context.agentId !== config.identity.runtimeAgentId) ctx.addIssue({ code: 'custom', path: ['modelConfiguration', 'identity'], message: 'Models belong to the declared context agent' });
  if (config.provenance === undefined) return;
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
export type AgentContextWithModels = z.infer<typeof AgentContextWithModelsSchema>;

/** Complete identity/channel guards plus mandatory, scoped model provenance. */
export const AgentContextWithModelProvenanceSchema = AgentContextWithIdentitySchema.and(
  AgentContextWithModelsSchema.safeExtend({ modelConfiguration: AgentModelsConfigurationWithProvenanceSchema }),
);
export const AgentContextWithModelProvenanceWriteSchema = AgentContextWithIdentityWriteSchema.and(
  AgentContextWithModelsWriteSchema.safeExtend({ modelConfiguration: AgentModelsConfigurationWithProvenanceSchema }),
);
export type AgentContextWithModelProvenance = z.infer<typeof AgentContextWithModelProvenanceSchema>;
export type AgentContextWithModelProvenanceWrite = z.infer<typeof AgentContextWithModelProvenanceWriteSchema>;


export const AgentRuntimeModelSelectionSchema = z.object({
  slotId: ModelSlotIdSchema,
  capability: CapabilityAgentParametersSchema.shape.capability,
  function: ModelFunctionSchema,
  tier: ModelSelectionTierSchema,
  descriptor: ModelDescriptorSchema,
  embeddingDimensions: z.number().int().positive().optional(),
}).strict().superRefine((selection, ctx) => {
  if (selection.embeddingDimensions !== undefined && selection.function !== 'embedding') ctx.addIssue({ code: 'custom', path: ['embeddingDimensions'], message: 'Vector dimension belongs only to embedding' });
});
/** Producer evidence of the selections actually installed for each function/tier, not a global reload count. */
export const AgentModelRuntimeAttestationSchema = z.object({
  identity: AgentRuntimeIdentitySchema.strict(),
  configVersion: AgentConfigVersionSchema,
  requestId: AgentManagementRequestIdSchema,
  observedAt: z.iso.datetime({ offset: true }),
  selections: z.array(AgentRuntimeModelSelectionSchema).min(1).max(256),
}).strict().superRefine((evidence, ctx) => {
  if (new Set(evidence.selections.map(entry => `${entry.slotId}:${entry.tier}`)).size !== evidence.selections.length) ctx.addIssue({ code: 'custom', path: ['selections'], message: 'Duplicate runtime slot/tier' });
});
export type AgentModelRuntimeAttestation = z.infer<typeof AgentModelRuntimeAttestationSchema>;

/** Read-only generation of the actually loaded Master, never a saved/applied configuration version. */
const ModelSourceScopeSchema = CapabilityAgentScopeSchema.refine(scope => [scope.agentId, scope.ownerId, scope.tenantId].every(value => value.trim().length > 0), 'Source scope must not be blank');
export const AgentModelBootstrapSourceSchema = z.object({
  schemaVersion: z.literal(1), identity: CompleteModelIdentitySchema, scope: ModelSourceScopeSchema,
  role: z.literal('master'), authority: z.literal('runtime-loaded'),
  sourceVersion: AgentModelBootstrapSourceVersionSchema,
  observedAt: z.iso.datetime({ offset: true }), validUntil: z.iso.datetime({ offset: true }),
  coverage: z.enum(['complete', 'partial']),
  selections: z.array(AgentModelSelectionSchema).max(64), missingSlots: z.array(ModelSlotIdSchema).max(64),
  /** Absence of a service must be observed at the same generation; active unknown models remain missing. */
  excludedSlots: z.array(z.object({ slotId: ModelSlotIdSchema, state: z.enum(['not-installed', 'not-applicable']), reason: z.string().trim().min(1).max(500) }).strict()).max(64).optional(),
}).strict().superRefine((source, ctx) => {
  if (source.scope.agentId !== source.identity.runtimeAgentId) ctx.addIssue({ code: 'custom', path: ['scope'], message: 'Source scope names its runtime exactly' });
  if (Date.parse(source.validUntil) <= Date.parse(source.observedAt)) ctx.addIssue({ code: 'custom', path: ['validUntil'], message: 'Source validity ends after observation' });
  const present = source.selections.map(selection => selection.slotId);
  const all = [...present, ...source.missingSlots, ...(source.excludedSlots ?? []).map(slot => slot.slotId)];
  const registered = registeredModelConsumers().map(consumer => consumer.slotId);
  if (new Set(all).size !== all.length || all.length !== registered.length || registered.some(slot => !all.includes(slot))) ctx.addIssue({ code: 'custom', path: ['selections'], message: 'Every registered slot is present or missing exactly once' });
  if ((source.coverage === 'complete') !== (source.missingSlots.length === 0) || (source.coverage === 'complete' && source.selections.length === 0)) ctx.addIssue({ code: 'custom', path: ['coverage'], message: 'Complete means no missing consumer' });
  for (const [index, selection] of source.selections.entries()) {
    const consumer = findModelConsumerDefinition(selection.slotId);
    const actual = selection.settings;
    if (consumer === undefined || consumer.capability !== actual.capability || consumer.function !== actual.function || !sameModelFeatures(consumer.requirements, actual.requirements) || consumer.routing !== (actual.mode === 'single' ? 'single' : actual.mode === 'failover' ? 'failover' : 'tiered')) ctx.addIssue({ code: 'custom', path: ['selections', index], message: 'Source settings must match the canonical consumer and its requirements' });
  }
});
export type AgentModelBootstrapSource = z.infer<typeof AgentModelBootstrapSourceSchema>;
export const AgentModelBootstrapSourceExpectationSchema = z.object({ identity: CompleteModelIdentitySchema, scope: ModelSourceScopeSchema, sourceVersion: AgentModelBootstrapSourceVersionSchema }).strict();
export type AgentModelBootstrapSourceExpectation = z.infer<typeof AgentModelBootstrapSourceExpectationSchema>;
/** Caller supplies a fresh server-side generation recheck after awaits. Parsing alone cannot prove runtime authority. */
export function isAgentModelBootstrapSourceCurrent(input: unknown, expected: unknown, now = new Date()): boolean {
  const parsed = AgentModelBootstrapSourceSchema.safeParse(input);
  const target = AgentModelBootstrapSourceExpectationSchema.safeParse(expected);
  if (!parsed.success || !target.success) return false;
  const source = parsed.data; const expectation = target.data; const time = now.getTime();
  if (source.coverage !== 'complete' || source.selections.length === 0 || !Number.isFinite(time) || time < Date.parse(source.observedAt) - 5_000 || time >= Date.parse(source.validUntil)) return false;
  return source.sourceVersion === expectation.sourceVersion && sameModelAgentIdentity(source.identity, expectation.identity) && sameCapabilityScope(source.scope, expectation.scope);
}

export const AgentModelsStateSchema = z.object({
  identity: AgentRuntimeIdentitySchema.strict(),
  versions: AgentConfigVersionStateSchema.nullable(),
  saved: AgentModelsConfigurationSchema.nullable(),
  runtime: AgentModelRuntimeAttestationSchema.nullable(),
  /** Absent on existing consumers; explicit null means no qualified loaded Master source. */
  bootstrapSource: AgentModelBootstrapSourceSchema.nullable().optional(),
}).strict().superRefine((state, ctx) => {
  if (state.bootstrapSource != null) {
    if (!sameModelAgentIdentity(state.identity, state.bootstrapSource.identity)) ctx.addIssue({ code: 'custom', path: ['bootstrapSource', 'identity'], message: 'Bootstrap source belongs to this state identity' });
    if (state.saved !== null || state.runtime !== null || state.versions !== null) ctx.addIssue({ code: 'custom', path: ['bootstrapSource'], message: 'Bootstrap source cannot claim a saved or applied version' });
  }
  if (state.saved !== null) {
    if (!sameModelAgentIdentity(state.identity, state.saved.identity)) ctx.addIssue({ code: 'custom', path: ['saved', 'identity'], message: 'Saved models belong to another agent' });
    if (state.saved.configVersion !== state.versions?.desired) ctx.addIssue({ code: 'custom', path: ['saved', 'configVersion'], message: 'Saved model version must be the desired version' });
  }
  if (state.runtime !== null) {
    if (!sameModelAgentIdentity(state.identity, state.runtime.identity)) ctx.addIssue({ code: 'custom', path: ['runtime', 'identity'], message: 'Runtime models belong to another agent' });
    if (state.runtime.configVersion !== state.versions?.applied) ctx.addIssue({ code: 'custom', path: ['runtime', 'configVersion'], message: 'Runtime model version must be the applied version' });
  }
});
export type AgentModelsState = z.infer<typeof AgentModelsStateSchema>;

/** No side effects: null, timeout, stale or mismatched evidence remains unconfirmed; identical replays are valid. */
export function isAgentModelApplyConfirmed(configuration: unknown, requestedCommand: unknown, processedResult: unknown, runtimeEvidence: unknown, now = new Date()): boolean {
  const config = AgentModelsConfigurationSchema.safeParse(configuration);
  const command = AgentManagementCommandSchema.safeParse(requestedCommand);
  const result = AgentManagementCommandResultSchema.safeParse(processedResult);
  const attestation = AgentModelRuntimeAttestationSchema.safeParse(runtimeEvidence);
  if (!config.success || !command.success || !result.success || !attestation.success) return false;
  const saved = config.data; const request = command.data; const response = result.data; const actual = attestation.data;
  if (request.action !== 'apply-config' || response.action !== 'apply-config') return false;
  if (request.desiredVersion !== saved.configVersion || response.versions?.applied !== saved.configVersion || actual.configVersion !== saved.configVersion) return false;
  if (response.requestId !== request.requestId || actual.requestId !== request.requestId) return false;
  if (response.agentId !== saved.identity.managementAgentId || response.identity === undefined || !sameModelAgentIdentity(saved.identity, response.identity) || !sameModelAgentIdentity(saved.identity, actual.identity)) return false;
  if (response.outcome !== 'ok' || !response.results.some(entry => entry.target.kind === 'runtime' && entry.target.targetId === saved.identity.runtimeAgentId && entry.outcome === 'ok')) return false;
  const timestamp = now.getTime(); const observed = Date.parse(actual.observedAt);
  if (!Number.isFinite(timestamp) || timestamp < observed - 5_000 || timestamp > observed + 60_000) return false;
  return isAgentModelRuntimeConfigurationMatching(saved, actual, now);
}

/** Fresh exact installed positions, including vector dimension, independent of transport/receipt. */
export function isAgentModelRuntimeConfigurationMatching(configuration: unknown, runtimeEvidence: unknown, now = new Date()): boolean {
  const config = AgentModelsConfigurationSchema.safeParse(configuration);
  const evidence = AgentModelRuntimeAttestationSchema.safeParse(runtimeEvidence);
  if (!config.success || !evidence.success) return false;
  const saved = config.data; const actual = evidence.data;
  if (!sameModelAgentIdentity(saved.identity, actual.identity) || saved.configVersion !== actual.configVersion) return false;
  const timestamp = now.getTime(); const observed = Date.parse(actual.observedAt);
  if (!Number.isFinite(timestamp) || timestamp < observed - 5_000 || timestamp > observed + 60_000) return false;
  if (actual.selections.length !== saved.selections.reduce((count, slot) => count + modelSettingsSelections(slot.settings).length, 0)) return false;
  return saved.selections.every(slot => modelSettingsSelections(slot.settings).every(({ tier, descriptor }) => {
    const selection = actual.selections.find(entry => entry.slotId === slot.slotId && entry.tier === tier);
    const dimensionMatches = slot.settings.mode !== 'single' || slot.settings.function !== 'embedding' || selection?.embeddingDimensions === slot.settings.embeddingDimensions;
    return selection !== undefined && dimensionMatches && selection.capability === slot.settings.capability && selection.function === slot.settings.function && sameModelDescriptor(selection.descriptor, descriptor);
  }));
}
