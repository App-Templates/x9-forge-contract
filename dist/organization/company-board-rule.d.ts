import type { COMPANY_BOARD_SOURCES, CompanyBoardPartState, CompanyBoardUnit } from "./company-board.js";
/**
 * Company board rule (1.111.0): the one function that says, in words, what state a unit is in.
 * Pure: no network, no clock (`now` is passed), no reading of the sources — the caller (agent-core)
 * hands over what the sources said, in their native shape, and which sources did not answer.
 * Every time written in `why`/`stateLabel` is in the owner's time zone (`timeZone`).
 */
export type CompanyBoardSourceName = (typeof COMPANY_BOARD_SOURCES)[number];
/** Native Paperclip issue statuses (`packages/shared/src/constants.ts:189-197`). */
export type BoardRuleIssueStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'done' | 'cancelled';
/** Session states of `cap-dev/src/board/stato.ts`. */
export type BoardRuleSessionState = 'richiesta' | 'analisi' | 'report-pronto' | 'approvato' | 'in-lavorazione' | 'revisione' | 'chiuso' | 'scartato' | 'bloccato';
export type BoardRuleAssignee = {
    kind: 'director';
} | {
    kind: 'reparto';
    buSlug: string;
    name?: string | null;
} | {
    kind: 'altro';
};
/** The issue that blocks another one. `approvalMark`: it carries the `x9-approvato:` mark. */
export interface BoardRuleBlocker {
    identifier: string;
    status: BoardRuleIssueStatus;
    assignee: BoardRuleAssignee;
    approvalMark: boolean;
}
export interface BoardRuleIssue {
    identifier: string;
    /** The unit's Mandato; the other issues are the work of its parts. */
    isMandate: boolean;
    status: BoardRuleIssueStatus;
    createdAt?: string | null;
    updatedAt: string | null;
    startedAt: string | null;
    blockedSince: string | null;
    blockedBy: BoardRuleBlocker[];
    /** `fromReply`: the comment is an answer relayed from the referent. */
    comments: {
        at: string;
        fromReply: boolean;
    }[];
}
export interface BoardRulePart {
    index: number;
    title: string;
    state: CompanyBoardPartState;
    blockedBy: BoardRuleBlocker[];
}
export interface BoardRuleRun {
    status: 'succeeded' | 'failed' | 'error' | 'timed_out' | 'running' | 'queued' | 'cancelled';
    errorCode: string | null;
    at: string;
}
export interface BoardRuleAgent {
    /** Native Paperclip agent status (`constants.ts:16-24`). */
    status: string;
    /** Native pause reason (`constants.ts:204`). */
    pauseReason: string | null;
    pausedAt: string | null;
    pausedByOwner: boolean | null;
    runs: BoardRuleRun[];
}
export interface BoardRuleDecision {
    addressedTo: 'owner' | 'referent';
    createdAt: string;
    decidedAt: string | null;
    outcome: 'approved' | 'rejected' | null;
}
export interface BoardRuleSession {
    state: BoardRuleSessionState;
    at: string;
}
export interface BoardRulePerson {
    name: string;
    initials: string;
    role: string;
}
export interface BoardRuleInput {
    buSlug: string;
    /** Name of the unit as the page writes it. */
    unitName: string;
    /** Null when the lead agent could not be read. */
    agent: BoardRuleAgent | null;
    issues: BoardRuleIssue[];
    parts: BoardRulePart[];
    decisions: BoardRuleDecision[];
    sessions: BoardRuleSession[];
    referentPresent: boolean;
    referent: BoardRulePerson | null;
    owner: BoardRulePerson | null;
    missingSources: CompanyBoardSourceName[];
}
export interface BoardRuleThresholds {
    /** Work in progress with no movement for longer than this is `fermo`. */
    lavoroMs: number;
    /** A wait older than this is `late`. */
    attesaMs: number;
    /** After an approval or a delivery, nothing new for longer than this means it did not restart. */
    ripartenzaMs?: number;
}
export declare const COMPANY_BOARD_DEFAULT_THRESHOLDS: {
    readonly lavoroMs: number;
    readonly attesaMs: number;
    readonly ripartenzaMs: number;
};
export declare const COMPANY_BOARD_DEFAULT_TIME_ZONE = "Europe/Rome";
/** Technical error codes in words; the code itself is never shown. */
export declare const COMPANY_BOARD_ERROR_CODE_WORDS: Readonly<Record<string, string>>;
export type CompanyBoardUnitDerivation = Pick<CompanyBoardUnit, 'state' | 'stateLabel' | 'since' | 'why' | 'late' | 'waitingFor' | 'alert'>;
/**
 * State of one unit, first matching rule wins (see 5701 for the order). `waitingFor` collects every
 * true wait, not only the one that decides the state.
 */
export declare function deriveUnitState(input: BoardRuleInput, now: Date, soglie?: BoardRuleThresholds, timeZone?: string): CompanyBoardUnitDerivation;
//# sourceMappingURL=company-board-rule.d.ts.map