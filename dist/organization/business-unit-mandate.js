import { z } from 'zod';
import { WikiPageSchema } from "../capability/lab/wiki.js";
import { ActionPlanBusinessUnitSchema, ActionPlanReferentRefSchema } from "./action-plan.js";
import { AssetRefSchema, AssetSha256Schema } from "./asset.js";
import { CompanyMapScopeFieldsSchema } from "./company-map.js";
import { DecisionRequestIdSchema } from "./decision-request.js";
import { ParticipantAgentIdentitySchema } from "./participant-binding.js";
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
export const MandateAttemptObservationIdSchema = z.string().regex(/^[A-Za-z0-9_-]{6,64}$/);
export const MandateAttemptScopeSchema = z.strictObject({
    tenantId: ReconciledMandateSchema.shape.tenantId,
    organizationId: ReconciledMandateSchema.shape.organizationId,
    clientId: ReconciledMandateSchema.shape.clientId,
    projectId: ReconciledMandateSchema.shape.projectId,
    buSlug: CompanyMapScopeFieldsSchema.shape.buSlug.unwrap(),
    agent: ParticipantAgentIdentitySchema,
});
export const MANDATE_ATTEMPT_EVENT_KINDS = [
    'reconciled', 'blocked', 'question_opened', 'email_sent', 'email_failed', 'issue_opened',
];
const attemptEventShape = {
    eventId: MandateAttemptObservationIdSchema,
    at: z.iso.datetime({ offset: true }),
};
const attemptEmailShape = { requestId: DecisionRequestIdSchema, to: z.email() };
export const MandateAttemptEventSchema = z.discriminatedUnion('kind', [
    z.strictObject({
        ...attemptEventShape,
        kind: z.literal(MANDATE_ATTEMPT_EVENT_KINDS[0]),
        mandate: ReconciledMandateSchema,
    }),
    z.strictObject({
        ...attemptEventShape,
        kind: z.literal(MANDATE_ATTEMPT_EVENT_KINDS[1]),
        reason: z.enum(['conflict', 'missing', 'referent_superseded']),
    }),
    z.strictObject({
        ...attemptEventShape,
        ...attemptEmailShape,
        kind: z.literal(MANDATE_ATTEMPT_EVENT_KINDS[2]),
        referent: ActionPlanReferentRefSchema,
    }),
    z.strictObject({
        ...attemptEventShape,
        ...attemptEmailShape,
        kind: z.literal(MANDATE_ATTEMPT_EVENT_KINDS[3]),
        providerMessageId: z.string().min(1).max(512),
    }),
    z.strictObject({
        ...attemptEventShape,
        ...attemptEmailShape,
        kind: z.literal(MANDATE_ATTEMPT_EVENT_KINDS[4]),
        error: z.string().min(1).max(500),
    }),
    z.strictObject({
        ...attemptEventShape,
        kind: z.literal(MANDATE_ATTEMPT_EVENT_KINDS[5]),
        issueRef: z.string().min(1).max(200),
    }),
]);
/** Ordered events of one scoped attempt; persistence owns event replay detection. */
export const MandateAttemptObservationSchema = z.strictObject({
    observationId: MandateAttemptObservationIdSchema,
    scope: MandateAttemptScopeSchema,
    events: z.array(MandateAttemptEventSchema).min(1).max(50),
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