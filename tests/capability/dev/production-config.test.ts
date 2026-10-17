import { describe, expect, it } from 'vitest';
import {
  DevAgentConfigSchema,
  DevAgentConfigStateSchema,
  type DevAgentConfig,
} from '../../../src/capability/dev/config-state.js';
import type {
  DevelopmentSessionEngine,
  DevelopmentSessionTarget,
} from '../../../src/capability/connect/development-session.js';
import { devConfigGetContract, devConfigPutContract } from '../../../src/http/endpoints/internal-capability-dev.js';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const legacy = {
  ...scope, boardId: 'board-1', enabled: true, configVersion: 3, keyVersion: 1,
  bindings: [],
};
const production: NonNullable<DevAgentConfig['production']> = {
  session: {
    scope, sessionId: 'session-1',
    target: { kind: 'cloud', connectionRef: 'connection-1' }, engines: ['claude'],
  },
  allowedProjectIds: ['project-1', 'project-2'],
};
const config = { ...legacy, ownerChatIds: [], production };

describe('production config', () => {
  it('preserves legacy defaults without inventing a production session', () => {
    const saved = devConfigPutContract.bodySchema.parse(legacy);
    expect(saved).toEqual({ ...legacy, ownerChatIds: [] });
    expect(devConfigGetContract.responseSchema.parse(saved)).toEqual(saved);
    expect(Object.hasOwn(saved, 'production')).toBe(false);
  });

  const targets: DevelopmentSessionTarget[] = [
    { kind: 'local', deviceId: 'device-1' },
    { kind: 'cloud', connectionRef: 'connection-1' },
  ];
  const choices: DevelopmentSessionEngine[][] = [['claude'], ['codex'], ['claude', 'codex']];
  for (const target of targets) {
    for (const engines of choices) {
      it(`round trips ${target.kind} ${engines.join('+')} for web without local bindings`, () => {
        const raw = { ...config, production: { ...production, session: { ...production.session, target, engines } } };
        expect(devConfigPutContract.bodySchema).toBe(DevAgentConfigSchema);
        expect(devConfigGetContract.responseSchema).toBe(DevAgentConfigSchema);
        const saved = devConfigPutContract.bodySchema.parse(raw);
        expect(devConfigGetContract.responseSchema.parse(JSON.parse(JSON.stringify(saved)))).toEqual(raw);
      });
    }
  }

  it('rejects a different tenantId', () => {
    const raw = { ...config, production: { ...production, session: { ...production.session, scope: { ...scope, tenantId: 'tenant-2' } } } };
    expect(DevAgentConfigSchema.safeParse(raw).success).toBe(false);
    expect(DevAgentConfigSchema.safeParse(raw).error?.issues[0]?.path).toEqual(['production', 'session', 'scope', 'tenantId']);
  });
  it('rejects a different ownerId', () => {
    const raw = { ...config, production: { ...production, session: { ...production.session, scope: { ...scope, ownerId: 'owner-2' } } } };
    expect(DevAgentConfigSchema.safeParse(raw).success).toBe(false);
    expect(DevAgentConfigSchema.safeParse(raw).error?.issues[0]?.path).toEqual(['production', 'session', 'scope', 'ownerId']);
  });
  it('rejects a different agentId', () => {
    const raw = { ...config, production: { ...production, session: { ...production.session, scope: { ...scope, agentId: 'agent-2' } } } };
    expect(DevAgentConfigSchema.safeParse(raw).success).toBe(false);
    expect(DevAgentConfigSchema.safeParse(raw).error?.issues[0]?.path).toEqual(['production', 'session', 'scope', 'agentId']);
  });
  it('rejects an empty project list', () => {
    expect(DevAgentConfigSchema.safeParse({ ...config, production: { ...production, allowedProjectIds: [] } }).success).toBe(false);
  });
  it('rejects an empty project identifier', () => {
    expect(DevAgentConfigSchema.safeParse({ ...config, production: { ...production, allowedProjectIds: [''] } }).success).toBe(false);
  });
  it('rejects duplicate project identifiers', () => {
    expect(DevAgentConfigSchema.safeParse({ ...config, production: { ...production, allowedProjectIds: ['project-1', 'project-1'] } }).success).toBe(false);
  });
  it('rejects extra production fields', () => {
    expect(DevAgentConfigSchema.safeParse({ ...config, production: { ...production, extra: 'synthetic' } }).success).toBe(false);
  });
  it('rejects secrets and execution claims at each new boundary', () => {
    for (const field of ['token', 'secret', 'approved', 'online', 'lease']) {
      for (const value of [
        { ...production, [field]: 'synthetic' },
        { ...production, session: { ...production.session, [field]: 'synthetic' } },
        { ...production, session: { ...production.session, target: { ...production.session.target, [field]: 'synthetic' } } },
        { ...production, session: { ...production.session, scope: { ...scope, [field]: 'synthetic' } } },
      ]) expect(devConfigPutContract.bodySchema.safeParse({ ...config, production: value }).success).toBe(false);
    }
  });
  it('requires the complete production shape when present', () => {
    for (const value of [null, {}, { session: production.session }, { allowedProjectIds: ['project-1'] }]) {
      expect(DevAgentConfigSchema.safeParse({ ...config, production: value }).success).toBe(false);
    }
  });
  it('keeps saved configuration separate from reported application state', () => {
    const state = { status: 'pending', appliedConfigVersion: 0, lastSeenAt: null, reason: null };
    expect(DevAgentConfigStateSchema.parse({ config, state })).toEqual({ config, state });
    expect(DevAgentConfigSchema.safeParse({ ...config, status: 'applied' }).success).toBe(false);
  });
});
