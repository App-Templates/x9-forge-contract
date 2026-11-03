import { z } from 'zod';
import { CoachSessionOpeningRefSchema } from "../execution.js";
import { RefId, DecisionCodes, sameValue } from "../shared.js";
import { sameCapabilityScope } from "../../capability-call-context.js";
export const RevisionNumber = z.number().int().nonnegative();
export const CoachOperationalCommandMetadataSchema = z.object({
    requestId: RefId, opening: CoachSessionOpeningRefSchema, expectedRevision: RevisionNumber,
}).strict();
export const result = { ok: z.literal(true), requestId: RefId, replayed: z.boolean(), opening: CoachSessionOpeningRefSchema, revision: RevisionNumber };
export { DecisionCodes, sameValue };
export function forOpening(record, opening) {
    return sameCapabilityScope(record.scope, opening.scope) && record.sessionId === opening.sessionId && record.openingId === opening.openingId;
}
//# sourceMappingURL=common.js.map