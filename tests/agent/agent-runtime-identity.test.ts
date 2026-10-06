import { describe, expect, it } from 'vitest';
import * as agent from '../../src/agent/index.js';

const pair = (managementAgentId: string, runtimeAgentId: string) => ({
  managementAgentId, runtimeAgentId,
});

describe('canonical management/runtime identity', () => {
  it('accepts an explicitly declared x9-staging to x9 mapping', () => {
    expect(agent.AgentRuntimeIdentitySchema.parse(pair('x9-staging', 'x9')))
      .toEqual(pair('x9-staging', 'x9'));
  });

  it('accepts the same identifier in both namespaces for one agent', () => {
    expect(agent.AgentRuntimeIdentitiesSchema.parse([pair('ea-58', 'ea-58')]))
      .toEqual([pair('ea-58', 'ea-58')]);
  });

  it('rejects a numeric database ID rather than coercing it to a slug', () => {
    expect(agent.AgentRuntimeIdentitySchema.safeParse({ managementAgentId: 'x9-staging', runtimeAgentId: 1 }).success)
      .toBe(false);
  });

  it.each(['managementAgentId', 'runtimeAgentId'] as const)(
    'requires a non-empty %s', (key) => {
      expect(agent.AgentRuntimeIdentitySchema.safeParse({ ...pair('x9-staging', 'x9'), [key]: '' }).success)
        .toBe(false);
    },
  );

  it('does not infer a missing runtime identifier from management', () => {
    expect(agent.AgentRuntimeIdentitySchema.safeParse({ managementAgentId: 'x9-staging' }).success)
      .toBe(false);
  });

  it.each([
    [pair('x9-staging', 'x9'), pair('x9-staging', 'other')],
    [pair('x9-staging', 'x9'), pair('other', 'x9')],
    [pair('x9-staging', 'x9'), pair('x9', 'other')],
    [pair('x9-staging', 'x9'), pair('other', 'x9-staging')],
    [pair('x9-staging', 'x9'), pair('x9-staging', 'x9')],
  ])('rejects duplicate or ambiguous cross-namespace identities: %j', (...identities) => {
    expect(agent.AgentRuntimeIdentitiesSchema.safeParse(identities).success).toBe(false);
  });

  it('accepts distinct explicit identities without fuzzy name matching', () => {
    const identities = [pair('x9-staging', 'x9'), pair('x9-staging-extra', 'x9-extra')];
    expect(agent.AgentRuntimeIdentitiesSchema.parse(identities)).toEqual(identities);
  });
});
