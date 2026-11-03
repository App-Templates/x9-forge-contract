import { expect, it } from 'vitest';
import * as api from '../../../src/http/endpoints/native-binding-read.js';
import { opening } from '../../capability/coach-operational-fixtures.js';
import { fixtures as f } from '../../capability/meditation-contract-fixtures.js';

const at = opening.openedAt, time = Date.parse(at), now = new Date(time + 5000);
const later = (ms: number) => new Date(time + ms).toISOString();
const scope = opening.scope;
const attempt = {
  attemptId: 'synthetic-attempt', requestId: 'synthetic-admission', linkId: 'synthetic-link', scope,
  viewer: { kind: 'authenticated', userId: scope.userId, owner: null },
  agentIdentity: { ...opening.program.scope, role: 'master', identity: { managementAgentId: 'synthetic-management', runtimeAgentId: scope.agentId, vaultAgentId: 101 } },
  program: opening.program, configVersion: opening.appliedConfigVersion, promptBundleHash: 'a'.repeat(64),
  policyVersion: 1, status: 'pending', createdAt: at, expiresAt: later(60000),
};
const binding = { bindingId: 'synthetic-binding', attemptId: attempt.attemptId, opening,
  mapping: { ...f.ElevenLabsCoachSessionBinding.mapping, appliedConfigVersion: opening.appliedConfigVersion },
  configVersion: opening.appliedConfigVersion, promptBundleHash: attempt.promptBundleHash, boundAt: at };
const request = { requestId: 'synthetic-read', scope, ref: { kind: 'attempt', attemptId: attempt.attemptId } };
const result = { ok: true, request, record: { attempt, binding, pausedAt: null }, observedAt: at, expiresAt: later(10000) };
const current = (raw: unknown = result, expected: unknown = attempt, clock = now) => api.isElevenLabsNativeBindingReadCurrent(request, raw, expected, clock);

it('reads one exact durable binding with canonical secret transport and route correlation', () => {
  expect(api.ElevenLabsNativeBindingReadRequestSchema.safeParse(request).success).toBe(true);
  expect(api.ElevenLabsNativeBindingReadResultSchema.safeParse(result).success).toBe(true);
  expect(current()).toBe(true);
  expect(api.nativeBindingReadContract.method).toBe('POST');
  expect(api.nativeBindingReadContract.authType).toBe('secret');
  expect(api.nativeBindingReadContract.authHeader).toBe('X-Internal-Secret');
  expect(api.capElevenLabsNativeBindingReadPath(scope.agentId)).toBe(`/internal/capability/agents/${scope.agentId}/elevenlabs/native/bindings/read`);
  expect(api.isElevenLabsNativeBindingReadForRoute(request, { agentId: scope.agentId })).toBe(true);
  expect(api.isElevenLabsNativeBindingReadForRoute(request, { agentId: 'foreign-value' })).toBe(false);
});

it('also resolves by bindingId without latest-attempt or ambiguous references', () => {
  const r = { ...request, ref: { kind: 'binding', bindingId: binding.bindingId } }, s = { ...result, request: r };
  expect(api.isElevenLabsNativeBindingReadCurrent(r, s, attempt, now)).toBe(true);
  expect(api.ElevenLabsNativeBindingReadResultSchema.safeParse({ ...s, request: { ...r, ref: { kind: 'binding', bindingId: 'foreign-value' } } }).success).toBe(false);
  expect(api.ElevenLabsNativeBindingReadRequestSchema.safeParse({ ...request, ref: { ...request.ref, bindingId: binding.bindingId } }).success).toBe(false);
});

it.each(['requestId', 'scope', 'ref'] as const)('rejects response correlation changed at %s', field => {
  const other = { requestId: 'foreign-value', scope: { ...scope, userId: 'foreign-value' }, ref: { kind: 'attempt', attemptId: 'foreign-value' } };
  expect(current({ ...result, request: { ...request, [field]: other[field] } })).toBe(false);
});

it.each(['attemptId', 'requestId', 'linkId', 'policyVersion', 'promptBundleHash', 'agentIdentity', 'status'] as const)('compares trusted Forge attempt including %s', field => {
  const changes = { attemptId: 'foreign-value', requestId: 'foreign-value', linkId: 'foreign-value', policyVersion: 2,
    promptBundleHash: 'b'.repeat(64), agentIdentity: { ...attempt.agentIdentity, identity: { ...attempt.agentIdentity.identity, vaultAgentId: 102 } }, status: 'admitted' };
  expect(current(result, { ...attempt, [field]: changes[field] })).toBe(false);
});

it.each(['tenantId', 'ownerId', 'agentId', 'userId'] as const)('rejects a foreign person/agent at %s', field => {
  expect(current(result, { ...attempt, scope: { ...scope, [field]: 'foreign-value' } })).toBe(false);
  expect(api.ElevenLabsNativeBindingReadResultSchema.safeParse({ ...result, record: { ...result.record,
    binding: { ...binding, opening: { ...opening, scope: { ...scope, [field]: 'foreign-value' } } } } }).success).toBe(false);
});

it.each(['attemptId', 'program', 'configVersion', 'promptBundleHash'] as const)('rejects a durable binding that changed %s', field => {
  const changes = { attemptId: 'foreign-value', program: { ...opening.program, catalogRevision: 'foreign-value' },
    configVersion: opening.appliedConfigVersion + 1, promptBundleHash: 'b'.repeat(64) };
  const b = field === 'program' ? { ...binding, opening: { ...opening, program: changes.program } } : { ...binding, [field]: changes[field] };
  expect(api.ElevenLabsNativeBindingReadResultSchema.safeParse({ ...result, record: { ...result.record, binding: b } }).success).toBe(false);
});

it('reports missing and paused records as facts without renewing or authorizing admission', () => {
  expect(current({ ...result, record: null })).toBe(true);
  const expired = { ...attempt, status: 'expired' }, paused = { ...result, record: { attempt: expired, binding, pausedAt: at } };
  expect(current(paused, expired)).toBe(true);
  const old = { ...paused, observedAt: later(120000), expiresAt: later(130000) };
  expect(current(old, expired, new Date(time + 125000))).toBe(true);
  expect(api.ElevenLabsNativeBindingReadResultSchema.safeParse({ ...paused, record: { ...paused.record, pausedAt: later(1) } }).success).toBe(false);
});

it('refuses a coherent foreign persisted person even when agent and program agree', () => {
  const otherScope = { ...scope, userId: 'foreign-person' };
  const otherAttempt = { ...attempt, scope: otherScope, viewer: { ...attempt.viewer, userId: otherScope.userId } };
  const otherBinding = { ...binding, opening: { ...opening, scope: otherScope } };
  expect(api.ElevenLabsNativeBindingReadResultSchema.safeParse({ ...result, record: { attempt: otherAttempt, binding: otherBinding, pausedAt: null } }).success).toBe(false);
});

it.each([new Date(NaN), new Date(time - 1), new Date(time + 10000)])('rejects invalid, future or expired observation clocks %s', clock => {
  expect(current(result, attempt, clock)).toBe(false);
});

it('bounds observation lifetime and orders observed facts', () => {
  for (const expiresAt of [at, later(60001)]) expect(api.ElevenLabsNativeBindingReadResultSchema.safeParse({ ...result, expiresAt }).success).toBe(false);
  expect(api.ElevenLabsNativeBindingReadResultSchema.safeParse({ ...result, observedAt: later(-1) }).success).toBe(false);
});

it.each(['proof', 'grant', 'authority', 'lastMint', 'connection'])('rejects extra authority or transport material %s', field => {
  expect(api.ElevenLabsNativeBindingReadRequestSchema.safeParse({ ...request, [field]: {} }).success).toBe(false);
  expect(api.ElevenLabsNativeBindingReadResultSchema.safeParse({ ...result, [field]: {} }).success).toBe(false);
  expect(api.ElevenLabsNativeBindingReadResultSchema.safeParse({ ...result, record: { ...result.record, [field]: {} } }).success).toBe(false);
});
