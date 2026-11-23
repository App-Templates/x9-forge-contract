import { describe, expect, it } from 'vitest';
import {
  DEV_SESSION_WAIT_SERVICE_NAME,
  InternalPaperclipSeatNativeWakeRequestSchema,
  internalPaperclipSeatNativeWakeContract,
  waitsOnDevSession,
} from '../src/http/endpoints/internal-paperclip-seats.js';

const scope = { tenantId: 't1', ownerId: 'o1', agentId: 'director-a' };
const identity = { managementAgentId: 'director-a', runtimeAgentId: 'director-a', vaultAgentId: 7 };
const base = { scope, eventId: 'evt-1', organizationId: 'org-a', identity };
const projectId = '33333333-3333-4333-8333-333333333333';
const requestKey = 'a1'.repeat(32);
const material = { kind: 'dev_material_needed', sessionIssue: 73, projectId, requestKey };
const sourceRunId = '44444444-4444-4444-8444-444444444444';
const req = (event: Record<string, unknown>, extra: Record<string, unknown> = {}) => ({ ...base, ...extra, event });

describe('s8477 sveglia materiale richiesto', () => {
  it('s8477 regressione-r73-la-richiesta-di-materiale-sveglia-il-capo', () => {
    for (const event of [material, { ...material, sourceRunId }]) {
      expect(InternalPaperclipSeatNativeWakeRequestSchema.safeParse(req(event)).success).toBe(true);
      expect(internalPaperclipSeatNativeWakeContract.bodySchema.safeParse(req(event)).success).toBe(true);
    }
  });

  it('s8477 forma-stretta', () => {
    const bad = (event: Record<string, unknown>, extra?: Record<string, unknown>) =>
      InternalPaperclipSeatNativeWakeRequestSchema.safeParse(req(event, extra)).success;
    expect(bad({ ...material, requestKey: 'z'.repeat(64) })).toBe(false);
    expect(bad({ ...material, requestKey: 'A1'.repeat(32) })).toBe(false);
    expect(bad({ ...material, requestKey: 'a1'.repeat(31) })).toBe(false);
    expect(bad({ ...material, missing: ['x'] })).toBe(false);
    expect(bad({ ...material, sessionIssue: 0 })).toBe(false);
    expect(bad({ ...material, sourceRunId: '' })).toBe(false);
    expect(bad(material, { identity: undefined })).toBe(false);
    expect(bad(material, { organizationId: undefined })).toBe(false);
  });

  it('s8477 gli-altri-eventi-restano-validi', () => {
    const ok = (event: Record<string, unknown>) => InternalPaperclipSeatNativeWakeRequestSchema.safeParse(req(event)).success;
    expect(ok({ kind: 'dev_delivered', sessionIssue: 12, commit: 'a'.repeat(40), projectId })).toBe(true);
    expect(ok({ kind: 'limit_lifted', limit: 'company_spend', revision: 1, liftedAt: '2026-11-22T10:00:00.000Z' })).toBe(true);
  });

  it('s8477 il-monitor-del-capo-in-attesa-della-sessione-si-riconosce-anche-con-campi-in-piu', () => {
    expect(DEV_SESSION_WAIT_SERVICE_NAME).toBe('dev-session');
    expect(waitsOnDevSession({ monitor: { serviceName: 'dev-session', nextCheckAt: null, extra: 1 }, other: true })).toBe(true);
    expect(waitsOnDevSession({ monitor: { serviceName: 'X9 company spend cap' } })).toBe(false);
    expect(waitsOnDevSession(null)).toBe(false);
    expect(waitsOnDevSession('dev-session')).toBe(false);
  });
});
