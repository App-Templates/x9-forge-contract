import { z } from 'zod';
export declare const INTERNAL_PROJECT_NAME_CHECK_PATH: "/internal/paperclip/project-name-check";
/**
 * Forge factory-svc -> cap-paperclip, before the Director is born: is the short name of a project free in Paperclip
 * for that company? Read only; the project name in Paperclip is the project id.
 */
export declare const ProjectNameCheckRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    companyId: z.ZodString;
    projectId: z.ZodString;
}, z.core.$strict>;
export type ProjectNameCheckRequest = z.infer<typeof ProjectNameCheckRequestSchema>;
/**
 * `existing_project` = a project not archived (any status) has that name or url key; `archived_project` = only
 * archived ones have it; when both, `existing_project`.
 */
export declare const PROJECT_NAME_TAKEN_REASONS: readonly ["existing_project", "archived_project"];
export declare const ProjectNameTakenReasonSchema: z.ZodEnum<{
    existing_project: "existing_project";
    archived_project: "archived_project";
}>;
export type ProjectNameTakenReason = z.infer<typeof ProjectNameTakenReasonSchema>;
export declare const ProjectNameCheckResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    state: z.ZodLiteral<"free">;
}, z.core.$strict>, z.ZodObject<{
    state: z.ZodLiteral<"taken">;
    reason: z.ZodEnum<{
        existing_project: "existing_project";
        archived_project: "archived_project";
    }>;
}, z.core.$strict>], "state">;
export type ProjectNameCheckResponse = z.infer<typeof ProjectNameCheckResponseSchema>;
/**
 * `reader_unavailable` = cap-paperclip has no key to read the projects of that company (no Director, key missing);
 * `paperclip_unavailable` = Paperclip did not answer or answered in another shape.
 */
export declare const PROJECT_NAME_CHECK_ERRORS: readonly ["invalid_request", "organization_unknown", "not_configured", "reader_unavailable", "paperclip_unavailable"];
export declare const ProjectNameCheckErrorCodeSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    not_configured: "not_configured";
    paperclip_unavailable: "paperclip_unavailable";
    organization_unknown: "organization_unknown";
    reader_unavailable: "reader_unavailable";
}>;
export type ProjectNameCheckErrorCode = z.infer<typeof ProjectNameCheckErrorCodeSchema>;
export declare const PROJECT_NAME_CHECK_ERROR_STATUS: {
    readonly invalid_request: 400;
    readonly organization_unknown: 404;
    readonly not_configured: 503;
    readonly reader_unavailable: 503;
    readonly paperclip_unavailable: 502;
};
export declare const ProjectNameCheckErrorResponseSchema: z.ZodObject<{
    error: z.ZodEnum<{
        invalid_request: "invalid_request";
        not_configured: "not_configured";
        paperclip_unavailable: "paperclip_unavailable";
        organization_unknown: "organization_unknown";
        reader_unavailable: "reader_unavailable";
    }>;
}, z.core.$strict>;
export type ProjectNameCheckErrorResponse = z.infer<typeof ProjectNameCheckErrorResponseSchema>;
export declare const internalProjectNameCheckContract: {
    readonly method: "POST";
    readonly path: "/internal/paperclip/project-name-check";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        companyId: z.ZodString;
        projectId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        state: z.ZodLiteral<"free">;
    }, z.core.$strict>, z.ZodObject<{
        state: z.ZodLiteral<"taken">;
        reason: z.ZodEnum<{
            existing_project: "existing_project";
            archived_project: "archived_project";
        }>;
    }, z.core.$strict>], "state">;
    readonly errorSchema: z.ZodObject<{
        error: z.ZodEnum<{
            invalid_request: "invalid_request";
            not_configured: "not_configured";
            paperclip_unavailable: "paperclip_unavailable";
            organization_unknown: "organization_unknown";
            reader_unavailable: "reader_unavailable";
        }>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-project-name-check.d.ts.map