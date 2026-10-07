import { describe, expect, it } from 'vitest';
import * as agent from '../../src/agent/index.js';
import { context } from './r2-fixtures.js';

const policy = agent.AgentScopePolicySchema.parse({ version: 7, defaultWebSearch: false, scopeLimited: true, purpose: 'Synthetic purpose', defaults: { read: 'deny', write: 'deny' }, rules: [{ capability: 'email', read: 'allow', write: 'ask' }] });
const schemas = [['read', agent.AgentContextWithChannelsSchema], ['write', agent.AgentContextWithChannelsWriteSchema]] as const;
function applied(raw: unknown): unknown {
  const selected = Reflect.get(agent, 'appliedAgentScopePolicy') as ((ctx: unknown) => unknown) | undefined;
  expect(typeof selected).toBe('function');
  return selected!(raw);
}

describe('BRIDGE-134 applied scope policy context', () => {
  it.each(schemas)('preserves legacy %s context without inventing a policy', (_label, schema) => {
    expect(schema.safeParse(context).success).toBe(true);
    const parsed = schema.parse(context);
    expect(parsed).toEqual(context);
    expect(parsed).not.toHaveProperty('scopePolicy');
  });
  it.each(schemas)('keeps canonical %s policy and rejects duplicate rules in context', (_label, schema) => {
    expect(schema.parse({ ...context, scopePolicy: policy }).scopePolicy).toEqual(policy);
    expect(schema.safeParse({ ...context, scopePolicy: { ...policy, rules: [policy.rules[0], policy.rules[0]] } }).success).toBe(false);
  });
  it.each(schemas)('rejects %s limited policy without its canonical purpose', (_label, schema) => {
    expect(schema.safeParse({ ...context, scopePolicy: policy }).success).toBe(true);
    expect(schema.safeParse({ ...context, scopePolicy: { ...policy, purpose: undefined } }).success).toBe(false);
  });
  it('exports a helper returning null for an unconfigured policy', () => expect(applied(agent.AgentContextWithChannelsSchema.parse(context))).toBeNull());
  it('returns the whole applied policy with its own version and rules', () => {
    const parsed = agent.AgentContextWithChannelsSchema.parse({ ...context, scopePolicy: policy });
    expect(applied(parsed)).toEqual(policy);
  });
  it('does not infer a policy version or mode from whole-context configuration', () => {
    const parsed = agent.AgentContextWithChannelsSchema.parse({ ...context, configVersion: 9, scopeLimited: false, scopePolicy: policy });
    expect(applied(parsed)).toEqual(policy);
  });
});
