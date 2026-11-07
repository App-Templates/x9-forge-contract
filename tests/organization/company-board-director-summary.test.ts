import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import {
  ActionPlanSchema, CompanyBoardSchema, deriveDirector, deriveSummary, deriveWaits,
  type BoardDirectorAgent, type BoardDirectorIssue, type BoardSummaryUnit, type CompanyBoard,
  type CompanyBoardWait,
} from '../../src/organization/index.js';
import type * as OrganizationEntry from '../../src/organization/index.js';

// Only the public v3 plan is present in this repository. Real v1/v2 replay belongs to R-37 at the gate.
const plan = ActionPlanSchema.parse(JSON.parse(readFileSync(new URL('./fixtures/action-plan-v3-forma.json', import.meta.url), 'utf8')));
const milestones = (done = 2): CompanyBoard['milestones'] => plan.milestones.map((m, i) => ({
  number: m.number, buSlug: m.buSlug, dueDate: m.dueDate ?? null, closeCriterion: m.closeCriterion,
  state: i < done ? 'fatta' : 'aperta',
}));
const now = new Date('2026-11-10T10:00:00Z');
const agent = (over: Partial<BoardDirectorAgent> = {}): BoardDirectorAgent => ({
  status: 'idle', wokenAt: '2026-11-10T08:00:00Z', wokenWhy: 'Controllo del progetto', events: [], ...over,
});
const issue = (createdAt = '2026-11-10T08:10:00Z'): BoardDirectorIssue => ({
  title: 'Verifica il campione del catalogo', status: 'in_progress', createdAt, startedAt: createdAt,
});
const unit = (name = 'Dati', over: Partial<BoardSummaryUnit> = {}): BoardSummaryUnit => ({
  buSlug: name.toLowerCase(), name, state: 'al_lavoro', since: '2026-11-10T08:00:00Z',
  why: 'Sta verificando i dati', late: false, alert: null, ...over,
});
const wait = (kind: CompanyBoardWait['kind'], over: Partial<CompanyBoardWait> = {}): CompanyBoardWait => ({
  kind, who: [], buSlugs: ['dati'], partIndex: null, since: '2026-11-10T09:20:00Z',
  what: 'Leggere la consegna di Dati', action: 'apri_reparto', unblockHint: null, openIn: null, ...over,
});

describe('deriveDirector', () => {
  it('(g) approval unhandled for 40 minutes stops the Director, 20 minutes does not', () => {
    const forty = deriveDirector(agent({ events: [{ kind: 'approvazione', at: '2026-11-10T09:20:00Z' }] }), [], milestones(), [], now);
    expect(forty.state).toBe('fermo');
    expect(forty.doing).toBe("Non ha preso in carico l'approvazione delle 10:20");
    const twenty = deriveDirector(agent({ events: [{ kind: 'approvazione', at: '2026-11-10T09:40:00Z' }] }), [], milestones(), [], now);
    expect(twenty.state).not.toBe('fermo');
    expect(twenty.doing).not.toContain('Non ha preso in carico');
  });
  it('(g) a new assignment or a later wake prevents a false unhandled approval', () => {
    const events: BoardDirectorAgent['events'] = [{ kind: 'approvazione', at: '2026-11-10T09:20:00Z' }];
    expect(deriveDirector(agent({ events }), [issue('2026-11-10T09:50:00Z')], milestones(), [], now).state).toBe('al_lavoro');
    expect(deriveDirector(agent({ events, wokenAt: '2026-11-10T09:30:00Z' }), [], milestones(), [], now).state).not.toBe('fermo');
    expect(deriveDirector(agent({ events: [{ kind: 'messaggio', at: '2026-11-10T09:20:00Z' }] }), [], milestones(), [], now).state).not.toBe('fermo');
  });
  it('(g) deliveries use the same threshold and the requested zone across midnight', () => {
    const a = agent({ wokenAt: '2026-11-09T21:00:00Z', events: [{ kind: 'materiale', at: '2026-11-09T23:20:00Z' }] });
    const result = deriveDirector(a, [], milestones(), [], new Date('2026-11-10T00:00:00Z'));
    expect(result.doing).toBe('Non ha preso in carico la consegna delle 00:20');
    expect(result.wokenAt).toBe('2026-11-09T22:00:00.000+01:00');
    expect(deriveDirector(a, [], milestones(), [], new Date('2026-11-10T00:00:00Z'), { timeZone: 'America/New_York' }).doing)
      .toBe('Non ha preso in carico la consegna delle 18:20');
  });
  it('(m) two of five done selects the third real milestone and flags its expired date', () => {
    const input = milestones();
    const result = deriveDirector(agent(), [], input, [], now);
    expect(result.milestoneLine).toEqual({
      text: `Tappa 3 di 5 · prossima: ${plan.milestones[2]!.closeCriterion} entro il 9/11/2026`, overdue: true,
    });
    expect(result.milestones[2]?.state).toBe('scaduta');
    expect(result.doing).toBe('Tappa 3 in ritardo dal 9/11/2026');
    expect(input[2]?.state).toBe('aperta');
    expect(CompanyBoardSchema.shape.milestoneLine.safeParse(result.milestoneLine).success).toBe(true);
    expect(CompanyBoardSchema.shape.director.safeParse({ state: result.state, doing: result.doing, wokenAt: result.wokenAt, wokenWhy: result.wokenWhy }).success).toBe(true);
  });
  it('(m) today is local to the owner, including the same instant in another zone', () => {
    const at = new Date('2026-11-08T23:30:00Z');
    expect(deriveDirector(agent(), [], milestones(), [], at).milestoneLine).toEqual({
      text: `Tappa 3 di 5 · prossima: ${plan.milestones[2]!.closeCriterion} entro oggi`, overdue: false,
    });
    expect(deriveDirector(agent(), [], milestones(), [], at, { timeZone: 'America/New_York' }).milestoneLine?.text).toContain('entro il 9/11/2026');
  });
  it('(m) all done and no milestones have distinct lines', () => {
    expect(deriveDirector(agent(), [], milestones(5), [], now).milestoneLine).toEqual({ text: 'Tappa 5 di 5 · tutte fatte', overdue: false });
    expect(deriveDirector(agent(), [], [], [], now).milestoneLine).toBeNull();
    expect(deriveDirector(agent(), [], null, [], now).milestoneLine).toBeNull();
  });
  it('reads Director deliveries already composed by deriveWaits', () => {
    const waits = deriveWaits(['dati', 'design'].map((buSlug) => ({
      buSlug, name: buSlug, state: 'aspetta_director', since: null, why: 'Consegna pronta',
      referent: { name: null, initials: null, verified: false, missing: false }, waitingFor: [wait('director', { buSlugs: [buSlug] })],
    })), [], []);
    expect(deriveDirector(agent(), [], milestones(), waits, new Date('2026-11-09T10:00:00Z')).doing)
      .toBe('Ha da leggere 2 consegne: Dati, Design');
  });
  it('(p) no plan with an open assignment writes the plan; no open assignment reports its absence', () => {
    expect(deriveDirector(agent(), [issue()], null, [], now).doing).toBe('Sta scrivendo il piano');
    expect(deriveDirector(agent(), [], null, [], now).doing).toBe("Il piano non c'è ancora");
    expect(deriveDirector(agent(), [{ ...issue(), status: 'done' }], null, [], now).doing).toBe("Il piano non c'è ancora");
  });
  it.each(['Inventario di un museo', 'Calendario delle visite veterinarie'])('(p) invented brief %s does not change no-plan rules', (title) => {
    expect(deriveDirector(agent(), [{ ...issue(), title }], [], [], now).doing).toBe('Sta scrivendo il piano');
  });
});

describe('deriveSummary', () => {
  it('(h) only one of fifteen units moving is named', () => {
    const units = Array.from({ length: 15 }, (_, i) => unit(`Reparto ${i + 1}`, { state: i === 6 ? 'al_lavoro' : 'non_iniziato' }));
    expect(deriveSummary(units, [])).toBe('Si muove un solo reparto, Reparto 7; nessuno aspetta te.');
  });
  it('(i) everything in order uses the agreed sentence, also across projects', () => {
    expect(deriveSummary([unit(), unit('Design')], [])).toBe('I reparti lavorano; nessuno aspetta te.');
  });
  it('(j) a fault comes before a delay and includes its local start date and time', () => {
    const units = [unit('Design', { state: 'aspetta_referente', late: true, since: '2026-11-08T09:00:00Z', alert: { kind: 'ritardo', text: 'Bozza in ritardo', attempts: [] } }),
      unit('Dati', { state: 'errore', since: '2026-11-09T23:30:00Z', alert: { kind: 'errore', text: 'Lettura del catalogo interrotta', attempts: [] } })];
    expect(deriveSummary(units, [])).toBe('Nessun reparto si muove; Dati: Lettura del catalogo interrotta dal 10/11/2026 alle 00:30; nessuno aspetta te.');
    expect(deriveSummary([...units].reverse(), [], { timeZone: 'America/New_York' })).toContain('dal 9/11/2026 alle 18:30');
  });
  it('prioritizes faults from deriveWaits, then delay before stopped units, and names the owner action', () => {
    const units = [unit('Dati', { state: 'fermo', why: 'Il campione è fermo' }), unit('Design', { state: 'aspetta_referente', late: true, why: 'Bozza in ritardo' })];
    const owner = wait('proprietario', { what: 'Approva la bozza' });
    expect(deriveSummary(units, [owner])).toBe('Nessun reparto si muove; Design: Bozza in ritardo dal 10/11/2026 alle 09:00. Tocca a te: Approva la bozza.');
    expect(deriveSummary(units, [owner, wait('guasto', { what: 'Catalogo illeggibile' })])).toContain('Catalogo illeggibile dal 10/11/2026 alle 10:20');
  });
  it('names the referent and stays within two sentences and the board size', () => {
    const result = deriveSummary([unit('Dati', { state: 'aspetta_referente', why: 'Serve una risposta' })], [wait('referente', {
      who: [{ name: 'Luca', initials: 'L', role: 'Referente' }], what: 'Conferma il campione. Poi avvisa Dati!',
    })]);
    expect(result).toContain('Tocca a Luca: Conferma il campione, Poi avvisa Dati.');
    expect(result.match(/\./g)).toHaveLength(2);
    expect(result.length).toBeLessThanOrEqual(400);
  });
});

it('ships both functions through the CommonJS organization entry point', () => {
  const commonJs = createRequire(import.meta.url)('../../dist/organization/index.cjs') as typeof OrganizationEntry;
  expect(commonJs.deriveSummary([unit()], [])).toBe(deriveSummary([unit()], []));
  expect(commonJs.deriveDirector(agent(), [], milestones(), [], now)).toEqual(deriveDirector(agent(), [], milestones(), [], now));
});

// Gate mutations: restart threshold 10 minutes -> (g) 20-minute assertion fails;
// faults ranked below delays -> (j) fails; expired milestone overdue=false -> (m) fails.
// Acceptance, typecheck, mutations and production v1-v3 replay are run by the gate.
