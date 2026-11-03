import { z } from 'zod';
/** Named failures for notebook HTTP reads and exports. */
export declare const LabHttpErrorSchema: z.ZodObject<{
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
/** HTTP scope excludes the agent identity supplied by the route parameters. */
export declare const labScopeQuerySchema: z.ZodObject<{
    ownerId: z.ZodString;
    tenantId: z.ZodString;
}, z.core.$strict>;
/** List pages in the scoped agent notebook. */
export declare const labPagesContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/lab/pages";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly querySchema: z.ZodObject<{
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        cursor: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        snapshotVersion: z.ZodNumber;
        pages: z.ZodArray<z.ZodObject<{
            version: z.ZodNumber;
            kind: z.ZodString;
            title: z.ZodString;
            updatedAt: z.ZodISODateTime;
            slug: z.ZodString;
        }, z.core.$strict>>;
        nextCursor: z.ZodNullable<z.ZodString>;
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
/** Read a notebook page at its current or requested version. */
export declare const labPageDetailContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/lab/pages/:slug";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        slug: z.ZodString;
    }, z.core.$strict>;
    readonly querySchema: z.ZodObject<{
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        version: z.ZodOptional<z.ZodPipe<z.ZodCoercedNumber<unknown>, z.ZodNumber>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        snapshotVersion: z.ZodNumber;
        truncated: z.ZodObject<{
            claims: z.ZodBoolean;
            links: z.ZodBoolean;
            sources: z.ZodBoolean;
        }, z.core.$strict>;
        page: z.ZodObject<{
            agentId: z.ZodString;
            slug: z.ZodString;
            kind: z.ZodString;
            title: z.ZodString;
            body: z.ZodString;
            version: z.ZodNumber;
            updatedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        claims: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            pageSlug: z.ZodString;
            text: z.ZodString;
            sourceIds: z.ZodArray<z.ZodString>;
            status: z.ZodEnum<{
                aperta: "aperta";
                confermata: "confermata";
                contraddetta: "contraddetta";
                scartata: "scartata";
            }>;
            origin: z.ZodEnum<{
                web: "web";
                dataset: "dataset";
                human: "human";
            }>;
        }, z.core.$strict>>;
        links: z.ZodArray<z.ZodObject<{
            from: z.ZodString;
            to: z.ZodString;
            kind: z.ZodString;
        }, z.core.$strict>>;
        sources: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            agentId: z.ZodString;
            url: z.ZodOptional<z.ZodString>;
            title: z.ZodOptional<z.ZodString>;
            fetchedAt: z.ZodISODateTime;
            contentSha256: z.ZodString;
            origin: z.ZodEnum<{
                web: "web";
                dataset: "dataset";
                human: "human";
            }>;
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
/** Read paginated notebook growth measurements. */
export declare const labGrowthHistoryContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/lab/growth/history";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly querySchema: z.ZodObject<{
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        cursor: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        snapshotVersion: z.ZodNumber;
        scope: z.ZodObject<{
            tenantId: z.ZodString;
            ownerId: z.ZodString;
            agentId: z.ZodString;
        }, z.core.$strict>;
        points: z.ZodArray<z.ZodObject<{
            at: z.ZodISODateTime;
            method: z.ZodString;
            methodVersion: z.ZodString;
            numerator: z.ZodNumber;
            denominator: z.ZodNumber;
            score: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>>;
        nextCursor: z.ZodNullable<z.ZodString>;
        state: z.ZodEnum<{
            ok: "ok";
            unavailable: "unavailable";
            empty: "empty";
        }>;
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
/** Read competence with its snapshot and measurement method. */
export declare const labCompetenceContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/lab/competence";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly querySchema: z.ZodObject<{
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        nodes: z.ZodArray<z.ZodObject<{
            nodeId: z.ZodString;
            label: z.ZodString;
            parentId: z.ZodOptional<z.ZodString>;
            requires: z.ZodArray<z.ZodString>;
            level: z.ZodNumber;
            score: z.ZodNumber;
        }, z.core.$strict>>;
        snapshotVersion: z.ZodNumber;
        method: z.ZodString;
        methodVersion: z.ZodString;
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
/** Read the notebook's open competence gaps. */
export declare const labGapsContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/lab/gaps";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly querySchema: z.ZodObject<{
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        gaps: z.ZodArray<z.ZodObject<{
            agentId: z.ZodString;
            question: z.ZodString;
            nodeId: z.ZodOptional<z.ZodString>;
            reason: z.ZodEnum<{
                non_so: "non_so";
                fonte_unica: "fonte_unica";
                contraddizione: "contraddizione";
                prerequisito_mancante: "prerequisito_mancante";
            }>;
        }, z.core.$strict>>;
        snapshotVersion: z.ZodNumber;
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
/** Export a scoped notebook with the agent identity supplied only by the path. */
export declare const labExportContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/agents/:agentId/lab/export";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
        format: z.ZodEnum<{
            json: "json";
            markdown: "markdown";
        }>;
        scope: z.ZodObject<{
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        filename: z.ZodString;
        bytes: z.ZodNumber;
        content: z.ZodString;
        partial: z.ZodBoolean;
        generatedFrom: z.ZodNumber;
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
//# sourceMappingURL=internal-capability-lab.d.ts.map