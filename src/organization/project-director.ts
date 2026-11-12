import { z } from 'zod';
import { DIRECTOR_ROLE } from './agent-role.js';
import {
  ParticipantAgentIdentitySchema,
  ParticipantBindingSchema,
  type ParticipantAgentIdentity,
  type ParticipantBinding,
  type ParticipantBindingReceipt,
} from './participant-binding.js';

/**
 * One rule for "who is the Director of this project", shared by every service (R-14). With one Director per
 * project, several Directors live in the same organization: the Director of a project is the agent that holds
 * a live binding with role `director` on that project (recipient `{ kind: 'project', id }`), and, for a Paperclip
 * project, is also its lead. The function is pure: no clock, no I/O, no agent names.
 */

export const PROJECT_DIRECTOR_REFUSALS = [
  'project_without_director',
  'project_director_ambiguous',
  'lead_not_director',
  'lead_not_bound',
] as const;
export const ProjectDirectorRefusalSchema = z.enum(PROJECT_DIRECTOR_REFUSALS);
export type ProjectDirectorRefusal = z.infer<typeof ProjectDirectorRefusalSchema>;

export const PROJECT_DIRECTOR_SOURCES = ['paperclip_project', 'memory_project'] as const;
export const ProjectDirectorSourceSchema = z.enum(PROJECT_DIRECTOR_SOURCES);
export type ProjectDirectorSource = z.infer<typeof ProjectDirectorSourceSchema>;

export const ProjectDirectorDecisionSchema = z.discriminatedUnion('resolved', [
  z.strictObject({
    resolved: z.literal(true),
    source: ProjectDirectorSourceSchema,
    agentIdentity: ParticipantAgentIdentitySchema,
    participantId: ParticipantBindingSchema.shape.participantId,
  }),
  z.strictObject({
    resolved: z.literal(false),
    source: ProjectDirectorSourceSchema,
    refusal: ProjectDirectorRefusalSchema,
    reason: z.string().min(1),
  }),
]);
export type ProjectDirectorDecision = z.infer<typeof ProjectDirectorDecisionSchema>;

export interface ProjectDirectorInput {
  tenantId: string;
  ownerId: string;
  organizationId: string;
  /**
   * `projectId` is the name of the Paperclip project. `leadAgentId` is compared with `binding.participantId`
   * (in production the `participantId` of the Director is its Paperclip id). The caller passes only projects
   * that are not archived.
   */
  project:
    | { source: 'paperclip_project'; projectId: string; leadAgentId: string | null }
    | { source: 'memory_project'; projectId: string };
  /** Items of the participant binding list: `{ binding, receipt }`. */
  bindings: ReadonlyArray<{ binding: ParticipantBinding; receipt: ParticipantBindingReceipt }>;
}

function sameIdentity(a: ParticipantAgentIdentity, b: ParticipantAgentIdentity): boolean {
  return (
    a.managementAgentId === b.managementAgentId &&
    a.runtimeAgentId === b.runtimeAgentId &&
    a.vaultAgentId === b.vaultAgentId
  );
}

function identityKey(i: ParticipantAgentIdentity): string {
  return `${i.managementAgentId}|${i.runtimeAgentId}|${i.vaultAgentId}`;
}

/** Decides which agent is the Director of the project. */
export function projectDirector(input: ProjectDirectorInput): ProjectDirectorDecision {
  const { tenantId, ownerId, organizationId, project } = input;
  const source = project.source;
  const refuse = (refusal: ProjectDirectorRefusal, reason: string): ProjectDirectorDecision => ({
    resolved: false,
    source,
    refusal,
    reason,
  });

  const onProject = input.bindings.filter(({ binding, receipt }) => {
    const live =
      receipt.withdrawnAt === undefined &&
      binding.tenantId === tenantId &&
      binding.ownerId === ownerId &&
      receipt.key.tenantId === tenantId &&
      receipt.key.ownerId === ownerId &&
      sameIdentity(binding.agentIdentity, receipt.key.agentIdentity) &&
      receipt.appliedVersion === binding.appliedVersion &&
      receipt.key.organizationId === organizationId;
    return (
      live &&
      binding.recipients.some((r) => r.kind === 'organization' && r.id === organizationId) &&
      binding.recipients.some((r) => r.kind === 'project' && r.id === project.projectId)
    );
  });

  /** Distinct agents (by identity triple) among the bindings, with the participant ids they carry. */
  const distinctAgents = (items: typeof onProject) => {
    const agents = new Map<string, { agentIdentity: ParticipantAgentIdentity; participantIds: Set<string> }>();
    for (const { binding } of items) {
      const key = identityKey(binding.agentIdentity);
      const entry = agents.get(key) ?? { agentIdentity: binding.agentIdentity, participantIds: new Set<string>() };
      entry.participantIds.add(binding.participantId);
      agents.set(key, entry);
    }
    return [...agents.values()];
  };

  const directorsOnProject = distinctAgents(onProject.filter(({ binding }) => binding.agentRole === DIRECTOR_ROLE));
  const ambiguous = () =>
    refuse('project_director_ambiguous', 'More than one Director is bound to the project.');
  const resolved = (agent: { agentIdentity: ParticipantAgentIdentity; participantIds: Set<string> }) =>
    agent.participantIds.size === 1
      ? ({
          resolved: true,
          source,
          agentIdentity: agent.agentIdentity,
          participantId: [...agent.participantIds][0]!,
        } satisfies ProjectDirectorDecision)
      : ambiguous();

  if (project.source === 'memory_project') {
    if (directorsOnProject.length === 0) {
      return refuse('project_without_director', 'No Director is bound to the project.');
    }
    if (directorsOnProject.length > 1) return ambiguous();
    return resolved(directorsOnProject[0]!);
  }

  const { leadAgentId } = project;
  if (leadAgentId === null) {
    return refuse('project_without_director', 'The project has no lead.');
  }
  const ofLead = onProject.filter(({ binding }) => binding.participantId === leadAgentId);
  if (ofLead.length === 0) {
    return refuse('lead_not_bound', 'The lead of the project has no live binding to the project.');
  }
  if (distinctAgents(ofLead).length > 1) {
    return refuse('project_director_ambiguous', 'More than one agent carries the participant id of the lead.');
  }
  if (ofLead.some(({ binding }) => binding.agentRole !== DIRECTOR_ROLE)) {
    return refuse('lead_not_director', 'The lead of the project is bound without the role of Director.');
  }
  if (directorsOnProject.length > 1) return ambiguous();
  return resolved(distinctAgents(ofLead)[0]!);
}
