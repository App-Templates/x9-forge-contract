import { describe, expect, it } from 'vitest';
import {
  OWNER_NOTICE_KIND_LABEL,
  OWNER_NOTICE_LIMITS,
  OwnerNoticeBodySchema,
  OwnerNoticeKindSchema,
  OwnerNoticeResponseSchema,
  ownerNoticeDeviceContract,
} from '../../../src/capability/index.js';

const validBody = {
  kind: 'release_ready',
  title: 'Release ready',
  text: 'The release is ready for review.\nChecks completed.',
  dedupeKey: 'release:bridge-030',
};

describe('owner notice device contract', () => {
  it('accepts valid bodies and pins the signed endpoint', () => {
    expect(OwnerNoticeBodySchema.safeParse(validBody).success).toBe(true);
    for (const kind of ['release_ready', 'decision_needed', 'fault', 'daily_recap']) {
      expect(OwnerNoticeKindSchema.safeParse(kind).success).toBe(true);
      expect(OwnerNoticeBodySchema.safeParse({ ...validBody, kind }).success).toBe(true);
    }
    expect(ownerNoticeDeviceContract.path).toBe('/avvisi/api/notices');
    expect(ownerNoticeDeviceContract.method).toBe('POST');
    expect(ownerNoticeDeviceContract.authType).toBe('device_signature');
    expect(ownerNoticeDeviceContract.bodySchema).toBe(OwnerNoticeBodySchema);
    expect(ownerNoticeDeviceContract.responseSchema).toBe(OwnerNoticeResponseSchema);
    expect(OWNER_NOTICE_LIMITS).toEqual({ perDevicePerDay: 20, dedupeWindowHours: 24, titleMax: 120, textMax: 1500 });
    expect(OWNER_NOTICE_KIND_LABEL).toEqual({
      release_ready: '🚀 Pronto per il rilascio',
      decision_needed: '🧭 Serve una tua scelta',
      fault: '🛑 Guasto da guardare',
      daily_recap: '☀️ Recap del mattino',
    });
    expect(OwnerNoticeKindSchema.options).toEqual(['release_ready', 'decision_needed', 'fault', 'daily_recap']);
  });

  it.each([
    ['unknown kind', { kind: 'other' }],
    ['recipient override', { chatId: '123456' }],
    ['title newline', { title: 'Release\nready' }],
    ['empty title', { title: '' }],
    ['long title', { title: 'a'.repeat(121) }],
    ['empty text', { text: '' }],
    ['long text', { text: 'a'.repeat(1501) }],
    ['uppercase key', { dedupeKey: 'Release:030' }],
    ['key with space', { dedupeKey: 'release 030' }],
    ['short key', { dedupeKey: 'ab' }],
    ['long key', { dedupeKey: 'a'.repeat(129) }],
    ['invalid key prefix', { dedupeKey: ':ab' }],
  ])('rejects body mutation: %s', (_name, mutation) => {
    expect(OwnerNoticeBodySchema.safeParse({ ...validBody, ...mutation }).success).toBe(false);
  });

  it('accepts the daily recap with its own label (AVV-30)', () => {
    const recap = { kind: 'daily_recap', title: 'Recap del mattino 20/10', text: 'Chiusi 3, falliti 1.', dedupeKey: 'mattino:20261020' };
    expect(OwnerNoticeBodySchema.parse(recap)).toEqual(recap);
    expect(OWNER_NOTICE_KIND_LABEL[OwnerNoticeKindSchema.parse('daily_recap')]).toBe('☀️ Recap del mattino');
  });

  it('accepts payload length boundaries', () => {
    expect(OwnerNoticeBodySchema.safeParse({ ...validBody, title: 'a', text: 'a', dedupeKey: 'a:_' }).success).toBe(true);
    expect(OwnerNoticeBodySchema.safeParse({
      ...validBody, title: 'a'.repeat(120), text: 'a'.repeat(1500), dedupeKey: 'a'.repeat(128),
    }).success).toBe(true);
  });

  it('accepts delivery, deduplication and failure responses', () => {
    expect(OwnerNoticeResponseSchema.safeParse({ ok: true, delivered: true, deduped: false }).success).toBe(true);
    expect(OwnerNoticeResponseSchema.safeParse({ ok: true, delivered: false, deduped: true }).success).toBe(true);
    expect(OwnerNoticeResponseSchema.safeParse({ ok: false, error: 'Delivery failed' }).success).toBe(true);
    expect(OwnerNoticeResponseSchema.safeParse({ ok: false, error: 'a'.repeat(500) }).success).toBe(true);
  });

  it.each([
    ['missing deduped', { ok: true, delivered: true }],
    ['missing delivered', { ok: true, deduped: false }],
    ['nonboolean delivered', { ok: true, delivered: 'true', deduped: false }],
    ['nonboolean deduped', { ok: true, delivered: true, deduped: 'false' }],
    ['extra success field', { ok: true, delivered: true, deduped: false, extra: true }],
    ['extra failure field', { ok: false, error: 'Failed', extra: true }],
    ['empty error', { ok: false, error: '' }],
    ['long error', { ok: false, error: 'a'.repeat(501) }],
    ['missing error', { ok: false }],
    ['invalid discriminator', { ok: 'true', delivered: true, deduped: false }],
  ])('rejects response mutation: %s', (_name, response) => {
    expect(OwnerNoticeResponseSchema.safeParse(response).success).toBe(false);
  });
});
