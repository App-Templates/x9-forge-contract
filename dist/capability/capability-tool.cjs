"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityToolSchema = void 0;
const zod_1 = require("zod");
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
});
//# sourceMappingURL=capability-tool.js.map