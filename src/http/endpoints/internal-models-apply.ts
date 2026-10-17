import {z} from 'zod';
import {INTERNAL_SECRET_HEADER} from '../../auth/index.js';
import {AgentIdSchema} from '../../agent/agent-identity.js';
import {AgentManagementRequestIdSchema, AgentManagementReasonSchema} from '../../agent/agent-management.js';
import {AgentConfigVersionSchema} from '../../capability/ricerca/agent-config.js';
import {AgentModelsConfigurationSchema} from '../../model-router/agent-model-configuration-values.js';
import {ModelsTargetSchema, ModelsApplyJobSchema} from '../../model-router/models-target.js';
export const ModelsApplyHeirSchema = z.union([AgentIdSchema, z.object({
  agentId: AgentIdSchema, requestId: AgentManagementRequestIdSchema,
  desiredVersion: AgentConfigVersionSchema, configuration: AgentModelsConfigurationSchema,
}).strict()]);
export type ModelsApplyHeir = z.infer<typeof ModelsApplyHeirSchema>;
export const ModelsApplyRequestSchema = z.object({
  requestId: AgentManagementRequestIdSchema, target: ModelsTargetSchema,
  desiredVersion: AgentConfigVersionSchema, configuration: AgentModelsConfigurationSchema,
  heirs: z.array(ModelsApplyHeirSchema).max(2048).optional(),
}).strict().superRefine((request, ctx) => {
  if (request.heirs && new Set(request.heirs.map(heir => typeof heir === 'string' ? heir : heir.agentId)).size !== request.heirs.length) ctx.addIssue({code: 'custom', path: ['heirs'], message: 'An heir occurs once per apply request'});
});
export type ModelsApplyRequest = z.infer<typeof ModelsApplyRequestSchema>;
/** Accepted means queued; this receipt never claims consumer installation. */
export const ModelsApplyResponseSchema = z.object({
  ok: z.boolean(), requestId: AgentManagementRequestIdSchema,
  outcome: z.enum(['accepted', 'error']), reason: AgentManagementReasonSchema.optional(),
}).strict().superRefine((result, ctx) => {
  if (result.ok !== (result.outcome === 'accepted')) ctx.addIssue({code: 'custom', path: ['ok'], message: 'Only accepted admission is successful'});
});
export type ModelsApplyResponse = z.infer<typeof ModelsApplyResponseSchema>;
export const internalModelsApplyContract = {
  method: 'POST' as const, path: '/internal/models/apply' as const,
  authType: 'secret' as const, authHeader: INTERNAL_SECRET_HEADER,
  bodySchema: ModelsApplyRequestSchema, responseSchema: ModelsApplyResponseSchema,
} as const;
export const internalModelsApplyJobContract = {
  method: 'GET' as const, path: '/internal/models/apply/:requestId' as const,
  authType: 'secret' as const, authHeader: INTERNAL_SECRET_HEADER,
  paramsSchema: z.object({requestId: AgentManagementRequestIdSchema}).strict(), responseSchema: ModelsApplyJobSchema,
} as const;
export function modelsApplyJobPath(requestId: string): string {
  return internalModelsApplyJobContract.path.replace(':requestId', internalModelsApplyJobContract.paramsSchema.parse({requestId}).requestId);
}
