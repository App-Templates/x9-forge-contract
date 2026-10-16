import { z } from 'zod';
import { CapabilityAgentParamsSchema } from './internal-capability-agent.js';
import { CapabilityAgentScopeSchema } from '../../capability/capability-call-context.js';
import { DevProductionJobSchema } from '../../capability/dev/production-job.js';
import { DevProductionProgressSchema } from '../../capability/dev/production-progress.js';

/**
 * Read progress on demand, ordered by the domain snapshot sequence; no new event channel.
 * The backend authenticates the owner and compares path and scope with the persisted
 * record, returning only that snapshot. A poll neither enqueues work nor starts retries
 * nor certifies completion. Missing or foreign records produce a service-owned 404,
 * never a fabricated queued snapshot.
 */
export const getDevProductionProgressContract = {
  method: 'GET' as const,
  path: '/internal/capability/agents/:agentId/dev/jobs/:jobId/progress' as const,
  authType: 'secret' as const,
  paramsSchema: z.object({
    agentId: CapabilityAgentParamsSchema.shape.agentId,
    jobId: DevProductionJobSchema.shape.jobId,
  }).strict(),
  querySchema: z.object({ scope: CapabilityAgentScopeSchema }).strict(),
  responseSchema: DevProductionProgressSchema,
} as const;
