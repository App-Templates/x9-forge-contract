import { z } from 'zod';
export declare const VideoLongChapterSchema: z.ZodObject<{
    index: z.ZodNumber;
    title: z.ZodString;
    summary: z.ZodString;
    targetSeconds: z.ZodNumber;
}, z.core.$strict>;
export type VideoLongChapter = z.infer<typeof VideoLongChapterSchema>;
/** Consumption of the draft step; `measured: false` means the numbers are estimates. */
export declare const VideoLongUsageSchema: z.ZodObject<{
    provider: z.ZodString;
    model: z.ZodString;
    inputTokens: z.ZodNumber;
    outputTokens: z.ZodNumber;
    measured: z.ZodBoolean;
}, z.core.$strict>;
export type VideoLongUsage = z.infer<typeof VideoLongUsageSchema>;
/**
 * What the director writes and the engine receives. The engine checks that the
 * chapter total equals `totalSeconds` and that indexes are consecutive.
 */
export declare const VideoLongDraftDocumentSchema: z.ZodObject<{
    logline: z.ZodString;
    thesis: z.ZodString;
    paragraphs: z.ZodArray<z.ZodString>;
    chapters: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        title: z.ZodString;
        summary: z.ZodString;
        targetSeconds: z.ZodNumber;
    }, z.core.$strict>>;
    usage: z.ZodNullable<z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        inputTokens: z.ZodNumber;
        outputTokens: z.ZodNumber;
        measured: z.ZodBoolean;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoLongDraftDocument = z.infer<typeof VideoLongDraftDocumentSchema>;
export declare const VideoLongDraftStatusSchema: z.ZodEnum<{
    bozza: "bozza";
    approvata: "approvata";
}>;
export type VideoLongDraftStatus = z.infer<typeof VideoLongDraftStatusSchema>;
export declare const VideoLongDraftSchema: z.ZodObject<{
    revision: z.ZodNumber;
    status: z.ZodEnum<{
        bozza: "bozza";
        approvata: "approvata";
    }>;
    logline: z.ZodString;
    thesis: z.ZodString;
    paragraphs: z.ZodArray<z.ZodString>;
    chapters: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        title: z.ZodString;
        summary: z.ZodString;
        targetSeconds: z.ZodNumber;
    }, z.core.$strict>>;
    usage: z.ZodNullable<z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        inputTokens: z.ZodNumber;
        outputTokens: z.ZodNumber;
        measured: z.ZodBoolean;
    }, z.core.$strict>>;
    totalSeconds: z.ZodNumber;
    digest: z.ZodString;
    approvedAt: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type VideoLongDraft = z.infer<typeof VideoLongDraftSchema>;
/** The approval names the revision and the digest the person has seen. */
export declare const VideoLongDraftApproveRequestSchema: z.ZodObject<{
    revision: z.ZodNumber;
    digest: z.ZodString;
}, z.core.$strict>;
export type VideoLongDraftApproveRequest = z.infer<typeof VideoLongDraftApproveRequestSchema>;
//# sourceMappingURL=lungo-bozza.d.ts.map