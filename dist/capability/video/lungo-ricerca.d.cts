import { z } from 'zod';
export declare const VIDEO_LONG_RESEARCH_MAX_QUESTIONS = 12;
export declare const VIDEO_LONG_MAX_SOURCES = 60;
export declare const VIDEO_LONG_MAX_CLAIMS = 200;
export declare const VideoLongSourceSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodNullable<z.ZodString>;
    url: z.ZodNullable<z.ZodURL>;
    publisher: z.ZodNullable<z.ZodString>;
    excerpt: z.ZodString;
    origin: z.ZodEnum<{
        web: "web";
        dataset: "dataset";
        human: "human";
    }>;
    labPageSlug: z.ZodNullable<z.ZodString>;
    retrievedAt: z.ZodString;
}, z.core.$strict>;
export type VideoLongSource = z.infer<typeof VideoLongSourceSchema>;
export declare const VideoLongClaimSchema: z.ZodObject<{
    id: z.ZodString;
    text: z.ZodString;
    sourceIds: z.ZodArray<z.ZodString>;
    attributed: z.ZodBoolean;
}, z.core.$strict>;
export type VideoLongClaim = z.infer<typeof VideoLongClaimSchema>;
/** The engine checks source/claim references and links claims to chapters. */
export declare const VideoLongDossierDocumentSchema: z.ZodObject<{
    draftRevision: z.ZodNumber;
    researchIds: z.ZodArray<z.ZodString>;
    sources: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodNullable<z.ZodString>;
        url: z.ZodNullable<z.ZodURL>;
        publisher: z.ZodNullable<z.ZodString>;
        excerpt: z.ZodString;
        origin: z.ZodEnum<{
            web: "web";
            dataset: "dataset";
            human: "human";
        }>;
        labPageSlug: z.ZodNullable<z.ZodString>;
        retrievedAt: z.ZodString;
    }, z.core.$strict>>;
    claims: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
        sourceIds: z.ZodArray<z.ZodString>;
        attributed: z.ZodBoolean;
    }, z.core.$strict>>;
    /** null means cap-ricerca did not measure the cost. */
    costUsd: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
export type VideoLongDossierDocument = z.infer<typeof VideoLongDossierDocumentSchema>;
export declare const VideoLongDossierSchema: z.ZodObject<{
    draftRevision: z.ZodNumber;
    researchIds: z.ZodArray<z.ZodString>;
    sources: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodNullable<z.ZodString>;
        url: z.ZodNullable<z.ZodURL>;
        publisher: z.ZodNullable<z.ZodString>;
        excerpt: z.ZodString;
        origin: z.ZodEnum<{
            web: "web";
            dataset: "dataset";
            human: "human";
        }>;
        labPageSlug: z.ZodNullable<z.ZodString>;
        retrievedAt: z.ZodString;
    }, z.core.$strict>>;
    claims: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
        sourceIds: z.ZodArray<z.ZodString>;
        attributed: z.ZodBoolean;
    }, z.core.$strict>>;
    costUsd: z.ZodNullable<z.ZodNumber>;
    revision: z.ZodNumber;
    digest: z.ZodString;
    recordedAt: z.ZodString;
}, z.core.$strict>;
export type VideoLongDossier = z.infer<typeof VideoLongDossierSchema>;
/** The engine checks approval, revision/digest consistency and question uniqueness. */
export declare const VideoLongResearchStartRequestSchema: z.ZodObject<{
    draftRevision: z.ZodNumber;
    draftDigest: z.ZodString;
    questions: z.ZodArray<z.ZodString>;
    labClientId: z.ZodString;
    labProjectId: z.ZodString;
}, z.core.$strict>;
export type VideoLongResearchStartRequest = z.infer<typeof VideoLongResearchStartRequestSchema>;
export declare const VideoLongResearchSchema: z.ZodObject<{
    projectId: z.ZodString;
    draftRevision: z.ZodNumber;
    draftDigest: z.ZodString;
    state: z.ZodEnum<{
        failed: "failed";
        completed: "completed";
        queued: "queued";
        running: "running";
        budget_exhausted: "budget_exhausted";
    }>;
    gapsRef: z.ZodNullable<z.ZodString>;
    researchIds: z.ZodArray<z.ZodString>;
    startedAt: z.ZodString;
    finishedAt: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type VideoLongResearch = z.infer<typeof VideoLongResearchSchema>;
export declare const VideoLongResearchRefusalSchema: z.ZodEnum<{
    bozza_non_approvata: "bozza_non_approvata";
    revisione_cambiata: "revisione_cambiata";
    impronta_diversa: "impronta_diversa";
    ricerca_gia_avviata: "ricerca_gia_avviata";
    motore_non_disponibile: "motore_non_disponibile";
}>;
export type VideoLongResearchRefusal = z.infer<typeof VideoLongResearchRefusalSchema>;
/**
 * How a piece of a chapter is imagined: the person on the armchair, the footage
 * that starts afterwards, the place, or a graphic.
 */
export declare const VideoLongFramingSchema: z.ZodEnum<{
    intervista: "intervista";
    immagini: "immagini";
    ambiente: "ambiente";
    grafica: "grafica";
}>;
export type VideoLongFraming = z.infer<typeof VideoLongFramingSchema>;
export declare const VideoLongFrameHypothesisSchema: z.ZodObject<{
    description: z.ZodString;
    framing: z.ZodEnum<{
        intervista: "intervista";
        immagini: "immagini";
        ambiente: "ambiente";
        grafica: "grafica";
    }>;
    sourceId: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type VideoLongFrameHypothesis = z.infer<typeof VideoLongFrameHypothesisSchema>;
/** The draft chapter, unchanged, extended with sources and frame hypotheses. */
export declare const VideoLongResearchedChapterSchema: z.ZodObject<{
    index: z.ZodNumber;
    title: z.ZodString;
    summary: z.ZodString;
    targetSeconds: z.ZodNumber;
    sourceIds: z.ZodArray<z.ZodString>;
    frameHypotheses: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        framing: z.ZodEnum<{
            intervista: "intervista";
            immagini: "immagini";
            ambiente: "ambiente";
            grafica: "grafica";
        }>;
        sourceId: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoLongResearchedChapter = z.infer<typeof VideoLongResearchedChapterSchema>;
/** The engine checks consecutive indexes, sources present in the dossier and the total. */
export declare const VideoLongChaptersDocumentSchema: z.ZodObject<{
    draftRevision: z.ZodNumber;
    dossierRevision: z.ZodNumber;
    chapters: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        title: z.ZodString;
        summary: z.ZodString;
        targetSeconds: z.ZodNumber;
        sourceIds: z.ZodArray<z.ZodString>;
        frameHypotheses: z.ZodArray<z.ZodObject<{
            description: z.ZodString;
            framing: z.ZodEnum<{
                intervista: "intervista";
                immagini: "immagini";
                ambiente: "ambiente";
                grafica: "grafica";
            }>;
            sourceId: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    usage: z.ZodNullable<z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        inputTokens: z.ZodNumber;
        outputTokens: z.ZodNumber;
        measured: z.ZodBoolean;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoLongChaptersDocument = z.infer<typeof VideoLongChaptersDocumentSchema>;
export declare const VideoLongChaptersStatusSchema: z.ZodEnum<{
    "da-approvare": "da-approvare";
    approvati: "approvati";
}>;
export type VideoLongChaptersStatus = z.infer<typeof VideoLongChaptersStatusSchema>;
export declare const VideoLongChaptersSchema: z.ZodObject<{
    draftRevision: z.ZodNumber;
    dossierRevision: z.ZodNumber;
    chapters: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        title: z.ZodString;
        summary: z.ZodString;
        targetSeconds: z.ZodNumber;
        sourceIds: z.ZodArray<z.ZodString>;
        frameHypotheses: z.ZodArray<z.ZodObject<{
            description: z.ZodString;
            framing: z.ZodEnum<{
                intervista: "intervista";
                immagini: "immagini";
                ambiente: "ambiente";
                grafica: "grafica";
            }>;
            sourceId: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    usage: z.ZodNullable<z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        inputTokens: z.ZodNumber;
        outputTokens: z.ZodNumber;
        measured: z.ZodBoolean;
    }, z.core.$strict>>;
    revision: z.ZodNumber;
    status: z.ZodEnum<{
        "da-approvare": "da-approvare";
        approvati: "approvati";
    }>;
    totalSeconds: z.ZodNumber;
    digest: z.ZodString;
    approvedAt: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type VideoLongChapters = z.infer<typeof VideoLongChaptersSchema>;
export declare const VideoLongChaptersApproveRequestSchema: z.ZodObject<{
    revision: z.ZodNumber;
    digest: z.ZodString;
}, z.core.$strict>;
export type VideoLongChaptersApproveRequest = z.infer<typeof VideoLongChaptersApproveRequestSchema>;
//# sourceMappingURL=lungo-ricerca.d.ts.map