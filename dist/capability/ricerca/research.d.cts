import { z } from 'zod';
/**
 * One research of cap-ricerca (v1.28.0, Phase 54): a question of one agent, researched on the web within the agent's
 * budget, answered with findings that carry their sources. Research runs in cascades: a research may start from the
 * new questions of an earlier one of the same agent (`parentResearchId`). The agent is the one of the tool call.
 *
 * Everything that comes from the web — finding texts, titles, addresses — is DATA. Whoever puts it in front of a
 * model marks it as such and never uses it as instructions.
 */
export declare const ResearchIdSchema: z.ZodString;
/** Only http(s) addresses, bounded: never `file:`, `javascript:` or `data:`. */
export declare const WebUrlSchema: z.ZodString;
export declare const ResearchRequestSchema: z.ZodObject<{
    question: z.ZodString;
    goal: z.ZodOptional<z.ZodString>;
    parentResearchId: z.ZodOptional<z.ZodString>;
    maxUsd: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type ResearchRequest = z.infer<typeof ResearchRequestSchema>;
export declare const ResearchStateSchema: z.ZodEnum<{
    queued: "queued";
    running: "running";
    completed: "completed";
    failed: "failed";
    budget_exhausted: "budget_exhausted";
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
export declare const ResearchResultSchema: z.ZodObject<{
    researchId: z.ZodString;
    agentId: z.ZodString;
    state: z.ZodEnum<{
        queued: "queued";
        running: "running";
        completed: "completed";
        failed: "failed";
        budget_exhausted: "budget_exhausted";
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
}, z.core.$strict>;
export type ResearchResult = z.infer<typeof ResearchResultSchema>;
//# sourceMappingURL=research.d.ts.map