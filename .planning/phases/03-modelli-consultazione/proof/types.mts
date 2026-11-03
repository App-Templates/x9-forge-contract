import { AgentModelsOverviewSchema, AgentModelsOverviewCoverageSchema, type AgentModelsOverviewCoverage, type AgentModelBinding } from '@x9-forge/contracts/model-router';
const coverage: AgentModelsOverviewCoverage = AgentModelsOverviewCoverageSchema.parse({ identity: {managementAgentId: 'agent-a', runtimeAgentId: 'runtime-a'}, ownerId: 'owner-a', status: 'complete', missingSlots: [], reason: null });
AgentModelsOverviewSchema.parse({ version: 'v1', observedAt: '2026-10-09T13:00:00Z', rows: [], coverage: [coverage] });
// @ts-expect-error Unknown is a read-side origin, never a writable binding.
const origin: AgentModelBinding['origin'] = 'unknown';
void origin;
