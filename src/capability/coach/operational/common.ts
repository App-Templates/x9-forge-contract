import { z } from 'zod';
import { CoachSessionOpeningRefSchema, type CoachSessionOpeningRef } from '../execution.js';
import { RefId, DecisionCodes, sameValue } from '../shared.js';
import { sameCapabilityScope } from '../../capability-call-context.js';
export const RevisionNumber = z.number().int().nonnegative();
export const CoachOperationalCommandMetadataSchema = z.object({
  requestId: RefId, opening: CoachSessionOpeningRefSchema, expectedRevision: RevisionNumber,
}).strict();
export type CoachOperationalCommandMetadata = z.infer<typeof CoachOperationalCommandMetadataSchema>;
export const result = { ok: z.literal(true), requestId: RefId, replayed: z.boolean(), opening: CoachSessionOpeningRefSchema, revision: RevisionNumber };
export { DecisionCodes, sameValue };
export function forOpening(record: { scope: CoachSessionOpeningRef['scope']; sessionId: string; openingId: string }, opening: CoachSessionOpeningRef) {
  return sameCapabilityScope(record.scope, opening.scope) && record.sessionId === opening.sessionId && record.openingId === opening.openingId;
}
