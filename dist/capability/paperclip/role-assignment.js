import { z } from 'zod';
import { AGENT_ROLES } from "../../organization/agent-role.js";
import { RICERCA_TOOLS } from "../ricerca/tools.js";
/**
 * Who may give an assignment to whom, by role (task 7304). One rule for every consumer.
 *
 * Origin: X9 `cap-paperclip/src/seat-peers.ts:64-71,101` (`reachable` plus the Director every seat reaches). Two
 * differences with that code: Lab → Ricerca is missing by decision of Stefano 17/11 («è il lab che avvia la ricerca
 * da sé»: the Lab starts research with its own tool, Ricerca receives no assignment from it); the edge towards the
 * Director is the one every seat has today. The `puoAffidareA` matrix of the `pcp_*` protocol is a different thing.
 */
export const PAPERCLIP_ASSIGNMENT_MATRIX = {
    director: ['capo-bu', 'lab', 'ricerca'],
    'capo-bu': ['lab', 'director'],
    // The dossier goes back to the lead who asked for it.
    lab: ['capo-bu', 'director'],
    ricerca: ['lab', 'director'],
};
/** Closed refusal codes (also the registry reason). */
export const PAPERCLIP_ASSIGNMENT_REFUSALS = ['lab_starts_research_itself', 'assign_target_not_allowed'];
const isRole = (value) => AGENT_ROLES.includes(value);
/** Pure: may `from` give an assignment to `to`? Unknown roles are refused, never thrown. */
export function decideAssignment(from, to) {
    if (!isRole(from) || !isRole(to))
        return { ok: false, refusal: 'assign_target_not_allowed' };
    if (PAPERCLIP_ASSIGNMENT_MATRIX[from].includes(to))
        return { ok: true };
    if (from === 'lab' && to === 'ricerca') {
        return { ok: false, refusal: 'lab_starts_research_itself', useTool: RICERCA_TOOLS.start };
    }
    return { ok: false, refusal: 'assign_target_not_allowed' };
}
/**
 * The assignment plan a seat is born with (task 7364), derived only from the matrix: no role name decides anything.
 * `recipientProtection` is what the seat is born with; `blocked` is never a birth state.
 */
export const PaperclipBirthPlanSchema = z.strictObject({
    permission: z.discriminatedUnion('form', [
        z.strictObject({ form: z.literal('none') }),
        z.strictObject({ form: z.literal('broad') }),
    ]),
    recipientProtection: z.enum(['open', 'protected']),
    canCreateAgents: z.boolean(),
});
export const PAPERCLIP_BIRTH_PLAN_REFUSALS = ['role_unknown'];
/**
 * Pure, never throws. A role is `protected` when exactly one other role can give it work (Paperclip protects such a
 * recipient: only a caller with the broad permission may assign to it, authorization.ts:2146-2175); with no caller or
 * several it is `open`. A role gets the `broad` permission iff its row holds at least one protected role: towards an
 * open recipient Paperclip lets anyone assign. `canCreateAgents` follows the broad permission: Paperclip's access
 * check gives `canAssignTasks` to `canCreateAgents` (agents.ts:1607-1622), the permissions PATCH sums them
 * (agents.ts:4970-4972), and a new agent is born with `canCreateAgents` TRUE (agent-permissions.ts:42-47), so who is
 * not broad must be written false.
 */
export function decideAssignmentBirthPlan(role, matrix = PAPERCLIP_ASSIGNMENT_MATRIX) {
    if (!isRole(role))
        return { ok: false, refusal: 'role_unknown' };
    const protectedRoles = new Set(AGENT_ROLES.filter((target) => AGENT_ROLES.filter((caller) => caller !== target && matrix[caller].includes(target)).length === 1));
    const broad = matrix[role].some((target) => protectedRoles.has(target));
    return {
        ok: true,
        plan: {
            permission: broad ? { form: 'broad' } : { form: 'none' },
            recipientProtection: protectedRoles.has(role) ? 'protected' : 'open',
            canCreateAgents: broad,
        },
    };
}
/**
 * The laptop executor: one Paperclip agent per company (task 8033). It is NOT in `AGENT_ROLES` on purpose: a role there
 * would be read by identity, email policy and the per-role tables, and with it in the matrix the birth plan would see
 * the executor as having a single caller (the lead), hence «protected», and would make the lead «broad» with
 * `canCreateAgents` true: a lead that creates agents, never decided.
 */
export const PAPERCLIP_EXECUTOR_ROLE = 'esecutore';
/** The four roles of today plus the executor: the roles a session assignment can name. */
export const PAPERCLIP_SESSION_ROLES = [...AGENT_ROLES, PAPERCLIP_EXECUTOR_ROLE];
/**
 * Who may give a session assignment to whom: today's matrix, plus lead → executor and executor → lead (the result goes
 * back to the lead who asked). No other role reaches the executor, and the executor reaches nobody else.
 */
export const PAPERCLIP_SESSION_ASSIGNMENT_MATRIX = {
    ...PAPERCLIP_ASSIGNMENT_MATRIX,
    'capo-bu': [...PAPERCLIP_ASSIGNMENT_MATRIX['capo-bu'], PAPERCLIP_EXECUTOR_ROLE],
    [PAPERCLIP_EXECUTOR_ROLE]: ['capo-bu'],
};
const isSessionRole = (value) => PAPERCLIP_SESSION_ROLES.includes(value);
/** Pure: same rules and codes as `decideAssignment`, over the session roles. Unknown roles are refused, never thrown. */
export function decideSessionAssignment(from, to) {
    if (!isSessionRole(from) || !isSessionRole(to))
        return { ok: false, refusal: 'assign_target_not_allowed' };
    if (PAPERCLIP_SESSION_ASSIGNMENT_MATRIX[from].includes(to))
        return { ok: true };
    if (from === 'lab' && to === 'ricerca') {
        return { ok: false, refusal: 'lab_starts_research_itself', useTool: RICERCA_TOOLS.start };
    }
    return { ok: false, refusal: 'assign_target_not_allowed' };
}
/**
 * The executor is born «open» with no permission: it accepts only children of a known lead (checked by the executor
 * itself, outside the bridge), and «protected» would force the lead to hold the broad permission.
 */
export const PAPERCLIP_EXECUTOR_BIRTH_PLAN = { permission: { form: 'none' }, recipientProtection: 'open', canCreateAgents: false };
//# sourceMappingURL=role-assignment.js.map