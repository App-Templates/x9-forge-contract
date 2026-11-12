import { z } from 'zod';
export declare const INTERNAL_PROJECT_CREATE_PATH: "/api/internal/factory/projects";
/** Forge slugs are at most 64 characters; with the `director-` prefix the project id fits in 55. */
export declare const PROJECT_ID_MAX_LENGTH: 55;
export declare const ProjectIdSchema: z.ZodString;
/** Forge names the agent of a project Director `director-<projectId>` (management and runtime id alike). */
export declare const PROJECT_DIRECTOR_AGENT_ID_PREFIX: "director-";
/** Agent id Forge gives to the Director of the project `projectId`. */
export declare function projectDirectorAgentId(projectId: string): string;
/**
 * Client -> Forge factory-svc: create a project and its Director.
 * `requestId` is the idempotency key: same `requestId` and same body = same answer with `replayed: true`;
 * same `requestId` and a different body = `request_conflict`.
 */
export declare const ProjectCreateRequestSchema: z.ZodObject<{
    requestId: z.ZodString;
    tenantId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    company: z.ZodObject<{
        companyId: z.ZodString;
        name: z.ZodString;
    }, z.core.$strict>;
    project: z.ZodObject<{
        projectId: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    /**
     * The client who creates the project. Forge adds `personRef` and `role` and writes it at once as the referent
     * of the project level of the company map.
     */
    projectReferent: z.ZodObject<{
        email: z.ZodEmail;
        name: z.ZodString;
    }, z.core.$strict>;
    requestedBy: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"owner">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"agent">;
        agentIdentity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>], "kind">;
}, z.core.$strict>;
export type ProjectCreateRequest = z.infer<typeof ProjectCreateRequestSchema>;
/** Steps of the creation, in order. */
export declare const PROJECT_CREATE_STEPS: readonly ["company_group", "project_group", "director_birth", "director_mailbox", "paperclip_enrollment", "director_profile"];
export declare const ProjectCreateStepSchema: z.ZodEnum<{
    company_group: "company_group";
    project_group: "project_group";
    director_birth: "director_birth";
    director_mailbox: "director_mailbox";
    paperclip_enrollment: "paperclip_enrollment";
    director_profile: "director_profile";
}>;
export type ProjectCreateStep = z.infer<typeof ProjectCreateStepSchema>;
/** Same names Forge uses for the mailbox modes; a Director always has a mailbox, so there is no `none`. */
export declare const DIRECTOR_MAILBOX_KINDS: readonly ["own", "shared"];
export declare const DirectorMailboxKindSchema: z.ZodEnum<{
    own: "own";
    shared: "shared";
}>;
export type DirectorMailboxKind = z.infer<typeof DirectorMailboxKindSchema>;
/**
 * How to write to the Director. On the shared mailbox the client puts `subjectLabel` in square brackets at the
 * start of the subject.
 */
export declare const ProjectDirectorContactSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    mailboxKind: z.ZodLiteral<"own">;
    address: z.ZodEmail;
}, z.core.$strict>, z.ZodObject<{
    mailboxKind: z.ZodLiteral<"shared">;
    address: z.ZodEmail;
    subjectLabel: z.ZodString;
}, z.core.$strict>], "mailboxKind">;
export type ProjectDirectorContact = z.infer<typeof ProjectDirectorContactSchema>;
export declare const ProjectCreateResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    state: z.ZodLiteral<"ready">;
    replayed: z.ZodBoolean;
    tenantId: z.ZodString;
    companyId: z.ZodString;
    projectId: z.ZodString;
    paperclipProjectId: z.ZodUUID;
    director: z.ZodObject<{
        agentIdentity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        paperclipAgentId: z.ZodUUID;
    }, z.core.$strict>;
    contact: z.ZodDiscriminatedUnion<[z.ZodObject<{
        mailboxKind: z.ZodLiteral<"own">;
        address: z.ZodEmail;
    }, z.core.$strict>, z.ZodObject<{
        mailboxKind: z.ZodLiteral<"shared">;
        address: z.ZodEmail;
        subjectLabel: z.ZodString;
    }, z.core.$strict>], "mailboxKind">;
}, z.core.$strict>, z.ZodObject<{
    state: z.ZodLiteral<"in_corso">;
    step: z.ZodEnum<{
        company_group: "company_group";
        project_group: "project_group";
        director_birth: "director_birth";
        director_mailbox: "director_mailbox";
        paperclip_enrollment: "paperclip_enrollment";
        director_profile: "director_profile";
    }>;
}, z.core.$strict>], "state">;
export type ProjectCreateResponse = z.infer<typeof ProjectCreateResponseSchema>;
export declare const PROJECT_CREATE_ERRORS: readonly ["invalid_request", "unauthorized", "company_unknown", "project_taken", "requester_not_allowed", "request_conflict", "birth_failed", "enrollment_failed"];
export declare const ProjectCreateErrorSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    unauthorized: "unauthorized";
    request_conflict: "request_conflict";
    company_unknown: "company_unknown";
    project_taken: "project_taken";
    requester_not_allowed: "requester_not_allowed";
    birth_failed: "birth_failed";
    enrollment_failed: "enrollment_failed";
}>;
export type ProjectCreateError = z.infer<typeof ProjectCreateErrorSchema>;
/**
 * Where a project is already taken: the Paperclip short name (archived projects included), the Memory project ids,
 * the Forge slug `director-<projectId>`, the label already used on the Directors' shared mailbox.
 */
export declare const PROJECT_TAKEN_PLACES: readonly ["paperclip_project", "memory_project", "forge_agent", "director_mailbox_label"];
export declare const ProjectTakenPlaceSchema: z.ZodEnum<{
    paperclip_project: "paperclip_project";
    memory_project: "memory_project";
    forge_agent: "forge_agent";
    director_mailbox_label: "director_mailbox_label";
}>;
export type ProjectTakenPlace = z.infer<typeof ProjectTakenPlaceSchema>;
export declare const ProjectCreateErrorResponseSchema: z.ZodObject<{
    error: z.ZodEnum<{
        invalid_request: "invalid_request";
        unauthorized: "unauthorized";
        request_conflict: "request_conflict";
        company_unknown: "company_unknown";
        project_taken: "project_taken";
        requester_not_allowed: "requester_not_allowed";
        birth_failed: "birth_failed";
        enrollment_failed: "enrollment_failed";
    }>;
    step: z.ZodOptional<z.ZodEnum<{
        company_group: "company_group";
        project_group: "project_group";
        director_birth: "director_birth";
        director_mailbox: "director_mailbox";
        paperclip_enrollment: "paperclip_enrollment";
        director_profile: "director_profile";
    }>>;
    taken: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        paperclip_project: "paperclip_project";
        memory_project: "memory_project";
        forge_agent: "forge_agent";
        director_mailbox_label: "director_mailbox_label";
    }>>>;
    reason: z.ZodString;
}, z.core.$strict>;
export type ProjectCreateErrorResponse = z.infer<typeof ProjectCreateErrorResponseSchema>;
export declare const internalProjectCreateContract: {
    readonly method: "POST";
    readonly path: "/api/internal/factory/projects";
    readonly authType: "token";
    readonly authHeader: "X-Internal-Token";
    readonly bodySchema: typeof ProjectCreateRequestSchema;
    readonly responseSchema: typeof ProjectCreateResponseSchema;
    readonly errorSchema: typeof ProjectCreateErrorResponseSchema;
};
//# sourceMappingURL=internal-project-create.d.ts.map