"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalProjectCreateContract = exports.ProjectCreateErrorResponseSchema = exports.ProjectTakenPlaceSchema = exports.PROJECT_TAKEN_PLACES = exports.ProjectCreateErrorSchema = exports.PROJECT_CREATE_ERRORS = exports.ProjectCreateResponseSchema = exports.ProjectDirectorContactSchema = exports.DirectorMailboxKindSchema = exports.DIRECTOR_MAILBOX_KINDS = exports.ProjectCreateStepSchema = exports.PROJECT_CREATE_STEPS = exports.ProjectCreateRequestSchema = exports.PROJECT_DIRECTOR_AGENT_ID_PREFIX = exports.ProjectIdSchema = exports.PROJECT_ID_MAX_LENGTH = exports.INTERNAL_PROJECT_CREATE_PATH = void 0;
exports.projectDirectorAgentId = projectDirectorAgentId;
const zod_1 = require("zod");
const index_js_1 = require("../../auth/index.cjs");
const business_unit_lead_js_1 = require("../../organization/business-unit-lead.cjs");
const company_map_js_1 = require("../../organization/company-map.cjs");
const participant_binding_js_1 = require("../../organization/participant-binding.cjs");
const shared_mailbox_js_1 = require("../../organization/shared-mailbox.cjs");
exports.INTERNAL_PROJECT_CREATE_PATH = '/api/internal/factory/projects';
/**
 * Forge agent slugs are at most 30 characters (`InternalFactoryDeployRequestSchema.slug`, Forge factory create request);
 * `director-` + 21 = 30.
 */
exports.PROJECT_ID_MAX_LENGTH = 21;
exports.ProjectIdSchema = zod_1.z.string().min(1).max(exports.PROJECT_ID_MAX_LENGTH).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
/** Forge names the agent of a project Director `director-<projectId>` (management and runtime id alike). */
exports.PROJECT_DIRECTOR_AGENT_ID_PREFIX = 'director-';
/** Agent id Forge gives to the Director of the project `projectId`. */
function projectDirectorAgentId(projectId) {
    return `${exports.PROJECT_DIRECTOR_AGENT_ID_PREFIX}${exports.ProjectIdSchema.parse(projectId)}`;
}
const requestShape = business_unit_lead_js_1.BusinessUnitLeadBirthRequestSchema.shape;
/**
 * Client -> Forge factory-svc: create a project and its Director.
 * `requestId` is the idempotency key: same `requestId` and same body = same answer with `replayed: true`;
 * same `requestId` and a different body = `request_conflict`.
 */
exports.ProjectCreateRequestSchema = zod_1.z.strictObject({
    requestId: requestShape.requestId,
    tenantId: requestShape.tenantId,
    ownerId: requestShape.ownerId,
    company: requestShape.company,
    project: zod_1.z.strictObject({
        projectId: exports.ProjectIdSchema,
        name: zod_1.z.string().min(1).max(120),
        description: zod_1.z.string().min(1).max(2000).optional(),
    }),
    /**
     * The client who creates the project. Forge adds `personRef` and `role` and writes it at once as the referent
     * of the project level of the company map.
     */
    projectReferent: company_map_js_1.CompanyMapReferentFieldsSchema.pick({ name: true, email: true }),
    requestedBy: zod_1.z.discriminatedUnion('kind', [
        zod_1.z.strictObject({ kind: zod_1.z.literal('owner') }),
        zod_1.z.strictObject({ kind: zod_1.z.literal('agent'), agentIdentity: participant_binding_js_1.ParticipantAgentIdentitySchema }),
    ]),
});
/** Steps of the creation, in order. */
exports.PROJECT_CREATE_STEPS = [
    'company_group',
    'project_group',
    'project_referent',
    'director_birth',
    'director_mailbox',
    'paperclip_enrollment',
    'director_profile',
];
exports.ProjectCreateStepSchema = zod_1.z.enum(exports.PROJECT_CREATE_STEPS);
/** Same names Forge uses for the mailbox modes; a Director always has a mailbox, so there is no `none`. */
exports.DIRECTOR_MAILBOX_KINDS = ['own', 'shared'];
exports.DirectorMailboxKindSchema = zod_1.z.enum(exports.DIRECTOR_MAILBOX_KINDS);
/**
 * How to write to the Director. On the shared mailbox the client puts `subjectLabel` in square brackets at the
 * start of the subject.
 */
exports.ProjectDirectorContactSchema = zod_1.z.discriminatedUnion('mailboxKind', [
    zod_1.z.strictObject({ mailboxKind: zod_1.z.literal('own'), address: zod_1.z.email() }),
    zod_1.z.strictObject({
        mailboxKind: zod_1.z.literal('shared'),
        address: zod_1.z.email(),
        subjectLabel: shared_mailbox_js_1.SharedMailboxLabelSchema,
    }),
]);
exports.ProjectCreateResponseSchema = zod_1.z.discriminatedUnion('state', [
    zod_1.z.strictObject({
        state: zod_1.z.literal('ready'),
        replayed: zod_1.z.boolean(),
        tenantId: requestShape.tenantId,
        companyId: requestShape.company.shape.companyId,
        projectId: exports.ProjectIdSchema,
        paperclipProjectId: zod_1.z.uuid(),
        director: zod_1.z.strictObject({
            agentIdentity: participant_binding_js_1.ParticipantAgentIdentitySchema,
            paperclipAgentId: zod_1.z.uuid(),
        }),
        contact: exports.ProjectDirectorContactSchema,
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
    zod_1.z.strictObject({ state: zod_1.z.literal('in_corso'), step: exports.ProjectCreateStepSchema }),
]);
exports.PROJECT_CREATE_ERRORS = [
    'invalid_request',
    'unauthorized',
    'company_unknown',
    'project_taken',
    'requester_not_allowed',
    'request_conflict',
    /** Covers every creation step, including `project_referent`. */
    'birth_failed',
    'enrollment_failed',
];
exports.ProjectCreateErrorSchema = zod_1.z.enum(exports.PROJECT_CREATE_ERRORS);
/**
 * Where a project is already taken: the Paperclip short name (archived projects included), the Memory project ids,
 * the Forge slug `director-<projectId>`, the label already used on the Directors' shared mailbox.
 */
exports.PROJECT_TAKEN_PLACES = [
    'paperclip_project',
    'memory_project',
    'forge_agent',
    'director_mailbox_label',
];
exports.ProjectTakenPlaceSchema = zod_1.z.enum(exports.PROJECT_TAKEN_PLACES);
exports.ProjectCreateErrorResponseSchema = zod_1.z.strictObject({
    error: exports.ProjectCreateErrorSchema,
    step: exports.ProjectCreateStepSchema.optional(),
    taken: zod_1.z.array(exports.ProjectTakenPlaceSchema).min(1)
        .refine((places) => new Set(places).size === places.length, { message: 'taken places must be different' })
        .optional(),
    reason: zod_1.z.string().min(1).max(500),
}).superRefine((response, ctx) => {
    if ((response.step !== undefined) !== (response.error === 'birth_failed')) {
        ctx.addIssue({ code: 'custom', message: 'step is present if and only if error is birth_failed', path: ['step'] });
    }
    if ((response.taken !== undefined) !== (response.error === 'project_taken')) {
        ctx.addIssue({ code: 'custom', message: 'taken is present if and only if error is project_taken', path: ['taken'] });
    }
});
exports.internalProjectCreateContract = {
    method: 'POST',
    path: exports.INTERNAL_PROJECT_CREATE_PATH,
    authType: 'token',
    authHeader: index_js_1.INTERNAL_TOKEN_HEADER,
    bodySchema: exports.ProjectCreateRequestSchema,
    responseSchema: exports.ProjectCreateResponseSchema,
    errorSchema: exports.ProjectCreateErrorResponseSchema,
};
//# sourceMappingURL=internal-project-create.js.map