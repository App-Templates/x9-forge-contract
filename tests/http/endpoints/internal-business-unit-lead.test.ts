import { describe, expect, it } from 'vitest';
import { INTERNAL_TOKEN_HEADER } from '../../../src/auth/index.js';
import {
  INTERNAL_BUSINESS_UNIT_LEAD_BIRTH_PATH,
  internalBusinessUnitLeadBirthContract,
} from '../../../src/http/index.js';
import { MODEL_TIERS } from '../../../src/model-router/model-tier.js';
import {
  BusinessUnitLeadBirthRequestSchema,
  BusinessUnitLeadBirthResultSchema,
} from '../../../src/organization/business-unit-lead.js';

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
    ],
  },
  profileTemplate: 'capo-bu',
  model: { tier: MODEL_TIERS[0], llmModel: 'provider/model' },
  capabilities: ['cap-ricerca', 'cap-lab'],
  paperclipParticipant: { participantId: 'participant-1', roles: ['lead'] },
};

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

describe('internalBusinessUnitLeadBirthContract', () => {
  it('publishes the exact POST path with token authentication and shared schemas', () => {
    expect(INTERNAL_BUSINESS_UNIT_LEAD_BIRTH_PATH).toBe('/api/internal/factory/business-unit-lead');
    expect(internalBusinessUnitLeadBirthContract.path).toBe(INTERNAL_BUSINESS_UNIT_LEAD_BIRTH_PATH);
    expect(internalBusinessUnitLeadBirthContract.method).toBe('POST');
    expect(internalBusinessUnitLeadBirthContract.authType).toBe('token');
    expect(internalBusinessUnitLeadBirthContract.authHeader).toBe(INTERNAL_TOKEN_HEADER);
    expect(internalBusinessUnitLeadBirthContract.bodySchema).toBe(BusinessUnitLeadBirthRequestSchema);
    expect(internalBusinessUnitLeadBirthContract.responseSchema).toBe(BusinessUnitLeadBirthResultSchema);
  });

  it('accepts a valid birth request', () => {
    expect(internalBusinessUnitLeadBirthContract.bodySchema.parse(request)).toEqual(request);
  });

  it('rejects a request without businessUnit.typeId', () => {
    const { typeId: _typeId, ...withoutType } = request.businessUnit;
    const parsed = internalBusinessUnitLeadBirthContract.bodySchema.safeParse({ ...request, businessUnit: withoutType });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({ path: ['businessUnit', 'typeId'] }),
      ]));
    }
  });

  it('rejects a request without paperclipParticipant', () => {
    const { paperclipParticipant: _participant, ...withoutParticipant } = request;
    const parsed = internalBusinessUnitLeadBirthContract.bodySchema.safeParse(withoutParticipant);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({ path: ['paperclipParticipant'] }),
      ]));
    }
  });

  it('accepts a complete birth result', () => {
    expect(internalBusinessUnitLeadBirthContract.responseSchema.parse(result)).toEqual(result);
  });

  it('rejects a response without agentIdentity', () => {
    const { agentIdentity: _identity, ...withoutIdentity } = result;
    const parsed = internalBusinessUnitLeadBirthContract.responseSchema.safeParse(withoutIdentity);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({ path: ['agentIdentity'] }),
      ]));
    }
  });
});
