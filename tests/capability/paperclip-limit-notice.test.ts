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

describe('limit notice', () => {
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
