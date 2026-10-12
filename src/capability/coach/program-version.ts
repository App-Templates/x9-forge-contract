import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-context.js';
import { CoachProgramIdSchema, CoachProgramSchema } from './index.js';
import { Text128 } from './shared.js';
export const CoachStrategyRefSchema = z.object({
  strategyId: CoachProgramIdSchema, strategyVersion: Text128,
}).strict();
export type CoachStrategyRef = z.infer<typeof CoachStrategyRefSchema>;
export const CoachProgramVersionRefSchema = z.object({
  scope: CapabilityAgentScopeSchema, programId: CoachProgramIdSchema,
  programVersion: CoachProgramSchema.shape.version, strategy: CoachStrategyRefSchema,
  catalogRevision: Text128, policyRevision: Text128, progressionRevision: Text128, measureDefinitionRevision: Text128,
}).strict();
export type CoachProgramVersionRef = z.infer<typeof CoachProgramVersionRefSchema>;
