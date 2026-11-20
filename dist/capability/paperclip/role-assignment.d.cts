import { z } from 'zod';
import { type AgentRole } from "../../organization/agent-role.cjs";
import { type RicercaToolName } from "../ricerca/tools.cjs";
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
/**
 * The assignment plan a seat is born with (task 7364), derived only from the matrix: no role name decides anything.
 * `recipientProtection` is what the seat is born with; `blocked` is never a birth state.
 */
export declare const PaperclipBirthPlanSchema: z.ZodObject<{
    permission: z.ZodDiscriminatedUnion<[z.ZodObject<{
        form: z.ZodLiteral<"none">;
    }, z.core.$strict>, z.ZodObject<{
        form: z.ZodLiteral<"broad">;
    }, z.core.$strict>], "form">;
    recipientProtection: z.ZodEnum<{
        open: "open";
        protected: "protected";
    }>;
    canCreateAgents: z.ZodBoolean;
}, z.core.$strict>;
export type PaperclipBirthPlan = z.infer<typeof PaperclipBirthPlanSchema>;
export declare const PAPERCLIP_BIRTH_PLAN_REFUSALS: readonly ["role_unknown"];
export type PaperclipBirthPlanRefusal = (typeof PAPERCLIP_BIRTH_PLAN_REFUSALS)[number];
export type PaperclipBirthPlanDecision = {
    ok: true;
    plan: PaperclipBirthPlan;
} | {
    ok: false;
    refusal: PaperclipBirthPlanRefusal;
};
/**
 * Pure, never throws. A role is `protected` when exactly one other role can give it work (Paperclip protects such a
 * recipient: only a caller with the broad permission may assign to it, authorization.ts:2146-2175); with no caller or
 * several it is `open`. A role gets the `broad` permission iff its row holds at least one protected role: towards an
 * open recipient Paperclip lets anyone assign. `canCreateAgents` follows the broad permission: Paperclip's access
 * check gives `canAssignTasks` to `canCreateAgents` (agents.ts:1607-1622), the permissions PATCH sums them
 * (agents.ts:4970-4972), and a new agent is born with `canCreateAgents` TRUE (agent-permissions.ts:42-47), so who is
 * not broad must be written false.
 */
export declare function decideAssignmentBirthPlan(role: unknown, matrix?: Readonly<Record<AgentRole, readonly AgentRole[]>>): PaperclipBirthPlanDecision;
/**
 * The laptop executor: one Paperclip agent per company (task 8033). It is NOT in `AGENT_ROLES` on purpose: a role there
 * would be read by identity, email policy and the per-role tables, and with it in the matrix the birth plan would see
 * the executor as having a single caller (the lead), hence «protected», and would make the lead «broad» with
 * `canCreateAgents` true: a lead that creates agents, never decided.
 */
export declare const PAPERCLIP_EXECUTOR_ROLE: "esecutore";
/** The four roles of today plus the executor: the roles a session assignment can name. */
export declare const PAPERCLIP_SESSION_ROLES: readonly ["director", "capo-bu", "lab", "ricerca", "esecutore"];
export type PaperclipSessionRole = (typeof PAPERCLIP_SESSION_ROLES)[number];
/**
 * Who may give a session assignment to whom: today's matrix, plus lead → executor and executor → lead (the result goes
 * back to the lead who asked). No other role reaches the executor, and the executor reaches nobody else.
 */
export declare const PAPERCLIP_SESSION_ASSIGNMENT_MATRIX: Readonly<Record<PaperclipSessionRole, readonly PaperclipSessionRole[]>>;
/** Pure: same rules and codes as `decideAssignment`, over the session roles. Unknown roles are refused, never thrown. */
export declare function decideSessionAssignment(from: PaperclipSessionRole, to: PaperclipSessionRole): PaperclipAssignmentDecision;
/**
 * The executor is born «open» with no permission: it accepts only children of a known lead (checked by the executor
 * itself, outside the bridge), and «protected» would force the lead to hold the broad permission.
 */
export declare const PAPERCLIP_EXECUTOR_BIRTH_PLAN: PaperclipBirthPlan;
//# sourceMappingURL=role-assignment.d.ts.map