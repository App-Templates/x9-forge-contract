import { describe, it, expect } from 'vitest';
import {
  AgentRegistryFileSchema,
  type AgentRegistryFile,
} from '../../src/capability/index';

// As Forge deploy.machine writes it after the v1.15.0 fix: a wrapper object.
const FORGE_WRAPPER: AgentRegistryFile = {
  capabilities: [
    { name: 'cap-calendar', enabled: true, host: 'cap-calendar', port: 3000, version: '1.0.0' },
    { name: 'memory', enabled: true, host: 'memory', port: 3001, version: '1.0.0' },
  ],
};

describe('AgentRegistryFileSchema', () => {
  it('accepts a wrapper object with capability entries', () => {
    const parsed = AgentRegistryFileSchema.parse(FORGE_WRAPPER);
    expect(parsed.capabilities).toHaveLength(2);
    expect(parsed.capabilities[0]!.name).toBe('cap-calendar');
  });

  it('accepts an empty capabilities array (agent with zero selected caps)', () => {
    expect(AgentRegistryFileSchema.parse({ capabilities: [] })).toEqual({ capabilities: [] });
  });

  // NEGATIVE — the exact pre-fix drift (Bug #15-class): a bare array is the
  // shape Forge USED to write and X9 USED to reject. It MUST fail here so the
  // contract can never silently regress to the broken shape.
  it('REJECTS a bare array (the pre-v1.15.0 Forge shape that 500ed X9 reload)', () => {
    expect(AgentRegistryFileSchema.safeParse([]).success).toBe(false);
    expect(
      AgentRegistryFileSchema.safeParse([
        { name: 'cap-calendar', enabled: true, host: 'cap-calendar', port: 3000, version: '1.0.0' },
      ]).success,
    ).toBe(false);
  });

  it('REJECTS a malformed entry inside the wrapper', () => {
    expect(
      AgentRegistryFileSchema.safeParse({ capabilities: [{ name: 'x', enabled: true }] }).success,
    ).toBe(false);
  });
});
