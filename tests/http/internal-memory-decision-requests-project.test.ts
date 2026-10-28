import { Buffer } from 'node:buffer';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  INTERNAL_MEMORY_DECISION_REQUEST_PROJECT_LIST_PATH,
  InternalMemoryDecisionRequestProjectCursorSchema,
  InternalMemoryDecisionRequestProjectListQuerySchema,
  InternalMemoryDecisionRequestProjectListResponseSchema,
  InternalMemoryDecisionRequestReadResponseSchema,
  internalMemoryDecisionRequestListContract as agentList,
  internalMemoryDecisionRequestProjectListContract as projectList,
  type InternalMemoryDecisionRequestProjectCursor,
  type InternalMemoryDecisionRequestProjectListQuery,
  type InternalMemoryDecisionRequestProjectListResponse,
} from '../../src/http/index.js';
import type { DecisionOutcome, DecisionRequest, DeliveryDecisionSubject } from '../../src/organization/index.js';

const query = {
  tenantId: 'tenant-acme',
  agentId: 'director-runtime',
  organizationId: 'org-acme',
  projectId: 'project-website',
};
const cursor = {
  tenantId: query.tenantId,
  organizationId: query.organizationId,
  projectId: query.projectId,
  createdAt: '2026-10-28T08:00:00+02:00',
  requestId: 'delivery-365-b',
} satisfies InternalMemoryDecisionRequestProjectCursor;
const encodedCursor = Buffer.from(JSON.stringify(cursor)).toString('base64url');

const designSubject = {
  kind: 'delivery',
  organizationId: query.organizationId,
  projectId: query.projectId,
  buSlug: 'design',
  deliveryRef: { assetId: 'asset-design-365', sha256: 'a'.repeat(64) },
} satisfies DeliveryDecisionSubject;
const designRequest = {
  requestId: 'delivery-365-a',
  tenantId: query.tenantId,
  organizationId: query.organizationId,
  projectId: query.projectId,
  subject: designSubject,
  question: 'Approve this saved design delivery?',
  options: [{ optionId: 'approve-delivery', label: 'Approve the delivery' }],
  requestedBy: { managementAgentId: 'design-lead', runtimeAgentId: 'design-runtime', vaultAgentId: 17 },
  addressedTo: { kind: 'referent', email: 'design.referent@example.com' },
  channel: 'email',
  createdAt: cursor.createdAt,
} satisfies DecisionRequest;
const approved = {
  requestId: designRequest.requestId,
  subject: designSubject,
  decidedBy: designRequest.addressedTo,
  decidedAt: '2026-10-28T09:00:00+02:00',
  channel: 'email',
  sourceRef: 'email-design-approved-365',
  outcome: 'approved',
  optionId: 'approve-delivery',
} satisfies DecisionOutcome;
const developmentRequest = {
  ...designRequest,
  requestId: cursor.requestId,
  question: 'Approve this saved development delivery?',
  subject: {
    ...designSubject,
    buSlug: 'sviluppo',
    deliveryRef: { assetId: 'asset-development-365', sha256: 'b'.repeat(64) },
  },
  requestedBy: { managementAgentId: 'development-lead', runtimeAgentId: 'development-runtime', vaultAgentId: 18 },
  addressedTo: { kind: 'referent', email: 'development.referent@example.com' },
} satisfies DecisionRequest;
const financeRequest = {
  ...designRequest,
  requestId: 'delivery-365-c',
  question: 'Approve this saved finance delivery?',
  subject: {
    ...designSubject,
    buSlug: 'finanza',
    deliveryRef: { assetId: 'asset-finance-365', sha256: 'c'.repeat(64) },
  },
  requestedBy: { managementAgentId: 'finance-lead', runtimeAgentId: 'finance-runtime', vaultAgentId: 19 },
  addressedTo: { kind: 'referent', email: 'finance.referent@example.com' },
} satisfies DecisionRequest;
const rejected = {
  requestId: financeRequest.requestId,
  subject: financeRequest.subject,
  decidedBy: financeRequest.addressedTo,
  decidedAt: '2026-10-28T10:00:00+02:00',
  channel: 'email',
  sourceRef: 'email-finance-rejected-365',
  outcome: 'rejected',
  reason: 'Please revise the cost estimate',
} satisfies DecisionOutcome;
const planRequest = {
  ...designRequest,
  requestId: 'decision-plan-365',
  subject: { kind: 'action_plan', planId: 'plan-365', planVersion: 1, digest: 'd'.repeat(64) },
  question: 'Approve the project plan?',
  requestedBy: { managementAgentId: 'director', runtimeAgentId: query.agentId, vaultAgentId: 7 },
  addressedTo: { ownerId: 'owner-acme' },
  createdAt: '2026-10-27T08:00:00Z',
} satisfies DecisionRequest;
const firstPage = {
  requests: [
    { request: designRequest, state: 'decided', outcome: approved },
    { request: developmentRequest, state: 'open', outcome: null },
  ],
  nextCursor: encodedCursor,
} satisfies InternalMemoryDecisionRequestProjectListResponse;
const finalPage = {
  requests: [
    { request: financeRequest, state: 'decided', outcome: rejected },
    { request: planRequest, state: 'open', outcome: null },
  ],
  nextCursor: null,
} satisfies InternalMemoryDecisionRequestProjectListResponse;

describe('internal memory decision requests by project', () => {
  it('exports a separate secret GET contract and keeps the previous agent list shape', () => {
    expect(INTERNAL_MEMORY_DECISION_REQUEST_PROJECT_LIST_PATH).toBe('/internal/memory/decision-requests/by-project');
    expect(projectList).toEqual({
      method: 'GET',
      path: INTERNAL_MEMORY_DECISION_REQUEST_PROJECT_LIST_PATH,
      authType: 'secret',
      querySchema: InternalMemoryDecisionRequestProjectListQuerySchema,
      responseSchema: InternalMemoryDecisionRequestProjectListResponseSchema,
    });
    expectTypeOf(projectList.querySchema.parse(query)).toEqualTypeOf<InternalMemoryDecisionRequestProjectListQuery>();
    expectTypeOf(projectList.responseSchema.parse(firstPage)).toEqualTypeOf<InternalMemoryDecisionRequestProjectListResponse>();
    expectTypeOf(InternalMemoryDecisionRequestProjectCursorSchema.parse(cursor)).toEqualTypeOf<InternalMemoryDecisionRequestProjectCursor>();
    const oldQuery = { tenantId: query.tenantId, agentId: query.agentId, planId: 'plan-365', limit: '20' };
    expect(agentList.querySchema.parse(oldQuery)).toEqual({ ...oldQuery, limit: 20 });
    const oldPage = { requests: firstPage.requests };
    expect(agentList.responseSchema.parse(oldPage)).toEqual(oldPage);
    expect(agentList.path).toBe('/internal/memory/decision-requests');
    expect(agentList.responseSchema.safeParse(firstPage).success).toBe(false);
  });

  it('requires the reader and all scope fields and rejects every query filter or foreign key', () => {
    expect(projectList.querySchema.parse(query)).toEqual(query);
    for (const field of ['tenantId', 'agentId', 'organizationId', 'projectId'] as const) {
      const { [field]: _missing, ...withoutField } = query;
      expect(projectList.querySchema.safeParse(withoutField).success, `missing ${field}`).toBe(false);
      expect(projectList.querySchema.safeParse({ ...query, [field]: '' }).success, `empty ${field}`).toBe(false);
    }
    for (const extra of [
      { planId: 'plan-365' }, { state: 'open' }, { outcome: 'approved' },
      { requestedBy: 'design-runtime' }, { offset: 20 }, { ownerId: 'owner-acme' }, { extra: true },
    ]) expect(projectList.querySchema.safeParse({ ...query, ...extra }).success).toBe(false);
    for (const field of ['organizationId', 'projectId'] as const) {
      expect(projectList.querySchema.safeParse({ ...query, [field]: 'x'.repeat(65) }).success).toBe(false);
    }
  });

  it('coerces integer page limits and bounds both cursor transport fields', () => {
    for (const limit of [1, 50, 100]) {
      expect(projectList.querySchema.parse({ ...query, limit: String(limit), cursor: encodedCursor }))
        .toEqual({ ...query, limit, cursor: encodedCursor });
    }
    for (const limit of [0, -1, 101, 1.5, '1.5', 'invalid', '', null]) {
      expect(projectList.querySchema.safeParse({ ...query, limit }).success).toBe(false);
    }
    for (const transport of ['', 'x'.repeat(2049), 123]) {
      expect(projectList.querySchema.safeParse({ ...query, cursor: transport }).success).toBe(false);
      expect(projectList.responseSchema.safeParse({ requests: [], nextCursor: transport }).success).toBe(false);
    }
    const longestCursor = 'x'.repeat(2048);
    expect(projectList.querySchema.parse({ ...query, cursor: longestCursor })).toEqual({ ...query, cursor: longestCursor });
    expect(projectList.responseSchema.parse({ requests: [], nextCursor: longestCursor }))
      .toEqual({ requests: [], nextCursor: longestCursor });
    expect(projectList.querySchema.safeParse({ ...query, cursor: null }).success).toBe(false);
  });

  it('validates decoded cursor scope and requires both stable ordering keys even for tied timestamps', () => {
    const decoded: unknown = JSON.parse(Buffer.from(encodedCursor, 'base64url').toString('utf8'));
    expect(InternalMemoryDecisionRequestProjectCursorSchema.parse(decoded)).toEqual(cursor);
    for (const field of ['tenantId', 'organizationId', 'projectId', 'createdAt', 'requestId'] as const) {
      const { [field]: _missing, ...withoutField } = cursor;
      expect(InternalMemoryDecisionRequestProjectCursorSchema.safeParse(withoutField).success, `missing ${field}`).toBe(false);
      expect(InternalMemoryDecisionRequestProjectCursorSchema.safeParse({ ...cursor, [field]: '' }).success, `empty ${field}`).toBe(false);
    }
    for (const extra of [{ agentId: query.agentId }, { state: 'decided' }, { offset: 2 }, { extra: true }]) {
      expect(InternalMemoryDecisionRequestProjectCursorSchema.safeParse({ ...cursor, ...extra }).success).toBe(false);
    }
    for (const createdAt of ['2026-10-28T08:00:00', '2026-02-30T08:00:00Z', 'invalid']) {
      expect(InternalMemoryDecisionRequestProjectCursorSchema.safeParse({ ...cursor, createdAt }).success).toBe(false);
    }
    for (const createdAt of ['2026-10-28T06:00:00Z', '2026-10-28T01:00:00-05:00']) {
      expect(InternalMemoryDecisionRequestProjectCursorSchema.parse({ ...cursor, createdAt })).toEqual({ ...cursor, createdAt });
    }
    for (const requestId of ['short', 'invalid/request', 'r'.repeat(65)]) {
      expect(InternalMemoryDecisionRequestProjectCursorSchema.safeParse({ ...cursor, requestId }).success).toBe(false);
    }
    for (const field of ['organizationId', 'projectId'] as const) {
      expect(InternalMemoryDecisionRequestProjectCursorSchema.safeParse({ ...cursor, [field]: 'x'.repeat(65) }).success).toBe(false);
    }
    // Shape validation cannot authorize a different scope; consumers must compare it to the reader's scope.
    const differentScope = { ...cursor, tenantId: 'other-tenant', organizationId: 'other-org', projectId: 'other-project' };
    expect(InternalMemoryDecisionRequestProjectCursorSchema.parse(differentScope)).toEqual(differentScope);
  });

  it('requires an explicit final page even when the last page is full or empty', () => {
    for (const requests of [[], firstPage.requests]) {
      expect(projectList.responseSchema.parse({ requests, nextCursor: null })).toEqual({ requests, nextCursor: null });
      expect(projectList.responseSchema.safeParse({ requests }).success).toBe(false);
      expect(projectList.responseSchema.safeParse({ requests, nextCursor: undefined }).success).toBe(false);
    }
    const fullPage = Array.from({ length: 100 }, (_, index) => ({
      request: { ...developmentRequest, requestId: `delivery-page-${index}` }, state: 'open', outcome: null,
    }));
    expect(projectList.responseSchema.parse({ requests: fullPage, nextCursor: null }))
      .toEqual({ requests: fullPage, nextCursor: null });
    expect(projectList.responseSchema.safeParse({ requests: fullPage }).success).toBe(false);
    expect(projectList.responseSchema.safeParse({ requests: [...fullPage, {
      request: { ...developmentRequest, requestId: 'delivery-page-overflow' }, state: 'open', outcome: null,
    }], nextCursor: encodedCursor }).success).toBe(false);
    expect(projectList.responseSchema.safeParse({ nextCursor: null }).success).toBe(false);
    expect(projectList.responseSchema.safeParse({ ...finalPage, complete: true }).success).toBe(false);
  });

  it('rejects duplicate request ids within a page even with different states or producers', () => {
    const decided = { request: designRequest, state: 'decided', outcome: approved };
    const openWithSameId = {
      request: { ...developmentRequest, requestId: decided.request.requestId }, state: 'open', outcome: null,
    };
    for (const duplicate of [decided, openWithSameId]) {
      expect(projectList.responseSchema.safeParse({
        requests: [decided, { request: developmentRequest, state: 'open', outcome: null }, duplicate], nextCursor: null,
      }).success).toBe(false);
    }
    expect(projectList.responseSchema.parse(firstPage)).toEqual(firstPage);
  });

  it('preserves all leads, states, delivery referents and full email outcomes across example pages', () => {
    // These are wire examples, not an implementation or proof of database pagination or isolation.
    const page1 = projectList.responseSchema.parse(firstPage);
    const page2 = projectList.responseSchema.parse(finalPage);
    expect(page1).toEqual(firstPage);
    expect(page2).toEqual(finalPage);
    for (const row of [...page1.requests, ...page2.requests]) {
      expect(InternalMemoryDecisionRequestReadResponseSchema.parse(row)).toEqual(row);
    }
    expect(designRequest.createdAt).toBe(developmentRequest.createdAt);
    expect(developmentRequest.createdAt).toBe(financeRequest.createdAt);
    expect(designRequest.requestId < cursor.requestId).toBe(true);
    expect(financeRequest.requestId > cursor.requestId).toBe(true);
    if (page1.nextCursor === null) throw new Error('The first example page must have a continuation');
    expect(InternalMemoryDecisionRequestProjectCursorSchema.parse(JSON.parse(
      Buffer.from(page1.nextCursor, 'base64url').toString('utf8'),
    ))).toEqual(cursor);
    for (const row of [
      { request: designRequest, state: 'open', outcome: approved },
      { request: designRequest, state: 'decided', outcome: null },
      { request: designRequest, state: 'approved', outcome: approved },
      { request: financeRequest, state: 'rejected', outcome: rejected },
      { request: financeRequest, state: 'decided', outcome: { ...rejected, outcome: 'unknown' } },
      { request: designRequest, state: 'decided', outcome: { ...approved, sourceRef: undefined } },
      { request: designRequest, state: 'decided', outcome: { ...approved, sourceRef: ' \t ' } },
    ]) expect(projectList.responseSchema.safeParse({ requests: [row], nextCursor: null }).success).toBe(false);
  });
});
