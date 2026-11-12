import { expect, it } from 'vitest';
import {
  InternalMemoryRecallBundleRequestSchema,
  MEMORY_RECALL_QUERY_MAX_CHARS,
  MEMORY_RECALL_TOP_K_MIN,
  MEMORY_RECALL_TOP_K_MAX,
  MEMORY_RECALL_TOP_K_DEFAULT,
  MEMORY_RECALL_TOOL_TOP_K_DEFAULT,
} from '../../src/http/index.js';

it('s6577 limiti-ricerca: uses exported query and topK limits and distinct route and tool defaults', () => {
  expect(MEMORY_RECALL_QUERY_MAX_CHARS).toBe(4096);
  expect(MEMORY_RECALL_TOP_K_MIN).toBe(1);
  expect(MEMORY_RECALL_TOP_K_MAX).toBe(20);
  expect(MEMORY_RECALL_TOP_K_DEFAULT).toBe(8);
  expect(MEMORY_RECALL_TOOL_TOP_K_DEFAULT).toBe(5);

  const request = {
    tenantId: '1',
    ownerId: '1',
    agentId: 'capo-orto-web',
    mode: 'standard',
    taskType: 'text',
    query: 'q'.repeat(MEMORY_RECALL_QUERY_MAX_CHARS),
  };

  for (const topK of [MEMORY_RECALL_TOP_K_MIN, MEMORY_RECALL_TOP_K_MAX]) {
    const parsed = InternalMemoryRecallBundleRequestSchema.parse({ ...request, topK });
    expect(parsed.topK).toBe(topK);
    expect(parsed.query).toBe(request.query);
    expect(parsed.organization).toBeUndefined();
  }
  for (const topK of [MEMORY_RECALL_TOP_K_MAX + 1, MEMORY_RECALL_TOP_K_MIN - 1, 1.5]) {
    expect(InternalMemoryRecallBundleRequestSchema.safeParse({ ...request, topK }).success).toBe(false);
  }
  expect(InternalMemoryRecallBundleRequestSchema.safeParse({
    ...request,
    query: 'q'.repeat(MEMORY_RECALL_QUERY_MAX_CHARS + 1),
  }).success).toBe(false);

  expect(InternalMemoryRecallBundleRequestSchema.parse(request).topK).toBe(MEMORY_RECALL_TOP_K_DEFAULT);
  expect(MEMORY_RECALL_TOOL_TOP_K_DEFAULT).toBeGreaterThanOrEqual(MEMORY_RECALL_TOP_K_MIN);
  expect(MEMORY_RECALL_TOOL_TOP_K_DEFAULT).toBeLessThanOrEqual(MEMORY_RECALL_TOP_K_MAX);
});
