import { expect, it } from 'vitest';
import * as c from '../../src/capability/index.js';
import * as h from '../../src/http/index.js';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/index.js';
const at = (seconds: number) => new Date(Date.UTC(2026, 9, 11) + seconds * 1000).toISOString();
const now = new Date(at(12));
function fixture(operation = 'read', kind = 'admission', withOpening = false) {
  const agent = { tenantId: 'synthetic-tenant', ownerId: 'synthetic-owner', agentId: 'synthetic-agent' };
  const person = { ...agent, userId: 'synthetic-person' };
  const program = { scope: agent, programId: 'synthetic-program', programVersion: 1,
    strategy: { strategyId: 'synthetic-strategy', strategyVersion: 'one' }, catalogRevision: 'one',
    policyRevision: 'one', progressionRevision: 'one', measureDefinitionRevision: 'one' };
  const opening = withOpening ? { openingId: 'synthetic-opening', sessionId: 'synthetic-session', scope: person,
    program, appliedConfigVersion: 1, openedAt: at(2) } : null;
  const scope = operation === 'program' ? agent : person;
  const proofRef = { kind, proofId: 'synthetic-proof' };
  const proof = { proofRef, scope, program, opening, issuedAt: at(3), expiresAt: at(100), status: 'active' };
  const request = { requestId: 'synthetic-request', scope, program, opening, operation, phase: 'before', proofRef };
  const result = { ok: true, request, proof, observedAt: at(10), expiresAt: at(70) };
  return { agent, person, program, opening, proofRef, proof, request, result };
}
const current = (f: ReturnType<typeof fixture>) => c.isCoachOperationalAuthorityCurrent(f.request, f.result, f.proof, now);
it.each([
  ['program', 'admission', false], ['opening', 'admission', false], ['read', 'admission', false],
  ['read', 'admission', true], ['read', 'session', true], ['start', 'admission', true],
  ['conversation', 'admission', true], ['start', 'session', true], ['conversation', 'session', true],
  ['usage', 'session', true], ['event', 'session', true], ['end-guide', 'session', true], ['close', 'session', true],
])('admits correlated %s with %s proof, opening=%s', (operation, kind, opening) => {
  const f = fixture(operation as string, kind as string, opening as boolean);
  expect(c.CoachOperationalAuthorityRequestSchema.safeParse(f.request).success).toBe(true);
  expect(c.CoachOperationalAuthorityResultSchema.safeParse(f.result).success).toBe(true);
  expect(current(f)).toBe(true);
});
it('separates agent program access from person access', () => {
  const program = fixture('program');
  expect(current(program)).toBe(true);
  expect(c.CoachOperationalAuthorityRequestSchema.safeParse({ ...program.request, scope: program.person }).success).toBe(false);
  const person = fixture();
  expect(c.CoachOperationalAuthorityRequestSchema.safeParse({ ...person.request, scope: person.agent }).success).toBe(false);
});
it.each([
  ['program', 'session', false], ['program', 'admission', true], ['opening', 'session', true],
  ['opening', 'admission', true], ['read', 'session', false], ['start', 'admission', false],
  ['conversation', 'session', false], ['usage', 'admission', true], ['event', 'admission', true],
  ['end-guide', 'admission', true], ['close', 'admission', true],
])('rejects unsupported %s with %s proof, opening=%s', (operation, kind, opening) => {
  const f = fixture(operation as string, kind as string, opening as boolean);
  expect(c.CoachOperationalAuthorityRequestSchema.safeParse(f.request).success).toBe(false);
  expect(current(f)).toBe(false);
});
it.each(['tenantId', 'ownerId', 'agentId', 'userId'])('rejects foreign %s and missing full person authority', field => {
  const f = fixture('read', 'session', true);
  expect(current(f)).toBe(true);
  const request = { ...f.request, scope: { ...f.person, [field]: 'synthetic-other' } };
  expect(c.isCoachOperationalAuthorityCurrent(request, { ...f.result, request }, f.proof, now)).toBe(false);
  const proof = { ...f.proof, scope: { ...f.person, [field]: 'synthetic-other' } };
  expect(c.isCoachOperationalAuthorityCurrent(f.request, { ...f.result, proof }, proof, now)).toBe(false);
});
it('binds the full program version and original opening to the proof', () => {
  const f = fixture('start', 'session', true);
  expect(current(f)).toBe(true);
  for (const field of ['programVersion', 'catalogRevision', 'policyRevision', 'progressionRevision', 'measureDefinitionRevision', 'strategy']) {
    const program = { ...f.program, [field]: field === 'programVersion' ? 2 : field === 'strategy' ? { ...f.program.strategy, strategyVersion: 'two' } : 'two' };
    const request = { ...f.request, program };
    expect(c.isCoachOperationalAuthorityCurrent(request, { ...f.result, request }, f.proof, now)).toBe(false);
  }
  for (const field of ['openingId', 'sessionId', 'appliedConfigVersion', 'openedAt']) {
    const opening = { ...f.opening!, [field]: field === 'appliedConfigVersion' ? 2 : field === 'openedAt' ? at(4) : 'synthetic-other' };
    const request = { ...f.request, opening };
    expect(c.isCoachOperationalAuthorityCurrent(request, { ...f.result, request }, f.proof, now)).toBe(false);
  }
});
it('rejects cross-person or cross-program opening inside a proof', () => {
  const f = fixture('start', 'session', true);
  for (const opening of [
    { ...f.opening!, scope: { ...f.person, userId: 'synthetic-other' } },
    { ...f.opening!, program: { ...f.program, programVersion: 2 } },
  ]) expect(c.CoachOperationalAuthorityProofSchema.safeParse({ ...f.proof, opening }).success).toBe(false);
  expect(c.CoachOperationalAuthorityProofSchema.safeParse({ ...f.proof, opening: null }).success).toBe(false);
});
it('requires an exact request, including phase, operation, nonce and explicit proof reference', () => {
  const f = fixture('start', 'session', true);
  expect(current(f)).toBe(true);
  for (const change of [{ phase: 'after' }, { operation: 'conversation' }, { requestId: 'synthetic-other' },
    { proofRef: { ...f.proofRef, proofId: 'synthetic-other' } }, { proofRef: { ...f.proofRef, kind: 'admission' } }]) {
    const request = { ...f.request, ...change };
    expect(c.isCoachOperationalAuthorityCurrent(request, f.result, f.proof, now)).toBe(false);
  }
  expect(c.isCoachOperationalAuthorityCurrent(f.request, { ...f.result, request: { ...f.request, phase: 'after' } }, f.proof, now)).toBe(false);
});
it('requires the current server proof, with all immutable fields unchanged', () => {
  const f = fixture('read', 'session', true);
  expect(current(f)).toBe(true);
  for (const proof of [
    { ...f.proof, proofRef: { ...f.proofRef, proofId: 'other-generation' } },
    { ...f.proof, issuedAt: at(4) }, { ...f.proof, expiresAt: at(99) },
    { ...f.proof, scope: { ...f.person, userId: 'synthetic-other' } },
    { ...f.proof, program: { ...f.program, policyRevision: 'two' } },
    { ...f.proof, opening: { ...f.opening!, openingId: 'synthetic-other' } },
  ]) expect(c.isCoachOperationalAuthorityCurrent(f.request, f.result, proof, now)).toBe(false);
  for (const status of ['revoked', 'closed']) {
    expect(c.isCoachOperationalAuthorityCurrent(f.request, f.result, { ...f.proof, status }, now)).toBe(false);
    expect(c.isCoachOperationalAuthorityCurrent(f.request, { ...f.result, proof: { ...f.proof, status } }, f.proof, now)).toBe(false);
  }
});
it.each(['read', 'usage', 'event', 'end-guide', 'close'])('allows %s during session draining but prevents reopening', operation => {
  const f = fixture(operation, 'session', true), proof = { ...f.proof, status: 'draining' };
  expect(c.isCoachOperationalAuthorityCurrent(f.request, { ...f.result, proof }, proof, now)).toBe(true);
  expect(c.isCoachOperationalAuthorityCurrent(f.request, f.result, proof, now)).toBe(false);
});
it.each(['program', 'opening', 'start', 'conversation'])('denies %s during draining', operation => {
  const f = fixture(operation, ['program', 'opening'].includes(operation) ? 'admission' : 'session', !['program', 'opening'].includes(operation));
  const proof = { ...f.proof, status: 'draining' };
  expect(c.isCoachOperationalAuthorityCurrent(f.request, { ...f.result, proof }, proof, now)).toBe(false);
});
it('bounds positive authority to sixty seconds, proof expiry and current time', () => {
  const f = fixture('read', 'session', true);
  expect(current(f)).toBe(true);
  for (const change of [{ expiresAt: at(10) }, { expiresAt: at(71) }, { expiresAt: at(101) },
    { observedAt: at(2) }, { observedAt: at(1), expiresAt: at(5) }]) {
    expect(c.CoachOperationalAuthorityResultSchema.safeParse({ ...f.result, ...change }).success).toBe(false);
  }
  for (const time of [new Date(at(9)), new Date(at(70)), new Date(NaN)])
    expect(c.isCoachOperationalAuthorityCurrent(f.request, f.result, f.proof, time)).toBe(false);
  expect(c.CoachOperationalAuthorityProofSchema.safeParse({ ...f.proof, expiresAt: at(3) }).success).toBe(false);
});
it('rejects forged caller evidence and incomplete unknown input', () => {
  const f = fixture();
  for (const field of ['proof', 'viewer', 'expiresAt', 'token', 'policy']) {
    expect(c.CoachOperationalAuthorityRequestSchema.safeParse({ ...f.request, [field]: 'forged' }).success).toBe(false);
  }
  for (const value of [null, {}, undefined, 'proof', { ...f.request, proofRef: null }])
    expect(c.isCoachOperationalAuthorityCurrent(value, f.result, f.proof, now)).toBe(false);
});
it('exports canonical internal routes with fail-closed agent and phase binding', () => {
  const f = fixture();
  expect(h.COACH_OPERATIONAL_AUTH_HEADER).toBe(INTERNAL_SECRET_HEADER);
  for (const [phase, contract, action] of [
    ['before', h.coachOperationalAuthorityResolveContract, 'resolve'],
    ['after', h.coachOperationalAuthorityRecheckContract, 'recheck'],
  ] as const) {
    expect(contract.method).toBe('POST'); expect(contract.authType).toBe('secret');
    expect(contract.bodySchema).toBe(c.CoachOperationalAuthorityRequestSchema);
    expect(contract.responseSchema).toBe(c.CoachOperationalAuthorityResultSchema);
    expect(contract.path).toBe('/internal/capability/agents/:agentId/coach/v2/authority/' + action);
    expect(h.capCoachOperationalAuthorityPath(f.agent.agentId, action)).toBe('/internal/capability/agents/synthetic-agent/coach/v2/authority/' + action);
    const request = { ...f.request, phase };
    expect(h.isCoachOperationalAuthorityForRoute(request, { agentId: f.agent.agentId }, action)).toBe(true);
    expect(h.isCoachOperationalAuthorityForRoute(request, { agentId: 'synthetic-other' }, action)).toBe(false);
    expect(h.isCoachOperationalAuthorityForRoute(request, { agentId: f.agent.agentId, userId: 'forged' }, action)).toBe(false);
    expect(h.isCoachOperationalAuthorityForRoute(request, { agentId: f.agent.agentId }, action === 'resolve' ? 'recheck' : 'resolve')).toBe(false);
  }
});

it('binds budget read without an opening to the exact person and program proof', () => {
  const f = fixture();
  expect(current(f)).toBe(true);
  for (const change of [{ scope: { ...f.person, userId: 'synthetic-other' } },
    { program: { ...f.program, programVersion: 2 } }, { proofRef: { ...f.proofRef, proofId: 'synthetic-other' } }]) {
    const request = { ...f.request, ...change };
    expect(c.CoachOperationalAuthorityRequestSchema.safeParse(request).success).toBe(true);
    expect(c.isCoachOperationalAuthorityCurrent(request, { ...f.result, request }, f.proof, now)).toBe(false);
  }
  const request = { ...f.request, phase: 'after' };
  expect(c.isCoachOperationalAuthorityCurrent(request, { ...f.result, request }, f.proof, now)).toBe(true);
});

it('publishes the non-credential authority proof header independently of authentication', () => {
  expect(h.COACH_OPERATIONAL_AUTHORITY_PROOF_HEADER).toBe('X-X9-Coach-Authority-Proof');
  expect(h.COACH_OPERATIONAL_AUTHORITY_PROOF_HEADER).not.toBe(INTERNAL_SECRET_HEADER);
});
it.each(['admission', 'session'])('round-trips %s authority proof header with canonical reference bounds', kind => {
  for (const proofId of ['eight-id', 'synthetic:proof.one-two', 'a'.repeat(128)]) {
    const ref = { kind, proofId }, encoded = h.formatCoachOperationalAuthorityProofHeader(ref);
    expect(encoded).toBe(`${kind}:${proofId}`);
    expect(h.CoachOperationalAuthorityProofHeaderSchema.parse(encoded)).toEqual(ref);
    for (const mode of ['legacy', 'managed'] as const)
      expect(h.parseCoachOperationalAuthorityProofHeader(encoded, mode)).toEqual(ref);
  }
});
it('permits a missing authority proof header only for explicitly legacy server policy', () => {
  expect(h.parseCoachOperationalAuthorityProofHeader(undefined, 'legacy')).toBeNull();
  expect(() => h.parseCoachOperationalAuthorityProofHeader(undefined, 'managed')).toThrow();
});
it.each([
  null, '', 'admission', 'admissionX', 'sessionX', 'admission:', 'admission:short', 'unknown:synthetic-proof',
  ' admission:synthetic-proof', 'admission:synthetic-proof ', 'session:synthetic-proof\r\nX-Forged:1',
  'admission:synthetic-proof,session:synthetic-proof', ['admission:synthetic-proof'],
  ['admission:synthetic-proof', 'session:synthetic-proof'], { kind: 'admission', proofId: 'synthetic-proof' },
  'admission:' + 'a'.repeat(129), 'session:synthetic/proof',
])('rejects malformed or duplicate authority proof header %# in both policies', raw => {
  for (const mode of ['legacy', 'managed'] as const)
    expect(() => h.parseCoachOperationalAuthorityProofHeader(raw, mode)).toThrow();
});
it.each([undefined, null, { kind: 'admission', proofId: 'short' },
  { kind: 'other', proofId: 'synthetic-proof' }, { kind: 'session', proofId: 'synthetic-proof', token: 'forged' },
])('refuses invalid evidence when formatting authority proof header %#', raw => {
  expect(() => h.formatCoachOperationalAuthorityProofHeader(raw)).toThrow();
});
it('rejects unknown policy and does not derive authority from an authority proof header', () => {
  expect(() => h.parseCoachOperationalAuthorityProofHeader('admission:synthetic-proof', 'caller-selected' as 'legacy')).toThrow();
  const f = fixture();
  const proofRef = h.parseCoachOperationalAuthorityProofHeader('admission:synthetic-other', 'managed');
  expect(proofRef).toEqual({ kind: 'admission', proofId: 'synthetic-other' });
  const request = { ...f.request, proofRef };
  expect(c.CoachOperationalAuthorityRequestSchema.safeParse(request).success).toBe(true);
  expect(c.isCoachOperationalAuthorityCurrent(request, { ...f.result, request }, f.proof, now)).toBe(false);
});
