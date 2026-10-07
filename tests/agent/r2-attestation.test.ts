import { describe, expect, it } from 'vitest';
import { AgentChannelAttestationRequestSchema, AgentChannelAttestationSchema, isChannelAttestationCurrent } from '../../src/agent/agent-channel-attestation.js';
import { internalChannelAttestationContract } from '../../src/http/endpoints/internal-channel-attestation.js';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/auth-headers.js';
import { scope, identity, instant } from './r2-fixtures.js';
const request = { scope, identity, kind: 'email', configVersion: 2 };
const observation = { scope, identity, applied: { version: 2, state: 'paused' }, observedAt: instant,
  channel: { channelId: 'inbox-review', kind: 'email', state: 'paused', loaded: false, readiness: 'not-ready' }, error: null };
const now = Date.parse(instant);
describe('R2 external handler attestation transport', () => {
  it('uses scoped internal authenticated transport', () => {
    expect(internalChannelAttestationContract).toMatchObject({ method: 'POST', path: '/internal/channels/attest', authType: 'secret' });
    expect(INTERNAL_SECRET_HEADER).toBe('X-Internal-Secret');
    expect(internalChannelAttestationContract.bodySchema).toBe(AgentChannelAttestationRequestSchema);
    expect(internalChannelAttestationContract.responseSchema).toBe(AgentChannelAttestationSchema);
  });
  it.each(['email', 'voice'])('accepts actual paused and loaded observations of %s', (kind) => {
    expect(AgentChannelAttestationSchema.safeParse({ ...observation, channel: { ...observation.channel, kind } }).success).toBe(true);
    expect(AgentChannelAttestationSchema.safeParse({ ...observation, applied: { version: 2, state: 'active' }, channel: { ...observation.channel, kind, state: 'loaded', loaded: true, readiness: 'ready' } }).success).toBe(true);
  });
  it.each([
    ['scope runtime', { identity: { ...identity, runtimeAgentId: 'other' } }],
    ['unsupported kind', { kind: 'telegram' }],
    ['no version', { configVersion: undefined }],
    ['private request field', { token: 'synthetic' }],
  ])('rejects request %s', (_label, patch) => expect(AgentChannelAttestationRequestSchema.safeParse({ ...request, ...patch }).success).toBe(false));
  it.each([
    ['scope runtime', { identity: { ...identity, runtimeAgentId: 'other' } }],
    ['undated', { observedAt: undefined }],
    ['unsupported kind', { channel: { ...observation.channel, kind: 'telegram' } }],
    ['loaded without applied', { applied: null, channel: { ...observation.channel, state: 'loaded', loaded: true } }],
    ['loaded while paused', { channel: { ...observation.channel, state: 'loaded', loaded: true } }],
    ['paused while active', { applied: { version: 2, state: 'active' } }],
    ['error without code', { applied: null, channel: { ...observation.channel, state: 'error', loaded: null } }],
    ['private root', { providerMessage: 'synthetic' }],
    ['private channel', { channel: { ...observation.channel, token: 'synthetic' } }],
    ['private identity', { identity: { ...identity, token: 'synthetic' } }],
    ['private scope', { scope: { ...scope, token: 'synthetic' } }],
    ['private applied', { applied: { ...observation.applied, token: 'synthetic' } }],
  ])('rejects observation %s', (_label, patch) => expect(AgentChannelAttestationSchema.safeParse({ ...observation, ...patch }).success).toBe(false));
  it('represents unobserved and provider failures without inferring loaded', () => {
    expect(AgentChannelAttestationSchema.safeParse({ ...observation, applied: null, channel: { ...observation.channel, state: 'unknown', loaded: null, readiness: 'unknown' } }).success).toBe(true);
    expect(AgentChannelAttestationSchema.safeParse({ ...observation, applied: null, channel: { ...observation.channel, state: 'error', loaded: null }, error: { code: 'account_blocked', retryable: false } }).success).toBe(true);
    expect(isChannelAttestationCurrent(request, { ...observation, applied: null, channel: { ...observation.channel, state: 'unknown', loaded: null } }, now)).toBe(false);
  });
  it('requires exact scope, identity, channel and applied version', () => {
    expect(isChannelAttestationCurrent(request, observation, now)).toBe(true);
    for (const field of ['tenantId', 'ownerId']) expect(isChannelAttestationCurrent(request, { ...observation, scope: { ...scope, [field]: 'other' } }, now)).toBe(false);
    expect(isChannelAttestationCurrent(request, { ...observation, scope: { ...scope, agentId: 'other' }, identity: { ...identity, runtimeAgentId: 'other' } }, now)).toBe(false);
    expect(isChannelAttestationCurrent(request, { ...observation, identity: { ...identity, managementAgentId: 'other' } }, now)).toBe(false);
    expect(isChannelAttestationCurrent(request, { ...observation, channel: { ...observation.channel, kind: 'voice' } }, now)).toBe(false);
    expect(isChannelAttestationCurrent(request, { ...observation, applied: { version: 1, state: 'paused' } }, now)).toBe(false);
  });
  it('rejects stale/future observations and invalid clocks without confusing current with ready', () => {
    expect(isChannelAttestationCurrent(request, observation, now + 60_000)).toBe(true);
    expect(isChannelAttestationCurrent(request, observation, now + 60_001)).toBe(false);
    expect(isChannelAttestationCurrent(request, observation, now - 1)).toBe(false);
    expect(isChannelAttestationCurrent(request, observation, Number.NaN)).toBe(false);
    expect(isChannelAttestationCurrent(request, observation, now, -1)).toBe(false);
    expect(isChannelAttestationCurrent(request, observation, now, Number.POSITIVE_INFINITY)).toBe(false);
    expect(isChannelAttestationCurrent({}, observation, now)).toBe(false);
    expect(isChannelAttestationCurrent(request, {}, now)).toBe(false);
  });
});
