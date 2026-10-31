import { it, expect } from 'vitest';
import {
  PAPERCLIP_TOOLS,
  PaperclipCreateApprovedBusinessUnitsInputSchema,
  type PaperclipCreateApprovedBusinessUnitsInput,
} from '../src/capability/paperclip/index.js';

const decisionRequestId = 'dec_req_123456';

it('names the create-approved-business-units tool uniquely', () => {
  expect(PAPERCLIP_TOOLS.createApprovedBusinessUnits).toBe('paperclip_create_approved_business_units');
  const names = Object.values(PAPERCLIP_TOOLS);
  expect(new Set(names).size).toBe(names.length);
});

it('accepts only the approved decision request reference', () => {
  const input: PaperclipCreateApprovedBusinessUnitsInput = { decisionRequestId };
  expect(PaperclipCreateApprovedBusinessUnitsInputSchema.parse(input)).toEqual(input);
});

it.each([
  { label: 'missing ID', input: {} },
  { label: 'empty ID', input: { decisionRequestId: '' } },
  { label: 'short ID', input: { decisionRequestId: 'abc' } },
  { label: 'space in ID', input: { decisionRequestId: 'dec req_123456' } },
  { label: 'slash in ID', input: { decisionRequestId: 'dec/req_123456' } },
  { label: '65-character ID', input: { decisionRequestId: 'a'.repeat(65) } },
])('rejects invalid decision request references: $label', ({ input }) => {
  expect(PaperclipCreateApprovedBusinessUnitsInputSchema.safeParse(input).success).toBe(false);
});

it.each([
  { label: 'business units', input: { decisionRequestId, businessUnits: [{ slug: 'research' }] } },
  { label: 'tenant', input: { decisionRequestId, tenantId: 'tenant-1' } },
  { label: 'owner', input: { decisionRequestId, ownerId: 'owner-1' } },
  {
    label: 'agent identity',
    input: {
      decisionRequestId,
      agentIdentity: {
        managementAgentId: 'company-1-research', runtimeAgentId: 'runtime-research-1', vaultAgentId: 17,
      },
    },
  },
])('rejects caller-supplied fields: $label', ({ input }) => {
  expect(PaperclipCreateApprovedBusinessUnitsInputSchema.safeParse(input).success).toBe(false);
});
