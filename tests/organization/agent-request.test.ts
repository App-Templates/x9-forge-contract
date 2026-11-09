import { describe, expect, it } from 'vitest';
import { AgentRequestSchema } from '../../src/organization/agent-request.js';

const request = {
  schemaVersion: 1,
  requestId: 'areq_abcdefgh',
  from: { unitId: 'unit-design', paperclipAgentId: '11111111-1111-4111-8111-111111111111' },
  to: { kind: 'director' },
  need: 'Serve la decisione sul budget',
  why: 'Senza budget la consegna non parte',
  mandate: { issueId: '22222222-2222-4222-8222-222222222222', identifier: 'GOO-58' },
  plan: { planId: 'plan_000001', version: 2 },
  requestedAt: '2026-11-09T23:50:00+01:00',
};

describe('AgentRequestSchema', () => {
  it('s5975 a lead asks the Director with need, why, Mandate and plan', () => {
    expect(AgentRequestSchema.parse(request)).toStrictEqual(request);
    const lab = { ...request, to: { kind: 'lab' } };
    expect(AgentRequestSchema.parse(lab)).toStrictEqual(lab);
    const unit = { ...request, to: { kind: 'business_unit', unitId: 'unit-sales' } };
    expect(AgentRequestSchema.parse(unit)).toStrictEqual(unit);
  });

  it('s5975 a request without the plan of a Mandate without plan header is valid', () => {
    const { plan: _plan, ...withoutPlan } = request;
    expect(AgentRequestSchema.parse(withoutPlan)).toStrictEqual(withoutPlan);
  });

  it('s5975 need or why blank are refused', () => {
    for (const field of ['need', 'why'] as const) {
      expect(AgentRequestSchema.safeParse({ ...request, [field]: '   ' }).success).toBe(false);
      expect(AgentRequestSchema.safeParse({ ...request, [field]: 'x'.repeat(2001) }).success).toBe(false);
      const { [field]: _omitted, ...missing } = request;
      expect(AgentRequestSchema.safeParse(missing).success).toBe(false);
    }
  });

  it('s5975 a unit cannot ask itself', () => {
    const result = AgentRequestSchema.safeParse({ ...request, to: { kind: 'business_unit', unitId: 'unit-design' } });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map(i => i.message)).toContain('a unit cannot ask itself');
  });

  it('s5975 an unknown target kind is refused', () => {
    expect(AgentRequestSchema.safeParse({ ...request, to: { kind: 'ceo' } }).success).toBe(false);
    expect(AgentRequestSchema.safeParse({ ...request, to: { kind: 'business_unit' } }).success).toBe(false);
    expect(AgentRequestSchema.safeParse({ ...request, requestId: 'req_abcdefgh' }).success).toBe(false);
  });

  it('s5975 extra fields are refused', () => {
    expect(AgentRequestSchema.safeParse({ ...request, extra: 1 }).success).toBe(false);
    expect(AgentRequestSchema.safeParse({ ...request, to: { kind: 'director', unitId: 'x' } }).success).toBe(false);
    expect(AgentRequestSchema.safeParse({ ...request, mandate: { ...request.mandate, x: 1 } }).success).toBe(false);
  });
});
