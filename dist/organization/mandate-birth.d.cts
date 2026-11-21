import type { ActionPlan } from "./action-plan.cjs";
import type { ReconciledMandate } from "./business-unit-mandate.cjs";
export type ActionPlanContractInput = Pick<ActionPlan, 'businessUnits'> & Partial<Pick<ActionPlan, 'deliveryShape' | 'workBreakdown'>>;
/** Paths of the metadata a new plan still lacks. An empty list means the plan may enter. */
export declare function actionPlanContractProblems(plan: ActionPlanContractInput): string[];
/** Same check for one unit's mandate; only the pieces of that unit are asked, never those of other units. */
export declare function mandateContractProblems(planSection: ReconciledMandate['planSection']): string[];
//# sourceMappingURL=mandate-birth.d.ts.map