import { z } from 'zod';
/**
 * The tools of cap-ricerca (v1.28.0, Phase 54). Agents and other capabilities call them at
 * `capToolCallPath(RICERCA_TOOLS.<tool>)` — never with a hand-written path.
 */
export declare const RICERCA_TOOLS: {
    /** Queue a research; answers at once with its id. */
    readonly start: "research_start";
    /** Where a research is. */
    readonly status: "research_status";
    /** The findings of a completed research. */
    readonly result: "research_result";
};
export type RicercaToolName = (typeof RICERCA_TOOLS)[keyof typeof RICERCA_TOOLS];
export declare const ResearchStartInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    question: z.ZodString;
    goal: z.ZodOptional<z.ZodString>;
    parentResearchId: z.ZodOptional<z.ZodString>;
    maxUsd: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const ResearchStartOutputSchema: z.ZodObject<{
    researchId: z.ZodString;
    state: z.ZodEnum<{
        completed: "completed";
        failed: "failed";
        queued: "queued";
        running: "running";
        budget_exhausted: "budget_exhausted";
    }>;
}, z.core.$strict>;
export declare const ResearchStatusInputSchema: z.ZodObject<{
    researchId: z.ZodString;
}, z.core.$strict>;
export declare const ResearchStatusOutputSchema: z.ZodObject<{
    researchId: z.ZodString;
    state: z.ZodEnum<{
        completed: "completed";
        failed: "failed";
        queued: "queued";
        running: "running";
        budget_exhausted: "budget_exhausted";
    }>;
}, z.core.$strict>;
export declare const ResearchResultInputSchema: z.ZodObject<{
    researchId: z.ZodString;
}, z.core.$strict>;
export declare const ResearchResultOutputSchema: z.ZodObject<{
    researchId: z.ZodString;
    projectId: z.ZodString;
    state: z.ZodEnum<{
        completed: "completed";
        failed: "failed";
        queued: "queued";
        running: "running";
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
export type ResearchStartInput = z.infer<typeof ResearchStartInputSchema>;
export type ResearchStartOutput = z.infer<typeof ResearchStartOutputSchema>;
export type ResearchStatusInput = z.infer<typeof ResearchStatusInputSchema>;
export type ResearchStatusOutput = z.infer<typeof ResearchStatusOutputSchema>;
export type ResearchResultInput = z.infer<typeof ResearchResultInputSchema>;
export type ResearchResultOutput = z.infer<typeof ResearchResultOutputSchema>;
//# sourceMappingURL=tools.d.ts.map