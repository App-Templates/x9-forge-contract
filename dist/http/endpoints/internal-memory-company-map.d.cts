import { z } from 'zod';
export declare const INTERNAL_MEMORY_COMPANY_MAP_ENTRIES_PATH: "/internal/memory/company-map/entries";
/** POST body: version, digest and supersedes are assigned by the server. */
export declare const CompanyMapEntryWriteRequestSchema: z.ZodObject<{
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
    kind: z.ZodLiteral<"referent">;
    personRef: z.ZodString;
    name: z.ZodString;
    role: z.ZodString;
    email: z.ZodEmail;
    source: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"seed">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"decision">;
        requestId: z.ZodString;
        planVersion: z.ZodNumber;
    }, z.core.$strict>], "kind">;
    confirmedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type CompanyMapEntryWriteRequest = z.infer<typeof CompanyMapEntryWriteRequestSchema>;
export declare const CompanyMapEntryWriteResponseSchema: z.ZodObject<{
    entry: z.ZodObject<{
        source: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"seed">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"decision">;
            requestId: z.ZodString;
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
    }, z.core.$strict>;
}, z.core.$strict>;
export type CompanyMapEntryWriteResponse = z.infer<typeof CompanyMapEntryWriteResponseSchema>;
/** GET: entries of one level of the map. */
export declare const CompanyMapEntriesQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clientId: z.ZodString;
    level: z.ZodEnum<{
        client: "client";
        project: "project";
        business_unit: "business_unit";
    }>;
    projectId: z.ZodOptional<z.ZodString>;
    buSlug: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type CompanyMapEntriesQuery = z.infer<typeof CompanyMapEntriesQuerySchema>;
export declare const CompanyMapEntriesResponseSchema: z.ZodObject<{
    entries: z.ZodArray<z.ZodObject<{
        source: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"seed">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"decision">;
            requestId: z.ZodString;
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
    }, z.core.$strict>>;
}, z.core.$strict>;
export type CompanyMapEntriesResponse = z.infer<typeof CompanyMapEntriesResponseSchema>;
export declare const internalMemoryCompanyMapWriteContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/company-map/entries";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
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
        kind: z.ZodLiteral<"referent">;
        personRef: z.ZodString;
        name: z.ZodString;
        role: z.ZodString;
        email: z.ZodEmail;
        source: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"seed">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"decision">;
            requestId: z.ZodString;
            planVersion: z.ZodNumber;
        }, z.core.$strict>], "kind">;
        confirmedAt: z.ZodISODateTime;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        entry: z.ZodObject<{
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"seed">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"decision">;
                requestId: z.ZodString;
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
        }, z.core.$strict>;
    }, z.core.$strict>;
};
export declare const internalMemoryCompanyMapListContract: {
    readonly method: "GET";
    readonly path: "/internal/memory/company-map/entries";
    readonly authType: "secret";
    readonly querySchema: z.ZodObject<{
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodString;
        level: z.ZodEnum<{
            client: "client";
            project: "project";
            business_unit: "business_unit";
        }>;
        projectId: z.ZodOptional<z.ZodString>;
        buSlug: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        entries: z.ZodArray<z.ZodObject<{
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"seed">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"decision">;
                requestId: z.ZodString;
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
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-memory-company-map.d.ts.map