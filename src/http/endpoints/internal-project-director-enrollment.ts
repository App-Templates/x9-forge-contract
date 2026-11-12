import { z } from 'zod';
import { ParticipantAgentIdentitySchema } from '../../organization/participant-binding.js';
import { ProjectCreateRequestSchema, ProjectIdSchema, projectDirectorAgentId } from './internal-project-create.js';

export const INTERNAL_PROJECT_DIRECTOR_ENROLLMENT_PATH = '/internal/paperclip/project-director-enrollment' as const;

const shape = ProjectCreateRequestSchema.shape;

/**
 * Forge factory-svc -> Paperclip: enroll the Director born for a project as the lead of that project.
 * `requestId` is the idempotency key, as in the project create contract. Paperclip opens no mailbox.
 */
export const ProjectDirectorEnrollmentRequestSchema = z
  .strictObject({
    tenantId: shape.tenantId,
    ownerId: shape.ownerId,
    companyId: shape.company.shape.companyId,
    requestId: shape.requestId,
    project: shape.project,
    director: z.strictObject({ agentIdentity: ParticipantAgentIdentitySchema }),
  })
  .superRefine((request, ctx) => {
    // An invalid project id is already reported by the project schema; the name rule has nothing to compare.
    if (!ProjectIdSchema.safeParse(request.project.projectId).success) return;
    const expected = projectDirectorAgentId(request.project.projectId);
    const identity = request.director.agentIdentity;
    for (const field of ['managementAgentId', 'runtimeAgentId'] as const) {
      if (identity[field] !== expected) {
        ctx.addIssue({
          code: 'custom',
          path: ['director', 'agentIdentity', field],
          message: 'The Director must be named after the project',
        });
      }
    }
  });
export type ProjectDirectorEnrollmentRequest = z.infer<typeof ProjectDirectorEnrollmentRequestSchema>;

export const PROJECT_DIRECTOR_ENROLLMENT_STEPS = [
  'paperclip_agent',
  'paperclip_project',
  'agent_key',
  'seat',
  'binding',
] as const;
export const ProjectDirectorEnrollmentStepSchema = z.enum(PROJECT_DIRECTOR_ENROLLMENT_STEPS);
export type ProjectDirectorEnrollmentStep = z.infer<typeof ProjectDirectorEnrollmentStepSchema>;

/** `enrolled` carries both Paperclip ids and no step; `in_corso` names the step it is at. */
export const ProjectDirectorEnrollmentResponseSchema = z
  .strictObject({
    state: z.enum(['enrolled', 'in_corso']),
    step: ProjectDirectorEnrollmentStepSchema.optional(),
    paperclipAgentId: z.uuid().optional(),
    paperclipProjectId: z.uuid().optional(),
  })
  .superRefine((response, ctx) => {
    if (response.state === 'enrolled') {
      if (response.paperclipAgentId === undefined || response.paperclipProjectId === undefined) {
        ctx.addIssue({ code: 'custom', path: ['state'], message: 'Enrolled state requires both Paperclip ids' });
      }
      if (response.step !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['step'], message: 'Enrolled state has no step' });
      }
    } else if (response.step === undefined) {
      ctx.addIssue({ code: 'custom', path: ['step'], message: 'In-progress state requires the step' });
    }
  });
export type ProjectDirectorEnrollmentResponse = z.infer<typeof ProjectDirectorEnrollmentResponseSchema>;

/**
 * `person_unknown` also covers an organization with no attested person to write the binding from (for example
 * one without a Director). `project_taken`: a Paperclip project with that short name already exists, even
 * archived, or Paperclip renamed it.
 */
export const PROJECT_DIRECTOR_ENROLLMENT_ERRORS = [
  'organization_unknown',
  'person_unknown',
  'identity_mismatch',
  'project_taken',
  'request_conflict',
  'seat_failed',
  'binding_write',
] as const;
export const ProjectDirectorEnrollmentErrorCodeSchema = z.enum(PROJECT_DIRECTOR_ENROLLMENT_ERRORS);
export type ProjectDirectorEnrollmentErrorCode = z.infer<typeof ProjectDirectorEnrollmentErrorCodeSchema>;

export const ProjectDirectorEnrollmentErrorResponseSchema = z.strictObject({
  error: ProjectDirectorEnrollmentErrorCodeSchema,
});
export type ProjectDirectorEnrollmentErrorResponse = z.infer<typeof ProjectDirectorEnrollmentErrorResponseSchema>;

export const internalProjectDirectorEnrollmentContract = {
  method: 'POST' as const,
  path: INTERNAL_PROJECT_DIRECTOR_ENROLLMENT_PATH,
  authType: 'secret' as const,
  bodySchema: ProjectDirectorEnrollmentRequestSchema,
  responseSchema: ProjectDirectorEnrollmentResponseSchema,
  errorSchema: ProjectDirectorEnrollmentErrorResponseSchema,
} as const;
