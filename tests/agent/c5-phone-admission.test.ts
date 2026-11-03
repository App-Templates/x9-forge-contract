import { describe, expect, it } from 'vitest';
import { AgentVoiceConfigSchema } from '../../src/capability/voice/agent-voice-settings.js';
import { AgentPhoneSnapshotSchema } from '../../src/agent/agent-phone-commands.js';
import {
  isPhoneNumberInAddressBook as inBook,
  isAgentPhoneInboundAdmitted as inbound,
  isAgentPhoneOutboundAdmitted as outbound,
  AgentPhoneOutboundRequestSchema as Request,
  AgentPhoneOutboundAuthoritySchema as Authority,
} from '../../src/agent/agent-phone-admission.js';

const instant = '2026-10-08T12:00:00.000Z';
const now = Date.parse(instant);
const binding = { scope: { tenantId: 'tenant-test', ownerId: 'owner-test', agentId: 'runtime-test' },
  identity: { managementAgentId: 'management-test', runtimeAgentId: 'runtime-test', vaultAgentId: 101 } };
const number = '+390212345678';
const caller = '+390212345679';
const policy = { kind: 'phone' as const, inbound: 'address-book' as const, outboundEnabled: true };
function fixtures() {
  const voice = { agentId: binding.identity.managementAgentId, versions: { desired: 2, applied: 2, failed: null },
    desired: { mode: 'voice', provider: 'openai_live', protocol: 'websocket', transports: ['phone'], voiceId: 'marin', model: 'live-synthetic' },
    applied: { mode: 'voice', provider: 'openai_live', protocol: 'websocket', transports: ['phone'], voiceId: 'marin', model: 'live-synthetic' } };
  const configuration = { ...structuredClone(binding), kind: 'phone', desired: { version: 2, state: 'active' }, applied: { version: 2, state: 'active' },
    access: { desiredPolicy: { ...policy }, appliedPolicy: { ...policy } },
    sharedNumber: { status: 'available', number, resourceId: 'line-test', version: 3, observedAt: instant },
    routing: { ...structuredClone(binding), number, resourceId: 'line-test', routingIdentity: 'selector-test' },
    attestation: { ...structuredClone(binding), applied: { version: 2, state: 'active' },
      channel: { channelId: 'phone-test', kind: 'voice', state: 'loaded', loaded: true, readiness: 'ready' }, observedAt: instant, error: null }, error: null };
  const snapshot = { configuration, observedAt: instant, agentArchived: false, runtimeLoadState: 'loaded' };
  const book = { ...structuredClone(binding), status: 'complete', version: 3, observedAt: instant, emails: [], phones: [caller] };
  const event = { callId: 'call-test', toNumber: number, fromNumber: caller, routingIdentity: 'selector-test', receivedAt: instant };
  const request = { ...structuredClone(binding), requestId: 'request-test', callId: 'call-test', toNumber: caller, requestedAt: instant,
    expectedPhoneVersion: 2, expectedNumberVersion: 3, expectedRoutingIdentity: 'selector-test' };
  const authority = { ...structuredClone(request), explicitlyRequested: true, observedAt: instant, expiresAt: new Date(now + 60_000).toISOString() };
  return { voice, snapshot, book, event, request, authority };
}
type Fixtures = ReturnType<typeof fixtures>;
function allowedIn(f: Fixtures, time = now, age = 60_000) { return inbound(f.event, f.snapshot, f.book, binding, f.voice, time, age); }
function allowedOut(f: Fixtures, time = now, age = 60_000) { return outbound(f.request, f.snapshot, f.book, binding, f.voice, f.authority, time, age); }

describe('C5 exact telephone Rubrica gate', () => {
  it.each(['invalid', null, undefined])('rejects noncanonical caller input %j', number => {
    expect(inBook(number, fixtures().book, binding, now)).toBe(false);
  });
  it('admits an exact complete scoped phone entry, preserving email independence', () => {
    const f = fixtures(); expect(inBook(caller, f.book, binding, now)).toBe(true);
    expect(inBook(number, f.book, binding, now)).toBe(false);
  });
  it.each(['phones', 'version', 'observedAt'])('denies missing %s telephone authority', key => {
    const f = fixtures(); const book: Record<string, unknown> = { ...f.book }; delete book[key];
    expect(inBook(caller, book, binding, now)).toBe(false);
  });
  it.each([null, [], ['allowed@example.test']])('denies unavailable or empty telephone entries %j', phones => {
    expect(inBook(caller, { ...fixtures().book, phones }, binding, now)).toBe(false);
  });
  it.each(['partial', 'unavailable'])('does not use %s source', status => {
    expect(inBook(caller, { ...fixtures().book, status, emails: null, phones: null }, binding, now)).toBe(false);
  });
  it.each(['tenantId', 'ownerId', 'agentId'])('requires matching %s', key => {
    const book = fixtures().book; expect(inBook(caller, { ...book, scope: { ...book.scope, [key]: 'other' } }, binding, now)).toBe(false);
  });
  it.each(['managementAgentId', 'vaultAgentId'])('requires matching %s identity', key => {
    const book = fixtures().book; expect(inBook(caller, { ...book, identity: { ...book.identity, [key]: key === 'vaultAgentId' ? 102 : 'other' } }, binding, now)).toBe(false);
  });
  it('requires explicit Vault identity even for matching legacy bindings', () => {
    const oldBinding = { ...binding, identity: { managementAgentId: 'management-test', runtimeAgentId: 'runtime-test' } };
    expect(inBook(caller, { ...fixtures().book, ...oldBinding }, oldBinding, now)).toBe(false);
  });
  it.each([-60_001, 1])('denies telephone observation offset %d', delta => {
    expect(inBook(caller, { ...fixtures().book, observedAt: new Date(now + delta).toISOString() }, binding, now)).toBe(false);
  });
  it('enforces inclusive current-source age and rejects invalid clocks/windows', () => {
    expect(inBook(caller, fixtures().book, binding, now + 60_000)).toBe(true);
    expect(inBook(caller, fixtures().book, binding, now + 60_001)).toBe(false);
    for (const value of [NaN, Infinity, -1]) expect(inBook(caller, fixtures().book, binding, now, value)).toBe(false);
    expect(inBook(caller, fixtures().book, binding, NaN)).toBe(false);
  });
});

describe('C5 inbound admission after verified routing', () => {
  it('admits a current loaded applied phone and exact trusted caller', () => {
    const f = fixtures(); expect(AgentVoiceConfigSchema.safeParse(f.voice).success).toBe(true);
    expect(AgentPhoneSnapshotSchema.safeParse(f.snapshot).success).toBe(true); expect(allowedIn(f)).toBe(true);
  });
  it('keeps APPLIED policy effective while a different desired policy is pending', () => {
    const f = fixtures(); f.snapshot.configuration.desired = { version: 3, state: 'paused' };
    f.snapshot.configuration.access.desiredPolicy = { ...policy, inbound: 'anyone' as never, outboundEnabled: false };
    expect(allowedIn(f)).toBe(true); expect(allowedOut(f)).toBe(true);
    f.event.fromNumber = number; expect(allowedIn(f)).toBe(false);
  });
  it('never authorizes an unapplied permissive policy', () => {
    const f = fixtures(); f.snapshot.configuration.desired.version = 3;
    f.snapshot.configuration.access.desiredPolicy.inbound = 'anyone' as never; f.event.fromNumber = number;
    expect(allowedIn(f)).toBe(false);
  });
  it('uses applied voice when a different desired voice is pending', () => {
    const f = fixtures(); f.voice.versions.desired = 3; f.voice.desired = { mode: 'text-only' } as never;
    expect(allowedIn(f)).toBe(true); expect(allowedOut(f)).toBe(true);
  });
  it('allows explicit applied anyone policy without a Rubrica but still needs a canonical caller', () => {
    const f = fixtures(); f.snapshot.configuration.access.appliedPolicy.inbound = 'anyone' as never;
    f.snapshot.configuration.access.desiredPolicy.inbound = 'anyone' as never; f.book = null as never;
    expect(allowedIn(f)).toBe(true); f.event.fromNumber = null as never; expect(allowedIn(f)).toBe(false);
  });
  const changes: [string, (f: Fixtures) => void][] = [
    ['caller not listed', f => { f.event.fromNumber = number; }],
    ['caller hidden', f => { f.event.fromNumber = null as never; }],
    ['wrong line', f => { f.event.toNumber = caller; }],
    ['wrong selector', f => { f.event.routingIdentity = 'other'; }],
    ['old verified event', f => { f.event.receivedAt = new Date(now - 60_001).toISOString(); }],
    ['future verified event', f => { f.event.receivedAt = new Date(now + 1).toISOString(); }],
    ['archive', f => { f.snapshot.agentArchived = true; }],
    ['runtime not loaded', f => { f.snapshot.runtimeLoadState = 'stopped'; }],
    ['old snapshot', f => { f.snapshot.observedAt = new Date(now - 60_001).toISOString(); f.snapshot.configuration.attestation.observedAt = f.snapshot.observedAt; f.snapshot.configuration.sharedNumber.observedAt = f.snapshot.observedAt; }],
    ['future snapshot', f => { f.snapshot.observedAt = new Date(now + 1).toISOString(); }],
    ['old line', f => { f.snapshot.configuration.sharedNumber.observedAt = new Date(now - 60_001).toISOString(); }],
    ['future line', f => { f.snapshot.configuration.sharedNumber.observedAt = new Date(now + 1).toISOString(); f.snapshot.observedAt = f.snapshot.configuration.sharedNumber.observedAt; }],
    ['old attestation', f => { f.snapshot.configuration.attestation.observedAt = new Date(now - 60_001).toISOString(); }],
    ['not ready', f => { f.snapshot.configuration.attestation.channel.readiness = 'not-ready'; }],
    ['handler stopped', f => { f.snapshot.configuration.attestation.channel.state = 'stopped'; f.snapshot.configuration.attestation.channel.loaded = false; }],
    ['applied pause', f => { const c = f.snapshot.configuration; c.desired.state = 'paused'; c.applied.state = 'paused'; c.attestation.applied.state = 'paused'; c.attestation.channel.state = 'paused'; c.attestation.channel.loaded = false; }],
    ['missing applied policy', f => { f.snapshot.configuration.access.appliedPolicy = null as never; }],
    ['foreign snapshot owner', f => { f.snapshot.configuration.scope.ownerId = 'other'; }],
    ['foreign voice', f => { f.voice.agentId = 'other'; }],
    ['voice never applied', f => { f.voice.applied = null as never; f.voice.versions.applied = null as never; }],
    ['text only', f => { f.voice.applied = { mode: 'text-only' } as never; }],
    ['web voice only', f => { f.voice.applied.transports = ['web']; }],
    ['missing snapshot', f => { f.snapshot = null as never; }],
    ['missing voice', f => { f.voice = null as never; }],
    ['global line unavailable', f => { f.snapshot.configuration.sharedNumber = { status: 'unavailable', number: null, resourceId: null, version: null, observedAt: null } as never; }],
    ['unapplied configuration', f => { const c = f.snapshot.configuration; c.applied = null as never; c.access.appliedPolicy = null as never; c.attestation = null as never; }],
    ['runtime error', f => { f.snapshot.configuration.attestation.error = { code: 'source_unavailable', retryable: true } as never; }],
    ['current config error', f => { f.snapshot.configuration.error = { code: 'source_unavailable', retryable: true } as never; }],
  ];
  it.each(changes)('refuses %s', (_label, change) => { const f = fixtures(); change(f); expect(allowedIn(f)).toBe(false); });
  it('does not replace a still applied configuration with a failed desired edit', () => {
    const f = fixtures(); f.snapshot.configuration.desired.version = 3;
    f.snapshot.configuration.error = { code: 'apply_failed', retryable: false } as never;
    expect(allowedIn(f)).toBe(true); expect(allowedOut(f)).toBe(true);
  });
  it.each([NaN, Infinity, -1])('refuses invalid admission window %d', value => {
    expect(allowedIn(fixtures(), now, value)).toBe(false); expect(allowedOut(fixtures(), now, value)).toBe(false);
  });
});

describe('C5 explicit server-owned outbound request', () => {
  it('admits an exact Rubrica destination and correlated unexpired explicit request', () => {
    const f = fixtures(); expect(Request.parse(f.request)).toEqual(f.request); expect(Authority.parse(f.authority)).toEqual(f.authority);
    expect(allowedOut(f)).toBe(true);
  });
  it('never extends anyone inbound permission to outbound destinations', () => {
    const f = fixtures(); f.snapshot.configuration.access.appliedPolicy.inbound = 'anyone' as never;
    f.snapshot.configuration.access.desiredPolicy.inbound = 'anyone' as never;
    f.book.phones = []; expect(allowedIn(f)).toBe(true); expect(allowedOut(f)).toBe(false);
  });
  const changes: [string, (f: Fixtures) => void][] = [
    ['outbound disabled', f => { f.snapshot.configuration.access.appliedPolicy.outboundEnabled = false; f.snapshot.configuration.access.desiredPolicy.outboundEnabled = false; }],
    ['not explicitly requested', f => { f.authority.explicitlyRequested = false; }],
    ['authority missing', f => { f.authority = null as never; }],
    ['authority expired', f => { f.authority.expiresAt = instant; }],
    ['authority future', f => { f.authority.observedAt = new Date(now + 1).toISOString(); }],
    ['authority lifetime above sixty seconds', f => { f.authority.expiresAt = new Date(now + 60_001).toISOString(); }],
    ['authority observation before request', f => { f.authority.observedAt = new Date(now - 1).toISOString(); f.authority.expiresAt = new Date(now + 59_999).toISOString(); }],
    ['authority stale but not expired', f => { f.authority.observedAt = new Date(now - 60_001).toISOString(); f.authority.expiresAt = new Date(now + 1).toISOString(); f.authority.requestedAt = f.authority.observedAt; }],
    ['request noncanonical destination', f => { f.request.toNumber = 'invalid'; }],
    ['authority different recipient', f => { f.authority.toNumber = number; }],
    ['authority different request', f => { f.authority.requestId = 'other-request'; }],
    ['authority different call', f => { f.authority.callId = 'other-call'; }],
    ['authority different requested time', f => { f.authority.requestedAt = new Date(now - 1).toISOString(); }],
    ['authority different owner', f => { f.authority.scope.ownerId = 'other'; }],
    ['authority different expected version', f => { f.authority.expectedPhoneVersion = 1; }],
    ['request old phone version', f => { f.request.expectedPhoneVersion = 1; f.authority.expectedPhoneVersion = 1; }],
    ['request old line version', f => { f.request.expectedNumberVersion = 1; f.authority.expectedNumberVersion = 1; }],
    ['request old selector', f => { f.request.expectedRoutingIdentity = 'old-selector'; f.authority.expectedRoutingIdentity = 'old-selector'; }],
    ['request old timestamp', f => { f.request.requestedAt = new Date(now - 60_001).toISOString(); f.authority.requestedAt = f.request.requestedAt; }],
    ['request foreign binding', f => { f.request.identity.managementAgentId = 'other'; }],
  ];
  it.each(changes)('refuses %s', (_label, change) => { const f = fixtures(); change(f); expect(allowedOut(f)).toBe(false); });
  it.each([0, -1, 60_001])('rejects authority TTL %d at the schema boundary', duration => {
    const f = fixtures(); expect(Authority.safeParse({ ...f.authority, expiresAt: new Date(now + duration).toISOString() }).success).toBe(false);
  });
  it('rejects browser-provided extras in request and authority', () => {
    const f = fixtures(); expect(Request.safeParse({ ...f.request, viewer: { role: 'sa' } }).success).toBe(false);
    expect(Authority.safeParse({ ...f.authority, rawPrompt: 'synthetic' }).success).toBe(false);
  });
});
