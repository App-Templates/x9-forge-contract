import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ListAgentsResponseSchema, ReloadAgentResponseSchema, StopAgentResponseSchema, VaultResolveResponseSchema, capToolCallContract } from '../../src/http/index.js';
import { ToolCallRequestSchema, CapabilityRegistryEntrySchema } from '../../src/capability/index.js';
import { VoiceCallStartResponseSchema } from '../../src/capability/voice/index.js';
import { AgentContextFileSchema } from '../../src/agent/index.js';

/**
 * BRIDGE-131 compatibility guard: every public symbol shipped by 1.30.0 (snapshot taken from the 1.30 dist before
 * any 1.31 change) is still exported from the same source subpath, and 1.30 payloads still validate unchanged.
 */
const root = new URL('../../', import.meta.url);
const baseline = JSON.parse(readFileSync(new URL('bridge-130-exports.json', import.meta.url), 'utf8')) as Record<string, string[]>;
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8')) as { zshy: { exports: Record<string, string> } };

describe('1.30 public exports are preserved', () => {
  it('covers every 1.30 subpath', () => {
    expect(Object.keys(pkg.zshy.exports)).toEqual(expect.arrayContaining(Object.keys(baseline)));
  });
  for (const [subpath, symbols] of Object.entries(baseline)) {
    it('keeps all ' + symbols.length + ' symbols of ' + subpath, async () => {
      const mod = await import(new URL(pkg.zshy.exports[subpath]!, root).href) as Record<string, unknown>;
      const missing = symbols.filter((name) => !(name in mod));
      expect(missing).toEqual([]);
    });
  }
});

describe('1.30 payloads still validate unchanged', () => {
  it('legacy and canonical agent list', () => {
    const legacy = { agents: [{ agentId: 'x9', displayName: 'Master Chief', ownerId: 'owner-1', runtimeStatus: 'bot-less', loaded: true }] };
    expect(ListAgentsResponseSchema.parse(legacy)).toEqual(legacy);
    const canonical = {
      agents: [{ ...legacy.agents[0], identity: { managementAgentId: 'x9-staging', runtimeAgentId: 'x9' },
        runtime: { state: 'active', loadState: 'loaded', channelsComplete: true, channels: [{ channelId: 'web', kind: 'web', state: 'loaded', loaded: true, readiness: 'ready' }] } }],
      source: { authority: 'x9', availability: 'available', completeness: 'complete', observedAt: '2026-10-07T00:00:00Z' },
    };
    expect(ListAgentsResponseSchema.parse(canonical)).toEqual(canonical);
  });

  it('reload and stop responses', () => {
    expect(ReloadAgentResponseSchema.parse({ ok: true, agentId: 'x9', telegram: 'skipped' })).toEqual({ ok: true, agentId: 'x9', telegram: 'skipped' });
    expect(StopAgentResponseSchema.parse({ ok: true, agentId: 'x9' })).toEqual({ ok: true, agentId: 'x9' });
  });

  it('tool call with and without per-call scope', () => {
    const bare = { callId: 'c1', tool: 'news_digest', input: {}, agentId: 'x9', sessionId: 's1' };
    expect(ToolCallRequestSchema.parse(bare)).toEqual(bare);
    const scoped = { ...bare, userId: 'u1', tenantId: '1', ownerId: '2', credentials: { OPENAI_API_KEY: 'k' } };
    expect(capToolCallContract.bodySchema.parse(scoped)).toEqual(scoped);
  });

  it('vault resolve, registry entry, voice call start, context file', () => {
    expect(VaultResolveResponseSchema.parse({ ok: true, key: 'K', value: 'v', tier: 'owner' }).tier).toBe('owner');
    expect(CapabilityRegistryEntrySchema.parse({ name: 'voice', enabled: true, host: 'cap-voice', port: 3000, version: '1.0.0' }).name).toBe('voice');
    expect(VoiceCallStartResponseSchema.parse({ call_id: 'c', conversation_id: 'v', started_at: '2026-10-07T00:00:00Z' }).provider).toBeUndefined();
    expect(AgentContextFileSchema.safeParse({}).success).toBe(false);
  });
});
