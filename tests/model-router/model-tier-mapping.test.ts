import { describe, it, expect } from 'vitest';
import { ModelTierMappingSchema } from '../../src/model-router/model-tier-mapping.js';

describe('ModelTierMappingSchema', () => {
  it('accepts a complete mapping', () => {
    const m = { standard: 'gpt-4.1-mini', advanced: 'o4-mini', reasoning: 'o3' };
    expect(ModelTierMappingSchema.parse(m)).toEqual(m);
  });
  it('rejects partial mapping (missing reasoning) with diagnostic message', () => {
    const res = ModelTierMappingSchema.safeParse({ standard: 'x', advanced: 'y' });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]!.message).toMatch(/missing mapping for tier\(s\): reasoning/);
    }
  });
  it('rejects empty object (missing all tiers)', () => {
    const res = ModelTierMappingSchema.safeParse({});
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]!.message).toMatch(/missing mapping for tier\(s\): standard, advanced, reasoning/);
    }
  });
  it('rejects empty-string model ids (z.string().min(1))', () => {
    const res = ModelTierMappingSchema.safeParse({ standard: '', advanced: 'y', reasoning: 'z' });
    expect(res.success).toBe(false);
  });
  it('rejects unknown tier keys (strict enum keys)', () => {
    const res = ModelTierMappingSchema.safeParse({ standard: 'a', advanced: 'b', reasoning: 'c', omni: 'd' });
    expect(res.success).toBe(false);
  });
});
