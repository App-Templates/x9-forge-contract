import { describe, expect, it } from 'vitest';
import {
  InternalMemoryDecisionRequestListQuerySchema,
  InternalMemoryDecisionRequestProjectListQuerySchema,
  InternalMemoryDecisionRequestReadResponseSchema,
  internalMemoryDecisionRequestListContract,
} from '../../src/http/index.js';

const currentQuery = { tenantId: '1', agentId: 'capo-orto-design', limit: 100 };
const planQuery = { ...currentQuery, planId: 'plan-orto-design-6576' };
const projectQuery = {
  tenantId: '1',
  agentId: 'director-orto',
  organizationId: 'orto',
  projectId: 'orto-design',
  limit: 100,
};
const request = {
  requestId: 'decision-orto-design-6576',
  tenantId: currentQuery.tenantId,
  organizationId: projectQuery.organizationId,
  projectId: projectQuery.projectId,
  subject: { kind: 'vertical_plan', planId: planQuery.planId, planVersion: 1, digest: 'a'.repeat(64) },
  question: 'Approve the saved design plan?',
  options: [{ optionId: 'approve', label: 'Approve the plan' }],
  requestedBy: {
    managementAgentId: currentQuery.agentId,
    runtimeAgentId: currentQuery.agentId,
    vaultAgentId: 17,
  },
  addressedTo: { ownerId: 'owner-orto' },
  channel: 'email',
  createdAt: '2026-11-12T08:00:00Z',
};
const decidedOutcome = {
  requestId: request.requestId,
  subject: request.subject,
  decidedBy: { kind: 'owner', ownerId: request.addressedTo.ownerId },
  decidedAt: '2026-11-12T09:00:00Z',
  channel: 'email',
  sourceRef: 'email-orto-design-6576',
  outcome: 'approved',
  optionId: 'approve',
};

describe('s6576 filtro-per-stato', () => {
  it('accepts and preserves open and decided filters matching the response states', () => {
    for (const state of ['open', 'decided'] as const) {
      const query = { ...planQuery, state };
      expect(InternalMemoryDecisionRequestListQuerySchema.parse(query)).toEqual(query);
      expect(internalMemoryDecisionRequestListContract.querySchema.parse(query)).toEqual(query);
      const response = { request, state, outcome: state === 'open' ? null : decidedOutcome };
      expect(InternalMemoryDecisionRequestReadResponseSchema.parse(response)).toEqual(response);
    }
  });

  it('rejects closed and empty state filters', () => {
    for (const state of ['closed', '']) {
      expect(InternalMemoryDecisionRequestListQuerySchema.safeParse({ ...planQuery, state }).success).toBe(false);
    }
  });

  it('keeps the Director project list unfiltered and rejects state', () => {
    expect(InternalMemoryDecisionRequestProjectListQuerySchema.parse(projectQuery)).toEqual(projectQuery);
    for (const state of ['open', 'decided']) {
      expect(InternalMemoryDecisionRequestProjectListQuerySchema.safeParse({ ...projectQuery, state }).success).toBe(false);
    }
  });

  it('preserves the current cap-email query and optional plan without a state', () => {
    for (const query of [currentQuery, planQuery]) {
      expect(InternalMemoryDecisionRequestListQuerySchema.parse(query)).toEqual(query);
      expect(internalMemoryDecisionRequestListContract.querySchema.parse(query)).toEqual(query);
    }
  });
});
