import { describe, expect, it } from 'vitest';
import * as video from '../../../src/capability/video/index.js';
import * as productionTools from '../../../src/capability/video/lungo-produzione-tool.js';

const projectId = 'a'.repeat(32);
const digest = 'b'.repeat(64);
const at = '2026-11-25T10:00:00Z';
const approval = { revision: 2, digest };
const document = {
  chaptersRevision: 1,
  chapters: [{ chapterIndex: 1, shots: [{
    index: 1, framing: 'intervista', description: 'La studiosa racconta il cinema sonoro.',
    motion: 'Lento avvicinamento.', seconds: 10, render: 'clip', narration: 'Il suono cambia il cinema.',
    environmentAngle: 'a', withCharacter: true, sourceId: 'source-archivio',
  }] }],
};
const frames = {
  ...document, usage: null, ...approval, status: 'da-approvare', totalSeconds: 10,
  shotCount: 1, interviewShare: 1, warnings: [], approvedAt: null,
};
const settings = {
  frameProvider: 'fal', frameModel: null, clipProvider: 'minimax', clipModel: 'video-01',
  voice: { provider: 'elevenlabs', model: 'eleven_multilingual_v2', voice: 'narrator' },
  subtitles: 'morbidi',
};
const quoteRequest = { chapterIndex: 1, stage: 'fotogrammi' };
const quote = {
  id: 'c'.repeat(32), ...quoteRequest, units: 1, unit: 'image', estimatedUsd: 0.05,
  reserveUsd: 0.0625, remainingBudgetUsd: 100, tariffDate: '2026-11-25', tariffFresh: true,
  expiresAt: '2026-11-25T10:15:00Z',
};
const chapterFrames = {
  chapterIndex: 1, ...approval, status: 'approvati', approvedAt: at,
  frames: [{ shotIndex: 1, imagePath: 'chapter-1_frame-1.png', sha256: digest, similarity: null, status: 'approvato' }],
};
const finalVideo = {
  path: 'essay-final.mp4', sha256: digest, seconds: 10, aspectRatio: '16:9',
  chapters: [{ index: 1, startSeconds: 0, seconds: 10 }], subtitles: true, createdAt: at,
};
const production = {
  projectId, settings, chapters: [{
    chapterIndex: 1, batches: 1,
    stages: ['fotogrammi', 'voce', 'clip', 'montaggio'].map((stage) => ({
      stage, status: 'completo', done: 1, total: 1, reused: 0, estimatedUsd: 0.05, confirmedUsd: 0.05,
    })),
    chapterVideo: { path: 'chapter-1.mp4', sha256: digest, seconds: 10 },
  }], finalVideo, updatedAt: at,
};

const inputs = [
  ['FramesPut', video.VideoLongFramesPutToolInputSchema, { projectId, ...document }],
  ['FramesGet', video.VideoLongFramesGetToolInputSchema, { projectId }],
  ['FramesApprove', video.VideoLongFramesApproveToolInputSchema, { projectId, ...approval }],
  ['ProductionSettingsPut', video.VideoLongProductionSettingsPutToolInputSchema, { projectId, ...settings }],
  ['ProductionGet', video.VideoLongProductionGetToolInputSchema, { projectId }],
  ['RunQuote', video.VideoLongRunQuoteToolInputSchema, { projectId, ...quoteRequest }],
  ['RunStart', video.VideoLongRunStartToolInputSchema, { projectId, ...quoteRequest, quoteId: quote.id, framesRevision: 2 }],
  ['ChapterFramesGet', video.VideoLongChapterFramesGetToolInputSchema, { projectId, chapterIndex: 1 }],
  ['ChapterFramesApprove', video.VideoLongChapterFramesApproveToolInputSchema, { projectId, chapterIndex: 1, ...approval }],
  ['Join', video.VideoLongJoinToolInputSchema, { projectId, framesRevision: 2 }],
  ['VideoGet', video.VideoLongVideoGetToolInputSchema, { projectId }],
] as const;

const writes = [
  ['FramesPut', video.VideoLongFramesPutToolResponseSchema, { status: 'salvato', frames: frames },
    ['capitoli_non_approvati', 'revisione_cambiata', 'capitoli_diversi', 'inquadrature_non_valide', 'durata_fuori_misura', 'parlato_troppo_lungo', 'progetto_sconosciuto', 'motore_non_disponibile']],
  ['FramesApprove', video.VideoLongFramesApproveToolResponseSchema, { status: 'approvato', frames: frames },
    ['revisione_superata', 'capitoli_non_approvati', 'capitoli_cambiati', 'impronta_diversa', 'piano_non_trovato', 'progetto_sconosciuto', 'motore_non_disponibile']],
  ['ProductionSettingsPut', video.VideoLongProductionSettingsPutToolResponseSchema, { status: 'salvate', production: production },
    ['impostazioni_non_valide', 'tappa_gia_in_corso', 'impostazioni_bloccate', 'fornitore_non_pronto', 'piano_non_approvato', 'progetto_sconosciuto', 'motore_non_disponibile']],
  ['RunQuote', video.VideoLongRunQuoteToolResponseSchema, { status: 'preventivo', quote: quote },
    ['piano_non_approvato', 'fotogrammi_non_approvati', 'fornitore_non_pronto', 'tariffa_scaduta', 'progetto_sconosciuto', 'motore_non_disponibile']],
  ['RunStart', video.VideoLongRunStartToolResponseSchema, { status: 'avviata', production: production },
    ['piano_non_approvato', 'fotogrammi_non_approvati', 'preventivo_scaduto', 'preventivo_diverso', 'tetto_superato', 'tariffa_scaduta', 'fornitore_non_pronto', 'tappa_gia_in_corso', 'esito_incerto', 'progetto_sconosciuto', 'motore_non_disponibile']],
  ['ChapterFramesApprove', video.VideoLongChapterFramesApproveToolResponseSchema, { status: 'approvati', frames: chapterFrames },
    ['revisione_superata', 'impronta_diversa', 'fotogrammi_non_trovati', 'piano_cambiato', 'progetto_sconosciuto', 'motore_non_disponibile']],
  ['Join', video.VideoLongJoinToolResponseSchema, { status: 'unito', video: finalVideo },
    ['capitoli_incompleti', 'piano_cambiato', 'progetto_sconosciuto', 'motore_non_disponibile']],
 ] as const;

// SUMMARY mutation: assign VIDEO_LONG_VIDEO_GET_TOOL's value to VIDEO_LONG_JOIN_TOOL;
// the unique names test must turn red. Acceptance, types and mutations run at the gate.
describe('long video production tools', () => {
  it('exports eleven fixed unique names without collisions with any exported tool', () => {
    const entries = Object.entries(productionTools).filter(([key]) => key.endsWith('_TOOL'));
    expect(entries).toHaveLength(11);
    expect(entries.map(([, value]) => value).sort()).toEqual([
      'video_long_chapter_frames_approve',
      'video_long_chapter_frames_get',
      'video_long_frames_approve',
      'video_long_frames_get',
      'video_long_frames_put',
      'video_long_join',
      'video_long_production_get',
      'video_long_production_settings_put',
      'video_long_run_quote',
      'video_long_run_start',
      'video_long_video_get',
    ]);
    const allTools = Object.entries(video).filter(([key]) => key.endsWith('_TOOL'));
    for (const [key, value] of entries) {
      expect(value).toMatch(/^video_long_/);
      expect(allTools.filter(([, other]) => other === value).map(([exportName]) => exportName)).toEqual([key]);
    }
    expect(new Set(entries.map(([, value]) => value)).size).toBe(11);
  });

  it.each(inputs)('accepts valid %s input and rejects identity, usage and unknown fields', (_name, schema, value) => {
    expect(schema.parse(value)).toEqual(value);
    for (const key of ['tenantId', 'agentId', 'ownerId', 'requestedBy', 'usage', 'unknown']) {
      expect(schema.safeParse({ ...value, [key]: key === 'usage' ? null : 'forged' }).success, key).toBe(false);
    }
    const { projectId: _projectId, ...withoutProject } = value;
    expect(schema.safeParse(withoutProject).success).toBe(false);
    for (const field of Object.values(schema.shape)) expect(field.description).toBeTruthy();
  });

  it.each(writes)('accepts %s success and every refusal, rejects unknown status and reason', (_name, schema, success, reasons) => {
    expect(schema.parse(success)).toEqual(success);
    expect(schema.options[1].shape.reason.options).toEqual(reasons);
    for (const reason of reasons) {
      const refusal = { status: 'rifiutata', reason, message: 'Il passo non può proseguire.' };
      expect(schema.parse(refusal)).toEqual(refusal);
      expect(schema.safeParse({ status: 'rifiutata', reason }).success).toBe(false);
    }
    expect(schema.safeParse({ ...success, status: 'boh' }).success).toBe(false);
    expect(schema.safeParse({ status: 'rifiutata', reason: 'boh', message: 'Errore.' }).success).toBe(false);
  });

  // SUMMARY mutation: removing impostazioni_bloccate from the settings response enum
  // must make this test fail. Mutation execution belongs to the gate.
  it('accepts the rifiuti del motore sulle impostazioni', () => {
    const schema = video.VideoLongProductionSettingsPutToolResponseSchema;
    for (const reason of [
      'impostazioni_non_valide',
      'tappa_gia_in_corso',
      'impostazioni_bloccate',
      'fornitore_non_pronto',
      'piano_non_approvato',
      'progetto_sconosciuto',
      'motore_non_disponibile',
    ]) {
      expect(schema.safeParse({ status: 'rifiutata', reason, message: 'Errore.' }).success, reason).toBe(true);
    }
    expect(schema.safeParse({ status: 'rifiutata', reason: 'codice_inventato', message: 'Errore.' }).success).toBe(false);
  });

  it('reuses read responses and run refusals from the production contracts', () => {
    expect(video.VideoLongFramesGetToolResponseSchema).toBe(video.VideoLongFramesSchema);
    expect(video.VideoLongFramesGetToolResponseSchema.parse(frames)).toEqual(frames);
    expect(video.VideoLongProductionGetToolResponseSchema).toBe(video.VideoLongProductionSchema);
    expect(video.VideoLongProductionGetToolResponseSchema.parse(production)).toEqual(production);
    expect(video.VideoLongChapterFramesGetToolResponseSchema).toBe(video.VideoLongChapterFramesSchema);
    expect(video.VideoLongChapterFramesGetToolResponseSchema.parse(chapterFrames)).toEqual(chapterFrames);
    expect(video.VideoLongVideoGetToolResponseSchema).toBe(video.VideoLongFinalVideoSchema);
    expect(video.VideoLongVideoGetToolResponseSchema.parse(finalVideo)).toEqual(finalVideo);
    expect(video.VideoLongRunStartToolResponseSchema.options[1].shape.reason).toBe(video.VideoLongRunRefusalSchema);
  });
});
