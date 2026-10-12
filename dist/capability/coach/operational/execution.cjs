"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachExecutionEventResultSchema = exports.CoachExecutionEventRequestSchema = exports.CoachExecutionStartResultSchema = exports.CoachExecutionStartRequestSchema = void 0;
exports.isCoachExecutionStartResultForRequest = isCoachExecutionStartResultForRequest;
exports.isCoachExecutionEventResultForRequest = isCoachExecutionEventResultForRequest;
const zod_1 = require("zod");
const execution_js_1 = require("../execution.cjs");
const shared_js_1 = require("../shared.cjs");
const common_js_1 = require("./common.cjs");
const conversation_js_1 = require("./conversation.cjs");
exports.CoachExecutionStartRequestSchema = common_js_1.CoachOperationalCommandMetadataSchema;
exports.CoachExecutionStartResultSchema = zod_1.z.object({
    ok: zod_1.z.literal(true), requestId: shared_js_1.RefId, replayed: zod_1.z.boolean(), snapshot: execution_js_1.CoachSessionExecutionSnapshotSchema,
    revision: zod_1.z.number().int().positive(), projection: conversation_js_1.CoachProgramProjectionSchema,
}).strict().refine(x => (0, common_js_1.sameValue)(x.projection.strategy, x.snapshot.opening.program.strategy), 'Execution uses pinned strategy');
function isCoachExecutionStartResultForRequest(raw, expected) {
    const value = exports.CoachExecutionStartResultSchema.safeParse(raw), request = exports.CoachExecutionStartRequestSchema.safeParse(expected);
    return value.success && request.success && value.data.requestId === request.data.requestId && value.data.revision > request.data.expectedRevision && (0, execution_js_1.isCoachExecutionSnapshotForOpening)(value.data.snapshot, request.data.opening);
}
exports.CoachExecutionEventRequestSchema = common_js_1.CoachOperationalCommandMetadataSchema.extend({ event: conversation_js_1.CoachProgramInputEnvelopeSchema }).strict();
exports.CoachExecutionEventResultSchema = zod_1.z.object({
    ...common_js_1.result, initialSnapshot: execution_js_1.CoachSessionExecutionSnapshotSchema.nullable(), appliedRevision: execution_js_1.CoachSessionPlanRevisionSchema.nullable(),
    projection: conversation_js_1.CoachProgramProjectionSchema.nullable(), decisionCodes: common_js_1.DecisionCodes,
}).strict().refine(x => (x.initialSnapshot === null || (0, execution_js_1.isCoachExecutionSnapshotForOpening)(x.initialSnapshot, x.opening))
    && (x.appliedRevision === null || (x.initialSnapshot !== null && (0, execution_js_1.isCoachSessionPlanRevisionForSnapshot)(x.appliedRevision, x.initialSnapshot)))
    && (x.projection === null || (0, common_js_1.sameValue)(x.projection.strategy, x.opening.program.strategy)), 'Event preserves original execution and strategy');
function isCoachExecutionEventResultForRequest(raw, expected, originalSnapshot) {
    const value = exports.CoachExecutionEventResultSchema.safeParse(raw), request = exports.CoachExecutionEventRequestSchema.safeParse(expected);
    if (!value.success || !request.success || value.data.requestId !== request.data.requestId || !(0, common_js_1.sameValue)(value.data.opening, request.data.opening))
        return false;
    if (originalSnapshot === null)
        return value.data.initialSnapshot === null;
    const snapshot = execution_js_1.CoachSessionExecutionSnapshotSchema.safeParse(originalSnapshot);
    return snapshot.success && (0, common_js_1.sameValue)(value.data.initialSnapshot, snapshot.data);
}
//# sourceMappingURL=execution.js.map