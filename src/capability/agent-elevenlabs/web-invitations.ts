import { z } from 'zod';
import { ElevenLabsWebInvitationSchema, isElevenLabsWebInvitationCurrent } from './web-channel.js';
import { AgentChannelAccessBindingSchema, AgentChannelEmailAddressSchema, sameAgentChannelAccessBinding } from '../../agent/agent-channel-access.js';
import { CapabilityAgentScopeSchema, sameCapabilityScope } from '../capability-call-context.js';
/** Existing registry lookup only, supplied by Forge. An outage is not a not-registered result. */
export const ElevenLabsWebRecipientLookupSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('registered'), email: AgentChannelEmailAddressSchema, recipientUserId: ElevenLabsWebInvitationSchema.shape.recipientUserId, observedAt: ElevenLabsWebInvitationSchema.shape.createdAt }).strict(),
  z.object({ status: z.literal('not-registered'), email: AgentChannelEmailAddressSchema, observedAt: ElevenLabsWebInvitationSchema.shape.createdAt }).strict(),
  z.object({ status: z.literal('unavailable') }).strict(),
]);
export type ElevenLabsWebRecipientLookup = z.infer<typeof ElevenLabsWebRecipientLookupSchema>;
/** No account/user ID, scope, authorization or timestamps may come from the browser. */
export const ElevenLabsWebInviteDraftSchema = z.object({
  requestId: ElevenLabsWebInvitationSchema.shape.invitationId, email: AgentChannelEmailAddressSchema,
  expectedVersion: ElevenLabsWebInvitationSchema.shape.revision,
}).strict();
export const ElevenLabsWebRevokeDraftSchema = z.object({
  requestId: ElevenLabsWebInvitationSchema.shape.invitationId, invitationId: ElevenLabsWebInvitationSchema.shape.invitationId,
  expectedVersion: ElevenLabsWebInvitationSchema.shape.revision,
}).strict();
export type ElevenLabsWebInviteDraft = z.infer<typeof ElevenLabsWebInviteDraftSchema>;
export type ElevenLabsWebRevokeDraft = z.infer<typeof ElevenLabsWebRevokeDraftSchema>;
/** Same C3 metadata validators; a pending record has no principal and can never be submitted as C3 authority. */
function invitationTimes(value: { createdAt: string; expiresAt: string; revokedAt: string | null }, ctx: z.RefinementCtx): void {
  if (Date.parse(value.createdAt) >= Date.parse(value.expiresAt)) ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Expiry must follow creation' }); // guard:invite-expiry
  if (value.revokedAt !== null && Date.parse(value.revokedAt) < Date.parse(value.createdAt)) ctx.addIssue({ code: 'custom', path: ['revokedAt'], message: 'Revocation cannot precede creation' }); // guard:invite-revocation
}
export const ElevenLabsWebPendingInvitationSchema = z.object(ElevenLabsWebInvitationSchema.shape).omit({ recipientUserId: true }).strict().superRefine(invitationTimes);
export const ElevenLabsWebInvitationRecordSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('registered'), email: AgentChannelEmailAddressSchema, invitation: ElevenLabsWebInvitationSchema }).strict(),
  z.object({ status: z.literal('pending-registration'), email: AgentChannelEmailAddressSchema, pending: ElevenLabsWebPendingInvitationSchema, invitation: z.null() }).strict(),
]);
export type ElevenLabsWebInvitationRecord = z.infer<typeof ElevenLabsWebInvitationRecordSchema>;
export const ElevenLabsWebInvitationListSchema = AgentChannelAccessBindingSchema.safeExtend({
  status: z.literal('available'), version: ElevenLabsWebInvitationSchema.shape.revision,
  observedAt: ElevenLabsWebInvitationSchema.shape.createdAt, entries: z.array(ElevenLabsWebInvitationRecordSchema).max(512),
}).strict().superRefine((list, ctx) => {
  const records = list.entries.map(entry => entry.status === 'registered' ? entry.invitation : entry.pending);
  const issue = (message: string) => ctx.addIssue({ code: 'custom', path: ['entries'], message });
  if (records.some(record => !sameCapabilityScope(record.scope, list.scope))) issue('Invitations belong to another full scope'); // guard:invite-list-scope
  if (new Set(records.map(record => record.invitationId)).size !== records.length) issue('Current invitation ids must be unique'); // guard:invite-list-id
  if (new Set(list.entries.map(entry => entry.email)).size !== records.length) issue('Current invitation mailboxes must be unique'); // guard:invite-list-email
  if (records.some(record => record.revision > list.version)) issue('Stored revision cannot exceed the source version'); // guard:invite-list-version
  if (records.some(record => Date.parse(record.createdAt) > Date.parse(list.observedAt) || (record.revokedAt !== null && Date.parse(record.revokedAt) > Date.parse(list.observedAt)))) issue('Cannot observe future stored events'); // guard:invite-list-events
});
export type ElevenLabsWebInvitationList = z.infer<typeof ElevenLabsWebInvitationListSchema>;
const PublicMetadata = z.object(ElevenLabsWebPendingInvitationSchema.shape).omit({ scope: true });
export const ElevenLabsWebPublicInvitationSchema = PublicMetadata.safeExtend({
  email: AgentChannelEmailAddressSchema, status: z.enum(['active', 'pending-registration', 'revoked', 'expired']),
}).strict().superRefine(invitationTimes).superRefine((entry, ctx) => {
  if ((entry.status === 'revoked') !== (entry.revokedAt !== null)) ctx.addIssue({ code: 'custom', path: ['status'], message: 'Revocation state and timestamp must agree' }); // guard:invite-public-state
});
export type ElevenLabsWebPublicInvitation = z.infer<typeof ElevenLabsWebPublicInvitationSchema>;
/** Correlation only, not a writer, registry lookup, admission decision or account-link flow. */
export function isElevenLabsWebInvitationListCurrent(rawList: unknown, rawBinding: unknown, now: number, maximumAgeMs = 60_000): boolean {
  const list = ElevenLabsWebInvitationListSchema.safeParse(rawList), binding = AgentChannelAccessBindingSchema.safeParse(rawBinding);
  if (!list.success || !binding.success || !Number.isFinite(now) || !Number.isFinite(maximumAgeMs) || maximumAgeMs <= 0) return false; // guard:invite-current-parse
  const { scope, identity, observedAt } = list.data;
  return sameAgentChannelAccessBinding({ scope, identity }, binding.data) // guard:invite-current-binding
    && Date.parse(observedAt) <= now && now - Date.parse(observedAt) < maximumAgeMs; // guard:invite-current-time
}
export function projectElevenLabsWebInvitationList(rawList: unknown, rawBinding: unknown, now: number): ElevenLabsWebPublicInvitation[] | null {
  if (!isElevenLabsWebInvitationListCurrent(rawList, rawBinding, now)) return null; // guard:invite-project-current
  const list = ElevenLabsWebInvitationListSchema.parse(rawList);
  return list.entries.map(entry => {
    const record = entry.status === 'registered' ? entry.invitation : entry.pending;
    const status = record.revokedAt !== null ? 'revoked' : Date.parse(record.expiresAt) <= now ? 'expired' : entry.status === 'registered' ? 'active' : 'pending-registration'; // guard:invite-project-status
    return ElevenLabsWebPublicInvitationSchema.parse({ invitationId: record.invitationId, revision: record.revision, email: entry.email, status,
      createdAt: record.createdAt, expiresAt: record.expiresAt, revokedAt: record.revokedAt }); // guard:invite-project-filter
  });
}
/** Returns only the existing C3 record for an exact currently registered target; pending never grants access.
 * Producers also authenticate ownership and apply current admission/contact policy, then recheck after await.
 */
export function isElevenLabsWebInvitationRecipientCurrent(rawRecord: unknown, rawLookup: unknown, expectedScope: unknown, expectedEmail: unknown, expectedRevision: unknown, now: number): boolean {
  const record = ElevenLabsWebInvitationRecordSchema.safeParse(rawRecord), lookup = ElevenLabsWebRecipientLookupSchema.safeParse(rawLookup);
  const scope = CapabilityAgentScopeSchema.safeParse(expectedScope), email = AgentChannelEmailAddressSchema.safeParse(expectedEmail);
  if (!record.success || record.data.status !== 'registered' || !lookup.success || lookup.data.status !== 'registered' || !scope.success || !email.success) return false; // guard:invite-recipient-parse
  if (record.data.email !== email.data || lookup.data.email !== email.data) return false; // guard:invite-recipient-target
  if (Date.parse(lookup.data.observedAt) > now || now - Date.parse(lookup.data.observedAt) >= 60_000) return false; // guard:invite-recipient-time
  return isElevenLabsWebInvitationCurrent(record.data.invitation, scope.data, lookup.data.recipientUserId, expectedRevision, new Date(now)); // guard:invite-recipient-c3
}
