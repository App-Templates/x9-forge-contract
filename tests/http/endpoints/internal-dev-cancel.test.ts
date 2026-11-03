import { describe, expect, it } from 'vitest';
import * as http from '../../../src/http/index.js';
import { CapabilityAgentScopeSchema } from '../../../src/capability/capability-call-context.js';
import { DevProductionJobSchema } from '../../../src/capability/dev/production-job.js';
import { CapabilityAgentParamsSchema } from '../../../src/http/endpoints/internal-capability-agent.js';

const contract = http.cancelDevProductionJobContract;
const requestSchema = http.DevProductionCancelRequestSchema;
const receiptSchema = http.DevProductionCancelReceiptSchema;
const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const params = { agentId: scope.agentId, jobId: 'job-1' };
const request = { scope, requestId: 'request_12345678', reason: 'Stop this development' };
const receipt = { jobId: params.jobId, requestId: request.requestId,
  status: 'stop_requested', requestedAt: '2026-10-16T01:02:03Z' };
const requestValid = (raw: unknown) => requestSchema.safeParse(raw).success;
const receiptValid = (raw: unknown) => receiptSchema.safeParse(raw).success;

describe('internal dev cancel', () => {
  it('exports exact metadata and request receipt identities', () => {
    expect(contract.method === 'POST').toBe(true);
    expect(contract.path === '/internal/capability/agents/:agentId/dev/jobs/:jobId/cancel').toBe(true);
    expect(contract.authType === 'secret').toBe(true);
    expect(contract.bodySchema === requestSchema).toBe(true);
    expect(contract.responseSchema === receiptSchema).toBe(true);
  });
  it('reuses canonical scope and identity schemas', () => {
    expect(requestSchema.shape.scope === CapabilityAgentScopeSchema).toBe(true);
    expect(requestSchema.shape.requestId === DevProductionJobSchema.shape.requestId).toBe(true);
    expect(receiptSchema.shape.requestId === DevProductionJobSchema.shape.requestId).toBe(true);
    expect(receiptSchema.shape.jobId === DevProductionJobSchema.shape.jobId).toBe(true);
    expect(contract.paramsSchema.shape.agentId === CapabilityAgentParamsSchema.shape.agentId).toBe(true);
    expect(contract.paramsSchema.shape.jobId === DevProductionJobSchema.shape.jobId).toBe(true);
  });
  // Shape validation is not evidence of service-side ownership authorization.
  it('accepts distinct requests for two owners and agents', () => {
    const secondScope = { tenantId: 'tenant-2', ownerId: 'owner-2', agentId: 'agent-2' };
    for (const raw of [request, { scope: secondScope, requestId: 'request_87654321', reason: 'Stop my job' }]) {
      expect(requestValid(raw)).toBe(true);
      expect(requestSchema.parse(raw).scope).toEqual(raw.scope);
      expect(contract.paramsSchema.safeParse({ agentId: raw.scope.agentId, jobId: 'job-2' }).success).toBe(true);
    }
  });
  it('accepts a stop request receipt without a terminal result', () => {
    expect(receiptValid(receipt)).toBe(true);
    expect(receiptSchema.parse(receipt)).toEqual(receipt);
  });
  it('accepts reason length boundaries after trimming', () => {
    expect(requestValid({ ...request, reason: 'x' })).toBe(true);
    expect(requestValid({ ...request, reason: 'x'.repeat(500) })).toBe(true);
    expect(requestValid({ ...request, reason: `  ${'x'.repeat(500)}  ` })).toBe(true);
    expect(requestSchema.parse({ ...request, reason: '  stop  ' }).reason === 'stop').toBe(true);
  });
  it('rejects extra parameters', () => {
    expect(contract.paramsSchema.safeParse({ ...params, runId: 'native-run' }).success).toBe(false);
  });
  it('rejects missing or empty parameters', () => {
    for (const raw of [{ agentId: params.agentId }, { jobId: params.jobId },
      { ...params, agentId: '' }, { ...params, jobId: '' }]) {
      expect(contract.paramsSchema.safeParse(raw).success).toBe(false);
    }
  });
  it('rejects commands tokens and permits in requests', () => {
    for (const field of ['command', 'token', 'permit', 'runId']) {
      expect(requestValid({ ...request, [field]: 'unexpected' })).toBe(false);
    }
  });
  it('rejects missing or incomplete scope', () => {
    expect(requestValid({ requestId: request.requestId, reason: request.reason })).toBe(false);
    for (const key of Object.keys(scope)) {
      expect(requestValid({ ...request, scope: Object.fromEntries(Object.entries(scope).filter(([field]) => field !== key)) })).toBe(false);
      expect(requestValid({ ...request, scope: { ...scope, [key]: '' } })).toBe(false);
    }
  });
  it('rejects extra scope identity fields', () => {
    expect(requestValid({ ...request, scope: { ...scope, userId: 'user-1' } })).toBe(false);
  });
  it('rejects missing request id in requests', () => {
    expect(requestValid({ scope, reason: request.reason })).toBe(false);
  });
  it('rejects invalid request ids', () => {
    for (const requestId of ['', 'short', 'x'.repeat(65), 'invalid request id']) {
      expect(requestValid({ ...request, requestId })).toBe(false);
      expect(receiptValid({ ...receipt, requestId })).toBe(false);
    }
  });
  it('rejects empty reasons', () => {
    expect(requestValid({ ...request, reason: '' })).toBe(false);
    expect(requestValid({ ...request, reason: '   ' })).toBe(false);
    expect(requestValid({ scope, requestId: request.requestId })).toBe(false);
  });
  it('rejects overlong reasons', () => {
    expect(requestValid({ ...request, reason: 'x'.repeat(501) })).toBe(false);
  });
  it('rejects extra receipt fields including terminal effects', () => {
    for (const field of ['artifacts', 'completedAt', 'result', 'command', 'token']) {
      expect(receiptValid({ ...receipt, [field]: 'unexpected' })).toBe(false);
    }
  });
  it('rejects cancelled and succeeded receipts', () => {
    for (const status of ['cancelled', 'succeeded', 'running', 'queued', '']) {
      expect(receiptValid({ ...receipt, status })).toBe(false);
    }
  });
  it('rejects missing receipt identities', () => {
    expect(receiptValid({ jobId: receipt.jobId, status: receipt.status, requestedAt: receipt.requestedAt })).toBe(false);
    expect(receiptValid({ requestId: receipt.requestId, status: receipt.status, requestedAt: receipt.requestedAt })).toBe(false);
    expect(receiptValid({ ...receipt, jobId: '' })).toBe(false);
  });
  it('rejects missing receipt status', () => {
    expect(receiptValid({ jobId: receipt.jobId, requestId: receipt.requestId, requestedAt: receipt.requestedAt })).toBe(false);
  });
  it('rejects missing or invalid request timestamps', () => {
    expect(receiptValid({ jobId: receipt.jobId, requestId: receipt.requestId, status: receipt.status })).toBe(false);
    for (const requestedAt of ['', 'yesterday', '2026-10-16', '2026-02-30T01:02:03Z']) {
      expect(receiptValid({ ...receipt, requestedAt })).toBe(false);
    }
  });
});
