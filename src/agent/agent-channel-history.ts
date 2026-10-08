import { z } from 'zod';
import { AgentChannelConfigurationSchema } from './agent-channel-configuration.js';
import { AgentChannelAccessBindingSchema, AgentChannelAccessNameSchema, sameAgentChannelAccessBinding, AgentTelegramChatIdSchema, AgentChannelEmailAddressSchema, type AgentChannelAccessBinding } from './agent-channel-access.js';
import { AgentManagementRequestIdSchema } from './agent-management.js';
import { AgentChannelAccessErrorCodeSchema } from './agent-channel-access-requests.js';

/** One canonical owner-scoped history for all four doors; never a raw provider log. */
export const AgentChannelHistoryKindSchema = z.enum(['telegram', 'email', 'phone', 'web']);
export type AgentChannelHistoryKind = z.infer<typeof AgentChannelHistoryKindSchema>;
const time = z.iso.datetime({ offset: true });
const bindingOf = (value: AgentChannelAccessBinding): AgentChannelAccessBinding => ({ scope: value.scope, identity: value.identity });
export const AgentChannelHistoryContentStateSchema = z.enum(['available', 'not-retained', 'expired', 'unavailable', 'not-applicable']);
export const AgentChannelHistoryEntrySchema = AgentChannelAccessBindingSchema.safeExtend({
  entryId: AgentManagementRequestIdSchema, kind: AgentChannelHistoryKindSchema,
  conversationId: AgentManagementRequestIdSchema,
  /** Set only by the existing server operation, not an arbitrary historical event. */
  requestId: AgentManagementRequestIdSchema.nullable(),
  direction: z.enum(['inbound', 'outbound']), participantName: AgentChannelAccessNameSchema.nullable(),
  status: z.enum(['active', 'completed', 'failed', 'unknown']),
  startedAt: time, endedAt: time.nullable(), durationSeconds: z.number().finite().nonnegative().nullable(),
  /** Availability only. Contents and transport URLs require separate authorized reads. */
  content: z.object({ audio: AgentChannelHistoryContentStateSchema, transcript: AgentChannelHistoryContentStateSchema }).strict(),
}).superRefine((entry, ctx) => {
  const terminal = entry.status === 'completed' || entry.status === 'failed';
  if (terminal !== (entry.endedAt !== null)) ctx.addIssue({ code: 'custom', path: ['endedAt'], message: 'Only an attested terminal record has an ending' }); // guard:terminal-time
  if (entry.endedAt === null && entry.durationSeconds !== null) ctx.addIssue({ code: 'custom', path: ['durationSeconds'], message: 'Elapsed duration is unknown until an attested ending' }); // guard:unknown-duration
  if (entry.endedAt !== null) {
    const elapsed = Date.parse(entry.endedAt) - Date.parse(entry.startedAt);
    if (elapsed < 0) ctx.addIssue({ code: 'custom', path: ['endedAt'], message: 'Ending cannot precede start' }); // guard:chronology
    if (entry.durationSeconds !== null && entry.durationSeconds * 1000 > elapsed) ctx.addIssue({ code: 'custom', path: ['durationSeconds'], message: 'Conversation duration cannot exceed the attested elapsed interval' }); // guard:elapsed-duration
  }
});
export type AgentChannelHistoryEntry = z.infer<typeof AgentChannelHistoryEntrySchema>;
export const AgentChannelHistoryVerificationSchema = z.object({
  requestId: AgentManagementRequestIdSchema, entryId: AgentManagementRequestIdSchema,
  completedAt: time, outcome: z.enum(['completed', 'failed']),
}).strict();
export type AgentChannelHistoryVerification = z.infer<typeof AgentChannelHistoryVerificationSchema>;
const available = AgentChannelAccessBindingSchema.safeExtend({
  status: z.literal('available'), kind: AgentChannelHistoryKindSchema, observedAt: time,
  entries: z.array(AgentChannelHistoryEntrySchema).max(100),
  /** null means the source did not attest a total; do not fabricate a denominator. */
  total: z.number().int().nonnegative().nullable(), nextCursor: AgentManagementRequestIdSchema.nullable(),
  lastVerification: AgentChannelHistoryVerificationSchema.nullable(),
}).superRefine((history, ctx) => {
  const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
  if (history.entries.some(entry => !sameAgentChannelAccessBinding(bindingOf(entry), bindingOf(history)))) issue('entries', 'Stored entries belong to another full binding'); // guard:entry-binding
  if (history.entries.some(entry => entry.kind !== history.kind)) issue('entries', 'Stored entries belong to another door'); // guard:entry-kind
  if (new Set(history.entries.map(entry => entry.entryId)).size !== history.entries.length) issue('entries', 'Stored entry ids must be unique'); // guard:entry-unique
  if (history.total !== null && history.total < history.entries.length) issue('total', 'Attested total cannot be smaller than the returned page'); // guard:total
  if (history.entries.length === 0 && history.nextCursor !== null) issue('nextCursor', 'An empty page cannot promise a following cursor'); // guard:empty-cursor
  if (history.entries.some(entry => Date.parse(entry.startedAt) > Date.parse(history.observedAt)
    || (entry.endedAt !== null && Date.parse(entry.endedAt) > Date.parse(history.observedAt)))) issue('observedAt', 'History cannot observe future events'); // guard:observed-events
  const verification = history.lastVerification;
  if (verification !== null) {
    const entry = history.entries.find(value => value.entryId === verification.entryId);
    if (!entry || entry.requestId !== verification.requestId || entry.endedAt !== verification.completedAt
      || entry.status !== verification.outcome) issue('lastVerification', 'Verification must describe its correlated terminal stored operation'); // guard:verification-record
  }
});
const unavailable = AgentChannelAccessBindingSchema.safeExtend({
  status: z.literal('unavailable'), kind: AgentChannelHistoryKindSchema,
  observedAt: time.nullable(), error: AgentChannelAccessErrorCodeSchema,
});
export const AgentChannelHistoryResponseSchema = z.discriminatedUnion('status', [available, unavailable]);
export type AgentChannelHistoryResponse = z.infer<typeof AgentChannelHistoryResponseSchema>;
/** A producer still authenticates the caller and attests each stored fact. */
export function isAgentChannelHistoryCurrent(rawHistory: unknown, rawBinding: unknown, rawKind: unknown, now: number, maximumAgeMs = 60_000): boolean {
  const history = AgentChannelHistoryResponseSchema.safeParse(rawHistory);
  const binding = AgentChannelAccessBindingSchema.safeParse(rawBinding);
  const kind = AgentChannelHistoryKindSchema.safeParse(rawKind);
  if (!history.success || history.data.status !== 'available' || !binding.success || !kind.success
    || !Number.isFinite(maximumAgeMs)) return false; // guard:current-parse
  const actual = history.data;
  return sameAgentChannelAccessBinding(bindingOf(actual), binding.data) // guard:current-binding
    && actual.kind === kind.data // guard:current-kind
    && Date.parse(actual.observedAt) <= now // guard:current-future
    && now - Date.parse(actual.observedAt) < maximumAgeMs; // guard:current-fresh
}
/** Correlation/freshness only, NOT resource generation or a completed user round trip.
 * Compose the appropriate end-to-end evidence guard before displaying a healthy door. */
export function isAgentChannelHistoryVerificationCurrent(rawHistory: unknown, rawBinding: unknown, rawKind: unknown, expectedRequestId: unknown, now: number, maximumAgeMs = 60_000): boolean {
  if (!isAgentChannelHistoryCurrent(rawHistory, rawBinding, rawKind, now, maximumAgeMs)) return false; // guard:verification-current
  const history = AgentChannelHistoryResponseSchema.safeParse(rawHistory);
  const requestId = AgentManagementRequestIdSchema.safeParse(expectedRequestId);
  if (!history.success || history.data.status !== 'available' || !requestId.success) return false;
  const verification = history.data.lastVerification;
  return verification !== null // guard:verification-present
    && verification.outcome === 'completed' // guard:verification-success
    && verification.requestId === requestId.data // guard:verification-request
    && now - Date.parse(verification.completedAt) < maximumAgeMs; // guard:verification-fresh
}


/** Internal server evidence, NEVER the public history DTO. Existing writers attest actual events;
 * these schemas do not authenticate accounts, deliver replies or establish a new ledger/store.
 */
/** Expected participant comes from the existing owners registry, not from the request body or admitted-chat list. */
export const AgentChannelHistoryOwnerParticipantSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('telegram'), userId: AgentTelegramChatIdSchema.refine(id => !id.startsWith('-')) }).strict(),
  z.object({ kind: z.literal('email'), address: AgentChannelEmailAddressSchema }).strict(),
]);
export type AgentChannelHistoryOwnerParticipant = z.infer<typeof AgentChannelHistoryOwnerParticipantSchema>;
export const AgentChannelHistoryRoundTripEvidenceSchema = z.object({
  requestId: AgentManagementRequestIdSchema, entryId: AgentManagementRequestIdSchema,
  participant: AgentChannelHistoryOwnerParticipantSchema,
  configuration: AgentChannelConfigurationSchema,
  owner: AgentChannelAccessBindingSchema.shape.scope.pick({ tenantId: true, ownerId: true }).strict(),
  requestedAt: time, receivedAt: time, turnCompletedAt: time, replyDeliveredAt: time,
}).strict();
export type AgentChannelHistoryRoundTripEvidence = z.infer<typeof AgentChannelHistoryRoundTripEvidenceSchema>;
/** TG/email only: phone/web require their canonical C2/C3 conversation-completion evidence separately. */
export function isAgentChannelHistoryRoundTripVerified(rawHistory: unknown, rawBinding: unknown, rawKind: unknown,
  expectedRequestId: unknown, rawEvidence: unknown, rawCurrentConfiguration: unknown, rawExpectedOwnerParticipant: unknown, now: number, maximumAgeMs = 60_000): boolean {
  if (!isAgentChannelHistoryVerificationCurrent(rawHistory, rawBinding, rawKind, expectedRequestId, now, maximumAgeMs)) return false; // guard:trip-history
  const evidence = AgentChannelHistoryRoundTripEvidenceSchema.safeParse(rawEvidence);
  const current = AgentChannelConfigurationSchema.safeParse(rawCurrentConfiguration);
  const history = AgentChannelHistoryResponseSchema.safeParse(rawHistory);
  if (!evidence.success || !current.success || !history.success || history.data.status !== 'available') return false; // guard:trip-parse
  const ownerParticipant = AgentChannelHistoryOwnerParticipantSchema.safeParse(rawExpectedOwnerParticipant);
  if (!ownerParticipant.success || ownerParticipant.data.kind !== rawKind || JSON.stringify(evidence.data.participant) !== JSON.stringify(ownerParticipant.data)) return false; // guard:trip-participant
  const proof = evidence.data, frozen = proof.configuration, actual = current.data;
  const binding = bindingOf(history.data);
  if (frozen.kind !== rawKind || actual.kind !== rawKind) return false; // guard:trip-kind
  if (!sameAgentChannelAccessBinding(bindingOf(frozen), binding) || !sameAgentChannelAccessBinding(bindingOf(actual), binding)) return false; // guard:trip-binding
  if (proof.owner.ownerId !== binding.scope.ownerId || proof.owner.tenantId !== binding.scope.tenantId) return false; // guard:trip-owner
  if (proof.requestId !== expectedRequestId || proof.entryId !== history.data.lastVerification!.entryId) return false; // guard:trip-operation
  const verificationEntryId = history.data.lastVerification!.entryId;
  const entry = history.data.entries.find(value => value.entryId === verificationEntryId)!;
  if (entry.direction !== 'inbound') return false; // guard:trip-inbound
  const requested = Date.parse(proof.requestedAt), received = Date.parse(proof.receivedAt), turn = Date.parse(proof.turnCompletedAt), delivered = Date.parse(proof.replyDeliveredAt);
  if (requested > received || received > turn || turn > delivered || proof.receivedAt !== entry.startedAt || proof.replyDeliveredAt !== entry.endedAt) return false; // guard:trip-stages
  for (const [config, at] of [[frozen, requested], [actual, now]] as const) {
    if (config.applied?.state !== 'active' || config.desired.state !== 'active' || config.applied.version !== config.desired.version
      || config.resource === null || config.access?.appliedPolicy == null || config.error !== null) return false; // guard:trip-applied
    if (config.observation?.state !== 'loaded' || config.observation.loaded !== true || config.observation.readiness !== 'ready' || config.observedAt === null) return false; // guard:trip-loaded
    const age = at - Date.parse(config.observedAt);
    if (age < 0 || age >= maximumAgeMs) return false; // guard:trip-fresh
  }
  const facts = (config: typeof actual) => ({ scope: config.scope, identity: config.identity, kind: config.kind, applied: config.applied,
    resource: config.resource, policy: config.access!.appliedPolicy, channelId: config.observation!.channelId });
  return JSON.stringify(facts(frozen)) === JSON.stringify(facts(actual)); // guard:trip-generation
}
