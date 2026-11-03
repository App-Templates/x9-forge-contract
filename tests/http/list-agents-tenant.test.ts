import { expect, it } from 'vitest';
import { ListAgentsAgentSchema, ListAgentsResponseSchema } from '../../src/http/index.js';
import { AgentTenantIdSchema } from '../../src/agent/index.js';

const identity = { managementAgentId: 'synthetic-management', runtimeAgentId: 'synthetic-runtime', vaultAgentId: 101 };
const authority = { agentId: identity.runtimeAgentId, ownerId: 'synthetic-owner', tenantId: 'synthetic-tenant', role: 'master', identity };
const row = { agentId: identity.runtimeAgentId, ownerId: authority.ownerId, displayName: 'Synthetic', identity, authority };

it('preserves an explicit tenant alongside complete identity and authority', () => {
  const input = { ...row, tenantId: 'synthetic-tenant' };
  expect(ListAgentsAgentSchema.parse(input)).toEqual(input);
});

it('keeps a missing tenant absent even when authority declares one', () => {
  const parsed = ListAgentsAgentSchema.parse(row);
  expect(parsed).toEqual(row);
  expect('tenantId' in parsed).toBe(false);
});

it('preserves a legacy row without a tenant, identity or authority', () => {
  const legacy = { agentId: 'legacy-agent', displayName: 'Legacy', ownerId: 'synthetic-owner' };
  const parsed = ListAgentsAgentSchema.parse(legacy);
  expect(parsed).toEqual(legacy);
  expect('tenantId' in parsed).toBe(false);
});

it.each(['', '  '])('rejects a blank explicit tenant %j', tenantId => {
  expect(ListAgentsAgentSchema.safeParse({ ...row, authority: null, tenantId }).success).toBe(false);
});

it('rejects an explicit tenant that differs from the declared authority', () => {
  const result = ListAgentsAgentSchema.safeParse({ ...row, tenantId: 'foreign' });
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues).toContainEqual(expect.objectContaining({
      code: 'custom',
      path: ['tenantId'],
      message: 'Explicit tenant must match the declared authority',
    }));
  }
});

it('preserves an explicit tenant when authority is null or absent', () => {
  const input = { ...row, authority: null, tenantId: 'synthetic-tenant' };
  expect(ListAgentsAgentSchema.parse(input)).toEqual(input);
  const withoutAuthority = { agentId: 'standalone-agent', displayName: 'Standalone', ownerId: 'synthetic-owner', tenantId: 'synthetic-tenant' };
  expect(ListAgentsAgentSchema.parse(withoutAuthority)).toEqual(withoutAuthority);
});

it('accepts an inventory with different tenants and a legacy row without one', () => {
  const otherIdentity = { managementAgentId: 'other-management', runtimeAgentId: 'other-runtime', vaultAgentId: 102 };
  const otherAuthority = { ...authority, agentId: otherIdentity.runtimeAgentId, tenantId: 'other-tenant', identity: otherIdentity };
  const input = { agents: [
    { ...row, tenantId: 'synthetic-tenant' },
    { ...row, agentId: otherIdentity.runtimeAgentId, identity: otherIdentity, authority: otherAuthority, tenantId: 'other-tenant' },
    { agentId: 'legacy-agent', displayName: 'Legacy', ownerId: 'synthetic-owner' },
  ] };
  const parsed = ListAgentsResponseSchema.parse(input);
  expect(parsed).toEqual(input);
  expect(parsed.agents[2]).not.toHaveProperty('tenantId');
});

it('exports the reusable tenant schema from the agent index without trimming values', () => {
  expect(AgentTenantIdSchema.parse('synthetic-tenant')).toBe('synthetic-tenant');
  expect(AgentTenantIdSchema.parse(' synthetic-tenant ')).toBe(' synthetic-tenant ');
  for (const tenantId of ['', '  ']) {
    expect(AgentTenantIdSchema.safeParse(tenantId).success).toBe(false);
  }
});
