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
//# sourceMappingURL=role-assignment.js.map