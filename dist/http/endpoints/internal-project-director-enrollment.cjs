"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalProjectDirectorEnrollmentContract = exports.ProjectDirectorEnrollmentErrorResponseSchema = exports.ProjectDirectorEnrollmentErrorCodeSchema = exports.PROJECT_DIRECTOR_ENROLLMENT_ERRORS = exports.ProjectDirectorEnrollmentResponseSchema = exports.ProjectDirectorEnrollmentStepSchema = exports.PROJECT_DIRECTOR_ENROLLMENT_STEPS = exports.ProjectDirectorEnrollmentRequestSchema = exports.INTERNAL_PROJECT_DIRECTOR_ENROLLMENT_PATH = void 0;
const zod_1 = require("zod");
const participant_binding_js_1 = require("../../organization/participant-binding.cjs");
const internal_project_create_js_1 = require("./internal-project-create.cjs");
exports.INTERNAL_PROJECT_DIRECTOR_ENROLLMENT_PATH = '/internal/paperclip/project-director-enrollment';
const shape = internal_project_create_js_1.ProjectCreateRequestSchema.shape;
/**
 * Forge factory-svc -> Paperclip: enroll the Director born for a project as the lead of that project.
 * `requestId` is the idempotency key, as in the project create contract. Paperclip opens no mailbox.
 */
exports.ProjectDirectorEnrollmentRequestSchema = zod_1.z
    .strictObject({
    tenantId: shape.tenantId,
    ownerId: shape.ownerId,
    companyId: shape.company.shape.companyId,
    requestId: shape.requestId,
    project: shape.project,
    director: zod_1.z.strictObject({ agentIdentity: participant_binding_js_1.ParticipantAgentIdentitySchema }),
})
    .superRefine((request, ctx) => {
    // An invalid project id is already reported by the project schema; the name rule has nothing to compare.
    if (!internal_project_create_js_1.ProjectIdSchema.safeParse(request.project.projectId).success)
        return;
    const expected = (0, internal_project_create_js_1.projectDirectorAgentId)(request.project.projectId);
    const identity = request.director.agentIdentity;
    for (const field of ['managementAgentId', 'runtimeAgentId']) {
        if (identity[field] !== expected) {
            ctx.addIssue({
                code: 'custom',
                path: ['director', 'agentIdentity', field],
                message: 'The Director must be named after the project',
            });
        }
    }
});
// Order of cap-paperclip: the binding is written before the seat, the key last, by the seat
// round (it needs the seat). `agent_key` = seat written and still without a key.
exports.PROJECT_DIRECTOR_ENROLLMENT_STEPS = [
    'paperclip_agent',
    'paperclip_project',
    'binding',
    'seat',
    'agent_key',
];
exports.ProjectDirectorEnrollmentStepSchema = zod_1.z.enum(exports.PROJECT_DIRECTOR_ENROLLMENT_STEPS);
/** `enrolled` carries both Paperclip ids and no step; `in_corso` names the step it is at. */
exports.ProjectDirectorEnrollmentResponseSchema = zod_1.z
    .strictObject({
    state: zod_1.z.enum(['enrolled', 'in_corso']),
    step: exports.ProjectDirectorEnrollmentStepSchema.optional(),
    paperclipAgentId: zod_1.z.uuid().optional(),
    paperclipProjectId: zod_1.z.uuid().optional(),
})
    .superRefine((response, ctx) => {
    if (response.state === 'enrolled') {
        if (response.paperclipAgentId === undefined || response.paperclipProjectId === undefined) {
            ctx.addIssue({ code: 'custom', path: ['state'], message: 'Enrolled state requires both Paperclip ids' });
        }
        if (response.step !== undefined) {
            ctx.addIssue({ code: 'custom', path: ['step'], message: 'Enrolled state has no step' });
        }
    }
    else if (response.step === undefined) {
        ctx.addIssue({ code: 'custom', path: ['step'], message: 'In-progress state requires the step' });
    }
});
/**
 * `person_unknown` also covers an organization with no attested person to write the binding from (for example
 * one without a Director). `project_taken`: a Paperclip project with that short name already exists, even
 * archived, or Paperclip renamed it.
 */
exports.PROJECT_DIRECTOR_ENROLLMENT_ERRORS = [
    'organization_unknown',
    'person_unknown',
    'identity_mismatch',
    'project_taken',
    'request_conflict',
    'seat_failed',
    'binding_write',
];
exports.ProjectDirectorEnrollmentErrorCodeSchema = zod_1.z.enum(exports.PROJECT_DIRECTOR_ENROLLMENT_ERRORS);
exports.ProjectDirectorEnrollmentErrorResponseSchema = zod_1.z.strictObject({
    error: exports.ProjectDirectorEnrollmentErrorCodeSchema,
});
exports.internalProjectDirectorEnrollmentContract = {
    method: 'POST',
    path: exports.INTERNAL_PROJECT_DIRECTOR_ENROLLMENT_PATH,
    authType: 'secret',
    bodySchema: exports.ProjectDirectorEnrollmentRequestSchema,
    responseSchema: exports.ProjectDirectorEnrollmentResponseSchema,
    errorSchema: exports.ProjectDirectorEnrollmentErrorResponseSchema,
};
//# sourceMappingURL=internal-project-director-enrollment.js.map