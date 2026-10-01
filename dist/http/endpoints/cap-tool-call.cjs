"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capToolCallContract = exports.CapToolCallParamsSchema = void 0;
exports.capToolCallPath = capToolCallPath;
const zod_1 = require("zod");
const tool_call_js_1 = require("../../capability/tool-call.cjs");
/** Shared capability dispatch URL; consumers must not duplicate the route literal. */
exports.CapToolCallParamsSchema = zod_1.z.object({
    tool: zod_1.z.string().regex(/^[a-z][a-z0-9_]{0,127}$/),
});
/** agent-core -> capability, authenticated by INTERNAL_SECRET_HEADER. */
exports.capToolCallContract = {
    method: 'POST',
    path: '/call/:tool',
    authType: 'secret',
    paramsSchema: exports.CapToolCallParamsSchema,
    bodySchema: tool_call_js_1.ToolCallRequestSchema,
    responseSchema: tool_call_js_1.ToolCallResponseSchema,
};
function capToolCallPath(tool) {
    return exports.capToolCallContract.path.replace(':tool', exports.CapToolCallParamsSchema.parse({ tool }).tool);
}
//# sourceMappingURL=cap-tool-call.js.map