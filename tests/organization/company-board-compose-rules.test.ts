import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ActionPlanSchema, CompanyBoardPartSchema, CompanyBoardWaitSchema,
  deriveParts, deriveWaits, OWNER_COMMENT_REGISTERS_OUTCOME,
  type ActionPlanBuSection, type BoardComposeDependency, type BoardComposeMilestone,
  type BoardComposeSession, type BoardComposeUnit, type CompanyBoardWait,
} from '../../src/organization/index.js';

const AT = '2026-11-05T23:30:00Z';
const section = (title: string, milestone: number): ActionPlanBuSection => ({
  id: `section-${milestone}`, title, milestone, expectedGoal: `Deliver ${title}`, deliveryCriteria: ['Accepted by the reviewer'],
});
const sections = ['Ricerca', 'Catalogo', 'Preventivo', 'Consegna'].map((s, i) => section(s, i + 1));
const unit = (buSlug = 'app', name = 'App', over: Partial<BoardComposeUnit> = {}): BoardComposeUnit => ({
  buSlug, name, state: 'al_lavoro', since: AT, why: 'Lavoro in corso',
  referent: { name: 'Luca', initials: 'L', verified: true, missing: false }, waitingFor: [], ...over,
});
const wait = (kind: CompanyBoardWait['kind'], over: Partial<CompanyBoardWait> = {}): CompanyBoardWait => ({
  kind, who: [{ name: 'Luca', initials: 'L', role: 'Referente' }], buSlugs: ['app'], partIndex: 2,
  since: AT, what: 'Serve una risposta', action: null, unblockHint: null, openIn: { issueIdentifier: 'APP-2' }, ...over,
});
const dependency = (fromBu: string, toBu: string, blocking = false, open = true): BoardComposeDependency => ({
  fromBu, toBu, what: 'Risultati da verificare', blocking, open,
});
const units = [unit(), unit('controllo-qualita', 'Controllo qualità')];
const decision = {
  buSlug: 'app', addressedTo: 'owner', createdAt: AT, decidedAt: null, outcome: null, partIndex: 2,
  who: [{ name: 'Stefano', initials: 'S', role: 'Proprietario' }],
  mail: { subject: 'Approvazione del catalogo', at: AT, ref: 'mail-2' },
} as const;
// Keep the mutable boundary arrays distinct from the readonly fixture above.
const openDecision = () => ({ ...decision, who: [...decision.who] });

describe('deriveParts', () => {
  it('(a) no sections means one Mandato with the unit state', () => {
    expect(deriveParts(undefined, [], [], 'al_lavoro')).toEqual([{ index: 1, title: 'Mandato', state: 'in_corso', note: null, at: null }]);
    expect(deriveParts([], [], [], 'finito')[0]?.state).toBe('fatto');
    expect(deriveParts([], [], [], 'non_partito')[0]?.state).toBe('da_fare');
  });
  it('(b) outline keeps 1 and 3 done and both 2 and 4 working', () => {
    const sessions: BoardComposeSession[] = [1, 2, 3, 4].map((i) => ({
      title: `Parte ${i} di 4`, state: i === 1 || i === 3 ? 'chiuso' : 'in-lavorazione', at: AT,
    }));
    const result = deriveParts(sections, [], sessions, 'al_lavoro');
    expect(result.map((p) => p.state)).toEqual(['fatto', 'in_corso', 'fatto', 'in_corso']);
    expect(result.every((p) => CompanyBoardPartSchema.safeParse(p).success)).toBe(true);
    expect(result[0]?.at).toBe('2026-11-06T00:30:00.000+01:00');
  });
  it('(c) without outline or closed milestones there is no guessed completion', () => {
    expect(deriveParts(sections, [], [{ title: 'Catalogo finale', state: 'chiuso', at: AT }], 'al_lavoro').map((p) => p.state))
      .toEqual(['non_noto', 'non_noto', 'non_noto', 'non_noto']);
  });
  it.each(['chiuso', 'revisione'] as const)('exact delivery title (%s) or Director closure completes only the matching part', (state) => {
    expect(deriveParts(sections, [{ number: 3, blockedBy: [], closedByDirector: true, at: AT }],
      [{ title: 'Catalogo', state, at: AT }], 'al_lavoro').map((p) => p.state)).toEqual(['non_noto', 'fatto', 'fatto', 'non_noto']);
  });
  it.each(['non_iniziato', 'non_partito', 'finito'] as const)('unit terminal state %s applies to every section', (state) => {
    expect(deriveParts(sections, [], [], state).map((p) => p.state)).toEqual(Array(4).fill(state === 'finito' ? 'fatto' : 'da_fare'));
  });
  it('after uses only milestones from the same unit', () => {
    const milestones: BoardComposeMilestone[] = [
      { number: 1, buSlug: 'app', blockedBy: [] }, { number: 2, buSlug: 'app', blockedBy: [1, 3] },
      { number: 3, buSlug: 'design', blockedBy: [] },
    ];
    expect(deriveParts(sections, milestones, [], 'al_lavoro')[1]?.after).toEqual([1]);
  });
  it('a plain done issue without Director closure is not enough without an outline', () => {
    expect(deriveParts(sections, [{ number: 1, blockedBy: [], status: 'done' }], [], 'al_lavoro')[0]?.state).toBe('non_noto');
  });
  it('an explicit milestone outline supplies separate precise states', () => {
    expect(deriveParts(sections, [
      { number: 10, blockedBy: [], partIndex: 1, partCount: 4, status: 'done' },
      { number: 11, blockedBy: [], partIndex: 2, partCount: 4, status: 'in_progress' },
    ], [], 'al_lavoro').map((p) => p.state)).toEqual(['fatto', 'in_corso', 'non_noto', 'non_noto']);
  });
});

describe('deriveWaits', () => {
  it.each([[false, false, true, true], [true, false, true, true], [false, true, true, true], [true, true, false, true], [true, true, true, false]])(
    '(d) a nonblocking or closed side is not a circular fault (%s %s %s %s)', (a, b, aOpen, bOpen) => {
      expect(deriveWaits(units, [dependency('app', 'controllo-qualita', a, aOpen), dependency('controllo-qualita', 'app', b, bOpen)], []).filter((w) => w.kind === 'guasto')).toEqual([]);
    });
  it('(d) two open blocking sides create one circular fault', () => {
    const result = deriveWaits(units, [dependency('app', 'controllo-qualita', true), dependency('controllo-qualita', 'app', true)], []);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ kind: 'guasto', what: 'App e Controllo qualità si aspettano a vicenda', action: null, unblockHint: { channel: 'paperclip' } });
  });
  it('(e) owner, referents, Director and faults have a stable project-wide order', () => {
    const result = deriveWaits([unit('app', 'App', { waitingFor: [wait('guasto'), wait('director'), wait('referente'), wait('proprietario')] })], [], []);
    expect(result.map((w) => w.kind)).toEqual(['proprietario', 'referente', 'director', 'guasto']);
    expect(result.every((w) => CompanyBoardWaitSchema.safeParse(w).success)).toBe(true);
    expect(result[1]?.who).toEqual(wait('referente').who);
    expect(result[1]?.partIndex).toBe(2);
  });
  it('(f,l,o) open owner decision retains the mail subject and Rome date across midnight', () => {
    const result = deriveWaits(units, [], [openDecision()]);
    expect(result[0]).toMatchObject({ kind: 'proprietario', partIndex: 2, since: '2026-11-06T00:30:00.000+01:00',
      action: OWNER_COMMENT_REGISTERS_OUTCOME === true ? 'rispondi' : 'apri_reparto',
      unblockHint: { channel: 'mail', text: 'Rispondi alla mail «Approvazione del catalogo» del 6/11', ref: 'mail-2' } });
    expect(OWNER_COMMENT_REGISTERS_OUTCOME).toBeNull();
  });
  it('uses the explicitly supplied time zone', () => {
    expect(deriveWaits(units, [], [openDecision()], { timeZone: 'America/New_York' })[0]?.unblockHint?.text).toContain('del 5/11');
  });
  it('closed decisions do not produce waits', () => {
    expect(deriveWaits(units, [], [{ ...openDecision(), outcome: 'approved', decidedAt: AT }])).toEqual([]);
  });
  it('(o) approved but not restarted wakes the unit; permission gives the go-ahead', () => {
    expect(deriveWaits([unit('app', 'App', { state: 'approvato_non_ripartito' })], [], [])[0]?.action).toBe('sveglia');
    expect(deriveWaits([unit('app', 'App', { state: 'attesa_del_via' })], [], [])[0]?.action).toBe('dai_il_via');
    expect(deriveWaits([unit('app', 'App', { waitingFor: [wait('referente'), wait('director'), wait('guasto')] })], [], []).map((w) => w.action)).toEqual(['apri_reparto', 'apri_reparto', null]);
  });
  it('missing referent names the person to appoint', () => {
    const u = unit(); u.referent = { name: null, initials: null, missing: true, verified: false };
    expect(deriveWaits([u], [], [])[0]?.unblockHint).toEqual({ channel: 'persona', text: 'Indica chi segue App', ref: null });
  });
  it('enriches a derived decision wait instead of duplicating it', () => {
    expect(deriveWaits([unit('app', 'App', { waitingFor: [wait('proprietario', { action: 'rispondi' })] })], [], [openDecision()])).toHaveLength(1);
    expect(deriveWaits([unit('app', 'App', { waitingFor: [wait('proprietario', { action: 'rispondi' })] })], [], [openDecision()])[0]?.action).toBe('apri_reparto');
  });
});

it('production v3 plan sections and exchanges keep their native shape', () => {
  // The repository contains the public v3 shape fixture only; v1/v2 and live exchanges remain for R-37 at the gate.
  const plan = ActionPlanSchema.parse(JSON.parse(readFileSync(new URL('./fixtures/action-plan-v3-forma.json', import.meta.url), 'utf8')));
  for (const bu of plan.businessUnits) {
    const result = deriveParts(bu.sections, plan.milestones.filter((m) => m.buSlug === bu.buSlug), [], 'non_noto');
    expect(result.map((p) => p.title)).toEqual(bu.sections?.map((s) => s.title) ?? ['Mandato']);
    expect(result.every((p) => p.state === 'non_noto')).toBe(true);
  }
});

// Gate mutations: allow a nonblocking reverse edge -> (d) fails; fill to the last completed
// part -> (b) fails; format the mail in UTC -> (l) fails. Acceptance/types/mutations run at the gate.
