import { z } from 'zod';

/** Agent role responsible for directing the company. */
export const DIRECTOR_ROLE = 'director' as const;
/** Agent role responsible for leading a business unit. */
export const BUSINESS_UNIT_LEAD_ROLE = 'capo-bu' as const;

export const AGENT_ROLES = [DIRECTOR_ROLE, BUSINESS_UNIT_LEAD_ROLE] as const;
export const AgentRoleSchema = z.enum(AGENT_ROLES);
export type AgentRole = z.infer<typeof AgentRoleSchema>;

/** Capabilities every role is born with; the role fixes them, nobody can remove them. */
export const AGENT_ROLE_BASE_CAPABILITIES: Readonly<Record<AgentRole, readonly string[]>> = {
  [DIRECTOR_ROLE]: ['email', 'memory', 'lab', 'ricerca', 'paperclip'],
  [BUSINESS_UNIT_LEAD_ROLE]: ['email', 'memory', 'lab', 'qa', 'ricerca', 'paperclip'],
};

/** Base capabilities of the role followed by the extras, without duplicates. */
export function roleCapabilities(role: AgentRole, extra: readonly string[] = []): string[] {
  const result = [...AGENT_ROLE_BASE_CAPABILITIES[role]];
  for (const raw of extra) {
    const name = raw.trim();
    if (name === '') throw new Error('Extra capability must not be empty');
    if (!result.includes(name)) result.push(name);
  }
  return result;
}
