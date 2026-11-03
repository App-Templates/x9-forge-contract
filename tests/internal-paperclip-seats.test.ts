import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import {
  INTERNAL_PAPERCLIP_SEAT_ISSUES_PATH,
  INTERNAL_PAPERCLIP_SEATS_PATH,
  InternalPaperclipSeatIssueSchema,
  InternalPaperclipSeatIssuesParamsSchema,
  InternalPaperclipSeatIssuesResponseSchema,
  InternalPaperclipSeatSchema,
  InternalPaperclipSeatsQuerySchema,
  InternalPaperclipSeatsResponseSchema,
  internalPaperclipSeatsReadContract,
  internalPaperclipSeatIssuesReadContract,
} from '../src/http/endpoints/index.js';

const seat = {
  identity: {
    managementAgentId: 'bu-finance',
    runtimeAgentId: 'bu-finance-runtime',
    vaultAgentId: 42,
  },
  paperclipAgentId: '11111111-1111-4111-8111-111111111111',
  companyId: '22222222-2222-4222-8222-222222222222',
  reportsToPaperclipAgentId: '33333333-3333-4333-8333-333333333333',
  enrollment: {
    state: 'enrolled',
    attempts: 1,
    updatedAt: '2026-10-22T08:00:00.000Z',
  },
};

describe('internal Paperclip seats read contract', () => {
  it('accepts a valid seat and both enrollment states', () => {
    expect(InternalPaperclipSeatSchema.parse(seat)).toEqual(seat);
    expect(InternalPaperclipSeatSchema.safeParse({
      ...seat,
      enrollment: { ...seat.enrollment, state: 'key_pending', attempts: 0, lastReason: 'key_unavailable' },
    }).success).toBe(true);
  });

  it('rejects key and token fields at every response boundary', () => {
    for (const field of ['key', 'token']) {
      const extra = { [field]: 'unexpected-field' };
      expect(InternalPaperclipSeatSchema.safeParse({ ...seat, ...extra }).success).toBe(false);
      expect(InternalPaperclipSeatSchema.safeParse({
        ...seat, enrollment: { ...seat.enrollment, ...extra },
      }).success).toBe(false);
      expect(InternalPaperclipSeatSchema.safeParse({
        ...seat, identity: { ...seat.identity, ...extra },
      }).success).toBe(false);
      expect(InternalPaperclipSeatsResponseSchema.safeParse({ seats: [seat], ...extra }).success).toBe(false);
    }
  });

  it('rejects invalid enrollment status, attempts, reasons and timestamps', () => {
    for (const change of [
      { state: 'pending' }, { attempts: -1 }, { attempts: 0.5 },
      { lastReason: '' }, { lastReason: 'x'.repeat(65) }, { updatedAt: 'yesterday' },
    ]) {
      expect(InternalPaperclipSeatSchema.safeParse({
        ...seat, enrollment: { ...seat.enrollment, ...change },
      }).success).toBe(false);
    }
  });

  it('requires a complete identity and UUIDs for the seat and director', () => {
    expect(InternalPaperclipSeatSchema.safeParse({
      ...seat, identity: { managementAgentId: 'bu-finance', vaultAgentId: 42 },
    }).success).toBe(false);
    for (const field of ['paperclipAgentId', 'companyId', 'reportsToPaperclipAgentId']) {
      expect(InternalPaperclipSeatSchema.safeParse({ ...seat, [field]: 'invalid' }).success).toBe(false);
      expect(InternalPaperclipSeatSchema.safeParse({ ...seat, [field]: undefined }).success).toBe(false);
    }
  });

  it('requires an organization query with at most 64 characters and no extra fields', () => {
    expect(InternalPaperclipSeatsQuerySchema.safeParse({ organizationId: 'org-1' }).success).toBe(true);
    expect(InternalPaperclipSeatsQuerySchema.safeParse({ organizationId: 'x'.repeat(64) }).success).toBe(true);
    for (const query of [{}, { organizationId: '' }, { organizationId: 'x'.repeat(65) },
      { organizationId: 'org-1', tenantId: 'unexpected' }]) {
      expect(InternalPaperclipSeatsQuerySchema.safeParse(query).success).toBe(false);
    }
  });

  it('accepts up to 200 seats, including an empty list', () => {
    expect(InternalPaperclipSeatsResponseSchema.safeParse({ seats: [] }).success).toBe(true);
    expect(InternalPaperclipSeatsResponseSchema.safeParse({ seats: [seat] }).success).toBe(true);
    expect(InternalPaperclipSeatsResponseSchema.safeParse({ seats: Array(200).fill(seat) }).success).toBe(true);
    expect(InternalPaperclipSeatsResponseSchema.safeParse({ seats: Array(201).fill(seat) }).success).toBe(false);
  });

  it('exports GET with the seats path, secret auth and matching schemas', () => {
    expect(INTERNAL_PAPERCLIP_SEATS_PATH).toBe('/internal/paperclip/seats');
    expect(internalPaperclipSeatsReadContract).toEqual({
      method: 'GET',
      path: INTERNAL_PAPERCLIP_SEATS_PATH,
      authType: 'secret',
      querySchema: InternalPaperclipSeatsQuerySchema,
      responseSchema: InternalPaperclipSeatsResponseSchema,
    });
  });
});

describe('internal Paperclip seat issues read contract', () => {
  const issue = {
    issueId: 'BU-42',
    title: 'Prepare the finance mini-brief',
    status: 'in_progress',
    projectId: '44444444-4444-4444-8444-444444444444',
    goalId: '55555555-5555-4555-8555-555555555555',
    assigneeComments: 1,
  };
  const response = { paperclipAgentId: seat.paperclipAgentId, issues: [issue] };

  it('validates assignments, boundaries and the read-only contract', () => {
    expect(InternalPaperclipSeatIssueSchema.parse(issue)).toEqual(issue);
    expect(InternalPaperclipSeatIssuesResponseSchema.parse(response)).toEqual(response);
    expect(InternalPaperclipSeatIssuesParamsSchema.parse({ paperclipAgentId: seat.paperclipAgentId }))
      .toEqual({ paperclipAgentId: seat.paperclipAgentId });
    expect(InternalPaperclipSeatIssueSchema.safeParse({
      ...issue, projectId: null, goalId: null, assigneeComments: 0,
    }).success).toBe(true);

    for (const paperclipAgentId of ['invalid', undefined]) {
      expect(InternalPaperclipSeatIssuesParamsSchema.safeParse({ paperclipAgentId }).success).toBe(false);
      expect(InternalPaperclipSeatIssuesResponseSchema.safeParse({ ...response, paperclipAgentId }).success)
        .toBe(false);
    }
    for (const change of [
      { issueId: '' }, { issueId: 'x'.repeat(65) },
      { title: '' }, { title: 'x'.repeat(301) },
      { status: '' }, { status: 'x'.repeat(33) },
      { projectId: 'invalid' }, { projectId: undefined },
      { goalId: 'invalid' }, { goalId: undefined },
      { assigneeComments: -1 }, { assigneeComments: 0.5 },
      { assigneeComments: undefined }, { extra: true },
    ]) {
      expect(InternalPaperclipSeatIssueSchema.safeParse({ ...issue, ...change }).success).toBe(false);
    }
    expect(InternalPaperclipSeatIssueSchema.safeParse({
      ...issue, issueId: 'x'.repeat(64), title: 'x'.repeat(300), status: 'x'.repeat(32),
    }).success).toBe(true);
    for (const count of [0, 100]) {
      expect(InternalPaperclipSeatIssuesResponseSchema.safeParse({
        ...response, issues: Array.from({ length: count }, () => issue),
      }).success).toBe(true);
    }
    expect(InternalPaperclipSeatIssuesResponseSchema.safeParse({
      ...response, issues: Array.from({ length: 101 }, () => issue),
    }).success).toBe(false);
    expect(InternalPaperclipSeatIssuesResponseSchema.safeParse({ ...response, extra: true }).success).toBe(false);
    expect(InternalPaperclipSeatIssuesParamsSchema.safeParse({
      paperclipAgentId: seat.paperclipAgentId, extra: true,
    }).success).toBe(false);
    expect(INTERNAL_PAPERCLIP_SEAT_ISSUES_PATH).toBe('/internal/paperclip/seats/:paperclipAgentId/issues');
    expect(internalPaperclipSeatIssuesReadContract).toEqual({
      method: 'GET',
      path: INTERNAL_PAPERCLIP_SEAT_ISSUES_PATH,
      authType: 'secret',
      paramsSchema: InternalPaperclipSeatIssuesParamsSchema,
      responseSchema: InternalPaperclipSeatIssuesResponseSchema,
    });
  });

  it('exports the seat issues contract from the built CommonJS index', () => {
    const require = createRequire(import.meta.url);
    const built: { internalPaperclipSeatIssuesReadContract?: typeof internalPaperclipSeatIssuesReadContract } =
      require('../dist/http/endpoints/index.cjs');
    const contract = built.internalPaperclipSeatIssuesReadContract;
    expect(contract?.method).toBe('GET');
    expect(contract?.path).toBe(INTERNAL_PAPERCLIP_SEAT_ISSUES_PATH);
    expect(contract?.authType).toBe('secret');
    expect(contract?.paramsSchema.safeParse({ paperclipAgentId: seat.paperclipAgentId }).success).toBe(true);
    expect(contract?.responseSchema.safeParse(response).success).toBe(true);
  });
});
