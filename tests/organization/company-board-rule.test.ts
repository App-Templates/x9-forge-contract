import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import {
  CompanyBoardUnitSchema,
  COMPANY_BOARD_DEFAULT_THRESHOLDS,
  deriveUnitState,
  type BoardRuleBlocker,
  type BoardRuleInput,
  type BoardRuleIssue,
  type CompanyBoardUnitDerivation,
} from '../../src/organization/index.js';
import type * as SrcOrganization from '../../src/organization/index.js';

const require = createRequire(import.meta.url);
const commonJs: typeof SrcOrganization = require('../../dist/organization/index.cjs');

/** 06/11 at 19:00 in Rome (UTC+1). Times below are UTC, as the sources give them. */
const NOW = new Date('2026-11-06T18:00:00Z');
const SOGLIE = COMPANY_BOARD_DEFAULT_THRESHOLDS;
const DerivationSchema = CompanyBoardUnitSchema.pick({
  state: true, stateLabel: true, since: true, why: true, late: true, alert: true, waitingFor: true,
});

const massimo = { name: 'Massimo', initials: 'M', role: 'Referente' };
const stefano = { name: 'Stefano', initials: 'S', role: 'Proprietario' };
const director = { kind: 'director' } as const;
const dati = { kind: 'reparto', buSlug: 'dati', name: 'Dati' } as const;

const blocker = (over: Partial<BoardRuleBlocker> = {}): BoardRuleBlocker => ({
  identifier: 'DIR-1', status: 'in_progress', assignee: director, approvalMark: false, ...over,
});
const issue = (over: Partial<BoardRuleIssue> = {}): BoardRuleIssue => ({
  identifier: 'MAN-1', isMandate: true, status: 'in_progress', createdAt: '2026-11-03T09:00:00Z',
  updatedAt: '2026-11-06T14:00:00Z', startedAt: '2026-11-04T09:00:00Z', blockedSince: null, blockedBy: [], comments: [], ...over,
});
const parts = (nextBlockedBy: BoardRuleBlocker[] = []): BoardRuleInput['parts'] => [
  { index: 4, title: 'Prima parte', state: 'fatto', blockedBy: [] },
  { index: 5, title: 'Parte cinque', state: 'da_fare', blockedBy: nextBlockedBy },
];
const unit = (over: Partial<BoardRuleInput> = {}): BoardRuleInput => ({
  buSlug: 'design', unitName: 'Design',
  agent: { status: 'idle', pauseReason: null, pausedAt: null, pausedByOwner: null, runs: [] },
  issues: [issue()], parts: parts(), decisions: [], sessions: [],
  referentPresent: true, referent: massimo, owner: stefano, missingSources: [], ...over,
});

const everything: CompanyBoardUnitDerivation[] = [];
const derive = (input: BoardRuleInput, now: Date = NOW, timeZone?: string): CompanyBoardUnitDerivation => {
  const result = deriveUnitState(input, now, SOGLIE, timeZone);
  expect(DerivationSchema.safeParse(result).success).toBe(true);
  everything.push(result);
  return result;
};

const approvedAt1557 = { addressedTo: 'referent', createdAt: '2026-11-06T14:30:00Z', decidedAt: '2026-11-06T15:57:00Z', outcome: 'approved' } as const;
const blockedByDirector = (mark: boolean) => issue({
  status: 'blocked', blockedSince: '2026-11-06T15:57:00Z', blockedBy: [blocker({ approvalMark: mark })],
});

describe('deriveUnitState — the real cases of 03-06/11', () => {
  it('(a) approved at 15:57 UTC, no mark → approvato_non_ripartito, written as 16:57', () => {
    const r = derive(unit({ issues: [blockedByDirector(false)], decisions: [approvedAt1557] }));
    expect(r.state).toBe('approvato_non_ripartito');
    expect(r.why).toBe('Approvato alle 16:57, non è ripartito');
    expect(r.since).toBe('2026-11-06T15:57:00.000Z');
    expect(r.alert?.kind).toBe('errore');
    expect(r.waitingFor.map((w) => w.kind)).toContain('guasto');
  });

  it('(a) with the mark the same story is attesa_del_via', () => {
    const r = derive(unit({ issues: [blockedByDirector(true)], decisions: [approvedAt1557] }));
    expect(r.state).toBe('attesa_del_via');
    expect(r.stateLabel).toBe('In attesa del via');
    const go = r.waitingFor.find((w) => w.action === 'dai_il_via');
    expect(go?.kind).toBe('proprietario');
    expect(go?.openIn).toEqual({ issueIdentifier: 'DIR-1' });
  });

  it('(a) the next day the approval says which day', () => {
    const r = derive(unit({ issues: [blockedByDirector(false)], decisions: [approvedAt1557] }), new Date('2026-11-07T10:00:00Z'));
    expect(r.why).toBe('Approvato il 6/11 alle 16:57, non è ripartito');
  });

  it('(a) the time follows the owner time zone, not the machine', () => {
    const r = derive(unit({ issues: [blockedByDirector(false)], decisions: [approvedAt1557] }), NOW, 'UTC');
    expect(r.why).toBe('Approvato alle 15:57, non è ripartito');
  });

  it('(a) not stuck while the 30 minutes have not passed, nor when something started after the approval', () => {
    const recent = derive(unit({ issues: [blockedByDirector(false)], decisions: [approvedAt1557] }), new Date('2026-11-06T16:20:00Z'));
    expect(recent.state).not.toBe('approvato_non_ripartito');
    const restarted = derive(unit({
      issues: [blockedByDirector(false), issue({ identifier: 'P-1', isMandate: false, createdAt: '2026-11-06T16:10:00Z', startedAt: '2026-11-06T16:11:00Z', updatedAt: '2026-11-06T17:50:00Z' })],
      decisions: [approvedAt1557],
    }));
    expect(restarted.state).not.toBe('approvato_non_ripartito');
  });

  it('(a) not stuck when no part is left to do', () => {
    const r = derive(unit({
      issues: [blockedByDirector(false)], decisions: [approvedAt1557],
      parts: [{ index: 5, title: 'Parte cinque', state: 'fatto', blockedBy: [] }],
    }));
    expect(r.state).not.toBe('approvato_non_ripartito');
  });

  it('(a2) next part behind an open dependency on another unit → aspetta_reparto, never approvato_non_ripartito', () => {
    const r = derive(unit({
      issues: [issue()], decisions: [approvedAt1557],
      parts: parts([blocker({ identifier: 'DAT-1', assignee: dati })]),
    }));
    expect(r.state).toBe('aspetta_reparto');
    expect(r.stateLabel).toBe('Aspetta il reparto Dati');
    expect(r.waitingFor.some((w) => w.kind === 'reparto' && w.buSlugs.join() === 'design,dati' && w.partIndex === 5)).toBe(true);
  });

  it('(a2) a dependency already closed does not hold the part: back to approvato_non_ripartito', () => {
    const r = derive(unit({
      issues: [issue()], decisions: [approvedAt1557],
      parts: parts([blocker({ identifier: 'DAT-1', status: 'done', assignee: dati })]),
    }));
    expect(r.state).toBe('approvato_non_ripartito');
  });

  it('(a3) delivered session and the next part already started → al_lavoro, never aspetta_director', () => {
    const r = derive(unit({
      sessions: [{ state: 'revisione', at: '2026-11-06T15:00:00Z' }],
      issues: [
        issue({ updatedAt: '2026-11-06T17:30:00Z' }),
        issue({ identifier: 'P-2', isMandate: false, createdAt: '2026-11-06T15:10:00Z', startedAt: '2026-11-06T15:20:00Z', updatedAt: '2026-11-06T17:30:00Z' }),
      ],
    }));
    expect(r.state).toBe('al_lavoro');
  });

  it('(a3) the same delivery with nothing after it for 30 minutes → aspetta_director', () => {
    const r = derive(unit({ sessions: [{ state: 'revisione', at: '2026-11-06T15:00:00Z' }], issues: [issue({ updatedAt: '2026-11-06T14:00:00Z' })] }));
    expect(r.state).toBe('aspetta_director');
    expect(r.since).toBe('2026-11-06T15:00:00.000Z');
  });

  it('(a3) a delivery with an open question to the referent is not a wait for the Director', () => {
    const r = derive(unit({
      sessions: [{ state: 'revisione', at: '2026-11-06T09:00:00Z' }],
      decisions: [{ addressedTo: 'referent', createdAt: '2026-11-06T09:05:00Z', decidedAt: null, outcome: null }],
    }));
    expect(r.state).toBe('aspetta_referente');
  });

  it('(b) Mandato in the queue since 03/11 → non_partito and late', () => {
    const r = derive(unit({
      buSlug: 'dati', unitName: 'Dati', parts: [],
      issues: [issue({ status: 'backlog', startedAt: null, createdAt: '2026-11-03T08:00:00Z', updatedAt: '2026-11-03T08:00:00Z' })],
    }));
    expect(r.state).toBe('non_partito');
    expect(r.stateLabel).toBe('Non ancora partito');
    expect(r.why).toBe('Non è ancora partito, in coda dal 3/11');
    expect(r.late).toBe(true);
    expect(r.alert).toMatchObject({ kind: 'ritardo' });
  });

  it('(b) in the queue for an hour is not late', () => {
    const r = derive(unit({ parts: [], issues: [issue({ status: 'todo', startedAt: null, createdAt: '2026-11-06T17:00:00Z', updatedAt: '2026-11-06T17:00:00Z' })] }));
    expect(r.state).toBe('non_partito');
    expect(r.late).toBe(false);
    expect(r.alert).toBeNull();
  });

  it('(c) three rejected deliveries → errore with 3 attempts', () => {
    const r = derive(unit({
      sessions: [
        { state: 'scartato', at: '2026-11-06T19:00:00Z' },
        { state: 'scartato', at: '2026-11-06T20:00:00Z' },
        { state: 'scartato', at: '2026-11-06T20:49:00Z' },
      ],
    }), new Date('2026-11-06T22:00:00Z'));
    expect(r.state).toBe('errore');
    expect(r.why).toBe("La consegna non passa i controlli: 3 tentativi, l'ultimo alle 21:49");
    expect(r.alert?.attempts).toHaveLength(3);
    expect(r.alert?.attempts[2]?.text).toContain('21:49');
  });

  it('(c) one rejection, or a good delivery after the rejections, is not an error', () => {
    expect(derive(unit({ sessions: [{ state: 'scartato', at: '2026-11-06T19:00:00Z' }] })).state).not.toBe('errore');
    const healed = derive(unit({
      sessions: [
        { state: 'scartato', at: '2026-11-06T10:00:00Z' },
        { state: 'scartato', at: '2026-11-06T11:00:00Z' },
        { state: 'revisione', at: '2026-11-06T12:00:00Z' },
      ],
    }));
    expect(healed.state).not.toBe('errore');
  });

  it('(d) the referent answered but the decision is still open → errore, never aspetta_referente', () => {
    const r = derive(unit({
      decisions: [{ addressedTo: 'referent', createdAt: '2026-11-06T10:00:00Z', decidedAt: null, outcome: null }],
      issues: [issue({ comments: [{ at: '2026-11-06T12:00:00Z', fromReply: true }] })],
    }));
    expect(r.state).toBe('errore');
    expect(r.why).toBe('Massimo ha risposto il 6/11, la risposta non è stata letta');
    expect(r.waitingFor.some((w) => w.kind === 'referente')).toBe(false);
    expect(r.waitingFor.some((w) => w.kind === 'guasto')).toBe(true);
  });

  it('(d) a reply older than the decision, or not from the referent, does not make an error', () => {
    const decisions = [{ addressedTo: 'referent', createdAt: '2026-11-06T10:00:00Z', decidedAt: null, outcome: null }] as const;
    const old = derive(unit({ decisions: [...decisions], issues: [issue({ comments: [{ at: '2026-11-06T09:00:00Z', fromReply: true }] })] }));
    expect(old.state).toBe('aspetta_referente');
    expect(old.stateLabel).toBe('Aspetta Massimo');
    const other = derive(unit({ decisions: [...decisions], issues: [issue({ comments: [{ at: '2026-11-06T12:00:00Z', fromReply: false }] })] }));
    expect(other.state).toBe('aspetta_referente');
  });

  it('(e) a run that failed for quota → errore in words', () => {
    const r = derive(unit({
      agent: { status: 'idle', pauseReason: null, pausedAt: null, pausedByOwner: null, runs: [{ status: 'failed', errorCode: 'provider_quota', at: '2026-11-06T16:00:00Z' }] },
    }));
    expect(r.state).toBe('errore');
    expect(r.why).toBe('Il modello ha finito il credito');
    expect(derive(unit({
      agent: { status: 'idle', pauseReason: null, pausedAt: null, pausedByOwner: null, runs: [{ status: 'failed', errorCode: 'process_lost', at: '2026-11-06T16:00:00Z' }] },
    })).why).toBe('Il processo si è interrotto');
  });

  it('(e) an unknown code is never written; a good run after the failure clears the error', () => {
    const unknown = derive(unit({
      agent: { status: 'error', pauseReason: null, pausedAt: null, pausedByOwner: null, runs: [{ status: 'failed', errorCode: 'xyz_secret_code', at: '2026-11-06T16:00:00Z' }] },
    }));
    expect(unknown.why).toBe('Errore tecnico (codice registrato)');
    expect(JSON.stringify(unknown)).not.toContain('xyz_secret_code');
    const healed = derive(unit({
      agent: { status: 'idle', pauseReason: null, pausedAt: null, pausedByOwner: null, runs: [
        { status: 'failed', errorCode: 'provider_quota', at: '2026-11-06T16:00:00Z' },
        { status: 'succeeded', errorCode: null, at: '2026-11-06T17:00:00Z' },
      ] },
    }));
    expect(healed.state).not.toBe('errore');
  });

  it('(f) lead paused for the spending cap → in_pausa; stopped by the owner at 8:49 UTC → 9:49', () => {
    const budget = derive(unit({ agent: { status: 'paused', pauseReason: 'budget', pausedAt: '2026-11-06T08:00:00Z', pausedByOwner: false, runs: [] } }));
    expect(budget.state).toBe('in_pausa');
    expect(budget.why).toBe('Ha raggiunto il tetto di spesa');
    const owner = derive(unit({ agent: { status: 'paused', pauseReason: 'manual', pausedAt: '2026-11-06T08:49:00Z', pausedByOwner: true, runs: [] } }));
    expect(owner.why).toBe("L'hai fermato tu alle 9:49. Non lavora, in nessun progetto, finché non lo riprendi.");
    expect(owner.waitingFor[0]?.kind).toBe('proprietario');
  });

  it('(f) stopped by someone else, and a pause with no known time', () => {
    const other = derive(unit({ agent: { status: 'paused', pauseReason: 'manual', pausedAt: '2026-11-06T08:49:00Z', pausedByOwner: false, runs: [] } }));
    expect(other.why).toBe('Fermato a mano alle 9:49');
    const unknownTime = derive(unit({ agent: { status: 'paused', pauseReason: 'manual', pausedAt: null, pausedByOwner: true, runs: [] } }));
    expect(unknownTime.why).toBe("L'hai fermato tu. Non lavora, in nessun progetto, finché non lo riprendi.");
    expect(unknownTime.since).toBeNull();
  });

  it('(g) delivery in review → aspetta_director', () => {
    const r = derive(unit({ issues: [issue({ status: 'in_review', updatedAt: '2026-11-06T16:00:00Z' })] }));
    expect(r.state).toBe('aspetta_director');
    expect(r.why).toBe('Consegnato, aspetta il Director dalle 17:00');
    expect(r.waitingFor.some((w) => w.kind === 'director')).toBe(true);
  });

  it('(g) blocked by the Director without the mark → aspetta_director', () => {
    expect(derive(unit({ issues: [blockedByDirector(false)] })).state).toBe('aspetta_director');
  });

  it('(h) issues that did not answer → non_noto with the reason', () => {
    const r = derive(unit({ issues: [], missingSources: ['incarichi'] }));
    expect(r.state).toBe('non_noto');
    expect(r.why).toBe('Gli incarichi del reparto non hanno risposto: lo stato non si può dire.');
    expect(r.since).toBeNull();
    expect(derive(unit({ missingSources: ['incarichi', 'decisioni'] })).why).toBe('Gli incarichi e le decisioni del reparto non hanno risposto: lo stato non si può dire.');
  });

  it('(h) no issues from a source that answered is non_iniziato, not non_noto', () => {
    const r = derive(unit({ issues: [], parts: [] }));
    expect(r.state).toBe('non_iniziato');
    expect(r.stateLabel).toBe('Non iniziato');
    expect(derive(unit({ issues: [], parts: [], missingSources: ['sessioni'] })).state).toBe('non_noto');
  });
});

describe('deriveUnitState — order and the rest of the rules', () => {
  it('collects every true wait, not only the one that names the state', () => {
    const r = derive(unit({
      agent: { status: 'idle', pauseReason: null, pausedAt: null, pausedByOwner: null, runs: [{ status: 'failed', errorCode: 'provider_quota', at: '2026-11-06T16:00:00Z' }] },
      decisions: [
        { addressedTo: 'referent', createdAt: '2026-11-06T09:00:00Z', decidedAt: null, outcome: null },
        { addressedTo: 'owner', createdAt: '2026-11-06T09:30:00Z', decidedAt: null, outcome: null },
      ],
    }));
    expect(r.state).toBe('errore');
    expect(r.waitingFor.map((w) => w.kind).sort()).toEqual(['guasto', 'proprietario', 'referente']);
  });

  it('a paused lead wins over an open decision; an error wins over the pause', () => {
    const decisions = [{ addressedTo: 'owner', createdAt: '2026-11-06T09:30:00Z', decidedAt: null, outcome: null }] as const;
    const pausedAgent = { status: 'paused', pauseReason: 'manual', pausedAt: '2026-11-06T09:00:00Z', pausedByOwner: true, runs: [] };
    expect(derive(unit({ agent: pausedAgent, decisions: [...decisions] })).state).toBe('in_pausa');
    expect(derive(unit({ agent: { ...pausedAgent, runs: [{ status: 'failed', errorCode: null, at: '2026-11-06T10:00:00Z' }] } })).state).toBe('errore');
  });

  it('a decision open to the owner → aspetta_proprietario; to a referent who is missing → «Manca il referente»', () => {
    const owner = derive(unit({ decisions: [{ addressedTo: 'owner', createdAt: '2026-11-06T09:30:00Z', decidedAt: null, outcome: null }] }));
    expect(owner.state).toBe('aspetta_proprietario');
    expect(owner.stateLabel).toBe('Aspetta te');
    const missing = derive(unit({
      referentPresent: false, referent: null,
      decisions: [{ addressedTo: 'referent', createdAt: '2026-11-06T09:30:00Z', decidedAt: null, outcome: null }],
    }));
    expect(missing.state).toBe('aspetta_proprietario');
    expect(missing.stateLabel).toBe('Manca il referente');
    expect(missing.waitingFor[0]).toMatchObject({ kind: 'proprietario', what: 'Indica chi segue Design' });
  });

  it('a Mandato blocked by an issue of another unit → aspetta_reparto', () => {
    const r = derive(unit({
      issues: [issue({ status: 'blocked', blockedSince: '2026-11-06T09:00:00Z', blockedBy: [blocker({ identifier: 'DAT-2', assignee: dati })] })],
    }));
    expect(r.state).toBe('aspetta_reparto');
    expect(r.late).toBe(false);
    expect(r.since).toBe('2026-11-06T09:00:00.000Z');
  });

  it('work in progress: al_lavoro with movement, fermo after more than 4 hours without', () => {
    const moving = derive(unit({ issues: [issue({ updatedAt: '2026-11-06T16:00:00Z' })] }));
    expect(moving.state).toBe('al_lavoro');
    const still = derive(unit({ issues: [issue({ updatedAt: '2026-11-06T13:00:00Z' })] }));
    expect(still.state).toBe('fermo');
    expect(still.late).toBe(false);
    const running = derive(unit({
      agent: { status: 'running', pauseReason: null, pausedAt: null, pausedByOwner: null, runs: [] },
      issues: [issue({ updatedAt: '2026-11-06T09:00:00Z' })],
    }));
    expect(running.state).toBe('al_lavoro');
  });

  it('a session on the laptop counts as work in progress', () => {
    const r = derive(unit({ issues: [], sessions: [{ state: 'in-lavorazione', at: '2026-11-06T17:30:00Z' }] }));
    expect(r.state).toBe('al_lavoro');
  });

  it('Mandato done → finito', () => {
    const r = derive(unit({ issues: [issue({ status: 'done', updatedAt: '2026-11-05T09:00:00Z' })], parts: [] }));
    expect(r.state).toBe('finito');
    expect(r.why).toBe('Finito il 5/11');
  });

  it('a wait older than 24 hours is late; one younger is not', () => {
    const old = derive(unit({ decisions: [{ addressedTo: 'owner', createdAt: '2026-11-05T09:00:00Z', decidedAt: null, outcome: null }] }));
    expect(old.late).toBe(true);
    expect(old.alert).toEqual({ kind: 'ritardo', text: 'In attesa da più di 24 ore', attempts: [] });
    const fresh = derive(unit({ decisions: [{ addressedTo: 'owner', createdAt: '2026-11-06T09:00:00Z', decidedAt: null, outcome: null }] }));
    expect(fresh.late).toBe(false);
  });

  it('the thresholds are the caller’s', () => {
    const input = unit({ issues: [issue({ updatedAt: '2026-11-06T16:00:00Z' })] });
    expect(deriveUnitState(input, NOW, { lavoroMs: 60_000, attesaMs: SOGLIE.attesaMs }).state).toBe('fermo');
  });

  it('is pure: the same input gives the same answer and the input is not changed', () => {
    const input = unit({ issues: [blockedByDirector(false)], decisions: [approvedAt1557] });
    const frozen = JSON.stringify(input);
    expect(deriveUnitState(input, NOW)).toEqual(deriveUnitState(input, NOW));
    expect(JSON.stringify(input)).toBe(frozen);
  });

  it('is exported by the compiled package too', () => {
    const input = unit({ issues: [blockedByDirector(false)], decisions: [approvedAt1557] });
    expect(commonJs.deriveUnitState(input, NOW).state).toBe('approvato_non_ripartito');
  });
});

describe('deriveUnitState — the words', () => {
  it('(i) no why, label or alert contains an English state, an issue code or an error code', () => {
    expect(everything.length).toBeGreaterThan(20);
    const banned = /blocked|in_progress|in_review|backlog|todo|provider_quota|process_lost|timed_out|\bR\d+\b|\b[A-Z]{2,4}-\d+\b|\btask\b|\brun\b/i;
    for (const r of everything) {
      const text = [r.why, r.stateLabel, r.alert?.text ?? '', ...(r.alert?.attempts.map((a) => a.text) ?? []), ...r.waitingFor.map((w) => w.what)].join(' | ');
      expect(text, text).not.toMatch(banned);
    }
  });
});
