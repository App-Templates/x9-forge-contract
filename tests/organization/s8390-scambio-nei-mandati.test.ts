import { describe, expect, it } from 'vitest';
import type { ActionPlanExchange } from '../../src/organization/action-plan.js';
import {
  ReconciledMandateSchema,
  mandateExchangeMatch,
  type ReconciledMandate,
} from '../../src/organization/business-unit-mandate.js';

const exchange: ActionPlanExchange = {
  fromBu: 'design', toBu: 'sviluppo', what: 'schermate approvate', format: 'PDF e demo', key: 'lista-prodotti',
};

// Shape of action-plan.ts exchanges as planSectionFor writes them into each unit's mandate.
function mandate(buSlug: string, exchanges?: ActionPlanExchange[], over: Partial<ReconciledMandate> = {}): ReconciledMandate {
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
        buSlug,
        typeId: 'marketing',
        mandate: 'Deliver the unit work.',
        competencies: ['craft'],
        lead: { role: 'capo-bu' },
        executor: 'agent',
        referent: { personRef: 'stefano', entryVersion: 3 },
        firstActivities: ['Start'],
        start: { kind: 'now' },
      },
      ...(exchanges === undefined ? {} : { exchanges }),
    },
    decision: { requestId: 'decision_001', planVersion: 2 },
    referent: { personRef: 'stefano', entryVersion: 3 },
    notebookPages: [],
    reconciliation: { outcome: 'agrees' },
    reconciledAt: '2026-10-22T10:00:00+02:00',
    ...over,
  };
}

const pair = (e: ActionPlanExchange[] = [exchange]) => [mandate('design', e), mandate('sviluppo', e)] as const;

describe('s8390 scambio nei mandati', () => {
  it('s8390 stesso-scambio', () => {
    const [from, to] = pair();
    expect(ReconciledMandateSchema.safeParse(from).success).toBe(true);
    expect(mandateExchangeMatch(from, to, exchange)).toBe('matched');
    const { key: _key, ...noKey } = exchange;
    const [f2, t2] = pair([noKey]);
    expect(mandateExchangeMatch(f2, t2, noKey)).toBe('matched');
  });

  it.each<[string, (m: ReconciledMandate) => ReconciledMandate]>([
    ['tenant', (m) => ({ ...m, tenantId: 'tenant-2' })],
    ['organizzazione', (m) => ({ ...m, organizationId: 'organization-2' })],
    ['cliente', (m) => ({ ...m, clientId: 'client-2' })],
    ['progetto', (m) => ({ ...m, projectId: 'project-2' })],
    ['piano', (m) => ({ ...m, planSection: { ...m.planSection, planId: 'plan_002' } })],
    ['versione', (m) => ({
      ...m, planSection: { ...m.planSection, planVersion: 3 }, decision: { ...m.decision, planVersion: 3 },
    })],
    ['digest', (m) => ({ ...m, planSection: { ...m.planSection, planDigest: 'b'.repeat(64) } })],
  ])('s8390 altro-contesto %s', (_label, change) => {
    const [from, to] = pair();
    expect(mandateExchangeMatch(from, change(to), exchange)).toBe('scope_mismatch');
  });

  it('s8390 altro-contesto reparti', () => {
    const [from, to] = pair();
    expect(mandateExchangeMatch(to, from, exchange)).toBe('scope_mismatch');
    const same = mandate('design', [exchange]);
    expect(mandateExchangeMatch(same, same, { ...exchange, toBu: 'design' })).toBe('scope_mismatch');
  });

  it('s8390 voce-assente', () => {
    const [from] = pair();
    expect(mandateExchangeMatch(from, mandate('sviluppo', []), exchange)).toBe('missing');
    expect(mandateExchangeMatch(mandate('design', []), mandate('sviluppo', [exchange]), exchange)).toBe('missing');
  });

  it('s8390 formato-diverso', () => {
    const [from] = pair();
    expect(mandateExchangeMatch(from, mandate('sviluppo', [{ ...exchange, format: 'PNG' }]), exchange)).toBe('different');
  });

  it('s8390 cosa-diversa', () => {
    const [from] = pair();
    expect(mandateExchangeMatch(from, mandate('sviluppo', [{ ...exchange, what: 'bozze' }]), exchange)).toBe('different');
    expect(mandateExchangeMatch(mandate('design', [{ ...exchange, what: 'bozze' }]), mandate('sviluppo', [exchange]), exchange))
      .toBe('different');
  });

  it('s8390 duplicato', () => {
    const [from, to] = pair([exchange, { ...exchange }]);
    expect(mandateExchangeMatch(from, to, exchange)).toBe('ambiguous');
    expect(mandateExchangeMatch(from, mandate('sviluppo', [exchange]), exchange)).toBe('ambiguous');
    const { key: _key, ...noKey } = exchange;
    const [f, t] = pair([noKey, { ...noKey, what: 'altro' }]);
    expect(mandateExchangeMatch(f, t, noKey)).toBe('ambiguous');
  });

  it('s8390 chiave-diversa', () => {
    const [from] = pair();
    expect(mandateExchangeMatch(from, mandate('sviluppo', [{ ...exchange, key: 'altra' }]), exchange)).toBe('missing');
    const { key: _key, ...noKey } = exchange;
    expect(mandateExchangeMatch(from, mandate('sviluppo', [noKey]), exchange)).toBe('missing');
    expect(mandateExchangeMatch(from, mandate('sviluppo', [exchange]), noKey)).toBe('missing');
  });

  it('s8390 reparto-invertito', () => {
    const swapped = { ...exchange, fromBu: 'sviluppo', toBu: 'design' };
    const [from, to] = pair([swapped]);
    expect(mandateExchangeMatch(from, to, exchange)).not.toBe('matched');
    const [f, t] = pair();
    expect(mandateExchangeMatch(f, t, swapped)).not.toBe('matched');
  });

  it('s8390 nessuna-mutazione', () => {
    const [from, to] = pair();
    const before = structuredClone([from, to, exchange]);
    mandateExchangeMatch(from, to, exchange);
    expect([from, to, exchange]).toEqual(before);
    const old = mandate('design');
    expect(ReconciledMandateSchema.safeParse(old).success).toBe(true);
    expect(mandateExchangeMatch(old, mandate('sviluppo'), exchange)).toBe('missing');
  });
});
