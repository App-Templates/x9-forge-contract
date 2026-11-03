import { describe, expect, it } from 'vitest';
import { AgentPhoneSharedNumberSchema, AgentPhoneChannelConfigurationSchema as Config,
  AgentContextWithPhoneSchema as Read, AgentContextWithPhoneWriteSchema as Write,
  isPhoneChannelConfigurationApplied as applied } from '../../src/agent/agent-phone-channel.js';
import { AgentContextWithChannelsSchema, AgentBirthChannelKindSchema } from '../../src/agent/agent-channel-configuration.js';
import { channel, scope, identity as legacyIdentity, context, instant } from './r2-fixtures.js';
const identity = { ...legacyIdentity, vaultAgentId: 101 };
const binding = { scope, identity };
const now = Date.parse(instant);
const number = { status: 'available', number: '+390212345678', resourceId: 'shared-line', version: 2, observedAt: instant };
const policy = { kind: 'phone', inbound: 'address-book', outboundEnabled: false };
function config() { return { ...structuredClone(binding), kind: 'phone', desired: { version: 2, state: 'active' },
  applied: { version: 2, state: 'active' }, access: { desiredPolicy: policy, appliedPolicy: policy },
  sharedNumber: number, routing: { ...structuredClone(binding), number: number.number, resourceId: number.resourceId, routingIdentity: 'route-review' },
  attestation: { ...structuredClone(binding), applied: { version: 2, state: 'active' },
    channel: { channelId: 'phone-review', kind: 'voice', state: 'loaded', loaded: true, readiness: 'ready' }, observedAt: instant, error: null }, error: null }; }
function copy() { return structuredClone(config()); }
describe('phone B1 shared number and scoped configuration', () => {
  it('accepts an explicit shared number and current observed application', () => {
    expect(Config.safeParse(config()).success).toBe(true); expect(applied(config(), now)).toBe(true);
  });
  it('keeps availability separate from application', () => {
    const c = copy(); c.attestation = null as never;
    expect(Config.safeParse(c).success).toBe(true); expect(applied(c, now)).toBe(false);
  });
  it('preserves unconfigured and paused states without fabricating a number', () => {
    const c = { ...config(), desired: { version: 2, state: 'paused' }, applied: null, routing: null, attestation: null,
      access: { desiredPolicy: policy, appliedPolicy: null }, sharedNumber: { status: 'unknown', number: null, resourceId: null, version: null, observedAt: null } };
    expect(Config.safeParse(c).success).toBe(true); expect(applied(c, now)).toBe(false);
    expect(AgentPhoneSharedNumberSchema.safeParse({ ...c.sharedNumber, status: 'unavailable' }).success).toBe(true);
  });
  it.each(['number', 'resourceId', 'version', 'observedAt'] as const)('available number requires %s', key => {
    expect(AgentPhoneSharedNumberSchema.safeParse({ ...number, [key]: null }).success).toBe(false);
  });
  it.each(['number', 'resourceId', 'version', 'observedAt'] as const)('unknown source cannot publish %s', key => {
    expect(AgentPhoneSharedNumberSchema.safeParse({ status: 'unknown', number: null, resourceId: null, version: null, observedAt: null, [key]: number[key] }).success).toBe(false);
  });
  it.each(['123456789', '+012345678', '+3902 12345678'])('reuses canonical E164: %s', value => {
    expect(AgentPhoneSharedNumberSchema.safeParse({ ...number, number: value }).success).toBe(false);
  });
  const invalid: [string, (c: ReturnType<typeof copy>) => void][] = [
    ['routing tenant', c => { c.routing.scope = { ...scope, tenantId: 'foreign' }; }],
    ['routing owner', c => { c.routing.scope = { ...scope, ownerId: 'foreign' }; }],
    ['routing other agent same owner', c => { c.routing.scope.agentId = 'other'; c.routing.identity.runtimeAgentId = 'other'; }],
    ['routing management', c => { c.routing.identity.managementAgentId = 'other'; }],
    ['routing vault', c => { c.routing.identity.vaultAgentId = 102; }],
    ['routing number', c => { c.routing.number = '+390212345679'; }],
    ['routing resource', c => { c.routing.resourceId = 'other'; }],
    ['applied ahead', c => { c.applied.version = 3; c.attestation = null as never; }],
    ['same version state mismatch', c => { c.desired.state = 'paused'; }],
    ['active without routing', c => { c.routing = null as never; }],
    ['policy without application', c => { c.applied = null as never; c.attestation = null as never; }],
    ['same version policy mismatch', c => { c.access.appliedPolicy = { ...policy, inbound: 'anyone' }; }],
    ['attestation tenant', c => { c.attestation.scope = { ...scope, tenantId: 'foreign' }; }],
    ['attestation owner', c => { c.attestation.scope = { ...scope, ownerId: 'foreign' }; }],
    ['attestation other agent same owner', c => { c.attestation.scope.agentId = 'other'; c.attestation.identity.runtimeAgentId = 'other'; }],
    ['attestation management', c => { c.attestation.identity.managementAgentId = 'other'; }],
    ['attestation vault', c => { c.attestation.identity.vaultAgentId = 102; }],
    ['attestation kind', c => { c.attestation.channel.kind = 'email'; }],
    ['attestation version', c => { c.attestation.applied.version = 1; }],
    ['attestation state', c => { c.attestation.applied.state = 'paused'; c.attestation.channel.state = 'paused'; c.attestation.channel.loaded = false; }],
    ['attestation without application', c => { c.applied = null as never; c.access.appliedPolicy = null as never; }],
  ];
  it.each(invalid)('rejects %s', (_name, change) => { const c = copy(); change(c); expect(Config.safeParse(c).success).toBe(false); });
  it.each(['root', 'routing', 'number', 'policy', 'access', 'attestation'])('rejects extra private metadata in %s', field => {
    const c = copy(); const target = field === 'root' ? c : field === 'routing' ? c.routing : field === 'number' ? c.sharedNumber : field === 'policy' ? c.access.desiredPolicy : field === 'access' ? c.access : c.attestation;
    Object.assign(target, { privateDetail: 'synthetic' }); expect(Config.safeParse(c).success).toBe(false);
  });
  it('requires explicit Vault identity without a legacy fallback', () => {
    const c = copy();
    Reflect.deleteProperty(c.identity, 'vaultAgentId'); Reflect.deleteProperty(c.routing.identity, 'vaultAgentId');
    Reflect.deleteProperty(c.attestation.identity, 'vaultAgentId');
    expect(Config.safeParse(c).success).toBe(false); expect(applied(c, now)).toBe(false);
  });
  it.each(['agent-a', 'agent-b'])('supports generic independently owned %s', agentId => {
    const c = copy(); const own = { tenantId: `tenant-${agentId}`, ownerId: `owner-${agentId}`, agentId };
    const ids = { managementAgentId: `management-${agentId}`, runtimeAgentId: agentId, vaultAgentId: agentId === 'agent-a' ? 201 : 202 };
    c.scope = own; c.identity = ids; c.routing.scope = { ...own }; c.routing.identity = { ...ids };
    c.attestation.scope = { ...own }; c.attestation.identity = { ...ids };
    expect(Config.safeParse(c).success).toBe(true); expect(applied(c, now)).toBe(true);
  });
  it('retains old applied policy during a pending edit', () => {
    const c = copy(); c.desired.version = 3; c.access.desiredPolicy = { ...policy, inbound: 'anyone' };
    expect(Config.safeParse(c).success).toBe(true); expect(applied(c, now)).toBe(false);
  });
  it.each([
    ['configuration error', (c: ReturnType<typeof copy>) => { c.error = { code: 'source_unavailable', retryable: true } as never; }],
    ['attestation error', (c: ReturnType<typeof copy>) => { c.attestation.error = { code: 'source_unavailable', retryable: true } as never; }],
    ['missing applied policy', (c: ReturnType<typeof copy>) => { c.access.appliedPolicy = null as never; }],
    ['not loaded', (c: ReturnType<typeof copy>) => { c.attestation.channel.state = 'stopped'; c.attestation.channel.loaded = false; }],
    ['not ready', (c: ReturnType<typeof copy>) => { c.attestation.channel.readiness = 'not-ready'; }],
    ['number unavailable', (c: ReturnType<typeof copy>) => { c.sharedNumber = { status: 'unavailable', number: null, resourceId: null, version: null, observedAt: null } as never; }],
    ['stale runtime', (c: ReturnType<typeof copy>) => { c.attestation.observedAt = new Date(now - 60001).toISOString(); }],
    ['future runtime', (c: ReturnType<typeof copy>) => { c.attestation.observedAt = new Date(now + 1).toISOString(); }],
    ['stale number', (c: ReturnType<typeof copy>) => { c.sharedNumber.observedAt = new Date(now - 60001).toISOString(); }],
    ['future number', (c: ReturnType<typeof copy>) => { c.sharedNumber.observedAt = new Date(now + 1).toISOString(); }],
  ] as const)('does not claim convergence for %s', (_name, change) => { const c = copy(); change(c); expect(Config.safeParse(c).success).toBe(true); expect(applied(c, now)).toBe(false); });
  it.each([NaN, Infinity, -Infinity])('rejects invalid clock or age %s', value => {
    expect(applied(config(), value)).toBe(false); expect(applied(config(), now, value)).toBe(false);
  });
  it('validates inclusive freshness and rejects negative windows', () => {
    expect(applied(config(), now + 60000)).toBe(true); expect(applied(config(), now + 60001)).toBe(false);
    expect(applied(config(), now, -1)).toBe(false); expect(applied({}, now)).toBe(false);
  });
  it('observes an applied pause independently of global number availability', () => {
    const c = copy(); c.desired.state = 'paused'; c.applied.state = 'paused'; c.attestation.applied.state = 'paused';
    c.attestation.channel = { ...c.attestation.channel, state: 'paused', loaded: false, readiness: 'not-ready' };
    c.sharedNumber = { status: 'unknown', number: null, resourceId: null, version: null, observedAt: null } as never;
    expect(Config.safeParse(c).success).toBe(true); expect(applied(c, now)).toBe(true);
  });
});
describe('phone B1 additive read/write context', () => {
  it('retains legacy contexts and the two birth channels', () => {
    expect(Read.parse(context)).toEqual(AgentContextWithChannelsSchema.parse(context));
    expect(Write.safeParse({ ...context, channelConfigurations: [channel(), channel('email')] }).success).toBe(true);
    expect(AgentBirthChannelKindSchema.safeParse('phone').success).toBe(false);
    expect(Read.safeParse({ ...context, channelConfigurations: [channel(), channel('email'), config()] }).success).toBe(false);
  });
  it('roundtrips explicitly owned phone with birth channels', () => {
    const channels = [channel(), channel('email')].map(c => ({ ...c, identity, resource: { ...c.resource, identity } }));
    const ctx = { ...context, identity, channelConfigurations: channels, phoneConfiguration: config() };
    expect(Read.parse(Write.parse(ctx))).toEqual(ctx);
  });
  it.each(['tenantId', 'ownerId', 'agentId'])('rejects foreign context %s', key => {
    const ctx = { ...context, identity: { ...identity, runtimeAgentId: key === 'agentId' ? 'other' : scope.agentId }, [key]: 'other', phoneConfiguration: config() };
    expect(Read.safeParse(ctx).success).toBe(false); expect(Write.safeParse(ctx).success).toBe(false);
  });
  it.each([undefined, { ...identity, managementAgentId: 'other' }, { ...identity, vaultAgentId: 102 }])('requires authoritative root identity %#', rootIdentity => {
    const ctx = { ...context, identity: rootIdentity, phoneConfiguration: config() };
    expect(Read.safeParse(ctx).success).toBe(false); expect(Write.safeParse(ctx).success).toBe(false);
  });
  it('requires agreement with each birth channel vault', () => {
    const ctx = { ...context, identity, channelConfigurations: [channel(), channel('email')], phoneConfiguration: config() };
    expect(Read.safeParse(ctx).success).toBe(false); expect(Write.safeParse(ctx).success).toBe(false);
  });
  it('retains writer internal credential rejection', () => {
    const ctx = { ...context, identity, phoneConfiguration: config(), credentials: { TELEGRAM_SESSION_STRING: '' } };
    expect(Read.safeParse(ctx).success).toBe(true); expect(Write.safeParse(ctx).success).toBe(false);
  });
});
