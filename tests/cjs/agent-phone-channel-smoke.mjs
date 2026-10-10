import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let assertions = 0;
function equal(actual, expected) { assert.deepEqual(actual, expected); assertions += 1; }
const modules = [
  { agent: require('@x9-forge/contracts/agent'), http: require('@x9-forge/contracts/http') },
  { agent: await import('@x9-forge/contracts/agent'), http: await import('@x9-forge/contracts/http') },
];
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
const legacy = { ...scope, credentials: {}, llmConfig: { provider: 'synthetic', model: 'synthetic' }, telegramAllowFrom: [],
  workspacePath: '/synthetic/workspace', registryPath: '/synthetic/registry.json', displayName: 'Alpha' };
const context = { ...legacy, identity, phoneConfiguration: config() };
const draft = { requestId: 'phone-draft-001', expectedDesiredVersion: 2, expectedAppliedVersion: 2,
  desiredState: 'paused', policy, expectedNumberVersion: 2, expectedRoutingIdentity: 'route-alpha' };
const owner = { role: 'owner', ownerId: scope.ownerId, tenantId: scope.tenantId };
for (const { agent, http } of modules) {
  const { agentArchived: _archive, ...runtimeSnapshot } = snapshot();
  const runtimeReceipt = { ...receipt(), snapshot: runtimeSnapshot };
  const runtimeResolution = { event: event(), snapshot: runtimeSnapshot, resolvedAt: instant };
  equal(agent.AgentPhoneRuntimeSnapshotSchema.parse(runtimeSnapshot), runtimeSnapshot);
  equal(agent.AgentPhoneRuntimeSnapshotSchema.safeParse(snapshot()).success, false);
  equal(agent.AgentPhoneSnapshotSchema.safeParse(runtimeSnapshot).success, false);
  equal(agent.isAgentPhoneRuntimeApplyReady(command(), runtimeSnapshot, binding, now), true);
  equal(agent.isAgentPhoneApplyReady(command(), { ...snapshot(), agentArchived: true }, binding, now), false);
  equal(agent.isAgentPhoneRuntimeResultForCommand(command(), runtimeReceipt, binding, now), true);
  equal(agent.resolveAgentPhoneRuntimeRoute(event(), { ...inventory(), snapshots: [runtimeSnapshot] }, now), runtimeSnapshot);
  equal(agent.isAgentPhoneRuntimeRouteResultForEvent(event(), runtimeResolution, now), true);
  equal(http.internalAgentPhoneRuntimeSnapshotContract.responseSchema.parse(runtimeSnapshot), runtimeSnapshot);
  equal(http.internalAgentPhoneRuntimeApplyContract.responseSchema.parse(runtimeReceipt), runtimeReceipt);
  equal(http.internalAgentPhoneRuntimeRouteContract.responseSchema.parse(runtimeResolution), runtimeResolution);

  equal(agent.AgentContextWithPhoneSchema.parse(agent.AgentContextWithPhoneWriteSchema.parse(context)), context);
  equal(agent.AgentContextWithPhoneSchema.parse(legacy), legacy);
  equal(agent.AgentBirthChannelKindSchema.safeParse('phone').success, false);
  equal(agent.isPhoneChannelConfigurationApplied(config(), now), true);
  equal(agent.isAgentPhoneApplyReady(command(), snapshot(), binding, now), true);
  equal(agent.isAgentPhoneApplyReady({ ...command(), expectedNumberVersion: 1 }, snapshot(), binding, now), false);
  equal(agent.isAgentPhoneResultForCommand(command(), receipt(), binding, now), true);
  equal(agent.resolveAgentPhoneRoute(event(), inventory(), now), snapshot());
  equal(agent.resolveAgentPhoneRoute(event(), { ...inventory(), snapshots: [snapshot(), snapshot()] }, now), null);
  const resolution = { event: event(), snapshot: snapshot(), resolvedAt: instant };
  equal(agent.isAgentPhoneRouteResultForEvent(event(), resolution, now), true);
  equal(agent.isAgentPhoneRouteResultForEvent({ ...event(), callId: 'call-other' }, resolution, now), false);
  equal(http.isAgentPhoneWithinForgeAuthorization(snapshot(), owner, identity.managementAgentId), true);
  equal(http.isAgentPhoneWithinForgeAuthorization(snapshot(), { ...owner, tenantId: 'tenant-other' }, identity.managementAgentId), false);
  equal(http.ForgeAgentPhoneDraftSchema.parse(draft), draft);
  equal(http.ForgeAgentPhoneDraftSchema.safeParse({ ...draft, ownerId: scope.ownerId }).success, false);
  equal(http.isForgeAgentPhonePreviewForDraft(draft, { requestId: draft.requestId, draft, snapshot: snapshot() }, owner, identity.managementAgentId, now), true);
  equal(http.internalAgentPhoneApplyContract.bodySchema.parse(command()), command());
  equal(http.internalAgentPhoneRouteContract.authType, 'secret');
  equal(http.forgeAgentPhoneApplyContract.authentication, 'forge-session');
  equal(http.forgeAgentPhoneApplyContract.authorization, 'sa-or-agent-owner');
  equal(http.internalAgentPhonePath(identity.managementAgentId), `/internal/agents/${identity.managementAgentId}/channels/phone/access`);
  equal(http.forgeAgentPhoneApplyPath(identity.managementAgentId), `/api/agents/${identity.managementAgentId}/channels/phone/access/apply`);
}
console.log(JSON.stringify({ consumers: ['CJS', 'ESM'], assertionsPassed: assertions, assertionsTotal: assertions }));
