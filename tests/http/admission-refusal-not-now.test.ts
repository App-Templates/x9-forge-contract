import { expect, it } from 'vitest';
import {
  InternalAgentTurnRunErrorResponseSchema,
  ORGANIZATION_ADMISSION_REFUSAL_CODES,
  OrganizationAdmissionRefusalCodeSchema,
} from '../../src/http/endpoints/internal-agent-turn.js';

it('s6171 non-adesso-come-guasto: ORGANIZATION_ADMISSION_REFUSAL_CODES contains budget_exhausted and rd_paused, and InternalAgentTurnRunErrorResponseSchema keeps an optional positive integer retryAfterSeconds', () => {
  for (const error of ['budget_exhausted', 'rd_paused']) {
    expect(ORGANIZATION_ADMISSION_REFUSAL_CODES).toContain(error);
    expect(OrganizationAdmissionRefusalCodeSchema.parse(error)).toBe(error);

    const body = { ok: false, error };
    const withoutEstimate = InternalAgentTurnRunErrorResponseSchema.parse(body);
    expect(withoutEstimate).toEqual(body);
    expect(withoutEstimate).not.toHaveProperty('retryAfterSeconds');

    for (const retryAfterSeconds of [1, 60, 86_400 * 7]) {
      const withEstimate = { ...body, retryAfterSeconds };
      expect(InternalAgentTurnRunErrorResponseSchema.parse(withEstimate)).toEqual(withEstimate);
    }
  }
});

it('s6171 zero, negative, fractional or over-a-week retryAfterSeconds is refused', () => {
  for (const error of ['budget_exhausted', 'rd_paused']) {
    for (const retryAfterSeconds of [0, -1, 1.5, 86_400 * 7 + 1, Infinity, NaN, '60', null]) {
      const result = InternalAgentTurnRunErrorResponseSchema.safeParse({
        ok: false,
        error,
        retryAfterSeconds,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.map((issue) => issue.path)).toContainEqual(['retryAfterSeconds']);
      }
    }
  }
});

it('s6171 the run_failed body agent-core sends today still parses unchanged', () => {
  // Legacy 6142 response shape: the spend refusal is recorded as a failed run.
  const body = {
    ok: false,
    error: 'run_failed',
    code: 'budget_exhausted',
    outcome: {
      runId: 'run-6171',
      attemptId: 'attempt-6171',
      status: 'failed',
      failureCode: 'budget_exhausted',
      evidence: [],
      consumption: [],
      recordedAt: '2026-11-10T10:00:00.000Z',
    },
  };

  const parsed = InternalAgentTurnRunErrorResponseSchema.parse(body);
  expect(parsed).toEqual(body);
  expect(parsed).not.toHaveProperty('retryAfterSeconds');
});
