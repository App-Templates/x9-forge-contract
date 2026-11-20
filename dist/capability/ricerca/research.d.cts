import { z } from 'zod';
import { type ResearchParams } from "./agent-config.cjs";
/**
 * One research of cap-ricerca (v1.28.0, Phase 54): a question of one agent, researched on the web within the agent's
 * budget, answered with findings that carry their sources. Research runs in cascades: a research may start from the
 * new questions of an earlier one of the same agent (`parentResearchId`). The agent is the one of the tool call.
 *
 * Everything that comes from the web — finding texts, titles, addresses — is DATA. Whoever puts it in front of a
 * model marks it as such and never uses it as instructions.
 */
export declare const ResearchIdSchema: z.ZodString;
export declare const LabGapsRefSchema: z.ZodString;
export type LabGapsRef = z.infer<typeof LabGapsRefSchema>;
/** Only http(s) addresses, bounded: never `file:`, `javascript:` or `data:`. */
export declare const WebUrlSchema: z.ZodString;
/**
 * The research values a caller may ask for ONE research: same limits as the agent configuration, no defaults.
 * The service refuses a request above the agent's maxima (`params_above_agent`), never trims it.
 */
export declare const ResearchCallerParamsSchema: z.ZodObject<{
    searchContextSize: z.ZodOptional<z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
    }>>;
    reasoningEffort: z.ZodOptional<z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
    }>>;
    maxToolCalls: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type ResearchCallerParams = z.infer<typeof ResearchCallerParamsSchema>;
export type ResolveResearchParamsResult = {
    ok: true;
    params: ResearchParams;
} | {
    ok: false;
    above: ('maxToolCalls' | 'searchContextSize' | 'reasoningEffort')[];
};
/**
 * Resolve the values of one research against the agent's maxima. A missing value takes the agent's; a value above
 * the agent's maximum is reported in `above` (in the order maxToolCalls, searchContextSize, reasoningEffort).
 */
export declare function resolveResearchParams(agent: ResearchParams, requested?: ResearchCallerParams): ResolveResearchParamsResult;
export declare const ResearchRequestSchema: z.ZodObject<{
    question: z.ZodString;
    goal: z.ZodOptional<z.ZodString>;
    parentResearchId: z.ZodOptional<z.ZodString>;
    labGapsRef: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    maxUsd: z.ZodOptional<z.ZodNumber>;
    params: z.ZodOptional<z.ZodObject<{
        searchContextSize: z.ZodOptional<z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
        }>>;
        reasoningEffort: z.ZodOptional<z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
        }>>;
        maxToolCalls: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ResearchRequest = z.infer<typeof ResearchRequestSchema>;
export declare const ResearchStateSchema: z.ZodEnum<{
    failed: "failed";
    budget_exhausted: "budget_exhausted";
    completed: "completed";
    queued: "queued";
    running: "running";
}>;
export type ResearchState = z.infer<typeof ResearchStateSchema>;
export declare const ResearchSourceSchema: z.ZodObject<{
    url: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    opened: z.ZodBoolean;
}, z.core.$strict>;
export type ResearchSource = z.infer<typeof ResearchSourceSchema>;
export declare const ResearchFindingSchema: z.ZodObject<{
    text: z.ZodString;
    sourceUrls: z.ZodArray<z.ZodString>;
    origin: z.ZodLiteral<"web">;
}, z.core.$strict>;
export type ResearchFinding = z.infer<typeof ResearchFindingSchema>;
export declare const ResearchCostSchema: z.ZodObject<{
    usd: z.ZodNumber;
    inputTokens: z.ZodNumber;
    outputTokens: z.ZodNumber;
    webCalls: z.ZodNumber;
    uncertain: z.ZodBoolean;
}, z.core.$strict>;
export type ResearchCost = z.infer<typeof ResearchCostSchema>;
export declare const RESEARCH_NOT_OPENED_REASONS: readonly ["web_exhausted", "research_budget_exhausted", "day_budget_exhausted", "nothing_to_open"];
export declare const ResearchNotOpenedReasonSchema: z.ZodEnum<{
    web_exhausted: "web_exhausted";
    research_budget_exhausted: "research_budget_exhausted";
    day_budget_exhausted: "day_budget_exhausted";
    nothing_to_open: "nothing_to_open";
}>;
export type ResearchNotOpenedReason = z.infer<typeof ResearchNotOpenedReasonSchema>;
export declare const ResearchAdmissionSchema: z.ZodObject<{
    rule: z.ZodEnum<{
        opened_only: "opened_only";
        opened_or_search_result: "opened_or_search_result";
    }>;
    /** Addresses cited by the report among the search results. */
    cited: z.ZodNumber;
    /** Pages actually opened. */
    opened: z.ZodNumber;
    /** Addresses admitted as sources under the selected rule. */
    admitted: z.ZodNumber;
    /** Findings discarded because none of their sources were admitted. */
    droppedFindings: z.ZodNumber;
    notOpenedReason: z.ZodOptional<z.ZodEnum<{
        web_exhausted: "web_exhausted";
        research_budget_exhausted: "research_budget_exhausted";
        day_budget_exhausted: "day_budget_exhausted";
        nothing_to_open: "nothing_to_open";
    }>>;
}, z.core.$strict>;
export type ResearchAdmission = z.infer<typeof ResearchAdmissionSchema>;
/** Validate and render one fixed Italian line without external state. */
export declare function renderResearchAdmission(admission: ResearchAdmission): string;
export declare const ResearchResultSchema: z.ZodObject<{
    researchId: z.ZodString;
    agentId: z.ZodString;
    state: z.ZodEnum<{
        failed: "failed";
        budget_exhausted: "budget_exhausted";
        completed: "completed";
        queued: "queued";
        running: "running";
    }>;
    question: z.ZodString;
    parentResearchId: z.ZodOptional<z.ZodString>;
    findings: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        sourceUrls: z.ZodArray<z.ZodString>;
        origin: z.ZodLiteral<"web">;
    }, z.core.$strict>>;
    newQuestions: z.ZodArray<z.ZodString>;
    sources: z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        opened: z.ZodBoolean;
    }, z.core.$strict>>;
    cost: z.ZodObject<{
        usd: z.ZodNumber;
        inputTokens: z.ZodNumber;
        outputTokens: z.ZodNumber;
        webCalls: z.ZodNumber;
        uncertain: z.ZodBoolean;
    }, z.core.$strict>;
    admission: z.ZodOptional<z.ZodObject<{
        rule: z.ZodEnum<{
            opened_only: "opened_only";
            opened_or_search_result: "opened_or_search_result";
        }>;
        /** Addresses cited by the report among the search results. */
        cited: z.ZodNumber;
        /** Pages actually opened. */
        opened: z.ZodNumber;
        /** Addresses admitted as sources under the selected rule. */
        admitted: z.ZodNumber;
        /** Findings discarded because none of their sources were admitted. */
        droppedFindings: z.ZodNumber;
        notOpenedReason: z.ZodOptional<z.ZodEnum<{
            web_exhausted: "web_exhausted";
            research_budget_exhausted: "research_budget_exhausted";
            day_budget_exhausted: "day_budget_exhausted";
            nothing_to_open: "nothing_to_open";
        }>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ResearchResult = z.infer<typeof ResearchResultSchema>;
//# sourceMappingURL=research.d.ts.map