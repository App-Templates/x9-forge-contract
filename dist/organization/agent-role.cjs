"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AGENT_ROLE_BASE_CAPABILITIES = exports.AgentRoleSchema = exports.AGENT_ROLES = exports.BUSINESS_UNIT_LEAD_ROLE = exports.DIRECTOR_ROLE = void 0;
exports.roleCapabilities = roleCapabilities;
const zod_1 = require("zod");
/** Agent role responsible for directing the company. */
exports.DIRECTOR_ROLE = 'director';
/** Agent role responsible for leading a business unit. */
exports.BUSINESS_UNIT_LEAD_ROLE = 'capo-bu';
exports.AGENT_ROLES = [exports.DIRECTOR_ROLE, exports.BUSINESS_UNIT_LEAD_ROLE];
exports.AgentRoleSchema = zod_1.z.enum(exports.AGENT_ROLES);
/** Capabilities every role is born with; the role fixes them, nobody can remove them. */
exports.AGENT_ROLE_BASE_CAPABILITIES = {
    [exports.DIRECTOR_ROLE]: ['email', 'memory', 'lab', 'ricerca', 'paperclip'],
    [exports.BUSINESS_UNIT_LEAD_ROLE]: ['email', 'memory', 'lab', 'qa', 'ricerca', 'paperclip'],
};
/** Base capabilities of the role followed by the extras, without duplicates. */
function roleCapabilities(role, extra = []) {
    const result = [...exports.AGENT_ROLE_BASE_CAPABILITIES[role]];
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