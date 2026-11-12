"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoSeriesViewSchema = exports.VideoSeriesEpisodeSchema = exports.VideoEpisodeEstimateSchema = exports.VideoEpisodePortraitSchema = exports.VideoEpisodeOutcomeSchema = exports.VideoEpisodeContextSchema = exports.VideoSeriesCharacterSchema = exports.VideoEpisodePortraitRefSchema = exports.VideoSeriesHookSchema = exports.VideoEpisodeEndingSchema = exports.VIDEO_SERIES_MAX_EPISODES = exports.VIDEO_SERIES_MAX_HOOKS = exports.VIDEO_SERIES_MAX_CHARACTERS = exports.VideoEpisodeCycleBeatSchema = exports.VideoEpisodeEndingTypeSchema = exports.VideoSeriesPhaseSchema = exports.VideoSeriesLanguageSchema = exports.VideoSeriesItemIdSchema = exports.VideoSeriesIdSchema = void 0;
const zod_1 = require("zod");
const brief_js_1 = require("./brief.cjs");
/**
 * Contract of the episodic series (microdrama): the language shared by cap-video (which keeps the
 * series per tenant and agent) and the engine (which writes the episode). Additive, no
 * `refine`/`superRefine` (the portable catalog forbids them): cross-field checks live in the
 * engine and in cap-video. Values of the enums are those of `series_state.py`.
 */
/** Lowercase uuid v4. */
exports.VideoSeriesIdSchema = zod_1.z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
/** Id of a hook or of a character: a slug, never a path. */
exports.VideoSeriesItemIdSchema = zod_1.z.string().regex(/^[a-z0-9][a-z0-9-]{0,47}$/);
exports.VideoSeriesLanguageSchema = zod_1.z.enum(['it', 'en']);
exports.VideoSeriesPhaseSchema = zod_1.z.enum([
    'golden_three', 'free_escalation', 'paywall_cliffhanger', 'central_loop', 'mid_twist', 'climax', 'finale',
]);
exports.VideoEpisodeEndingTypeSchema = zod_1.z.enum([
    'interrupted-reveal', 'incoming-threat', 'unexpected-arrival', 'impossible-choice',
    'identity-flash', 'public-humiliation-pending', 'betrayal-glimpse',
]);
exports.VideoEpisodeCycleBeatSchema = zod_1.z.enum([
    'provocation', 'humiliation_peak', 'false_confirmation', 'face_slap',
]);
exports.VIDEO_SERIES_MAX_CHARACTERS = 6;
exports.VIDEO_SERIES_MAX_HOOKS = 40;
exports.VIDEO_SERIES_MAX_EPISODES = 120;
const EpisodeNumberSchema = zod_1.z.number().int().min(1).max(exports.VIDEO_SERIES_MAX_EPISODES);
exports.VideoEpisodeEndingSchema = zod_1.z.strictObject({
    type: exports.VideoEpisodeEndingTypeSchema,
    text: zod_1.z.string().trim().min(1).max(500),
});
exports.VideoSeriesHookSchema = zod_1.z.strictObject({
    id: exports.VideoSeriesItemIdSchema,
    description: zod_1.z.string().trim().min(1).max(300),
    plantedEpisode: zod_1.z.number().int().min(1),
    lastTouchedEpisode: zod_1.z.number().int().min(1),
    status: zod_1.z.enum(['open', 'paid']),
    isMain: zod_1.z.boolean(),
    paidEpisode: zod_1.z.number().int().min(1).nullable(),
});
/** A portrait kept by the engine for a character: project, file and digest. */
exports.VideoEpisodePortraitRefSchema = zod_1.z.strictObject({
    engineProjectId: zod_1.z.string().regex(/^[a-f0-9]{32}$/),
    fileName: zod_1.z.string().regex(/^[A-Za-z0-9_-]{1,100}\.(png|jpg|jpeg)$/),
    sha256: zod_1.z.string().regex(/^[0-9a-f]{64}$/),
});
exports.VideoSeriesCharacterSchema = zod_1.z.strictObject({
    id: exports.VideoSeriesItemIdSchema,
    name: zod_1.z.string().trim().min(1).max(80),
    description: zod_1.z.string().trim().min(1).max(600),
    portrait: exports.VideoEpisodePortraitRefSchema.nullable(),
});
/** cap-video → engine: where the series stands when episode N is written. */
exports.VideoEpisodeContextSchema = zod_1.z.strictObject({
    seriesId: exports.VideoSeriesIdSchema,
    seriesTitle: zod_1.z.string().trim().min(1).max(120),
    logline: zod_1.z.string().trim().min(1).max(600),
    language: exports.VideoSeriesLanguageSchema,
    episodeNumber: EpisodeNumberSchema,
    totalEpisodes: zod_1.z.number().int().min(5).max(exports.VIDEO_SERIES_MAX_EPISODES),
    paywallEpisode: zod_1.z.number().int().min(4).max(exports.VIDEO_SERIES_MAX_EPISODES - 1),
    previousEnding: exports.VideoEpisodeEndingSchema.nullable(),
    hooks: zod_1.z.array(exports.VideoSeriesHookSchema).max(exports.VIDEO_SERIES_MAX_HOOKS),
    characters: zod_1.z.array(exports.VideoSeriesCharacterSchema).min(1).max(exports.VIDEO_SERIES_MAX_CHARACTERS),
});
/** engine → cap-video: what the written episode did to the series. */
exports.VideoEpisodeOutcomeSchema = zod_1.z.strictObject({
    phase: exports.VideoSeriesPhaseSchema,
    cycleBeat: exports.VideoEpisodeCycleBeatSchema.nullable(),
    ending: exports.VideoEpisodeEndingSchema,
    hooksOpened: zod_1.z.array(zod_1.z.strictObject({
        id: exports.VideoSeriesItemIdSchema,
        description: zod_1.z.string().trim().min(1).max(300),
    })).max(5),
    hooksTouched: zod_1.z.array(exports.VideoSeriesItemIdSchema).max(20),
    hooksClosed: zod_1.z.array(exports.VideoSeriesItemIdSchema).max(20),
});
/** engine → cap-video: the portrait made for one character. */
exports.VideoEpisodePortraitSchema = zod_1.z.strictObject({
    characterId: exports.VideoSeriesItemIdSchema,
    portrait: exports.VideoEpisodePortraitRefSchema,
});
/** engine → cap-video: cost of the episode, asked after the plan. */
exports.VideoEpisodeEstimateSchema = zod_1.z.strictObject({
    framesUsd: zod_1.z.number().finite().min(0),
    clipsUsd: zod_1.z.number().finite().min(0),
    totalUsd: zod_1.z.number().finite().min(0),
    availableUsd: zod_1.z.number().finite().min(0),
    fitsBudget: zod_1.z.boolean(),
    source: zod_1.z.string().trim().min(1).max(500),
});
exports.VideoSeriesEpisodeSchema = zod_1.z.strictObject({
    number: EpisodeNumberSchema,
    projectId: brief_js_1.VideoProjectIdSchema,
    state: brief_js_1.VideoProjectStateSchema,
    ending: exports.VideoEpisodeEndingSchema.nullable(),
});
exports.VideoSeriesViewSchema = zod_1.z.strictObject({
    seriesId: exports.VideoSeriesIdSchema,
    title: zod_1.z.string().trim().min(1).max(120),
    logline: zod_1.z.string().trim().min(1).max(600),
    language: exports.VideoSeriesLanguageSchema,
    totalEpisodes: zod_1.z.number().int().min(5).max(exports.VIDEO_SERIES_MAX_EPISODES),
    paywallEpisode: zod_1.z.number().int().min(4).max(exports.VIDEO_SERIES_MAX_EPISODES - 1),
    nextEpisode: zod_1.z.number().int().min(1).max(exports.VIDEO_SERIES_MAX_EPISODES + 1),
    nextPhase: exports.VideoSeriesPhaseSchema.nullable(),
    characters: zod_1.z.array(exports.VideoSeriesCharacterSchema).max(exports.VIDEO_SERIES_MAX_CHARACTERS),
    hooks: zod_1.z.array(exports.VideoSeriesHookSchema).max(exports.VIDEO_SERIES_MAX_HOOKS),
    episodes: zod_1.z.array(exports.VideoSeriesEpisodeSchema).max(exports.VIDEO_SERIES_MAX_EPISODES),
});
//# sourceMappingURL=episode.js.map