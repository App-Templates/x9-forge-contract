import { z } from 'zod';
export declare const INTERNAL_PROJECT_DIRECTOR_ENROLLMENT_PATH: "/internal/paperclip/project-director-enrollment";
/**
 * Forge factory-svc -> Paperclip: enroll the Director born for a project as the lead of that project.
 * `requestId` is the idempotency key, as in the project create contract. Paperclip opens no mailbox.
 */
export declare const ProjectDirectorEnrollmentRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    companyId: z.ZodString;
    requestId: z.ZodString;
    project: z.ZodObject<{
        projectId: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    director: z.ZodObject<{
        agentIdentity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type ProjectDirectorEnrollmentRequest = z.infer<typeof ProjectDirectorEnrollmentRequestSchema>;
export declare const PROJECT_DIRECTOR_ENROLLMENT_STEPS: readonly ["paperclip_agent", "paperclip_project", "binding", "seat", "agent_key"];
export declare const ProjectDirectorEnrollmentStepSchema: z.ZodEnum<{
    binding: "binding";
    seat: "seat";
    paperclip_project: "paperclip_project";
    paperclip_agent: "paperclip_agent";
    agent_key: "agent_key";
}>;
export type ProjectDirectorEnrollmentStep = z.infer<typeof ProjectDirectorEnrollmentStepSchema>;
/** `enrolled` carries both Paperclip ids and no step; `in_corso` names the step it is at. */
export declare const ProjectDirectorEnrollmentResponseSchema: z.ZodObject<{
    state: z.ZodEnum<{
        in_corso: "in_corso";
        enrolled: "enrolled";
    }>;
    step: z.ZodOptional<z.ZodEnum<{
        binding: "binding";
        seat: "seat";
        paperclip_project: "paperclip_project";
        paperclip_agent: "paperclip_agent";
        agent_key: "agent_key";
    }>>;
    paperclipAgentId: z.ZodOptional<z.ZodUUID>;
    paperclipProjectId: z.ZodOptional<z.ZodUUID>;
}, z.core.$strict>;
export type ProjectDirectorEnrollmentResponse = z.infer<typeof ProjectDirectorEnrollmentResponseSchema>;
/**
 * `person_unknown` also covers an organization with no attested person to write the binding from (for example
 * one without a Director). `project_taken`: a Paperclip project with that short name already exists, even
 * archived, or Paperclip renamed it.
 */
export declare const PROJECT_DIRECTOR_ENROLLMENT_ERRORS: readonly ["organization_unknown", "person_unknown", "identity_mismatch", "project_taken", "request_conflict", "seat_failed", "binding_write"];
export declare const ProjectDirectorEnrollmentErrorCodeSchema: z.ZodEnum<{
    identity_mismatch: "identity_mismatch";
    person_unknown: "person_unknown";
    request_conflict: "request_conflict";
    seat_failed: "seat_failed";
    binding_write: "binding_write";
    organization_unknown: "organization_unknown";
    project_taken: "project_taken";
}>;
export type ProjectDirectorEnrollmentErrorCode = z.infer<typeof ProjectDirectorEnrollmentErrorCodeSchema>;
export declare const ProjectDirectorEnrollmentErrorResponseSchema: z.ZodObject<{
    error: z.ZodEnum<{
        identity_mismatch: "identity_mismatch";
        person_unknown: "person_unknown";
        request_conflict: "request_conflict";
        seat_failed: "seat_failed";
        binding_write: "binding_write";
        organization_unknown: "organization_unknown";
        project_taken: "project_taken";
    }>;
}, z.core.$strict>;
export type ProjectDirectorEnrollmentErrorResponse = z.infer<typeof ProjectDirectorEnrollmentErrorResponseSchema>;
export declare const internalProjectDirectorEnrollmentContract: {
    readonly method: "POST";
    readonly path: "/internal/paperclip/project-director-enrollment";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        companyId: z.ZodString;
        requestId: z.ZodString;
        project: z.ZodObject<{
            projectId: z.ZodString;
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        director: z.ZodObject<{
            agentIdentity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        state: z.ZodEnum<{
            in_corso: "in_corso";
            enrolled: "enrolled";
        }>;
        step: z.ZodOptional<z.ZodEnum<{
            binding: "binding";
            seat: "seat";
            paperclip_project: "paperclip_project";
            paperclip_agent: "paperclip_agent";
            agent_key: "agent_key";
        }>>;
        paperclipAgentId: z.ZodOptional<z.ZodUUID>;
        paperclipProjectId: z.ZodOptional<z.ZodUUID>;
    }, z.core.$strict>;
    readonly errorSchema: z.ZodObject<{
        error: z.ZodEnum<{
            identity_mismatch: "identity_mismatch";
            person_unknown: "person_unknown";
            request_conflict: "request_conflict";
            seat_failed: "seat_failed";
            binding_write: "binding_write";
            organization_unknown: "organization_unknown";
            project_taken: "project_taken";
        }>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-project-director-enrollment.d.ts.map