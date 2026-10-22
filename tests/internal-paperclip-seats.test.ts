import { describe, expect, it } from 'vitest';
import {
  INTERNAL_PAPERCLIP_SEATS_PATH,
  InternalPaperclipSeatSchema,
  InternalPaperclipSeatsQuerySchema,
  InternalPaperclipSeatsResponseSchema,
  internalPaperclipSeatsReadContract,
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
