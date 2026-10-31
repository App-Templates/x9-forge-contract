import { z } from 'zod';
import { WikiPageSchema } from "../../capability/lab/wiki.js";
import { ActionPlanReferentRefSchema } from "../../organization/action-plan.js";
import { MandateReconciliationSchema } from "../../organization/business-unit-mandate.js";
import { CompanyMapEntrySchema } from "../../organization/company-map.js";
import { DecisionRequestIdSchema } from "../../organization/decision-request.js";
import { KnowledgeContradictionSchema } from "../../organization/knowledge-publication.js";
/** Minimal reconciliation of a mandate's sources in memory A (F3X-03), called before a brief opens (F3P-01). */
export const INTERNAL_MEMORY_MANDATE_RECONCILE_PATH = '/internal/memory/company-map/reconcile';
const entryShape = CompanyMapEntrySchema.shape;
/** Sources of a mandate: the approved decision, the referent of the map and the notebook pages, each with its version. */
export const MandateReconcileRequestSchema = z
    .strictObject({
    tenantId: entryShape.tenantId,
    organizationId: entryShape.organizationId,
    clientId: entryShape.clientId,
    projectId: z.string().min(1).max(64),
    buSlug: entryShape.buSlug,
    decision: z
        .strictObject({ requestId: DecisionRequestIdSchema, planVersion: z.number().int().min(1) })
        .optional(),
    referent: ActionPlanReferentRefSchema.optional(),
    notebookPages: z
        .array(z.strictObject({
        slug: WikiPageSchema.shape.slug,
        version: WikiPageSchema.shape.version,
        contradicts: z.array(KnowledgeContradictionSchema).max(50).optional(),
    }))
        .max(100),
})
    .superRefine((value, ctx) => {
    if (new Set(value.notebookPages.map((page) => page.slug)).size !== value.notebookPages.length) {
        ctx.addIssue({ code: 'custom', message: 'Notebook page slugs must be unique', path: ['notebookPages'] });
    }
});
export const MandateReconcileResponseSchema = z.strictObject({
    reconciliation: MandateReconciliationSchema,
    checkedAt: z.iso.datetime({ offset: true }),
});
export const internalMemoryMandateReconcileContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_MANDATE_RECONCILE_PATH,
    authType: 'secret',
    bodySchema: MandateReconcileRequestSchema,
    responseSchema: MandateReconcileResponseSchema,
};
//# sourceMappingURL=internal-memory-mandate-reconcile.js.map