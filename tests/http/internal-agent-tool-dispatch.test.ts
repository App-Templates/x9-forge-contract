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
  it('registers only eight internal fixed actions with native call paths', () => {
    expect(api.INTERNAL_AGENT_EXECUTIONS).toBeDefined();
    const entries = Object.entries(api.INTERNAL_AGENT_EXECUTIONS) as Array<[string, (typeof api.INTERNAL_AGENT_EXECUTIONS)[keyof typeof api.INTERNAL_AGENT_EXECUTIONS]]>;
    expect(entries).toHaveLength(8);
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
