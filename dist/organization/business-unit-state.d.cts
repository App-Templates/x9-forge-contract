import { z } from 'zod';
import { type DevSessionOutcome } from "../capability/dev/session-outcome.cjs";
import { type AssetRef } from "./asset.cjs";
import { type AssetVersionLeadReview, type AssetVersionRecord } from "./asset-version.cjs";
import { type DecisionOutcome, type DecisionRequest } from "./decision-request.cjs";
/** The department whose state is summarised; every fact outside it is ignored. */
export declare const BusinessUnitStateScopeSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    projectId: z.ZodString;
    buSlug: z.ZodString;
}, z.core.$strict>;
export type BusinessUnitStateScope = z.infer<typeof BusinessUnitStateScopeSchema>;
export declare const BusinessUnitStateSummarySchema: z.ZodObject<{
    scope: z.ZodObject<{
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        projectId: z.ZodString;
        buSlug: z.ZodString;
    }, z.core.$strict>;
    deliverables: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        versions: z.ZodNumber;
        latest: z.ZodObject<{
            version: z.ZodNumber;
            state: z.ZodEnum<{
                approved: "approved";
                changes_requested: "changes_requested";
                delivered: "delivered";
                superseded: "superseded";
                rejected_by_lead: "rejected_by_lead";
                awaiting_decision: "awaiting_decision";
            }>;
            requestId: z.ZodOptional<z.ZodString>;
            decidedAt: z.ZodOptional<z.ZodISODateTime>;
        }, z.core.$strict>;
        latestApprovedVersion: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>;
    openDecisions: z.ZodArray<z.ZodObject<{
        requestId: z.ZodString;
        createdAt: z.ZodISODateTime;
        deliveryRef: z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>;
        assetVersion: z.ZodOptional<z.ZodObject<{
            key: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    receivedMaterials: z.ZodArray<z.ZodObject<{
        assetId: z.ZodString;
        sha256: z.ZodString;
        name: z.ZodString;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>>;
    sessions: z.ZodArray<z.ZodObject<{
        sessionId: z.ZodString;
        attempt: z.ZodNumber;
        state: z.ZodEnum<{
            failed: "failed";
            delivered: "delivered";
            discarded: "discarded";
            waiting_materials: "waiting_materials";
            waiting_answer: "waiting_answer";
        }>;
        reasonCode: z.ZodEnum<{
            session_error: "session_error";
            tests_green: "tests_green";
            no_tests_declared: "no_tests_declared";
            tests_red: "tests_red";
            executor_error: "executor_error";
            not_published: "not_published";
            materials_not_obtained: "materials_not_obtained";
            outcome_not_recorded: "outcome_not_recorded";
            cancelled_by_answer: "cancelled_by_answer";
            closed_on_board: "closed_on_board";
            duplicate_assignment: "duplicate_assignment";
            assignment_refused: "assignment_refused";
            materials_requested: "materials_requested";
            answer_requested: "answer_requested";
            retry_or_cancel_requested: "retry_or_cancel_requested";
        }>;
        nature: z.ZodOptional<z.ZodEnum<{
            cancelled: "cancelled";
            invalid_request: "invalid_request";
            technical_failure: "technical_failure";
            permission_refused: "permission_refused";
            limit_reached: "limit_reached";
            missing_data: "missing_data";
        }>>;
        nextMove: z.ZodOptional<z.ZodEnum<{
            stop: "stop";
            retry_same: "retry_same";
            fix_input: "fix_input";
            ask_director: "ask_director";
            ask_referent: "ask_referent";
            ask_owner: "ask_owner";
            wait_event: "wait_event";
        }>>;
        executorVersion: z.ZodString;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type BusinessUnitStateSummary = z.infer<typeof BusinessUnitStateSummarySchema>;
type DeliveryDecision = {
    request: DecisionRequest;
    outcome: DecisionOutcome | null;
};
/** A lead review carries no scope of its own: it arrives paired with the scope it was recorded in. */
export type BusinessUnitStateLeadReview = {
    scope: BusinessUnitStateScope;
    review: AssetVersionLeadReview;
};
/** A session outcome carries no scope of its own: it arrives paired with the scope of the session's assignment. */
export type BusinessUnitStateSessionOutcome = {
    scope: BusinessUnitStateScope;
    outcome: DevSessionOutcome;
};
/**
 * One department's state, read from recorded facts only: no clock, no second state rule. Version states come
 * from `deriveAssetVersionStates`. Every fact outside the requested scope is ignored; facts whose record
 * carries no scope (lead reviews, session outcomes) arrive paired with the scope they were recorded in.
 */
export declare function deriveBusinessUnitStateSummary(input: {
    scope: BusinessUnitStateScope;
    versions: readonly AssetVersionRecord[];
    decisions: readonly DeliveryDecision[];
    leadReviews: readonly BusinessUnitStateLeadReview[];
    assets: readonly AssetRef[];
    sessionOutcomes: readonly BusinessUnitStateSessionOutcome[];
}): BusinessUnitStateSummary;
export {};
//# sourceMappingURL=business-unit-state.d.ts.map