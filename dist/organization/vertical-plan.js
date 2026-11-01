import { z } from 'zod';
import { canonicalJson } from "./action-plan.js";
import { AssetRefSchema, AssetSha256Schema } from "./asset.js";
import { DecisionRequestIdSchema } from "./decision-request.js";
const BuSlugSchema = z.string().min(1).max(30).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const MilestoneNumberSchema = z.number().int().min(1);
/** Role of each attachment of the vertical plan. */
export const VERTICAL_PLAN_ATTACHMENT_ROLES = ['rd_dossier', 'executor', 'reviewer', 'budget', 'criteria'];
export const VerticalPlanAttachmentRoleSchema = z.enum(VERTICAL_PLAN_ATTACHMENT_ROLES);
const SINGLE_ROLES = ['executor', 'reviewer', 'budget', 'criteria'];
/** The plan a business unit lead sends to its referent: analysis, milestones, blockers, questions, plus attachments. */
export const VerticalPlanSchema = z.strictObject({
    planId: DecisionRequestIdSchema,
    version: z.number().int().min(1),
    digest: AssetSha256Schema,
    tenantId: AssetRefSchema.shape.tenantId,
    organizationId: z.string().min(1).max(64),
    clientId: AssetRefSchema.shape.companyId,
    projectId: z.string().min(1).max(64),
    buSlug: BuSlugSchema,
    actionPlan: z.strictObject({
        planId: DecisionRequestIdSchema,
        version: z.number().int().min(1),
    }),
    analysis: z.string().min(1).max(4000),
    milestones: z.array(z.strictObject({
        number: MilestoneNumberSchema,
        expectedGoal: z.string().min(1).max(2000),
        dueDate: z.iso.date(),
        blockedBy: z.array(z.number().int()),
    })).min(1).max(30),
    blockers: z.array(z.strictObject({
        what: z.string().min(1).max(2000),
        unlocksMilestone: MilestoneNumberSchema,
    })).max(30),
    questions: z.array(z.strictObject({
        question: z.string().min(1).max(2000),
        unlocks: z.string().min(1).max(2000),
    })).max(30),
    attachments: z.array(z.strictObject({
        role: VerticalPlanAttachmentRoleSchema,
        asset: AssetRefSchema,
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
    for (const role of VERTICAL_PLAN_ATTACHMENT_ROLES) {
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
export function verticalPlanCanonicalJson(plan) {
    const { digest: _digest, ...content } = plan;
    return canonicalJson(content);
}
/** Bind the decision to the exact vertical plan version the referent read. */
export function verticalPlanDecisionSubject(plan) {
    return { kind: 'vertical_plan', planId: plan.planId, planVersion: plan.version, digest: plan.digest };
}
//# sourceMappingURL=vertical-plan.js.map