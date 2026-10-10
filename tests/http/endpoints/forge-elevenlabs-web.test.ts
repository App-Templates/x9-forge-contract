import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  ForgeElevenLabsWebParamsSchema as Params,
  forgeElevenLabsWebMetadataContract as Metadata, forgeElevenLabsWebSessionContract as Session,
  forgeElevenLabsWebMetadataPath, forgeElevenLabsWebSessionPath, isElevenLabsWebBrowserRequestForLink as matches,
} from '../../../src/http/endpoints/forge-elevenlabs-web.js';
import {
  ElevenLabsWebBrowserRequestSchema as Request, ElevenLabsWebBrowserSessionSchema as BrowserSession,
  ElevenLabsWebBrowserMetadataSchema as BrowserMetadata, ElevenLabsWebBrowserErrorResponseSchema as BrowserError,
} from '../../../src/capability/agent-elevenlabs/web-browser.js';
const request = { requestId: 'browser-request', linkId: 'browser-link' };

describe('Forge canonical ElevenLabs browser facade', () => {
  it('describes only the canonical metadata and session paths with server policy and no caching', () => {
    expect(Metadata).toMatchObject({ method: 'GET', path: '/api/parla/:linkId', authentication: 'optional-forge-session', authorization: 'server-web-policy', cacheControl: 'no-store' });
    expect(Session).toMatchObject({ method: 'POST', path: '/api/parla/:linkId/session', authentication: 'optional-forge-session', authorization: 'server-web-policy', cacheControl: 'no-store' });
    expect(Metadata).not.toHaveProperty('bodySchema');
    expect(Metadata).not.toHaveProperty('authType');
    expect(Session).not.toHaveProperty('authType');
  });
  it('reuses existing canonical browser schemas and the shared strict params', () => {
    expect(Metadata.paramsSchema).toBe(Params); expect(Session.paramsSchema).toBe(Params);
    expect(Metadata.responseSchema).toBe(BrowserMetadata); expect(Session.responseSchema).toBe(BrowserSession);
    expect(Session.bodySchema).toBe(Request); expect(Metadata.errorResponseSchema).toBe(BrowserError); expect(Session.errorResponseSchema).toBe(BrowserError);
    expect(Params.shape.linkId).toBe(Request.shape.linkId);
    expect(Params.safeParse({ linkId: request.linkId, viewer: {} }).success).toBe(false);
  });
  it('builds encoded paths from the exact canonical link identifier', () => {
    const linkId = 'browser:link.0001';
    expect(forgeElevenLabsWebMetadataPath(linkId)).toBe('/api/parla/browser%3Alink.0001');
    expect(forgeElevenLabsWebSessionPath(linkId)).toBe('/api/parla/browser%3Alink.0001/session');
    expect(forgeElevenLabsWebMetadataPath(request.linkId)).toBe('/api/parla/browser-link');
  });
  it.each(['', 'short', '../another-link', 'browser/link', 'browser%2Flink', 'browser?link', 'browser#link', 'x'.repeat(129), null, {}])('refuses invalid link paths (%j)', linkId => {
    expect(() => forgeElevenLabsWebMetadataPath(linkId as string)).toThrow();
    expect(() => forgeElevenLabsWebSessionPath(linkId as string)).toThrow();
  });
  it('correlates the exact parsed body link with the path link without deriving authorization', () => {
    expect(matches(request, request.linkId)).toBe(true);
    expect(matches({ ...request, linkId: 'different-link' }, request.linkId)).toBe(false);
    expect(matches(request, 'different-link')).toBe(false);
    expect(matches(request, undefined)).toBe(false);
    expect(matches(null, request.linkId)).toBe(false);
    expect(matches({ ...request, requestId: 'short' }, request.linkId)).toBe(false);
    expect(matches({ ...request, linkId: '../browser-link' }, '../browser-link')).toBe(false);
  });
  it.each(['viewer', 'scope', 'agentIdentity', 'mapping', 'signedUrl', 'credentials', 'invitation'])('accepts no browser authority or transport field %s', key => {
    const raw = { ...request, [key]: {} };
    expect(Session.bodySchema.safeParse(raw).success).toBe(false);
    expect(matches(raw, request.linkId)).toBe(false);
  });
  it('keeps the existing public lease strict and transport-only', () => {
    const at = Date.parse('2026-10-10T12:00:00.000Z');
    const lease = { ok: true, ...request, issuedAt: new Date(at).toISOString(), expiresAt: new Date(at + 60_000).toISOString(),
      signedUrl: `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=synthetic-agent&conversation_signature=${randomUUID()}` };
    expect(Session.responseSchema.safeParse(lease).success).toBe(true);
    for (const key of ['viewer', 'scope', 'mapping', 'apiKey', 'bearer', 'credentials']) {
      expect(Session.responseSchema.safeParse({ ...lease, [key]: {} }).success).toBe(false);
    }
    expect(Session.responseSchema.safeParse({ ...lease, signedUrl: 'wss://foreign.example/socket' }).success).toBe(false);
    expect(Session.responseSchema.safeParse({ ...lease, expiresAt: lease.issuedAt }).success).toBe(false);
  });
});


import {
  ForgeElevenLabsWebSnapshotSchema as AdminSnapshot, ForgeElevenLabsWebDraftSchema as Draft,
  ForgeElevenLabsWebPreviewSchema as Preview, ForgeElevenLabsWebApplyResultSchema as Applied,
  projectForgeElevenLabsWebSnapshot as project, isForgeElevenLabsWebSnapshotCurrent as current,
  isForgeElevenLabsWebDraftForSnapshot as draftCurrent, isForgeElevenLabsWebPreviewForDraft as previewCurrent,
  isForgeElevenLabsWebApplyResultForDraft as applyCurrent,
  forgeElevenLabsWebSnapshotContract as ReadAdmin, forgeElevenLabsWebPreviewContract as PreviewAdmin,
  forgeElevenLabsWebApplyContract as ApplyAdmin, forgeElevenLabsWebCatalogContract as CatalogAdmin,
  forgeElevenLabsWebSnapshotPath, forgeElevenLabsWebPreviewPath, forgeElevenLabsWebApplyPath, forgeElevenLabsWebCatalogPath,
} from '../../../src/http/endpoints/forge-elevenlabs-web.js';
import { AgentChannelAccessBindingSchema } from '../../../src/agent/agent-channel-access.js';
import { ElevenLabsWebAdmissionSnapshotSchema } from '../../../src/capability/agent-elevenlabs/web-session.js';
import { ElevenLabsWebCatalogSchema } from '../../../src/capability/agent-elevenlabs/web-catalog.js';
const time = Date.parse('2026-10-10T12:00:00.000Z');
const iso = (delta = 0) => new Date(time + delta).toISOString();
const binding = AgentChannelAccessBindingSchema.parse({ scope: { tenantId: 'tenant-one', ownerId: 'owner-one', agentId: 'runtime-agent' },
  identity: { managementAgentId: 'management-agent', runtimeAgentId: 'runtime-agent', vaultAgentId: 71 } });
const access = { role: 'owner', ownerId: 'owner-one', tenantId: 'tenant-one' };
const origin = 'https://forge.example';
function admission() {
  return ElevenLabsWebAdmissionSnapshotSchema.parse({
    policy: { scope: binding.scope, version: 2, access: 'owner', paused: false, enabled: true },
    link: { scope: binding.scope, linkId: 'stable-web-link', url: origin + '/parla/stable-web-link', createdAt: iso(-1000) },
    provider: { scope: binding.scope, mapping: { scope: binding.scope, providerAgentId: 'private-provider', origin: 'provisioned', createdAt: iso(-1000), appliedConfigVersion: 1 },
      desiredState: 'active', observedAt: iso(), channel: { channelId: 'private-channel', kind: 'web', state: 'loaded', loaded: true, readiness: 'ready' } },
    lifecycle: 'active', invitation: null, invitationRevision: null,
  });
}
function snapshot() { const a = admission(); return { binding, policy: a.policy, link: a.link, lifecycle: a.lifecycle, availability: 'ready', observedAt: iso() }; }
function input() { return { binding, trustedAccess: access, requestedAgentId: 'management-agent', admission: admission(), configuredOrigin: origin, observedAt: iso(), now: time }; }
const draft = { requestId: 'policy-change-one', expectedVersion: 2, access: 'public', paused: false, enabled: true };
function applied() {
  const before = snapshot(), policy = { ...before.policy, version: 3, access: 'public' };
  return { result: { ok: true, requestId: draft.requestId, replayed: false, policy }, snapshot: { ...before, policy } };
}
const validate = (raw: unknown, b: unknown = binding, a: unknown = access, id: unknown = 'management-agent', o: unknown = origin, n = time) => current(raw, b, a, id, o, n);
const checkPreview = (raw: unknown) => previewCurrent(draft, raw, binding, access, 'management-agent', origin, time);
const checkApply = (raw: unknown, before: unknown = snapshot()) => applyCurrent(draft, raw, before, binding, access, 'management-agent', origin, time);

describe('Forge administrative Web policy facade', () => {
  it('projects safe canonical evidence for separately bound management and runtime aliases', () => {
    const result = project(input());
    expect(result).toEqual(snapshot());
    expect(AdminSnapshot.safeParse(result).success).toBe(true);
    expect(validate(result)).toBe(true);
    expect(validate(result, binding, { role: 'sa' })).toBe(true);
    expect(Object.keys(result as object).sort()).toEqual(['availability', 'binding', 'lifecycle', 'link', 'observedAt', 'policy']);
  });
  it.each(['provider', 'mapping', 'providerAgentId', 'signedUrl', 'invitation', 'privateError'])('rejects leaked private field %s', key => {
    expect(AdminSnapshot.safeParse({ ...snapshot(), [key]: 'private' }).success).toBe(false);
  });
  it.each(['ownerId', 'tenantId', 'agentId'])('denies internal evidence from another %s', key => {
    const i = input(); const other = { ...binding.scope, [key]: 'other-value' };
    i.admission.policy.scope = other; i.admission.link.scope = other; i.admission.provider.scope = other;
    if (i.admission.provider.mapping) i.admission.provider.mapping.scope = other;
    expect(project(i)).toBeUndefined();
  });
  it('denies wrong requested alias, session membership and every full binding component', () => {
    expect(project({ ...input(), requestedAgentId: 'runtime-agent' })).toBeUndefined();
    expect(project({ ...input(), trustedAccess: { ...access, ownerId: 'other-owner' } })).toBeUndefined();
    expect(project({ ...input(), trustedAccess: { ...access, tenantId: 'other-tenant' } })).toBeUndefined();
    expect(project({ ...input(), trustedAccess: { role: 'anonymous' } })).toBeUndefined();
    expect(validate(snapshot(), binding, access, 'runtime-agent')).toBe(false);
    for (const key of ['managementAgentId', 'vaultAgentId']) {
      const other = { ...binding, identity: { ...binding.identity, [key]: key === 'vaultAgentId' ? 72 : 'other-agent' } };
      expect(validate(snapshot(), other)).toBe(false);
    }
    expect(validate(snapshot(), { ...binding, scope: { ...binding.scope, ownerId: 'other-owner' } })).toBe(false);
    expect(validate(snapshot(), binding, { ...access, ownerId: 'other-owner' })).toBe(false);
  });
  it.each(['archived', 'removed', 'unavailable'] as const)('keeps %s unavailable even when paused or off', lifecycle => {
    for (const policy of [{ enabled: false, paused: false }, { enabled: true, paused: true }]) {
      const i = input(); i.admission.lifecycle = lifecycle; Object.assign(i.admission.policy, policy);
      expect(project(i)).toMatchObject({ lifecycle, availability: 'unavailable' });
    }
    expect(AdminSnapshot.safeParse({ ...snapshot(), lifecycle }).success).toBe(false);
  });
  it('distinguishes off, pause and provider unavailability without inferring readiness', () => {
    const i = input(); i.admission.policy.enabled = false;
    expect(project(i)).toMatchObject({ availability: 'off' });
    i.admission.policy.enabled = true; i.admission.policy.paused = true;
    expect(project(i)).toMatchObject({ availability: 'paused' });
    i.admission.policy.paused = false; i.admission.provider.channel.readiness = 'unknown';
    expect(project(i)).toMatchObject({ availability: 'unavailable' });

  });
  it('never refreshes expired or future provider observations with a new projection time', () => {
    for (const delta of [-60000, -60001, 1]) {
      const i = input(); i.admission.provider.observedAt = iso(delta);
      expect(project(i)).toMatchObject({ availability: 'unavailable' });
    }
    for (const delta of [-60000, 1]) {
      expect(project({ ...input(), observedAt: iso(delta) })).toBeUndefined();
      expect(validate({ ...snapshot(), observedAt: iso(delta) })).toBe(false);
    }
    expect(validate(snapshot(), binding, access, 'management-agent', origin, NaN)).toBe(false);
  });
  it.each(['http://forge.example', 'https://other.example', origin + '/path'])('denies wrong or non-HTTPS configured origin %s', bad => {
    expect(project({ ...input(), configuredOrigin: bad })).toBeUndefined();
    expect(validate(snapshot(), binding, access, 'management-agent', bad)).toBe(false);
  });
  it('returns a closed validation result for malformed links instead of throwing', () => {
    const invalid = { ...snapshot(), link: { ...snapshot().link, url: 'not-a-url' } };
    expect(() => AdminSnapshot.safeParse(invalid)).not.toThrow();
    expect(AdminSnapshot.safeParse(invalid).success).toBe(false);
    expect(validate(invalid)).toBe(false);
    expect(project({ ...input(), admission: null })).toBeUndefined();
  });
  it('denies a tampered link and a link created in the future', () => {
    const i = input(); i.admission.link.url += '?private=1';
    expect(project(i)).toBeUndefined(); expect(validate({ ...snapshot(), link: i.admission.link })).toBe(false);
    i.admission.link.url = origin + '/parla/stable-web-link'; i.admission.link.createdAt = iso(1);
    expect(project(i)).toBeUndefined(); expect(validate({ ...snapshot(), link: i.admission.link })).toBe(false);
  });
  it('accepts only a scope-free strict canonical policy draft and exact current revision', () => {
    expect(Draft.safeParse(draft).success).toBe(true); expect(draftCurrent(draft, snapshot())).toBe(true);
    for (const field of ['scope', 'viewer', 'binding', 'link', 'mapping', 'signedUrl']) expect(Draft.safeParse({ ...draft, [field]: {} }).success).toBe(false);
    expect(draftCurrent({ ...draft, expectedVersion: 1 }, snapshot())).toBe(false);
    expect(draftCurrent(draft, { ...snapshot(), lifecycle: 'archived', availability: 'unavailable' })).toBe(false);
  });
  it('validates exact echoed preview with session authority and fresh snapshot', () => {
    const preview = { requestId: draft.requestId, draft, snapshot: snapshot() };
    expect(Preview.safeParse(preview).success).toBe(true); expect(checkPreview(preview)).toBe(true);
    expect(checkPreview({ ...preview, draft: { ...draft, access: 'owner' } })).toBe(false);
    expect(checkPreview({ ...preview, requestId: 'other-request' })).toBe(false);
    expect(checkPreview({ ...preview, snapshot: { ...snapshot(), observedAt: iso(-60000) } })).toBe(false);
    expect(checkPreview({ ...preview, snapshot: { ...snapshot(), binding: { ...binding, identity: { ...binding.identity, vaultAgentId: 72 } } } })).toBe(false);
  });
  it('correlates canonical policy result, exact next revision and stable link with safe readback', () => {
    const result = applied(); expect(Applied.safeParse(result).success).toBe(true); expect(checkApply(result)).toBe(true);
    expect(checkApply({ ...result, result: { ...result.result, replayed: true } })).toBe(true);
    for (const patch of [{ requestId: 'other-request' }, { policy: { ...result.result.policy, version: 4 } }, { policy: { ...result.result.policy, access: 'owner' } }, { policy: { ...result.result.policy, enabled: false } }]) {
      expect(checkApply({ ...result, result: { ...result.result, ...patch } })).toBe(false);
    }
    const link = { ...result.snapshot.link, linkId: 'replacement-link', url: origin + '/parla/replacement-link' };
    expect(checkApply({ ...result, snapshot: { ...result.snapshot, link } })).toBe(false);
    expect(checkApply({ ...result, snapshot: { ...result.snapshot, policy: { ...result.snapshot.policy, version: 4 } } })).toBe(false);
    expect(checkApply({ ...result, snapshot: { ...result.snapshot, observedAt: iso(-60000) } })).toBe(false);
    expect(checkApply(result, { ...snapshot(), observedAt: iso(-60000) })).toBe(false);
  });
  it('describes authenticated admin access, preview, apply and read-only catalog paths', () => {
    for (const [contract, suffix, method] of [[ReadAdmin, '', 'GET'], [PreviewAdmin, '/preview', 'POST'], [ApplyAdmin, '/apply', 'POST'], [CatalogAdmin, '/catalog', 'GET']] as const) {
      expect(contract).toMatchObject({ method, path: '/api/agents/:agentId/channels/web/access' + suffix, authentication: 'forge-session', authorization: 'sa-or-agent-owner', cacheControl: 'no-store' });
    }
    expect(ReadAdmin.responseSchema).toBe(AdminSnapshot); expect(PreviewAdmin.bodySchema).toBe(Draft);
    expect(ApplyAdmin.responseSchema).toBe(Applied); expect(CatalogAdmin).toHaveProperty('responseSchema', ElevenLabsWebCatalogSchema);
    expect(CatalogAdmin).not.toHaveProperty('bodySchema');
    expect(forgeElevenLabsWebSnapshotPath('management-alias')).toBe('/api/agents/management-alias/channels/web/access');
    expect(forgeElevenLabsWebPreviewPath('management-alias')).toBe('/api/agents/management-alias/channels/web/access/preview');
    expect(forgeElevenLabsWebApplyPath('management-alias')).toBe('/api/agents/management-alias/channels/web/access/apply');
    expect(forgeElevenLabsWebCatalogPath('management-alias')).toBe('/api/agents/management-alias/channels/web/access/catalog');
    expect(() => forgeElevenLabsWebSnapshotPath('')).toThrow();
  });
});
