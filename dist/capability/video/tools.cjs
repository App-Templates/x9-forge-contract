"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoStudioOpenResponseSchema = exports.VIDEO_STUDIO_SESSION_TTL_SECONDS = exports.VIDEO_STUDIO_ACCESS_TTL_SECONDS = exports.VideoStudioOpenToolInputSchema = exports.VideoFootageSyncResponseSchema = exports.VideoFootageSyncFileSchema = exports.VideoFootageSyncReasonSchema = exports.VideoFootageSyncFileStatusSchema = exports.VideoDriveFileIdSchema = exports.VideoFootageSyncToolInputSchema = exports.VideoDriveFolderRefSchema = exports.VideoProjectViewSchema = exports.VideoScriptReviseResponseSchema = exports.VideoProjectStepSchema = exports.VideoScriptReviseToolInputSchema = exports.VideoScriptRevisionSchema = exports.VideoProjectGetToolInputSchema = exports.VideoPresetsListResponseSchema = exports.VideoPresetSummarySchema = exports.VideoPresetFootageShotsSchema = exports.VideoPresetsListToolInputSchema = exports.VideoBriefToolInputSchema = exports.VideoEpisodeCreateResponseSchema = exports.VideoEpisodeCreateToolInputSchema = exports.VideoSeriesResponseSchema = exports.VideoSeriesGetToolInputSchema = exports.VideoSeriesCreateToolInputSchema = exports.VIDEO_EPISODE_CREATE_TOOL = exports.VIDEO_SERIES_GET_TOOL = exports.VIDEO_SERIES_CREATE_TOOL = void 0;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const story_js_1 = require("./story.cjs");
const index_js_1 = require("../connect/index.cjs");
const internal_connect_js_1 = require("../../http/endpoints/internal-connect.cjs");
const footage_js_1 = require("./footage.cjs");
const brief_js_1 = require("./brief.cjs");
const episode_js_1 = require("./episode.cjs");
exports.VIDEO_SERIES_CREATE_TOOL = 'video_series_create';
exports.VIDEO_SERIES_GET_TOOL = 'video_series_get';
exports.VIDEO_EPISODE_CREATE_TOOL = 'video_episode_create';
/** Identity comes only from the admitted tool envelope (R-33). */
exports.VideoSeriesCreateToolInputSchema = zod_1.z.strictObject({
    title: zod_1.z.string().min(1).max(120).describe('Titolo della serie.'),
    logline: zod_1.z.string().min(1).max(600).describe('Premessa narrativa della serie.'),
    language: episode_js_1.VideoSeriesLanguageSchema.optional().describe('Lingua della serie.'),
    totalEpisodes: zod_1.z.number().int().min(5).max(episode_js_1.VIDEO_SERIES_MAX_EPISODES).describe('Numero totale di episodi della serie.'),
    paywallEpisode: zod_1.z.number().int().min(4).max(episode_js_1.VIDEO_SERIES_MAX_EPISODES - 1).optional()
        .describe('episodio del muro a pagamento; assente: 8 o il penultimo'),
    mainSecret: zod_1.z.string().min(1).max(300).optional().describe('il segreto principale, svelato al climax'),
    characters: zod_1.z.array(zod_1.z.strictObject({
        id: episode_js_1.VideoSeriesItemIdSchema.describe('Identificativo del personaggio in minuscolo.'),
        name: zod_1.z.string().min(1).max(80).describe('Nome del personaggio.'),
        description: zod_1.z.string().min(1).max(600).describe('Descrizione del personaggio.'),
    })).min(1).max(episode_js_1.VIDEO_SERIES_MAX_CHARACTERS).describe('Personaggi principali della serie.'),
});
exports.VideoSeriesGetToolInputSchema = zod_1.z.strictObject({
    seriesId: episode_js_1.VideoSeriesIdSchema.describe('Identificativo della serie.'),
});
exports.VideoSeriesResponseSchema = episode_js_1.VideoSeriesViewSchema;
/** Identity comes only from the admitted tool envelope (R-33). */
exports.VideoEpisodeCreateToolInputSchema = zod_1.z.strictObject({
    seriesId: episode_js_1.VideoSeriesIdSchema,
    brief: zod_1.z.string().min(1).max(2000).optional()
        .describe('cosa deve succedere in questo episodio; assente: lo decide il copione dalla serie'),
    approverEmail: brief_js_1.VideoBriefRequestSchema.shape.approverEmail,
    mode: brief_js_1.VideoModeSchema,
    budgetUsd: brief_js_1.VideoBriefRequestSchema.shape.budgetUsd,
    durationSeconds: brief_js_1.VideoDurationSecondsSchema.optional(),
});
exports.VideoEpisodeCreateResponseSchema = zod_1.z.strictObject({
    seriesId: episode_js_1.VideoSeriesIdSchema,
    episodeNumber: zod_1.z.number().int().min(1).max(episode_js_1.VIDEO_SERIES_MAX_EPISODES),
    phase: episode_js_1.VideoSeriesPhaseSchema,
    projectId: brief_js_1.VideoProjectIdSchema,
    state: brief_js_1.VideoProjectStateSchema,
});
/**
 * What the model writes when an agent calls `video_brief_create`: the brief without identity.
 * Tenant, owner and agent come only from the tool envelope agent-core admitted (R-33), never from the model.
 */
exports.VideoBriefToolInputSchema = brief_js_1.VideoBriefRequestSchema.omit({ identity: true, requestedBy: true }).extend({
    presetId: brief_js_1.VideoPresetIdSchema.describe("Id di un preset dell'Officina, come lo restituisce video_presets_list (es. «singola»)."),
    requestedBy: brief_js_1.VideoBriefRequestSchema.shape.requestedBy.optional(),
}).strict();
/** Identity comes only from the admitted tool envelope (R-33). */
exports.VideoPresetsListToolInputSchema = zod_1.z.strictObject({});
/** Number of archive shots used by a preset. */
exports.VideoPresetFootageShotsSchema = zod_1.z.union([zod_1.z.literal(0), zod_1.z.literal(1), zod_1.z.literal(2)]);
exports.VideoPresetSummarySchema = zod_1.z.strictObject({
    id: brief_js_1.VideoPresetIdSchema,
    title: zod_1.z.string().min(1).max(200),
    expectedCostUsd: zod_1.z.number().nonnegative().finite(),
    footageShots: exports.VideoPresetFootageShotsSchema,
});
exports.VideoPresetsListResponseSchema = zod_1.z.strictObject({
    presets: zod_1.z.array(exports.VideoPresetSummarySchema).min(1),
});
/** What the model writes when an agent calls `video_project_get`. */
exports.VideoProjectGetToolInputSchema = zod_1.z.object({ projectId: brief_js_1.VideoProjectIdSchema }).strict();
/** Revision of the script the regia wrote; a correction is always based on the one the person read. */
exports.VideoScriptRevisionSchema = zod_1.z.number().int().min(1);
/**
 * What the model writes when an agent calls `video_script_revise`: new texts on the revision the person read.
 * No identity (from the envelope, R-33), no footage or graphic (they stay the regia's); absent `outro` keeps the old closing.
 */
exports.VideoScriptReviseToolInputSchema = zod_1.z.strictObject({
    projectId: brief_js_1.VideoProjectIdSchema,
    basedOnRevision: exports.VideoScriptRevisionSchema,
    scenes: story_js_1.VideoStoryScenesSchema,
    outro: story_js_1.VideoStoryOutroSchema.optional(),
});
/** Production step inside a project state, for people and agents reading the project. */
exports.VideoProjectStepSchema = zod_1.z.enum([
    'queued', 'plan', 'frames', 'review_sent', 'clips', 'assemble', 'delivery_sent', 'done', 'failed',
    // Presets with a face or a pure infographic: the regia session writes script and graphic, the engine produces the story.
    'regia', 'story',
]);
exports.VideoScriptReviseResponseSchema = zod_1.z.strictObject({
    projectId: brief_js_1.VideoProjectIdSchema,
    state: brief_js_1.VideoProjectStateSchema,
    step: exports.VideoProjectStepSchema,
    scriptRevision: exports.VideoScriptRevisionSchema,
});
/** One project as the owning agent sees it: state, step and the two links of the two emails. */
exports.VideoProjectViewSchema = zod_1.z.object({
    projectId: brief_js_1.VideoProjectIdSchema,
    state: brief_js_1.VideoProjectStateSchema,
    step: exports.VideoProjectStepSchema,
    identity: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    presetId: brief_js_1.VideoPresetIdSchema,
    mode: brief_js_1.VideoModeSchema,
    budgetUsd: zod_1.z.number().positive().finite(),
    spentUsd: zod_1.z.number().nonnegative().finite(),
    reviewUrl: zod_1.z.url().optional(),
    videoUrl: zod_1.z.url().optional(),
    error: zod_1.z.string().max(500).optional(),
    /** The choices of the request, resolved with the preset; absent in views written before 1.97.0. */
    choices: brief_js_1.VideoRequestChoicesSchema.optional(),
    /** Revision of the script the regia wrote (the person may ask to correct it); absent for presets without regia. */
    scriptRevision: exports.VideoScriptRevisionSchema.optional(),
    createdAt: zod_1.z.string().min(1),
    updatedAt: zod_1.z.string().min(1),
}).strict();
/** Link of a Google Drive folder or its id. */
exports.VideoDriveFolderRefSchema = zod_1.z.string().trim().min(10).max(300)
    .describe('Link di una cartella di Google Drive (https://drive.google.com/drive/folders/…) o il suo id.');
/**
 * What the model writes when an agent calls `video_footage_sync`: no identity (from the envelope, R-33).
 * `folder` absent = the last folder used for the same tenant and person.
 */
exports.VideoFootageSyncToolInputSchema = zod_1.z.strictObject({
    person: footage_js_1.VideoFootagePersonSchema.describe("Chi è ripreso, come nell'archivio (es. «stefano»)."),
    folder: exports.VideoDriveFolderRefSchema.optional(),
});
/** Id of a Google Drive file or folder. */
exports.VideoDriveFileIdSchema = zod_1.z.string().regex(/^[A-Za-z0-9_-]{10,200}$/);
exports.VideoFootageSyncFileStatusSchema = zod_1.z.enum(['in_coda', 'in_corso', 'aggiunta', 'gia_nell_archivio', 'rifiutata', 'errore']);
/** The engine's reasons, plus the two cap-video sees itself before downloading (over the byte limit, not a video type). */
exports.VideoFootageSyncReasonSchema = zod_1.z.enum([...footage_js_1.VideoFootageRejectionReasonSchema.options, 'troppo_grande', 'non_video']);
exports.VideoFootageSyncFileSchema = zod_1.z.strictObject({
    driveFileId: exports.VideoDriveFileIdSchema,
    name: zod_1.z.string().min(1).max(300),
    status: exports.VideoFootageSyncFileStatusSchema,
    footageId: footage_js_1.VideoFootageIdSchema.optional(),
    reason: exports.VideoFootageSyncReasonSchema.optional(),
}).superRefine((file, ctx) => {
    if ((file.footageId !== undefined) !== (file.status === 'aggiunta')) {
        ctx.addIssue({ code: 'custom', path: ['footageId'], message: 'footageId solo e sempre con lo stato aggiunta' });
    }
    if ((file.reason !== undefined) !== (file.status === 'rifiutata')) {
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'reason solo e sempre con lo stato rifiutata' });
    }
});
const syncFolderBase = {
    person: footage_js_1.VideoFootagePersonSchema,
    folderId: exports.VideoDriveFileIdSchema,
    limit: zod_1.z.literal(footage_js_1.VIDEO_FOOTAGE_MAX_PER_PERSON),
};
/** One outcome for the whole folder; `sincronizzata` carries one status per file. */
exports.VideoFootageSyncResponseSchema = zod_1.z.discriminatedUnion('outcome', [
    zod_1.z.strictObject({
        outcome: zod_1.z.literal('sincronizzata'),
        ...syncFolderBase,
        counted: zod_1.z.number().int().min(0).max(footage_js_1.VIDEO_FOOTAGE_MAX_PER_PERSON),
        files: zod_1.z.array(exports.VideoFootageSyncFileSchema).max(200),
    }),
    zod_1.z.strictObject({
        outcome: zod_1.z.literal('oltre_il_tetto'),
        ...syncFolderBase,
        counted: zod_1.z.number().int().min(0),
        newFiles: zod_1.z.number().int().positive(),
    }),
    zod_1.z.strictObject({
        outcome: zod_1.z.literal('serve_google'),
        permission: index_js_1.ConnectScopeSchema.extract(['drive_read']),
        reason: internal_connect_js_1.ConnectAccessErrorCodeSchema,
    }),
    zod_1.z.strictObject({
        outcome: zod_1.z.literal('cartella_illeggibile'),
        reason: zod_1.z.enum(['link_non_valido', 'nessuna_cartella', 'non_trovata']),
    }),
]);
/** Identity comes only from the admitted tool envelope (R-33), never from the model. */
exports.VideoStudioOpenToolInputSchema = zod_1.z.strictObject({});
/** One-use access link lifetime (15 minutes). */
exports.VIDEO_STUDIO_ACCESS_TTL_SECONDS = 900;
/** Authenticated studio session lifetime (12 hours). */
exports.VIDEO_STUDIO_SESSION_TTL_SECONDS = 43200;
exports.VideoStudioOpenResponseSchema = zod_1.z.strictObject({
    url: zod_1.z.url({ protocol: /^https$/ }).max(500),
    expiresAt: zod_1.z.iso.datetime({ offset: true }),
    sessionHours: zod_1.z.literal(12),
});
//# sourceMappingURL=tools.js.map