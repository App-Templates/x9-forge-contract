import { describe, expect, it } from 'vitest';
import { AgentRuntimeChannelSchema, telegramChannelMetadataOf } from '../../src/agent/index.js';
import { ListAgentsAgentSchema } from '../../src/http/endpoints/internal-agents-list.js';

const channel = { channelId: 'synthetic-telegram', kind: 'telegram', state: 'paused', loaded: false, readiness: 'unknown' };
const row = { agentId: 'synthetic-agent', displayName: 'Synthetic', ownerId: 'synthetic-owner' };
const inventory = (botUsername: unknown) => ({ ...row, runtime: { loadState: 'loaded', state: 'no-channel', channelsComplete: true, channels: [{ ...channel, botUsername, allowFromCount: 0 }] } });
const invalid: [string, unknown][] = [
  ['empty', ''], ['space', ' '], ['short', 'abot'], ['long', 'a'.repeat(30) + 'bot'],
  ['URL', 'https://invalid.test/Bot'], ['token', '123456:SYNTHETIC_TOKEN'], ['colon suffix', 'synthetic:bot'],
  ['at prefix', '@synthetic_bot'], ['slash', 'synthetic/bot'], ['hyphen', 'synthetic-bot'], ['dot', 'synthetic.bot'],
  ['unicode', 'syntheticébot'], ['missing suffix', 'synthetic_user'], ['trailing space', 'synthetic_bot '],
  ['leading space', ' synthetic_bot'], ['newline', 'synthetic_bot\n'], ['CRLF', 'synthetic_bot\r\n'],
  ['line separator', 'synthetic_bot\u2028'], ['paragraph separator', 'synthetic_bot\u2029'], ['NUL', 'synthetic_bot\u0000'],
];
const valid = ['abBot', 'synthetic_bot', 'SyntheticBot', 'SyntheticBOT', 'a'.repeat(29) + 'bot', 'a_9bot'];
describe('BRIDGE139 P2 observed Telegram username boundary', () => {
  it.each(invalid)('refuses %s across schema, selector and inventory', (_label, botUsername) => {
    expect(AgentRuntimeChannelSchema.safeParse({ ...channel, botUsername }).success).toBe(false);
    expect(telegramChannelMetadataOf({ ...channel, botUsername, allowFromCount: 0 })).toBeNull();
    expect(ListAgentsAgentSchema.safeParse(inventory(botUsername)).success).toBe(false);
  });
  it.each(valid)('preserves exact valid username %s across all surfaces', botUsername => {
    const value = { ...channel, botUsername, allowFromCount: 0 };
    expect(AgentRuntimeChannelSchema.parse(value)).toEqual(value);
    expect(telegramChannelMetadataOf(value)).toEqual({ botUsername, allowFromCount: 0 });
    expect(ListAgentsAgentSchema.parse(inventory(botUsername))).toEqual(inventory(botUsername));
  });
  it('keeps the legacy field absent and the observed count zero', () => {
    expect(AgentRuntimeChannelSchema.parse(channel)).toEqual(channel);
    expect(telegramChannelMetadataOf(channel)).toBeNull();
    expect(telegramChannelMetadataOf({ ...channel, allowFromCount: 0 })).toEqual({ allowFromCount: 0 });
  });
});
