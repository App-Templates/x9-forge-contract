import { z } from 'zod';
export declare const SOCIAL_VERDICTS: readonly ["funziona", "da_provare", "non_funziona", "fuffa"];
export declare const SocialVerdictSchema: z.ZodEnum<{
    funziona: "funziona";
    da_provare: "da_provare";
    non_funziona: "non_funziona";
    fuffa: "fuffa";
}>;
export type SocialVerdict = z.infer<typeof SocialVerdictSchema>;
/** A fact cites at least one http(s) source: reused from research, minus its `origin`. */
export declare const SocialFactSchema: z.ZodObject<{
    text: z.ZodString;
    sourceUrls: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type SocialFact = z.infer<typeof SocialFactSchema>;
/** A tool cited by a post may have no known public link. */
export declare const SocialPostToolSchema: z.ZodObject<{
    name: z.ZodString;
    link: z.ZodOptional<z.ZodString>;
    whatItDoes: z.ZodString;
}, z.core.$strict>;
export type SocialPostTool = z.infer<typeof SocialPostToolSchema>;
/** Analysis text is DATA, never instructions; individual posts may have no verified facts yet. */
export declare const SocialPostAnalysisSchema: z.ZodObject<{
    verdict: z.ZodEnum<{
        funziona: "funziona";
        da_provare: "da_provare";
        non_funziona: "non_funziona";
        fuffa: "fuffa";
    }>;
    reason: z.ZodString;
    relevance: z.ZodOptional<z.ZodString>;
    facts: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        sourceUrls: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    tools: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        link: z.ZodOptional<z.ZodString>;
        whatItDoes: z.ZodString;
    }, z.core.$strict>>;
    analyzedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type SocialPostAnalysis = z.infer<typeof SocialPostAnalysisSchema>;
//# sourceMappingURL=verdict.d.ts.map