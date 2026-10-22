import { z } from 'zod';
import { AgentRoleSchema, type AgentRole } from '../organization/agent-role.js';

export const CAPABILITY_TOOL_ACCESS = ['read', 'write'] as const;
export const CapabilityToolAccessSchema = z.enum(CAPABILITY_TOOL_ACCESS);
export type CapabilityToolAccess = z.infer<typeof CapabilityToolAccessSchema>;

/**
 * A single tool exposed by a capability service.
 *
 * Cross-repo contract: X9 dispatches tool calls to capability services using
 * this shape. Forge uses it when listing tools in the UI.
 *
 * @see CapabilityManifest — manifest returned by GET /manifest
 * @see ToolCallRequest — request sent to POST /call/:tool
 */
export const CapabilityToolSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  inputSchema: z.record(z.string(), z.unknown()),
  // assente = write, come prima della 1.58
  access: CapabilityToolAccessSchema.optional(),
  // assente = ogni ruolo; presente = solo questi ruoli
  roles: z.array(AgentRoleSchema).min(1).refine(
    roles => new Set(roles).size === roles.length,
    { message: 'Tool roles must be unique' },
  ).optional(),
});

export type CapabilityTool = z.infer<typeof CapabilityToolSchema>;

/** Keep unrestricted tools and those explicitly available to the agent role. */
export function toolsForRole<T extends CapabilityTool>(tools: readonly T[], role: AgentRole): T[] {
  return tools.filter(tool => tool.roles === undefined || tool.roles.includes(role));
}

/** Effective access of a tool: an undeclared `access` counts as `write`. */
export function capabilityToolAccess(tool: CapabilityTool): CapabilityToolAccess {
  return tool.access ?? 'write';
}
