import { z } from 'zod';
import { CapabilityCallIdentitySchema } from '../capability-call-identity.js';
import { CapabilityAgentIdSchema } from '../ricerca/agent-config.js';
import { CompetenceNodeViewSchema } from './competence.js';

/**
 * Growth history complements src/http/endpoints/internal-capability-agent.ts:102,
 * whose growth snapshot carries only agentId. Scores reuse the competence view
 * in src/capability/lab/competence.ts:15 (score at line 22).
 * Callers must verify scope against trusted identity before accessing storage;
 * the same agentId under another tenant or owner identifies a different notebook.
 */
export const LabScopeSchema = z.object({
  tenantId: CapabilityCallIdentitySchema.shape.tenantId.refine(value => value.trim().length > 0),
  ownerId: CapabilityCallIdentitySchema.shape.ownerId.refine(value => value.trim().length > 0),
  agentId: CapabilityAgentIdSchema,
}).strict();
export type LabScope = z.infer<typeof LabScopeSchema>;

export const LabGrowthPointSchema = z.object({
  at: z.iso.datetime({ offset: true }),
  method: z.string().trim().min(1),
  methodVersion: z.string().trim().min(1),
  numerator: z.number().int().nonnegative(),
  denominator: z.number().int().nonnegative(),
  score: CompetenceNodeViewSchema.shape.score.nullable(),
}).strict();
export type LabGrowthPoint = z.infer<typeof LabGrowthPointSchema>;

const CursorSchema = z.string().min(1);

export const LabGrowthHistoryInputSchema = z.object({
  scope: LabScopeSchema,
  limit: z.number().int().min(1).max(500).default(100),
  cursor: CursorSchema.optional(),
}).strict();
export type LabGrowthHistoryInput = z.infer<typeof LabGrowthHistoryInputSchema>;

export const LabGrowthHistoryOutputSchema = z.object({
  snapshotVersion: z.number().int().nonnegative(),
  scope: LabScopeSchema,
  points: z.array(LabGrowthPointSchema).max(500),
  /** Null means there is no subsequent page. */
  nextCursor: CursorSchema.nullable(),
  /** Empty notebook and unavailable measurement are distinct results. */
  state: z.enum(['empty', 'unavailable', 'ok']),
}).strict();
export type LabGrowthHistoryOutput = z.infer<typeof LabGrowthHistoryOutputSchema>;
