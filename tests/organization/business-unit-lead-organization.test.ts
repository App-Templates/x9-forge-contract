import { describe, expect, it } from 'vitest';
import { PaperclipCreateBusinessUnitInputSchema } from '../../src/capability/paperclip/tools.js';
import { MODEL_TIERS } from '../../src/model-router/model-tier.js';
import {
  BUSINESS_UNIT_LEAD_PROFILE_TEMPLATE,
  BusinessUnitLeadBirthRequestSchema,
  BusinessUnitLeadBirthResultSchema,
} from '../../src/organization/index.js';

const request = {
  requestId: 'birth-bu-research-1',
  tenantId: 'tenant-1',
  ownerId: 'owner-1',
  company: { companyId: 'company-1', name: 'Company One' },
  businessUnit: {
    slug: 'research',
    typeId: 'ricerca-mercato',
    name: 'Research',
    briefSection: 'Research the market and deliver a report for the company brief.',
    competencies: ['market research', 'competitor analysis'],
    referents: [
      { referentRef: 'anna-rossi', name: 'Anna Rossi', role: 'Head of Research', email: 'anna@example.com' },
      { referentRef: 'luca-bianchi', name: 'Luca Bianchi', role: 'Analyst', email: 'luca@example.com' },
    ],
  },
  profileTemplate: BUSINESS_UNIT_LEAD_PROFILE_TEMPLATE,
  model: { tier: MODEL_TIERS[0], llmModel: 'provider/model' },
  capabilities: ['cap-ricerca', 'cap-lab'],
  paperclipParticipant: { participantId: 'participant-1', roles: ['lead'] },
};

describe('Business unit lead birth organization', () => {
  it('preserves a historical request without organizationId', () => {
    expect(BusinessUnitLeadBirthRequestSchema.parse(request)).toEqual(request);
  });

  it('preserves the Director organizationId', () => {
    const input = { ...request, organizationId: 'org-director' };
    expect(BusinessUnitLeadBirthRequestSchema.parse(input)).toEqual(input);
  });

  it.each(['', 'o'.repeat(65)])('rejects invalid organizationId %j', (organizationId) => {
    const parsed = BusinessUnitLeadBirthRequestSchema.safeParse({ ...request, organizationId });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({ path: ['organizationId'] }),
      ]));
    }
  });

  it('accepts organizationId at the maximum length', () => {
    const input = { ...request, organizationId: 'o'.repeat(64) };
    expect(BusinessUnitLeadBirthRequestSchema.parse(input)).toEqual(input);
  });

  it('inherits organizationId in the Paperclip creation input', () => {
    const input = { ...request, organizationId: 'org-director', unitName: 'Research' };
    expect(PaperclipCreateBusinessUnitInputSchema.parse(input)).toEqual(input);
  });

  it('keeps organizationId out of the strict birth result', () => {
    const result = {
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
    };
    expect(BusinessUnitLeadBirthResultSchema.parse(result)).toEqual(result);
    expect(BusinessUnitLeadBirthResultSchema.safeParse({
      ...result, organizationId: 'org-director',
    }).success).toBe(false);
  });
});
