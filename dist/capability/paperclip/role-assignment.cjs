"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAPERCLIP_BIRTH_PLAN_REFUSALS = exports.PaperclipBirthPlanSchema = exports.PAPERCLIP_ASSIGNMENT_REFUSALS = exports.PAPERCLIP_ASSIGNMENT_MATRIX = void 0;
exports.decideAssignment = decideAssignment;
exports.decideAssignmentBirthPlan = decideAssignmentBirthPlan;
const zod_1 = require("zod");
const agent_role_js_1 = require("../../organization/agent-role.cjs");
const tools_js_1 = require("../ricerca/tools.cjs");
/**
 * Who may give an assignment to whom, by role (task 7304). One rule for every consumer.
 *
 * Origin: X9 `cap-paperclip/src/seat-peers.ts:64-71,101` (`reachable` plus the Director every seat reaches). Two
 * differences with that code: Lab → Ricerca is missing by decision of Stefano 17/11 («è il lab che avvia la ricerca
 * da sé»: the Lab starts research with its own tool, Ricerca receives no assignment from it); the edge towards the
 * Director is the one every seat has today. The `puoAffidareA` matrix of the `pcp_*` protocol is a different thing.
 */
exports.PAPERCLIP_ASSIGNMENT_MATRIX = {
    director: ['capo-bu', 'lab', 'ricerca'],
    'capo-bu': ['lab', 'director'],
    // The dossier goes back to the lead who asked for it.
    lab: ['capo-bu', 'director'],
    ricerca: ['lab', 'director'],
};
/** Closed refusal codes (also the registry reason). */
exports.PAPERCLIP_ASSIGNMENT_REFUSALS = ['lab_starts_research_itself', 'assign_target_not_allowed'];
const isRole = (value) => agent_role_js_1.AGENT_ROLES.includes(value);
/** Pure: may `from` give an assignment to `to`? Unknown roles are refused, never thrown. */
function decideAssignment(from, to) {
    if (!isRole(from) || !isRole(to))
        return { ok: false, refusal: 'assign_target_not_allowed' };
    if (exports.PAPERCLIP_ASSIGNMENT_MATRIX[from].includes(to))
        return { ok: true };
    if (from === 'lab' && to === 'ricerca') {
        return { ok: false, refusal: 'lab_starts_research_itself', useTool: tools_js_1.RICERCA_TOOLS.start };
    }
    return { ok: false, refusal: 'assign_target_not_allowed' };
}
/**
 * The assignment plan a seat is born with (task 7364), derived only from the matrix: no role name decides anything.
 * `recipientProtection` is what the seat is born with; `blocked` is never a birth state.
 */
exports.PaperclipBirthPlanSchema = zod_1.z.strictObject({
    permission: zod_1.z.discriminatedUnion('form', [
        zod_1.z.strictObject({ form: zod_1.z.literal('none') }),
        zod_1.z.strictObject({ form: zod_1.z.literal('broad') }),
    ]),
    recipientProtection: zod_1.z.enum(['open', 'protected']),
    canCreateAgents: zod_1.z.boolean(),
});
exports.PAPERCLIP_BIRTH_PLAN_REFUSALS = ['role_unknown'];
/**
 * Pure, never throws. A role is `protected` when exactly one other role can give it work (Paperclip protects such a
 * recipient: only a caller with the broad permission may assign to it, authorization.ts:2146-2175); with no caller or
 * several it is `open`. A role gets the `broad` permission iff its row holds at least one protected role: towards an
 * open recipient Paperclip lets anyone assign. `canCreateAgents` follows the broad permission: Paperclip's access
 * check gives `canAssignTasks` to `canCreateAgents` (agents.ts:1607-1622), the permissions PATCH sums them
 * (agents.ts:4970-4972), and a new agent is born with `canCreateAgents` TRUE (agent-permissions.ts:42-47), so who is
 * not broad must be written false.
 */
function decideAssignmentBirthPlan(role, matrix = exports.PAPERCLIP_ASSIGNMENT_MATRIX) {
    if (!isRole(role))
        return { ok: false, refusal: 'role_unknown' };
    const protectedRoles = new Set(agent_role_js_1.AGENT_ROLES.filter((target) => agent_role_js_1.AGENT_ROLES.filter((caller) => caller !== target && matrix[caller].includes(target)).length === 1));
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
//# sourceMappingURL=role-assignment.js.map