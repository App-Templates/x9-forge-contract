import { describe, expect, it } from 'vitest';
import {
  AgentPresetAttachmentSchema,
  EffectiveModelSlotStatusSchema,
  EffectiveSlotStateSchema,
  MODEL_SUCCESSION_TABLE,
  ModelRetirementNoticeSchema,
  internalModelsRetiredObservedContract,
  rebuildDecision,
  resolveSuccessor,
  selectBirthPreset,
} from '../../dist/model-router/index.js';
import { BusinessUnitLeadBirthResultSchema } from '../../dist/organization/index.js';

describe('dist 1.106.0', () => {
  it('exports the retirement and preset contracts', () => {
    for (const fn of [selectBirthPreset, resolveSuccessor, rebuildDecision]) expect(typeof fn).toBe('function');
    for (const value of [AgentPresetAttachmentSchema, EffectiveModelSlotStatusSchema, ModelRetirementNoticeSchema, internalModelsRetiredObservedContract]) {
      expect(value).toBeDefined();
    }
    expect(MODEL_SUCCESSION_TABLE.length).toBe(0);
  });

  it('accepts the retired_no_successor state', () => {
    const parsed = EffectiveSlotStateSchema.safeParse({ state: 'retired_no_successor', modelId: 'gpt-old', reason: 'registry' });
    expect(parsed.success).toBe(true);
  });

  it('still accepts a birth receipt without modelPreset', () => {
    const parsed = BusinessUnitLeadBirthResultSchema.safeParse({
      ok: true,
      replayed: false,
      tenantId: 'tenant-1',
      companyId: 'company-1',
      businessUnitSlug: 'research',
      agentIdentity: { managementAgentId: 'company-1-research', runtimeAgentId: 'runtime-research-1', vaultAgentId: 17 },
    });
    expect(parsed.success).toBe(true);
  });
});
