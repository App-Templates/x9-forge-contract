import { expect, it } from 'vitest';
import * as api from '../../../src/http/endpoints/coach-browser.js';
import { opening, state, projection, budget, snapshot } from '../../capability/coach-operational-fixtures.js';
import { fixtures as f } from '../../capability/meditation-contract-fixtures.js';

const requestId = 'synthetic-browser-request', sessionRef = 'opaque-session-001', programRef = 'opaque-program-001';
const command = { requestId, sessionRef, expectedRevision: 0 }, input = { kind: 'synthetic-input', payload: { answer: 'Synthetic answer' } };
const requests = [
  { action: 'person_program_read', requestId, programRef, after: null, limit: 1 },
  { action: 'open', requestId, programRef, channel: 'text' }, { action: 'open', requestId, programRef, channel: 'native' },
  { action: 'session_read', requestId, sessionRef }, { action: 'revisions_read', ...command, afterSequence: 0, limit: 1 },
  { action: 'conversation_input', ...command, input }, { action: 'execution_start', ...command },
  { action: 'execution_event', ...command, event: input }, { action: 'guide_end', ...command },
  { action: 'session_close', ...command, conclusion: input }, { action: 'mint', requestId, sessionRef, transport: 'webrtc' },
  { action: 'conversation_bind', requestId, sessionRef, providerConversationId: 'synthetic-conversation' },
  { action: 'execution_attach', requestId, sessionRef },
];
const view = () => api.projectCoachBrowserSession(state, sessionRef);
const readRequest = { action: 'session_read', requestId, sessionRef };
const readResult = () => ({ ok: true, action: 'session_read', requestId, session: view(), decisionCodes: [] });

it.each(requests)('accepts canonical browser action $action without caller person or opening', request => {
  expect(api.CoachBrowserRequestSchema.safeParse(request).success).toBe(true);
});
it('declares authenticated session transport with mandatory no-store', () => {
  expect(api.coachBrowserContract.method).toBe('POST'); expect(api.coachBrowserContract.path).toBe('/api/coach');
  expect(api.coachBrowserContract.authType).toBe('forge_session'); expect(api.coachBrowserContract.cacheControl).toBe('no-store');
});
it.each(['scope', 'userId', 'tenantId', 'ownerId', 'opening', 'binding', 'attempt', 'grant', 'proof', 'authority'])('rejects caller identity/authority %s on every action', field => {
  for (const request of requests) expect(api.CoachBrowserRequestSchema.safeParse({ ...request, [field]: {} }).success).toBe(false);
});
it.each(['scope', 'proofRef', 'grant', 'api_key', 'conversationToken', 'providerConversationId'])('rejects nested sensitive %s in strategy projections and input', field => {
  const value = { list: [{ nested: { [field]: 'synthetic-private' } }] };
  expect(api.CoachBrowserProjectionSchema.safeParse({ ...projection, value }).success).toBe(false);
  expect(api.CoachBrowserRequestSchema.safeParse({ action: 'conversation_input', ...command, input: { ...input, payload: value } }).success).toBe(false);
});
it('keeps bounded generic strategy payload validation including cyclic and non-JSON values', () => {
  const cycle: Record<string, unknown> = {}; cycle.self = cycle;
  for (const value of [cycle, { when: new Date() }, { nonfinite: Infinity }, { data: 'x'.repeat(270000) }]) {
    expect(api.CoachBrowserProjectionSchema.safeParse({ ...projection, value }).success).toBe(false);
  }
});
it('projects a full canonical read to a reduced view while keeping source immutable', () => {
  const before = structuredClone(state), session = view();
  expect(api.CoachBrowserSessionSchema.safeParse(session).success).toBe(true);
  expect(session.projection).toEqual(projection); expect(session.measures).toHaveLength(state.measures.length);
  expect(session.budget.status).toBe('known'); expect(state).toEqual(before);
  const serialized = JSON.stringify(session);
  for (const privateValue of [opening.scope.userId, opening.scope.tenantId, opening.scope.ownerId, opening.openingId, opening.sessionId]) expect(serialized).not.toContain(privateValue);
  for (const field of ['scope', 'opening', 'binding', 'reservation', 'attempt', 'grant']) expect(api.CoachBrowserSessionSchema.safeParse({ ...session, [field]: {} }).success).toBe(false);
});
it('validates canonical source before projection and retains explicit unknown budget', () => {
  expect(() => api.projectCoachBrowserSession({ ...state, reservation: { ...state.reservation, openingId: 'foreign-opening' } }, sessionRef)).toThrow();
  expect(() => api.projectCoachBrowserSession(state, 'bad')).toThrow();
  expect(api.projectCoachBrowserBudget({ status: 'unknown', reason: 'usage_pending' })).toEqual({ status: 'unknown', reason: 'usage_pending' });
  expect(() => api.projectCoachBrowserBudget({ ...budget, quota: { ...budget.quota, remainingSeconds: 0 } })).toThrow();
  expect(() => api.projectCoachBrowserSession({ ...state, projection: { ...projection, value: { scope: opening.scope } } }, sessionRef)).toThrow();
});
it('retains original execution timeline without leaking snapshot/opening identity', () => {
  const session = api.projectCoachBrowserSession({ ...state, lifecycle: 'executing', initialSnapshot: snapshot, measures: [] }, sessionRef);
  expect(session.execution?.segments).toEqual(snapshot.segments);
  expect(JSON.stringify(session)).not.toContain(snapshot.snapshotId);
  expect(session.execution?.totalSeconds).toBe(snapshot.totalSeconds);
});
it.each(['requestId', 'action', 'sessionRef'])('rejects unrelated browser receipt %s', field => {
  const changes = { requestId: 'another-request', action: 'conversation_input', sessionRef: 'another-session' };
  expect(api.isCoachBrowserResultForRequest(readResult(), readRequest)).toBe(true);
  expect(api.isCoachBrowserResultForRequest(readResult(), { ...readRequest, [field]: changes[field] })).toBe(false);
});
it('fences command revisions and the native/text opening choice', () => {
  const result = { ...readResult(), action: 'execution_start' };
  expect(api.isCoachBrowserResultForRequest(result, { action: 'execution_start', ...command })).toBe(true);
  expect(api.isCoachBrowserResultForRequest(result, { action: 'execution_start', ...command, expectedRevision: 1 })).toBe(false);
  const opened = { ok: true, action: 'open', requestId, programRef, channel: 'native', session: view() };
  expect(api.isCoachBrowserResultForRequest(opened, { action: 'open', requestId, programRef, channel: 'native' })).toBe(true);
  expect(api.isCoachBrowserResultForRequest(opened, { action: 'open', requestId, programRef, channel: 'text' })).toBe(false);
  expect(api.isCoachBrowserResultForRequest(opened, { action: 'open', requestId, programRef: 'another-program', channel: 'native' })).toBe(false);
});
it('bounds home pages and keeps public cursors advancing', () => {
  const request = requests[0], result = { ok: true, action: 'person_program_read', requestId, programRef,
    observedAt: opening.openedAt, personState: projection, budget: api.projectCoachBrowserBudget(budget), sessions: [view()], nextCursor: 'opaque-next-cursor' };
  expect(api.isCoachBrowserResultForRequest(result, request)).toBe(true);
  expect(api.isCoachBrowserResultForRequest(result, { ...request, after: result.nextCursor })).toBe(false);
  expect(api.isCoachBrowserResultForRequest(result, { ...request, programRef: 'another-program' })).toBe(false);
  expect(api.CoachBrowserResultSchema.safeParse({ ...result, sessions: [view(), view()] }).success).toBe(false);
});
it('binds revision pages to the requested state revision, sequence and limit', () => {
  const r = f.CoachSessionPlanRevision;
  const revision = { sequence: r.sequence, appliedAt: r.appliedAt, effectiveFromSeconds: r.effectiveFromSeconds,
    segments: r.segments, totalSeconds: r.totalSeconds, decisionCodes: r.decisionCodes };
  const request = { action: 'revisions_read', ...command, expectedRevision: 3, afterSequence: 0, limit: 1 };
  const result = { ok: true, action: 'revisions_read', requestId, sessionRef, asOfRevision: 3, revisions: [revision], nextAfterSequence: r.sequence };
  expect(api.isCoachBrowserResultForRequest(result, request)).toBe(true);
  expect(api.isCoachBrowserResultForRequest(result, { ...request, afterSequence: r.sequence })).toBe(false);
  expect(api.isCoachBrowserResultForRequest(result, { ...request, expectedRevision: 4 })).toBe(false);
  expect(api.CoachBrowserResultSchema.safeParse({ ...result, revisions: [revision, revision] }).success).toBe(false);
  expect(api.CoachBrowserResultSchema.safeParse({ ...result, nextAfterSequence: r.sequence + 1 }).success).toBe(false);
});
it('does not accept client-reported elapsed time or fabricated guide completion', () => {
  expect(api.CoachBrowserRequestSchema.safeParse({ action: 'guide_end', ...command, guidedSeconds: 600 }).success).toBe(false);
  const result = { ok: true, action: 'guide_end', requestId, session: view(), done: false, remainingSeconds: 1 };
  expect(api.isCoachBrowserResultForRequest(result, { action: 'guide_end', ...command })).toBe(true);
  expect(api.CoachBrowserResultSchema.safeParse({ ...result, done: true, remainingSeconds: 0 }).success).toBe(false);
});

const binding = { bindingId: 'synthetic-binding', attemptId: 'synthetic-attempt', opening,
  mapping: { ...f.ElevenLabsCoachSessionBinding.mapping, appliedConfigVersion: opening.appliedConfigVersion },
  configVersion: opening.appliedConfigVersion, promptBundleHash: 'a'.repeat(64), boundAt: opening.openedAt };
const mintRequest = { action: 'mint', requestId, sessionRef, transport: 'webrtc' };
const nativeRequest = { requestId, binding, transport: 'webrtc' };
const time = Date.parse(opening.openedAt), now = new Date(time + 1000);
const nativeResult = { ok: true, requestId, binding, issuedAt: opening.openedAt, expiresAt: new Date(time + 60000).toISOString(),
  connection: { transport: 'webrtc', conversationToken: 'synthetic-ephemeral-connection' } };
const mint = (raw: unknown = nativeResult, original: unknown = nativeRequest, current: unknown = binding, clock = now) => api.projectCoachBrowserMint(mintRequest, raw, original, current, sessionRef, clock);
it('projects only ephemeral Native connection and window after validating full result', () => {
  const result = mint();
  expect(result).toEqual({ ok: true, action: 'mint', requestId, sessionRef, issuedAt: nativeResult.issuedAt, expiresAt: nativeResult.expiresAt, connection: nativeResult.connection });
  expect(api.isCoachBrowserResultForRequest(result, mintRequest)).toBe(true);
  expect(JSON.stringify(result)).not.toContain(binding.bindingId);
  expect(api.isCoachBrowserResultForRequest(result, { ...mintRequest, sessionRef: 'foreign-session' })).toBe(false);
  expect(api.isCoachBrowserResultForRequest(result, { ...mintRequest, transport: 'websocket' })).toBe(false);
});
it.each(['request', 'binding', 'transport', 'future', 'expired'])('refuses Native mint changed %s before browser disclosure', fault => {
  const result = fault === 'request' ? { ...nativeResult, requestId: 'another-request' }
    : fault === 'binding' ? { ...nativeResult, binding: { ...binding, promptBundleHash: 'b'.repeat(64) } }
      : fault === 'transport' ? { ...nativeResult, connection: { transport: 'websocket', signedUrl: 'wss://api.elevenlabs.io/v1/convai/conversation?agent_id=synthetic&conversation_signature=synthetic' } }
        : nativeResult;
  const clock = fault === 'future' ? new Date(time - 1) : fault === 'expired' ? new Date(time + 60000) : now;
  expect(mint(result, nativeRequest, binding, clock)).toBeNull();
});
it('requires server original request and current binding, rejecting invalid clocks', () => {
  expect(mint(nativeResult, { ...nativeRequest, requestId: 'another-request' })).toBeNull();
  expect(mint(nativeResult, nativeRequest, { ...binding, bindingId: 'another-binding' })).toBeNull();
  expect(mint(nativeResult, nativeRequest, binding, new Date(NaN))).toBeNull();
  expect(api.projectCoachBrowserMint(mintRequest, nativeResult, nativeRequest, binding, 'another-session', now)).toBeNull();
});
it('reuses strict Native websocket host/path rules and retains a bounded token lifetime', () => {
  const result = mint()!;
  for (const signedUrl of ['wss://api.elevenlabs.io.evil.test/v1/convai/conversation?agent_id=x&conversation_signature=y', 'https://api.elevenlabs.io/v1/convai/conversation?agent_id=x&conversation_signature=y', 'wss://api.elevenlabs.io/v1/convai/conversation?agent_id=x&agent_id=z&conversation_signature=y']) {
    expect(api.CoachBrowserResultSchema.safeParse({ ...result, connection: { transport: 'websocket', signedUrl } }).success).toBe(false);
  }
  expect(api.CoachBrowserResultSchema.safeParse({ ...result, expiresAt: new Date(time + 900001).toISOString() }).success).toBe(false);
});

it('requires matching measure identity, version, unit and pinned bounds', () => {
  const session = view(), m = session.measures[0]!;
  expect(api.CoachBrowserSessionSchema.safeParse(session).success).toBe(true);
  for (const changed of [{ ...m, measureId: 'unknown-measure' }, { ...m, definitionVersion: 'other-version' },
    { ...m, unit: 'other-unit' }, { ...m, value: { kind: 'known', value: session.measureDefinitions[0]!.max + 1, confidence: null } }]) {
    expect(api.CoachBrowserSessionSchema.safeParse({ ...session, measures: [changed] }).success).toBe(false);
  }
  expect(api.CoachBrowserSessionSchema.safeParse({ ...session, measureDefinitions: [...session.measureDefinitions, ...session.measureDefinitions] }).success).toBe(false);
});
it('requires original execution before exposing a plan revision', () => {
  const r = f.CoachSessionPlanRevision;
  const revision = { sequence: r.sequence, appliedAt: r.appliedAt, effectiveFromSeconds: r.effectiveFromSeconds,
    segments: r.segments, totalSeconds: r.totalSeconds, decisionCodes: r.decisionCodes };
  const session = api.projectCoachBrowserSession({ ...state, lifecycle: 'executing', initialSnapshot: snapshot, measures: [] }, sessionRef);
  expect(api.CoachBrowserSessionSchema.safeParse({ ...session, revision: r.sequence, latestRevision: revision }).success).toBe(true);
  expect(api.CoachBrowserSessionSchema.safeParse({ ...session, revision: r.sequence, execution: null, latestRevision: revision }).success).toBe(false);
  expect(api.CoachBrowserSessionSchema.safeParse({ ...session, revision: 0, latestRevision: revision }).success).toBe(false);
});
it('keeps server practice duration and completion credit consistent', () => {
  const start = opening.openedAt, end = new Date(Date.parse(start) + 1000).toISOString();
  const session = { ...view(), practice: { startedAt: start, endedAt: end, guidedSeconds: 1, wakeSeconds: 0 } };
  expect(api.CoachBrowserSessionSchema.safeParse(session).success).toBe(true);
  expect(api.CoachBrowserSessionSchema.safeParse({ ...session, practice: { ...session.practice, guidedSeconds: 2 } }).success).toBe(false);
  expect(api.CoachBrowserSessionSchema.safeParse({ ...session, accounting: { outcome: 'interrupted', progressionCredit: true } }).success).toBe(false);
  expect(api.CoachBrowserSessionSchema.safeParse({ ...session, lifecycle: 'closed', accounting: null }).success).toBe(false);
});
it('rejects a public quota exceeding remaining or share budget', () => {
  const value = { status: 'known', asOf: opening.openedAt, remainingSeconds: 30, shareLimitSeconds: 20, limitSeconds: 20 };
  expect(api.CoachBrowserBudgetSchema.safeParse(value).success).toBe(true);
  expect(api.CoachBrowserBudgetSchema.safeParse({ ...value, limitSeconds: 21 }).success).toBe(false);
  expect(api.CoachBrowserBudgetSchema.safeParse({ ...value, remainingSeconds: 19 }).success).toBe(false);
});
