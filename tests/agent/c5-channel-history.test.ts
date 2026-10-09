import { describe, expect, it } from 'vitest';
import { AgentChannelHistoryEntrySchema as Entry, AgentChannelHistoryResponseSchema as History,
  AgentChannelHistoryRoundTripEvidenceSchema as RoundTrip, isAgentChannelHistoryRoundTripVerified as roundTrip, isAgentChannelHistoryCurrent as current, isAgentChannelHistoryVerificationCurrent as verified } from '../../src/agent/agent-channel-history.js';
const binding = { scope: { tenantId: 'history-tenant', ownerId: 'history-owner', agentId: 'history-runtime' },
  identity: { managementAgentId: 'history-management', runtimeAgentId: 'history-runtime', vaultAgentId: 101 } };
const now = Date.parse('2026-10-08T12:01:00.000Z');
const startedAt = new Date(now - 60_000).toISOString(), endedAt = new Date(now).toISOString();
const row = { ...binding, entryId: 'history-entry', kind: 'phone', conversationId: 'history-conversation', requestId: 'history-probe',
  direction: 'outbound', participantName: 'Synthetic participant', status: 'completed', startedAt, endedAt, durationSeconds: 60,
  content: { audio: 'not-retained', transcript: 'available' } };
const probe = { requestId: row.requestId, entryId: row.entryId, completedAt: endedAt, outcome: 'completed' };
const history = { ...binding, status: 'available', kind: row.kind, observedAt: endedAt, entries: [row], total: 1, nextCursor: null, lastVerification: probe };
describe('C5 shared history for all four doors', () => {
  it.each(['telegram', 'email', 'phone', 'web'])('preserves canonical %s history and correlated verification', kind => {
    const value = { ...history, kind, entries: [{ ...row, kind }] };
    expect(History.safeParse(value).success).toBe(true); expect(History.parse(value)).toEqual(value);
    expect(current(value, binding, kind, now)).toBe(true); expect(verified(value, binding, kind, row.requestId, now)).toBe(true);
  });
  it('distinguishes attested empty, unknown total and unavailable source', () => {
    expect(History.safeParse({ ...history, entries: [], total: 0, lastVerification: null }).success).toBe(true);
    expect(current({ ...history, entries: [], total: null, lastVerification: null }, binding, row.kind, now)).toBe(true);
    const value = { ...binding, status: 'unavailable', kind: 'phone', observedAt: null, error: 'source_unavailable' };
    expect(History.safeParse(value).success).toBe(true); expect(current(value, binding, row.kind, now)).toBe(false);
    expect(History.safeParse({ ...value, entries: [] }).success).toBe(false);
  });
  it.each(['active', 'unknown'])('keeps %s timing unknown and never fabricates success', status => {
    const entry = { ...row, status, endedAt: null, durationSeconds: null };
    expect(Entry.safeParse(entry).success).toBe(true);
    expect(Entry.safeParse({ ...entry, endedAt }).success).toBe(false);
    expect(Entry.safeParse({ ...entry, durationSeconds: 0 }).success).toBe(false);
    expect(History.safeParse({ ...history, entries: [entry] }).success).toBe(false);
  });
  it.each(['completed', 'failed'])('requires an attested terminal time for %s', status => {
    expect(Entry.safeParse({ ...row, status, durationSeconds: null }).success).toBe(true);
    expect(Entry.safeParse({ ...row, status, endedAt: null }).success).toBe(false);
  });
  it('rejects backwards terminal time and duration beyond attested elapsed time', () => {
    expect(Entry.safeParse({ ...row, endedAt: new Date(now - 60_001).toISOString(), durationSeconds: null }).success).toBe(false);
    expect(Entry.safeParse({ ...row, durationSeconds: 60.001 }).success).toBe(false);
    expect(Entry.safeParse({ ...row, durationSeconds: 0 }).success).toBe(true);
    expect(Entry.safeParse({ ...row, durationSeconds: -1 }).success).toBe(false);
  });
  it.each(['tenantId', 'ownerId', 'agentId'])('refuses a historical row from another %s', key => {
    const scope = { ...binding.scope, [key]: 'other-history' };
    const identity = key === 'agentId' ? { ...binding.identity, runtimeAgentId: 'other-history' } : binding.identity;
    const entry = { ...row, scope, identity };
    expect(Entry.safeParse(entry).success).toBe(true); expect(History.safeParse({ ...history, entries: [entry] }).success).toBe(false);
  });
  it.each(['managementAgentId', 'vaultAgentId'])('rejects historical row with another %s', key => {
    const entry = { ...row, identity: { ...binding.identity, [key]: key === 'vaultAgentId' ? 102 : 'other-history' } };
    expect(Entry.safeParse(entry).success).toBe(true); expect(History.safeParse({ ...history, entries: [entry] }).success).toBe(false);
  });
  it('rejects mixed doors, duplicate entries, invented totals and cursor without entries', () => {
    expect(History.safeParse({ ...history, entries: [{ ...row, kind: 'web' }] }).success).toBe(false);
    expect(History.safeParse({ ...history, entries: [row, row], total: 2 }).success).toBe(false);
    expect(History.safeParse({ ...history, total: 0 }).success).toBe(false);
    expect(History.safeParse({ ...history, entries: [], lastVerification: null, nextCursor: 'cursor-history' }).success).toBe(false);
    expect(History.safeParse({ ...history, entries: Array.from({ length: 100 }, (_, i) => ({ ...row, entryId: 'entry-history-' + i })), total: 100, lastVerification: null }).success).toBe(true);
    expect(History.safeParse({ ...history, entries: Array.from({ length: 101 }, (_, i) => ({ ...row, entryId: 'entry-history-' + i })), total: 101, lastVerification: null }).success).toBe(false);
  });
  it('does not observe future starts or endings', () => {
    expect(History.safeParse({ ...history, observedAt: new Date(now - 1).toISOString() }).success).toBe(false);
    expect(History.safeParse({ ...history, entries: [{ ...row, status: 'active', startedAt: new Date(now + 1).toISOString(), endedAt: null, durationSeconds: null }], lastVerification: null }).success).toBe(false);
  });
  it.each(['entryId', 'requestId', 'completedAt', 'outcome'])('requires verification matching the terminal stored %s', key => {
    const value = { ...probe, [key]: key === 'completedAt' ? startedAt : key === 'outcome' ? 'failed' : 'different-history' };
    expect(History.safeParse({ ...history, lastVerification: value }).success).toBe(false);
  });
  it('does not turn a failed or old conversation into a new successful verification', () => {
    const value = { ...history, entries: [{ ...row, status: 'failed' }], lastVerification: { ...probe, outcome: 'failed' } };
    expect(History.safeParse(value).success).toBe(true); expect(verified(value, binding, row.kind, row.requestId, now)).toBe(false);
    expect(verified(history, binding, row.kind, 'different-history', now)).toBe(false);
    expect(verified({ ...history, lastVerification: null }, binding, row.kind, row.requestId, now)).toBe(false);
    expect(verified(history, binding, row.kind, row.requestId, now + 60_000)).toBe(false);
  });
  it('requires a recent completion independently of a newly refreshed history', () => {
    const refreshed = { ...history, observedAt: new Date(now + 60_000).toISOString() };
    expect(current(refreshed, binding, row.kind, now + 60_000)).toBe(true);
    expect(verified(refreshed, binding, row.kind, row.requestId, now + 60_000)).toBe(false);
  });
  it('checks expected owner, management, vault, kind and finite fresh clock', () => {
    expect(current(history, { ...binding, scope: { ...binding.scope, ownerId: 'other-history' } }, row.kind, now)).toBe(false);
    expect(current(history, { ...binding, identity: { ...binding.identity, managementAgentId: 'other-history' } }, row.kind, now)).toBe(false);
    expect(current(history, { ...binding, identity: { ...binding.identity, vaultAgentId: 102 } }, row.kind, now)).toBe(false);
    expect(current(history, binding, 'web', now)).toBe(false);
    for (const time of [now - 1, now + 60_000, NaN, Infinity]) expect(current(history, binding, row.kind, time)).toBe(false);
    for (const maxAge of [0, -1, NaN, Infinity]) expect(current(history, binding, row.kind, now, maxAge)).toBe(false);
  });
  it.each([null, undefined, {}, { ...history, entries: 'invalid' }])('closes invalid history %j', value => {
    expect(current(value, binding, row.kind, now)).toBe(false); expect(verified(value, binding, row.kind, row.requestId, now)).toBe(false);
  });
  it('closes invalid binding, kind and expected request without fabricated evidence', () => {
    for (const value of [null, {}, { ...binding, identity: null }]) expect(current(history, value, row.kind, now)).toBe(false);
    for (const value of [null, 'voice', {}]) expect(current(history, binding, value, now)).toBe(false);
    for (const value of [null, '', {}]) expect(verified(history, binding, row.kind, value, now)).toBe(false);
    expect(verified({ ...binding, status: 'unavailable', kind: 'phone', observedAt: null, error: 'source_unavailable' }, binding, row.kind, row.requestId, now)).toBe(false);
  });
  it.each(['available', 'not-retained', 'expired', 'unavailable', 'not-applicable'])('preserves attested content state %s without transport artifacts', state => {
    const value = { ...row, content: { audio: state, transcript: state } }; expect(Entry.safeParse(value).success).toBe(true); expect(Entry.parse(value)).toEqual(value);
  });
  it('does not bypass the current full binding or requested door for verification', () => {
    expect(verified(history, { ...binding, scope: { ...binding.scope, ownerId: 'foreign-history' } }, row.kind, row.requestId, now)).toBe(false);
    expect(verified(history, binding, 'web', row.requestId, now)).toBe(false);
  });
  it('keeps incomplete identifiers, dates, totals and duration closed without hiding a legacy row', () => {
    for (const key of ['entryId', 'conversationId', 'requestId']) expect(Entry.safeParse({ ...row, [key]: '' }).success).toBe(false);
    expect(Entry.safeParse({ ...row, requestId: null }).success).toBe(true);
    for (const key of ['startedAt', 'endedAt']) expect(Entry.safeParse({ ...row, [key]: 'invalid-date' }).success).toBe(false);
    expect(History.safeParse({ ...history, observedAt: 'invalid-date' }).success).toBe(false);
    expect(History.safeParse({ ...history, total: 1.5 }).success).toBe(false);
    expect(Entry.safeParse({ ...row, durationSeconds: Infinity }).success).toBe(false);
    expect(History.safeParse({ ...history, lastVerification: { ...probe, unexpected: true } }).success).toBe(false);
  });
  it.each(['signedUrl', 'credentials', 'rawWebhook', 'audioUrl', 'transcript'])('rejects private/embedded %s in history', key => {
    expect(History.safeParse({ ...history, [key]: 'synthetic' }).success).toBe(false);
    expect(Entry.safeParse({ ...row, [key]: 'synthetic' }).success).toBe(false);
  });
  it('bounds content metadata and prohibits invalid direction, kind, names or bearer slots', () => {
    expect(Entry.safeParse({ ...row, content: { ...row.content, signedUrl: 'synthetic' } }).success).toBe(false);
    expect(Entry.safeParse({ ...row, content: { ...row.content, audio: 'ready' } }).success).toBe(false);
    expect(Entry.safeParse({ ...row, direction: 'public' }).success).toBe(false);
    expect(Entry.safeParse({ ...row, kind: 'voice' }).success).toBe(false);
    expect(Entry.safeParse({ ...row, participantName: 'x'.repeat(161) }).success).toBe(false);
  });
});


const owner = { tenantId: binding.scope.tenantId, ownerId: binding.scope.ownerId };
function configuration(kind = 'telegram') {
  const resource = kind === 'telegram' ? { agent_id: binding.scope.agentId, bot_username: 'history_synthetic_bot', created_at: startedAt }
    : { agent_id: binding.scope.agentId, provider_inbox_id: 'history-synthetic-inbox', address: 'history@example.test', display_name: null, created_at: startedAt };
  const policy = kind === 'telegram' ? { kind, mode: 'approved-chats', chats: [{ chatId: '12345678', type: 'private', name: 'Synthetic owner', admittedAt: startedAt }] } : { kind, mode: 'address-book' };
  return { ...binding, kind, desired: { version: 3, state: 'active' }, applied: { version: 3, state: 'active' },
    access: { desiredPolicy: policy, appliedPolicy: policy }, resource: { ...binding, kind, resource },
    observation: { channelId: 'history-channel', kind, state: 'loaded', loaded: true, readiness: 'ready' }, observedAt: endedAt, error: null };
}
function roundTripCase(kind = 'telegram') {
  const config = configuration(kind); const entry = { ...row, kind, direction: 'inbound' };
  const value = { ...history, kind, entries: [entry] };
  const evidence = { requestId: row.requestId, entryId: row.entryId, participant: kind === 'telegram' ? { kind: 'telegram', userId: '12345678' } : { kind: 'email', address: 'owner@example.test' }, configuration: { ...config, observedAt: startedAt }, owner, requestedAt: startedAt, receivedAt: startedAt,
    turnCompletedAt: new Date(now - 1).toISOString(), replyDeliveredAt: endedAt };
  return { config, value, evidence };
}
function checked(change: { value?: unknown; evidence?: unknown; config?: unknown; requestId?: unknown; kind?: unknown; at?: number; participant?: unknown } = {}) {
  const f = roundTripCase(); return roundTrip(change.value ?? f.value, binding, change.kind ?? 'telegram', change.requestId ?? row.requestId,
    change.evidence ?? f.evidence, change.config ?? f.config, change.participant ?? f.evidence.participant, change.at ?? now);
}
describe('C5 server attestation of a completed owner round trip', () => {
  it.each(['telegram', 'email'])('requires the actual %s inbound turn and delivered reply on the current canonical resource', kind => {
    const f = roundTripCase(kind); expect(RoundTrip.safeParse(f.evidence).success).toBe(true);
    expect(roundTrip(f.value, binding, kind, row.requestId, f.evidence, f.config, f.evidence.participant, now)).toBe(true);
  });
  it('keeps the proof private and refuses authority extras', () => {
    const f = roundTripCase(); expect(RoundTrip.safeParse({ ...f.evidence, credentials: {} }).success).toBe(false);
    expect(History.safeParse({ ...f.value, evidence: f.evidence }).success).toBe(false);
  });
  it.each(['requestId', 'entryId'])('correlates attestation %s exactly', key => {
    const f = roundTripCase(); expect(checked({ evidence: { ...f.evidence, [key]: 'different-history' } })).toBe(false);
  });
  it.each(['ownerId', 'tenantId'])('requires the resolved owner %s', key => {
    const f = roundTripCase(); expect(checked({ evidence: { ...f.evidence, owner: { ...owner, [key]: 'different-history' } } })).toBe(false);
  });
  it('requires an inbound record, not an outgoing accepted or delivered probe', () => {
    const f = roundTripCase(); expect(checked({ value: { ...f.value, entries: [{ ...f.value.entries[0], direction: 'outbound' }] } })).toBe(false);
  });
  it.each(['receivedAt', 'turnCompletedAt', 'replyDeliveredAt'])('requires attested stage %s', key => {
    const f = roundTripCase(); const evidence: Record<string, unknown> = { ...f.evidence }; delete evidence[key]; expect(RoundTrip.safeParse(evidence).success).toBe(false); expect(checked({ evidence })).toBe(false);
  });
  it('requires stage order and exact correlation to the stored start and ending', () => {
    const f = roundTripCase();
    expect(checked({ evidence: { ...f.evidence, requestedAt: endedAt } })).toBe(false);
    expect(checked({ evidence: { ...f.evidence, receivedAt: new Date(now - 60_001).toISOString() } })).toBe(false);
    expect(checked({ evidence: { ...f.evidence, turnCompletedAt: new Date(now + 1).toISOString() } })).toBe(false);
    expect(checked({ evidence: { ...f.evidence, replyDeliveredAt: new Date(now - 1).toISOString() } })).toBe(false);
  });
  it('refuses stale history, failed completion, a different requested operation and missing proof', () => {
    const f = roundTripCase(); expect(checked({ at: now + 60_000 })).toBe(false); expect(checked({ requestId: 'different-history' })).toBe(false);
    expect(checked({ evidence: {} })).toBe(false);
    expect(checked({ value: { ...f.value, entries: [{ ...f.value.entries[0], status: 'failed' }], lastVerification: { ...probe, outcome: 'failed' } } })).toBe(false);
  });
  it('cannot turn phone or web history into a verified TG/email round trip', () => {
    expect(checked({ kind: 'phone' })).toBe(false); expect(checked({ kind: 'web' })).toBe(false);
  });
  it('requires the frozen and current complete canonical resource and applied policy/version', () => {
    const f = roundTripCase();
    expect(checked({ config: { ...f.config, resource: { ...f.config.resource, resource: { ...f.config.resource.resource, bot_username: 'changed_history_bot' } } } })).toBe(false);
    expect(checked({ config: { ...f.config, desired: { version: 4, state: 'active' }, applied: { version: 4, state: 'active' } } })).toBe(false);
    expect(checked({ config: { ...f.config, desired: { version: 4, state: 'active' } } })).toBe(false);
    expect(checked({ config: { ...f.config, identity: { ...binding.identity, vaultAgentId: 102 }, resource: { ...f.config.resource, identity: { ...binding.identity, vaultAgentId: 102 } } } })).toBe(false);
    expect(checked({ config: { ...f.config, access: { desiredPolicy: { kind: 'telegram', mode: 'approved-chats', chats: [] }, appliedPolicy: { kind: 'telegram', mode: 'approved-chats', chats: [] } } } })).toBe(false);
  });
  it('requires fresh, loaded, ready, active, error-free current evidence', () => {
    const f = roundTripCase();
    expect(checked({ config: { ...f.config, observation: { ...f.config.observation, loaded: false } } })).toBe(false);
    expect(checked({ config: { ...f.config, observation: { ...f.config.observation, readiness: 'unknown' } } })).toBe(false);
    expect(checked({ config: { ...f.config, observation: { ...f.config.observation, state: 'unknown', loaded: null, readiness: 'unknown' } } })).toBe(false);
    expect(checked({ config: { ...f.config, observedAt: new Date(now - 60_001).toISOString() } })).toBe(false);
    expect(checked({ config: { ...f.config, observedAt: new Date(now + 1).toISOString() } })).toBe(false);
    expect(checked({ config: { ...f.config, error: { code: 'provider_unavailable', retryable: true } } })).toBe(false);
    expect(checked({ config: { ...f.config, resource: null, applied: null, access: { ...f.config.access, appliedPolicy: null } } })).toBe(false);
  });
  it('permits a fresh observation timestamp without substituting the applied identity/resource/policy', () => {
    const f = roundTripCase(); expect(checked({ config: { ...f.config, observedAt: new Date(now - 1).toISOString() } })).toBe(true);
  });
  it('binds the frozen and current configurations even when both belong to the same foreign agent', () => {
    const f = roundTripCase(); const scope = { ...binding.scope, ownerId: 'foreign-history-owner' };
    const foreign = { ...f.config, scope, resource: { ...f.config.resource, scope } };
    expect(RoundTrip.safeParse({ ...f.evidence, configuration: foreign }).success).toBe(true);
    expect(checked({ evidence: { ...f.evidence, configuration: { ...foreign, observedAt: startedAt } }, config: foreign })).toBe(false);
  });
  it('requires the declared historical kind to match both configurations', () => {
    const f = roundTripCase(); const value = { ...f.value, kind: 'email', entries: [{ ...f.value.entries[0], kind: 'email' }] };
    const participant = { kind: 'email', address: 'owner@example.test' };
    expect(checked({ value, kind: 'email', participant, evidence: { ...f.evidence, participant } })).toBe(false);
  });
  it('does not accept configuration evidence observed after the frozen request or a substituted runtime channel', () => {
    const f = roundTripCase();
    expect(checked({ evidence: { ...f.evidence, configuration: { ...f.evidence.configuration, observedAt: new Date(now - 59_999).toISOString() } } })).toBe(false);
    expect(checked({ config: { ...f.config, observation: { ...f.config.observation, channelId: 'changed-history-channel' } } })).toBe(false);
  });

  it('recognizes the registered owner rather than another admitted participant or arbitrary body target', () => {
    const f = roundTripCase();
    expect(checked({ participant: { kind: 'telegram', userId: '87654321' } })).toBe(false);
    expect(checked({ participant: { kind: 'telegram', userId: '-12345678' } })).toBe(false);
    expect(checked({ participant: {} })).toBe(false);
    expect(checked({ participant: { kind: 'email', address: 'owner@example.test' } })).toBe(false);
    expect(checked({ evidence: { ...f.evidence, participant: { kind: 'telegram', userId: '87654321' } } })).toBe(false);
  });
  it('normalizes the existing canonical owner mailbox but never permits a different authenticated sender', () => {
    const f = roundTripCase('email');
    expect(roundTrip(f.value, binding, 'email', row.requestId, f.evidence, f.config, { kind: 'email', address: 'OWNER@EXAMPLE.TEST' }, now)).toBe(true);
    expect(roundTrip(f.value, binding, 'email', row.requestId, f.evidence, f.config, { kind: 'email', address: 'other@example.test' }, now)).toBe(false);
  });

});
