import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DevSessionAssignmentSchema } from '../../../src/capability/dev/session-assignment.js';
import {
  DEV_SESSION_TEMPLATES, devSessionAcceptanceTemplateProblem, devSessionHasChiefStepCriterion,
} from '../../../src/capability/dev/session-acceptance-templates.js';

// Shape rebuilt from the plan (GOO-194, 21/11 14:54:40Z), not a production capture.
const base = {
  version: 1, tenantId: 'tenant-1', ownerId: '7', organizationId: 'good-choice',
  companyId: 'good-choice', projectId: 'good-choice-app', businessUnit: { slug: 'sviluppo' },
  requestedBy: { managementAgentId: 'capo-sviluppo', runtimeAgentId: 'capo-sviluppo', vaultAgentId: 62 },
  productKind: 'code', title: 'Pezzo', task: 'Costruisci il pezzo.', miniPlan: '1. Costruire. 2. Provare.',
  materials: [], destination: { repo: 'App-Templates/goodchoice-backtest' }, createdAt: '2026-11-21T14:54:40Z',
};
const input = { userPath: ['Apre la lista'], data: 'veri', visualSource: { kind: 'nessuna' } };
const criterion = (origin: string, attestor: string, extra: object = {}) => ({
  id: 'c-1', text: 'Il passo nuovo funziona', attestor, proof: 'Lo apre e lo vede', origin, ...extra,
});
const build = (criteria: object[], inputOverride: object = input) => DevSessionAssignmentSchema.parse({
  ...base, acceptance: { version: 1, template: { id: 'sviluppo-pezzo-app', version: 1 }, input: inputOverride, criteria },
});
const without = (key: string) => Object.fromEntries(Object.entries(input).filter(([k]) => k !== key));

describe('s8407 criterio del capo per il passo nuovo', () => {
  it('s8407 principale', () => {
    expect(devSessionAcceptanceTemplateProblem(build([criterion('capo', 'sessione')]))).toBeNull();
  });

  it('s8407 senza-criterio-resta-rifiutata', () => {
    const forms = [
      [criterion('capo', 'revisore')], [criterion('capo', 'referente')],
      [criterion('ritorno', 'referente', { reference: 'Correggere come richiesto' })],
    ];
    for (const criteria of forms) {
      expect(devSessionAcceptanceTemplateProblem(build(criteria))).toEqual({ code: 'input_missing', detail: 'proofScripts' });
    }
  });

  it('s8407 criterio-del-capo-non-copre-altri-ingressi', () => {
    const criteria = [criterion('capo', 'sessione')];
    expect(devSessionAcceptanceTemplateProblem(build(criteria, without('userPath')))).toEqual({ code: 'input_missing', detail: 'userPath' });
    expect(devSessionAcceptanceTemplateProblem(build(criteria, without('visualSource')))).toEqual({ code: 'input_missing', detail: 'visualSource' });
  });

  it('s8407 forma-salvata-con-script-identica', () => {
    const withScripts = { ...input, proofScripts: ['test:e2e'] };
    const saved = criterion('ritorno', 'referente', { reference: 'Correggere la scheda come richiesto' });
    expect(devSessionAcceptanceTemplateProblem(build([saved], withScripts))).toBeNull();
    expect(devSessionAcceptanceTemplateProblem(build([criterion('capo', 'sessione')], withScripts))).toBeNull();
    expect([...DEV_SESSION_TEMPLATES['sviluppo-pezzo-app'].requiredInput]).toEqual(['userPath', 'data', 'proofScripts', 'visualSource']);
    expect(devSessionHasChiefStepCriterion([{ origin: 'capo', attestor: 'sessione' }])).toBe(true);
    expect(devSessionHasChiefStepCriterion([{ origin: 'capo', attestor: 'revisore' }])).toBe(false);
  });

  it('s8407 esportato-compilato', () => {
    for (const file of ['js', 'cjs']) {
      const text = readFileSync(new URL(`../../../dist/capability/dev/session-acceptance-templates.${file}`, import.meta.url), 'utf8');
      expect(text).toContain('devSessionHasChiefStepCriterion');
    }
  });
});
