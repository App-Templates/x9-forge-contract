import { describe, expect, it } from 'vitest';
import { resolvePolicyDecision, roleScopePolicy } from '../../src/agent/index.js';

describe('roleScopePolicy', () => {
  const policy = roleScopePolicy({ role: 'capo-bu', capabilities: ['email', 'paperclip'], version: 3 });

  it('allows write on the profile capabilities', () => {
    expect(resolvePolicyDecision(policy, { capability: 'email', access: 'write' })).toBe('allow');
    expect(resolvePolicyDecision(policy, { capability: 'paperclip', access: 'write' })).toBe('allow');
  });

  it('asks for write outside the profile and allows read everywhere', () => {
    expect(resolvePolicyDecision(policy, { capability: 'cap-dev', access: 'write' })).toBe('ask');
    expect(resolvePolicyDecision(policy, { capability: 'cap-dev', access: 'read' })).toBe('allow');
  });

  it('builds one sorted rule per distinct capability', () => {
    const p = roleScopePolicy({ role: 'director', capabilities: ['email', 'email', 'agenda'], version: 1 });
    expect(p.rules.map((r) => r.capability)).toEqual(['agenda', 'email']);
  });

  it('keeps purpose only when present', () => {
    expect(policy).not.toHaveProperty('purpose');
    expect(roleScopePolicy({ role: 'director', capabilities: [], version: 1, purpose: 'Dirigere' }).purpose).toBe('Dirigere');
  });

  it('rejects an unknown role', () => {
    expect(() => roleScopePolicy({ role: 'ospite' as never, capabilities: ['email'], version: 1 })).toThrow();
  });

  it('rejects an empty capability', () => {
    expect(() => roleScopePolicy({ role: 'capo-bu', capabilities: [''], version: 1 })).toThrow();
  });
});
