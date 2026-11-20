import { z } from 'zod';
/**
 * Reads the result of a topic's extended research apart from the start tool (D14).
 * Neither identity nor budget comes from the tool input: scope is the call's.
 */
export declare const SOCIAL_TOPIC_RESEARCH_RESULT_TOOLS: {
    readonly result: "social_topic_research_result";
};
export declare const SocialTopicResearchResultInputSchema: z.ZodObject<{
    topicId: z.ZodString;
}, z.core.$strict>;
export type SocialTopicResearchResultInput = z.infer<typeof SocialTopicResearchResultInputSchema>;
export declare const SocialTopicResearchResultOutputSchema: z.ZodObject<{
    topicId: z.ZodString;
    researchId: z.ZodString;
    result: z.ZodObject<{
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
            cited: z.ZodNumber;
            opened: z.ZodNumber;
            admitted: z.ZodNumber;
            droppedFindings: z.ZodNumber;
            notOpenedReason: z.ZodOptional<z.ZodEnum<{
                web_exhausted: "web_exhausted";
                research_budget_exhausted: "research_budget_exhausted";
                day_budget_exhausted: "day_budget_exhausted";
                nothing_to_open: "nothing_to_open";
            }>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type SocialTopicResearchResultOutput = z.infer<typeof SocialTopicResearchResultOutputSchema>;
export declare const SocialTopicResearchResultToolErrorSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    not_configured: "not_configured";
    unknown_topic: "unknown_topic";
    research_not_ready: "research_not_ready";
    research_not_enabled: "research_not_enabled";
    not_researched: "not_researched";
}>;
export type SocialTopicResearchResultToolError = z.infer<typeof SocialTopicResearchResultToolErrorSchema>;
//# sourceMappingURL=topic-research-result.d.ts.map