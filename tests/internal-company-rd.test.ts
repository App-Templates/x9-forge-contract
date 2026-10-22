import { describe, expect, it } from 'vitest';
import { INTERNAL_TOKEN_HEADER } from '../src/auth/index.js';
import {
  COMPANY_RD_PARTS,
  CompanyRdBirthRequestSchema,
  CompanyRdBirthResultSchema,
  INTERNAL_COMPANY_RD_BIRTH_PATH,
  internalCompanyRdBirthContract,
} from '../src/http/endpoints/index.js';

const request = {
  requestId: 'birth-rd-1',
  tenantId: 'tenant-1',
  ownerId: 'owner-1',
  company: { companyId: 'company-1', name: 'Company One' },
};

const identity = (n: number) => ({
  managementAgentId: `company-1-agent-${n}`,
  runtimeAgentId: `runtime-agent-${n}`,
  vaultAgentId: n,
});

const result = {
  ok: true,
  replayed: false,
  tenantId: 'tenant-1',
  companyId: 'company-1',
  agents: [
    { part: 'ricerca', agentIdentity: identity(1) },
    { part: 'lab', agentIdentity: identity(2) },
  ],
};

describe('internalCompanyRdBirthContract', () => {
  it('publishes the POST path with token authentication and the shared schemas', () => {
    expect(INTERNAL_COMPANY_RD_BIRTH_PATH).toBe('/api/internal/factory/company-rd');
    expect(internalCompanyRdBirthContract.method).toBe('POST');
    expect(internalCompanyRdBirthContract.path).toBe('/api/internal/factory/company-rd');
    expect(internalCompanyRdBirthContract.authType).toBe('token');
    expect(internalCompanyRdBirthContract.authHeader).toBe(INTERNAL_TOKEN_HEADER);
    expect(internalCompanyRdBirthContract.bodySchema).toBe(CompanyRdBirthRequestSchema);
    expect(internalCompanyRdBirthContract.responseSchema).toBe(CompanyRdBirthResultSchema);
    expect(COMPANY_RD_PARTS).toEqual(['ricerca', 'lab']);
  });

  it('accepts a valid request and rejects unknown or missing fields', () => {
    expect(CompanyRdBirthRequestSchema.safeParse(request).success).toBe(true);
    expect(CompanyRdBirthRequestSchema.safeParse({ ...request, extra: 1 }).success).toBe(false);
    expect(CompanyRdBirthRequestSchema.safeParse({ ...request, tenantId: '' }).success).toBe(false);
    const { company: _company, ...withoutCompany } = request;
    expect(CompanyRdBirthRequestSchema.safeParse(withoutCompany).success).toBe(false);
  });

  it('accepts a result with one ricerca and one lab agent', () => {
    expect(CompanyRdBirthResultSchema.safeParse(result).success).toBe(true);
  });

  it('rejects a result with due ricerca', () => {
    const doubled = {
      ...result,
      agents: [
        { part: 'ricerca', agentIdentity: identity(1) },
        { part: 'ricerca', agentIdentity: identity(2) },
      ],
    };
    expect(CompanyRdBirthResultSchema.safeParse(doubled).success).toBe(false);
  });

  it('rejects a result with a single agent or an unknown part', () => {
    expect(CompanyRdBirthResultSchema.safeParse({ ...result, agents: result.agents.slice(0, 1) }).success).toBe(false);
    expect(
      CompanyRdBirthResultSchema.safeParse({
        ...result,
        agents: [result.agents[0], { part: 'other', agentIdentity: identity(2) }],
      }).success,
    ).toBe(false);
  });
});
