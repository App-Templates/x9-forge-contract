import { describe, expect, it } from 'vitest';
import * as http from '../../src/http/index.js';
import {
  InternalAgentTurnRequestSchema,
  InternalAgentTurnResponseSchema,
} from '../../src/http/endpoints/internal-agent-turn.js';
import {
  INTERNAL_AGENT_TURN_JOB_CONFLICT,
  InternalAgentTurnJobConflictResponseSchema,
  InternalAgentTurnJobReadResponseSchema,
  InternalAgentTurnJobResultAckRequestSchema,
  InternalAgentTurnJobResultAckResponseSchema,
  InternalAgentTurnJobStatusSchema,
  InternalAgentTurnJobSubmitRequestSchema,
  InternalAgentTurnJobSubmitResponseSchema,
  internalAgentTurnJobSubmitContract,
  internalAgentTurnJobReadContract,
  internalAgentTurnJobResultAckContract,
  internalAgentTurnJobsPath,
  internalAgentTurnJobPath,
  internalAgentTurnJobResultAckPath,
} from '../../src/http/endpoints/internal-agent-turn-jobs.js';

const turn = {
  channelId: 'email', sessionId: 'email-session', message: 'Prepare the long brief',
  history: [{ role: 'user' as const, content: 'Previous brief' }],
  userId: 'owner-1',
  attachment: { type: 'document' as const, fileUrl: 'https://example.com/brief.pdf' },
};
const result = InternalAgentTurnResponseSchema.parse({
  ok: true, reply: 'The brief is ready', updatedHistory: [], duplicate: true,
});
const job = { jobId: 'job_123-abc', status: 'completed' as const };

describe('asynchronous per-agent turn jobs', () => {
  it('submit reuses the synchronous turn request', () => {
    const body = {
      ...turn, idempotencyKey: 'email-message-1',
      origin: { channel: 'email', messageId: 'message-1', inboxId: 'director@example.com' },
    };
    expect(InternalAgentTurnJobSubmitRequestSchema.parse(body)).toEqual(body);
    expect(InternalAgentTurnJobSubmitRequestSchema.parse({ ...turn, idempotencyKey: 'x' }))
      .toEqual({ ...InternalAgentTurnRequestSchema.parse(turn), idempotencyKey: 'x' });
    for (const [field, schema] of Object.entries(InternalAgentTurnRequestSchema.shape)) {
      expect(InternalAgentTurnJobSubmitRequestSchema.shape[field as keyof typeof InternalAgentTurnRequestSchema.shape])
        .toBe(schema);
    }
    for (const idempotencyKey of ['', 'x'.repeat(201), undefined]) {
      expect(InternalAgentTurnJobSubmitRequestSchema.safeParse({ ...turn, idempotencyKey }).success).toBe(false);
    }
    expect(InternalAgentTurnJobSubmitRequestSchema.safeParse({ ...turn, idempotencyKey: 'x'.repeat(200) }).success).toBe(true);
    for (const invalid of [
      { message: '' }, { channelId: '../email' },
      { origin: { ...body.origin, channel: 'telegram' } },
      { origin: { ...body.origin, messageId: '' } },
      { origin: { channel: 'email', messageId: 'message-1' } },
    ]) {
      expect(InternalAgentTurnJobSubmitRequestSchema.safeParse({ ...body, ...invalid }).success).toBe(false);
    }
    for (const replayed of [false, true]) {
      expect(InternalAgentTurnJobSubmitResponseSchema.parse({ ...job, replayed })).toEqual({ ...job, replayed });
    }
    expect(InternalAgentTurnJobSubmitResponseSchema.safeParse(job).success).toBe(false);
    const conflict = { ok: false, code: INTERNAL_AGENT_TURN_JOB_CONFLICT, message: 'Content differs' };
    expect(InternalAgentTurnJobConflictResponseSchema.parse(conflict)).toEqual(conflict);
    expect(InternalAgentTurnJobConflictResponseSchema.safeParse({ ...conflict, code: 'generic' }).success).toBe(false);
  });

  it('read carries the result only when completed', () => {
    expect(InternalAgentTurnJobStatusSchema.options).toEqual(['queued', 'running', 'uncertain', 'completed', 'failed']);
    for (const status of InternalAgentTurnJobStatusSchema.options) {
      expect(InternalAgentTurnJobReadResponseSchema.safeParse({ ...job, status }).success).toBe(true);
      expect(InternalAgentTurnJobReadResponseSchema.safeParse({ ...job, status, result, resultDigest: 'digest-1' }).success)
        .toBe(status === 'completed');
    }
    expect(InternalAgentTurnJobReadResponseSchema.parse({ ...job, result, resultDigest: 'digest-1' }))
      .toEqual({ ...job, result, resultDigest: 'digest-1' });
    expect(InternalAgentTurnJobReadResponseSchema.safeParse({ ...job, result: { reply: 'incomplete' } }).success).toBe(false);
    expect(InternalAgentTurnJobReadResponseSchema.safeParse({ ...job, status: 'unknown' }).success).toBe(false);
  });

  it('read carries the error only when failed or uncertain', () => {
    const error = { code: 'MODEL_UNAVAILABLE', message: 'Provider rejected the turn' };
    for (const status of InternalAgentTurnJobStatusSchema.options) {
      expect(InternalAgentTurnJobReadResponseSchema.safeParse({ ...job, status, error }).success)
        .toBe(status === 'failed' || status === 'uncertain');
    }
    expect(InternalAgentTurnJobReadResponseSchema.parse({ ...job, status: 'uncertain', error }).error).toEqual(error);
    for (const invalid of [{ code: '', message: 'Failure' }, { code: 'FAILURE' }]) {
      expect(InternalAgentTurnJobReadResponseSchema.safeParse({ ...job, status: 'failed', error: invalid }).success).toBe(false);
    }
    expect(InternalAgentTurnJobReadResponseSchema.safeParse({ ...job, error, result }).success).toBe(false);
  });

  it('path helpers reject unsafe ids', () => {
    expect(internalAgentTurnJobsPath('director')).toBe('/internal/agents/director/turn-jobs');
    expect(internalAgentTurnJobPath('director', job.jobId)).toBe('/internal/agents/director/turn-jobs/job_123-abc');
    expect(internalAgentTurnJobResultAckPath('director', job.jobId)).toBe('/internal/agents/director/turn-jobs/job_123-abc/result-ack');
    for (const unsafe of ['', '../other', 'a/b', '%2f', '?q=1', '#fragment', 'a b', 'a\\b']) {
      expect(() => internalAgentTurnJobsPath(unsafe)).toThrow();
      for (const helper of [internalAgentTurnJobPath, internalAgentTurnJobResultAckPath]) {
        expect(() => helper(unsafe, job.jobId)).toThrow();
        expect(() => helper('director', unsafe)).toThrow();
      }
      expect(internalAgentTurnJobReadContract.paramsSchema.safeParse({ agentId: 'director', jobId: unsafe }).success).toBe(false);
    }
  });

  it('result ack is keyed by the result digest', () => {
    expect(InternalAgentTurnJobResultAckRequestSchema.parse({ resultDigest: 'digest-1' })).toEqual({ resultDigest: 'digest-1' });
    for (const invalid of [{}, { resultDigest: '' }, { resultDigest: 1 }, { jobId: job.jobId }]) {
      expect(InternalAgentTurnJobResultAckRequestSchema.safeParse(invalid).success).toBe(false);
    }
    expect(InternalAgentTurnJobResultAckResponseSchema.parse({ jobId: job.jobId, acknowledged: true }))
      .toEqual({ jobId: job.jobId, acknowledged: true });
    expect(InternalAgentTurnJobResultAckResponseSchema.safeParse({ jobId: job.jobId, acknowledged: false }).success).toBe(false);
    expect(internalAgentTurnJobResultAckContract.bodySchema).toBe(InternalAgentTurnJobResultAckRequestSchema);
    expect(internalAgentTurnJobResultAckContract.responseSchema).toBe(InternalAgentTurnJobResultAckResponseSchema);
  });

  it('the barrel exports the three contracts', () => {
    expect(http.internalAgentTurnJobSubmitContract).toBe(internalAgentTurnJobSubmitContract);
    expect(http.internalAgentTurnJobReadContract).toBe(internalAgentTurnJobReadContract);
    expect(http.internalAgentTurnJobResultAckContract).toBe(internalAgentTurnJobResultAckContract);
    const contracts = [internalAgentTurnJobSubmitContract, internalAgentTurnJobReadContract, internalAgentTurnJobResultAckContract];
    expect(contracts.map(contract => contract.authType)).toEqual(['secret', 'secret', 'secret']);
    expect(contracts.map(contract => contract.method)).toEqual(['POST', 'GET', 'POST']);
    expect(contracts.map(contract => contract.path)).toEqual([
      '/internal/agents/:agentId/turn-jobs', '/internal/agents/:agentId/turn-jobs/:jobId',
      '/internal/agents/:agentId/turn-jobs/:jobId/result-ack',
    ]);
    expect(internalAgentTurnJobSubmitContract.bodySchema).toBe(InternalAgentTurnJobSubmitRequestSchema);
    expect(internalAgentTurnJobSubmitContract.responseSchema).toBe(InternalAgentTurnJobSubmitResponseSchema);
    expect(internalAgentTurnJobReadContract.responseSchema).toBe(InternalAgentTurnJobReadResponseSchema);
  });
});
