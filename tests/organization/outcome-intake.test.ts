import { describe, expect, expectTypeOf, it } from 'vitest';
import { OutcomeIntakeSchema, type OutcomeIntake } from '../../src/organization/outcome-intake.js';
import { OrganizationRunContextSchema } from '../../src/organization/run-context.js';
import { EvidenceRefSchema } from '../../src/organization/run-outcome.js';

const valid = {
  context: {
    schemaVersion: 1,
    runId: 'run-1',
    organizationId: 'org-1',
    ownerId: 'owner-1',
    identity: { managementAgentId: 'agent-1', runtimeAgentId: 'runtime-1' },
    issuer: 'x9',
    issuedAt: '2026-10-14T10:00:00.000Z',
    expiresAt: '2026-10-14T11:00:00.000Z',
  },
  experimentId: 'experiment-1',
  hypothesisRef: 'document://experiment-1/hypothesis',
  baselineRef: { kind: 'metric', ref: 'metric://experiment-1/baseline', grantsRead: false },
  resultRef: { kind: 'metric', ref: 'metric://experiment-1/result', grantsRead: false },
  sameDenominator: true,
  criterionRef: 'document://experiment-1/criterion',
  verdict: 'confirmed',
};

describe('OutcomeIntakeSchema', () => {
  it.each(['confirmed', 'refuted', 'inconclusive'])('accepts a valid %s verdict', (verdict) => {
    expect(OutcomeIntakeSchema.parse({ ...valid, verdict })).toEqual({ ...valid, verdict });
  });

  it('accepts inconclusive with different denominators', () => {
    expect(OutcomeIntakeSchema.safeParse({
      ...valid, verdict: 'inconclusive', sameDenominator: false,
    }).success).toBe(true);
  });

  it.each(['confirmed', 'refuted'])('rejects %s with different denominators', (verdict) => {
    const result = OutcomeIntakeSchema.safeParse({ ...valid, verdict, sameDenominator: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({
        path: ['sameDenominator'], code: 'custom',
      }));
    }
  });

  it.each(['experimentId', 'hypothesisRef', 'criterionRef'])('rejects empty %s', (field) => {
    expect(OutcomeIntakeSchema.safeParse({ ...valid, [field]: '' }).success).toBe(false);
  });

  it.each(['baselineRef', 'resultRef'] as const)('validates evidence in %s', (field) => {
    for (const invalid of [
      '',
      { ...valid[field], ref: '' },
      { ...valid[field], grantsRead: true },
      { ...valid[field], privateText: 'unexpected content' },
    ]) {
      expect(OutcomeIntakeSchema.safeParse({ ...valid, [field]: invalid }).success).toBe(false);
    }
  });

  it.each(Object.keys(valid))('rejects missing %s', (field) => {
    const input: Record<string, unknown> = { ...valid };
    delete input[field];
    expect(OutcomeIntakeSchema.safeParse(input).success).toBe(false);
  });

  it('rejects an extra field', () => {
    expect(OutcomeIntakeSchema.safeParse({ ...valid, privateText: 'unexpected content' }).success).toBe(false);
  });

  it('rejects an unknown verdict', () => {
    expect(OutcomeIntakeSchema.safeParse({ ...valid, verdict: 'passed' }).success).toBe(false);
  });

  it('requires a boolean denominator flag', () => {
    expect(OutcomeIntakeSchema.safeParse({ ...valid, sameDenominator: 'true' }).success).toBe(false);
  });

  it('reuses context and evidence schemas and brands experiment identifiers', () => {
    expect(OutcomeIntakeSchema.shape.context).toBe(OrganizationRunContextSchema);
    expect(OutcomeIntakeSchema.shape.baselineRef).toBe(EvidenceRefSchema);
    expect(OutcomeIntakeSchema.shape.resultRef).toBe(EvidenceRefSchema);
    expectTypeOf<OutcomeIntake['experimentId']>().toExtend<string>();
    expectTypeOf<string>().not.toExtend<OutcomeIntake['experimentId']>();
  });

  it('rejects an empty agent identity through the shared context', () => {
    const context = {
      ...valid.context,
      identity: { ...valid.context.identity, runtimeAgentId: '' },
    };
    expect(OutcomeIntakeSchema.safeParse({ ...valid, context }).success).toBe(false);
  });
});
