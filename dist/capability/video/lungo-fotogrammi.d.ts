import { z } from 'zod';
/** Bounds the size of the shot plan for a single chapter. */
export declare const VIDEO_LONG_MAX_SHOTS_PER_CHAPTER = 80;
/** Local stills may be shorter than the engine's four-second minimum for paid clips. */
export declare const VIDEO_LONG_MIN_SHOT_SECONDS = 2;
/** Provider clip ceiling (engine video_adapters.py). */
export declare const VIDEO_LONG_MAX_SHOT_SECONDS = 15;
/** Engine production limits; longer chapters are split into batches by the engine. */
export declare const VIDEO_LONG_BATCH_MAX_SCENES = 16;
export declare const VIDEO_LONG_BATCH_MAX_SECONDS = 120;
/** Working speech-rate estimate to measure, rather than an established fact. */
export declare const VIDEO_LONG_SPEECH_CHARS_PER_SECOND = 15;
/** Allowed difference in seconds between a chapter's shots and its target. */
export declare const VIDEO_LONG_SHOT_SUM_TOLERANCE = 0.1;
/** Docuseries rule 13: a working hypothesis for a warning, never a rejection. */
export declare const VIDEO_LONG_MAX_SECONDS_WITHOUT_INTERVIEW = 50;
/** Paid provider clip, or a local still with slow movement and no generation spend. */
export declare const VideoLongShotRenderSchema: z.ZodEnum<{
    clip: "clip";
    fermo: "fermo";
}>;
export type VideoLongShotRender = z.infer<typeof VideoLongShotRenderSchema>;
export declare const VideoLongShotSchema: z.ZodObject<{
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
    /** Empty when the preceding shot's narration continues over this image. */
    narration: z.ZodString;
    environmentAngle: z.ZodNullable<z.ZodString>;
    withCharacter: z.ZodBoolean;
    sourceId: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type VideoLongShot = z.infer<typeof VideoLongShotSchema>;
export declare const VideoLongChapterShotsSchema: z.ZodObject<{
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
        /** Empty when the preceding shot's narration continues over this image. */
        narration: z.ZodString;
        environmentAngle: z.ZodNullable<z.ZodString>;
        withCharacter: z.ZodBoolean;
        sourceId: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoLongChapterShots = z.infer<typeof VideoLongChapterShotsSchema>;
/**
 * Written by the director; cap-video supplies null usage when not measured.
 * The engine checks consecutive indexes, each chapter's targetSeconds within
 * tolerance, speech fit, clips of at least four seconds, dossier sources and
 * angles present in the project's environment.
 */
export declare const VideoLongFramesDocumentSchema: z.ZodObject<{
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
            /** Empty when the preceding shot's narration continues over this image. */
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
}, z.core.$strict>;
export type VideoLongFramesDocument = z.infer<typeof VideoLongFramesDocumentSchema>;
export declare const VideoLongFramesStatusSchema: z.ZodEnum<{
    "da-approvare": "da-approvare";
    approvati: "approvati";
}>;
export type VideoLongFramesStatus = z.infer<typeof VideoLongFramesStatusSchema>;
export declare const VideoLongFramesSchema: z.ZodObject<{
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
            /** Empty when the preceding shot's narration continues over this image. */
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
export type VideoLongFrames = z.infer<typeof VideoLongFramesSchema>;
/** Approval records the revision and digest seen by the person; it starts no spend. */
export declare const VideoLongFramesApproveRequestSchema: z.ZodObject<{
    revision: z.ZodNumber;
    digest: z.ZodString;
}, z.core.$strict>;
export type VideoLongFramesApproveRequest = z.infer<typeof VideoLongFramesApproveRequestSchema>;
//# sourceMappingURL=lungo-fotogrammi.d.ts.map