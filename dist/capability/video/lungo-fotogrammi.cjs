"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoLongFramesApproveRequestSchema = exports.VideoLongFramesSchema = exports.VideoLongFramesStatusSchema = exports.VideoLongFramesDocumentSchema = exports.VideoLongChapterShotsSchema = exports.VideoLongShotSchema = exports.VideoLongShotRenderSchema = exports.VIDEO_LONG_MAX_SECONDS_WITHOUT_INTERVIEW = exports.VIDEO_LONG_SHOT_SUM_TOLERANCE = exports.VIDEO_LONG_SPEECH_CHARS_PER_SECOND = exports.VIDEO_LONG_BATCH_MAX_SECONDS = exports.VIDEO_LONG_BATCH_MAX_SCENES = exports.VIDEO_LONG_MAX_SHOT_SECONDS = exports.VIDEO_LONG_MIN_SHOT_SECONDS = exports.VIDEO_LONG_MAX_SHOTS_PER_CHAPTER = void 0;
const zod_1 = require("zod");
const wiki_js_1 = require("../lab/wiki.cjs");
const ambiente_js_1 = require("./ambiente.cjs");
const engine_js_1 = require("./engine.cjs");
const lungo_bozza_js_1 = require("./lungo-bozza.cjs");
const lungo_ricerca_js_1 = require("./lungo-ricerca.cjs");
const lungo_js_1 = require("./lungo.cjs");
/** Bounds the size of the shot plan for a single chapter. */
exports.VIDEO_LONG_MAX_SHOTS_PER_CHAPTER = 80;
/** Local stills may be shorter than the engine's four-second minimum for paid clips. */
exports.VIDEO_LONG_MIN_SHOT_SECONDS = 2;
/** Provider clip ceiling (engine video_adapters.py). */
exports.VIDEO_LONG_MAX_SHOT_SECONDS = 15;
/** Engine production limits; longer chapters are split into batches by the engine. */
exports.VIDEO_LONG_BATCH_MAX_SCENES = 16;
exports.VIDEO_LONG_BATCH_MAX_SECONDS = 120;
/** Working speech-rate estimate to measure, rather than an established fact. */
exports.VIDEO_LONG_SPEECH_CHARS_PER_SECOND = 15;
/** Allowed difference in seconds between a chapter's shots and its target. */
exports.VIDEO_LONG_SHOT_SUM_TOLERANCE = 0.1;
/** Docuseries rule 13: a working hypothesis for a warning, never a rejection. */
exports.VIDEO_LONG_MAX_SECONDS_WITHOUT_INTERVIEW = 50;
/** Paid provider clip, or a local still with slow movement and no generation spend. */
exports.VideoLongShotRenderSchema = zod_1.z.enum(['clip', 'fermo']);
exports.VideoLongShotSchema = zod_1.z.strictObject({
    index: zod_1.z.number().int().min(1).max(exports.VIDEO_LONG_MAX_SHOTS_PER_CHAPTER),
    framing: lungo_ricerca_js_1.VideoLongFramingSchema,
    description: zod_1.z.string().min(1).max(1500),
    motion: zod_1.z.string().min(1).max(400),
    seconds: zod_1.z.number().int().min(exports.VIDEO_LONG_MIN_SHOT_SECONDS).max(exports.VIDEO_LONG_MAX_SHOT_SECONDS),
    render: exports.VideoLongShotRenderSchema,
    /** Empty when the preceding shot's narration continues over this image. */
    narration: zod_1.z.string().max(1200),
    environmentAngle: ambiente_js_1.VideoEnvironmentAngleNameSchema.nullable(),
    withCharacter: zod_1.z.boolean(),
    sourceId: wiki_js_1.WikiSourceIdSchema.nullable(),
});
exports.VideoLongChapterShotsSchema = zod_1.z.strictObject({
    chapterIndex: zod_1.z.number().int().min(1).max(lungo_js_1.VIDEO_LONG_MAX_CHAPTERS),
    shots: zod_1.z.array(exports.VideoLongShotSchema).min(1).max(exports.VIDEO_LONG_MAX_SHOTS_PER_CHAPTER),
});
/**
 * Written by the director; cap-video supplies null usage when not measured.
 * The engine checks consecutive indexes, each chapter's targetSeconds within
 * tolerance, speech fit, clips of at least four seconds, dossier sources and
 * angles present in the project's environment.
 */
exports.VideoLongFramesDocumentSchema = zod_1.z.strictObject({
    chaptersRevision: engine_js_1.VideoEngineRevisionSchema,
    chapters: zod_1.z.array(exports.VideoLongChapterShotsSchema).min(1).max(lungo_js_1.VIDEO_LONG_MAX_CHAPTERS),
    usage: lungo_bozza_js_1.VideoLongUsageSchema.nullable(),
});
exports.VideoLongFramesStatusSchema = zod_1.z.enum(['da-approvare', 'approvati']);
exports.VideoLongFramesSchema = exports.VideoLongFramesDocumentSchema.extend({
    revision: engine_js_1.VideoEngineRevisionSchema,
    status: exports.VideoLongFramesStatusSchema,
    totalSeconds: zod_1.z.number().int().min(10).max(lungo_js_1.VIDEO_LONG_MAX_SECONDS),
    shotCount: zod_1.z.number().int().min(1).max(lungo_js_1.VIDEO_LONG_MAX_CHAPTERS * exports.VIDEO_LONG_MAX_SHOTS_PER_CHAPTER),
    /** Share of total shot time framed as an interview. */
    interviewShare: zod_1.z.number().min(0).max(1),
    warnings: zod_1.z.array(zod_1.z.string().min(1).max(200)).max(20),
    digest: lungo_bozza_js_1.VideoLongDraftSchema.shape.digest,
    approvedAt: zod_1.z.string().min(1).max(40).nullable(),
});
/** Approval records the revision and digest seen by the person; it starts no spend. */
exports.VideoLongFramesApproveRequestSchema = zod_1.z.strictObject({
    revision: engine_js_1.VideoEngineRevisionSchema,
    digest: lungo_bozza_js_1.VideoLongDraftSchema.shape.digest,
});
//# sourceMappingURL=lungo-fotogrammi.js.map