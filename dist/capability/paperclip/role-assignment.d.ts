import { type AgentRole } from "../../organization/agent-role.js";
import { type RicercaToolName } from "../ricerca/tools.js";
/**
 * Who may give an assignment to whom, by role (task 7304). One rule for every consumer.
 *
 * Origin: X9 `cap-paperclip/src/seat-peers.ts:64-71,101` (`reachable` plus the Director every seat reaches). Two
 * differences with that code: Lab → Ricerca is missing by decision of Stefano 17/11 («è il lab che avvia la ricerca
 * da sé»: the Lab starts research with its own tool, Ricerca receives no assignment from it); the edge towards the
 * Director is the one every seat has today. The `puoAffidareA` matrix of the `pcp_*` protocol is a different thing.
 */
export declare const PAPERCLIP_ASSIGNMENT_MATRIX: Readonly<Record<AgentRole, readonly AgentRole[]>>;
/** Closed refusal codes (also the registry reason). */
export declare const PAPERCLIP_ASSIGNMENT_REFUSALS: readonly ["lab_starts_research_itself", "assign_target_not_allowed"];
export type PaperclipAssignmentRefusal = (typeof PAPERCLIP_ASSIGNMENT_REFUSALS)[number];
export type PaperclipAssignmentDecision = {
    ok: true;
} | {
    ok: false;
    refusal: 'lab_starts_research_itself';
    useTool: RicercaToolName;
} | {
    ok: false;
    refusal: 'assign_target_not_allowed';
};
/** Pure: may `from` give an assignment to `to`? Unknown roles are refused, never thrown. */
export declare function decideAssignment(from: AgentRole, to: AgentRole): PaperclipAssignmentDecision;
//# sourceMappingURL=role-assignment.d.ts.map