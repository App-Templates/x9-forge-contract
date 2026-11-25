import { z } from 'zod';
export declare const VIDEO_LONG_CREATE_TOOL = "video_long_create";
export declare const VIDEO_LONG_LIST_TOOL = "video_long_list";
export declare const VIDEO_LONG_GET_TOOL = "video_long_get";
export declare const VIDEO_LONG_DRAFT_PUT_TOOL = "video_long_draft_put";
export declare const VIDEO_LONG_DRAFT_GET_TOOL = "video_long_draft_get";
export declare const VIDEO_LONG_DRAFT_APPROVE_TOOL = "video_long_draft_approve";
export declare const VIDEO_LONG_COST_GET_TOOL = "video_long_cost_get";
/** Identity comes only from the admitted tool envelope (R-33). */
export declare const VideoLongCreateToolInputSchema: z.ZodObject<{
    name: z.ZodString;
    family: z.ZodEnum<{
        essay: "essay";
        podcast: "podcast";
        brand: "brand";
        microdrama: "microdrama";
    }>;
    presetId: z.ZodString;
    aspectRatio: z.ZodEnum<{
        "9:16": "9:16";
        "16:9": "16:9";
        "1:1": "1:1";
    }>;
    durationSeconds: z.ZodNumber;
    modelId: z.ZodNullable<z.ZodString>;
    brief: z.ZodString;
    budgetUsd: z.ZodNumber;
    environmentId: z.ZodOptional<z.ZodString>;
    environmentVersion: z.ZodOptional<z.ZodNumber>;
    followsProjectId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type VideoLongCreateToolInput = z.infer<typeof VideoLongCreateToolInputSchema>;
export declare const VideoLongListToolInputSchema: z.ZodObject<{}, z.core.$strict>;
export type VideoLongListToolInput = z.infer<typeof VideoLongListToolInputSchema>;
export declare const VideoLongGetToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
}, z.core.$strict>;
export type VideoLongGetToolInput = z.infer<typeof VideoLongGetToolInputSchema>;
/** cap-video supplies usage as null; the model cannot declare consumption. */
export declare const VideoLongDraftPutToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    logline: z.ZodString;
    thesis: z.ZodString;
    paragraphs: z.ZodArray<z.ZodString>;
    chapters: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        title: z.ZodString;
        summary: z.ZodString;
        targetSeconds: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoLongDraftPutToolInput = z.infer<typeof VideoLongDraftPutToolInputSchema>;
export declare const VideoLongDraftGetToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
}, z.core.$strict>;
export type VideoLongDraftGetToolInput = z.infer<typeof VideoLongDraftGetToolInputSchema>;
export declare const VideoLongDraftApproveToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    revision: z.ZodNumber;
    digest: z.ZodString;
}, z.core.$strict>;
export type VideoLongDraftApproveToolInput = z.infer<typeof VideoLongDraftApproveToolInputSchema>;
export declare const VideoLongCostGetToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
}, z.core.$strict>;
export type VideoLongCostGetToolInput = z.infer<typeof VideoLongCostGetToolInputSchema>;
export declare const VideoLongCreateToolResponseSchema: z.ZodObject<{
    steps: z.ZodArray<z.ZodObject<{
        step: z.ZodEnum<{
            video: "video";
            ricerca: "ricerca";
            bozza: "bozza";
            capitoli: "capitoli";
            fotogrammi: "fotogrammi";
        }>;
        status: z.ZodEnum<{
            "da-fare": "da-fare";
            "in-corso": "in-corso";
            "da-approvare": "da-approvare";
            approvato: "approvato";
            fallito: "fallito";
        }>;
    }, z.core.$strict>>;
    createdAt: z.ZodString;
    name: z.ZodString;
    family: z.ZodEnum<{
        essay: "essay";
        podcast: "podcast";
        brand: "brand";
        microdrama: "microdrama";
    }>;
    presetId: z.ZodString;
    aspectRatio: z.ZodEnum<{
        "9:16": "9:16";
        "16:9": "16:9";
        "1:1": "1:1";
    }>;
    durationSeconds: z.ZodNumber;
    modelId: z.ZodNullable<z.ZodString>;
    brief: z.ZodString;
    budgetUsd: z.ZodNumber;
    environmentId: z.ZodOptional<z.ZodString>;
    environmentVersion: z.ZodOptional<z.ZodNumber>;
    followsProjectId: z.ZodOptional<z.ZodString>;
    id: z.ZodString;
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type VideoLongCreateToolResponse = z.infer<typeof VideoLongCreateToolResponseSchema>;
export declare const VideoLongListToolResponseSchema: z.ZodObject<{
    projects: z.ZodArray<z.ZodObject<{
        steps: z.ZodArray<z.ZodObject<{
            step: z.ZodEnum<{
                video: "video";
                ricerca: "ricerca";
                bozza: "bozza";
                capitoli: "capitoli";
                fotogrammi: "fotogrammi";
            }>;
            status: z.ZodEnum<{
                "da-fare": "da-fare";
                "in-corso": "in-corso";
                "da-approvare": "da-approvare";
                approvato: "approvato";
                fallito: "fallito";
            }>;
        }, z.core.$strict>>;
        createdAt: z.ZodString;
        name: z.ZodString;
        family: z.ZodEnum<{
            essay: "essay";
            podcast: "podcast";
            brand: "brand";
            microdrama: "microdrama";
        }>;
        presetId: z.ZodString;
        aspectRatio: z.ZodEnum<{
            "9:16": "9:16";
            "16:9": "16:9";
            "1:1": "1:1";
        }>;
        durationSeconds: z.ZodNumber;
        modelId: z.ZodNullable<z.ZodString>;
        brief: z.ZodString;
        budgetUsd: z.ZodNumber;
        environmentId: z.ZodOptional<z.ZodString>;
        environmentVersion: z.ZodOptional<z.ZodNumber>;
        followsProjectId: z.ZodOptional<z.ZodString>;
        id: z.ZodString;
        identity: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoLongListToolResponse = z.infer<typeof VideoLongListToolResponseSchema>;
export declare const VideoLongGetToolResponseSchema: z.ZodObject<{
    steps: z.ZodArray<z.ZodObject<{
        step: z.ZodEnum<{
            video: "video";
            ricerca: "ricerca";
            bozza: "bozza";
            capitoli: "capitoli";
            fotogrammi: "fotogrammi";
        }>;
        status: z.ZodEnum<{
            "da-fare": "da-fare";
            "in-corso": "in-corso";
            "da-approvare": "da-approvare";
            approvato: "approvato";
            fallito: "fallito";
        }>;
    }, z.core.$strict>>;
    createdAt: z.ZodString;
    name: z.ZodString;
    family: z.ZodEnum<{
        essay: "essay";
        podcast: "podcast";
        brand: "brand";
        microdrama: "microdrama";
    }>;
    presetId: z.ZodString;
    aspectRatio: z.ZodEnum<{
        "9:16": "9:16";
        "16:9": "16:9";
        "1:1": "1:1";
    }>;
    durationSeconds: z.ZodNumber;
    modelId: z.ZodNullable<z.ZodString>;
    brief: z.ZodString;
    budgetUsd: z.ZodNumber;
    environmentId: z.ZodOptional<z.ZodString>;
    environmentVersion: z.ZodOptional<z.ZodNumber>;
    followsProjectId: z.ZodOptional<z.ZodString>;
    id: z.ZodString;
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type VideoLongGetToolResponse = z.infer<typeof VideoLongGetToolResponseSchema>;
export declare const VideoLongDraftGetToolResponseSchema: z.ZodObject<{
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
export type VideoLongDraftGetToolResponse = z.infer<typeof VideoLongDraftGetToolResponseSchema>;
export declare const VideoLongCostGetToolResponseSchema: z.ZodObject<{
    projectId: z.ZodString;
    steps: z.ZodArray<z.ZodObject<{
        step: z.ZodEnum<{
            video: "video";
            ricerca: "ricerca";
            bozza: "bozza";
            capitoli: "capitoli";
            fotogrammi: "fotogrammi";
        }>;
        estimatedUsd: z.ZodNumber;
        confirmedUsd: z.ZodNumber;
        entries: z.ZodArray<z.ZodObject<{
            step: z.ZodEnum<{
                video: "video";
                ricerca: "ricerca";
                bozza: "bozza";
                capitoli: "capitoli";
                fotogrammi: "fotogrammi";
            }>;
            provider: z.ZodString;
            model: z.ZodString;
            quantity: z.ZodNumber;
            unit: z.ZodEnum<{
                token: "token";
                clip: "clip";
                char: "char";
                second: "second";
                image: "image";
            }>;
            costUsd: z.ZodNumber;
            basis: z.ZodEnum<{
                misurato: "misurato";
                stimato: "stimato";
                "non-misurato": "non-misurato";
            }>;
            chapterIndex: z.ZodOptional<z.ZodNumber>;
            at: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    totalUsd: z.ZodNumber;
    finishedSeconds: z.ZodNullable<z.ZodNumber>;
    usdPerMinute: z.ZodNullable<z.ZodNumber>;
    models: z.ZodOptional<z.ZodArray<z.ZodObject<{
        step: z.ZodEnum<{
            video: "video";
            ricerca: "ricerca";
            bozza: "bozza";
            capitoli: "capitoli";
            fotogrammi: "fotogrammi";
        }>;
        provider: z.ZodString;
        model: z.ZodString;
        quantity: z.ZodNumber;
        unit: z.ZodEnum<{
            token: "token";
            clip: "clip";
            char: "char";
            second: "second";
            image: "image";
        }>;
        costUsd: z.ZodNumber;
        basis: z.ZodEnum<{
            misurato: "misurato";
            stimato: "stimato";
            "non-misurato": "non-misurato";
        }>;
    }, z.core.$strict>>>;
    chapters: z.ZodOptional<z.ZodArray<z.ZodObject<{
        chapterIndex: z.ZodNumber;
        costUsd: z.ZodNumber;
        seconds: z.ZodNullable<z.ZodNumber>;
        usdPerMinute: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>>;
    usdPerMinuteBasis: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        misurato: "misurato";
        stimato: "stimato";
        "non-misurato": "non-misurato";
    }>>>;
    unmeasuredEntries: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type VideoLongCostGetToolResponse = z.infer<typeof VideoLongCostGetToolResponseSchema>;
export declare const VideoLongDraftPutToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"salvata">;
    draft: z.ZodObject<{
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
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
        motore_non_disponibile: "motore_non_disponibile";
        progetto_sconosciuto: "progetto_sconosciuto";
        somma_capitoli: "somma_capitoli";
        indici_non_consecutivi: "indici_non_consecutivi";
        gia_approvata: "gia_approvata";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoLongDraftPutToolResponse = z.infer<typeof VideoLongDraftPutToolResponseSchema>;
export declare const VideoLongDraftApproveToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"approvata">;
    draft: z.ZodObject<{
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
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
        revisione_cambiata: "revisione_cambiata";
        impronta_diversa: "impronta_diversa";
        motore_non_disponibile: "motore_non_disponibile";
        progetto_sconosciuto: "progetto_sconosciuto";
        gia_approvata: "gia_approvata";
        bozza_mancante: "bozza_mancante";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoLongDraftApproveToolResponse = z.infer<typeof VideoLongDraftApproveToolResponseSchema>;
//# sourceMappingURL=lungo-tool.d.ts.map