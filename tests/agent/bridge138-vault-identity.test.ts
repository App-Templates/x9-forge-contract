import { describe, expect, it } from 'vitest';
import * as agent from '../../src/agent/index.js';
import { context, channel } from './r2-fixtures.js';

const pair = { managementAgentId: 'forge-alice', runtimeAgentId: 'alice' };
const base = { ...context, agentId: pair.runtimeAgentId };
const schemas = [
  ['identity', agent.AgentRuntimeIdentitySchema],
  ['context read', agent.AgentContextWithChannelsSchema], ['context write', agent.AgentContextWithChannelsWriteSchema],
  ['workspace read', agent.AgentContextWithWorkspaceSchema], ['workspace write', agent.AgentContextWithWorkspaceWriteSchema],
] as const;
function vault(ctx: unknown): number | null {
  const helper = Reflect.get(agent, 'vaultAgentIdOf') as ((value: unknown) => number | null) | undefined;
  expect(typeof helper).toBe('function');
  return helper!(ctx);
}
for (const [label, schema] of schemas) {
  const input = (identity: object) => label === 'identity' ? identity : { ...base, identity };
  const selectedContext = (parsed: unknown) => label === 'identity' ? { identity: parsed } : parsed;
  describe(`canonical vault identity ${label}`, () => {
    it('preserves a legacy pair without inventing a vault ID', () => {
      const value = input(pair), result = schema.safeParse(value);
      expect(result.success).toBe(true);
      if (result.success) { expect(result.data).toEqual(value); expect(vault(selectedContext(result.data))).toBeNull(); }
    });
    it.each([1, 42, Number.MAX_SAFE_INTEGER])('retains the explicit positive integer %s', vaultAgentId => {
      const value = input({ ...pair, vaultAgentId }), result = schema.safeParse(value);
      expect(result.success).toBe(true);
      if (result.success) { expect(result.data).toEqual(value); expect(vault(selectedContext(result.data))).toBe(vaultAgentId); }
    });
    it.each([0, -1, 1.5, '1', null, true, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects an invalid vault ID at case %#', vaultAgentId => {
      expect(schema.safeParse(input({ ...pair, vaultAgentId })).success).toBe(false);
    });
  });
}

describe('public vault selector uses only the explicit root identity', () => {
  it('returns null for a context without identity', () => expect(vault(base)).toBeNull());
  it('returns null for a declared pair without vault ID', () => expect(vault({ ...base, identity: pair })).toBeNull());
  it('never parses a numeric-looking management slug', () => expect(vault({ ...base, identity: { ...pair, managementAgentId: '42' } })).toBeNull());
  it('never parses a numeric-looking runtime slug', () => expect(vault({ ...base, agentId: '42', identity: { ...pair, runtimeAgentId: '42' } })).toBeNull());
  it('never reads a numeric context agentId', () => expect(vault({ ...base, agentId: '42' })).toBeNull());
  it('ignores a noncanonical top-level vault ID', () => expect(vault({ ...base, vaultAgentId: 99 })).toBeNull());
  it('ignores a channel identity even when it carries a vault ID', () => expect(vault({ ...base, channelConfigurations: [{ ...channel('telegram'), identity: { ...pair, vaultAgentId: 99 } }] })).toBeNull());
  it('ignores a legacy voice management ID', () => expect(vault({ ...base, voiceConfiguration: { agentId: '42' } })).toBeNull());
  it('does not replace an explicit value with another namespace', () => {
    expect(vault({ ...base, agentId: '12', identity: { managementAgentId: '13', runtimeAgentId: '12', vaultAgentId: 14 }, vaultAgentId: 99 })).toBe(14);
  });
  it('reads the next agent independently without caching', () => {
    expect(vault({ ...base, identity: { ...pair, vaultAgentId: 41 } })).toBe(41);
    expect(vault({ ...base, identity: { ...pair, vaultAgentId: 82 } })).toBe(82);
    expect(vault({ ...base, identity: pair })).toBeNull();
  });
  it('keeps management/runtime meanings unchanged with the additive field', () => {
    const identity = agent.AgentRuntimeIdentitySchema.parse({ ...pair, vaultAgentId: 42 });
    expect(identity.managementAgentId).toBe(pair.managementAgentId);
    expect(identity.runtimeAgentId).toBe(pair.runtimeAgentId);
    expect(vault({ ...base, identity })).toBe(42);
  });
});
