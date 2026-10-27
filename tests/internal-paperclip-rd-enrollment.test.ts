import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { INTERNAL_SECRET_HEADER } from '../src/auth/index.js';
import { ParticipantAgentIdentitySchema } from '../src/organization/participant-binding.js';
import {
  COMPANY_RD_ENROLLMENT_ERRORS,
  COMPANY_RD_PARTS,
  CompanyRdBirthRequestSchema,
  CompanyRdBirthResultSchema,
  CompanyRdEnrollmentAgentSchema,
  CompanyRdEnrollmentErrorResponseSchema,
  CompanyRdEnrollmentErrorSchema,
  CompanyRdEnrollmentRequestSchema,
  CompanyRdEnrollmentResponseSchema,
  CompanyRdEnrollmentSeatSchema,
  CompanyRdEnrollmentSeatStatusSchema,
  CompanyRdEnrollmentStateSchema,
  CompanyRdPartSchema,
  INTERNAL_PAPERCLIP_RD_ENROLLMENT_PATH,
  InternalPaperclipSeatSchema,
  internalCompanyRdEnrollmentContract,
} from '../src/http/index.js';

const identity = (n: number) => ({
  managementAgentId: `company-1-agent-${n}`,
  runtimeAgentId: `runtime-agent-${n}`,
  vaultAgentId: n,
});

// The identities come from the real birth result of the company R&D (Forge), as the caller will send them.
const birth = CompanyRdBirthResultSchema.parse({
  ok: true,
  replayed: false,
  tenantId: 'tenant-1',
  companyId: 'company-1',
  agents: [
    { part: 'ricerca', agentIdentity: identity(1) },
    { part: 'lab', agentIdentity: identity(2) },
  ],
});

const request = {
  tenantId: birth.tenantId,
  ownerId: 'owner-1',
  companyId: birth.companyId,
  requestId: 'birth-rd-1',
  agents: birth.agents,
};

const LAB_SEAT = '11111111-1111-4111-8111-111111111111';
const RICERCA_SEAT = '22222222-2222-4222-8222-222222222222';
const labSeat = (status: string, paperclipAgentId = LAB_SEAT) => ({ part: 'lab', paperclipAgentId, status });
const ricercaSeat = (status: string, paperclipAgentId = RICERCA_SEAT) => ({
  part: 'ricerca',
  paperclipAgentId,
  status,
});

const enrolled = { state: 'enrolled', seats: [labSeat('enrolled'), ricercaSeat('enrolled')] };

const accepts = (schema: { safeParse(value: unknown): { success: boolean } }, value: unknown) =>
  schema.safeParse(value).success;

describe('internalCompanyRdEnrollmentContract', () => {
  it('publishes the POST path with the internal secret and the shared schemas', () => {
    expect(INTERNAL_PAPERCLIP_RD_ENROLLMENT_PATH).toBe('/internal/paperclip/rd-enrollment');
    expect(internalCompanyRdEnrollmentContract.method).toBe('POST');
    expect(internalCompanyRdEnrollmentContract.path).toBe('/internal/paperclip/rd-enrollment');
    expect(internalCompanyRdEnrollmentContract.authType).toBe('secret');
    expect(internalCompanyRdEnrollmentContract.authHeader).toBe(INTERNAL_SECRET_HEADER);
    expect(internalCompanyRdEnrollmentContract.bodySchema).toBe(CompanyRdEnrollmentRequestSchema);
    expect(internalCompanyRdEnrollmentContract.responseSchema).toBe(CompanyRdEnrollmentResponseSchema);
    expect(internalCompanyRdEnrollmentContract.errorResponseSchema).toBe(CompanyRdEnrollmentErrorResponseSchema);
  });

  it('reuses the schemas of the identity, the R&D parts and the seat status instead of copying them', () => {
    expect(CompanyRdEnrollmentAgentSchema.shape.agentIdentity).toBe(ParticipantAgentIdentitySchema);
    expect(CompanyRdEnrollmentAgentSchema.shape.part).toBe(CompanyRdPartSchema);
    expect(CompanyRdEnrollmentSeatSchema.shape.part).toBe(CompanyRdPartSchema);
    expect(CompanyRdEnrollmentSeatSchema.shape.paperclipAgentId).toBe(InternalPaperclipSeatSchema.shape.paperclipAgentId);
    expect(CompanyRdEnrollmentSeatStatusSchema).toBe(InternalPaperclipSeatSchema.shape.enrollment.shape.state);
    expect(CompanyRdEnrollmentSeatStatusSchema.options).toEqual(['key_pending', 'enrolled']);
    expect(CompanyRdEnrollmentRequestSchema.shape.tenantId).toBe(CompanyRdBirthRequestSchema.shape.tenantId);
    expect(CompanyRdEnrollmentRequestSchema.shape.ownerId).toBe(CompanyRdBirthRequestSchema.shape.ownerId);
    expect(CompanyRdEnrollmentRequestSchema.shape.requestId).toBe(CompanyRdBirthRequestSchema.shape.requestId);
    expect(CompanyRdEnrollmentRequestSchema.shape.companyId).toBe(
      CompanyRdBirthRequestSchema.shape.company.shape.companyId,
    );
  });
});

describe('company R&D enrolment request', () => {
  it('accepts the request built from the real birth result, in either order', () => {
    expect(CompanyRdEnrollmentRequestSchema.parse(request)).toEqual(request);
    expect(accepts(CompanyRdEnrollmentRequestSchema, { ...request, agents: [...request.agents].reverse() })).toBe(true);
    expect(request.agents.map((agent) => agent.part).sort()).toEqual([...COMPANY_RD_PARTS].sort());
  });

  it.each([
    ['two lab', [{ part: 'lab', agentIdentity: identity(1) }, { part: 'lab', agentIdentity: identity(2) }]],
    ['two ricerca', [{ part: 'ricerca', agentIdentity: identity(1) }, { part: 'ricerca', agentIdentity: identity(2) }]],
    ['no agents', []],
    ['only lab', [{ part: 'lab', agentIdentity: identity(2) }]],
    ['only ricerca', [{ part: 'ricerca', agentIdentity: identity(1) }]],
    ['a third agent', [...request.agents, { part: 'lab', agentIdentity: identity(3) }]],
    ['an unknown part', [request.agents[0], { part: 'director', agentIdentity: identity(3) }]],
  ])('rejects %s', (_name, agents) => {
    expect(accepts(CompanyRdEnrollmentRequestSchema, { ...request, agents })).toBe(false);
  });

  it('rejects agents that are not a list or that miss the part', () => {
    expect(accepts(CompanyRdEnrollmentRequestSchema, { ...request, agents: request.agents[0] })).toBe(false);
    expect(
      accepts(CompanyRdEnrollmentRequestSchema, {
        ...request,
        agents: [{ agentIdentity: identity(1) }, request.agents[1]],
      }),
    ).toBe(false);
  });

  it.each([
    ['managementAgentId', (id: ReturnType<typeof identity>) => ({ ...id, managementAgentId: undefined })],
    ['runtimeAgentId', (id: ReturnType<typeof identity>) => ({ ...id, runtimeAgentId: undefined })],
    ['vaultAgentId', (id: ReturnType<typeof identity>) => ({ ...id, vaultAgentId: undefined })],
    ['an empty managementAgentId', (id: ReturnType<typeof identity>) => ({ ...id, managementAgentId: '' })],
    ['an empty runtimeAgentId', (id: ReturnType<typeof identity>) => ({ ...id, runtimeAgentId: '' })],
    ['a zero vaultAgentId', (id: ReturnType<typeof identity>) => ({ ...id, vaultAgentId: 0 })],
    ['a fractional vaultAgentId', (id: ReturnType<typeof identity>) => ({ ...id, vaultAgentId: 1.5 })],
    ['a text vaultAgentId', (id: ReturnType<typeof identity>) => ({ ...id, vaultAgentId: '2' })],
    ['an extra identity field', (id: ReturnType<typeof identity>) => ({ ...id, tenantId: 'tenant-1' })],
  ])('rejects an incomplete or invalid identity: %s', (_name, change) => {
    const agents = [request.agents[0], { part: 'lab', agentIdentity: change(identity(2)) }];
    expect(accepts(CompanyRdEnrollmentRequestSchema, { ...request, agents })).toBe(false);
  });

  it('rejects a whole identity that is missing', () => {
    expect(accepts(CompanyRdEnrollmentRequestSchema, { ...request, agents: [request.agents[0], { part: 'lab' }] })).toBe(
      false,
    );
  });

  it('rejects extra fields at the request and at the agent', () => {
    expect(accepts(CompanyRdEnrollmentRequestSchema, { ...request, extra: 1 })).toBe(false);
    expect(accepts(CompanyRdEnrollmentRequestSchema, { ...request, company: { companyId: 'company-1' } })).toBe(false);
    expect(
      accepts(CompanyRdEnrollmentRequestSchema, {
        ...request,
        agents: [{ ...request.agents[0], paperclipAgentId: LAB_SEAT }, request.agents[1]],
      }),
    ).toBe(false);
  });

  it.each(['tenantId', 'ownerId', 'companyId', 'requestId', 'agents'])('rejects a request without %s', (field) => {
    const { [field]: _removed, ...incomplete } = request as Record<string, unknown>;
    expect(accepts(CompanyRdEnrollmentRequestSchema, incomplete)).toBe(false);
  });

  it.each([
    ['tenantId', ''],
    ['ownerId', ''],
    ['companyId', ''],
    ['companyId', 'c'.repeat(65)],
    ['requestId', ''],
    ['requestId', 'r'.repeat(129)],
  ])('rejects an invalid %s (%s)', (field, value) => {
    expect(accepts(CompanyRdEnrollmentRequestSchema, { ...request, [field]: value })).toBe(false);
  });
});

describe('company R&D enrolment response', () => {
  it('accepts enrolled with both seats enrolled, whatever the order of the seats', () => {
    expect(CompanyRdEnrollmentResponseSchema.parse(enrolled)).toEqual(enrolled);
    expect(accepts(CompanyRdEnrollmentResponseSchema, { ...enrolled, seats: [...enrolled.seats].reverse() })).toBe(true);
  });

  it.each([
    ['one seat key_pending', [labSeat('enrolled'), ricercaSeat('key_pending')]],
    ['the other seat key_pending', [labSeat('key_pending'), ricercaSeat('enrolled')]],
    ['both seats key_pending', [labSeat('key_pending'), ricercaSeat('key_pending')]],
    ['both seats enrolled but the enrolment still going on', [labSeat('enrolled'), ricercaSeat('enrolled')]],
  ])('accepts in_corso with %s', (_name, seats) => {
    expect(accepts(CompanyRdEnrollmentResponseSchema, { state: 'in_corso', seats })).toBe(true);
  });

  it.each([
    ['one seat key_pending', [labSeat('enrolled'), ricercaSeat('key_pending')]],
    ['the other seat key_pending', [labSeat('key_pending'), ricercaSeat('enrolled')]],
    ['both seats key_pending', [labSeat('key_pending'), ricercaSeat('key_pending')]],
  ])('rejects enrolled with %s', (_name, seats) => {
    expect(accepts(CompanyRdEnrollmentResponseSchema, { state: 'enrolled', seats })).toBe(false);
  });

  it.each([
    ['two lab seats', [labSeat('enrolled'), labSeat('enrolled', RICERCA_SEAT)]],
    ['two ricerca seats', [ricercaSeat('enrolled', LAB_SEAT), ricercaSeat('enrolled')]],
    ['no seats', []],
    ['only the lab seat', [labSeat('enrolled')]],
    ['only the ricerca seat', [ricercaSeat('enrolled')]],
    ['a third seat', [...enrolled.seats, { ...labSeat('enrolled'), paperclipAgentId: '33333333-3333-4333-8333-333333333333' }]],
    ['an unknown part', [labSeat('enrolled'), { part: 'director', paperclipAgentId: RICERCA_SEAT, status: 'enrolled' }]],
  ])('rejects %s', (_name, seats) => {
    expect(accepts(CompanyRdEnrollmentResponseSchema, { state: 'in_corso', seats })).toBe(false);
  });

  it('rejects seats that share the same Paperclip agent, in either state', () => {
    const seats = [labSeat('enrolled'), ricercaSeat('enrolled', LAB_SEAT)];
    expect(accepts(CompanyRdEnrollmentResponseSchema, { state: 'enrolled', seats })).toBe(false);
    expect(accepts(CompanyRdEnrollmentResponseSchema, { state: 'in_corso', seats })).toBe(false);
  });

  it('rejects extra fields, among them any key or token, at the response and at the seat', () => {
    for (const field of ['key', 'token', 'reason', 'ok']) {
      const extra = { [field]: 'unexpected-field' };
      expect(accepts(CompanyRdEnrollmentResponseSchema, { ...enrolled, ...extra })).toBe(false);
      expect(
        accepts(CompanyRdEnrollmentResponseSchema, {
          ...enrolled,
          seats: [{ ...labSeat('enrolled'), ...extra }, ricercaSeat('enrolled')],
        }),
      ).toBe(false);
    }
  });

  it.each([
    ['an unknown state', { ...enrolled, state: 'ready' }],
    ['a state with another case', { ...enrolled, state: 'Enrolled' }],
    ['a missing state', { seats: enrolled.seats }],
    ['missing seats', { state: 'in_corso' }],
    ['an unknown seat status', { state: 'in_corso', seats: [labSeat('pending'), ricercaSeat('enrolled')] }],
    ['a seat without status', { state: 'in_corso', seats: [{ part: 'lab', paperclipAgentId: LAB_SEAT }, ricercaSeat('enrolled')] }],
    ['a seat without part', { state: 'in_corso', seats: [{ paperclipAgentId: LAB_SEAT, status: 'enrolled' }, ricercaSeat('enrolled')] }],
    ['a seat without Paperclip agent', { state: 'in_corso', seats: [{ part: 'lab', status: 'enrolled' }, ricercaSeat('enrolled')] }],
    ['a Paperclip agent that is not a UUID', { state: 'in_corso', seats: [labSeat('enrolled', 'lab-seat'), ricercaSeat('enrolled')] }],
  ])('rejects %s', (_name, payload) => {
    expect(accepts(CompanyRdEnrollmentResponseSchema, payload)).toBe(false);
  });

  it('names the states and the seat statuses exactly', () => {
    expect(CompanyRdEnrollmentStateSchema.options).toEqual(['enrolled', 'in_corso']);
    expect(accepts(CompanyRdEnrollmentResponseSchema, { state: 'in_corso', seats: [labSeat('key_pending'), ricercaSeat('enrolled')] })).toBe(
      true,
    );
  });
});

describe('company R&D enrolment error', () => {
  it('lists the six errors in the contract', () => {
    expect(COMPANY_RD_ENROLLMENT_ERRORS).toEqual([
      'director_unknown',
      'person_unknown',
      'identity_mismatch',
      'request_conflict',
      'seat_failed',
      'binding_write',
    ]);
    expect(CompanyRdEnrollmentErrorSchema.options).toEqual([...COMPANY_RD_ENROLLMENT_ERRORS]);
  });

  it.each(COMPANY_RD_ENROLLMENT_ERRORS)('accepts the error %s', (error) => {
    expect(CompanyRdEnrollmentErrorResponseSchema.parse({ error })).toEqual({ error });
  });

  it.each([
    ['an unknown code', { error: 'boom' }],
    ['the code of another contract', { error: 'unknown_participant' }],
    ['a code with another case', { error: 'Seat_Failed' }],
    ['no code', {}],
    ['an extra reason', { error: 'seat_failed', reason: 'x' }],
    ['an extra ok flag', { error: 'seat_failed', ok: false }],
    ['a list of codes', { error: ['seat_failed'] }],
  ])('rejects %s', (_name, payload) => {
    expect(accepts(CompanyRdEnrollmentErrorResponseSchema, payload)).toBe(false);
  });

  it('keeps the success body and the error body apart', () => {
    expect(accepts(CompanyRdEnrollmentErrorResponseSchema, enrolled)).toBe(false);
    expect(accepts(CompanyRdEnrollmentResponseSchema, { error: 'seat_failed' })).toBe(false);
  });
});

describe('company R&D enrolment contract in the built package', () => {
  it('exports the contract from the built CommonJS indexes', () => {
    const require = createRequire(import.meta.url);
    for (const entry of ['../dist/http/endpoints/index.cjs', '../dist/http/index.cjs']) {
      const built: { internalCompanyRdEnrollmentContract?: typeof internalCompanyRdEnrollmentContract } = require(entry);
      const contract = built.internalCompanyRdEnrollmentContract;
      expect(contract?.method).toBe('POST');
      expect(contract?.path).toBe(INTERNAL_PAPERCLIP_RD_ENROLLMENT_PATH);
      expect(contract?.authType).toBe('secret');
      expect(contract?.authHeader).toBe(INTERNAL_SECRET_HEADER);
      expect(contract?.bodySchema.safeParse(request).success).toBe(true);
      expect(contract?.responseSchema.safeParse(enrolled).success).toBe(true);
      expect(contract?.errorResponseSchema.safeParse({ error: 'person_unknown' }).success).toBe(true);
      expect(
        contract?.responseSchema.safeParse({ ...enrolled, seats: [labSeat('enrolled'), ricercaSeat('key_pending')] })
          .success,
      ).toBe(false);
      expect(
        contract?.responseSchema.safeParse({
          state: 'in_corso',
          seats: [labSeat('enrolled'), ricercaSeat('key_pending')],
        }).success,
      ).toBe(true);
      expect(contract?.bodySchema.safeParse({ ...request, agents: [request.agents[1], request.agents[1]] }).success).toBe(
        false,
      );
    }
  });
});
