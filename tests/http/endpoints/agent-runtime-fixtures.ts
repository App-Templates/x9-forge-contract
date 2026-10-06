export function runtimeRow() {
  return {
    agentId: 'x9', displayName: 'Master Chief', ownerId: 'owner-1',
    identity: { managementAgentId: 'x9-staging', runtimeAgentId: 'x9' },
    runtime: {
      state: 'active' as const, loadState: 'loaded' as const, channelsComplete: true,
      channels: [{ channelId: 'web', kind: 'web' as const, state: 'loaded' as const,
        loaded: true, readiness: 'ready' as const }],
    },
  };
}

export function runtimeList() {
  return {
    agents: [runtimeRow()],
    source: { authority: 'x9' as const, availability: 'available' as const,
      completeness: 'complete' as const, observedAt: '2026-10-06T21:00:00Z' },
  };
}
