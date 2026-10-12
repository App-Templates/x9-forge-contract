"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachSessionCloseResultSchema = exports.CoachSessionCloseRequestSchema = exports.CoachGuideEndResultSchema = exports.CoachGuideEndRequestSchema = void 0;
const zod_1 = require("zod");
const accounting_js_1 = require("../accounting.cjs");
const measures_js_1 = require("../measures.cjs");
const common_js_1 = require("./common.cjs");
const conversation_js_1 = require("./conversation.cjs");
exports.CoachGuideEndRequestSchema = common_js_1.CoachOperationalCommandMetadataSchema;
exports.CoachGuideEndResultSchema = zod_1.z.object({
    ...common_js_1.result, done: zod_1.z.boolean(), remainingSeconds: zod_1.z.number().int().nonnegative(), practice: accounting_js_1.CoachPracticeObservationSchema.nullable(),
}).strict().refine(x => x.done ? x.remainingSeconds === 0 && x.practice !== null && (0, common_js_1.forOpening)(x.practice, x.opening)
    : x.remainingSeconds > 0 && x.practice === null, 'Guide end requires server-observed practice or remaining time');
exports.CoachSessionCloseRequestSchema = common_js_1.CoachOperationalCommandMetadataSchema.extend({ conclusion: conversation_js_1.CoachProgramInputEnvelopeSchema.nullable() }).strict();
exports.CoachSessionCloseResultSchema = zod_1.z.object({
    ...common_js_1.result, accounting: accounting_js_1.CoachSessionAccountingSchema, measures: zod_1.z.array(measures_js_1.CoachMeasureObservationSchema).max(500), projection: conversation_js_1.CoachProgramProjectionSchema.nullable(),
}).strict().refine(x => (0, common_js_1.forOpening)(x.accounting, x.opening) && (0, common_js_1.sameValue)(x.accounting.strategy, x.opening.program.strategy)
    && (x.projection === null || (0, common_js_1.sameValue)(x.projection.strategy, x.opening.program.strategy))
    && x.measures.every(measure => (0, common_js_1.forOpening)(measure, x.opening) && measure.snapshotId === x.accounting.snapshotId), 'Close preserves opening, snapshot and pinned strategy');
//# sourceMappingURL=closing.js.map