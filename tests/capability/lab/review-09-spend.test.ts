import { describe, expect, it } from 'vitest';
import { capAgentSpendPath, ricercaAgentSpendContract } from '../../../src/http/index.js';
import { modules, schema } from './review-fixtures.js';
const day = { agentId: 'samira', capability: 'lab', day: '2026-10-06', spentUsd: 1,
  reservedUsd: 2, capUsd: 10, calls: 3, webCalls: 0, budgetStops: 1, budgetReachedAt: null, overrunAt: null };
function contract(): typeof ricercaAgentSpendContract {
  const value = (modules.http as unknown as Record<string, typeof ricercaAgentSpendContract>).labAgentSpendContract;
  expect(value, 'labAgentSpendContract').toBeDefined();
  return value!;
}
describe('lab per-agent spend contract', () => {
  it.each(['lab', 'ricerca'])('declares spending capability %s', capability => {
    expect(schema('SpendingCapabilitySchema', 'ricerca').safeParse(capability)).toMatchObject({ success: true, data: capability });
  });
  it('rejects undeclared spending capability', () => {
    expect(schema('SpendingCapabilitySchema', 'ricerca').safeParse('food').success).toBe(false);
  });
  it('retains settled, reserved and budget stop values for lab', () => {
    expect(schema('AgentSpendDaySchema', 'ricerca').safeParse(day)).toMatchObject({ success: true, data: day });
  });
  it.each([
    ['path', '/internal/capability/agents/:agentId/spend'],
    ['method', 'GET'], ['authType', 'secret'],
  ])('uses the shared %s', (key, value) => {
    expect(contract()[key as 'path' | 'method' | 'authType']).toBe(value);
  });
  it('reuses exactly the validated params, query and response schemas', () => {
    for (const key of ['paramsSchema', 'querySchema', 'responseSchema'] as const) {
      expect(contract()[key]).toBe(ricercaAgentSpendContract[key]);
    }
    expect(capAgentSpendPath('samira')).toBe('/internal/capability/agents/samira/spend');
  });
  it('responds with lab days and the current queue length', () => {
    const value = { days: [day], queuedNow: 2 };
    expect(contract().responseSchema.safeParse(value)).toMatchObject({ success: true, data: value });
  });
  it('rejects an undeclared capability in the lab response', () => {
    expect(contract().responseSchema.safeParse({ days: [{ ...day, capability: 'food' }], queuedNow: 0 }).success).toBe(false);
  });
  it('keeps the same bounded date window for lab', () => {
    expect(contract().querySchema.safeParse({ from: '2026-10-01', to: '2026-10-06' }).success).toBe(true);
    expect(contract().querySchema.safeParse({ from: '2026-10-06', to: '2026-10-01' }).success).toBe(false);
  });
});
