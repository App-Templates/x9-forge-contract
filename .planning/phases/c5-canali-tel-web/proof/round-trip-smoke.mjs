import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const variants = [['esm', await import('../../../../dist/agent/index.js')],['cjs',require('../../../../dist/agent/index.cjs')]];
const binding = { scope: { tenantId: 'history-tenant', ownerId: 'history-owner', agentId: 'history-runtime' },
  identity: { managementAgentId: 'history-management', runtimeAgentId: 'history-runtime', vaultAgentId: 101 } };
const now = Date.parse('2026-10-08T12:01:00.000Z');
const startedAt = new Date(now - 60_000).toISOString(), endedAt = new Date(now).toISOString();
const row = { ...binding, entryId: 'history-entry', kind: 'phone', conversationId: 'history-conversation', requestId: 'history-probe',
  direction: 'outbound', participantName: 'Synthetic participant', status: 'completed', startedAt, endedAt, durationSeconds: 60,
  content: { audio: 'not-retained', transcript: 'available' } };
const probe = { requestId: row.requestId, entryId: row.entryId, completedAt: endedAt, outcome: 'completed' };
const history = { ...binding, status: 'available', kind: row.kind, observedAt: endedAt, entries: [row], total: 1, nextCursor: null, lastVerification: probe };
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

let checks = 0;
for (const [format, api] of variants.filter(([format]) => !process.argv[2] || process.argv[2] === format)) {
  assert.equal(typeof api.isAgentChannelHistoryRoundTripVerified, 'function', format+': public roundtrip guard'); checks++;
  const f = roundTripCase(); const participant = f.evidence.participant;
  assert.equal(api.AgentChannelHistoryRoundTripEvidenceSchema.safeParse(f.evidence).success, true, format+': canonical proof'); checks++;
  assert.equal(api.isAgentChannelHistoryRoundTripVerified(f.value,binding,'telegram',row.requestId,f.evidence,f.config,participant,now),true,format+': completed owner roundtrip'); checks++;
  assert.equal(api.isAgentChannelHistoryRoundTripVerified(f.value,binding,'telegram',row.requestId,f.evidence,f.config,{kind:'telegram',userId:'87654321'},now),false,format+': other admitted sender is not owner'); checks++;
  const config = {...f.config, resource:{...f.config.resource,resource:{...f.config.resource.resource,bot_username:'changed_history_bot'}}};
  assert.equal(api.isAgentChannelHistoryRoundTripVerified(f.value,binding,'telegram',row.requestId,f.evidence,config,participant,now),false,format+': changed resource cannot verify'); checks++;
  const evidence = {...f.evidence}; delete evidence.turnCompletedAt;
  assert.equal(api.isAgentChannelHistoryRoundTripVerified(f.value,binding,'telegram',row.requestId,evidence,f.config,participant,now),false,format+': delivery without turn is not proof'); checks++;
  assert.equal(api.AgentChannelHistoryResponseSchema.safeParse({...f.value,evidence:f.evidence}).success,false,format+': proof never in public history'); checks++;
  assert.equal(api.isAgentChannelHistoryRoundTripVerified({...f.value,entries:[{...f.value.entries[0],direction:'outbound'}]},binding,'telegram',row.requestId,f.evidence,f.config,participant,now),false,format+': outgoing delivery awaits owner ingress'); checks++;
}
console.log(JSON.stringify({checks,total:process.argv[2]?8:16,status:'passed'}));
