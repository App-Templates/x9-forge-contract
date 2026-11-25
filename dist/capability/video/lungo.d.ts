import { z } from 'zod';
export declare const VIDEO_LONG_MIN_SECONDS = 120;
export declare const VIDEO_LONG_MAX_SECONDS = 1200;
export declare const VIDEO_LONG_MAX_CHAPTERS = 24;
export declare const VideoLongProjectIdSchema: z.ZodString;
export type VideoLongProjectId = z.infer<typeof VideoLongProjectIdSchema>;
export declare const VideoLongFamilySchema: z.ZodEnum<{
    essay: "essay";
    podcast: "podcast";
    brand: "brand";
    microdrama: "microdrama";
}>;
export type VideoLongFamily = z.infer<typeof VideoLongFamilySchema>;
export declare const VideoLongStepSchema: z.ZodEnum<{
    video: "video";
    ricerca: "ricerca";
    bozza: "bozza";
    capitoli: "capitoli";
    fotogrammi: "fotogrammi";
}>;
export type VideoLongStep = z.infer<typeof VideoLongStepSchema>;
export declare const VideoLongStepStatusSchema: z.ZodEnum<{
    "da-fare": "da-fare";
    "in-corso": "in-corso";
    "da-approvare": "da-approvare";
    approvato: "approvato";
    fallito: "fallito";
}>;
export type VideoLongStepStatus = z.infer<typeof VideoLongStepStatusSchema>;
export declare const VideoLongStepStateSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type VideoLongStepState = z.infer<typeof VideoLongStepStateSchema>;
/** Query identity shared by all long-project calls. */
export declare const VideoLongScopeQuerySchema: z.ZodObject<{
    agentId: z.ZodString;
    ownerId: z.ZodString;
    tenantId: z.ZodString;
}, z.core.$strict>;
export type VideoLongScopeQuery = z.infer<typeof VideoLongScopeQuerySchema>;
export declare const VideoLongCreateRequestSchema: z.ZodObject<{
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
    requestedBy: z.ZodString;
}, z.core.$strict>;
export type VideoLongCreateRequest = z.infer<typeof VideoLongCreateRequestSchema>;
/** The engine checks cross-field consistency, including step order and uniqueness. */
export declare const VideoLongProjectSchema: z.ZodObject<{
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
export type VideoLongProject = z.infer<typeof VideoLongProjectSchema>;
export declare const VideoLongProjectListSchema: z.ZodObject<{
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
export type VideoLongProjectList = z.infer<typeof VideoLongProjectListSchema>;
//# sourceMappingURL=lungo.d.ts.map