import { z } from 'zod';
/** cap-video -> Officina video engine. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
export declare const officinaVideoJobContract: {
    readonly errorSchema: z.ZodObject<{
        error: z.ZodString;
        operation_state: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            uncertain: "uncertain";
            pending: "pending";
            rejected: "rejected";
        }>>>;
        code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly path: "/api/jobs";
    readonly paramsSchema: z.ZodObject<{}, z.core.$strict>;
    readonly requestSchema: z.ZodObject<{
        videoProjectId: z.ZodString;
        identity: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        requestedBy: z.ZodString;
        presetId: z.ZodString;
        settings: z.ZodObject<{
            aspectRatio: z.ZodEnum<{
                "9:16": "9:16";
                "16:9": "16:9";
                "1:1": "1:1";
            }>;
            provider: z.ZodEnum<{
                demo: "demo";
                minimax: "minimax";
                fal: "fal";
                byteplus: "byteplus";
            }>;
            durationSeconds: z.ZodNumber;
            sceneCount: z.ZodNumber;
            planner: z.ZodOptional<z.ZodString>;
            renderer: z.ZodOptional<z.ZodEnum<{
                ffmpeg: "ffmpeg";
                remotion: "remotion";
            }>>;
            frameProvider: z.ZodOptional<z.ZodEnum<{
                demo: "demo";
                minimax: "minimax";
                fal: "fal";
                byteplus: "byteplus";
            }>>;
            audioSource: z.ZodOptional<z.ZodEnum<{
                none: "none";
                track: "track";
                native: "native";
                mix: "mix";
            }>>;
        }, z.core.$strict>;
        budgetUsd: z.ZodNumber;
        mode: z.ZodEnum<{
            approval: "approval";
            autonomous: "autonomous";
        }>;
        name: z.ZodString;
        brief: z.ZodString;
        externalRef: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        engineProjectId: z.ZodString;
        status: z.ZodString;
    }, z.core.$strict>;
};
/** cap-video -> Officina video engine health probe. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
export declare const officinaVideoHealthContract: {
    readonly errorSchema: z.ZodObject<{
        error: z.ZodString;
        operation_state: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            uncertain: "uncertain";
            pending: "pending";
            rejected: "rejected";
        }>>>;
        code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodBoolean;
        ffmpeg: z.ZodBoolean;
        ffprobe: z.ZodBoolean;
        paid_enabled: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$loose>;
    readonly responseStatus: 200;
    readonly method: "GET";
    readonly path: "/api/health";
    readonly paramsSchema: z.ZodObject<{}, z.core.$strict>;
};
/** cap-video -> engine: read one project. Internal, INTERNAL_SECRET_HEADER. */
export declare const officinaVideoProjectGetContract: {
    readonly errorSchema: z.ZodObject<{
        error: z.ZodString;
        operation_state: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            uncertain: "uncertain";
            pending: "pending";
            rejected: "rejected";
        }>>>;
        code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
    readonly method: "GET";
    readonly path: "/api/projects/:engineProjectId";
    readonly paramsSchema: z.ZodObject<{
        engineProjectId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        id: z.ZodString;
        status: z.ZodString;
        revision: z.ZodNumber;
        scenes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
            narration: z.ZodOptional<z.ZodString>;
            frame_prompt: z.ZodOptional<z.ZodString>;
            frame_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            clip_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$loose>>;
        jobs: z.ZodArray<z.ZodObject<{
            stage: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
            error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$loose>>;
        output_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        subtitles_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        spent_usd: z.ZodOptional<z.ZodNumber>;
        story: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            status: z.ZodEnum<{
                failed: "failed";
                completed: "completed";
                queued: "queued";
                running: "running";
                interrupted: "interrupted";
            }>;
            step: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            output_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            subtitles_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
};
/** cap-video -> engine: write the plan of a project. Internal, INTERNAL_SECRET_HEADER. */
export declare const officinaVideoPlanContract: {
    readonly errorSchema: z.ZodObject<{
        error: z.ZodString;
        operation_state: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            uncertain: "uncertain";
            pending: "pending";
            rejected: "rejected";
        }>>>;
        code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly path: "/api/projects/:engineProjectId/plan";
    readonly paramsSchema: z.ZodObject<{
        engineProjectId: z.ZodString;
    }, z.core.$strict>;
    readonly requestSchema: z.ZodObject<{
        quote_id: z.ZodOptional<z.ZodString>;
        retry_authorization_id: z.ZodOptional<z.ZodString>;
        revision: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        id: z.ZodString;
        status: z.ZodString;
        revision: z.ZodNumber;
        scenes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
            narration: z.ZodOptional<z.ZodString>;
            frame_prompt: z.ZodOptional<z.ZodString>;
            frame_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            clip_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$loose>>;
        jobs: z.ZodArray<z.ZodObject<{
            stage: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
            error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$loose>>;
        output_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        subtitles_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        spent_usd: z.ZodOptional<z.ZodNumber>;
        story: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            status: z.ZodEnum<{
                failed: "failed";
                completed: "completed";
                queued: "queued";
                running: "running";
                interrupted: "interrupted";
            }>;
            step: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            output_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            subtitles_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
    readonly responseStatus: 200;
};
/** cap-video -> engine: approve a stage at the revision that was shown. Internal, INTERNAL_SECRET_HEADER. */
export declare const officinaVideoApproveContract: {
    readonly errorSchema: z.ZodObject<{
        error: z.ZodString;
        operation_state: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            uncertain: "uncertain";
            pending: "pending";
            rejected: "rejected";
        }>>>;
        code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly path: "/api/projects/:engineProjectId/approve";
    readonly paramsSchema: z.ZodObject<{
        engineProjectId: z.ZodString;
    }, z.core.$strict>;
    readonly requestSchema: z.ZodObject<{
        stage: z.ZodEnum<{
            voice: "voice";
            frames: "frames";
            plan: "plan";
            final: "final";
            references: "references";
        }>;
        revision: z.ZodNumber;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        id: z.ZodString;
        status: z.ZodString;
        revision: z.ZodNumber;
        scenes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
            narration: z.ZodOptional<z.ZodString>;
            frame_prompt: z.ZodOptional<z.ZodString>;
            frame_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            clip_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$loose>>;
        jobs: z.ZodArray<z.ZodObject<{
            stage: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
            error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$loose>>;
        output_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        subtitles_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        spent_usd: z.ZodOptional<z.ZodNumber>;
        story: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            status: z.ZodEnum<{
                failed: "failed";
                completed: "completed";
                queued: "queued";
                running: "running";
                interrupted: "interrupted";
            }>;
            step: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            output_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            subtitles_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
    readonly responseStatus: 200;
};
/** cap-video -> engine: start a production stage (asynchronous, 202). Internal, INTERNAL_SECRET_HEADER. */
export declare const officinaVideoRunContract: {
    readonly errorSchema: z.ZodObject<{
        error: z.ZodString;
        operation_state: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            uncertain: "uncertain";
            pending: "pending";
            rejected: "rejected";
        }>>>;
        code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly path: "/api/projects/:engineProjectId/run";
    readonly paramsSchema: z.ZodObject<{
        engineProjectId: z.ZodString;
    }, z.core.$strict>;
    readonly requestSchema: z.ZodObject<{
        stage: z.ZodEnum<{
            voice: "voice";
            frames: "frames";
            clips: "clips";
            assemble: "assemble";
            animatic: "animatic";
        }>;
        scene_ids: z.ZodOptional<z.ZodArray<z.ZodString>>;
        revision: z.ZodOptional<z.ZodNumber>;
        quote_id: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        id: z.ZodString;
        status: z.ZodString;
        revision: z.ZodNumber;
        scenes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
            narration: z.ZodOptional<z.ZodString>;
            frame_prompt: z.ZodOptional<z.ZodString>;
            frame_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            clip_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$loose>>;
        jobs: z.ZodArray<z.ZodObject<{
            stage: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
            error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$loose>>;
        output_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        subtitles_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        spent_usd: z.ZodOptional<z.ZodNumber>;
        story: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            status: z.ZodEnum<{
                failed: "failed";
                completed: "completed";
                queued: "queued";
                running: "running";
                interrupted: "interrupted";
            }>;
            step: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            output_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            subtitles_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
    readonly responseStatus: 202;
};
/**
 * cap-video -> engine: produce the story of a preset (voice, lip sync, graphic capture, montage) from the approved
 * regia. Asynchronous (202) and idempotent on `revision`; the state is read with GET project. Internal, INTERNAL_SECRET_HEADER.
 */
export declare const officinaVideoStoryContract: {
    readonly errorSchema: z.ZodObject<{
        error: z.ZodString;
        operation_state: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            uncertain: "uncertain";
            pending: "pending";
            rejected: "rejected";
        }>>>;
        code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly path: "/api/projects/:engineProjectId/story";
    readonly paramsSchema: z.ZodObject<{
        engineProjectId: z.ZodString;
    }, z.core.$strict>;
    readonly requestSchema: z.ZodObject<{
        scenes: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>;
        graphicHtml: z.ZodString;
        footage: z.ZodOptional<z.ZodArray<z.ZodString>>;
        outro: z.ZodObject<{
            title: z.ZodString;
            line: z.ZodString;
        }, z.core.$strict>;
        resolution: z.ZodDefault<z.ZodEnum<{
            "480p": "480p";
            "720p": "720p";
            "1080p": "1080p";
        }>>;
        voice: z.ZodOptional<z.ZodString>;
        revision: z.ZodNumber;
    }, z.core.$strict>;
    readonly responseStatus: 202;
};
/**
 * cap-video -> engine: upper estimate of a story, before email 1. Same body as the story (validated by the same contract),
 * no side effect, nothing paid: answers the figure the story start compares with the budget. Internal, INTERNAL_SECRET_HEADER.
 */
export declare const officinaVideoStoryEstimateContract: {
    readonly errorSchema: z.ZodObject<{
        error: z.ZodString;
        operation_state: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            uncertain: "uncertain";
            pending: "pending";
            rejected: "rejected";
        }>>>;
        code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly path: "/api/projects/:engineProjectId/story/estimate";
    readonly paramsSchema: z.ZodObject<{
        engineProjectId: z.ZodString;
    }, z.core.$strict>;
    readonly requestSchema: z.ZodObject<{
        scenes: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>;
        graphicHtml: z.ZodString;
        footage: z.ZodOptional<z.ZodArray<z.ZodString>>;
        outro: z.ZodObject<{
            title: z.ZodString;
            line: z.ZodString;
        }, z.core.$strict>;
        resolution: z.ZodDefault<z.ZodEnum<{
            "480p": "480p";
            "720p": "720p";
            "1080p": "1080p";
        }>>;
        voice: z.ZodOptional<z.ZodString>;
        revision: z.ZodNumber;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        estimateUsd: z.ZodNumber;
        voiceUsd: z.ZodNumber;
        lipSyncUsd: z.ZodNumber;
        estimatedSeconds: z.ZodNumber;
        characters: z.ZodNumber;
        availableUsd: z.ZodNumber;
        serverAvailableUsd: z.ZodNullable<z.ZodNumber>;
        fitsBudget: z.ZodBoolean;
        source: z.ZodString;
    }, z.core.$strict>;
    readonly responseStatus: 200;
};
/** cap-video -> engine: one media file of a project. Internal, INTERNAL_SECRET_HEADER. */
export declare const officinaVideoMediaContract: {
    readonly errorSchema: z.ZodObject<{
        error: z.ZodString;
        operation_state: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            uncertain: "uncertain";
            pending: "pending";
            rejected: "rejected";
        }>>>;
        code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
    readonly method: "GET";
    readonly pathSchema: z.ZodString;
};
/**
 * cap-video -> engine: add one shot to the footage archive. The body is the video itself (binary), the metadata and the
 * identity are in the query. Checks that are fast answer now (422 with the reason in `code`, e.g. a duplicate); the rest
 * runs in a job (202 + id), read with GET job. Internal, INTERNAL_SECRET_HEADER.
 */
export declare const officinaVideoFootageAddContract: {
    readonly errorSchema: z.ZodObject<{
        error: z.ZodString;
        operation_state: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            uncertain: "uncertain";
            pending: "pending";
            rejected: "rejected";
        }>>>;
        code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
    readonly rejectedSchema: z.ZodObject<{
        error: z.ZodString;
        operation_state: z.ZodLiteral<"rejected">;
        code: z.ZodEnum<{
            doppione: "doppione";
            illeggibile: "illeggibile";
            troppo_corta: "troppo_corta";
            risoluzione_bassa: "risoluzione_bassa";
            senza_volto: "senza_volto";
            nessuna_scena: "nessuna_scena";
        }>;
    }, z.core.$strict>;
    readonly method: "POST";
    readonly path: "/api/footage";
    readonly paramsSchema: z.ZodObject<{}, z.core.$strict>;
    readonly querySchema: z.ZodObject<{
        person: z.ZodString;
        place: z.ZodString;
        outfit: z.ZodString;
        group: z.ZodOptional<z.ZodString>;
        framing: z.ZodEnum<{
            largo: "largo";
            medio: "medio";
            stretto: "stretto";
        }>;
        note: z.ZodOptional<z.ZodString>;
        fileName: z.ZodString;
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    readonly bodyMediaTypes: readonly ["video/mp4", "video/quicktime", "video/x-m4v"];
    readonly maxBodyBytes: number;
    readonly responseSchema: z.ZodObject<{
        jobId: z.ZodString;
    }, z.core.$strict>;
    readonly responseStatus: 202;
};
/** cap-video -> engine: state of one footage job. The job of another tenant is 404. Internal, INTERNAL_SECRET_HEADER. */
export declare const officinaVideoFootageJobGetContract: {
    readonly errorSchema: z.ZodObject<{
        error: z.ZodString;
        operation_state: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            uncertain: "uncertain";
            pending: "pending";
            rejected: "rejected";
        }>>>;
        code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
    readonly method: "GET";
    readonly path: "/api/footage/jobs/:jobId";
    readonly paramsSchema: z.ZodObject<{
        jobId: z.ZodString;
    }, z.core.$strict>;
    readonly querySchema: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        status: z.ZodLiteral<"queued">;
        jobId: z.ZodString;
        fileName: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"running">;
        jobId: z.ZodString;
        fileName: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"completed">;
        footage: z.ZodObject<{
            id: z.ZodString;
            scenes: z.ZodNumber;
            durationSeconds: z.ZodNumber;
        }, z.core.$strict>;
        jobId: z.ZodString;
        fileName: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"rejected">;
        code: z.ZodEnum<{
            doppione: "doppione";
            illeggibile: "illeggibile";
            troppo_corta: "troppo_corta";
            risoluzione_bassa: "risoluzione_bassa";
            senza_volto: "senza_volto";
            nessuna_scena: "nessuna_scena";
        }>;
        error: z.ZodString;
        jobId: z.ZodString;
        fileName: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"failed">;
        error: z.ZodString;
        jobId: z.ZodString;
        fileName: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"interrupted">;
        error: z.ZodString;
        jobId: z.ZodString;
        fileName: z.ZodString;
    }, z.core.$strict>], "status">;
    readonly responseStatus: 200;
};
/**
 * cap-video -> engine: the footage archive of one person of the tenant. A person without an archive is `shots: []`.
 * Internal, INTERNAL_SECRET_HEADER only.
 */
export declare const officinaVideoFootageListContract: {
    readonly errorSchema: z.ZodObject<{
        error: z.ZodString;
        operation_state: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            uncertain: "uncertain";
            pending: "pending";
            rejected: "rejected";
        }>>>;
        code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
    readonly method: "GET";
    readonly path: "/api/footage";
    readonly paramsSchema: z.ZodObject<{}, z.core.$strict>;
    readonly querySchema: z.ZodObject<{
        person: z.ZodString;
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        person: z.ZodString;
        shots: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            place: z.ZodString;
            outfit: z.ZodString;
            framing: z.ZodEnum<{
                largo: "largo";
                medio: "medio";
                stretto: "stretto";
            }>;
            group: z.ZodOptional<z.ZodString>;
            durationSeconds: z.ZodNumber;
            scenes: z.ZodNumber;
            sha256: z.ZodString;
            fileName: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly responseStatus: 200;
};
//# sourceMappingURL=officina-video.d.ts.map