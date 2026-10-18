import { describe, expect, it } from 'vitest';
import {
  FeatureSwitchListSchema,
  FeatureSwitchSchema,
  FeatureSwitchStateSchema,
  type FeatureSwitch,
  type FeatureSwitchList,
  type FeatureSwitchState,
} from '../../src/capability/index.js';

const disabled: FeatureSwitch = {
  name: 'night-release',
  state: 'spenta',
  feature: 'PIANO-AUTONOMIA-NIGHT',
  openLinks: ['R-34: owner approval'],
  updatedAt: '2026-10-18T12:00:00.000Z',
};

describe('FeatureSwitchSchema', () => {
  it('accepts a disabled function with open links', () => {
    expect(FeatureSwitchSchema.parse(disabled)).toEqual(disabled);
  });

  it('accepts an enabled function without open links', () => {
    const state: FeatureSwitchState = 'accesa';
    const enabled = { ...disabled, state, openLinks: [] };
    expect(FeatureSwitchSchema.parse(enabled)).toEqual(enabled);
  });

  it('rejects an enabled function with open links', () => {
    expect(FeatureSwitchSchema.safeParse({ ...disabled, state: 'accesa' }).success).toBe(false);
  });

  it.each(['', 'Night-release', 'night_release', '-night', 'night-', 'night--release', 'a'.repeat(65)])(
    'rejects invalid name %j',
    (name) => {
      expect(FeatureSwitchSchema.safeParse({ ...disabled, name }).success).toBe(false);
    },
  );

  it.each(['a', 'a'.repeat(64), 'night-34'])('accepts valid name %j', (name) => {
    expect(FeatureSwitchSchema.safeParse({ ...disabled, name }).success).toBe(true);
  });

  it('rejects extra keys', () => {
    expect(FeatureSwitchSchema.safeParse({ ...disabled, enabled: true }).success).toBe(false);
  });

  it.each(['', 'a'.repeat(121)])('rejects invalid feature %j', (feature) => {
    expect(FeatureSwitchSchema.safeParse({ ...disabled, feature }).success).toBe(false);
  });

  it('accepts the maximum feature length and a disabled function without open links', () => {
    expect(FeatureSwitchSchema.safeParse({ ...disabled, feature: 'a'.repeat(120), openLinks: [] }).success).toBe(true);
  });

  it('rejects empty open links', () => {
    expect(FeatureSwitchSchema.safeParse({ ...disabled, openLinks: [''] }).success).toBe(false);
  });

  it.each(['', '2026-10-18', 'invalid'])('rejects invalid instant %j', (updatedAt) => {
    expect(FeatureSwitchSchema.safeParse({ ...disabled, updatedAt }).success).toBe(false);
  });

  it('rejects unknown states', () => {
    expect(FeatureSwitchStateSchema.safeParse('pending').success).toBe(false);
    expect(FeatureSwitchSchema.safeParse({ ...disabled, state: 'pending' }).success).toBe(false);
  });
});

describe('FeatureSwitchListSchema', () => {
  it('accepts empty lists and unique names', () => {
    const switches: FeatureSwitchList = [disabled, { ...disabled, name: 'owner-approval' }];
    expect(FeatureSwitchListSchema.parse([])).toEqual([]);
    expect(FeatureSwitchListSchema.parse(switches)).toEqual(switches);
  });

  it('rejects duplicate names even when states differ', () => {
    expect(FeatureSwitchListSchema.safeParse([
      disabled,
      { ...disabled, state: 'accesa', openLinks: [] },
    ]).success).toBe(false);
  });

  it('validates each function in the list', () => {
    expect(FeatureSwitchListSchema.safeParse([{ ...disabled, state: 'accesa' }]).success).toBe(false);
  });
});
