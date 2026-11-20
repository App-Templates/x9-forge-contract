import { z } from 'zod';
import { type ResearchRequest } from "../ricerca/research.js";
import type { SocialListeningAgentConfig } from "./config.js";
import type { SocialTopicGetOutput } from "./tools.js";
/**
 * Extended research requested by the owner, never by an automatic round (D10).
 * The service forwards the same identity envelope to cap-ricerca and saves extendedResearchId (D14).
 * Neither identity nor budget comes from the tool input.
 */
export declare const SOCIAL_TOPIC_RESEARCH_TOOLS: {
    readonly start: "social_topic_research";
};
/** Fixed caller-specific research limits for the $0.30 ceiling (D18). */
export declare const SOCIAL_RESEARCH_NARROW_PARAMS: {
    readonly maxToolCalls: 1;
    readonly searchContextSize: "low";
    readonly reasoningEffort: "low";
};
export declare const SocialTopicResearchInputSchema: z.ZodObject<{
    topicId: z.ZodString;
}, z.core.$strict>;
export type SocialTopicResearchInput = z.infer<typeof SocialTopicResearchInputSchema>;
export declare const SocialTopicResearchOutputSchema: z.ZodObject<{
    topicId: z.ZodString;
    researchId: z.ZodString;
    state: z.ZodEnum<{
        failed: "failed";
        budget_exhausted: "budget_exhausted";
        completed: "completed";
        queued: "queued";
        running: "running";
    }>;
}, z.core.$strict>;
export type SocialTopicResearchOutput = z.infer<typeof SocialTopicResearchOutputSchema>;
export declare const SocialTopicResearchToolErrorSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    research_budget_exhausted: "research_budget_exhausted";
    not_configured: "not_configured";
    unknown_topic: "unknown_topic";
    already_researched: "already_researched";
    research_cap_reached: "research_cap_reached";
    research_not_enabled: "research_not_enabled";
}>;
export type SocialTopicResearchToolError = z.infer<typeof SocialTopicResearchToolErrorSchema>;
/** Build research_start's request using the agent's budget and cap-ricerca's own schema. */
export declare function socialTopicResearchRequest(topic: SocialTopicGetOutput, research: SocialListeningAgentConfig['research']): ResearchRequest;
export type SocialTopicResearchDecision = {
    ok: true;
    maxUsd: number;
} | {
    ok: false;
    error: 'already_researched' | 'research_cap_reached' | 'invalid_request';
    remainingUsd?: number;
};
/** The caller owns the daily ledger; reuse the microdollar cap check before reserving research. */
export declare function socialTopicResearchDecision({ topic, research, spentTodayUsd }: {
    topic: SocialTopicGetOutput;
    research: SocialListeningAgentConfig['research'];
    spentTodayUsd: number;
}): SocialTopicResearchDecision;
//# sourceMappingURL=topic-research.d.ts.map