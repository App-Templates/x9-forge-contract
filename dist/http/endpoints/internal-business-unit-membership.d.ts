import { z } from 'zod';
export declare const INTERNAL_BUSINESS_UNIT_MEMBERSHIP_PATH: "/api/internal/factory/business-unit-membership";
/** Read scope: tenant, owner, company and business unit of the lead being checked. */
export declare const BusinessUnitMembershipQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    companyId: z.ZodString;
    businessUnitSlug: z.ZodString;
    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
}, z.core.$strict>;
export type BusinessUnitMembershipQuery = z.infer<typeof BusinessUnitMembershipQuerySchema>;
/** Evidence of whether the lead sits in the group of its business unit. */
export declare const BusinessUnitMembershipEvidenceSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    state: z.ZodLiteral<"member">;
    groupId: z.ZodString;
    observedAt: z.ZodISODateTime;
}, z.core.$strict>, z.ZodObject<{
    state: z.ZodLiteral<"absent">;
    observedAt: z.ZodISODateTime;
}, z.core.$strict>], "state">;
export type BusinessUnitMembershipEvidence = z.infer<typeof BusinessUnitMembershipEvidenceSchema>;
export declare const BusinessUnitMembershipResponseSchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    companyId: z.ZodString;
    businessUnitSlug: z.ZodString;
    agentIdentity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    membership: z.ZodDiscriminatedUnion<[z.ZodObject<{
        state: z.ZodLiteral<"member">;
        groupId: z.ZodString;
        observedAt: z.ZodISODateTime;
    }, z.core.$strict>, z.ZodObject<{
        state: z.ZodLiteral<"absent">;
        observedAt: z.ZodISODateTime;
    }, z.core.$strict>], "state">;
}, z.core.$strict>;
export type BusinessUnitMembershipResponse = z.infer<typeof BusinessUnitMembershipResponseSchema>;
/** Parses a response and rejects any answer that does not belong to the asked scope. */
export declare function parseBusinessUnitMembershipResponse(response: unknown, query: BusinessUnitMembershipQuery): BusinessUnitMembershipResponse;
/** Forge factory-svc: read whether a business unit lead belongs to its business unit group. */
export declare const internalBusinessUnitMembershipReadContract: {
    readonly method: "GET";
    readonly path: "/api/internal/factory/business-unit-membership";
    readonly authType: "token";
    readonly authHeader: "X-Internal-Token";
    readonly querySchema: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        companyId: z.ZodString;
        businessUnitSlug: z.ZodString;
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        companyId: z.ZodString;
        businessUnitSlug: z.ZodString;
        agentIdentity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        membership: z.ZodDiscriminatedUnion<[z.ZodObject<{
            state: z.ZodLiteral<"member">;
            groupId: z.ZodString;
            observedAt: z.ZodISODateTime;
        }, z.core.$strict>, z.ZodObject<{
            state: z.ZodLiteral<"absent">;
            observedAt: z.ZodISODateTime;
        }, z.core.$strict>], "state">;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-business-unit-membership.d.ts.map