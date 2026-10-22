import { z } from 'zod';

/** Agent role responsible for directing the company. */
export const DIRECTOR_ROLE = 'director' as const;
/** Agent role responsible for leading a business unit. */
export const BUSINESS_UNIT_LEAD_ROLE = 'capo-bu' as const;

export const AGENT_ROLES = [DIRECTOR_ROLE, BUSINESS_UNIT_LEAD_ROLE] as const;
export const AgentRoleSchema = z.enum(AGENT_ROLES);
export type AgentRole = z.infer<typeof AgentRoleSchema>;
