import { z } from 'zod';
/**
 * The tools of cap-ricerca (v1.28.0, Phase 54). The agent is the one of the tool call envelope. Agents and other
 * capabilities call them at `capToolCallPath(RICERCA_TOOLS.<tool>)` — never with a hand-written path.
 * Errors use the bridge tool-call codes (`TOOL_CALL_INVALID`, `TOOL_EXEC_FAILED`) with a {@link RicercaToolError}
 * as the error text.
 */
export declare const RICERCA_TOOLS: {
    /** Queue a research; answers at once with its id. */
    readonly start: "research_start";
    /** Where a research is. */
    readonly status: "research_status";
    /** The findings of a finished research. */
    readonly result: "research_result";
};
export type RicercaToolName = (typeof RICERCA_TOOLS)[keyof typeof RICERCA_TOOLS];
/** Why a cap-ricerca tool call failed (the `error` text of a bridge tool-call error). */
export declare const RicercaToolErrorSchema: z.ZodEnum<{
    not_configured: "not_configured";
    max_usd_above_agent: "max_usd_above_agent";
    unknown_parent: "unknown_parent";
    unknown_research: "unknown_research";
    not_ready: "not_ready";
}>;
export type RicercaToolError = z.infer<typeof RicercaToolErrorSchema>;
export declare const ResearchStartInputSchema: z.ZodObject<{
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
    agentId: z.ZodString;
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