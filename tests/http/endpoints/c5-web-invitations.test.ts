import { describe, expect, it } from 'vitest';
import { forgeElevenLabsWebInvitationsContract as get, forgeElevenLabsWebInviteContract as invite, forgeElevenLabsWebRevokeContract as revoke,
  forgeElevenLabsWebInvitationsPath as path, forgeElevenLabsWebRevokePath as revokePath,
  ForgeElevenLabsWebInvitationListResponseSchema as Response, ForgeElevenLabsWebInvitationWriteResultSchema as Result,
  isElevenLabsWebInvitationWithinForgeAuthorization as authorized, projectForgeElevenLabsWebInvitations as project,
  isForgeElevenLabsWebInvitationResultForDraft as correlated } from '../../../src/http/endpoints/forge-elevenlabs-web.js';
const now = Date.parse('2026-10-08T12:00:00.000Z'), at = new Date(now).toISOString();
const scope = { tenantId: 'invitation-tenant', ownerId: 'invitation-owner', agentId: 'invitation-runtime' };
const identity = { managementAgentId: 'invitation-management', runtimeAgentId: scope.agentId, vaultAgentId: 101 };
const owner = { role: 'owner', ownerId: scope.ownerId, tenantId: scope.tenantId }, agentId = identity.managementAgentId;
const entry = { invitationId: 'invitation-record', revision: 4, email: 'invitee@example.test', status: 'active', createdAt: at, expiresAt: new Date(now + 3_600_000).toISOString(), revokedAt: null };
// Canonical C3 record fields are constructed explicitly, without browser metadata or authority.
function source() { return { scope, identity, status: 'available', version: 4, observedAt: at, entries: [
  { status: 'registered', email: entry.email, invitation: { invitationId: entry.invitationId, revision: 4,
    createdAt: at, expiresAt: entry.expiresAt, revokedAt: null, scope, recipientUserId: 'invitation-clerk-user' } },
] }; }
const draft = { requestId: 'invitation-write-request', email: entry.email, expectedVersion: 3 };
const remove = { requestId: draft.requestId, invitationId: entry.invitationId, expectedVersion: 3 };
const receipt = { ok: true, requestId: draft.requestId, replayed: false, version: 4, invitation: entry };
const revoked = { ...receipt, invitation: { ...entry, status: 'revoked', revokedAt: at } };
describe('C5 Forge invitation HTTP contracts', () => {
  it.each([get, invite, revoke])('requires existing Forge session and owner authorization: $path', contract => {
    expect(contract.authentication).toBe('forge-session'); expect(contract.authorization).toBe('sa-or-agent-owner'); expect(contract).not.toHaveProperty('authType');
  });
  it('uses canonical management ID paths and fixed methods', () => {
    expect(get.method).toBe('GET'); expect(invite.method).toBe('POST'); expect(revoke.method).toBe('POST');
    expect(path(agentId)).toBe('/api/agents/invitation-management/channels/web/invitations');
    expect(revokePath(agentId)).toBe('/api/agents/invitation-management/channels/web/invitations/revoke');
    for (const id of ['../foreign','bad%2fid','bad?owner=me','']) { expect(() => path(id)).toThrow(); expect(() => revokePath(id)).toThrow(); }
  });
  it('allows the exact owner and SA only on the requested management agent', () => {
    expect(authorized(source(), owner, agentId)).toBe(true); expect(authorized(source(), { role: 'sa' }, agentId)).toBe(true);
    expect(authorized(source(), { ...owner, ownerId: 'other-owner' }, agentId)).toBe(false);
    expect(authorized(source(), { ...owner, tenantId: 'other-tenant' }, agentId)).toBe(false);
    for (const access of [null, {}, { role: 'owner', ...scope }, { role: 'sa', ownerId: scope.ownerId }]) expect(authorized(source(), access, agentId)).toBe(false);
    expect(authorized({}, owner, agentId)).toBe(false);
    expect(authorized(source(), owner, scope.agentId)).toBe(false); expect(authorized(source(), { role: 'sa' }, 'other-management')).toBe(false);
  });
  it('projects only fresh authorized metadata, with an attested empty list distinct from unavailability', () => {
    expect(project(source(), owner, agentId, now)).toEqual({ status: 'available', version: 4, observedAt: at, entries: [entry] });
    expect(project({ ...source(), entries: [] }, owner, agentId, now)).toEqual({ status: 'available', version: 4, observedAt: at, entries: [] });
    expect(project(source(), { ...owner, ownerId: 'other-owner' }, agentId, now)).toBe(null);
    for (const value of [{}, null, { ...source(), status: 'unavailable' }]) expect(project(value, owner, agentId, now)).toBe(null);
    for (const clock of [now - 1, now + 60_000, NaN, Infinity]) expect(project(source(), owner, agentId, clock)).toBe(null);
    expect(project(source(), owner, 'other-management', now)).toBe(null);
  });
  it('keeps list and write bodies strict, with no scope, Clerk, provider or copied authorization', () => {
    const response = { status: 'available', version: 4, observedAt: at, entries: [entry] };
    expect(Response.safeParse(response).success).toBe(true); expect(Response.safeParse({ status: 'unavailable' }).success).toBe(true);
    for (const extra of [{ scope }, { identity }, { recipientUserId: 'private-user' }, { signedUrl: 'private-value' }]) {
      expect(Response.safeParse({ ...response, ...extra }).success).toBe(false);
      expect(Response.safeParse({ status: 'unavailable', ...extra }).success).toBe(false);
      expect(Result.safeParse({ ...receipt, ...extra }).success).toBe(false);
      expect(invite.bodySchema.safeParse({ ...draft, ...extra }).success).toBe(false);
      expect(revoke.bodySchema.safeParse({ ...remove, ...extra }).success).toBe(false);
    }
    expect(Response.safeParse({ status: 'unavailable', entries: [] }).success).toBe(false);
    expect(Response.safeParse({ ...response, entries: [{ ...entry, scope }] }).success).toBe(false);
    expect(Response.safeParse({ ...response, entries: Array(513).fill(entry) }).success).toBe(false);
    expect(Result.safeParse({ ...receipt, invitation: { ...entry, revision: 3 } }).success).toBe(false);
  });
  it('correlates active or pending registration receipts and exact revocation without granting admission', () => {
    expect(correlated('invite', draft, receipt)).toBe(true);
    expect(correlated('invite', { ...draft, email: 'INVITEE@EXAMPLE.TEST' }, { ...receipt, replayed: true })).toBe(true);
    expect(correlated('invite', draft, { ...receipt, invitation: { ...entry, status: 'pending-registration' } })).toBe(true);
    expect(correlated('revoke', remove, revoked)).toBe(true);
    expect(correlated('invite', draft, revoked)).toBe(false); expect(correlated('revoke', remove, receipt)).toBe(false);
    expect(correlated('invite', draft, { ...receipt, invitation: { ...entry, status: 'expired' } })).toBe(false);
  });
  it.each([
    { requestId: 'other-request' }, { version: 5, invitation: { ...entry, revision: 5 } }, { version: 3, invitation: { ...entry, revision: 3 } },
    { invitation: { ...entry, email: 'other@example.test' } },
  ])('refuses a receipt for another invite request/version/recipient %#', changes => expect(correlated('invite', draft, { ...receipt, ...changes })).toBe(false));
  it('rejects revoke mismatches, malformed drafts/receipts and unknown operations', () => {
    expect(correlated('revoke', { ...remove, invitationId: 'other-record' }, revoked)).toBe(false);
    expect(correlated('revoke', { ...remove, expectedVersion: 4 }, revoked)).toBe(false);
    expect(correlated('revoke', { ...remove, requestId: 'other-request' }, revoked)).toBe(false);
    for (const action of [null, 'other', 'INVITE']) { expect(correlated(action, draft, receipt)).toBe(false); expect(correlated(action, remove, revoked)).toBe(false); }
    expect(correlated('invite', {}, receipt)).toBe(false); expect(correlated('revoke', {}, revoked)).toBe(false);
    expect(correlated('invite', draft, {})).toBe(false); expect(correlated('revoke', remove, {})).toBe(false);
    expect(get.errorResponseSchema.safeParse({ ok: false, error: 'raw provider detail' }).success).toBe(false);
  });
});
