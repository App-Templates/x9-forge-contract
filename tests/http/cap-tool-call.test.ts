/** Synthetic B1 fixtures for the existing capability transport. */
import { describe, expect, it } from 'vitest';
import { capToolCallContract, capToolCallPath, CapToolCallParamsSchema } from '../../src/http/index.js';
import { ToolCallRequestSchema, ToolCallResponseSchema } from '../../src/capability/tool-call.js';

describe('capability tool dispatch contract', () => {
  it('shares the existing transport schemas, method, route and authentication', () => {
    expect(capToolCallContract).toMatchObject({ method: 'POST', path: '/call/:tool', authType: 'secret' });
    expect(capToolCallContract.bodySchema).toBe(ToolCallRequestSchema);
    expect(capToolCallContract.responseSchema).toBe(ToolCallResponseSchema);
    expect(capToolCallContract.paramsSchema).toBe(CapToolCallParamsSchema);
  });
  it('resolves a tool name, including boundary lengths, from the canonical path', () => {
    for (const name of ['a', 'meditation_today', `a${'b'.repeat(127)}`]) expect(capToolCallPath(name)).toBe(`/call/${name}`);
  });
  it.each(['', '../private', 'tool/query', 'Name', '9tool', `a${'b'.repeat(128)}`])('rejects an invalid synthetic path parameter: %s', name => {
    expect(() => capToolCallPath(name)).toThrow();
  });
});
