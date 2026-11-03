import { describe, expect, it } from 'vitest';
import { forgeAgentPhoneSnapshotContract as get, forgeAgentPhonePreviewContract as show, forgeAgentPhoneApplyContract as apply, forgeAgentPhonePath as path, forgeAgentPhonePreviewPath as showPath, forgeAgentPhoneApplyPath as applyPath, ForgeAgentPhoneDraftSchema as Draft, ForgeAgentPhonePreviewSchema as Preview, isAgentPhoneWithinForgeAuthorization as authorized, isForgeAgentPhoneDraftForSnapshot as matches, isForgeAgentPhonePreviewForDraft as forDraft } from '../../../src/http/endpoints/forge-agent-phone-channel.js';
const instant = '2026-10-08T10:00:00Z';
const now = Date.parse(instant);
const scope = { agentId: 'runtime-alpha', ownerId: 'owner-alpha', tenantId: 'tenant-alpha' };
const identity = { runtimeAgentId: scope.agentId, managementAgentId: 'management-alpha', vaultAgentId: 11 };
const binding = { scope, identity };
const number = { status: 'available', number: '+390212345678', resourceId: 'shared-line', version: 2, observedAt: instant };
const policy = { kind: 'phone', inbound: 'address-book', outboundEnabled: false };
function config() { return { ...structuredClone(binding), kind: 'phone', desired: { version: 2, state: 'active' }, applied: { version: 2, state: 'active' },
  access: { desiredPolicy: structuredClone(policy), appliedPolicy: structuredClone(policy) }, sharedNumber: { ...number },
  routing: { ...structuredClone(binding), number: number.number, resourceId: number.resourceId, routingIdentity: 'route-alpha' },
  attestation: { ...structuredClone(binding), applied: { version: 2, state: 'active' },
    channel: { channelId: 'phone-alpha', kind: 'voice', state: 'loaded', loaded: true, readiness: 'ready' }, observedAt: instant, error: null }, error: null }; }
function snapshot() { return { configuration: config(), observedAt: instant, agentArchived: false, runtimeLoadState: 'loaded' }; }
function edit<T>(input: T, changes: Record<string, unknown>): T {
  const copy = structuredClone(input);
  for (const [path, value] of Object.entries(changes)) {
    const keys = path.split('.'); let parent = copy as Record<string, unknown>;
    for (const key of keys.slice(0, -1)) parent = parent[key] as Record<string, unknown>;
    parent[keys.at(-1)!] = value;
  }
  return copy;
}
function draft() { return { requestId: 'phone-draft-001', expectedDesiredVersion: 2, expectedAppliedVersion: 2,
  desiredState: 'paused', policy: structuredClone(policy), expectedNumberVersion: 2, expectedRoutingIdentity: 'route-alpha' }; }
function preview() { return { requestId: draft().requestId, draft: draft(), snapshot: snapshot() }; }
const owner = { role: 'owner', ownerId: scope.ownerId, tenantId: scope.tenantId };
const agent = identity.managementAgentId;
describe('phone Forge HTTP authority and draft correlation', () => {
  it.each([get, show, apply])('uses session and owner guards: $path', contract => {
    expect(contract.authentication).toBe('forge-session'); expect(contract.authorization).toBe('sa-or-agent-owner');
    expect('authType' in contract).toBe(false);
  });
  it('uses only the requested agent and static phone segment', () => {
    expect(get.method).toBe('GET'); expect(show.method).toBe('POST'); expect(apply.method).toBe('POST');
    expect(path(agent)).toBe(`/api/agents/${agent}/channels/phone/access`);
    expect(showPath(agent)).toBe(`/api/agents/${agent}/channels/phone/access/preview`);
    expect(applyPath(agent)).toBe(`/api/agents/${agent}/channels/phone/access/apply`);
    expect(() => path('../other')).toThrow(); expect(() => showPath('other%2froute')).toThrow(); expect(() => applyPath('other?owner=me')).toThrow();
  });
  it('accepts server SA or the exact owner and tenant for the management route', () => {
    expect(authorized(snapshot(), owner, agent)).toBe(true); expect(authorized(snapshot(), { role: 'sa' }, agent)).toBe(true);
  });
  it.each([
    undefined, { role: 'anonymous' }, { ...owner, ownerId: 'owner-other' }, { ...owner, tenantId: 'tenant-other' },
    { ...owner, role: 'owner', providerCredential: 'synthetic' },
  ])('rejects missing, foreign or client-shaped authority %#', access => {
    expect(authorized(snapshot(), access, agent)).toBe(false); expect(forDraft(draft(), preview(), access, agent, now)).toBe(false);
  });
  it('does not confuse runtime and management or accept another agent of the same owner', () => {
    expect(authorized(snapshot(), owner, scope.agentId)).toBe(false);
    expect(authorized(snapshot(), { role: 'sa' }, 'management-beta')).toBe(false);
    expect(forDraft(draft(), preview(), owner, 'management-beta', now)).toBe(false);
  });
  it('parses a phone-only intent and an actual roundtrip preview', () => {
    expect(Draft.safeParse(draft()).success).toBe(true); expect(matches(draft(), snapshot())).toBe(true);
    expect(show.bodySchema.parse(JSON.parse(JSON.stringify(draft())))).toEqual(draft());
    expect(apply.bodySchema.parse(draft())).toEqual(draft());
    expect(Preview.parse(JSON.parse(JSON.stringify(preview())))).toEqual(preview());
    expect(forDraft(draft(), preview(), owner, agent, now)).toBe(true);
    expect(forDraft(draft(), preview(), { role: 'sa' }, agent, now)).toBe(true);
  });
  it.each([
    { ownerId: 'other' }, { scope }, { role: 'sa' }, { providerUrl: 'https://invalid.example' },
    { voiceId: 'synthetic' }, { toNumber: '+390212345679' }, { requestChanges: null }, { contacts: [] },
  ])('cannot submit authority, voice, target or a copied contacts list %#', fields => expect(Draft.safeParse({ ...draft(), ...fields }).success).toBe(false));
  it('requires phone policy and explicit outbound permission', () => {
    expect(Draft.safeParse(edit(draft(), { 'policy.kind': 'email' })).success).toBe(false);
    const missing = draft(); Reflect.deleteProperty(missing.policy, 'outboundEnabled'); expect(Draft.safeParse(missing).success).toBe(false);
    expect(Draft.safeParse(edit(draft(), { expectedAppliedVersion: 3 })).success).toBe(false);
  });
  it.each([
    { expectedDesiredVersion: 3 }, { expectedAppliedVersion: 1 }, { expectedNumberVersion: 1 }, { expectedRoutingIdentity: 'other' },
  ])('rejects stale CAS %#', changes => {
    expect(matches(edit(draft(), changes), snapshot())).toBe(false);
    expect(Preview.safeParse(edit(preview(), Object.fromEntries(Object.entries(changes).map(([key, value]) => [`draft.${key}`, value])))).success).toBe(false);
  });
  it('does not preview an archived agent', () => {
    expect(matches(draft(), edit(snapshot(), { agentArchived: true }))).toBe(false);
    expect(Preview.safeParse(edit(preview(), { 'snapshot.agentArchived': true })).success).toBe(false);
  });
  it('requires request id echo and rejects extra preview metadata', () => {
    expect(Preview.safeParse(edit(preview(), { requestId: 'phone-draft-002' })).success).toBe(false);
    expect(Preview.safeParse({ ...preview(), providerDetail: 'synthetic' }).success).toBe(false);
  });
  it.each([
    { desiredState: 'active' }, { 'policy.inbound': 'anyone' }, { 'policy.outboundEnabled': true }, { requestId: 'phone-draft-002' },
  ])('cannot correlate a different unsaved intent %#', changes => expect(forDraft(edit(draft(), changes), preview(), owner, agent, now)).toBe(false));
  it.each([now + 60001, now - 1, NaN, Infinity])('rejects noncurrent preview at %s', clock => {
    expect(forDraft(draft(), preview(), owner, agent, clock)).toBe(false);
  });
  it('handles malformed boundaries and keeps shared canonical error responses', () => {
    expect(authorized({}, owner, agent)).toBe(false); expect(matches({}, snapshot())).toBe(false); expect(matches(draft(), {})).toBe(false);
    expect(forDraft({}, preview(), owner, agent, now)).toBe(false); expect(forDraft(draft(), {}, owner, agent, now)).toBe(false);
    expect(get.errorResponseSchema.safeParse({ ok: false, error: 'raw provider detail' }).success).toBe(false);
  });
});
