import { describe, it, expect } from 'vitest';
import {
  AgentContextFileSchema,
  AgentContextRuntimeFieldsSchema,
  hasTelegramBot,
  parseAgentContextFile,
  parseAgentContextFileForWrite,
} from '../../src/agent/agent-context-file.js';

const VALID_FULL = {
  agentId: 'agent-stefano-prod-001',
  ownerId: 'owner_clerk_abc123',
  credentials: {
    OPENAI_API_KEY: 'sk-test',
    TELEGRAM_BOT_TOKEN: '123:abc',
  },
  llmConfig: { provider: 'openai', model: 'gpt-4.1-mini' },
  telegramAllowFrom: ['123456789'],
  workspacePath: '/data/workspaces/agent-stefano-prod-001',
  registryPath: '/data/agents/agent-stefano-prod-001/registry.json',
  telegramBotToken: '123:abc',
  displayName: 'Stefano Prod',
};

describe('AgentContextFileSchema', () => {
  it('parses a full context with telegram bot token', () => {
    const result = AgentContextFileSchema.parse(VALID_FULL);
    expect(result.agentId).toBe('agent-stefano-prod-001');
    expect(result.telegramBotToken).toBe('123:abc');
    expect(result.workspacePath).toBe('/data/workspaces/agent-stefano-prod-001');
  });

  it('F-1: parses a bot-less context with EMPTY telegramBotToken (the Forge writer shape)', () => {
    // Forge deploy.machine.ts writes telegramBotToken: '' when BotFather is
    // skipped/failed — this MUST be a legal context (was the silent-drop bug).
    const result = AgentContextFileSchema.parse({ ...VALID_FULL, telegramBotToken: '' });
    expect(result.telegramBotToken).toBe('');
  });

  it('F-1: parses a bot-less context with ABSENT telegramBotToken', () => {
    const { telegramBotToken: _omit, ...withoutToken } = VALID_FULL;
    const result = AgentContextFileSchema.parse(withoutToken);
    expect(result.telegramBotToken).toBeUndefined();
  });

  it('still rejects missing required runtime fields', () => {
    const { workspacePath: _omit, ...withoutWorkspace } = VALID_FULL;
    expect(() => AgentContextFileSchema.parse(withoutWorkspace)).toThrow();
    expect(() => AgentContextFileSchema.parse({ ...VALID_FULL, displayName: '' })).toThrow();
  });

  it('still rejects invalid Core fields (drift guard: file extends core)', () => {
    expect(() => AgentContextFileSchema.parse({ ...VALID_FULL, agentId: '' })).toThrow();
    expect(() =>
      AgentContextFileSchema.parse({ ...VALID_FULL, llmConfig: { provider: '', model: 'x' } }),
    ).toThrow();
  });

  it('passes through unknown additive fields (forward compat)', () => {
    const result = AgentContextFileSchema.parse({ ...VALID_FULL, futureField: 'ok' });
    expect((result as Record<string, unknown>).futureField).toBe('ok');
  });

  it('runtime-fields schema is a strict subset of the file schema (bridge⊆runtime regression)', () => {
    // every runtime field key must exist on the full file schema
    for (const key of Object.keys(AgentContextRuntimeFieldsSchema.shape)) {
      expect(Object.keys(AgentContextFileSchema.shape)).toContain(key);
    }
  });
});

describe('hasTelegramBot', () => {
  it('true for a real token', () => {
    expect(hasTelegramBot({ telegramBotToken: '123:abc' })).toBe(true);
  });
  it('false for empty string (Forge bot-less writer shape)', () => {
    expect(hasTelegramBot({ telegramBotToken: '' })).toBe(false);
  });
  it('false for whitespace-only', () => {
    expect(hasTelegramBot({ telegramBotToken: '   ' })).toBe(false);
  });
  it('false for absent', () => {
    expect(hasTelegramBot({})).toBe(false);
  });
});

describe('parseAgentContextFile', () => {
  it('returns the parsed full context', () => {
    const result = parseAgentContextFile({ ...VALID_FULL, telegramBotToken: '' });
    expect(result.displayName).toBe('Stefano Prod');
  });
  it('throws on garbage', () => {
    expect(() => parseAgentContextFile(null)).toThrow();
    expect(() => parseAgentContextFile({ agentId: 'x' })).toThrow();
  });
});

describe('parseAgentContextFileForWrite (writer-side, v1.25.0)', () => {
  const withSession = {
    ...VALID_FULL,
    credentials: { ...VALID_FULL.credentials, TELEGRAM_SESSION_STRING: 'userbot-session-value' },
  };

  it('accepts a context without platform-internal credentials', () => {
    expect(parseAgentContextFileForWrite(VALID_FULL).agentId).toBe('agent-stefano-prod-001');
  });

  it('rejects a context that carries the platform Telegram session', () => {
    expect(() => parseAgentContextFileForWrite(withSession)).toThrow(/TELEGRAM_SESSION_STRING/);
  });

  it('never echoes the credential value in the error', () => {
    try {
      parseAgentContextFileForWrite(withSession);
      expect.unreachable();
    } catch (e) {
      expect(String(e)).not.toContain('userbot-session-value');
    }
  });

  it('the reader stays lenient so pre-v1.25 contexts still load', () => {
    expect(parseAgentContextFile(withSession).agentId).toBe('agent-stefano-prod-001');
  });
});
