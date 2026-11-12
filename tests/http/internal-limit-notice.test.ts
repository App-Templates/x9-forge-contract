import { describe, expect, it } from 'vitest';
import {
  INTERNAL_LIMIT_NOTICE_ERRORS,
  InternalLimitNoticeRequestSchema,
  InternalLimitNoticeResponseSchema,
  internalLimitNoticeContract,
} from '../../src/http/endpoints/internal-limit-notice.js';

const agent = { managementAgentId: 'capo-orto-web', runtimeAgentId: 'capo-orto-web', vaultAgentId: 41 };
const notice = {
  limit: 'daily_runs',
  limitValue: 14,
  observedValue: 14,
  threshold: 'reached',
  event: 'wake_skipped',
  organizationId: 'good-choice',
  agent,
  observedAt: '2026-11-11T19:40:00.000Z',
  resetsAt: '2026-11-12T00:00:00.000Z',
  recipients: ['director', 'owner'],
};
const request = { tenantId: '1', ownerId: '1', notice };

describe('internal limit notice request', () => {
  it('s6592 avviso-al-proprietario: a daily run limit notice travels only when the owner is a recipient', () => {
    expect(InternalLimitNoticeRequestSchema.safeParse(request).success).toBe(true);
    const ownerOnly = { ...request, notice: { ...notice, recipients: ['owner'] } };
    expect(InternalLimitNoticeRequestSchema.safeParse(ownerOnly).success).toBe(true);
    expect(internalLimitNoticeContract.path).toBe('/internal/limit-notice');
    expect(internalLimitNoticeContract.bodySchema).toBe(InternalLimitNoticeRequestSchema);
  });

  it('refuses a notice without the owner among the recipients', () => {
    const r = InternalLimitNoticeRequestSchema.safeParse({ ...request, notice: { ...notice, recipients: ['director'] } });
    expect(r.success).toBe(false);
    expect(r.error?.issues.some((i) => i.path.join('.') === 'notice.recipients')).toBe(true);
  });

  it('refuses a company spend notice', () => {
    const spend = {
      limit: 'company_spend',
      limitValue: 1000,
      observedValue: 1000,
      threshold: 'reached',
      event: 'turn_refused',
      organizationId: 'good-choice',
      observedAt: '2026-11-11T19:40:00.000Z',
      spend: { scopeName: 'Good Choice', windowStart: '2026-11-01T00:00:00.000Z', usdPerEur: 1.1 },
      recipients: ['owner'],
    };
    const r = InternalLimitNoticeRequestSchema.safeParse({ ...request, notice: spend });
    expect(r.success).toBe(false);
    expect(r.error?.issues.some((i) => i.path.join('.') === 'notice.limit')).toBe(true);
  });

  it('refuses a request without ownerId and one with an extra field', () => {
    expect(InternalLimitNoticeRequestSchema.safeParse({ tenantId: '1', notice }).success).toBe(false);
    expect(InternalLimitNoticeRequestSchema.safeParse({ ...request, extra: 1 }).success).toBe(false);
  });
});

describe('internal limit notice response', () => {
  it('accepts the two outcomes and every fixed error', () => {
    for (const outcome of ['sent', 'already_sent']) {
      expect(InternalLimitNoticeResponseSchema.safeParse({ ok: true, outcome }).success).toBe(true);
    }
    for (const error of INTERNAL_LIMIT_NOTICE_ERRORS) {
      expect(InternalLimitNoticeResponseSchema.safeParse({ ok: false, error }).success).toBe(true);
    }
    expect(InternalLimitNoticeResponseSchema.safeParse({ ok: false, error: 'not_sent' }).success).toBe(true);
  });

  it('refuses an invented outcome or error', () => {
    expect(InternalLimitNoticeResponseSchema.safeParse({ ok: true, outcome: 'queued' }).success).toBe(false);
    expect(InternalLimitNoticeResponseSchema.safeParse({ ok: false, error: 'boom' }).success).toBe(false);
  });
});
