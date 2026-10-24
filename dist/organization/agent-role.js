import { z } from 'zod';
/** Agent role responsible for directing the company. */
export const DIRECTOR_ROLE = 'director';
/** Agent role responsible for leading a business unit. */
export const BUSINESS_UNIT_LEAD_ROLE = 'capo-bu';
/** R&D agent that keeps the company notebook (Lab, 1.65.0). */
export const LAB_ROLE = 'lab';
/** R&D agent that researches outside the company (Ricerca, 1.65.0). */
export const RICERCA_ROLE = 'ricerca';
export const AGENT_ROLES = [DIRECTOR_ROLE, BUSINESS_UNIT_LEAD_ROLE, LAB_ROLE, RICERCA_ROLE];
export const AgentRoleSchema = z.enum(AGENT_ROLES);
/** Capabilities every role is born with; the role fixes them, nobody can remove them. */
export const AGENT_ROLE_BASE_CAPABILITIES = {
    [DIRECTOR_ROLE]: ['email', 'memory', 'lab', 'ricerca', 'paperclip'],
    [BUSINESS_UNIT_LEAD_ROLE]: ['email', 'memory', 'lab', 'qa', 'ricerca', 'paperclip'],
    [LAB_ROLE]: ['ricerca', 'lab', 'email', 'memory'],
    [RICERCA_ROLE]: ['ricerca', 'lab', 'email', 'memory'],
};
/** Base capabilities of the role followed by the extras, without duplicates. */
export function roleCapabilities(role, extra = []) {
    const result = [...AGENT_ROLE_BASE_CAPABILITIES[role]];
    for (const raw of extra) {
        const name = raw.trim();
        if (name === '')
            throw new Error('Extra capability must not be empty');
        if (!result.includes(name))
            result.push(name);
    }
    return result;
}
//# sourceMappingURL=agent-role.js.map