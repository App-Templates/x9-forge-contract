import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import * as Agent from '../../src/agent/index.js';

function schema(name: string): z.ZodType {
  const candidate: unknown = Reflect.get(Agent, name);
  expect(candidate, name).toBeDefined();
  return candidate as z.ZodType;
}
function call(name: string, ...args: unknown[]): unknown {
  const candidate: unknown = Reflect.get(Agent, name);
  expect(candidate, name).toBeTypeOf('function');
  return (candidate as (...input: unknown[]) => unknown)(...args);
}
const startedAt = '2026-10-08T20:00:00Z';
const updatedAt = '2026-10-08T20:00:01Z';
const scope = { agentId: 'runtime-a', ownerId: 'owner-a', tenantId: 'tenant-a' };
const identity = { managementAgentId: 'managed-a', runtimeAgentId: 'runtime-a', vaultAgentId: 7 };
const binding = { scope, identity };
const bot = { ...binding, kind: 'telegram', resource: { agent_id: scope.agentId, bot_username: 'synthetic_bot', created_at: '2026-10-07T20:00:00Z' } };
const inbox = { ...binding, kind: 'email', resource: { agent_id: scope.agentId, provider_inbox_id: 'synthetic-inbox', address: 'agent@example.test', display_name: null, created_at: updatedAt } };
function command(action = 'create-resource', expectedAppliedVersion: number | null = null) {
  return { action, requestId: 'resource-00001', expectedDesiredVersion: 4, expectedAppliedVersion };
}
function intent(kind = 'telegram', action = 'create-resource') {
  return { ...binding, kind, command: command(action, action === 'rotate-token' ? 4 : null), previousResource: action === 'rotate-token' ? bot : null };
}
function configuration(kind = 'telegram', applied = true, resource: unknown = kind === 'telegram' ? bot : inbox) {
  return { ...binding, kind, desired: { version: applied ? 5 : 4, state: 'active' },
    applied: applied ? { version: 5, state: 'active' } : null, resource,
    observation: applied ? { channelId: kind, kind, state: 'loaded', loaded: true, readiness: 'ready' } : null,
    observedAt: applied ? updatedAt : null, error: null };
}
function receipt(kind = 'telegram', action = 'create-resource') {
  return { intent: intent(kind, action), outcome: 'applied', replayed: false, startedAt, updatedAt, configuration: configuration(kind), error: null };
}
const cmdSchema = 'AgentChannelResourceCommandSchema';
const intentSchema = 'AgentChannelResourceIntentSchema';
const resultSchema = 'AgentChannelResourceResultSchema';

 describe('C5 resource commands', () => {
  it('accepts creation and selective token rotation with compare-and-swap versions', () => {
    expect(schema(cmdSchema).parse(command())).toEqual(command());
    expect(schema(cmdSchema).parse(command('rotate-token', 4))).toEqual(command('rotate-token', 4));
    expect(schema(cmdSchema).safeParse(command('create-resource', 3)).success).toBe(true);
  });
  it.each([
    ['action', { ...command(), action: 'delete-and-create' }],
    ['requestId', { ...command(), requestId: 'short' }],
    ['desired version', { ...command(), expectedDesiredVersion: -1 }],
    ['applied version', { ...command(), expectedAppliedVersion: 5 }],
    ['client resource', { ...command(), resource: bot }],
    ['client scope', { ...command(), scope }],
    ['client identity', { ...command(), identity }],
    ['provider URL', { ...command(), url: 'https://example.test' }],
    ['credential field', { ...command(), token: 'forbidden' }],
  ])('rejects unsafe command: %s', (_label, raw) => expect(schema(cmdSchema).safeParse(raw).success).toBe(false));
 });

 describe('C5 server-resolved resource intents', () => {
  it('keeps absent resources distinct from rotation of this existing bot', () => {
    expect(schema(intentSchema).parse(intent())).toEqual(intent());
    expect(schema(intentSchema).parse(intent('email'))).toEqual(intent('email'));
    expect(schema(intentSchema).parse(intent('telegram', 'rotate-token'))).toEqual(intent('telegram', 'rotate-token'));
  });
  it.each([
    ['create over existing', { ...intent(), previousResource: bot }],
    ['rotation without bot', { ...intent('telegram', 'rotate-token'), previousResource: null }],
    ['email rotation', { ...intent('email', 'rotate-token'), previousResource: inbox }],
    ['wrong door', { ...intent('telegram', 'rotate-token'), previousResource: inbox }],
    ['foreign owner', { ...intent('telegram', 'rotate-token'), previousResource: { ...bot, scope: { ...scope, ownerId: 'owner-b' } } }],
    ['foreign tenant', { ...intent('telegram', 'rotate-token'), previousResource: { ...bot, scope: { ...scope, tenantId: 'tenant-b' } } }],
    ['foreign management identity', { ...intent('telegram', 'rotate-token'), previousResource: { ...bot, identity: { ...identity, managementAgentId: 'managed-b' } } }],
    ['foreign vault identity', { ...intent('telegram', 'rotate-token'), previousResource: { ...bot, identity: { ...identity, vaultAgentId: 8 } } }],
    ['missing vault identity', { ...intent(), identity: { managementAgentId: identity.managementAgentId, runtimeAgentId: identity.runtimeAgentId } }],
    ['runtime identity mismatch', { ...intent(), identity: { ...identity, runtimeAgentId: 'runtime-b' } }],
    ['legacy credential reference', { ...intent('telegram', 'rotate-token'), previousResource: { ...bot, resource: { ...bot.resource, bot_token_ref: 'forbidden' } } }],
    ['provider details', { ...intent(), providerResponse: {} }],
  ])('rejects invalid resolved intent: %s', (_label, raw) => expect(schema(intentSchema).safeParse(raw).success).toBe(false));
  it('checks both versions, resource and full server binding before effects', () => {
    expect(call('isAgentChannelResourceIntentReady', intent(), configuration('telegram', false, null))).toBe(true);
    const old = { ...configuration(), desired: { version: 4, state: 'active' }, applied: { version: 4, state: 'active' } };
    expect(call('isAgentChannelResourceIntentReady', intent('telegram', 'rotate-token'), old)).toBe(true);
  });
  it.each([
    ['desired CAS', { ...configuration('telegram', false, null), desired: { version: 5, state: 'active' } }],
    ['applied CAS', { ...configuration(), desired: { version: 5, state: 'active' } }],
    ['known resource appeared', configuration('telegram', false)],
    ['door changed', configuration('email', false, null)],
    ['owner changed', { ...configuration('telegram', false, null), scope: { ...scope, ownerId: 'owner-b' } }],
    ['tenant changed', { ...configuration('telegram', false, null), scope: { ...scope, tenantId: 'tenant-b' } }],
    ['vault changed', { ...configuration('telegram', false, null), identity: { ...identity, vaultAgentId: 8 } }],
    ['invalid configuration', {}],
  ])('refuses a stale or foreign current snapshot: %s', (_label, current) => {
    expect(call('isAgentChannelResourceIntentReady', intent(), current)).toBe(false);
  });
  it('refuses an invalid intent before effects', () => expect(call('isAgentChannelResourceIntentReady', {}, configuration())).toBe(false));
 });

 describe('C5 metadata-only resource receipts', () => {
  it.each(['telegram', 'email'])('accepts dated applied evidence for %s without claiming an LLM reply', kind => {
    expect(schema(resultSchema).parse(receipt(kind))).toEqual(receipt(kind));
  });
  it('accepts applied selective rotation of the same bot', () => {
    expect(schema(resultSchema).safeParse(receipt('telegram', 'rotate-token')).success).toBe(true);
  });
  it('allows an applied pause while preserving the provisioned resource', () => {
    const current = { ...configuration(), desired: { version: 5, state: 'paused' }, applied: { version: 5, state: 'paused' },
      observation: { channelId: 'telegram', kind: 'telegram', state: 'paused', loaded: false, readiness: 'not-ready' } };
    expect(schema(resultSchema).safeParse({ ...receipt(), configuration: current }).success).toBe(true);
  });
  it('distinguishes pending, definite failure and ambiguity without dropping a known resource', () => {
    const pending = { ...receipt(), outcome: 'pending', configuration: configuration('telegram', false, null) };
    expect(schema(resultSchema).safeParse(pending).success).toBe(true);
    expect(schema(resultSchema).safeParse({ ...pending, outcome: 'failed', error: { code: 'provider_rejected', retryable: false } }).success).toBe(true);
    expect(schema(resultSchema).safeParse({ ...pending, outcome: 'reconcile_pending', error: { code: 'reconcile_pending', retryable: true } }).success).toBe(true);
    const acquired = { ...receipt(), outcome: 'reconcile_pending', configuration: { ...configuration('telegram', false), desired: { version: 5, state: 'active' } }, error: { code: 'reconcile_pending', retryable: true } };
    expect(schema(resultSchema).safeParse(acquired).success).toBe(true);
  });
  it.each([
    ['unknown outcome', { ...receipt(), outcome: 'delivered' }],
    ['receipt privacy', { ...receipt(), rawProviderResponse: {} }],
    ['configuration privacy', { ...receipt(), configuration: { ...configuration(), secret: 'forbidden' } }],
    ['error privacy', { ...receipt(), outcome: 'failed', error: { code: 'apply_failed', retryable: false, detail: 'forbidden' } }],
    ['owner mismatch', { ...receipt(), configuration: { ...configuration(), scope: { ...scope, ownerId: 'owner-b' }, resource: { ...bot, scope: { ...scope, ownerId: 'owner-b' } } } }],
    ['vault mismatch', { ...receipt(), configuration: { ...configuration(), identity: { ...identity, vaultAgentId: 8 }, resource: { ...bot, identity: { ...identity, vaultAgentId: 8 } } } }],
    ['door mismatch', { ...receipt(), configuration: configuration('email') }],
    ['backward time', { ...receipt(), updatedAt: '2026-10-08T19:59:59Z' }],
    ['future observation', { ...receipt(), configuration: { ...configuration(), observedAt: '2026-10-08T20:00:02Z' } }],
    ['stale observation', { ...receipt(), configuration: { ...configuration(), observedAt: '2026-10-08T19:59:59Z' } }],
    ['non-advanced version', { ...receipt(), configuration: { ...configuration(), desired: { version: 4, state: 'active' }, applied: { version: 4, state: 'active' } } }],
    ['pending saved version', { ...receipt(), configuration: { ...configuration(), applied: null, observation: null, observedAt: null } }],
    ['failed load', { ...receipt(), configuration: { ...configuration(), observation: { channelId: 'telegram', kind: 'telegram', state: 'failed', loaded: false, readiness: 'not-ready' }, error: { code: 'load_failed', retryable: false } } }],
    ['applied error', { ...receipt(), error: { code: 'apply_failed', retryable: false } }],
    ['failed without error', { ...receipt(), outcome: 'failed', configuration: configuration('telegram', false, null) }],
    ['pending with error', { ...receipt(), outcome: 'pending', error: { code: 'apply_failed', retryable: false } }],
    ['ambiguity without reconciliation code', { ...receipt(), outcome: 'reconcile_pending', error: { code: 'provider_rejected', retryable: false } }],
    ['hidden reconciliation', { ...receipt(), outcome: 'failed', error: { code: 'reconcile_pending', retryable: true } }],
    ['rotation changes bot', { ...receipt('telegram', 'rotate-token'), configuration: configuration('telegram', true, { ...bot, resource: { ...bot.resource, bot_username: 'another_bot' } }) }],
    ['rotation changes birth date', { ...receipt('telegram', 'rotate-token'), configuration: configuration('telegram', true, { ...bot, resource: { ...bot.resource, created_at: updatedAt } }) }],
    ['rotation loses bot', { ...receipt('telegram', 'rotate-token'), outcome: 'pending', configuration: configuration('telegram', false, null) }],
    ['failed creation acquired a resource', { ...receipt(), outcome: 'failed', error: { code: 'provider_rejected', retryable: false } }],
    ['unrelated later version', { ...receipt(), configuration: { ...configuration(), desired: { version: 6, state: 'active' }, applied: { version: 6, state: 'active' } } }],
  ])('rejects dishonest or mismatched receipt: %s', (_label, raw) => expect(schema(resultSchema).safeParse(raw).success).toBe(false));
  it('correlates the complete intent and accepts an identical replay', () => {
    expect(call('isAgentChannelResourceResultForIntent', intent(), receipt())).toBe(true);
    expect(call('isAgentChannelResourceResultForIntent', intent(), { ...receipt(), replayed: true })).toBe(true);
  });
  it.each([
    ['request id', { ...intent(), command: { ...command(), requestId: 'resource-00002' } }],
    ['desired version', { ...intent(), command: { ...command(), expectedDesiredVersion: 3 } }],
    ['applied version', { ...intent(), command: command('create-resource', 3) }],
    ['scope', { ...intent(), scope: { ...scope, ownerId: 'owner-b' } }],
    ['vault identity', { ...intent(), identity: { ...identity, vaultAgentId: 8 } }],
    ['door', intent('email')],
    ['action and original resource', intent('telegram', 'rotate-token')],
    ['invalid intent', {}],
  ])('refuses a receipt for a different intent: %s', (_label, expected) => {
    expect(call('isAgentChannelResourceResultForIntent', expected, receipt())).toBe(false);
  });
  it('refuses malformed results and preserves original resource correlation', () => {
    expect(call('isAgentChannelResourceResultForIntent', intent(), {})).toBe(false);
    const changed = { ...intent('telegram', 'rotate-token'), previousResource: { ...bot, resource: { ...bot.resource, bot_username: 'another_bot' } } };
    expect(call('isAgentChannelResourceResultForIntent', changed, receipt('telegram', 'rotate-token'))).toBe(false);
  });
 });


describe('C5 independent boundaries qualified by targeted mutations', () => {
  it('checks applied CAS even when desired version and absent resource still match', () => {
    const current = { ...configuration('telegram', false, null), applied: { version: 3, state: 'paused' } };
    expect(schema('AgentChannelConfigurationSchema').safeParse(current).success).toBe(true);
    expect(call('isAgentChannelResourceIntentReady', intent(), current)).toBe(false);
  });
  it('checks result owner binding before any resource was acquired', () => {
    const current = { ...configuration('telegram', false, null), scope: { ...scope, ownerId: 'owner-b' } };
    expect(schema('AgentChannelConfigurationSchema').safeParse(current).success).toBe(true);
    expect(schema(resultSchema).safeParse({ ...receipt(), outcome: 'pending', configuration: current }).success).toBe(false);
  });
  it('checks resource Vault binding independently of the configuration binding', () => {
    const current = configuration('telegram', true, { ...bot, identity: { ...identity, vaultAgentId: 8 } });
    expect(schema('AgentChannelConfigurationSchema').safeParse(current).success).toBe(true);
    expect(schema(resultSchema).safeParse({ ...receipt(), configuration: current }).success).toBe(false);
  });
  it('checks progress chronology even when runtime observation is unavailable', () => {
    const pending = { ...receipt(), outcome: 'pending', configuration: configuration('telegram', false, null), updatedAt: '2026-10-08T19:59:59Z' };
    expect(schema('AgentChannelConfigurationSchema').safeParse(pending.configuration).success).toBe(true);
    expect(schema(resultSchema).safeParse(pending).success).toBe(false);
  });
  it('refuses a previous unrelated version in pending progress', () => {
    const current = { ...configuration('telegram', false, null), desired: { version: 3, state: 'active' } };
    expect(schema('AgentChannelConfigurationSchema').safeParse(current).success).toBe(true);
    expect(schema(resultSchema).safeParse({ ...receipt(), outcome: 'pending', configuration: current }).success).toBe(false);
  });
  it('refuses a later unrelated version in pending progress', () => {
    const current = { ...configuration('telegram', false, null), desired: { version: 6, state: 'active' } };
    expect(schema('AgentChannelConfigurationSchema').safeParse(current).success).toBe(true);
    expect(schema(resultSchema).safeParse({ ...receipt(), outcome: 'pending', configuration: current }).success).toBe(false);
  });
  it('requires a provisioned resource even for an applied pause', () => {
    const current = { ...configuration('telegram', true, null), desired: { version: 5, state: 'paused' }, applied: { version: 5, state: 'paused' },
      observation: { channelId: 'telegram', kind: 'telegram', state: 'paused', loaded: false, readiness: 'not-ready' } };
    expect(schema('AgentChannelConfigurationSchema').safeParse(current).success).toBe(true);
    expect(schema(resultSchema).safeParse({ ...receipt(), configuration: current }).success).toBe(false);
  });
  it('requires the new effective version even if an old version is still loaded', () => {
    const current = { ...configuration(), applied: { version: 4, state: 'active' } };
    expect(schema('AgentChannelConfigurationSchema').safeParse(current).success).toBe(true);
    expect(schema(resultSchema).safeParse({ ...receipt(), configuration: current }).success).toBe(false);
  });
});
