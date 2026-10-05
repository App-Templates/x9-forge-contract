import { z } from 'zod';
/**
 * Projects — the control panel's routes on the capabilities that serve a project (v1.28.0, Phase 54).
 * Direction: Forge (control panel) or an ops script -> the capability (cap-ricerca, cap-lab, …).
 * Auth: platform secret (`INTERNAL_SECRET_HEADER`), as `POST /call/:tool`.
 *
 * Every capability keeps ITS part of a project's configuration, keyed by `projectId`; the capability identity is
 * conveyed by the caller's `baseUrl`, not by a path prefix. A part only moves forward: a `PUT` whose `version` is not
 * above the stored one is refused with 409 {@link ProjectConfigStaleSchema}, never applied silently.
 *
 * Consumers (planned): agent-x9 services/cap-ricerca, services/cap-lab (servers); forge-v2 Progetti (client).
 */
export declare const ProjectParamsSchema: z.ZodObject<{
    projectId: z.ZodString;
}, z.core.$strip>;
/** Build the concrete config path for a project id (validated). */
export declare function projectConfigPath(projectId: string): string;
export declare function projectSpendPath(projectId: string): string;
export declare function projectGrowthPath(projectId: string): string;
export declare const ProjectConfigSavedSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    version: z.ZodNumber;
}, z.core.$strict>;
export declare const ProjectConfigStaleSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodLiteral<"stale_version">;
    currentVersion: z.ZodNumber;
}, z.core.$strict>;
export declare const ProjectNotFoundSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodLiteral<"unknown_project">;
}, z.core.$strict>;
/** cap-ricerca's part: budget, models, research parameters, source rule, agents. */
export declare const ricercaProjectConfigPutContract: {
    readonly method: "PUT";
    readonly path: "/internal/projects/:projectId/config";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        projectId: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
        projectId: z.ZodString;
        version: z.ZodNumber;
        name: z.ZodString;
        objective: z.ZodString;
        budget: z.ZodObject<{
            dailyUsd: z.ZodNumber;
            perResearchMaxUsd: z.ZodNumber;
            timezone: z.ZodString;
        }, z.core.$strip>;
        models: z.ZodObject<{
            research: z.ZodString;
            digest: z.ZodOptional<z.ZodString>;
            read: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        research: z.ZodObject<{
            maxToolCalls: z.ZodNumber;
            searchContextSize: z.ZodEnum<{
                low: "low";
                medium: "medium";
                high: "high";
            }>;
            reasoningEffort: z.ZodEnum<{
                low: "low";
                medium: "medium";
                high: "high";
            }>;
        }, z.core.$strip>;
        sourceRule: z.ZodEnum<{
            opened_only: "opened_only";
            opened_or_search_result: "opened_or_search_result";
        }>;
        agents: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        version: z.ZodNumber;
    }, z.core.$strict>;
};
export declare const ricercaProjectConfigGetContract: {
    readonly method: "GET";
    readonly path: "/internal/projects/:projectId/config";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        projectId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        projectId: z.ZodString;
        version: z.ZodNumber;
        name: z.ZodString;
        objective: z.ZodString;
        budget: z.ZodObject<{
            dailyUsd: z.ZodNumber;
            perResearchMaxUsd: z.ZodNumber;
            timezone: z.ZodString;
        }, z.core.$strip>;
        models: z.ZodObject<{
            research: z.ZodString;
            digest: z.ZodOptional<z.ZodString>;
            read: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        research: z.ZodObject<{
            maxToolCalls: z.ZodNumber;
            searchContextSize: z.ZodEnum<{
                low: "low";
                medium: "medium";
                high: "high";
            }>;
            reasoningEffort: z.ZodEnum<{
                low: "low";
                medium: "medium";
                high: "high";
            }>;
        }, z.core.$strip>;
        sourceRule: z.ZodEnum<{
            opened_only: "opened_only";
            opened_or_search_result: "opened_or_search_result";
        }>;
        agents: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
};
/** cap-lab's part: the wiki's domain, conventions, kinds of pages and links. */
export declare const labProjectConfigPutContract: {
    readonly method: "PUT";
    readonly path: "/internal/projects/:projectId/config";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        projectId: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
        projectId: z.ZodString;
        version: z.ZodNumber;
        domain: z.ZodString;
        conventions: z.ZodString;
        pageKinds: z.ZodArray<z.ZodString>;
        linkKinds: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        version: z.ZodNumber;
    }, z.core.$strict>;
};
export declare const labProjectConfigGetContract: {
    readonly method: "GET";
    readonly path: "/internal/projects/:projectId/config";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        projectId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        projectId: z.ZodString;
        version: z.ZodNumber;
        domain: z.ZodString;
        conventions: z.ZodString;
        pageKinds: z.ZodArray<z.ZodString>;
        linkKinds: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
};
/** GET /internal/projects/:projectId/spend?from=YYYY-MM-DD&to=YYYY-MM-DD — cap-ricerca, days in the project's zone. */
export declare const ProjectSpendQuerySchema: z.ZodObject<{
    from: z.ZodString;
    to: z.ZodString;
}, z.core.$strict>;
export declare const ProjectSpendResponseSchema: z.ZodObject<{
    days: z.ZodArray<z.ZodObject<{
        projectId: z.ZodString;
        day: z.ZodString;
        spentUsd: z.ZodNumber;
        reservedUsd: z.ZodNumber;
        capUsd: z.ZodNumber;
        calls: z.ZodNumber;
        webCalls: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const ricercaProjectSpendContract: {
    readonly method: "GET";
    readonly path: "/internal/projects/:projectId/spend";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        projectId: z.ZodString;
    }, z.core.$strip>;
    readonly querySchema: z.ZodObject<{
        from: z.ZodString;
        to: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        days: z.ZodArray<z.ZodObject<{
            projectId: z.ZodString;
            day: z.ZodString;
            spentUsd: z.ZodNumber;
            reservedUsd: z.ZodNumber;
            capUsd: z.ZodNumber;
            calls: z.ZodNumber;
            webCalls: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
/** GET /internal/projects/:projectId/growth — cap-lab: the graph, the open gaps and the wiki's size. */
export declare const ProjectGrowthResponseSchema: z.ZodObject<{
    projectId: z.ZodString;
    nodes: z.ZodArray<z.ZodObject<{
        nodeId: z.ZodString;
        label: z.ZodString;
        parentId: z.ZodOptional<z.ZodString>;
        requires: z.ZodArray<z.ZodString>;
        level: z.ZodNumber;
        score: z.ZodNumber;
    }, z.core.$strict>>;
    gaps: z.ZodArray<z.ZodObject<{
        projectId: z.ZodString;
        question: z.ZodString;
        nodeId: z.ZodOptional<z.ZodString>;
        reason: z.ZodEnum<{
            non_so: "non_so";
            fonte_unica: "fonte_unica";
            contraddizione: "contraddizione";
            prerequisito_mancante: "prerequisito_mancante";
        }>;
    }, z.core.$strict>>;
    wiki: z.ZodObject<{
        pages: z.ZodNumber;
        claims: z.ZodNumber;
        claimsMultiSource: z.ZodNumber;
        contradictions: z.ZodNumber;
        sources: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const labProjectGrowthContract: {
    readonly method: "GET";
    readonly path: "/internal/projects/:projectId/growth";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        projectId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        projectId: z.ZodString;
        nodes: z.ZodArray<z.ZodObject<{
            nodeId: z.ZodString;
            label: z.ZodString;
            parentId: z.ZodOptional<z.ZodString>;
            requires: z.ZodArray<z.ZodString>;
            level: z.ZodNumber;
            score: z.ZodNumber;
        }, z.core.$strict>>;
        gaps: z.ZodArray<z.ZodObject<{
            projectId: z.ZodString;
            question: z.ZodString;
            nodeId: z.ZodOptional<z.ZodString>;
            reason: z.ZodEnum<{
                non_so: "non_so";
                fonte_unica: "fonte_unica";
                contraddizione: "contraddizione";
                prerequisito_mancante: "prerequisito_mancante";
            }>;
        }, z.core.$strict>>;
        wiki: z.ZodObject<{
            pages: z.ZodNumber;
            claims: z.ZodNumber;
            claimsMultiSource: z.ZodNumber;
            contradictions: z.ZodNumber;
            sources: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>;
};
export type ProjectConfigSaved = z.infer<typeof ProjectConfigSavedSchema>;
export type ProjectConfigStale = z.infer<typeof ProjectConfigStaleSchema>;
export type ProjectSpendQuery = z.infer<typeof ProjectSpendQuerySchema>;
export type ProjectSpendResponse = z.infer<typeof ProjectSpendResponseSchema>;
export type ProjectGrowthResponse = z.infer<typeof ProjectGrowthResponseSchema>;
//# sourceMappingURL=internal-project.d.ts.map