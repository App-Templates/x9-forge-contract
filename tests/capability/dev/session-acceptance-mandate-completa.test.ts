import { describe, expect, it } from 'vitest';
import {
  DEV_SESSION_COMPLETE_MANDATE_PROBLEMS,
  DEV_SESSION_MANDATE_CRITERION_PROOF,
  devSessionCompleteMandateCriteria,
  devSessionMandateAcceptanceProblem,
  mandateCriterionId,
} from '../../../src/capability/dev/session-acceptance-mandate.js';
import { DevSessionAssignmentSchema } from '../../../src/capability/dev/session-assignment.js';
import {
  DEV_SESSION_ACCEPTANCE_MAX_CRITERIA,
  DevSessionAcceptanceSchema,
  type DevSessionCriterion,
} from '../../../src/capability/dev/session-acceptance.js';
import { ReconciledMandateSchema, type ReconciledMandate } from '../../../src/organization/business-unit-mandate.js';

const texts = [
  'Posso aggiungere un prodotto alla lista della spesa.',
  'Il prodotto aggiunto resta nella lista dopo aver chiuso la pagina.',
  'Posso togliere un prodotto dalla lista.',
];

function mandate(key: string, criteria: string[], withReviewer = false): ReconciledMandate {
  return ReconciledMandateSchema.parse({
    tenantId: 'tenant-1', organizationId: 'dispensa-pronta', clientId: 'dispensa-pronta', projectId: 'dispensa-pronta-app',
    planSection: {
      planId: 'plan_001', planVersion: 2, planDigest: 'a'.repeat(64), deliveryShape: 'product',
      businessUnit: {
        buSlug: 'sviluppo', typeId: 'marketing', mandate: 'Build the app.', competencies: ['dev'],
        lead: { role: 'capo-bu' }, executor: 'agent', referent: { personRef: 'stefano', entryVersion: 3 },
        firstActivities: ['Start'], start: { kind: 'now' },
        ...(withReviewer ? { reviewer: { buSlug: 'qualita' } } : {}),
      },
      workBreakdown: [{ id: key, title: key, expectedGoal: 'Goal', deliveryCriteria: criteria, milestone: 1, owners: [{ buSlug: 'sviluppo', does: 'Builds' }] }],
    },
    decision: { requestId: 'decision_001', planVersion: 2 },
    referent: { personRef: 'stefano', entryVersion: 3 }, notebookPages: [],
    reconciliation: { outcome: 'agrees' }, reconciledAt: '2026-11-21T10:00:00+01:00',
  });
}

const own = (text: string, id: string, overrides: Partial<DevSessionCriterion> = {}): DevSessionCriterion =>
  ({ id, text, attestor: 'sessione', proof: 'Run the script.', origin: 'capo', ...overrides });

function assignment(key: string, criteria: DevSessionCriterion[]) {
  return DevSessionAssignmentSchema.parse({
    version: 1, tenantId: 'tenant-1', ownerId: '7', organizationId: 'dispensa-pronta', companyId: 'dispensa-pronta',
    projectId: 'dispensa-pronta-app', businessUnit: { slug: 'sviluppo' },
    requestedBy: { managementAgentId: 'capo-sviluppo', runtimeAgentId: 'capo-sviluppo', vaultAgentId: 62 },
    productKind: 'code', title: 'Lista spesa', task: 'Build the list.', miniPlan: 'Build, test.',
    materials: [], destination: { repo: 'App-Templates/dispensa-pronta' }, deliverableKey: key,
    createdAt: '2026-11-21T10:00:00+01:00',
    acceptance: { version: 1, template: { id: 'sviluppo-pezzo-app', version: 1 }, input: {}, criteria },
  });
}

function done(result: ReturnType<typeof devSessionCompleteMandateCriteria>): DevSessionCriterion[] {
  if (!result.ok) throw new Error(result.code);
  return result.criteria;
}

describe('s8162 mandate criteria completion', () => {
  it('s8162 completa-senza-copie', () => {
    const value = mandate('lista-spesa', texts);
    const capo = own('The script passes.', 'capo-1');
    expect(devSessionMandateAcceptanceProblem(assignment('lista-spesa', [capo]), value)?.code).toBe('mandate_criterion_missing');
    const criteria = done(devSessionCompleteMandateCriteria(value, 'lista-spesa', [capo]));
    expect(criteria).toEqual([capo, ...texts.map((text, index) => ({
      id: `lista-spesa.${index + 1}`, text, attestor: 'referente', proof: DEV_SESSION_MANDATE_CRITERION_PROOF, origin: 'mandato',
    }))]);
    expect(devSessionMandateAcceptanceProblem(assignment('lista-spesa', criteria), value)).toBeNull();
    expect(DevSessionAcceptanceSchema.safeParse({ version: 1, template: { id: 'sviluppo-pezzo-app', version: 1 }, input: {}, criteria }).success).toBe(true);
    const reviewed = done(devSessionCompleteMandateCriteria(mandate('lista-spesa', texts, true), 'lista-spesa', [capo]));
    expect(reviewed.slice(1).map((entry) => entry.attestor)).toEqual(['revisore', 'revisore', 'revisore']);
  });

  it('s8162 nomi-stabili', () => {
    const value = mandate('lista-spesa', texts);
    const a = own('A.', 'capo-1');
    const b = own('B.', 'capo-2');
    const ids = (list: DevSessionCriterion[]) => list.filter((entry) => entry.origin === 'mandato').map((entry) => entry.id);
    const first = done(devSessionCompleteMandateCriteria(value, 'lista-spesa', [a, b]));
    expect(ids(done(devSessionCompleteMandateCriteria(value, 'lista-spesa', [a, b])))).toEqual(ids(first));
    expect(ids(done(devSessionCompleteMandateCriteria(value, 'lista-spesa', [b, a])))).toEqual(['lista-spesa.1', 'lista-spesa.2', 'lista-spesa.3']);
    expect(mandateCriterionId('lista-spesa', 0)).toBe('lista-spesa.1');
  });

  it('s8162 scritti-a-mano-restano', () => {
    const value = mandate('lista-spesa', texts);
    const handWritten = texts.map((text, index) => own(text, `mio-${index}`, { origin: 'mandato', attestor: 'referente', proof: `Prova mia ${index}` }));
    const result = done(devSessionCompleteMandateCriteria(value, 'lista-spesa', handWritten));
    expect(result).toEqual(handWritten);
    expect(result).toBe(handWritten);
  });

  it('s8162 pezzo-sbagliato', () => {
    expect(devSessionCompleteMandateCriteria(mandate('lista-spesa', texts), 'altro-pezzo', [])).toMatchObject({ ok: false, code: 'deliverable_key_problem' });
  });

  it('s8162 criterio-vuoto-nel-piano', () => {
    expect(devSessionCompleteMandateCriteria(mandate('lista-spesa', [texts[0], '   ', texts[2]]), 'lista-spesa', [])).toEqual({ ok: false, code: 'mandate_criterion_blank', details: ['2'] });
  });

  it('s8162 id-troppo-lungo', () => {
    const long = 'a'.repeat(39);
    expect(devSessionCompleteMandateCriteria(mandate(long, texts), long, [])).toMatchObject({ ok: false, code: 'criterion_id_too_long' });
    const ok = 'a'.repeat(37);
    const criteria = done(devSessionCompleteMandateCriteria(mandate(ok, texts), ok, [own('Capo.', 'capo-1')]));
    expect(criteria[3]?.id).toHaveLength(39);
    expect(DevSessionAcceptanceSchema.safeParse({ version: 1, template: { id: 'sviluppo-pezzo-app', version: 1 }, input: {}, criteria }).success).toBe(true);
  });

  it('s8162 id-occupato', () => {
    const result = devSessionCompleteMandateCriteria(mandate('lista-spesa', texts), 'lista-spesa', [own('Altro testo.', 'lista-spesa.2')]);
    expect(result).toEqual({ ok: false, code: 'criterion_id_taken', details: ['lista-spesa.2'] });
  });

  it('s8162 troppi-criteri', () => {
    const many = Array.from({ length: DEV_SESSION_ACCEPTANCE_MAX_CRITERIA - 1 }, (_, index) => own(`Capo ${index}.`, `capo-${index}`));
    expect(devSessionCompleteMandateCriteria(mandate('lista-spesa', texts), 'lista-spesa', many)).toMatchObject({ ok: false, code: 'too_many_criteria' });
    expect(DEV_SESSION_COMPLETE_MANDATE_PROBLEMS).toEqual(['deliverable_key_problem', 'mandate_criterion_blank', 'criterion_id_too_long', 'criterion_id_taken', 'too_many_criteria']);
  });
});
