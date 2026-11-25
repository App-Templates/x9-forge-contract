"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.officinaVideoLongChaptersApproveContract = exports.officinaVideoLongChaptersGetContract = exports.officinaVideoLongChaptersPutContract = exports.officinaVideoLongDossierGetContract = exports.officinaVideoLongDossierPutContract = exports.officinaVideoLongResearchGetContract = exports.officinaVideoLongResearchStartContract = exports.officinaVideoLongCostGetContract = exports.officinaVideoLongDraftApproveContract = exports.officinaVideoLongDraftGetContract = exports.officinaVideoLongDraftPutContract = exports.officinaVideoLongGetContract = exports.officinaVideoLongListContract = exports.officinaVideoLongCreateContract = exports.officinaVideoUserPresetSaveContract = exports.officinaVideoUserPresetGetContract = exports.officinaVideoUserPresetListContract = exports.officinaVideoPresetFromVideoJobGetContract = exports.officinaVideoPresetFromVideoStartContract = exports.officinaVideoModelFrameApproveContract = exports.officinaVideoModelFrameContract = exports.officinaVideoModelStateContract = exports.officinaVideoModelRegiaApplyContract = exports.officinaVideoOutfitProductionCreateContract = exports.officinaVideoModelProductionCreateContract = exports.officinaVideoModelApproveContract = exports.officinaVideoModelRefGetContract = exports.officinaVideoModelRefAddContract = exports.officinaVideoModelVersionCreateContract = exports.officinaVideoModelGetContract = exports.officinaVideoModelListContract = exports.officinaVideoModelCreateContract = exports.officinaVideoFootageListContract = exports.officinaVideoFootageJobGetContract = exports.officinaVideoFootageAddContract = exports.officinaVideoMediaContract = exports.officinaVideoStoryEstimateContract = exports.officinaVideoStoryContract = exports.officinaVideoRunContract = exports.officinaVideoApproveContract = exports.officinaVideoPlanContract = exports.officinaVideoProjectGetContract = exports.officinaVideoHealthContract = exports.officinaVideoJobContract = void 0;
const zod_1 = require("zod");
const lungo_ricerca_js_1 = require("../../capability/video/lungo-ricerca.cjs");
const lungo_js_1 = require("../../capability/video/lungo.cjs");
const lungo_bozza_js_1 = require("../../capability/video/lungo-bozza.cjs");
const costo_passi_js_1 = require("../../capability/video/costo-passi.cjs");
const story_js_1 = require("../../capability/video/story.cjs");
const engine_js_1 = require("../../capability/video/engine.cjs");
const footage_js_1 = require("../../capability/video/footage.cjs");
const modella_js_1 = require("../../capability/video/modella.cjs");
const abito_js_1 = require("../../capability/video/abito.cjs");
const produzione_modella_js_1 = require("../../capability/video/produzione-modella.cjs");
const preset_da_video_js_1 = require("../../capability/video/preset-da-video.cjs");
const regia_js_1 = require("../../capability/video/regia.cjs");
/** cap-video -> Officina video engine. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
exports.officinaVideoJobContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/jobs',
    paramsSchema: zod_1.z.object({}).strict(),
    requestSchema: engine_js_1.VideoEngineJobSchema,
    responseSchema: engine_js_1.VideoEngineJobResponseSchema,
};
/** cap-video -> Officina video engine health probe. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
exports.officinaVideoHealthContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    responseSchema: engine_js_1.VideoEngineHealthSchema,
    responseStatus: 200,
    method: 'GET',
    path: '/api/health',
    paramsSchema: zod_1.z.object({}).strict(),
};
/** cap-video -> engine: read one project. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoProjectGetContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/projects/:engineProjectId',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    responseSchema: engine_js_1.VideoEngineProjectSchema,
};
/** cap-video -> engine: write the plan of a project. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoPlanContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/plan',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: engine_js_1.VideoEngineRoutePlanRequestSchema,
    responseSchema: engine_js_1.VideoEngineProjectSchema,
    responseStatus: 200,
};
/** cap-video -> engine: approve a stage at the revision that was shown. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoApproveContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/approve',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: engine_js_1.VideoEngineRouteApproveRequestSchema,
    responseSchema: engine_js_1.VideoEngineProjectSchema,
    responseStatus: 200,
};
/** cap-video -> engine: start a production stage (asynchronous, 202). Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoRunContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/run',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: engine_js_1.VideoEngineRouteRunRequestSchema,
    responseSchema: engine_js_1.VideoEngineProjectSchema,
    responseStatus: 202,
};
/**
 * cap-video -> engine: produce the story of a preset (voice, lip sync, graphic capture, montage) from the approved
 * regia. Asynchronous (202) and idempotent on `revision`; the state is read with GET project. Internal, INTERNAL_SECRET_HEADER.
 */
exports.officinaVideoStoryContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/story',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: story_js_1.VideoEngineStoryRequestSchema,
    responseStatus: 202,
};
/**
 * cap-video -> engine: upper estimate of a story, before email 1. Same body as the story (validated by the same contract),
 * no side effect, nothing paid: answers the figure the story start compares with the budget. Internal, INTERNAL_SECRET_HEADER.
 */
exports.officinaVideoStoryEstimateContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/story/estimate',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: story_js_1.VideoEngineStoryRequestSchema,
    responseSchema: story_js_1.VideoEngineStoryEstimateSchema,
    responseStatus: 200,
};
/** cap-video -> engine: one media file of a project. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoMediaContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    pathSchema: engine_js_1.VideoEngineMediaPathSchema,
};
/**
 * cap-video -> engine: add one shot to the footage archive. The body is the video itself (binary), the metadata and the
 * identity are in the query. Checks that are fast answer now (422 with the reason in `code`, e.g. a duplicate); the rest
 * runs in a job (202 + id), read with GET job. Internal, INTERNAL_SECRET_HEADER.
 */
exports.officinaVideoFootageAddContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    rejectedSchema: footage_js_1.VideoEngineFootageRejectedSchema,
    method: 'POST',
    path: '/api/footage',
    paramsSchema: zod_1.z.object({}).strict(),
    querySchema: footage_js_1.VideoFootageAddQuerySchema,
    bodyMediaTypes: footage_js_1.VIDEO_FOOTAGE_MEDIA_TYPES,
    maxBodyBytes: footage_js_1.VIDEO_FOOTAGE_MAX_BYTES,
    responseSchema: footage_js_1.VideoFootageJobAcceptedSchema,
    responseStatus: 202,
};
/** cap-video -> engine: state of one footage job. The job of another tenant is 404. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoFootageJobGetContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/footage/jobs/:jobId',
    paramsSchema: zod_1.z.object({ jobId: footage_js_1.VideoFootageJobIdSchema }).strict(),
    querySchema: footage_js_1.VideoFootageJobQuerySchema,
    responseSchema: footage_js_1.VideoFootageJobSchema,
    responseStatus: 200,
};
/**
 * cap-video -> engine: the footage archive of one person of the tenant. A person without an archive is `shots: []`.
 * Internal, INTERNAL_SECRET_HEADER only.
 */
exports.officinaVideoFootageListContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/footage',
    paramsSchema: zod_1.z.object({}).strict(),
    querySchema: footage_js_1.VideoFootageListQuerySchema,
    responseSchema: footage_js_1.VideoFootageListSchema,
    responseStatus: 200,
};
/** cap-video -> engine: model Create. Identity is in the query only. Internal, INTERNAL_SECRET_HEADER only. */
exports.officinaVideoModelCreateContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/modelle',
    paramsSchema: zod_1.z.object({}).strict(),
    querySchema: modella_js_1.VideoModelScopeQuerySchema,
    requestSchema: modella_js_1.VideoModelCreateRequestSchema,
    responseSchema: modella_js_1.VideoModelSchema,
    responseStatus: 201,
};
/** cap-video -> engine: model List. An empty scope returns models: []. Internal, INTERNAL_SECRET_HEADER only. */
exports.officinaVideoModelListContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/modelle',
    paramsSchema: zod_1.z.object({}).strict(),
    querySchema: modella_js_1.VideoModelScopeQuerySchema,
    responseSchema: modella_js_1.VideoModelListSchema,
    responseStatus: 200,
};
/** cap-video -> engine: model Get. A model belonging to another tenant or agent is 404. Internal, INTERNAL_SECRET_HEADER only. */
exports.officinaVideoModelGetContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/modelle/:modelId',
    paramsSchema: zod_1.z.object({ modelId: modella_js_1.VideoModelIdSchema }).strict(),
    querySchema: modella_js_1.VideoModelScopeQuerySchema,
    responseSchema: modella_js_1.VideoModelSchema,
    responseStatus: 200,
};
/** cap-video -> engine: model VersionCreate. Identity is in the query only. Internal, INTERNAL_SECRET_HEADER only. */
exports.officinaVideoModelVersionCreateContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/modelle/:modelId/versioni',
    paramsSchema: zod_1.z.object({ modelId: modella_js_1.VideoModelIdSchema }).strict(),
    querySchema: modella_js_1.VideoModelScopeQuerySchema,
    requestSchema: modella_js_1.VideoModelVersionCreateRequestSchema,
    responseSchema: modella_js_1.VideoModelVersionSchema,
    responseStatus: 201,
};
/** cap-video -> engine: model RefAdd. The image is binary; identity and kind are in the query. Internal, INTERNAL_SECRET_HEADER only. */
exports.officinaVideoModelRefAddContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/modelle/:modelId/versioni/:version/riferimenti',
    paramsSchema: zod_1.z.object({ modelId: modella_js_1.VideoModelIdSchema, version: modella_js_1.VideoModelVersionParamSchema }).strict(),
    querySchema: modella_js_1.VideoModelRefAddQuerySchema,
    bodyMediaTypes: modella_js_1.VIDEO_MODEL_REF_MEDIA_TYPES,
    maxBodyBytes: modella_js_1.VIDEO_MODEL_REF_MAX_BYTES,
    responseSchema: modella_js_1.VideoModelVersionSchema,
    responseStatus: 200,
};
/** cap-video -> engine: model RefGet. The response is a binary image. Internal, INTERNAL_SECRET_HEADER only. */
exports.officinaVideoModelRefGetContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/modelle/:modelId/versioni/:version/riferimenti/:kind',
    paramsSchema: zod_1.z.object({ modelId: modella_js_1.VideoModelIdSchema, version: modella_js_1.VideoModelVersionParamSchema, kind: modella_js_1.VideoModelRefKindSchema }).strict(),
    querySchema: modella_js_1.VideoModelScopeQuerySchema,
    responseMediaTypes: modella_js_1.VIDEO_MODEL_REF_MEDIA_TYPES,
    responseStatus: 200,
};
/** cap-video -> engine: model Approve. Identity is in the query only. Internal, INTERNAL_SECRET_HEADER only. */
exports.officinaVideoModelApproveContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/modelle/:modelId/versioni/:version/approva',
    paramsSchema: zod_1.z.object({ modelId: modella_js_1.VideoModelIdSchema, version: modella_js_1.VideoModelVersionParamSchema }).strict(),
    querySchema: modella_js_1.VideoModelScopeQuerySchema,
    requestSchema: modella_js_1.VideoModelApproveRequestSchema,
    responseSchema: modella_js_1.VideoModelVersionSchema,
    responseStatus: 200,
};
/** cap-video -> engine: create a production from the approved model and binary look image. */
exports.officinaVideoModelProductionCreateContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/produzioni-modella',
    paramsSchema: zod_1.z.object({}).strict(),
    querySchema: produzione_modella_js_1.VideoModelProductionQuerySchema,
    bodyMediaTypes: modella_js_1.VIDEO_MODEL_REF_MEDIA_TYPES,
    maxBodyBytes: modella_js_1.VIDEO_MODEL_REF_MAX_BYTES,
    responseSchema: produzione_modella_js_1.VideoModelProductionCreatedSchema,
    responseStatus: 201,
};
/** cap-video -> engine: create an outfit-change production from the person's own video (binary body). */
exports.officinaVideoOutfitProductionCreateContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/produzioni-abito',
    paramsSchema: zod_1.z.object({}).strict(),
    querySchema: abito_js_1.VideoOutfitProductionQuerySchema,
    bodyMediaTypes: abito_js_1.VIDEO_OUTFIT_MEDIA_TYPES,
    maxBodyBytes: abito_js_1.VIDEO_OUTFIT_MAX_BYTES,
    responseSchema: abito_js_1.VideoOutfitProductionCreatedSchema,
    responseStatus: 201,
};
/** cap-video -> engine: model production RegiaApply. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoModelRegiaApplyContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/regia-modella',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: regia_js_1.VideoModelRegiaDocumentSchema,
    responseSchema: produzione_modella_js_1.VideoModelProductionStateSchema,
    responseStatus: 200,
};
/** cap-video -> engine: model production State. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoModelStateContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/projects/:engineProjectId/modella',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    responseSchema: produzione_modella_js_1.VideoModelProductionStateSchema,
    responseStatus: 200,
};
/** cap-video -> engine: model production Frame. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoModelFrameContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/frame-campione',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: produzione_modella_js_1.VideoModelFrameRequestSchema,
    responseSchema: produzione_modella_js_1.VideoModelProductionStateSchema,
    responseStatus: 202,
};
/** cap-video -> engine: model production FrameApprove. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoModelFrameApproveContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/frame-campione/approva',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: produzione_modella_js_1.VideoModelFrameApproveRequestSchema,
    responseSchema: produzione_modella_js_1.VideoModelProductionStateSchema,
    responseStatus: 200,
};
/** cap-video -> engine: start a preset from an example video (URL). Identity in the query. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoPresetFromVideoStartContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/preset-da-video',
    paramsSchema: zod_1.z.object({}).strict(),
    querySchema: preset_da_video_js_1.VideoPresetFromVideoStartQuerySchema,
    requestSchema: preset_da_video_js_1.VideoPresetFromVideoStartRequestSchema,
    responseSchema: preset_da_video_js_1.VideoPresetFromVideoJobSchema,
    responseStatus: 202,
};
/** cap-video -> engine: state of one preset job. The job of another tenant is 404. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoPresetFromVideoJobGetContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/preset-da-video/jobs/:jobId',
    paramsSchema: zod_1.z.object({ jobId: preset_da_video_js_1.VideoPresetFromVideoJobSchema.shape.jobId }).strict(),
    querySchema: preset_da_video_js_1.VideoPresetFromVideoStartQuerySchema,
    responseSchema: preset_da_video_js_1.VideoPresetFromVideoJobSchema,
    responseStatus: 200,
};
/** cap-video -> engine: the presets of the tenant. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoUserPresetListContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/preset-utente',
    paramsSchema: zod_1.z.object({}).strict(),
    querySchema: preset_da_video_js_1.VideoPresetFromVideoStartQuerySchema,
    responseSchema: preset_da_video_js_1.VideoUserPresetListSchema,
    responseStatus: 200,
};
/** cap-video -> engine: one preset of the tenant. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoUserPresetGetContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/preset-utente/:presetId',
    paramsSchema: zod_1.z.object({ presetId: preset_da_video_js_1.VideoUserPresetIdSchema }).strict(),
    querySchema: preset_da_video_js_1.VideoPresetFromVideoStartQuerySchema,
    responseSchema: preset_da_video_js_1.VideoUserPresetSchema,
    responseStatus: 200,
};
/** cap-video -> engine: save the user's correction of a preset (status becomes `salvato`). Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoUserPresetSaveContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'PUT',
    path: '/api/preset-utente/:presetId',
    paramsSchema: zod_1.z.object({ presetId: preset_da_video_js_1.VideoUserPresetIdSchema }).strict(),
    querySchema: preset_da_video_js_1.VideoPresetFromVideoStartQuerySchema,
    requestSchema: preset_da_video_js_1.VideoPresetSaveRequestSchema,
    responseSchema: preset_da_video_js_1.VideoUserPresetSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project Create. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoLongCreateContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/lunghi',
    paramsSchema: zod_1.z.object({}).strict(),
    querySchema: lungo_js_1.VideoLongScopeQuerySchema,
    requestSchema: lungo_js_1.VideoLongCreateRequestSchema,
    responseSchema: lungo_js_1.VideoLongProjectSchema,
    responseStatus: 201,
};
/** cap-video -> engine: long project List. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoLongListContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/lunghi',
    paramsSchema: zod_1.z.object({}).strict(),
    querySchema: lungo_js_1.VideoLongScopeQuerySchema,
    responseSchema: lungo_js_1.VideoLongProjectListSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project Get. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoLongGetContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/lunghi/:projectId',
    paramsSchema: zod_1.z.object({ projectId: lungo_js_1.VideoLongProjectIdSchema }).strict(),
    querySchema: lungo_js_1.VideoLongScopeQuerySchema,
    responseSchema: lungo_js_1.VideoLongProjectSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project DraftPut. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoLongDraftPutContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'PUT',
    path: '/api/lunghi/:projectId/bozza',
    paramsSchema: zod_1.z.object({ projectId: lungo_js_1.VideoLongProjectIdSchema }).strict(),
    querySchema: lungo_js_1.VideoLongScopeQuerySchema,
    requestSchema: lungo_bozza_js_1.VideoLongDraftDocumentSchema,
    responseSchema: lungo_bozza_js_1.VideoLongDraftSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project DraftGet. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoLongDraftGetContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/lunghi/:projectId/bozza',
    paramsSchema: zod_1.z.object({ projectId: lungo_js_1.VideoLongProjectIdSchema }).strict(),
    querySchema: lungo_js_1.VideoLongScopeQuerySchema,
    responseSchema: lungo_bozza_js_1.VideoLongDraftSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project DraftApprove. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoLongDraftApproveContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/lunghi/:projectId/bozza/approva',
    paramsSchema: zod_1.z.object({ projectId: lungo_js_1.VideoLongProjectIdSchema }).strict(),
    querySchema: lungo_js_1.VideoLongScopeQuerySchema,
    requestSchema: lungo_bozza_js_1.VideoLongDraftApproveRequestSchema,
    responseSchema: lungo_bozza_js_1.VideoLongDraftSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project CostGet. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoLongCostGetContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/lunghi/:projectId/costi',
    paramsSchema: zod_1.z.object({ projectId: lungo_js_1.VideoLongProjectIdSchema }).strict(),
    querySchema: lungo_js_1.VideoLongScopeQuerySchema,
    responseSchema: costo_passi_js_1.VideoCostByStepSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project ResearchStart. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoLongResearchStartContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/lunghi/:projectId/ricerca',
    paramsSchema: zod_1.z.object({ projectId: lungo_js_1.VideoLongProjectIdSchema }).strict(),
    querySchema: lungo_js_1.VideoLongScopeQuerySchema,
    requestSchema: lungo_ricerca_js_1.VideoLongResearchStartRequestSchema,
    responseSchema: lungo_ricerca_js_1.VideoLongResearchSchema,
    responseStatus: 202,
};
/** cap-video -> engine: long project ResearchGet. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoLongResearchGetContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/lunghi/:projectId/ricerca',
    paramsSchema: zod_1.z.object({ projectId: lungo_js_1.VideoLongProjectIdSchema }).strict(),
    querySchema: lungo_js_1.VideoLongScopeQuerySchema,
    responseSchema: lungo_ricerca_js_1.VideoLongResearchSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project DossierPut. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoLongDossierPutContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'PUT',
    path: '/api/lunghi/:projectId/dossier',
    paramsSchema: zod_1.z.object({ projectId: lungo_js_1.VideoLongProjectIdSchema }).strict(),
    querySchema: lungo_js_1.VideoLongScopeQuerySchema,
    requestSchema: lungo_ricerca_js_1.VideoLongDossierDocumentSchema,
    responseSchema: lungo_ricerca_js_1.VideoLongDossierSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project DossierGet. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoLongDossierGetContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/lunghi/:projectId/dossier',
    paramsSchema: zod_1.z.object({ projectId: lungo_js_1.VideoLongProjectIdSchema }).strict(),
    querySchema: lungo_js_1.VideoLongScopeQuerySchema,
    responseSchema: lungo_ricerca_js_1.VideoLongDossierSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project ChaptersPut. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoLongChaptersPutContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'PUT',
    path: '/api/lunghi/:projectId/capitoli',
    paramsSchema: zod_1.z.object({ projectId: lungo_js_1.VideoLongProjectIdSchema }).strict(),
    querySchema: lungo_js_1.VideoLongScopeQuerySchema,
    requestSchema: lungo_ricerca_js_1.VideoLongChaptersDocumentSchema,
    responseSchema: lungo_ricerca_js_1.VideoLongChaptersSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project ChaptersGet. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoLongChaptersGetContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/lunghi/:projectId/capitoli',
    paramsSchema: zod_1.z.object({ projectId: lungo_js_1.VideoLongProjectIdSchema }).strict(),
    querySchema: lungo_js_1.VideoLongScopeQuerySchema,
    responseSchema: lungo_ricerca_js_1.VideoLongChaptersSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project ChaptersApprove. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoLongChaptersApproveContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/lunghi/:projectId/capitoli/approva',
    paramsSchema: zod_1.z.object({ projectId: lungo_js_1.VideoLongProjectIdSchema }).strict(),
    querySchema: lungo_js_1.VideoLongScopeQuerySchema,
    requestSchema: lungo_ricerca_js_1.VideoLongChaptersApproveRequestSchema,
    responseSchema: lungo_ricerca_js_1.VideoLongChaptersSchema,
    responseStatus: 200,
};
//# sourceMappingURL=officina-video.js.map