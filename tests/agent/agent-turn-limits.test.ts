import { describe, expect, it } from 'vitest';
import {
  AGENT_DEFAULT_MAX_TOOL_ROUNDS,
  AgentTurnLimitsSchema,
  readAgentTurnLimits,
} from '../../src/agent/index.js';

describe('AgentTurnLimitsSchema', () => {
  it('accepts a numeric round limit without budget', () => {
    expect(AgentTurnLimitsSchema.safeParse({ version: 1, maxToolRounds: 12 }).success).toBe(true);
  });
  it('accepts unlimited rounds under a turn budget', () => {
    expect(AgentTurnLimitsSchema.safeParse({ version: 1, maxToolRounds: 'unlimited', budget: { maxTokensPerTurn: 400_000 } }).success).toBe(true);
  });
  it('refuses unlimited rounds without a budget', () => {
    expect(AgentTurnLimitsSchema.safeParse({ version: 1, maxToolRounds: 'unlimited' }).success).toBe(false);
  });
  it('refuses zero, fractional, above-ceiling rounds and unknown fields', () => {
    for (const bad of [
      { version: 1, maxToolRounds: 0 },
      { version: 1, maxToolRounds: 2.5 },
      { version: 1, maxToolRounds: 201 },
      { version: 1, maxToolRounds: 5, extra: true },
      { version: 1, maxToolRounds: 5, budget: { maxTokensPerTurn: 10 } },
      { maxToolRounds: 5 },
    ]) expect(AgentTurnLimitsSchema.safeParse(bad).success).toBe(false);
  });
});

describe('readAgentTurnLimits', () => {
  it('defaults when the context has no turnLimits', () => {
    expect(readAgentTurnLimits({ agentId: 'a' })).toEqual({ maxToolRounds: AGENT_DEFAULT_MAX_TOOL_ROUNDS, maxTokensPerTurn: null, source: 'default' });
    expect(readAgentTurnLimits(null).source).toBe('default');
  });
  it('maps unlimited to null rounds and keeps the budget', () => {
    expect(readAgentTurnLimits({ turnLimits: { version: 2, maxToolRounds: 'unlimited', budget: { maxTokensPerTurn: 500_000 } } }))
      .toEqual({ maxToolRounds: null, maxTokensPerTurn: 500_000, source: 'configured' });
  });
  it('falls back to the default (never unlimited) on an invalid value', () => {
    expect(readAgentTurnLimits({ turnLimits: { version: 1, maxToolRounds: 'unlimited' } }))
      .toEqual({ maxToolRounds: AGENT_DEFAULT_MAX_TOOL_ROUNDS, maxTokensPerTurn: null, source: 'invalid' });
  });
});
