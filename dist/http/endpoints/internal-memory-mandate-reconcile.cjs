"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryMandateReconcileContract = exports.MandateReconcileResponseSchema = exports.MandateReconcileRequestSchema = exports.INTERNAL_MEMORY_MANDATE_RECONCILE_PATH = void 0;
const zod_1 = require("zod");
const wiki_js_1 = require("../../capability/lab/wiki.cjs");
const action_plan_js_1 = require("../../organization/action-plan.cjs");
const business_unit_mandate_js_1 = require("../../organization/business-unit-mandate.cjs");
const company_map_js_1 = require("../../organization/company-map.cjs");
const decision_request_js_1 = require("../../organization/decision-request.cjs");
const knowledge_publication_js_1 = require("../../organization/knowledge-publication.cjs");
/** Minimal reconciliation of a mandate's sources in memory A (F3X-03), called before a brief opens (F3P-01). */
exports.INTERNAL_MEMORY_MANDATE_RECONCILE_PATH = '/internal/memory/company-map/reconcile';
const entryShape = company_map_js_1.CompanyMapEntrySchema.shape;
/** Sources of a mandate: the approved decision, the referent of the map and the notebook pages, each with its version. */
exports.MandateReconcileRequestSchema = zod_1.z
    .strictObject({
    tenantId: entryShape.tenantId,
    organizationId: entryShape.organizationId,
    clientId: entryShape.clientId,
    projectId: zod_1.z.string().min(1).max(64),
    buSlug: entryShape.buSlug,
    decision: zod_1.z
        .strictObject({ requestId: decision_request_js_1.DecisionRequestIdSchema, planVersion: zod_1.z.number().int().min(1) })
        .optional(),
    referent: action_plan_js_1.ActionPlanReferentRefSchema.optional(),
    notebookPages: zod_1.z
        .array(zod_1.z.strictObject({
        slug: wiki_js_1.WikiPageSchema.shape.slug,
        version: wiki_js_1.WikiPageSchema.shape.version,
        contradicts: zod_1.z.array(knowledge_publication_js_1.KnowledgeContradictionSchema).max(50).optional(),
    }))
        .max(100),
})
    .superRefine((value, ctx) => {
    if (new Set(value.notebookPages.map((page) => page.slug)).size !== value.notebookPages.length) {
        ctx.addIssue({ code: 'custom', message: 'Notebook page slugs must be unique', path: ['notebookPages'] });
    }
});
exports.MandateReconcileResponseSchema = zod_1.z.strictObject({
    reconciliation: business_unit_mandate_js_1.MandateReconciliationSchema,
    checkedAt: zod_1.z.iso.datetime({ offset: true }),
});
exports.internalMemoryMandateReconcileContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_MANDATE_RECONCILE_PATH,
    authType: 'secret',
    bodySchema: exports.MandateReconcileRequestSchema,
    responseSchema: exports.MandateReconcileResponseSchema,
};
//# sourceMappingURL=internal-memory-mandate-reconcile.js.map