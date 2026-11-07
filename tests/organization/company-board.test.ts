import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import {
  CompanyBoardSchema,
  CompanyListSchema,
  CompanyOverviewSchema,
  COMPANY_BOARD_UNIT_STATES,
  type CompanyBoard,
} from '../../src/organization/index.js';
import type * as SrcOrganization from '../../src/organization/index.js';

const require = createRequire(import.meta.url);
const commonJs: typeof SrcOrganization = require('../../dist/organization/index.cjs');

const T = '2026-11-07T10:00:00.000Z';
const ok = { available: true, reason: null };
const actions = { sveglia: ok, via: ok, ferma: ok, riprendi: { available: false, reason: 'Il capo non è fermo.' } };
const person = { name: 'Persona Uno', initials: 'PU', role: 'Referente' };

const wait = (kind: 'referente' | 'guasto', buSlugs: string[]) => ({
  kind, who: kind === 'guasto' ? [] : [person], buSlugs, partIndex: null, since: T,
  what: 'In attesa di una risposta', action: null, unblockHint: null, openIn: null,
});

const unit = (n: number, extra: Record<string, unknown> = {}) => ({
  buSlug: `reparto-${n}`, name: `Reparto ${n}`, typeId: 'design', leadAgentId: `capo-${n}`,
  referent: { name: 'Persona Uno', initials: 'PU', verified: true, missing: false },
  state: 'al_lavoro', stateLabel: 'Al lavoro', since: T, why: 'Sta lavorando', late: false,
  alert: null, waitingFor: [], sharedAcrossProjects: false,
  parts: [{ index: 0, title: 'Mandato', state: 'in_corso', note: null, at: null }],
  computerSession: null, history: [{ at: T, kind: 'passo', text: 'Partito', mine: false }],
  paused: null, actions, pauseWarning: null, ...extra,
});

const board = (units: unknown[] = Array.from({ length: 8 }, (_, i) => unit(i + 1)), extra: Record<string, unknown> = {}) => ({
  company: { clientId: 'cliente-1', name: null },
  project: { projectId: 'progetto-1', name: null, planVersion: 3 },
  readAt: T,
  summary: 'Tutto procede.',
  director: { state: 'al_lavoro', doing: null, wokenAt: null, wokenWhy: null },
  milestoneLine: null,
  units, milestones: [], waits: [], exchanges: [], projectHistory: [],
  spend: { status: 'non_collegata' },
  sources: [{ source: 'piano', status: 'ok' }, { source: 'materiali', status: 'tagliata', reason: 'Mostrati 40 di 52' }],
  ...extra,
});

describe('company board', () => {
  it('(a) accepts a valid board with 8 units, two waits on one unit and a cut source', () => {
    const units = [
      unit(1, { waitingFor: [wait('guasto', ['reparto-1']), wait('referente', ['reparto-1'])] }),
      unit(2, { waitingFor: [wait('referente', ['reparto-2']), wait('referente', ['reparto-2', 'reparto-3'])] }),
      ...Array.from({ length: 6 }, (_, i) => unit(i + 3)),
    ];
    expect(CompanyBoardSchema.safeParse(board(units)).success).toBe(true);
  });
  it('(b) rejects a non-ok source without a reason', () => {
    const b = board(undefined, { sources: [{ source: 'spesa', status: 'non_disponibile' }] });
    expect(CompanyBoardSchema.safeParse(b).success).toBe(false);
  });
  it('(c) rejects an extra field', () => {
    expect(CompanyBoardSchema.safeParse(board(undefined, { extra: 1 })).success).toBe(false);
    expect(CompanyBoardSchema.safeParse(board([unit(1, { extra: 1 })])).success).toBe(false);
  });
  it('(d) rejects a state outside the list', () => {
    expect(CompanyBoardSchema.safeParse(board([unit(1, { state: 'sconosciuto' })])).success).toBe(false);
    expect(COMPANY_BOARD_UNIT_STATES).toHaveLength(14);
  });
  it('(e) rejects a unit with zero parts', () => {
    expect(CompanyBoardSchema.safeParse(board([unit(1, { parts: [] })])).success).toBe(false);
  });
  it('(f) rejects 41 units', () => {
    const units = Array.from({ length: 41 }, (_, i) => unit(i + 1));
    expect(CompanyBoardSchema.safeParse(board(units)).success).toBe(false);
    expect(CompanyBoardSchema.safeParse(board(units.slice(0, 40))).success).toBe(true);
  });
  it('(g) rejects an unblockHint with a channel outside the list', () => {
    const w = { ...wait('referente', ['reparto-1']), unblockHint: { channel: 'sms', text: 'Scrivi', ref: null } };
    expect(CompanyBoardSchema.safeParse(board([unit(1, { waitingFor: [w] })])).success).toBe(false);
    const good = { ...w, unblockHint: { channel: 'mail', text: 'Scrivi', ref: null } };
    expect(CompanyBoardSchema.safeParse(board([unit(1, { waitingFor: [good] })])).success).toBe(true);
  });
  it('(g2) rejects an unavailable action without reason and the action aggiungi_informazione', () => {
    const noReason = { ...actions, via: { available: false, reason: null } };
    expect(CompanyBoardSchema.safeParse(board([unit(1, { actions: noReason })])).success).toBe(false);
    const w = { ...wait('referente', ['reparto-1']), action: 'aggiungi_informazione' };
    expect(CompanyBoardSchema.safeParse(board([unit(1, { waitingFor: [w] })])).success).toBe(false);
  });
  it('(h) overview carries services and units without history', () => {
    const { company, summary } = board();
    const { history: _h, ...noHistory } = unit(1);
    const project = { ...board([noHistory]) } as Record<string, unknown>;
    delete project.company;
    const overview = {
      company, summary,
      services: [{ role: 'ricerca_sviluppo', name: 'Ricerca e sviluppo', stateLabel: 'Libero', why: 'Nessun incarico', since: null, servingProjects: [] }],
      projects: [project],
    };
    expect(CompanyOverviewSchema.safeParse(overview).success).toBe(true);
    const withHistory = { ...overview, projects: [{ ...project, units: [unit(1)] }] };
    expect(CompanyOverviewSchema.safeParse(withHistory).success).toBe(false);
    expect(CompanyListSchema.safeParse({
      companies: [{ directorAgentId: 'director-1', clientId: 'cliente-1', name: null, projects: [{ projectId: 'p', name: null }] }],
    }).success).toBe(true);
  });
  it('(i) is exported from the CommonJS dist', () => {
    const b: CompanyBoard = board() as unknown as CompanyBoard;
    expect(commonJs.CompanyBoardSchema.safeParse(b).success).toBe(true);
    expect(commonJs.CompanyListSchema).toBeDefined();
    expect(commonJs.COMPANY_BOARD_UNIT_STATES).toEqual(COMPANY_BOARD_UNIT_STATES);
  });
});
