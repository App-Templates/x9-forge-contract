import { describe, expect, it } from 'vitest';
import {
  ToolCallRequestSchema,
  ToolCallResponseSchema,
  ToolCallSuccessResponseSchema,
  ToolCallErrorResponseSchema,
} from '../../src/capability/tool-call.js';
import { capToolCallContract } from '../../src/http/endpoints/cap-tool-call.js';

// Legacy payloads from tool-call.test.ts, without organization or receipt.
const request = {
  callId: 'call-abc123',
  tool: 'memory_recall',
  input: { query: 'last week meeting notes' },
  agentId: 'agent-master',
  sessionId: 'session-xyz',
};
const success = {
  callId: request.callId,
  status: 'success',
  output: { memories: ['Team standup at 10am'] },
};
const error = {
  callId: request.callId,
  status: 'error',
  error: 'Tool not found: unknown_tool',
  code: 'TOOL_NOT_FOUND',
};
const organization = {
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
  tenantId: 'tenant-1',
};
const receipt = {
  runId: 'run-1',
  attemptId: 'att-1',
  callId: request.callId,
  status: 'uncertain',
  consumption: [{ unit: 'tokens', quantity: 0, state: 'unknown', estimated: true }],
  evidence: [],
  recordedAt: '2026-10-14T10:02:00.000Z',
};

describe('organization tool call transport', () => {
  it('keeps legacy requests without organization unchanged', () => {
    expect(ToolCallRequestSchema.parse(request)).toEqual(request);
    expect(capToolCallContract.bodySchema.parse(request)).toEqual(request);
  });

  it('keeps an admitted organization context', () => {
    const payload = { ...request, organization };
    expect(ToolCallRequestSchema.parse(payload)).toEqual(payload);
    expect(capToolCallContract.bodySchema.parse(payload)).toEqual(payload);
  });

  it('rejects an attempt belonging to another run', () => {
    expect(ToolCallRequestSchema.safeParse({
      ...request,
      organization: {
        ...organization,
        attempt: { ...organization.attempt, runId: 'run-2' },
      },
    }).success).toBe(false);
  });

  it('keeps the uncertain receipt on the error variant', () => {
    const payload = { ...error, code: 'TOOL_EXEC_FAILED', error: 'Outcome uncertain', receipt };
    expect(ToolCallErrorResponseSchema.parse(payload)).toEqual(payload);
    expect(ToolCallResponseSchema.parse(payload)).toEqual(payload);
    expect(capToolCallContract.responseSchema.parse(payload)).toEqual(payload);
  });

  it('keeps the receipt on the success variant', () => {
    const payload = { ...success, receipt: { ...receipt, status: 'succeeded', consumption: [] } };
    expect(ToolCallSuccessResponseSchema.parse(payload)).toEqual(payload);
    expect(ToolCallResponseSchema.parse(payload)).toEqual(payload);
  });

  it('rejects unknown consumption without an estimate on both variants', () => {
    const invalidReceipt = {
      ...receipt,
      consumption: [{ unit: 'tokens', quantity: 0, state: 'unknown', estimated: false }],
    };
    for (const response of [success, error]) {
      expect(ToolCallResponseSchema.safeParse({ ...response, receipt: invalidReceipt }).success).toBe(false);
    }
  });

  it('keeps legacy success and error responses unchanged', () => {
    for (const response of [success, error]) {
      expect(ToolCallResponseSchema.parse(response)).toEqual(response);
      expect(capToolCallContract.responseSchema.parse(response)).toEqual(response);
    }
  });
});
