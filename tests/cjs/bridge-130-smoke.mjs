import assert from 'node:assert/strict';
import * as agent from '@x9-forge/contracts/agent';
import * as http from '@x9-forge/contracts/http';

const legacy = { agents: [{ agentId: 'x9', displayName: 'Master Chief', ownerId: 'owner-1', runtimeStatus: 'bot-less', loaded: true }] };
assert.deepEqual(http.ListAgentsResponseSchema.parse(legacy), legacy);
assert.equal(http.getListAgentsRuntimeState(legacy, 'x9'), 'unknown');
assert.deepEqual(agent.AgentRuntimeIdentitySchema.parse({ managementAgentId: 'x9-staging', runtimeAgentId: 'x9' }), { managementAgentId: 'x9-staging', runtimeAgentId: 'x9' });
const runtime = { state: 'active', loadState: 'loaded', channelsComplete: true, channels: [{ channelId: 'web', kind: 'web', state: 'loaded', loaded: true, readiness: 'not-ready' }] };
assert.equal(agent.deriveAgentRuntimeState(agent.AgentRuntimeSnapshotSchema.parse(runtime)), 'active');
const payload = { agents: [{ ...legacy.agents[0], identity: { managementAgentId: 'x9-staging', runtimeAgentId: 'x9' }, runtime }], source: { authority: 'x9', availability: 'available', completeness: 'partial', observedAt: '2026-10-06T21:00:00Z' } };
assert.equal(http.getListAgentsRuntimeState(payload, 'x9-staging'), 'active');
assert.equal(http.getListAgentsRuntimeState(payload, 'another-agent'), 'unknown');
console.log('BRIDGE-130 ESM public subpaths: 6/6 assertions passed');
