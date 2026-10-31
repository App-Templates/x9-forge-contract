import { describe, expect, it } from 'vitest';
import {
  AGENT_ROLES,
  AGENT_ROLE_BASE_CAPABILITIES,
  AgentRoleSchema,
  BUSINESS_UNIT_LEAD_PROFILE_TEMPLATE,
  BUSINESS_UNIT_LEAD_ROLE,
  DIRECTOR_ROLE,
  roleCapabilities,
} from '../../src/organization/index.js';

describe('AgentRoleSchema', () => {
  it('accepts director', () => {
    expect(DIRECTOR_ROLE).toBe('director');
    expect(AgentRoleSchema.parse('director')).toBe('director');
  });

  it('accepts capo-bu', () => {
    expect(BUSINESS_UNIT_LEAD_ROLE).toBe('capo-bu');
    expect(AgentRoleSchema.parse('capo-bu')).toBe('capo-bu');
  });

  it.each(['Director', 'capo_bu', ''])('rejects an invalid agent role: %j', (role) => {
    expect(AgentRoleSchema.safeParse(role).success).toBe(false);
  });

  it('derives the business unit lead profile template from its agent role', () => {
    expect(BUSINESS_UNIT_LEAD_PROFILE_TEMPLATE).toBe(BUSINESS_UNIT_LEAD_ROLE);
  });

  it('publishes exactly the four company agent roles (lab and ricerca since 1.65.0)', () => {
    expect(AGENT_ROLES).toEqual(['director', 'capo-bu', 'lab', 'ricerca']);
    expect(AGENT_ROLES).toHaveLength(4);
    expect(AgentRoleSchema.parse('lab')).toBe('lab');
    expect(AgentRoleSchema.parse('ricerca')).toBe('ricerca');
    expect(AGENT_ROLE_BASE_CAPABILITIES.lab).toEqual(['ricerca', 'lab', 'email', 'memory']);
    expect(AGENT_ROLE_BASE_CAPABILITIES.ricerca).toEqual(['ricerca', 'lab', 'email', 'memory']);
  });
});

describe('roleCapabilities', () => {
  it('capo-bu contains exactly the 6 base capabilities', () => {
    expect(AGENT_ROLE_BASE_CAPABILITIES['capo-bu']).toEqual(['email', 'memory', 'lab', 'qa', 'ricerca', 'paperclip']);
    expect(roleCapabilities('capo-bu')).toHaveLength(6);
  });

  it('director contains lab and not qa', () => {
    expect(roleCapabilities('director')).toContain('lab');
    expect(roleCapabilities('director')).not.toContain('qa');
  });

  it('appends extras after the base without duplicates', () => {
    const caps = roleCapabilities('capo-bu', ['dev', 'email']);
    expect(caps).toHaveLength(7);
    expect(caps[6]).toBe('dev');
  });

  it('rejects an empty extra capability', () => {
    expect(() => roleCapabilities('capo-bu', ['  '])).toThrow();
  });
});
