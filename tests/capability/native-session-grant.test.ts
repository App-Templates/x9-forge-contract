import { expect, it } from 'vitest';
import { ElevenLabsNativeAdmissionAttemptSchema, ElevenLabsNativeConversationBindingSchema,
  ElevenLabsNativeSessionGrantSchema as Grant, ElevenLabsNativeSessionGrantIssueRequestSchema as Issue,
  ElevenLabsNativeSessionGrantAuthorityRequestSchema as Request, ElevenLabsNativeSessionGrantAuthorityResultSchema as Result,
  isElevenLabsNativeSessionGrantForIssueRequest as forIssue,
  isElevenLabsNativeSessionGrantAuthorityCurrent as current } from '../../src/capability/index.js';
import { nativeSessionGrantIssueContract, nativeSessionGrantResolveContract, nativeSessionGrantRecheckContract,
  capElevenLabsNativeSessionGrantPath, isElevenLabsNativeSessionGrantIssueForRoute,
  isElevenLabsNativeSessionGrantAuthorityForRoute } from '../../src/http/index.js';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/index.js';

// Standalone synthetic metadata; no connection material or shared native fixture graph.
const at = (seconds: number) => new Date(Date.UTC(2026, 9, 11) + seconds * 1000).toISOString();
function fixture() {
  const scope = { tenantId: 'synthetic-tenant', ownerId: 'synthetic-owner', agentId: 'synthetic-agent', userId: 'synthetic-person' };
  const agentScope = { tenantId: scope.tenantId, ownerId: scope.ownerId, agentId: scope.agentId };
  const program = { scope: agentScope, programId: 'synthetic-program', programVersion: 1,
    strategy: { strategyId: 'synthetic-strategy', strategyVersion: 'one' }, catalogRevision: 'one',
    policyRevision: 'one', progressionRevision: 'one', measureDefinitionRevision: 'one' };
  const attempt = { attemptId: 'synthetic-attempt', requestId: 'synthetic-admission', linkId: 'synthetic-link', scope,
    viewer: { kind: 'authenticated', userId: scope.userId, owner: null },
    agentIdentity: { ...agentScope, role: 'master', identity: { managementAgentId: 'synthetic-alias', runtimeAgentId: scope.agentId, vaultAgentId: 101 } },
    program, configVersion: 1, promptBundleHash: 'a'.repeat(64), policyVersion: 1,
    status: 'admitted', createdAt: at(0), expiresAt: at(60) };
  const opening = { openingId: 'synthetic-opening', sessionId: 'synthetic-session', scope, program, appliedConfigVersion: 1, openedAt: at(1) };
  const binding = { bindingId: 'synthetic-binding', attemptId: attempt.attemptId, opening,
    mapping: { scope: agentScope, providerAgentId: 'synthetic-provider', origin: 'provisioned', createdAt: at(0), appliedConfigVersion: 1 },
    configVersion: 1, promptBundleHash: attempt.promptBundleHash, boundAt: at(2) };
  const conversation = { binding, providerConversationId: 'synthetic-conversation', attachedAt: at(3) };
  const issue = { requestId: 'synthetic-issue', conversation };
  const grant = { grantId: 'synthetic-grant', requestId: issue.requestId, attempt, conversation,
    issuedAt: at(4), expiresAt: at(3604), status: 'active' };
  const request = { requestId: 'synthetic-authority', scope, grantId: grant.grantId, operation: 'guide_start', phase: 'before' };
  const result = { ok: true, request, grant, observedAt: at(120), expiresAt: at(180) };
  return { scope, attempt, conversation, issue, grant, request, result };
}

it('uses a valid minimal admitted attempt and connected conversation', () => {
  const f = fixture();
  expect(ElevenLabsNativeAdmissionAttemptSchema.safeParse(f.attempt).success).toBe(true);
  expect(ElevenLabsNativeConversationBindingSchema.safeParse(f.conversation).success).toBe(true);
});
it('issues a separate long session and permits current authority after admission expires', () => {
  const f = fixture();
  expect(Grant.safeParse(f.grant).success).toBe(true);
  expect(forIssue(f.issue, f.grant, f.attempt, new Date(at(120)))).toBe(true);
  expect(current(f.request, f.result, f.grant, new Date(at(121)))).toBe(true);
});
it('requires an explicit positive duration bounded at 24 hours', () => {
  const f = fixture();
  expect(Grant.safeParse({ ...f.grant, expiresAt: at(86404) }).success).toBe(true);
  for (const expiresAt of [at(4), at(3), at(86405), undefined]) {
    expect(Grant.safeParse({ ...f.grant, expiresAt }).success).toBe(false);
  }
});
it('binds issuance and conversation attachment to the original admitted window', () => {
  const f = fixture();
  for (const issuedAt of [at(2), at(60), at(61)]) expect(Grant.safeParse({ ...f.grant, issuedAt }).success).toBe(false);
  expect(Grant.safeParse({ ...f.grant, issuedAt: at(59), conversation: { ...f.conversation, attachedAt: at(60) } }).success).toBe(false);
  for (const status of ['pending', 'expired', 'revoked']) expect(Grant.safeParse({ ...f.grant, attempt: { ...f.attempt, status } }).success).toBe(false);
});
it.each(['tenantId', 'ownerId', 'agentId', 'userId'])('rejects foreign %s in the grant conversation and authority request', field => {
  const f = fixture();
  expect(current(f.request, f.result, f.grant, new Date(at(121)))).toBe(true);
  const opening = f.conversation.binding.opening;
  const foreignConversation = { ...f.conversation, binding: { ...f.conversation.binding, opening: { ...opening, scope: { ...f.scope, [field]: 'foreign' } } } };
  expect(Grant.safeParse({ ...f.grant, conversation: foreignConversation }).success).toBe(false);
  const foreignRequest = { ...f.request, scope: { ...f.scope, [field]: 'foreign' } };
  expect(current(foreignRequest, f.result, f.grant, new Date(at(121)))).toBe(false);
  expect(current(foreignRequest, { ...f.result, request: foreignRequest }, f.grant, new Date(at(121)))).toBe(false);
});
it('requires exact attempt, program, config and prompt pins from the authority store', () => {
  const f = fixture(), binding = f.conversation.binding;
  for (const altered of [
    { ...binding, attemptId: 'foreign' }, { ...binding, promptBundleHash: 'b'.repeat(64) },
    { ...binding, opening: { ...binding.opening, program: { ...binding.opening.program, programVersion: 2 } } },
    { ...binding, configVersion: 2, mapping: { ...binding.mapping, appliedConfigVersion: 2 }, opening: { ...binding.opening, appliedConfigVersion: 2 } },
  ]) expect(Grant.safeParse({ ...f.grant, conversation: { ...f.conversation, binding: altered } }).success).toBe(false);
  expect(forIssue(f.issue, f.grant, { ...f.attempt, policyVersion: 2 }, new Date(at(5)))).toBe(false);
  expect(forIssue(f.issue, f.grant, { ...f.attempt, requestId: 'foreign-generation' }, new Date(at(5)))).toBe(false);
  expect(forIssue(f.issue, f.grant, { ...f.attempt, status: 'revoked' }, new Date(at(5)))).toBe(false);
});
it('accepts only the issue request correlation without caller authority or expiry fields', () => {
  const f = fixture();
  expect(Issue.safeParse(f.issue).success).toBe(true);
  for (const field of ['viewer', 'policy', 'expiresAt', 'attempt', 'scope']) expect(Issue.safeParse({ ...f.issue, [field]: 'forged' }).success).toBe(false);
  expect(forIssue({ ...f.issue, requestId: 'foreign' }, f.grant, f.attempt, new Date(at(5)))).toBe(false);
  expect(forIssue({ ...f.issue, conversation: { ...f.conversation, providerConversationId: 'foreign' } }, f.grant, f.attempt, new Date(at(5)))).toBe(false);
  for (const now of [new Date(at(3)), new Date(at(3604)), new Date(NaN)]) expect(forIssue(f.issue, f.grant, f.attempt, now)).toBe(false);
});
it('bounds authority reads by 60 seconds and the explicit session expiry', () => {
  const f = fixture();
  expect(Result.safeParse(f.result).success).toBe(true);
  for (const expiresAt of [at(120), at(181), at(3605)]) expect(Result.safeParse({ ...f.result, expiresAt }).success).toBe(false);
  expect(Result.safeParse({ ...f.result, observedAt: at(3), expiresAt: at(30) }).success).toBe(false);
  expect(Result.safeParse({ ...f.result, observedAt: at(3600), expiresAt: at(3605) }).success).toBe(false);
  for (const now of [new Date(at(119)), new Date(at(180)), new Date(NaN)]) expect(current(f.request, f.result, f.grant, now)).toBe(false);
});
it('correlates the exact request and all immutable durable grant fields', () => {
  const f = fixture(), now = new Date(at(121));
  expect(current(f.request, f.result, f.grant, now)).toBe(true);
  for (const patch of [{ requestId: 'foreign' }, { grantId: 'foreign' }, { phase: 'after' }, { operation: 'continue' }]) {
    expect(current(f.request, { ...f.result, request: { ...f.request, ...patch } }, f.grant, now)).toBe(false);
  }
  for (const patch of [{ grantId: 'foreign' }, { requestId: 'foreign' }, { expiresAt: at(3605) }, { issuedAt: at(5) },
    { conversation: { ...f.conversation, providerConversationId: 'foreign' } }, { attempt: { ...f.attempt, policyVersion: 2 } },
    { attempt: { ...f.attempt, requestId: 'foreign-generation' } }]) {
    expect(current(f.request, f.result, { ...f.grant, ...patch }, now)).toBe(false);
  }
});
it('allows draining only for continue and never reactivates a draining grant', () => {
  const f = fixture(), now = new Date(at(121)), draining = { ...f.grant, status: 'draining' };
  const request = { ...f.request, operation: 'continue' }, result = { ...f.result, request, grant: draining };
  expect(current(request, { ...result, grant: f.grant }, f.grant, now)).toBe(true);
  expect(current(request, result, f.grant, now)).toBe(true);
  expect(current(request, result, draining, now)).toBe(true);
  expect(current(f.request, { ...f.result, grant: draining }, f.grant, now)).toBe(false);
  expect(current(request, { ...result, grant: f.grant }, draining, now)).toBe(false);
  expect(current(request, { ...result, request: { ...request, phase: 'after' } }, f.grant, now)).toBe(false);
  expect(current({ ...request, phase: 'after' }, { ...result, request: { ...request, phase: 'after' } }, draining, now)).toBe(true);
});
it.each(['revoked', 'closed'])('never authorizes or reactivates %s', status => {
  const f = fixture(), terminal = { ...f.grant, status }, now = new Date(at(121));
  expect(Grant.safeParse(terminal).success).toBe(true);
  expect(current(f.request, { ...f.result, grant: terminal }, f.grant, now)).toBe(false);
  expect(current(f.request, f.result, terminal, now)).toBe(false);
  expect(current(f.request, { ...f.result, grant: terminal }, terminal, now)).toBe(false);
});
it('uses canonical secret descriptors and validated agent/action paths', () => {
  const f = fixture();
  for (const [action, descriptor] of [
    ['issue', nativeSessionGrantIssueContract], ['resolve', nativeSessionGrantResolveContract], ['recheck', nativeSessionGrantRecheckContract],
  ] as const) {
    expect(descriptor.method).toBe('POST'); expect(descriptor.authType).toBe('secret'); expect(descriptor.authHeader).toBe(INTERNAL_SECRET_HEADER);
    expect(descriptor.path).toBe('/internal/capability/agents/:agentId/elevenlabs/native/session-grants/' + action);
    expect(capElevenLabsNativeSessionGrantPath(f.scope.agentId, action)).toBe(descriptor.path.replace(':agentId', f.scope.agentId));
  }
  expect(nativeSessionGrantIssueContract.responseSchema).toBe(Grant);
  expect(nativeSessionGrantResolveContract.responseSchema).toBe(Result);
  expect(nativeSessionGrantRecheckContract.bodySchema).toBe(Request);
  expect(() => capElevenLabsNativeSessionGrantPath('', 'issue')).toThrow();
  expect(() => capElevenLabsNativeSessionGrantPath(f.scope.agentId, 'foreign' as 'issue')).toThrow();
  expect(isElevenLabsNativeSessionGrantIssueForRoute(f.issue, { agentId: f.scope.agentId })).toBe(true);
  expect(isElevenLabsNativeSessionGrantAuthorityForRoute(f.request, { agentId: f.scope.agentId })).toBe(true);
  expect(isElevenLabsNativeSessionGrantIssueForRoute(f.issue, { agentId: 'foreign' })).toBe(false);
  expect(isElevenLabsNativeSessionGrantAuthorityForRoute(f.request, { agentId: 'foreign' })).toBe(false);
});
