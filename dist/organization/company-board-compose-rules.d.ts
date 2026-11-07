import type { ActionPlan, ActionPlanBuSection } from "./action-plan.js";
import type { CompanyBoard, CompanyBoardUnit, CompanyBoardUnitState, CompanyBoardWait } from "./company-board.js";
import type { BoardRuleDecision, BoardRuleIssueStatus, BoardRuleSession } from "./company-board-rule.js";
/** Remains unknown until the owner-comment outcome proof (5736, case 3). */
export declare const OWNER_COMMENT_REGISTERS_OUTCOME: boolean | null;
export type BoardComposeMilestone = Pick<ActionPlan['milestones'][number], 'number' | 'blockedBy'> & {
    buSlug?: string;
    title?: string;
    status?: BoardRuleIssueStatus;
    closedByDirector?: boolean;
    at?: string | null;
    /** One-based position from the explicit “parte X di N” outline. */
    partIndex?: number;
    partCount?: number;
};
export type BoardComposeSession = BoardRuleSession & {
    title: string;
    partIndex?: number;
    partCount?: number;
};
export type BoardComposeUnit = Pick<CompanyBoardUnit, 'buSlug' | 'name' | 'state' | 'since' | 'why' | 'referent' | 'waitingFor'>;
export type BoardComposeDependency = CompanyBoard['exchanges'][number] & {
    since?: string | null;
    partIndex?: number | null;
};
export type BoardComposeDecision = BoardRuleDecision & {
    buSlug: string;
    who?: CompanyBoardWait['who'];
    partIndex?: number | null;
    what?: string;
    mail?: {
        subject: string;
        at: string;
        ref: string | null;
    } | null;
};
/** No inferred prefix of completed parts: each section needs its own evidence. */
export declare function deriveParts(sezioni: readonly ActionPlanBuSection[] | undefined, tappe: readonly BoardComposeMilestone[], sessioni: readonly BoardComposeSession[], statoReparto: CompanyBoardUnitState, { timeZone }?: {
    timeZone?: string;
}): CompanyBoardUnit['parts'];
/** One project-wide order: owner, referents/other units, Director, system faults. */
export declare function deriveWaits(reparti: readonly BoardComposeUnit[], dipendenze: readonly BoardComposeDependency[], decisioni: readonly BoardComposeDecision[], { timeZone }?: {
    timeZone?: string;
}): CompanyBoard['waits'];
//# sourceMappingURL=company-board-compose-rules.d.ts.map