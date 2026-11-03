import { describe, expect, it } from 'vitest';
import { internalAgentPhoneSnapshotContract as get, internalAgentPhoneApplyContract as apply, internalAgentPhoneRouteContract as route, internalAgentPhonePath as path, internalAgentPhoneApplyPath as applyPath } from '../../../src/http/endpoints/internal-agent-phone-channel.js';
const instant = '2026-10-08T10:00:00Z';
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
function command() { return { action: 'apply-channel', requestId: 'phone-command-001', desiredVersion: 2, expectedAppliedVersion: 2,
  requestChanges: null, expectedNumberVersion: 2, expectedRoutingIdentity: 'route-alpha' }; }
function receipt() { return { ...structuredClone(binding), ...command(), kind: 'phone', replayed: false, outcome: 'applied',
  completedAt: instant, snapshot: snapshot(), error: null }; }
function event() { return { callId: 'call-alpha', toNumber: number.number, fromNumber: '+390212345679', routingIdentity: 'route-alpha', receivedAt: instant }; }
function edit<T>(input: T, changes: Record<string, unknown>): T {
  const copy = structuredClone(input);
  for (const [path, value] of Object.entries(changes)) {
    const keys = path.split('.'); let parent = copy as Record<string, unknown>;
    for (const key of keys.slice(0, -1)) parent = parent[key] as Record<string, unknown>;
    parent[keys.at(-1)!] = value;
  }
  return copy;
}
describe('phone internal HTTP contracts', () => {
  it.each([get, apply, route])('requires the existing internal secret boundary: $path', contract => expect(contract.authType).toBe('secret'));
  it('uses static phone paths while retaining agent scope for reads and apply', () => {
    expect(get.method).toBe('GET'); expect(apply.method).toBe('POST'); expect(route.method).toBe('POST');
    expect(path('management-alpha')).toBe('/internal/agents/management-alpha/channels/phone/access');
    expect(applyPath('management-alpha')).toBe('/internal/agents/management-alpha/channels/phone/access/apply');
    expect(route.path).toBe('/internal/channels/phone/route');
  });
  it.each(['../agent', 'agent%2fother', 'agent?owner=other', 'agent#other', 'agent\nother', ''])('rejects path input %s', agentId => {
    expect(() => path(agentId)).toThrow(); expect(() => applyPath(agentId)).toThrow();
  });
  it('cannot supply door kind or owner in params', () => {
    expect(get.paramsSchema.safeParse({ agentId: 'management-alpha', kind: 'email' }).success).toBe(false);
    expect(apply.paramsSchema.safeParse({ agentId: 'management-alpha', ownerId: 'other' }).success).toBe(false);
  });
  it('parses actual command and event wire payloads without accepting client authority', () => {
    expect(apply.bodySchema.parse(JSON.parse(JSON.stringify(command())))).toEqual(command());
    expect(route.bodySchema.parse(JSON.parse(JSON.stringify(event())))).toEqual(event());
    expect(apply.bodySchema.safeParse({ ...command(), scope }).success).toBe(false);
    expect(route.bodySchema.safeParse({ ...event(), verified: true }).success).toBe(false);
  });
  it('validates observed application rather than copying a saved intention', () => {
    expect(get.responseSchema.parse(JSON.parse(JSON.stringify(snapshot())))).toEqual(snapshot());
    expect(apply.responseSchema.parse(JSON.parse(JSON.stringify(receipt())))).toEqual(receipt());
    expect(apply.responseSchema.safeParse(edit(receipt(), { 'snapshot.configuration.attestation': null })).success).toBe(false);
    expect(route.responseSchema.parse({ event: event(), snapshot: snapshot(), resolvedAt: instant }).snapshot).toEqual(snapshot());
    expect(route.responseSchema.safeParse({ event: event(), snapshot: edit(snapshot(), { agentArchived: true }), resolvedAt: instant }).success).toBe(false);
  });
  it('returns explicit unresolved routes and only sanitized failure codes', () => {
    expect(route.responseSchema.parse({ event: event(), snapshot: null, resolvedAt: instant }).snapshot).toBeNull();
    expect(get.errorResponseSchema.safeParse({ ok: false, error: 'raw provider detail' }).success).toBe(false);
    expect(apply.errorResponseSchema.safeParse({ ok: false, error: 'stale_version', currentVersion: 2 }).success).toBe(true);
    expect(route.errorResponseSchema.safeParse({ ok: false, error: 'source_unavailable', privateDetail: 'synthetic' }).success).toBe(false);
  });
});
