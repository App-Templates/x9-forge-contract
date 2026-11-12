import { describe, expect, it } from 'vitest';
import {
  LimitNoticeSchema,
  nextUtcMidnight,
  renderLimitNotice,
} from '../../src/capability/paperclip/limit-notice.js';

const agent = { managementAgentId: 'capo-orto-web', runtimeAgentId: 'capo-orto-web', vaultAgentId: 41 };
const wakeId = '7b1f3c52-0a4e-4d0b-9f55-2b1c7d9e8a10';

const daily = {
  limit: 'daily_runs',
  limitValue: 14,
  observedValue: 14,
  threshold: 'reached',
  event: 'wake_skipped',
  organizationId: 'good-choice',
  agent,
  wakeupRequestId: wakeId,
  observedAt: '2026-11-11T19:40:00.000Z',
  resetsAt: '2026-11-12T00:00:00.000Z',
  recipients: ['director', 'owner'],
};

const spend = {
  limit: 'company_spend',
  limitValue: 100_000_000,
  observedValue: 85_000_000,
  threshold: 'warning_80',
  event: 'warning',
  organizationId: 'good-choice',
  observedAt: '2026-11-11T19:40:00.000Z',
  recipients: ['owner'],
};

const namedSpend = {
  ...spend,
  limitValue: 108_000_000,
  observedValue: 108_450_000,
  threshold: 'reached',
  event: 'turn_refused',
  spend: {
    scopeName: 'Good Choice',
    windowStart: '2026-11-10T13:00:00.000Z',
    usdPerEur: 1.08,
  },
};

describe('limit notice', () => {
  it('s6542 avviso-spesa-con-nome: renders the named company cap in euros deterministically', () => {
    const notice = LimitNoticeSchema.parse(namedSpend);
    const expected = "Tetto di spesa dell'azienda «Good Choice» raggiunto: 100,42 € su 100,00 €. Resta 0,00 €. Conta la spesa di modelli, strumenti, ricerche e Lab di tutti gli agenti dell'azienda dal 10/11/2026. Un turno è stato rifiutato. Finché il tetto non è alzato i turni nuovi restano fermi.";
    expect(renderLimitNotice(notice)).toBe(expected);
    expect(renderLimitNotice(notice)).toBe(expected);
  });

  it('s6542 renders a business unit cap with its own name and scope', () => {
    const notice = LimitNoticeSchema.parse({
      ...namedSpend,
      limit: 'business_unit_spend',
      limitValue: 43_200_000,
      observedValue: 45_360_000,
      spend: { ...namedSpend.spend, scopeName: 'Orto Web' },
    });
    expect(renderLimitNotice(notice)).toBe('Tetto di spesa del reparto «Orto Web» raggiunto: 42,00 € su 40,00 €. Resta 0,00 €. Conta la spesa di modelli, strumenti, ricerche e Lab di tutti gli agenti del reparto dal 10/11/2026. Un turno è stato rifiutato. Finché il tetto non è alzato i turni nuovi restano fermi.');
  });

  it('s6542 renders remaining euros at 80% without stopping work', () => {
    const notice = LimitNoticeSchema.parse({
      ...namedSpend,
      observedValue: 91_800_000,
      threshold: 'warning_80',
      event: 'warning',
    });
    const text = renderLimitNotice(notice);
    expect(text).toBe("Tetto di spesa dell'azienda «Good Choice» oltre l'80%: 85,00 € su 100,00 €. Resta 15,00 €. Conta la spesa di modelli, strumenti, ricerche e Lab di tutti gli agenti dell'azienda dal 10/11/2026. Nessun lavoro è stato fermato.");
    expect(text).not.toContain('Finché il tetto');
  });

  it('s6542 preserves the company warning without spend byte for byte', () => {
    expect(renderLimitNotice(LimitNoticeSchema.parse(spend))).toBe("Tetto di spesa dell'azienda oltre l'80%: 85000000 su 100000000 milionesimi di dollaro. Nessun lavoro è stato fermato.");
  });

  it('s6542 uses the UTC date of the spend window', () => {
    const notice = LimitNoticeSchema.parse({
      ...namedSpend,
      spend: { ...namedSpend.spend, windowStart: '2026-11-11T00:30:00+02:00' },
    });
    expect(renderLimitNotice(notice)).toContain('dal 10/11/2026.');
  });

  const spendRefusals: Array<[string, Record<string, unknown>, string[]]> = [
    ['business unit without spend', { ...spend, limit: 'business_unit_spend' }, ['spend']],
    ['spend on daily runs', { ...daily, spend: namedSpend.spend }, ['spend']],
    ['spend on daily cost', { ...daily, limit: 'daily_cost', spend: namedSpend.spend }, ['spend']],
    ['empty scope name', { ...namedSpend, spend: { ...namedSpend.spend, scopeName: '' } }, ['spend', 'scopeName']],
    ['newline in scope name', { ...namedSpend, spend: { ...namedSpend.spend, scopeName: 'Good\nChoice' } }, ['spend', 'scopeName']],
    ['trailing newline in scope name', { ...namedSpend, spend: { ...namedSpend.spend, scopeName: 'Good Choice\n' } }, ['spend', 'scopeName']],
    ['carriage return in scope name', { ...namedSpend, spend: { ...namedSpend.spend, scopeName: 'Good\rChoice' } }, ['spend', 'scopeName']],
    ['Unicode line separator in scope name', { ...namedSpend, spend: { ...namedSpend.spend, scopeName: 'Good\u2028Choice' } }, ['spend', 'scopeName']],
    ['scope name over 120 characters', { ...namedSpend, spend: { ...namedSpend.spend, scopeName: 'x'.repeat(121) } }, ['spend', 'scopeName']],
    ['zero exchange rate', { ...namedSpend, spend: { ...namedSpend.spend, usdPerEur: 0 } }, ['spend', 'usdPerEur']],
    ['negative exchange rate', { ...namedSpend, spend: { ...namedSpend.spend, usdPerEur: -1 } }, ['spend', 'usdPerEur']],
    ['invalid window start', { ...namedSpend, spend: { ...namedSpend.spend, windowStart: '2026-11-10' } }, ['spend', 'windowStart']],
    ['business unit with agent', { ...namedSpend, limit: 'business_unit_spend', agent }, ['agent']],
    ['business unit with skipped wake', { ...namedSpend, limit: 'business_unit_spend', event: 'wake_skipped' }, ['event']],
  ];
  it.each(spendRefusals)('s6542 refuses %s at its own path', (_name, input, path) => {
    const result = LimitNoticeSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.map((issue) => issue.path)).toContainEqual(path);
  });

  it('s6349 avviso-di-limite: a skipped wake over the daily run cap renders one fixed sentence', () => {
    const notice = LimitNoticeSchema.parse(daily);
    const text = renderLimitNotice(notice);
    expect(text).toContain('capo-orto-web');
    expect(text).toContain('14 su 14 corse');
    expect(text).toContain('Una sveglia è stata saltata.');
    expect(text).toContain('Si azzera a mezzanotte UTC.');
    expect(renderLimitNotice(notice)).toBe(text);
  });

  it('accepts the company spend warning and refusal without an agent', () => {
    expect(LimitNoticeSchema.safeParse(spend).success).toBe(true);
    const refused = { ...spend, observedValue: 100_000_000, threshold: 'reached', event: 'turn_refused' };
    expect(LimitNoticeSchema.safeParse(refused).success).toBe(true);
    expect(renderLimitNotice(LimitNoticeSchema.parse(refused))).toContain('Un turno è stato rifiutato.');
    expect(renderLimitNotice(LimitNoticeSchema.parse(spend))).not.toContain('Si azzera');
  });

  const refusals: Array<[string, Record<string, unknown>]> = [
    ['reached below the cap', { ...daily, observedValue: 13 }],
    ['warning_80 at 70%', { ...spend, observedValue: 70_000_000 }],
    ['warning event with reached', { ...daily, event: 'warning' }],
    ['wake_skipped with company_spend', { ...spend, observedValue: 100_000_000, threshold: 'reached', event: 'wake_skipped' }],
    ['turn_refused with daily_runs', { ...daily, event: 'turn_refused', wakeupRequestId: undefined }],
    ['daily cap without agent', { ...daily, agent: undefined }],
    ['daily cap without resetsAt', { ...daily, resetsAt: undefined }],
    ['resetsAt not the next UTC midnight', { ...daily, resetsAt: '2026-11-12T01:00:00.000Z' }],
    ['wakeupRequestId with turn_refused', { ...spend, observedValue: 100_000_000, threshold: 'reached', event: 'turn_refused', wakeupRequestId: wakeId }],
    ['company_spend with agent', { ...spend, agent }],
    ['empty recipients', { ...daily, recipients: [] }],
    ['repeated recipients', { ...daily, recipients: ['owner', 'owner'] }],
  ];
  it.each(refusals)('refuses %s', (_name, input) => {
    expect(LimitNoticeSchema.safeParse(input).success).toBe(false);
  });

  it('computes the next UTC midnight', () => {
    expect(nextUtcMidnight('2026-11-11T23:59:59.999Z')).toBe('2026-11-12T00:00:00.000Z');
    expect(nextUtcMidnight('2026-11-12T00:30:00+02:00')).toBe('2026-11-12T00:00:00.000Z');
  });
});
