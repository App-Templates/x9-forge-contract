"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryActionPlanReadContract = exports.internalMemoryActionPlanSaveContract = exports.ActionPlanErrorResponseSchema = exports.ActionPlanErrorCodeSchema = exports.ACTION_PLAN_ERROR_CODES = exports.ActionPlanReadResponseSchema = exports.ActionPlanReadRequestSchema = exports.ActionPlanSaveResponseSchema = exports.ActionPlanSaveRequestSchema = exports.INTERNAL_MEMORY_ACTION_PLAN_READ_PATH = exports.INTERNAL_MEMORY_ACTION_PLANS_PATH = void 0;
const zod_1 = require("zod");
const action_plan_js_1 = require("../../organization/action-plan.cjs");
const asset_js_1 = require("../../organization/asset.cjs");
const run_context_js_1 = require("../../organization/run-context.cjs");
/**
 * Versions of the action plan in the company memory A (F1X-03 completed, for F1P-01, F1P-02, F2P-01/02, F3P-01).
 * The decision request keeps only the subject (planId, version, digest): the content of each version lives here,
 * so the units to create and the BU «previste» are read from the approved version, never from the model.
 * Tenant and organization come from the signed context, verified by the service; the plan must name the same.
 * Every version stays; a version is written once (same digest = same receipt).
 */
exports.INTERNAL_MEMORY_ACTION_PLANS_PATH = '/internal/memory/action-plans';
exports.INTERNAL_MEMORY_ACTION_PLAN_READ_PATH = '/internal/memory/action-plans/read';
exports.ActionPlanSaveRequestSchema = zod_1.z.strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    plan: action_plan_js_1.ActionPlanSchema,
});
exports.ActionPlanSaveResponseSchema = zod_1.z.strictObject({
    planId: action_plan_js_1.ActionPlanSchema.shape.planId,
    version: action_plan_js_1.ActionPlanSchema.shape.version,
    digest: asset_js_1.AssetSha256Schema,
    created: zod_1.z.boolean(),
});
exports.ActionPlanReadRequestSchema = zod_1.z.strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    planId: action_plan_js_1.ActionPlanSchema.shape.planId,
    /** Absent: the latest saved version. */
    version: action_plan_js_1.ActionPlanSchema.shape.version.optional(),
});
exports.ActionPlanReadResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('ok'), plan: action_plan_js_1.ActionPlanSchema, latestVersion: action_plan_js_1.ActionPlanSchema.shape.version }),
    zod_1.z.strictObject({ status: zod_1.z.literal('not_found') }),
]);
exports.ACTION_PLAN_ERROR_CODES = [
    'action_plan_conflict',
    'action_plan_digest_mismatch',
    'action_plan_scope_mismatch',
    'identity_uncertain',
];
exports.ActionPlanErrorCodeSchema = zod_1.z.enum(exports.ACTION_PLAN_ERROR_CODES);
exports.ActionPlanErrorResponseSchema = zod_1.z.strictObject({
    code: exports.ActionPlanErrorCodeSchema,
    message: zod_1.z.string().min(1),
});
/**
 * Save: 201 new version, 200 identical replay (`created: false`); 409 action_plan_conflict for the same
 * planId and version with another digest; 400 action_plan_digest_mismatch when the digest is not the one of
 * `actionPlanCanonicalJson`; 403 action_plan_scope_mismatch / identity_uncertain.
 */
exports.internalMemoryActionPlanSaveContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_ACTION_PLANS_PATH,
    authType: 'secret',
    bodySchema: exports.ActionPlanSaveRequestSchema,
    responseSchema: exports.ActionPlanSaveResponseSchema,
};
/** Read: 200 with the version (or the latest) of a plan of the verified organization, or `not_found`. */
exports.internalMemoryActionPlanReadContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_ACTION_PLAN_READ_PATH,
    authType: 'secret',
    bodySchema: exports.ActionPlanReadRequestSchema,
    responseSchema: exports.ActionPlanReadResponseSchema,
};
//# sourceMappingURL=internal-memory-action-plans.js.map