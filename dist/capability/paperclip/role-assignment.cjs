"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAPERCLIP_ASSIGNMENT_REFUSALS = exports.PAPERCLIP_ASSIGNMENT_MATRIX = void 0;
exports.decideAssignment = decideAssignment;
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
//# sourceMappingURL=role-assignment.js.map