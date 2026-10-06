import { z } from 'zod';
import { ChannelTypeSchema } from '../messaging/channel-type.js';
import { AgentTelegramBotSchema } from '../messaging/agent-telegram-bot.js';
import { AgentEmailInboxSchema } from '../messaging/agent-email-inbox.js';
import { CapabilityAgentScopeSchema, sameCapabilityScope } from '../capability/capability-call-context.js';
import { AgentConfigVersionSchema } from '../capability/ricerca/agent-config.js';
import { AgentRuntimeIdentitySchema } from './agent-runtime-identity.js';
import { AgentRuntimeChannelSchema } from './agent-runtime-state.js';
import { AgentContextFileSchema, AgentContextFileWriteSchema } from './agent-context-file.js';

/** R2: pausing admission preserves the agent's resource and credentials in their existing stores. */
export const AgentBirthChannelKindSchema = ChannelTypeSchema.extract(['telegram', 'email']);
export type AgentBirthChannelKind = z.infer<typeof AgentBirthChannelKindSchema>;
export const AgentChannelDesiredStateSchema = z.enum(['active', 'paused']);
export type AgentChannelDesiredState = z.infer<typeof AgentChannelDesiredStateSchema>;

/** Fixed codes only: provider messages, tokens, stack traces and arbitrary detail never cross this boundary. */
export const AgentChannelFailureCodeSchema = z.enum([
  'resource_missing', 'resource_conflict', 'provider_unavailable', 'provider_rejected', 'account_blocked',
  'load_failed', 'apply_failed', 'source_unavailable', 'reconcile_pending', 'first_check_failed',
]);
export type AgentChannelFailureCode = z.infer<typeof AgentChannelFailureCodeSchema>;
const RETRYABLE = new Set<AgentChannelFailureCode>(['provider_unavailable', 'source_unavailable', 'reconcile_pending']);
export const AgentChannelFailureSchema = z.object({ code: AgentChannelFailureCodeSchema, retryable: z.boolean() }).strict()
  .refine((failure) => failure.retryable === RETRYABLE.has(failure.code), { message: 'Retryability is fixed by the failure code' });
export type AgentChannelFailure = z.infer<typeof AgentChannelFailureSchema>;
export function channelFailure(code: unknown): AgentChannelFailure {
  const parsed = AgentChannelFailureCodeSchema.safeParse(code);
  const safe = parsed.success ? parsed.data : 'apply_failed';
  return { code: safe, retryable: RETRYABLE.has(safe) };
}

const ownership = { scope: CapabilityAgentScopeSchema, identity: AgentRuntimeIdentitySchema };
/** Metadata only; even the legacy free-form token reference is deliberately omitted. Resolve credentials via R3. */
export const AgentOwnedChannelResourceSchema = z.discriminatedUnion('kind', [
  z.object({ ...ownership, kind: ChannelTypeSchema.extract(['telegram']),
    resource: AgentTelegramBotSchema.pick({ agent_id: true, bot_username: true, created_at: true }).strict() }).strict(),
  z.object({ ...ownership, kind: ChannelTypeSchema.extract(['email']), resource: AgentEmailInboxSchema.strict() }).strict(),
]).superRefine((owned, ctx) => {
  if (owned.resource.agent_id !== owned.scope.agentId) {
    ctx.addIssue({ code: 'custom', path: ['resource', 'agent_id'], message: 'Resource belongs to another agent' });
  }
  if (owned.identity.runtimeAgentId !== owned.scope.agentId) {
    ctx.addIssue({ code: 'custom', path: ['identity'], message: 'Runtime identity must match resource scope' });
  }
});
export type AgentOwnedChannelResource = z.infer<typeof AgentOwnedChannelResourceSchema>;

export const AgentChannelVersionedStateSchema = z.object({ version: AgentConfigVersionSchema, state: AgentChannelDesiredStateSchema }).strict();
export const AgentChannelConfigurationSchema = z.object({
  ...ownership, kind: AgentBirthChannelKindSchema,
  desired: AgentChannelVersionedStateSchema,
  /** null means never applied, not an inferred pause. An older active version may still be running. */
  applied: AgentChannelVersionedStateSchema.nullable(),
  resource: AgentOwnedChannelResourceSchema.nullable(),
  observation: AgentRuntimeChannelSchema.nullable(),
  observedAt: z.iso.datetime({ offset: true }).nullable(),
  error: AgentChannelFailureSchema.nullable(),
}).strict().superRefine((config, ctx) => {
  const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
  if (config.identity.runtimeAgentId !== config.scope.agentId) issue('identity', 'Runtime identity must match configuration scope');
  if (config.resource && (!sameCapabilityScope(config.resource.scope, config.scope)
      || config.resource.identity.managementAgentId !== config.identity.managementAgentId)) issue('resource', 'Resource belongs to another scope or identity');
  if (config.resource && config.resource.kind !== config.kind) issue('resource', 'Resource belongs to another channel kind');
  if (config.applied && config.applied.version > config.desired.version) issue('applied', 'Applied version cannot be ahead of desired');
  if (config.applied && config.applied.version === config.desired.version && config.applied.state !== config.desired.state) issue('applied', 'One version cannot describe two states');
  if (config.applied?.state === 'active' && config.resource === null) issue('resource', 'An active application needs its own resource');
  if ((config.observation === null) !== (config.observedAt === null)) issue('observedAt', 'Observation and time exist together');
  if (config.observation && config.observation.kind !== config.kind) issue('observation', 'Observation belongs to another channel kind');
  if (config.observation && config.applied === null) issue('applied', 'Observed configuration needs an applied version');
  if (config.observation?.state === 'loaded' && config.applied?.state !== 'active') issue('observation', 'A paused application cannot be loaded');
  if (config.observation?.state === 'paused' && config.applied?.state !== 'paused') issue('observation', 'A pause must have been applied');
});
export type AgentChannelConfiguration = z.infer<typeof AgentChannelConfigurationSchema>;

/** Application requires matching versions/state and dated runtime evidence, not just a saved intention. */
export function isChannelConfigurationApplied(raw: unknown): boolean {
  const parsed = AgentChannelConfigurationSchema.safeParse(raw);
  if (!parsed.success) return false;
  const config = parsed.data;
  return config.error === null && config.applied?.version === config.desired.version
    && config.observation?.state === (config.desired.state === 'active' ? 'loaded' : 'paused');
}

const ConfigurationsSchema = z.array(AgentChannelConfigurationSchema).length(2).refine(
  (configs) => new Set(configs.map((config) => config.kind)).size === configs.length,
  { message: 'One configuration for each birth channel' },
);
function checkContextScope(context: { agentId: string; ownerId: string; tenantId?: string | undefined;
  channelConfigurations?: AgentChannelConfiguration[] | undefined }, ctx: z.RefinementCtx): void {
  for (const [index, config] of (context.channelConfigurations ?? []).entries()) {
    if (config.scope.agentId !== context.agentId || config.scope.ownerId !== context.ownerId || config.scope.tenantId !== context.tenantId) {
      ctx.addIssue({ code: 'custom', path: ['channelConfigurations', index, 'scope'], message: 'Channel configuration belongs to another context scope' });
    }
  }
}
/** Additive context field. Absent is legacy; present is complete, validated and scoped with no tenant default. */
export const AgentContextWithChannelsSchema = AgentContextFileSchema.safeExtend({ channelConfigurations: ConfigurationsSchema.optional() }).superRefine(checkContextScope);
export const AgentContextWithChannelsWriteSchema = AgentContextFileWriteSchema.safeExtend({ channelConfigurations: ConfigurationsSchema.optional() }).superRefine(checkContextScope);
export type AgentContextWithChannels = z.infer<typeof AgentContextWithChannelsSchema>;

/** Admission only, not readiness: the producer still resolves this agent's credentials and attests the load. */
export function shouldLoadAgentChannel(rawContext: unknown, kind: AgentBirthChannelKind): boolean {
  const parsed = AgentContextWithChannelsSchema.safeParse(rawContext);
  if (!parsed.success) return false;
  if (parsed.data.channelConfigurations === undefined) return true;
  const config = parsed.data.channelConfigurations.find((entry) => entry.kind === kind);
  return config?.desired.state === 'active' && config.resource !== null;
}
