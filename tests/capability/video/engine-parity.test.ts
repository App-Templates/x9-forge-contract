import * as V from '../../../src/capability/video/index.js';
import { VideoOutfitProductionQuerySchema, VideoOutfitProductionCreatedSchema } from '../../../src/capability/video/abito.js';
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
const outfitQuery = {
  tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1', videoProjectId: 'video-1', name: 'Camminata',
  model: 'kling-4-edit', resolution: '720p', budgetUsd: '8', fileName: 'clip.mp4',
};
const outfitCreated = { engineProjectId: 'a'.repeat(32), sourceSha256: 'b'.repeat(64), durationSeconds: 12 };
const without = (o: Record<string, unknown>, key: string) => Object.fromEntries(Object.entries(o).filter(([k]) => k !== key));
const sha = (c: string) => c.repeat(64);
const scope = job.identity;
const communityId = '01HZX3K9M2Q7R5T8V4W6Y0B1CD';
// SUMMARY 9424: adds the supplied corpus for 23 engine contracts without changing existing cases.
// Gate mutation (not run here): set envDescription.room to ''. The 'has enough accepted
// and refused examples' checks must fail for videoEngineEnvironmentCreateRequest,
// videoEngineEnvironment, videoEngineEnvironmentVersionCreateRequest and
// videoEngineEnvironmentVersion, even though Zod and Python still agree on rejection.
// Restore the room description after the mutation. Acceptance and type checks run at the gate.
const envDescription = { room: 'Studio con pareti bianche', furniture: 'Due poltrone e un tavolino', light: 'Luce morbida dalla finestra' };
const envAngle = { name: 'frontale', framing: 'Inquadratura larga dalla porta', imagePath: 'angolo-1.png', sha256: sha('a') };
const envVersion = {
  number: 1, status: 'approvata', description: envDescription, angles: [envAngle],
  createdAt: '2026-11-25T10:00:00Z', approvedAt: '2026-11-25T10:05:00.123Z', digest: sha('c'),
};
const environment = { id: 'studio-podcast', name: 'Studio podcast', kind: 'studio', identity: scope, versions: [envVersion], currentVersion: 1 };
const presetScene = { index: 0, durationSeconds: 4, framing: 'largo', movement: 'fissa', transitionIn: 'taglio', role: 'gancio', roleSource: 'stimato' };
const userPreset = {
  id: 'utente-intervista-breve', name: 'Intervista breve', identity: scope, status: 'bozza', revision: 1, basedOn: 'singola',
  source: { durationSeconds: 45, aspectRatio: '9:16', sceneCount: 2 },
  scenes: [presetScene, { ...presetScene, index: 1, durationSeconds: 6.5, framing: 'stretto', role: 'conclusione', roleSource: 'corretto' }],
  createdAt: '2026-11-23T10:00:00Z', updatedAt: '2026-11-23T10:30:00.000Z',
};
const presetSave = { revision: 1, name: 'Intervista breve', basedOn: 'singola', scenes: [presetScene] };
const longFields = {
  name: 'Le piante parlano', family: 'essay', presetId: 'singola', aspectRatio: '16:9', durationSeconds: 600,
  modelId: null, brief: 'Un saggio sulle piante.', budgetUsd: 25,
};
const longCreate = { requestedBy: 'editor-3', ...longFields };
const longSteps = ['bozza', 'ricerca', 'capitoli', 'fotogrammi', 'video'].map(step => ({ step, status: 'da-fare' }));
const longProject = { id: ID, identity: scope, ...longFields, steps: longSteps, createdAt: '2026-11-25T10:00:00Z' };
const costModel = { step: 'bozza', provider: 'anthropic', model: 'modello-1', quantity: 1200, unit: 'token', costUsd: 0.35, basis: 'misurato' };
const costStep = { step: 'bozza', estimatedUsd: 0.4, confirmedUsd: 0.35, entries: [{ ...costModel, chapterIndex: 1, at: '2026-11-25T10:00:00Z' }] };
const costChapter = { chapterIndex: 1, costUsd: 0.35, seconds: 60, usdPerMinute: 0.35 };
const costMinimal = { projectId: ID, steps: [], totalUsd: 0, finishedSeconds: null, usdPerMinute: null };

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
  videoEngineOutfitProductionQuery: {
    schema: VideoOutfitProductionQuerySchema, minimum: 1, accepted: ['valid', 'mov upper'],
    cases: {
      valid: outfitQuery,
      'mov upper': { ...outfitQuery, fileName: 'clip.MOV' },
      'avi file': { ...outfitQuery, fileName: 'clip.avi' },
      'unknown model': { ...outfitQuery, model: 'altro' },
      'bad budget': { ...outfitQuery, budgetUsd: '1.234' },
      'extra field': { ...outfitQuery, extra: true },
    },
  },
  videoEngineOutfitProductionCreated: {
    schema: VideoOutfitProductionCreatedSchema, minimum: 1, accepted: ['created'],
    cases: {
      created: outfitCreated,
      'too short': { ...outfitCreated, durationSeconds: 2 },
      'too long': { ...outfitCreated, durationSeconds: 16 },
      'extra field': { ...outfitCreated, extra: true },
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
  videoEngineParallelImportRequest: {
    schema: V.VideoParallelImportRequestSchema, minimum: 1,
    cases: {
      'minimal import': { requestedBy: 'editor-3', communityId, characterId: 'giulia_01' },
      'pinned version, name and model': { requestedBy: 'editor-3', communityId, characterId: 'giulia_01', version: sha('b'), name: 'Giulia', modelId: 'giulia-1' },
      'lowercase community': { requestedBy: 'editor-3', communityId: communityId.toLowerCase(), characterId: 'giulia_01' },
      'character path': { requestedBy: 'editor-3', communityId, characterId: '../giulia' },
      'uppercase version': { requestedBy: 'editor-3', communityId, characterId: 'giulia_01', version: sha('B') },
      'missing requester': { communityId, characterId: 'giulia_01' },
      'extra field': { requestedBy: 'editor-3', communityId, characterId: 'giulia_01', extra: true },
    },
  },
  videoEngineParallelImportResult: {
    schema: V.VideoParallelImportResultSchema, minimum: 1,
    cases: {
      'partial import': {
        modelId: 'giulia-1', characterId: 'giulia_01', sourceVersion: sha('b'), viewsPresent: ['frontale', 'profilo'],
        viewsMissing: ['tre_quarti', 'figura_intera'], voiceAssigned: true, importedAt: '2026-11-25T10:00:00Z',
      },
      'no source version': {
        modelId: 'giulia-1', characterId: 'giulia_01', sourceVersion: null, viewsPresent: [], viewsMissing: [],
        voiceAssigned: false, importedAt: '2026-11-25T10:00:00Z',
      },
      'unknown view': {
        modelId: 'giulia-1', characterId: 'giulia_01', sourceVersion: null, viewsPresent: ['retro'], viewsMissing: [],
        voiceAssigned: false, importedAt: '2026-11-25T10:00:00Z',
      },
      'five views': {
        modelId: 'giulia-1', characterId: 'giulia_01', sourceVersion: null,
        viewsPresent: ['frontale', 'frontale', 'frontale', 'frontale', 'frontale'], viewsMissing: [],
        voiceAssigned: false, importedAt: '2026-11-25T10:00:00Z',
      },
      'empty import time': {
        modelId: 'giulia-1', characterId: 'giulia_01', sourceVersion: null, viewsPresent: [], viewsMissing: [],
        voiceAssigned: false, importedAt: '',
      },
      'extra field': {
        modelId: 'giulia-1', characterId: 'giulia_01', sourceVersion: null, viewsPresent: [], viewsMissing: [],
        voiceAssigned: false, importedAt: '2026-11-25T10:00:00Z', extra: true,
      },
    },
  },
  videoEngineOutfitStyleRequest: {
    schema: V.VideoOutfitStyleRequestSchema, minimum: 1,
    cases: {
      'style request': { request: 'Un look elegante per una cena' },
      'trimmed request': { request: '  Un look sportivo\n' },
      'blank request': { request: '   ' },
      'long request': { request: 'x'.repeat(301) },
      'extra field': { request: 'Un look elegante', extra: true },
    },
  },
  videoEngineOutfitStyleResult: {
    schema: V.VideoOutfitStyleResultSchema, minimum: 1,
    cases: {
      'complete rules': { description: 'Giacca blu e camicia bianca', constraints: ['niente cravatta'], rules: 'complete' },
      'no style': { description: 'Giacca blu', constraints: [], rules: 'senza_stile' },
      'unknown rules': { description: 'Giacca blu', constraints: [], rules: 'parziali' },
      'missing constraints': { description: 'Giacca blu', rules: 'complete' },
      'long description': { description: 'x'.repeat(501), constraints: [], rules: 'complete' },
      'twenty one constraints': { description: 'Giacca blu', constraints: Array.from({ length: 21 }, () => 'niente cravatta'), rules: 'complete' },
      'extra field': { description: 'Giacca blu', constraints: [], rules: 'complete', extra: true },
    },
  },
  videoEnginePresetFromVideoQuery: {
    schema: V.VideoPresetFromVideoStartQuerySchema, minimum: 1,
    cases: {
      'agent scope': scope,
      'missing tenant': without(scope, 'tenantId'),
      'user field': { ...scope, userId: 'user-1' },
      'extra field': { ...scope, extra: true },
    },
  },
  videoEnginePresetFromVideoStartRequest: {
    schema: V.VideoPresetFromVideoStartRequestSchema, minimum: 1,
    cases: {
      'https address': { url: 'https://example.com/video.mp4', name: 'Intervista breve' },
      'http address': { url: 'http://example.com/video.mp4', name: 'Intervista breve' },
      'file address': { url: 'file:///tmp/video.mp4', name: 'Intervista breve' },
      'address with space': { url: 'https://example.com/a b.mp4', name: 'Intervista breve' },
      'empty name': { url: 'https://example.com/video.mp4', name: '' },
      'extra field': { url: 'https://example.com/video.mp4', name: 'Intervista breve', extra: true },
    },
  },
  videoEnginePresetFromVideoJob: {
    schema: V.VideoPresetFromVideoJobSchema, minimum: 1,
    cases: {
      'analyzing': { jobId: ID, status: 'analyzing', presetId: null, code: null, error: null },
      'done': { jobId: ID, status: 'done', presetId: 'utente-intervista-breve', code: null, error: null },
      'failed': { jobId: ID, status: 'failed', presetId: null, code: 'video_illeggibile', error: 'Il video non si legge.' },
      'unknown status': { jobId: ID, status: 'paused', presetId: null, code: null, error: null },
      'preset without prefix': { jobId: ID, status: 'done', presetId: 'intervista-breve', code: null, error: null },
      'short job id': { jobId: 'abc', status: 'queued', presetId: null, code: null, error: null },
      'extra field': { jobId: ID, status: 'queued', presetId: null, code: null, error: null, extra: true },
    },
  },
  videoEngineUserPresetList: {
    schema: V.VideoUserPresetListSchema, minimum: 1,
    cases: {
      'one preset': { presets: [userPreset] },
      'no presets': { presets: [] },
      'not a list': { presets: userPreset },
      'extra field': { presets: [], extra: true },
    },
  },
  videoEngineUserPreset: {
    schema: V.VideoUserPresetSchema, minimum: 1,
    cases: {
      'draft preset': userPreset,
      'saved preset': { ...userPreset, status: 'salvato', revision: 2 },
      'default base preset': without(userPreset, 'basedOn'),
      'no scenes': { ...userPreset, scenes: [] },
      'zero revision': { ...userPreset, revision: 0 },
      'offset timestamp': { ...userPreset, createdAt: '2026-11-23T11:00:00+01:00' },
      'source too long': { ...userPreset, source: { ...userPreset.source, durationSeconds: 1801 } },
      'scene too short': { ...userPreset, scenes: [{ ...presetScene, durationSeconds: 0.5 }] },
      'extra field': { ...userPreset, extra: true },
    },
  },
  videoEnginePresetSaveRequest: {
    schema: V.VideoPresetSaveRequestSchema, minimum: 1,
    cases: {
      'correction': presetSave,
      'missing base preset': without(presetSave, 'basedOn'),
      'no scenes': { ...presetSave, scenes: [] },
      'thirteen scenes': { ...presetSave, scenes: Array.from({ length: 13 }, () => presetScene) },
      'unknown movement': { ...presetSave, scenes: [{ ...presetScene, movement: 'volo' }] },
      'extra field': { ...presetSave, extra: true },
    },
  },
  videoEngineEnvironmentQuery: {
    schema: V.VideoEnvironmentScopeQuerySchema, minimum: 1,
    cases: {
      'agent scope': scope,
      'missing owner': without(scope, 'ownerId'),
      'user field': { ...scope, userId: 'user-1' },
      'extra field': { ...scope, extra: true },
    },
  },
  videoEngineEnvironmentCreateRequest: {
    schema: V.VideoEnvironmentCreateRequestSchema, minimum: 1,
    cases: {
      'studio': { name: 'Studio podcast', kind: 'studio', description: envDescription },
      'trimmed name': { name: '  Giardino  ', kind: 'esterno', description: envDescription },
      'unknown kind': { name: 'Studio podcast', kind: 'cantina', description: envDescription },
      'blank name': { name: '   ', kind: 'studio', description: envDescription },
      'long name': { name: 'x'.repeat(81), kind: 'studio', description: envDescription },
      'missing light': { name: 'Studio podcast', kind: 'studio', description: without(envDescription, 'light') },
      'extra field': { name: 'Studio podcast', kind: 'studio', description: envDescription, extra: true },
    },
  },
  videoEngineEnvironment: {
    schema: V.VideoEnvironmentSchema, minimum: 1,
    cases: {
      'approved environment': environment,
      'new draft environment': { ...environment, versions: [{ ...envVersion, status: 'bozza', angles: [], approvedAt: null }], currentVersion: null },
      'uppercase id': { ...environment, id: 'Studio-Podcast' },
      'unknown kind': { ...environment, kind: 'cantina' },
      'zero current version': { ...environment, currentVersion: 0 },
      'eleven angles': { ...environment, versions: [{ ...envVersion, angles: Array.from({ length: 11 }, () => envAngle) }] },
      'angle path': { ...environment, versions: [{ ...envVersion, angles: [{ ...envAngle, imagePath: '../angolo.png' }] }] },
      'extra field': { ...environment, extra: true },
    },
  },
  videoEngineEnvironmentList: {
    schema: V.VideoEnvironmentListSchema, minimum: 1,
    cases: {
      'one environment': { environments: [environment] },
      'no environments': { environments: [] },
      'not a list': { environments: environment },
      'extra field': { environments: [], extra: true },
    },
  },
  videoEngineEnvironmentVersionCreateRequest: {
    schema: V.VideoEnvironmentVersionCreateRequestSchema, minimum: 1,
    cases: {
      'new description': { description: envDescription },
      'missing description': {},
      'blank room': { description: { ...envDescription, room: '  ' } },
      'extra field': { description: envDescription, extra: true },
    },
  },
  videoEngineEnvironmentVersion: {
    schema: V.VideoEnvironmentVersionSchema, minimum: 1,
    cases: {
      'approved version': envVersion,
      'replaced version': { ...envVersion, status: 'sostituita' },
      'unknown status': { ...envVersion, status: 'ritirata' },
      'version fifty one': { ...envVersion, number: 51 },
      'uppercase digest': { ...envVersion, digest: sha('C') },
      'offset timestamp': { ...envVersion, createdAt: '2026-11-25T10:00:00+01:00' },
      'extra field': { ...envVersion, extra: true },
    },
  },
  videoEngineEnvironmentAngleRequest: {
    schema: V.VideoEnvironmentAngleRequestSchema, minimum: 1,
    cases: {
      'with model': { projectId: ID, name: 'frontale', framing: 'Inquadratura larga dalla porta', modelId: 'giulia-1', maxCostUsd: 1.5 },
      'empty background': { projectId: ID, name: 'frontale', framing: 'Inquadratura larga dalla porta', modelId: null, maxCostUsd: 0.5 },
      'zero cost cap': { projectId: ID, name: 'frontale', framing: 'Inquadratura larga dalla porta', modelId: null, maxCostUsd: 0 },
      'negative cost cap': { projectId: ID, name: 'frontale', framing: 'Inquadratura larga dalla porta', modelId: null, maxCostUsd: -1 },
      'uppercase angle name': { projectId: ID, name: 'Frontale', framing: 'Inquadratura larga', modelId: null, maxCostUsd: 1 },
      'missing project': { name: 'frontale', framing: 'Inquadratura larga', modelId: null, maxCostUsd: 1 },
      'extra field': { projectId: ID, name: 'frontale', framing: 'Inquadratura larga', modelId: null, maxCostUsd: 1, extra: true },
    },
  },
  videoEngineEnvironmentApproveRequest: {
    schema: V.VideoEnvironmentApproveRequestSchema, minimum: 1,
    cases: {
      'digest': { digest: sha('c') },
      'short digest': { digest: 'c'.repeat(63) },
      'uppercase digest': { digest: sha('C') },
      'extra field': { digest: sha('c'), extra: true },
    },
  },
  videoEngineLongQuery: {
    schema: V.VideoLongScopeQuerySchema, minimum: 1,
    cases: {
      'agent scope': scope,
      'missing agent': without(scope, 'agentId'),
      'user field': { ...scope, userId: 'user-1' },
      'extra field': { ...scope, extra: true },
    },
  },
  videoEngineLongCreateRequest: {
    schema: V.VideoLongCreateRequestSchema, minimum: 1,
    cases: {
      'plain long project': longCreate,
      'with environment and follow-up': { ...longCreate, modelId: 'giulia-1', environmentId: 'studio-podcast', environmentVersion: 1, followsProjectId: ID },
      'too short': { ...longCreate, durationSeconds: 119 },
      'too long': { ...longCreate, durationSeconds: 1201 },
      'fractional duration': { ...longCreate, durationSeconds: 600.5 },
      'unknown family': { ...longCreate, family: 'saga' },
      'zero budget': { ...longCreate, budgetUsd: 0 },
      'missing brief': without(longCreate, 'brief'),
      'extra field': { ...longCreate, extra: true },
    },
  },
  videoEngineLongProject: {
    schema: V.VideoLongProjectSchema, minimum: 1,
    cases: {
      'new project': longProject,
      'with environment': { ...longProject, environmentId: 'studio-podcast', environmentVersion: 2 },
      'four steps': { ...longProject, steps: longSteps.slice(0, 4) },
      'unknown step status': { ...longProject, steps: longSteps.map(item => ({ ...item, status: 'sospeso' })) },
      'short id': { ...longProject, id: 'abc' },
      'extra field': { ...longProject, extra: true },
    },
  },
  videoEngineLongProjectList: {
    schema: V.VideoLongProjectListSchema, minimum: 1,
    cases: {
      'one project': { projects: [longProject] },
      'no projects': { projects: [] },
      'not a list': { projects: longProject },
      'extra field': { projects: [], extra: true },
    },
  },
  videoEngineLongCostByStep: {
    schema: V.VideoCostByStepSchema, minimum: 1,
    cases: {
      'no cost yet': costMinimal,
      'full ledger': {
        ...costMinimal, steps: [costStep], totalUsd: 0.35, finishedSeconds: 60, usdPerMinute: 0.35,
        models: [costModel], chapters: [costChapter], usdPerMinuteBasis: 'misurato', unmeasuredEntries: 0,
      },
      'negative total': { ...costMinimal, totalUsd: -1 },
      'six steps': { ...costMinimal, steps: Array.from({ length: 6 }, () => costStep) },
      'unknown basis': { ...costMinimal, usdPerMinuteBasis: 'indovinato' },
      'extra field': { ...costMinimal, extra: true },
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
