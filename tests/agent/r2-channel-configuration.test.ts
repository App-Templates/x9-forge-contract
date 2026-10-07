import { describe, expect, it } from 'vitest';
import { AgentOwnedChannelResourceSchema, AgentChannelConfigurationSchema, AgentChannelFailureSchema,
  channelFailure, isChannelConfigurationApplied, AgentContextWithChannelsSchema, AgentContextWithChannelsWriteSchema,
  shouldLoadAgentChannel } from '../../src/agent/agent-channel-configuration.js';
import { channel, scope, identity, context, instant } from './r2-fixtures.js';
const c = channel();
describe('R2 own resources', () => {
  it.each(['telegram', 'email'] as const)('keeps own public %s resource while paused', (kind) => {
    expect(AgentOwnedChannelResourceSchema.safeParse(channel(kind).resource).success).toBe(true);
    expect(AgentChannelConfigurationSchema.parse(channel(kind)).resource).toEqual(channel(kind).resource);
  });
  it.each(['tenantId', 'ownerId', 'agentId'] as const)('rejects foreign resource %s', (field) => {
    expect(AgentChannelConfigurationSchema.safeParse({ ...c, resource: { ...c.resource, scope: { ...scope, [field]: 'foreign' }, identity: field === 'agentId' ? { ...identity, runtimeAgentId: 'foreign' } : identity, resource: field === 'agentId' ? { ...c.resource.resource, agent_id: 'foreign' } : c.resource.resource } }).success).toBe(false);
  });
  it('rejects resource agent id mismatch', () => expect(AgentOwnedChannelResourceSchema.safeParse({ ...c.resource, resource: { ...c.resource.resource, agent_id: 'other' } }).success).toBe(false));
  it('rejects resource runtime identity mismatch', () => expect(AgentOwnedChannelResourceSchema.safeParse({ ...c.resource, identity: { ...identity, runtimeAgentId: 'other' } }).success).toBe(false));
  it('rejects resource management identity mismatch', () => expect(AgentChannelConfigurationSchema.safeParse({ ...c, resource: { ...c.resource, identity: { ...identity, managementAgentId: 'other' } } }).success).toBe(false));
  it('rejects resource kind mismatch', () => expect(AgentChannelConfigurationSchema.safeParse({ ...c, resource: channel('email').resource }).success).toBe(false));
  it.each([{ token: 'synthetic' }, { bot_token_ref: 'synthetic' }, { credentials: {} }])('rejects non-public resource fields %#', (extra) => expect(AgentOwnedChannelResourceSchema.safeParse({ ...c.resource, resource: { ...c.resource.resource, ...extra } }).success).toBe(false));
  it.each(['telegram', 'email'] as const)('rejects private metadata and container fields for %s', (kind) => {
    const own = channel(kind).resource;
    expect(AgentOwnedChannelResourceSchema.safeParse({ ...own, resource: { ...own.resource, credentials: {} } }).success).toBe(false);
    expect(AgentOwnedChannelResourceSchema.safeParse({ ...own, credentials: {} }).success).toBe(false);
  });
  it('rejects unsupported channel', () => expect(AgentChannelConfigurationSchema.safeParse({ ...c, kind: 'voice', applied: null, resource: null, observation: null, observedAt: null }).success).toBe(false));
});
describe('R2 desired and applied channel state', () => {
  it('keeps old active application visible during a pending pause', () => {
    const pending = { ...c, applied: { version: 1, state: 'active' }, observation: { ...c.observation, state: 'loaded', loaded: true, readiness: 'ready' } };
    expect(AgentChannelConfigurationSchema.safeParse(pending).success).toBe(true);
    expect(isChannelConfigurationApplied(pending)).toBe(false);
  });
  it('allows a pause before provisioning', () => expect(AgentChannelConfigurationSchema.safeParse({ ...c, applied: null, resource: null, observation: null, observedAt: null }).success).toBe(true));
  it.each([
    ['unknown desired state', { desired: { version: 2, state: 'unexpected' }, applied: null, observation: null, observedAt: null }],
    ['applied ahead', { applied: { version: 3, state: 'paused' } }],
    ['same version different state', { applied: { version: 2, state: 'active' }, observation: null, observedAt: null }],
    ['active without resource', { desired: { version: 2, state: 'active' }, applied: { version: 2, state: 'active' }, resource: null, observation: null, observedAt: null }],
    ['observation kind', { observation: { ...c.observation, kind: 'email' } }],
    ['undated observation', { observedAt: null }],
    ['date without observation', { observation: null }],
    ['active but observed paused', { desired: { version: 3, state: 'active' }, applied: { version: 2, state: 'active' } }],
    ['paused but loaded', { observation: { ...c.observation, state: 'loaded', loaded: true, readiness: 'ready' } }],
    ['observation without applied state', { applied: null, observation: { ...c.observation, state: 'unknown', loaded: null, readiness: 'unknown' } }],
    ['private desired state field', { desired: { ...c.desired, token: 'synthetic' } }],
    ['private applied state field', { applied: { ...c.applied, token: 'synthetic' } }],
    ['configuration runtime identity', { identity: { ...identity, runtimeAgentId: 'other' }, resource: null }],
    ['unknown root field', { rawError: 'synthetic' }],
  ])('rejects %s', (_label, patch) => expect(AgentChannelConfigurationSchema.safeParse({ ...c, ...patch }).success).toBe(false));
  it('requires authoritative observation for convergence', () => {
    expect(isChannelConfigurationApplied(c)).toBe(true);
    expect(isChannelConfigurationApplied({ ...c, observation: null, observedAt: null })).toBe(false);
    expect(isChannelConfigurationApplied({ ...c, error: channelFailure('source_unavailable') })).toBe(false);
    expect(isChannelConfigurationApplied({ ...c, observation: { ...c.observation, state: 'unknown', loaded: null, readiness: 'unknown' } })).toBe(false);
    expect(isChannelConfigurationApplied({ ...c, desired: { version: 3, state: 'paused' } })).toBe(false);
    expect(isChannelConfigurationApplied({ bad: true })).toBe(false);
  });
});
describe('R2 sanitized errors and channel admission', () => {
  it('returns fixed failures without external strings', () => {
    expect(channelFailure('provider_unavailable')).toEqual({ code: 'provider_unavailable', retryable: true });
    expect(channelFailure('account_blocked')).toEqual({ code: 'account_blocked', retryable: false });
    expect(channelFailure('raw synthetic error with private details')).toEqual({ code: 'apply_failed', retryable: false });
    expect(channelFailure({ private: 'synthetic' })).toEqual({ code: 'apply_failed', retryable: false });
  });
  it('enforces fixed retryability and strict error shape', () => {
    expect(AgentChannelFailureSchema.safeParse({ code: 'provider_unavailable', retryable: false }).success).toBe(false);
    expect(AgentChannelFailureSchema.safeParse({ code: 'account_blocked', retryable: true }).success).toBe(false);
    expect(AgentChannelFailureSchema.safeParse({ code: 'raw synthetic external error', retryable: false }).success).toBe(false);
    expect(AgentChannelFailureSchema.safeParse({ ...channelFailure('apply_failed'), detail: 'synthetic' }).success).toBe(false);
  });
  it('preserves legacy admission only when new configuration is absent', () => {
    expect(shouldLoadAgentChannel(context, 'telegram')).toBe(true);
    expect(shouldLoadAgentChannel({ ...context, channelConfigurations: [c, channel('email')] }, 'telegram')).toBe(false);
    expect(shouldLoadAgentChannel({ ...context, channelConfigurations: 'malformed' }, 'telegram')).toBe(false);
    expect(shouldLoadAgentChannel({ ...context, channelConfigurations: [c] }, 'telegram')).toBe(false);
    expect(shouldLoadAgentChannel({}, 'telegram')).toBe(false);
    expect(shouldLoadAgentChannel({ ...context, channelConfigurations: [{ ...c, desired: { version: 3, state: 'active' } }, channel('email')] }, 'telegram')).toBe(true);
    expect(shouldLoadAgentChannel({ ...context, channelConfigurations: [{ ...c, desired: { version: 3, state: 'active' }, resource: null }, channel('email')] }, 'telegram')).toBe(false);
  });
});
describe('R2 optional context extension', () => {
  it('accepts legacy and scoped read/write contexts', () => {
    expect(AgentContextWithChannelsSchema.parse(context)).toEqual(context);
    expect(AgentContextWithChannelsWriteSchema.safeParse({ ...context, channelConfigurations: [c, channel('email')] }).success).toBe(true);
  });
  it.each(['tenantId', 'ownerId', 'agentId'] as const)('rejects configuration outside context %s', (field) => {
    const bad = { ...context, [field]: 'foreign', channelConfigurations: [c, channel('email')] };
    expect(AgentContextWithChannelsSchema.safeParse(bad).success).toBe(false);
    expect(AgentContextWithChannelsWriteSchema.safeParse(bad).success).toBe(false);
  });
  it('requires both channels once opted in', () => {
    expect(AgentContextWithChannelsSchema.safeParse({ ...context, channelConfigurations: [] }).success).toBe(false);
    expect(AgentContextWithChannelsSchema.safeParse({ ...context, channelConfigurations: [c] }).success).toBe(false);
    expect(AgentContextWithChannelsSchema.safeParse({ ...context, channelConfigurations: [c, c] }).success).toBe(false);
    expect(AgentContextWithChannelsSchema.safeParse({ ...context, tenantId: undefined, channelConfigurations: [c, channel('email')] }).success).toBe(false);
  });
  it('does not weaken the existing writer credential guard', () => {
    expect(AgentContextWithChannelsWriteSchema.safeParse({ ...context, credentials: { TELEGRAM_SESSION_STRING: '' } }).success).toBe(false);
  });
  it('keeps observation timestamp', () => expect(AgentChannelConfigurationSchema.parse(c).observedAt).toBe(instant));
});
