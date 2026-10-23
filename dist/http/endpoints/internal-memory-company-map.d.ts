import { z } from 'zod';
export declare const INTERNAL_MEMORY_COMPANY_MAP_ENTRIES_PATH: "/internal/memory/company-map/entries";
/** POST body of a «referent» entry (F1B-03, unchanged). */
export declare const CompanyMapReferentWriteRequestSchema: z.ZodObject<{
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
/** POST body: one of the five entry kinds; version, digest and supersedes are assigned by the server. */
export declare const CompanyMapEntryWriteRequestSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
    kind: z.ZodLiteral<"person">;
    personRef: z.ZodString;
    name: z.ZodString;
    role: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEmail>;
    source: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"seed">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"decision">;
        requestId: z.ZodString;
        planVersion: z.ZodNumber;
    }, z.core.$strict>], "kind">;
    confirmedAt: z.ZodISODateTime;
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
    kind: z.ZodLiteral<"responsibility">;
    personRef: z.ZodString;
    responsibility: z.ZodString;
    source: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"seed">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"decision">;
        requestId: z.ZodString;
        planVersion: z.ZodNumber;
    }, z.core.$strict>], "kind">;
    confirmedAt: z.ZodISODateTime;
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
    kind: z.ZodLiteral<"asset">;
    asset: z.ZodObject<{
        assetId: z.ZodString;
        assetType: z.ZodString;
        version: z.ZodNumber;
        sha256: z.ZodString;
    }, z.core.$strict>;
    source: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"seed">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"decision">;
        requestId: z.ZodString;
        planVersion: z.ZodNumber;
    }, z.core.$strict>], "kind">;
    confirmedAt: z.ZodISODateTime;
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
    kind: z.ZodLiteral<"access">;
    accessRef: z.ZodString;
    provider: z.ZodString;
    resource: z.ZodString;
    holderAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    source: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"seed">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"decision">;
        requestId: z.ZodString;
        planVersion: z.ZodNumber;
    }, z.core.$strict>], "kind">;
    confirmedAt: z.ZodISODateTime;
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
export type CompanyMapEntryWriteRequest = z.infer<typeof CompanyMapEntryWriteRequestSchema>;
export declare const CompanyMapEntryWriteResponseSchema: z.ZodObject<{
    entry: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
    }, z.core.$strict>, z.ZodObject<{
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
            requestId: z.ZodString;
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
            requestId: z.ZodString;
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
            requestId: z.ZodString;
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
export type CompanyMapEntryWriteResponse = z.infer<typeof CompanyMapEntryWriteResponseSchema>;
/** GET: current entries of one level of the map, optionally of one kind. */
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
    kind: z.ZodOptional<z.ZodEnum<{
        access: "access";
        referent: "referent";
        person: "person";
        responsibility: "responsibility";
        asset: "asset";
    }>>;
}, z.core.$strict>;
export type CompanyMapEntriesQuery = z.infer<typeof CompanyMapEntriesQuerySchema>;
export declare const CompanyMapEntriesResponseSchema: z.ZodObject<{
    entries: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
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
    }, z.core.$strict>, z.ZodObject<{
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
            requestId: z.ZodString;
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
            requestId: z.ZodString;
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
            requestId: z.ZodString;
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
    }, z.core.$strict>], "kind">>;
}, z.core.$strict>;
export type CompanyMapEntriesResponse = z.infer<typeof CompanyMapEntriesResponseSchema>;
export declare const internalMemoryCompanyMapWriteContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/company-map/entries";
    readonly authType: "secret";
    readonly bodySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
        kind: z.ZodLiteral<"person">;
        personRef: z.ZodString;
        name: z.ZodString;
        role: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodEmail>;
        source: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"seed">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"decision">;
            requestId: z.ZodString;
            planVersion: z.ZodNumber;
        }, z.core.$strict>], "kind">;
        confirmedAt: z.ZodISODateTime;
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
        kind: z.ZodLiteral<"responsibility">;
        personRef: z.ZodString;
        responsibility: z.ZodString;
        source: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"seed">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"decision">;
            requestId: z.ZodString;
            planVersion: z.ZodNumber;
        }, z.core.$strict>], "kind">;
        confirmedAt: z.ZodISODateTime;
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
        kind: z.ZodLiteral<"asset">;
        asset: z.ZodObject<{
            assetId: z.ZodString;
            assetType: z.ZodString;
            version: z.ZodNumber;
            sha256: z.ZodString;
        }, z.core.$strict>;
        source: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"seed">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"decision">;
            requestId: z.ZodString;
            planVersion: z.ZodNumber;
        }, z.core.$strict>], "kind">;
        confirmedAt: z.ZodISODateTime;
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
        kind: z.ZodLiteral<"access">;
        accessRef: z.ZodString;
        provider: z.ZodString;
        resource: z.ZodString;
        holderAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        source: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"seed">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"decision">;
            requestId: z.ZodString;
            planVersion: z.ZodNumber;
        }, z.core.$strict>], "kind">;
        confirmedAt: z.ZodISODateTime;
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
    readonly responseSchema: z.ZodObject<{
        entry: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
        }, z.core.$strict>, z.ZodObject<{
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
                requestId: z.ZodString;
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
                requestId: z.ZodString;
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
                requestId: z.ZodString;
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
        kind: z.ZodOptional<z.ZodEnum<{
            access: "access";
            referent: "referent";
            person: "person";
            responsibility: "responsibility";
            asset: "asset";
        }>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        entries: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
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
        }, z.core.$strict>, z.ZodObject<{
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
                requestId: z.ZodString;
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
                requestId: z.ZodString;
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
                requestId: z.ZodString;
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
        }, z.core.$strict>], "kind">>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-memory-company-map.d.ts.map