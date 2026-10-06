import { z } from 'zod';
/**
 * cap-ricerca's configuration for ONE agent (v1.28.0, Phase 54).
 *
 * Forge manages agents: every capability attached to an agent keeps that agent's configuration, keyed by `agentId`,
 * and Forge writes it with `PUT /internal/capability/agents/:agentId/config` (see
 * `../../http/endpoints/internal-capability-agent.ts`). There is no «project» inside the capabilities: a view that
 * groups agents lives outside Forge and reads them by agent.
 *
 * No field has a default chosen here: the budget, the models and the source rule are product decisions.
 * The budget is never exceeded: cap-ricerca reserves the worst case of every call before it runs.
 */
/** An agent-core agent id, as in `/internal/agents/:agentId/turn`. */
export declare const CapabilityAgentIdSchema: z.ZodString;
/** Every change to an agent's configuration raises its version; a capability refuses an older or equal one. */
export declare const AgentConfigVersionSchema: z.ZodNumber;
/** IANA time zone of the agent's day (the daily budget restarts at its midnight). */
export declare const AgentTimeZoneSchema: z.ZodString;
export declare const ResearchBudgetSchema: z.ZodObject<{
    dailyUsd: z.ZodNumber;
    perResearchMaxUsd: z.ZodNumber;
    timezone: z.ZodString;
}, z.core.$strip>;
export type ResearchBudget = z.infer<typeof ResearchBudgetSchema>;
export declare const ResearchModelsSchema: z.ZodObject<{
    research: z.ZodString;
    digest: z.ZodOptional<z.ZodString>;
    read: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ResearchModels = z.infer<typeof ResearchModelsSchema>;
export declare const ResearchEffortSchema: z.ZodEnum<{
    low: "low";
    medium: "medium";
    high: "high";
}>;
export declare const ResearchParamsSchema: z.ZodObject<{
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
export type ResearchParams = z.infer<typeof ResearchParamsSchema>;
/**
 * Which addresses may be cited as sources:
 * - `opened_only`: only pages the research actually opened;
 * - `opened_or_search_result`: also the sources of search results (what Enterprise Adoption does up to v1.27).
 */
export declare const SourceRuleSchema: z.ZodEnum<{
    opened_only: "opened_only";
    opened_or_search_result: "opened_or_search_result";
}>;
export type SourceRule = z.infer<typeof SourceRuleSchema>;
export declare const ResearchAgentConfigSchema: z.ZodObject<{
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
export type ResearchAgentConfig = z.infer<typeof ResearchAgentConfigSchema>;
//# sourceMappingURL=agent-config.d.ts.map