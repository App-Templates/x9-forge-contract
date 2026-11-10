import { expect, it } from 'vitest';
import { ListAgentsAgentSchema, ListAgentsResponseSchema } from '../../src/http/index.js';

const identity = { managementAgentId: 'synthetic-master', runtimeAgentId: 'synthetic-master-rt', vaultAgentId: 1 };
const authority = { agentId: identity.runtimeAgentId, ownerId: 'synthetic-owner', tenantId: 'synthetic-tenant', role: 'master', identity };
const master = { agentId: identity.runtimeAgentId, ownerId: authority.ownerId, displayName: 'Master', identity, authority };
const forgeAgent = { agentId: 'forge-agent', displayName: 'Forge agent', ownerId: 'synthetic-owner' };

it('s6124 inventario-senza-casella: ListAgentsAgentSchema keeps an optional emailInbox email address, and an inventory without it still parses', () => {
  // Inventory in the shape X9 serves today: no emailInbox anywhere.
  const today = { agents: [master, forgeAgent] };
  const parsedToday = ListAgentsResponseSchema.parse(today);
  expect(parsedToday).toEqual(today);
  expect(parsedToday.agents[0]).not.toHaveProperty('emailInbox');

  const withInbox = { ...forgeAgent, emailInbox: 'synthetic@agentmail.to' };
  expect(ListAgentsAgentSchema.parse(withInbox)).toEqual(withInbox);
});

it('s6124 emailInbox refuses a value that is not an email address', () => {
  for (const emailInbox of ['', 'not-an-email', '  ']) {
    expect(ListAgentsAgentSchema.safeParse({ ...forgeAgent, emailInbox }).success).toBe(false);
  }
});

it('s6124 listAgentsContract response keeps emailInbox for the primary agent row', () => {
  const input = { agents: [{ ...master, emailInbox: 'synthetic@agentmail.to' }, forgeAgent] };
  const parsed = ListAgentsResponseSchema.parse(input);
  expect(parsed).toEqual(input);
  expect(parsed.agents[0]?.emailInbox).toBe('synthetic@agentmail.to');
  expect(parsed.agents[1]).not.toHaveProperty('emailInbox');
});
