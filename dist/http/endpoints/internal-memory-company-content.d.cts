import { z } from 'zod';
export declare const INTERNAL_MEMORY_COMPANY_CONTENT_READ_PATH: "/internal/memory/company-content/read";
export declare const COMPANY_CONTENT_SOURCES: readonly ["publication", "decision", "map_entry"];
/** The service checks the requested client against the reader's attested identity. */
export declare const CompanyContentReadRequestSchema: z.ZodObject<{
    context: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        organizationId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        personRef: z.ZodOptional<z.ZodString>;
        issuer: z.ZodEnum<{
            x9: "x9";
            forge: "forge";
            paperclip: "paperclip";
        }>;
        issuedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
    }, z.core.$strict>;
    /**
     * Optional since 1.65.0 (MVP, decision «Da dove il turno del Director e di Lab sa la sua azienda cliente e il suo
     * ruolo»): absent, the service uses the client company the map attests for the verified organization.
     */
    clientId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    query: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type CompanyContentReadRequest = z.infer<typeof CompanyContentReadRequestSchema>;
export declare const CompanyContentReadResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"ok">;
    clientId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        source: z.ZodEnum<{
            decision: "decision";
            map_entry: "map_entry";
            publication: "publication";
        }>;
        ref: z.ZodString;
        version: z.ZodNumber;
        digest: z.ZodString;
        projectId: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        text: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"not_authorized">;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"other_client">;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strict>], "status">;
export type CompanyContentReadResponse = z.infer<typeof CompanyContentReadResponseSchema>;
export declare const internalMemoryCompanyContentReadContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/company-content/read";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        context: z.ZodObject<{
            schemaVersion: z.ZodLiteral<1>;
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            organizationId: z.ZodString;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            personRef: z.ZodOptional<z.ZodString>;
            issuer: z.ZodEnum<{
                x9: "x9";
                forge: "forge";
                paperclip: "paperclip";
            }>;
            issuedAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strict>;
        /**
         * Optional since 1.65.0 (MVP, decision «Da dove il turno del Director e di Lab sa la sua azienda cliente e il suo
         * ruolo»): absent, the service uses the client company the map attests for the verified organization.
         */
        clientId: z.ZodOptional<z.ZodString>;
        projectId: z.ZodOptional<z.ZodString>;
        query: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        status: z.ZodLiteral<"ok">;
        clientId: z.ZodString;
        items: z.ZodArray<z.ZodObject<{
            source: z.ZodEnum<{
                decision: "decision";
                map_entry: "map_entry";
                publication: "publication";
            }>;
            ref: z.ZodString;
            version: z.ZodNumber;
            digest: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            title: z.ZodOptional<z.ZodString>;
            text: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"not_authorized">;
        message: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"other_client">;
        message: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>], "status">;
};
//# sourceMappingURL=internal-memory-company-content.d.ts.map