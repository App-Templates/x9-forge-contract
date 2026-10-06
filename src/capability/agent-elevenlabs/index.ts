import { z } from 'zod';
import { CapabilityAgentScopeSchema, sameCapabilityScope } from '../capability-call-context.js';
import { AgentConfigVersionSchema } from '../ricerca/agent-config.js';
import { AgentVoiceIdSchema, AgentVoiceLocaleSchema, AgentVoiceModelSchema } from '../voice/agent-voice-settings.js';
import { CapToolCallParamsSchema } from '../../http/endpoints/cap-tool-call.js';
import { AgentManagementRequestIdSchema } from '../../agent/agent-management.js';
import { AgentRuntimeChannelSchema } from '../../agent/agent-runtime-state.js';

/**
 * cap-agent-elevenlabs (R6, v1.31.0) — standard capability that owns an agent's ElevenLabs conversational agent.
 *
 * Forge Apply provisions the provider resource ONCE per agent (idempotent by `requestId`; a timeout or replay
 * reconciles the resource already created instead of creating a second one), keeps the mapping provider resource ↔
 * tenant/owner/agent, and reports the external channel as an `AgentRuntimeChannel`, so the agent's canonical state
 * counts it: stopping agent-core does not make a live provider channel look stopped. An existing resource is adopted
 * only through an explicit mapping (`adoptProviderAgentId`); new agents are never wired to a hard-coded id.
 * Provider credentials travel only through the per-call context (R3), never in these payloads.
 */

/** One provider resource serves one agent: no person in this scope. */
export const ElevenLabsAgentScopeSchema = CapabilityAgentScopeSchema;
export type ElevenLabsAgentScope = z.infer<typeof ElevenLabsAgentScopeSchema>;

export const ElevenLabsProviderAgentIdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
export type ElevenLabsProviderAgentId = z.infer<typeof ElevenLabsProviderAgentIdSchema>;

/** webhook: the provider calls the capability's `/call/:tool` · client: handled by the project UI. */
export const ElevenLabsToolKindSchema = z.enum(['webhook', 'client']);
export type ElevenLabsToolKind = z.infer<typeof ElevenLabsToolKindSchema>;

export const ElevenLabsToolBindingSchema = z.object({
  name: CapToolCallParamsSchema.shape.tool,
  kind: ElevenLabsToolKindSchema,
  description: z.string().trim().min(1).max(1000),
}).strict();
export type ElevenLabsToolBinding = z.infer<typeof ElevenLabsToolBindingSchema>;

export const ElevenLabsAgentConfigSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  voiceId: AgentVoiceIdSchema,
  /** Provider TTS model. */
  model: AgentVoiceModelSchema,
  /** Conversation LLM selected on the provider side. */
  llm: z.string().min(1).max(128),
  language: AgentVoiceLocaleSchema,
  firstMessage: z.string().trim().min(1).max(2000).optional(),
  /** Version of the agent's prompt files rendered by the producer (IDENTITY/SOUL/POLICIES/USER). */
  promptVersion: z.string().min(1).max(128),
  tools: z.array(ElevenLabsToolBindingSchema).max(64)
    .refine((tools) => new Set(tools.map((tool) => tool.name)).size === tools.length, { message: 'Duplicate tool' }),
}).strict();
export type ElevenLabsAgentConfig = z.infer<typeof ElevenLabsAgentConfigSchema>;

export const ElevenLabsDesiredStateSchema = z.enum(['active', 'paused']);
export type ElevenLabsDesiredState = z.infer<typeof ElevenLabsDesiredStateSchema>;

export const ElevenLabsProvisionRequestSchema = z.object({
  requestId: AgentManagementRequestIdSchema,
  scope: ElevenLabsAgentScopeSchema,
  configVersion: AgentConfigVersionSchema,
  config: ElevenLabsAgentConfigSchema,
  desiredState: ElevenLabsDesiredStateSchema,
  /** Adopt an existing provider resource by explicit approved mapping instead of creating one. */
  adoptProviderAgentId: ElevenLabsProviderAgentIdSchema.optional(),
}).strict();
export type ElevenLabsProvisionRequest = z.infer<typeof ElevenLabsProvisionRequestSchema>;

export const ElevenLabsMappingOriginSchema = z.enum(['provisioned', 'adopted']);
export type ElevenLabsMappingOrigin = z.infer<typeof ElevenLabsMappingOriginSchema>;

export const ElevenLabsAgentMappingSchema = z.object({
  scope: ElevenLabsAgentScopeSchema,
  providerAgentId: ElevenLabsProviderAgentIdSchema,
  origin: ElevenLabsMappingOriginSchema,
  createdAt: z.iso.datetime({ offset: true }),
  appliedConfigVersion: AgentConfigVersionSchema,
});
export type ElevenLabsAgentMapping = z.infer<typeof ElevenLabsAgentMappingSchema>;

/**
 * Same binding snapshot: full scope (tenant, owner, agent), provider resource, origin, applied version and creation
 * time. A provider id alone never identifies a binding across tenants/owners/agents.
 */
export function sameElevenLabsMapping(a: ElevenLabsAgentMapping, b: ElevenLabsAgentMapping): boolean {
  return sameCapabilityScope(a.scope, b.scope)
    && a.providerAgentId === b.providerAgentId
    && a.origin === b.origin
    && a.appliedConfigVersion === b.appliedConfigVersion
    && Date.parse(a.createdAt) === Date.parse(b.createdAt);
}

export const ElevenLabsChannelStatusSchema = z.object({
  scope: ElevenLabsAgentScopeSchema,
  /** null: no provider resource yet (not provisioned). */
  mapping: ElevenLabsAgentMappingSchema.nullable(),
  desiredState: ElevenLabsDesiredStateSchema,
  /** The provider channel as canonical runtime evidence (kind voice or web). */
  channel: AgentRuntimeChannelSchema,
  /** null: the provider was not observed; the channel is then unknown. */
  observedAt: z.iso.datetime({ offset: true }).nullable(),
}).superRefine((status, ctx) => {
  if (status.channel.kind !== 'voice' && status.channel.kind !== 'web') {
    ctx.addIssue({ code: 'custom', path: ['channel', 'kind'], message: 'A provider voice channel is voice or web' });
  }
  if (status.mapping === null && status.channel.loaded === true) {
    ctx.addIssue({ code: 'custom', path: ['mapping'], message: 'A loaded channel needs a provider resource' });
  }
  if (status.mapping !== null && !sameCapabilityScope(status.mapping.scope, status.scope)) {
    ctx.addIssue({ code: 'custom', path: ['mapping', 'scope'], message: 'Mapping belongs to another agent' });
  }
  if (status.observedAt === null && status.channel.state !== 'unknown') {
    ctx.addIssue({ code: 'custom', path: ['observedAt'], message: 'An unobserved provider channel is unknown' });
  }
});
export type ElevenLabsChannelStatus = z.infer<typeof ElevenLabsChannelStatusSchema>;

export const ElevenLabsProvisionOutcomeSchema = z.enum(['created', 'updated', 'unchanged', 'adopted']);
export type ElevenLabsProvisionOutcome = z.infer<typeof ElevenLabsProvisionOutcomeSchema>;

export const ElevenLabsProvisionResultSchema = z.object({
  ok: z.literal(true),
  requestId: AgentManagementRequestIdSchema,
  /** true: this requestId already ran; the existing resource is returned, nothing is created again. */
  replayed: z.boolean(),
  outcome: ElevenLabsProvisionOutcomeSchema,
  mapping: ElevenLabsAgentMappingSchema,
  status: ElevenLabsChannelStatusSchema,
}).superRefine((result, ctx) => {
  if (result.outcome === 'created' && result.mapping.origin !== 'provisioned') {
    ctx.addIssue({ code: 'custom', path: ['outcome'], message: 'created means a provisioned resource' });
  }
  if (result.outcome === 'adopted' && result.mapping.origin !== 'adopted') {
    ctx.addIssue({ code: 'custom', path: ['outcome'], message: 'adopted means an adopted resource' });
  }
  if (result.status.mapping === null || !sameElevenLabsMapping(result.status.mapping, result.mapping)) {
    ctx.addIssue({ code: 'custom', path: ['status', 'mapping'], message: 'Status must describe exactly the provisioned binding' });
  }
});
export type ElevenLabsProvisionResult = z.infer<typeof ElevenLabsProvisionResultSchema>;

export const ElevenLabsProvisionErrorCodeSchema = z.enum([
  'invalid_request',
  'agent_mismatch',
  'credential_missing',
  'provider_unavailable',
  'provider_rejected',
  'idempotency_conflict',
  'stale_version',
  'adoption_conflict',
  /** A creation may have happened (e.g. timeout): reconciliation must finish before a retry creates anything. */
  'reconcile_pending',
]);
export type ElevenLabsProvisionErrorCode = z.infer<typeof ElevenLabsProvisionErrorCodeSchema>;

const RETRYABLE: ReadonlySet<ElevenLabsProvisionErrorCode> = new Set(['provider_unavailable', 'reconcile_pending']);

export const ElevenLabsProvisionErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: ElevenLabsProvisionErrorCodeSchema,
  /** Same requestId may be retried (only for transient provider failures and pending reconciliation). */
  retryable: z.boolean(),
  /** stale_version only. */
  currentVersion: AgentConfigVersionSchema.optional(),
}).superRefine((response, ctx) => {
  if (response.retryable !== RETRYABLE.has(response.error)) {
    ctx.addIssue({ code: 'custom', path: ['retryable'], message: 'Retryability is fixed by the error code' });
  }
  if ((response.error === 'stale_version') !== (response.currentVersion !== undefined)) {
    ctx.addIssue({ code: 'custom', path: ['currentVersion'], message: 'currentVersion is present exactly for stale_version' });
  }
});
export type ElevenLabsProvisionErrorResponse = z.infer<typeof ElevenLabsProvisionErrorResponseSchema>;
