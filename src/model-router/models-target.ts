import {z} from 'zod';
import {AgentIdSchema} from '../agent/agent-identity.js';
import {AgentManagementCommandResultSchema, AgentManagementReasonSchema} from '../agent/agent-management.js';
import {AgentModelRuntimeAttestationSchema, AgentModelsPendingWorkSchema} from './agent-model-configuration.js';
/** The platform defaults target the stack; execution identity remains in the configuration. */
export const ModelsTargetSchema = z.discriminatedUnion('scope', [
  z.object({scope: z.literal('stack')}).strict(),
  z.object({scope: z.literal('agent'), agentId: AgentIdSchema}).strict(),
]);
export type ModelsTarget = z.infer<typeof ModelsTargetSchema>;
export const ModelsApplyStateSchema = z.enum(['queued', 'applying', 'applied', 'failed', 'unchanged']);
export type ModelsApplyState = z.infer<typeof ModelsApplyStateSchema>;
/** Public job progress includes child outcomes, never a reassignment of the stack's execution identity. */
export const ModelsApplyJobSchema = AgentModelsPendingWorkSchema.safeExtend({
  target: ModelsTargetSchema,
  state: ModelsApplyStateSchema.optional(),
  result: AgentManagementCommandResultSchema.nullable().optional(),
  runtime: AgentModelRuntimeAttestationSchema.nullable().optional(),
  children: z.array(z.object({agentId: AgentIdSchema, state: ModelsApplyStateSchema,
    reason: AgentManagementReasonSchema.optional(),
    result: AgentManagementCommandResultSchema.nullable().optional(),
    runtime: AgentModelRuntimeAttestationSchema.nullable().optional(),
  }).strict()).max(2048),
}).superRefine((job, ctx) => {
  if (new Set(job.children.map(child => child.agentId)).size !== job.children.length) ctx.addIssue({code: 'custom', path: ['children'], message: 'A child agent occurs once per job'});
});
export type ModelsApplyJob = z.infer<typeof ModelsApplyJobSchema>;
