import { z } from 'zod';
export declare const VIDEO_LONG_FRAMES_PUT_TOOL = "video_long_frames_put";
export declare const VIDEO_LONG_FRAMES_GET_TOOL = "video_long_frames_get";
export declare const VIDEO_LONG_FRAMES_APPROVE_TOOL = "video_long_frames_approve";
export declare const VIDEO_LONG_PRODUCTION_SETTINGS_PUT_TOOL = "video_long_production_settings_put";
export declare const VIDEO_LONG_PRODUCTION_GET_TOOL = "video_long_production_get";
export declare const VIDEO_LONG_RUN_QUOTE_TOOL = "video_long_run_quote";
export declare const VIDEO_LONG_RUN_START_TOOL = "video_long_run_start";
export declare const VIDEO_LONG_CHAPTER_FRAMES_GET_TOOL = "video_long_chapter_frames_get";
export declare const VIDEO_LONG_CHAPTER_FRAMES_APPROVE_TOOL = "video_long_chapter_frames_approve";
export declare const VIDEO_LONG_JOIN_TOOL = "video_long_join";
export declare const VIDEO_LONG_VIDEO_GET_TOOL = "video_long_video_get";
/** Identity comes only from the admitted envelope (R-33). cap-video supplies null usage. */
export declare const VideoLongFramesPutToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    chaptersRevision: z.ZodNumber;
    chapters: z.ZodArray<z.ZodObject<{
        chapterIndex: z.ZodNumber;
        shots: z.ZodArray<z.ZodObject<{
            index: z.ZodNumber;
            framing: z.ZodEnum<{
                intervista: "intervista";
                immagini: "immagini";
                ambiente: "ambiente";
                grafica: "grafica";
            }>;
            description: z.ZodString;
            motion: z.ZodString;
            seconds: z.ZodNumber;
            render: z.ZodEnum<{
                clip: "clip";
                fermo: "fermo";
            }>;
            narration: z.ZodString;
            environmentAngle: z.ZodNullable<z.ZodString>;
            withCharacter: z.ZodBoolean;
            sourceId: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoLongFramesPutToolInput = z.infer<typeof VideoLongFramesPutToolInputSchema>;
export declare const VideoLongFramesGetToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
}, z.core.$strict>;
export type VideoLongFramesGetToolInput = z.infer<typeof VideoLongFramesGetToolInputSchema>;
export declare const VideoLongFramesApproveToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    revision: z.ZodNumber;
    digest: z.ZodString;
}, z.core.$strict>;
export type VideoLongFramesApproveToolInput = z.infer<typeof VideoLongFramesApproveToolInputSchema>;
export declare const VideoLongProductionSettingsPutToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
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
export type VideoLongProductionSettingsPutToolInput = z.infer<typeof VideoLongProductionSettingsPutToolInputSchema>;
export declare const VideoLongProductionGetToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
}, z.core.$strict>;
export type VideoLongProductionGetToolInput = z.infer<typeof VideoLongProductionGetToolInputSchema>;
export declare const VideoLongRunQuoteToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    chapterIndex: z.ZodNumber;
    stage: z.ZodEnum<{
        fotogrammi: "fotogrammi";
        clip: "clip";
        voce: "voce";
        montaggio: "montaggio";
    }>;
}, z.core.$strict>;
export type VideoLongRunQuoteToolInput = z.infer<typeof VideoLongRunQuoteToolInputSchema>;
export declare const VideoLongRunStartToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
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
export type VideoLongRunStartToolInput = z.infer<typeof VideoLongRunStartToolInputSchema>;
export declare const VideoLongChapterFramesGetToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    chapterIndex: z.ZodNumber;
}, z.core.$strict>;
export type VideoLongChapterFramesGetToolInput = z.infer<typeof VideoLongChapterFramesGetToolInputSchema>;
export declare const VideoLongChapterFramesApproveToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    chapterIndex: z.ZodNumber;
    revision: z.ZodNumber;
    digest: z.ZodString;
}, z.core.$strict>;
export type VideoLongChapterFramesApproveToolInput = z.infer<typeof VideoLongChapterFramesApproveToolInputSchema>;
export declare const VideoLongJoinToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    framesRevision: z.ZodNumber;
}, z.core.$strict>;
export type VideoLongJoinToolInput = z.infer<typeof VideoLongJoinToolInputSchema>;
export declare const VideoLongVideoGetToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
}, z.core.$strict>;
export type VideoLongVideoGetToolInput = z.infer<typeof VideoLongVideoGetToolInputSchema>;
export declare const VideoLongFramesGetToolResponseSchema: z.ZodObject<{
    chaptersRevision: z.ZodNumber;
    chapters: z.ZodArray<z.ZodObject<{
        chapterIndex: z.ZodNumber;
        shots: z.ZodArray<z.ZodObject<{
            index: z.ZodNumber;
            framing: z.ZodEnum<{
                intervista: "intervista";
                immagini: "immagini";
                ambiente: "ambiente";
                grafica: "grafica";
            }>;
            description: z.ZodString;
            motion: z.ZodString;
            seconds: z.ZodNumber;
            render: z.ZodEnum<{
                clip: "clip";
                fermo: "fermo";
            }>;
            narration: z.ZodString;
            environmentAngle: z.ZodNullable<z.ZodString>;
            withCharacter: z.ZodBoolean;
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
    shotCount: z.ZodNumber;
    interviewShare: z.ZodNumber;
    warnings: z.ZodArray<z.ZodString>;
    digest: z.ZodString;
    approvedAt: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type VideoLongFramesGetToolResponse = z.infer<typeof VideoLongFramesGetToolResponseSchema>;
export declare const VideoLongProductionGetToolResponseSchema: z.ZodObject<{
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
export type VideoLongProductionGetToolResponse = z.infer<typeof VideoLongProductionGetToolResponseSchema>;
export declare const VideoLongChapterFramesGetToolResponseSchema: z.ZodObject<{
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
        similarity: z.ZodNullable<z.ZodNumber>;
        status: z.ZodEnum<{
            approvato: "approvato";
            generato: "generato";
            "da-rigenerare": "da-rigenerare";
        }>;
    }, z.core.$strict>>;
    approvedAt: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type VideoLongChapterFramesGetToolResponse = z.infer<typeof VideoLongChapterFramesGetToolResponseSchema>;
export declare const VideoLongVideoGetToolResponseSchema: z.ZodObject<{
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
export type VideoLongVideoGetToolResponse = z.infer<typeof VideoLongVideoGetToolResponseSchema>;
export declare const VideoLongFramesPutToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"salvato">;
    frames: z.ZodObject<{
        chaptersRevision: z.ZodNumber;
        chapters: z.ZodArray<z.ZodObject<{
            chapterIndex: z.ZodNumber;
            shots: z.ZodArray<z.ZodObject<{
                index: z.ZodNumber;
                framing: z.ZodEnum<{
                    intervista: "intervista";
                    immagini: "immagini";
                    ambiente: "ambiente";
                    grafica: "grafica";
                }>;
                description: z.ZodString;
                motion: z.ZodString;
                seconds: z.ZodNumber;
                render: z.ZodEnum<{
                    clip: "clip";
                    fermo: "fermo";
                }>;
                narration: z.ZodString;
                environmentAngle: z.ZodNullable<z.ZodString>;
                withCharacter: z.ZodBoolean;
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
        shotCount: z.ZodNumber;
        interviewShare: z.ZodNumber;
        warnings: z.ZodArray<z.ZodString>;
        digest: z.ZodString;
        approvedAt: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
        revisione_cambiata: "revisione_cambiata";
        motore_non_disponibile: "motore_non_disponibile";
        progetto_sconosciuto: "progetto_sconosciuto";
        durata_fuori_misura: "durata_fuori_misura";
        capitoli_non_approvati: "capitoli_non_approvati";
        capitoli_diversi: "capitoli_diversi";
        inquadrature_non_valide: "inquadrature_non_valide";
        parlato_troppo_lungo: "parlato_troppo_lungo";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoLongFramesPutToolResponse = z.infer<typeof VideoLongFramesPutToolResponseSchema>;
export declare const VideoLongFramesApproveToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"approvato">;
    frames: z.ZodObject<{
        chaptersRevision: z.ZodNumber;
        chapters: z.ZodArray<z.ZodObject<{
            chapterIndex: z.ZodNumber;
            shots: z.ZodArray<z.ZodObject<{
                index: z.ZodNumber;
                framing: z.ZodEnum<{
                    intervista: "intervista";
                    immagini: "immagini";
                    ambiente: "ambiente";
                    grafica: "grafica";
                }>;
                description: z.ZodString;
                motion: z.ZodString;
                seconds: z.ZodNumber;
                render: z.ZodEnum<{
                    clip: "clip";
                    fermo: "fermo";
                }>;
                narration: z.ZodString;
                environmentAngle: z.ZodNullable<z.ZodString>;
                withCharacter: z.ZodBoolean;
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
        shotCount: z.ZodNumber;
        interviewShare: z.ZodNumber;
        warnings: z.ZodArray<z.ZodString>;
        digest: z.ZodString;
        approvedAt: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
        impronta_diversa: "impronta_diversa";
        motore_non_disponibile: "motore_non_disponibile";
        progetto_sconosciuto: "progetto_sconosciuto";
        revisione_superata: "revisione_superata";
        capitoli_non_approvati: "capitoli_non_approvati";
        capitoli_cambiati: "capitoli_cambiati";
        piano_non_trovato: "piano_non_trovato";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoLongFramesApproveToolResponse = z.infer<typeof VideoLongFramesApproveToolResponseSchema>;
export declare const VideoLongProductionSettingsPutToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"salvate">;
    production: z.ZodObject<{
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
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
        motore_non_disponibile: "motore_non_disponibile";
        piano_non_approvato: "piano_non_approvato";
        fornitore_non_pronto: "fornitore_non_pronto";
        tappa_gia_in_corso: "tappa_gia_in_corso";
        progetto_sconosciuto: "progetto_sconosciuto";
        impostazioni_non_valide: "impostazioni_non_valide";
        impostazioni_bloccate: "impostazioni_bloccate";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoLongProductionSettingsPutToolResponse = z.infer<typeof VideoLongProductionSettingsPutToolResponseSchema>;
export declare const VideoLongRunQuoteToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"preventivo">;
    quote: z.ZodObject<{
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
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
        motore_non_disponibile: "motore_non_disponibile";
        piano_non_approvato: "piano_non_approvato";
        fotogrammi_non_approvati: "fotogrammi_non_approvati";
        tariffa_scaduta: "tariffa_scaduta";
        fornitore_non_pronto: "fornitore_non_pronto";
        progetto_sconosciuto: "progetto_sconosciuto";
        voce_mancante: "voce_mancante";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoLongRunQuoteToolResponse = z.infer<typeof VideoLongRunQuoteToolResponseSchema>;
export declare const VideoLongRunStartToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"avviata">;
    production: z.ZodObject<{
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
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
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
        voce_mancante: "voce_mancante";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoLongRunStartToolResponse = z.infer<typeof VideoLongRunStartToolResponseSchema>;
export declare const VideoLongChapterFramesApproveToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"approvati">;
    frames: z.ZodObject<{
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
            similarity: z.ZodNullable<z.ZodNumber>;
            status: z.ZodEnum<{
                approvato: "approvato";
                generato: "generato";
                "da-rigenerare": "da-rigenerare";
            }>;
        }, z.core.$strict>>;
        approvedAt: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
        impronta_diversa: "impronta_diversa";
        motore_non_disponibile: "motore_non_disponibile";
        progetto_sconosciuto: "progetto_sconosciuto";
        revisione_superata: "revisione_superata";
        fotogrammi_non_trovati: "fotogrammi_non_trovati";
        piano_cambiato: "piano_cambiato";
        fotogrammi_da_rigenerare: "fotogrammi_da_rigenerare";
        fotogrammi_incompleti: "fotogrammi_incompleti";
        capitolo_non_trovato: "capitolo_non_trovato";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoLongChapterFramesApproveToolResponse = z.infer<typeof VideoLongChapterFramesApproveToolResponseSchema>;
export declare const VideoLongJoinToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"unito">;
    video: z.ZodObject<{
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
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
        motore_non_disponibile: "motore_non_disponibile";
        fotogrammi_non_approvati: "fotogrammi_non_approvati";
        progetto_sconosciuto: "progetto_sconosciuto";
        piano_cambiato: "piano_cambiato";
        capitoli_incompleti: "capitoli_incompleti";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoLongJoinToolResponse = z.infer<typeof VideoLongJoinToolResponseSchema>;
//# sourceMappingURL=lungo-produzione-tool.d.ts.map