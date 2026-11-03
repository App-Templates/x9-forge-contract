import { describe, expect, it } from 'vitest';
import { AgentPhoneSnapshotSchema as Snapshot, AgentPhoneApplyCommandSchema as Command, AgentPhoneApplyResultSchema as Result,
  AgentPhoneInboundRouteEventSchema as Event, AgentPhoneRoutingInventorySchema as Inventory,
  isAgentPhoneSnapshotCurrent as current, isAgentPhoneApplyReady as ready, isAgentPhoneResultForCommand as correlated,
  AgentPhoneRouteResultSchema as RouteResult, isAgentPhoneRouteResultForEvent as routeFor, resolveAgentPhoneRoute as resolve } from '../../src/agent/agent-phone-commands.js';
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
function command() { return { action: 'apply-channel', requestId: 'phone-command-001', desiredVersion: 2, expectedAppliedVersion: 2,
  requestChanges: null, expectedNumberVersion: 2, expectedRoutingIdentity: 'route-alpha' }; }
function receipt() { return { ...structuredClone(binding), ...command(), kind: 'phone', replayed: false, outcome: 'applied',
  completedAt: instant, snapshot: snapshot(), error: null }; }
function event() { return { callId: 'call-alpha', toNumber: number.number, fromNumber: '+390212345679', routingIdentity: 'route-alpha', receivedAt: instant }; }
function inventory() { return { source: { authority: 'x9', availability: 'available', completeness: 'complete', observedAt: instant }, snapshots: [snapshot()] }; }
function edit<T>(input: T, changes: Record<string, unknown>): T {
  const copy = structuredClone(input);
  for (const [path, value] of Object.entries(changes)) {
    const keys = path.split('.'); let parent = copy as Record<string, unknown>;
    for (const key of keys.slice(0, -1)) parent = parent[key] as Record<string, unknown>;
    parent[keys.at(-1)!] = value;
  }
  return copy;
}
const later = new Date(now + 1).toISOString(), stale = new Date(now - 60001).toISOString();
describe('phone B2 current snapshots and CAS commands', () => {
  it('accepts canonical snapshots and a matching ready command', () => {
    expect(Snapshot.safeParse(snapshot()).success).toBe(true); expect(Command.safeParse(command()).success).toBe(true);
    expect(current(snapshot(), binding, now)).toBe(true); expect(ready(command(), snapshot(), binding, now)).toBe(true);
  });
  it.each(['sharedNumber', 'attestation'])('snapshot cannot predate %s', key => {
    expect(Snapshot.safeParse(edit(snapshot(), { [`configuration.${key}.observedAt`]: later })).success).toBe(false);
  });
  it.each(['tenantId', 'ownerId', 'agentId'])('rejects foreign expected binding %s', key => {
    const foreign = edit(binding, { [`scope.${key}`]: 'foreign', ...(key === 'agentId' ? { 'identity.runtimeAgentId': 'foreign' } : {}) });
    expect(current(snapshot(), foreign, now)).toBe(false); expect(ready(command(), snapshot(), foreign, now)).toBe(false);
  });
  it.each(['managementAgentId', 'vaultAgentId'])('rejects foreign expected identity %s', key => {
    const foreign = edit(binding, { [`identity.${key}`]: key === 'vaultAgentId' ? 12 : 'foreign' });
    expect(current(snapshot(), foreign, now)).toBe(false);
  });
  it.each([stale, later])('rejects noncurrent snapshot at %s', observedAt => {
    const s = edit(snapshot(), { observedAt, 'configuration.attestation.observedAt': observedAt, 'configuration.sharedNumber.observedAt': observedAt });
    expect(current(s, binding, now)).toBe(false); expect(ready(command(), s, binding, now)).toBe(false);
  });
  it.each([NaN, Infinity, -Infinity])('clock and freshness are finite: %s', value => {
    expect(current(snapshot(), binding, value)).toBe(false); expect(current(snapshot(), binding, now, value)).toBe(false);
    expect(resolve(event(), inventory(), value)).toBeNull(); expect(resolve(event(), inventory(), now, value)).toBeNull();
  });
  it.each([
    ['old desired', { desiredVersion: 3 }], ['old application', { expectedAppliedVersion: 1 }],
    ['line generation', { expectedNumberVersion: 1 }], ['routing selector', { expectedRoutingIdentity: 'other' }],
  ] as const)('rejects CAS mismatch %s', (_name, changes) => expect(ready(edit(command(), changes), snapshot(), binding, now)).toBe(false));
  it('rejects an impossible command CAS and Telegram request changes', () => {
    expect(Command.safeParse(edit(command(), { expectedAppliedVersion: 3 })).success).toBe(false);
    expect(Command.safeParse(edit(command(), { requestChanges: { expectedQueueVersion: 1, operations: [{ requestId: 'request-001', action: 'ignore' }] } })).success).toBe(false);
  });
  it.each([{ scope }, { ownerId: 'foreign' }, { providerUrl: 'https://invalid.example' }])('command cannot supply authority %#', fields => {
    expect(Command.safeParse({ ...command(), ...fields }).success).toBe(false);
  });
  it.each([
    ['archived', { agentArchived: true }], ['stopped', { runtimeLoadState: 'stopped' }],
    ['unknown runtime', { runtimeLoadState: 'unknown' }], ['stale line', { 'configuration.sharedNumber.observedAt': stale }],
  ] as const)('does not apply active %s', (_name, changes) => expect(ready(command(), edit(snapshot(), changes), binding, now)).toBe(false));
  it('never applies a pause using an invalid clock', () => {
    const paused = edit(snapshot(), { 'configuration.desired': { version: 3, state: 'paused' } });
    expect(ready(edit(command(), { desiredVersion: 3 }), paused, binding, NaN)).toBe(false);
  });
  it('cannot activate a missing route or unavailable number', () => {
    const missing = edit(snapshot(), { 'configuration.desired.version': 3, 'configuration.applied': null, 'configuration.access.appliedPolicy': null,
      'configuration.attestation': null, 'configuration.routing': null });
    expect(ready(edit(command(), { desiredVersion: 3, expectedAppliedVersion: null, expectedRoutingIdentity: null }), missing, binding, now)).toBe(false);
    const unavailable = edit(snapshot(), { 'configuration.sharedNumber': { status: 'unavailable', number: null, resourceId: null, version: null, observedAt: null } });
    expect(ready(edit(command(), { expectedNumberVersion: null }), unavailable, binding, now)).toBe(false);
  });
  it('allows an explicit pause even with stopped runtime and unavailable shared line', () => {
    const paused = edit(snapshot(), { runtimeLoadState: 'stopped', 'configuration.desired': { version: 3, state: 'paused' },
      'configuration.sharedNumber': { status: 'unavailable', number: null, resourceId: null, version: null, observedAt: null } });
    expect(ready(edit(command(), { desiredVersion: 3, expectedNumberVersion: null }), paused, binding, now)).toBe(true);
  });
  it('rejects invalid structures at every helper boundary', () => {
    expect(current({}, binding, now)).toBe(false); expect(ready({}, snapshot(), binding, now)).toBe(false);
    expect(ready(command(), {}, binding, now)).toBe(false); expect(current(snapshot(), {}, now)).toBe(false);
  });
});
describe('phone B2 receipts and correlation', () => {
  it('accepts an attested applied receipt and correlated replay without promising execution', () => {
    expect(Result.safeParse(receipt()).success).toBe(true); expect(correlated(command(), receipt(), binding, now)).toBe(true);
    expect(correlated(command(), edit(receipt(), { replayed: true }), binding, now)).toBe(true);
  });
  it.each([
    ['owner', { 'scope.ownerId': 'foreign' }], ['tenant', { 'scope.tenantId': 'foreign' }],
    ['management', { 'identity.managementAgentId': 'foreign' }], ['vault', { 'identity.vaultAgentId': 12 }],
    ['desired version', { desiredVersion: 3 }], ['version order', { expectedAppliedVersion: 3 }],
    ['predating completion', { completedAt: stale }], ['failure without code', { outcome: 'failed' }],
    ['applied error', { error: 'load_failed' }], ['missing evidence', { 'snapshot.configuration.attestation': null }],
    ['stale evidence', { 'snapshot.configuration.attestation.observedAt': stale }],
    ['archived application', { 'snapshot.agentArchived': true }], ['stopped application', { 'snapshot.runtimeLoadState': 'stopped' }],
    ['line CAS', { expectedNumberVersion: 1 }], ['selector CAS', { expectedRoutingIdentity: 'other' }],
  ] as const)('rejects receipt %s', (_name, changes) => expect(Result.safeParse(edit(receipt(), changes)).success).toBe(false));
  it('pending receipts also cannot predate their snapshot', () => {
    expect(Result.safeParse(edit(receipt(), { outcome: 'pending', completedAt: stale })).success).toBe(false);
  });
  it('preserves pending and failed as distinct valid outcomes', () => {
    const pending = edit(receipt(), { outcome: 'pending', 'snapshot.configuration.desired.version': 3, desiredVersion: 3 });
    expect(Result.safeParse(pending).success).toBe(true);
    expect(Result.safeParse(edit(pending, { outcome: 'failed', error: 'apply_failed' })).success).toBe(true);
  });
  it.each([
    ['request id', { requestId: 'phone-command-002' }], ['desired version', { desiredVersion: 3 }],
    ['previous applied', { expectedAppliedVersion: 1 }], ['number version', { expectedNumberVersion: 1 }],
    ['routing identity', { expectedRoutingIdentity: 'other' }],
  ] as const)('never correlates another command %s', (_name, changes) => {
    const pending = edit(receipt(), { outcome: 'pending' });
    expect(correlated(edit(command(), changes), pending, binding, now)).toBe(false);
  });
  it('does not correlate a result belonging to another authorized scope', () => {
    expect(correlated(command(), receipt(), edit(binding, { 'scope.ownerId': 'foreign' }), now)).toBe(false);
  });
  it('rejects future completion and old snapshot even for a pending receipt', () => {
    expect(correlated(command(), edit(receipt(), { outcome: 'pending', completedAt: later }), binding, now)).toBe(false);
    const old = edit(receipt(), { outcome: 'pending', 'snapshot.observedAt': stale,
      'snapshot.configuration.sharedNumber.observedAt': stale, 'snapshot.configuration.attestation.observedAt': stale });
    expect(correlated(command(), old, binding, now)).toBe(false);
  });
  it('does not mislabel a pending pause as applied', () => {
    const pending = edit(receipt(), { desiredVersion: 3, 'snapshot.configuration.desired': { version: 3, state: 'paused' } });
    expect(Result.safeParse(pending).success).toBe(false);
  });
  it('rejects private provider details and invalid helper inputs', () => {
    expect(Result.safeParse({ ...receipt(), providerError: 'synthetic' }).success).toBe(false);
    expect(Result.safeParse(edit(receipt(), { error: 'raw provider detail' })).success).toBe(false);
    expect(correlated({}, receipt(), binding, now)).toBe(false); expect(correlated(command(), {}, binding, now)).toBe(false);
  });
});
describe('phone B2 routing before admission', () => {
  it('selects one independently scoped active door with a complete current inventory', () => {
    expect(Event.safeParse(event()).success).toBe(true); expect(Inventory.safeParse(inventory()).success).toBe(true);
    expect(resolve(event(), inventory(), now)).toEqual(snapshot());
  });
  it.each([
    ['source partial', { 'source.completeness': 'partial' }], ['source unknown', { 'source.completeness': 'unknown' }],
    ['source unavailable', { 'source.availability': 'unavailable', 'source.completeness': 'partial' }],
    ['source stale', { 'source.observedAt': stale, 'snapshots.0.observedAt': stale, 'snapshots.0.configuration.sharedNumber.observedAt': stale, 'snapshots.0.configuration.attestation.observedAt': stale }],
    ['source future', { 'source.observedAt': later }], ['archived', { 'snapshots.0.agentArchived': true }],
    ['stopped', { 'snapshots.0.runtimeLoadState': 'stopped' }], ['unknown runtime', { 'snapshots.0.runtimeLoadState': 'unknown' }],
    ['pending pause', { 'snapshots.0.configuration.desired': { version: 3, state: 'paused' } }],
    ['pending active policy', { 'snapshots.0.configuration.desired.version': 3 }],
    ['not ready', { 'snapshots.0.configuration.attestation.channel.readiness': 'not-ready' }],
    ['snapshot stale', { 'snapshots.0.observedAt': stale, 'snapshots.0.configuration.attestation.observedAt': stale, 'snapshots.0.configuration.sharedNumber.observedAt': stale }],
  ] as const)('fails closed for %s', (_name, changes) => expect(resolve(event(), edit(inventory(), changes), now)).toBeNull());
  it.each([
    ['unknown selector', { routingIdentity: 'route-other' }], ['other number', { toNumber: '+390212345670' }],
    ['future event', { receivedAt: later }], ['old event', { receivedAt: stale }],
  ] as const)('fails closed for event %s', (_name, changes) => expect(resolve(edit(event(), changes), inventory(), now)).toBeNull());
  it('rejects an inventory predating one of its snapshots', () => {
    expect(Inventory.safeParse(edit(inventory(), { 'source.observedAt': stale })).success).toBe(false);
  });
  it('never selects an actually applied pause', () => {
    const paused = edit(snapshot(), { 'configuration.desired.state': 'paused', 'configuration.applied.state': 'paused', 'configuration.attestation.applied.state': 'paused',
      'configuration.attestation.channel.state': 'paused', 'configuration.attestation.channel.loaded': false, 'configuration.attestation.channel.readiness': 'not-ready' });
    expect(resolve(event(), { ...inventory(), snapshots: [paused] }, now)).toBeNull();
  });
  it('refuses collisions including a route of another owner that is paused', () => {
    const other = edit(snapshot(), { 'configuration.scope.ownerId': 'owner-other', 'configuration.routing.scope.ownerId': 'owner-other', 'configuration.attestation.scope.ownerId': 'owner-other',
      'configuration.desired': { version: 3, state: 'paused' } });
    expect(resolve(event(), { ...inventory(), snapshots: [snapshot(), other] }, now)).toBeNull();
  });
  it('keeps two agents on the shared line separate by their selectors', () => {
    const other = edit(snapshot(), { 'configuration.scope.agentId': 'runtime-beta', 'configuration.identity.runtimeAgentId': 'runtime-beta', 'configuration.identity.managementAgentId': 'management-beta', 'configuration.identity.vaultAgentId': 12,
      'configuration.routing.scope.agentId': 'runtime-beta', 'configuration.routing.identity.runtimeAgentId': 'runtime-beta', 'configuration.routing.identity.managementAgentId': 'management-beta', 'configuration.routing.identity.vaultAgentId': 12, 'configuration.routing.routingIdentity': 'route-beta',
      'configuration.attestation.scope.agentId': 'runtime-beta', 'configuration.attestation.identity.runtimeAgentId': 'runtime-beta', 'configuration.attestation.identity.managementAgentId': 'management-beta', 'configuration.attestation.identity.vaultAgentId': 12 });
    const both = { ...inventory(), snapshots: [snapshot(), other] };
    expect(resolve(event(), both, now)).toEqual(snapshot()); expect(resolve(edit(event(), { routingIdentity: 'route-beta' }), both, now)).toEqual(other);
  });
  it('accepts absent caller metadata only for routing, without admitting an anonymous caller', () => {
    expect(resolve(edit(event(), { fromNumber: null }), inventory(), now)).toEqual(snapshot());
  });
  it.each(['event', 'inventory', 'source', 'snapshot'])('rejects extra fields in %s', key => {
    if (key === 'event') expect(Event.safeParse({ ...event(), verified: true }).success).toBe(false);
    if (key === 'inventory') expect(Inventory.safeParse({ ...inventory(), credentials: {} }).success).toBe(false);
    if (key === 'source') expect(Inventory.safeParse(edit(inventory(), { 'source.providerDetail': 'synthetic' })).success).toBe(false);
    if (key === 'snapshot') expect(Snapshot.safeParse({ ...snapshot(), providerDetail: 'synthetic' }).success).toBe(false);
  });
  it('unknown or malformed routing data produces no selection', () => {
    expect(resolve(event(), { ...inventory(), snapshots: [] }, now)).toBeNull();
    expect(resolve({}, inventory(), now)).toBeNull(); expect(resolve(event(), {}, now)).toBeNull();
  });
});

describe('phone B2 route result correlation', () => {
  function result() { return { event: event(), snapshot: snapshot(), resolvedAt: instant }; }
  it('returns a correlated selection without conferring caller admission', () => {
    expect(RouteResult.safeParse(result()).success).toBe(true);
    expect(routeFor(event(), result(), now)).toBe(true);
    expect(routeFor(event(), { ...result(), snapshot: null }, now)).toBe(true);
  });
  it.each([
    ['selector', { 'snapshot.configuration.routing.routingIdentity': 'other' }],
    ['number', { 'event.toNumber': '+390212345670' }], ['archived', { 'snapshot.agentArchived': true }],
    ['stopped', { 'snapshot.runtimeLoadState': 'stopped' }], ['pending', { 'snapshot.configuration.desired.version': 3 }],
    ['predates event', { resolvedAt: stale }],
  ] as const)('rejects response %s', (_name, changes) => expect(RouteResult.safeParse(edit(result(), changes)).success).toBe(false));
  it('cannot claim selection of an applied pause', () => {
    const paused = edit(result(), { 'snapshot.configuration.desired.state': 'paused', 'snapshot.configuration.applied.state': 'paused',
      'snapshot.configuration.attestation.applied.state': 'paused', 'snapshot.configuration.attestation.channel.state': 'paused',
      'snapshot.configuration.attestation.channel.loaded': false, 'snapshot.configuration.attestation.channel.readiness': 'not-ready' });
    expect(RouteResult.safeParse(paused).success).toBe(false);
  });
  it('an unresolved result still cannot predate its event', () => {
    expect(RouteResult.safeParse({ event: event(), snapshot: null, resolvedAt: stale }).success).toBe(false);
  });
  it('cannot predate a fresh snapshot even for an earlier event', () => {
    expect(RouteResult.safeParse(edit(result(), { 'event.receivedAt': stale, resolvedAt: new Date(now - 1).toISOString(), 'snapshot.configuration.sharedNumber.observedAt': new Date(now - 2).toISOString(), 'snapshot.configuration.attestation.observedAt': new Date(now - 2).toISOString() })).success).toBe(false);
  });
  it.each([
    ['call', { callId: 'call-other' }], ['caller', { fromNumber: '+390212345670' }],
    ['recipient', { toNumber: '+390212345670' }], ['selector', { routingIdentity: 'other' }], ['event date', { receivedAt: later }],
  ] as const)('requires exact event correlation for %s', (_name, changes) => expect(routeFor(edit(event(), changes), result(), now)).toBe(false));
  it('rejects future, stale or invalid response clocks even for an unresolved route', () => {
    const unresolved = { ...result(), snapshot: null };
    expect(routeFor(event(), edit(unresolved, { resolvedAt: later }), now)).toBe(false);
    const oldEvent = edit(event(), { receivedAt: stale });
    expect(routeFor(oldEvent, { event: oldEvent, snapshot: null, resolvedAt: stale }, now)).toBe(false);
    expect(routeFor(event(), unresolved, NaN)).toBe(false);
  });
  it('cannot refresh an old event by dating only its unresolved result', () => {
    const old = edit(event(), { receivedAt: stale });
    expect(routeFor(old, { event: old, snapshot: null, resolvedAt: instant }, now)).toBe(false);
  });
  it('rejects private metadata and malformed correlations', () => {
    expect(RouteResult.safeParse({ ...result(), providerDetail: 'synthetic' }).success).toBe(false);
    expect(routeFor({}, result(), now)).toBe(false); expect(routeFor(event(), {}, now)).toBe(false);
  });
});
