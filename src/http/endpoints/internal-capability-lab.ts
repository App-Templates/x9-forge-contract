import { z } from 'zod';
import { CapabilityAgentParamsSchema } from './internal-capability-agent.js';
import {
  LabExportRequestSchema, LabExportResultSchema, LabPageDetailInputSchema,
  LabPageDetailOutputSchema, LabPageListInputSchema, LabPageListOutputSchema,
} from '../../capability/lab/browse.js';
import {
  LabGrowthHistoryInputSchema, LabGrowthHistoryOutputSchema, LabGrowthPointSchema, LabScopeSchema,
} from '../../capability/lab/growth.js';
import { LabCompetenceOutputSchema, LabGapsOutputSchema, LabToolErrorSchema } from '../../capability/lab/tools.js';
import { WikiPageSlugSchema } from '../../capability/lab/wiki.js';

/** Named failures for notebook HTTP reads and exports. */
export const LabHttpErrorSchema = z.object({
  ok: z.literal(false),
  error: z.enum([...LabToolErrorSchema.options, 'scope_foreign', 'unavailable', 'timeout']),
}).strict();

/** HTTP scope excludes the agent identity supplied by the route parameters. */
export const labScopeQuerySchema = LabScopeSchema.pick({ tenantId: true, ownerId: true }).strict();

/** List pages in the scoped agent notebook. */
export const labPagesContract = {
  method: 'GET',
  path: '/internal/capability/agents/:agentId/lab/pages',
  authType: 'secret',
  paramsSchema: CapabilityAgentParamsSchema,
  querySchema: labScopeQuerySchema.extend({
    limit: z.coerce.number().int().min(1).max(200).default(50),
    cursor: LabPageListInputSchema.shape.cursor,
  }).strict(),
  responseSchema: LabPageListOutputSchema,
  errorResponseSchema: LabHttpErrorSchema,
} as const;

/** Read a notebook page at its current or requested version. */
export const labPageDetailContract = {
  method: 'GET',
  path: '/internal/capability/agents/:agentId/lab/pages/:slug',
  authType: 'secret',
  paramsSchema: CapabilityAgentParamsSchema.extend({ slug: WikiPageSlugSchema }).strict(),
  querySchema: labScopeQuerySchema.extend({
    version: z.coerce.number().pipe(LabPageDetailInputSchema.shape.version.unwrap()).optional(),
  }).strict(),
  responseSchema: LabPageDetailOutputSchema,
  errorResponseSchema: LabHttpErrorSchema,
} as const;

/** Read paginated notebook growth measurements. */
export const labGrowthHistoryContract = {
  method: 'GET',
  path: '/internal/capability/agents/:agentId/lab/growth/history',
  authType: 'secret',
  paramsSchema: CapabilityAgentParamsSchema,
  querySchema: labScopeQuerySchema.extend({
    limit: z.coerce.number().int().min(1).max(500).default(100),
    cursor: LabGrowthHistoryInputSchema.shape.cursor,
  }).strict(),
  responseSchema: LabGrowthHistoryOutputSchema,
  errorResponseSchema: LabHttpErrorSchema,
} as const;

/** Read competence with its snapshot and measurement method. */
export const labCompetenceContract = {
  method: 'GET',
  path: '/internal/capability/agents/:agentId/lab/competence',
  authType: 'secret',
  paramsSchema: CapabilityAgentParamsSchema,
  querySchema: labScopeQuerySchema,
  responseSchema: LabCompetenceOutputSchema.extend({
    snapshotVersion: LabPageListOutputSchema.shape.snapshotVersion,
    method: LabGrowthPointSchema.shape.method,
    methodVersion: LabGrowthPointSchema.shape.methodVersion,
  }),
  errorResponseSchema: LabHttpErrorSchema,
} as const;

/** Read the notebook's open competence gaps. */
export const labGapsContract = {
  method: 'GET',
  path: '/internal/capability/agents/:agentId/lab/gaps',
  authType: 'secret',
  paramsSchema: CapabilityAgentParamsSchema,
  querySchema: labScopeQuerySchema.extend({ limit: z.coerce.number().int().min(1).max(50).optional() }).strict(),
  responseSchema: LabGapsOutputSchema.extend({ snapshotVersion: LabPageListOutputSchema.shape.snapshotVersion }),
  errorResponseSchema: LabHttpErrorSchema,
} as const;

/** Export a scoped notebook with the agent identity supplied only by the path. */
export const labExportContract = {
  method: 'POST',
  path: '/internal/capability/agents/:agentId/lab/export',
  authType: 'secret',
  paramsSchema: CapabilityAgentParamsSchema,
  bodySchema: LabExportRequestSchema.extend({ scope: labScopeQuerySchema }).strict(),
  responseSchema: LabExportResultSchema,
  errorResponseSchema: LabHttpErrorSchema,
} as const;
