import { z } from 'zod';
import { ToolCallRequestSchema, ToolCallResponseSchema } from "../../capability/tool-call.js";
/** Shared capability dispatch URL; consumers must not duplicate the route literal. */
export const CapToolCallParamsSchema = z.object({
    tool: z.string().regex(/^[a-z][a-z0-9_]{0,127}$/),
});
/** agent-core -> capability, authenticated by INTERNAL_SECRET_HEADER. */
export const capToolCallContract = {
    method: 'POST',
    path: '/call/:tool',
    authType: 'secret',
    paramsSchema: CapToolCallParamsSchema,
    bodySchema: ToolCallRequestSchema,
    responseSchema: ToolCallResponseSchema,
};
export function capToolCallPath(tool) {
    return capToolCallContract.path.replace(':tool', CapToolCallParamsSchema.parse({ tool }).tool);
}
//# sourceMappingURL=cap-tool-call.js.map