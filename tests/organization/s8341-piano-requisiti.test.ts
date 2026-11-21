import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ActionPlanBuSectionSchema,
  ActionPlanBusinessUnitSchema,
  ActionPlanSchema,
  ActionPlanWorkBreakdownSchema,
  ActionPlanWorkItemSchema,
  canonicalJson,
  type ActionPlan,
} from '../../src/organization/action-plan.js';
import { mandateCriterionId } from '../../src/capability/dev/session-acceptance-mandate.js';

const PROOF = "Giudizio del referente sulla consegna, con l'anteprima da guardare";
const criteria = ['Si aggiunge un prodotto alla lista', 'Si spunta un prodotto comprato', 'La lista si ritrova al riavvio'];

// Code fixture in the documented shape (lista-spesa); not a production capture.
function requirements(pieceId = 'lista-spesa', texts: string[] = criteria) {
  return texts.map((text, index) => ({
    id: mandateCriterionId(pieceId, index), text, attestor: 'referente' as const, proof: PROOF, origin: 'mandato' as const,
  }));
}
function section(extra: Record<string, unknown> = {}) {
  return {
    id: 'lista-spesa', title: 'Lista della spesa', expectedGoal: "L'utente tiene la lista della spesa",
    deliveryCriteria: criteria, milestone: 1, ...extra,
  };
}
function item(extra: Record<string, unknown> = {}) {
  return {
    id: 'lista-spesa', title: 'Lista della spesa', expectedGoal: "L'utente tiene la lista della spesa",
    deliveryCriteria: criteria, milestone: 1, owners: [{ buSlug: 'app', does: 'Costruisce la lista' }], ...extra,
  };
}
function unit(sections: unknown[]) {
  return {
    buSlug: 'app', typeId: 'sviluppo', mandate: 'La BU costruisce la lista.', competencies: ['competenza'],
    lead: { role: 'capo-bu' }, reviewer: { role: 'director' }, executor: 'agent',
    referent: { personRef: 'stefano', entryVersion: 1 }, firstActivities: ['Leggere il mini-brief'],
    sections, start: { kind: 'now' },
  };
}
function paths(result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) {
  expect(result.success).toBe(false);
  return result.error!.issues.map((issue) => issue.path.join('.'));
}

describe('s8341 principale', () => {
  it('s8341 principale: the section keeps its three requirements, with proof and attestor', () => {
    const parsed = ActionPlanBuSectionSchema.safeParse(section({ requirements: requirements() }));
    expect(parsed.success).toBe(true);
    const unitResult = ActionPlanBusinessUnitSchema.safeParse(unit([section({ requirements: requirements() })]));
    expect(unitResult.success).toBe(true);
    const saved = unitResult.data!.sections![0]!.requirements!;
    expect(saved.map((r) => r.id)).toEqual(['lista-spesa.1', 'lista-spesa.2', 'lista-spesa.3']);
    expect(saved.every((r) => r.proof === PROOF && r.attestor === 'referente')).toBe(true);
    expect(unitResult.data!.sections![0]!.deliveryCriteria).toEqual(criteria);
  });

  it('s8341 principale: the work item keeps its three requirements', () => {
    expect(ActionPlanWorkItemSchema.safeParse(item({ requirements: requirements() })).success).toBe(true);
    const result = ActionPlanWorkBreakdownSchema.safeParse([item({ requirements: requirements() })]);
    expect(result.success).toBe(true);
    expect(result.data![0]!.requirements).toEqual(requirements());
  });

  it('matches texts after the same trim the bridge already uses', () => {
    const padded = requirements('lista-spesa', criteria.map((c) => `  ${c} `));
    expect(ActionPlanWorkBreakdownSchema.safeParse([item({ requirements: padded })]).success).toBe(true);
  });
});

describe('s8341 negativo', () => {
  const section2 = (reqs: unknown) => ActionPlanBusinessUnitSchema.safeParse(unit([section({ requirements: reqs })]));
  const items = (reqs: unknown) => ActionPlanWorkBreakdownSchema.safeParse([item({ requirements: reqs })]);

  const bad: Record<string, unknown> = {
    'an omitted requirement': requirements().slice(0, 2),
    'an invented requirement': [...requirements(), ...requirements('lista-spesa', ['Altro']).map((r) => ({ ...r, id: 'lista-spesa.4' }))],
    'a different text': requirements('lista-spesa', [criteria[0]!, 'Testo diverso', criteria[2]!]),
    'a moved id': requirements().map((r, i) => ({ ...r, id: `lista-spesa.${3 - i}` })),
    'an id of another piece': requirements('altro'),
    'a swapped order': [requirements()[1], requirements()[0], requirements()[2]],
    'an origin other than the mandate': requirements().map((r) => ({ ...r, origin: 'ritorno' })),
  };
  for (const [name, reqs] of Object.entries(bad)) {
    it(`section: ${name} rejects only the new field`, () => {
      expect(paths(section2(reqs)).every((p) => p.startsWith('sections.0.requirements'))).toBe(true);
    });
    it(`work item: ${name} rejects only the new field`, () => {
      expect(paths(items(reqs)).every((p) => p.startsWith('0.requirements'))).toBe(true);
    });
  }

  it('rejects an empty array and an unknown key inside a requirement', () => {
    expect(section2([]).success).toBe(false);
    expect(items(requirements().map((r) => ({ ...r, extra: 1 }))).success).toBe(false);
  });

  it('a legacy piece without the field stays identical and gains no key', () => {
    const s = ActionPlanBuSectionSchema.parse(section());
    expect(Object.keys(s)).not.toContain('requirements');
    expect(canonicalJson(s)).toBe(canonicalJson(section()));
    const w = ActionPlanWorkItemSchema.parse(item());
    expect(Object.keys(w)).not.toContain('requirements');
    expect(canonicalJson(w)).toBe(canonicalJson(item()));
  });

  it('the saved v3 plan fixture parses to the same canonical json', () => {
    const raw = JSON.parse(readFileSync(new URL('./fixtures/action-plan-v3-forma.json', import.meta.url), 'utf8'));
    const parsed: ActionPlan = ActionPlanSchema.parse(raw);
    expect(canonicalJson(parsed)).toBe(canonicalJson(raw));
  });
});

describe('s8341 export compilato', () => {
  it('the built export carries the new field', async () => {
    const built = await import('../../dist/organization/action-plan.js');
    expect(built.ActionPlanWorkBreakdownSchema.safeParse([item({ requirements: requirements() })]).success).toBe(true);
    expect(built.ActionPlanWorkBreakdownSchema.safeParse([item({ requirements: requirements().slice(1) })]).success).toBe(false);
  });
});
