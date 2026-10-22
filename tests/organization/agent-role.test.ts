import { describe, expect, it } from 'vitest';
import {
  AGENT_ROLES,
  AgentRoleSchema,
  BUSINESS_UNIT_LEAD_PROFILE_TEMPLATE,
  BUSINESS_UNIT_LEAD_ROLE,
  DIRECTOR_ROLE,
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

  it('publishes exactly the two company agent roles', () => {
    expect(AGENT_ROLES).toEqual(['director', 'capo-bu']);
    expect(AGENT_ROLES).toHaveLength(2);
  });
});
