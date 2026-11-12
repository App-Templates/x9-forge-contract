import { describe, expect, it } from 'vitest';
import { AgentScopePolicySchema, resolvePolicyDecision, roleScopePolicy } from '../../src/agent/index.js';
import { AGENT_ROLE_READ_ONLY_CAPABILITIES, roleCapabilities } from '../../src/organization/agent-role.js';

describe('director dev in lettura', () => {
  it('s6325 director-dev-in-lettura: the director is born with dev, read-only for the role', () => {
    const caps = roleCapabilities('director');
    expect(caps).toContain('dev');
    expect(caps).not.toContain('qa');
    expect(AGENT_ROLE_READ_ONLY_CAPABILITIES.director).toEqual(['dev']);
    expect(AGENT_ROLE_READ_ONLY_CAPABILITIES['capo-bu']).toEqual([]);
    expect(AGENT_ROLE_READ_ONLY_CAPABILITIES.lab).toEqual([]);
    expect(AGENT_ROLE_READ_ONLY_CAPABILITIES.ricerca).toEqual([]);
  });

  it('denies dev writes for the director and keeps the other rules writable', () => {
    const policy = roleScopePolicy({ role: 'director', capabilities: roleCapabilities('director'), version: 1 });
    const rule = (c: string) => policy.rules.find((r) => r.capability === c);
    expect(rule('dev')).toMatchObject({ read: 'allow', write: 'deny' });
    for (const r of policy.rules.filter((x) => x.capability !== 'dev')) expect(r.write).toBe('allow');
    expect(resolvePolicyDecision(policy, { capability: 'dev', access: 'write' })).toBe('deny');
    expect(resolvePolicyDecision(policy, { capability: 'dev', access: 'read' })).toBe('allow');
  });

  it('keeps dev writes allowed for the capo-bu', () => {
    const policy = roleScopePolicy({ role: 'capo-bu', capabilities: roleCapabilities('capo-bu', ['dev']), version: 1 });
    expect(policy.rules.find((r) => r.capability === 'dev')).toMatchObject({ read: 'allow', write: 'allow' });
  });

  it('accepts a stored director policy in today\'s shape', () => {
    const stored = { version: 1, defaultWebSearch: true, scopeLimited: false, defaults: { read: 'allow', write: 'ask' }, rules: [{ capability: 'email', read: 'allow', write: 'ask' }] };
    expect(AgentScopePolicySchema.parse(stored)).toMatchObject(stored);
  });
});
