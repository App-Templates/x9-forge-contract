import { z } from 'zod';
export declare const INTERNAL_COMPANY_RD_BIRTH_PATH: "/api/internal/factory/company-rd";
/** The two permanent R&D agents every company is born with. */
export declare const COMPANY_RD_PARTS: readonly ["ricerca", "lab"];
export declare const CompanyRdPartSchema: z.ZodEnum<{
    ricerca: "ricerca";
    lab: "lab";
}>;
export type CompanyRdPart = z.infer<typeof CompanyRdPartSchema>;
/** Director -> Forge factory-svc: provision the Ricerca and Lab agents of a company. */
export declare const CompanyRdBirthRequestSchema: z.ZodObject<{
    requestId: z.ZodString;
    tenantId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    company: z.ZodObject<{
        companyId: z.ZodString;
        name: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type CompanyRdBirthRequest = z.infer<typeof CompanyRdBirthRequestSchema>;
export declare const CompanyRdBirthResultSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    replayed: z.ZodBoolean;
    tenantId: z.ZodString;
    companyId: z.ZodString;
    agents: z.ZodArray<z.ZodObject<{
        part: z.ZodEnum<{
            ricerca: "ricerca";
            lab: "lab";
        }>;
        agentIdentity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type CompanyRdBirthResult = z.infer<typeof CompanyRdBirthResultSchema>;
export declare const internalCompanyRdBirthContract: {
    readonly method: "POST";
    readonly path: "/api/internal/factory/company-rd";
    readonly authType: "token";
    readonly authHeader: "X-Internal-Token";
    readonly bodySchema: typeof CompanyRdBirthRequestSchema;
    readonly responseSchema: typeof CompanyRdBirthResultSchema;
};
//# sourceMappingURL=internal-company-rd.d.ts.map