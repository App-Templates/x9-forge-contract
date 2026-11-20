import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  DEV_SESSION_MANDATE_ACCEPTANCE_PROBLEMS,
  devSessionMandateAcceptanceProblem,
  devSessionMandateCriteria,
} from '../../../src/capability/dev/session-acceptance-mandate.js';
import { DevSessionAssignmentSchema, type DevSessionAssignment } from '../../../src/capability/dev/session-assignment.js';
import { DevSessionAcceptanceSchema, type DevSessionCriterion } from '../../../src/capability/dev/session-acceptance.js';
import { DEV_SESSION_TEMPLATES, devSessionRequirements } from '../../../src/capability/dev/session-acceptance-templates.js';
import { ReconciledMandateSchema, type ReconciledMandate } from '../../../src/organization/business-unit-mandate.js';

const texts: [string, string, string] = ['The user can save a product.', 'The saved product is stored.', 'The saved product can be reopened.'];
const sectionTexts = ['The market analysis cites its sources.', 'The market analysis covers competitors.'];
const item = (id: string, buSlug: string, deliveryCriteria: string[]) => ({
  id, title: id, expectedGoal: 'Goal', deliveryCriteria, milestone: 1,
  owners: [{ buSlug, does: 'Does' }],
});
const section = (id: string, deliveryCriteria: string[]) => ({
  id, title: id, expectedGoal: 'Goal', deliveryCriteria, milestone: 1,
});

function mandate(overrides: Partial<ReconciledMandate['planSection']> = {}): ReconciledMandate {
  return ReconciledMandateSchema.parse({
    tenantId: 'tenant-1', organizationId: 'good-choice', clientId: 'good-choice', projectId: 'good-choice-app',
    planSection: {
      planId: 'plan_001', planVersion: 2, planDigest: 'a'.repeat(64),
      businessUnit: {
        buSlug: 'design', typeId: 'marketing', mandate: 'Design the product.', competencies: ['design'],
        lead: { role: 'capo-bu' }, executor: 'agent', referent: { personRef: 'stefano', entryVersion: 3 },
        firstActivities: ['Start'], start: { kind: 'now' },
      },
      ...overrides,
    },
    decision: { requestId: 'decision_001', planVersion: 2 },
    referent: { personRef: 'stefano', entryVersion: 3 }, notebookPages: [],
    reconciliation: { outcome: 'agrees' }, reconciledAt: '2026-10-22T10:00:00+02:00',
  });
}

function productMandate(withReviewer = false): ReconciledMandate {
  const base = mandate();
  return mandate({
    deliveryShape: 'product',
    businessUnit: { ...base.planSection.businessUnit, ...(withReviewer ? { reviewer: { buSlug: 'qualita' } } : {}) },
    workBreakdown: [
      item('design-parent', 'design', ['Parent layout is consistent.', 'Parent navigation works.']),
      { ...item('design-calendario', 'design', texts), parentId: 'design-parent', owners: [
        { buSlug: 'design', does: 'Designs' }, { buSlug: 'web', does: 'Builds' },
      ] },
      item('web-home', 'web', ['Home loads.', 'Home links work.']),
      item('design-menu', 'design', ['Menu opens.', 'Menu closes.']),
    ],
  });
}

function studyMandate(): ReconciledMandate {
  const base = mandate();
  return mandate({ deliveryShape: 'study', businessUnit: { ...base.planSection.businessUnit, sections: [
    section('analisi-mercato', sectionTexts), section('piano-costi', ['Costs are itemized.', 'Totals match.']),
  ] } });
}

function criterion(text: string, index: number, overrides: Partial<DevSessionCriterion> = {}): DevSessionCriterion {
  return { id: `mandate-${index + 1}`, text, attestor: 'referente', proof: 'Inspect the delivered product.', origin: 'mandato', ...overrides };
}

function assignment(criteria: DevSessionCriterion[] = texts.map((text, index) => criterion(text, index))): DevSessionAssignment {
  return DevSessionAssignmentSchema.parse({
    version: 1, tenantId: 'tenant-1', ownerId: '7', organizationId: 'good-choice', companyId: 'good-choice',
    projectId: 'good-choice-app', businessUnit: { slug: 'design' },
    requestedBy: { managementAgentId: 'capo-design', runtimeAgentId: 'capo-design', vaultAgentId: 62 },
    productKind: 'code', title: 'Product calendar', task: 'Build the product calendar.', miniPlan: 'Build, save, test.',
    materials: [], destination: { repo: 'App-Templates/goodchoice-backtest' },
    deliverableKey: 'design-calendario', createdAt: '2026-10-27T15:00:00+01:00',
    acceptance: { version: 1, template: { id: 'sviluppo-pezzo-app', version: 1 }, input: {}, criteria },
  });
}

describe('mandate criteria reach the session without omissions', () => {
  it('s7563_riuso', () => {
    const source = readFileSync(new URL('../../../src/capability/dev/session-acceptance-mandate.ts', import.meta.url), 'utf8');
    expect(source).toMatch(/import\s*\{[^}]*\bmandateDeliverableKeys\b[^}]*\}\s*from\s*['"]\.\/session-assignment\.js['"]/);
    expect(source).toMatch(/mandateDeliverableKeys\(mandate\)\.includes\(deliverableKey\)/);
    expect(source).not.toMatch(/owners\s*\.\s*some\s*\(/);
    expect(DEV_SESSION_MANDATE_ACCEPTANCE_PROBLEMS).toEqual([
      'deliverable_key_problem', 'mandate_criterion_blank', 'mandate_criterion_missing',
      'mandate_criterion_unknown', 'mandate_attestor_not_available', 'mandate_unit_not_owner',
    ]);
  });

  it('s7563_voce', () => {
    const value = productMandate();
    expect(devSessionMandateCriteria(value, 'design-calendario')).toEqual(texts.map((text) => ({ text, attestor: 'referente', units: ['web'] })));
    expect(devSessionMandateCriteria(value, 'design-menu')).toEqual(['Menu opens.', 'Menu closes.'].map((text) => ({ text, attestor: 'referente', units: [] })));
    expect(devSessionMandateCriteria(studyMandate(), 'analisi-mercato')).toEqual(sectionTexts.map((text) => ({ text, attestor: 'referente', units: [] })));
    expect(devSessionMandateCriteria(value, 'unknown')).toBeNull();
    expect(devSessionMandateCriteria(value, 'web-home')).toBeNull();
    expect(devSessionMandateCriteria(studyMandate(), 'unknown')).toBeNull();
    expect(devSessionMandateCriteria(mandate(), 'design-calendario')).toBeNull();
  });

  it('s7563_ripiego', () => {
    for (const [withReviewer, attestor] of [[true, 'revisore'], [false, 'referente']] as const) {
      const criteria = devSessionMandateCriteria(productMandate(withReviewer), 'design-calendario');
      expect(criteria?.map((entry) => entry.attestor)).toEqual(texts.map(() => attestor));
      expect(criteria?.some((entry) => String(entry.attestor) === 'sessione')).toBe(false);
    }
  });

  it('s7563_vecchio', () => {
    const { acceptance: _acceptance, deliverableKey: _key, ...old } = assignment();
    expect(devSessionMandateAcceptanceProblem(old, mandate())).toBeNull();
  });

  it('s7563_chiave', () => {
    const { deliverableKey: _key, ...without } = assignment();
    expect(devSessionMandateAcceptanceProblem(without, productMandate())).toEqual({ code: 'deliverable_key_problem', details: ['deliverable_key_missing'] });
    for (const key of ['unknown', 'web-home']) expect(devSessionMandateAcceptanceProblem({ ...assignment(), deliverableKey: key }, productMandate())).toEqual({ code: 'deliverable_key_problem', details: ['deliverable_key_not_in_mandate'] });
    expect(devSessionMandateAcceptanceProblem({ ...assignment(), tenantId: 'foreign' }, productMandate())).toEqual({ code: 'deliverable_key_problem', details: ['mandate_foreign_scope'] });
    expect(devSessionMandateAcceptanceProblem({ ...assignment(), businessUnit: { slug: 'web' } }, productMandate())).toEqual({ code: 'deliverable_key_problem', details: ['mandate_foreign_business_unit'] });
    expect(devSessionMandateAcceptanceProblem(assignment(), mandate())).toEqual({ code: 'deliverable_key_problem', details: ['mandate_without_deliverables'] });
  });

  it('s7563_completo', () => {
    const criteria = texts.map((text, index) => criterion(text, index));
    expect(devSessionMandateAcceptanceProblem(assignment([...criteria.reverse(), criterion('Extra check.', 10, { origin: 'capo', attestor: 'sessione' })]), productMandate())).toBeNull();
  });

  it('s7563_manca_uno', () => {
    expect(devSessionMandateAcceptanceProblem(assignment(texts.slice(0, 2).map((text, index) => criterion(text, index))), productMandate())).toEqual({ code: 'mandate_criterion_missing', details: [texts[2]] });
  });

  it('s7563_manca_piu_di_uno', () => {
    expect(devSessionMandateAcceptanceProblem(assignment([criterion(texts[1], 1)]), productMandate())).toEqual({ code: 'mandate_criterion_missing', details: [texts[0], texts[2]] });
  });

  it('s7563_testo_cambiato', () => {
    const criteria = texts.map((text, index) => criterion(index === 0 ? text + 'x' : text, index));
    expect(devSessionMandateAcceptanceProblem(assignment(criteria), productMandate())).toEqual({ code: 'mandate_criterion_missing', details: [texts[0]] });
  });

  it('s7563_origine_sbagliata', () => {
    const criteria = texts.map((text, index) => criterion(text, index, index === 1 ? { origin: 'capo' } : {}));
    expect(devSessionMandateAcceptanceProblem(assignment(criteria), productMandate())).toEqual({ code: 'mandate_criterion_missing', details: [texts[1]] });
  });

  it('s7563_sconosciuto', () => {
    const value = assignment([...texts.map((text, index) => criterion(text, index)),
      criterion('Unknown.', 5, { attestor: 'revisore', unit: 'foreign' }), criterion('Also unknown.', 6),
    ]);
    expect(devSessionMandateAcceptanceProblem(value, productMandate())).toEqual({ code: 'mandate_criterion_unknown', details: ['mandate-6', 'mandate-7'] });
  });

  it('s7563_spazi', () => {
    const value = productMandate();
    const piece = value.planSection.workBreakdown?.find((entry) => entry.id === 'design-calendario');
    if (!piece) throw new Error('Missing fixture piece');
    piece.deliveryCriteria = texts.map((text) => `  ${text}\t`);
    expect(devSessionMandateCriteria(value, piece.id)?.map((entry) => entry.text)).toEqual(texts);
    const input = assignment();
    if (!input.acceptance) throw new Error('Missing fixture acceptance');
    input.acceptance.criteria = input.acceptance.criteria.map((entry) => ({ ...entry, text: `\n ${entry.text}  ` }));
    expect(devSessionMandateAcceptanceProblem(input, value)).toBeNull();
    piece.deliveryCriteria = [texts[0], '   ', texts[2], '\t'];
    expect(ReconciledMandateSchema.safeParse(value).success).toBe(true);
    expect(devSessionMandateCriteria(value, piece.id)?.map((entry) => entry.text)).toEqual([texts[0], '', texts[2], '']);
    expect(devSessionMandateAcceptanceProblem(input, value)).toEqual({ code: 'mandate_criterion_blank', details: ['2', '4'] });
  });

  it('s7563_attestatore', () => {
    const criteria = texts.map((text, index) => criterion(text, index, { attestor: index === 1 ? 'referente' : 'revisore' }));
    expect(devSessionMandateAcceptanceProblem(assignment(criteria), productMandate())).toEqual({ code: 'mandate_attestor_not_available', details: ['mandate-1', 'mandate-3'] });
    expect(devSessionMandateAcceptanceProblem(assignment(criteria), productMandate(true))).toBeNull();
    expect(devSessionMandateAcceptanceProblem(assignment(), productMandate())).toBeNull();
  });

  it('s7563_altra_bu', () => {
    const criteria = texts.map((text, index) => criterion(text, index, { unit: 'web' }));
    expect(devSessionMandateAcceptanceProblem(assignment(criteria), productMandate())).toBeNull();
    expect(devSessionMandateAcceptanceProblem(assignment(criteria.map((entry, index) => ({ ...entry, unit: index === 0 ? 'web' : index === 1 ? 'design' : 'foreign' }))), productMandate())).toEqual({ code: 'mandate_unit_not_owner', details: ['mandate-2', 'mandate-3'] });
    const studyCriteria = sectionTexts.map((text, index) => criterion(text, index, { unit: 'web' }));
    expect(devSessionMandateAcceptanceProblem({ ...assignment(studyCriteria), deliverableKey: 'analisi-mercato' }, studyMandate())).toEqual({ code: 'mandate_unit_not_owner', details: ['mandate-1', 'mandate-2'] });
    expect(devSessionMandateAcceptanceProblem({ ...assignment(sectionTexts.map((text, index) => criterion(text, index))), deliverableKey: 'analisi-mercato' }, studyMandate())).toBeNull();
  });

  it('s7563_posti', () => {
    const tenTexts = Array.from({ length: 10 }, (_, index) => `Mandate check ${index + 1}.`);
    const value = productMandate(true);
    const piece = value.planSection.workBreakdown?.find((entry) => entry.id === 'design-calendario');
    if (!piece) throw new Error('Missing fixture piece');
    piece.deliveryCriteria = tenTexts;
    const criteria = [
      ...tenTexts.map((text, index) => criterion(text, index)),
      ...Array.from({ length: 10 }, (_, index) => criterion(`Lead check ${index + 1}.`, index + 10, { origin: 'capo', attestor: 'sessione' })),
    ];
    for (const [id, template] of Object.entries(DEV_SESSION_TEMPLATES)) {
      const input = assignment(criteria);
      input.productKind = template.productKind;
      input.acceptance = DevSessionAcceptanceSchema.parse({ version: 1, template: { id, version: 1 }, input: {}, criteria });
      expect(input.acceptance.criteria).toHaveLength(20);
      expect(devSessionMandateAcceptanceProblem(input, value)).toBeNull();
      const requirements = devSessionRequirements(input.acceptance);
      if (!requirements.ok) throw new Error(requirements.code);
      expect(requirements.requirements).toHaveLength(20 + template.formCriteria.length);
      expect(requirements.requirements.slice(template.formCriteria.length).map((entry) => entry.id)).toEqual(criteria.map((entry) => entry.id));
    }
  });
});
