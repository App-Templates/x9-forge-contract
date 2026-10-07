import { z } from 'zod';
import { InternalFactoryDeployRequestSchema } from '../http/endpoints/internal-factory-deploy.js';
import { CapabilityAgentScopeSchema, sameCapabilityScope } from '../capability/capability-call-context.js';
import { AgentConfigVersionSchema } from '../capability/ricerca/agent-config.js';
import { AgentRuntimeIdentitySchema } from './agent-runtime-identity.js';
import { AgentRuntimeChannelSchema } from './agent-runtime-state.js';
import { AgentManagementRequestIdSchema } from './agent-management.js';
import { AgentChannelConfigurationSchema, AgentChannelDesiredStateSchema, AgentChannelFailureSchema, isChannelConfigurationApplied } from './agent-channel-configuration.js';

/** The producer assigns stable IDs BEFORE persisting this intent; the authenticated scope partitions key lookup. */
export const AgentCreationIntentSchema = z.object({
  idempotencyKey: AgentManagementRequestIdSchema,
  scope: CapabilityAgentScopeSchema,
  identity: AgentRuntimeIdentitySchema,
  source: AgentRuntimeIdentitySchema,
  configVersion: AgentConfigVersionSchema,
  channels: z.object({ telegram: AgentChannelDesiredStateSchema, email: AgentChannelDesiredStateSchema }).strict(),
}).strict().refine((intent) => intent.identity.runtimeAgentId === intent.scope.agentId, { message: 'Creation scope must match runtime identity' });
export type AgentCreationIntent = z.infer<typeof AgentCreationIntentSchema>;

/** Existing non-secret deploy fields; legacy schemas are unchanged. No raw channel credential is persisted in a job. */
export const AgentCreationRequestSchema = InternalFactoryDeployRequestSchema.omit({
  telegram_bot_token: true, ownerId: true, email_enabled: true, telegram_enabled: true,
}).extend({ intent: AgentCreationIntentSchema }).strict().refine(
  (request) => request.slug === undefined || request.slug === request.intent.identity.managementAgentId,
  { message: 'Explicit slug must be the management identity' },
);
export type AgentCreationRequest = z.infer<typeof AgentCreationRequestSchema>;

export const AgentCreationPhaseSchema = z.enum(['pending', 'running', 'incomplete', 'completed']);
export const AgentCreationFailureSchema = z.object({
  step: z.enum(['resources', 'workspace', 'context', 'runtime', 'first-check', 'save']),
  error: AgentChannelFailureSchema,
}).strict();
export const AgentCreationFirstCheckSchema = z.object({
  checkedAt: z.iso.datetime({ offset: true }), channel: AgentRuntimeChannelSchema, error: AgentChannelFailureSchema.nullable(),
}).strict();
export const AgentCreationCheckpointSchema = z.object({
  jobId: AgentManagementRequestIdSchema,
  request: AgentCreationRequestSchema,
  agentRecordId: z.number().int().positive().nullable(),
  phase: AgentCreationPhaseSchema,
  channels: z.array(AgentChannelConfigurationSchema).max(2),
  firstCheck: AgentCreationFirstCheckSchema.nullable(),
  failure: AgentCreationFailureSchema.nullable(),
}).strict().superRefine((job, ctx) => {
  const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message });
  const intent = job.request.intent;
  const kinds = new Set<string>();
  for (const [index, config] of job.channels.entries()) {
    if (kinds.has(config.kind)) issue(['channels', index], 'Duplicate birth channel');
    kinds.add(config.kind);
    if (!sameCapabilityScope(config.scope, intent.scope)
        || config.identity.managementAgentId !== intent.identity.managementAgentId) issue(['channels', index, 'scope'], 'Channel belongs to another creation');
    if (config.desired.version !== intent.configVersion || config.desired.state !== intent.channels[config.kind]) issue(['channels', index, 'desired'], 'Channel intention differs from the stored request');
  }
  if ((job.phase === 'incomplete') !== (job.failure !== null)) issue(['failure'], 'An incomplete job states its failed step');
  if (job.phase === 'completed') {
    if (job.agentRecordId === null) issue(['agentRecordId'], 'Completed creation has a database record');
    if (job.channels.length !== 2 || !job.channels.every(isChannelConfigurationApplied)) issue(['channels'], 'Every birth channel must have applied its intention');
    if (job.firstCheck === null || job.firstCheck.error !== null || job.firstCheck.channel.loaded !== true
        || job.firstCheck.channel.readiness !== 'ready') issue(['firstCheck'], 'Completed creation needs a successful check on a loaded channel');
    const checkedBirthChannel = job.channels.find((entry) => entry.kind === job.firstCheck?.channel.kind);
    if (job.firstCheck?.channel.kind !== 'web' && (!checkedBirthChannel || checkedBirthChannel.desired.state !== 'active'
        || checkedBirthChannel.observation?.loaded !== true
        || checkedBirthChannel.observation.readiness !== 'ready'
        || checkedBirthChannel.observation.channelId !== job.firstCheck?.channel.channelId)) {
      issue(['firstCheck'], 'A textual check must be ready web or match an active applied ready birth channel');
    }
  }
});
export type AgentCreationCheckpoint = z.infer<typeof AgentCreationCheckpointSchema>;
export const AgentCreationResultSchema = z.object({ ok: z.literal(true), replayed: z.boolean(), checkpoint: AgentCreationCheckpointSchema }).strict();
export type AgentCreationResult = z.infer<typeof AgentCreationResultSchema>;

export type AgentCreationReplayDisposition =
  | { action: 'create' }
  | { action: 'conflict'; error: 'idempotency_conflict' }
  | { action: 'resume' | 'completed'; replayed: true; checkpoint: AgentCreationCheckpoint };

/** Validated schemas normalize field order and defaults before comparing EVERY request field.
 * Pure replay decision, no resource creation. Consumers must atomically lookup/save by authenticated scope + key. */
export function creationReplay(previous: unknown | null, incoming: unknown): AgentCreationReplayDisposition {
  const request = AgentCreationRequestSchema.parse(incoming);
  if (previous === null) return { action: 'create' };
  const checkpoint = AgentCreationCheckpointSchema.parse(previous);
  if (JSON.stringify(checkpoint.request) !== JSON.stringify(request)) return { action: 'conflict', error: 'idempotency_conflict' };
  return { action: checkpoint.phase === 'completed' ? 'completed' : 'resume', replayed: true, checkpoint };
}
