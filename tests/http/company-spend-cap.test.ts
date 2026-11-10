import { describe, expect, it } from 'vitest';
import {
  INTERNAL_COMPANY_SPEND_BUSINESS_UNIT_PATH,
  INTERNAL_COMPANY_SPEND_PATH,
  InternalCompanySpendCapUpdateBodySchema,
  InternalCompanySpendErrorSchema,
  InternalCompanySpendResponseSchema,
  internalCompanySpendBusinessUnitReadContract,
  internalCompanySpendCapUpdateContract,
  internalCompanySpendReadContract,
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

describe('company spend cap contracts', () => {
  it('s6160 tetto-azienda-senza-contratto: the bridge exports the company spend read and cap update contracts, and the update refuses a cap below one euro cent or a missing revision', () => {
    expect(internalCompanySpendReadContract.method).toBe('GET');
    expect(internalCompanySpendCapUpdateContract.method).toBe('PUT');
    expect(internalCompanySpendReadContract.path).toBe(INTERNAL_COMPANY_SPEND_PATH);
    expect(internalCompanySpendCapUpdateContract.authType).toBe('secret');
    const ok = { revision: 0, capEurCents: 5000, changedBy: 'stefano' };
    expect(InternalCompanySpendCapUpdateBodySchema.safeParse(ok).success).toBe(true);
    expect(InternalCompanySpendCapUpdateBodySchema.safeParse({ ...ok, capEurCents: 0 }).success).toBe(false);
    expect(InternalCompanySpendCapUpdateBodySchema.safeParse({ ...ok, capEurCents: 10_000_001 }).success).toBe(false);
    const { revision: _revision, ...noRevision } = ok;
    expect(InternalCompanySpendCapUpdateBodySchema.safeParse(noRevision).success).toBe(false);
    expect(InternalCompanySpendCapUpdateBodySchema.safeParse({ ...ok, extra: 1 }).success).toBe(false);
  });

  it('s6160 the read response parses the Good Choice report shape and refuses an unknown source', () => {
    expect(InternalCompanySpendResponseSchema.safeParse(goodChoiceReport).success).toBe(true);
    expect(
      InternalCompanySpendResponseSchema.safeParse({ ...goodChoiceReport, unreadSources: ['email'] }).success,
    ).toBe(false);
    const badBySource = structuredClone(goodChoiceReport);
    badBySource.perAgent[0]!.bySource = { email: 1 } as never;
    expect(InternalCompanySpendResponseSchema.safeParse(badBySource).success).toBe(false);
  });

  it('s6160 the error schema keeps currentRevision for stale_revision', () => {
    const parsed = InternalCompanySpendErrorSchema.parse({ ok: false, error: 'stale_revision', currentRevision: 3 });
    expect(parsed.currentRevision).toBe(3);
    expect(InternalCompanySpendErrorSchema.safeParse({ ok: false, error: 'boom' }).success).toBe(false);
    expect(InternalCompanySpendErrorSchema.safeParse({ ok: true, error: 'guard_off' }).success).toBe(false);
  });

  it('s6160 the update body accepts an optional since with offset and refuses a date without offset', () => {
    const base = { revision: 1, capEurCents: 100, changedBy: 'stefano' };
    expect(
      InternalCompanySpendCapUpdateBodySchema.safeParse({ ...base, since: '2026-11-10T13:00:00.000Z' }).success,
    ).toBe(true);
    expect(
      InternalCompanySpendCapUpdateBodySchema.safeParse({ ...base, since: '2026-11-10T13:00:00+01:00' }).success,
    ).toBe(true);
    expect(InternalCompanySpendCapUpdateBodySchema.safeParse({ ...base, since: '2026-11-10T13:00:00' }).success).toBe(
      false,
    );
  });

  it('s6160 the business unit read contract is unchanged', () => {
    expect(internalCompanySpendBusinessUnitReadContract.method).toBe('GET');
    expect(internalCompanySpendBusinessUnitReadContract.path).toBe(INTERNAL_COMPANY_SPEND_BUSINESS_UNIT_PATH);
    expect(INTERNAL_COMPANY_SPEND_BUSINESS_UNIT_PATH).toBe(
      '/internal/companies/:companyId/business-units/:buSlug/spend',
    );
  });
});
