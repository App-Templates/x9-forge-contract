import { describe, it, expect } from 'vitest';
import { ModelHotReloadNotificationSchema } from '../../src/model-router/model-hot-reload.js';

describe('ModelHotReloadNotificationSchema', () => {
  it('accepts minimal (version + appliedAt)', () => {
    const n = { version: 'r1', appliedAt: '2026-04-16T12:00:00Z' };
    expect(ModelHotReloadNotificationSchema.parse(n)).toEqual(n);
  });
  it('accepts full (version + appliedAt + providersChanged + capsChanged)', () => {
    const n = {
      version: 'r2',
      appliedAt: '2026-04-16T13:00:00Z',
      providersChanged: ['openai' as const, 'anthropic' as const],
      capsChanged: ['briefing', 'calendar'],
    };
    expect(ModelHotReloadNotificationSchema.parse(n)).toEqual(n);
  });
  it('rejects missing version', () => {
    expect(ModelHotReloadNotificationSchema.safeParse({ appliedAt: '2026-04-16T12:00:00Z' }).success).toBe(false);
  });
  it('rejects invalid appliedAt (not ISO datetime)', () => {
    expect(ModelHotReloadNotificationSchema.safeParse({ version: 'r1', appliedAt: 'yesterday' }).success).toBe(false);
  });
  it('rejects unknown provider in providersChanged', () => {
    expect(ModelHotReloadNotificationSchema.safeParse({
      version: 'r1', appliedAt: '2026-04-16T12:00:00Z', providersChanged: ['mistral'],
    }).success).toBe(false);
  });
});
