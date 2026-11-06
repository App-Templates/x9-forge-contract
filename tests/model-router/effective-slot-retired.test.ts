import { describe, expect, it } from 'vitest';
import {
  EffectiveModelSlotSchema,
  EffectiveSlotStateSchema,
  effectiveSlotStateFromSlot,
  slotFallback,
  type EffectiveModelSlot,
  type EffectiveSlotState,
} from '../../src/model-router/index.js';

const standard = {
  provider: 'openai', modelId: 'gpt-5.6-luna', protocol: 'responses', adapterId: 'openai-live-delegation',
} as const;
// Same choice and credential metadata as the existing Vault and service contract tests.
const active: EffectiveModelSlot = {
  choice: {
    capability: 'agent-core', function: 'reasoning', mode: 'automatic',
    tiers: { standard, advanced: standard, reasoning: standard }, fallback: standard,
  },
  origin: 'preset', version: 2, status: 'active',
  credentialKey: 'OPENAI_API_KEY', credentialVersion: 4,
};
const extra = {
  generation: { presetId: 3, agentGeneration: 5, presetGeneration: 7 },
  etag: 'm2-v2-1-3-5-7-abcdef0123456789',
};
const retirement = {
  modelId: 'previous-model', reason: 'provider-error', observedAt: '2026-11-06T01:00:00+01:00',
} as const;
const retiredState = {
  state: 'retired_no_successor', modelId: retirement.modelId, reason: retirement.reason,
} as const;
const configured: EffectiveSlotState = {
  state: 'configured', choice: active.choice, ...extra,
  credentialKey: active.credentialKey, credentialVersion: active.credentialVersion,
};

describe('retired slot state', () => {
  it.each(['registry', 'provider-inventory', 'provider-error'] as const)('accepts retirement reason %s', reason => {
    const state = { ...retiredState, reason };
    expect(EffectiveSlotStateSchema.parse(state)).toEqual(state);
  });

  it.each([
    { state: 'retired_no_successor', reason: retirement.reason },
    { ...retiredState, modelId: '' },
    { ...retiredState, modelId: 'x'.repeat(101) },
    { ...retiredState, reason: 'guess' },
    { ...retiredState, extra: true },
  ])('rejects invalid retirement state %j', state => {
    expect(EffectiveSlotStateSchema.safeParse(state).success).toBe(false);
  });

  it.each([null, { sameIdentity: true }, { sameIdentity: false }])('refuses a retired model with lastKnown %j', lastKnown => {
    expect(slotFallback(retiredState, lastKnown)).toBe('refuse');
  });

  it('maps a slot without a successor using its retirement model and reason', () => {
    const slot = EffectiveModelSlotSchema.parse({ ...active, status: 'retired-no-successor', retirement });
    const state = effectiveSlotStateFromSlot(slot, {
      ...extra, credential: { source: 'preset:3', counter: 4, revoked: false },
    });
    expect(state).toEqual(retiredState);
    expect(EffectiveSlotStateSchema.parse(state)).toEqual(retiredState);
  });

  it('rejects missing retirement metadata instead of inventing a model', () => {
    expect(() => effectiveSlotStateFromSlot({ ...active, status: 'retired-no-successor' }, extra)).toThrow();
  });

  it('keeps an active upgraded choice configured without adding optional credentials', () => {
    const slot = EffectiveModelSlotSchema.parse({ ...active, upgradedFrom: retirement.modelId });
    const state = effectiveSlotStateFromSlot(slot, extra);
    expect(state).toEqual(configured);
    expect(state.state === 'configured' && state.choice).toBe(slot.choice);
    expect(state).not.toHaveProperty('credential');
    expect(EffectiveSlotStateSchema.parse(state)).toEqual(configured);
  });

  it('keeps a retired slot with a successor configured', () => {
    const slot = EffectiveModelSlotSchema.parse({ ...active, status: 'retired', retirement });
    expect(effectiveSlotStateFromSlot(slot, extra)).toEqual(configured);
  });

  it.each([null, { source: 'preset:3', counter: 4, revoked: false } as const])('preserves an explicit credential %j', credential => {
    const state = effectiveSlotStateFromSlot(active, { ...extra, credential });
    expect(state).toEqual({ ...configured, credential });
    expect(EffectiveSlotStateSchema.parse(state)).toEqual(state);
  });

  it('preserves slots with no credential key or version', () => {
    const state = effectiveSlotStateFromSlot({ ...active, credentialKey: null, credentialVersion: null }, extra);
    expect(state).toEqual({ ...configured, credentialKey: null, credentialVersion: null });
    expect(EffectiveSlotStateSchema.parse(state)).toEqual(state);
  });

  const existingStates: EffectiveSlotState[] = [
    { state: 'disabled' },
    configured,
    { state: 'unconfigured' },
    { state: 'unavailable' },
    { state: 'identity_mismatch', field: 'ownerId' },
    { state: 'capability_disabled' },
  ];
  it.each(existingStates)('still accepts existing state $state without new required fields', state => {
    expect(EffectiveSlotStateSchema.parse(state)).toEqual(state);
  });
});
