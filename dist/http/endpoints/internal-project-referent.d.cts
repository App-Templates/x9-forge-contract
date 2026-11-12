import { z } from 'zod';
export declare const INTERNAL_PROJECT_REFERENT_WRITE_PATH: "/internal/company-map/project-referent";
/**
 * Forge computes `personRef` and `role`. This body is always valid for
 * `internalMemoryCompanyMapWriteContract`, so agent-core forwards it unchanged.
 * Only a seed referent at project level can be written through this route.
 */
export declare const ProjectReferentWriteRequestSchema: z.ZodObject<{
    kind: z.ZodLiteral<"referent">;
    personRef: z.ZodString;
    name: z.ZodString;
    role: z.ZodString;
    email: z.ZodEmail;
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clientId: z.ZodString;
    level: z.ZodLiteral<"project">;
    projectId: z.ZodString;
    source: z.ZodObject<{
        kind: z.ZodLiteral<"seed">;
    }, z.core.$strict>;
    confirmedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type ProjectReferentWriteRequest = z.infer<typeof ProjectReferentWriteRequestSchema>;
export declare const PROJECT_REFERENT_WRITE_ERRORS: readonly ["invalid_body", "unauthenticated", "internal_secret_unavailable", "company_memory_unavailable", "company_memory_refused", "company_memory_invalid_answer"];
export declare const ProjectReferentWriteErrorSchema: z.ZodEnum<{
    unauthenticated: "unauthenticated";
    invalid_body: "invalid_body";
    internal_secret_unavailable: "internal_secret_unavailable";
    company_memory_unavailable: "company_memory_unavailable";
    company_memory_refused: "company_memory_refused";
    company_memory_invalid_answer: "company_memory_invalid_answer";
}>;
export type ProjectReferentWriteError = z.infer<typeof ProjectReferentWriteErrorSchema>;
export declare const PROJECT_REFERENT_WRITE_ERROR_STATUS: {
    readonly invalid_body: 400;
    readonly unauthenticated: 401;
    readonly internal_secret_unavailable: 503;
    readonly company_memory_unavailable: 503;
    readonly company_memory_refused: 409;
    readonly company_memory_invalid_answer: 502;
};
export declare const ProjectReferentWriteErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    code: z.ZodEnum<{
        unauthenticated: "unauthenticated";
        invalid_body: "invalid_body";
        internal_secret_unavailable: "internal_secret_unavailable";
        company_memory_unavailable: "company_memory_unavailable";
        company_memory_refused: "company_memory_refused";
        company_memory_invalid_answer: "company_memory_invalid_answer";
    }>;
    message: z.ZodString;
}, z.core.$strict>;
export type ProjectReferentWriteErrorResponse = z.infer<typeof ProjectReferentWriteErrorResponseSchema>;
export declare const internalProjectReferentWriteContract: {
    readonly method: "POST";
    readonly path: "/internal/company-map/project-referent";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        kind: z.ZodLiteral<"referent">;
        personRef: z.ZodString;
        name: z.ZodString;
        role: z.ZodString;
        email: z.ZodEmail;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodString;
        level: z.ZodLiteral<"project">;
        projectId: z.ZodString;
        source: z.ZodObject<{
            kind: z.ZodLiteral<"seed">;
        }, z.core.$strict>;
        confirmedAt: z.ZodISODateTime;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        entry: z.ZodDiscriminatedUnion<[z.ZodObject<{
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"seed">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"decision">;
                requestId: z.ZodLazy<z.ZodString>;
                planVersion: z.ZodNumber;
            }, z.core.$strict>], "kind">;
            confirmedAt: z.ZodISODateTime;
            supersedes: z.ZodOptional<z.ZodNumber>;
            version: z.ZodNumber;
            digest: z.ZodString;
            kind: z.ZodLiteral<"referent">;
            personRef: z.ZodString;
            name: z.ZodString;
            role: z.ZodString;
            email: z.ZodEmail;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            clientId: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            buSlug: z.ZodOptional<z.ZodString>;
            level: z.ZodEnum<{
                client: "client";
                project: "project";
                business_unit: "business_unit";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"seed">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"decision">;
                requestId: z.ZodLazy<z.ZodString>;
                planVersion: z.ZodNumber;
            }, z.core.$strict>], "kind">;
            confirmedAt: z.ZodISODateTime;
            supersedes: z.ZodOptional<z.ZodNumber>;
            version: z.ZodNumber;
            digest: z.ZodString;
            kind: z.ZodLiteral<"person">;
            personRef: z.ZodString;
            name: z.ZodString;
            role: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodEmail>;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            clientId: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            buSlug: z.ZodOptional<z.ZodString>;
            level: z.ZodEnum<{
                client: "client";
                project: "project";
                business_unit: "business_unit";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"seed">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"decision">;
                requestId: z.ZodLazy<z.ZodString>;
                planVersion: z.ZodNumber;
            }, z.core.$strict>], "kind">;
            confirmedAt: z.ZodISODateTime;
            supersedes: z.ZodOptional<z.ZodNumber>;
            version: z.ZodNumber;
            digest: z.ZodString;
            kind: z.ZodLiteral<"responsibility">;
            personRef: z.ZodString;
            responsibility: z.ZodString;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            clientId: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            buSlug: z.ZodOptional<z.ZodString>;
            level: z.ZodEnum<{
                client: "client";
                project: "project";
                business_unit: "business_unit";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"seed">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"decision">;
                requestId: z.ZodLazy<z.ZodString>;
                planVersion: z.ZodNumber;
            }, z.core.$strict>], "kind">;
            confirmedAt: z.ZodISODateTime;
            supersedes: z.ZodOptional<z.ZodNumber>;
            version: z.ZodNumber;
            digest: z.ZodString;
            kind: z.ZodLiteral<"asset">;
            asset: z.ZodObject<{
                assetId: z.ZodString;
                assetType: z.ZodString;
                version: z.ZodNumber;
                sha256: z.ZodString;
            }, z.core.$strict>;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            clientId: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            buSlug: z.ZodOptional<z.ZodString>;
            level: z.ZodEnum<{
                client: "client";
                project: "project";
                business_unit: "business_unit";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"seed">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"decision">;
                requestId: z.ZodLazy<z.ZodString>;
                planVersion: z.ZodNumber;
            }, z.core.$strict>], "kind">;
            confirmedAt: z.ZodISODateTime;
            supersedes: z.ZodOptional<z.ZodNumber>;
            version: z.ZodNumber;
            digest: z.ZodString;
            kind: z.ZodLiteral<"access">;
            accessRef: z.ZodString;
            provider: z.ZodString;
            resource: z.ZodString;
            holderAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            clientId: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            buSlug: z.ZodOptional<z.ZodString>;
            level: z.ZodEnum<{
                client: "client";
                project: "project";
                business_unit: "business_unit";
            }>;
        }, z.core.$strict>], "kind">;
    }, z.core.$strict>;
    readonly errorSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        code: z.ZodEnum<{
            unauthenticated: "unauthenticated";
            invalid_body: "invalid_body";
            internal_secret_unavailable: "internal_secret_unavailable";
            company_memory_unavailable: "company_memory_unavailable";
            company_memory_refused: "company_memory_refused";
            company_memory_invalid_answer: "company_memory_invalid_answer";
        }>;
        message: z.ZodString;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-project-referent.d.ts.map