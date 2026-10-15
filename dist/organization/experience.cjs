"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperienceConflictSchema = exports.ExperienceReceiptSchema = exports.OrganizationExperienceEventSchema = exports.AuthoritativeDecisionExperienceEventSchema = exports.DecisionApproverSchema = exports.AuthoritativeDecisionStatusSchema = exports.RunOutcomeExperienceEventSchema = void 0;
const zod_1 = require("zod");
const run_context_js_1 = require("./run-context.cjs");
const run_outcome_js_1 = require("./run-outcome.cjs");
const Sha256Hex = zod_1.z.string().regex(/^[0-9a-fA-F]{64}$/);
/** Fields shared by every experience event. Tenant and organization are explicit. */
const experienceBase = {
    tenantId: zod_1.z.string().min(1),
    organizationId: zod_1.z.string().min(1),
    recordId: zod_1.z.string().min(1),
    version: zod_1.z.number().int().min(1),
    occurredAt: zod_1.z.iso.datetime(),
    digest: Sha256Hex,
    visibility: zod_1.z.literal('private_to_producer'),
};
/** Outcome of one attempt of a run, correlated by runId + attemptId. */
exports.RunOutcomeExperienceEventSchema = zod_1.z
    .strictObject({
    ...experienceBase,
    kind: zod_1.z.literal('run_outcome'),
    runId: run_context_js_1.RunIdSchema,
    attemptId: zod_1.z.string().min(1),
    outcome: run_outcome_js_1.RunOutcomeSchema,
})
    .superRefine((e, ctx) => {
    if (e.outcome.runId !== e.runId) {
        ctx.addIssue({ code: 'custom', message: 'outcome.runId must match runId', path: ['outcome', 'runId'] });
    }
    if (e.outcome.attemptId !== e.attemptId) {
        ctx.addIssue({
            code: 'custom',
            message: 'outcome.attemptId must match attemptId',
            path: ['outcome', 'attemptId'],
        });
    }
});
exports.AuthoritativeDecisionStatusSchema = zod_1.z.enum(['approved', 'superseded', 'revoked']);
/** Verified identity that approved a decision. */
exports.DecisionApproverSchema = zod_1.z.strictObject({
    actorType: zod_1.z.enum(['human', 'service']),
    actorId: zod_1.z.string().min(1),
});
/**
 * A decision approved by a verified identity. A complete `DecisionResponse`
 * is not an approved event: approval is a distinct, attributable act.
 */
exports.AuthoritativeDecisionExperienceEventSchema = zod_1.z
    .strictObject({
    ...experienceBase,
    kind: zod_1.z.literal('authoritative_decision'),
    decisionRef: zod_1.z.string().min(1),
    status: exports.AuthoritativeDecisionStatusSchema,
    approvedBy: exports.DecisionApproverSchema.optional(),
    approvalRef: zod_1.z.string().min(1).optional(),
    supersedes: zod_1.z.number().int().min(1).optional(),
})
    .superRefine((e, ctx) => {
    if (e.status !== 'approved')
        return;
    if (e.approvedBy === undefined) {
        ctx.addIssue({ code: 'custom', message: "status 'approved' requires approvedBy", path: ['approvedBy'] });
    }
    if (e.approvalRef === undefined) {
        ctx.addIssue({ code: 'custom', message: "status 'approved' requires approvalRef", path: ['approvalRef'] });
    }
});
exports.OrganizationExperienceEventSchema = zod_1.z.discriminatedUnion('kind', [
    exports.RunOutcomeExperienceEventSchema,
    exports.AuthoritativeDecisionExperienceEventSchema,
]);
exports.ExperienceReceiptSchema = zod_1.z.strictObject({
    recordId: zod_1.z.string().min(1),
    version: zod_1.z.number().int().min(1),
    digest: Sha256Hex,
    disposition: zod_1.z.enum(['stored', 'duplicate']),
});
exports.ExperienceConflictSchema = zod_1.z.strictObject({
    code: zod_1.z.literal('experience_conflict'),
    recordId: zod_1.z.string().min(1),
    version: zod_1.z.number().int().min(1),
});
//# sourceMappingURL=experience.js.map