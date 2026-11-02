import { describe, expect, it } from 'vitest';
import {
  INTERNAL_RICERCA_RESULT_PATH,
  InternalRicercaResultErrorSchema,
  InternalRicercaResultRequestSchema,
  InternalRicercaResultResponseSchema,
  internalRicercaResultContract,
  type InternalRicercaResultRequest,
  type InternalRicercaResultResponse,
  type InternalRicercaResultError,
} from '../src/http/endpoints/index.js';

const request: InternalRicercaResultRequest = {
  tenantId: 'tenant-1',
  ownerId: 'owner-1',
  organizationId: 'company-1',
  caller: { managementAgentId: 'lab-a', runtimeAgentId: 'lab-a', vaultAgentId: 3 },
  researchId: 'r-1',
};

const completed: InternalRicercaResultResponse = {
  researchId: 'r-1',
  agentId: 'ricerca-a',
  state: 'completed',
  question: 'Which requirements should the project brief include?',
  findings: [{
    text: 'The brief records the project objectives and expected deliverables.',
    sourceUrls: ['https://example.org/project-brief'],
    origin: 'web',
  }],
  newQuestions: [],
  sources: [{ url: 'https://example.org/project-brief', opened: true }],
  cost: { usd: 0.1, inputTokens: 100, outputTokens: 50, webCalls: 1, uncertain: false },
};

describe('internal ricerca result contract', () => {
  it('accepts a scoped request with complete caller identity', () => {
    expect(InternalRicercaResultRequestSchema.parse(request)).toEqual(request);
  });

  it('rejects an incomplete caller or extra request fields', () => {
    expect(InternalRicercaResultRequestSchema.safeParse({
      ...request,
      caller: { managementAgentId: 'lab-a', runtimeAgentId: 'lab-a' },
    }).success).toBe(false);
    expect(InternalRicercaResultRequestSchema.safeParse({ ...request, extra: true }).success).toBe(false);
    expect(InternalRicercaResultRequestSchema.safeParse({
      ...request, caller: { ...request.caller, extra: true },
    }).success).toBe(false);
  });

  it('rejects missing scope and invalid organization or research ids', () => {
    expect(InternalRicercaResultRequestSchema.safeParse({ ...request, tenantId: undefined }).success).toBe(false);
    expect(InternalRicercaResultRequestSchema.safeParse({ ...request, ownerId: undefined }).success).toBe(false);
    expect(InternalRicercaResultRequestSchema.safeParse({ ...request, tenantId: '' }).success).toBe(false);
    expect(InternalRicercaResultRequestSchema.safeParse({ ...request, ownerId: '' }).success).toBe(false);
    expect(InternalRicercaResultRequestSchema.safeParse({ ...request, organizationId: '' }).success).toBe(false);
    expect(InternalRicercaResultRequestSchema.safeParse({
      ...request, organizationId: 'a'.repeat(65),
    }).success).toBe(false);
    expect(InternalRicercaResultRequestSchema.safeParse({ ...request, researchId: '' }).success).toBe(false);
  });

  it('accepts completed results and rejects running results', () => {
    expect(InternalRicercaResultResponseSchema.parse(completed)).toEqual(completed);
    const running = InternalRicercaResultResponseSchema.safeParse({ ...completed, state: 'running' });
    expect(running.success).toBe(false);
    if (!running.success) {
      expect(running.error.issues).toContainEqual(expect.objectContaining({
        path: ['state'], message: 'only a completed research can be ingested',
      }));
    }
  });

  it.each(['invalid_request', 'unknown_research', 'not_ready', 'scope_foreign'] as const)(
    'accepts the named error %s', error => {
      const response: InternalRicercaResultError = { ok: false, error };
      expect(InternalRicercaResultErrorSchema.parse(response)).toEqual(response);
    },
  );

  it('rejects unrelated errors and malformed error responses', () => {
    expect(InternalRicercaResultErrorSchema.safeParse({ ok: false, error: 'max_usd_above_agent' }).success).toBe(false);
    expect(InternalRicercaResultErrorSchema.safeParse({ ok: true, error: 'not_ready' }).success).toBe(false);
    expect(InternalRicercaResultErrorSchema.safeParse({ ok: false, error: 'not_ready', extra: true }).success).toBe(false);
  });

  it('exports a secret authenticated POST contract with the declared schemas', () => {
    expect(INTERNAL_RICERCA_RESULT_PATH).toBe('/internal/capability/ricerca/result');
    expect(internalRicercaResultContract.method).toBe('POST');
    expect(internalRicercaResultContract.path).toBe(INTERNAL_RICERCA_RESULT_PATH);
    expect(internalRicercaResultContract.authType).toBe('secret');
    expect(internalRicercaResultContract.bodySchema).toBe(InternalRicercaResultRequestSchema);
    expect(internalRicercaResultContract.responseSchema).toBe(InternalRicercaResultResponseSchema);
    expect(internalRicercaResultContract.errorResponseSchema).toBe(InternalRicercaResultErrorSchema);
  });
});
