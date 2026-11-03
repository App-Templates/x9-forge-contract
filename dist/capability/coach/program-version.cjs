"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachProgramVersionRefSchema = exports.CoachStrategyRefSchema = void 0;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const index_js_1 = require("./index.cjs");
const shared_js_1 = require("./shared.cjs");
exports.CoachStrategyRefSchema = zod_1.z.object({
    strategyId: index_js_1.CoachProgramIdSchema, strategyVersion: shared_js_1.Text128,
}).strict();
exports.CoachProgramVersionRefSchema = zod_1.z.object({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema, programId: index_js_1.CoachProgramIdSchema,
    programVersion: index_js_1.CoachProgramSchema.shape.version, strategy: exports.CoachStrategyRefSchema,
    catalogRevision: shared_js_1.Text128, policyRevision: shared_js_1.Text128, progressionRevision: shared_js_1.Text128, measureDefinitionRevision: shared_js_1.Text128,
}).strict();
//# sourceMappingURL=program-version.js.map