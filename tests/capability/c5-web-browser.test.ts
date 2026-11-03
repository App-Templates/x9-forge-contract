import { describe, expect, it } from 'vitest';
import { ElevenLabsWebBrowserRequestSchema as Request, ElevenLabsWebBrowserSessionSchema as Session,
  projectElevenLabsWebBrowserSession as project } from '../../src/capability/agent-elevenlabs/web-browser.js';
import { ElevenLabsWebSessionResultSchema, isElevenLabsWebSignedConnectionUrl } from '../../src/capability/agent-elevenlabs/web-session.js';
import { ElevenLabsWebAuthorityResponseSchema } from '../../src/capability/agent-elevenlabs/web-context.js';
const scope = { tenantId: 'browser-tenant', ownerId: 'browser-owner', agentId: 'browser-runtime' };
const agentIdentity = { ...scope, role: 'master', identity: { managementAgentId: 'browser-management', runtimeAgentId: scope.agentId, vaultAgentId: 101 } };
const browserRequest = { requestId: 'browser-request', linkId: 'browser-link' };
const viewer = { kind: 'authenticated', userId: 'browser-user', owner: { tenantId: scope.tenantId, ownerId: scope.ownerId } };
const configuredOrigin = 'https://forge.example.test', at = '2026-10-08T12:00:00.000Z', now = new Date(at);
const link = { scope, linkId: browserRequest.linkId, url: configuredOrigin + '/parla/' + browserRequest.linkId, createdAt: at };
const mapping = { scope, providerAgentId: 'synthetic-browser-agent', origin: 'adopted', createdAt: at, appliedConfigVersion: 3 };
const snapshot = { policy: { scope, version: 3, access: 'owner', paused: false, enabled: true }, link,
  provider: { scope, mapping, desiredState: 'active', observedAt: at, channel: { channelId: 'browser-channel', kind: 'web', state: 'loaded', loaded: true, readiness: 'ready' } },
  lifecycle: 'active', invitation: null, invitationRevision: null };
const internalRequest = { ...browserRequest, scope, viewer };
const internalResult = { ok: true, requestId: browserRequest.requestId, scope, link, policyVersion: 3, mapping, viewer, invitation: null, invitationRevision: null,
  issuedAt: at, expiresAt: new Date(now.getTime() + 15 * 60_000).toISOString(),
  signedUrl: 'wss://api.elevenlabs.io/v1/convai/conversation?agent_id=synthetic-browser-agent&conversation_signature=synthetic-only' };
const authorityRequest = { ...browserRequest, scope, phase: 'after' };
const authorityResponse = { ok: true, request: authorityRequest, snapshot: { ...authorityRequest, viewer, lifecycle: 'active', configuredOrigin, authorityVersion: 3,
  observedAt: at, expiresAt: new Date(now.getTime() + 60_000).toISOString(), agentIdentity } };
const evidence = { browserRequest, internalRequest, internalResult, snapshot, viewer, configuredOrigin, authorityResponse, authorityVersion: 3, agentIdentity, now };
const expected = { ok: true, ...browserRequest, issuedAt: internalResult.issuedAt, expiresAt: internalResult.expiresAt, signedUrl: internalResult.signedUrl };
describe('C5 browser lease projection', () => {
  it('reuses valid canonical private evidence and returns exactly the public lease', () => {
    expect(ElevenLabsWebSessionResultSchema.safeParse(internalResult).success).toBe(true); expect(ElevenLabsWebAuthorityResponseSchema.safeParse(authorityResponse).success).toBe(true);
    expect(project(evidence)).toEqual(expected); expect(Session.parse(expected)).toEqual(expected);
  });
  it.each(['viewer','scope','agentIdentity','mapping','invitation','credentials','signedUrl'])('accepts no browser authority field %s', key => {
    expect(Request.safeParse({ ...browserRequest, [key]: {} }).success).toBe(false);
    expect(project({ ...evidence, browserRequest: { ...browserRequest, [key]: {} } })).toBe(null);
  });
  it.each(['requestId','linkId'])('correlates the exact browser %s', key => {
    expect(project({ ...evidence, browserRequest: { ...browserRequest, [key]: 'foreign-browser' } })).toBe(null);
  });
  it('rechecks paused, off, archived, policy and provider mapping after mint', () => {
    expect(project({ ...evidence, snapshot: { ...snapshot, policy: { ...snapshot.policy, paused: true } } })).toBe(null);
    expect(project({ ...evidence, snapshot: { ...snapshot, policy: { ...snapshot.policy, enabled: false } } })).toBe(null);
    expect(project({ ...evidence, snapshot: { ...snapshot, lifecycle: 'archived' } })).toBe(null);
    expect(project({ ...evidence, snapshot: { ...snapshot, policy: { ...snapshot.policy, version: 4 } } })).toBe(null);
    expect(project({ ...evidence, snapshot: { ...snapshot, provider: { ...snapshot.provider, mapping: { ...mapping, providerAgentId: 'different-browser' } } } })).toBe(null);
  });
  it('requires canonical D authority current after await, never an unresolved or before snapshot', () => {
    const before = { ...authorityRequest, phase: 'before' };
    expect(project({ ...evidence, authorityResponse: { ...authorityResponse, request: before, snapshot: { ...authorityResponse.snapshot, phase: 'before' } } })).toBe(null);
    expect(project({ ...evidence, authorityResponse: { ok: false, request: authorityRequest, error: 'identity_unavailable', snapshot: { ...authorityResponse.snapshot, agentIdentity: null } } })).toBe(null);
    expect(project({ ...evidence, agentIdentity: { ...agentIdentity, identity: { ...agentIdentity.identity, vaultAgentId: 102 } } })).toBe(null);
    expect(project({ ...evidence, authorityVersion: 4 })).toBe(null);
    expect(project({ ...evidence, now: new Date(now.getTime() + 60_000) })).toBe(null);
  });
  it('never forwards a lease to a substituted viewer or origin', () => {
    expect(project({ ...evidence, viewer: { ...viewer, userId: 'foreign-browser' } })).toBe(null);
    expect(project({ ...evidence, configuredOrigin: 'https://different.example.test' })).toBe(null);
  });
  it('supports explicit public and current authenticated invitation through existing admission', () => {
    const anonymous = { kind: 'anonymous' };
    const pub = { ...evidence, viewer: anonymous, snapshot: { ...snapshot, policy: { ...snapshot.policy, access: 'public' } }, internalRequest: { ...internalRequest, viewer: anonymous }, internalResult: { ...internalResult, viewer: anonymous }, authorityResponse: { ...authorityResponse, snapshot: { ...authorityResponse.snapshot, viewer: anonymous } } };
    expect(project(pub)).toEqual(expected);
    const invitation = { invitationId: 'browser-invitation', scope, revision: 4, recipientUserId: 'browser-invited', createdAt: at, expiresAt: new Date(now.getTime() + 3_600_000).toISOString(), revokedAt: null };
    const recipient = { kind: 'authenticated', userId: invitation.recipientUserId, owner: null };
    const invited = { ...evidence, viewer: recipient, snapshot: { ...snapshot, policy: { ...snapshot.policy, access: 'invited' }, invitation, invitationRevision: 4 }, internalRequest: { ...internalRequest, viewer: recipient }, internalResult: { ...internalResult, viewer: recipient, invitation, invitationRevision: 4 }, authorityResponse: { ...authorityResponse, snapshot: { ...authorityResponse.snapshot, viewer: recipient } } };
    expect(project(invited)).toEqual(expected);
    expect(project({ ...invited, snapshot: { ...invited.snapshot, invitation: { ...invitation, revokedAt: at } } })).toBe(null);
    expect(project({ ...pub, snapshot: { ...snapshot, policy: { ...snapshot.policy, access: 'owner' } } })).toBe(null);
  });
  it.each(['scope','mapping','viewer','invitation','agentIdentity','policyVersion','credentials'])('does not accept private %s in the browser response', key => {
    expect(Session.safeParse({ ...expected, [key]: {} }).success).toBe(false);
    expect(project(evidence)).not.toBeNull();
    expect(project(evidence)).not.toHaveProperty(key);
  });
  it.each(['https://api.elevenlabs.io/v1/convai/conversation?agent_id=synthetic-browser-agent&conversation_signature=synthetic-only',
    'wss://different.example.test/v1/convai/conversation?agent_id=synthetic-browser-agent&conversation_signature=synthetic-only',
    'wss://api.elevenlabs.io/other?agent_id=synthetic-browser-agent&conversation_signature=synthetic-only',
    'wss://api.elevenlabs.io/v1/convai/conversation?agent_id=synthetic-browser-agent',
    'wss://api.elevenlabs.io/v1/convai/conversation?agent_id=synthetic-browser-agent&conversation_signature=',
    'wss://api.elevenlabs.io/v1/convai/conversation?agent_id=synthetic-browser-agent&agent_id=other&conversation_signature=synthetic-only',
    'wss://api.elevenlabs.io/v1/convai/conversation?agent_id=synthetic-browser-agent&conversation_signature=synthetic-only&conversation_signature=other',
    'wss://user:pass@api.elevenlabs.io/v1/convai/conversation?agent_id=synthetic-browser-agent&conversation_signature=synthetic-only',
    'wss://user@api.elevenlabs.io/v1/convai/conversation?agent_id=synthetic-browser-agent&conversation_signature=synthetic-only',
    'wss://:pass@api.elevenlabs.io/v1/convai/conversation?agent_id=synthetic-browser-agent&conversation_signature=synthetic-only',
    internalResult.signedUrl + '#fragment'])('rejects an invalid synthetic connection artifact', signedUrl => {
    expect(Session.safeParse({ ...expected, signedUrl }).success).toBe(false);
    expect(project({ ...evidence, internalResult: { ...internalResult, signedUrl } })).toBe(null);
  });
  it.each([0,-1,900_001])('bounds browser connection window %d', delta => {
    expect(Session.safeParse({ ...expected, expiresAt: new Date(now.getTime() + delta).toISOString() }).success).toBe(false);
  });
  it('reuses C3 URL validation without treating its format as a mapped resource or permission', () => {
    expect(isElevenLabsWebSignedConnectionUrl(internalResult.signedUrl, mapping.providerAgentId)).toBe(true);
    expect(isElevenLabsWebSignedConnectionUrl(internalResult.signedUrl, 'different-browser-agent')).toBe(false);
    for (const id of [null, '', {}, 'invalid?agent']) expect(isElevenLabsWebSignedConnectionUrl(internalResult.signedUrl, id)).toBe(false);
    for (const value of [null, {}, 'invalid', 'x'.repeat(4097)]) expect(isElevenLabsWebSignedConnectionUrl(value, mapping.providerAgentId)).toBe(false);
  });
  it.each([null,{}, { ...internalResult, mapping: null }])('closes malformed internal evidence %j', internalResult => expect(project({ ...evidence, internalResult })).toBe(null));
});
