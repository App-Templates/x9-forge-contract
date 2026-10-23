"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerticalPlanSchema = exports.VerticalPlanAttachmentRoleSchema = exports.VERTICAL_PLAN_ATTACHMENT_ROLES = void 0;
exports.verticalPlanCanonicalJson = verticalPlanCanonicalJson;
exports.verticalPlanDecisionSubject = verticalPlanDecisionSubject;
const zod_1 = require("zod");
const action_plan_js_1 = require("./action-plan.cjs");
const asset_js_1 = require("./asset.cjs");
const decision_request_js_1 = require("./decision-request.cjs");
const BuSlugSchema = zod_1.z.string().min(1).max(30).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const MilestoneNumberSchema = zod_1.z.number().int().min(1);
/** Role of each attachment of the vertical plan. */
exports.VERTICAL_PLAN_ATTACHMENT_ROLES = ['rd_dossier', 'executor', 'reviewer', 'budget', 'criteria'];
exports.VerticalPlanAttachmentRoleSchema = zod_1.z.enum(exports.VERTICAL_PLAN_ATTACHMENT_ROLES);
const SINGLE_ROLES = ['executor', 'reviewer', 'budget', 'criteria'];
/** The plan a business unit lead sends to its referent: analysis, milestones, blockers, questions, plus attachments. */
exports.VerticalPlanSchema = zod_1.z.strictObject({
    planId: decision_request_js_1.DecisionRequestIdSchema,
    version: zod_1.z.number().int().min(1),
    digest: asset_js_1.AssetSha256Schema,
    tenantId: asset_js_1.AssetRefSchema.shape.tenantId,
    organizationId: zod_1.z.string().min(1).max(64),
    clientId: asset_js_1.AssetRefSchema.shape.companyId,
    projectId: zod_1.z.string().min(1).max(64),
    buSlug: BuSlugSchema,
    actionPlan: zod_1.z.strictObject({
        planId: decision_request_js_1.DecisionRequestIdSchema,
        version: zod_1.z.number().int().min(1),
    }),
    analysis: zod_1.z.string().min(1).max(4000),
    milestones: zod_1.z.array(zod_1.z.strictObject({
        number: MilestoneNumberSchema,
        expectedGoal: zod_1.z.string().min(1).max(2000),
        dueDate: zod_1.z.iso.date(),
        blockedBy: zod_1.z.array(zod_1.z.number().int()),
    })).min(1).max(30),
    blockers: zod_1.z.array(zod_1.z.strictObject({
        what: zod_1.z.string().min(1).max(2000),
        unlocksMilestone: MilestoneNumberSchema,
    })).max(30),
    questions: zod_1.z.array(zod_1.z.strictObject({
        question: zod_1.z.string().min(1).max(2000),
        unlocks: zod_1.z.string().min(1).max(2000),
    })).max(30),
    attachments: zod_1.z.array(zod_1.z.strictObject({
        role: exports.VerticalPlanAttachmentRoleSchema,
        asset: asset_js_1.AssetRefSchema,
    })).min(5).max(40),
}).superRefine((plan, ctx) => {
    const numbers = new Set();
    plan.milestones.forEach((milestone, index) => {
        if (numbers.has(milestone.number)) {
            ctx.addIssue({ code: 'custom', path: ['milestones', index, 'number'], message: 'Milestone numbers must be unique' });
        }
        numbers.add(milestone.number);
    });
    plan.milestones.forEach((milestone, index) => {
        milestone.blockedBy.forEach((blocker, blockerIndex) => {
            if (!numbers.has(blocker)) {
                ctx.addIssue({ code: 'custom', path: ['milestones', index, 'blockedBy', blockerIndex], message: 'blockedBy must reference an existing milestone' });
            }
        });
    });
    plan.blockers.forEach((blocker, index) => {
        if (!numbers.has(blocker.unlocksMilestone)) {
            ctx.addIssue({ code: 'custom', path: ['blockers', index, 'unlocksMilestone'], message: 'unlocksMilestone must reference an existing milestone' });
        }
    });
    const counts = new Map();
    plan.attachments.forEach((attachment, index) => {
        counts.set(attachment.role, (counts.get(attachment.role) ?? 0) + 1);
        const { asset } = attachment;
        if (asset.tenantId !== plan.tenantId) {
            ctx.addIssue({ code: 'custom', path: ['attachments', index, 'asset', 'tenantId'], message: 'Asset tenant must match the plan' });
        }
        if (asset.companyId !== plan.clientId) {
            ctx.addIssue({ code: 'custom', path: ['attachments', index, 'asset', 'companyId'], message: 'Asset company must match the plan client' });
        }
        if (asset.projectId !== plan.projectId) {
            ctx.addIssue({ code: 'custom', path: ['attachments', index, 'asset', 'projectId'], message: 'Asset project must match the plan' });
        }
        if (asset.buSlug !== undefined && asset.buSlug !== plan.buSlug) {
            ctx.addIssue({ code: 'custom', path: ['attachments', index, 'asset', 'buSlug'], message: 'Asset business unit must match the plan' });
        }
    });
    for (const role of exports.VERTICAL_PLAN_ATTACHMENT_ROLES) {
        const count = counts.get(role) ?? 0;
        if (count === 0) {
            ctx.addIssue({ code: 'custom', path: ['attachments'], message: `Missing attachment: ${role}` });
        }
        else if (count > 1 && SINGLE_ROLES.includes(role)) {
            ctx.addIssue({ code: 'custom', path: ['attachments'], message: `Attachment ${role} must appear once` });
        }
    }
});
/** Portable UTF-8 input for the writer's SHA-256; the digest itself is excluded. */
function verticalPlanCanonicalJson(plan) {
    const { digest: _digest, ...content } = plan;
    return (0, action_plan_js_1.canonicalJson)(content);
}
/** Bind the decision to the exact vertical plan version the referent read. */
function verticalPlanDecisionSubject(plan) {
    return { kind: 'vertical_plan', planId: plan.planId, planVersion: plan.version, digest: plan.digest };
}
//# sourceMappingURL=vertical-plan.js.map