import { describe, expect, it } from 'vitest';
import {
  INTERNAL_COMPANY_SPEND_BUSINESS_UNIT_PATH,
  InternalCompanySpendBusinessUnitParamsSchema,
  InternalCompanySpendBusinessUnitQuerySchema,
  InternalCompanySpendBusinessUnitResponseSchema,
  internalCompanySpendBusinessUnitReadContract,
} from '../src/http/endpoints/index.js';

const validResponse = {
  companyId: 'acme',
  buSlug: 'vendite',
  spentUsdMicros: 4_000_000,
  capUsdMicros: 5_000_000,
  percent: 80,
  warn80Alerted: true,
  capAlerted: false,
};

describe('internalCompanySpendBusinessUnitReadContract', () => {
  it('exposes path, GET and secret auth', () => {
    expect(INTERNAL_COMPANY_SPEND_BUSINESS_UNIT_PATH).toBe(
      '/internal/companies/:companyId/business-units/:buSlug/spend',
    );
    expect(internalCompanySpendBusinessUnitReadContract.path).toBe(INTERNAL_COMPANY_SPEND_BUSINESS_UNIT_PATH);
    expect(internalCompanySpendBusinessUnitReadContract.method).toBe('GET');
    expect(internalCompanySpendBusinessUnitReadContract.authType).toBe('secret');
  });
});

describe('params and query', () => {
  const params = { companyId: 'acme', buSlug: 'vendite' };

  it('accepts valid params and query', () => {
    expect(InternalCompanySpendBusinessUnitParamsSchema.safeParse(params).success).toBe(true);
    expect(InternalCompanySpendBusinessUnitQuerySchema.safeParse({ tenantId: 't1' }).success).toBe(true);
  });

  it('rejects uppercase and 31-character slugs, accepts 30', () => {
    expect(InternalCompanySpendBusinessUnitParamsSchema.safeParse({ ...params, buSlug: 'Vendite' }).success).toBe(false);
    expect(InternalCompanySpendBusinessUnitParamsSchema.safeParse({ ...params, buSlug: 'a'.repeat(31) }).success).toBe(false);
    expect(InternalCompanySpendBusinessUnitParamsSchema.safeParse({ ...params, buSlug: 'a'.repeat(30) }).success).toBe(true);
  });

  it('rejects empty and 65-character companyId, accepts 64', () => {
    expect(InternalCompanySpendBusinessUnitParamsSchema.safeParse({ ...params, companyId: '' }).success).toBe(false);
    expect(InternalCompanySpendBusinessUnitParamsSchema.safeParse({ ...params, companyId: 'a'.repeat(65) }).success).toBe(false);
    expect(InternalCompanySpendBusinessUnitParamsSchema.safeParse({ ...params, companyId: 'a'.repeat(64) }).success).toBe(true);
  });

  it('rejects a missing or empty tenantId', () => {
    expect(InternalCompanySpendBusinessUnitQuerySchema.safeParse({}).success).toBe(false);
    expect(InternalCompanySpendBusinessUnitQuerySchema.safeParse({ tenantId: '' }).success).toBe(false);
  });

  it('rejects extra fields in params and query', () => {
    expect(InternalCompanySpendBusinessUnitParamsSchema.safeParse({ ...params, extra: 1 }).success).toBe(false);
    expect(InternalCompanySpendBusinessUnitQuerySchema.safeParse({ tenantId: 't1', extra: 1 }).success).toBe(false);
  });
});

describe('InternalCompanySpendBusinessUnitResponseSchema', () => {
  const parse = (override: Record<string, unknown>) =>
    InternalCompanySpendBusinessUnitResponseSchema.safeParse({ ...validResponse, ...override });

  it('accepts a coherent response', () => {
    expect(parse({}).success).toBe(true);
  });

  it('rejects negative or decimal spend and cap', () => {
    expect(parse({ spentUsdMicros: -1 }).success).toBe(false);
    expect(parse({ spentUsdMicros: 1.5 }).success).toBe(false);
    expect(parse({ capUsdMicros: -1 }).success).toBe(false);
    expect(parse({ capUsdMicros: 2.5 }).success).toBe(false);
  });

  it('rejects a wrong percent (superRefine mutation)', () => {
    expect(parse({ percent: 79.99 }).success).toBe(false);
    expect(parse({ percent: 0 }).success).toBe(false);
  });

  it('rounds percent to two decimals', () => {
    expect(parse({ spentUsdMicros: 1, capUsdMicros: 3, percent: 33.33 }).success).toBe(true);
    expect(parse({ spentUsdMicros: 1, capUsdMicros: 3, percent: 33.34 }).success).toBe(false);
  });

  it('rejects null percent when the cap is above 0', () => {
    expect(parse({ percent: null }).success).toBe(false);
  });

  it('accepts cap 0 with null percent and rejects cap 0 with a number', () => {
    expect(parse({ capUsdMicros: 0, spentUsdMicros: 0, percent: null }).success).toBe(true);
    expect(parse({ capUsdMicros: 0, spentUsdMicros: 5, percent: null }).success).toBe(true);
    expect(parse({ capUsdMicros: 0, spentUsdMicros: 0, percent: 0 }).success).toBe(false);
  });

  it('accepts spend over the cap (percent above 100)', () => {
    expect(parse({ spentUsdMicros: 7_500_000, percent: 150, capAlerted: true }).success).toBe(true);
  });

  it('does not tie the alert flags to the spend', () => {
    expect(parse({ spentUsdMicros: 0, percent: 0, warn80Alerted: true, capAlerted: true }).success).toBe(true);
  });

  it('rejects negative, non-finite or non-numeric percent', () => {
    expect(parse({ percent: -1 }).success).toBe(false);
    expect(parse({ percent: Infinity }).success).toBe(false);
    expect(parse({ percent: '80' }).success).toBe(false);
  });

  it('rejects missing flags and extra fields', () => {
    const { warn80Alerted: _w, ...withoutFlag } = validResponse;
    expect(InternalCompanySpendBusinessUnitResponseSchema.safeParse(withoutFlag).success).toBe(false);
    expect(parse({ extra: true }).success).toBe(false);
  });
});
