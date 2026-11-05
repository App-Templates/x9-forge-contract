import { z } from 'zod';
/**
 * The manifest of a delivered video: a public document, downloaded from the link of the video page.
 * cap-video writes it and every reader (Parallel, Forge, an agent) validates it with this schema.
 * It is not the engine's internal project: no identity, no referent email, no internal paths.
 */
export declare const VIDEO_PROJECT_MANIFEST_VERSION = 1;
/** One downloadable file of the delivery: the video or its subtitles. */
export declare const VideoProjectManifestFileSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        video: "video";
        subtitles: "subtitles";
    }>;
    name: z.ZodString;
    url: z.ZodURL;
}, z.core.$strict>;
export type VideoProjectManifestFile = z.infer<typeof VideoProjectManifestFileSchema>;
/** A scene of the engine for presets without regia (the demo). */
export declare const VideoProjectManifestSceneSchema: z.ZodObject<{
    title: z.ZodString;
    narration: z.ZodString;
}, z.core.$strict>;
export type VideoProjectManifestScene = z.infer<typeof VideoProjectManifestSceneSchema>;
/** The script of the preset with regia; `null` in the manifest for presets without. */
export declare const VideoProjectManifestScriptSchema: z.ZodObject<{
    revision: z.ZodNumber;
    scenes: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>;
    outro: z.ZodObject<{
        title: z.ZodString;
        line: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type VideoProjectManifestScript = z.infer<typeof VideoProjectManifestScriptSchema>;
export declare const VideoProjectManifestSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    projectId: z.ZodString;
    presetId: z.ZodString;
    presetTitle: z.ZodString;
    mode: z.ZodEnum<{
        approval: "approval";
        autonomous: "autonomous";
    }>;
    brief: z.ZodString;
    choices: z.ZodObject<{
        voice: z.ZodNullable<z.ZodString>;
        aspectRatio: z.ZodEnum<{
            "9:16": "9:16";
            "16:9": "16:9";
            "1:1": "1:1";
        }>;
        durationSeconds: z.ZodNumber;
        resolution: z.ZodNullable<z.ZodEnum<{
            "480p": "480p";
            "720p": "720p";
            "1080p": "1080p";
        }>>;
    }, z.core.$strict>;
    footage: z.ZodNullable<z.ZodArray<z.ZodString>>;
    script: z.ZodNullable<z.ZodObject<{
        revision: z.ZodNumber;
        scenes: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>;
        outro: z.ZodObject<{
            title: z.ZodString;
            line: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>>;
    /** Engine scenes for presets without regia; `[]` for the story presets. */
    scenes: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        narration: z.ZodString;
    }, z.core.$strict>>;
    cost: z.ZodObject<{
        budgetUsd: z.ZodNumber;
        spentUsd: z.ZodNumber;
        estimateUsd: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>;
    output: z.ZodObject<{
        durationSeconds: z.ZodNullable<z.ZodNumber>;
        width: z.ZodNullable<z.ZodNumber>;
        height: z.ZodNullable<z.ZodNumber>;
        sha256: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    files: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            video: "video";
            subtitles: "subtitles";
        }>;
        name: z.ZodString;
        url: z.ZodURL;
    }, z.core.$strict>>;
    createdAt: z.ZodString;
    deliveredAt: z.ZodString;
}, z.core.$strict>;
export type VideoProjectManifest = z.infer<typeof VideoProjectManifestSchema>;
//# sourceMappingURL=manifest.d.ts.map