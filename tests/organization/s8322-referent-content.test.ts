import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  CompanyMapEntrySchema,
  referentForUnit,
  type CompanyMapEntry,
  type CompanyMapLevel,
} from '../../src/organization/company-map.js';
import {
  ActionPlanSchema,
  actionPlanCanonicalJson,
  type ActionPlan,
} from '../../src/organization/action-plan.js';

const scope = {
  tenantId: '1', organizationId: 'good-choice', clientId: 'client-1',
  projectId: 'project-1', buSlug: 'design',
};
const referent = { personRef: 'maria-verdi', entryVersion: 3 };
const superseded = { ok: false, code: 'referent_superseded' };
const notInMap = { ok: false, code: 'referent_not_in_map' };
const levels: CompanyMapLevel[] = ['client', 'project', 'business_unit'];

function entry(level: CompanyMapLevel, version: number, changes: Partial<CompanyMapEntry> = {}): CompanyMapEntry {
  return CompanyMapEntrySchema.parse({
    tenantId: scope.tenantId, organizationId: scope.organizationId, clientId: scope.clientId,
    level,
    ...(level !== 'client' ? { projectId: scope.projectId } : {}),
    ...(level === 'business_unit' ? { buSlug: scope.buSlug } : {}),
    kind: 'referent', personRef: referent.personRef,
    name: 'Maria Verdi', role: 'Owner', email: 'maria@example.com',
    version, supersedes: version - 1,
    digest: (version === 3 ? 'a' : 'b').repeat(64),
    source: { kind: 'decision', requestId: version === 3 ? 'dec_3544a95d' : 'dec_d477c8de', planVersion: 2 },
    confirmedAt: version === 3 ? '2026-11-23T10:00:00Z' : '2026-11-24T10:00:00Z',
    ...changes,
  });
}

describe('s8322 referent content', () => {
  it.each(levels)('s8322 identical reconfirmation at %s level', (level) => {
    const pointed = entry(level, 3);
    const current = entry(level, 4);
    expect(pointed.source).not.toEqual(current.source);
    expect(pointed.confirmedAt).not.toBe(current.confirmedAt);
    expect(pointed.digest).not.toBe(current.digest);
    expect(pointed.supersedes).not.toBe(current.supersedes);
    // Reverse only the current entry: ordering both alike would hide insertion-order comparisons.
    const reversed = CompanyMapEntrySchema.parse(Object.fromEntries(Object.entries(current).reverse()));
    const reordered = Object.fromEntries(Object.entries(reversed).reverse()) as CompanyMapEntry;
    for (const candidate of [current, reordered]) {
      for (const entries of [[pointed, candidate], [candidate, pointed]]) {
        const result = referentForUnit({ entries, scope, referent });
        expect(result).toEqual({ ok: true, entry: candidate, level });
        if (result.ok) expect(result.entry).toBe(candidate);
      }
    }
  });

  it.each([
    ['email', { email: 'other@example.com' }],
    ['name', { name: 'maria verdi' }],
    ['role', { role: 'owner' }],
    ['email case', { email: 'Maria@example.com' }],
  ] as const)('s8322 changed %s', (_field, changes) => {
    for (const level of levels) {
      const pointed = entry(level, 3);
      const current = entry(level, 4, changes);
      expect(referentForUnit({ entries: [pointed, current], scope, referent })).toEqual(superseded);
    }
  });

  it('refuses a missing exact version even when other historical content matches', () => {
    for (const level of levels) {
      const current = entry(level, 4);
      for (const entries of [[current], [entry(level, 2), current], [entry(level, 5), current]]) {
        expect(referentForUnit({ entries, scope, referent })).toEqual(superseded);
      }
    }
  });

  it('compares the pointed content to the highest version, not to an intermediate one', () => {
    const pointed = entry('project', 3);
    const middle = entry('project', 4);
    const current = entry('project', 5, { email: 'new@example.com' });
    expect(referentForUnit({ entries: [middle, current, pointed], scope, referent })).toEqual(superseded);
    const reconfirmed = entry('project', 5);
    expect(referentForUnit({ entries: [middle, reconfirmed, pointed], scope, referent }))
      .toEqual({ ok: true, entry: reconfirmed, level: 'project' });
  });

  it('preserves the same-version and unversioned lookup without consulting history', () => {
    for (const level of levels) {
      const current = entry(level, 4, { name: 'New Name', role: 'New Role', email: 'new@example.com' });
      for (const pointer of [{ personRef: referent.personRef }, { personRef: referent.personRef, entryVersion: 4 }]) {
        expect(referentForUnit({ entries: [entry(level, 3), current], scope, referent: pointer }))
          .toEqual({ ok: true, entry: current, level });
        expect(referentForUnit({ entries: [current], scope, referent: pointer }))
          .toEqual({ ok: true, entry: current, level });
      }
    }
  });

  it.each([
    ['tenant', { tenantId: '2' }],
    ['organization', { organizationId: 'other-org' }],
    ['client', { clientId: 'other-client' }],
    ['project', { projectId: 'other-project' }],
    ['business unit', { buSlug: 'other-unit' }],
    ['person', { personRef: 'other-person' }],
  ] as const)('isolates %s for both current entries and history', (_field, changes) => {
    const foreignPointed = entry('business_unit', 3, changes);
    const foreignCurrent = entry('business_unit', 4, changes);
    const current = entry('business_unit', 4);
    expect(referentForUnit({ entries: [foreignPointed, foreignCurrent], scope, referent })).toEqual(notInMap);
    expect(referentForUnit({ entries: [foreignPointed, current], scope, referent })).toEqual(superseded);
    const pointed = entry('business_unit', 3);
    expect(referentForUnit({ entries: [foreignCurrent, pointed, current], scope, referent }))
      .toEqual({ ok: true, entry: current, level: 'business_unit' });
  });

  it.each([
    ['project', 'client'],
    ['business_unit', 'client'],
    ['business_unit', 'project'],
  ] as const)('does not borrow %s history from %s level or fall back after refusal', (higher, lower) => {
    const current = entry(higher, 4);
    const lowerPointed = entry(lower, 3);
    expect(referentForUnit({ entries: [lowerPointed, current], scope, referent })).toEqual(superseded);
    const pointed = entry(higher, 3);
    const lowerCurrent = entry(lower, 10);
    expect(referentForUnit({ entries: [lowerCurrent, current, lowerPointed, pointed], scope, referent }))
      .toEqual({ ok: true, entry: current, level: higher });
    expect(referentForUnit({
      entries: [lowerPointed, pointed, entry(higher, 4, { email: 'changed@example.com' })], scope, referent,
    })).toEqual(superseded);
  });

  it('does not mutate entries, their metadata, the scope or the pointer', () => {
    const entries = [entry('project', 4), entry('project', 3)];
    const input = { entries, scope: { ...scope }, referent: { ...referent } };
    const before = structuredClone(input);
    for (const item of entries) {
      Object.freeze(item.source);
      Object.freeze(item);
    }
    Object.freeze(entries);
    Object.freeze(input.scope);
    Object.freeze(input.referent);
    expect(referentForUnit(input)).toEqual({ ok: true, entry: entries[0], level: 'project' });
    expect(input).toEqual(before);
    expect(JSON.stringify(input)).toBe(JSON.stringify(before));
    expect(referentForUnit({ entries: [], scope, referent })).toEqual(notInMap);
  });
});

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex');

function readSavedFixture(): ActionPlan {
  return ActionPlanSchema.parse(JSON.parse(readFileSync(
    new URL('./fixtures/action-plan-v3-forma.json', import.meta.url), 'utf8',
  )));
}

function verifySavedPlan(saved: ActionPlan): void {
  const before = structuredClone(saved);
  const parsed = ActionPlanSchema.parse(saved);
  expect(parsed).toEqual(saved);
  const serialized = JSON.stringify(parsed);
  const canonical = actionPlanCanonicalJson(parsed);
  expect(canonical).toBe(actionPlanCanonicalJson(saved));
  expect(sha256(canonical)).toBe(saved.digest);
  for (const unit of parsed.businessUnits) {
    const mapScope = {
      tenantId: parsed.tenantId, organizationId: parsed.organizationId, clientId: parsed.clientId,
      projectId: parsed.projectId, buSlug: unit.buSlug,
    };
    const content = { ...mapScope, personRef: unit.referent.personRef };
    const pointedVersion = unit.referent.entryVersion;
    expect(pointedVersion).toBeDefined();
    const pointed = entry('business_unit', pointedVersion ?? 3, {
      ...content, supersedes: undefined,
    });
    const current = entry('business_unit', (pointedVersion ?? 3) + 1, {
      ...content, supersedes: pointedVersion,
    });
    expect(referentForUnit({ entries: [pointed, current], scope: mapScope, referent: unit.referent }))
      .toEqual({ ok: true, entry: current, level: 'business_unit' });
    expect(unit.referent).toEqual({ personRef: pointed.personRef, entryVersion: pointedVersion });
  }
  expect(parsed).toEqual(before);
  expect(saved).toEqual(before);
  expect(JSON.stringify(parsed)).toBe(serialized);
  expect(actionPlanCanonicalJson(parsed)).toBe(canonical);
  expect(parsed.digest).toBe(before.digest);
  expect(sha256(actionPlanCanonicalJson(parsed))).toBe(before.digest);
  expect(ActionPlanSchema.parse(JSON.parse(serialized))).toEqual(before);
}

describe('s8322 saved plan rereads identically', () => {
  it('keeps the existing historical fixture without enrichment', () => {
    const raw: unknown = JSON.parse(readFileSync(
      new URL('./fixtures/action-plan-v3-forma.json', import.meta.url), 'utf8',
    ));
    const saved = ActionPlanSchema.parse(raw);
    expect(saved).toEqual(raw);
    verifySavedPlan(saved);
  });

  it.each(['historical', 'current'] as const)('keeps pointer 3 in a %s plan using the synthetic request 579 shape', (form) => {
    // Synthetic reconstruction only; this is not a capture of plan_ecc3bd19 or its decisions.
    const fixture = readSavedFixture();
    const saved = ActionPlanSchema.parse({
      ...fixture, planId: 'plan_ecc3bd19', version: 2,
      businessUnits: fixture.businessUnits.map((unit) => ({
        ...unit, referent: { ...unit.referent, entryVersion: 3 },
        ...(form === 'current' ? {
          sections: [{
            id: 'report', title: 'Report', expectedGoal: 'An approved report',
            deliveryCriteria: ['Report accepted'], milestone: 1,
          }],
        } : {}),
      })),
      ...(form === 'current' ? { deliveryShape: 'study' } : {}),
    });
    saved.digest = sha256(actionPlanCanonicalJson(saved));
    verifySavedPlan(saved);
    for (const unit of saved.businessUnits) expect(unit.referent.entryVersion).toBe(3);
  });
});
