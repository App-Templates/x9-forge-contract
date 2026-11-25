import { z } from 'zod';
import { VideoLongResearchStartRequestSchema, VideoLongResearchSchema, VideoLongDossierDocumentSchema, VideoLongDossierSchema, VideoLongChaptersDocumentSchema, VideoLongChaptersSchema, VideoLongChaptersApproveRequestSchema } from "../../capability/video/lungo-ricerca.js";
import { VideoLongScopeQuerySchema, VideoLongProjectIdSchema, VideoLongCreateRequestSchema, VideoLongProjectSchema, VideoLongProjectListSchema } from "../../capability/video/lungo.js";
import { VideoLongDraftDocumentSchema, VideoLongDraftSchema, VideoLongDraftApproveRequestSchema } from "../../capability/video/lungo-bozza.js";
import { VideoCostByStepSchema } from "../../capability/video/costo-passi.js";
import { VideoEngineStoryRequestSchema, VideoEngineStoryEstimateSchema } from "../../capability/video/story.js";
import { VideoEngineErrorSchema, VideoEngineHealthSchema, VideoEngineJobSchema, VideoEngineJobResponseSchema, VideoEngineProjectSchema, VideoEngineRoutePlanRequestSchema, VideoEngineRouteApproveRequestSchema, VideoEngineRouteRunRequestSchema, VideoEngineMediaPathSchema } from "../../capability/video/engine.js";
import { VIDEO_FOOTAGE_MAX_BYTES, VIDEO_FOOTAGE_MEDIA_TYPES, VideoFootageAddQuerySchema, VideoFootageJobAcceptedSchema, VideoFootageJobIdSchema, VideoFootageJobQuerySchema, VideoFootageJobSchema, VideoEngineFootageRejectedSchema, VideoFootageListQuerySchema, VideoFootageListSchema } from "../../capability/video/footage.js";
import { VIDEO_MODEL_REF_MEDIA_TYPES, VIDEO_MODEL_REF_MAX_BYTES, VideoModelScopeQuerySchema, VideoModelRefAddQuerySchema, VideoModelCreateRequestSchema, VideoModelVersionCreateRequestSchema, VideoModelApproveRequestSchema, VideoModelSchema, VideoModelListSchema, VideoModelVersionSchema, VideoModelIdSchema, VideoModelVersionParamSchema, VideoModelRefKindSchema } from "../../capability/video/modella.js";
import { VideoEnvironmentIdSchema, VideoEnvironmentVersionParamSchema, VideoEnvironmentAngleNameSchema, VideoEnvironmentScopeQuerySchema, VideoEnvironmentCreateRequestSchema, VideoEnvironmentVersionCreateRequestSchema, VideoEnvironmentAngleRequestSchema, VideoEnvironmentApproveRequestSchema, VideoEnvironmentSchema, VideoEnvironmentListSchema, VideoEnvironmentVersionSchema } from "../../capability/video/ambiente.js";
import { VIDEO_OUTFIT_MEDIA_TYPES, VIDEO_OUTFIT_MAX_BYTES, VideoOutfitProductionQuerySchema, VideoOutfitProductionCreatedSchema } from "../../capability/video/abito.js";
import { VideoModelProductionQuerySchema, VideoModelProductionCreatedSchema, VideoModelProductionStateSchema, VideoModelFrameRequestSchema, VideoModelFrameApproveRequestSchema } from "../../capability/video/produzione-modella.js";
import { VideoPresetFromVideoStartQuerySchema, VideoPresetFromVideoStartRequestSchema, VideoPresetFromVideoJobSchema, VideoPresetSaveRequestSchema, VideoUserPresetSchema, VideoUserPresetListSchema, VideoUserPresetIdSchema } from "../../capability/video/preset-da-video.js";
import { VideoModelRegiaDocumentSchema } from "../../capability/video/regia.js";
import { VideoOutfitStyleRequestSchema, VideoOutfitStyleResultSchema } from "../../capability/video/abito-stile.js";
/** cap-video -> Officina video engine. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
export const officinaVideoJobContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/jobs',
    paramsSchema: z.object({}).strict(),
    requestSchema: VideoEngineJobSchema,
    responseSchema: VideoEngineJobResponseSchema,
};
/** cap-video -> Officina video engine health probe. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
export const officinaVideoHealthContract = {
    errorSchema: VideoEngineErrorSchema,
    responseSchema: VideoEngineHealthSchema,
    responseStatus: 200,
    method: 'GET',
    path: '/api/health',
    paramsSchema: z.object({}).strict(),
};
/** cap-video -> engine: read one project. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoProjectGetContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/projects/:engineProjectId',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    responseSchema: VideoEngineProjectSchema,
};
/** cap-video -> engine: write the plan of a project. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoPlanContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/plan',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: VideoEngineRoutePlanRequestSchema,
    responseSchema: VideoEngineProjectSchema,
    responseStatus: 200,
};
/** cap-video -> engine: approve a stage at the revision that was shown. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoApproveContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/approve',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: VideoEngineRouteApproveRequestSchema,
    responseSchema: VideoEngineProjectSchema,
    responseStatus: 200,
};
/** cap-video -> engine: start a production stage (asynchronous, 202). Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoRunContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/run',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: VideoEngineRouteRunRequestSchema,
    responseSchema: VideoEngineProjectSchema,
    responseStatus: 202,
};
/**
 * cap-video -> engine: produce the story of a preset (voice, lip sync, graphic capture, montage) from the approved
 * regia. Asynchronous (202) and idempotent on `revision`; the state is read with GET project. Internal, INTERNAL_SECRET_HEADER.
 */
export const officinaVideoStoryContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/story',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: VideoEngineStoryRequestSchema,
    responseStatus: 202,
};
/**
 * cap-video -> engine: upper estimate of a story, before email 1. Same body as the story (validated by the same contract),
 * no side effect, nothing paid: answers the figure the story start compares with the budget. Internal, INTERNAL_SECRET_HEADER.
 */
export const officinaVideoStoryEstimateContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/story/estimate',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: VideoEngineStoryRequestSchema,
    responseSchema: VideoEngineStoryEstimateSchema,
    responseStatus: 200,
};
/** cap-video -> engine: one media file of a project. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoMediaContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    pathSchema: VideoEngineMediaPathSchema,
};
/**
 * cap-video -> engine: add one shot to the footage archive. The body is the video itself (binary), the metadata and the
 * identity are in the query. Checks that are fast answer now (422 with the reason in `code`, e.g. a duplicate); the rest
 * runs in a job (202 + id), read with GET job. Internal, INTERNAL_SECRET_HEADER.
 */
export const officinaVideoFootageAddContract = {
    errorSchema: VideoEngineErrorSchema,
    rejectedSchema: VideoEngineFootageRejectedSchema,
    method: 'POST',
    path: '/api/footage',
    paramsSchema: z.object({}).strict(),
    querySchema: VideoFootageAddQuerySchema,
    bodyMediaTypes: VIDEO_FOOTAGE_MEDIA_TYPES,
    maxBodyBytes: VIDEO_FOOTAGE_MAX_BYTES,
    responseSchema: VideoFootageJobAcceptedSchema,
    responseStatus: 202,
};
/** cap-video -> engine: state of one footage job. The job of another tenant is 404. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoFootageJobGetContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/footage/jobs/:jobId',
    paramsSchema: z.object({ jobId: VideoFootageJobIdSchema }).strict(),
    querySchema: VideoFootageJobQuerySchema,
    responseSchema: VideoFootageJobSchema,
    responseStatus: 200,
};
/**
 * cap-video -> engine: the footage archive of one person of the tenant. A person without an archive is `shots: []`.
 * Internal, INTERNAL_SECRET_HEADER only.
 */
export const officinaVideoFootageListContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/footage',
    paramsSchema: z.object({}).strict(),
    querySchema: VideoFootageListQuerySchema,
    responseSchema: VideoFootageListSchema,
    responseStatus: 200,
};
/** cap-video -> engine: model Create. Identity is in the query only. Internal, INTERNAL_SECRET_HEADER only. */
export const officinaVideoModelCreateContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/modelle',
    paramsSchema: z.object({}).strict(),
    querySchema: VideoModelScopeQuerySchema,
    requestSchema: VideoModelCreateRequestSchema,
    responseSchema: VideoModelSchema,
    responseStatus: 201,
};
/** cap-video -> engine: model List. An empty scope returns models: []. Internal, INTERNAL_SECRET_HEADER only. */
export const officinaVideoModelListContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/modelle',
    paramsSchema: z.object({}).strict(),
    querySchema: VideoModelScopeQuerySchema,
    responseSchema: VideoModelListSchema,
    responseStatus: 200,
};
/** cap-video -> engine: model Get. A model belonging to another tenant or agent is 404. Internal, INTERNAL_SECRET_HEADER only. */
export const officinaVideoModelGetContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/modelle/:modelId',
    paramsSchema: z.object({ modelId: VideoModelIdSchema }).strict(),
    querySchema: VideoModelScopeQuerySchema,
    responseSchema: VideoModelSchema,
    responseStatus: 200,
};
/**
 * cap-video -> engine: compose an outfit in the imported character's style, without creating a resource.
 * Errors use VideoEngineErrorSchema.code: non_da_parallel, richiesta_non_valida, modello_non_trovato.
 * A model belonging to another tenant or agent is 404. Identity is in the query only. Internal, INTERNAL_SECRET_HEADER only.
 */
export const officinaVideoModelOutfitStyleContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/modelle/:modelId/abito-stile',
    paramsSchema: z.object({ modelId: VideoModelIdSchema }).strict(),
    querySchema: VideoModelScopeQuerySchema,
    requestSchema: VideoOutfitStyleRequestSchema,
    responseSchema: VideoOutfitStyleResultSchema,
    responseStatus: 200,
};
/** cap-video -> engine: model VersionCreate. Identity is in the query only. Internal, INTERNAL_SECRET_HEADER only. */
export const officinaVideoModelVersionCreateContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/modelle/:modelId/versioni',
    paramsSchema: z.object({ modelId: VideoModelIdSchema }).strict(),
    querySchema: VideoModelScopeQuerySchema,
    requestSchema: VideoModelVersionCreateRequestSchema,
    responseSchema: VideoModelVersionSchema,
    responseStatus: 201,
};
/** cap-video -> engine: model RefAdd. The image is binary; identity and kind are in the query. Internal, INTERNAL_SECRET_HEADER only. */
export const officinaVideoModelRefAddContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/modelle/:modelId/versioni/:version/riferimenti',
    paramsSchema: z.object({ modelId: VideoModelIdSchema, version: VideoModelVersionParamSchema }).strict(),
    querySchema: VideoModelRefAddQuerySchema,
    bodyMediaTypes: VIDEO_MODEL_REF_MEDIA_TYPES,
    maxBodyBytes: VIDEO_MODEL_REF_MAX_BYTES,
    responseSchema: VideoModelVersionSchema,
    responseStatus: 200,
};
/** cap-video -> engine: model RefGet. The response is a binary image. Internal, INTERNAL_SECRET_HEADER only. */
export const officinaVideoModelRefGetContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/modelle/:modelId/versioni/:version/riferimenti/:kind',
    paramsSchema: z.object({ modelId: VideoModelIdSchema, version: VideoModelVersionParamSchema, kind: VideoModelRefKindSchema }).strict(),
    querySchema: VideoModelScopeQuerySchema,
    responseMediaTypes: VIDEO_MODEL_REF_MEDIA_TYPES,
    responseStatus: 200,
};
/** cap-video -> engine: model Approve. Identity is in the query only. Internal, INTERNAL_SECRET_HEADER only. */
export const officinaVideoModelApproveContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/modelle/:modelId/versioni/:version/approva',
    paramsSchema: z.object({ modelId: VideoModelIdSchema, version: VideoModelVersionParamSchema }).strict(),
    querySchema: VideoModelScopeQuerySchema,
    requestSchema: VideoModelApproveRequestSchema,
    responseSchema: VideoModelVersionSchema,
    responseStatus: 200,
};
/** cap-video -> engine: environment Create. Identity is in the query only. Internal, INTERNAL_SECRET_HEADER only. */
export const officinaVideoEnvironmentCreateContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/ambienti',
    paramsSchema: z.object({}).strict(),
    querySchema: VideoEnvironmentScopeQuerySchema,
    requestSchema: VideoEnvironmentCreateRequestSchema,
    responseSchema: VideoEnvironmentSchema,
    responseStatus: 201,
};
/** cap-video -> engine: environment List. An empty scope returns environments: []. Identity is in the query only. Internal, INTERNAL_SECRET_HEADER only. */
export const officinaVideoEnvironmentListContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/ambienti',
    paramsSchema: z.object({}).strict(),
    querySchema: VideoEnvironmentScopeQuerySchema,
    responseSchema: VideoEnvironmentListSchema,
    responseStatus: 200,
};
/** cap-video -> engine: environment Get. An environment of another tenant or agent is 404. Identity is in the query only. Internal, INTERNAL_SECRET_HEADER only. */
export const officinaVideoEnvironmentGetContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/ambienti/:environmentId',
    paramsSchema: z.object({ environmentId: VideoEnvironmentIdSchema }).strict(),
    querySchema: VideoEnvironmentScopeQuerySchema,
    responseSchema: VideoEnvironmentSchema,
    responseStatus: 200,
};
/** cap-video -> engine: environment VersionCreate. Identity is in the query only. Internal, INTERNAL_SECRET_HEADER only. */
export const officinaVideoEnvironmentVersionCreateContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/ambienti/:environmentId/versioni',
    paramsSchema: z.object({ environmentId: VideoEnvironmentIdSchema }).strict(),
    querySchema: VideoEnvironmentScopeQuerySchema,
    requestSchema: VideoEnvironmentVersionCreateRequestSchema,
    responseSchema: VideoEnvironmentVersionSchema,
    responseStatus: 201,
};
/** cap-video -> engine: environment AngleAdd. The generation happens inside the call. Identity is in the query only. Internal, INTERNAL_SECRET_HEADER only. */
export const officinaVideoEnvironmentAngleAddContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/ambienti/:environmentId/versioni/:version/angolazioni',
    paramsSchema: z.object({ environmentId: VideoEnvironmentIdSchema, version: VideoEnvironmentVersionParamSchema }).strict(),
    querySchema: VideoEnvironmentScopeQuerySchema,
    requestSchema: VideoEnvironmentAngleRequestSchema,
    responseSchema: VideoEnvironmentVersionSchema,
    responseStatus: 201,
};
/** cap-video -> engine: environment AngleGet. The response is a binary image. Identity is in the query only. Internal, INTERNAL_SECRET_HEADER only. */
export const officinaVideoEnvironmentAngleGetContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/ambienti/:environmentId/versioni/:version/angolazioni/:angle',
    paramsSchema: z.object({ environmentId: VideoEnvironmentIdSchema, version: VideoEnvironmentVersionParamSchema, angle: VideoEnvironmentAngleNameSchema }).strict(),
    querySchema: VideoEnvironmentScopeQuerySchema,
    responseMediaTypes: VIDEO_MODEL_REF_MEDIA_TYPES,
    responseStatus: 200,
};
/** cap-video -> engine: environment Approve. Identity is in the query only. Internal, INTERNAL_SECRET_HEADER only. */
export const officinaVideoEnvironmentApproveContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/ambienti/:environmentId/versioni/:version/approva',
    paramsSchema: z.object({ environmentId: VideoEnvironmentIdSchema, version: VideoEnvironmentVersionParamSchema }).strict(),
    querySchema: VideoEnvironmentScopeQuerySchema,
    requestSchema: VideoEnvironmentApproveRequestSchema,
    responseSchema: VideoEnvironmentVersionSchema,
    responseStatus: 200,
};
/** cap-video -> engine: create a production from the approved model and binary look image. */
export const officinaVideoModelProductionCreateContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/produzioni-modella',
    paramsSchema: z.object({}).strict(),
    querySchema: VideoModelProductionQuerySchema,
    bodyMediaTypes: VIDEO_MODEL_REF_MEDIA_TYPES,
    maxBodyBytes: VIDEO_MODEL_REF_MAX_BYTES,
    responseSchema: VideoModelProductionCreatedSchema,
    responseStatus: 201,
};
/** cap-video -> engine: create an outfit-change production from the person's own video (binary body). */
export const officinaVideoOutfitProductionCreateContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/produzioni-abito',
    paramsSchema: z.object({}).strict(),
    querySchema: VideoOutfitProductionQuerySchema,
    bodyMediaTypes: VIDEO_OUTFIT_MEDIA_TYPES,
    maxBodyBytes: VIDEO_OUTFIT_MAX_BYTES,
    responseSchema: VideoOutfitProductionCreatedSchema,
    responseStatus: 201,
};
/** cap-video -> engine: model production RegiaApply. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoModelRegiaApplyContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/regia-modella',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: VideoModelRegiaDocumentSchema,
    responseSchema: VideoModelProductionStateSchema,
    responseStatus: 200,
};
/** cap-video -> engine: model production State. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoModelStateContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/projects/:engineProjectId/modella',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    responseSchema: VideoModelProductionStateSchema,
    responseStatus: 200,
};
/** cap-video -> engine: model production Frame. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoModelFrameContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/frame-campione',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: VideoModelFrameRequestSchema,
    responseSchema: VideoModelProductionStateSchema,
    responseStatus: 202,
};
/** cap-video -> engine: model production FrameApprove. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoModelFrameApproveContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/frame-campione/approva',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: VideoModelFrameApproveRequestSchema,
    responseSchema: VideoModelProductionStateSchema,
    responseStatus: 200,
};
/** cap-video -> engine: start a preset from an example video (URL). Identity in the query. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoPresetFromVideoStartContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/preset-da-video',
    paramsSchema: z.object({}).strict(),
    querySchema: VideoPresetFromVideoStartQuerySchema,
    requestSchema: VideoPresetFromVideoStartRequestSchema,
    responseSchema: VideoPresetFromVideoJobSchema,
    responseStatus: 202,
};
/** cap-video -> engine: state of one preset job. The job of another tenant is 404. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoPresetFromVideoJobGetContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/preset-da-video/jobs/:jobId',
    paramsSchema: z.object({ jobId: VideoPresetFromVideoJobSchema.shape.jobId }).strict(),
    querySchema: VideoPresetFromVideoStartQuerySchema,
    responseSchema: VideoPresetFromVideoJobSchema,
    responseStatus: 200,
};
/** cap-video -> engine: the presets of the tenant. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoUserPresetListContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/preset-utente',
    paramsSchema: z.object({}).strict(),
    querySchema: VideoPresetFromVideoStartQuerySchema,
    responseSchema: VideoUserPresetListSchema,
    responseStatus: 200,
};
/** cap-video -> engine: one preset of the tenant. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoUserPresetGetContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/preset-utente/:presetId',
    paramsSchema: z.object({ presetId: VideoUserPresetIdSchema }).strict(),
    querySchema: VideoPresetFromVideoStartQuerySchema,
    responseSchema: VideoUserPresetSchema,
    responseStatus: 200,
};
/** cap-video -> engine: save the user's correction of a preset (status becomes `salvato`). Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoUserPresetSaveContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'PUT',
    path: '/api/preset-utente/:presetId',
    paramsSchema: z.object({ presetId: VideoUserPresetIdSchema }).strict(),
    querySchema: VideoPresetFromVideoStartQuerySchema,
    requestSchema: VideoPresetSaveRequestSchema,
    responseSchema: VideoUserPresetSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project Create. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoLongCreateContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/lunghi',
    paramsSchema: z.object({}).strict(),
    querySchema: VideoLongScopeQuerySchema,
    requestSchema: VideoLongCreateRequestSchema,
    responseSchema: VideoLongProjectSchema,
    responseStatus: 201,
};
/** cap-video -> engine: long project List. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoLongListContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/lunghi',
    paramsSchema: z.object({}).strict(),
    querySchema: VideoLongScopeQuerySchema,
    responseSchema: VideoLongProjectListSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project Get. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoLongGetContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/lunghi/:projectId',
    paramsSchema: z.object({ projectId: VideoLongProjectIdSchema }).strict(),
    querySchema: VideoLongScopeQuerySchema,
    responseSchema: VideoLongProjectSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project DraftPut. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoLongDraftPutContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'PUT',
    path: '/api/lunghi/:projectId/bozza',
    paramsSchema: z.object({ projectId: VideoLongProjectIdSchema }).strict(),
    querySchema: VideoLongScopeQuerySchema,
    requestSchema: VideoLongDraftDocumentSchema,
    responseSchema: VideoLongDraftSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project DraftGet. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoLongDraftGetContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/lunghi/:projectId/bozza',
    paramsSchema: z.object({ projectId: VideoLongProjectIdSchema }).strict(),
    querySchema: VideoLongScopeQuerySchema,
    responseSchema: VideoLongDraftSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project DraftApprove. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoLongDraftApproveContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/lunghi/:projectId/bozza/approva',
    paramsSchema: z.object({ projectId: VideoLongProjectIdSchema }).strict(),
    querySchema: VideoLongScopeQuerySchema,
    requestSchema: VideoLongDraftApproveRequestSchema,
    responseSchema: VideoLongDraftSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project CostGet. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoLongCostGetContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/lunghi/:projectId/costi',
    paramsSchema: z.object({ projectId: VideoLongProjectIdSchema }).strict(),
    querySchema: VideoLongScopeQuerySchema,
    responseSchema: VideoCostByStepSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project ResearchStart. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoLongResearchStartContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/lunghi/:projectId/ricerca',
    paramsSchema: z.object({ projectId: VideoLongProjectIdSchema }).strict(),
    querySchema: VideoLongScopeQuerySchema,
    requestSchema: VideoLongResearchStartRequestSchema,
    responseSchema: VideoLongResearchSchema,
    responseStatus: 202,
};
/** cap-video -> engine: long project ResearchGet. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoLongResearchGetContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/lunghi/:projectId/ricerca',
    paramsSchema: z.object({ projectId: VideoLongProjectIdSchema }).strict(),
    querySchema: VideoLongScopeQuerySchema,
    responseSchema: VideoLongResearchSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project DossierPut. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoLongDossierPutContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'PUT',
    path: '/api/lunghi/:projectId/dossier',
    paramsSchema: z.object({ projectId: VideoLongProjectIdSchema }).strict(),
    querySchema: VideoLongScopeQuerySchema,
    requestSchema: VideoLongDossierDocumentSchema,
    responseSchema: VideoLongDossierSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project DossierGet. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoLongDossierGetContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/lunghi/:projectId/dossier',
    paramsSchema: z.object({ projectId: VideoLongProjectIdSchema }).strict(),
    querySchema: VideoLongScopeQuerySchema,
    responseSchema: VideoLongDossierSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project ChaptersPut. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoLongChaptersPutContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'PUT',
    path: '/api/lunghi/:projectId/capitoli',
    paramsSchema: z.object({ projectId: VideoLongProjectIdSchema }).strict(),
    querySchema: VideoLongScopeQuerySchema,
    requestSchema: VideoLongChaptersDocumentSchema,
    responseSchema: VideoLongChaptersSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project ChaptersGet. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoLongChaptersGetContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/lunghi/:projectId/capitoli',
    paramsSchema: z.object({ projectId: VideoLongProjectIdSchema }).strict(),
    querySchema: VideoLongScopeQuerySchema,
    responseSchema: VideoLongChaptersSchema,
    responseStatus: 200,
};
/** cap-video -> engine: long project ChaptersApprove. Identity is in the query. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoLongChaptersApproveContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/lunghi/:projectId/capitoli/approva',
    paramsSchema: z.object({ projectId: VideoLongProjectIdSchema }).strict(),
    querySchema: VideoLongScopeQuerySchema,
    requestSchema: VideoLongChaptersApproveRequestSchema,
    responseSchema: VideoLongChaptersSchema,
    responseStatus: 200,
};
//# sourceMappingURL=officina-video.js.map