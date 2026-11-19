import { describe, expect, it } from 'vitest';
import {
  X9_MCP_PROTOCOL_VERSIONS,
  X9_MCP_REFUSALS,
  X9_MCP_RESULT_MAX_BYTES,
  X9_MCP_TOOLS,
  X9McpCallKeySchema,
  X9McpMemoryRecallInputSchema,
  X9McpRefusalDetailSchema,
  X9McpRefusalSchema,
  X9McpToolDescriptorSchema,
  X9McpToolNameSchema,
  x9McpRefusalResult,
  x9McpSuccessResult,
  x9McpToolDescriptors,
} from '../../../src/capability/paperclip/mcp-x9-tools.js';
import {
  MEMORY_RECALL_QUERY_MAX_CHARS,
  MEMORY_RECALL_TOP_K_MIN,
  MEMORY_RECALL_TOP_K_MAX,
} from '../../../src/http/endpoints/internal-memory-recall-bundle.js';

const agentId = '7b1f3c52-0a4e-4d0b-9f55-2b1c7d9e8a10';
const companyId = '3f1c2a64-8d0e-4b7a-9c11-5a2e6f7b8d01';
const issueId = '1d2e3f40-5a6b-4c7d-8e9f-0a1b2c3d4e5f';

describe('s8501', () => {
  it('s8501_descrittori', () => {
    expect(Object.isFrozen(X9_MCP_TOOLS)).toBe(true);
    expect(Object.keys(X9_MCP_TOOLS)).toEqual(['x9_memory_recall']);
    expect(X9_MCP_TOOLS.x9_memory_recall).toMatchObject({ x9Tool: 'memory_recall', risk: 'read' });
    expect(X9_MCP_TOOLS.x9_memory_recall.inputSchema).toBe(X9McpMemoryRecallInputSchema);
    const inputSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        query: { type: 'string', minLength: 1, maxLength: MEMORY_RECALL_QUERY_MAX_CHARS },
        topK: { type: 'integer', minimum: MEMORY_RECALL_TOP_K_MIN, maximum: MEMORY_RECALL_TOP_K_MAX },
      },
      required: ['query'],
      additionalProperties: false,
    };
    const descriptors = x9McpToolDescriptors();
    expect(descriptors).toEqual([{
      name: 'x9_memory_recall',
      description: X9_MCP_TOOLS.x9_memory_recall.description,
      inputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    }]);
    for (const descriptor of descriptors) {
      expect(descriptor.name).not.toMatch(/(create|update|write|set|send|publish|post|mutate|mark|archive|delete|remove|destroy|unpublish)/);
      expect(X9McpToolDescriptorSchema.parse(descriptor)).toEqual(descriptor);
      expect(X9McpToolDescriptorSchema.safeParse({ ...descriptor, extra: true }).success).toBe(false);
      expect(X9McpToolDescriptorSchema.safeParse({ ...descriptor, description: '' }).success).toBe(false);
      expect(X9McpToolDescriptorSchema.safeParse({ ...descriptor, description: 'x'.repeat(1001) }).success).toBe(false);
      for (const annotations of [
        { ...descriptor.annotations, destructiveHint: true },
        { ...descriptor.annotations, openWorldHint: true },
        { ...descriptor.annotations, extra: true },
      ]) {
        expect(X9McpToolDescriptorSchema.safeParse({ ...descriptor, annotations }).success).toBe(false);
      }
    }
    expect(X9McpToolNameSchema.safeParse('memory_recall').success).toBe(false);
  });

  it('s8501_ingresso', () => {
    expect(X9McpMemoryRecallInputSchema.parse({ query: '  project history  ' })).toEqual({ query: 'project history' });
    expect(MEMORY_RECALL_QUERY_MAX_CHARS).toBe(4096);
    expect(MEMORY_RECALL_TOP_K_MIN).toBe(1);
    expect(MEMORY_RECALL_TOP_K_MAX).toBe(20);
    for (const topK of [MEMORY_RECALL_TOP_K_MIN, MEMORY_RECALL_TOP_K_MAX]) {
      const input = { query: 'x'.repeat(MEMORY_RECALL_QUERY_MAX_CHARS), topK };
      expect(X9McpMemoryRecallInputSchema.parse(input)).toEqual(input);
    }
    for (const input of [
      { query: '' }, { query: '   ' }, { query: 'x'.repeat(4097) },
      { query: 'q', topK: 0 }, { query: 'q', topK: 21 }, { query: 'q', topK: 2.5 },
      { query: 'q', topK: '2' }, { query: 'q', extra: true },
    ]) {
      expect(X9McpMemoryRecallInputSchema.safeParse(input).success).toBe(false);
    }
  });

  it('s8501_rifiuto', () => {
    expect(X9_MCP_REFUSALS).toEqual([
      'caller_header_missing', 'caller_header_invalid', 'agent_unknown', 'agent_company_mismatch',
      'binding_refused', 'binding_unavailable', 'tool_not_offered', 'input_invalid', 'call_in_progress', 'execution_failed',
    ]);
    const detail = { error: 'agent_unknown' as const, message: 'Agent is not registered.', agentId, field: 'agentId' };
    expect(x9McpRefusalResult(detail)).toEqual({
      content: [{ type: 'text', text: 'agent_unknown: Agent is not registered.' }],
      structuredContent: detail,
      isError: true,
    });
    for (const error of X9_MCP_REFUSALS) expect(X9McpRefusalSchema.parse(error)).toBe(error);
    expect(X9McpRefusalSchema.safeParse('invented').success).toBe(false);
    expect(() => x9McpRefusalResult({ ...detail, message: 'x'.repeat(501) })).toThrow();
    // Untrusted data must be validated by the constructor too, not just by callers.
    expect(() => x9McpRefusalResult({ error: 'invented', message: 'Denied' })).toThrow();
    for (const invalid of [
      { ...detail, message: '' }, { ...detail, agentId: 'not-a-guid' },
      { ...detail, field: '' }, { ...detail, field: 'x'.repeat(81) }, { ...detail, extra: true },
    ]) {
      expect(X9McpRefusalDetailSchema.safeParse(invalid).success).toBe(false);
    }
    expect(X9McpRefusalDetailSchema.parse({ error: 'input_invalid', message: 'Invalid input.' })).toEqual({
      error: 'input_invalid', message: 'Invalid input.',
    });
  });

  it('s8501_successo', () => {
    const result = { entries: [{ content: 'A saved fact.' }] };
    expect(x9McpSuccessResult(result)).toEqual({
      content: [{ type: 'text', text: JSON.stringify(result) }],
      structuredContent: { result, replayed: false },
      isError: false,
    });
    const recordedAt = '2026-11-19T08:00:00.000Z';
    expect(x9McpSuccessResult(result, { recordedAt })).toEqual({
      content: [{ type: 'text', text: JSON.stringify(result) }],
      structuredContent: { result, replayed: true, recordedAt },
      isError: false,
    });
    expect(X9_MCP_RESULT_MAX_BYTES).toBe(900_000);
  });

  it('s8501_chiave', () => {
    const key = {
      scope: { tenantId: 'tenant-1', ownerId: 'owner-1', agentId },
      companyId, issueId, tool: 'x9_memory_recall', inputDigest: 'abcdef01'.repeat(8),
    };
    expect(X9McpCallKeySchema.parse(key)).toEqual(key);
    for (const invalid of [
      { ...key, runId: issueId }, { ...key, attempt: 1 }, { ...key, correlation_id: 'call-1' },
      { ...key, inputDigest: 'abc' }, { ...key, inputDigest: key.inputDigest.toUpperCase() },
      { ...key, tool: 'unoffered' }, { ...key, companyId: 'not-a-guid' }, { ...key, issueId: 'not-a-guid' },
      { ...key, scope: { ...key.scope, agentId: '' } },
      { ...key, scope: { ...key.scope, userId: 'person-1' } },
      { companyId, issueId, tool: key.tool, inputDigest: key.inputDigest },
    ]) {
      expect(X9McpCallKeySchema.safeParse(invalid).success).toBe(false);
    }
    const otherAgent = { ...key, scope: { ...key.scope, agentId: 'another-agent' } };
    expect(X9McpCallKeySchema.parse(otherAgent)).not.toEqual(X9McpCallKeySchema.parse(key));
  });

  it('s8501_versioni', () => {
    expect(X9_MCP_PROTOCOL_VERSIONS[0]).toBe('2025-06-18');
    expect(X9_MCP_PROTOCOL_VERSIONS).toEqual(['2025-06-18', '2025-03-26', '2024-11-05']);
  });
});
