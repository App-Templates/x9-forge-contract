import { z } from 'zod';
import { AgentConfigVersionSchema } from '../capability/ricerca/agent-config.js';
import { AgentManagementRequestIdSchema } from './agent-management.js';
import { AgentBirthChannelKindSchema, AgentChannelConfigurationSchema, isChannelConfigurationApplied } from './agent-channel-configuration.js';
import { AgentChannelAttestationSchema } from './agent-channel-attestation.js';
import { AgentChannelAccessBindingSchema, AgentTelegramAdmittedChatSchema, sameAgentChannelAccessBinding,
  type AgentChannelAccessBinding } from './agent-channel-access.js';

const time = z.iso.datetime({ offset: true });
const bindingOf = (value: AgentChannelAccessBinding): AgentChannelAccessBinding => ({ scope: value.scope, identity: value.identity });

/** Only authenticated Telegram update metadata, never ordinary message contents or an automatic permission. */
export const AgentTelegramAccessRequestSchema = z.object({
  requestId: AgentManagementRequestIdSchema, chatId: AgentTelegramAdmittedChatSchema.shape.chatId,
  type: AgentTelegramAdmittedChatSchema.shape.type, name: AgentTelegramAdmittedChatSchema.shape.name,
  requestedAt: time, updateId: z.number().int().nonnegative(),
}).strict().refine(request => (request.type === 'private') === !request.chatId.startsWith('-'),
  { message: 'Request chat identity must retain its private/group sign' });
export type AgentTelegramAccessRequest = z.infer<typeof AgentTelegramAccessRequestSchema>;
export const AgentTelegramAccessRequestQueueSchema = AgentChannelAccessBindingSchema.safeExtend({
  kind: z.literal('telegram'), version: AgentConfigVersionSchema, observedAt: time,
  requests: z.array(AgentTelegramAccessRequestSchema).max(512),
}).superRefine((queue, ctx) => {
  for (const field of ['requestId', 'chatId', 'updateId'] as const) {
    if (new Set(queue.requests.map(request => request[field])).size !== queue.requests.length) {
      ctx.addIssue({ code: 'custom', path: ['requests'], message: 'Pending requests require unique ids, chats and updates' });
    }
  }
  if (queue.requests.some(request => Date.parse(request.requestedAt) > Date.parse(queue.observedAt))) {
    ctx.addIssue({ code: 'custom', path: ['observedAt'], message: 'A queue cannot observe a future request' });
  }
});
export type AgentTelegramAccessRequestQueue = z.infer<typeof AgentTelegramAccessRequestQueueSchema>;

export const AgentChannelAccessErrorCodeSchema = z.enum([
  'invalid_request', 'agent_not_found', 'identity_mismatch', 'stale_version', 'request_not_found',
  'idempotency_conflict', 'command_in_progress', 'source_unavailable', 'address_book_unavailable',
  'queue_limit', 'not_supported', 'load_failed', 'apply_failed', 'reconcile_pending',
]);
export type AgentChannelAccessErrorCode = z.infer<typeof AgentChannelAccessErrorCodeSchema>;
export const AgentChannelAccessErrorResponseSchema = z.object({
  ok: z.literal(false), error: AgentChannelAccessErrorCodeSchema, currentVersion: AgentConfigVersionSchema.nullable().optional(),
}).strict().refine(result => (result.error === 'stale_version') === (result.currentVersion !== undefined),
  { message: 'Current version is present exactly for stale_version' });
export type AgentChannelAccessErrorResponse = z.infer<typeof AgentChannelAccessErrorResponseSchema>;

export const AgentChannelAccessRequestOperationSchema = z.object({
  requestId: AgentManagementRequestIdSchema, action: z.enum(['admit', 'ignore']),
}).strict();
export type AgentChannelAccessRequestOperation = z.infer<typeof AgentChannelAccessRequestOperationSchema>;
/** Operations are staged until the saved door policy is explicitly applied; cancellation submits no command. */
export const AgentChannelAccessRequestChangesSchema = z.object({
  expectedQueueVersion: AgentConfigVersionSchema,
  operations: z.array(AgentChannelAccessRequestOperationSchema).min(1).max(512)
    .refine(operations => new Set(operations.map(operation => operation.requestId)).size === operations.length,
      { message: 'One operation for each pending request' }),
}).strict();
export type AgentChannelAccessRequestChanges = z.infer<typeof AgentChannelAccessRequestChangesSchema>;
export const AgentChannelAccessApplyCommandSchema = z.object({
  action: z.literal('apply-channel'), requestId: AgentManagementRequestIdSchema,
  desiredVersion: AgentConfigVersionSchema, expectedAppliedVersion: AgentConfigVersionSchema.nullable(),
  requestChanges: AgentChannelAccessRequestChangesSchema.nullable(),
}).strict().refine(command => command.expectedAppliedVersion === null || command.desiredVersion >= command.expectedAppliedVersion,
  { message: 'Desired door version cannot be older than the expected applied version' });
export type AgentChannelAccessApplyCommand = z.infer<typeof AgentChannelAccessApplyCommandSchema>;

/** Unavailable never means an empty queue; email has no Telegram start-request producer. */
export const AgentChannelAccessRequestSourceSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('available'), queue: AgentTelegramAccessRequestQueueSchema }).strict(),
  z.object({ status: z.literal('unavailable'), error: AgentChannelAccessErrorCodeSchema }).strict(),
  z.object({ status: z.literal('not-applicable') }).strict(),
]);
export type AgentChannelAccessRequestSource = z.infer<typeof AgentChannelAccessRequestSourceSchema>;
/** Composes existing config/attestation contracts: it neither changes legacy attestation nor copies saved into applied. */
export const AgentChannelAccessSnapshotSchema = z.object({
  configuration: AgentChannelConfigurationSchema, observedAt: time,
  requests: AgentChannelAccessRequestSourceSchema, attestation: AgentChannelAttestationSchema.nullable(),
}).strict().superRefine((snapshot, ctx) => {
  const config = snapshot.configuration;
  const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
  if ((config.kind === 'email') !== (snapshot.requests.status === 'not-applicable')) issue('requests', 'Request producer belongs to another door');
  if (snapshot.requests.status === 'available') {
    if (!sameAgentChannelAccessBinding(bindingOf(snapshot.requests.queue), bindingOf(config))) issue('requests', 'Request queue belongs to another agent');
    if (Date.parse(snapshot.requests.queue.observedAt) > Date.parse(snapshot.observedAt)) issue('observedAt', 'Snapshot predates its queue observation');
  }
  if (config.observedAt !== null && Date.parse(config.observedAt) > Date.parse(snapshot.observedAt)) issue('observedAt', 'Snapshot predates its channel observation');
  const actual = snapshot.attestation;
  if (config.kind === 'email' && config.observation !== null && actual === null) issue('attestation', 'Observed email requires its producer attestation');
  if (actual !== null) {
    if (!sameAgentChannelAccessBinding(bindingOf(actual), bindingOf(config)) || actual.channel.kind !== config.kind) issue('attestation', 'Attestation belongs to another agent or door');
    if (JSON.stringify(actual.applied) !== JSON.stringify(config.applied)) issue('attestation', 'Attested applied version/state differs from configuration evidence');
    if (config.observation !== null && (JSON.stringify(actual.channel) !== JSON.stringify(config.observation)
      || actual.observedAt !== config.observedAt || JSON.stringify(actual.error) !== JSON.stringify(config.error))) issue('attestation', 'Attestation differs from the actual dated channel evidence');
    if (Date.parse(actual.observedAt) > Date.parse(snapshot.observedAt)) issue('observedAt', 'Snapshot predates its producer observation');
  }
});
export type AgentChannelAccessSnapshot = z.infer<typeof AgentChannelAccessSnapshotSchema>;

/** Current explicit policy evidence, independent of provider readiness or a successful end-to-end user message. */
export function isAgentChannelAccessSnapshotCurrent(rawSnapshot: unknown, rawBinding: unknown,
  rawKind: unknown, now: number, maximumAgeMs = 60_000): boolean {
  const snapshot = AgentChannelAccessSnapshotSchema.safeParse(rawSnapshot), kind = AgentBirthChannelKindSchema.safeParse(rawKind);
  if (!snapshot.success || !kind.success || !Number.isFinite(maximumAgeMs)) return false;
  const config = snapshot.data.configuration;
  if (config.kind !== kind.data || !sameAgentChannelAccessBinding(bindingOf(config), rawBinding)
    || config.access === undefined || !isChannelConfigurationApplied(config)) return false;
  const age = now - Date.parse(config.observedAt ?? '');
  return age >= 0 && age <= maximumAgeMs;
}

/** Runs against a fresh, authorized saved/effective snapshot BEFORE runtime effects; auth is the producer's duty. */
export function isAgentChannelAccessApplyReady(rawCommand: unknown, rawSnapshot: unknown): boolean {
  const command = AgentChannelAccessApplyCommandSchema.safeParse(rawCommand), snapshot = AgentChannelAccessSnapshotSchema.safeParse(rawSnapshot);
  if (!command.success || !snapshot.success) return false;
  const intent = command.data, current = snapshot.data, config = current.configuration;
  if (intent.desiredVersion !== config.desired.version || intent.expectedAppliedVersion !== (config.applied?.version ?? null)) return false;
  const changes = intent.requestChanges;
  if (changes === null) return true;
  if (current.requests.status !== 'available' || current.requests.queue.version !== changes.expectedQueueVersion) return false;
  const queue = current.requests.queue;
  return changes.operations.every(operation => {
    const request = queue.requests.find(entry => entry.requestId === operation.requestId);
    if (!request) return false;
    if (operation.action === 'ignore') return true;
    const policy = config.access?.desiredPolicy;
    return policy?.kind === 'telegram' && policy.chats.some(chat => chat.chatId === request.chatId && chat.type === request.type);
  });
}

const OutcomeSchema = z.enum(['applied', 'pending', 'failed']);
export const AgentChannelAccessRequestResultSchema = AgentChannelAccessRequestOperationSchema.extend({ state: OutcomeSchema });
export type AgentChannelAccessRequestResult = z.infer<typeof AgentChannelAccessRequestResultSchema>;
export const AgentChannelAccessApplyResultSchema = AgentChannelAccessBindingSchema.safeExtend({
  kind: AgentBirthChannelKindSchema, action: z.literal('apply-channel'), requestId: AgentManagementRequestIdSchema,
  desiredVersion: AgentConfigVersionSchema, expectedAppliedVersion: AgentConfigVersionSchema.nullable(),
  requestChanges: AgentChannelAccessRequestChangesSchema.nullable(), replayed: z.boolean(), outcome: OutcomeSchema,
  completedAt: time, snapshot: AgentChannelAccessSnapshotSchema,
  requestResults: z.array(AgentChannelAccessRequestResultSchema), error: AgentChannelAccessErrorCodeSchema.nullable(),
}).superRefine((result, ctx) => {
  const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
  const config = result.snapshot.configuration, changes = result.requestChanges;
  if (!sameAgentChannelAccessBinding(bindingOf(result), bindingOf(config)) || result.kind !== config.kind) issue('snapshot', 'Receipt belongs to another agent or door');
  if (result.desiredVersion !== config.desired.version) issue('desiredVersion', 'Receipt differs from saved desired version');
  if (result.expectedAppliedVersion !== null && result.expectedAppliedVersion > result.desiredVersion) issue('expectedAppliedVersion', 'Receipt describes an impossible previous version');
  if (Date.parse(result.completedAt) < Date.parse(result.snapshot.observedAt)) issue('completedAt', 'Receipt predates its observation');
  if (result.outcome === 'applied' && (!isChannelConfigurationApplied(config) || config.access === undefined || result.error !== null)) issue('outcome', 'Applied receipt requires actual explicit policy evidence and no error');
  if (result.outcome === 'failed' && result.error === null) issue('error', 'Failure requires a fixed error code');
  if (changes !== null && result.kind !== 'telegram') issue('requestChanges', 'Only Telegram has start requests');
  const operations = changes?.operations ?? [];
  if (new Set(result.requestResults.map(item => item.requestId)).size !== result.requestResults.length
    || result.requestResults.length !== operations.length
    || result.requestResults.some(item => !operations.some(operation => operation.requestId === item.requestId && operation.action === item.action))) issue('requestResults', 'Receipt must describe exactly the requested operations');
  if (result.outcome === 'applied' && result.requestResults.some(item => item.state !== 'applied')) issue('requestResults', 'Global applied cannot hide a pending or failed request operation');
  if (result.requestResults.some(item => item.state === 'failed') && result.outcome !== 'failed') issue('outcome', 'A failed request operation cannot be hidden');
  if (result.outcome === 'applied' && changes !== null) {
    const source = result.snapshot.requests;
    if (source.status !== 'available' || source.queue.version <= changes.expectedQueueVersion
      || source.queue.requests.some(request => operations.some(operation => operation.requestId === request.requestId))) issue('requests', 'Applied operations require an advanced queue without the processed requests');
  }
});
export type AgentChannelAccessApplyResult = z.infer<typeof AgentChannelAccessApplyResultSchema>;

/** Complete command correlation after authenticated producer resolution; replay does not authorize another agent. */
export function isAgentChannelAccessResultForCommand(rawCommand: unknown, rawResult: unknown, rawBinding: unknown, rawKind: unknown): boolean {
  const command = AgentChannelAccessApplyCommandSchema.safeParse(rawCommand), result = AgentChannelAccessApplyResultSchema.safeParse(rawResult);
  const kind = AgentBirthChannelKindSchema.safeParse(rawKind);
  if (!command.success || !result.success || !kind.success) return false;
  const intent = command.data, actual = result.data;
  if (!sameAgentChannelAccessBinding(bindingOf(actual), rawBinding) || actual.kind !== kind.data
    || actual.requestId !== intent.requestId || actual.desiredVersion !== intent.desiredVersion
    || actual.expectedAppliedVersion !== intent.expectedAppliedVersion) return false;
  const wantedChanges = intent.requestChanges, actualChanges = actual.requestChanges;
  if (wantedChanges === null || actualChanges === null) return wantedChanges === actualChanges;
  return wantedChanges.expectedQueueVersion === actualChanges.expectedQueueVersion
    && wantedChanges.operations.length === actualChanges.operations.length
    && wantedChanges.operations.every(operation => actualChanges.operations.some(item => item.requestId === operation.requestId && item.action === operation.action));
}
