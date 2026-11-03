import { z } from 'zod';
/** Agent role responsible for directing the company. */
export declare const DIRECTOR_ROLE: "director";
/** Agent role responsible for leading a business unit. */
export declare const BUSINESS_UNIT_LEAD_ROLE: "capo-bu";
/** R&D agent that keeps the company notebook (Lab, 1.65.0). */
export declare const LAB_ROLE: "lab";
/** R&D agent that researches outside the company (Ricerca, 1.65.0). */
export declare const RICERCA_ROLE: "ricerca";
export declare const AGENT_ROLES: readonly ["director", "capo-bu", "lab", "ricerca"];
export declare const AgentRoleSchema: z.ZodEnum<{
    ricerca: "ricerca";
    lab: "lab";
    director: "director";
    "capo-bu": "capo-bu";
}>;
export type AgentRole = z.infer<typeof AgentRoleSchema>;
/** Capabilities every role is born with; the role fixes them, nobody can remove them. */
export declare const AGENT_ROLE_BASE_CAPABILITIES: Readonly<Record<AgentRole, readonly string[]>>;
/** Base capabilities of the role followed by the extras, without duplicates. */
export declare function roleCapabilities(role: AgentRole, extra?: readonly string[]): string[];
//# sourceMappingURL=agent-role.d.ts.map