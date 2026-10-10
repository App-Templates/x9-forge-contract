import { describe, expect, it } from 'vitest';
import * as http from '../../src/http/index.js';
import { OPENAI_LIVE_MODEL } from '../../src/capability/voice/index.js';

const api = http;
const settings = { mode: 'voice', provider: 'openai_live', protocol: 'websocket', transports: ['phone'], voiceId: 'marin', model: OPENAI_LIVE_MODEL };
const config = (agentId: string) => ({ agentId, versions: { desired: 1, applied: 1, failed: null }, desired: settings, applied: settings });
const source = (over: Record<string, unknown> = {}) => ({
  agentId: 'x9', ownerId: '1', tenantId: '1',
  identity: { managementAgentId: 'x9-staging', runtimeAgentId: 'x9', vaultAgentId: 1 },
  displayName: 'X9', voiceConfiguration: config('x9-staging'), ...over,
});

describe('applied voice source of a loaded agent (agent-core → capability)', () => {
  it('exports the authenticated contract, addressed by the RUNTIME id', () => {
    expect(api.internalAgentVoiceSourceContract.method).toBe('GET');
    expect(api.internalAgentVoiceSourceContract.authType).toBe('secret');
    expect(api.internalAgentVoiceSourceContract.path).toBe('/internal/agents/:agentId/voice-source');
    expect(api.internalAgentVoiceSourcePath('x9')).toBe('/internal/agents/x9/voice-source');
    expect(() => api.internalAgentVoiceSourcePath('../other')).toThrow();
  });

  it('answers the same shape for the primary agent (from env) and for an agent from a context file', () => {
    expect(api.AgentVoiceSourceSchema.safeParse(source()).success).toBe(true);
    const ordinary = source({
      agentId: 'alpha', ownerId: '2', identity: { managementAgentId: 'alpha', runtimeAgentId: 'alpha', vaultAgentId: 40 },
      displayName: 'Alpha', voiceConfiguration: config('alpha'), workspacePath: '/data/agents/alpha/workspace',
    });
    expect(api.AgentVoiceSourceSchema.safeParse(ordinary).success).toBe(true);
  });

  it('says «unconfigured» with null, never an invented default', () => {
    expect(api.AgentVoiceSourceSchema.safeParse(source({ voiceConfiguration: null })).success).toBe(true);
    expect(api.AgentVoiceSourceSchema.safeParse(source({ voiceConfiguration: undefined })).success).toBe(false);
  });

  it.each(['credentials', 'telegramBotToken', 'context', 'env', 'OPENAI_API_KEY', 'internalSecret'])('rejects secret-bearing or foreign field %s', field => {
    expect(api.AgentVoiceSourceSchema.safeParse(source({ [field]: 'fixture' })).success).toBe(false);
  });

  it.each([
    ['no identity', { identity: undefined }],
    ['no tenant', { tenantId: '' }],
    ['no owner', { ownerId: undefined }],
    ['blank display name', { displayName: '   ' }],
    ['applied without version', { voiceConfiguration: { ...config('x9-staging'), versions: { desired: 1, applied: null, failed: null } } }],
    ['settings outside the contract', { voiceConfiguration: { ...config('x9-staging'), applied: { ...settings, transports: [] } } }],
  ])('rejects %s', (_label, over) => {
    expect(api.AgentVoiceSourceSchema.safeParse(source(over)).success).toBe(false);
  });
});

it('loads the actual compiled ESM public contract', async () => {
  const compiled = await import('@x9-forge/contracts/http');
  expect(compiled.internalAgentVoiceSourcePath?.('x9')).toBe('/internal/agents/x9/voice-source');
  expect(compiled.AgentVoiceSourceSchema?.safeParse(source()).success).toBe(true);
});
