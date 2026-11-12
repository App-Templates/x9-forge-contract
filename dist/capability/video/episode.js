import { z } from 'zod';
import { VideoProjectIdSchema, VideoProjectStateSchema } from "./brief.js";
/**
 * Contract of the episodic series (microdrama): the language shared by cap-video (which keeps the
 * series per tenant and agent) and the engine (which writes the episode). Additive, no
 * `refine`/`superRefine` (the portable catalog forbids them): cross-field checks live in the
 * engine and in cap-video. Values of the enums are those of `series_state.py`.
 */
/** Lowercase uuid v4. */
export const VideoSeriesIdSchema = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
/** Id of a hook or of a character: a slug, never a path. */
export const VideoSeriesItemIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,47}$/);
export const VideoSeriesLanguageSchema = z.enum(['it', 'en']);
export const VideoSeriesPhaseSchema = z.enum([
    'golden_three', 'free_escalation', 'paywall_cliffhanger', 'central_loop', 'mid_twist', 'climax', 'finale',
]);
export const VideoEpisodeEndingTypeSchema = z.enum([
    'interrupted-reveal', 'incoming-threat', 'unexpected-arrival', 'impossible-choice',
    'identity-flash', 'public-humiliation-pending', 'betrayal-glimpse',
]);
export const VideoEpisodeCycleBeatSchema = z.enum([
    'provocation', 'humiliation_peak', 'false_confirmation', 'face_slap',
]);
export const VIDEO_SERIES_MAX_CHARACTERS = 6;
export const VIDEO_SERIES_MAX_HOOKS = 40;
export const VIDEO_SERIES_MAX_EPISODES = 120;
const EpisodeNumberSchema = z.number().int().min(1).max(VIDEO_SERIES_MAX_EPISODES);
export const VideoEpisodeEndingSchema = z.strictObject({
    type: VideoEpisodeEndingTypeSchema,
    text: z.string().trim().min(1).max(500),
});
export const VideoSeriesHookSchema = z.strictObject({
    id: VideoSeriesItemIdSchema,
    description: z.string().trim().min(1).max(300),
    plantedEpisode: z.number().int().min(1),
    lastTouchedEpisode: z.number().int().min(1),
    status: z.enum(['open', 'paid']),
    isMain: z.boolean(),
    paidEpisode: z.number().int().min(1).nullable(),
});
/** A portrait kept by the engine for a character: project, file and digest. */
export const VideoEpisodePortraitRefSchema = z.strictObject({
    engineProjectId: z.string().regex(/^[a-f0-9]{32}$/),
    fileName: z.string().regex(/^[A-Za-z0-9_-]{1,100}\.(png|jpg|jpeg)$/),
    sha256: z.string().regex(/^[0-9a-f]{64}$/),
});
export const VideoSeriesCharacterSchema = z.strictObject({
    id: VideoSeriesItemIdSchema,
    name: z.string().trim().min(1).max(80),
    description: z.string().trim().min(1).max(600),
    portrait: VideoEpisodePortraitRefSchema.nullable(),
});
/** cap-video → engine: where the series stands when episode N is written. */
export const VideoEpisodeContextSchema = z.strictObject({
    seriesId: VideoSeriesIdSchema,
    seriesTitle: z.string().trim().min(1).max(120),
    logline: z.string().trim().min(1).max(600),
    language: VideoSeriesLanguageSchema,
    episodeNumber: EpisodeNumberSchema,
    totalEpisodes: z.number().int().min(5).max(VIDEO_SERIES_MAX_EPISODES),
    paywallEpisode: z.number().int().min(4).max(VIDEO_SERIES_MAX_EPISODES - 1),
    previousEnding: VideoEpisodeEndingSchema.nullable(),
    hooks: z.array(VideoSeriesHookSchema).max(VIDEO_SERIES_MAX_HOOKS),
    characters: z.array(VideoSeriesCharacterSchema).min(1).max(VIDEO_SERIES_MAX_CHARACTERS),
});
/** engine → cap-video: what the written episode did to the series. */
export const VideoEpisodeOutcomeSchema = z.strictObject({
    phase: VideoSeriesPhaseSchema,
    cycleBeat: VideoEpisodeCycleBeatSchema.nullable(),
    ending: VideoEpisodeEndingSchema,
    hooksOpened: z.array(z.strictObject({
        id: VideoSeriesItemIdSchema,
        description: z.string().trim().min(1).max(300),
    })).max(5),
    hooksTouched: z.array(VideoSeriesItemIdSchema).max(20),
    hooksClosed: z.array(VideoSeriesItemIdSchema).max(20),
});
/** engine → cap-video: the portrait made for one character. */
export const VideoEpisodePortraitSchema = z.strictObject({
    characterId: VideoSeriesItemIdSchema,
    portrait: VideoEpisodePortraitRefSchema,
});
/** engine → cap-video: cost of the episode, asked after the plan. */
export const VideoEpisodeEstimateSchema = z.strictObject({
    framesUsd: z.number().finite().min(0),
    clipsUsd: z.number().finite().min(0),
    totalUsd: z.number().finite().min(0),
    availableUsd: z.number().finite().min(0),
    fitsBudget: z.boolean(),
    source: z.string().trim().min(1).max(500),
});
export const VideoSeriesEpisodeSchema = z.strictObject({
    number: EpisodeNumberSchema,
    projectId: VideoProjectIdSchema,
    state: VideoProjectStateSchema,
    ending: VideoEpisodeEndingSchema.nullable(),
});
export const VideoSeriesViewSchema = z.strictObject({
    seriesId: VideoSeriesIdSchema,
    title: z.string().trim().min(1).max(120),
    logline: z.string().trim().min(1).max(600),
    language: VideoSeriesLanguageSchema,
    totalEpisodes: z.number().int().min(5).max(VIDEO_SERIES_MAX_EPISODES),
    paywallEpisode: z.number().int().min(4).max(VIDEO_SERIES_MAX_EPISODES - 1),
    nextEpisode: z.number().int().min(1).max(VIDEO_SERIES_MAX_EPISODES + 1),
    nextPhase: VideoSeriesPhaseSchema.nullable(),
    characters: z.array(VideoSeriesCharacterSchema).max(VIDEO_SERIES_MAX_CHARACTERS),
    hooks: z.array(VideoSeriesHookSchema).max(VIDEO_SERIES_MAX_HOOKS),
    episodes: z.array(VideoSeriesEpisodeSchema).max(VIDEO_SERIES_MAX_EPISODES),
});
//# sourceMappingURL=episode.js.map