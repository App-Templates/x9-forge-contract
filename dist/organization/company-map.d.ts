import { z } from 'zod';
/** Levels of the client company map: client company → project → business unit. */
export declare const COMPANY_MAP_LEVELS: readonly ["client", "project", "business_unit"];
export declare const CompanyMapLevelSchema: z.ZodEnum<{
    client: "client";
    project: "project";
    business_unit: "business_unit";
}>;
export type CompanyMapLevel = z.infer<typeof CompanyMapLevelSchema>;
/** Entry kinds of the map; only the referent exists for now. */
export declare const COMPANY_MAP_ENTRY_KINDS: readonly ["referent"];
export declare const CompanyMapEntryKindSchema: z.ZodEnum<{
    referent: "referent";
}>;
export type CompanyMapEntryKind = z.infer<typeof CompanyMapEntryKindSchema>;
/** An entry comes only from a seed or from an approved decision, never from a model. */
export declare const CompanyMapSourceSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"seed">;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"decision">;
    requestId: z.ZodString;
    planVersion: z.ZodNumber;
}, z.core.$strict>], "kind">;
export type CompanyMapSource = z.infer<typeof CompanyMapSourceSchema>;
/** Versioned «referent» entry of the client company map. */
export declare const CompanyMapEntrySchema: z.ZodObject<{
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
    supersedes: z.ZodOptional<z.ZodNumber>;
    version: z.ZodNumber;
    digest: z.ZodString;
}, z.core.$strict>;
export type CompanyMapEntry = z.infer<typeof CompanyMapEntrySchema>;
//# sourceMappingURL=company-map.d.ts.map