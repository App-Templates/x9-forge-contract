import { describe, it, expect } from 'vitest';
import {
  ListAgentsAgentSchema,
  ListAgentsResponseSchema,
  listAgentsContract,
} from '../../../src/http/endpoints/internal-agents-list.js';

// Real fixture derived from agent-core services/agent-core/src/index.ts:328-333
const validFixture = {
  agents: [
    { agentId: 'stefano-main', displayName: 'Stefano Main', ownerId: 'owner-1' },
    { agentId: 'test-agent-02', displayName: 'Test Agent', ownerId: 'owner-2' },
  ],
};

describe('ListAgentsAgentSchema', () => {
  it('parses a valid agent entry', () => {
    const result = ListAgentsAgentSchema.parse(validFixture.agents[0]);
    expect(result.agentId).toBe('stefano-main');
    expect(result.displayName).toBe('Stefano Main');
    expect(result.ownerId).toBe('owner-1');
  });

  it('rejects an agent entry with empty agentId', () => {
    expect(() =>
      ListAgentsAgentSchema.parse({ agentId: '', displayName: 'x', ownerId: 'y' }),
    ).toThrow();
  });

  it('rejects an agent entry missing displayName', () => {
    expect(() =>
      ListAgentsAgentSchema.parse({ agentId: 'stefano-main', ownerId: 'owner-1' }),
    ).toThrow();
  });
});

describe('ListAgentsResponseSchema', () => {
  it('parses a valid list-agents response (real fixture)', () => {
    const result = ListAgentsResponseSchema.parse(validFixture);
    expect(result.agents).toHaveLength(2);
    expect(result.agents[0]?.agentId).toBe('stefano-main');
  });

  it('parses an empty agents array', () => {
    const result = ListAgentsResponseSchema.parse({ agents: [] });
    expect(result.agents).toEqual([]);
  });

  it('rejects when agents field is missing', () => {
    expect(() => ListAgentsResponseSchema.parse({})).toThrow();
  });

  it('rejects when an agent inside the array is malformed', () => {
    expect(() =>
      ListAgentsResponseSchema.parse({ agents: [{ agentId: 'stefano-main' }] }),
    ).toThrow();
  });
});

describe('listAgentsContract', () => {
  it('declares GET /internal/agents with secret auth', () => {
    expect(listAgentsContract.method).toBe('GET');
    expect(listAgentsContract.path).toBe('/internal/agents');
    expect(listAgentsContract.authType).toBe('secret');
  });
});
