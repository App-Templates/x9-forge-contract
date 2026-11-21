import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import {
  DEV_SESSION_CRITERION_TEXT_MAX,
  DevSessionCriterionReferenceSchema,
  DevSessionCriterionSchema,
} from '../../src/capability/dev/session-acceptance.js';
import { ActionPlanBuSectionSchema } from '../../src/organization/action-plan.js';
import {
  MandateRequirementSchema,
  type MandateRequirement,
} from '../../src/organization/mandate-requirement.js';

// Code fixture in the documented list-piece shape; no production body is available here.
const requirement: MandateRequirement = {
  id: 'lista-spesa.1',
  text: 'La lista mostra gli ingredienti e le quantità per la spesa.',
  attestor: 'referente',
  proof: 'Il referente apre la lista e confronta ingredienti e quantità con il menu.',
  origin: 'mandato',
};

describe('s8340 mandate requirement', () => {
  it('s8340 principale: preserves the named requirement and its proof', () => {
    expect(MandateRequirementSchema.parse(requirement)).toStrictEqual(requirement);
    expect(DevSessionCriterionSchema.parse(requirement)).toStrictEqual(requirement);
  });

  it.each(['referente', 'revisore'] as const)('s8340 accepts attestor %s', (attestor) => {
    const input = { ...requirement, attestor };
    expect(MandateRequirementSchema.parse(input)).toStrictEqual(input);
  });

  it('s8340 keeps unit optional and inherits its validation', () => {
    expect(MandateRequirementSchema.parse(requirement)).not.toHaveProperty('unit');
    const input = { ...requirement, unit: 'ricerca' };
    expect(MandateRequirementSchema.parse(input)).toStrictEqual(input);
    expect(MandateRequirementSchema.safeParse({ ...input, unit: 'x'.repeat(30) }).success).toBe(true);
    for (const unit of ['', 'x'.repeat(31), 'Invalid_unit']) {
      expect(MandateRequirementSchema.safeParse({ ...input, unit }).success).toBe(false);
    }
  });

  it('s8340 negativo: rejects origin capo accepted by the base', () => {
    const input = { ...requirement, origin: 'capo' };
    expect(DevSessionCriterionSchema.safeParse(input).success).toBe(true);
    const result = MandateRequirementSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual([
        expect.objectContaining({ code: 'custom', path: ['origin'] }),
      ]);
    }
  });

  it('s8340 negativo: rejects a return criterion valid in the base', () => {
    const input = { ...requirement, origin: 'ritorno', reference: { kind: 'requirement', id: requirement.id } };
    expect(DevSessionCriterionSchema.safeParse(input).success).toBe(true);
    expect(MandateRequirementSchema.safeParse(input).success).toBe(false);
  });

  it.each(['sessione', 'esecutore'])('s8340 negativo: inherits rejection of attestor %s', (attestor) => {
    const input = { ...requirement, attestor };
    expect(DevSessionCriterionSchema.safeParse(input).success).toBe(false);
    expect(MandateRequirementSchema.safeParse(input).success).toBe(false);
  });

  it('s8340 negativo: inherits the id limit and grammar', () => {
    expect(MandateRequirementSchema.safeParse({ ...requirement, id: 'x'.repeat(40) }).success).toBe(true);
    for (const id of ['', 'x'.repeat(41), 'lista spesa.1']) {
      expect(MandateRequirementSchema.safeParse({ ...requirement, id }).success).toBe(false);
    }
  });

  it.each(['text', 'proof'] as const)('s8340 negativo: inherits nonempty %s and its limit', (field) => {
    const atLimit = { ...requirement, [field]: 'x'.repeat(DEV_SESSION_CRITERION_TEXT_MAX) };
    expect(MandateRequirementSchema.safeParse(atLimit).success).toBe(true);
    for (const value of ['', '   ', 'x'.repeat(DEV_SESSION_CRITERION_TEXT_MAX + 1)]) {
      expect(MandateRequirementSchema.safeParse({ ...requirement, [field]: value }).success).toBe(false);
    }
    expect(MandateRequirementSchema.parse({ ...requirement, [field]: '  Written proof  ' })[field]).toBe('Written proof');
  });

  it.each(['id', 'text', 'attestor', 'proof', 'origin'] as const)('s8340 negativo: does not default missing %s', (field) => {
    const input: Partial<MandateRequirement> = { ...requirement };
    delete input[field];
    expect(MandateRequirementSchema.safeParse(input).success).toBe(false);
  });

  it('s8340 negativo: inherits strict fields and the reference rule', () => {
    for (const extra of [
      { reference: 'Historical correction' },
      { reference: { kind: 'requirement', id: requirement.id } },
      { planId: 'plan_001' },
      { planVersion: 1 },
      { planDigest: 'a'.repeat(64) },
    ]) {
      expect(MandateRequirementSchema.safeParse({ ...requirement, ...extra }).success).toBe(false);
    }
  });

  it('s8340 preserves legacy strings in their existing schemas', () => {
    const section = {
      id: 'lista-spesa', title: 'Lista della spesa', expectedGoal: 'Il referente legge cosa comprare.',
      deliveryCriteria: [requirement.text], milestone: 1,
    };
    expect(ActionPlanBuSectionSchema.parse(section)).toStrictEqual(section);
    expect(DevSessionCriterionReferenceSchema.parse('Historical correction')).toBe('Historical correction');
    const legacy = { ...requirement, origin: 'ritorno', reference: 'Historical correction' };
    expect(DevSessionCriterionSchema.parse(legacy)).toStrictEqual(legacy);
  });

  it.each(['esm', 'cjs'] as const)('s8340 compiled %s subpath exports the same validation', async (format) => {
    // Resolve the public wildcard export, without adding a barrel dependency back to the plan.
    const subpath = '@x9-forge/contracts/organization/mandate-requirement';
    const compiled: typeof import('../../src/organization/mandate-requirement.js') = format === 'esm'
      ? await import(subpath)
      : createRequire(import.meta.url)(subpath);
    const schema = compiled.MandateRequirementSchema;
    expect(schema.parse(requirement)).toStrictEqual(requirement);
    const reviewer = { ...requirement, attestor: 'revisore', unit: 'ricerca' };
    expect(schema.parse(reviewer)).toStrictEqual(reviewer);
    for (const input of [
      { ...requirement, origin: 'capo' },
      { ...requirement, origin: 'ritorno', reference: 'Historical correction' },
      { ...requirement, attestor: 'sessione' },
      { ...requirement, attestor: 'esecutore' },
      { ...requirement, id: 'x'.repeat(41) },
      { ...requirement, proof: '' },
      { ...requirement, origin: undefined },
      { ...requirement, unit: 'x'.repeat(31) },
      { ...requirement, planId: 'plan_001' },
    ]) {
      expect(schema.safeParse(input).success).toBe(false);
    }
    expect(schema.parse(requirement)).not.toHaveProperty('unit');
    expect(schema.parse(requirement)).not.toHaveProperty('reference');
  });
});
