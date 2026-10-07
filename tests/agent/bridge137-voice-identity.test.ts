import { describe, expect, it } from 'vitest';
import * as agent from '../../src/agent/index.js';
import { channel, context } from './r2-fixtures.js';

const pair = { managementAgentId: '101', runtimeAgentId: 'alice' };
const base = { ...context, agentId: pair.runtimeAgentId };
const voice = (id = pair.managementAgentId) => ({ agentId: id, versions: { desired: 3, applied: 2, failed: null }, desired: { mode: 'text-only' }, applied: { mode: 'voice', provider: 'openai_live', protocol: 'websocket', transports: ['phone'], voiceId: 'synthetic-voice', model: 'synthetic-model' } });
function ownChannel(kind: 'telegram' | 'email', managementAgentId = pair.managementAgentId) {
  const old = channel(kind), scope = { ...old.scope, agentId: base.agentId }, identity = { ...pair, managementAgentId };
  return { ...old, scope, identity, resource: { ...old.resource, scope, identity, resource: { ...old.resource.resource, agent_id: base.agentId } } };
}
const channels = () => [ownChannel('telegram'), ownChannel('email')];
const schemas = [
  ['read', agent.AgentContextWithChannelsSchema], ['write', agent.AgentContextWithChannelsWriteSchema],
  ['workspace read', agent.AgentContextWithWorkspaceSchema], ['workspace write', agent.AgentContextWithWorkspaceWriteSchema],
] as const;
function management(ctx: unknown) {
  const helper = Reflect.get(agent, 'managementAgentIdOf') as ((value: unknown) => string | null) | undefined;
  expect(typeof helper).toBe('function'); return helper!(ctx);
}
for (const [label, schema] of schemas) {
  describe(`canonical voice identity ${label}`, () => {
    it('preserves the legacy 1.34 context without an invented identity', () => {
      const result = schema.safeParse(base); expect(result.success).toBe(true);
      if (result.success) { expect(result.data).toEqual(base); expect(result.data).not.toHaveProperty('identity'); }
    });
    it('preserves the legacy runtime-bound voice without a management source', () => {
      const result = schema.safeParse({ ...base, voiceConfiguration: voice(base.agentId) }); expect(result.success).toBe(true);
      if (result.success) expect(result.data.voiceConfiguration).toEqual(voice(base.agentId));
    });
    it('rejects a foreign legacy voice without a management source', () => expect(schema.safeParse({ ...base, voiceConfiguration: voice('foreign') }).success).toBe(false));
    it('accepts and retains management101/runtimealice without requiring channels', () => {
      const result = schema.safeParse({ ...base, identity: pair, voiceConfiguration: voice() }); expect(result.success).toBe(true);
      if (result.success) { expect(result.data.identity).toEqual(pair); expect(result.data.voiceConfiguration).toEqual(voice()); }
    });
    it('accepts explicit identity before any voice is applied', () => {
      const result = schema.safeParse({ ...base, identity: pair }); expect(result.success).toBe(true);
      if (result.success) expect(result.data.identity).toEqual(pair);
    });
    it('derives the management binding from concordant channels', () => {
      const result = schema.safeParse({ ...base, channelConfigurations: channels(), voiceConfiguration: voice() }); expect(result.success).toBe(true);
      if (result.success) expect(result.data.voiceConfiguration).toEqual(voice());
    });
    it('accepts identity and channels only when they agree', () => expect(schema.safeParse({ ...base, identity: pair, channelConfigurations: channels(), voiceConfiguration: voice() }).success).toBe(true));
    it('rejects explicit runtime identity outside context', () => expect(schema.safeParse({ ...base, identity: { managementAgentId: base.agentId, runtimeAgentId: 'foreign' }, voiceConfiguration: voice(base.agentId) }).success).toBe(false));
    it.each(['101', null, {}, { managementAgentId: '101' }, { ...pair, managementAgentId: '' }])('validates optional identity with the canonical schema %#', identity => {
      const field = Reflect.get(schema.shape, 'identity') as typeof agent.AgentRuntimeIdentitySchema | undefined;
      expect(field).toBeDefined(); expect(field!.safeParse(identity).success).toBe(false);
      expect(schema.safeParse({ ...base, identity }).success).toBe(false);
    });
    it('rejects runtime ID used as voice management ID when identity exists', () => expect(schema.safeParse({ ...base, identity: pair, voiceConfiguration: voice(base.agentId) }).success).toBe(false));
    it('rejects a foreign voice management ID', () => expect(schema.safeParse({ ...base, identity: pair, voiceConfiguration: voice('999') }).success).toBe(false));
    it('rejects voice ID outside the concordant channel management identity', () => expect(schema.safeParse({ ...base, channelConfigurations: channels(), voiceConfiguration: voice(base.agentId) }).success).toBe(false));
    it('rejects discordant channel management IDs even without voice', () => expect(schema.safeParse({ ...base, channelConfigurations: [ownChannel('telegram'), ownChannel('email', '999')] }).success).toBe(false));
    it('rejects explicit identity conflicting with all channels without voice', () => expect(schema.safeParse({ ...base, identity: pair, channelConfigurations: [ownChannel('telegram', '999'), ownChannel('email', '999')] }).success).toBe(false));
    it('never relaxes channel ownership for a valid management identity', () => {
      const invalid = ownChannel('telegram'); invalid.scope = { ...invalid.scope, ownerId: 'foreign' };
      invalid.resource.scope = { ...invalid.resource.scope, ownerId: 'foreign' };
      expect(schema.safeParse({ ...base, identity: pair, channelConfigurations: [invalid, ownChannel('email')] }).success).toBe(false);
    });
    it('selects the explicit management ID through the public helper', () => {
      const result = schema.safeParse({ ...base, identity: pair }); expect(result.success).toBe(true);
      if (result.success) expect(management(result.data)).toBe('101');
    });
    it('selects the concordant channel ID through the public helper', () => {
      const result = schema.safeParse({ ...base, channelConfigurations: channels() }); expect(result.success).toBe(true);
      if (result.success) expect(management(result.data)).toBe('101');
    });
    it('returns null instead of guessing management from a bare context', () => {
      const result = schema.safeParse(base); expect(result.success).toBe(true);
      if (result.success) expect(management(result.data)).toBeNull();
    });
    it('does not treat a legacy voice ID as a canonical management source', () => {
      const result = schema.safeParse({ ...base, voiceConfiguration: voice(base.agentId) }); expect(result.success).toBe(true);
      if (result.success) expect(management(result.data)).toBeNull();
    });
  });
}
