import { z } from 'zod';
import { CapabilityAgentParamsSchema } from './internal-capability-agent.js';
import { CapabilityAgentScopeSchema, sameCapabilityScope } from '../../capability/capability-call-context.js';
import { DevProductionJobSchema } from '../../capability/dev/production-job.js';

export const DevProductionJobsPageSchema = z.strictObject({
  items: z.array(DevProductionJobSchema).max(50),
  nextCursor: z.string().trim().min(1).max(512).nullable(),
}).refine(page => new Set(page.items.map(job => job.jobId)).size === page.items.length, {
  message: 'Job IDs must be unique', path: ['items'],
}).refine(page => {
  const [first] = page.items;
  return first === undefined || page.items.every(job => sameCapabilityScope(job.scope, first.scope));
}, {
  message: 'All jobs must have the same scope', path: ['items'],
});
export type DevProductionJobsPage = z.infer<typeof DevProductionJobsPageSchema>;

/**
 * Read persisted assignments in a stable service-owned order with an opaque cursor.
 * The service must authenticate the owner and compare path agentId and query scope
 * with its registry, isolating both pagination and data between owners. Uniform page
 * scope alone does not authenticate or correlate a response with the request.
 * Reading never enqueues, retries or creates jobs. Use the existing progress detail
 * route and, when available, the result route; this list does not depend on results.
 */
export const listDevProductionJobsContract = {
  method: 'GET' as const,
  path: '/internal/capability/agents/:agentId/dev/jobs' as const,
  authType: 'secret' as const,
  paramsSchema: CapabilityAgentParamsSchema.strict(),
  querySchema: z.strictObject({
    scope: CapabilityAgentScopeSchema,
    cursor: z.string().trim().min(1).max(512).optional(),
    limit: z.number().int().min(1).max(50).default(20),
  }),
  responseSchema: DevProductionJobsPageSchema,
} as const;

export type ListDevProductionJobsQueryInput = z.input<typeof listDevProductionJobsContract.querySchema>;

/**
 * Accept a jobs page only when it is valid, within the requested limit and entirely in the requested
 * scope. Returns a detached parsed copy (order, cursor and content intact) or null; foreign rows are
 * never filtered out and errors never become an empty page. The authenticated owner and the cursor stay
 * the server's responsibility: this check proves neither ownership, freshness nor global ordering.
 */
export function selectDevProductionJobsPage(rawPage: unknown, expectedQuery: ListDevProductionJobsQueryInput): DevProductionJobsPage | null {
  const query = listDevProductionJobsContract.querySchema.safeParse(expectedQuery);
  const page = DevProductionJobsPageSchema.safeParse(rawPage);
  if (!query.success || !page.success) return null;
  if (page.data.items.length > query.data.limit) return null;
  if (!page.data.items.every(job => sameCapabilityScope(job.scope, query.data.scope))) return null;
  return page.data;
}
