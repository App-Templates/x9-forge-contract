import { describe, it, expect } from 'vitest';
import { InvalidationReasonSchema } from '../../src/memory/enums.js';

describe('InvalidationReasonSchema', () => {
  it.each(InvalidationReasonSchema.options)(
    'accepts valid reason "%s"',
    (reason) => {
      const parsed = InvalidationReasonSchema.safeParse(reason);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data).toBe(reason);
      }
    },
  );

  it('has exactly 10 values', () => {
    expect(InvalidationReasonSchema.options).toHaveLength(10);
  });

  it('rejects unknown reason "deleted_by_admin"', () => {
    const parsed = InvalidationReasonSchema.safeParse('deleted_by_admin');
    expect(parsed.success).toBe(false);
  });

  it('rejects empty string', () => {
    const parsed = InvalidationReasonSchema.safeParse('');
    expect(parsed.success).toBe(false);
  });

  it('rejects non-string value', () => {
    const parsed = InvalidationReasonSchema.safeParse(42);
    expect(parsed.success).toBe(false);
  });
});
