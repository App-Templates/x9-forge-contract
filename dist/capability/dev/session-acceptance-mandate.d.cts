import type { ReconciledMandate } from "../../organization/business-unit-mandate.cjs";
import { type DevSessionAttestor, type DevSessionCriterion } from "./session-acceptance.cjs";
import { type DevSessionAssignment } from "./session-assignment.cjs";
type MandateCriterion = {
    text: string;
    attestor: Extract<DevSessionAttestor, 'revisore' | 'referente'>;
    units: string[];
    /** Present only when the plan declared a structured requirement for this position. */
    proof?: string;
};
/** Extract only this piece's criteria, preserving blank entries and their plan positions. */
export declare function devSessionMandateCriteria(mandate: ReconciledMandate, deliverableKey: string): MandateCriterion[] | null;
export declare const DEV_SESSION_MANDATE_ACCEPTANCE_PROBLEMS: readonly ["deliverable_key_problem", "mandate_criterion_blank", "mandate_criterion_missing", "mandate_criterion_unknown", "mandate_attestor_not_available", "mandate_unit_not_owner"];
type MandateAcceptanceProblem = {
    code: (typeof DEV_SESSION_MANDATE_ACCEPTANCE_PROBLEMS)[number];
    details: string[];
};
/** Return the first refusal, in contract order, with every affected text, position or criterion id. */
export declare function devSessionMandateAcceptanceProblem(assignment: DevSessionAssignment, mandate: ReconciledMandate): MandateAcceptanceProblem | null;
/** Stable name of a mandate criterion: the piece key plus its 1-based position in the saved plan, so nothing stored changes. */
export declare function mandateCriterionId(deliverableKey: string, index: number): string;
/** Written proof for criteria carried over from the mandate; it only says that the referent judges them. */
export declare const DEV_SESSION_MANDATE_CRITERION_PROOF = "Giudizio del referente sulla consegna, con l'anteprima da guardare";
export declare const DEV_SESSION_COMPLETE_MANDATE_PROBLEMS: readonly ["deliverable_key_problem", "mandate_criterion_blank", "criterion_id_too_long", "criterion_id_taken", "too_many_criteria"];
type CompleteMandateResult = {
    ok: true;
    criteria: DevSessionCriterion[];
} | {
    ok: false;
    code: (typeof DEV_SESSION_COMPLETE_MANDATE_PROBLEMS)[number];
    details: string[];
};
/**
 * Append the mandate criteria the lead did not write, named by position. Criteria already in `own`
 * (same trimmed text, origin `mandato`) are left untouched, so hand-written input comes back identical.
 */
export declare function devSessionCompleteMandateCriteria(mandate: ReconciledMandate, deliverableKey: string, own: DevSessionCriterion[]): CompleteMandateResult;
export {};
//# sourceMappingURL=session-acceptance-mandate.d.ts.map