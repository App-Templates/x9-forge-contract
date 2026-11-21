import { describe, expect, it } from 'vitest';
import {
  DEV_SESSION_MANDATE_CRITERION_PROOF,
  devSessionCompleteMandateCriteria,
  devSessionMandateAcceptanceProblem,
  devSessionMandateCriteria,
} from '../../../src/capability/dev/session-acceptance-mandate.js';
import { DevSessionAssignmentSchema } from '../../../src/capability/dev/session-assignment.js';
import { DevSessionAcceptanceSchema, type DevSessionCriterion } from '../../../src/capability/dev/session-acceptance.js';
import { ReconciledMandateSchema, type ReconciledMandate } from '../../../src/organization/business-unit-mandate.js';

const texts = [
  'Posso aggiungere un prodotto alla lista della spesa.',
  'Una voce scaduta si distingue dalle altre quando apro la lista.',
];
const SPECIFIC = 'Aprire la lista con una voce scaduta';

type Requirement = { id: string; text: string; attestor: 'revisore' | 'referente'; proof: string; origin: 'mandato' };
const requirement = (index: number, overrides: Partial<Requirement> = {}): Requirement => ({
  id: `lista-spesa.${index + 1}`, text: texts[index]!, attestor: 'referente', proof: `Prova ${index + 1}`, origin: 'mandato', ...overrides,
});

function mandate(requirements: Requirement[] | undefined, withReviewer = false, key = 'lista-spesa'): ReconciledMandate {
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
      workBreakdown: [{
        id: key, title: key, expectedGoal: 'Goal', deliveryCriteria: texts, milestone: 1,
        owners: [{ buSlug: 'sviluppo', does: 'Builds' }],
        ...(requirements === undefined ? {} : { requirements }),
      }],
    },
    decision: { requestId: 'decision_001', planVersion: 2 },
    referent: { personRef: 'stefano', entryVersion: 3 }, notebookPages: [],
    reconciliation: { outcome: 'agrees' }, reconciledAt: '2026-11-21T10:00:00+01:00',
  });
}

function done(mandateValue: ReconciledMandate, own: DevSessionCriterion[] = []): DevSessionCriterion[] {
  const result = devSessionCompleteMandateCriteria(mandateValue, 'lista-spesa', own);
  if (!result.ok) throw new Error(result.code);
  return result.criteria;
}

function assignment(criteria: DevSessionCriterion[]) {
  return DevSessionAssignmentSchema.parse({
    version: 1, tenantId: 'tenant-1', ownerId: '7', organizationId: 'dispensa-pronta', companyId: 'dispensa-pronta',
    projectId: 'dispensa-pronta-app', businessUnit: { slug: 'sviluppo' },
    requestedBy: { managementAgentId: 'capo-sviluppo', runtimeAgentId: 'capo-sviluppo', vaultAgentId: 62 },
    productKind: 'code', title: 'Lista spesa', task: 'Build the list.', miniPlan: 'Build, test.',
    materials: [], destination: { repo: 'App-Templates/dispensa-pronta' }, deliverableKey: 'lista-spesa',
    createdAt: '2026-11-21T10:00:00+01:00',
    acceptance: { version: 1, template: { id: 'sviluppo-pezzo-app', version: 1 }, input: {}, criteria },
  });
}

describe('s8346 prova specifica del requisito', () => {
  it('s8346 principale', () => {
    const value = mandate([requirement(0, { proof: SPECIFIC }), requirement(1)]);
    const criteria = done(value);
    expect(criteria[0]).toEqual({ id: 'lista-spesa.1', text: texts[0], attestor: 'referente', proof: SPECIFIC, origin: 'mandato' });
    expect(criteria[1]?.proof).toBe('Prova 2');
    expect(devSessionMandateAcceptanceProblem(assignment(criteria), value)).toBeNull();
    expect(DevSessionAcceptanceSchema.safeParse({ version: 1, template: { id: 'sviluppo-pezzo-app', version: 1 }, input: {}, criteria }).success).toBe(true);
  });

  it('s8346 mandato vecchio conserva la prova generica', () => {
    const criteria = done(mandate(undefined));
    expect(criteria.map((c) => c.proof)).toEqual([DEV_SESSION_MANDATE_CRITERION_PROOF, DEV_SESSION_MANDATE_CRITERION_PROOF]);
    expect(criteria.map((c) => c.id)).toEqual(['lista-spesa.1', 'lista-spesa.2']);
    expect(criteria.map((c) => c.text)).toEqual(texts);
  });

  it('s8346 criteri già presenti tornano identici anche con prova storica', () => {
    const value = mandate([requirement(0, { proof: SPECIFIC }), requirement(1)]);
    const written = texts.map((text, index): DevSessionCriterion => ({ id: `mio-${index}`, text, attestor: 'referente', proof: `Prova storica ${index}`, origin: 'mandato' }));
    const result = devSessionCompleteMandateCriteria(value, 'lista-spesa', written);
    expect(result).toEqual({ ok: true, criteria: written });
    expect(result.ok && result.criteria).toBe(written);
  });

  it('s8346 criterio mancante aggiunto in ordine, senza toccare gli altri', () => {
    const value = mandate([requirement(0), requirement(1, { proof: SPECIFIC })]);
    const first: DevSessionCriterion = { id: 'mio-0', text: texts[0]!, attestor: 'referente', proof: 'Storica', origin: 'mandato' };
    const criteria = done(value, [first]);
    expect(criteria).toEqual([first, { id: 'lista-spesa.2', text: texts[1], attestor: 'referente', proof: SPECIFIC, origin: 'mandato' }]);
  });

  it('s8346 revisore senza revisore resta referente come oggi', () => {
    const requirements = [requirement(0, { attestor: 'revisore', proof: SPECIFIC }), requirement(1)];
    expect(done(mandate(requirements)).map((c) => c.attestor)).toEqual(['referente', 'referente']);
    expect(done(mandate(requirements, true)).map((c) => c.attestor)).toEqual(['revisore', 'referente']);
  });

  it('s8346 attestor referente dichiarato resta referente anche con un revisore', () => {
    const criteria = done(mandate([requirement(0), requirement(1, { attestor: 'revisore' })], true));
    expect(criteria.map((c) => c.attestor)).toEqual(['referente', 'revisore']);
  });

  it('s8346 nessuna attestation passa a soddisfatto', () => {
    const criteria = done(mandate([requirement(0, { proof: SPECIFIC }), requirement(1)]));
    for (const criterion of criteria) expect(Object.keys(criterion).sort()).toEqual(['attestor', 'id', 'origin', 'proof', 'text']);
  });

  it('s8346 negativo', () => {
    const value = mandate([requirement(0, { proof: SPECIFIC }), requirement(1)]);
    expect(devSessionCompleteMandateCriteria(value, 'altro-pezzo', [])).toMatchObject({ ok: false, code: 'deliverable_key_problem' });
    expect(devSessionMandateCriteria(value, 'lista-spesa.1')).toBeNull();
    const invented = done(value).map((c, i) => (i === 0 ? { ...c, id: 'inventato.1', text: 'Una frase che il piano non ha.' } : c));
    expect(devSessionMandateAcceptanceProblem(assignment(invented), value)).toMatchObject({ code: 'mandate_criterion_missing' });
  });

  it('s8346 gli id non seguono i requisiti ma la posizione', () => {
    const value = mandate([requirement(0, { proof: SPECIFIC }), requirement(1)]);
    expect(devSessionMandateCriteria(value, 'lista-spesa')?.map((c) => c.text)).toEqual(texts);
  });
});
