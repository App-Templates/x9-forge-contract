import { describe, expect, it } from 'vitest';
import {
  MANDATE_RECONCILIATION_OUTCOMES,
  MANDATE_SOURCES,
  MandateReconciliationOutcomeSchema,
  MandateReconciliationSchema,
  MandateSourceSchema,
  ReconciledMandateSchema,
  type MandateReconciliation,
  type ReconciledMandate,
} from '../../src/organization/business-unit-mandate.js';

function mandate(reconciliation: MandateReconciliation = { outcome: 'agrees' }): ReconciledMandate {
  return {
    tenantId: 'tenant-1',
    organizationId: 'organization-1',
    clientId: 'client-1',
    projectId: 'project-1',
    planSection: {
      planId: 'plan_001',
      planVersion: 2,
      planDigest: 'a'.repeat(64),
      businessUnit: {
        buSlug: 'sales',
        typeId: 'marketing',
        mandate: 'Acquire the first client and report questions to the referent.',
        competencies: ['outreach'],
        lead: { role: 'capo-bu' },
        executor: 'agent',
        referent: { personRef: 'stefano', entryVersion: 3 },
        firstActivities: ['Prepare the prospect list'],
        start: { kind: 'now' },
      },
    },
    decision: { requestId: 'decision_001', planVersion: 2 },
    referent: { personRef: 'stefano', entryVersion: 3 },
    notebookPages: [{ slug: 'sales-brief', version: 4 }],
    reconciliation,
    reconciledAt: '2026-10-22T10:00:00+02:00',
  };
}

const conflict: MandateReconciliation = {
  outcome: 'conflict',
  conflicts: [{ source: 'referent', ref: 'stefano', reason: 'The map has a newer referent version.' }],
};

describe('ReconciledMandateSchema', () => {
  it.each<MandateReconciliation>([
    { outcome: 'agrees' },
    conflict,
    { outcome: 'missing', missing: [{ source: 'notebook_page', ref: 'sales-brief' }] },
  ])('accepts a complete mandate with outcome $outcome', (reconciliation) => {
    const value = mandate(reconciliation);
    expect(ReconciledMandateSchema.parse(value)).toEqual(value);
  });

  it('enforces cross-source consistency', () => {
    const value = mandate();
    expect(ReconciledMandateSchema.safeParse({
      ...value, decision: { ...value.decision, planVersion: 3 },
    }).success).toBe(false);
    expect(ReconciledMandateSchema.safeParse({
      ...value, notebookPages: [...value.notebookPages, { slug: 'sales-brief', version: 5 }],
    }).success).toBe(false);
    for (const referent of [
      { ...value.referent, entryVersion: 4 },
      { ...value.referent, personRef: 'another-person' },
    ]) {
      expect(ReconciledMandateSchema.safeParse({ ...value, referent }).success).toBe(false);
      expect(ReconciledMandateSchema.safeParse({ ...value, referent, reconciliation: conflict }).success).toBe(true);
    }
  });

  it.each([
    { outcome: 'conflict', conflicts: [] },
    { outcome: 'missing', missing: [] },
    { outcome: 'unknown' },
    { outcome: 'agrees', extra: true },
    { outcome: 'conflict', conflicts: [{ source: 'unknown', ref: 'plan_001', reason: 'Mismatch' }] },
    { outcome: 'conflict', conflicts: [{ source: 'decision', ref: '', reason: 'Mismatch' }] },
    { outcome: 'conflict', conflicts: [{ source: 'decision', ref: 'x'.repeat(201), reason: 'Mismatch' }] },
    { outcome: 'conflict', conflicts: [{ source: 'decision', ref: 'decision_001', reason: '' }] },
    { outcome: 'conflict', conflicts: [{ source: 'decision', ref: 'decision_001', reason: 'x'.repeat(1001) }] },
    { outcome: 'conflict', conflicts: [{ source: 'decision', ref: 'decision_001', reason: 'Mismatch', extra: true }] },
    { outcome: 'missing', missing: [{ source: 'referent', ref: '' }] },
    { outcome: 'missing', missing: [{ source: 'referent', ref: 'x'.repeat(201) }] },
    { outcome: 'missing', missing: [{ source: 'referent', extra: true }] },
  ])('rejects invalid reconciliation %j', (reconciliation) => {
    expect(ReconciledMandateSchema.safeParse({ ...mandate(), reconciliation }).success).toBe(false);
  });

  it('bounds reconciliation lists and allows an unspecified missing reference', () => {
    const item = { source: 'decision', ref: 'x'.repeat(200), reason: 'x'.repeat(1000) };
    for (const [count, valid] of [[50, true], [51, false]] as const) {
      expect(MandateReconciliationSchema.safeParse({
        outcome: 'conflict', conflicts: Array.from({ length: count }, () => item),
      }).success).toBe(valid);
      expect(MandateReconciliationSchema.safeParse({
        outcome: 'missing', missing: Array.from({ length: count }, () => ({ source: 'referent' })),
      }).success).toBe(valid);
    }
  });

  it('reuses source and outcome enums', () => {
    for (const outcome of MANDATE_RECONCILIATION_OUTCOMES) {
      expect(MandateReconciliationOutcomeSchema.parse(outcome)).toBe(outcome);
    }
    for (const source of MANDATE_SOURCES) {
      expect(MandateSourceSchema.parse(source)).toBe(source);
    }
    expect(MandateReconciliationOutcomeSchema.safeParse('unknown').success).toBe(false);
    expect(MandateSourceSchema.safeParse('unknown').success).toBe(false);
  });

  it('rejects extra keys at every mandate boundary', () => {
    const value = mandate();
    for (const change of [
      { extra: true },
      { planSection: { ...value.planSection, extra: true } },
      { decision: { ...value.decision, extra: true } },
      { referent: { ...value.referent, extra: true } },
      { notebookPages: [{ slug: 'sales-brief', version: 4, extra: true }] },
    ]) {
      expect(ReconciledMandateSchema.safeParse({ ...value, ...change }).success).toBe(false);
    }
  });

  it('validates scoped identifiers, versions, digest and reconciliation time', () => {
    const value = mandate();
    for (const change of [
      { tenantId: '' }, { organizationId: '' }, { organizationId: 'x'.repeat(65) },
      { clientId: '' }, { clientId: 'x'.repeat(65) },
      { projectId: '' }, { projectId: 'x'.repeat(65) },
      { planSection: { ...value.planSection, planId: 'short' } },
      { planSection: { ...value.planSection, planDigest: 'g'.repeat(64) } },
      { planSection: { ...value.planSection, planVersion: 0 }, decision: { ...value.decision, planVersion: 0 } },
      { planSection: { ...value.planSection, planVersion: 1.5 }, decision: { ...value.decision, planVersion: 1.5 } },
      { decision: { ...value.decision, requestId: 'short' } },
      { notebookPages: [{ slug: 'Invalid Slug', version: 1 }] },
      { notebookPages: [{ slug: 'sales-brief', version: 0 }] },
      { notebookPages: [{ slug: 'sales-brief', version: 1.5 }] },
      { reconciledAt: '2026-10-22T10:00:00' },
    ]) {
      expect(ReconciledMandateSchema.safeParse({ ...value, ...change }).success).toBe(false);
    }
  });

  it('accepts up to 100 unique notebook pages, including none', () => {
    for (const [count, valid] of [[0, true], [100, true], [101, false]] as const) {
      const notebookPages = Array.from({ length: count }, (_, index) => ({ slug: `page-${index}`, version: 1 }));
      expect(ReconciledMandateSchema.safeParse({ ...mandate(), notebookPages }).success).toBe(valid);
    }
  });
});
