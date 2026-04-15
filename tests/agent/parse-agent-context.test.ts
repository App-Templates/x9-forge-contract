import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseAgentContext } from '../../src/agent/parse-agent-context.js';

function loadFixture(name: string): unknown {
  const path = join(import.meta.dirname, 'fixtures', name);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

describe('parseAgentContext', () => {
  it('parses production-sample fixture', () => {
    const raw = loadFixture('context-production-sample.json');
    const result = parseAgentContext(raw);
    expect(result.agentId).toBe('agent-stefano-prod-001');
    expect(result.ownerId).toBe('owner_clerk_abc123');
    expect(result.credentials.OPENAI_API_KEY).toBe('sk-test-placeholder');
    expect(result.credentials.TELEGRAM_BOT_TOKEN).toBe('123456789:ABCdefGHI_placeholder');
    expect(result.llmConfig.provider).toBe('openai');
    expect(result.llmConfig.model).toBe('gpt-4.1-mini');
    expect(result.telegramAllowFrom).toEqual(['123456789', '987654321']);
  });

  it('parses minimal fixture (wildcard telegramAllowFrom)', () => {
    const raw = loadFixture('context-minimal.json');
    const result = parseAgentContext(raw);
    expect(result.agentId).toBe('agent-minimal-001');
    expect(result.telegramAllowFrom).toEqual(['*']);
  });

  it('parses netatmo fixture (dynamic credential keys)', () => {
    const raw = loadFixture('context-netatmo.json');
    const result = parseAgentContext(raw);
    expect(result.agentId).toBe('agent-netatmo-001');
    expect(result.credentials['NETATMO_CLIENT_ID']).toBe('netatmo-client-placeholder');
    expect(result.credentials['NETATMO_CLIENT_SECRET']).toBe('netatmo-secret-placeholder');
  });

  it('preserves passthrough Runtime fields at runtime', () => {
    const raw = loadFixture('context-production-sample.json');
    const result = parseAgentContext(raw);
    // Runtime fields pass through but are not in the TS type
    const asRecord = result as Record<string, unknown>;
    expect(asRecord['workspacePath']).toBe('/data/workspaces/agent-stefano-prod-001');
    expect(asRecord['registryPath']).toBe('/data/agents/agent-stefano-prod-001/registry.json');
    expect(asRecord['telegramBotToken']).toBe('123456789:ABCdefGHI_placeholder');
    expect(asRecord['displayName']).toBe('Stefano Agent');
  });

  it('throws on invalid input (missing agentId)', () => {
    expect(() => parseAgentContext({ ownerId: 'test' })).toThrow();
  });

  it('throws on non-object input', () => {
    expect(() => parseAgentContext('not an object')).toThrow();
    expect(() => parseAgentContext(null)).toThrow();
    expect(() => parseAgentContext(42)).toThrow();
  });
});
