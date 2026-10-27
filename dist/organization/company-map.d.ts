import { z } from 'zod';
import { type DecisionSubject } from "./decision-request.js";
/** Levels of the client company map: client company → project → business unit. */
export declare const COMPANY_MAP_LEVELS: readonly ["client", "project", "business_unit"];
export declare const CompanyMapLevelSchema: z.ZodEnum<{
    client: "client";
    project: "project";
    business_unit: "business_unit";
}>;
export type CompanyMapLevel = z.infer<typeof CompanyMapLevelSchema>;
/** Entry kinds of the map: referent (F1B-03), person, responsibility, asset and access (F3B-01). */
export declare const COMPANY_MAP_ENTRY_KINDS: readonly ["referent", "person", "responsibility", "asset", "access"];
export declare const CompanyMapEntryKindSchema: z.ZodEnum<{
    access: "access";
    asset: "asset";
    referent: "referent";
    person: "person";
    responsibility: "responsibility";
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
/** Scope and provenance fields shared by every entry kind. */
export declare const CompanyMapScopeFieldsSchema: z.ZodObject<{
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
/** Version fields assigned by the memory when the entry is stored. */
export declare const CompanyMapVersionFieldsSchema: z.ZodObject<{
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
/** Level rules shared by entries, write bodies and queries. */
export declare function checkCompanyMapLevelScope(scope: {
    level: string;
    projectId?: string | undefined;
    buSlug?: string | undefined;
}, ctx: z.RefinementCtx): void;
/** Entry selected for a confirmation request, within its level and kind. */
export declare const CompanyMapConfirmTargetSchema: z.ZodObject<{
    level: z.ZodEnum<{
        client: "client";
        project: "project";
        business_unit: "business_unit";
    }>;
    projectId: z.ZodOptional<z.ZodString>;
    buSlug: z.ZodOptional<z.ZodString>;
    kind: z.ZodEnum<{
        access: "access";
        asset: "asset";
        referent: "referent";
        person: "person";
        responsibility: "responsibility";
    }>;
    entryRef: z.ZodString;
}, z.core.$strict>;
export type CompanyMapConfirmTarget = z.infer<typeof CompanyMapConfirmTargetSchema>;
/** Fields of the «referent» entry (F1B-03). */
export declare const CompanyMapReferentFieldsSchema: z.ZodObject<{
    kind: z.ZodLiteral<"referent">;
    personRef: z.ZodString;
    name: z.ZodString;
    role: z.ZodString;
    email: z.ZodEmail;
}, z.core.$strict>;
/** Fields of a person of the client company. */
export declare const CompanyMapPersonFieldsSchema: z.ZodObject<{
    kind: z.ZodLiteral<"person">;
    personRef: z.ZodString;
    name: z.ZodString;
    role: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEmail>;
}, z.core.$strict>;
/** What a person answers for. */
export declare const CompanyMapResponsibilityFieldsSchema: z.ZodObject<{
    kind: z.ZodLiteral<"responsibility">;
    personRef: z.ZodString;
    responsibility: z.ZodString;
}, z.core.$strict>;
/** Reference to a company asset with its type and version (never its content). */
export declare const CompanyMapAssetFieldsSchema: z.ZodObject<{
    kind: z.ZodLiteral<"asset">;
    asset: z.ZodObject<{
        assetId: z.ZodString;
        assetType: z.ZodString;
        version: z.ZodNumber;
        sha256: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
/** Access as a reference only: provider, resource and the agent holding the credential in the Vault. No value. */
export declare const CompanyMapAccessFieldsSchema: z.ZodObject<{
    kind: z.ZodLiteral<"access">;
    accessRef: z.ZodString;
    provider: z.ZodString;
    resource: z.ZodString;
    holderAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
}, z.core.$strict>;
/** Versioned «referent» entry of the client company map. */
export declare const CompanyMapEntrySchema: z.ZodObject<{
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
export type CompanyMapEntry = z.infer<typeof CompanyMapEntrySchema>;
export declare const CompanyMapPersonEntrySchema: z.ZodObject<{
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
}, z.core.$strict>;
export type CompanyMapPersonEntry = z.infer<typeof CompanyMapPersonEntrySchema>;
export declare const CompanyMapResponsibilityEntrySchema: z.ZodObject<{
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
}, z.core.$strict>;
export type CompanyMapResponsibilityEntry = z.infer<typeof CompanyMapResponsibilityEntrySchema>;
export declare const CompanyMapAssetEntrySchema: z.ZodObject<{
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
}, z.core.$strict>;
export type CompanyMapAssetEntry = z.infer<typeof CompanyMapAssetEntrySchema>;
export declare const CompanyMapAccessEntrySchema: z.ZodObject<{
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
}, z.core.$strict>;
export type CompanyMapAccessEntry = z.infer<typeof CompanyMapAccessEntrySchema>;
/** Any entry of the map, by kind. */
export declare const CompanyMapAnyEntrySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export type CompanyMapAnyEntry = z.infer<typeof CompanyMapAnyEntrySchema>;
/** Owner choices when confirming an existing company map entry. */
export declare const COMPANY_MAP_CONFIRM_OPTIONS: [{
    readonly optionId: "confermo";
    readonly label: "Confermo";
}, {
    readonly optionId: "e-cambiato";
    readonly label: "È cambiato";
}];
/** Bind a confirmation to the exact entry version and digest the owner read. */
export declare function companyMapConfirmationSubject(entry: CompanyMapAnyEntry): DecisionSubject;
/** Key of an entry inside its level and kind: the person, the asset or the access. */
export declare function companyMapEntryKey(entry: {
    kind: 'referent' | 'person' | 'responsibility';
    personRef: string;
} | {
    kind: 'asset';
    asset: {
        assetId: string;
    };
} | {
    kind: 'access';
    accessRef: string;
}): string;
//# sourceMappingURL=company-map.d.ts.map