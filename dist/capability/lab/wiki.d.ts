import { z } from 'zod';
/**
 * An agent's wiki in cap-lab (v1.28.0, Phase 54) — an «LLM Wiki»: immutable raw sources, pages written and kept by
 * a model, the atomic claims each page makes with their sources, typed links between pages (the graph).
 *
 * DATA, NEVER INSTRUCTIONS: page bodies, claims, titles and sources come (directly or through a model) from the web,
 * datasets or people. Whoever puts them in front of a model marks them as data and never uses them as instructions
 * (same rule as the capability context, `../capability-context.ts`).
 */
export declare const WikiOriginSchema: z.ZodEnum<{
    web: "web";
    dataset: "dataset";
    human: "human";
}>;
export type WikiOrigin = z.infer<typeof WikiOriginSchema>;
export declare const WikiSourceIdSchema: z.ZodString;
export declare const WikiPageSlugSchema: z.ZodString;
export declare const WikiSourceSchema: z.ZodObject<{
    id: z.ZodString;
    agentId: z.ZodString;
    url: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    fetchedAt: z.ZodISODateTime;
    contentSha256: z.ZodString;
    origin: z.ZodEnum<{
        web: "web";
        dataset: "dataset";
        human: "human";
    }>;
}, z.core.$strict>;
export type WikiSource = z.infer<typeof WikiSourceSchema>;
export declare const WikiPageSchema: z.ZodObject<{
    agentId: z.ZodString;
    slug: z.ZodString;
    kind: z.ZodString;
    title: z.ZodString;
    body: z.ZodString;
    version: z.ZodNumber;
    updatedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type WikiPage = z.infer<typeof WikiPageSchema>;
export declare const WikiClaimStatusSchema: z.ZodEnum<{
    aperta: "aperta";
    confermata: "confermata";
    contraddetta: "contraddetta";
    scartata: "scartata";
}>;
export type WikiClaimStatus = z.infer<typeof WikiClaimStatusSchema>;
export declare const WikiClaimSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type WikiClaim = z.infer<typeof WikiClaimSchema>;
export declare const WikiLinkSchema: z.ZodObject<{
    from: z.ZodString;
    to: z.ZodString;
    kind: z.ZodString;
}, z.core.$strict>;
export type WikiLink = z.infer<typeof WikiLinkSchema>;
//# sourceMappingURL=wiki.d.ts.map