import { z } from 'zod';
/** The only birth profile Forge provisions for a business unit lead. */
export declare const BUSINESS_UNIT_LEAD_PROFILE_TEMPLATE: "capo-bu";
export declare const BusinessUnitLeadProfileTemplateSchema: z.ZodLiteral<"capo-bu">;
export type BusinessUnitLeadProfileTemplate = z.infer<typeof BusinessUnitLeadProfileTemplateSchema>;
/** A person the business unit writes to by email (the unit's referent). */
export declare const BusinessUnitLeadReferentSchema: z.ZodObject<{
    referentRef: z.ZodString;
    name: z.ZodString;
    role: z.ZodString;
    email: z.ZodEmail;
}, z.core.$strict>;
export type BusinessUnitLeadReferent = z.infer<typeof BusinessUnitLeadReferentSchema>;
/** Director request to create the lead of a company business unit. */
export declare const BusinessUnitLeadBirthRequestSchema: z.ZodObject<{
    requestId: z.ZodString;
    tenantId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    company: z.ZodObject<{
        companyId: z.ZodString;
        name: z.ZodString;
    }, z.core.$strict>;
    businessUnit: z.ZodObject<{
        slug: z.ZodString;
        name: z.ZodString;
        briefSection: z.ZodString;
        competencies: z.ZodArray<z.ZodString>;
        referents: z.ZodArray<z.ZodObject<{
            referentRef: z.ZodString;
            name: z.ZodString;
            role: z.ZodString;
            email: z.ZodEmail;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    profileTemplate: z.ZodLiteral<"capo-bu">;
    model: z.ZodObject<{
        tier: z.ZodEnum<{
            standard: "standard";
            advanced: "advanced";
            reasoning: "reasoning";
        }>;
        llmModel: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    capabilities: z.ZodArray<z.ZodString>;
    paperclipParticipant: z.ZodObject<{
        participantId: z.ZodString;
        roles: z.ZodArray<z.ZodEnum<{
            lead: "lead";
            member: "member";
            reviewer: "reviewer";
            observer: "observer";
        }>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type BusinessUnitLeadBirthRequest = z.infer<typeof BusinessUnitLeadBirthRequestSchema>;
/** Forge receipt containing the complete identity of the created agent. */
export declare const BusinessUnitLeadBirthResultSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    replayed: z.ZodBoolean;
    tenantId: z.ZodString;
    companyId: z.ZodString;
    businessUnitSlug: z.ZodString;
    agentIdentity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
export type BusinessUnitLeadBirthResult = z.infer<typeof BusinessUnitLeadBirthResultSchema>;
//# sourceMappingURL=business-unit-lead.d.ts.map