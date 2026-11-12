import { describe, expect, it } from 'vitest';
import {
  COMPANY_SPEND_CAPABILITY_SOURCES,
  CompanySpendSourceSchema,
  InternalCompanySpendErrorSchema,
  InternalCompanySpendResponseSchema,
} from '../../src/http/endpoints/internal-company-spend.js';

const goodChoiceReport = {
  company: 'good-choice',
  label: 'Good Choice',
  since: '2026-11-03T00:00:00.000+01:00',
  capEurCents: 10000,
  usdPerEur: 1,
  capUsdMicros: 100_000_000,
  spentUsdMicros: 31_250_000,
  over: false,
  revision: 0,
  changedAt: null,
  changedBy: null,
  perAgent: ['director', 'ricerca-lead', 'lab-lead', 'email-lead'].map((agentId, i) => ({
    agentId,
    usdMicros: 1_000_000 * (i + 1),
    estimated: false,
    bySource: { model: 1_000_000 * (i + 1) },
  })),
  unreadSources: ['ricerca', 'lab'],
};

const withUnread = (unreadSources: string[]) =>
  InternalCompanySpendResponseSchema.safeParse({ ...goodChoiceReport, unreadSources }).success;

describe('company spend error codes and capability sources', () => {
  it('s6578 errori-spesa: the company spend error body accepts unauthorized and invalid_config, refuses any other code, and unreadSources accepts only ricerca and lab while the stored Good Choice report still parses', () => {
    // (a) error codes
    for (const error of ['unauthorized', 'invalid_config']) {
      expect(InternalCompanySpendErrorSchema.safeParse({ ok: false, error }).success).toBe(true);
    }
    expect(InternalCompanySpendErrorSchema.safeParse({ ok: false, error: 'boom' }).success).toBe(false);
    expect(InternalCompanySpendErrorSchema.safeParse({ ok: true, error: 'unauthorized' }).success).toBe(false);
    // (b) currentRevision as before
    expect(
      InternalCompanySpendErrorSchema.parse({ ok: false, error: 'stale_revision', currentRevision: 3 }).currentRevision,
    ).toBe(3);
    // (c) unreadSources, stored Good Choice report included
    expect(InternalCompanySpendResponseSchema.safeParse(goodChoiceReport).success).toBe(true);
    expect(withUnread([])).toBe(true);
    expect(withUnread(['lab'])).toBe(true);
    expect(withUnread(['ricerca', 'lab'])).toBe(true);
    expect(withUnread(['model'])).toBe(false);
    expect(withUnread(['tool'])).toBe(false);
    expect(withUnread(['email'])).toBe(false);
    // (d) exported list
    expect([...COMPANY_SPEND_CAPABILITY_SOURCES]).toEqual(['ricerca', 'lab']);
    for (const source of COMPANY_SPEND_CAPABILITY_SOURCES) {
      expect(CompanySpendSourceSchema.safeParse(source).success).toBe(true);
    }
    // (e) bySource keeps all four sources
    const withBySource = structuredClone(goodChoiceReport);
    withBySource.perAgent[0]!.bySource = { model: 1, tool: 2, ricerca: 3, lab: 4 } as never;
    expect(InternalCompanySpendResponseSchema.safeParse(withBySource).success).toBe(true);
  });
});
