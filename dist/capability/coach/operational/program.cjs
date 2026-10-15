"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachProgramApplyResultSchema = exports.CoachProgramApplyRequestSchema = void 0;
exports.matchesProgram = matchesProgram;
exports.isCoachProgramApplyResultForRequest = isCoachProgramApplyResultForRequest;
const zod_1 = require("zod");
const index_js_1 = require("../index.cjs");
const program_version_js_1 = require("../program-version.cjs");
const shared_js_1 = require("../shared.cjs");
const programFields = { program: program_version_js_1.CoachProgramVersionRefSchema, definition: index_js_1.CoachProgramSchema };
function matchesProgram(x) {
    return (0, shared_js_1.sameValue)(x.program.scope, x.definition.scope) && x.program.programId === x.definition.programId && x.program.programVersion === x.definition.version;
}
exports.CoachProgramApplyRequestSchema = zod_1.z.object({
    requestId: shared_js_1.RefId, ...programFields, expectedProgramVersion: index_js_1.CoachProgramSchema.shape.version.nullable(),
}).strict().refine(matchesProgram, 'Definition matches pinned program');
exports.CoachProgramApplyResultSchema = zod_1.z.object({
    ok: zod_1.z.literal(true), requestId: shared_js_1.RefId, replayed: zod_1.z.boolean(), ...programFields,
}).strict().refine(matchesProgram, 'Applied definition matches pinned program');
function isCoachProgramApplyResultForRequest(raw, expected) {
    const value = exports.CoachProgramApplyResultSchema.safeParse(raw), request = exports.CoachProgramApplyRequestSchema.safeParse(expected);
    return value.success && request.success && value.data.requestId === request.data.requestId && (0, shared_js_1.sameValue)(value.data.program, request.data.program) && (0, shared_js_1.sameValue)(value.data.definition, request.data.definition);
}
//# sourceMappingURL=program.js.map