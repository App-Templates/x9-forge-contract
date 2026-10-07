export const scope = { tenantId: 'tenant-review', ownerId: 'owner-review', agentId: 'agent-review' };
export const identity = { managementAgentId: 'forge-review', runtimeAgentId: scope.agentId };
export const instant = '2026-10-07T00:00:00Z';
export function channel(kind: 'telegram' | 'email' = 'telegram') {
  const resource = kind === 'telegram'
    ? { agent_id: scope.agentId, bot_username: 'review_bot', created_at: instant }
    : { agent_id: scope.agentId, provider_inbox_id: 'inbox-review', address: 'review@example.com', display_name: null, created_at: instant };
  return { kind, scope, identity, desired: { version: 2, state: 'paused' }, applied: { version: 2, state: 'paused' },
    resource: { kind, scope, identity, resource }, observation: { channelId: kind, kind, state: 'paused', loaded: false, readiness: 'not-ready' }, observedAt: instant, error: null };
}
export const context = { agentId: scope.agentId, ownerId: scope.ownerId, tenantId: scope.tenantId, credentials: {},
  llmConfig: { provider: 'synthetic', model: 'synthetic' }, telegramAllowFrom: [], workspacePath: '/synthetic/workspace', registryPath: '/synthetic/registry.json', displayName: 'Review' };
export const request = { name: 'Review', selectedCapabilities: ['cap-email'], telegram_allow_from: [], intent: {
  idempotencyKey: 'create-000001', scope, identity, source: { managementAgentId: 'x9-staging', runtimeAgentId: 'x9' },
  configVersion: 2, channels: { telegram: 'paused', email: 'paused' } } };
export function checkpoint() {
  return { jobId: 'job-review-001', request, agentRecordId: 101, phase: 'completed', channels: [channel(), channel('email')],
    firstCheck: { checkedAt: instant, channel: { channelId: 'web', kind: 'web', state: 'loaded', loaded: true, readiness: 'ready' }, error: null }, failure: null };
}
