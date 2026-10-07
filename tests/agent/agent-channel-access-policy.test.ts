import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import * as Agent from '../../src/agent/index.js';

function schema(name: string): z.ZodType {
  const value: unknown = Reflect.get(Agent, name);
  expect(value, `Public schema ${name}`).toBeDefined();
  return value as z.ZodType;
}
function call(name: string, ...args: unknown[]): unknown {
  const value: unknown = Reflect.get(Agent, name);
  expect(value, `Public helper ${name}`).toBeTypeOf('function');
  return (value as (...input: unknown[]) => unknown)(...args);
}
const date = '2026-10-08T00:00:00.000Z';
const now = Date.parse(date);
const scope = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'runtime-a' };
const identity = { managementAgentId: 'agent-a', runtimeAgentId: 'runtime-a', vaultAgentId: 7 };
const binding = { scope, identity };
const chat = { chatId: '123', type: 'private', name: 'Persona sintetica', admittedAt: date };
const telegram = { kind: 'telegram', mode: 'approved-chats', chats: [chat] };
const email = { kind: 'email', mode: 'address-book' };
const book = { ...binding, status: 'complete', version: 3, observedAt: date, emails: ['allowed@example.test'] };
function configuration(kind = 'telegram') {
  return { ...binding, kind, desired: { version: 5, state: 'active' }, applied: { version: 4, state: 'active' },
    resource: { ...binding, kind: 'telegram', resource: { agent_id: scope.agentId, bot_username: 'synthetic_bot', created_at: date } },
    observation: { channelId: 'telegram', kind: 'telegram', state: 'loaded', loaded: true, readiness: 'ready' }, observedAt: date, error: null,
    access: { desiredPolicy: telegram, appliedPolicy: { ...telegram, chats: [] } } };
}

describe('C1 explicit door policy', () => {
  it.each([telegram, { ...telegram, chats: [] }, { ...telegram, mode: 'anyone' }, email, { ...email, mode: 'anyone' }])('accepts an explicit policy %j', policy => {
    expect(schema('AgentChannelAccessPolicySchema').safeParse(policy).success).toBe(true);
  });
  it.each([
    { ...telegram, mode: 'open' }, { ...email, mode: 'open' }, { ...telegram, kind: 'voice' }, { ...email, chats: [] }, { ...telegram, credentials: {} },
    { ...telegram, chats: [chat, chat] }, { ...telegram, chats: Array.from({ length: 513 }, (_, i) => ({ ...chat, chatId: String(i + 1) })) },
    ...['*', '0', '01', '+1', ' 123', '9007199254740992', '1.2', '1e3'].map(chatId => ({ ...telegram, chats: [{ ...chat, chatId }] })),
    { ...telegram, chats: [{ ...chat, type: 'group' }] }, { ...telegram, chats: [{ ...chat, type: 'channel' }] }, { ...telegram, chats: [{ ...chat, chatId: '-123', type: 'channel' }] }, { ...telegram, chats: [{ ...chat, chatId: '-123' }] },
    { ...telegram, chats: [{ ...chat, name: '' }] }, { ...telegram, chats: [{ ...chat, name: 'x'.repeat(161) }] },
    { ...telegram, chats: [{ ...chat, name: 'control\nname' }] }, { ...telegram, chats: [{ ...chat, admittedAt: 'yesterday' }] },
    { ...telegram, chats: [{ ...chat, rawMessage: '/start secret payload' }] },
  ])('rejects malformed or ambiguous policy %j', policy => {
    expect(schema('AgentChannelAccessPolicySchema').safeParse(policy).success).toBe(false);
  });
  it('keeps access bindings strict and compares the complete resolved ownership', () => {
    expect(call('sameAgentChannelAccessBinding', binding, binding)).toBe(true);
    expect(call('sameAgentChannelAccessBinding', binding, { ...binding, identity: { ...identity, vaultAgentId: 8 } })).toBe(false);
    expect(call('sameAgentChannelAccessBinding', binding, { ...binding, role: 'sa' })).toBe(false);
    expect(schema('AgentChannelAccessBindingSchema').safeParse({ ...binding, scope: { ...scope, role: 'sa' } }).success).toBe(false);
    expect(schema('AgentChannelAccessBindingSchema').safeParse({ ...binding, identity: { ...identity, runtimeAgentId: 'other' } }).success).toBe(false);
    expect(schema('AgentChannelAccessBindingSchema').safeParse({ ...binding, identity: { ...identity, role: 'sa' } }).success).toBe(false);
  });
  it('preserves private and group identities without display-name authorization', () => {
    const policy = { ...telegram, chats: [chat, { ...chat, chatId: '-456', type: 'supergroup' }] };
    expect(schema('AgentChannelAccessPolicySchema').safeParse(policy).success).toBe(true);
    expect(call('isTelegramChatAdmitted', policy, '123')).toBe(true);
    expect(call('isTelegramChatAdmitted', policy, '-456')).toBe(true);
    expect(call('isTelegramChatAdmitted', policy, '999')).toBe(false);
  });
  it('never treats an explicit empty list, invalid policy or another door as legacy open access', () => {
    for (const policy of [undefined, {}, email, { ...telegram, chats: [] }, { ...telegram, mode: 'unknown' }]) {
      expect(call('isTelegramChatAdmitted', policy, '123')).toBe(false);
    }
    expect(call('isTelegramChatAdmitted', { ...telegram, mode: 'anyone' }, '999')).toBe(true);
    expect(call('isTelegramChatAdmitted', { ...telegram, mode: 'anyone' }, '*')).toBe(false);
  });
});

describe('C1 authoritative address-book admission', () => {
  it('normalizes exact email matches, with explicit public mode independent of a missing book', () => {
    expect(call('isEmailSenderAdmitted', email, 'ALLOWED@example.test', book, binding, now)).toBe(true);
    expect(call('isEmailSenderAdmitted', email, 'other@example.test', book, binding, now)).toBe(false);
    expect(call('isEmailSenderAdmitted', email, 'Display <allowed@example.test>', book, binding, now)).toBe(false);
    expect(call('isEmailSenderAdmitted', { ...email, mode: 'anyone' }, 'other@example.test', null, binding, now)).toBe(true);
    expect(call('isEmailSenderAdmitted', telegram, 'allowed@example.test', book, binding, now)).toBe(false);
    expect(call('isEmailSenderAdmitted', { ...email, mode: 'anyone' }, 'allowed@example.test', book, {}, now)).toBe(false);
    expect(call('isEmailSenderAdmitted', { ...email, mode: 'anyone' }, '*', book, binding, now)).toBe(false);
  });
  it.each(['agentId', 'ownerId', 'tenantId'])('refuses another %s source', field => {
    expect(call('isEmailSenderAdmitted', email, 'allowed@example.test', { ...book, scope: { ...scope, [field]: 'other' } }, binding, now)).toBe(false);
  });
  it.each(['managementAgentId', 'runtimeAgentId', 'vaultAgentId'])('refuses another %s identity', field => {
    expect(call('isEmailSenderAdmitted', email, 'allowed@example.test', { ...book, identity: { ...identity, [field]: field === 'vaultAgentId' ? 9 : 'other' } }, binding, now)).toBe(false);
  });
  it.each([
    null, { ...book, status: 'partial', emails: null }, { ...book, status: 'unavailable', emails: null },
    { ...book, observedAt: '2026-10-07T23:58:59Z' }, { ...book, observedAt: '2026-10-08T00:00:01Z' },
  ])('never admits from missing, incomplete, stale or future source %j', source => {
    expect(call('isEmailSenderAdmitted', email, 'allowed@example.test', source, binding, now)).toBe(false);
  });
  it('bounds the freshness clock and keeps available-empty distinct from unavailable', () => {
    expect(schema('AgentChannelAddressBookSchema').safeParse({ ...book, emails: [] }).success).toBe(true);
    expect(schema('AgentChannelAddressBookSchema').safeParse({ ...book, status: 'unavailable', version: null, observedAt: null, emails: null }).success).toBe(true);
    for (const clock of [NaN, Infinity]) expect(call('isEmailSenderAdmitted', email, 'allowed@example.test', book, binding, clock)).toBe(false);
    for (const age of [-1, NaN, Infinity]) expect(call('isEmailSenderAdmitted', email, 'allowed@example.test', book, binding, now, age)).toBe(false);
    expect(call('isEmailSenderAdmitted', email, 'allowed@example.test', book, binding, now + 60_000)).toBe(true);
    expect(call('isEmailSenderAdmitted', email, 'allowed@example.test', book, binding, now + 60_001)).toBe(false);
  });
  it.each([
    { ...book, version: null }, { ...book, observedAt: null }, { ...book, emails: null },
    { ...book, status: 'partial' }, { ...book, emails: ['A@example.test', 'a@example.test'] },
    { ...book, emails: ['invalid'] }, { ...book, credentials: {} }, { ...book, status: 'unknown', emails: null }, { ...book, observedAt: 'not-a-date' },
    { ...book, emails: Array.from({ length: 2049 }, (_, i) => `s${i}@example.test`) },
  ])('rejects a false complete address-book or leaked data %j', source => {
    expect(schema('AgentChannelAddressBookSchema').safeParse(source).success).toBe(false);
  });
});

describe('C1 additive channel configuration', () => {
  it('rejects unrecognized policy-envelope fields instead of stripping them', () => {
    expect(schema('AgentChannelAccessConfigurationSchema').safeParse({ desiredPolicy: telegram, appliedPolicy: null, extra: true }).success).toBe(false);
  });
  it('preserves old configurations and validates new desired/applied policy', () => {
    const current = configuration();
    expect(Agent.AgentChannelConfigurationSchema.safeParse(current).success).toBe(true);
    const { access: _access, ...legacy } = current;
    expect(Agent.AgentChannelConfigurationSchema.safeParse(legacy).success).toBe(true);
    expect(Agent.AgentChannelConfigurationSchema.parse(legacy)).not.toHaveProperty('access');
  });
  it.each([
    { ...configuration(), access: { desiredPolicy: email, appliedPolicy: null } },
    { ...configuration(), access: { desiredPolicy: telegram, appliedPolicy: email } },
    { ...configuration(), applied: null, observation: null, observedAt: null },
    { ...configuration(), applied: { version: 5, state: 'active' } },
  ])('rejects wrong-door, orphan or conflicting same-version policy %j', input => {
    expect(Agent.AgentChannelConfigurationSchema.safeParse(input).success).toBe(false);
  });
  it('never calls an unobserved policy applied and preserves the effective previous policy', () => {
    const pending = { ...configuration(), access: { desiredPolicy: telegram, appliedPolicy: null }, applied: { version: 5, state: 'active' } };
    expect(Agent.AgentChannelConfigurationSchema.safeParse(pending).success).toBe(true);
    expect(Agent.isChannelConfigurationApplied(pending)).toBe(false);
    const applied = { ...pending, access: { desiredPolicy: telegram, appliedPolicy: telegram } };
    expect(Agent.isChannelConfigurationApplied(applied)).toBe(true);
    expect(Agent.AgentChannelConfigurationSchema.parse(configuration()).access?.appliedPolicy).toEqual({ ...telegram, chats: [] });
  });
  it('validates the additive field through the canonical context reader and writer', () => {
    const other = { ...configuration(), kind: 'email', resource: null, applied: null, observation: null, observedAt: null,
      desired: { version: 5, state: 'paused' }, access: { desiredPolicy: email, appliedPolicy: null } };
    const context = { ...scope, identity, displayName: 'Synthetic', workspacePath: '/synthetic/workspace', registryPath: '/synthetic/registry',
      credentials: {}, llmConfig: { provider: 'openai', model: 'synthetic' }, telegramAllowFrom: ['123'], channelConfigurations: [configuration(), other] };
    for (const parser of [Agent.AgentContextWithChannelsSchema, Agent.AgentContextWithChannelsWriteSchema]) {
      const result = parser.safeParse(context); expect(result.success).toBe(true);
      expect(result.data?.channelConfigurations?.[0]?.access?.desiredPolicy).toEqual(telegram);
      expect(parser.safeParse({ ...context, channelConfigurations: [{ ...configuration(), access: { desiredPolicy: {}, appliedPolicy: null } }, other] }).success).toBe(false);
    }
  });
});
