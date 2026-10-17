import { describe, expect, it } from 'vitest';
import * as capability from '../../../src/capability/index.js';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const local = { kind: 'local', deviceId: 'device-1' };
const cloud = { kind: 'cloud', connectionRef: 'connection-1' };
const binding = { scope, sessionId: 'session-1', target: local, engines: ['claude'] };

describe('development session', () => {
  it('exports all session schemas from the public barrel', () => {
    expect(['DevelopmentSessionEngineSchema', 'DevelopmentSessionEnginesSchema', 'DevelopmentSessionTargetSchema', 'DevelopmentSessionBindingSchema'].every((name) => name in capability)).toBe(true);
  });

  for (const target of [local, cloud]) {
    for (const engines of [['claude'], ['codex'], ['claude', 'codex']]) {
      it(`accepts ${target.kind} with ${engines.join('+')}`, () => {
        expect(capability.DevelopmentSessionBindingSchema.safeParse({ ...binding, target, engines }).success).toBe(true);
      });
    }
  }

  it('accepts reversed engine order', () => {
    expect(capability.DevelopmentSessionEnginesSchema.safeParse(['codex', 'claude']).success).toBe(true);
  });
  it('keeps OAuth providers separate', () => {
    expect(['claude', 'codex'].some((engine) => capability.ConnectProviderSchema.safeParse(engine).success)).toBe(false);
  });
  it('rejects unknown engine', () => {
    expect(capability.DevelopmentSessionEngineSchema.safeParse('other').success).toBe(false);
  });
  it('rejects empty engines', () => {
    expect(capability.DevelopmentSessionEnginesSchema.safeParse([]).success).toBe(false);
  });
  it('rejects duplicate engines', () => {
    expect(capability.DevelopmentSessionEnginesSchema.safeParse(['claude', 'claude']).success).toBe(false);
  });
  it('reports the two engine limit', () => {
    expect(capability.DevelopmentSessionEnginesSchema.safeParse(['claude', 'codex', 'claude']).error?.issues.some((issue) => issue.code === 'too_big')).toBe(true);
  });
  it('rejects third engine', () => {
    expect(capability.DevelopmentSessionEnginesSchema.safeParse(['claude', 'codex', 'other']).success).toBe(false);
  });
  it('requires local device', () => {
    expect(capability.DevelopmentSessionTargetSchema.safeParse({ kind: 'local' }).success).toBe(false);
  });
  it('reuses device validation', () => {
    expect(capability.DevelopmentSessionTargetSchema.safeParse({ kind: 'local', deviceId: 'BAD' }).success).toBe(false);
  });
  it('requires cloud reference', () => {
    expect(capability.DevelopmentSessionTargetSchema.safeParse({ kind: 'cloud' }).success).toBe(false);
  });
  it('rejects empty cloud reference', () => {
    expect(capability.DevelopmentSessionTargetSchema.safeParse({ ...cloud, connectionRef: '' }).success).toBe(false);
  });
  it('rejects local cross fields', () => {
    expect(capability.DevelopmentSessionTargetSchema.safeParse({ ...local, connectionRef: 'connection-1' }).success).toBe(false);
  });
  it('rejects cloud cross fields', () => {
    expect(capability.DevelopmentSessionTargetSchema.safeParse({ ...cloud, deviceId: 'device-1' }).success).toBe(false);
  });
  it('rejects local token', () => {
    expect(capability.DevelopmentSessionTargetSchema.safeParse({ ...local, token: 'synthetic' }).success).toBe(false);
  });
  it('rejects cloud token', () => {
    expect(capability.DevelopmentSessionTargetSchema.safeParse({ ...cloud, token: 'synthetic' }).success).toBe(false);
  });
  it('rejects unknown target kind', () => {
    expect(capability.DevelopmentSessionTargetSchema.safeParse({ kind: 'remote', deviceId: 'device-1' }).success).toBe(false);
  });
  it('requires scope', () => {
    expect(capability.DevelopmentSessionBindingSchema.safeParse({ sessionId: 'session-1', target: local, engines: ['claude'] }).success).toBe(false);
  });
  it('requires session id', () => {
    expect(capability.DevelopmentSessionBindingSchema.safeParse({ scope, target: local, engines: ['claude'] }).success).toBe(false);
  });
  it('rejects empty session id', () => {
    expect(capability.DevelopmentSessionBindingSchema.safeParse({ ...binding, sessionId: '' }).success).toBe(false);
  });
  it('requires target', () => {
    expect(capability.DevelopmentSessionBindingSchema.safeParse({ scope, sessionId: 'session-1', engines: ['claude'] }).success).toBe(false);
  });
  it('requires engines', () => {
    expect(capability.DevelopmentSessionBindingSchema.safeParse({ scope, sessionId: 'session-1', target: local }).success).toBe(false);
  });
  it('rejects binding token', () => {
    expect(capability.DevelopmentSessionBindingSchema.safeParse({ ...binding, token: 'synthetic' }).success).toBe(false);
  });
  it('requires tenant', () => {
    expect(capability.DevelopmentSessionBindingSchema.safeParse({ ...binding, scope: { ownerId: 'owner-1', agentId: 'agent-1' } }).success).toBe(false);
  });
  it('requires owner', () => {
    expect(capability.DevelopmentSessionBindingSchema.safeParse({ ...binding, scope: { tenantId: 'tenant-1', agentId: 'agent-1' } }).success).toBe(false);
  });
  it('requires agent', () => {
    expect(capability.DevelopmentSessionBindingSchema.safeParse({ ...binding, scope: { tenantId: 'tenant-1', ownerId: 'owner-1' } }).success).toBe(false);
  });
  it('rejects scope extras', () => {
    expect(capability.DevelopmentSessionBindingSchema.safeParse({ ...binding, scope: { ...scope, token: 'synthetic' } }).success).toBe(false);
  });
});
