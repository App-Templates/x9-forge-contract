import { describe, expect, it } from 'vitest';
import {
  VaultResolvedEntrySchema,
  resolvedEntryRef,
} from '../../dist/vault/index.js';

describe('dist 1.105.1', () => {
  it('exports resolvedEntryRef and accepts source, counter and revoked on a resolved entry', () => {
    expect(typeof resolvedEntryRef).toBe('function');
    const entry = VaultResolvedEntrySchema.parse({
      key: 'OPENAI_API_KEY', value: 'x', tier: 'platform', secret: true,
      source: 'platform', counter: 3, revoked: true,
    });
    expect(entry.revoked).toBe(true);
    expect(resolvedEntryRef(entry)).toMatchObject({ source: 'platform', counter: 3, revoked: true });
  });
});
