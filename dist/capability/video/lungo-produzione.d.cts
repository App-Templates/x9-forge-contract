import { z } from 'zod';
export { VideoCostBasisSchema } from "./costo-passi.cjs";
export type { VideoCostBasis } from "./costo-passi.cjs";
export declare const VideoLongVoiceSettingsSchema: z.ZodObject<{
    provider: z.ZodEnum<{
        openai: "openai";
        elevenlabs: "elevenlabs";
    }>;
    model: z.ZodString;
    voice: z.ZodString;
}, z.core.$strict>;
export type VideoLongVoiceSettings = z.infer<typeof VideoLongVoiceSettingsSchema>;
/** Settings are chosen once per project; chapter assembly uses FFmpeg. */
export declare const VideoLongProductionSettingsSchema: z.ZodObject<{
    frameProvider: z.ZodEnum<{
        minimax: "minimax";
        fal: "fal";
        byteplus: "byteplus";
    }>;
    frameModel: z.ZodNullable<z.ZodString>;
    clipProvider: z.ZodEnum<{
        minimax: "minimax";
        fal: "fal";
        byteplus: "byteplus";
    }>;
    clipModel: z.ZodString;
    voice: z.ZodObject<{
        provider: z.ZodEnum<{
            openai: "openai";
            elevenlabs: "elevenlabs";
        }>;
        model: z.ZodString;
        voice: z.ZodString;
    }, z.core.$strict>;
    subtitles: z.ZodEnum<{
        morbidi: "morbidi";
        nessuno: "nessuno";
    }>;
}, z.core.$strict>;
export type VideoLongProductionSettings = z.infer<typeof VideoLongProductionSettingsSchema>;
/** Declaration order is the chapter production chain. */
export declare const VideoLongRunStageSchema: z.ZodEnum<{
    fotogrammi: "fotogrammi";
    clip: "clip";
    voce: "voce";
    montaggio: "montaggio";
}>;
export type VideoLongRunStage = z.infer<typeof VideoLongRunStageSchema>;
export declare const VideoLongRunStatusSchema: z.ZodEnum<{
    "da-fare": "da-fare";
    "in-corso": "in-corso";
    "da-approvare": "da-approvare";
    approvato: "approvato";
    fallito: "fallito";
    completo: "completo";
}>;
export type VideoLongRunStatus = z.infer<typeof VideoLongRunStatusSchema>;
export declare const VideoLongRunQuoteRequestSchema: z.ZodObject<{
    chapterIndex: z.ZodNumber;
    stage: z.ZodEnum<{
        fotogrammi: "fotogrammi";
        clip: "clip";
        voce: "voce";
        montaggio: "montaggio";
    }>;
}, z.core.$strict>;
export type VideoLongRunQuoteRequest = z.infer<typeof VideoLongRunQuoteRequestSchema>;
/** Unknown or expired tariffs use null, never a zero-cost placeholder.
 * The engine computes the 25% reserve and quote expiry against the project budget.
 */
export declare const VideoLongRunQuoteSchema: z.ZodObject<{
    id: z.ZodString;
    chapterIndex: z.ZodNumber;
    stage: z.ZodEnum<{
        fotogrammi: "fotogrammi";
        clip: "clip";
        voce: "voce";
        montaggio: "montaggio";
    }>;
    units: z.ZodNumber;
    unit: z.ZodEnum<{
        token: "token";
        clip: "clip";
        char: "char";
        second: "second";
        image: "image";
    }>;
    estimatedUsd: z.ZodNullable<z.ZodNumber>;
    reserveUsd: z.ZodNullable<z.ZodNumber>;
    remainingBudgetUsd: z.ZodNumber;
    tariffDate: z.ZodString;
    tariffFresh: z.ZodBoolean;
    expiresAt: z.ZodString;
}, z.core.$strict>;
export type VideoLongRunQuote = z.infer<typeof VideoLongRunQuoteSchema>;
export declare const VideoLongRunRequestSchema: z.ZodObject<{
    chapterIndex: z.ZodNumber;
    stage: z.ZodEnum<{
        fotogrammi: "fotogrammi";
        clip: "clip";
        voce: "voce";
        montaggio: "montaggio";
    }>;
    quoteId: z.ZodString;
    framesRevision: z.ZodNumber;
}, z.core.$strict>;
export type VideoLongRunRequest = z.infer<typeof VideoLongRunRequestSchema>;
export declare const VideoLongRunRefusalSchema: z.ZodEnum<{
    motore_non_disponibile: "motore_non_disponibile";
    piano_non_approvato: "piano_non_approvato";
    fotogrammi_non_approvati: "fotogrammi_non_approvati";
    preventivo_scaduto: "preventivo_scaduto";
    preventivo_diverso: "preventivo_diverso";
    tetto_superato: "tetto_superato";
    tariffa_scaduta: "tariffa_scaduta";
    fornitore_non_pronto: "fornitore_non_pronto";
    tappa_gia_in_corso: "tappa_gia_in_corso";
    esito_incerto: "esito_incerto";
    progetto_sconosciuto: "progetto_sconosciuto";
}>;
export type VideoLongRunRefusal = z.infer<typeof VideoLongRunRefusalSchema>;
/** The engine checks stage order, frame-only approvals and done == total on completion. */
export declare const VideoLongRunStageStateSchema: z.ZodObject<{
    stage: z.ZodEnum<{
        fotogrammi: "fotogrammi";
        clip: "clip";
        voce: "voce";
        montaggio: "montaggio";
    }>;
    status: z.ZodEnum<{
        "da-fare": "da-fare";
        "in-corso": "in-corso";
        "da-approvare": "da-approvare";
        approvato: "approvato";
        fallito: "fallito";
        completo: "completo";
    }>;
    done: z.ZodNumber;
    total: z.ZodNumber;
    reused: z.ZodNumber;
    estimatedUsd: z.ZodNumber;
    confirmedUsd: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
export type VideoLongRunStageState = z.infer<typeof VideoLongRunStageStateSchema>;
export declare const VideoLongFrameImageSchema: z.ZodObject<{
    shotIndex: z.ZodNumber;
    imagePath: z.ZodString;
    sha256: z.ZodString;
    /** Measured facial similarity; null means no measurement, not automatic approval. */
    similarity: z.ZodNullable<z.ZodNumber>;
    status: z.ZodEnum<{
        approvato: "approvato";
        generato: "generato";
        "da-rigenerare": "da-rigenerare";
    }>;
}, z.core.$strict>;
export type VideoLongFrameImage = z.infer<typeof VideoLongFrameImageSchema>;
export declare const VideoLongChapterFramesSchema: z.ZodObject<{
    chapterIndex: z.ZodNumber;
    revision: z.ZodNumber;
    status: z.ZodEnum<{
        "da-approvare": "da-approvare";
        approvati: "approvati";
    }>;
    digest: z.ZodString;
    frames: z.ZodArray<z.ZodObject<{
        shotIndex: z.ZodNumber;
        imagePath: z.ZodString;
        sha256: z.ZodString;
        /** Measured facial similarity; null means no measurement, not automatic approval. */
        similarity: z.ZodNullable<z.ZodNumber>;
        status: z.ZodEnum<{
            approvato: "approvato";
            generato: "generato";
            "da-rigenerare": "da-rigenerare";
        }>;
    }, z.core.$strict>>;
    approvedAt: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type VideoLongChapterFrames = z.infer<typeof VideoLongChapterFramesSchema>;
export declare const VideoLongChapterFramesApproveRequestSchema: z.ZodObject<{
    revision: z.ZodNumber;
    digest: z.ZodString;
}, z.core.$strict>;
export type VideoLongChapterFramesApproveRequest = z.infer<typeof VideoLongChapterFramesApproveRequestSchema>;
export declare const VideoLongChapterVideoSchema: z.ZodObject<{
    path: z.ZodString;
    sha256: z.ZodString;
    seconds: z.ZodNumber;
}, z.core.$strict>;
export type VideoLongChapterVideo = z.infer<typeof VideoLongChapterVideoSchema>;
export declare const VideoLongChapterRunSchema: z.ZodObject<{
    chapterIndex: z.ZodNumber;
    batches: z.ZodNumber;
    stages: z.ZodArray<z.ZodObject<{
        stage: z.ZodEnum<{
            fotogrammi: "fotogrammi";
            clip: "clip";
            voce: "voce";
            montaggio: "montaggio";
        }>;
        status: z.ZodEnum<{
            "da-fare": "da-fare";
            "in-corso": "in-corso";
            "da-approvare": "da-approvare";
            approvato: "approvato";
            fallito: "fallito";
            completo: "completo";
        }>;
        done: z.ZodNumber;
        total: z.ZodNumber;
        reused: z.ZodNumber;
        estimatedUsd: z.ZodNumber;
        confirmedUsd: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>;
    chapterVideo: z.ZodNullable<z.ZodObject<{
        path: z.ZodString;
        sha256: z.ZodString;
        seconds: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoLongChapterRun = z.infer<typeof VideoLongChapterRunSchema>;
/** The engine checks consecutive chapter indexes and a timeline without gaps. */
export declare const VideoLongFinalVideoSchema: z.ZodObject<{
    path: z.ZodString;
    sha256: z.ZodString;
    seconds: z.ZodNumber;
    aspectRatio: z.ZodLiteral<"16:9">;
    chapters: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        startSeconds: z.ZodNumber;
        seconds: z.ZodNumber;
    }, z.core.$strict>>;
    subtitles: z.ZodBoolean;
    createdAt: z.ZodString;
}, z.core.$strict>;
export type VideoLongFinalVideo = z.infer<typeof VideoLongFinalVideoSchema>;
export declare const VideoLongJoinRequestSchema: z.ZodObject<{
    framesRevision: z.ZodNumber;
}, z.core.$strict>;
export type VideoLongJoinRequest = z.infer<typeof VideoLongJoinRequestSchema>;
export declare const VideoLongProductionSchema: z.ZodObject<{
    projectId: z.ZodString;
    settings: z.ZodNullable<z.ZodObject<{
        frameProvider: z.ZodEnum<{
            minimax: "minimax";
            fal: "fal";
            byteplus: "byteplus";
        }>;
        frameModel: z.ZodNullable<z.ZodString>;
        clipProvider: z.ZodEnum<{
            minimax: "minimax";
            fal: "fal";
            byteplus: "byteplus";
        }>;
        clipModel: z.ZodString;
        voice: z.ZodObject<{
            provider: z.ZodEnum<{
                openai: "openai";
                elevenlabs: "elevenlabs";
            }>;
            model: z.ZodString;
            voice: z.ZodString;
        }, z.core.$strict>;
        subtitles: z.ZodEnum<{
            morbidi: "morbidi";
            nessuno: "nessuno";
        }>;
    }, z.core.$strict>>;
    chapters: z.ZodArray<z.ZodObject<{
        chapterIndex: z.ZodNumber;
        batches: z.ZodNumber;
        stages: z.ZodArray<z.ZodObject<{
            stage: z.ZodEnum<{
                fotogrammi: "fotogrammi";
                clip: "clip";
                voce: "voce";
                montaggio: "montaggio";
            }>;
            status: z.ZodEnum<{
                "da-fare": "da-fare";
                "in-corso": "in-corso";
                "da-approvare": "da-approvare";
                approvato: "approvato";
                fallito: "fallito";
                completo: "completo";
            }>;
            done: z.ZodNumber;
            total: z.ZodNumber;
            reused: z.ZodNumber;
            estimatedUsd: z.ZodNumber;
            confirmedUsd: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>>;
        chapterVideo: z.ZodNullable<z.ZodObject<{
            path: z.ZodString;
            sha256: z.ZodString;
            seconds: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    finalVideo: z.ZodNullable<z.ZodObject<{
        path: z.ZodString;
        sha256: z.ZodString;
        seconds: z.ZodNumber;
        aspectRatio: z.ZodLiteral<"16:9">;
        chapters: z.ZodArray<z.ZodObject<{
            index: z.ZodNumber;
            startSeconds: z.ZodNumber;
            seconds: z.ZodNumber;
        }, z.core.$strict>>;
        subtitles: z.ZodBoolean;
        createdAt: z.ZodString;
    }, z.core.$strict>>;
    updatedAt: z.ZodString;
}, z.core.$strict>;
export type VideoLongProduction = z.infer<typeof VideoLongProductionSchema>;
//# sourceMappingURL=lungo-produzione.d.ts.map