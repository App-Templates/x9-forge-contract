import { describe, expect, it } from 'vitest';
import {
  AgentPresetAttachmentRecordSchema,
  PresetAttachmentRecordSourceSchema,
  presetAttachmentAuthorityOf,
  presetAttachmentRecordFromBirth,
  isPlatformPresetSourceIdentity,
  ModelPresetKindSchema,
} from '../../dist/model-router/index.js';

describe('dist 1.111.0', () => {
  const identity = { managementAgentId: 'bu-7', runtimeAgentId: 'bu-7', vaultAgentId: 7 };
  const scope = { agentId: 'bu-7', ownerId: '1', tenantId: '1' };
  const agent = { id: 7, slug: 'bu-7', ownerId: 1 };

  it('publishes the saved attachment and accepts only its matching owner', () => {
    const record = { schemaVersion: 1, identity, scope, source: 'riallineamento' };

    expect(PresetAttachmentRecordSourceSchema.options).toEqual(['nascita', 'riallineamento']);
    expect(AgentPresetAttachmentRecordSchema.parse(record)).toEqual(record);
    expect(presetAttachmentAuthorityOf(record, agent)).toEqual({ identity, scope });
    expect(presetAttachmentAuthorityOf(record, { ...agent, ownerId: 2 })).toBeNull();
  });

  it('publishes the birth record builder', () => {
    const record = presetAttachmentRecordFromBirth({
      identity,
      tenantId: '1',
      preset: { presetId: 1, kind: 'platform', tenantId: '1', companyId: null },
      resolvedBy: 'platform-fallback',
      note: 'No company preset',
    }, '1');

    expect(record).toEqual({ schemaVersion: 1, identity, scope, source: 'nascita' });
    expect(AgentPresetAttachmentRecordSchema.parse(record)).toEqual(record);
    expect(presetAttachmentAuthorityOf(record, agent)).toEqual({ identity, scope });
  });

  it('preserves the platform preset source rule and preset kinds from 1.110.0', () => {
    expect(isPlatformPresetSourceIdentity({
      runtimeAgentId: 'x9',
      managementAgentId: 'x9-staging',
      vaultAgentId: 1,
    })).toBe(true);
    expect(isPlatformPresetSourceIdentity({
      runtimeAgentId: 'x9',
      managementAgentId: 'erede',
    })).toBe(false);
    expect(ModelPresetKindSchema.options).toEqual(['platform', 'company']);
  });
});
