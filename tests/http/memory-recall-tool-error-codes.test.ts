import { describe, expect, it } from 'vitest';
import { ToolErrorModelReasonSchema } from '../../src/capability/index.js';
import {
  MEMORY_RECALL_ORGANIZATION_NOT_CONFIGURED_ERROR,
  MEMORY_RECALL_REFUSED_HTTP_STATUSES,
  MEMORY_RECALL_TOOL_ERROR_CODES,
  MemoryRecallToolErrorCodeSchema,
  memoryRecallToolErrorCodeOf,
} from '../../src/http/endpoints/internal-memory-recall-bundle.js';

describe('memory recall tool error codes', () => {
  it('s6464 richiamo-rifiutato: classifies bundle failures and rejects successful answers', () => {
    expect(memoryRecallToolErrorCodeOf({ status: 403 })).toBe('richiamo_rifiutato');
    expect(memoryRecallToolErrorCodeOf({ status: 403, organizationRecallNotConfigured: true }))
      .toBe('richiamo_rifiutato');
    expect(memoryRecallToolErrorCodeOf({ status: 503, organizationRecallNotConfigured: true }))
      .toBe('richiamo_aziendale_non_attivo');
    for (const answer of [
      { status: 503 },
      { status: 503, organizationRecallNotConfigured: false },
      { status: 500, organizationRecallNotConfigured: true },
      { status: 401 },
      { status: 400 },
      { status: 302 },
      {},
      { organizationRecallNotConfigured: true },
    ]) {
      expect(memoryRecallToolErrorCodeOf(answer)).toBe('richiamo_non_riuscito');
    }
    for (const status of [200, 201, 204, 299]) {
      expect(() => memoryRecallToolErrorCodeOf({ status })).toThrow(RangeError);
      expect(() => memoryRecallToolErrorCodeOf({ status, organizationRecallNotConfigured: true }))
        .toThrow(RangeError);
    }
  });

  it('preserves the existing model reasons and admits exactly the three recall codes', () => {
    expect(MEMORY_RECALL_TOOL_ERROR_CODES).toEqual([
      'richiamo_aziendale_non_attivo',
      'richiamo_non_riuscito',
      'richiamo_rifiutato',
    ]);
    expect(MemoryRecallToolErrorCodeSchema.options).toEqual(MEMORY_RECALL_TOOL_ERROR_CODES);
    for (const code of MEMORY_RECALL_TOOL_ERROR_CODES) {
      expect(MemoryRecallToolErrorCodeSchema.parse(code)).toBe(code);
      expect(ToolErrorModelReasonSchema.parse(code)).toBe(code);
      const reason = `${code}: Recall bundle request failed`;
      expect(ToolErrorModelReasonSchema.parse(reason)).toBe(reason);
    }
    expect(MemoryRecallToolErrorCodeSchema.safeParse('unknown_recall_error').success).toBe(false);
  });

  it('keeps the route error text and refused statuses exact', () => {
    expect(MEMORY_RECALL_ORGANIZATION_NOT_CONFIGURED_ERROR)
      .toBe('organization recall not configured');
    expect(MEMORY_RECALL_REFUSED_HTTP_STATUSES).toEqual([403]);
  });
});
