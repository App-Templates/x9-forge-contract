import { z } from 'zod';
/**
 * A capability's routes for ONE agent it serves (v1.28.0, Phase 54).
 * Direction: Forge (agent management) or an ops script -> the capability (cap-ricerca, cap-lab, …).
 * Auth: platform secret (`INTERNAL_SECRET_HEADER`), as `POST /call/:tool`.
 *
 * Every capability keeps the configuration of each agent it is attached to, keyed by `agentId`; the capability
 * identity is conveyed by the caller's `baseUrl`, not by the path. A configuration only moves forward: a `PUT` whose
 * `version` is not above the stored one is refused with 409 {@link AgentConfigStaleSchema}, never applied silently.
 * Errors: 400 {@link CapabilityAgentRouteErrorSchema} (`invalid_request`, `agent_mismatch`), 401 missing/wrong secret,
 * 404 `not_configured`, 409 stale version, 422 `invalid_config` / `unknown_model_rate` / `budget_below_minimum` (a budget
 * too small for even one research in the worst case: refused instead of stopping every research).
 *
 * Consumers (planned): agent-x9 services/cap-ricerca, services/cap-lab (servers); forge-v2 agent management (client).
 */
export declare const CapabilityAgentParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
}, z.core.$strip>;
/** Build the concrete paths for an agent id (validated). */
export declare const capAgentConfigPath: (agentId: string) => string;
export declare const capAgentSpendPath: (agentId: string) => string;
export declare const capAgentGrowthPath: (agentId: string) => string;
export declare const AgentConfigSavedSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    version: z.ZodNumber;
}, z.core.$strict>;
export declare const AgentConfigStaleSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodLiteral<"stale_version">;
    currentVersion: z.ZodNumber;
}, z.core.$strict>;
export declare const CapabilityAgentRouteErrorSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        invalid_request: "invalid_request";
        not_configured: "not_configured";
        agent_mismatch: "agent_mismatch";
        invalid_config: "invalid_config";
        unknown_model_rate: "unknown_model_rate";
        budget_below_minimum: "budget_below_minimum";
    }>;
}, z.core.$strict>;
export type CapabilityAgentRouteError = z.infer<typeof CapabilityAgentRouteErrorSchema>;
/** cap-ricerca's configuration of an agent: budget, models, research parameters, source rule. */
export declare const ricercaAgentConfigPutContract: {
    readonly method: "PUT";
    readonly path: "/internal/capability/agents/:agentId/config";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
        agentId: z.ZodString;
        version: z.ZodNumber;
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
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        version: z.ZodNumber;
    }, z.core.$strict>;
};
export declare const ricercaAgentConfigGetContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/config";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        agentId: z.ZodString;
        version: z.ZodNumber;
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
    }, z.core.$strict>;
};
/** cap-lab's configuration of an agent: the wiki's domain, conventions, kinds of pages and links. */
export declare const labAgentConfigPutContract: {
    readonly method: "PUT";
    readonly path: "/internal/capability/agents/:agentId/config";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
        agentId: z.ZodString;
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
export declare const labAgentConfigGetContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/config";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        agentId: z.ZodString;
        version: z.ZodNumber;
        domain: z.ZodString;
        conventions: z.ZodString;
        pageKinds: z.ZodArray<z.ZodString>;
        linkKinds: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
};
/** Longest window of one spend request, days (inclusive). */
export declare const AGENT_SPEND_MAX_DAYS = 400;
/** GET /internal/capability/agents/:agentId/spend?from=YYYY-MM-DD&to=YYYY-MM-DD — days in the agent's time zone. */
export declare const AgentSpendQuerySchema: z.ZodObject<{
    from: z.ZodString;
    to: z.ZodString;
}, z.core.$strict>;
export declare const AgentSpendResponseSchema: z.ZodObject<{
    days: z.ZodArray<z.ZodObject<{
        agentId: z.ZodString;
        capability: z.ZodEnum<{
            ricerca: "ricerca";
        }>;
        day: z.ZodString;
        spentUsd: z.ZodNumber;
        reservedUsd: z.ZodNumber;
        capUsd: z.ZodNumber;
        calls: z.ZodNumber;
        webCalls: z.ZodNumber;
        budgetStops: z.ZodNumber;
        budgetReachedAt: z.ZodNullable<z.ZodISODateTime>;
    }, z.core.$strict>>;
    queuedNow: z.ZodNumber;
}, z.core.$strict>;
export declare const ricercaAgentSpendContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/spend";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly querySchema: z.ZodObject<{
        from: z.ZodString;
        to: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        days: z.ZodArray<z.ZodObject<{
            agentId: z.ZodString;
            capability: z.ZodEnum<{
                ricerca: "ricerca";
            }>;
            day: z.ZodString;
            spentUsd: z.ZodNumber;
            reservedUsd: z.ZodNumber;
            capUsd: z.ZodNumber;
            calls: z.ZodNumber;
            webCalls: z.ZodNumber;
            budgetStops: z.ZodNumber;
            budgetReachedAt: z.ZodNullable<z.ZodISODateTime>;
        }, z.core.$strict>>;
        queuedNow: z.ZodNumber;
    }, z.core.$strict>;
};
/** GET /internal/capability/agents/:agentId/growth — cap-lab: the graph, the open gaps and the wiki's size. */
export declare const AgentGrowthResponseSchema: z.ZodObject<{
    agentId: z.ZodString;
    nodes: z.ZodArray<z.ZodObject<{
        nodeId: z.ZodString;
        label: z.ZodString;
        parentId: z.ZodOptional<z.ZodString>;
        requires: z.ZodArray<z.ZodString>;
        level: z.ZodNumber;
        score: z.ZodNumber;
    }, z.core.$strict>>;
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
    wiki: z.ZodObject<{
        pages: z.ZodNumber;
        claims: z.ZodNumber;
        claimsMultiSource: z.ZodNumber;
        contradictions: z.ZodNumber;
        sources: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const labAgentGrowthContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/growth";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        agentId: z.ZodString;
        nodes: z.ZodArray<z.ZodObject<{
            nodeId: z.ZodString;
            label: z.ZodString;
            parentId: z.ZodOptional<z.ZodString>;
            requires: z.ZodArray<z.ZodString>;
            level: z.ZodNumber;
            score: z.ZodNumber;
        }, z.core.$strict>>;
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
        wiki: z.ZodObject<{
            pages: z.ZodNumber;
            claims: z.ZodNumber;
            claimsMultiSource: z.ZodNumber;
            contradictions: z.ZodNumber;
            sources: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>;
};
export type AgentConfigSaved = z.infer<typeof AgentConfigSavedSchema>;
export type AgentConfigStale = z.infer<typeof AgentConfigStaleSchema>;
export type AgentSpendQuery = z.infer<typeof AgentSpendQuerySchema>;
export type AgentSpendResponse = z.infer<typeof AgentSpendResponseSchema>;
export type AgentGrowthResponse = z.infer<typeof AgentGrowthResponseSchema>;
//# sourceMappingURL=internal-capability-agent.d.ts.map