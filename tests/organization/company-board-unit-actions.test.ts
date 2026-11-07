import { describe, expect, it } from 'vitest';
import {
  COMPANY_BOARD_UNIT_STATES, CompanyBoardUnitSchema, deriveUnitActions,
  OWNER_ACTION_NOT_OWNER_REASON, PAUSE_STOPS_LAPTOP_SESSION,
  type BoardUnitActionsInput, type BoardRuleIssue, type BoardUnitActionPerson,
} from '../../src/organization/index.js';

const now = new Date('2026-11-07T10:00:00Z');
const issue = (status: BoardRuleIssue['status']): BoardRuleIssue => ({
  identifier: 'ACME-1', isMandate: true, status, updatedAt: null, startedAt: null,
  blockedSince: null, blockedBy: [], comments: [],
});
const unit = (over: Partial<BoardUnitActionsInput> = {}): BoardUnitActionsInput => ({
  state: 'al_lavoro', computerSession: null, issues: [issue('in_progress')],
  agent: { status: 'idle', pauseReason: null, pausedAt: null, pausedByOwner: null, runs: [] }, ...over,
});
const pause = (pauseReason: string, pausedByOwner: boolean | null = true): BoardUnitActionsInput => unit({
  state: 'in_pausa', agent: {
    status: 'paused', pauseReason, pausedAt: '2026-11-07T08:49:00Z', pausedByOwner, runs: [],
  },
});

describe('deriveUnitActions', () => {
  it('(n1) enables via only in attesa_del_via', () => {
    for (const state of COMPANY_BOARD_UNIT_STATES) {
      expect(deriveUnitActions(unit({ state }), 'collegata', now).actions.via).toEqual(
        state === 'attesa_del_via' ? { available: true, reason: null }
          : { available: false, reason: 'Il reparto non aspetta il via' },
      );
    }
  });
  it('(n2) resumes a manual pause and explains why wake and stop are unavailable', () => {
    const { actions } = deriveUnitActions(pause('manual'), 'collegata', now);
    expect(actions.riprendi).toEqual({ available: true, reason: null });
    for (const name of ['sveglia', 'ferma'] as const) {
      expect(actions[name]).toEqual({ available: false, reason: 'Il reparto è in pausa: riprendilo prima' });
    }
    expect(deriveUnitActions(pause('manual', false), 'collegata', now).actions.riprendi.available).toBe(true);
    const running = deriveUnitActions(unit(), 'collegata', now).actions;
    expect(running.sveglia).toEqual({ available: true, reason: null });
    expect(running.ferma).toEqual({ available: true, reason: null });
    expect(running.riprendi).toEqual({ available: false, reason: 'Il reparto non è in pausa' });
    expect(deriveUnitActions(pause('system'), 'collegata', now).actions.riprendi)
      .toEqual({ available: false, reason: 'Il capo non è in pausa a mano' });
  });
  it('(n3) never resumes a budget pause, including when marked as owner-paused', () => {
    for (const owner of [true, false, null]) {
      expect(deriveUnitActions(pause('budget', owner), 'collegata', now).actions.riprendi).toEqual({
        available: false, reason: 'È fermo per il tetto di spesa: non si riprende da qui',
      });
    }
  });
  it('(n4) disables every action for missing or unknown Paperclip identity', () => {
    const cases: [BoardUnitActionPerson, string][] = [
      ['mancante', 'La tua persona in Paperclip non è ancora collegata'],
      ['non_nota', 'Non so se la tua persona in Paperclip è collegata'],
    ];
    for (const [person, reason] of cases) {
      for (const input of [unit(), unit({ state: 'attesa_del_via' }), pause('manual'), pause('budget')]) {
        const { actions } = deriveUnitActions(input, person, now);
        expect(Object.keys(actions)).toHaveLength(4);
        for (const value of Object.values(actions)) expect(value).toEqual({ available: false, reason });
        expect(CompanyBoardUnitSchema.shape.actions.safeParse(actions).success).toBe(true);
      }
    }
  });
  it('(n5) requires an open assignment, excluding both done and cancelled', () => {
    for (const issues of [[], [issue('done')], [issue('cancelled')], [issue('done'), issue('cancelled')]]) {
      expect(deriveUnitActions(unit({ issues }), 'collegata', now).actions.sveglia).toEqual({
        available: false, reason: 'Il reparto non ha un incarico aperto',
      });
    }
    for (const status of ['backlog', 'todo', 'in_progress', 'in_review', 'blocked'] as const) {
      expect(deriveUnitActions(unit({ issues: [issue('done'), issue(status)] }), 'collegata', now).actions.sveglia)
        .toEqual({ available: true, reason: null });
    }
  });
  it('(n6) warns according to the three proof outcomes only for a current laptop session', () => {
    expect(PAUSE_STOPS_LAPTOP_SESSION).toBeNull();
    const input = unit({ computerSession: {
      state: 'adesso', at: '2026-11-07T09:00:00Z', computerName: null, what: null, stopsOnPause: null,
    } });
    const base = "C'è una sessione in corso sul tuo portatile";
    const cases: [boolean | null, string][] = [
      [true, `${base}: fermare il capo la interrompe`],
      [false, `${base}: continua anche se fermi il capo; chiudila dal portatile`], [null, base],
    ];
    for (const [pauseStopsLaptopSession, expected] of cases) {
      const result = deriveUnitActions(input, 'collegata', now, { pauseStopsLaptopSession });
      expect(result.pauseWarning).toBe(expected);
      expect(CompanyBoardUnitSchema.shape.pauseWarning.safeParse(result.pauseWarning).success).toBe(true);
      expect(deriveUnitActions(unit(), 'collegata', now, { pauseStopsLaptopSession }).pauseWarning).toBeNull();
      expect(deriveUnitActions(unit({ computerSession: { ...input.computerSession!, state: 'oggi_finita' } }),
        'collegata', now, { pauseStopsLaptopSession }).pauseWarning).toBeNull();
    }
    expect(deriveUnitActions(input, 'collegata', now).pauseWarning).toBe(base);
    expect(input.computerSession?.state).toBe('adesso');
  });
  it('(n7) exports the exact reason for a viewer who is not the owner', () => {
    expect(OWNER_ACTION_NOT_OWNER_REASON).toBe("Le azioni le fa il proprietario dell'azienda");
  });
});
