import { describe, expect, it } from 'vitest';
import { AgentSpendDaySchema, SpendingCapabilitySchema } from '../../../src/capability/ricerca/index.js';
import { ricercaAgentSpendContract, videoAgentSpendContract } from '../../../src/http/index.js';

const day = {
  agentId: 'samira', capability: 'video', day: '2026-11-04',
  spentUsd: 1.5, reservedUsd: 2.5, capUsd: 10, calls: 3, webCalls: 0,
  budgetStops: 1, budgetReachedAt: '2026-11-04T14:52:00Z', overrunAt: null,
};

describe('video per-agent spend contract', () => {
  it.each(['video', 'ricerca', 'lab'])('declares spending capability %s', capability => {
    expect(SpendingCapabilitySchema.safeParse(capability)).toEqual({ success: true, data: capability });
  });

  it('rejects undeclared spending capability', () => {
    expect(SpendingCapabilitySchema.safeParse('food').success).toBe(false);
  });

  it('retains all spend day values for video', () => {
    expect(AgentSpendDaySchema.safeParse(day)).toEqual({ success: true, data: day });
  });

  it('exports the shared video spend route through the HTTP entry point', () => {
    expect(videoAgentSpendContract).toMatchObject({
      path: '/internal/capability/agents/:agentId/spend', method: 'GET', authType: 'secret',
    });
  });

  it('reuses exactly the validated params, query and response schemas', () => {
    for (const key of ['paramsSchema', 'querySchema', 'responseSchema'] as const) {
      expect(videoAgentSpendContract[key]).toBe(ricercaAgentSpendContract[key]);
    }
  });

  it('responds with video days and the current queue length', () => {
    const value = { days: [day], queuedNow: 2 };
    expect(videoAgentSpendContract.responseSchema.safeParse(value)).toEqual({ success: true, data: value });
  });
});
