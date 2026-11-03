import { z } from 'zod';
import { CoachSessionExecutionSnapshotSchema, CoachSessionPlanRevisionSchema, isCoachExecutionSnapshotForOpening, isCoachSessionPlanRevisionForSnapshot } from '../execution.js';
import { RefId } from '../shared.js';
import { CoachOperationalCommandMetadataSchema, result, DecisionCodes, sameValue } from './common.js';
import { CoachProgramInputEnvelopeSchema, CoachProgramProjectionSchema } from './conversation.js';
export const CoachExecutionStartRequestSchema = CoachOperationalCommandMetadataSchema;
export type CoachExecutionStartRequest = z.infer<typeof CoachExecutionStartRequestSchema>;
export const CoachExecutionStartResultSchema = z.object({
  ok: z.literal(true), requestId: RefId, replayed: z.boolean(), snapshot: CoachSessionExecutionSnapshotSchema,
  revision: z.number().int().positive(), projection: CoachProgramProjectionSchema,
}).strict().refine(x => sameValue(x.projection.strategy, x.snapshot.opening.program.strategy), 'Execution uses pinned strategy');
export type CoachExecutionStartResult = z.infer<typeof CoachExecutionStartResultSchema>;
export function isCoachExecutionStartResultForRequest(raw: unknown, expected: unknown): boolean {
  const value = CoachExecutionStartResultSchema.safeParse(raw), request = CoachExecutionStartRequestSchema.safeParse(expected);
  return value.success && request.success && value.data.requestId === request.data.requestId && value.data.revision > request.data.expectedRevision && isCoachExecutionSnapshotForOpening(value.data.snapshot, request.data.opening);
}
export const CoachExecutionEventRequestSchema = CoachOperationalCommandMetadataSchema.extend({ event: CoachProgramInputEnvelopeSchema }).strict();
export type CoachExecutionEventRequest = z.infer<typeof CoachExecutionEventRequestSchema>;
export const CoachExecutionEventResultSchema = z.object({
  ...result, initialSnapshot: CoachSessionExecutionSnapshotSchema.nullable(), appliedRevision: CoachSessionPlanRevisionSchema.nullable(),
  projection: CoachProgramProjectionSchema.nullable(), decisionCodes: DecisionCodes,
}).strict().refine(x => (x.initialSnapshot === null || isCoachExecutionSnapshotForOpening(x.initialSnapshot, x.opening))
  && (x.appliedRevision === null || (x.initialSnapshot !== null && isCoachSessionPlanRevisionForSnapshot(x.appliedRevision, x.initialSnapshot)))
  && (x.projection === null || sameValue(x.projection.strategy, x.opening.program.strategy)), 'Event preserves original execution and strategy');
export type CoachExecutionEventResult = z.infer<typeof CoachExecutionEventResultSchema>;
export function isCoachExecutionEventResultForRequest(raw: unknown, expected: unknown, originalSnapshot: unknown): boolean {
  const value = CoachExecutionEventResultSchema.safeParse(raw), request = CoachExecutionEventRequestSchema.safeParse(expected);
  if (!value.success || !request.success || value.data.requestId !== request.data.requestId || !sameValue(value.data.opening, request.data.opening)) return false;
  if (originalSnapshot === null) return value.data.initialSnapshot === null;
  const snapshot = CoachSessionExecutionSnapshotSchema.safeParse(originalSnapshot);
  return snapshot.success && sameValue(value.data.initialSnapshot, snapshot.data);
}
