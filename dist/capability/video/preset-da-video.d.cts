import { z } from 'zod';
/** Largest example video the engine downloads from a URL. */
export declare const VIDEO_PRESET_VIDEO_MAX_BYTES: number;
/** Longest example video the engine analyzes. */
export declare const VIDEO_PRESET_VIDEO_MAX_SECONDS = 120;
/** Scenes of one preset, at most. */
export declare const VIDEO_PRESET_MAX_SCENES = 12;
/** URL of the example video: http or https only. */
export declare const VideoPresetVideoUrlSchema: z.ZodString;
export type VideoPresetVideoUrl = z.infer<typeof VideoPresetVideoUrlSchema>;
/** Id of a preset made by the user; distinct from `VideoPresetIdSchema` (brief.ts), which stays as is. */
export declare const VideoUserPresetIdSchema: z.ZodString;
export type VideoUserPresetId = z.infer<typeof VideoUserPresetIdSchema>;
export declare const VideoPresetTransitionSchema: z.ZodEnum<{
    taglio: "taglio";
    dissolvenza: "dissolvenza";
    "dissolvenza-nero": "dissolvenza-nero";
    scorrimento: "scorrimento";
    zoom: "zoom";
}>;
export type VideoPresetTransition = z.infer<typeof VideoPresetTransitionSchema>;
export declare const VideoPresetMovementSchema: z.ZodEnum<{
    fissa: "fissa";
    "push-in": "push-in";
    "pull-out": "pull-out";
    panoramica: "panoramica";
}>;
export type VideoPresetMovement = z.infer<typeof VideoPresetMovementSchema>;
export declare const VideoPresetRoleSchema: z.ZodEnum<{
    gancio: "gancio";
    contesto: "contesto";
    info: "info";
    prova: "prova";
    svolta: "svolta";
    conclusione: "conclusione";
    invito: "invito";
    atmosfera: "atmosfera";
}>;
export type VideoPresetRole = z.infer<typeof VideoPresetRoleSchema>;
/** `stimato` = guessed by the analysis; `corretto` = set by the user. */
export declare const VideoPresetRoleSourceSchema: z.ZodEnum<{
    stimato: "stimato";
    corretto: "corretto";
}>;
export type VideoPresetRoleSource = z.infer<typeof VideoPresetRoleSourceSchema>;
export declare const VideoPresetSceneSchema: z.ZodObject<{
    index: z.ZodNumber;
    durationSeconds: z.ZodNumber;
    framing: z.ZodEnum<{
        largo: "largo";
        medio: "medio";
        stretto: "stretto";
    }>;
    movement: z.ZodEnum<{
        fissa: "fissa";
        "push-in": "push-in";
        "pull-out": "pull-out";
        panoramica: "panoramica";
    }>;
    transitionIn: z.ZodEnum<{
        taglio: "taglio";
        dissolvenza: "dissolvenza";
        "dissolvenza-nero": "dissolvenza-nero";
        scorrimento: "scorrimento";
        zoom: "zoom";
    }>;
    role: z.ZodEnum<{
        gancio: "gancio";
        contesto: "contesto";
        info: "info";
        prova: "prova";
        svolta: "svolta";
        conclusione: "conclusione";
        invito: "invito";
        atmosfera: "atmosfera";
    }>;
    roleSource: z.ZodEnum<{
        stimato: "stimato";
        corretto: "corretto";
    }>;
}, z.core.$strict>;
export type VideoPresetScene = z.infer<typeof VideoPresetSceneSchema>;
/** A preset made from an example video: a draft until the user saves it. */
export declare const VideoUserPresetSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    status: z.ZodEnum<{
        bozza: "bozza";
        salvato: "salvato";
    }>;
    revision: z.ZodNumber;
    /** The existing preset that gives voice, graphics and lip-sync; `singola` by default. */
    basedOn: z.ZodDefault<z.ZodString>;
    source: z.ZodObject<{
        durationSeconds: z.ZodNumber;
        aspectRatio: z.ZodEnum<{
            "9:16": "9:16";
            "16:9": "16:9";
            "1:1": "1:1";
        }>;
        sceneCount: z.ZodNumber;
    }, z.core.$strict>;
    scenes: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        durationSeconds: z.ZodNumber;
        framing: z.ZodEnum<{
            largo: "largo";
            medio: "medio";
            stretto: "stretto";
        }>;
        movement: z.ZodEnum<{
            fissa: "fissa";
            "push-in": "push-in";
            "pull-out": "pull-out";
            panoramica: "panoramica";
        }>;
        transitionIn: z.ZodEnum<{
            taglio: "taglio";
            dissolvenza: "dissolvenza";
            "dissolvenza-nero": "dissolvenza-nero";
            scorrimento: "scorrimento";
            zoom: "zoom";
        }>;
        role: z.ZodEnum<{
            gancio: "gancio";
            contesto: "contesto";
            info: "info";
            prova: "prova";
            svolta: "svolta";
            conclusione: "conclusione";
            invito: "invito";
            atmosfera: "atmosfera";
        }>;
        roleSource: z.ZodEnum<{
            stimato: "stimato";
            corretto: "corretto";
        }>;
    }, z.core.$strict>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strict>;
export type VideoUserPreset = z.infer<typeof VideoUserPresetSchema>;
/** Answer of `GET /api/preset-utente`. */
export declare const VideoUserPresetListSchema: z.ZodObject<{
    presets: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        identity: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        status: z.ZodEnum<{
            bozza: "bozza";
            salvato: "salvato";
        }>;
        revision: z.ZodNumber;
        /** The existing preset that gives voice, graphics and lip-sync; `singola` by default. */
        basedOn: z.ZodDefault<z.ZodString>;
        source: z.ZodObject<{
            durationSeconds: z.ZodNumber;
            aspectRatio: z.ZodEnum<{
                "9:16": "9:16";
                "16:9": "16:9";
                "1:1": "1:1";
            }>;
            sceneCount: z.ZodNumber;
        }, z.core.$strict>;
        scenes: z.ZodArray<z.ZodObject<{
            index: z.ZodNumber;
            durationSeconds: z.ZodNumber;
            framing: z.ZodEnum<{
                largo: "largo";
                medio: "medio";
                stretto: "stretto";
            }>;
            movement: z.ZodEnum<{
                fissa: "fissa";
                "push-in": "push-in";
                "pull-out": "pull-out";
                panoramica: "panoramica";
            }>;
            transitionIn: z.ZodEnum<{
                taglio: "taglio";
                dissolvenza: "dissolvenza";
                "dissolvenza-nero": "dissolvenza-nero";
                scorrimento: "scorrimento";
                zoom: "zoom";
            }>;
            role: z.ZodEnum<{
                gancio: "gancio";
                contesto: "contesto";
                info: "info";
                prova: "prova";
                svolta: "svolta";
                conclusione: "conclusione";
                invito: "invito";
                atmosfera: "atmosfera";
            }>;
            roleSource: z.ZodEnum<{
                stimato: "stimato";
                corretto: "corretto";
            }>;
        }, z.core.$strict>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoUserPresetList = z.infer<typeof VideoUserPresetListSchema>;
/** Query of every preset call: the identity, as in `footage.ts`. */
export declare const VideoPresetFromVideoStartQuerySchema: z.ZodObject<{
    agentId: z.ZodString;
    ownerId: z.ZodString;
    tenantId: z.ZodString;
}, z.core.$strict>;
export type VideoPresetFromVideoStartQuery = z.infer<typeof VideoPresetFromVideoStartQuerySchema>;
export declare const VideoPresetFromVideoStartRequestSchema: z.ZodObject<{
    url: z.ZodString;
    name: z.ZodString;
}, z.core.$strict>;
export type VideoPresetFromVideoStartRequest = z.infer<typeof VideoPresetFromVideoStartRequestSchema>;
export declare const VideoPresetFromVideoJobSchema: z.ZodObject<{
    jobId: z.ZodString;
    status: z.ZodEnum<{
        failed: "failed";
        done: "done";
        queued: "queued";
        downloading: "downloading";
        analyzing: "analyzing";
    }>;
    presetId: z.ZodNullable<z.ZodString>;
    code: z.ZodNullable<z.ZodString>;
    error: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type VideoPresetFromVideoJob = z.infer<typeof VideoPresetFromVideoJobSchema>;
/** The user's correction: durations, framing, transitions, movement, role. */
export declare const VideoPresetSaveRequestSchema: z.ZodObject<{
    revision: z.ZodNumber;
    name: z.ZodString;
    basedOn: z.ZodString;
    scenes: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        durationSeconds: z.ZodNumber;
        framing: z.ZodEnum<{
            largo: "largo";
            medio: "medio";
            stretto: "stretto";
        }>;
        movement: z.ZodEnum<{
            fissa: "fissa";
            "push-in": "push-in";
            "pull-out": "pull-out";
            panoramica: "panoramica";
        }>;
        transitionIn: z.ZodEnum<{
            taglio: "taglio";
            dissolvenza: "dissolvenza";
            "dissolvenza-nero": "dissolvenza-nero";
            scorrimento: "scorrimento";
            zoom: "zoom";
        }>;
        role: z.ZodEnum<{
            gancio: "gancio";
            contesto: "contesto";
            info: "info";
            prova: "prova";
            svolta: "svolta";
            conclusione: "conclusione";
            invito: "invito";
            atmosfera: "atmosfera";
        }>;
        roleSource: z.ZodEnum<{
            stimato: "stimato";
            corretto: "corretto";
        }>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoPresetSaveRequest = z.infer<typeof VideoPresetSaveRequestSchema>;
//# sourceMappingURL=preset-da-video.d.ts.map