import { z } from 'zod';
/** Paperclip requests the first version (server/src/services/mcp-http.ts:17). */
export declare const X9_MCP_PROTOCOL_VERSIONS: readonly ["2025-06-18", "2025-03-26", "2024-11-05"];
export declare const X9McpMemoryRecallInputSchema: z.ZodObject<{
    query: z.ZodString;
    topK: z.ZodOptional<z.ZodInt>;
}, z.core.$strict>;
/**
 * Paperclip derives risk from hints and name verbs (server/src/services/tool-access.ts:2340-2411,
 * especially :2398-2406; doc/MCP-ACCESS-GOVERNANCE.md:189-201). Keep risk next to the offered tool
 * so tools/list cannot accidentally describe a write as a read.
 */
export declare const X9_MCP_TOOLS: Readonly<{
    readonly x9_memory_recall: {
        readonly x9Tool: "memory_recall";
        readonly risk: "read";
        readonly description: "Read the memory of the lead you work for. Read-only. The same question in the same assignment returns the previously recorded answer.";
        readonly inputSchema: z.ZodObject<{
            query: z.ZodString;
            topK: z.ZodOptional<z.ZodInt>;
        }, z.core.$strict>;
    };
}>;
export declare const X9McpToolNameSchema: z.ZodEnum<{
    x9_memory_recall: "x9_memory_recall";
}>;
export declare const X9McpToolDescriptorSchema: z.ZodObject<{
    name: z.ZodEnum<{
        x9_memory_recall: "x9_memory_recall";
    }>;
    description: z.ZodString;
    inputSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    annotations: z.ZodObject<{
        readOnlyHint: z.ZodBoolean;
        destructiveHint: z.ZodLiteral<false>;
        idempotentHint: z.ZodBoolean;
        openWorldHint: z.ZodLiteral<false>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare function x9McpToolDescriptors(): {
    name: "x9_memory_recall";
    description: string;
    inputSchema: Record<string, unknown>;
    annotations: {
        readOnlyHint: boolean;
        destructiveHint: false;
        idempotentHint: boolean;
        openWorldHint: false;
    };
}[];
export declare const X9_MCP_REFUSALS: readonly ["caller_header_missing", "caller_header_invalid", "agent_unknown", "agent_company_mismatch", "binding_refused", "binding_unavailable", "tool_not_offered", "input_invalid", "call_in_progress", "execution_failed"];
export declare const X9McpRefusalSchema: z.ZodEnum<{
    caller_header_missing: "caller_header_missing";
    caller_header_invalid: "caller_header_invalid";
    agent_unknown: "agent_unknown";
    agent_company_mismatch: "agent_company_mismatch";
    binding_refused: "binding_refused";
    binding_unavailable: "binding_unavailable";
    tool_not_offered: "tool_not_offered";
    input_invalid: "input_invalid";
    call_in_progress: "call_in_progress";
    execution_failed: "execution_failed";
}>;
export declare const X9McpRefusalDetailSchema: z.ZodObject<{
    error: z.ZodEnum<{
        caller_header_missing: "caller_header_missing";
        caller_header_invalid: "caller_header_invalid";
        agent_unknown: "agent_unknown";
        agent_company_mismatch: "agent_company_mismatch";
        binding_refused: "binding_refused";
        binding_unavailable: "binding_unavailable";
        tool_not_offered: "tool_not_offered";
        input_invalid: "input_invalid";
        call_in_progress: "call_in_progress";
        execution_failed: "execution_failed";
    }>;
    message: z.ZodString;
    agentId: z.ZodOptional<z.ZodGUID>;
    field: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
/**
 * A refusal is a tool result, never an HTTP or JSON-RPC error: Paperclip marks the whole connection
 * as error on those failures (server/src/services/tool-gateway.ts:6062-6067,6113-6124), and an errored
 * connection reaches no run (server/src/services/heartbeat.ts:4644-4652).
 */
export declare function x9McpRefusalResult(detail: unknown): {
    content: {
        type: "text";
        text: string;
    }[];
    structuredContent: {
        error: "caller_header_missing" | "caller_header_invalid" | "agent_unknown" | "agent_company_mismatch" | "binding_refused" | "binding_unavailable" | "tool_not_offered" | "input_invalid" | "call_in_progress" | "execution_failed";
        message: string;
        agentId?: string | undefined;
        field?: string | undefined;
    };
    isError: true;
};
/** Paperclip does not retry tools/call (server/src/services/tool-gateway.ts:6021-6026); expose recorded replay explicitly. */
export declare function x9McpSuccessResult<T>(result: T, replay?: {
    recordedAt: string;
}): {
    content: {
        type: "text";
        text: string;
    }[];
    structuredContent: {
        recordedAt?: string;
        result: T;
        replayed: boolean;
    };
    isError: false;
};
/** Leave envelope headroom under Paperclip's 1 MB response limit (server/src/services/tool-gateway.ts:218). */
export declare const X9_MCP_RESULT_MAX_BYTES = 900000;
/**
 * The same request has the same recognised X9 identity, company, issue, tool and validated input digest.
 * Never include a run, attempt or correlation_id: those change on resumption. Identity prevents two
 * agents working on the same issue from receiving each other's memory.
 */
export declare const X9McpCallKeySchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    companyId: z.ZodGUID;
    issueId: z.ZodGUID;
    tool: z.ZodEnum<{
        x9_memory_recall: "x9_memory_recall";
    }>;
    inputDigest: z.ZodString;
}, z.core.$strict>;
//# sourceMappingURL=mcp-x9-tools.d.ts.map