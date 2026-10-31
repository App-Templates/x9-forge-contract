import { z } from 'zod';
import { type DecisionSubject } from "./decision-request.js";
/** Role of each attachment of the vertical plan. */
export declare const VERTICAL_PLAN_ATTACHMENT_ROLES: readonly ["rd_dossier", "executor", "reviewer", "budget", "criteria"];
export declare const VerticalPlanAttachmentRoleSchema: z.ZodEnum<{
    budget: "budget";
    reviewer: "reviewer";
    executor: "executor";
    rd_dossier: "rd_dossier";
    criteria: "criteria";
}>;
export type VerticalPlanAttachmentRole = z.infer<typeof VerticalPlanAttachmentRoleSchema>;
/** The plan a business unit lead sends to its referent: analysis, milestones, blockers, questions, plus attachments. */
export declare const VerticalPlanSchema: z.ZodObject<{
    planId: z.ZodString;
    version: z.ZodNumber;
    digest: z.ZodString;
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clientId: z.ZodString;
    projectId: z.ZodString;
    buSlug: z.ZodString;
    actionPlan: z.ZodObject<{
        planId: z.ZodString;
        version: z.ZodNumber;
    }, z.core.$strict>;
    analysis: z.ZodString;
    milestones: z.ZodArray<z.ZodObject<{
        number: z.ZodNumber;
        expectedGoal: z.ZodString;
        dueDate: z.ZodISODate;
        blockedBy: z.ZodArray<z.ZodNumber>;
    }, z.core.$strict>>;
    blockers: z.ZodArray<z.ZodObject<{
        what: z.ZodString;
        unlocksMilestone: z.ZodNumber;
    }, z.core.$strict>>;
    questions: z.ZodArray<z.ZodObject<{
        question: z.ZodString;
        unlocks: z.ZodString;
    }, z.core.$strict>>;
    attachments: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<{
            budget: "budget";
            reviewer: "reviewer";
            executor: "executor";
            rd_dossier: "rd_dossier";
            criteria: "criteria";
        }>;
        asset: z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
            name: z.ZodString;
            mediaType: z.ZodString;
            sizeBytes: z.ZodNumber;
            origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"email">;
                messageId: z.ZodString;
                attachmentName: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"archive">;
                archiveSha256: z.ZodString;
                entryPath: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"session">;
                sessionId: z.ZodString;
                repo: z.ZodOptional<z.ZodString>;
                commit: z.ZodOptional<z.ZodString>;
                path: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"link">;
                url: z.ZodURL;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"generated">;
                agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                sourceAssetIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>], "kind">;
            tenantId: z.ZodString;
            companyId: z.ZodString;
            projectId: z.ZodString;
            assetType: z.ZodOptional<z.ZodString>;
            buSlug: z.ZodOptional<z.ZodString>;
            providedBy: z.ZodOptional<z.ZodObject<{
                personRef: z.ZodString;
            }, z.core.$strict>>;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VerticalPlan = z.infer<typeof VerticalPlanSchema>;
/** Portable UTF-8 input for the writer's SHA-256; the digest itself is excluded. */
export declare function verticalPlanCanonicalJson(plan: VerticalPlan): string;
/** Bind the decision to the exact vertical plan version the referent read. */
export declare function verticalPlanDecisionSubject(plan: VerticalPlan): Exclude<DecisionSubject, {
    kind: 'delivery';
}>;
//# sourceMappingURL=vertical-plan.d.ts.map