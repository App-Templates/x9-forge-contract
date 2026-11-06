import { describe, expect, it } from 'vitest';
import { BusinessUnitLeadBirthResultSchema } from '../../src/organization/index.js';

const validResult = () => ({
  ok: true,
  replayed: false,
  tenantId: 'tenant-1',
  companyId: 'company-1',
  businessUnitSlug: 'research',
  agentIdentity: {
    managementAgentId: 'company-1-research',
    runtimeAgentId: 'runtime-research-1',
    vaultAgentId: 17,
  },
});

const companyAttachment = () => ({
  identity: { managementAgentId: 'company-1-research', runtimeAgentId: 'runtime-research-1', vaultAgentId: 17 },
  tenantId: 'tenant-1',
  preset: { presetId: 4, kind: 'company', tenantId: 'tenant-1', companyId: 'company-1' },
  resolvedBy: 'company',
  note: null,
});

const fallbackAttachment = () => ({
  ...companyAttachment(),
  preset: { presetId: 1, kind: 'platform', tenantId: 'tenant-1', companyId: null },
  resolvedBy: 'platform-fallback',
  note: 'Company has no preset: attached to the platform preset.',
});

const parse = (modelPreset: unknown) => BusinessUnitLeadBirthResultSchema.safeParse({ ...validResult(), modelPreset });

describe('BusinessUnitLeadBirthResultSchema modelPreset', () => {
  it('accepts a receipt written before the preset existed', () => {
    expect(BusinessUnitLeadBirthResultSchema.parse(validResult())).toEqual(validResult());
  });

  it('accepts a coherent company attachment', () => {
    expect(parse(companyAttachment()).success).toBe(true);
  });

  it('accepts a platform fallback with its note', () => {
    expect(parse(fallbackAttachment()).success).toBe(true);
  });

  it('rejects an attachment of another tenant', () => {
    const attachment = { ...companyAttachment(), tenantId: 'tenant-2', preset: { ...companyAttachment().preset, tenantId: 'tenant-2' } };
    expect(parse(attachment).success).toBe(false);
  });

  it('rejects an attachment for another vault agent', () => {
    const attachment = { ...companyAttachment(), identity: { ...companyAttachment().identity, vaultAgentId: 18 } };
    const parsed = parse(attachment);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({ path: ['modelPreset', 'identity', 'vaultAgentId'] }),
      ]));
    }
  });

  it.each(['managementAgentId', 'runtimeAgentId'] as const)('rejects a different %s', (field) => {
    const attachment = { ...companyAttachment(), identity: { ...companyAttachment().identity, [field]: 'other-agent' } };
    expect(parse(attachment).success).toBe(false);
  });

  it('rejects a company resolution with the preset of another company', () => {
    const attachment = { ...companyAttachment(), preset: { ...companyAttachment().preset, companyId: 'company-2' } };
    expect(parse(attachment).success).toBe(false);
  });

  it('rejects an unknown field in the receipt', () => {
    expect(BusinessUnitLeadBirthResultSchema.safeParse({ ...validResult(), extra: 1 }).success).toBe(false);
  });

  it('rejects an unknown field in the attachment', () => {
    expect(parse({ ...companyAttachment(), extra: 1 }).success).toBe(false);
  });
});
