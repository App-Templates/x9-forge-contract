import { z } from 'zod';
import {
  MEMORY_RECALL_QUERY_MAX_CHARS,
  MEMORY_RECALL_TOP_K_MIN,
  MEMORY_RECALL_TOP_K_MAX,
} from '../../http/endpoints/internal-memory-recall-bundle.js';
import { CapabilityAgentScopeSchema } from '../capability-call-identity.js';

/** Paperclip requests the first version (server/src/services/mcp-http.ts:17). */
export const X9_MCP_PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'] as const;

export const X9McpMemoryRecallInputSchema = z.strictObject({
  query: z.string().trim().min(1).max(MEMORY_RECALL_QUERY_MAX_CHARS),
  topK: z.int().min(MEMORY_RECALL_TOP_K_MIN).max(MEMORY_RECALL_TOP_K_MAX).optional(),
});

/**
 * Paperclip derives risk from hints and name verbs (server/src/services/tool-access.ts:2340-2411,
 * especially :2398-2406; doc/MCP-ACCESS-GOVERNANCE.md:189-201). Keep risk next to the offered tool
 * so tools/list cannot accidentally describe a write as a read.
 */
export const X9_MCP_TOOLS = Object.freeze({
  x9_memory_recall: {
    x9Tool: 'memory_recall',
    risk: 'read',
    description: 'Read the memory of the lead you work for. Read-only. The same question in the same assignment returns the previously recorded answer.',
    inputSchema: X9McpMemoryRecallInputSchema,
  },
} as const satisfies Record<string, {
  x9Tool: string;
  risk: 'read' | 'write';
  description: string;
  inputSchema: z.ZodType;
}>);

export const X9McpToolNameSchema = z.enum(Object.keys(X9_MCP_TOOLS) as [
  keyof typeof X9_MCP_TOOLS, ...(keyof typeof X9_MCP_TOOLS)[],
]);

export const X9McpToolDescriptorSchema = z.strictObject({
  name: X9McpToolNameSchema,
  description: z.string().min(1).max(1000),
  inputSchema: z.record(z.string(), z.unknown()),
  annotations: z.strictObject({
    readOnlyHint: z.boolean(),
    destructiveHint: z.literal(false),
    idempotentHint: z.boolean(),
    openWorldHint: z.literal(false),
  }),
});

export function x9McpToolDescriptors() {
  return Object.entries(X9_MCP_TOOLS).map(([name, tool]) => {
    // Zod attaches a "~standard" helper (functions) to the generated schema; it must not reach tools/list.
    const { '~standard': _standard, ...jsonSchema } = z.toJSONSchema(tool.inputSchema) as Record<string, unknown>;
    return X9McpToolDescriptorSchema.parse({
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

export const X9_MCP_REFUSALS = [
  'caller_header_missing', 'caller_header_invalid', 'agent_unknown', 'agent_company_mismatch',
  'binding_refused', 'binding_unavailable', 'tool_not_offered', 'input_invalid', 'call_in_progress', 'execution_failed',
] as const;
export const X9McpRefusalSchema = z.enum(X9_MCP_REFUSALS);
export const X9McpRefusalDetailSchema = z.strictObject({
  error: X9McpRefusalSchema,
  message: z.string().min(1).max(500),
  agentId: z.guid().optional(),
  field: z.string().min(1).max(80).optional(),
});

/**
 * A refusal is a tool result, never an HTTP or JSON-RPC error: Paperclip marks the whole connection
 * as error on those failures (server/src/services/tool-gateway.ts:6062-6067,6113-6124), and an errored
 * connection reaches no run (server/src/services/heartbeat.ts:4644-4652).
 */
export function x9McpRefusalResult(detail: unknown) {
  const parsed = X9McpRefusalDetailSchema.parse(detail);
  return {
    content: [{ type: 'text' as const, text: `${parsed.error}: ${parsed.message}` }],
    structuredContent: parsed,
    isError: true as const,
  };
}

/** Paperclip does not retry tools/call (server/src/services/tool-gateway.ts:6021-6026); expose recorded replay explicitly. */
export function x9McpSuccessResult<T>(result: T, replay?: { recordedAt: string }) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result) }],
    structuredContent: {
      result,
      replayed: replay !== undefined,
      ...(replay === undefined ? {} : { recordedAt: replay.recordedAt }),
    },
    isError: false as const,
  };
}

/** Leave envelope headroom under Paperclip's 1 MB response limit (server/src/services/tool-gateway.ts:218). */
export const X9_MCP_RESULT_MAX_BYTES = 900_000;

/**
 * The same request has the same recognised X9 identity, company, issue, tool and validated input digest.
 * Never include a run, attempt or correlation_id: those change on resumption. Identity prevents two
 * agents working on the same issue from receiving each other's memory.
 */
export const X9McpCallKeySchema = z.strictObject({ scope: CapabilityAgentScopeSchema, companyId: z.guid(), issueId: z.guid(), tool: X9McpToolNameSchema, inputDigest: z.string().regex(/^[0-9a-f]{64}$/) });
