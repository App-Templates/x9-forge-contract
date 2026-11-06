import { describe, expect, it } from 'vitest';
import {
  EFFECTIVE_MODEL_SLOT_STATUSES,
  EffectiveModelSlotSchema,
  EffectiveModelSlotStatusSchema,
  EffectiveSlotRetirementReasonSchema,
  EffectiveSlotRetirementSchema,
  type EffectiveModelSlot,
  type EffectiveModelSlotStatus,
  type EffectiveSlotRetirement,
} from '../../src/model-router/index.js';

const standard = {
  provider: 'openai', modelId: 'gpt-5.6-luna', protocol: 'responses', adapterId: 'openai-live-delegation',
} as const;
const advanced = { ...standard, modelId: 'gpt-5.6-terra' };

// Same agent_chat choice as the captured Vault response in effective-models.test.ts.
const agentChat: EffectiveModelSlot = {
  choice: {
    capability: 'agent-core', function: 'reasoning', mode: 'automatic',
    tiers: { standard, advanced, reasoning: advanced }, fallback: standard,
  },
  origin: 'preset', version: 2, status: 'active',
  credentialKey: 'OPENAI_API_KEY', credentialVersion: 4,
};
const retirement: EffectiveSlotRetirement = {
  modelId: 'previous-model', reason: 'registry', observedAt: '2026-11-06T01:00:00+01:00',
};

describe('effective slot retirement', () => {
  it('preserves the active slot currently produced by Vault with optional upgradedFrom', () => {
    expect(EffectiveModelSlotSchema.parse(agentChat)).toEqual(agentChat);
    const upgraded = { ...agentChat, upgradedFrom: retirement.modelId };
    expect(EffectiveModelSlotSchema.parse(upgraded)).toEqual(upgraded);
  });

  it('accepts an active successor applied while the retired model was pinned', () => {
    const upgraded = {
      ...agentChat, upgradedFrom: retirement.modelId,
      upgradedAt: '2026-11-06T01:05:00+01:00', upgradedWhilePinned: true,
    };
    expect(EffectiveModelSlotSchema.parse(upgraded)).toEqual(upgraded);
  });

  it('rejects upgradedAt without upgradedFrom', () => {
    expect(EffectiveModelSlotSchema.safeParse({
      ...agentChat, upgradedAt: '2026-11-06T00:05:00Z',
    }).success).toBe(false);
  });

  it('rejects upgradedWhilePinned without upgradedFrom', () => {
    expect(EffectiveModelSlotSchema.safeParse({ ...agentChat, upgradedWhilePinned: true }).success).toBe(false);
  });

  it('accepts pinned upgrade metadata without requiring an upgrade timestamp', () => {
    const upgraded = { ...agentChat, upgradedFrom: retirement.modelId, upgradedWhilePinned: true };
    expect(EffectiveModelSlotSchema.parse(upgraded)).toEqual(upgraded);
  });

  it('rejects upgradedWhilePinned false', () => {
    expect(EffectiveModelSlotSchema.safeParse({
      ...agentChat, upgradedFrom: retirement.modelId, upgradedWhilePinned: false,
    }).success).toBe(false);
  });

  it.each(['retired', 'retired-no-successor'] as const)('requires retirement metadata for %s', status => {
    expect(EffectiveModelSlotSchema.safeParse({ ...agentChat, status }).success).toBe(false);
    const retired = { ...agentChat, status, retirement };
    expect(EffectiveModelSlotSchema.parse(retired)).toEqual(retired);
  });

  it('rejects retirement metadata on an active slot, including an applied successor', () => {
    expect(EffectiveModelSlotSchema.safeParse({ ...agentChat, retirement }).success).toBe(false);
    expect(EffectiveModelSlotSchema.safeParse({
      ...agentChat, upgradedFrom: retirement.modelId, retirement,
    }).success).toBe(false);
  });

  it.each(['registry', 'provider-inventory', 'provider-error'] as const)('accepts retirement reason %s', reason => {
    const observed = { ...retirement, reason };
    expect(EffectiveSlotRetirementReasonSchema.parse(reason)).toBe(reason);
    expect(EffectiveSlotRetirementSchema.parse(observed)).toEqual(observed);
    const retired = { ...agentChat, status: 'retired-no-successor', retirement: observed };
    expect(EffectiveModelSlotSchema.parse(retired)).toEqual(retired);
  });

  it.each([
    { reason: 'guess' },
    { modelId: '' },
    { modelId: 'x'.repeat(101) },
    { observedAt: '2026-11-06T01:00:00' },
    { observedAt: 'not-a-date' },
    { extra: true },
  ])('rejects invalid retirement metadata %j', patch => {
    const invalid = { ...retirement, ...patch };
    expect(EffectiveSlotRetirementSchema.safeParse(invalid).success).toBe(false);
    expect(EffectiveModelSlotSchema.safeParse({
      ...agentChat, status: 'retired-no-successor', retirement: invalid,
    }).success).toBe(false);
  });

  it('rejects an upgrade timestamp without an explicit timezone', () => {
    expect(EffectiveModelSlotSchema.safeParse({
      ...agentChat, upgradedFrom: retirement.modelId, upgradedAt: '2026-11-06T01:05:00',
    }).success).toBe(false);
  });

  it('exports the unchanged status options through the model-router barrel', () => {
    const statuses: EffectiveModelSlotStatus[] = ['active', 'retired', 'retired-no-successor'];
    expect(EFFECTIVE_MODEL_SLOT_STATUSES).toEqual(statuses);
    expect(EffectiveModelSlotStatusSchema.options).toEqual(statuses);
    for (const status of statuses) expect(EffectiveModelSlotStatusSchema.parse(status)).toBe(status);
    expect(EffectiveModelSlotStatusSchema.safeParse('unknown').success).toBe(false);
  });
});
