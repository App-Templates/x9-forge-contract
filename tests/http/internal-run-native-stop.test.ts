import { describe, expect, it } from 'vitest';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/index.js';
import {
  INTERNAL_RUN_NATIVE_STOP_PATH,
  InternalRunNativeStopRequestSchema,
  InternalRunNativeStopResponseSchema,
  internalRunNativeStopContract,
} from '../../src/http/endpoints/index.js';

const request = {
  organizationRun: {
    schemaVersion: 1,
    runId: 'run-1',
    organizationId: 'org-1',
    ownerId: 'owner-1',
    identity: { managementAgentId: 'x9', runtimeAgentId: 'agent-x9', vaultAgentId: 7 },
    issuer: 'x9',
    issuedAt: '2026-10-14T10:00:00.000Z',
    expiresAt: '2026-10-14T11:00:00.000Z',
  },
  attempt: {
    runId: 'run-1',
    attemptId: 'att-1',
    attemptNumber: 1,
    startedAt: '2026-10-14T10:01:00.000Z',
    idempotencyKey: 'idem-1',
  },
  reason: 'owner',
};
const statuses = ['cancelled', 'not_started', 'already_finished', 'unconfirmed', 'unknown_run'];

describe('internalRunNativeStopContract', () => {
  it('accepts a coherent request', () => {
    expect(InternalRunNativeStopRequestSchema.parse(request)).toEqual(request);
  });

  it('rejects a mismatched run', () => {
    expect(InternalRunNativeStopRequestSchema.safeParse({
      ...request,
      attempt: { ...request.attempt, runId: 'run-2' },
    }).success).toBe(false);
  });

  it('rejects a caller-supplied effectStarted', () => {
    expect(InternalRunNativeStopRequestSchema.safeParse({
      ...request,
      effectStarted: false,
    }).success).toBe(false);
  });

  it.each(statuses)('accepts %s without changing the outcome', (status) => {
    const response = { status, runId: 'run-1', attemptId: 'att-1' };
    expect(InternalRunNativeStopResponseSchema.parse(response)).toEqual(response);
  });

  it.each(statuses)('rejects %s without attemptId', (status) => {
    expect(InternalRunNativeStopResponseSchema.safeParse({ status, runId: 'run-1' }).success).toBe(false);
  });

  it.each(statuses)('rejects %s without runId', (status) => {
    expect(InternalRunNativeStopResponseSchema.safeParse({ status, attemptId: 'att-1' }).success).toBe(false);
  });

  it.each(statuses)('rejects extra response fields for %s', (status) => {
    expect(InternalRunNativeStopResponseSchema.safeParse({
      status, runId: 'run-1', attemptId: 'att-1', effectStarted: true,
    }).success).toBe(false);
  });

  it('rejects an unsupported outcome', () => {
    expect(InternalRunNativeStopResponseSchema.safeParse({
      status: 'accepted', runId: 'run-1', attemptId: 'att-1',
    }).success).toBe(false);
  });

  it('uses the bridge path, secret header and schemas', () => {
    expect(INTERNAL_RUN_NATIVE_STOP_PATH).toBe('/internal/runs/native-stop');
    expect(internalRunNativeStopContract).toEqual({
      method: 'POST',
      path: INTERNAL_RUN_NATIVE_STOP_PATH,
      authType: 'secret',
      authHeader: INTERNAL_SECRET_HEADER,
      bodySchema: InternalRunNativeStopRequestSchema,
      responseSchema: InternalRunNativeStopResponseSchema,
    });
  });
});
