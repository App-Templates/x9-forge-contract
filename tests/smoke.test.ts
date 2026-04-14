import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('bridge smoke', () => {
  it('zod v4 is installed and usable', () => {
    const schema = z.object({ ok: z.literal(true) });
    expect(schema.parse({ ok: true })).toEqual({ ok: true });
  });

  it('zod v4 rejects invalid input (fail-loud contract)', () => {
    const schema = z.object({ ok: z.literal(true) });
    // safeParse invece di parse per verificare che NON rompe a runtime
    const result = schema.safeParse({ ok: false });
    expect(result.success).toBe(false);
  });
});
