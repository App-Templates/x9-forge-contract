import { z } from 'zod';
import { AgentRuntimeIdentitySchema, type AgentRuntimeIdentity } from '../agent/agent-runtime-identity.js';
import { AgentConfigVersionStateSchema, AgentManagementCommandSchema, AgentManagementCommandResultSchema, AgentManagementRequestIdSchema } from '../agent/agent-management.js';
import { AgentContextFileSchema, AgentContextFileWriteSchema } from '../agent/agent-context-file.js';
import { AgentConfigVersionSchema } from '../capability/ricerca/agent-config.js';
import { CapabilityAgentParametersSchema } from '../capability/parameters.js';
import { CapabilityModelSettingsSchema } from './capability-model-settings.js';
import { MODEL_TIERS } from './model-tier.js';
import { ModelDescriptorSchema, ModelFunctionSchema, sameModelDescriptor } from './model-catalog.js';

/** Stable server-owned slot identifiers, including existing agent_chat/mem0_* slots. */
export const ModelSlotIdSchema = z.string().regex(/^[a-z][a-z0-9._-]{0,63}$/);
export const ModelSelectionTierSchema = z.enum([...MODEL_TIERS, 'fallback']);
export const AgentModelSelectionSchema = z.object({ slotId: ModelSlotIdSchema, settings: CapabilityModelSettingsSchema }).strict();
export const AgentModelsConfigurationSchema = z.object({
  schemaVersion: z.literal(1),
  identity: AgentRuntimeIdentitySchema.strict(),
  configVersion: AgentConfigVersionSchema,
  selections: z.array(AgentModelSelectionSchema).min(1).max(64),
}).strict().superRefine((config, ctx) => {
  if (new Set(config.selections.map(entry => entry.slotId)).size !== config.selections.length) ctx.addIssue({ code: 'custom', path: ['selections'], message: 'Duplicate model slot' });
});
export type AgentModelsConfiguration = z.infer<typeof AgentModelsConfigurationSchema>;

/** Compare the canonical mapping, including the optional Vault numeric identity. */
export function sameModelAgentIdentity(left: AgentRuntimeIdentity, right: AgentRuntimeIdentity): boolean {
  return left.managementAgentId === right.managementAgentId && left.runtimeAgentId === right.runtimeAgentId && left.vaultAgentId === right.vaultAgentId;
}

const contextModels = { modelConfiguration: AgentModelsConfigurationSchema.optional() };
const checkContext = (context: { agentId: string; configVersion?: number | undefined; modelConfiguration?: AgentModelsConfiguration | undefined }, ctx: z.RefinementCtx): void => {
  if (context.modelConfiguration === undefined) return;
  const config = context.modelConfiguration;
  if (context.configVersion !== config.configVersion) ctx.addIssue({ code: 'custom', path: ['modelConfiguration', 'configVersion'], message: 'Explicit models require the same saved context version' });
  if (context.agentId !== config.identity.managementAgentId && context.agentId !== config.identity.runtimeAgentId) ctx.addIssue({ code: 'custom', path: ['modelConfiguration', 'identity'], message: 'Models belong to the declared context agent' });
};
/** Explicit, validated models are authoritative; malformed/null values never fall back to legacy llmConfig. */
export const AgentContextWithModelsSchema = AgentContextFileSchema.safeExtend(contextModels).superRefine(checkContext);
export const AgentContextWithModelsWriteSchema = AgentContextFileWriteSchema.safeExtend(contextModels).superRefine(checkContext);
export type AgentContextWithModels = z.infer<typeof AgentContextWithModelsSchema>;

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
  if (new Set(evidence.selections.map(entry => `${entry.slotId}:${entry.tier}`)).size !== evidence.selections.length) ctx.addIssue({ code: 'custom', path: ['selections'], message: 'Duplicate runtime slot/tier' });
});
export type AgentModelRuntimeAttestation = z.infer<typeof AgentModelRuntimeAttestationSchema>;

export const AgentModelsStateSchema = z.object({
  identity: AgentRuntimeIdentitySchema.strict(),
  versions: AgentConfigVersionStateSchema.nullable(),
  saved: AgentModelsConfigurationSchema.nullable(),
  runtime: AgentModelRuntimeAttestationSchema.nullable(),
}).strict().superRefine((state, ctx) => {
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
  if (actual.selections.length !== saved.selections.length * 4) return false;
  return saved.selections.every(slot => [...MODEL_TIERS, 'fallback' as const].every(tier => {
    const selection = actual.selections.find(entry => entry.slotId === slot.slotId && entry.tier === tier);
    const expected = tier === 'fallback' ? slot.settings.fallback : slot.settings.tiers[tier];
    return selection !== undefined && selection.capability === slot.settings.capability && selection.function === slot.settings.function && sameModelDescriptor(selection.descriptor, expected);
  }));
}
