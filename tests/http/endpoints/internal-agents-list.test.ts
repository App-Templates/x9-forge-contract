import { describe, it, expect } from 'vitest';
import {
  ListAgentsAgentSchema,
  ListAgentsResponseSchema,
  listAgentsContract,
  RuntimeAgentStatusSchema,
  ForgeRuntimeStatusSchema,
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

// Phase 22 — additive-optional runtime status (D2/D3)
describe('Phase 22 runtime status (additive-optional)', () => {
  it('BACKWARD-COMPAT: a response WITHOUT the new fields still validates (old agent-core)', () => {
    const result = ListAgentsResponseSchema.parse({
      agents: [{ agentId: 'a', displayName: 'A', ownerId: '1' }],
    });
    expect(result.agents[0]?.runtimeStatus).toBeUndefined();
    expect(result.agents[0]?.loaded).toBeUndefined();
  });

  it('FORWARD: an entry WITH the new fields validates (new agent-core)', () => {
    const result = ListAgentsAgentSchema.parse({
      agentId: 'a',
      displayName: 'A',
      ownerId: '1',
      runtimeStatus: 'running',
      loaded: true,
      errorKind: null,
      lastError: null,
    });
    expect(result.runtimeStatus).toBe('running');
    expect(result.loaded).toBe(true);
  });

  it('DEGRADED detail: errorKind + lastError on a degraded agent validate', () => {
    const result = ListAgentsAgentSchema.parse({
      agentId: 'a',
      displayName: 'A',
      ownerId: '1',
      runtimeStatus: 'degraded',
      errorKind: 'auth',
      lastError: 'token invalid',
    });
    expect(result.runtimeStatus).toBe('degraded');
    expect(result.errorKind).toBe('auth');
    expect(result.lastError).toBe('token invalid');
  });

  it('bot-less is a valid wire state', () => {
    expect(RuntimeAgentStatusSchema.parse('bot-less')).toBe('bot-less');
  });

  it("WIRE enum REJECTS 'unknown' (agent-core never emits it — D2/D3)", () => {
    expect(RuntimeAgentStatusSchema.safeParse('unknown').success).toBe(false);
    expect(
      ListAgentsAgentSchema.safeParse({
        agentId: 'a',
        displayName: 'A',
        ownerId: '1',
        runtimeStatus: 'unknown',
      }).success,
    ).toBe(false);
  });

  it("FORGE union ACCEPTS 'unknown' (overlay value when agent-core unreachable)", () => {
    expect(ForgeRuntimeStatusSchema.parse('unknown')).toBe('unknown');
    // and still accepts the 5 real states
    expect(ForgeRuntimeStatusSchema.parse('running')).toBe('running');
  });
});
