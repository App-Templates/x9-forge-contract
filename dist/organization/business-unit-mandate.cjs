"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconciledMandateSchema = exports.MandateReconciliationSchema = exports.MandateSourceSchema = exports.MANDATE_SOURCES = exports.MandateReconciliationOutcomeSchema = exports.MANDATE_RECONCILIATION_OUTCOMES = void 0;
const zod_1 = require("zod");
const wiki_js_1 = require("../capability/lab/wiki.cjs");
const action_plan_js_1 = require("./action-plan.cjs");
const asset_js_1 = require("./asset.cjs");
const decision_request_js_1 = require("./decision-request.cjs");
exports.MANDATE_RECONCILIATION_OUTCOMES = ['agrees', 'conflict', 'missing'];
exports.MandateReconciliationOutcomeSchema = zod_1.z.enum(exports.MANDATE_RECONCILIATION_OUTCOMES);
exports.MANDATE_SOURCES = ['plan_section', 'decision', 'referent', 'notebook_page'];
exports.MandateSourceSchema = zod_1.z.enum(exports.MANDATE_SOURCES);
/** Result of comparing the approved plan, decision, referent and notebook pages. */
exports.MandateReconciliationSchema = zod_1.z.discriminatedUnion('outcome', [
    zod_1.z.strictObject({ outcome: zod_1.z.literal(exports.MANDATE_RECONCILIATION_OUTCOMES[0]) }),
    zod_1.z.strictObject({
        outcome: zod_1.z.literal(exports.MANDATE_RECONCILIATION_OUTCOMES[1]),
        conflicts: zod_1.z.array(zod_1.z.strictObject({
            source: exports.MandateSourceSchema,
            ref: zod_1.z.string().min(1).max(200),
            reason: zod_1.z.string().min(1).max(1000),
        })).min(1).max(50),
    }),
    zod_1.z.strictObject({
        outcome: zod_1.z.literal(exports.MANDATE_RECONCILIATION_OUTCOMES[2]),
        missing: zod_1.z.array(zod_1.z.strictObject({
            source: exports.MandateSourceSchema,
            ref: zod_1.z.string().min(1).max(200).optional(),
        })).min(1).max(50),
    }),
]);
/** Versioned sources and their reconciliation, embedded in a business unit brief. */
exports.ReconciledMandateSchema = zod_1.z.strictObject({
    tenantId: asset_js_1.AssetRefSchema.shape.tenantId,
    organizationId: zod_1.z.string().min(1).max(64),
    clientId: asset_js_1.AssetRefSchema.shape.companyId,
    projectId: zod_1.z.string().min(1).max(64),
    planSection: zod_1.z.strictObject({
        planId: decision_request_js_1.DecisionRequestIdSchema,
        planVersion: zod_1.z.number().int().min(1),
        planDigest: asset_js_1.AssetSha256Schema,
        businessUnit: action_plan_js_1.ActionPlanBusinessUnitSchema,
    }),
    decision: zod_1.z.strictObject({
        requestId: decision_request_js_1.DecisionRequestIdSchema,
        planVersion: zod_1.z.number().int().min(1),
    }),
    referent: action_plan_js_1.ActionPlanReferentRefSchema,
    notebookPages: zod_1.z.array(zod_1.z.strictObject({
        slug: wiki_js_1.WikiPageSchema.shape.slug,
        version: wiki_js_1.WikiPageSchema.shape.version,
    })).max(100),
    reconciliation: exports.MandateReconciliationSchema,
    reconciledAt: zod_1.z.iso.datetime({ offset: true }),
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