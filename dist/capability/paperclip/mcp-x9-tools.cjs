"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.X9McpCallKeySchema = exports.X9_MCP_RESULT_MAX_BYTES = exports.X9McpRefusalDetailSchema = exports.X9McpRefusalSchema = exports.X9_MCP_REFUSALS = exports.X9McpToolDescriptorSchema = exports.X9McpToolNameSchema = exports.X9_MCP_TOOLS = exports.X9McpMemoryRecallInputSchema = exports.X9_MCP_PROTOCOL_VERSIONS = void 0;
exports.x9McpToolDescriptors = x9McpToolDescriptors;
exports.x9McpRefusalResult = x9McpRefusalResult;
exports.x9McpSuccessResult = x9McpSuccessResult;
const zod_1 = require("zod");
const internal_memory_recall_bundle_js_1 = require("../../http/endpoints/internal-memory-recall-bundle.cjs");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
/** Paperclip requests the first version (server/src/services/mcp-http.ts:17). */
exports.X9_MCP_PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];
exports.X9McpMemoryRecallInputSchema = zod_1.z.strictObject({
    query: zod_1.z.string().trim().min(1).max(internal_memory_recall_bundle_js_1.MEMORY_RECALL_QUERY_MAX_CHARS),
    topK: zod_1.z.int().min(internal_memory_recall_bundle_js_1.MEMORY_RECALL_TOP_K_MIN).max(internal_memory_recall_bundle_js_1.MEMORY_RECALL_TOP_K_MAX).optional(),
});
/**
 * Paperclip derives risk from hints and name verbs (server/src/services/tool-access.ts:2340-2411,
 * especially :2398-2406; doc/MCP-ACCESS-GOVERNANCE.md:189-201). Keep risk next to the offered tool
 * so tools/list cannot accidentally describe a write as a read.
 */
exports.X9_MCP_TOOLS = Object.freeze({
    x9_memory_recall: {
        x9Tool: 'memory_recall',
        risk: 'read',
        description: 'Read the memory of the lead you work for. Read-only. The same question in the same assignment returns the previously recorded answer.',
        inputSchema: exports.X9McpMemoryRecallInputSchema,
    },
});
exports.X9McpToolNameSchema = zod_1.z.enum(Object.keys(exports.X9_MCP_TOOLS));
exports.X9McpToolDescriptorSchema = zod_1.z.strictObject({
    name: exports.X9McpToolNameSchema,
    description: zod_1.z.string().min(1).max(1000),
    inputSchema: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
    annotations: zod_1.z.strictObject({
        readOnlyHint: zod_1.z.boolean(),
        destructiveHint: zod_1.z.literal(false),
        idempotentHint: zod_1.z.boolean(),
        openWorldHint: zod_1.z.literal(false),
    }),
});
function x9McpToolDescriptors() {
    return Object.entries(exports.X9_MCP_TOOLS).map(([name, tool]) => {
        // Zod attaches a "~standard" helper (functions) to the generated schema; it must not reach tools/list.
        const { '~standard': _standard, ...jsonSchema } = zod_1.z.toJSONSchema(tool.inputSchema);
        return exports.X9McpToolDescriptorSchema.parse({
            name,
            description: tool.description,
            inputSchema: jsonSchema,
            annotations: {
                readOnlyHint: tool.risk === 'read',
                destructiveHint: false,
                idempotentHint: tool.risk === 'read',
                openWorldHint: false,
            },
        });
    });
}
exports.X9_MCP_REFUSALS = [
    'caller_header_missing', 'caller_header_invalid', 'agent_unknown', 'agent_company_mismatch',
    'binding_refused', 'binding_unavailable', 'tool_not_offered', 'input_invalid', 'call_in_progress', 'execution_failed',
];
exports.X9McpRefusalSchema = zod_1.z.enum(exports.X9_MCP_REFUSALS);
exports.X9McpRefusalDetailSchema = zod_1.z.strictObject({
    error: exports.X9McpRefusalSchema,
    message: zod_1.z.string().min(1).max(500),
    agentId: zod_1.z.guid().optional(),
    field: zod_1.z.string().min(1).max(80).optional(),
});
/**
 * A refusal is a tool result, never an HTTP or JSON-RPC error: Paperclip marks the whole connection
 * as error on those failures (server/src/services/tool-gateway.ts:6062-6067,6113-6124), and an errored
 * connection reaches no run (server/src/services/heartbeat.ts:4644-4652).
 */
function x9McpRefusalResult(detail) {
    const parsed = exports.X9McpRefusalDetailSchema.parse(detail);
    return {
        content: [{ type: 'text', text: `${parsed.error}: ${parsed.message}` }],
        structuredContent: parsed,
        isError: true,
    };
}
/** Paperclip does not retry tools/call (server/src/services/tool-gateway.ts:6021-6026); expose recorded replay explicitly. */
function x9McpSuccessResult(result, replay) {
    return {
        content: [{ type: 'text', text: JSON.stringify(result) }],
        structuredContent: {
            result,
            replayed: replay !== undefined,
            ...(replay === undefined ? {} : { recordedAt: replay.recordedAt }),
        },
        isError: false,
    };
}
/** Leave envelope headroom under Paperclip's 1 MB response limit (server/src/services/tool-gateway.ts:218). */
exports.X9_MCP_RESULT_MAX_BYTES = 900_000;
/**
 * The same request has the same recognised X9 identity, company, issue, tool and validated input digest.
 * Never include a run, attempt or correlation_id: those change on resumption. Identity prevents two
 * agents working on the same issue from receiving each other's memory.
 */
exports.X9McpCallKeySchema = zod_1.z.strictObject({ scope: capability_call_identity_js_1.CapabilityAgentScopeSchema, companyId: zod_1.z.guid(), issueId: zod_1.z.guid(), tool: exports.X9McpToolNameSchema, inputDigest: zod_1.z.string().regex(/^[0-9a-f]{64}$/) });
//# sourceMappingURL=mcp-x9-tools.js.map