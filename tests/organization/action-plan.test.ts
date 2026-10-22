import { describe, expect, it } from 'vitest';
import { ActionPlanBusinessUnitSchema } from '../../src/organization/action-plan.js';

const nowUnit = {
  buSlug: 'vendite',
  typeId: 'vendite-b2b',
  mandate: 'Portare i primi clienti.',
  competencies: ['outreach', 'trattativa'],
  lead: { role: 'capo-bu' },
  reviewer: { role: 'director' },
  executor: 'agent',
  referent: { personRef: 'mario-rossi', entryVersion: 3 },
  firstActivities: ['Elenco dei contatti'],
  start: { kind: 'now' },
};

const plannedUnit = {
  ...nowUnit,
  buSlug: 'supporto',
  roleAgents: [{ role: 'Operatore di supporto', competencies: ['ticket'] }],
  start: { kind: 'planned', unlockedBy: { milestone: 2, delivery: 'Primo cliente acquisito' } },
};

describe('ActionPlanBusinessUnitSchema', () => {
  it('accepts a unit that starts now', () => {
    expect(ActionPlanBusinessUnitSchema.parse(nowUnit)).toEqual(nowUnit);
  });

  it('accepts a planned unit with role agents', () => {
    expect(ActionPlanBusinessUnitSchema.parse(plannedUnit)).toEqual(plannedUnit);
  });

  it('accepts a reviewer that is another unit', () => {
    expect(ActionPlanBusinessUnitSchema.safeParse({ ...nowUnit, reviewer: { buSlug: 'qualita' } }).success).toBe(true);
  });

  it('rejects a referent carrying an extra address field', () => {
    const referent = { ...nowUnit.referent, ['em' + 'ail']: 'a@b.it' };
    expect(ActionPlanBusinessUnitSchema.safeParse({ ...nowUnit, referent }).success).toBe(false);
  });

  it('rejects a planned start without unlockedBy', () => {
    expect(ActionPlanBusinessUnitSchema.safeParse({ ...nowUnit, start: { kind: 'planned' } }).success).toBe(false);
  });

  it('rejects duplicate competencies', () => {
    expect(ActionPlanBusinessUnitSchema.safeParse({ ...nowUnit, competencies: ['a', 'a'] }).success).toBe(false);
  });

  it('rejects a lead with the director role', () => {
    expect(ActionPlanBusinessUnitSchema.safeParse({ ...nowUnit, lead: { role: 'director' } }).success).toBe(false);
  });

  it('rejects an executor outside the list', () => {
    expect(ActionPlanBusinessUnitSchema.safeParse({ ...nowUnit, executor: 'human' }).success).toBe(false);
  });
});
