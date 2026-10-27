import { describe, expect, it } from 'vitest';
import { INTERNAL_TOKEN_HEADER } from '../src/auth/index.js';
import {
  BusinessUnitMembershipQuerySchema,
  BusinessUnitMembershipResponseSchema,
  INTERNAL_BUSINESS_UNIT_MEMBERSHIP_PATH,
  internalBusinessUnitMembershipReadContract,
  parseBusinessUnitMembershipResponse,
} from '../src/http/index.js';

const query = {
  tenantId: 'tenant-1',
  ownerId: 'owner-1',
  companyId: 'company-1',
  businessUnitSlug: 'research',
  managementAgentId: 'company-1-research',
};
const agentIdentity = {
  managementAgentId: 'company-1-research',
  runtimeAgentId: 'runtime-research-1',
  vaultAgentId: 17,
};
const observedAt = '2026-10-27T10:00:00Z';
const member = { state: 'member', groupId: 'group-1', observedAt };
const response = {
  tenantId: query.tenantId,
  ownerId: query.ownerId,
  companyId: query.companyId,
  businessUnitSlug: query.businessUnitSlug,
  agentIdentity,
  membership: member,
};

describe('business unit membership contract', () => {
  it('declares a GET token contract on the shared path', () => {
    expect(internalBusinessUnitMembershipReadContract.method).toBe('GET');
    expect(internalBusinessUnitMembershipReadContract.path).toBe(INTERNAL_BUSINESS_UNIT_MEMBERSHIP_PATH);
    expect(internalBusinessUnitMembershipReadContract.authHeader).toBe(INTERNAL_TOKEN_HEADER);
  });

  it('accepts member evidence', () => {
    expect(internalBusinessUnitMembershipReadContract.responseSchema.safeParse(response).success).toBe(true);
    expect(parseBusinessUnitMembershipResponse(response, query).membership).toEqual(member);
  });

  it('accepts absent evidence', () => {
    const absent = { ...response, membership: { state: 'absent', observedAt } };
    expect(parseBusinessUnitMembershipResponse(absent, query).membership.state).toBe('absent');
  });

  it.each(Object.keys(query))('rejects a query without %s', (field) => {
    const { [field]: _removed, ...incomplete } = query as Record<string, string>;
    expect(BusinessUnitMembershipQuerySchema.safeParse(incomplete).success).toBe(false);
  });

  it('rejects a query with an extra field', () => {
    expect(BusinessUnitMembershipQuerySchema.safeParse({ ...query, extra: 'x' }).success).toBe(false);
  });

  it.each([
    ['vaultAgentId 0', { ...agentIdentity, vaultAgentId: 0 }],
    ['empty managementAgentId', { ...agentIdentity, managementAgentId: '' }],
    ['missing runtimeAgentId', { managementAgentId: agentIdentity.managementAgentId, vaultAgentId: 17 }],
  ])('rejects an invalid identity: %s', (_name, identity) => {
    expect(BusinessUnitMembershipResponseSchema.safeParse({ ...response, agentIdentity: identity }).success).toBe(
      false,
    );
  });

  it.each([
    ['tenantId', { tenantId: 'tenant-2' }],
    ['ownerId', { ownerId: 'owner-2' }],
    ['companyId', { companyId: 'company-2' }],
    ['businessUnitSlug', { businessUnitSlug: 'sales' }],
    ['managementAgentId', { agentIdentity: { ...agentIdentity, managementAgentId: 'company-1-sales' } }],
  ])('throws on a foreign %s', (_name, override) => {
    expect(() => parseBusinessUnitMembershipResponse({ ...response, ...override }, query)).toThrow(
      'business_unit_membership_mismatch',
    );
  });

  it.each([
    ['membership missing', (() => { const { membership: _m, ...rest } = response; return rest; })()],
    ['member without groupId', { ...response, membership: { state: 'member', observedAt } }],
    ['observedAt missing', { ...response, membership: { state: 'absent' } }],
    ['observedAt without offset', { ...response, membership: { state: 'absent', observedAt: '2026-10-27T10:00:00' } }],
  ])('rejects missing evidence: %s', (_name, payload) => {
    expect(BusinessUnitMembershipResponseSchema.safeParse(payload).success).toBe(false);
    expect(() => parseBusinessUnitMembershipResponse(payload, query)).toThrow();
  });
});
