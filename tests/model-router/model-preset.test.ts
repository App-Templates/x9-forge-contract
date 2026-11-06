import { describe, expect, it } from 'vitest';
import {
  MODEL_PRESET_KINDS,
  ModelPresetKindSchema,
  ModelPresetCompanyIdSchema,
  ModelPresetRefSchema,
  AgentPresetResolutionSchema,
  AgentPresetAttachmentSchema,
  selectBirthPreset,
  type ModelPresetKind,
  type ModelPresetRef,
  type AgentPresetResolution,
  type AgentPresetAttachment,
} from '../../src/model-router/index.js';

const platform: ModelPresetRef = {
  presetId: 1, kind: 'platform', tenantId: 'tenant-1', companyId: null,
};
const companyA: ModelPresetRef = {
  presetId: 2, kind: 'company', tenantId: 'tenant-1', companyId: 'company-a',
};
const companyB: ModelPresetRef = {
  presetId: 3, kind: 'company', tenantId: 'tenant-1', companyId: 'company-b',
};
const identity = { managementAgentId: 'x9-staging', runtimeAgentId: 'x9', vaultAgentId: 1 };

function attachment(): AgentPresetAttachment {
  return { identity: { ...identity }, tenantId: 'tenant-1', preset: { ...companyA }, resolvedBy: 'company', note: null };
}

function fallback(): AgentPresetAttachment {
  return {
    ...attachment(), preset: { ...platform }, resolvedBy: 'platform-fallback',
    note: 'No company preset exists; the platform preset was attached.',
  };
}

describe('model preset exports from the model-router barrel', () => {
  it('exports kinds, resolutions, schemas, types and selection', () => {
    expect(MODEL_PRESET_KINDS).toEqual(['platform', 'company']);
    for (const kind of MODEL_PRESET_KINDS) {
      const parsed: ModelPresetKind = ModelPresetKindSchema.parse(kind);
      expect(parsed).toBe(kind);
    }
    const resolution: AgentPresetResolution = AgentPresetResolutionSchema.parse('platform-fallback');
    expect(resolution).toBe('platform-fallback');
    expect(AgentPresetResolutionSchema.parse('company')).toBe('company');
    expect(ModelPresetKindSchema.safeParse('group').success).toBe(false);
    expect(AgentPresetResolutionSchema.safeParse('group').success).toBe(false);
    expect(selectBirthPreset).toBeTypeOf('function');
  });
});

describe('ModelPresetRefSchema', () => {
  it.each([platform, companyA])('accepts a valid $kind reference', preset => {
    expect(ModelPresetRefSchema.parse(preset)).toEqual(preset);
  });

  it.each([
    { ...companyA, companyId: null },
    { ...platform, companyId: 'company-a' },
    { presetId: 2, kind: 'company', tenantId: 'tenant-1' },
  ])('rejects a kind/company mismatch or missing companyId: %j', preset => {
    expect(ModelPresetRefSchema.safeParse(preset).success).toBe(false);
  });

  it.each([0, -1, 1.5])('rejects invalid presetId %s', presetId => {
    expect(ModelPresetRefSchema.safeParse({ ...platform, presetId }).success).toBe(false);
  });

  it.each(['', 'x'.repeat(65)])('rejects companyId outside the 1–64 character bounds: %j', companyId => {
    expect(ModelPresetCompanyIdSchema.safeParse(companyId).success).toBe(false);
    expect(ModelPresetRefSchema.safeParse({ ...companyA, companyId }).success).toBe(false);
  });

  it('accepts both companyId length boundaries', () => {
    for (const companyId of ['x', 'x'.repeat(64)]) {
      expect(ModelPresetRefSchema.parse({ ...companyA, companyId }).companyId).toBe(companyId);
    }
  });

  it('requires a nonempty tenant and rejects undeclared fields', () => {
    expect(ModelPresetRefSchema.safeParse({ ...platform, tenantId: '' }).success).toBe(false);
    expect(ModelPresetRefSchema.safeParse({ ...platform, extra: true }).success).toBe(false);
  });
});

describe('AgentPresetAttachmentSchema', () => {
  it('accepts a company attachment with complete identity and no note', () => {
    expect(AgentPresetAttachmentSchema.parse(attachment())).toEqual(attachment());
  });

  it('accepts platform fallback with a trimmed birth report note', () => {
    const input = fallback();
    expect(AgentPresetAttachmentSchema.parse({ ...input, note: `  ${input.note}  ` })).toEqual(input);
    expect(AgentPresetAttachmentSchema.parse({ ...input, note: 'x'.repeat(500) }).note).toHaveLength(500);
  });

  it('rejects attachment to a preset from another tenant', () => {
    const input = attachment();
    expect(AgentPresetAttachmentSchema.safeParse({
      ...input, preset: { ...input.preset, tenantId: 'tenant-2' },
    }).success).toBe(false);
  });

  it.each([null, '', '   ', 'x'.repeat(501)])('rejects platform fallback with invalid note %j', note => {
    expect(AgentPresetAttachmentSchema.safeParse({ ...fallback(), note }).success).toBe(false);
  });

  it('rejects platform fallback without the note field', () => {
    const { note, ...input } = fallback();
    expect(note).toBeTypeOf('string');
    expect(AgentPresetAttachmentSchema.safeParse(input).success).toBe(false);
  });

  it('rejects company resolution with a platform preset', () => {
    expect(AgentPresetAttachmentSchema.safeParse({ ...attachment(), preset: platform }).success).toBe(false);
  });

  it('rejects platform fallback resolution with a company preset even with a note', () => {
    expect(AgentPresetAttachmentSchema.safeParse({ ...fallback(), preset: companyA }).success).toBe(false);
  });

  it.each([
    { runtimeAgentId: 'x9', vaultAgentId: 1 },
    { managementAgentId: 'x9-staging', vaultAgentId: 1 },
    { managementAgentId: 'x9-staging', runtimeAgentId: 'x9' },
    { ...identity, managementAgentId: ' ' },
    { ...identity, runtimeAgentId: ' ' },
    { ...identity, vaultAgentId: 0 },
  ])('rejects an incomplete or invalid identity: %j', incomplete => {
    expect(AgentPresetAttachmentSchema.safeParse({ ...attachment(), identity: incomplete }).success).toBe(false);
  });

  it('requires identity and tenant, and rejects undeclared fields', () => {
    const { identity: omittedIdentity, ...withoutIdentity } = attachment();
    const { tenantId, ...withoutTenant } = attachment();
    expect(omittedIdentity).toEqual(identity);
    expect(tenantId).toBe('tenant-1');
    expect(AgentPresetAttachmentSchema.safeParse(withoutIdentity).success).toBe(false);
    expect(AgentPresetAttachmentSchema.safeParse(withoutTenant).success).toBe(false);
    expect(AgentPresetAttachmentSchema.safeParse({ ...attachment(), tenantId: '' }).success).toBe(false);
    expect(AgentPresetAttachmentSchema.safeParse({ ...attachment(), extra: true }).success).toBe(false);
  });
});

describe('selectBirthPreset', () => {
  it('selects each company by companyId within the same tenant', () => {
    const presets: readonly ModelPresetRef[] = [platform, companyB, companyA];
    for (const company of [companyA, companyB]) {
      expect(selectBirthPreset(presets, { tenantId: 'tenant-1', companyId: company.companyId })).toEqual({
        ok: true, preset: company, resolvedBy: 'company',
      });
    }
  });

  it('ignores a company with the same companyId in another tenant and falls back', () => {
    const otherTenantCompany = { ...companyA, tenantId: 'tenant-2' };
    expect(selectBirthPreset([otherTenantCompany, platform], { tenantId: 'tenant-1', companyId: 'company-a' })).toEqual({
      ok: true, preset: platform, resolvedBy: 'platform-fallback',
    });
  });

  it('does not treat another tenant company as an ambiguous duplicate', () => {
    expect(selectBirthPreset([companyA, { ...companyA, tenantId: 'tenant-2' }], {
      tenantId: 'tenant-1', companyId: 'company-a',
    })).toEqual({ ok: true, preset: companyA, resolvedBy: 'company' });
  });

  it('falls back when only other companies have presets', () => {
    expect(selectBirthPreset([companyB, platform], { tenantId: 'tenant-1', companyId: 'company-a' })).toEqual({
      ok: true, preset: platform, resolvedBy: 'platform-fallback',
    });
  });

  it.each([
    { presets: [] },
    { presets: [companyB] },
    { presets: [{ ...platform, tenantId: 'tenant-2' }] },
  ])('reports no-platform-preset when the tenant has no matching company or platform: %j', ({ presets }) => {
    expect(selectBirthPreset(presets, { tenantId: 'tenant-1', companyId: 'company-a' })).toEqual({
      ok: false, error: 'no-platform-preset',
    });
  });

  it('rejects two matching companies without falling back to a platform', () => {
    expect(selectBirthPreset([companyA, { ...companyA, presetId: 4 }, platform], {
      tenantId: 'tenant-1', companyId: 'company-a',
    })).toEqual({ ok: false, error: 'ambiguous-preset' });
  });

  it.each(['company-a', null])('rejects two tenant platforms on fallback for companyId %j', companyId => {
    expect(selectBirthPreset([platform, { ...platform, presetId: 4 }], {
      tenantId: 'tenant-1', companyId,
    })).toEqual({ ok: false, error: 'ambiguous-preset' });
  });

  it('ignores platforms from other tenants when resolving platform ambiguity', () => {
    expect(selectBirthPreset([{ ...platform, tenantId: 'tenant-2' }, platform], {
      tenantId: 'tenant-1', companyId: null,
    })).toEqual({ ok: true, preset: platform, resolvedBy: 'platform-fallback' });
  });

  it('selects the tenant platform for a null companyId even when companies exist', () => {
    expect(selectBirthPreset([companyA, platform, companyB], { tenantId: 'tenant-1', companyId: null })).toEqual({
      ok: true, preset: platform, resolvedBy: 'platform-fallback',
    });
  });

  it('selects a unique company before considering absent or duplicate platforms', () => {
    for (const presets of [[companyA], [platform, { ...platform, presetId: 4 }, companyA]]) {
      expect(selectBirthPreset(presets, { tenantId: 'tenant-1', companyId: 'company-a' })).toEqual({
        ok: true, preset: companyA, resolvedBy: 'company',
      });
    }
  });
});
