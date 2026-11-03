import { describe, it, expect } from 'vitest';
import {
  devConfigGetContract,
  devConfigPutContract,
  devStateGetContract,
} from '../../src/http/index';

const config = {
  tenantId: 'tenant-1',
  ownerId: 'owner-1',
  agentId: 'agent-1',
  boardId: 'board-1',
  enabled: true,
  configVersion: 3,
  keyVersion: 1,
  bindings: [
    { computerId: 'computer-1', projectId: 'project-1', pathLabel: 'apps/web', addedAt: '2026-10-14T10:00:00.000Z' },
  ],
};
const state = { status: 'applied', appliedConfigVersion: 3, lastSeenAt: '2026-10-14T10:05:00.000Z', reason: null };

describe('cap-dev per-agent contracts', () => {
  it('expose the exact paths, methods and secret auth', () => {
    expect(devConfigGetContract.path).toBe('/internal/capability/agents/:agentId/dev/config');
    expect(devConfigGetContract.method).toBe('GET');
    expect(devConfigPutContract.path).toBe('/internal/capability/agents/:agentId/dev/config');
    expect(devConfigPutContract.method).toBe('PUT');
    expect(devStateGetContract.path).toBe('/internal/capability/agents/:agentId/dev/state');
    expect(devStateGetContract.method).toBe('GET');
    for (const c of [devConfigGetContract, devConfigPutContract, devStateGetContract]) {
      expect(c.authType).toBe('secret');
    }
  });

  it('accepts a valid body, response and state', () => {
    expect(devConfigPutContract.bodySchema.safeParse(config).success).toBe(true);
    expect(devConfigGetContract.responseSchema.safeParse(config).success).toBe(true);
    expect(devConfigPutContract.responseSchema.safeParse({ ok: true, version: 4 }).success).toBe(true);
    expect(devStateGetContract.responseSchema.safeParse({ config, state }).success).toBe(true);
    expect(devConfigGetContract.paramsSchema.safeParse({ agentId: 'agent-1' }).success).toBe(true);
  });

  it('rejects an extra field in the body', () => {
    expect(devConfigPutContract.bodySchema.safeParse({ ...config, extra: 1 }).success).toBe(false);
  });

  it('rejects a token in the body', () => {
    expect(devConfigPutContract.bodySchema.safeParse({ ...config, token: 'secret' }).success).toBe(false);
  });

  it('rejects an empty agentId in the params', () => {
    for (const c of [devConfigGetContract, devConfigPutContract, devStateGetContract]) {
      expect(c.paramsSchema.safeParse({ agentId: '' }).success).toBe(false);
    }
  });

  it('rejects a state whose appliedConfigVersion is ahead of configVersion', () => {
    const ahead = { config, state: { ...state, appliedConfigVersion: 4 } };
    expect(devStateGetContract.responseSchema.safeParse(ahead).success).toBe(false);
  });
});
