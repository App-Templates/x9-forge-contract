import { describe, it, expect } from 'vitest';
import {
  ModelPushRequestSchema,
  ModelPushResponseSchema,
  pushModelConfigContract,
  type ModelPushResponse,
} from '../../src/model-router/model-push.js';

const FULL_MAPPING = { standard: 'gpt-4.1-mini', advanced: 'o4-mini', reasoning: 'o3' };

describe('ModelPushRequestSchema', () => {
  it('accepts minimal request (providers only)', () => {
    expect(ModelPushRequestSchema.parse({ providers: { openai: FULL_MAPPING } })).toMatchObject({
      providers: { openai: FULL_MAPPING },
    });
  });
  it('accepts full request (providers + perCapPolicies + perAgentOverrides)', () => {
    const req = {
      providers: { openai: FULL_MAPPING, anthropic: FULL_MAPPING, google: FULL_MAPPING },
      perCapPolicies: { briefing: { min: 'standard' as const, max: 'advanced' as const } },
      perAgentOverrides: [{
        agentId: { agentId: 'stefano', ownerId: 'owner_1' },
        policy: { min: 'reasoning' as const, max: 'reasoning' as const },
      }],
    };
    expect(ModelPushRequestSchema.parse(req)).toMatchObject(req);
  });
  it('rejects unknown provider (T-06-02 — enum gate)', () => {
    const res = ModelPushRequestSchema.safeParse({ providers: { mistral: FULL_MAPPING } });
    expect(res.success).toBe(false);
  });
  it('rejects request with incomplete mapping (propagates ModelTierMapping refine)', () => {
    const res = ModelPushRequestSchema.safeParse({ providers: { openai: { standard: 'x' } } });
    expect(res.success).toBe(false);
  });
  it('rejects empty providers record (WR-01 — at least one provider required)', () => {
    const res = ModelPushRequestSchema.safeParse({ providers: {} });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]!.message).toMatch(/at least one provider mapping/);
    }
  });
  it('rejects providers record with only declared-but-undefined entries (WR-01)', () => {
    const res = ModelPushRequestSchema.safeParse({ providers: { openai: undefined } });
    expect(res.success).toBe(false);
  });
});

describe('ModelPushResponseSchema — success arm', () => {
  it('accepts minimal success', () => {
    expect(ModelPushResponseSchema.parse({ ok: true, applied: 0 })).toEqual({ ok: true, applied: 0 });
  });
  it('accepts success with reloadVersion', () => {
    const r = { ok: true, applied: 3, reloadVersion: '2026-04-16T12:00:00Z/r1' };
    expect(ModelPushResponseSchema.parse(r)).toEqual(r);
  });
  it('rejects negative applied count', () => {
    expect(ModelPushResponseSchema.safeParse({ ok: true, applied: -1 }).success).toBe(false);
  });
});

describe('ModelPushResponseSchema — error arm (4 error-code cases)', () => {
  const codes = ['INVALID_POLICY', 'UNKNOWN_CAP', 'INVALID_MAPPING', 'INTERNAL_ERROR'] as const;
  for (const code of codes) {
    it(`accepts error with code=${code}`, () => {
      const r = { ok: false, code, message: `failure: ${code}` };
      expect(ModelPushResponseSchema.parse(r)).toMatchObject(r);
    });
  }
  it('accepts error with details[]', () => {
    const r = { ok: false, code: 'INVALID_POLICY' as const, message: 'x', details: [{ capName: 'briefing', reason: 'min > max' }] };
    expect(ModelPushResponseSchema.parse(r)).toMatchObject(r);
  });
  it('rejects unknown error code', () => {
    expect(ModelPushResponseSchema.safeParse({ ok: false, code: 'NOT_A_CODE', message: 'x' }).success).toBe(false);
  });
});

describe('ModelPushResponseSchema — discriminated union narrowing', () => {
  it('narrows on ok=true', () => {
    const fn = (r: ModelPushResponse): number => r.ok ? r.applied : 0;
    expect(fn({ ok: true, applied: 5 })).toBe(5);
    expect(fn({ ok: false, code: 'INTERNAL_ERROR', message: 'x' })).toBe(0);
  });
});

describe('pushModelConfigContract — D-15 shape', () => {
  it('has locked method/path/authType', () => {
    expect(pushModelConfigContract.method).toBe('POST');
    expect(pushModelConfigContract.path).toBe('/internal/model-config');
    expect(pushModelConfigContract.authType).toBe('secret');
  });
  it('exposes request + response schemas', () => {
    expect(pushModelConfigContract.requestSchema).toBe(ModelPushRequestSchema);
    expect(pushModelConfigContract.responseSchema).toBe(ModelPushResponseSchema);
  });
});
