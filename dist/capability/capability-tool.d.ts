import { z } from 'zod';
import { type AgentRole } from "../organization/agent-role.js";
export declare const CAPABILITY_TOOL_ACCESS: readonly ["read", "write"];
export declare const CapabilityToolAccessSchema: z.ZodEnum<{
    read: "read";
    write: "write";
}>;
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
export declare const CapabilityToolSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    inputSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    access: z.ZodOptional<z.ZodEnum<{
        read: "read";
        write: "write";
    }>>;
    roles: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        director: "director";
        "capo-bu": "capo-bu";
    }>>>;
}, z.core.$strip>;
export type CapabilityTool = z.infer<typeof CapabilityToolSchema>;
/** Keep unrestricted tools and those explicitly available to the agent role. */
export declare function toolsForRole<T extends CapabilityTool>(tools: readonly T[], role: AgentRole): T[];
/** Effective access of a tool: an undeclared `access` counts as `write`. */
export declare function capabilityToolAccess(tool: CapabilityTool): CapabilityToolAccess;
//# sourceMappingURL=capability-tool.d.ts.map