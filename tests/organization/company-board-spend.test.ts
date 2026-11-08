import { describe, expect, it } from 'vitest';
import { CompanyBoardSchema, CompanyOverviewSchema } from '../../src/organization/index.js';

const T = '2026-11-07T10:00:00.000Z';

const dayList = (last = 5, overrides: Record<number, number> = {}) =>
  Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.UTC(2026, 10, 8) - (13 - i) * 86_400_000).toISOString().slice(0, 10);
    return { date: d, micros: overrides[i] ?? (i === 13 ? last : 1) };
  });

const row = (kind: string, buSlug: string | null, today: number | null, total: number | null) => ({
  kind, buSlug, todayMicros: today, totalMicros: total,
});

const rows = () => [
  row('reparto', 'reparto-1', 2, 100),
  row('reparto', 'reparto-2', 1, 50),
  row('reparto', 'reparto-3', 0, 20),
  row('director', null, 1, 30),
  row('ricerca_sviluppo', null, 1, 10),
];

const spend = (extra: Record<string, unknown> = {}) => ({
  status: 'ok', scope: 'progetto', usdPerEur: 1.08, since: T,
  todayMicros: 5, totalMicros: 210, days: dayList(), rows: rows(), estimated: false, ...extra,
});

const board = (s: unknown) => ({
  company: { clientId: 'cliente-1', name: null },
  project: { projectId: 'progetto-1', name: null, planVersion: 3 },
  readAt: T, summary: 'Tutto procede.',
  director: { state: 'al_lavoro', doing: null, wokenAt: null, wokenWhy: null },
  milestoneLine: null, units: [], milestones: [], waits: [], exchanges: [], projectHistory: [],
  spend: s, sources: [{ source: 'spesa', status: 'ok' }],
});
const valid = (s: unknown) => CompanyBoardSchema.safeParse(board(s)).success;

describe('company board spend', () => {
  it('(a) accepts the ok variant in the board and in the overview', () => {
    expect(valid(spend())).toBe(true);
    const { company, ...project } = board(spend());
    const overview = { company, summary: 'Ok.', services: [], projects: [project] };
    expect(CompanyOverviewSchema.safeParse(overview).success).toBe(true);
  });
  it('(b) rejects today different from the rows or from the last day', () => {
    expect(valid(spend({ todayMicros: 6, days: dayList(6) }))).toBe(false);
    expect(valid(spend({ days: dayList(4) }))).toBe(false);
  });
  it('(c) rejects a wrong total or days adding up above the total', () => {
    expect(valid(spend({ totalMicros: 211 }))).toBe(false);
    expect(valid(spend({ days: dayList(5, { 0: 1000 }) }))).toBe(false);
  });
  it('(d) accepts a row with both null, rejects only one null', () => {
    expect(valid(spend({ rows: [...rows(), row('altro', null, null, null)] }))).toBe(true);
    expect(valid(spend({ rows: [...rows(), row('altro', null, null, 0)] }))).toBe(false);
    expect(valid(spend({ rows: [...rows(), row('altro', null, 0, null)] }))).toBe(false);
  });
  it('(e) rejects 13 days, gaps and reversed order', () => {
    expect(valid(spend({ days: dayList().slice(1) }))).toBe(false);
    const gap = dayList();
    gap[3] = { ...gap[3]!, date: '2026-01-01' };
    expect(valid(spend({ days: gap }))).toBe(false);
    expect(valid(spend({ days: dayList().reverse() }))).toBe(false);
  });
  it('(f) rejects a reparto without buSlug, a director with one, and two directors', () => {
    expect(valid(spend({ rows: [row('reparto', null, 5, 210)] }))).toBe(false);
    expect(valid(spend({ rows: [row('director', 'reparto-1', 5, 210)] }))).toBe(false);
    expect(valid(spend({ rows: [row('director', null, 3, 100), row('director', null, 2, 110)] }))).toBe(false);
  });
  it('(g) keeps non_collegata valid and requires scope on ok', () => {
    expect(valid({ status: 'non_collegata' })).toBe(true);
    const { scope, ...noScope } = spend();
    expect(scope).toBe('progetto');
    expect(valid(noScope)).toBe(false);
  });
});
