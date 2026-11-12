import { z } from 'zod';
import { INTERNAL_TOKEN_HEADER } from "../../auth/index.js";
import { BusinessUnitLeadBirthRequestSchema } from "../../organization/business-unit-lead.js";
import { CompanyMapReferentFieldsSchema } from "../../organization/company-map.js";
import { ParticipantAgentIdentitySchema } from "../../organization/participant-binding.js";
import { SharedMailboxLabelSchema } from "../../organization/shared-mailbox.js";
export const INTERNAL_PROJECT_CREATE_PATH = '/api/internal/factory/projects';
/** Forge slugs are at most 64 characters; with the `director-` prefix the project id fits in 55. */
export const PROJECT_ID_MAX_LENGTH = 55;
export const ProjectIdSchema = z.string().min(1).max(PROJECT_ID_MAX_LENGTH).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
/** Forge names the agent of a project Director `director-<projectId>` (management and runtime id alike). */
export const PROJECT_DIRECTOR_AGENT_ID_PREFIX = 'director-';
/** Agent id Forge gives to the Director of the project `projectId`. */
export function projectDirectorAgentId(projectId) {
    return `${PROJECT_DIRECTOR_AGENT_ID_PREFIX}${ProjectIdSchema.parse(projectId)}`;
}
const requestShape = BusinessUnitLeadBirthRequestSchema.shape;
/**
 * Client -> Forge factory-svc: create a project and its Director.
 * `requestId` is the idempotency key: same `requestId` and same body = same answer with `replayed: true`;
 * same `requestId` and a different body = `request_conflict`.
 */
export const ProjectCreateRequestSchema = z.strictObject({
    requestId: requestShape.requestId,
    tenantId: requestShape.tenantId,
    ownerId: requestShape.ownerId,
    company: requestShape.company,
    project: z.strictObject({
        projectId: ProjectIdSchema,
        name: z.string().min(1).max(120),
        description: z.string().min(1).max(2000).optional(),
    }),
    /**
     * The client who creates the project. Forge adds `personRef` and `role` and writes it at once as the referent
     * of the project level of the company map.
     */
    projectReferent: CompanyMapReferentFieldsSchema.pick({ name: true, email: true }),
    requestedBy: z.discriminatedUnion('kind', [
        z.strictObject({ kind: z.literal('owner') }),
        z.strictObject({ kind: z.literal('agent'), agentIdentity: ParticipantAgentIdentitySchema }),
    ]),
});
/** Steps of the creation, in order. */
export const PROJECT_CREATE_STEPS = [
    'company_group',
    'project_group',
    'director_birth',
    'director_mailbox',
    'paperclip_enrollment',
    'director_profile',
];
export const ProjectCreateStepSchema = z.enum(PROJECT_CREATE_STEPS);
/** Same names Forge uses for the mailbox modes; a Director always has a mailbox, so there is no `none`. */
export const DIRECTOR_MAILBOX_KINDS = ['own', 'shared'];
export const DirectorMailboxKindSchema = z.enum(DIRECTOR_MAILBOX_KINDS);
/**
 * How to write to the Director. On the shared mailbox the client puts `subjectLabel` in square brackets at the
 * start of the subject.
 */
export const ProjectDirectorContactSchema = z.discriminatedUnion('mailboxKind', [
    z.strictObject({ mailboxKind: z.literal('own'), address: z.email() }),
    z.strictObject({
        mailboxKind: z.literal('shared'),
        address: z.email(),
        subjectLabel: SharedMailboxLabelSchema,
    }),
]);
export const ProjectCreateResponseSchema = z.discriminatedUnion('state', [
    z.strictObject({
        state: z.literal('ready'),
        replayed: z.boolean(),
        tenantId: requestShape.tenantId,
        companyId: requestShape.company.shape.companyId,
        projectId: ProjectIdSchema,
        paperclipProjectId: z.uuid(),
        director: z.strictObject({
            agentIdentity: ParticipantAgentIdentitySchema,
            paperclipAgentId: z.uuid(),
        }),
        contact: ProjectDirectorContactSchema,
    }).superRefine((response, ctx) => {
        const expected = projectDirectorAgentId(response.projectId);
        for (const field of ['managementAgentId', 'runtimeAgentId']) {
            if (response.director.agentIdentity[field] !== expected) {
                ctx.addIssue({
                    code: 'custom',
                    message: `director ${field} must be ${expected}`,
                    path: ['director', 'agentIdentity', field],
                });
            }
        }
    }),
    z.strictObject({ state: z.literal('in_corso'), step: ProjectCreateStepSchema }),
]);
export const PROJECT_CREATE_ERRORS = [
    'invalid_request',
    'unauthorized',
    'company_unknown',
    'project_taken',
    'requester_not_allowed',
    'request_conflict',
    'birth_failed',
    'enrollment_failed',
];
export const ProjectCreateErrorSchema = z.enum(PROJECT_CREATE_ERRORS);
/**
 * Where a project is already taken: the Paperclip short name (archived projects included), the Memory project ids,
 * the Forge slug `director-<projectId>`, the label already used on the Directors' shared mailbox.
 */
export const PROJECT_TAKEN_PLACES = [
    'paperclip_project',
    'memory_project',
    'forge_agent',
    'director_mailbox_label',
];
export const ProjectTakenPlaceSchema = z.enum(PROJECT_TAKEN_PLACES);
export const ProjectCreateErrorResponseSchema = z.strictObject({
    error: ProjectCreateErrorSchema,
    step: ProjectCreateStepSchema.optional(),
    taken: z.array(ProjectTakenPlaceSchema).min(1)
        .refine((places) => new Set(places).size === places.length, { message: 'taken places must be different' })
        .optional(),
    reason: z.string().min(1).max(500),
}).superRefine((response, ctx) => {
    if ((response.step !== undefined) !== (response.error === 'birth_failed')) {
        ctx.addIssue({ code: 'custom', message: 'step is present if and only if error is birth_failed', path: ['step'] });
    }
    if ((response.taken !== undefined) !== (response.error === 'project_taken')) {
        ctx.addIssue({ code: 'custom', message: 'taken is present if and only if error is project_taken', path: ['taken'] });
    }
});
export const internalProjectCreateContract = {
    method: 'POST',
    path: INTERNAL_PROJECT_CREATE_PATH,
    authType: 'token',
    authHeader: INTERNAL_TOKEN_HEADER,
    bodySchema: ProjectCreateRequestSchema,
    responseSchema: ProjectCreateResponseSchema,
    errorSchema: ProjectCreateErrorResponseSchema,
};
//# sourceMappingURL=internal-project-create.js.map