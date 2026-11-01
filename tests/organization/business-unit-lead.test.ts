import { describe, expect, it } from 'vitest';
import { MODEL_TIERS } from '../../src/model-router/model-tier.js';
import { BusinessUnitTypeCardSchema } from '../../src/organization/business-unit-type.js';
import {
  BUSINESS_UNIT_LEAD_PROFILE_TEMPLATE,
  BusinessUnitLeadBirthRequestSchema,
  BusinessUnitLeadBirthResultSchema,
  BusinessUnitLeadProfileTemplateSchema,
} from '../../src/organization/index.js';

const validRequest = () => ({
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
  profileTemplate: 'capo-bu',
  model: { tier: MODEL_TIERS[0], llmModel: 'provider/model' },
  capabilities: ['cap-ricerca', 'cap-lab'],
  paperclipParticipant: { participantId: 'participant-1', roles: ['lead'] },
});

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

describe('BusinessUnitLeadBirthRequestSchema', () => {
  it('accepts a valid request', () => {
    expect(BusinessUnitLeadBirthRequestSchema.parse(validRequest())).toEqual(validRequest());
  });

  it('rejects a request without typeId', () => {
    const { typeId: _typeId, ...withoutType } = validRequest().businessUnit;
    const parsed = BusinessUnitLeadBirthRequestSchema.safeParse({ ...validRequest(), businessUnit: withoutType });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({ path: ['businessUnit', 'typeId'] }),
      ]));
    }
  });

  it.each(['a', 'Ricerca Mercato'])('rejects typeId %j', (typeId) => {
    const parsed = BusinessUnitLeadBirthRequestSchema.safeParse({
      ...validRequest(),
      businessUnit: { ...validRequest().businessUnit, typeId },
    });
    expect(parsed.success).toBe(false);
  });

  it('uses the same typeId schema as the business unit type card', () => {
    expect(BusinessUnitLeadBirthRequestSchema.shape.businessUnit.shape.typeId).toBe(
      BusinessUnitTypeCardSchema.shape.typeId,
    );
  });

  it('rejects duplicate capabilities', () => {
    const request = { ...validRequest(), capabilities: ['cap-ricerca', 'cap-ricerca'] };
    const parsed = BusinessUnitLeadBirthRequestSchema.safeParse(request);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({ path: ['capabilities'], message: 'Capability names must be unique' }),
      ]));
    }
  });

  it.each(['Research', 'research_unit', '-research', 'research-', 'research--unit', ''])(
    'rejects a non-kebab business unit slug: %s',
    (slug) => {
      const request = validRequest();
      expect(BusinessUnitLeadBirthRequestSchema.safeParse({
        ...request, businessUnit: { ...request.businessUnit, slug },
      }).success).toBe(false);
    },
  );

  it('rejects empty roles', () => {
    const request = validRequest();
    expect(BusinessUnitLeadBirthRequestSchema.safeParse({
      ...request, paperclipParticipant: { ...request.paperclipParticipant, roles: [] },
    }).success).toBe(false);
  });

  it('rejects a tier outside MODEL_TIERS', () => {
    expect(BusinessUnitLeadBirthRequestSchema.safeParse({
      ...validRequest(), model: { tier: 'unsupported-tier' },
    }).success).toBe(false);
  });

  it.each(MODEL_TIERS)('accepts tier %s without a model override', (tier) => {
    expect(BusinessUnitLeadBirthRequestSchema.safeParse({
      ...validRequest(), model: { tier },
    }).success).toBe(true);
  });

  it.each(['company', 'businessUnit', 'model', 'paperclipParticipant'] as const)(
    'rejects an extra key in %s',
    (field) => {
      const request = validRequest();
      expect(BusinessUnitLeadBirthRequestSchema.safeParse({
        ...request, [field]: { ...request[field], extra: 'unexpected' },
      }).success).toBe(false);
    },
  );

  it('rejects an extra request key', () => {
    expect(BusinessUnitLeadBirthRequestSchema.safeParse({
      ...validRequest(), extra: 'unexpected',
    }).success).toBe(false);
  });

  it('rejects invalid capability names', () => {
    expect(BusinessUnitLeadBirthRequestSchema.safeParse({
      ...validRequest(), capabilities: ['ricerca'],
    }).success).toBe(false);
  });

  it('publishes capo-bu as the only profile template', () => {
    expect(BUSINESS_UNIT_LEAD_PROFILE_TEMPLATE).toBe('capo-bu');
    expect(BusinessUnitLeadProfileTemplateSchema.parse('capo-bu')).toBe('capo-bu');
  });

  it.each(['bu-lead', 'capo-bu-dati', 'capo_BU', 'Capo-bu'])(
    'rejects a profile template other than capo-bu: %s',
    (profileTemplate) => {
      expect(BusinessUnitLeadBirthRequestSchema.safeParse({
        ...validRequest(), profileTemplate,
      }).success).toBe(false);
    },
  );

  it.each([
    { requestId: '' },
    { requestId: 'r'.repeat(129) },
    { tenantId: '' },
    { ownerId: '' },
    { company: { companyId: '', name: 'Company One' } },
    { company: { companyId: 'c'.repeat(65), name: 'Company One' } },
    { company: { companyId: 'company-1', name: '' } },
    { company: { companyId: 'company-1', name: 'n'.repeat(121) } },
    { businessUnit: { ...validRequest().businessUnit, slug: 's'.repeat(31) } },
    { businessUnit: { ...validRequest().businessUnit, name: '' } },
    { businessUnit: { ...validRequest().businessUnit, name: 'n'.repeat(121) } },
    { businessUnit: { ...validRequest().businessUnit, briefSection: '' } },
    { businessUnit: { ...validRequest().businessUnit, briefSection: 'b'.repeat(4001) } },
    { profileTemplate: '' },
    { model: { tier: MODEL_TIERS[0], llmModel: '' } },
    { paperclipParticipant: { participantId: '', roles: ['lead'] } },
    { paperclipParticipant: { participantId: 'participant-1', roles: ['unknown'] } },
  ])('rejects invalid required fields and limits (case %#)', (override) => {
    expect(BusinessUnitLeadBirthRequestSchema.safeParse({
      ...validRequest(), ...override,
    }).success).toBe(false);
  });

  it('accepts maximum lengths and an empty capability list', () => {
    expect(BusinessUnitLeadBirthRequestSchema.safeParse({
      ...validRequest(),
      requestId: 'r'.repeat(128),
      company: { companyId: 'c'.repeat(64), name: 'n'.repeat(120) },
      businessUnit: {
        slug: 's'.repeat(30),
        typeId: 'ricerca-mercato',
        name: 'n'.repeat(120),
        briefSection: 'b'.repeat(4000),
        competencies: Array.from({ length: 20 }, (_, i) => `${String(i).padStart(2, '0')}${'c'.repeat(198)}`),
        referents: Array.from({ length: 10 }, (_, i) => ({
          referentRef: `${'r'.repeat(38)}-${i}`,
          name: 'n'.repeat(120),
          role: 'r'.repeat(120),
          email: `person${i}@example.com`,
        })),
      },
      capabilities: [],
    }).success).toBe(true);
  });

  it('rejects a business unit without referents', () => {
    const { businessUnit } = validRequest();
    expect(BusinessUnitLeadBirthRequestSchema.safeParse({
      ...validRequest(), businessUnit: { ...businessUnit, referents: [] },
    }).success).toBe(false);
  });

  it('rejects duplicate referentRef', () => {
    const { businessUnit } = validRequest();
    const [first] = businessUnit.referents;
    const parsed = BusinessUnitLeadBirthRequestSchema.safeParse({
      ...validRequest(),
      businessUnit: {
        ...businessUnit,
        referents: [first, { ...first, name: 'Other', email: 'other@example.com' }],
      },
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects duplicate competencies', () => {
    const { businessUnit } = validRequest();
    expect(BusinessUnitLeadBirthRequestSchema.safeParse({
      ...validRequest(), businessUnit: { ...businessUnit, competencies: ['seo', 'seo'] },
    }).success).toBe(false);
  });

  it('rejects a business unit without competencies', () => {
    const { businessUnit } = validRequest();
    expect(BusinessUnitLeadBirthRequestSchema.safeParse({
      ...validRequest(), businessUnit: { ...businessUnit, competencies: [] },
    }).success).toBe(false);
  });

  it.each(['not-an-email', '', 'anna@'])('rejects a referent without a valid email: %s', (email) => {
    const { businessUnit } = validRequest();
    const [first, second] = businessUnit.referents;
    expect(BusinessUnitLeadBirthRequestSchema.safeParse({
      ...validRequest(), businessUnit: { ...businessUnit, referents: [{ ...first, email }, second] },
    }).success).toBe(false);
  });
});

describe('BusinessUnitLeadBirthResultSchema', () => {
  it.each([false, true])('accepts a valid result with replayed=%s', (replayed) => {
    const result = { ...validResult(), replayed };
    expect(BusinessUnitLeadBirthResultSchema.parse(result)).toEqual(result);
  });

  it('rejects a result without vaultAgentId', () => {
    expect(BusinessUnitLeadBirthResultSchema.safeParse({
      ...validResult(),
      agentIdentity: { managementAgentId: 'company-1-research', runtimeAgentId: 'runtime-research-1' },
    }).success).toBe(false);
  });

  it('rejects an extra result key', () => {
    expect(BusinessUnitLeadBirthResultSchema.safeParse({
      ...validResult(), extra: 'unexpected',
    }).success).toBe(false);
  });
});
