"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityToolSchema = exports.CapabilityToolAccessSchema = exports.CAPABILITY_TOOL_ACCESS = void 0;
exports.toolsForRole = toolsForRole;
exports.capabilityToolAccess = capabilityToolAccess;
const zod_1 = require("zod");
const agent_role_js_1 = require("../organization/agent-role.cjs");
exports.CAPABILITY_TOOL_ACCESS = ['read', 'write'];
exports.CapabilityToolAccessSchema = zod_1.z.enum(exports.CAPABILITY_TOOL_ACCESS);
/**
 * A single tool exposed by a capability service.
 *
 * Cross-repo contract: X9 dispatches tool calls to capability services using
 * this shape. Forge uses it when listing tools in the UI.
 *
 * @see CapabilityManifest — manifest returned by GET /manifest
 * @see ToolCallRequest — request sent to POST /call/:tool
 */
exports.CapabilityToolSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string(),
    inputSchema: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
    // assente = write, come prima della 1.58
    access: exports.CapabilityToolAccessSchema.optional(),
    // assente = ogni ruolo; presente = solo questi ruoli
    roles: zod_1.z.array(agent_role_js_1.AgentRoleSchema).min(1).refine(roles => new Set(roles).size === roles.length, { message: 'Tool roles must be unique' }).optional(),
});
/** Keep unrestricted tools and those explicitly available to the agent role. */
function toolsForRole(tools, role) {
    return tools.filter(tool => tool.roles === undefined || tool.roles.includes(role));
}
/** Effective access of a tool: an undeclared `access` counts as `write`. */
function capabilityToolAccess(tool) {
    return tool.access ?? 'write';
}
//# sourceMappingURL=capability-tool.js.map