import { describe, expect, it } from 'vitest';
import {
  EFFECTIVE_SLOT_ORIGINS,
  EffectiveModelSlotSchema,
  EffectiveSlotOriginSchema,
  MODEL_BINDING_ORIGINS,
  ModelBindingOriginSchema,
  ModelPresetKindSchema,
} from '../../dist/model-router/index.js';

describe('dist 1.106.3', () => {
  it('publishes the slot origin and the Master binding origin with today\'s values', () => {
    expect(EFFECTIVE_SLOT_ORIGINS).toEqual(['agent', 'preset']);
    expect(MODEL_BINDING_ORIGINS).toEqual(['master', 'custom']);
    expect(EffectiveSlotOriginSchema.options).toEqual(['agent', 'preset']);
    expect(ModelBindingOriginSchema.options).toEqual(['master', 'custom']);
    expect(EffectiveModelSlotSchema.shape.origin).toBe(EffectiveSlotOriginSchema);
    expect(ModelPresetKindSchema.options).toEqual(['platform', 'company']);
  });
});
