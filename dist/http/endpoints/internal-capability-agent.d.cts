import { z } from 'zod';
import { CapabilityOrdinaryConfigWriteSchema, type CapabilityOrdinaryTarget, type CapabilityOrdinaryConfiguration } from "../../capability/ordinary-configuration.cjs";
import { parseCapabilityOrdinaryLifecycle, type CapabilityOrdinaryLifecycleAuthority } from "../../capability/ordinary-lifecycle.cjs";
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
        agent_mismatch: "agent_mismatch";
        not_configured: "not_configured";
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
        models: z.ZodObject<{
            digest: z.ZodString;
            read: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        budget: z.ZodObject<{
            dailyUsd: z.ZodNumber;
            perIngestMaxUsd: z.ZodNumber;
            timezone: z.ZodString;
        }, z.core.$strict>;
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
        models: z.ZodObject<{
            digest: z.ZodString;
            read: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        budget: z.ZodObject<{
            dailyUsd: z.ZodNumber;
            perIngestMaxUsd: z.ZodNumber;
            timezone: z.ZodString;
        }, z.core.$strict>;
        domain: z.ZodString;
        conventions: z.ZodString;
        pageKinds: z.ZodArray<z.ZodString>;
        linkKinds: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
};
export { AGENT_SPEND_MAX_DAYS } from "../../capability/ricerca/spend.cjs";
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
            lab: "lab";
        }>;
        day: z.ZodString;
        spentUsd: z.ZodNumber;
        reservedUsd: z.ZodNumber;
        capUsd: z.ZodNumber;
        calls: z.ZodNumber;
        webCalls: z.ZodNumber;
        budgetStops: z.ZodNumber;
        budgetReachedAt: z.ZodNullable<z.ZodISODateTime>;
        overrunAt: z.ZodNullable<z.ZodISODateTime>;
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
                lab: "lab";
            }>;
            day: z.ZodString;
            spentUsd: z.ZodNumber;
            reservedUsd: z.ZodNumber;
            capUsd: z.ZodNumber;
            calls: z.ZodNumber;
            webCalls: z.ZodNumber;
            budgetStops: z.ZodNumber;
            budgetReachedAt: z.ZodNullable<z.ZodISODateTime>;
            overrunAt: z.ZodNullable<z.ZodISODateTime>;
        }, z.core.$strict>>;
        queuedNow: z.ZodNumber;
    }, z.core.$strict>;
};
/** cap-lab reports the same per-agent spend shape and path as cap-ricerca. */
export declare const labAgentSpendContract: {
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
                lab: "lab";
            }>;
            day: z.ZodString;
            spentUsd: z.ZodNumber;
            reservedUsd: z.ZodNumber;
            capUsd: z.ZodNumber;
            calls: z.ZodNumber;
            webCalls: z.ZodNumber;
            budgetStops: z.ZodNumber;
            budgetReachedAt: z.ZodNullable<z.ZodISODateTime>;
            overrunAt: z.ZodNullable<z.ZodISODateTime>;
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
/** Explicit additive format selection on the existing routes; unknown formats never fall back to legacy. */
export declare function selectCapabilityAgentConfigFormat(method: 'GET' | 'PUT', input: unknown): 'legacy' | 'ordinary-v2' | 'ordinary-lifecycle-v1';
export declare const CapabilityOrdinaryConfigQuerySchema: z.ZodObject<{
    agentId: z.ZodString;
    ownerId: z.ZodString;
    tenantId: z.ZodString;
    format: z.ZodLiteral<"ordinary-v2">;
    capability: z.ZodString;
}, z.core.$strict>;
export declare function parseOrdinaryCapabilityAgentConfigGet(query: unknown, params: unknown, authority: Pick<CapabilityOrdinaryTarget, 'scope' | 'capability'>): z.infer<typeof CapabilityOrdinaryConfigQuerySchema>;
export declare function parseOrdinaryCapabilityAgentConfigPut(body: unknown, params: unknown, authority: CapabilityOrdinaryTarget, currentVersion: number | null, masters?: readonly CapabilityOrdinaryConfiguration[]): z.infer<typeof CapabilityOrdinaryConfigWriteSchema>;
export declare function parseOrdinaryCapabilityLifecyclePut(body: unknown, params: unknown, authority: CapabilityOrdinaryLifecycleAuthority): ReturnType<typeof parseCapabilityOrdinaryLifecycle>;
export declare const ordinaryCapabilityAgentConfigPutContract: {
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        expectedVersion: z.ZodNullable<z.ZodNumber>;
        configuration: z.ZodObject<{
            format: z.ZodLiteral<"ordinary-v2">;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            capability: z.ZodString;
            version: z.ZodNumber;
            parameters: z.ZodArray<z.ZodObject<{
                parameter: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"number">;
                    min: z.ZodOptional<z.ZodNumber>;
                    max: z.ZodOptional<z.ZodNumber>;
                    platformDefault: z.ZodOptional<z.ZodNumber>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"integer">;
                    min: z.ZodOptional<z.ZodNumber>;
                    max: z.ZodOptional<z.ZodNumber>;
                    platformDefault: z.ZodOptional<z.ZodNumber>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"string">;
                    minLength: z.ZodOptional<z.ZodNumber>;
                    maxLength: z.ZodOptional<z.ZodNumber>;
                    pattern: z.ZodOptional<z.ZodString>;
                    platformDefault: z.ZodOptional<z.ZodString>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"boolean">;
                    platformDefault: z.ZodOptional<z.ZodBoolean>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"enum">;
                    options: z.ZodArray<z.ZodObject<{
                        value: z.ZodString;
                        label: z.ZodString;
                    }, z.core.$strict>>;
                    platformDefault: z.ZodOptional<z.ZodString>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"string_list">;
                    minItems: z.ZodOptional<z.ZodNumber>;
                    maxItems: z.ZodOptional<z.ZodNumber>;
                    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        value: z.ZodString;
                        label: z.ZodString;
                    }, z.core.$strict>>>;
                    pattern: z.ZodOptional<z.ZodString>;
                    platformDefault: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>], "type">, z.ZodObject<{
                    optional: z.ZodBoolean;
                    key: z.ZodString;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                    type: z.ZodLiteral<"structured">;
                    schemaKey: z.ZodEnum<{
                        "briefing.feeds": "briefing.feeds";
                        "briefing.categoryWeights": "briefing.categoryWeights";
                        "news.feeds": "news.feeds";
                        "rules.briefing": "rules.briefing";
                        "rules.news": "rules.news";
                        "rules.netatmo": "rules.netatmo";
                        "rules.security": "rules.security";
                        "security.cameraPolicies": "security.cameraPolicies";
                    }>;
                    schemaVersion: z.ZodLiteral<1>;
                    platformDefault: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                        url: z.ZodString;
                        category: z.ZodString;
                        maxPerCategory: z.ZodOptional<z.ZodNumber>;
                        label: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        url: z.ZodString;
                        category: z.ZodString;
                        weight: z.ZodDefault<z.ZodNumber>;
                    }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"briefing">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"skip_section">;
                            section: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_section">;
                            section: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_tone">;
                            tone: z.ZodEnum<{
                                formal: "formal";
                                terse: "terse";
                                friendly: "friendly";
                            }>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_maxWords">;
                            maxWords: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_greeting">;
                            greeting: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_feed_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"skip_feed_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_closing">;
                            text: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_cronSchedule">;
                            cron: z.ZodString;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"news">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"skip_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_hours_back">;
                            hours: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_max_per_category">;
                            category: z.ZodString;
                            max: z.ZodNumber;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"netatmo">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"auto_light_on">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"auto_light_off">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"suppress_automation">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_is_dark_offset">;
                            offset_minutes: z.ZodNumber;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"security">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"set_pir">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_sleep">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_ir">;
                            mode: z.ZodEnum<{
                                on: "on";
                                off: "off";
                                auto: "auto";
                            }>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_floodlight">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"auto_patrol">;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        uid: z.ZodString;
                        name: z.ZodString;
                        role: z.ZodEnum<{
                            primary: "primary";
                            secondary: "secondary";
                        }>;
                        enabled: z.ZodBoolean;
                        ptz_presets: z.ZodObject<{
                            left: z.ZodNumber;
                            center: z.ZodNumber;
                            right: z.ZodNumber;
                        }, z.core.$strict>;
                        siren: z.ZodBoolean;
                        battery: z.ZodBoolean;
                    }, z.core.$strict>>]>>;
                }, z.core.$strict>]>;
                origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"platform_default">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"agent_override">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"needs_choice">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"master">;
                    source: z.ZodObject<{
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                        masterId: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">;
                value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                    url: z.ZodString;
                    category: z.ZodString;
                    maxPerCategory: z.ZodOptional<z.ZodNumber>;
                    label: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    url: z.ZodString;
                    category: z.ZodString;
                    weight: z.ZodDefault<z.ZodNumber>;
                }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"briefing">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"skip_section">;
                        section: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_section">;
                        section: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_tone">;
                        tone: z.ZodEnum<{
                            formal: "formal";
                            terse: "terse";
                            friendly: "friendly";
                        }>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_maxWords">;
                        maxWords: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_greeting">;
                        greeting: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_feed_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"skip_feed_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_closing">;
                        text: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_cronSchedule">;
                        cron: z.ZodString;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"news">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"skip_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_hours_back">;
                        hours: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_max_per_category">;
                        category: z.ZodString;
                        max: z.ZodNumber;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"netatmo">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"auto_light_on">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"auto_light_off">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"suppress_automation">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_is_dark_offset">;
                        offset_minutes: z.ZodNumber;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"security">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"set_pir">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_sleep">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_ir">;
                        mode: z.ZodEnum<{
                            on: "on";
                            off: "off";
                            auto: "auto";
                        }>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_floodlight">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"auto_patrol">;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    uid: z.ZodString;
                    name: z.ZodString;
                    role: z.ZodEnum<{
                        primary: "primary";
                        secondary: "secondary";
                    }>;
                    enabled: z.ZodBoolean;
                    ptz_presets: z.ZodObject<{
                        left: z.ZodNumber;
                        center: z.ZodNumber;
                        right: z.ZodNumber;
                    }, z.core.$strict>;
                    siren: z.ZodBoolean;
                    battery: z.ZodBoolean;
                }, z.core.$strict>>]>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        capability: z.ZodString;
        desired: z.ZodNullable<z.ZodObject<{
            format: z.ZodLiteral<"ordinary-v2">;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            capability: z.ZodString;
            version: z.ZodNumber;
            parameters: z.ZodArray<z.ZodObject<{
                parameter: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"number">;
                    min: z.ZodOptional<z.ZodNumber>;
                    max: z.ZodOptional<z.ZodNumber>;
                    platformDefault: z.ZodOptional<z.ZodNumber>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"integer">;
                    min: z.ZodOptional<z.ZodNumber>;
                    max: z.ZodOptional<z.ZodNumber>;
                    platformDefault: z.ZodOptional<z.ZodNumber>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"string">;
                    minLength: z.ZodOptional<z.ZodNumber>;
                    maxLength: z.ZodOptional<z.ZodNumber>;
                    pattern: z.ZodOptional<z.ZodString>;
                    platformDefault: z.ZodOptional<z.ZodString>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"boolean">;
                    platformDefault: z.ZodOptional<z.ZodBoolean>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"enum">;
                    options: z.ZodArray<z.ZodObject<{
                        value: z.ZodString;
                        label: z.ZodString;
                    }, z.core.$strict>>;
                    platformDefault: z.ZodOptional<z.ZodString>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"string_list">;
                    minItems: z.ZodOptional<z.ZodNumber>;
                    maxItems: z.ZodOptional<z.ZodNumber>;
                    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        value: z.ZodString;
                        label: z.ZodString;
                    }, z.core.$strict>>>;
                    pattern: z.ZodOptional<z.ZodString>;
                    platformDefault: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>], "type">, z.ZodObject<{
                    optional: z.ZodBoolean;
                    key: z.ZodString;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                    type: z.ZodLiteral<"structured">;
                    schemaKey: z.ZodEnum<{
                        "briefing.feeds": "briefing.feeds";
                        "briefing.categoryWeights": "briefing.categoryWeights";
                        "news.feeds": "news.feeds";
                        "rules.briefing": "rules.briefing";
                        "rules.news": "rules.news";
                        "rules.netatmo": "rules.netatmo";
                        "rules.security": "rules.security";
                        "security.cameraPolicies": "security.cameraPolicies";
                    }>;
                    schemaVersion: z.ZodLiteral<1>;
                    platformDefault: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                        url: z.ZodString;
                        category: z.ZodString;
                        maxPerCategory: z.ZodOptional<z.ZodNumber>;
                        label: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        url: z.ZodString;
                        category: z.ZodString;
                        weight: z.ZodDefault<z.ZodNumber>;
                    }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"briefing">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"skip_section">;
                            section: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_section">;
                            section: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_tone">;
                            tone: z.ZodEnum<{
                                formal: "formal";
                                terse: "terse";
                                friendly: "friendly";
                            }>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_maxWords">;
                            maxWords: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_greeting">;
                            greeting: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_feed_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"skip_feed_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_closing">;
                            text: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_cronSchedule">;
                            cron: z.ZodString;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"news">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"skip_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_hours_back">;
                            hours: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_max_per_category">;
                            category: z.ZodString;
                            max: z.ZodNumber;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"netatmo">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"auto_light_on">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"auto_light_off">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"suppress_automation">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_is_dark_offset">;
                            offset_minutes: z.ZodNumber;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"security">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"set_pir">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_sleep">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_ir">;
                            mode: z.ZodEnum<{
                                on: "on";
                                off: "off";
                                auto: "auto";
                            }>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_floodlight">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"auto_patrol">;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        uid: z.ZodString;
                        name: z.ZodString;
                        role: z.ZodEnum<{
                            primary: "primary";
                            secondary: "secondary";
                        }>;
                        enabled: z.ZodBoolean;
                        ptz_presets: z.ZodObject<{
                            left: z.ZodNumber;
                            center: z.ZodNumber;
                            right: z.ZodNumber;
                        }, z.core.$strict>;
                        siren: z.ZodBoolean;
                        battery: z.ZodBoolean;
                    }, z.core.$strict>>]>>;
                }, z.core.$strict>]>;
                origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"platform_default">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"agent_override">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"needs_choice">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"master">;
                    source: z.ZodObject<{
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                        masterId: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">;
                value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                    url: z.ZodString;
                    category: z.ZodString;
                    maxPerCategory: z.ZodOptional<z.ZodNumber>;
                    label: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    url: z.ZodString;
                    category: z.ZodString;
                    weight: z.ZodDefault<z.ZodNumber>;
                }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"briefing">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"skip_section">;
                        section: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_section">;
                        section: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_tone">;
                        tone: z.ZodEnum<{
                            formal: "formal";
                            terse: "terse";
                            friendly: "friendly";
                        }>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_maxWords">;
                        maxWords: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_greeting">;
                        greeting: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_feed_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"skip_feed_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_closing">;
                        text: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_cronSchedule">;
                        cron: z.ZodString;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"news">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"skip_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_hours_back">;
                        hours: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_max_per_category">;
                        category: z.ZodString;
                        max: z.ZodNumber;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"netatmo">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"auto_light_on">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"auto_light_off">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"suppress_automation">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_is_dark_offset">;
                        offset_minutes: z.ZodNumber;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"security">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"set_pir">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_sleep">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_ir">;
                        mode: z.ZodEnum<{
                            on: "on";
                            off: "off";
                            auto: "auto";
                        }>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_floodlight">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"auto_patrol">;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    uid: z.ZodString;
                    name: z.ZodString;
                    role: z.ZodEnum<{
                        primary: "primary";
                        secondary: "secondary";
                    }>;
                    enabled: z.ZodBoolean;
                    ptz_presets: z.ZodObject<{
                        left: z.ZodNumber;
                        center: z.ZodNumber;
                        right: z.ZodNumber;
                    }, z.core.$strict>;
                    siren: z.ZodBoolean;
                    battery: z.ZodBoolean;
                }, z.core.$strict>>]>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        runtimeState: z.ZodEnum<{
            unknown: "unknown";
            loaded: "loaded";
            unloaded: "unloaded";
        }>;
        applied: z.ZodNullable<z.ZodObject<{
            configuration: z.ZodObject<{
                format: z.ZodLiteral<"ordinary-v2">;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                capability: z.ZodString;
                version: z.ZodNumber;
                parameters: z.ZodArray<z.ZodObject<{
                    parameter: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"number">;
                        min: z.ZodOptional<z.ZodNumber>;
                        max: z.ZodOptional<z.ZodNumber>;
                        platformDefault: z.ZodOptional<z.ZodNumber>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"integer">;
                        min: z.ZodOptional<z.ZodNumber>;
                        max: z.ZodOptional<z.ZodNumber>;
                        platformDefault: z.ZodOptional<z.ZodNumber>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"string">;
                        minLength: z.ZodOptional<z.ZodNumber>;
                        maxLength: z.ZodOptional<z.ZodNumber>;
                        pattern: z.ZodOptional<z.ZodString>;
                        platformDefault: z.ZodOptional<z.ZodString>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"boolean">;
                        platformDefault: z.ZodOptional<z.ZodBoolean>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"enum">;
                        options: z.ZodArray<z.ZodObject<{
                            value: z.ZodString;
                            label: z.ZodString;
                        }, z.core.$strict>>;
                        platformDefault: z.ZodOptional<z.ZodString>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"string_list">;
                        minItems: z.ZodOptional<z.ZodNumber>;
                        maxItems: z.ZodOptional<z.ZodNumber>;
                        options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            value: z.ZodString;
                            label: z.ZodString;
                        }, z.core.$strict>>>;
                        pattern: z.ZodOptional<z.ZodString>;
                        platformDefault: z.ZodOptional<z.ZodArray<z.ZodString>>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>], "type">, z.ZodObject<{
                        optional: z.ZodBoolean;
                        key: z.ZodString;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                        type: z.ZodLiteral<"structured">;
                        schemaKey: z.ZodEnum<{
                            "briefing.feeds": "briefing.feeds";
                            "briefing.categoryWeights": "briefing.categoryWeights";
                            "news.feeds": "news.feeds";
                            "rules.briefing": "rules.briefing";
                            "rules.news": "rules.news";
                            "rules.netatmo": "rules.netatmo";
                            "rules.security": "rules.security";
                            "security.cameraPolicies": "security.cameraPolicies";
                        }>;
                        schemaVersion: z.ZodLiteral<1>;
                        platformDefault: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                            url: z.ZodString;
                            category: z.ZodString;
                            maxPerCategory: z.ZodOptional<z.ZodNumber>;
                            label: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            url: z.ZodString;
                            category: z.ZodString;
                            weight: z.ZodDefault<z.ZodNumber>;
                        }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"briefing">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"skip_section">;
                                section: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_section">;
                                section: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_tone">;
                                tone: z.ZodEnum<{
                                    formal: "formal";
                                    terse: "terse";
                                    friendly: "friendly";
                                }>;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_maxWords">;
                                maxWords: z.ZodNumber;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_greeting">;
                                greeting: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_feed_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"skip_feed_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_closing">;
                                text: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_cronSchedule">;
                                cron: z.ZodString;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"news">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"skip_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_hours_back">;
                                hours: z.ZodNumber;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_max_per_category">;
                                category: z.ZodString;
                                max: z.ZodNumber;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"netatmo">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"auto_light_on">;
                                module_id: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"auto_light_off">;
                                module_id: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"suppress_automation">;
                                module_id: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_is_dark_offset">;
                                offset_minutes: z.ZodNumber;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"security">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"set_pir">;
                                enabled: z.ZodBoolean;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_sleep">;
                                enabled: z.ZodBoolean;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_ir">;
                                mode: z.ZodEnum<{
                                    on: "on";
                                    off: "off";
                                    auto: "auto";
                                }>;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_floodlight">;
                                enabled: z.ZodBoolean;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"auto_patrol">;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            uid: z.ZodString;
                            name: z.ZodString;
                            role: z.ZodEnum<{
                                primary: "primary";
                                secondary: "secondary";
                            }>;
                            enabled: z.ZodBoolean;
                            ptz_presets: z.ZodObject<{
                                left: z.ZodNumber;
                                center: z.ZodNumber;
                                right: z.ZodNumber;
                            }, z.core.$strict>;
                            siren: z.ZodBoolean;
                            battery: z.ZodBoolean;
                        }, z.core.$strict>>]>>;
                    }, z.core.$strict>]>;
                    origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"platform_default">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"agent_override">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"needs_choice">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"master">;
                        source: z.ZodObject<{
                            ownerId: z.ZodString;
                            tenantId: z.ZodString;
                            masterId: z.ZodString;
                            version: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>], "kind">;
                    value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                        url: z.ZodString;
                        category: z.ZodString;
                        maxPerCategory: z.ZodOptional<z.ZodNumber>;
                        label: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        url: z.ZodString;
                        category: z.ZodString;
                        weight: z.ZodDefault<z.ZodNumber>;
                    }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"briefing">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"skip_section">;
                            section: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_section">;
                            section: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_tone">;
                            tone: z.ZodEnum<{
                                formal: "formal";
                                terse: "terse";
                                friendly: "friendly";
                            }>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_maxWords">;
                            maxWords: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_greeting">;
                            greeting: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_feed_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"skip_feed_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_closing">;
                            text: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_cronSchedule">;
                            cron: z.ZodString;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"news">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"skip_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_hours_back">;
                            hours: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_max_per_category">;
                            category: z.ZodString;
                            max: z.ZodNumber;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"netatmo">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"auto_light_on">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"auto_light_off">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"suppress_automation">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_is_dark_offset">;
                            offset_minutes: z.ZodNumber;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"security">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"set_pir">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_sleep">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_ir">;
                            mode: z.ZodEnum<{
                                on: "on";
                                off: "off";
                                auto: "auto";
                            }>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_floodlight">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"auto_patrol">;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        uid: z.ZodString;
                        name: z.ZodString;
                        role: z.ZodEnum<{
                            primary: "primary";
                            secondary: "secondary";
                        }>;
                        enabled: z.ZodBoolean;
                        ptz_presets: z.ZodObject<{
                            left: z.ZodNumber;
                            center: z.ZodNumber;
                            right: z.ZodNumber;
                        }, z.core.$strict>;
                        siren: z.ZodBoolean;
                        battery: z.ZodBoolean;
                    }, z.core.$strict>>]>>;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            loadedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
        failed: z.ZodNullable<z.ZodObject<{
            version: z.ZodNumber;
            reason: z.ZodObject<{
                code: z.ZodEnum<{
                    unknown: "unknown";
                    "not-loaded": "not-loaded";
                    "load-failed": "load-failed";
                    "validation-failed": "validation-failed";
                    timeout: "timeout";
                    "source-unavailable": "source-unavailable";
                    "shared-runtime": "shared-runtime";
                    "externally-owned": "externally-owned";
                    "not-supported": "not-supported";
                    "in-progress": "in-progress";
                }>;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        effectiveParameters: z.ZodArray<z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            capability: z.ZodString;
            key: z.ZodString;
            value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                url: z.ZodString;
                category: z.ZodString;
                maxPerCategory: z.ZodOptional<z.ZodNumber>;
                label: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                url: z.ZodString;
                category: z.ZodString;
                weight: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                skill: z.ZodLiteral<"briefing">;
                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"skip_section">;
                    section: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"add_section">;
                    section: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_tone">;
                    tone: z.ZodEnum<{
                        formal: "formal";
                        terse: "terse";
                        friendly: "friendly";
                    }>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_maxWords">;
                    maxWords: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_greeting">;
                    greeting: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"add_feed_category">;
                    category: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"skip_feed_category">;
                    category: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"add_closing">;
                    text: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_cronSchedule">;
                    cron: z.ZodString;
                }, z.core.$strict>], "type">;
                priority: z.ZodNumber;
                created_by: z.ZodEnum<{
                    user: "user";
                    operator: "operator";
                }>;
                created_at: z.ZodString;
                description: z.ZodString;
                locked: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                skill: z.ZodLiteral<"news">;
                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"skip_category">;
                    category: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"add_category">;
                    category: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_hours_back">;
                    hours: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_max_per_category">;
                    category: z.ZodString;
                    max: z.ZodNumber;
                }, z.core.$strict>], "type">;
                priority: z.ZodNumber;
                created_by: z.ZodEnum<{
                    user: "user";
                    operator: "operator";
                }>;
                created_at: z.ZodString;
                description: z.ZodString;
                locked: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                skill: z.ZodLiteral<"netatmo">;
                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"auto_light_on">;
                    module_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"auto_light_off">;
                    module_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"suppress_automation">;
                    module_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_is_dark_offset">;
                    offset_minutes: z.ZodNumber;
                }, z.core.$strict>], "type">;
                priority: z.ZodNumber;
                created_by: z.ZodEnum<{
                    user: "user";
                    operator: "operator";
                }>;
                created_at: z.ZodString;
                description: z.ZodString;
                locked: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                skill: z.ZodLiteral<"security">;
                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"set_pir">;
                    enabled: z.ZodBoolean;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_sleep">;
                    enabled: z.ZodBoolean;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_ir">;
                    mode: z.ZodEnum<{
                        on: "on";
                        off: "off";
                        auto: "auto";
                    }>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_floodlight">;
                    enabled: z.ZodBoolean;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"auto_patrol">;
                }, z.core.$strict>], "type">;
                priority: z.ZodNumber;
                created_by: z.ZodEnum<{
                    user: "user";
                    operator: "operator";
                }>;
                created_at: z.ZodString;
                description: z.ZodString;
                locked: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                uid: z.ZodString;
                name: z.ZodString;
                role: z.ZodEnum<{
                    primary: "primary";
                    secondary: "secondary";
                }>;
                enabled: z.ZodBoolean;
                ptz_presets: z.ZodObject<{
                    left: z.ZodNumber;
                    center: z.ZodNumber;
                    right: z.ZodNumber;
                }, z.core.$strict>;
                siren: z.ZodBoolean;
                battery: z.ZodBoolean;
            }, z.core.$strict>>]>>;
            mode: z.ZodEnum<{
                immediate: "immediate";
                next_apply: "next_apply";
            }>;
            sourceConfigVersion: z.ZodNumber;
            observedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly method: "PUT";
    readonly path: "/internal/capability/agents/:agentId/config";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
};
export declare const ordinaryCapabilityAgentConfigGetContract: {
    readonly querySchema: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        format: z.ZodLiteral<"ordinary-v2">;
        capability: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        capability: z.ZodString;
        desired: z.ZodNullable<z.ZodObject<{
            format: z.ZodLiteral<"ordinary-v2">;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            capability: z.ZodString;
            version: z.ZodNumber;
            parameters: z.ZodArray<z.ZodObject<{
                parameter: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"number">;
                    min: z.ZodOptional<z.ZodNumber>;
                    max: z.ZodOptional<z.ZodNumber>;
                    platformDefault: z.ZodOptional<z.ZodNumber>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"integer">;
                    min: z.ZodOptional<z.ZodNumber>;
                    max: z.ZodOptional<z.ZodNumber>;
                    platformDefault: z.ZodOptional<z.ZodNumber>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"string">;
                    minLength: z.ZodOptional<z.ZodNumber>;
                    maxLength: z.ZodOptional<z.ZodNumber>;
                    pattern: z.ZodOptional<z.ZodString>;
                    platformDefault: z.ZodOptional<z.ZodString>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"boolean">;
                    platformDefault: z.ZodOptional<z.ZodBoolean>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"enum">;
                    options: z.ZodArray<z.ZodObject<{
                        value: z.ZodString;
                        label: z.ZodString;
                    }, z.core.$strict>>;
                    platformDefault: z.ZodOptional<z.ZodString>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"string_list">;
                    minItems: z.ZodOptional<z.ZodNumber>;
                    maxItems: z.ZodOptional<z.ZodNumber>;
                    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        value: z.ZodString;
                        label: z.ZodString;
                    }, z.core.$strict>>>;
                    pattern: z.ZodOptional<z.ZodString>;
                    platformDefault: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>], "type">, z.ZodObject<{
                    optional: z.ZodBoolean;
                    key: z.ZodString;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                    type: z.ZodLiteral<"structured">;
                    schemaKey: z.ZodEnum<{
                        "briefing.feeds": "briefing.feeds";
                        "briefing.categoryWeights": "briefing.categoryWeights";
                        "news.feeds": "news.feeds";
                        "rules.briefing": "rules.briefing";
                        "rules.news": "rules.news";
                        "rules.netatmo": "rules.netatmo";
                        "rules.security": "rules.security";
                        "security.cameraPolicies": "security.cameraPolicies";
                    }>;
                    schemaVersion: z.ZodLiteral<1>;
                    platformDefault: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                        url: z.ZodString;
                        category: z.ZodString;
                        maxPerCategory: z.ZodOptional<z.ZodNumber>;
                        label: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        url: z.ZodString;
                        category: z.ZodString;
                        weight: z.ZodDefault<z.ZodNumber>;
                    }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"briefing">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"skip_section">;
                            section: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_section">;
                            section: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_tone">;
                            tone: z.ZodEnum<{
                                formal: "formal";
                                terse: "terse";
                                friendly: "friendly";
                            }>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_maxWords">;
                            maxWords: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_greeting">;
                            greeting: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_feed_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"skip_feed_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_closing">;
                            text: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_cronSchedule">;
                            cron: z.ZodString;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"news">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"skip_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_hours_back">;
                            hours: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_max_per_category">;
                            category: z.ZodString;
                            max: z.ZodNumber;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"netatmo">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"auto_light_on">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"auto_light_off">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"suppress_automation">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_is_dark_offset">;
                            offset_minutes: z.ZodNumber;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"security">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"set_pir">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_sleep">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_ir">;
                            mode: z.ZodEnum<{
                                on: "on";
                                off: "off";
                                auto: "auto";
                            }>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_floodlight">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"auto_patrol">;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        uid: z.ZodString;
                        name: z.ZodString;
                        role: z.ZodEnum<{
                            primary: "primary";
                            secondary: "secondary";
                        }>;
                        enabled: z.ZodBoolean;
                        ptz_presets: z.ZodObject<{
                            left: z.ZodNumber;
                            center: z.ZodNumber;
                            right: z.ZodNumber;
                        }, z.core.$strict>;
                        siren: z.ZodBoolean;
                        battery: z.ZodBoolean;
                    }, z.core.$strict>>]>>;
                }, z.core.$strict>]>;
                origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"platform_default">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"agent_override">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"needs_choice">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"master">;
                    source: z.ZodObject<{
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                        masterId: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">;
                value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                    url: z.ZodString;
                    category: z.ZodString;
                    maxPerCategory: z.ZodOptional<z.ZodNumber>;
                    label: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    url: z.ZodString;
                    category: z.ZodString;
                    weight: z.ZodDefault<z.ZodNumber>;
                }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"briefing">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"skip_section">;
                        section: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_section">;
                        section: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_tone">;
                        tone: z.ZodEnum<{
                            formal: "formal";
                            terse: "terse";
                            friendly: "friendly";
                        }>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_maxWords">;
                        maxWords: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_greeting">;
                        greeting: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_feed_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"skip_feed_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_closing">;
                        text: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_cronSchedule">;
                        cron: z.ZodString;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"news">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"skip_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_hours_back">;
                        hours: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_max_per_category">;
                        category: z.ZodString;
                        max: z.ZodNumber;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"netatmo">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"auto_light_on">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"auto_light_off">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"suppress_automation">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_is_dark_offset">;
                        offset_minutes: z.ZodNumber;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"security">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"set_pir">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_sleep">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_ir">;
                        mode: z.ZodEnum<{
                            on: "on";
                            off: "off";
                            auto: "auto";
                        }>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_floodlight">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"auto_patrol">;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    uid: z.ZodString;
                    name: z.ZodString;
                    role: z.ZodEnum<{
                        primary: "primary";
                        secondary: "secondary";
                    }>;
                    enabled: z.ZodBoolean;
                    ptz_presets: z.ZodObject<{
                        left: z.ZodNumber;
                        center: z.ZodNumber;
                        right: z.ZodNumber;
                    }, z.core.$strict>;
                    siren: z.ZodBoolean;
                    battery: z.ZodBoolean;
                }, z.core.$strict>>]>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        runtimeState: z.ZodEnum<{
            unknown: "unknown";
            loaded: "loaded";
            unloaded: "unloaded";
        }>;
        applied: z.ZodNullable<z.ZodObject<{
            configuration: z.ZodObject<{
                format: z.ZodLiteral<"ordinary-v2">;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                capability: z.ZodString;
                version: z.ZodNumber;
                parameters: z.ZodArray<z.ZodObject<{
                    parameter: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"number">;
                        min: z.ZodOptional<z.ZodNumber>;
                        max: z.ZodOptional<z.ZodNumber>;
                        platformDefault: z.ZodOptional<z.ZodNumber>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"integer">;
                        min: z.ZodOptional<z.ZodNumber>;
                        max: z.ZodOptional<z.ZodNumber>;
                        platformDefault: z.ZodOptional<z.ZodNumber>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"string">;
                        minLength: z.ZodOptional<z.ZodNumber>;
                        maxLength: z.ZodOptional<z.ZodNumber>;
                        pattern: z.ZodOptional<z.ZodString>;
                        platformDefault: z.ZodOptional<z.ZodString>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"boolean">;
                        platformDefault: z.ZodOptional<z.ZodBoolean>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"enum">;
                        options: z.ZodArray<z.ZodObject<{
                            value: z.ZodString;
                            label: z.ZodString;
                        }, z.core.$strict>>;
                        platformDefault: z.ZodOptional<z.ZodString>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"string_list">;
                        minItems: z.ZodOptional<z.ZodNumber>;
                        maxItems: z.ZodOptional<z.ZodNumber>;
                        options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            value: z.ZodString;
                            label: z.ZodString;
                        }, z.core.$strict>>>;
                        pattern: z.ZodOptional<z.ZodString>;
                        platformDefault: z.ZodOptional<z.ZodArray<z.ZodString>>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>], "type">, z.ZodObject<{
                        optional: z.ZodBoolean;
                        key: z.ZodString;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                        type: z.ZodLiteral<"structured">;
                        schemaKey: z.ZodEnum<{
                            "briefing.feeds": "briefing.feeds";
                            "briefing.categoryWeights": "briefing.categoryWeights";
                            "news.feeds": "news.feeds";
                            "rules.briefing": "rules.briefing";
                            "rules.news": "rules.news";
                            "rules.netatmo": "rules.netatmo";
                            "rules.security": "rules.security";
                            "security.cameraPolicies": "security.cameraPolicies";
                        }>;
                        schemaVersion: z.ZodLiteral<1>;
                        platformDefault: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                            url: z.ZodString;
                            category: z.ZodString;
                            maxPerCategory: z.ZodOptional<z.ZodNumber>;
                            label: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            url: z.ZodString;
                            category: z.ZodString;
                            weight: z.ZodDefault<z.ZodNumber>;
                        }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"briefing">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"skip_section">;
                                section: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_section">;
                                section: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_tone">;
                                tone: z.ZodEnum<{
                                    formal: "formal";
                                    terse: "terse";
                                    friendly: "friendly";
                                }>;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_maxWords">;
                                maxWords: z.ZodNumber;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_greeting">;
                                greeting: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_feed_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"skip_feed_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_closing">;
                                text: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_cronSchedule">;
                                cron: z.ZodString;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"news">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"skip_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_hours_back">;
                                hours: z.ZodNumber;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_max_per_category">;
                                category: z.ZodString;
                                max: z.ZodNumber;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"netatmo">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"auto_light_on">;
                                module_id: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"auto_light_off">;
                                module_id: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"suppress_automation">;
                                module_id: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_is_dark_offset">;
                                offset_minutes: z.ZodNumber;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"security">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"set_pir">;
                                enabled: z.ZodBoolean;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_sleep">;
                                enabled: z.ZodBoolean;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_ir">;
                                mode: z.ZodEnum<{
                                    on: "on";
                                    off: "off";
                                    auto: "auto";
                                }>;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_floodlight">;
                                enabled: z.ZodBoolean;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"auto_patrol">;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            uid: z.ZodString;
                            name: z.ZodString;
                            role: z.ZodEnum<{
                                primary: "primary";
                                secondary: "secondary";
                            }>;
                            enabled: z.ZodBoolean;
                            ptz_presets: z.ZodObject<{
                                left: z.ZodNumber;
                                center: z.ZodNumber;
                                right: z.ZodNumber;
                            }, z.core.$strict>;
                            siren: z.ZodBoolean;
                            battery: z.ZodBoolean;
                        }, z.core.$strict>>]>>;
                    }, z.core.$strict>]>;
                    origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"platform_default">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"agent_override">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"needs_choice">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"master">;
                        source: z.ZodObject<{
                            ownerId: z.ZodString;
                            tenantId: z.ZodString;
                            masterId: z.ZodString;
                            version: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>], "kind">;
                    value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                        url: z.ZodString;
                        category: z.ZodString;
                        maxPerCategory: z.ZodOptional<z.ZodNumber>;
                        label: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        url: z.ZodString;
                        category: z.ZodString;
                        weight: z.ZodDefault<z.ZodNumber>;
                    }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"briefing">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"skip_section">;
                            section: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_section">;
                            section: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_tone">;
                            tone: z.ZodEnum<{
                                formal: "formal";
                                terse: "terse";
                                friendly: "friendly";
                            }>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_maxWords">;
                            maxWords: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_greeting">;
                            greeting: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_feed_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"skip_feed_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_closing">;
                            text: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_cronSchedule">;
                            cron: z.ZodString;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"news">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"skip_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_hours_back">;
                            hours: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_max_per_category">;
                            category: z.ZodString;
                            max: z.ZodNumber;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"netatmo">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"auto_light_on">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"auto_light_off">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"suppress_automation">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_is_dark_offset">;
                            offset_minutes: z.ZodNumber;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"security">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"set_pir">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_sleep">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_ir">;
                            mode: z.ZodEnum<{
                                on: "on";
                                off: "off";
                                auto: "auto";
                            }>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_floodlight">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"auto_patrol">;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        uid: z.ZodString;
                        name: z.ZodString;
                        role: z.ZodEnum<{
                            primary: "primary";
                            secondary: "secondary";
                        }>;
                        enabled: z.ZodBoolean;
                        ptz_presets: z.ZodObject<{
                            left: z.ZodNumber;
                            center: z.ZodNumber;
                            right: z.ZodNumber;
                        }, z.core.$strict>;
                        siren: z.ZodBoolean;
                        battery: z.ZodBoolean;
                    }, z.core.$strict>>]>>;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            loadedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
        failed: z.ZodNullable<z.ZodObject<{
            version: z.ZodNumber;
            reason: z.ZodObject<{
                code: z.ZodEnum<{
                    unknown: "unknown";
                    "not-loaded": "not-loaded";
                    "load-failed": "load-failed";
                    "validation-failed": "validation-failed";
                    timeout: "timeout";
                    "source-unavailable": "source-unavailable";
                    "shared-runtime": "shared-runtime";
                    "externally-owned": "externally-owned";
                    "not-supported": "not-supported";
                    "in-progress": "in-progress";
                }>;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        effectiveParameters: z.ZodArray<z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            capability: z.ZodString;
            key: z.ZodString;
            value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                url: z.ZodString;
                category: z.ZodString;
                maxPerCategory: z.ZodOptional<z.ZodNumber>;
                label: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                url: z.ZodString;
                category: z.ZodString;
                weight: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                skill: z.ZodLiteral<"briefing">;
                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"skip_section">;
                    section: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"add_section">;
                    section: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_tone">;
                    tone: z.ZodEnum<{
                        formal: "formal";
                        terse: "terse";
                        friendly: "friendly";
                    }>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_maxWords">;
                    maxWords: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_greeting">;
                    greeting: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"add_feed_category">;
                    category: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"skip_feed_category">;
                    category: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"add_closing">;
                    text: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_cronSchedule">;
                    cron: z.ZodString;
                }, z.core.$strict>], "type">;
                priority: z.ZodNumber;
                created_by: z.ZodEnum<{
                    user: "user";
                    operator: "operator";
                }>;
                created_at: z.ZodString;
                description: z.ZodString;
                locked: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                skill: z.ZodLiteral<"news">;
                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"skip_category">;
                    category: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"add_category">;
                    category: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_hours_back">;
                    hours: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_max_per_category">;
                    category: z.ZodString;
                    max: z.ZodNumber;
                }, z.core.$strict>], "type">;
                priority: z.ZodNumber;
                created_by: z.ZodEnum<{
                    user: "user";
                    operator: "operator";
                }>;
                created_at: z.ZodString;
                description: z.ZodString;
                locked: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                skill: z.ZodLiteral<"netatmo">;
                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"auto_light_on">;
                    module_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"auto_light_off">;
                    module_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"suppress_automation">;
                    module_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_is_dark_offset">;
                    offset_minutes: z.ZodNumber;
                }, z.core.$strict>], "type">;
                priority: z.ZodNumber;
                created_by: z.ZodEnum<{
                    user: "user";
                    operator: "operator";
                }>;
                created_at: z.ZodString;
                description: z.ZodString;
                locked: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                skill: z.ZodLiteral<"security">;
                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"set_pir">;
                    enabled: z.ZodBoolean;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_sleep">;
                    enabled: z.ZodBoolean;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_ir">;
                    mode: z.ZodEnum<{
                        on: "on";
                        off: "off";
                        auto: "auto";
                    }>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"set_floodlight">;
                    enabled: z.ZodBoolean;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"auto_patrol">;
                }, z.core.$strict>], "type">;
                priority: z.ZodNumber;
                created_by: z.ZodEnum<{
                    user: "user";
                    operator: "operator";
                }>;
                created_at: z.ZodString;
                description: z.ZodString;
                locked: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                uid: z.ZodString;
                name: z.ZodString;
                role: z.ZodEnum<{
                    primary: "primary";
                    secondary: "secondary";
                }>;
                enabled: z.ZodBoolean;
                ptz_presets: z.ZodObject<{
                    left: z.ZodNumber;
                    center: z.ZodNumber;
                    right: z.ZodNumber;
                }, z.core.$strict>;
                siren: z.ZodBoolean;
                battery: z.ZodBoolean;
            }, z.core.$strict>>]>>;
            mode: z.ZodEnum<{
                immediate: "immediate";
                next_apply: "next_apply";
            }>;
            sourceConfigVersion: z.ZodNumber;
            observedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/config";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
};
export declare const ordinaryCapabilityLifecyclePutContract: {
    readonly bodySchema: z.ZodObject<{
        format: z.ZodLiteral<"ordinary-lifecycle-v1">;
        requestId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        capability: z.ZodString;
        phase: z.ZodEnum<{
            prepare: "prepare";
            suspend: "suspend";
            activate: "activate";
            rollback: "rollback";
        }>;
        transition: z.ZodObject<{
            from: z.ZodNullable<z.ZodObject<{
                appliedVersion: z.ZodNumber;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            to: z.ZodObject<{
                appliedVersion: z.ZodNumber;
                sha256: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>;
        targetMembership: z.ZodEnum<{
            enabled: "enabled";
            disabled: "disabled";
            removed: "removed";
        }>;
        operation: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            action: z.ZodLiteral<"apply-config">;
            execution: z.ZodEnum<{
                stopped: "stopped";
                running: "running";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            action: z.ZodLiteral<"reload">;
            execution: z.ZodEnum<{
                stopped: "stopped";
                running: "running";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            action: z.ZodLiteral<"start">;
            execution: z.ZodLiteral<"running">;
        }, z.core.$strict>, z.ZodObject<{
            action: z.ZodLiteral<"stop">;
            execution: z.ZodLiteral<"stopped">;
        }, z.core.$strict>, z.ZodObject<{
            action: z.ZodLiteral<"restart">;
            execution: z.ZodLiteral<"running">;
        }, z.core.$strict>], "action">>;
        configuration: z.ZodOptional<z.ZodObject<{
            format: z.ZodLiteral<"ordinary-v2">;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            capability: z.ZodString;
            version: z.ZodNumber;
            parameters: z.ZodArray<z.ZodObject<{
                parameter: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"number">;
                    min: z.ZodOptional<z.ZodNumber>;
                    max: z.ZodOptional<z.ZodNumber>;
                    platformDefault: z.ZodOptional<z.ZodNumber>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"integer">;
                    min: z.ZodOptional<z.ZodNumber>;
                    max: z.ZodOptional<z.ZodNumber>;
                    platformDefault: z.ZodOptional<z.ZodNumber>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"string">;
                    minLength: z.ZodOptional<z.ZodNumber>;
                    maxLength: z.ZodOptional<z.ZodNumber>;
                    pattern: z.ZodOptional<z.ZodString>;
                    platformDefault: z.ZodOptional<z.ZodString>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"boolean">;
                    platformDefault: z.ZodOptional<z.ZodBoolean>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"enum">;
                    options: z.ZodArray<z.ZodObject<{
                        value: z.ZodString;
                        label: z.ZodString;
                    }, z.core.$strict>>;
                    platformDefault: z.ZodOptional<z.ZodString>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"string_list">;
                    minItems: z.ZodOptional<z.ZodNumber>;
                    maxItems: z.ZodOptional<z.ZodNumber>;
                    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        value: z.ZodString;
                        label: z.ZodString;
                    }, z.core.$strict>>>;
                    pattern: z.ZodOptional<z.ZodString>;
                    platformDefault: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>], "type">, z.ZodObject<{
                    optional: z.ZodBoolean;
                    key: z.ZodString;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                    type: z.ZodLiteral<"structured">;
                    schemaKey: z.ZodEnum<{
                        "briefing.feeds": "briefing.feeds";
                        "briefing.categoryWeights": "briefing.categoryWeights";
                        "news.feeds": "news.feeds";
                        "rules.briefing": "rules.briefing";
                        "rules.news": "rules.news";
                        "rules.netatmo": "rules.netatmo";
                        "rules.security": "rules.security";
                        "security.cameraPolicies": "security.cameraPolicies";
                    }>;
                    schemaVersion: z.ZodLiteral<1>;
                    platformDefault: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                        url: z.ZodString;
                        category: z.ZodString;
                        maxPerCategory: z.ZodOptional<z.ZodNumber>;
                        label: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        url: z.ZodString;
                        category: z.ZodString;
                        weight: z.ZodDefault<z.ZodNumber>;
                    }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"briefing">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"skip_section">;
                            section: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_section">;
                            section: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_tone">;
                            tone: z.ZodEnum<{
                                formal: "formal";
                                terse: "terse";
                                friendly: "friendly";
                            }>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_maxWords">;
                            maxWords: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_greeting">;
                            greeting: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_feed_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"skip_feed_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_closing">;
                            text: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_cronSchedule">;
                            cron: z.ZodString;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"news">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"skip_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_hours_back">;
                            hours: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_max_per_category">;
                            category: z.ZodString;
                            max: z.ZodNumber;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"netatmo">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"auto_light_on">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"auto_light_off">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"suppress_automation">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_is_dark_offset">;
                            offset_minutes: z.ZodNumber;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"security">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"set_pir">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_sleep">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_ir">;
                            mode: z.ZodEnum<{
                                on: "on";
                                off: "off";
                                auto: "auto";
                            }>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_floodlight">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"auto_patrol">;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        uid: z.ZodString;
                        name: z.ZodString;
                        role: z.ZodEnum<{
                            primary: "primary";
                            secondary: "secondary";
                        }>;
                        enabled: z.ZodBoolean;
                        ptz_presets: z.ZodObject<{
                            left: z.ZodNumber;
                            center: z.ZodNumber;
                            right: z.ZodNumber;
                        }, z.core.$strict>;
                        siren: z.ZodBoolean;
                        battery: z.ZodBoolean;
                    }, z.core.$strict>>]>>;
                }, z.core.$strict>]>;
                origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"platform_default">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"agent_override">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"needs_choice">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"master">;
                    source: z.ZodObject<{
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                        masterId: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">;
                value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                    url: z.ZodString;
                    category: z.ZodString;
                    maxPerCategory: z.ZodOptional<z.ZodNumber>;
                    label: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    url: z.ZodString;
                    category: z.ZodString;
                    weight: z.ZodDefault<z.ZodNumber>;
                }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"briefing">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"skip_section">;
                        section: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_section">;
                        section: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_tone">;
                        tone: z.ZodEnum<{
                            formal: "formal";
                            terse: "terse";
                            friendly: "friendly";
                        }>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_maxWords">;
                        maxWords: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_greeting">;
                        greeting: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_feed_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"skip_feed_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_closing">;
                        text: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_cronSchedule">;
                        cron: z.ZodString;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"news">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"skip_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_hours_back">;
                        hours: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_max_per_category">;
                        category: z.ZodString;
                        max: z.ZodNumber;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"netatmo">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"auto_light_on">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"auto_light_off">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"suppress_automation">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_is_dark_offset">;
                        offset_minutes: z.ZodNumber;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"security">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"set_pir">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_sleep">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_ir">;
                        mode: z.ZodEnum<{
                            on: "on";
                            off: "off";
                            auto: "auto";
                        }>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_floodlight">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"auto_patrol">;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    uid: z.ZodString;
                    name: z.ZodString;
                    role: z.ZodEnum<{
                        primary: "primary";
                        secondary: "secondary";
                    }>;
                    enabled: z.ZodBoolean;
                    ptz_presets: z.ZodObject<{
                        left: z.ZodNumber;
                        center: z.ZodNumber;
                        right: z.ZodNumber;
                    }, z.core.$strict>;
                    siren: z.ZodBoolean;
                    battery: z.ZodBoolean;
                }, z.core.$strict>>]>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        request: z.ZodObject<{
            format: z.ZodLiteral<"ordinary-lifecycle-v1">;
            requestId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            capability: z.ZodString;
            phase: z.ZodEnum<{
                prepare: "prepare";
                suspend: "suspend";
                activate: "activate";
                rollback: "rollback";
            }>;
            transition: z.ZodObject<{
                from: z.ZodNullable<z.ZodObject<{
                    appliedVersion: z.ZodNumber;
                    sha256: z.ZodString;
                }, z.core.$strict>>;
                to: z.ZodObject<{
                    appliedVersion: z.ZodNumber;
                    sha256: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>;
            targetMembership: z.ZodEnum<{
                enabled: "enabled";
                disabled: "disabled";
                removed: "removed";
            }>;
            operation: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                action: z.ZodLiteral<"apply-config">;
                execution: z.ZodEnum<{
                    stopped: "stopped";
                    running: "running";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                action: z.ZodLiteral<"reload">;
                execution: z.ZodEnum<{
                    stopped: "stopped";
                    running: "running";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                action: z.ZodLiteral<"start">;
                execution: z.ZodLiteral<"running">;
            }, z.core.$strict>, z.ZodObject<{
                action: z.ZodLiteral<"stop">;
                execution: z.ZodLiteral<"stopped">;
            }, z.core.$strict>, z.ZodObject<{
                action: z.ZodLiteral<"restart">;
                execution: z.ZodLiteral<"running">;
            }, z.core.$strict>], "action">>;
            configuration: z.ZodOptional<z.ZodObject<{
                format: z.ZodLiteral<"ordinary-v2">;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                capability: z.ZodString;
                version: z.ZodNumber;
                parameters: z.ZodArray<z.ZodObject<{
                    parameter: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"number">;
                        min: z.ZodOptional<z.ZodNumber>;
                        max: z.ZodOptional<z.ZodNumber>;
                        platformDefault: z.ZodOptional<z.ZodNumber>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"integer">;
                        min: z.ZodOptional<z.ZodNumber>;
                        max: z.ZodOptional<z.ZodNumber>;
                        platformDefault: z.ZodOptional<z.ZodNumber>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"string">;
                        minLength: z.ZodOptional<z.ZodNumber>;
                        maxLength: z.ZodOptional<z.ZodNumber>;
                        pattern: z.ZodOptional<z.ZodString>;
                        platformDefault: z.ZodOptional<z.ZodString>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"boolean">;
                        platformDefault: z.ZodOptional<z.ZodBoolean>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"enum">;
                        options: z.ZodArray<z.ZodObject<{
                            value: z.ZodString;
                            label: z.ZodString;
                        }, z.core.$strict>>;
                        platformDefault: z.ZodOptional<z.ZodString>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"string_list">;
                        minItems: z.ZodOptional<z.ZodNumber>;
                        maxItems: z.ZodOptional<z.ZodNumber>;
                        options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            value: z.ZodString;
                            label: z.ZodString;
                        }, z.core.$strict>>>;
                        pattern: z.ZodOptional<z.ZodString>;
                        platformDefault: z.ZodOptional<z.ZodArray<z.ZodString>>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>], "type">, z.ZodObject<{
                        optional: z.ZodBoolean;
                        key: z.ZodString;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                        type: z.ZodLiteral<"structured">;
                        schemaKey: z.ZodEnum<{
                            "briefing.feeds": "briefing.feeds";
                            "briefing.categoryWeights": "briefing.categoryWeights";
                            "news.feeds": "news.feeds";
                            "rules.briefing": "rules.briefing";
                            "rules.news": "rules.news";
                            "rules.netatmo": "rules.netatmo";
                            "rules.security": "rules.security";
                            "security.cameraPolicies": "security.cameraPolicies";
                        }>;
                        schemaVersion: z.ZodLiteral<1>;
                        platformDefault: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                            url: z.ZodString;
                            category: z.ZodString;
                            maxPerCategory: z.ZodOptional<z.ZodNumber>;
                            label: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            url: z.ZodString;
                            category: z.ZodString;
                            weight: z.ZodDefault<z.ZodNumber>;
                        }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"briefing">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"skip_section">;
                                section: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_section">;
                                section: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_tone">;
                                tone: z.ZodEnum<{
                                    formal: "formal";
                                    terse: "terse";
                                    friendly: "friendly";
                                }>;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_maxWords">;
                                maxWords: z.ZodNumber;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_greeting">;
                                greeting: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_feed_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"skip_feed_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_closing">;
                                text: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_cronSchedule">;
                                cron: z.ZodString;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"news">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"skip_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_hours_back">;
                                hours: z.ZodNumber;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_max_per_category">;
                                category: z.ZodString;
                                max: z.ZodNumber;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"netatmo">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"auto_light_on">;
                                module_id: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"auto_light_off">;
                                module_id: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"suppress_automation">;
                                module_id: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_is_dark_offset">;
                                offset_minutes: z.ZodNumber;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"security">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"set_pir">;
                                enabled: z.ZodBoolean;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_sleep">;
                                enabled: z.ZodBoolean;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_ir">;
                                mode: z.ZodEnum<{
                                    on: "on";
                                    off: "off";
                                    auto: "auto";
                                }>;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_floodlight">;
                                enabled: z.ZodBoolean;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"auto_patrol">;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            uid: z.ZodString;
                            name: z.ZodString;
                            role: z.ZodEnum<{
                                primary: "primary";
                                secondary: "secondary";
                            }>;
                            enabled: z.ZodBoolean;
                            ptz_presets: z.ZodObject<{
                                left: z.ZodNumber;
                                center: z.ZodNumber;
                                right: z.ZodNumber;
                            }, z.core.$strict>;
                            siren: z.ZodBoolean;
                            battery: z.ZodBoolean;
                        }, z.core.$strict>>]>>;
                    }, z.core.$strict>]>;
                    origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"platform_default">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"agent_override">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"needs_choice">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"master">;
                        source: z.ZodObject<{
                            ownerId: z.ZodString;
                            tenantId: z.ZodString;
                            masterId: z.ZodString;
                            version: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>], "kind">;
                    value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                        url: z.ZodString;
                        category: z.ZodString;
                        maxPerCategory: z.ZodOptional<z.ZodNumber>;
                        label: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        url: z.ZodString;
                        category: z.ZodString;
                        weight: z.ZodDefault<z.ZodNumber>;
                    }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"briefing">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"skip_section">;
                            section: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_section">;
                            section: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_tone">;
                            tone: z.ZodEnum<{
                                formal: "formal";
                                terse: "terse";
                                friendly: "friendly";
                            }>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_maxWords">;
                            maxWords: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_greeting">;
                            greeting: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_feed_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"skip_feed_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_closing">;
                            text: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_cronSchedule">;
                            cron: z.ZodString;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"news">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"skip_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_hours_back">;
                            hours: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_max_per_category">;
                            category: z.ZodString;
                            max: z.ZodNumber;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"netatmo">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"auto_light_on">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"auto_light_off">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"suppress_automation">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_is_dark_offset">;
                            offset_minutes: z.ZodNumber;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"security">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"set_pir">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_sleep">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_ir">;
                            mode: z.ZodEnum<{
                                on: "on";
                                off: "off";
                                auto: "auto";
                            }>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_floodlight">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"auto_patrol">;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        uid: z.ZodString;
                        name: z.ZodString;
                        role: z.ZodEnum<{
                            primary: "primary";
                            secondary: "secondary";
                        }>;
                        enabled: z.ZodBoolean;
                        ptz_presets: z.ZodObject<{
                            left: z.ZodNumber;
                            center: z.ZodNumber;
                            right: z.ZodNumber;
                        }, z.core.$strict>;
                        siren: z.ZodBoolean;
                        battery: z.ZodBoolean;
                    }, z.core.$strict>>]>>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        operationId: z.ZodString;
        fence: z.ZodNumber;
        status: z.ZodEnum<{
            complete: "complete";
            pending: "pending";
        }>;
        outcome: z.ZodEnum<{
            error: "error";
            ok: "ok";
            "in-progress": "in-progress";
        }>;
        replayed: z.ZodBoolean;
        ordinaryState: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            capability: z.ZodString;
            desired: z.ZodNullable<z.ZodObject<{
                format: z.ZodLiteral<"ordinary-v2">;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                capability: z.ZodString;
                version: z.ZodNumber;
                parameters: z.ZodArray<z.ZodObject<{
                    parameter: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"number">;
                        min: z.ZodOptional<z.ZodNumber>;
                        max: z.ZodOptional<z.ZodNumber>;
                        platformDefault: z.ZodOptional<z.ZodNumber>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"integer">;
                        min: z.ZodOptional<z.ZodNumber>;
                        max: z.ZodOptional<z.ZodNumber>;
                        platformDefault: z.ZodOptional<z.ZodNumber>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"string">;
                        minLength: z.ZodOptional<z.ZodNumber>;
                        maxLength: z.ZodOptional<z.ZodNumber>;
                        pattern: z.ZodOptional<z.ZodString>;
                        platformDefault: z.ZodOptional<z.ZodString>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"boolean">;
                        platformDefault: z.ZodOptional<z.ZodBoolean>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"enum">;
                        options: z.ZodArray<z.ZodObject<{
                            value: z.ZodString;
                            label: z.ZodString;
                        }, z.core.$strict>>;
                        platformDefault: z.ZodOptional<z.ZodString>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"string_list">;
                        minItems: z.ZodOptional<z.ZodNumber>;
                        maxItems: z.ZodOptional<z.ZodNumber>;
                        options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            value: z.ZodString;
                            label: z.ZodString;
                        }, z.core.$strict>>>;
                        pattern: z.ZodOptional<z.ZodString>;
                        platformDefault: z.ZodOptional<z.ZodArray<z.ZodString>>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>], "type">, z.ZodObject<{
                        optional: z.ZodBoolean;
                        key: z.ZodString;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                        type: z.ZodLiteral<"structured">;
                        schemaKey: z.ZodEnum<{
                            "briefing.feeds": "briefing.feeds";
                            "briefing.categoryWeights": "briefing.categoryWeights";
                            "news.feeds": "news.feeds";
                            "rules.briefing": "rules.briefing";
                            "rules.news": "rules.news";
                            "rules.netatmo": "rules.netatmo";
                            "rules.security": "rules.security";
                            "security.cameraPolicies": "security.cameraPolicies";
                        }>;
                        schemaVersion: z.ZodLiteral<1>;
                        platformDefault: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                            url: z.ZodString;
                            category: z.ZodString;
                            maxPerCategory: z.ZodOptional<z.ZodNumber>;
                            label: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            url: z.ZodString;
                            category: z.ZodString;
                            weight: z.ZodDefault<z.ZodNumber>;
                        }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"briefing">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"skip_section">;
                                section: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_section">;
                                section: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_tone">;
                                tone: z.ZodEnum<{
                                    formal: "formal";
                                    terse: "terse";
                                    friendly: "friendly";
                                }>;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_maxWords">;
                                maxWords: z.ZodNumber;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_greeting">;
                                greeting: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_feed_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"skip_feed_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_closing">;
                                text: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_cronSchedule">;
                                cron: z.ZodString;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"news">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"skip_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_hours_back">;
                                hours: z.ZodNumber;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_max_per_category">;
                                category: z.ZodString;
                                max: z.ZodNumber;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"netatmo">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"auto_light_on">;
                                module_id: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"auto_light_off">;
                                module_id: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"suppress_automation">;
                                module_id: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_is_dark_offset">;
                                offset_minutes: z.ZodNumber;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"security">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"set_pir">;
                                enabled: z.ZodBoolean;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_sleep">;
                                enabled: z.ZodBoolean;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_ir">;
                                mode: z.ZodEnum<{
                                    on: "on";
                                    off: "off";
                                    auto: "auto";
                                }>;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_floodlight">;
                                enabled: z.ZodBoolean;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"auto_patrol">;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            uid: z.ZodString;
                            name: z.ZodString;
                            role: z.ZodEnum<{
                                primary: "primary";
                                secondary: "secondary";
                            }>;
                            enabled: z.ZodBoolean;
                            ptz_presets: z.ZodObject<{
                                left: z.ZodNumber;
                                center: z.ZodNumber;
                                right: z.ZodNumber;
                            }, z.core.$strict>;
                            siren: z.ZodBoolean;
                            battery: z.ZodBoolean;
                        }, z.core.$strict>>]>>;
                    }, z.core.$strict>]>;
                    origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"platform_default">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"agent_override">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"needs_choice">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"master">;
                        source: z.ZodObject<{
                            ownerId: z.ZodString;
                            tenantId: z.ZodString;
                            masterId: z.ZodString;
                            version: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>], "kind">;
                    value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                        url: z.ZodString;
                        category: z.ZodString;
                        maxPerCategory: z.ZodOptional<z.ZodNumber>;
                        label: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        url: z.ZodString;
                        category: z.ZodString;
                        weight: z.ZodDefault<z.ZodNumber>;
                    }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"briefing">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"skip_section">;
                            section: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_section">;
                            section: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_tone">;
                            tone: z.ZodEnum<{
                                formal: "formal";
                                terse: "terse";
                                friendly: "friendly";
                            }>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_maxWords">;
                            maxWords: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_greeting">;
                            greeting: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_feed_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"skip_feed_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_closing">;
                            text: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_cronSchedule">;
                            cron: z.ZodString;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"news">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"skip_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"add_category">;
                            category: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_hours_back">;
                            hours: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_max_per_category">;
                            category: z.ZodString;
                            max: z.ZodNumber;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"netatmo">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"auto_light_on">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"auto_light_off">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"suppress_automation">;
                            module_id: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_is_dark_offset">;
                            offset_minutes: z.ZodNumber;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        skill: z.ZodLiteral<"security">;
                        condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"set_pir">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_sleep">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_ir">;
                            mode: z.ZodEnum<{
                                on: "on";
                                off: "off";
                                auto: "auto";
                            }>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"set_floodlight">;
                            enabled: z.ZodBoolean;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"auto_patrol">;
                        }, z.core.$strict>], "type">;
                        priority: z.ZodNumber;
                        created_by: z.ZodEnum<{
                            user: "user";
                            operator: "operator";
                        }>;
                        created_at: z.ZodString;
                        description: z.ZodString;
                        locked: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                        uid: z.ZodString;
                        name: z.ZodString;
                        role: z.ZodEnum<{
                            primary: "primary";
                            secondary: "secondary";
                        }>;
                        enabled: z.ZodBoolean;
                        ptz_presets: z.ZodObject<{
                            left: z.ZodNumber;
                            center: z.ZodNumber;
                            right: z.ZodNumber;
                        }, z.core.$strict>;
                        siren: z.ZodBoolean;
                        battery: z.ZodBoolean;
                    }, z.core.$strict>>]>>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            runtimeState: z.ZodEnum<{
                unknown: "unknown";
                loaded: "loaded";
                unloaded: "unloaded";
            }>;
            applied: z.ZodNullable<z.ZodObject<{
                configuration: z.ZodObject<{
                    format: z.ZodLiteral<"ordinary-v2">;
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                    }, z.core.$strict>;
                    capability: z.ZodString;
                    version: z.ZodNumber;
                    parameters: z.ZodArray<z.ZodObject<{
                        parameter: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"number">;
                            min: z.ZodOptional<z.ZodNumber>;
                            max: z.ZodOptional<z.ZodNumber>;
                            platformDefault: z.ZodOptional<z.ZodNumber>;
                            key: z.ZodString;
                            label: z.ZodString;
                            description: z.ZodString;
                            explanation: z.ZodOptional<z.ZodString>;
                            group: z.ZodOptional<z.ZodString>;
                            unit: z.ZodOptional<z.ZodString>;
                            status: z.ZodEnum<{
                                decided: "decided";
                                proposed: "proposed";
                            }>;
                            reference: z.ZodString;
                            appliesWhen: z.ZodEnum<{
                                immediate: "immediate";
                                next_apply: "next_apply";
                            }>;
                            consumes: z.ZodBoolean;
                            optional: z.ZodBoolean;
                            editableBy: z.ZodArray<z.ZodEnum<{
                                superadmin: "superadmin";
                                owner: "owner";
                            }>>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"integer">;
                            min: z.ZodOptional<z.ZodNumber>;
                            max: z.ZodOptional<z.ZodNumber>;
                            platformDefault: z.ZodOptional<z.ZodNumber>;
                            key: z.ZodString;
                            label: z.ZodString;
                            description: z.ZodString;
                            explanation: z.ZodOptional<z.ZodString>;
                            group: z.ZodOptional<z.ZodString>;
                            unit: z.ZodOptional<z.ZodString>;
                            status: z.ZodEnum<{
                                decided: "decided";
                                proposed: "proposed";
                            }>;
                            reference: z.ZodString;
                            appliesWhen: z.ZodEnum<{
                                immediate: "immediate";
                                next_apply: "next_apply";
                            }>;
                            consumes: z.ZodBoolean;
                            optional: z.ZodBoolean;
                            editableBy: z.ZodArray<z.ZodEnum<{
                                superadmin: "superadmin";
                                owner: "owner";
                            }>>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"string">;
                            minLength: z.ZodOptional<z.ZodNumber>;
                            maxLength: z.ZodOptional<z.ZodNumber>;
                            pattern: z.ZodOptional<z.ZodString>;
                            platformDefault: z.ZodOptional<z.ZodString>;
                            key: z.ZodString;
                            label: z.ZodString;
                            description: z.ZodString;
                            explanation: z.ZodOptional<z.ZodString>;
                            group: z.ZodOptional<z.ZodString>;
                            unit: z.ZodOptional<z.ZodString>;
                            status: z.ZodEnum<{
                                decided: "decided";
                                proposed: "proposed";
                            }>;
                            reference: z.ZodString;
                            appliesWhen: z.ZodEnum<{
                                immediate: "immediate";
                                next_apply: "next_apply";
                            }>;
                            consumes: z.ZodBoolean;
                            optional: z.ZodBoolean;
                            editableBy: z.ZodArray<z.ZodEnum<{
                                superadmin: "superadmin";
                                owner: "owner";
                            }>>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"boolean">;
                            platformDefault: z.ZodOptional<z.ZodBoolean>;
                            key: z.ZodString;
                            label: z.ZodString;
                            description: z.ZodString;
                            explanation: z.ZodOptional<z.ZodString>;
                            group: z.ZodOptional<z.ZodString>;
                            unit: z.ZodOptional<z.ZodString>;
                            status: z.ZodEnum<{
                                decided: "decided";
                                proposed: "proposed";
                            }>;
                            reference: z.ZodString;
                            appliesWhen: z.ZodEnum<{
                                immediate: "immediate";
                                next_apply: "next_apply";
                            }>;
                            consumes: z.ZodBoolean;
                            optional: z.ZodBoolean;
                            editableBy: z.ZodArray<z.ZodEnum<{
                                superadmin: "superadmin";
                                owner: "owner";
                            }>>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"enum">;
                            options: z.ZodArray<z.ZodObject<{
                                value: z.ZodString;
                                label: z.ZodString;
                            }, z.core.$strict>>;
                            platformDefault: z.ZodOptional<z.ZodString>;
                            key: z.ZodString;
                            label: z.ZodString;
                            description: z.ZodString;
                            explanation: z.ZodOptional<z.ZodString>;
                            group: z.ZodOptional<z.ZodString>;
                            unit: z.ZodOptional<z.ZodString>;
                            status: z.ZodEnum<{
                                decided: "decided";
                                proposed: "proposed";
                            }>;
                            reference: z.ZodString;
                            appliesWhen: z.ZodEnum<{
                                immediate: "immediate";
                                next_apply: "next_apply";
                            }>;
                            consumes: z.ZodBoolean;
                            optional: z.ZodBoolean;
                            editableBy: z.ZodArray<z.ZodEnum<{
                                superadmin: "superadmin";
                                owner: "owner";
                            }>>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"string_list">;
                            minItems: z.ZodOptional<z.ZodNumber>;
                            maxItems: z.ZodOptional<z.ZodNumber>;
                            options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                value: z.ZodString;
                                label: z.ZodString;
                            }, z.core.$strict>>>;
                            pattern: z.ZodOptional<z.ZodString>;
                            platformDefault: z.ZodOptional<z.ZodArray<z.ZodString>>;
                            key: z.ZodString;
                            label: z.ZodString;
                            description: z.ZodString;
                            explanation: z.ZodOptional<z.ZodString>;
                            group: z.ZodOptional<z.ZodString>;
                            unit: z.ZodOptional<z.ZodString>;
                            status: z.ZodEnum<{
                                decided: "decided";
                                proposed: "proposed";
                            }>;
                            reference: z.ZodString;
                            appliesWhen: z.ZodEnum<{
                                immediate: "immediate";
                                next_apply: "next_apply";
                            }>;
                            consumes: z.ZodBoolean;
                            optional: z.ZodBoolean;
                            editableBy: z.ZodArray<z.ZodEnum<{
                                superadmin: "superadmin";
                                owner: "owner";
                            }>>;
                        }, z.core.$strict>], "type">, z.ZodObject<{
                            optional: z.ZodBoolean;
                            key: z.ZodString;
                            status: z.ZodEnum<{
                                decided: "decided";
                                proposed: "proposed";
                            }>;
                            label: z.ZodString;
                            description: z.ZodString;
                            explanation: z.ZodOptional<z.ZodString>;
                            group: z.ZodOptional<z.ZodString>;
                            unit: z.ZodOptional<z.ZodString>;
                            reference: z.ZodString;
                            appliesWhen: z.ZodEnum<{
                                immediate: "immediate";
                                next_apply: "next_apply";
                            }>;
                            consumes: z.ZodBoolean;
                            editableBy: z.ZodArray<z.ZodEnum<{
                                superadmin: "superadmin";
                                owner: "owner";
                            }>>;
                            type: z.ZodLiteral<"structured">;
                            schemaKey: z.ZodEnum<{
                                "briefing.feeds": "briefing.feeds";
                                "briefing.categoryWeights": "briefing.categoryWeights";
                                "news.feeds": "news.feeds";
                                "rules.briefing": "rules.briefing";
                                "rules.news": "rules.news";
                                "rules.netatmo": "rules.netatmo";
                                "rules.security": "rules.security";
                                "security.cameraPolicies": "security.cameraPolicies";
                            }>;
                            schemaVersion: z.ZodLiteral<1>;
                            platformDefault: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                                url: z.ZodString;
                                category: z.ZodString;
                                maxPerCategory: z.ZodOptional<z.ZodNumber>;
                                label: z.ZodOptional<z.ZodString>;
                            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                                url: z.ZodString;
                                category: z.ZodString;
                                weight: z.ZodDefault<z.ZodNumber>;
                            }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                skill: z.ZodLiteral<"briefing">;
                                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                                action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                    type: z.ZodLiteral<"skip_section">;
                                    section: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"add_section">;
                                    section: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"set_tone">;
                                    tone: z.ZodEnum<{
                                        formal: "formal";
                                        terse: "terse";
                                        friendly: "friendly";
                                    }>;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"set_maxWords">;
                                    maxWords: z.ZodNumber;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"set_greeting">;
                                    greeting: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"add_feed_category">;
                                    category: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"skip_feed_category">;
                                    category: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"add_closing">;
                                    text: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"set_cronSchedule">;
                                    cron: z.ZodString;
                                }, z.core.$strict>], "type">;
                                priority: z.ZodNumber;
                                created_by: z.ZodEnum<{
                                    user: "user";
                                    operator: "operator";
                                }>;
                                created_at: z.ZodString;
                                description: z.ZodString;
                                locked: z.ZodOptional<z.ZodBoolean>;
                            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                skill: z.ZodLiteral<"news">;
                                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                                action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                    type: z.ZodLiteral<"skip_category">;
                                    category: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"add_category">;
                                    category: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"set_hours_back">;
                                    hours: z.ZodNumber;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"set_max_per_category">;
                                    category: z.ZodString;
                                    max: z.ZodNumber;
                                }, z.core.$strict>], "type">;
                                priority: z.ZodNumber;
                                created_by: z.ZodEnum<{
                                    user: "user";
                                    operator: "operator";
                                }>;
                                created_at: z.ZodString;
                                description: z.ZodString;
                                locked: z.ZodOptional<z.ZodBoolean>;
                            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                skill: z.ZodLiteral<"netatmo">;
                                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                                action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                    type: z.ZodLiteral<"auto_light_on">;
                                    module_id: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"auto_light_off">;
                                    module_id: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"suppress_automation">;
                                    module_id: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"set_is_dark_offset">;
                                    offset_minutes: z.ZodNumber;
                                }, z.core.$strict>], "type">;
                                priority: z.ZodNumber;
                                created_by: z.ZodEnum<{
                                    user: "user";
                                    operator: "operator";
                                }>;
                                created_at: z.ZodString;
                                description: z.ZodString;
                                locked: z.ZodOptional<z.ZodBoolean>;
                            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                skill: z.ZodLiteral<"security">;
                                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                                action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                    type: z.ZodLiteral<"set_pir">;
                                    enabled: z.ZodBoolean;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"set_sleep">;
                                    enabled: z.ZodBoolean;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"set_ir">;
                                    mode: z.ZodEnum<{
                                        on: "on";
                                        off: "off";
                                        auto: "auto";
                                    }>;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"set_floodlight">;
                                    enabled: z.ZodBoolean;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"auto_patrol">;
                                }, z.core.$strict>], "type">;
                                priority: z.ZodNumber;
                                created_by: z.ZodEnum<{
                                    user: "user";
                                    operator: "operator";
                                }>;
                                created_at: z.ZodString;
                                description: z.ZodString;
                                locked: z.ZodOptional<z.ZodBoolean>;
                            }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                                uid: z.ZodString;
                                name: z.ZodString;
                                role: z.ZodEnum<{
                                    primary: "primary";
                                    secondary: "secondary";
                                }>;
                                enabled: z.ZodBoolean;
                                ptz_presets: z.ZodObject<{
                                    left: z.ZodNumber;
                                    center: z.ZodNumber;
                                    right: z.ZodNumber;
                                }, z.core.$strict>;
                                siren: z.ZodBoolean;
                                battery: z.ZodBoolean;
                            }, z.core.$strict>>]>>;
                        }, z.core.$strict>]>;
                        origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"platform_default">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"agent_override">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"needs_choice">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"master">;
                            source: z.ZodObject<{
                                ownerId: z.ZodString;
                                tenantId: z.ZodString;
                                masterId: z.ZodString;
                                version: z.ZodNumber;
                            }, z.core.$strict>;
                        }, z.core.$strict>], "kind">;
                        value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                            url: z.ZodString;
                            category: z.ZodString;
                            maxPerCategory: z.ZodOptional<z.ZodNumber>;
                            label: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            url: z.ZodString;
                            category: z.ZodString;
                            weight: z.ZodDefault<z.ZodNumber>;
                        }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"briefing">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"skip_section">;
                                section: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_section">;
                                section: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_tone">;
                                tone: z.ZodEnum<{
                                    formal: "formal";
                                    terse: "terse";
                                    friendly: "friendly";
                                }>;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_maxWords">;
                                maxWords: z.ZodNumber;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_greeting">;
                                greeting: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_feed_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"skip_feed_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_closing">;
                                text: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_cronSchedule">;
                                cron: z.ZodString;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"news">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"skip_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"add_category">;
                                category: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_hours_back">;
                                hours: z.ZodNumber;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_max_per_category">;
                                category: z.ZodString;
                                max: z.ZodNumber;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"netatmo">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"auto_light_on">;
                                module_id: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"auto_light_off">;
                                module_id: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"suppress_automation">;
                                module_id: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_is_dark_offset">;
                                offset_minutes: z.ZodNumber;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            skill: z.ZodLiteral<"security">;
                            condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"set_pir">;
                                enabled: z.ZodBoolean;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_sleep">;
                                enabled: z.ZodBoolean;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_ir">;
                                mode: z.ZodEnum<{
                                    on: "on";
                                    off: "off";
                                    auto: "auto";
                                }>;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"set_floodlight">;
                                enabled: z.ZodBoolean;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"auto_patrol">;
                            }, z.core.$strict>], "type">;
                            priority: z.ZodNumber;
                            created_by: z.ZodEnum<{
                                user: "user";
                                operator: "operator";
                            }>;
                            created_at: z.ZodString;
                            description: z.ZodString;
                            locked: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                            uid: z.ZodString;
                            name: z.ZodString;
                            role: z.ZodEnum<{
                                primary: "primary";
                                secondary: "secondary";
                            }>;
                            enabled: z.ZodBoolean;
                            ptz_presets: z.ZodObject<{
                                left: z.ZodNumber;
                                center: z.ZodNumber;
                                right: z.ZodNumber;
                            }, z.core.$strict>;
                            siren: z.ZodBoolean;
                            battery: z.ZodBoolean;
                        }, z.core.$strict>>]>>;
                    }, z.core.$strict>>;
                }, z.core.$strict>;
                loadedAt: z.ZodISODateTime;
            }, z.core.$strict>>;
            failed: z.ZodNullable<z.ZodObject<{
                version: z.ZodNumber;
                reason: z.ZodObject<{
                    code: z.ZodEnum<{
                        unknown: "unknown";
                        "not-loaded": "not-loaded";
                        "load-failed": "load-failed";
                        "validation-failed": "validation-failed";
                        timeout: "timeout";
                        "source-unavailable": "source-unavailable";
                        "shared-runtime": "shared-runtime";
                        "externally-owned": "externally-owned";
                        "not-supported": "not-supported";
                        "in-progress": "in-progress";
                    }>;
                    detail: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
            effectiveParameters: z.ZodArray<z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                capability: z.ZodString;
                key: z.ZodString;
                value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                    url: z.ZodString;
                    category: z.ZodString;
                    maxPerCategory: z.ZodOptional<z.ZodNumber>;
                    label: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    url: z.ZodString;
                    category: z.ZodString;
                    weight: z.ZodDefault<z.ZodNumber>;
                }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"briefing">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"skip_section">;
                        section: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_section">;
                        section: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_tone">;
                        tone: z.ZodEnum<{
                            formal: "formal";
                            terse: "terse";
                            friendly: "friendly";
                        }>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_maxWords">;
                        maxWords: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_greeting">;
                        greeting: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_feed_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"skip_feed_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_closing">;
                        text: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_cronSchedule">;
                        cron: z.ZodString;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"news">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"skip_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_hours_back">;
                        hours: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_max_per_category">;
                        category: z.ZodString;
                        max: z.ZodNumber;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"netatmo">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"auto_light_on">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"auto_light_off">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"suppress_automation">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_is_dark_offset">;
                        offset_minutes: z.ZodNumber;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"security">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"set_pir">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_sleep">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_ir">;
                        mode: z.ZodEnum<{
                            on: "on";
                            off: "off";
                            auto: "auto";
                        }>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_floodlight">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"auto_patrol">;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    uid: z.ZodString;
                    name: z.ZodString;
                    role: z.ZodEnum<{
                        primary: "primary";
                        secondary: "secondary";
                    }>;
                    enabled: z.ZodBoolean;
                    ptz_presets: z.ZodObject<{
                        left: z.ZodNumber;
                        center: z.ZodNumber;
                        right: z.ZodNumber;
                    }, z.core.$strict>;
                    siren: z.ZodBoolean;
                    battery: z.ZodBoolean;
                }, z.core.$strict>>]>>;
                mode: z.ZodEnum<{
                    immediate: "immediate";
                    next_apply: "next_apply";
                }>;
                sourceConfigVersion: z.ZodNumber;
                observedAt: z.ZodISODateTime;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        membershipEffective: z.ZodEnum<{
            unknown: "unknown";
            enabled: "enabled";
            disabled: "disabled";
            removed: "removed";
        }>;
        executionEffective: z.ZodOptional<z.ZodEnum<{
            unknown: "unknown";
            stopped: "stopped";
            running: "running";
        }>>;
        observedAt: z.ZodNullable<z.ZodISODateTime>;
    }, z.core.$strict>;
    readonly method: "PUT";
    readonly path: "/internal/capability/agents/:agentId/config";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
};
//# sourceMappingURL=internal-capability-agent.d.ts.map