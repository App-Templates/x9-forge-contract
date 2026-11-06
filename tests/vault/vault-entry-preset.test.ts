import { describe, expect, it } from 'vitest';
import {
  VaultCascadeEntryPlainSchema,
  VaultEntryPlainSchema,
  presetScopeIssues,
} from '../../src/vault/index.js';

const preset = {
  id: 1,
  key: 'OPENAI_API_KEY',
  isCustomized: false,
  tier: 'preset',
  presetId: 3,
  agentId: null,
  ownerId: null,
  value: 'sk-test',
  isSecret: true,
};

describe('VaultCascadeEntryPlainSchema', () => {
  it('accepts a preset row with presetId and no agent/owner', () => {
    expect(VaultCascadeEntryPlainSchema.safeParse(preset).success).toBe(true);
  });

  it('rejects a preset row without presetId', () => {
    expect(VaultCascadeEntryPlainSchema.safeParse({ ...preset, presetId: null }).success).toBe(false);
  });

  it('rejects an agent row carrying a presetId', () => {
    const row = { ...preset, tier: 'agent', agentId: 7 };
    expect(VaultCascadeEntryPlainSchema.safeParse(row).success).toBe(false);
    expect(VaultCascadeEntryPlainSchema.safeParse({ ...row, presetId: null }).success).toBe(true);
  });

  it('rejects a preset row with an ownerId', () => {
    expect(VaultCascadeEntryPlainSchema.safeParse({ ...preset, ownerId: 2 }).success).toBe(false);
  });

  it('rejects a preset row with an agentId', () => {
    expect(VaultCascadeEntryPlainSchema.safeParse({ ...preset, agentId: 2 }).success).toBe(false);
  });

  it('rejects a secret whose value is in AES wire format', () => {
    const value = `${'a'.repeat(24)}:${'b'.repeat(32)}:cc`;
    expect(VaultCascadeEntryPlainSchema.safeParse({ ...preset, value }).success).toBe(false);
  });

  it('keeps today\'s three-tier schema unchanged', () => {
    const { presetId: _p, ...row } = preset;
    expect(VaultEntryPlainSchema.safeParse(row).success).toBe(false);
    expect(VaultEntryPlainSchema.safeParse({ ...row, tier: 'platform' }).success).toBe(true);
  });

  it('exports presetScopeIssues from the barrel', () => {
    expect(presetScopeIssues(preset)).toEqual([]);
    expect(presetScopeIssues({ ...preset, ownerId: 1 })).toHaveLength(1);
  });
});
