import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  DevAgentConfigSchema,
  DevAgentConfigStateSchema,
  DevAgentStateSchema,
  DevAgentStatusSchema,
  DevBindingSchema,
} from '../../../src/capability/dev/config-state.js';

const binding = {
  computerId: 'computer-1',
  projectId: 'project-1',
  pathLabel: 'apps/web',
  addedAt: '2026-10-14T10:00:00.000Z',
};

const config = {
  tenantId: 'tenant-1',
  ownerId: 'owner-1',
  agentId: 'agent-1',
  boardId: 'board-1',
  enabled: true,
  configVersion: 3,
  keyVersion: 1,
  bindings: [binding],
};

const state = {
  status: 'applied' as const,
  appliedConfigVersion: 3,
  lastSeenAt: '2026-10-14T11:00:00.000Z',
  reason: null,
};

describe('DevAgentConfigSchema', () => {
  it('accepts a valid config', () => {
    expect(DevAgentConfigSchema.safeParse(config).success).toBe(true);
  });

  it('rejects two bindings with the same computerId + projectId', () => {
    const dup = { ...config, bindings: [binding, { ...binding, pathLabel: 'other' }] };
    expect(DevAgentConfigSchema.safeParse(dup).success).toBe(false);
  });

  it('accepts the same project on a different computer', () => {
    const ok = { ...config, bindings: [binding, { ...binding, computerId: 'computer-2' }] };
    expect(DevAgentConfigSchema.safeParse(ok).success).toBe(true);
  });

  it('mutation: without the duplicate check the duplicate would pass', () => {
    const mutant = z.strictObject(DevAgentConfigSchema.shape);
    const dup = { ...config, bindings: [binding, { ...binding }] };
    // Same shape, duplicate check removed: the duplicate is accepted.
    expect(mutant.safeParse(dup).success).toBe(true);
    expect(DevAgentConfigSchema.safeParse(dup).success).toBe(false);
  });

  it('rejects an extra key named token (no secrets in config)', () => {
    expect(DevAgentConfigSchema.safeParse({ ...config, token: 'secret' }).success).toBe(false);
  });

  it('rejects keyVersion 0 and negative configVersion', () => {
    expect(DevAgentConfigSchema.safeParse({ ...config, keyVersion: 0 }).success).toBe(false);
    expect(DevAgentConfigSchema.safeParse({ ...config, configVersion: -1 }).success).toBe(false);
  });
});

describe('DevBindingSchema', () => {
  it('rejects pathLabel containing ..', () => {
    expect(DevBindingSchema.safeParse({ ...binding, pathLabel: 'a/../b' }).success).toBe(false);
    expect(DevBindingSchema.safeParse({ ...binding, pathLabel: '..' }).success).toBe(false);
  });

  it('rejects a leading slash in pathLabel', () => {
    expect(DevBindingSchema.safeParse({ ...binding, pathLabel: '/etc' }).success).toBe(false);
  });

  it('rejects a non-ISO addedAt', () => {
    expect(DevBindingSchema.safeParse({ ...binding, addedAt: 'yesterday' }).success).toBe(false);
  });
});

describe('DevAgentStateSchema', () => {
  for (const status of ['ready', 'applied', 'pending', 'offline', 'revoked'] as const) {
    it(`accepts status ${status}`, () => {
      expect(DevAgentStatusSchema.safeParse(status).success).toBe(true);
      expect(DevAgentStateSchema.safeParse({ ...state, status }).success).toBe(true);
    });
  }

  it('rejects an unknown status', () => {
    expect(DevAgentStateSchema.safeParse({ ...state, status: 'running' }).success).toBe(false);
  });

  it('accepts null lastSeenAt and a reason string', () => {
    expect(DevAgentStateSchema.safeParse({ ...state, lastSeenAt: null, reason: 'key rotated' }).success).toBe(true);
  });
});

describe('DevAgentConfigStateSchema', () => {
  it('accepts applied version equal to or behind configVersion', () => {
    expect(DevAgentConfigStateSchema.safeParse({ config, state }).success).toBe(true);
    expect(
      DevAgentConfigStateSchema.safeParse({ config, state: { ...state, appliedConfigVersion: 1 } }).success,
    ).toBe(true);
  });

  it('rejects appliedConfigVersion greater than configVersion', () => {
    expect(
      DevAgentConfigStateSchema.safeParse({ config, state: { ...state, appliedConfigVersion: 4 } }).success,
    ).toBe(false);
  });

  it('rejects duplicate bindings inside the combined schema', () => {
    const dup = { ...config, bindings: [binding, binding] };
    expect(DevAgentConfigStateSchema.safeParse({ config: dup, state }).success).toBe(false);
  });
});
