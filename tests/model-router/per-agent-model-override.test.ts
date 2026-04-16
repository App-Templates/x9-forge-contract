import { describe, it, expect } from 'vitest';
import { PerAgentModelOverrideSchema } from '../../src/model-router/per-agent-model-override.js';

const AGENT_IDENTITY = { agentId: 'stefano', ownerId: 'owner_1' };

describe('PerAgentModelOverrideSchema — valid', () => {
  it('accepts override with policy only', () => {
    const o = { agentId: AGENT_IDENTITY, policy: { min: 'reasoning' as const, max: 'reasoning' as const } };
    expect(PerAgentModelOverrideSchema.parse(o)).toMatchObject(o);
  });
  it('accepts override with tierMapping only (partial allowed per D-22)', () => {
    const o = { agentId: AGENT_IDENTITY, tierMapping: { reasoning: 'claude-opus-4-6' } };
    expect(PerAgentModelOverrideSchema.parse(o)).toMatchObject(o);
  });
  it('accepts override with both policy and tierMapping', () => {
    const o = {
      agentId: AGENT_IDENTITY,
      policy: { min: 'advanced' as const, max: 'reasoning' as const },
      tierMapping: { reasoning: 'claude-opus-4-6', advanced: 'o4-mini' },
    };
    expect(PerAgentModelOverrideSchema.parse(o)).toMatchObject(o);
  });
});

describe('PerAgentModelOverrideSchema — invalid', () => {
  it('rejects override with neither policy nor tierMapping (D-20 refine)', () => {
    const res = PerAgentModelOverrideSchema.safeParse({ agentId: AGENT_IDENTITY });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]!.message).toMatch(/must specify at least one of: policy, tierMapping/);
    }
  });
  it('rejects override with empty tierMapping and no policy (WR-02 — D-20 invariant)', () => {
    const res = PerAgentModelOverrideSchema.safeParse({ agentId: AGENT_IDENTITY, tierMapping: {} });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]!.message).toMatch(/must specify at least one of: policy, tierMapping/);
    }
  });
  it('rejects missing agentId', () => {
    const res = PerAgentModelOverrideSchema.safeParse({ policy: { min: 'standard', max: 'standard' } });
    expect(res.success).toBe(false);
  });
  it('uses branded AgentIdentity — agentId must be { agentId, ownerId }', () => {
    const res = PerAgentModelOverrideSchema.safeParse({
      agentId: 'stefano',
      policy: { min: 'standard', max: 'standard' },
    });
    expect(res.success).toBe(false);
  });
  it('propagates ModelPolicy invariant (nested refine)', () => {
    const res = PerAgentModelOverrideSchema.safeParse({
      agentId: AGENT_IDENTITY,
      policy: { min: 'reasoning', max: 'standard' },
    });
    expect(res.success).toBe(false);
  });
});
