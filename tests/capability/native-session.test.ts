import { expect, it } from 'vitest';
import { ElevenLabsNativeAdmissionAttemptSchema as Attempt, ElevenLabsNativeAuthorityResultSchema as Authority,
  isElevenLabsNativeAuthorityCurrent as current, ElevenLabsNativeSessionBindingSchema as Binding,
  isElevenLabsNativeSessionForAttempt as forAttempt, ElevenLabsNativeCallbackReceiptSchema as Receipt,
  isElevenLabsNativeCallbackCurrent as callbackCurrent, ElevenLabsNativeExecutionAttachmentSchema as Attachment,
  ElevenLabsNativeMintRequestSchema as MintRequest } from '../../src/capability/index.js';
import { ElevenLabsNativeBrowserAdmissionRequestSchema as BrowserRequest, nativeCallbackContract, nativeBrowserPolicyChangeContract, nativeBrowserPolicyReadContract, NativeBrowserPolicyChangeSchema, nativeBrowserPolicyPath } from '../../src/http/index.js';
import { opening, snapshot } from './coach-operational-fixtures.js';
import { fixtures as f } from './meditation-contract-fixtures.js';
const scope = opening.scope, at = opening.openedAt, now = new Date(Date.parse(at) + 5000), expiry = new Date(Date.parse(at) + 60000).toISOString();
const identity = { agentId: scope.agentId, ownerId: scope.ownerId, tenantId: scope.tenantId, role: 'master', identity: { managementAgentId: 'synthetic-management', runtimeAgentId: scope.agentId, vaultAgentId: 101 } };
export const attempt = { attemptId: 'synthetic-attempt', requestId: 'synthetic-request', linkId: 'synthetic-link', scope,
  viewer: { kind: 'authenticated', userId: scope.userId, owner: null }, agentIdentity: identity, program: opening.program,
  configVersion: opening.appliedConfigVersion, promptBundleHash: 'a'.repeat(64), policyVersion: 1, status: 'pending', createdAt: at, expiresAt: expiry };
const request = { requestId: 'synthetic-resolve', scope: opening.program.scope, attemptId: attempt.attemptId, phase: 'before' };
const result = { ok: true, request, attempt, observedAt: at, expiresAt: expiry };
export const binding = { bindingId: 'synthetic-binding', attemptId: attempt.attemptId, opening,
  mapping: { ...f.ElevenLabsCoachSessionBinding.mapping, appliedConfigVersion: opening.appliedConfigVersion },
  configVersion: opening.appliedConfigVersion, promptBundleHash: attempt.promptBundleHash, boundAt: at };
it('reloads a full authenticated person and original durable attempt, never a supplied userId', () => {
  expect(Attempt.safeParse(attempt).success).toBe(true); expect(Authority.safeParse(result).success).toBe(true);
  expect(current(request, result, attempt, now)).toBe(true);
  for (const field of ['userId', 'tenantId', 'ownerId', 'agentId']) expect(Attempt.safeParse({ ...attempt, scope: { ...scope, [field]: 'foreign' } }).success).toBe(false);
  expect(BrowserRequest.safeParse({ requestId: attempt.requestId, linkId: attempt.linkId, program: opening.program }).success).toBe(true);
  expect(BrowserRequest.safeParse({ requestId: attempt.requestId, linkId: attempt.linkId, program: opening.program, userId: scope.userId }).success).toBe(false);
  expect(current(request, result, { ...attempt, policyVersion: 2 }, now)).toBe(false);
  expect(current(request, { ...result, attempt: { ...attempt, status: 'revoked' } }, { ...attempt, status: 'revoked' }, now)).toBe(false);
  for (const date of [new Date(NaN), new Date(Date.parse(expiry)), new Date(Date.parse(at) - 1)]) expect(current(request, result, attempt, date)).toBe(false);
});
it('retains exact program, prompt, config and original mapping through conversation and execution', () => {
  expect(Binding.safeParse(binding).success).toBe(true); expect(forAttempt(binding, attempt)).toBe(true);
  expect(forAttempt({ ...binding, promptBundleHash: 'b'.repeat(64) }, attempt)).toBe(false);
  expect(forAttempt({ ...binding, opening: { ...opening, program: { ...opening.program, programVersion: 99 } } }, attempt)).toBe(false);
  expect(Binding.safeParse({ ...binding, mapping: { ...binding.mapping, appliedConfigVersion: 99 } }).success).toBe(false);
  expect(MintRequest.safeParse({ requestId: 'synthetic-mint', binding, transport: 'webrtc' }).success).toBe(true);
  const conversation = { binding, providerConversationId: 'synthetic-conversation', attachedAt: at };
  const attachedAt = new Date(Math.max(Date.parse(at), Date.parse(snapshot.startedAt))).toISOString();
  expect(Attachment.safeParse({ conversation, snapshot, attachedAt }).success).toBe(true);
  expect(Attachment.safeParse({ conversation, snapshot: { ...snapshot, opening: { ...opening, sessionId: 'foreign-session' } }, attachedAt }).success).toBe(false);
});
it('separates verified inbox receipt from applied effect, rejects replay scope and invalid clocks', () => {
  const conversation = { binding, providerConversationId: 'synthetic-conversation', attachedAt: at };
  const receipt = { callback: { eventId: 'synthetic-event', providerConversationId: conversation.providerConversationId,
    providerAgentId: binding.mapping.providerAgentId, occurredAt: at, bodySha256: 'b'.repeat(64) }, binding: conversation,
    receivedAt: at, inboxStatus: 'accepted', effectStatus: 'pending' };
  expect(Receipt.safeParse(receipt).success).toBe(true); expect(callbackCurrent(receipt, conversation, now)).toBe(true);
  expect(callbackCurrent(receipt, { ...conversation, providerConversationId: 'foreign-conversation' }, now)).toBe(false);
  expect(callbackCurrent(receipt, conversation, new Date(NaN))).toBe(false);
  expect(callbackCurrent(receipt, conversation, new Date(Date.parse(at) - 1))).toBe(false);
  expect(callbackCurrent(receipt, conversation, new Date(Date.parse(at) + 301000))).toBe(false);
  expect(Receipt.safeParse({ ...receipt, callback: { ...receipt.callback, providerAgentId: 'foreign-provider' } }).success).toBe(false);
  expect(nativeCallbackContract.authType).toBe('external_provider'); expect(nativeCallbackContract.rawBodyRequired).toBe(true);
});

it('keeps browser policy changes scoped by authenticated server resolution only', () => {
  const body = { requestId: 'synthetic-policy', expectedVersion: 1, access: 'owner', paused: false, enabled: true };
  expect(NativeBrowserPolicyChangeSchema.safeParse(body).success).toBe(true);
  for (const field of ['scope', 'userId', 'tenantId']) expect(NativeBrowserPolicyChangeSchema.safeParse({ ...body, [field]: scope }).success).toBe(false);
  expect(nativeBrowserPolicyChangeContract.authType).toBe('forge_session'); expect(nativeBrowserPolicyReadContract.authType).toBe('forge_session');
  expect(nativeBrowserPolicyPath('synthetic-management')).toBe('/api/agents/synthetic-management/native/web-policy');
});
