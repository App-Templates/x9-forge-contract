import { z } from 'zod';
export declare const VIDEO_LONG_RESEARCH_START_TOOL = "video_long_research_start";
export declare const VIDEO_LONG_RESEARCH_GET_TOOL = "video_long_research_get";
export declare const VIDEO_LONG_DOSSIER_GET_TOOL = "video_long_dossier_get";
export declare const VIDEO_LONG_CHAPTERS_PUT_TOOL = "video_long_chapters_put";
export declare const VIDEO_LONG_CHAPTERS_GET_TOOL = "video_long_chapters_get";
export declare const VIDEO_LONG_CHAPTERS_APPROVE_TOOL = "video_long_chapters_approve";
/**
 * Identity comes only from the admitted tool envelope (R-33); the lab scope
 * (labClientId, labProjectId) is filled in by cap-video, never by the model.
 */
export declare const VideoLongResearchStartToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    draftRevision: z.ZodNumber;
    draftDigest: z.ZodString;
    questions: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type VideoLongResearchStartToolInput = z.infer<typeof VideoLongResearchStartToolInputSchema>;
export declare const VideoLongResearchGetToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
}, z.core.$strict>;
export type VideoLongResearchGetToolInput = z.infer<typeof VideoLongResearchGetToolInputSchema>;
export declare const VideoLongDossierGetToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
}, z.core.$strict>;
export type VideoLongDossierGetToolInput = z.infer<typeof VideoLongDossierGetToolInputSchema>;
/** cap-video supplies usage as null; the model cannot declare consumption. */
export declare const VideoLongChaptersPutToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
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
}, z.core.$strict>;
export type VideoLongChaptersPutToolInput = z.infer<typeof VideoLongChaptersPutToolInputSchema>;
export declare const VideoLongChaptersGetToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
}, z.core.$strict>;
export type VideoLongChaptersGetToolInput = z.infer<typeof VideoLongChaptersGetToolInputSchema>;
export declare const VideoLongChaptersApproveToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    revision: z.ZodNumber;
    digest: z.ZodString;
}, z.core.$strict>;
export type VideoLongChaptersApproveToolInput = z.infer<typeof VideoLongChaptersApproveToolInputSchema>;
export declare const VideoLongResearchGetToolResponseSchema: z.ZodObject<{
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
export type VideoLongResearchGetToolResponse = z.infer<typeof VideoLongResearchGetToolResponseSchema>;
export declare const VideoLongDossierGetToolResponseSchema: z.ZodObject<{
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
export type VideoLongDossierGetToolResponse = z.infer<typeof VideoLongDossierGetToolResponseSchema>;
export declare const VideoLongChaptersGetToolResponseSchema: z.ZodObject<{
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
export type VideoLongChaptersGetToolResponse = z.infer<typeof VideoLongChaptersGetToolResponseSchema>;
export declare const VideoLongResearchStartToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"avviata">;
    research: z.ZodObject<{
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
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
        bozza_non_approvata: "bozza_non_approvata";
        revisione_cambiata: "revisione_cambiata";
        impronta_diversa: "impronta_diversa";
        ricerca_gia_avviata: "ricerca_gia_avviata";
        motore_non_disponibile: "motore_non_disponibile";
        richiesta_non_valida: "richiesta_non_valida";
        progetto_sconosciuto: "progetto_sconosciuto";
        lab_non_collegato: "lab_non_collegato";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoLongResearchStartToolResponse = z.infer<typeof VideoLongResearchStartToolResponseSchema>;
export declare const VideoLongChaptersPutToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"salvati">;
    chapters: z.ZodObject<{
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
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
        bozza_non_approvata: "bozza_non_approvata";
        revisione_cambiata: "revisione_cambiata";
        motore_non_disponibile: "motore_non_disponibile";
        progetto_sconosciuto: "progetto_sconosciuto";
        dossier_non_trovato: "dossier_non_trovato";
        dossier_cambiato: "dossier_cambiato";
        capitoli_non_validi: "capitoli_non_validi";
        durata_fuori_misura: "durata_fuori_misura";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoLongChaptersPutToolResponse = z.infer<typeof VideoLongChaptersPutToolResponseSchema>;
export declare const VideoLongChaptersApproveToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"approvati">;
    chapters: z.ZodObject<{
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
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
        bozza_non_approvata: "bozza_non_approvata";
        impronta_diversa: "impronta_diversa";
        motore_non_disponibile: "motore_non_disponibile";
        progetto_sconosciuto: "progetto_sconosciuto";
        dossier_cambiato: "dossier_cambiato";
        revisione_superata: "revisione_superata";
        capitoli_non_trovati: "capitoli_non_trovati";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoLongChaptersApproveToolResponse = z.infer<typeof VideoLongChaptersApproveToolResponseSchema>;
//# sourceMappingURL=lungo-ricerca-tool.d.ts.map