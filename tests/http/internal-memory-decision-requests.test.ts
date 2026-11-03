import { describe, expect, it } from 'vitest';
import {
  DecisionRequestErrorResponseSchema,
  INTERNAL_MEMORY_DECISION_REQUESTS_PATH,
  INTERNAL_MEMORY_DECISION_REQUEST_PATH,
  INTERNAL_MEMORY_DECISION_REQUEST_OUTCOME_PATH,
  internalMemoryDecisionRequestCreateContract as create,
  internalMemoryDecisionRequestReadContract as read,
  internalMemoryDecisionRequestOutcomeContract as outcome,
  internalMemoryDecisionRequestListContract as list,
} from '../../src/http/endpoints/index.js';

const request = {
  requestId: 'decision_259',
  tenantId: 'tenant-acme',
  organizationId: 'acme',
  question: 'Approve the Director plan?',
  options: [{ optionId: 'plan-a', label: 'Approve plan A' }],
  requestedBy: { managementAgentId: 'director', runtimeAgentId: 'director-runtime', vaultAgentId: 7 },
  addressedTo: { ownerId: 'owner-acme' },
  channel: 'email',
  createdAt: '2026-10-21T08:00:00Z',
};
const approved = {
  requestId: request.requestId,
  decidedBy: { kind: 'owner', ownerId: 'owner-acme' },
  decidedAt: '2026-10-21T09:00:00Z',
  channel: 'email',
  sourceRef: 'message-259',
  outcome: 'approved',
  optionId: 'plan-a',
};

describe('internal memory decision requests', () => {
  it('exports three secret-auth routes and validates their good examples', () => {
    expect([create.method, read.method, outcome.method]).toEqual(['POST', 'GET', 'POST']);
    expect([create.path, read.path, outcome.path]).toEqual([
      INTERNAL_MEMORY_DECISION_REQUESTS_PATH,
      INTERNAL_MEMORY_DECISION_REQUEST_PATH,
      INTERNAL_MEMORY_DECISION_REQUEST_OUTCOME_PATH,
    ]);
    for (const contract of [create, read, outcome]) expect(contract.authType).toBe('secret');
    expect(create.bodySchema.parse(request)).toEqual(request);
    const receipt = { requestId: request.requestId, state: 'open' };
    expect(create.responseSchema.parse(receipt)).toEqual(receipt);
    expect(read.paramsSchema.parse({ requestId: request.requestId })).toEqual({ requestId: request.requestId });
    expect(outcome.paramsSchema.parse({ requestId: request.requestId })).toEqual({ requestId: request.requestId });
    expect(read.querySchema.parse({ tenantId: request.tenantId, agentId: 'director' })).toEqual({
      tenantId: request.tenantId, agentId: 'director',
    });
    for (const view of [
      { request, state: 'open', outcome: null },
      { request, state: 'decided', outcome: approved },
    ]) expect(read.responseSchema.parse(view)).toEqual(view);
    expect(outcome.bodySchema.parse(approved)).toEqual(approved);
    const rejected = { ...approved, outcome: 'rejected', reason: 'Revise the budget' };
    const { optionId: _optionId, ...rejectedBody } = rejected;
    expect(outcome.bodySchema.parse(rejectedBody)).toEqual(rejectedBody);
    for (const result of ['recorded', 'duplicate']) {
      expect(outcome.responseSchema.parse({ result })).toEqual({ result });
    }
  });

  it('rejects a request without options', () => {
    const { options: _options, ...missingOptions } = request;
    expect(create.bodySchema.safeParse(missingOptions).success).toBe(false);
    expect(create.bodySchema.safeParse({ ...request, options: [] }).success).toBe(false);
  });

  it('rejects approved without optionId', () => {
    const { optionId: _optionId, ...missingOption } = approved;
    expect(outcome.bodySchema.safeParse(missingOption).success).toBe(false);
    expect(read.responseSchema.safeParse({ request, state: 'decided', outcome: missingOption }).success).toBe(false);
  });

  it('stato sconosciuto: rejects unknown states and outcome discriminators', () => {
    expect(create.responseSchema.safeParse({ requestId: request.requestId, state: 'unknown' }).success).toBe(false);
    expect(read.responseSchema.safeParse({ request, state: 'unknown', outcome: null }).success).toBe(false);
    expect(read.responseSchema.safeParse({ request, state: 'decided', outcome: { ...approved, outcome: 'unknown' } }).success).toBe(false);
    expect(read.responseSchema.safeParse({ request, state: 'open', outcome: approved }).success).toBe(false);
    expect(read.responseSchema.safeParse({ request, state: 'decided', outcome: null }).success).toBe(false);
    expect(outcome.responseSchema.safeParse({ result: 'unknown' }).success).toBe(false);
  });

  it('requires explicit tenant and agent scope', () => {
    for (const query of [{ tenantId: request.tenantId }, { agentId: 'director' }, { tenantId: '', agentId: 'director' }, { tenantId: request.tenantId, agentId: '' }]) {
      expect(read.querySchema.safeParse(query).success).toBe(false);
    }
    expect(read.paramsSchema.safeParse({ requestId: '' }).success).toBe(false);
  });

  it('exports the three specific error codes', () => {
    for (const code of ['decision_request_conflict', 'decision_request_not_found', 'decision_already_taken']) {
      expect(DecisionRequestErrorResponseSchema.parse({ code, message: 'Decision request failed' }).code).toBe(code);
    }
    expect(DecisionRequestErrorResponseSchema.safeParse({ code: 'unknown', message: 'Failure' }).success).toBe(false);
  });
});

describe('internal memory decision requests list (1.66.0)', () => {
  it('lists the requests of one agent, optionally of one plan, on the same path with GET', () => {
    expect(list).toMatchObject({ method: 'GET', path: INTERNAL_MEMORY_DECISION_REQUESTS_PATH, authType: 'secret' });
    expect(list.querySchema.parse({ tenantId: 'tenant-acme', agentId: 'director-runtime' })).toEqual({ tenantId: 'tenant-acme', agentId: 'director-runtime' });
    expect(list.querySchema.parse({ tenantId: 'tenant-acme', agentId: 'director-runtime', planId: 'plan_good01', limit: '20' }))
      .toEqual({ tenantId: 'tenant-acme', agentId: 'director-runtime', planId: 'plan_good01', limit: 20 });
    expect(list.querySchema.safeParse({ agentId: 'director-runtime' }).success).toBe(false);
    expect(list.querySchema.safeParse({ tenantId: 'tenant-acme', agentId: 'director-runtime', limit: 101 }).success).toBe(false);
    expect(list.querySchema.safeParse({ tenantId: 'tenant-acme', agentId: 'director-runtime', extra: 1 }).success).toBe(false);
  });

  it('answers open and decided requests', () => {
    const body = { requests: [
      { request, state: 'open', outcome: null },
      { request: { ...request, requestId: 'decision_260' }, state: 'decided', outcome: { ...approved, requestId: 'decision_260' } },
    ] };
    expect(list.responseSchema.parse(body)).toEqual(body);
    expect(list.responseSchema.safeParse({ requests: [{ request, state: 'decided', outcome: null }] }).success).toBe(false);
  });
});
