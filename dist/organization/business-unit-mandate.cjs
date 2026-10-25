"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MandateAttemptObservationSchema = exports.MandateAttemptEventSchema = exports.MANDATE_ATTEMPT_EVENT_KINDS = exports.MandateAttemptScopeSchema = exports.MandateAttemptObservationIdSchema = exports.ReconciledMandateSchema = exports.MandateReconciliationSchema = exports.MandateSourceSchema = exports.MANDATE_SOURCES = exports.MandateReconciliationOutcomeSchema = exports.MANDATE_RECONCILIATION_OUTCOMES = void 0;
const zod_1 = require("zod");
const wiki_js_1 = require("../capability/lab/wiki.cjs");
const action_plan_js_1 = require("./action-plan.cjs");
const asset_js_1 = require("./asset.cjs");
const company_map_js_1 = require("./company-map.cjs");
const decision_request_js_1 = require("./decision-request.cjs");
const participant_binding_js_1 = require("./participant-binding.cjs");
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
exports.MandateAttemptObservationIdSchema = zod_1.z.string().regex(/^[A-Za-z0-9_-]{6,64}$/);
exports.MandateAttemptScopeSchema = zod_1.z.strictObject({
    tenantId: exports.ReconciledMandateSchema.shape.tenantId,
    organizationId: exports.ReconciledMandateSchema.shape.organizationId,
    clientId: exports.ReconciledMandateSchema.shape.clientId,
    projectId: exports.ReconciledMandateSchema.shape.projectId,
    buSlug: company_map_js_1.CompanyMapScopeFieldsSchema.shape.buSlug.unwrap(),
    agent: participant_binding_js_1.ParticipantAgentIdentitySchema,
});
exports.MANDATE_ATTEMPT_EVENT_KINDS = [
    'reconciled', 'blocked', 'question_opened', 'email_sent', 'email_failed', 'issue_opened',
];
const attemptEventShape = {
    eventId: exports.MandateAttemptObservationIdSchema,
    at: zod_1.z.iso.datetime({ offset: true }),
};
const attemptEmailShape = { requestId: decision_request_js_1.DecisionRequestIdSchema, to: zod_1.z.email() };
exports.MandateAttemptEventSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({
        ...attemptEventShape,
        kind: zod_1.z.literal(exports.MANDATE_ATTEMPT_EVENT_KINDS[0]),
        mandate: exports.ReconciledMandateSchema,
    }),
    zod_1.z.strictObject({
        ...attemptEventShape,
        kind: zod_1.z.literal(exports.MANDATE_ATTEMPT_EVENT_KINDS[1]),
        reason: zod_1.z.enum(['conflict', 'missing', 'referent_superseded']),
    }),
    zod_1.z.strictObject({
        ...attemptEventShape,
        ...attemptEmailShape,
        kind: zod_1.z.literal(exports.MANDATE_ATTEMPT_EVENT_KINDS[2]),
        referent: action_plan_js_1.ActionPlanReferentRefSchema,
    }),
    zod_1.z.strictObject({
        ...attemptEventShape,
        ...attemptEmailShape,
        kind: zod_1.z.literal(exports.MANDATE_ATTEMPT_EVENT_KINDS[3]),
        providerMessageId: zod_1.z.string().min(1).max(512),
    }),
    zod_1.z.strictObject({
        ...attemptEventShape,
        ...attemptEmailShape,
        kind: zod_1.z.literal(exports.MANDATE_ATTEMPT_EVENT_KINDS[4]),
        error: zod_1.z.string().min(1).max(500),
    }),
    zod_1.z.strictObject({
        ...attemptEventShape,
        kind: zod_1.z.literal(exports.MANDATE_ATTEMPT_EVENT_KINDS[5]),
        issueRef: zod_1.z.string().min(1).max(200),
    }),
]);
/** Ordered events of one scoped attempt; persistence owns event replay detection. */
exports.MandateAttemptObservationSchema = zod_1.z.strictObject({
    observationId: exports.MandateAttemptObservationIdSchema,
    scope: exports.MandateAttemptScopeSchema,
    events: zod_1.z.array(exports.MandateAttemptEventSchema).min(1).max(50),
}).superRefine((value, ctx) => {
    const eventIds = new Set();
    const questions = new Map();
    let blocked = false;
    let issueOpened = false;
    for (const [index, event] of value.events.entries()) {
        if (eventIds.has(event.eventId)) {
            ctx.addIssue({ code: 'custom', message: 'Event IDs must be unique', path: ['events', index, 'eventId'] });
        }
        eventIds.add(event.eventId);
        if (event.kind === 'question_opened') {
            const recipients = questions.get(event.requestId) ?? new Set();
            recipients.add(event.to);
            questions.set(event.requestId, recipients);
        }
        if ((event.kind === 'email_sent' || event.kind === 'email_failed') &&
            !questions.get(event.requestId)?.has(event.to)) {
            ctx.addIssue({
                code: 'custom',
                message: 'Email outcomes require a preceding question with the same requestId and recipient',
                path: ['events', index],
            });
        }
        blocked ||= event.kind === 'blocked';
        issueOpened ||= event.kind === 'issue_opened';
    }
    if (blocked && issueOpened) {
        ctx.addIssue({ code: 'custom', message: 'Blocked attempts cannot open an issue', path: ['events'] });
    }
});
//# sourceMappingURL=business-unit-mandate.js.map