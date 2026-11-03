import { describe, expect, it } from 'vitest';
import { AgentContextIdentitySchema } from '../../src/agent/agent-context-identity.js';
import { ElevenLabsWebAuthorityRequestSchema as Request, ElevenLabsWebAuthoritySnapshotSchema as Snapshot,
  ElevenLabsWebAuthorityResponseSchema as Response, isElevenLabsWebAuthorityCurrent as current,
  isElevenLabsWebAuthorityUsable as usable } from '../../src/capability/agent-elevenlabs/web-context.js';

const scope = { tenantId: 'tenant-web-test', ownerId: 'owner-web-test', agentId: 'runtime-web-test' };
const agentIdentity = { agentId: scope.agentId, ownerId: scope.ownerId, tenantId: scope.tenantId, role: 'master',
  identity: { managementAgentId: 'management-web-test', runtimeAgentId: scope.agentId, vaultAgentId: 101 } };
const request = { requestId: 'request-web-test', scope, linkId: 'stable-web-test', phase: 'before' };
const viewer = { kind: 'authenticated', userId: 'user-web-test', owner: { tenantId: scope.tenantId, ownerId: scope.ownerId } };
const at = '2026-10-08T12:00:00.000Z', origin = 'https://forge.example.test';
const now = new Date(at);
const snapshot = { ...request, viewer, lifecycle: 'active', configuredOrigin: origin, authorityVersion: 3,
  observedAt: at, expiresAt: new Date(now.getTime() + 60_000).toISOString(), agentIdentity };
const response = { ok: true, request, snapshot };
function accepted(raw = response, identity: unknown = agentIdentity, time = now) { return usable(request, raw, viewer, origin, 3, identity, time); }

describe('C5 canonical D identity in web authority', () => {
  it('reuses the verified canonical identity and preserves complete scoped authority', () => {
    expect(AgentContextIdentitySchema.safeParse(agentIdentity).success).toBe(true);
    expect(Snapshot.safeParse(snapshot).success).toBe(true);
    expect(Snapshot.parse(snapshot)).toEqual(snapshot);
    expect(Response.safeParse(response).success).toBe(true); expect(accepted()).toBe(true);
  });
  it('supports a canonical heir without guessing a Master or Vault key', () => {
    const heir = { ...agentIdentity, role: 'erede', masterAgentId: 'master-web-test' };
    expect(AgentContextIdentitySchema.safeParse(heir).success).toBe(true);
    expect(accepted({ ...response, snapshot: { ...snapshot, agentIdentity: heir } }, heir)).toBe(true);
    expect(accepted({ ...response, snapshot: { ...snapshot, agentIdentity: heir } }, { ...heir, masterAgentId: 'different-master' })).toBe(false);
  });
  it('preserves legacy closed failure and the existing correlation-only helper', () => {
    const legacy = { ...snapshot, agentIdentity: null };
    expect(current(request, legacy, viewer, origin, 3, now)).toBe(true);
    expect(Response.safeParse({ ok: false, request, error: 'identity_unavailable', snapshot: legacy }).success).toBe(true);
    expect(accepted({ ok: false, request, error: 'identity_unavailable', snapshot: legacy } as never)).toBe(false);
    expect(Response.safeParse({ ...response, snapshot: legacy }).success).toBe(false);
  });
  it.each(['tenantId', 'ownerId', 'agentId'])('rejects canonical identity belonging to another %s', key => {
    const identity = { ...agentIdentity, [key]: 'foreign', identity: key === 'agentId' ? { ...agentIdentity.identity, runtimeAgentId: 'foreign' } : agentIdentity.identity };
    expect(AgentContextIdentitySchema.safeParse(identity).success).toBe(true);
    expect(Snapshot.safeParse({ ...snapshot, agentIdentity: identity }).success).toBe(false);
  });
  it.each(['managementAgentId', 'vaultAgentId'])('refuses stale expected %s even with the same owner/runtime', key => {
    const expected = { ...agentIdentity, identity: { ...agentIdentity.identity, [key]: key === 'vaultAgentId' ? 102 : 'foreign' } };
    expect(AgentContextIdentitySchema.safeParse(expected).success).toBe(true); expect(accepted(response, expected)).toBe(false);
  });
  it.each([null, undefined, {}, { ...agentIdentity, identity: { managementAgentId: 'management-web-test', runtimeAgentId: scope.agentId } }])('never fabricates missing expected identity %j', expected => {
    expect(usable(request, response, viewer, origin, 3, expected, now)).toBe(false);
  });
  it.each(['archived', 'removed', 'unavailable'])('does not turn %s lifecycle into a successful authority', lifecycle => {
    const value = { ...snapshot, lifecycle }; expect(Snapshot.safeParse(value).success).toBe(true);
    expect(Response.safeParse({ ...response, snapshot: value }).success).toBe(false); expect(accepted({ ...response, snapshot: value })).toBe(false);
  });
  it.each(['requestId', 'linkId', 'phase'])('rejects success with mismatched snapshot %s', key => {
    const value = { ...snapshot, [key]: key === 'phase' ? 'after' : 'different-request' };
    expect(Snapshot.safeParse(value).success).toBe(true); expect(Response.safeParse({ ...response, snapshot: value }).success).toBe(false);
  });
  it('rejects response and snapshot belonging to another canonical scope', () => {
    const otherScope = { ...scope, ownerId: 'other-owner' };
    const value = { ...snapshot, scope: otherScope, agentIdentity: { ...agentIdentity, ownerId: 'other-owner' } };
    expect(Snapshot.safeParse(value).success).toBe(true); expect(Response.safeParse({ ...response, snapshot: value }).success).toBe(false);
  });
  it('requires after-await phase correlation without accepting a before snapshot', () => {
    const after = { ...request, phase: 'after' };
    expect(usable(after, response, viewer, origin, 3, agentIdentity, now)).toBe(false);
    expect(usable(after, { ...response, request: after, snapshot: { ...snapshot, phase: 'after' } }, viewer, origin, 3, agentIdentity, now)).toBe(true);
  });
  it.each([-1, 60_000, 60_001])('denies future or expired authority at clock delta %d', delta => {
    expect(accepted(response, agentIdentity, new Date(now.getTime() + delta))).toBe(false);
  });
  it('requires the expected server viewer, origin and authority version', () => {
    expect(usable(request, response, { ...viewer, userId: 'other' }, origin, 3, agentIdentity, now)).toBe(false);
    expect(usable(request, response, viewer, 'https://different.example.test', 3, agentIdentity, now)).toBe(false);
    expect(usable(request, response, viewer, origin, 4, agentIdentity, now)).toBe(false);
    expect(accepted(response, agentIdentity, new Date(NaN))).toBe(false);
  });
  it('rejects private fields in successful authority', () => {
    expect(Response.safeParse({ ...response, signedUrl: 'synthetic-not-a-url' }).success).toBe(false);
    expect(Response.safeParse({ ...response, error: 'identity_unavailable' }).success).toBe(false);
    expect(Response.safeParse({ ...response, snapshot: { ...snapshot, credentials: {} } }).success).toBe(false);
  });
  it('does not claim identity_unavailable when the identity is already resolved', () => {
    expect(Response.safeParse({ ok: false, request, error: 'identity_unavailable', snapshot }).success).toBe(false);
  });
  it.each(['source_unavailable', 'admission_expired', 'identity_mismatch', 'viewer_unavailable'])('preserves legacy failure %s', error => {
    expect(Response.safeParse({ ok: false, request, error }).success).toBe(true);
    expect(Response.safeParse({ ok: false, request, error, snapshot }).success).toBe(false);
  });
  it('keeps request correlation independent of browser authority fields', () => {
    expect(Request.safeParse({ ...request, viewer }).success).toBe(false);
    expect(Request.safeParse({ ...request, agentIdentity }).success).toBe(false);
  });
});
