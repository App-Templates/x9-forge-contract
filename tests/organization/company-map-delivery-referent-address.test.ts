import { describe, expect, it } from 'vitest';
import {
  DELIVERY_REFERENT_REFUSALS,
  deliveryReferentAddress,
  referentAddressKey,
} from '../../src/organization/company-map.js';

const ADDRESS = 'referente-prova@example.invalid';
const row = (personRef: string, email: string) => ({ personRef, email });

describe('s6900 deliveryReferentAddress', () => {
  it('(a) two project rows for the same person with the same address resolve to one address', () => {
    const result = deliveryReferentAddress({
      levels: [
        { level: 'business_unit', entries: [] },
        {
          level: 'project',
          entries: [row('stefano', ADDRESS), row('stefano-argiolas', `  ${ADDRESS.toUpperCase()} `)],
        },
      ],
    });
    expect(result).toEqual({
      ok: true,
      email: ADDRESS,
      level: 'project',
      personRefs: ['stefano', 'stefano-argiolas'],
    });
  });

  it('(b) the business unit level wins over a project level with several addresses', () => {
    const result = deliveryReferentAddress({
      levels: [
        { level: 'business_unit', entries: [row('capo', ADDRESS)] },
        { level: 'project', entries: [row('a', 'a@example.invalid'), row('b', 'b@example.invalid')] },
      ],
    });
    expect(result).toEqual({ ok: true, email: ADDRESS, level: 'business_unit', personRefs: ['capo'] });
  });

  it('(c) an empty business unit and a project with two different addresses is refused', () => {
    const result = deliveryReferentAddress({
      levels: [
        { level: 'business_unit', entries: [] },
        { level: 'project', entries: [row('a', 'a@example.invalid'), row('b', 'b@example.invalid')] },
      ],
    });
    expect(result).toEqual({ ok: false, code: 'delivery_referent_several_addresses' });
  });

  it('(d) no rows at any level is refused as missing', () => {
    expect(
      deliveryReferentAddress({
        levels: [
          { level: 'business_unit', entries: [] },
          { level: 'project', entries: [] },
        ],
      }),
    ).toEqual({ ok: false, code: 'delivery_referent_missing' });
    expect(deliveryReferentAddress({ levels: [] })).toEqual({ ok: false, code: 'delivery_referent_missing' });
  });

  it('(e) the requested address matches ignoring case and spaces, differs otherwise', () => {
    const levels = [{ level: 'project' as const, entries: [row('stefano', ADDRESS)] }];
    expect(deliveryReferentAddress({ levels, requestedAddress: ` ${ADDRESS.toUpperCase()}` }).ok).toBe(true);
    expect(deliveryReferentAddress({ levels, requestedAddress: 'altro@example.invalid' })).toEqual({
      ok: false,
      code: 'delivery_referent_address_differs',
    });
    expect(
      deliveryReferentAddress({ levels: [{ level: 'project', entries: [] }], requestedAddress: 'altro@example.invalid' }),
    ).toEqual({ ok: false, code: 'delivery_referent_missing' });
  });

  it('(f) a refusal never carries the requested address and the arguments are not modified', () => {
    const input = {
      levels: [{ level: 'project' as const, entries: [row('stefano', ADDRESS)] }],
      requestedAddress: 'segreto@example.invalid',
    };
    const before = structuredClone(input);
    const result = deliveryReferentAddress(input);
    expect(JSON.stringify(result)).not.toContain('segreto@example.invalid');
    expect(input).toEqual(before);
  });

  it('exposes the three refusal codes and the address key', () => {
    expect([...DELIVERY_REFERENT_REFUSALS]).toEqual([
      'delivery_referent_missing',
      'delivery_referent_several_addresses',
      'delivery_referent_address_differs',
    ]);
    expect(referentAddressKey('  A@B.It ')).toBe('a@b.it');
  });
});
