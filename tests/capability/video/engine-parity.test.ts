import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ZodType } from 'zod';
import {
  VIDEO_MODEL_REF_MEDIA_TYPES, VIDEO_MODEL_REF_MAX_BYTES,
  VideoModelProductionQuerySchema, VideoModelProductionCreatedSchema, VideoModelRegiaDocumentSchema,
  VideoModelProductionStateSchema, VideoModelFrameRequestSchema, VideoModelFrameApproveRequestSchema,
  VideoEngineJobSchema, VideoEngineJobResponseSchema, VideoEngineProjectSchema,
  VideoEngineRoutePlanRequestSchema, VideoEngineRouteApproveRequestSchema,
  VideoEngineRouteRunRequestSchema, VideoEngineErrorSchema, VideoEngineHealthSchema,
  VideoEngineStoryRequestSchema, VideoEngineStoryEstimateSchema,
  VideoModelScopeQuerySchema, VideoModelRefAddQuerySchema, VideoModelCreateRequestSchema,
  VideoModelVersionCreateRequestSchema, VideoModelApproveRequestSchema, VideoModelVersionSchema, VideoModelSchema, VideoModelListSchema,
  VideoFootageAddQuerySchema, VideoFootageJobAcceptedSchema, VideoEngineFootageRejectedSchema,
  VideoFootageJobQuerySchema, VideoFootageJobSchema, VideoFootageListQuerySchema, VideoFootageListSchema,
} from '../../../src/capability/video/index.js';
import { INTERNAL_SECRET_HEADER } from '../../../src/auth/auth-headers.js';
import {
  officinaVideoModelProductionCreateContract, officinaVideoModelRegiaApplyContract,
  officinaVideoModelStateContract, officinaVideoModelFrameContract, officinaVideoModelFrameApproveContract,
} from '../../../src/http/endpoints/officina-video.js';
import { getPortableCapabilityContracts } from '../../../src/capability/portable-contracts.js';

const ID = 'a'.repeat(32);
const media = `/media/${ID}`;
const project = {
  id: ID, status: 'draft', revision: 1,
  scenes: [{ id: 'scene-1', title: 'Plants', narration: 'Plants speak.',
    frame_prompt: 'A garden', frame_url: `${media}/frame-1.png`, clip_url: null }],
  jobs: [{ stage: 'frames', status: 'completed', error: null, id: 'job-1' }],
};
const job = {
  videoProjectId: 'video-1',
  identity: { tenantId: 't-1', ownerId: 'o-2', agentId: 'agent-7' },
  requestedBy: 'editor-3', presetId: 'story-split-sync',
  settings: { aspectRatio: '9:16', provider: 'demo', durationSeconds: 30, sceneCount: 3 },
  budgetUsd: 12.5, mode: 'approval', name: 'Product introduction',
  brief: 'Create a short video introducing the new product.', externalRef: 'campaign-4',
};
const portraitRef = { engineProjectId: ID, fileName: 'ritratto-1.png', sha256: 'b'.repeat(64) };
const episode = {
  seriesId: '123e4567-e89b-42d3-a456-426614174000', seriesTitle: 'Notte a Roma', logline: 'Una notte, tre segreti.',
  language: 'it', episodeNumber: 2, totalEpisodes: 30, paywallEpisode: 10,
  previousEnding: { type: 'incoming-threat', text: 'La porta si apre.' },
  hooks: [{ id: 'chiave', description: 'La chiave sparita.', plantedEpisode: 1, lastTouchedEpisode: 1,
    status: 'open', isMain: true, paidEpisode: null }],
  characters: [{ id: 'anna', name: 'Anna', description: 'Fotografa di strada.', portrait: portraitRef }],
};
const episodeEstimate = { framesUsd: 0.5, clipsUsd: 3, totalUsd: 3.5, availableUsd: 12.5, fitsBudget: true, source: 'plan' };
const estimate = {
  estimateUsd: 1.2, voiceUsd: 0.2, lipSyncUsd: 1, estimatedSeconds: 30,
  characters: 250, availableUsd: 12.5, serverAvailableUsd: null,
  fitsBudget: false, source: 'story estimate',
};
const story = {
  scenes: [{ text: 'Plants speak.' }], graphicHtml: '<script>function render(t){}</script>',
  outro: { title: 'In practice', line: 'Each plant has a rhythm.' }, revision: 3,
};
const footageQuery = {
  ...job.identity, person: 'stefano', place: 'piscina', outfit: 'maglietta grigia',
  framing: 'largo', fileName: 'IMG_0412 (1).MOV',
};
const footageJob = { jobId: ID, fileName: 'clip.mp4' };
const footageRejection = { error: 'Ripresa rifiutata.', operation_state: 'rejected', code: 'doppione' };


const modelDescription = { face: 'Oval face', body: 'Tall', hair: 'Long brown hair' };
const modelGeneration = { model: 'img-model-1', seed: 42, parameters: [{ name: 'steps', value: '30' }] };
const modelRef = { kind: 'frontale', fileName: 'frontale.png', sha256: 'b'.repeat(64), width: 1024, height: 1536, sizeBytes: 5000 };
const modelVersion = {
  version: 1, status: 'approvata', description: modelDescription, refs: [modelRef], generation: modelGeneration,
  createdAt: '2026-11-17T10:00:00Z', approvedAt: '2026-11-17T10:05:00.123Z', digest: 'c'.repeat(64),
};
const model = { id: 'giulia-1', name: 'Giulia', identity: job.identity, versions: [modelVersion], currentVersion: 1 };

const productionQuery = {
  ...job.identity, videoProjectId: 'video-1', modelId: model.id, modelVersion: '1',
  purpose: 'Show the summer collection', name: 'Summer look', durationSeconds: '30',
  budgetUsd: '12.50', fileName: 'Look (1).JPG',
};
const productionCreated = { engineProjectId: ID, lookSha256: 'd'.repeat(64), modelDigest: modelVersion.digest };
const modelShot = {
  title: 'Arrival', location: 'Rome', environment: 'A sunny street', interior: false,
  action: 'Walk towards the camera', camera: 'Medium shot', wardrobe: 'look', durationSeconds: 6,
};
const modelRegia = { version: 2, shots: Array.from({ length: 3 }, () => ({ ...modelShot })), caption: 'Summer in Rome' };
const modelFrame = {
  status: 'pronto', frameUrl: `${media}/campione.png`, frameSha256: 'e'.repeat(64),
  similarity: { outcome: 'da_rivedere', reason: 'volto_non_rilevato', score: null, threshold: 0.363 },
  approvedAt: null, approvedBy: null, reviewConfirmed: false, error: null,
};
const productionState = {
  modelId: model.id, modelVersion: 1, modelDigest: modelVersion.digest,
  lookSha256: productionCreated.lookSha256, purpose: productionQuery.purpose, regiaApplied: true, frame: modelFrame,
};
const frameApproval = { revision: 1, frameSha256: modelFrame.frameSha256, confirmReview: true };

// Verdicts come from the canonical schema: a shared contract change is not a parity failure.
// Gate counterchecks: remove Error.strict() to check shared evolution; change a pattern
// only in the temporary catalog to check divergence detection. Compare parsed values too:
// accepting the same input is insufficient if one runtime strips fields the other preserves.
const corpus: Record<string, { schema: ZodType; cases: Record<string, unknown>; minimum?: number; accepted?: readonly string[] }> = {
  videoEngineProject: {
    schema: VideoEngineProjectSchema,
    cases: {
      'demo project with scenes and jobs': project,
      'demo project with engine subtitles': {
        ...project, subtitles_url: `${media}/sottotitoli-0123456789abcdef.srt`,
      },
      'null subtitles': { ...project, subtitles_url: null },
      'completed story with subtitles': {
        ...project, status: 'completed',
        story: {
          status: 'completed', output_url: `${media}/story.mp4`,
          subtitles_url: `${media}/sottotitoli-0123456789abcdef.srt`,
        },
      },
      'video used as subtitles': { ...project, subtitles_url: `${media}/video.mp4` },
      'completed story and engine-owned fields': {
        ...project, status: 'completed', spent_usd: 1.2, output_url: `${media}/final.mp4`,
        story: { status: 'completed', step: 'done', output_url: `${media}/story.mp4`, error: null, revision: 1 },
        budget: { limit_usd: 12.5 }, cost_summary: { actual_usd: 1.2 },
        approvals: { plan: 1 }, artifacts: [{ path: `${media}/story.mp4` }],
      },
      'null output and frame': { ...project, output_url: null, scenes: [{ id: 'scene-1', frame_url: null }] },
      'empty draft': { ...project, scenes: [], jobs: [], story: null },
      'non hexadecimal id': { ...project, id: 'g'.repeat(32) },
      'zero revision': { ...project, revision: 0 },
      'frame outside media': { ...project, scenes: [{ id: 'scene-1', frame_url: '/tmp/frame.png' }] },
      'unknown story status': { ...project, story: { status: 'done' } },
      'episode outcome and portraits': {
        ...project,
        episode_outcome: {
          phase: 'golden_three', cycleBeat: null, ending: { type: 'incoming-threat', text: 'La porta si apre.' },
          hooksOpened: [{ id: 'chiave', description: 'La chiave sparita.' }], hooksTouched: [], hooksClosed: [],
        },
        episode_estimate: episodeEstimate,
        episode_portraits: [{ characterId: 'anna', portrait: portraitRef }],
      },
      'unknown ending type': {
        ...project,
        episode_outcome: {
          phase: 'golden_three', cycleBeat: null, ending: { type: 'cliffhanger', text: 'x' },
          hooksOpened: [], hooksTouched: [], hooksClosed: [],
        },
      },
      'null episode fields': { ...project, episode_outcome: null, episode_estimate: null, episode_portraits: null },
    },
  },
  videoEnginePlanRequest: {
    schema: VideoEngineRoutePlanRequestSchema,
    cases: {
      'facade body': {},
      'quote': { quote_id: ID },
      'retry authorization': { retry_authorization_id: ID },
      'recipe body': { quote_id: ID, retry_authorization_id: ID, revision: 1 },
      'invalid quote': { quote_id: 'abc' },
      'invalid authorization': { retry_authorization_id: 'abc' },
      'zero revision': { revision: 0 },
      'extra field': { extra: 1 },
    },
  },
  videoEngineApproveRequest: {
    schema: VideoEngineRouteApproveRequestSchema,
    cases: {
      'plan approval': { stage: 'plan', revision: 2 },
      'frames approval': { stage: 'frames', revision: 2 },
      'final approval': { stage: 'final', revision: 2 },
      'recipe references': { stage: 'references', revision: 2 },
      'recipe voice': { stage: 'voice', revision: 3 },
      'unknown stage': { stage: 'story', revision: 1 },
      'missing revision': { stage: 'plan' },
      'zero revision': { stage: 'plan', revision: 0 },
      'extra field': { stage: 'plan', revision: 1, extra: 1 },
    },
  },
  videoEngineRunRequest: {
    schema: VideoEngineRouteRunRequestSchema,
    cases: {
      'frames without revision': { stage: 'frames' },
      'clips with revision': { stage: 'clips', revision: 4 },
      'assemble': { stage: 'assemble' },
      'recipe voice quote': { stage: 'voice', revision: 3, quote_id: ID },
      'recipe animatic': { stage: 'animatic', scene_ids: [ID] },
      'scene limit': { stage: 'clips', scene_ids: Array.from({ length: 32 }, () => ID) },
      'unknown stage': { stage: 'story' },
      'invalid quote': { stage: 'voice', quote_id: 'abc' },
      'extra field': { stage: 'voice', extra: 1 },
      'too many scenes': { stage: 'clips', scene_ids: Array.from({ length: 33 }, () => ID) },
      'invalid scene': { stage: 'clips', scene_ids: ['abc'] },
    },
  },
  videoEngineError: {
    schema: VideoEngineErrorSchema,
    cases: {
      'over budget': { error: 'Preventivo 5.01 USD oltre…', operation_state: 'rejected', code: 'story_over_budget' },
      'internal error': { error: 'Errore interno del motore locale.', operation_state: 'uncertain', code: 'internal_error' },
      'invalid token': { error: 'Token interno non valido.', operation_state: 'rejected', code: 'request_rejected' },
      'omitted metadata': { error: 'Request failed.' },
      'null metadata': { error: 'Request failed.', operation_state: null, code: null },
      'pending': { error: 'Request failed.', operation_state: 'pending' },
      'string limits': { error: 'e'.repeat(2000), code: 'c'.repeat(64) },
      'missing error': {},
      'metadata without error': { operation_state: 'rejected', code: 'request_rejected' },
      'unknown state': { error: 'Request failed.', operation_state: 'done' },
      'extra field': { error: 'Request failed.', extra: true },
      'empty error': { error: '' },
      'long error': { error: 'e'.repeat(2001) },
      'null error': { error: null },
      'numeric error': { error: 42 },
      'numeric state': { error: 'Request failed.', operation_state: 42 },
      'empty code': { error: 'Request failed.', code: '' },
      'long code': { error: 'Request failed.', code: 'c'.repeat(65) },
      'numeric code': { error: 'Request failed.', code: 42 },
    },
  },
  videoEngineHealth: {
    schema: VideoEngineHealthSchema,
    cases: {
      'healthy': { ok: true, ffmpeg: true, ffprobe: true },
      'unhealthy': { ok: false, ffmpeg: false, ffprobe: false },
      'paid enabled': { ok: true, ffmpeg: true, ffprobe: true, paid_enabled: true },
      'engine details pass through': {
        ok: true, ffmpeg: true, ffprobe: true, paid_enabled: false,
        providers: { demo: true }, vimax: { ok: true }, remotion: { ok: false },
        voice: { ok: true }, cloud_voice: { ok: false },
      },
      'missing ffmpeg': { ok: true, ffprobe: true },
      'missing ok': { ffmpeg: true, ffprobe: true },
      'missing ffprobe': { ok: true, ffmpeg: true },
      'string ok': { ok: 'true', ffmpeg: true, ffprobe: true },
      'string ffmpeg': { ok: true, ffmpeg: 'true', ffprobe: true },
      'string ffprobe': { ok: true, ffmpeg: true, ffprobe: 'true' },
      'string paid flag': { ok: true, ffmpeg: true, ffprobe: true, paid_enabled: 'false' },
      'null paid flag': { ok: true, ffmpeg: true, ffprobe: true, paid_enabled: null },
    },
  },
  videoEngineStoryRequest: {
    schema: VideoEngineStoryRequestSchema,
    cases: {
      'default resolution': story,
      'trimmed text': { ...story, scenes: [{ text: '  Plants speak.\n' }] },
      'voice tags': { ...story, scenes: [{ text: 'Plants speak.', tags: ['calm', 'conversational'] }] },
      'footage and resolution': { ...story, footage: ['piante-02'], resolution: '720p' },
      'bracketed tag': { ...story, scenes: [{ text: 'Plants speak.', tags: ['[calm]'] }] },
      'string footage': { ...story, footage: 'piante-02' },
      'empty scenes': { ...story, scenes: [] },
      'extra field': { ...story, extra: true },
    },
  },
  videoEngineJob: {
    schema: VideoEngineJobSchema, minimum: 1,
    cases: {
      'decided production job': job,
      'episode job': { ...job, episode },
      'episode with extra field': { ...job, episode: { ...episode, extra: true } },
      'episode without characters': { ...job, episode: { ...episode, characters: [] } },
      'extra field': { ...job, extra: true },
      'missing settings': Object.fromEntries(Object.entries(job).filter(([key]) => key !== 'settings')),
    },
  },
  videoEngineJobResponse: {
    schema: VideoEngineJobResponseSchema, minimum: 1,
    cases: {
      'queued job': { engineProjectId: ID, status: 'queued' },
      'extra field': { engineProjectId: ID, status: 'queued', extra: true },
      'missing status': { engineProjectId: ID },
    },
  },
  videoEngineStoryEstimate: {
    schema: VideoEngineStoryEstimateSchema, minimum: 1,
    cases: {
      'server limit unset': estimate,
      'extra field': { ...estimate, extra: true },
      'missing source': Object.fromEntries(Object.entries(estimate).filter(([key]) => key !== 'source')),
    },
  },
  videoEngineFootageAddQuery: {
    schema: VideoFootageAddQuerySchema,
    cases: {
      'archive upload metadata': footageQuery,
      'group and note': { ...footageQuery, group: 'piscina-01', note: 'sole alto' },
      'trimmed outfit': { ...footageQuery, outfit: '  maglietta grigia  ' },
      'metadata string limits': { ...footageQuery, outfit: 'x'.repeat(80), note: 'n'.repeat(500) },
      'missing tenant': Object.fromEntries(Object.entries(footageQuery).filter(([key]) => key !== 'tenantId')),
      'missing owner': Object.fromEntries(Object.entries(footageQuery).filter(([key]) => key !== 'ownerId')),
      'missing agent': Object.fromEntries(Object.entries(footageQuery).filter(([key]) => key !== 'agentId')),
      'person path': { ...footageQuery, person: '../x' },
      'unknown framing': { ...footageQuery, framing: 'wide' },
      'blank outfit': { ...footageQuery, outfit: '  ' },
      'long outfit': { ...footageQuery, outfit: 'x'.repeat(81) },
      'long note': { ...footageQuery, note: 'n'.repeat(501) },
      'file path': { ...footageQuery, fileName: '../clip.mp4' },
      'unsupported container': { ...footageQuery, fileName: 'clip.avi' },
      'extra field': { ...footageQuery, extra: true },
    },
  },
  videoEngineFootageJobAccepted: {
    schema: VideoFootageJobAcceptedSchema, minimum: 1,
    cases: {
      'accepted upload': { jobId: ID },
      'missing job id': {},
      'short job id': { jobId: 'abc' },
      'non hexadecimal job id': { jobId: 'g'.repeat(32) },
      'extra field': { jobId: ID, extra: true },
    },
  },
  videoEngineFootageRejected: {
    schema: VideoEngineFootageRejectedSchema,
    cases: {
      'duplicate': footageRejection,
      'unreadable': { ...footageRejection, code: 'illeggibile' },
      'too short': { ...footageRejection, code: 'troppo_corta' },
      'low resolution': { ...footageRejection, code: 'risoluzione_bassa' },
      'no face': { ...footageRejection, code: 'senza_volto' },
      'no scene and error limit': { ...footageRejection, code: 'nessuna_scena', error: 'e'.repeat(2000) },
      'unknown rejection reason': { ...footageRejection, code: 'altro' },
      'unknown operation state': { ...footageRejection, operation_state: 'failed' },
      'empty error': { ...footageRejection, error: '' },
      'long error': { ...footageRejection, error: 'e'.repeat(2001) },
      'extra field': { ...footageRejection, extra: true },
    },
  },
  videoEngineFootageJobQuery: {
    schema: VideoFootageJobQuerySchema, minimum: 1,
    cases: {
      'scoped job lookup': job.identity,
      'missing identity': {},
      'missing tenant': { ownerId: job.identity.ownerId, agentId: job.identity.agentId },
      'missing owner': { tenantId: job.identity.tenantId, agentId: job.identity.agentId },
      'missing agent': { tenantId: job.identity.tenantId, ownerId: job.identity.ownerId },
      'extra field': { ...job.identity, extra: true },
    },
  },
  videoEngineFootageJob: {
    schema: VideoFootageJobSchema,
    cases: {
      'queued upload': { ...footageJob, status: 'queued' },
      'running upload': { ...footageJob, status: 'running' },
      'completed upload': {
        ...footageJob, status: 'completed', footage: { id: 'piscina-03', scenes: 4, durationSeconds: 12.5 },
      },
      'rejected upload': { ...footageJob, status: 'rejected', code: 'senza_volto', error: 'Nessun volto.' },
      'failed upload': { ...footageJob, status: 'failed', error: 'ffprobe failed.' },
      'interrupted upload': { ...footageJob, status: 'interrupted', error: 'Engine restarted.' },
      'unknown status': { ...footageJob, status: 'done' },
      'malformed job id': { ...footageJob, jobId: '../x', status: 'queued' },
      'completed without footage': { ...footageJob, status: 'completed' },
      'rejected with unknown reason': { ...footageJob, status: 'rejected', code: 'altro', error: 'Refused.' },
      'failed without error': { ...footageJob, status: 'failed' },
      'completed without scenes': {
        ...footageJob, status: 'completed', footage: { id: 'piscina-03', scenes: 0, durationSeconds: 12.5 },
      },
      'extra field': { ...footageJob, status: 'queued', extra: true },
    },
  },
  videoEngineFootageListQuery: {
    schema: VideoFootageListQuerySchema, minimum: 1,
    cases: {
      'scoped list': { ...job.identity, person: 'stefano' },
      'person path': { ...job.identity, person: '../x' },
      'missing person': job.identity,
      'extra field': { ...job.identity, person: 'stefano', extra: true },
    },
  },
  videoEngineFootageList: {
    schema: VideoFootageListSchema,
    cases: {
      'empty archive': { person: 'stefano', shots: [] },
      'one shot': { person: 'stefano', shots: [{
        id: 'piscina-03', place: 'piscina', outfit: 'grey shirt', framing: 'largo', durationSeconds: 12.5, scenes: 3,
        sha256: 'a'.repeat(64), fileName: 'piscina.mp4',
      }] },
      'grouped shot': { person: 'stefano', shots: [{
        id: 'piscina-04', place: 'piscina', outfit: 'grey shirt', framing: 'stretto', group: 'piscina-03', durationSeconds: 8, scenes: 0,
        sha256: 'b'.repeat(64), fileName: 'piscina-stretto.mp4',
      }] },
      'two shots': { person: 'stefano', shots: [0, 1].map(n => ({
        id: `ufficio-0${n + 1}`, place: 'ufficio', outfit: 'black sweater', framing: 'medio', durationSeconds: 20, scenes: 2,
        sha256: `${n}`.repeat(64), fileName: 'ufficio.mp4',
      })) },
      'wide framing': { person: 'stefano', shots: [{
        id: 'piscina-03', place: 'piscina', outfit: 'grey shirt', framing: 'wide', durationSeconds: 12.5, scenes: 3,
        sha256: 'a'.repeat(64), fileName: 'piscina.mp4',
      }] },
      'extra field': { person: 'stefano', shots: [], extra: true },
      'person path': { person: '../x', shots: [] },
      'sha256 uppercase': { person: 'stefano', shots: [{
        id: 'piscina-03', place: 'piscina', outfit: 'grey shirt', framing: 'largo', durationSeconds: 12.5, scenes: 3,
        sha256: 'A'.repeat(64), fileName: 'piscina.mp4',
      }] },
      'negative scenes': { person: 'stefano', shots: [{
        id: 'piscina-03', place: 'piscina', outfit: 'grey shirt', framing: 'largo', durationSeconds: 12.5, scenes: -1,
        sha256: 'a'.repeat(64), fileName: 'piscina.mp4',
      }] },
    },
  },
  videoEngineModelQuery: {
    schema: VideoModelScopeQuerySchema, minimum: 1,
    cases: {
      'scoped query': job.identity,
      'missing tenant': { ownerId: job.identity.ownerId, agentId: job.identity.agentId },
      'missing agent': { tenantId: job.identity.tenantId, ownerId: job.identity.ownerId },
      'extra field': { ...job.identity, extra: 1 },
    },
  },
  videoEngineModelRefAddQuery: {
    schema: VideoModelRefAddQuerySchema, minimum: 1,
    cases: {
      front: { ...job.identity, kind: 'frontale' },
      'full body': { ...job.identity, kind: 'figura_intera' },
      'unknown angle': { ...job.identity, kind: 'laterale' },
      'missing kind': job.identity,
      'missing owner': { tenantId: job.identity.tenantId, agentId: job.identity.agentId, kind: 'frontale' },
    },
  },
  videoEngineModelCreateRequest: {
    schema: VideoModelCreateRequestSchema, minimum: 1,
    cases: {
      create: { name: 'Giulia', description: modelDescription, generation: modelGeneration },
      'empty name': { name: '', description: modelDescription, generation: modelGeneration },
      'missing hair': { name: 'Giulia', description: { face: modelDescription.face, body: modelDescription.body }, generation: modelGeneration },
      'body identity': { name: 'Giulia', description: modelDescription, generation: modelGeneration, identity: job.identity },
    },
  },
  videoEngineModelVersionCreateRequest: {
    schema: VideoModelVersionCreateRequestSchema, minimum: 1,
    cases: {
      seeded: { description: modelDescription, generation: modelGeneration },
      'no seed': { description: modelDescription, generation: { ...modelGeneration, seed: null } },
      'negative seed': { description: modelDescription, generation: { ...modelGeneration, seed: -1 } },
      'too many parameters': { description: modelDescription, generation: { ...modelGeneration, parameters: Array.from({ length: 21 }, (_, i) => ({ name: `p${i}`, value: 'v' })) } },
    },
  },
  videoEngineModelApproveRequest: {
    schema: VideoModelApproveRequestSchema, minimum: 1,
    cases: {
      approve: { digest: modelVersion.digest },
      uppercase: { digest: 'C'.repeat(64) },
      short: { digest: 'abc' },
      'extra field': { digest: modelVersion.digest, extra: 1 },
    },
  },
  videoEngineModelVersion: {
    schema: VideoModelVersionSchema, minimum: 1,
    cases: {
      approved: modelVersion,
      'draft without images': { ...modelVersion, status: 'bozza', refs: [], approvedAt: null },
      'five references': { ...modelVersion, refs: Array.from({ length: 5 }, () => modelRef) },
      'unknown status': { ...modelVersion, status: 'pubblicata' },
      'reference path': { ...modelVersion, refs: [{ ...modelRef, fileName: '../x.png' }] },
      'zero version': { ...modelVersion, version: 0 },
    },
  },
  videoEngineModel: {
    schema: VideoModelSchema, minimum: 1,
    cases: {
      approved: model,
      'without approved version': { ...model, versions: [{ ...modelVersion, status: 'bozza', refs: [], approvedAt: null }], currentVersion: null },
      'id path': { ...model, id: '../x' },
      'uppercase id': { ...model, id: 'Giulia' },
      'missing identity': { id: model.id, name: model.name, versions: model.versions, currentVersion: model.currentVersion },
      'extra field': { ...model, extra: 1 },
    },
  },
  videoEngineModelList: {
    schema: VideoModelListSchema, minimum: 1,
    cases: {
      'one model': { models: [model] },
      empty: { models: [] },
      'extra field': { models: [], extra: 1 },
      'empty model id': { models: [{ ...model, id: '' }] },
    },
  },
  videoEngineModelProductionQuery: {
    schema: VideoModelProductionQuerySchema, minimum: 1,
    accepted: ['production', 'look note', 'minimum duration', 'maximum duration'],
    cases: {
      production: productionQuery,
      'look note': { ...productionQuery, lookNote: '  Red silk dress  ' },
      'minimum duration': { ...productionQuery, durationSeconds: '18' },
      'maximum duration': { ...productionQuery, durationSeconds: '60' },
      '17 seconds': { ...productionQuery, durationSeconds: '17' },
      '61 seconds': { ...productionQuery, durationSeconds: '61' },
      'zero budget': { ...productionQuery, budgetUsd: '0' },
      'look path traversal': { ...productionQuery, fileName: '../look.jpg' },
      'missing modelId': Object.fromEntries(Object.entries(productionQuery).filter(([key]) => key !== 'modelId')),
      'missing tenantId': Object.fromEntries(Object.entries(productionQuery).filter(([key]) => key !== 'tenantId')),
      'numeric version': { ...productionQuery, modelVersion: 1 },
      'numeric duration': { ...productionQuery, durationSeconds: 30 },
      'numeric budget': { ...productionQuery, budgetUsd: 12.5 },
      'empty purpose': { ...productionQuery, purpose: '  ' },
      'empty look note': { ...productionQuery, lookNote: '  ' },
      'extra field': { ...productionQuery, extra: true },
    },
  },
  videoEngineModelProductionCreated: {
    schema: VideoModelProductionCreatedSchema, minimum: 1, accepted: ['created'],
    cases: {
      created: productionCreated,
      'short id': { ...productionCreated, engineProjectId: 'abc' },
      'uppercase hash': { ...productionCreated, lookSha256: 'D'.repeat(64) },
      'extra field': { ...productionCreated, extra: true },
    },
  },
  videoEngineModelRegia: {
    schema: VideoModelRegiaDocumentSchema, minimum: 1, accepted: ['three shots', 'outfit note'],
    cases: {
      'three shots': modelRegia,
      'outfit note': { ...modelRegia, outfitNote: '  Red silk dress  ' },
      'two shots': { ...modelRegia, shots: Array.from({ length: 2 }, () => modelShot) },
      'nine shots': { ...modelRegia, shots: Array.from({ length: 9 }, () => modelShot) },
      'version 1': { ...modelRegia, version: 1 },
      'other wardrobe': { ...modelRegia, shots: [{ ...modelShot, wardrobe: 'altro' }, modelShot, modelShot] },
      'multiline location': { ...modelRegia, shots: [{ ...modelShot, location: 'Rome\nMilan' }, modelShot, modelShot] },
      'missing caption': { version: 2, shots: modelRegia.shots },
    },
  },
  videoEngineModelState: {
    schema: VideoModelProductionStateSchema, minimum: 1,
    accepted: ['frame needs review', 'absent frame', 'approved by person', 'rejected likeness'],
    cases: {
      'frame needs review': productionState,
      'absent frame': { ...productionState, frame: { ...modelFrame, status: 'assente', frameUrl: null, frameSha256: null, similarity: null } },
      'approved by person': { ...productionState, frame: {
        ...modelFrame, approvedAt: '2026-11-17T11:00:00.123Z', approvedBy: 'persona',
        similarity: { outcome: 'ok', reason: 'confermata', score: 0.7, threshold: 0.363 },
      } },
      'rejected likeness': { ...productionState, frame: { ...modelFrame, similarity: { outcome: 'respinto', reason: 'sotto_soglia', score: -1, threshold: 1 } } },
      'green outcome': { ...productionState, frame: { ...modelFrame, similarity: { ...modelFrame.similarity, outcome: 'verde' } } },
      'approved by system': { ...productionState, frame: { ...modelFrame, approvedAt: '2026-11-17T11:00:00Z', approvedBy: 'sistema' } },
      'unsafe frame URL': { ...productionState, frame: { ...modelFrame, frameUrl: '/etc/passwd' } },
      'extra field': { ...productionState, extra: true },
      'missing frame': Object.fromEntries(Object.entries(productionState).filter(([key]) => key !== 'frame')),
      'unknown frame status': { ...productionState, frame: { ...modelFrame, status: 'done' } },
      'uppercase frame hash': { ...productionState, frame: { ...modelFrame, frameSha256: 'E'.repeat(64) } },
      'non UTC approval': { ...productionState, frame: { ...modelFrame, approvedAt: '2026-11-17T11:00:00+01:00' } },
      'unknown similarity reason': { ...productionState, frame: { ...modelFrame, similarity: { ...modelFrame.similarity, reason: 'unknown' } } },
      'score above one': { ...productionState, frame: { ...modelFrame, similarity: { ...modelFrame.similarity, score: 1.1 } } },
      'threshold below minus one': { ...productionState, frame: { ...modelFrame, similarity: { ...modelFrame.similarity, threshold: -1.1 } } },
      'long error': { ...productionState, frame: { ...modelFrame, error: 'x'.repeat(501) } },
    },
  },
  videoEngineModelFrameRequest: {
    schema: VideoModelFrameRequestSchema, minimum: 1, accepted: ['revision'],
    cases: { revision: { revision: 1 }, zero: { revision: 0 }, missing: {}, extra: { revision: 1, extra: true } },
  },
  videoEngineModelFrameApproveRequest: {
    schema: VideoModelFrameApproveRequestSchema, minimum: 1, accepted: ['confirmed review', 'without review confirmation'],
    cases: {
      'confirmed review': frameApproval,
      'without review confirmation': { ...frameApproval, confirmReview: false },
      'missing confirmReview': { revision: 1, frameSha256: modelFrame.frameSha256 },
      'missing fingerprint': { revision: 1, confirmReview: true },
      'text confirmation': { ...frameApproval, confirmReview: 'si' },
      'zero revision': { ...frameApproval, revision: 0 },
      'extra field': { ...frameApproval, extra: true },
    },
  },
};

type Verdict = { ok: boolean; value?: unknown };

function generatedRuntime(): string {
  const directory = mkdtempSync(join(tmpdir(), 'bridge-engine-parity-'));
  const catalogPath = join(directory, 'catalog.json');
  writeFileSync(catalogPath, JSON.stringify(getPortableCapabilityContracts()));
  execFileSync('node', [resolve('scripts/generate-portable-capability-contracts.mjs'),
    '--catalog', catalogPath, '--output', directory], { stdio: 'pipe' });
  return join(directory, 'x9_forge_contracts_capabilities.py');
}

function pythonVerdicts(module: string): Record<string, Record<string, Verdict>> {
  const values = Object.fromEntries(Object.entries(corpus).map(([name, entry]) => [name, entry.cases]));
  const out = execFileSync('python3', ['-B', '-c', `
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location('generated_engine', sys.argv[1])
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
result = {}
for contract, cases in json.load(sys.stdin).items():
    result[contract] = {}
    for name, value in cases.items():
        try:
            result[contract][name] = dict(ok=True, value=module.validate_contract(contract, value))
        except ValueError:
            result[contract][name] = dict(ok=False)
print(json.dumps(result))
`, module], { input: JSON.stringify(values), encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  return JSON.parse(out) as Record<string, Record<string, Verdict>>;
}

describe('engine contracts: zod and generated Python parity', () => {
  const python = pythonVerdicts(generatedRuntime());

  it('covers every videoEngine catalog entry', () => {
    const names = Object.keys(getPortableCapabilityContracts().contracts).filter(name => name.startsWith('videoEngine'));
    expect(Object.keys(corpus).sort()).toEqual(names.sort());
  });

  for (const [contract, { schema, cases, minimum = 4, accepted }] of Object.entries(corpus)) {
    describe(contract, () => {
      for (const [name, value] of Object.entries(cases)) {
        it(name, () => {
          const zod = schema.safeParse(value);
          if (accepted) {
            expect(zod.success, `${contract}/${name}: expected verdict`).toBe(accepted.includes(name));
            expect(python[contract]?.[name]?.ok, `${contract}/${name}: Python expected verdict`).toBe(accepted.includes(name));
          }
          expect(python[contract]?.[name]?.ok, `${contract}/${name}: zod ${zod.success}`).toBe(zod.success);
          if (zod.success) expect(python[contract]![name]!.value).toEqual(zod.data);
        });
      }

      it('has enough accepted and refused examples', () => {
        const verdicts = Object.values(cases).map(value => schema.safeParse(value).success);
        expect(verdicts.filter(Boolean).length).toBeGreaterThanOrEqual(minimum);
        expect(verdicts.filter(ok => !ok).length).toBeGreaterThanOrEqual(minimum === 1 ? 2 : 4);
      });
    });
  }
});

// SUMMARY: replacing approvedBy's z.literal('persona') with z.string() must fail
// videoEngineModelState / approved by system in both Zod and generated Python.
// Acceptance, type checks and this mutation are run by the gate.
const productionRoutes = [
  ['videoEngineModelProductionCreate', officinaVideoModelProductionCreateContract, 'POST', '/api/produzioni-modella', 201, undefined, 'videoEngineModelProductionCreated'],
  ['videoEngineModelRegiaApply', officinaVideoModelRegiaApplyContract, 'POST', '/api/projects/:engineProjectId/regia-modella', 200, 'videoEngineModelRegia', 'videoEngineModelState'],
  ['videoEngineModelState', officinaVideoModelStateContract, 'GET', '/api/projects/:engineProjectId/modella', 200, undefined, 'videoEngineModelState'],
  ['videoEngineModelFrame', officinaVideoModelFrameContract, 'POST', '/api/projects/:engineProjectId/frame-campione', 202, 'videoEngineModelFrameRequest', 'videoEngineModelState'],
  ['videoEngineModelFrameApprove', officinaVideoModelFrameApproveContract, 'POST', '/api/projects/:engineProjectId/frame-campione/approva', 200, 'videoEngineModelFrameApproveRequest', 'videoEngineModelState'],
] as const;

describe('model production route wiring', () => {
  for (const [name, contract, method, path, responseStatus, requestContract, responseContract] of productionRoutes) {
    it(`${name} publishes its route and supported portable contracts`, () => {
      expect(contract).toMatchObject({ method, path, responseStatus, errorSchema: VideoEngineErrorSchema });
      const { contracts, transports } = getPortableCapabilityContracts();
      const transport = transports[name];
      expect(transport).toMatchObject({ method, path, authHeader: INTERNAL_SECRET_HEADER, errorContract: 'videoEngineError', responseContract });
      expect(transport!.requestContract).toBe(requestContract);
      for (const target of [requestContract, responseContract, 'videoEngineError']) {
        if (target) expect(contracts[target], target).toMatchObject({ supported: true, rules: [], customRefinements: 0, gates: [] });
      }
      const params = contract === officinaVideoModelProductionCreateContract ? {} : { engineProjectId: ID };
      expect(contract.paramsSchema.safeParse(params).success).toBe(true);
      expect(contract.paramsSchema.safeParse({ ...params, extra: true }).success).toBe(false);
      if (contract !== officinaVideoModelProductionCreateContract) {
        expect(contract.paramsSchema.safeParse({ engineProjectId: '../x' }).success).toBe(false);
        expect(contract.responseSchema).toBe(VideoModelProductionStateSchema);
      }
    });
  }

  it('requires query identity and publishes binary look limits', () => {
    const contract = officinaVideoModelProductionCreateContract;
    expect(contract.querySchema).toBe(VideoModelProductionQuerySchema);
    expect(contract.querySchema.safeParse(productionQuery).success).toBe(true);
    for (const key of ['tenantId', 'ownerId', 'agentId']) {
      const query = Object.fromEntries(Object.entries(productionQuery).filter(([field]) => field !== key));
      expect(contract.querySchema.safeParse(query).success, key).toBe(false);
    }
    expect(contract.responseSchema).toBe(VideoModelProductionCreatedSchema);
    expect(contract.bodyMediaTypes).toBe(VIDEO_MODEL_REF_MEDIA_TYPES);
    expect(contract.maxBodyBytes).toBe(VIDEO_MODEL_REF_MAX_BYTES);
    expect(contract).not.toHaveProperty('requestSchema');
    const { contracts, transports } = getPortableCapabilityContracts();
    expect(transports.videoEngineModelProductionCreate).toMatchObject({
      queryContract: 'videoEngineModelProductionQuery', bodyMediaTypes: VIDEO_MODEL_REF_MEDIA_TYPES, maxBodyBytes: VIDEO_MODEL_REF_MAX_BYTES,
    });
    expect(contracts.videoEngineModelProductionQuery).toMatchObject({ supported: true, customRefinements: 0, rules: [], gates: [] });
  });

  it('uses canonical regia and frame request schemas', () => {
    expect(officinaVideoModelRegiaApplyContract.requestSchema).toBe(VideoModelRegiaDocumentSchema);
    expect(officinaVideoModelFrameContract.requestSchema).toBe(VideoModelFrameRequestSchema);
    expect(officinaVideoModelFrameApproveContract.requestSchema).toBe(VideoModelFrameApproveRequestSchema);
  });
});
