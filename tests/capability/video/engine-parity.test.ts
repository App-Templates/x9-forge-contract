import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ZodType } from 'zod';
import {
  VideoEngineJobSchema, VideoEngineJobResponseSchema, VideoEngineProjectSchema,
  VideoEngineRoutePlanRequestSchema, VideoEngineRouteApproveRequestSchema,
  VideoEngineRouteRunRequestSchema, VideoEngineErrorSchema, VideoEngineHealthSchema,
  VideoEngineStoryRequestSchema, VideoEngineStoryEstimateSchema,
  VideoFootageAddQuerySchema, VideoFootageJobAcceptedSchema, VideoEngineFootageRejectedSchema,
  VideoFootageJobQuerySchema, VideoFootageJobSchema,
} from '../../../src/capability/video/index.js';
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

// Verdicts come from the canonical schema: a shared contract change is not a parity failure.
// Gate counterchecks: remove Error.strict() to check shared evolution; change a pattern
// only in the temporary catalog to check divergence detection. Compare parsed values too:
// accepting the same input is insufficient if one runtime strips fields the other preserves.
const corpus: Record<string, { schema: ZodType; cases: Record<string, unknown>; minimum?: number }> = {
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

  for (const [contract, { schema, cases, minimum = 4 }] of Object.entries(corpus)) {
    describe(contract, () => {
      for (const [name, value] of Object.entries(cases)) {
        it(name, () => {
          const zod = schema.safeParse(value);
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
