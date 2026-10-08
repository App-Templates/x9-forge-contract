import { describe, expect, it } from 'vitest';
import { ElevenLabsWebRecipientLookupSchema as Lookup, ElevenLabsWebInviteDraftSchema as Invite, ElevenLabsWebRevokeDraftSchema as Revoke,
  ElevenLabsWebPendingInvitationSchema as Pending, ElevenLabsWebInvitationRecordSchema as Record, ElevenLabsWebInvitationListSchema as List,
  ElevenLabsWebPublicInvitationSchema as Public, isElevenLabsWebInvitationListCurrent as current, projectElevenLabsWebInvitationList as project,
  isElevenLabsWebInvitationRecipientCurrent as recipient } from '../../src/capability/agent-elevenlabs/web-invitations.js';
import { ElevenLabsWebInvitationSchema } from '../../src/capability/agent-elevenlabs/web-channel.js';
const now = Date.parse('2026-10-08T12:00:00.000Z'), at = new Date(now).toISOString();
const binding = { scope: { tenantId: 'invitation-tenant', ownerId: 'invitation-owner', agentId: 'invitation-runtime' }, identity: { managementAgentId: 'invitation-management', runtimeAgentId: 'invitation-runtime', vaultAgentId: 101 } };
const metadata = { invitationId: 'invitation-record', scope: binding.scope, revision: 3, createdAt: at, expiresAt: new Date(now + 3_600_000).toISOString(), revokedAt: null };
const registered = { status: 'registered', email: 'invitee@example.test', invitation: { ...metadata, recipientUserId: 'invitation-clerk-user' } };
const pending = { status: 'pending-registration', email: 'pending@example.test', invitation: null, pending: { ...metadata, invitationId: 'invitation-pending' } };
const lookup = { status: 'registered', email: registered.email, recipientUserId: registered.invitation.recipientUserId, observedAt: at };
const list = { ...binding, status: 'available', version: 3, observedAt: at, entries: [registered, pending] };
const draft = { requestId: 'invitation-request', email: registered.email, expectedVersion: 3 };
describe('C5 authenticated invitations use the existing registry and C3 record', () => {
  it('keeps registered, not registered and unavailable lookup distinct', () => {
    for (const value of [lookup, { status: 'not-registered', email: registered.email, observedAt: at }, { status: 'unavailable' }]) expect(Lookup.safeParse(value).success).toBe(true);
    expect(Lookup.safeParse({ ...lookup, recipientUserId: null }).success).toBe(false);
    expect(Lookup.safeParse({ status: 'unavailable', email: registered.email }).success).toBe(false);
  });
  it('uses exact normalized email and only correlation/version from a browser draft', () => {
    expect(Invite.parse({ ...draft, email: 'INVITEE@EXAMPLE.TEST' })).toEqual(draft);
    expect(Revoke.safeParse({ requestId: draft.requestId, invitationId: metadata.invitationId, expectedVersion: 3 }).success).toBe(true);
  });
  it.each(['recipientUserId','scope','owner','viewer','credentials','createdAt','expiresAt'])('refuses browser authority %s', key => {
    expect(Invite.safeParse({ ...draft, [key]: {} }).success).toBe(false);
    expect(Revoke.safeParse({ requestId: draft.requestId, invitationId: metadata.invitationId, expectedVersion: 3, [key]: {} }).success).toBe(false);
  });
  it('validates registered records with the canonical C3 invitation and keeps pending closed', () => {
    expect(Record.safeParse(registered).success).toBe(true); expect(Record.safeParse(pending).success).toBe(true);
    expect(ElevenLabsWebInvitationSchema.safeParse(pending).success).toBe(false);
    expect(Record.safeParse({ ...pending, invitation: registered.invitation }).success).toBe(false);
    expect(Pending.safeParse({ ...pending.pending, recipientUserId: 'forged-invitation' }).success).toBe(false);
  });
  it('requires coherent pending expiry and revocation dates', () => {
    expect(Pending.safeParse({ ...metadata, expiresAt: at }).success).toBe(false);
    expect(Pending.safeParse({ ...metadata, revokedAt: new Date(now - 1).toISOString() }).success).toBe(false);
  });
  it('returns public metadata for active and pending records without scope or account identity', () => {
    expect(List.safeParse(list).success).toBe(true); expect(current(list, binding, now)).toBe(true);
    const { scope: _scope, ...publicMetadata } = metadata; void _scope;
    expect(project(list, binding, now)).toEqual([{ ...publicMetadata, email: registered.email, status: 'active' }, { ...publicMetadata, invitationId: pending.pending.invitationId, email: pending.email, status: 'pending-registration' }]);
    for (const entry of project(list, binding, now)!) {
      expect(Public.safeParse(entry).success).toBe(true); expect(entry).not.toHaveProperty('scope'); expect(entry).not.toHaveProperty('recipientUserId'); expect(entry).not.toHaveProperty('identity');
    }
  });
  it('reports revoked and expired records, with revocation precedence, without granting admission', () => {
    const expired = { ...registered, invitation: { ...registered.invitation, createdAt: new Date(now - 120_000).toISOString(), expiresAt: at } };
    expect(project({ ...list, entries: [expired] }, binding, now)?.[0].status).toBe('expired');
    const revoked = { ...expired, invitation: { ...expired.invitation, revokedAt: at } };
    expect(project({ ...list, entries: [revoked] }, binding, now)?.[0].status).toBe('revoked');
    expect(recipient(revoked, lookup, binding.scope, registered.email, metadata.revision, now)).toBe(false);
  });
  it('does not erase an unavailable, stale, future or foreign source as an empty list', () => {
    for (const value of [null, {}, { ...list, status: 'unavailable' }, { ...list, observedAt: new Date(now - 60_000).toISOString() }, { ...list, observedAt: new Date(now + 1).toISOString() }]) expect(project(value, binding, now)).toBe(null);
    expect(project(list, { ...binding, identity: { ...binding.identity, vaultAgentId: 102 } }, now)).toBe(null);
    expect(project({ ...list, entries: [] }, binding, now)).toEqual([]);
  });
  it.each(['tenantId','ownerId','agentId'])('refuses a list row with foreign %s', key => {
    expect(List.safeParse({ ...list, entries: [{ ...registered, invitation: { ...registered.invitation, scope: { ...binding.scope, [key]: 'foreign-invitation' } } }] }).success).toBe(false);
  });
  it('requires unique current invitation IDs and mailboxes and coherent source versions/times', () => {
    expect(List.safeParse({ ...list, entries: [registered, registered] }).success).toBe(false);
    expect(List.safeParse({ ...list, entries: [registered, { ...pending, email: registered.email }] }).success).toBe(false);
    expect(List.safeParse({ ...list, version: 2 }).success).toBe(false);
    expect(List.safeParse({ ...list, observedAt: new Date(now - 1).toISOString() }).success).toBe(false);
    expect(List.safeParse({ ...list, entries: Array.from({ length: 513 }, (_, i) => ({ ...registered, email: `invitee${i}@example.test`, invitation: { ...registered.invitation, invitationId: 'invitation-entry-' + i } })) }).success).toBe(false);
  });
  it('recognizes only the exact currently registered principal and C3 scope/email at the lookup', () => {
    expect(recipient(registered, lookup, binding.scope, registered.email, metadata.revision, now)).toBe(true);
    expect(recipient(registered, { ...lookup, recipientUserId: 'changed-invitation-user' }, binding.scope, registered.email, metadata.revision, now)).toBe(false);
    expect(recipient(registered, { ...lookup, email: 'other@example.test' }, binding.scope, registered.email, metadata.revision, now)).toBe(false);
    expect(recipient(registered, lookup, binding.scope, 'other@example.test', metadata.revision, now)).toBe(false);
    expect(recipient(registered, lookup, { ...binding.scope, ownerId: 'foreign-invitation' }, registered.email, metadata.revision, now)).toBe(false);
    expect(recipient(registered, lookup, binding.scope, registered.email, metadata.revision, now + 3_600_000)).toBe(false);
  });
  it.each([{ status: 'not-registered', email: registered.email, observedAt: at }, { status: 'unavailable' }, null, {}])('never substitutes pending or missing registry result for authentication', value => {
    expect(recipient(registered, value, binding.scope, registered.email, metadata.revision, now)).toBe(false);
    expect(recipient(pending, lookup, binding.scope, pending.email, metadata.revision, now)).toBe(false);
  });
  it('requires fresh registry lookup and the server current invitation revision', () => {
    expect(recipient(registered, { ...lookup, observedAt: new Date(now - 60_000).toISOString() }, binding.scope, registered.email, metadata.revision, now)).toBe(false);
    expect(recipient(registered, { ...lookup, observedAt: new Date(now + 1).toISOString() }, binding.scope, registered.email, metadata.revision, now)).toBe(false);
    expect(recipient(registered, lookup, binding.scope, registered.email, metadata.revision + 1, now)).toBe(false);
  });
  it('supports 512 valid rows and rejects incoherent public revocation or private fields', () => {
    expect(List.safeParse({ ...list, entries: Array.from({ length: 512 }, (_, i) => ({ ...registered, email: `invitee${i}@example.test`, invitation: { ...registered.invitation, invitationId: 'invitation-entry-' + i } })) }).success).toBe(true);
    const { scope: _scope, ...metadataPublic } = metadata; void _scope;
    const value = { ...metadataPublic, email: registered.email, status: 'active' };
    expect(Public.safeParse(value).success).toBe(true);
    expect(Public.safeParse({ ...value, status: 'revoked' }).success).toBe(false);
    expect(Public.safeParse({ ...value, revokedAt: at }).success).toBe(false);
    expect(Public.safeParse({ ...value, scope: binding.scope }).success).toBe(false);
    expect(Public.safeParse({ ...value, recipientUserId: lookup.recipientUserId }).success).toBe(false);
  });

  it('keeps source records and registry snapshots strict and never treats a pending email as a principal', () => {
    for (const record of [registered, pending]) expect(Record.safeParse({ ...record, credentials: {} }).success).toBe(false);
    for (const value of [lookup, { status: 'not-registered', email: registered.email, observedAt: at }, { status: 'unavailable' }]) expect(Lookup.safeParse({ ...value, credentials: {} }).success).toBe(false);
    expect(recipient({ ...pending, email: registered.email }, lookup, binding.scope, registered.email, metadata.revision, now)).toBe(false);
  });
  it('keeps expiry/current-revision C3 checks independent of a freshly reloaded registry', () => {
    const expired = { ...registered, invitation: { ...registered.invitation, createdAt: new Date(now - 120_000).toISOString(), expiresAt: at } };
    expect(recipient(expired, lookup, binding.scope, registered.email, metadata.revision, now)).toBe(false);
    const future = { ...registered, invitation: { ...registered.invitation, createdAt: new Date(now + 1).toISOString() } };
    expect(recipient(future, lookup, binding.scope, registered.email, metadata.revision, now)).toBe(false);
    expect(recipient(registered, lookup, binding.scope, registered.email, null, now)).toBe(false);
  });
  it('rejects missing binding and invalid clocks and never invents future revocation', () => {
    expect(current(list, {}, now)).toBe(false); expect(current(list, binding, Number.NaN)).toBe(false);
    expect(current(list, binding, now, Number.POSITIVE_INFINITY)).toBe(false); expect(current(list, binding, now, 0)).toBe(false);
    expect(List.safeParse({ ...list, entries: [{ ...registered, invitation: { ...registered.invitation, revokedAt: new Date(now + 1).toISOString() } }] }).success).toBe(false);
  });

  it('isolates duplicate IDs from duplicate emails and rejects extra list fields', () => {
    const second = { ...registered, email: 'second@example.test' };
    expect(List.safeParse({ ...list, entries: [registered, second] }).success).toBe(false);
    expect(List.safeParse({ ...list, credentials: {} }).success).toBe(false);
  });
  it('requires fresh observation independently of coherent older records', () => {
    const older = new Date(now - 120_000).toISOString();
    const aged = { ...list, observedAt: new Date(now - 60_000).toISOString(), entries: [
      { ...registered, invitation: { ...registered.invitation, createdAt: older } }, { ...pending, pending: { ...pending.pending, createdAt: older } } ] };
    expect(List.safeParse(aged).success).toBe(true); expect(current(aged, binding, now)).toBe(false); expect(project(aged, binding, now)).toBe(null);
  });

});
