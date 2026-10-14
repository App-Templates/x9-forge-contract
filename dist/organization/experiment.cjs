"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperimentSchema = exports.ExperimentStatusSchema = void 0;
const zod_1 = require("zod");
const run_context_js_1 = require("./run-context.cjs");
const run_outcome_js_1 = require("./run-outcome.cjs");
const scenario_js_1 = require("./scenario.cjs");
exports.ExperimentStatusSchema = zod_1.z.enum(['proposed', 'running', 'concluded', 'abandoned']);
/**
 * An experiment: hypothesis, proof/domain version, baseline and success
 * criterion. `conclusion` is required if and only if the experiment is
 * concluded; an abandoned experiment must say why (`reason`).
 */
exports.ExperimentSchema = zod_1.z
    .strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    experimentId: zod_1.z.string().min(1),
    hypothesisRef: zod_1.z.string().min(1),
    domainVersionRef: run_outcome_js_1.EvidenceRefSchema,
    baselineRef: run_outcome_js_1.EvidenceRefSchema,
    corpus: scenario_js_1.ScenarioCorpusSchema.optional(),
    criterionRef: zod_1.z.string().min(1),
    status: exports.ExperimentStatusSchema,
    conclusion: zod_1.z.string().min(1).optional(),
    reason: zod_1.z.string().min(1).max(300).optional(),
})
    .superRefine((e, ctx) => {
    if (e.status === 'concluded' && e.conclusion === undefined) {
        ctx.addIssue({
            code: 'custom',
            path: ['conclusion'],
            message: "status 'concluded' requires conclusion",
        });
    }
    if (e.status !== 'concluded' && e.conclusion !== undefined) {
        ctx.addIssue({
            code: 'custom',
            path: ['conclusion'],
            message: "conclusion is only allowed when status is 'concluded'",
        });
    }
    if (e.status === 'abandoned' && e.reason === undefined) {
        ctx.addIssue({
            code: 'custom',
            path: ['reason'],
            message: "status 'abandoned' requires reason",
        });
    }
    if (e.status !== 'abandoned' && e.reason !== undefined) {
        ctx.addIssue({
            code: 'custom',
            path: ['reason'],
            message: "reason is only allowed when status is 'abandoned'",
        });
    }
});
//# sourceMappingURL=experiment.js.map