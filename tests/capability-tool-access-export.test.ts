import { describe, expect, it } from 'vitest';
import {
  CAPABILITY_TOOL_ACCESS,
  CapabilityToolAccessSchema,
  capabilityToolAccess,
  toolsForRole,
} from '../src/capability/index.js';

describe('capability index exports tool access', () => {
  it('exports the access symbols', () => {
    expect(CAPABILITY_TOOL_ACCESS).toBeDefined();
    expect(CapabilityToolAccessSchema).toBeDefined();
    expect(capabilityToolAccess).toBeDefined();
    expect(toolsForRole).toBeDefined();
  });

  it('parses read and rejects unknown access', () => {
    expect(CapabilityToolAccessSchema.parse('read')).toBe('read');
    expect(() => CapabilityToolAccessSchema.parse('delete')).toThrow();
  });

  it('treats an undeclared access as write', () => {
    expect(capabilityToolAccess({ name: 't', description: 'd', inputSchema: {} })).toBe('write');
  });
});
