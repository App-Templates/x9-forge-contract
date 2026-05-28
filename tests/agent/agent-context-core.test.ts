import { describe, it, expect } from 'vitest';
import {
  LlmConfigSchema,
  AgentContextCoreSchema,
} from '../../src/agent/agent-context-core.js';

const VALID_CORE = {
  agentId: 'agent-stefano-prod-001',
  ownerId: 'owner_clerk_abc123',
  credentials: {
    OPENAI_API_KEY: 'sk-test',
    TELEGRAM_BOT_TOKEN: '123:abc',
  },
  llmConfig: { provider: 'openai', model: 'gpt-4.1-mini' },
  telegramAllowFrom: ['123456789'],
};

describe('LlmConfigSchema', () => {
  it('parses valid config', () => {
    const result = LlmConfigSchema.parse({ provider: 'openai', model: 'gpt-4.1-mini' });
    expect(result.provider).toBe('openai');
    expect(result.model).toBe('gpt-4.1-mini');
  });

  it('rejects empty provider', () => {
    expect(() => LlmConfigSchema.parse({ provider: '', model: 'gpt-4o' })).toThrow();
  });

  it('rejects empty model', () => {
    expect(() => LlmConfigSchema.parse({ provider: 'openai', model: '' })).toThrow();
  });
});

describe('AgentContextCoreSchema', () => {
  it('parses valid Core fields', () => {
    const result = AgentContextCoreSchema.parse(VALID_CORE);
    expect(result.agentId).toBe('agent-stefano-prod-001');
    expect(result.ownerId).toBe('owner_clerk_abc123');
    expect(result.credentials.OPENAI_API_KEY).toBe('sk-test');
    expect(result.llmConfig.provider).toBe('openai');
    expect(result.telegramAllowFrom).toEqual(['123456789']);
  });

  it('preserves Runtime fields via passthrough', () => {
    const withRuntime = {
      ...VALID_CORE,
      workspacePath: '/data/workspaces/agent-stefano-prod-001',
      registryPath: '/data/agents/agent-stefano-prod-001/registry.json',
      telegramBotToken: '123:abc',
      displayName: 'Stefano Agent',
    };
    const result = AgentContextCoreSchema.parse(withRuntime);
    // Runtime fields exist at runtime but not in the TS type
    expect((result as Record<string, unknown>)['workspacePath']).toBe(
      '/data/workspaces/agent-stefano-prod-001',
    );
    expect((result as Record<string, unknown>)['displayName']).toBe('Stefano Agent');
  });

  it('accepts empty credentials', () => {
    const result = AgentContextCoreSchema.parse({
      ...VALID_CORE,
      credentials: {},
    });
    expect(result.credentials).toEqual({});
  });

  it('accepts wildcard telegramAllowFrom', () => {
    const result = AgentContextCoreSchema.parse({
      ...VALID_CORE,
      telegramAllowFrom: ['*'],
    });
    expect(result.telegramAllowFrom).toEqual(['*']);
  });

  it('rejects missing agentId', () => {
    const { agentId: _agentId, ...rest } = VALID_CORE;
    expect(() => AgentContextCoreSchema.parse(rest)).toThrow();
  });

  it('rejects missing credentials', () => {
    const { credentials: _credentials, ...rest } = VALID_CORE;
    expect(() => AgentContextCoreSchema.parse(rest)).toThrow();
  });

  it('rejects missing llmConfig', () => {
    const { llmConfig: _llmConfig, ...rest } = VALID_CORE;
    expect(() => AgentContextCoreSchema.parse(rest)).toThrow();
  });

  // X9-CORE-3 v1.10.0 — inboundForwardUrl per-agent override

  it('accepts a valid HTTPS inboundForwardUrl', () => {
    const result = AgentContextCoreSchema.parse({
      ...VALID_CORE,
      inboundForwardUrl: 'https://inbound-router.example.test/internal/turn',
    });
    expect(result.inboundForwardUrl).toBe(
      'https://inbound-router.example.test/internal/turn',
    );
  });

  it('accepts an HTTP inboundForwardUrl (Docker network address)', () => {
    const result = AgentContextCoreSchema.parse({
      ...VALID_CORE,
      inboundForwardUrl: 'http://inbound-router-svc:3000/inbound',
    });
    expect(result.inboundForwardUrl).toBe('http://inbound-router-svc:3000/inbound');
  });

  it('accepts null inboundForwardUrl (Forge-level "no override")', () => {
    const result = AgentContextCoreSchema.parse({
      ...VALID_CORE,
      inboundForwardUrl: null,
    });
    expect(result.inboundForwardUrl).toBeNull();
  });

  it('accepts absent inboundForwardUrl (back-compat with v1.9.0 context.json)', () => {
    const result = AgentContextCoreSchema.parse(VALID_CORE);
    expect(result.inboundForwardUrl).toBeUndefined();
  });

  it('rejects a malformed inboundForwardUrl', () => {
    expect(() =>
      AgentContextCoreSchema.parse({
        ...VALID_CORE,
        inboundForwardUrl: 'not-a-url',
      }),
    ).toThrow();
  });

  it('rejects an empty-string inboundForwardUrl', () => {
    expect(() =>
      AgentContextCoreSchema.parse({
        ...VALID_CORE,
        inboundForwardUrl: '',
      }),
    ).toThrow();
  });
});
