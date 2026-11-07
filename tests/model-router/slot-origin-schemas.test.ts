import { describe, expect, it } from 'vitest';
import {
  AgentModelsMasterImpactSchema,
  EFFECTIVE_SLOT_ORIGINS,
  EffectiveModelSlotSchema,
  EffectiveSlotOriginSchema,
  MODEL_BINDING_ORIGINS,
  ModelBindingOriginSchema,
  type EffectiveModelSlot,
} from '../../src/model-router/index.js';

// Same active memory choice shape as the existing effective-model response tests.
const slot: EffectiveModelSlot = {
  choice: {
    capability: 'memory', function: 'memory-extraction', mode: 'single',
    descriptor: {
      provider: 'openai', modelId: 'gpt-4.1-mini', protocol: 'chat-completions', adapterId: 'openai-chat',
    },
  },
  origin: 'agent', version: 1, status: 'active', credentialKey: null, credentialVersion: null,
};

describe('exported slot origin schemas', () => {
  it('exports exactly the existing effective slot origins', () => {
    expect(EFFECTIVE_SLOT_ORIGINS).toEqual(['agent', 'preset']);
    expect(EffectiveSlotOriginSchema.options).toEqual(['agent', 'preset']);
  });

  it('exports exactly the existing model binding origins', () => {
    expect(MODEL_BINDING_ORIGINS).toEqual(['master', 'custom']);
    expect(ModelBindingOriginSchema.options).toEqual(['master', 'custom']);
  });

  it('reuses the exported effective slot origin schema by identity', () => {
    expect(EffectiveModelSlotSchema.shape.origin).toBe(EffectiveSlotOriginSchema);
  });

  it('reuses the exported model binding origin schema by identity', () => {
    expect(AgentModelsMasterImpactSchema.shape.recipients.element.shape.slots.element.shape.binding)
      .toBe(ModelBindingOriginSchema);
  });

  it.each(['agent', 'preset'] as const)('accepts an existing effective slot with origin %s', origin => {
    const input = { ...slot, origin };
    expect(EffectiveModelSlotSchema.parse(input)).toEqual(input);
  });

  it('rejects a Master origin on an effective slot', () => {
    expect(EffectiveModelSlotSchema.safeParse({ ...slot, origin: 'master' }).success).toBe(false);
  });

  it.each(['unknown', 'initial'])('rejects overview-only binding origin %s', binding => {
    expect(ModelBindingOriginSchema.safeParse(binding).success).toBe(false);
  });
});
