import { z } from 'zod';
/**
 * Contract of the episodic series (microdrama): the language shared by cap-video (which keeps the
 * series per tenant and agent) and the engine (which writes the episode). Additive, no
 * `refine`/`superRefine` (the portable catalog forbids them): cross-field checks live in the
 * engine and in cap-video. Values of the enums are those of `series_state.py`.
 */
/** Lowercase uuid v4. */
export declare const VideoSeriesIdSchema: z.ZodString;
export type VideoSeriesId = z.infer<typeof VideoSeriesIdSchema>;
/** Id of a hook or of a character: a slug, never a path. */
export declare const VideoSeriesItemIdSchema: z.ZodString;
export type VideoSeriesItemId = z.infer<typeof VideoSeriesItemIdSchema>;
export declare const VideoSeriesLanguageSchema: z.ZodEnum<{
    it: "it";
    en: "en";
}>;
export type VideoSeriesLanguage = z.infer<typeof VideoSeriesLanguageSchema>;
export declare const VideoSeriesPhaseSchema: z.ZodEnum<{
    golden_three: "golden_three";
    free_escalation: "free_escalation";
    paywall_cliffhanger: "paywall_cliffhanger";
    central_loop: "central_loop";
    mid_twist: "mid_twist";
    climax: "climax";
    finale: "finale";
}>;
export type VideoSeriesPhase = z.infer<typeof VideoSeriesPhaseSchema>;
export declare const VideoEpisodeEndingTypeSchema: z.ZodEnum<{
    "interrupted-reveal": "interrupted-reveal";
    "incoming-threat": "incoming-threat";
    "unexpected-arrival": "unexpected-arrival";
    "impossible-choice": "impossible-choice";
    "identity-flash": "identity-flash";
    "public-humiliation-pending": "public-humiliation-pending";
    "betrayal-glimpse": "betrayal-glimpse";
}>;
export type VideoEpisodeEndingType = z.infer<typeof VideoEpisodeEndingTypeSchema>;
export declare const VideoEpisodeCycleBeatSchema: z.ZodEnum<{
    provocation: "provocation";
    humiliation_peak: "humiliation_peak";
    false_confirmation: "false_confirmation";
    face_slap: "face_slap";
}>;
export type VideoEpisodeCycleBeat = z.infer<typeof VideoEpisodeCycleBeatSchema>;
export declare const VIDEO_SERIES_MAX_CHARACTERS = 6;
export declare const VIDEO_SERIES_MAX_HOOKS = 40;
export declare const VIDEO_SERIES_MAX_EPISODES = 120;
export declare const VideoEpisodeEndingSchema: z.ZodObject<{
    type: z.ZodEnum<{
        "interrupted-reveal": "interrupted-reveal";
        "incoming-threat": "incoming-threat";
        "unexpected-arrival": "unexpected-arrival";
        "impossible-choice": "impossible-choice";
        "identity-flash": "identity-flash";
        "public-humiliation-pending": "public-humiliation-pending";
        "betrayal-glimpse": "betrayal-glimpse";
    }>;
    text: z.ZodString;
}, z.core.$strict>;
export type VideoEpisodeEnding = z.infer<typeof VideoEpisodeEndingSchema>;
export declare const VideoSeriesHookSchema: z.ZodObject<{
    id: z.ZodString;
    description: z.ZodString;
    plantedEpisode: z.ZodNumber;
    lastTouchedEpisode: z.ZodNumber;
    status: z.ZodEnum<{
        open: "open";
        paid: "paid";
    }>;
    isMain: z.ZodBoolean;
    paidEpisode: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
export type VideoSeriesHook = z.infer<typeof VideoSeriesHookSchema>;
/** A portrait kept by the engine for a character: project, file and digest. */
export declare const VideoEpisodePortraitRefSchema: z.ZodObject<{
    engineProjectId: z.ZodString;
    fileName: z.ZodString;
    sha256: z.ZodString;
}, z.core.$strict>;
export type VideoEpisodePortraitRef = z.infer<typeof VideoEpisodePortraitRefSchema>;
export declare const VideoSeriesCharacterSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    portrait: z.ZodNullable<z.ZodObject<{
        engineProjectId: z.ZodString;
        fileName: z.ZodString;
        sha256: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoSeriesCharacter = z.infer<typeof VideoSeriesCharacterSchema>;
/** cap-video → engine: where the series stands when episode N is written. */
export declare const VideoEpisodeContextSchema: z.ZodObject<{
    seriesId: z.ZodString;
    seriesTitle: z.ZodString;
    logline: z.ZodString;
    language: z.ZodEnum<{
        it: "it";
        en: "en";
    }>;
    episodeNumber: z.ZodNumber;
    totalEpisodes: z.ZodNumber;
    paywallEpisode: z.ZodNumber;
    previousEnding: z.ZodNullable<z.ZodObject<{
        type: z.ZodEnum<{
            "interrupted-reveal": "interrupted-reveal";
            "incoming-threat": "incoming-threat";
            "unexpected-arrival": "unexpected-arrival";
            "impossible-choice": "impossible-choice";
            "identity-flash": "identity-flash";
            "public-humiliation-pending": "public-humiliation-pending";
            "betrayal-glimpse": "betrayal-glimpse";
        }>;
        text: z.ZodString;
    }, z.core.$strict>>;
    hooks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        description: z.ZodString;
        plantedEpisode: z.ZodNumber;
        lastTouchedEpisode: z.ZodNumber;
        status: z.ZodEnum<{
            open: "open";
            paid: "paid";
        }>;
        isMain: z.ZodBoolean;
        paidEpisode: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>;
    characters: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        portrait: z.ZodNullable<z.ZodObject<{
            engineProjectId: z.ZodString;
            fileName: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoEpisodeContext = z.infer<typeof VideoEpisodeContextSchema>;
/** engine → cap-video: what the written episode did to the series. */
export declare const VideoEpisodeOutcomeSchema: z.ZodObject<{
    phase: z.ZodEnum<{
        golden_three: "golden_three";
        free_escalation: "free_escalation";
        paywall_cliffhanger: "paywall_cliffhanger";
        central_loop: "central_loop";
        mid_twist: "mid_twist";
        climax: "climax";
        finale: "finale";
    }>;
    cycleBeat: z.ZodNullable<z.ZodEnum<{
        provocation: "provocation";
        humiliation_peak: "humiliation_peak";
        false_confirmation: "false_confirmation";
        face_slap: "face_slap";
    }>>;
    ending: z.ZodObject<{
        type: z.ZodEnum<{
            "interrupted-reveal": "interrupted-reveal";
            "incoming-threat": "incoming-threat";
            "unexpected-arrival": "unexpected-arrival";
            "impossible-choice": "impossible-choice";
            "identity-flash": "identity-flash";
            "public-humiliation-pending": "public-humiliation-pending";
            "betrayal-glimpse": "betrayal-glimpse";
        }>;
        text: z.ZodString;
    }, z.core.$strict>;
    hooksOpened: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        description: z.ZodString;
    }, z.core.$strict>>;
    hooksTouched: z.ZodArray<z.ZodString>;
    hooksClosed: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type VideoEpisodeOutcome = z.infer<typeof VideoEpisodeOutcomeSchema>;
/** engine → cap-video: the portrait made for one character. */
export declare const VideoEpisodePortraitSchema: z.ZodObject<{
    characterId: z.ZodString;
    portrait: z.ZodObject<{
        engineProjectId: z.ZodString;
        fileName: z.ZodString;
        sha256: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type VideoEpisodePortrait = z.infer<typeof VideoEpisodePortraitSchema>;
/** engine → cap-video: cost of the episode, asked after the plan. */
export declare const VideoEpisodeEstimateSchema: z.ZodObject<{
    framesUsd: z.ZodNumber;
    clipsUsd: z.ZodNumber;
    totalUsd: z.ZodNumber;
    availableUsd: z.ZodNumber;
    fitsBudget: z.ZodBoolean;
    source: z.ZodString;
}, z.core.$strict>;
export type VideoEpisodeEstimate = z.infer<typeof VideoEpisodeEstimateSchema>;
export declare const VideoSeriesEpisodeSchema: z.ZodObject<{
    number: z.ZodNumber;
    projectId: z.ZodString;
    state: z.ZodEnum<{
        failed: "failed";
        created: "created";
        delivered: "delivered";
        planning: "planning";
        awaiting_approval: "awaiting_approval";
        producing: "producing";
    }>;
    ending: z.ZodNullable<z.ZodObject<{
        type: z.ZodEnum<{
            "interrupted-reveal": "interrupted-reveal";
            "incoming-threat": "incoming-threat";
            "unexpected-arrival": "unexpected-arrival";
            "impossible-choice": "impossible-choice";
            "identity-flash": "identity-flash";
            "public-humiliation-pending": "public-humiliation-pending";
            "betrayal-glimpse": "betrayal-glimpse";
        }>;
        text: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoSeriesEpisode = z.infer<typeof VideoSeriesEpisodeSchema>;
export declare const VideoSeriesViewSchema: z.ZodObject<{
    seriesId: z.ZodString;
    title: z.ZodString;
    logline: z.ZodString;
    language: z.ZodEnum<{
        it: "it";
        en: "en";
    }>;
    totalEpisodes: z.ZodNumber;
    paywallEpisode: z.ZodNumber;
    nextEpisode: z.ZodNumber;
    nextPhase: z.ZodNullable<z.ZodEnum<{
        golden_three: "golden_three";
        free_escalation: "free_escalation";
        paywall_cliffhanger: "paywall_cliffhanger";
        central_loop: "central_loop";
        mid_twist: "mid_twist";
        climax: "climax";
        finale: "finale";
    }>>;
    characters: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        portrait: z.ZodNullable<z.ZodObject<{
            engineProjectId: z.ZodString;
            fileName: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    hooks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        description: z.ZodString;
        plantedEpisode: z.ZodNumber;
        lastTouchedEpisode: z.ZodNumber;
        status: z.ZodEnum<{
            open: "open";
            paid: "paid";
        }>;
        isMain: z.ZodBoolean;
        paidEpisode: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>;
    episodes: z.ZodArray<z.ZodObject<{
        number: z.ZodNumber;
        projectId: z.ZodString;
        state: z.ZodEnum<{
            failed: "failed";
            created: "created";
            delivered: "delivered";
            planning: "planning";
            awaiting_approval: "awaiting_approval";
            producing: "producing";
        }>;
        ending: z.ZodNullable<z.ZodObject<{
            type: z.ZodEnum<{
                "interrupted-reveal": "interrupted-reveal";
                "incoming-threat": "incoming-threat";
                "unexpected-arrival": "unexpected-arrival";
                "impossible-choice": "impossible-choice";
                "identity-flash": "identity-flash";
                "public-humiliation-pending": "public-humiliation-pending";
                "betrayal-glimpse": "betrayal-glimpse";
            }>;
            text: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoSeriesView = z.infer<typeof VideoSeriesViewSchema>;
//# sourceMappingURL=episode.d.ts.map