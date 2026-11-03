import { z } from 'zod';
export declare const LabBriefGapsListQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    clientId: z.ZodString;
    projectId: z.ZodString;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strict>;
export type LabBriefGapsListQuery = z.infer<typeof LabBriefGapsListQuerySchema>;
export declare const LabBriefGapsListResponseSchema: z.ZodObject<{
    analyses: z.ZodArray<z.ZodObject<{
        gapsRef: z.ZodString;
        topics: z.ZodArray<z.ZodString>;
        covered: z.ZodArray<z.ZodObject<{
            slug: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strict>>;
        gaps: z.ZodArray<z.ZodObject<{
            topic: z.ZodString;
        }, z.core.$strict>>;
        analyzedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type LabBriefGapsListResponse = z.infer<typeof LabBriefGapsListResponseSchema>;
/** Read an agent's brief analyses for a client project. */
export declare const labBriefGapsListContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/lab/brief-gaps";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly querySchema: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        clientId: z.ZodString;
        projectId: z.ZodString;
        limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        analyses: z.ZodArray<z.ZodObject<{
            gapsRef: z.ZodString;
            topics: z.ZodArray<z.ZodString>;
            covered: z.ZodArray<z.ZodObject<{
                slug: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>;
            gaps: z.ZodArray<z.ZodObject<{
                topic: z.ZodString;
            }, z.core.$strict>>;
            analyzedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            timeout: "timeout";
            unavailable: "unavailable";
            invalid_request: "invalid_request";
            not_found: "not_found";
            not_configured: "not_configured";
            not_ready: "not_ready";
            scope_foreign: "scope_foreign";
        }>;
    }, z.core.$strict>;
};
export declare const RicercaResearchListQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    projectId: z.ZodString;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strict>;
export type RicercaResearchListQuery = z.infer<typeof RicercaResearchListQuerySchema>;
export declare const RicercaResearchListResponseSchema: z.ZodObject<{
    researches: z.ZodArray<z.ZodObject<{
        researchId: z.ZodString;
        state: z.ZodEnum<{
            failed: "failed";
            completed: "completed";
            queued: "queued";
            running: "running";
            budget_exhausted: "budget_exhausted";
        }>;
        labGapsRef: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type RicercaResearchListResponse = z.infer<typeof RicercaResearchListResponseSchema>;
/** Read project research and its optional link to a lab brief analysis. */
export declare const ricercaResearchListContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/ricerca/researches";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly querySchema: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        projectId: z.ZodString;
        limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        researches: z.ZodArray<z.ZodObject<{
            researchId: z.ZodString;
            state: z.ZodEnum<{
                failed: "failed";
                completed: "completed";
                queued: "queued";
                running: "running";
                budget_exhausted: "budget_exhausted";
            }>;
            labGapsRef: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            timeout: "timeout";
            unavailable: "unavailable";
            invalid_request: "invalid_request";
            not_found: "not_found";
            not_configured: "not_configured";
            not_ready: "not_ready";
            scope_foreign: "scope_foreign";
        }>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-rd-observations.d.ts.map