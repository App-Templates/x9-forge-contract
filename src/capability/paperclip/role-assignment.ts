import { z } from 'zod';
import { AGENT_ROLES, type AgentRole } from '../../organization/agent-role.js';
import { RICERCA_TOOLS, type RicercaToolName } from '../ricerca/tools.js';

/**
 * Who may give an assignment to whom, by role (task 7304). One rule for every consumer.
 *
 * Origin: X9 `cap-paperclip/src/seat-peers.ts:64-71,101` (`reachable` plus the Director every seat reaches). Two
 * differences with that code: Lab → Ricerca is missing by decision of Stefano 17/11 («è il lab che avvia la ricerca
 * da sé»: the Lab starts research with its own tool, Ricerca receives no assignment from it); the edge towards the
 * Director is the one every seat has today. The `puoAffidareA` matrix of the `pcp_*` protocol is a different thing.
 */
export const PAPERCLIP_ASSIGNMENT_MATRIX: Readonly<Record<AgentRole, readonly AgentRole[]>> = {
  director: ['capo-bu', 'lab', 'ricerca'],
  'capo-bu': ['lab', 'director'],
  // The dossier goes back to the lead who asked for it.
  lab: ['capo-bu', 'director'],
  ricerca: ['lab', 'director'],
};

/** Closed refusal codes (also the registry reason). */
export const PAPERCLIP_ASSIGNMENT_REFUSALS = ['lab_starts_research_itself', 'assign_target_not_allowed'] as const;
export type PaperclipAssignmentRefusal = (typeof PAPERCLIP_ASSIGNMENT_REFUSALS)[number];

export type PaperclipAssignmentDecision =
  | { ok: true }
  | { ok: false; refusal: 'lab_starts_research_itself'; useTool: RicercaToolName }
  | { ok: false; refusal: 'assign_target_not_allowed' };

const isRole = (value: unknown): value is AgentRole => (AGENT_ROLES as readonly unknown[]).includes(value);

/** Pure: may `from` give an assignment to `to`? Unknown roles are refused, never thrown. */
export function decideAssignment(from: AgentRole, to: AgentRole): PaperclipAssignmentDecision {
  if (!isRole(from) || !isRole(to)) return { ok: false, refusal: 'assign_target_not_allowed' };
  if (PAPERCLIP_ASSIGNMENT_MATRIX[from].includes(to)) return { ok: true };
  if (from === 'lab' && to === 'ricerca') {
    return { ok: false, refusal: 'lab_starts_research_itself', useTool: RICERCA_TOOLS.start };
  }
  return { ok: false, refusal: 'assign_target_not_allowed' };
}

/**
 * The assignment plan a seat is born with (task 7364), derived only from the matrix: no role name decides anything.
 * `recipientProtection` is what the seat is born with; `blocked` is never a birth state.
 */
export const PaperclipBirthPlanSchema = z.strictObject({
  permission: z.discriminatedUnion('form', [
    z.strictObject({ form: z.literal('none') }),
    z.strictObject({ form: z.literal('broad') }),
  ]),
  recipientProtection: z.enum(['open', 'protected']),
  canCreateAgents: z.boolean(),
});
export type PaperclipBirthPlan = z.infer<typeof PaperclipBirthPlanSchema>;

export const PAPERCLIP_BIRTH_PLAN_REFUSALS = ['role_unknown'] as const;
export type PaperclipBirthPlanRefusal = (typeof PAPERCLIP_BIRTH_PLAN_REFUSALS)[number];

export type PaperclipBirthPlanDecision =
  | { ok: true; plan: PaperclipBirthPlan }
  | { ok: false; refusal: PaperclipBirthPlanRefusal };

/**
 * Pure, never throws. A role is `protected` when exactly one other role can give it work (Paperclip protects such a
 * recipient: only a caller with the broad permission may assign to it, authorization.ts:2146-2175); with no caller or
 * several it is `open`. A role gets the `broad` permission iff its row holds at least one protected role: towards an
 * open recipient Paperclip lets anyone assign. `canCreateAgents` follows the broad permission: Paperclip's access
 * check gives `canAssignTasks` to `canCreateAgents` (agents.ts:1607-1622), the permissions PATCH sums them
 * (agents.ts:4970-4972), and a new agent is born with `canCreateAgents` TRUE (agent-permissions.ts:42-47), so who is
 * not broad must be written false.
 */
export function decideAssignmentBirthPlan(
  role: unknown,
  matrix: Readonly<Record<AgentRole, readonly AgentRole[]>> = PAPERCLIP_ASSIGNMENT_MATRIX,
): PaperclipBirthPlanDecision {
  if (!isRole(role)) return { ok: false, refusal: 'role_unknown' };
  const protectedRoles = new Set<AgentRole>(
    AGENT_ROLES.filter(
      (target) => AGENT_ROLES.filter((caller) => caller !== target && matrix[caller].includes(target)).length === 1,
    ),
  );
  const broad = matrix[role].some((target) => protectedRoles.has(target));
  return {
    ok: true,
    plan: {
      permission: broad ? { form: 'broad' } : { form: 'none' },
      recipientProtection: protectedRoles.has(role) ? 'protected' : 'open',
      canCreateAgents: broad,
    },
  };
}
