import { describe, expect, it } from 'vitest';
import { AgentPhoneSnapshotSchema, AgentPhoneApplyResultSchema, AgentPhoneRuntimeSnapshotSchema as Snapshot,
 AgentPhoneRuntimeApplyResultSchema as Result, AgentPhoneRuntimeRoutingInventorySchema as Inventory,
 AgentPhoneRuntimeRouteResultSchema as RouteResult, isAgentPhoneRuntimeSnapshotCurrent as current,
 isAgentPhoneRuntimeApplyReady as ready, isAgentPhoneRuntimeResultForCommand as correlated,
 resolveAgentPhoneRuntimeRoute as resolve, isAgentPhoneRuntimeRouteResultForEvent as routeFor,
 isAgentPhoneApplyReady as forgeReady } from '../../src/agent/agent-phone-commands.js';
import { internalAgentPhoneSnapshotContract, internalAgentPhoneApplyContract, internalAgentPhoneRouteContract,
 internalAgentPhoneRuntimeSnapshotContract as get, internalAgentPhoneRuntimeApplyContract as apply,
 internalAgentPhoneRuntimeRouteContract as route } from '../../src/http/endpoints/internal-agent-phone-channel.js';
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
function snapshot() { return { configuration: config(), observedAt: instant, runtimeLoadState: 'loaded' }; }
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

describe('runtime Phone has no Forge archival authority', () => {
 it('exposes the actual runtime snapshot without a fabricated archive flag', () => {
  expect(Snapshot.safeParse(snapshot()).success).toBe(true); expect(Snapshot.parse(snapshot())).toEqual(snapshot());
  expect(current(snapshot(), binding, now)).toBe(true);
  expect(ready(command(), snapshot(), binding, now)).toBe(true);
 });
 it.each([true, false])('rejects agentArchived=%s in private evidence rather than trusting it', agentArchived => {
  expect(Snapshot.safeParse({ ...snapshot(), agentArchived }).success).toBe(false);
  expect(current({ ...snapshot(), agentArchived }, binding, now)).toBe(false);
 });
 it('retains required owning-record archival authority in the public contract', () => {
  expect(AgentPhoneSnapshotSchema.safeParse(snapshot()).success).toBe(false);
  const publicSnapshot={ ...snapshot(), agentArchived: true };
  expect(AgentPhoneSnapshotSchema.parse(publicSnapshot)).toEqual(publicSnapshot);
  expect(forgeReady(command(), publicSnapshot, binding, now)).toBe(false);
  expect(AgentPhoneApplyResultSchema.safeParse(receipt()).success).toBe(false);
 });
 it.each(['ownerId', 'tenantId', 'agentId'])('checks full binding %s', key => {
  const other=edit(binding,{ ['scope.'+key]:'foreign', ...(key==='agentId'?{'identity.runtimeAgentId':'foreign'}:{}) });
  expect(current(snapshot(), other, now)).toBe(false); expect(ready(command(), snapshot(), other, now)).toBe(false);
 });
 it.each(['managementAgentId','vaultAgentId'])('checks runtime identity %s', key => {
  expect(current(snapshot(),edit(binding,{['identity.'+key]:key==='vaultAgentId'?12:'foreign'}),now)).toBe(false);
 });
 it.each([stale,later])('rejects stale or future runtime observation %s', observedAt => {
  const s=edit(snapshot(),{ observedAt,'configuration.sharedNumber.observedAt':observedAt,'configuration.attestation.observedAt':observedAt });
  expect(current(s,binding,now)).toBe(false); expect(ready(command(),s,binding,now)).toBe(false);
 });
 it.each(['sharedNumber','attestation'])('preserves evidence chronology for %s', key =>
  expect(Snapshot.safeParse(edit(snapshot(),{['configuration.'+key+'.observedAt']:later})).success).toBe(false));
 it.each(['stopped','unknown'])('never activates %s runtime', runtimeLoadState =>
  expect(ready(command(),edit(snapshot(),{runtimeLoadState}),binding,now)).toBe(false));
 it.each([{desiredVersion:3},{expectedAppliedVersion:1},{expectedNumberVersion:1},{expectedRoutingIdentity:'foreign'}])('preserves CAS %#', changes =>
  expect(ready(edit(command(),changes),snapshot(),binding,now)).toBe(false));
 it('allows an explicit pause while stopped, independently of provider readiness', () => {
  const s=edit(snapshot(),{runtimeLoadState:'stopped','configuration.desired':{version:3,state:'paused'},
   'configuration.sharedNumber':{status:'unavailable',number:null,resourceId:null,version:null,observedAt:null}});
  expect(ready(edit(command(),{desiredVersion:3,expectedNumberVersion:null}),s,binding,now)).toBe(true);
 });
 it('correlates runtime receipts but does not promote them to public receipts', () => {
  expect(Result.safeParse(receipt()).success).toBe(true); expect(Result.parse(receipt())).toEqual(receipt()); expect(correlated(command(),receipt(),binding,now)).toBe(true);
  expect(AgentPhoneApplyResultSchema.safeParse(receipt()).success).toBe(false);
 });
 it.each([
  {'snapshot.configuration.attestation':null}, {'snapshot.runtimeLoadState':'stopped'},
  {'snapshot.agentArchived':false}, {'scope.ownerId':'foreign'}, {completedAt:stale},
  {expectedNumberVersion:1}, {expectedRoutingIdentity:'foreign'}, {error:'apply_failed'},
 ])('rejects invalid runtime receipt %#', changes => expect(Result.safeParse(edit(receipt(),changes)).success).toBe(false));
 it.each([{requestId:'phone-command-other'},{expectedAppliedVersion:1},{expectedNumberVersion:1},{expectedRoutingIdentity:'foreign'}])('rejects another command receipt %#', changes =>
  expect(correlated(edit(command(),changes),receipt(),binding,now)).toBe(false));
 it('keeps explicit failed and pending outcomes distinct', () => {
  expect(Result.safeParse(edit(receipt(),{outcome:'pending'})).success).toBe(true);
  expect(Result.safeParse(edit(receipt(),{outcome:'failed',error:'apply_failed'})).success).toBe(true);
  expect(Result.safeParse(edit(receipt(),{outcome:'failed'})).success).toBe(false);
 });
 it('selects a runtime route only as a candidate for upstream authorization', () => {
  expect(Inventory.safeParse(inventory()).success).toBe(true); expect(Inventory.parse(inventory())).toEqual(inventory()); expect(resolve(event(),inventory(),now)).toEqual(snapshot());
  const r={event:event(),snapshot:snapshot(),resolvedAt:instant};
  expect(RouteResult.safeParse(r).success).toBe(true); expect(RouteResult.parse(r)).toEqual(r); expect(routeFor(event(),r,now)).toBe(true);
 });
 it.each([
  {'source.completeness':'partial'}, {'source.observedAt':stale,'snapshots.0.observedAt':stale,
   'snapshots.0.configuration.sharedNumber.observedAt':stale,'snapshots.0.configuration.attestation.observedAt':stale},
  {'snapshots.0.agentArchived':false}, {'snapshots.0.runtimeLoadState':'stopped'}, {'snapshots.0.configuration.desired.version':3},
 ])('fails closed for an unusable runtime route %#', changes =>
  expect(resolve(event(),edit(inventory(),changes),now)).toBeNull());
 it('never selects an ambiguous route', () => expect(resolve(event(),{...inventory(),snapshots:[snapshot(),snapshot()]},now)).toBeNull());
 it('correlates every event field and retains explicit unresolved routes', () => {
  const r={event:event(),snapshot:null,resolvedAt:instant};
  expect(RouteResult.safeParse(r).success).toBe(true); expect(RouteResult.parse(r)).toEqual(r); expect(routeFor(event(),r,now)).toBe(true);
  for(const change of [{callId:'call-other'},{fromNumber:'+390212345670'},{routingIdentity:'foreign'}])
   expect(routeFor(edit(event(),change),r,now)).toBe(false);
  expect(routeFor(event(),{...r,resolvedAt:later},now)).toBe(false);
 });
 it('adds runtime response descriptors on existing authenticated paths, retaining legacy exports', () => {
  expect(get.path).toBe(internalAgentPhoneSnapshotContract.path);
  expect(apply.path).toBe(internalAgentPhoneApplyContract.path); expect(route.path).toBe(internalAgentPhoneRouteContract.path);
  for(const contract of [get,apply,route]) expect(contract.authType).toBe('secret');
  expect(get.responseSchema.safeParse(JSON.parse(JSON.stringify(snapshot()))).success).toBe(true); expect(get.responseSchema.parse(JSON.parse(JSON.stringify(snapshot())))).toEqual(snapshot());
  expect(apply.responseSchema.parse(JSON.parse(JSON.stringify(receipt())))).toEqual(receipt());
  expect(route.responseSchema.parse({event:event(),snapshot:snapshot(),resolvedAt:instant}).snapshot).toEqual(snapshot());
  expect(internalAgentPhoneSnapshotContract.responseSchema.safeParse(snapshot()).success).toBe(false);
 });
});
