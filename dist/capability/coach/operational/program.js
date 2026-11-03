import { z } from 'zod';
import { CoachProgramSchema } from "../index.js";
import { CoachProgramVersionRefSchema } from "../program-version.js";
import { RefId, sameValue } from "../shared.js";
const programFields = { program: CoachProgramVersionRefSchema, definition: CoachProgramSchema };
export function matchesProgram(x) {
    return sameValue(x.program.scope, x.definition.scope) && x.program.programId === x.definition.programId && x.program.programVersion === x.definition.version;
}
export const CoachProgramApplyRequestSchema = z.object({
    requestId: RefId, ...programFields, expectedProgramVersion: CoachProgramSchema.shape.version.nullable(),
}).strict().refine(matchesProgram, 'Definition matches pinned program');
export const CoachProgramApplyResultSchema = z.object({
    ok: z.literal(true), requestId: RefId, replayed: z.boolean(), ...programFields,
}).strict().refine(matchesProgram, 'Applied definition matches pinned program');
export function isCoachProgramApplyResultForRequest(raw, expected) {
    const value = CoachProgramApplyResultSchema.safeParse(raw), request = CoachProgramApplyRequestSchema.safeParse(expected);
    return value.success && request.success && value.data.requestId === request.data.requestId && sameValue(value.data.program, request.data.program) && sameValue(value.data.definition, request.data.definition);
}
//# sourceMappingURL=program.js.map