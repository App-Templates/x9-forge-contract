import { Buffer } from 'node:buffer';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  INTERNAL_MEMORY_DECISION_REQUEST_AGENT_PAGE_PATH,
  InternalMemoryDecisionRequestAgentPageCursorSchema,
  InternalMemoryDecisionRequestAgentPageQuerySchema,
  InternalMemoryDecisionRequestAgentPageResponseSchema,
  InternalMemoryDecisionRequestProjectListResponseSchema,
  internalMemoryDecisionRequestAgentPageContract as agentPage,
  internalMemoryDecisionRequestListContract as legacyList,
  type InternalMemoryDecisionRequestAgentPageCursor,
  type InternalMemoryDecisionRequestAgentPageQuery,
  type InternalMemoryDecisionRequestAgentPageResponse,
} from '../../src/http/index.js';
import type { DecisionOutcome, DecisionRequest, DeliveryDecisionSubject } from '../../src/organization/index.js';

const query = {
  tenantId: 'tenant-acme',
  agentId: 'lead-runtime',
  organizationId: 'org-acme',
  projectId: 'project-website',
} satisfies InternalMemoryDecisionRequestAgentPageQuery;

function cursorFor(createdAt: string, requestId: string): InternalMemoryDecisionRequestAgentPageCursor {
  return { ...query, createdAt, requestId };
}
function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function subject(n: number): DeliveryDecisionSubject {
  return {
    kind: 'delivery',
    organizationId: query.organizationId,
    projectId: query.projectId,
    buSlug: 'design',
    deliveryRef: { assetId: `asset-design-${n}`, sha256: String(n).repeat(64).slice(0, 64) },
  };
}
function requestFor(n: number, createdAt: string): DecisionRequest {
  return {
    requestId: `delivery-8204-${n}`,
    tenantId: query.tenantId,
    organizationId: query.organizationId,
    projectId: query.projectId,
    subject: subject(n),
    question: `Approve saved delivery ${n}?`,
    options: [{ optionId: 'approve-delivery', label: 'Approve the delivery' }],
    requestedBy: { managementAgentId: 'design-lead', runtimeAgentId: query.agentId, vaultAgentId: 17 },
    addressedTo: { kind: 'referent', email: 'design.referent@example.com' },
    channel: 'email',
    createdAt,
  };
}
function approvedFor(request: DecisionRequest): DecisionOutcome {
  return {
    requestId: request.requestId,
    subject: request.subject as DeliveryDecisionSubject,
    decidedBy: request.addressedTo,
    decidedAt: '2026-11-20T12:00:00+01:00',
    channel: 'email',
    sourceRef: `email-${request.requestId}`,
    outcome: 'approved',
    optionId: 'approve-delivery',
  };
}

const r1 = requestFor(1, '2026-11-20T10:00:00+01:00');
const r2 = requestFor(2, '2026-11-20T09:00:00+01:00');
const r3 = requestFor(3, '2026-11-19T09:00:00+01:00');
const r4 = requestFor(4, '2026-11-18T09:00:00+01:00');
const r5 = requestFor(5, '2026-11-17T09:00:00+01:00');
const r6 = requestFor(6, '2026-11-16T09:00:00+01:00');
const open = (request: DecisionRequest) => ({ request, state: 'open' as const, outcome: null });
const decided = (request: DecisionRequest) => ({ request, state: 'decided' as const, outcome: approvedFor(request) });

const page1 = {
  requests: [open(r1), decided(r2)],
  nextCursor: encode(cursorFor(r2.createdAt, r2.requestId)),
} satisfies InternalMemoryDecisionRequestAgentPageResponse;
const page2 = {
  requests: [decided(r3), open(r4)],
  nextCursor: encode(cursorFor(r4.createdAt, r4.requestId)),
} satisfies InternalMemoryDecisionRequestAgentPageResponse;
const page3 = {
  requests: [open(r5), decided(r6)],
  nextCursor: null,
} satisfies InternalMemoryDecisionRequestAgentPageResponse;

describe('s8204 agent decision history pages', () => {
  it('s8204 exports a separate secret GET contract with the agreed path', () => {
    expect(INTERNAL_MEMORY_DECISION_REQUEST_AGENT_PAGE_PATH).toBe('/internal/memory/decision-requests/by-agent-page');
    expect(agentPage).toEqual({
      method: 'GET',
      path: INTERNAL_MEMORY_DECISION_REQUEST_AGENT_PAGE_PATH,
      authType: 'secret',
      querySchema: InternalMemoryDecisionRequestAgentPageQuerySchema,
      responseSchema: InternalMemoryDecisionRequestAgentPageResponseSchema,
    });
    expectTypeOf(agentPage.querySchema.parse(query)).toEqualTypeOf<InternalMemoryDecisionRequestAgentPageQuery>();
    expectTypeOf(agentPage.responseSchema.parse(page1)).toEqualTypeOf<InternalMemoryDecisionRequestAgentPageResponse>();
    expectTypeOf(InternalMemoryDecisionRequestAgentPageCursorSchema.parse(cursorFor(r1.createdAt, r1.requestId)))
      .toEqualTypeOf<InternalMemoryDecisionRequestAgentPageCursor>();
    expect(InternalMemoryDecisionRequestAgentPageResponseSchema).toBe(InternalMemoryDecisionRequestProjectListResponseSchema);
  });

  it('s8204 requires the reader and every scope field and rejects any filter or alternative producer', () => {
    expect(agentPage.querySchema.parse(query)).toEqual(query);
    for (const field of ['tenantId', 'agentId', 'organizationId', 'projectId'] as const) {
      const { [field]: _missing, ...withoutField } = query;
      expect(agentPage.querySchema.safeParse(withoutField).success, `missing ${field}`).toBe(false);
      expect(agentPage.querySchema.safeParse({ ...query, [field]: '' }).success, `empty ${field}`).toBe(false);
    }
    for (const extra of [
      { planId: 'plan-365' }, { state: 'open' }, { outcome: 'approved' }, { producerId: 'other-runtime' },
      { requestedBy: 'design-runtime' }, { offset: 20 }, { ownerId: 'owner-acme' }, { extra: true },
    ]) expect(agentPage.querySchema.safeParse({ ...query, ...extra }).success).toBe(false);
  });

  it('s8204 accepts limits 1 and 100, rejects 0 and 101, and bounds the cursor transport', () => {
    const cursor = encode(cursorFor(r2.createdAt, r2.requestId));
    for (const limit of [1, 50, 100]) {
      expect(agentPage.querySchema.parse({ ...query, limit: String(limit), cursor })).toEqual({ ...query, limit, cursor });
    }
    for (const limit of [0, -1, 101, 1.5, '1.5', 'invalid', '', null]) {
      expect(agentPage.querySchema.safeParse({ ...query, limit }).success, `limit ${String(limit)}`).toBe(false);
    }
    for (const transport of ['', 'x'.repeat(2049), 123, null]) {
      expect(agentPage.querySchema.safeParse({ ...query, cursor: transport }).success).toBe(false);
    }
    const longest = 'x'.repeat(2048);
    expect(agentPage.querySchema.parse({ ...query, cursor: longest })).toEqual({ ...query, cursor: longest });
  });

  it('s8204 requires all six cursor fields, including the reader, and nothing else', () => {
    const cursor = cursorFor(r2.createdAt, r2.requestId);
    const decoded: unknown = JSON.parse(Buffer.from(encode(cursor), 'base64url').toString('utf8'));
    expect(InternalMemoryDecisionRequestAgentPageCursorSchema.parse(decoded)).toEqual(cursor);
    for (const field of ['tenantId', 'agentId', 'organizationId', 'projectId', 'createdAt', 'requestId'] as const) {
      const { [field]: _missing, ...withoutField } = cursor;
      expect(InternalMemoryDecisionRequestAgentPageCursorSchema.safeParse(withoutField).success, `missing ${field}`).toBe(false);
      expect(InternalMemoryDecisionRequestAgentPageCursorSchema.safeParse({ ...cursor, [field]: '' }).success, `empty ${field}`).toBe(false);
    }
    for (const extra of [{ producerId: 'other' }, { state: 'decided' }, { offset: 2 }, { extra: true }]) {
      expect(InternalMemoryDecisionRequestAgentPageCursorSchema.safeParse({ ...cursor, ...extra }).success).toBe(false);
    }
    for (const createdAt of ['2026-11-20T10:00:00', '2026-02-30T08:00:00Z', 'invalid']) {
      expect(InternalMemoryDecisionRequestAgentPageCursorSchema.safeParse({ ...cursor, createdAt }).success).toBe(false);
    }
    for (const requestId of ['short', 'invalid/request', 'r'.repeat(65)]) {
      expect(InternalMemoryDecisionRequestAgentPageCursorSchema.safeParse({ ...cursor, requestId }).success).toBe(false);
    }
    // Shape validation cannot authorize a different scope; the service compares it to the reader's scope.
    expect(InternalMemoryDecisionRequestAgentPageCursorSchema.parse({ ...cursor, agentId: 'other-runtime' }).agentId).toBe('other-runtime');
  });

  it('s8204 describes three pages of every state in one project and only a null cursor ends them', () => {
    const pages = [page1, page2, page3].map((page) => agentPage.responseSchema.parse(page));
    const ids = pages.flatMap((page) => page.requests.map(({ request }) => request.requestId));
    expect(ids).toEqual([r1, r2, r3, r4, r5, r6].map((request) => request.requestId));
    expect(new Set(ids).size).toBe(6);
    expect(pages.flatMap((page) => page.requests.map(({ state }) => state))).toEqual(
      ['open', 'decided', 'decided', 'open', 'open', 'decided'],
    );
    expect(pages.map((page) => page.nextCursor === null)).toEqual([false, false, true]);
    // Every returned cursor decodes with the reader's scope and the last returned row as anchor.
    for (const [page, last] of [[page1, r2], [page2, r4]] as const) {
      const decoded = InternalMemoryDecisionRequestAgentPageCursorSchema.parse(
        JSON.parse(Buffer.from(page.nextCursor, 'base64url').toString('utf8')),
      );
      expect(decoded).toEqual(cursorFor(last.createdAt, last.requestId));
    }
  });

  it('s8204 rejects a page without nextCursor, a duplicated request and an oversized page', () => {
    expect(agentPage.responseSchema.safeParse({ requests: page3.requests }).success).toBe(false);
    expect(agentPage.responseSchema.parse({ requests: [], nextCursor: null })).toEqual({ requests: [], nextCursor: null });
    expect(agentPage.responseSchema.safeParse({ requests: [open(r1), open(r1)], nextCursor: null }).success).toBe(false);
    expect(agentPage.responseSchema.safeParse({ ...page3, extra: true }).success).toBe(false);
    for (const nextCursor of ['', 'x'.repeat(2049), undefined]) {
      expect(agentPage.responseSchema.safeParse({ requests: [], nextCursor }).success).toBe(false);
    }
    const many = Array.from({ length: 101 }, (_, index) => open(requestFor(index + 100, '2026-11-20T10:00:00+01:00')));
    expect(agentPage.responseSchema.safeParse({ requests: many.slice(0, 100), nextCursor: null }).success).toBe(true);
    expect(agentPage.responseSchema.safeParse({ requests: many, nextCursor: null }).success).toBe(false);
  });

  it('s8204 keeps the legacy agent list closed to cursor and limit 101', () => {
    const legacyQuery = { tenantId: query.tenantId, agentId: query.agentId };
    expect(legacyList.querySchema.parse({ ...legacyQuery, limit: '100' })).toEqual({ ...legacyQuery, limit: 100 });
    expect(legacyList.querySchema.safeParse({ ...legacyQuery, limit: 101 }).success).toBe(false);
    expect(legacyList.querySchema.safeParse({ ...legacyQuery, cursor: encode(cursorFor(r1.createdAt, r1.requestId)) }).success).toBe(false);
    expect(legacyList.querySchema.safeParse({ ...legacyQuery, organizationId: query.organizationId }).success).toBe(false);
    expect(legacyList.responseSchema.safeParse(page1).success).toBe(false);
    expect(legacyList.path).toBe('/internal/memory/decision-requests');
  });
});
