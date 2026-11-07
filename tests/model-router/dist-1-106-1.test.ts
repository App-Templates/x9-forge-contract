import { describe, expect, it } from 'vitest';
import {
  RetiredModelObservationSchema,
  retirementSource,
} from '../../dist/model-router/index.js';

describe('dist 1.106.1', () => {
  it('publishes the retirement source of the catalog observation', () => {
    expect(typeof retirementSource).toBe('function');
    const body = {
      scope: { agentId: 'x9', ownerId: '1', tenantId: '1' },
      slotId: 'memory_extraction',
      model: { provider: 'openai', modelId: 'gpt-old', protocol: 'responses', adapterId: 'openai-live-delegation' },
    };
    const inventory = { ...body, source: 'provider-inventory' };
    const parsed = RetiredModelObservationSchema.parse(inventory);
    expect(parsed).toEqual(inventory);
    expect(retirementSource(parsed)).toBe('provider-inventory');
    expect(RetiredModelObservationSchema.safeParse({ ...body, source: 'provider-error' }).success).toBe(false);
  });
});
