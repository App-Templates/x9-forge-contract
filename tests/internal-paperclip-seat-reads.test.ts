import { describe, expect, it } from 'vitest';
import {
  INTERNAL_PAPERCLIP_SEAT_ACTIVITY_PATH,
  INTERNAL_PAPERCLIP_SEAT_SEARCH_PATH,
  InternalPaperclipSeatActivityQuerySchema,
  InternalPaperclipSeatActivityResponseSchema,
  InternalPaperclipSeatIssuesParamsSchema,
  InternalPaperclipSeatSearchQuerySchema,
  InternalPaperclipSeatSearchResponseSchema,
  internalPaperclipSeatActivityReadContract,
  internalPaperclipSeatSearchReadContract,
} from '../src/http/endpoints/index.js';

const seatId = '11111111-1111-4111-8111-111111111111';
const issueId = '44444444-4444-4444-8444-444444444444';

const result = {
  kind: 'issue',
  id: 'BU-42',
  title: 'Prepare the finance mini-brief',
  snippet: 'mini-brief',
  issueId,
  updatedAt: '2026-10-25T08:00:00.000Z',
};
const event = {
  id: 'evt-1',
  type: 'issue.updated',
  actorAgentId: seatId,
  issueId,
  summary: 'Status changed',
  createdAt: '2026-10-25T08:00:00+02:00',
};

describe('internal Paperclip seat search read contract', () => {
  it('exports GET with the search path, secret auth and matching schemas', () => {
    expect(INTERNAL_PAPERCLIP_SEAT_SEARCH_PATH).toBe('/internal/paperclip/seats/:paperclipAgentId/search');
    expect(internalPaperclipSeatSearchReadContract).toEqual({
      method: 'GET',
      path: INTERNAL_PAPERCLIP_SEAT_SEARCH_PATH,
      authType: 'secret',
      paramsSchema: InternalPaperclipSeatIssuesParamsSchema,
      querySchema: InternalPaperclipSeatSearchQuerySchema,
      responseSchema: InternalPaperclipSeatSearchResponseSchema,
    });
  });

  it('rejects empty, blank and over-long q', () => {
    expect(InternalPaperclipSeatSearchQuerySchema.safeParse({ q: 'brief' }).success).toBe(true);
    expect(InternalPaperclipSeatSearchQuerySchema.safeParse({ q: 'x'.repeat(256) }).success).toBe(true);
    for (const q of ['', '   ', 'x'.repeat(257)]) {
      expect(InternalPaperclipSeatSearchQuerySchema.safeParse({ q }).success).toBe(false);
    }
    expect(InternalPaperclipSeatSearchQuerySchema.safeParse({}).success).toBe(false);
  });

  it('accepts known unique kinds and rejects unknown or repeated ones', () => {
    expect(InternalPaperclipSeatSearchQuerySchema.safeParse({ q: 'a', kinds: 'issue,comment' }).success).toBe(true);
    expect(InternalPaperclipSeatSearchQuerySchema.safeParse({ q: 'a', kinds: 'project' }).success).toBe(true);
    for (const kinds of ['invoice', 'issue,invoice', 'issue,issue', 'issue,', ',issue', '']) {
      expect(InternalPaperclipSeatSearchQuerySchema.safeParse({ q: 'a', kinds }).success).toBe(false);
    }
  });

  it('bounds limit between 1 and 50 as an integer', () => {
    for (const limit of ['1', '50']) {
      expect(InternalPaperclipSeatSearchQuerySchema.safeParse({ q: 'a', limit }).success).toBe(true);
    }
    for (const limit of ['0', '51', '1.5']) {
      expect(InternalPaperclipSeatSearchQuerySchema.safeParse({ q: 'a', limit }).success).toBe(false);
    }
  });

  it('rejects extra query and response fields', () => {
    for (const field of ['key', 'token']) {
      const extra = { [field]: 'unexpected' };
      expect(InternalPaperclipSeatSearchQuerySchema.safeParse({ q: 'a', ...extra }).success).toBe(false);
      expect(InternalPaperclipSeatSearchResponseSchema.safeParse({
        paperclipAgentId: seatId, results: [], ...extra,
      }).success).toBe(false);
      expect(InternalPaperclipSeatSearchResponseSchema.safeParse({
        paperclipAgentId: seatId, results: [{ ...result, ...extra }],
      }).success).toBe(false);
    }
  });

  it('accepts up to 50 results and requires a UUID seat id', () => {
    const response = (count: number) => ({ paperclipAgentId: seatId, results: Array(count).fill(result) });
    expect(InternalPaperclipSeatSearchResponseSchema.safeParse(response(1)).success).toBe(true);
    expect(InternalPaperclipSeatSearchResponseSchema.safeParse(response(50)).success).toBe(true);
    expect(InternalPaperclipSeatSearchResponseSchema.safeParse(response(51)).success).toBe(false);
    expect(InternalPaperclipSeatSearchResponseSchema.safeParse({ ...response(1), paperclipAgentId: 'seat' }).success)
      .toBe(false);
  });
});

describe('internal Paperclip seat activity read contract', () => {
  it('exports GET with the activity path, secret auth and matching schemas', () => {
    expect(INTERNAL_PAPERCLIP_SEAT_ACTIVITY_PATH).toBe('/internal/paperclip/seats/:paperclipAgentId/activity');
    expect(internalPaperclipSeatActivityReadContract).toEqual({
      method: 'GET',
      path: INTERNAL_PAPERCLIP_SEAT_ACTIVITY_PATH,
      authType: 'secret',
      paramsSchema: InternalPaperclipSeatIssuesParamsSchema,
      querySchema: InternalPaperclipSeatActivityQuerySchema,
      responseSchema: InternalPaperclipSeatActivityResponseSchema,
    });
  });

  it('accepts an empty query and valid since/issueId', () => {
    expect(InternalPaperclipSeatActivityQuerySchema.safeParse({}).success).toBe(true);
    expect(InternalPaperclipSeatActivityQuerySchema.safeParse({
      since: '2026-10-25T08:00:00Z', issueId, limit: '10',
    }).success).toBe(true);
  });

  it('rejects since without offset and non-UUID issueId', () => {
    expect(InternalPaperclipSeatActivityQuerySchema.safeParse({ since: '2026-10-25T08:00:00' }).success).toBe(false);
    expect(InternalPaperclipSeatActivityQuerySchema.safeParse({ issueId: 'BU-42' }).success).toBe(false);
  });

  it('bounds limit between 1 and 100 as an integer', () => {
    for (const limit of ['1', '100']) {
      expect(InternalPaperclipSeatActivityQuerySchema.safeParse({ limit }).success).toBe(true);
    }
    for (const limit of ['0', '101', '1.5']) {
      expect(InternalPaperclipSeatActivityQuerySchema.safeParse({ limit }).success).toBe(false);
    }
  });

  it('rejects extra query and response fields', () => {
    for (const field of ['key', 'token']) {
      const extra = { [field]: 'unexpected' };
      expect(InternalPaperclipSeatActivityQuerySchema.safeParse(extra).success).toBe(false);
      expect(InternalPaperclipSeatActivityResponseSchema.safeParse({
        paperclipAgentId: seatId, events: [], ...extra,
      }).success).toBe(false);
      expect(InternalPaperclipSeatActivityResponseSchema.safeParse({
        paperclipAgentId: seatId, events: [{ ...event, ...extra }],
      }).success).toBe(false);
    }
  });

  it('accepts up to 100 events and requires a UUID seat id', () => {
    const response = (count: number) => ({ paperclipAgentId: seatId, events: Array(count).fill(event) });
    expect(InternalPaperclipSeatActivityResponseSchema.safeParse(response(1)).success).toBe(true);
    expect(InternalPaperclipSeatActivityResponseSchema.safeParse(response(100)).success).toBe(true);
    expect(InternalPaperclipSeatActivityResponseSchema.safeParse(response(101)).success).toBe(false);
    expect(InternalPaperclipSeatActivityResponseSchema.safeParse({ ...response(1), paperclipAgentId: 'seat' }).success)
      .toBe(false);
  });
});
