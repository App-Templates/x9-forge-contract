import { describe, expect, it } from 'vitest';
import * as http from '../../src/http/index.js';
import { AGENT_CREDENTIAL_SERVICE_KEYS, getAgentCredentialServiceMetadata } from '../../src/agent/agent-credential-services.js';
import { PLATFORM_INTERNAL_CREDENTIAL_KEYS } from '../../src/vault/platform-internal-credentials.js';
const api = http;
const identity = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'agent-a' };
const request = { requestId: 'request-1', identity, execution: 'scheduler_telegram_text', input: { chatId: 123, text: 'hello' } };
describe('bounded internal agent execution', () => {
  it('exports the authenticated canonical path and strict body', () => {
    expect(api.internalAgentToolDispatchContract?.authType).toBe('secret');
    expect(api.internalAgentToolDispatchPath?.('agent-a')).toBe('/internal/agents/agent-a/tools/dispatch');
    expect(api.InternalAgentToolDispatchRequestSchema?.safeParse(request).success).toBe(true);
  });
  it.each(['credentials', 'context', 'env', 'targetUrl', 'tool', 'keys'])('rejects caller %s', key => {
    expect(api.InternalAgentToolDispatchRequestSchema).toBeDefined();
    expect(api.InternalAgentToolDispatchRequestSchema.safeParse({ ...request, [key]: {} }).success).toBe(false);
  });
  it.each(['credentials', 'context', 'url'])('rejects nested input %s', key => {
    expect(api.InternalAgentToolDispatchRequestSchema).toBeDefined();
    expect(api.InternalAgentToolDispatchRequestSchema.safeParse({ ...request, input: { ...request.input, [key]: {} } }).success).toBe(false);
  });
  it.each(['research_start', 'arbitrary_tool', 'https://example.invalid'])('rejects unregistered execution %s', execution => {
    expect(api.InternalAgentToolDispatchRequestSchema).toBeDefined();
    expect(api.InternalAgentToolDispatchRequestSchema.safeParse({ ...request, execution }).success).toBe(false);
  });
  it.each(['tenantId', 'ownerId', 'agentId'])('requires trusted identity %s', field => {
    expect(api.InternalAgentToolDispatchRequestSchema).toBeDefined();
    const bad: Record<string, unknown> = { ...identity }; delete bad[field];
    expect(api.InternalAgentToolDispatchRequestSchema.safeParse({ ...request, identity: bad }).success).toBe(false);
  });
  it('bounds correlation, timeout and path without relaxing identity', () => {
    expect(api.InternalAgentToolDispatchRequestSchema).toBeDefined();
    expect(api.InternalAgentToolDispatchRequestSchema.safeParse({ ...request, timeoutMs: 30_000 }).success).toBe(true);
    for (const patch of [{ requestId: '' }, { requestId: 'x'.repeat(257) }, { timeoutMs: 300_001 }, { identity: { ...identity, credentials: {} } }]) {
      expect(api.InternalAgentToolDispatchRequestSchema.safeParse({ ...request, ...patch }).success).toBe(false);
    }
    expect(() => api.internalAgentToolDispatchPath('../other')).toThrow();
  });
  it('returns only canonical result and rejects nested credential material', () => {
    expect(api.InternalAgentToolDispatchResponseSchema).toBeDefined();
    const result = { callId: 'request-1', status: 'success', output: { ticket: 'opaque' } };
    expect(api.InternalAgentToolDispatchResponseSchema.safeParse(result).success).toBe(true);
    for (const patch of [{ credentials: {} }, { context: {} }, { extra: 1 }, { output: { nested: [{ credentials: {} }] } }, { output: { OPENAI_API_KEY: 'fixture' } }]) {
      expect(api.InternalAgentToolDispatchResponseSchema.safeParse({ ...result, ...patch }).success).toBe(false);
    }
  });
  it('registers only the eighteen internal fixed actions with native call paths', () => {
    expect(api.INTERNAL_AGENT_EXECUTIONS).toBeDefined();
    const entries = Object.entries(api.INTERNAL_AGENT_EXECUTIONS) as Array<[string, (typeof api.INTERNAL_AGENT_EXECUTIONS)[keyof typeof api.INTERNAL_AGENT_EXECUTIONS]]>;
    expect(entries).toHaveLength(18);
    expect(entries.every(([, entry]) => entry.modelVisible === false && (entry.target === 'builtin' || entry.path === api.capToolCallPath(entry.tool)))).toBe(true);
    expect(api.INTERNAL_AGENT_EXECUTIONS.glasses_session_admit.credentialKeys).toEqual(['ELEVENLABS_API_KEY']);
    expect(api.INTERNAL_AGENT_EXECUTIONS.glasses_session_admit.identifierKeys).toEqual(['ELEVENLABS_VOICE_ID']);
    expect(api.INTERNAL_AGENT_EXECUTIONS.glasses_session_admit.settingKeys).toEqual(['ELEVENLABS_MODEL_ID']);
    expect(entries.every(([, entry]) => entry.credentialKeys.every((key: string) => !key.includes('INTERNAL') && key !== 'GLASSES_AUTH_TOKEN'))).toBe(true);
  });
});

it('loads the actual compiled ESM public contract', async () => {
  const compiled = await import('@x9-forge/contracts/http');
  expect(compiled.internalAgentToolDispatchContract?.path).toBe('/internal/agents/:agentId/tools/dispatch');
  expect(compiled.InternalAgentToolDispatchRequestSchema?.safeParse(request).success).toBe(true);
  expect(compiled.INTERNAL_AGENT_EXECUTIONS?.scheduler_telegram_text?.target).toBe('builtin');
});

it('freezes every internal credential, identifier and setting allowlist', () => {
  for (const entry of Object.values(api.INTERNAL_AGENT_EXECUTIONS)) {
    expect(Object.isFrozen(entry)).toBe(true);
    for (const values of [entry.credentialKeys, entry.identifierKeys, entry.settingKeys]) {
      expect(Object.isFrozen(values)).toBe(true);
      expect(() => (values as unknown as string[]).push('INTERNAL_SECRET')).toThrow();
    }
  }
});
it('excludes public credentials from results while preserving settings and ordinary output', () => {
  const result = { callId: 'r', status: 'success', output: {} };
  expect(api.InternalAgentToolDispatchResponseSchema.safeParse({ ...result, output: { NETATMO_EMAIL: 'fixture@example.invalid' } }).success).toBe(false);
  expect(api.InternalAgentToolDispatchResponseSchema.safeParse({ ...result, output: { OPENAI_LIVE_VOICE: 'marin', count: 1 } }).success).toBe(true);
});

const forbiddenCanonicalKeys = [...AGENT_CREDENTIAL_SERVICE_KEYS.filter(key => getAgentCredentialServiceMetadata(key)?.kind === 'credential'), ...PLATFORM_INTERNAL_CREDENTIAL_KEYS];
function assertAllCanonicalCredentialResultsRejected(schema: typeof api.InternalAgentToolDispatchResponseSchema): void {
  for (const key of forbiddenCanonicalKeys) {
    const result = { callId: 'r', status: 'success', output: {} };
    expect(schema.safeParse({ ...result, [key]: 'fixture' }).success, `root result rejects canonical ${key}`).toBe(false);
    expect(schema.safeParse({ ...result, output: { [key]: 'fixture' } }).success, `output rejects canonical ${key}`).toBe(false);
    expect(schema.safeParse({ ...result, output: { nested: [{ [key]: 'fixture' }] } }).success, `nested output rejects canonical ${key}`).toBe(false);
  }
}
it('rejects the complete canonical credential and platform-internal catalog in source results', () => {
  assertAllCanonicalCredentialResultsRejected(api.InternalAgentToolDispatchResponseSchema);
});
it('rejects the complete canonical credential and platform-internal catalog in compiled ESM results', async () => {
  const compiled = await import('@x9-forge/contracts/http');
  assertAllCanonicalCredentialResultsRejected(compiled.InternalAgentToolDispatchResponseSchema);
});

it('admits native Briefing Calendar dependencies without inventing recipient credentials', () => {
 const entry = api.INTERNAL_AGENT_EXECUTIONS.scheduler_briefing_generate;
 expect(entry.credentialKeys).toEqual(expect.arrayContaining(['GOOGLE_CALENDAR_CLIENT_ID','GOOGLE_CALENDAR_CLIENT_SECRET','GOOGLE_CALENDAR_REFRESH_TOKEN']));
 expect(entry.identifierKeys).not.toContain('TELEGRAM_CHAT_ID');
 expect(entry.modelVisible).toBe(false);
});

it('preserves the selected TTS provider for native scheduled Briefing', () => {
 expect(api.INTERNAL_AGENT_EXECUTIONS.scheduler_briefing_generate.settingKeys).toContain('TTS_PROVIDER');
});

describe('service-to-capability executions for the direct callers (cap-voice, cap-security)', () => {
  const E = api.INTERNAL_AGENT_EXECUTIONS as Record<string, { target: string; capability: string; tool: string; path: string; credentialKeys: readonly string[]; identifierKeys: readonly string[]; settingKeys: readonly string[]; inputSchema: { safeParse(v: unknown): { success: boolean } }; modelVisible: boolean }>;
  const GCAL = ['GOOGLE_CALENDAR_CLIENT_ID', 'GOOGLE_CALENDAR_CLIENT_SECRET', 'GOOGLE_CALENDAR_REFRESH_TOKEN'];
  const NETATMO = ['NETATMO_CLIENT_ID', 'NETATMO_CLIENT_SECRET', 'NETATMO_ACCESS_TOKEN', 'NETATMO_REFRESH_TOKEN'];
  const expected: Array<[string, string, string, string[], string[], unknown]> = [
    ['voice_calendar_week', 'calendar', 'calendar_week', GCAL, [], { targetDate: '2026-10-12' }],
    ['voice_calendar_create', 'calendar', 'calendar_create', GCAL, [], { summary: 'Hold', startTime: '2026-10-12T10:00:00+02:00', endTime: '2026-10-12T11:00:00+02:00' }],
    ['voice_calendar_update', 'calendar', 'calendar_update', GCAL, [], { eventId: 'evt', changes: { summary: 'New' } }],
    ['voice_calendar_delete', 'calendar', 'calendar_delete', GCAL, [], { eventId: 'evt' }],
    ['voice_email_send', 'email', 'email_send', ['AGENTMAIL_API_KEY'], ['AGENTMAIL_INBOX_ID'], { to: 'a@example.invalid', subject: 's', text: 't' }],
    ['voice_contacts_search', 'contacts', 'contacts_search', ['GOOGLE_CONTACTS_CLIENT_ID', 'GOOGLE_CONTACTS_CLIENT_SECRET', 'GOOGLE_CONTACTS_REFRESH_TOKEN'], [], { query: 'Mario' }],
    ['voice_schedule_create', 'scheduler', 'schedule_create', [], [], { type: 'one_shot', scheduledFor: '2026-10-12T10:00:00+02:00', action: 'telegram_text', recipient: { name: 'Mario', telegramChatId: 1 }, brief: 'ricorda' }],
    ['security_light_on_group', 'netatmo', 'light_on_group', NETATMO, [], { group: 'esterno' }],
    ['security_light_on', 'netatmo', 'light_on', NETATMO, [], { name: 'Patio Auto' }],
    ['security_come_home', 'netatmo', 'come_home', [...NETATMO, 'NETATMO_EMAIL', 'NETATMO_PASSWORD'], [], {}],
  ];
  it.each(expected)('%s is a fixed, model-invisible adapter for %s.%s with exactly its keys', (name, capability, tool, credentials, identifiers, input) => {
    const entry = E[name]!;
    expect(entry).toBeDefined();
    expect([entry.target, entry.capability, entry.tool, entry.path, entry.modelVisible]).toEqual(['capability', capability, tool, api.capToolCallPath(tool), false]);
    expect([...entry.credentialKeys]).toEqual(credentials);
    expect([...entry.identifierKeys]).toEqual(identifiers);
    expect([...entry.settingKeys]).toEqual([]);
    expect(api.InternalAgentToolDispatchRequestSchema.safeParse({ ...request, execution: name, input }).success).toBe(true);
  });
  it.each(expected)('%s rejects caller-supplied credentials, urls and unknown fields', (name, _c, _t, _k, _i, input) => {
    for (const extra of [{ credentials: {} }, { url: 'https://example.invalid' }, { calendarKey: 'x' }, { GOOGLE_CALENDAR_REFRESH_TOKEN: 'fixture' }]) {
      expect(api.InternalAgentToolDispatchRequestSchema.safeParse({ ...request, execution: name, input: { ...(input as object), ...extra } }).success).toBe(false);
    }
  });
  it('rejects malformed inputs of the native tool', () => {
    const bad: Array<[string, unknown]> = [
      ['voice_calendar_week', { targetDate: 'tomorrow' }], ['voice_calendar_week', {}],
      ['voice_calendar_create', { summary: '', startTime: 'a', endTime: 'b' }], ['voice_calendar_update', { eventId: 'e', changes: { attendees: ['x'] } }],
      ['voice_calendar_delete', { eventId: '' }], ['voice_email_send', { to: 'not-an-address', subject: 's', text: 't' }],
      ['voice_schedule_create', { type: 'recurring', scheduledFor: 'x', action: 'telegram_text', recipient: { name: 'M' }, brief: 'b' }],
      ['voice_schedule_create', { type: 'one_shot', scheduledFor: 'x', action: 'briefing_generate', recipient: { name: 'M' }, brief: 'b' }],
      ['voice_contacts_search', { query: '' }], ['security_light_on_group', {}], ['security_light_on', { name: '' }], ['security_come_home', { group: 'esterno' }],
    ];
    for (const [execution, input] of bad) {
      expect(api.InternalAgentToolDispatchRequestSchema.safeParse({ ...request, execution, input }).success, execution).toBe(false);
    }
  });
  it('never hands an adapter a key of another service, nor an internal secret', () => {
    for (const [name] of expected) {
      const entry = E[name]!;
      const keys = [...entry.credentialKeys, ...entry.identifierKeys];
      if (keys.length === 0) continue; // keyless: the scheduler only needs the admitted identity
      // One provider per adapter: GOOGLE_CALENDAR_*, GOOGLE_CONTACTS_*, AGENTMAIL_* or NETATMO_*.
      const providers = keys.map(key => /^(GOOGLE_CALENDAR|GOOGLE_CONTACTS|AGENTMAIL|NETATMO)_/.exec(key)?.[1]);
      expect(new Set(providers).size, name).toBe(1);
      expect(providers.every(Boolean), name).toBe(true);
      expect(keys.every(key => !key.includes('INTERNAL') && !key.includes('TELEGRAM')), name).toBe(true);
    }
  });
});
