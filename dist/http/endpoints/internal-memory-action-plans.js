import { z } from 'zod';
import { ActionPlanSchema } from "../../organization/action-plan.js";
import { AssetSha256Schema } from "../../organization/asset.js";
import { OrganizationRunContextSchema } from "../../organization/run-context.js";
/**
 * Versions of the action plan in the company memory A (F1X-03 completed, for F1P-01, F1P-02, F2P-01/02, F3P-01).
 * The decision request keeps only the subject (planId, version, digest): the content of each version lives here,
 * so the units to create and the BU «previste» are read from the approved version, never from the model.
 * Tenant and organization come from the signed context, verified by the service; the plan must name the same.
 * Every version stays; a version is written once (same digest = same receipt).
 */
export const INTERNAL_MEMORY_ACTION_PLANS_PATH = '/internal/memory/action-plans';
export const INTERNAL_MEMORY_ACTION_PLAN_READ_PATH = '/internal/memory/action-plans/read';
export const ActionPlanSaveRequestSchema = z.strictObject({
    context: OrganizationRunContextSchema,
    plan: ActionPlanSchema,
});
export const ActionPlanSaveResponseSchema = z.strictObject({
    planId: ActionPlanSchema.shape.planId,
    version: ActionPlanSchema.shape.version,
    digest: AssetSha256Schema,
    created: z.boolean(),
});
export const ActionPlanReadRequestSchema = z.strictObject({
    context: OrganizationRunContextSchema,
    planId: ActionPlanSchema.shape.planId,
    /** Absent: the latest saved version. */
    version: ActionPlanSchema.shape.version.optional(),
});
export const ActionPlanReadResponseSchema = z.discriminatedUnion('status', [
    z.strictObject({ status: z.literal('ok'), plan: ActionPlanSchema, latestVersion: ActionPlanSchema.shape.version }),
    z.strictObject({ status: z.literal('not_found') }),
]);
export const ACTION_PLAN_ERROR_CODES = [
    'action_plan_conflict',
    'action_plan_digest_mismatch',
    'action_plan_scope_mismatch',
    'identity_uncertain',
];
export const ActionPlanErrorCodeSchema = z.enum(ACTION_PLAN_ERROR_CODES);
export const ActionPlanErrorResponseSchema = z.strictObject({
    code: ActionPlanErrorCodeSchema,
    message: z.string().min(1),
});
/**
 * Save: 201 new version, 200 identical replay (`created: false`); 409 action_plan_conflict for the same
 * planId and version with another digest; 400 action_plan_digest_mismatch when the digest is not the one of
 * `actionPlanCanonicalJson`; 403 action_plan_scope_mismatch / identity_uncertain.
 */
export const internalMemoryActionPlanSaveContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_ACTION_PLANS_PATH,
    authType: 'secret',
    bodySchema: ActionPlanSaveRequestSchema,
    responseSchema: ActionPlanSaveResponseSchema,
};
/** Read: 200 with the version (or the latest) of a plan of the verified organization, or `not_found`. */
export const internalMemoryActionPlanReadContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_ACTION_PLAN_READ_PATH,
    authType: 'secret',
    bodySchema: ActionPlanReadRequestSchema,
    responseSchema: ActionPlanReadResponseSchema,
};
//# sourceMappingURL=internal-memory-action-plans.js.map