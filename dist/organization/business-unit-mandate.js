import { z } from 'zod';
import { WikiPageSchema } from "../capability/lab/wiki.js";
import { ActionPlanBusinessUnitSchema, ActionPlanReferentRefSchema } from "./action-plan.js";
import { AssetRefSchema, AssetSha256Schema } from "./asset.js";
import { DecisionRequestIdSchema } from "./decision-request.js";
export const MANDATE_RECONCILIATION_OUTCOMES = ['agrees', 'conflict', 'missing'];
export const MandateReconciliationOutcomeSchema = z.enum(MANDATE_RECONCILIATION_OUTCOMES);
export const MANDATE_SOURCES = ['plan_section', 'decision', 'referent', 'notebook_page'];
export const MandateSourceSchema = z.enum(MANDATE_SOURCES);
/** Result of comparing the approved plan, decision, referent and notebook pages. */
export const MandateReconciliationSchema = z.discriminatedUnion('outcome', [
    z.strictObject({ outcome: z.literal(MANDATE_RECONCILIATION_OUTCOMES[0]) }),
    z.strictObject({
        outcome: z.literal(MANDATE_RECONCILIATION_OUTCOMES[1]),
        conflicts: z.array(z.strictObject({
            source: MandateSourceSchema,
            ref: z.string().min(1).max(200),
            reason: z.string().min(1).max(1000),
        })).min(1).max(50),
    }),
    z.strictObject({
        outcome: z.literal(MANDATE_RECONCILIATION_OUTCOMES[2]),
        missing: z.array(z.strictObject({
            source: MandateSourceSchema,
            ref: z.string().min(1).max(200).optional(),
        })).min(1).max(50),
    }),
]);
/** Versioned sources and their reconciliation, embedded in a business unit brief. */
export const ReconciledMandateSchema = z.strictObject({
    tenantId: AssetRefSchema.shape.tenantId,
    organizationId: z.string().min(1).max(64),
    clientId: AssetRefSchema.shape.companyId,
    projectId: z.string().min(1).max(64),
    planSection: z.strictObject({
        planId: DecisionRequestIdSchema,
        planVersion: z.number().int().min(1),
        planDigest: AssetSha256Schema,
        businessUnit: ActionPlanBusinessUnitSchema,
    }),
    decision: z.strictObject({
        requestId: DecisionRequestIdSchema,
        planVersion: z.number().int().min(1),
    }),
    referent: ActionPlanReferentRefSchema,
    notebookPages: z.array(z.strictObject({
        slug: WikiPageSchema.shape.slug,
        version: WikiPageSchema.shape.version,
    })).max(100),
    reconciliation: MandateReconciliationSchema,
    reconciledAt: z.iso.datetime({ offset: true }),
}).superRefine((mandate, ctx) => {
    if (mandate.decision.planVersion !== mandate.planSection.planVersion) {
        ctx.addIssue({
            code: 'custom',
            message: 'Decision must refer to the same plan version as the plan section',
            path: ['decision', 'planVersion'],
        });
    }
    if (new Set(mandate.notebookPages.map((page) => page.slug)).size !== mandate.notebookPages.length) {
        ctx.addIssue({ code: 'custom', message: 'Notebook page slugs must be unique', path: ['notebookPages'] });
    }
    if (mandate.reconciliation.outcome === 'agrees') {
        const planReferent = mandate.planSection.businessUnit.referent;
        if (mandate.referent.personRef !== planReferent.personRef ||
            mandate.referent.entryVersion !== planReferent.entryVersion) {
            ctx.addIssue({
                code: 'custom',
                message: 'An agreeing mandate must use the same referent and entry version as the plan',
                path: ['referent'],
            });
        }
    }
});
//# sourceMappingURL=business-unit-mandate.js.map