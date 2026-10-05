import { z } from 'zod';
/**
 * The tools of cap-lab (v1.28.0, Phase 54), called at `capToolCallPath(LAB_TOOLS.<tool>)`. The wiki is the one of
 * the agent of the tool call envelope.
 * `lab_ingest` takes a cap-ricerca result as cap-ricerca defines it (imported, never copied).
 */
export declare const LAB_TOOLS: {
    /** Store a research result: raw sources, then pages and claims updated. */
    readonly ingest: "lab_ingest";
    /** Ask the wiki: the pages and claims that answer. */
    readonly query: "lab_query";
    /** The open gaps: the next questions for research. */
    readonly gaps: "lab_gaps";
    /** The competence graph with levels and scores. */
    readonly competence: "lab_competence";
};
export type LabToolName = (typeof LAB_TOOLS)[keyof typeof LAB_TOOLS];
export declare const LabIngestInputSchema: z.ZodObject<{
    result: z.ZodObject<{
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
}, z.core.$strict>;
export declare const LabIngestOutputSchema: z.ZodObject<{
    sourcesStored: z.ZodNumber;
    pagesTouched: z.ZodNumber;
    claimsAdded: z.ZodNumber;
}, z.core.$strict>;
export declare const LabQueryInputSchema: z.ZodObject<{
    question: z.ZodString;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const LabQueryOutputSchema: z.ZodObject<{
    pages: z.ZodArray<z.ZodObject<{
        agentId: z.ZodString;
        slug: z.ZodString;
        kind: z.ZodString;
        title: z.ZodString;
        body: z.ZodString;
        version: z.ZodNumber;
        updatedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
    claims: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        pageSlug: z.ZodString;
        text: z.ZodString;
        sourceIds: z.ZodArray<z.ZodString>;
        status: z.ZodEnum<{
            aperta: "aperta";
            confermata: "confermata";
            contraddetta: "contraddetta";
            scartata: "scartata";
        }>;
        origin: z.ZodEnum<{
            web: "web";
            dataset: "dataset";
            human: "human";
        }>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const LabGapsInputSchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const LabGapsOutputSchema: z.ZodObject<{
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
}, z.core.$strict>;
export declare const LabCompetenceInputSchema: z.ZodObject<{}, z.core.$strict>;
export declare const LabCompetenceOutputSchema: z.ZodObject<{
    nodes: z.ZodArray<z.ZodObject<{
        nodeId: z.ZodString;
        label: z.ZodString;
        parentId: z.ZodOptional<z.ZodString>;
        requires: z.ZodArray<z.ZodString>;
        level: z.ZodNumber;
        score: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type LabIngestInput = z.infer<typeof LabIngestInputSchema>;
export type LabIngestOutput = z.infer<typeof LabIngestOutputSchema>;
export type LabQueryInput = z.infer<typeof LabQueryInputSchema>;
export type LabQueryOutput = z.infer<typeof LabQueryOutputSchema>;
export type LabGapsInput = z.infer<typeof LabGapsInputSchema>;
export type LabGapsOutput = z.infer<typeof LabGapsOutputSchema>;
export type LabCompetenceInput = z.infer<typeof LabCompetenceInputSchema>;
export type LabCompetenceOutput = z.infer<typeof LabCompetenceOutputSchema>;
//# sourceMappingURL=tools.d.ts.map