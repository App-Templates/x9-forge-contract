import { describe, expect, it } from 'vitest';
import {
  CompanyRdEnrollmentErrorCodeSchema,
  CompanyRdEnrollmentErrorResponseSchema,
  CompanyRdEnrollmentRequestSchema,
  CompanyRdEnrollmentResponseSchema,
  INTERNAL_COMPANY_RD_ENROLLMENT_PATH,
  internalCompanyRdEnrollmentContract,
} from '../src/http/endpoints/index.js';

const identity = (n: number) => ({
  managementAgentId: `company-1-agent-${n}`,
  runtimeAgentId: `runtime-agent-${n}`,
  vaultAgentId: n,
});

const request = {
  tenantId: 'tenant-1',
  ownerId: 'owner-1',
  companyId: 'company-1',
  requestId: 'enroll-rd-1',
  agents: [
    { part: 'lab', agentIdentity: identity(1) },
    { part: 'ricerca', agentIdentity: identity(2) },
  ],
};

const ID_A = '11111111-1111-4111-8111-111111111111';
const ID_B = '22222222-2222-4222-8222-222222222222';
const ID_C = '33333333-3333-4333-8333-333333333333';

const seat = (part: string, paperclipAgentId: string, status: string) => ({ part, paperclipAgentId, status });

const response = {
  state: 'enrolled',
  seats: [seat('lab', ID_A, 'enrolled'), seat('ricerca', ID_B, 'enrolled')],
};

describe('internalCompanyRdEnrollmentContract', () => {
  it('publishes the POST path with secret authentication and the shared schemas', () => {
    expect(INTERNAL_COMPANY_RD_ENROLLMENT_PATH).toBe('/internal/paperclip/rd-enrollment');
    expect(internalCompanyRdEnrollmentContract.method).toBe('POST');
    expect(internalCompanyRdEnrollmentContract.path).toBe('/internal/paperclip/rd-enrollment');
    expect(internalCompanyRdEnrollmentContract.authType).toBe('secret');
    expect(internalCompanyRdEnrollmentContract.bodySchema).toBe(CompanyRdEnrollmentRequestSchema);
    expect(internalCompanyRdEnrollmentContract.responseSchema).toBe(CompanyRdEnrollmentResponseSchema);
    expect(internalCompanyRdEnrollmentContract.errorSchema).toBe(CompanyRdEnrollmentErrorResponseSchema);
  });

  it('accepts a request with one lab and one ricerca', () => {
    expect(CompanyRdEnrollmentRequestSchema.safeParse(request).success).toBe(true);
  });

  it('accepts an in_corso response with a key_pending seat', () => {
    const pending = {
      state: 'in_corso',
      seats: [seat('lab', ID_A, 'key_pending'), seat('ricerca', ID_B, 'enrolled')],
    };
    expect(CompanyRdEnrollmentResponseSchema.safeParse(pending).success).toBe(true);
  });

  it('accepts an enrolled response with two enrolled seats', () => {
    expect(CompanyRdEnrollmentResponseSchema.safeParse(response).success).toBe(true);
  });

  it('accepts an in_corso response for a queued request with no seat yet', () => {
    expect(CompanyRdEnrollmentResponseSchema.safeParse({ state: 'in_corso', seats: [] }).success).toBe(true);
  });

  it('accepts an in_corso response with the lab and ricerca seats both key_pending', () => {
    const pending = {
      state: 'in_corso',
      seats: [seat('lab', ID_A, 'key_pending'), seat('ricerca', ID_B, 'key_pending')],
    };
    expect(CompanyRdEnrollmentResponseSchema.safeParse(pending).success).toBe(true);
  });

  it.each(CompanyRdEnrollmentErrorCodeSchema.options)('accepts the error code %s', (error) => {
    expect(CompanyRdEnrollmentErrorResponseSchema.safeParse({ error }).success).toBe(true);
  });

  const { agentIdentity: _unused, ...agentWithoutIdentity } = request.agents[0]!;
  const { runtimeAgentId: _runtime, ...identityWithoutRuntime } = identity(1);

  it.each([
    ['two lab', { ...request, agents: [request.agents[0], { part: 'lab', agentIdentity: identity(2) }] }],
    ['a single agent', { ...request, agents: request.agents.slice(0, 1) }],
    ['three agents', { ...request, agents: [...request.agents, { part: 'lab', agentIdentity: identity(3) }] }],
    [
      'identity without runtimeAgentId',
      { ...request, agents: [{ part: 'lab', agentIdentity: identityWithoutRuntime }, request.agents[1]] },
    ],
    [
      'vaultAgentId 0',
      { ...request, agents: [{ part: 'lab', agentIdentity: { ...identity(1), vaultAgentId: 0 } }, request.agents[1]] },
    ],
    ['agent without identity', { ...request, agents: [agentWithoutIdentity, request.agents[1]] }],
    ['an extra root field', { ...request, extra: 1 }],
    [
      'an extra agent field',
      { ...request, agents: [{ ...request.agents[0], extra: 1 }, request.agents[1]] },
    ],
  ])('rejects a request with %s', (_name, body) => {
    expect(CompanyRdEnrollmentRequestSchema.safeParse(body).success).toBe(false);
  });

  it.each(['tenantId', 'ownerId', 'companyId', 'requestId', 'agents'] as const)(
    'rejects a request without %s',
    (field) => {
      const { [field]: _removed, ...rest } = request;
      expect(CompanyRdEnrollmentRequestSchema.safeParse(rest).success).toBe(false);
    },
  );

  it.each([
    ['two lab', { ...response, seats: [seat('lab', ID_A, 'enrolled'), seat('lab', ID_B, 'enrolled')] }],
    ['equal paperclipAgentId', { ...response, seats: [seat('lab', ID_A, 'enrolled'), seat('ricerca', ID_A, 'enrolled')] }],
    [
      'enrolled with a key_pending seat',
      { state: 'enrolled', seats: [seat('lab', ID_A, 'key_pending'), seat('ricerca', ID_B, 'enrolled')] },
    ],
    ['a non-uuid paperclipAgentId', { ...response, seats: [seat('lab', 'not-a-uuid', 'enrolled'), seat('ricerca', ID_B, 'enrolled')] }],
    ['an unknown status', { ...response, seats: [seat('lab', ID_A, 'unknown'), seat('ricerca', ID_B, 'enrolled')] }],
    ['an extra field', { ...response, extra: 1 }],
    ['in_corso with a single seat', { state: 'in_corso', seats: [seat('lab', ID_A, 'key_pending')] }],
    ['enrolled with no seat', { state: 'enrolled', seats: [] }],
    ['enrolled with a single enrolled seat', { state: 'enrolled', seats: [seat('lab', ID_A, 'enrolled')] }],
    [
      'in_corso with three seats',
      {
        state: 'in_corso',
        seats: [seat('lab', ID_A, 'key_pending'), seat('ricerca', ID_B, 'key_pending'), seat('lab', ID_C, 'key_pending')],
      },
    ],
    [
      'in_corso with two lab seats',
      { state: 'in_corso', seats: [seat('lab', ID_A, 'key_pending'), seat('lab', ID_B, 'key_pending')] },
    ],
    [
      'in_corso with equal paperclipAgentId',
      { state: 'in_corso', seats: [seat('lab', ID_A, 'key_pending'), seat('ricerca', ID_A, 'key_pending')] },
    ],
  ])('rejects a response with %s', (_name, body) => {
    expect(CompanyRdEnrollmentResponseSchema.safeParse(body).success).toBe(false);
  });

  it.each([
    [
      'in_corso with a single seat',
      { state: 'in_corso', seats: [seat('lab', ID_A, 'key_pending')] },
      { path: ['seats'], message: 'Seats must be none or one per R&D part' },
    ],
    [
      'enrolled with no seat',
      { state: 'enrolled', seats: [] },
      { path: ['state'], message: 'Enrolled state requires one seat per R&D part' },
    ],
  ])('reports the reason of the rejection of a response with %s', (_name, body, expected) => {
    const result = CompanyRdEnrollmentResponseSchema.safeParse(body);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.map(({ path, message }) => ({ path, message }))).toEqual([expected]);
  });

  it.each([
    ['an unknown code', { error: 'other' }],
    ['an extra field', { error: 'seat_failed', detail: 'x' }],
  ])('rejects an error response with %s', (_name, body) => {
    expect(CompanyRdEnrollmentErrorResponseSchema.safeParse(body).success).toBe(false);
  });
});
