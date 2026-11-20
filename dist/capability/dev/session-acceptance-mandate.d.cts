import type { ReconciledMandate } from "../../organization/business-unit-mandate.cjs";
import type { DevSessionAttestor } from "./session-acceptance.cjs";
import { type DevSessionAssignment } from "./session-assignment.cjs";
type MandateCriterion = {
    text: string;
    attestor: Extract<DevSessionAttestor, 'revisore' | 'referente'>;
    units: string[];
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
export {};
//# sourceMappingURL=session-acceptance-mandate.d.ts.map