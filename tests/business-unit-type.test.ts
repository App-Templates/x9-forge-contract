import { describe, expect, it } from 'vitest';
import {
  BusinessUnitTypeCardSchema,
  type BusinessUnitTypeCard,
} from '../src/organization/business-unit-type.js';

const valid: BusinessUnitTypeCard = {
  typeId: 'design',
  label: 'Design',
  capabilities: ['cap-design', 'cap-ricerca'],
  skills: ['brand-review'],
  model: 'advanced',
  sessionEngine: 'claude',
  budget: { currency: 'EUR', monthlyCap: 500, warnPercent: 80 },
  deliveryCriteria: ['Tavole riviste', 'Asset esportati'],
  reviewerTypeId: 'sviluppo',
  version: 1,
};

describe('BusinessUnitTypeCardSchema', () => {
  it('accepts a valid card', () => {
    expect(BusinessUnitTypeCardSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a card without reviewer', () => {
    const { reviewerTypeId: _r, ...rest } = valid;
    expect(BusinessUnitTypeCardSchema.safeParse(rest).success).toBe(true);
  });

  it('rejects uppercase and empty typeId', () => {
    expect(BusinessUnitTypeCardSchema.safeParse({ ...valid, typeId: 'Design' }).success).toBe(false);
    expect(BusinessUnitTypeCardSchema.safeParse({ ...valid, typeId: '' }).success).toBe(false);
  });

  it('rejects duplicate capabilities', () => {
    expect(BusinessUnitTypeCardSchema.safeParse({ ...valid, capabilities: ['a', 'a'] }).success).toBe(false);
  });

  it('rejects duplicate skills', () => {
    expect(BusinessUnitTypeCardSchema.safeParse({ ...valid, skills: ['a', 'a'] }).success).toBe(false);
  });

  it('rejects warnPercent 0 and 101', () => {
    for (const warnPercent of [0, 101]) {
      expect(
        BusinessUnitTypeCardSchema.safeParse({ ...valid, budget: { ...valid.budget, warnPercent } }).success,
      ).toBe(false);
    }
  });

  it('rejects empty deliveryCriteria', () => {
    expect(BusinessUnitTypeCardSchema.safeParse({ ...valid, deliveryCriteria: [] }).success).toBe(false);
  });

  it('rejects extra keys', () => {
    expect(BusinessUnitTypeCardSchema.safeParse({ ...valid, extra: 1 }).success).toBe(false);
    expect(
      BusinessUnitTypeCardSchema.safeParse({ ...valid, budget: { ...valid.budget, extra: 1 } }).success,
    ).toBe(false);
  });

  it('rejects version 0', () => {
    expect(BusinessUnitTypeCardSchema.safeParse({ ...valid, version: 0 }).success).toBe(false);
  });

  it('rejects unknown model tier and engine', () => {
    expect(BusinessUnitTypeCardSchema.safeParse({ ...valid, model: 'gigantic' }).success).toBe(false);
    expect(BusinessUnitTypeCardSchema.safeParse({ ...valid, sessionEngine: 'gpt' }).success).toBe(false);
  });

  it('round-trips through parse', () => {
    const parsed = BusinessUnitTypeCardSchema.parse(valid);
    expect(BusinessUnitTypeCardSchema.parse(JSON.parse(JSON.stringify(parsed)))).toEqual(valid);
  });
});
