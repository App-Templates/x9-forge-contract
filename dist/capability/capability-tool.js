import { z } from 'zod';
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
});
//# sourceMappingURL=capability-tool.js.map