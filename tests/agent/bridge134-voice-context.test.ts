import { describe, expect, it } from 'vitest';
import * as agent from '../../src/agent/index.js';
import { AgentVoiceSettingsSchema } from '../../src/capability/voice/index.js';
import { context } from './r2-fixtures.js';

const voice = AgentVoiceSettingsSchema.parse({ mode: 'voice', provider: 'openai_live', protocol: 'websocket', transports: ['phone'], voiceId: 'synthetic-own-voice', model: 'synthetic-own-model' });
const text = AgentVoiceSettingsSchema.parse({ mode: 'text-only' });
const own = { agentId: context.agentId, versions: { desired: 4, applied: 3, failed: null }, desired: text, applied: voice };
const schemas = [['read', agent.AgentContextWithChannelsSchema], ['write', agent.AgentContextWithChannelsWriteSchema]] as const;

function applied(raw: unknown): unknown {
  const selected = Reflect.get(agent, 'appliedAgentVoiceSettings') as ((ctx: unknown) => unknown) | undefined;
  expect(typeof selected).toBe('function');
  return selected!(raw);
}

describe('BRIDGE-134 scoped applied voice context', () => {
  it.each(schemas)('preserves legacy %s context without inventing voice', (_label, schema) => {
    expect(schema.safeParse({ ...context, configVersion: 3 }).success).toBe(true);
    const parsed = schema.parse({ ...context, configVersion: 3 });
    expect(parsed).toEqual({ ...context, configVersion: 3 });
    expect(parsed).not.toHaveProperty('voiceConfiguration');
  });
  it.each(schemas)('preserves own applied voice and rejects foreign %s scope', (_label, schema) => {
    expect(schema.parse({ ...context, voiceConfiguration: own }).voiceConfiguration).toEqual(own);
    expect(schema.safeParse({ ...context, voiceConfiguration: { ...own, agentId: 'another-agent' } }).success).toBe(false);
  });
  for (const [label, schema] of schemas) {
    it.each([
      ['settings without version', { ...own, versions: { ...own.versions, applied: null } }],
      ['version without settings', { ...own, applied: null }],
      ['applied ahead of desired', { ...own, versions: { ...own.versions, applied: 5 } }],
      ['invalid applied voice', { ...own, applied: { ...voice, voiceId: '' } }],
      ['malformed configuration', { agentId: context.agentId }],
    ])(`rejects ${label} %s through the existing canonical voice schema`, (_reason, configuration) => {
      expect(schema.safeParse({ ...context, voiceConfiguration: own }).success).toBe(true);
      expect(schema.safeParse({ ...context, voiceConfiguration: configuration }).success).toBe(false);
    });
  }
  it('exports a helper returning null for a legacy context', () => expect(applied(agent.AgentContextWithChannelsSchema.parse(context))).toBeNull());
  it('returns null when desired voice has never been applied', () => {
    const parsed = agent.AgentContextWithChannelsSchema.parse({ ...context, voiceConfiguration: { ...own, desired: voice, applied: null, versions: { desired: 4, applied: null, failed: null } } });
    expect(applied(parsed)).toBeNull();
  });
  it('preserves applied text-only while desired voice is pending', () => {
    const parsed = agent.AgentContextWithChannelsSchema.parse({ ...context, voiceConfiguration: { ...own, desired: voice, applied: text } });
    expect(applied(parsed)).toEqual(text);
  });
  it('returns applied own voice rather than pending text-only desire', () => {
    const parsed = agent.AgentContextWithChannelsSchema.parse({ ...context, voiceConfiguration: own });
    expect(applied(parsed)).toEqual(voice);
  });
});
