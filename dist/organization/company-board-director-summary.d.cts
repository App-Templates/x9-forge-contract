import type { CompanyBoard, CompanyBoardUnit, CompanyBoardWait } from "./company-board.cjs";
import type { BoardRuleAgent, BoardRuleIssue } from "./company-board-rule.cjs";
export type BoardDirectorAgent = Pick<BoardRuleAgent, 'status'> & Pick<CompanyBoard['director'], 'wokenAt' | 'wokenWhy'> & {
    /** Project approvals and deliveries, supplied by the caller from the real history. */
    events: readonly Pick<CompanyBoard['projectHistory'][number], 'at' | 'kind'>[];
};
export type BoardDirectorIssue = Pick<BoardRuleIssue, 'status' | 'createdAt' | 'startedAt'> & {
    title: string;
};
export type BoardDirectorDerivation = CompanyBoard['director'] & Pick<CompanyBoard, 'milestones' | 'milestoneLine'>;
export type BoardSummaryUnit = Pick<CompanyBoardUnit, 'buSlug' | 'name' | 'state' | 'since' | 'why' | 'late' | 'alert'>;
type Options = {
    timeZone?: string;
};
/** Null/empty milestones mean no plan; waits are the result of deriveWaits, never recomputed here. */
export declare function deriveDirector(agente: BoardDirectorAgent | null, incarichi: readonly BoardDirectorIssue[], tappe: readonly CompanyBoard['milestones'][number][] | null, attese: readonly CompanyBoardWait[], ora: Date, { timeZone }?: Options): BoardDirectorDerivation;
/** At most two sentences: movement and worst blocker, then the person who can act. */
export declare function deriveSummary(reparti: readonly BoardSummaryUnit[], attese: readonly CompanyBoardWait[], { timeZone }?: Options): CompanyBoard['summary'];
export {};
//# sourceMappingURL=company-board-director-summary.d.ts.map