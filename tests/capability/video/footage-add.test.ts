import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { INTERNAL_SECRET_HEADER } from '../../../src/auth/auth-headers.js';
import { VideoEngineErrorSchema, VideoEngineIdSchema } from '../../../src/capability/video/engine.js';
import {
  VIDEO_FOOTAGE_MAX_BYTES, VIDEO_FOOTAGE_MEDIA_TYPES, VideoFootageAddQuerySchema, VideoFootageIdSchema, VideoFootageJobIdSchema,
  VideoFootageJobSchema, VideoFootageRejectionReasonSchema, VideoEngineFootageRejectedSchema,
} from '../../../src/capability/video/index.js';
import { getPortableCapabilityContracts } from '../../../src/capability/portable-contracts.js';
import { officinaVideoFootageAddContract, officinaVideoFootageJobGetContract } from '../../../src/http/endpoints/officina-video.js';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const query = { ...identity, person: 'stefano', place: 'piscina', outfit: 'maglietta grigia', framing: 'largo', fileName: 'IMG_0412 (1).MOV' };
const jobId = 'a'.repeat(32);
const base = { jobId, fileName: 'clip.mp4' };
const jobs: Record<string, unknown> = {
  queued: { ...base, status: 'queued' },
  running: { ...base, status: 'running' },
  completed: { ...base, status: 'completed', footage: { id: 'piscina-03', scenes: 4, durationSeconds: 12.5 } },
  rejected: { ...base, status: 'rejected', code: 'senza_volto', error: 'nessun volto nella ripresa' },
  failed: { ...base, status: 'failed', error: 'ffprobe non risponde' },
  interrupted: { ...base, status: 'interrupted', error: 'motore riavviato' },
};

describe('footage add: query', () => {
  it('accepts the identity and the metadata, with and without group and note', () => {
    expect(VideoFootageAddQuerySchema.safeParse(query).success).toBe(true);
    expect(VideoFootageAddQuerySchema.safeParse({ ...query, group: 'piscina-01', note: 'sole alto' }).success).toBe(true);
  });

  it('trims the outfit', () => {
    expect(VideoFootageAddQuerySchema.parse({ ...query, outfit: ' maglietta grigia ' }).outfit).toBe('maglietta grigia');
  });

  it('refuses what is not a person, place, framing, outfit or file name of the archive', () => {
    const bad: Array<[string, Record<string, unknown>]> = [
      ['person path', { person: '../x' }], ['person uppercase', { person: 'Stefano' }], ['place with space', { place: 'piscina blu' }],
      ['framing', { framing: 'wide' }], ['outfit blank', { outfit: '   ' }], ['file name path', { fileName: 'a/b.mp4' }],
      ['file name avi', { fileName: 'x.avi' }], ['extra field', { extra: 1 }],
    ];
    for (const [name, patch] of bad) expect(VideoFootageAddQuerySchema.safeParse({ ...query, ...patch }).success, name).toBe(false);
  });

  it('refuses a missing tenant', () => {
    const { tenantId: _tenantId, ...rest } = query;
    expect(VideoFootageAddQuerySchema.safeParse(rest).success).toBe(false);
  });

  it('a place of 60 characters plus -99 is still a footage id', () => {
    expect(VideoFootageIdSchema.safeParse(`${'p'.repeat(60)}-99`).success).toBe(true);
  });

  it('the job id is the engine id', () => {
    expect(VideoFootageJobIdSchema.source).toBe(VideoEngineIdSchema.source);
  });
});

describe('footage add: job state and rejection', () => {
  for (const [status, value] of Object.entries(jobs)) {
    it(`accepts ${status}`, () => expect(VideoFootageJobSchema.safeParse(value).success).toBe(true));
  }

  it('refuses inconsistent jobs', () => {
    const bad = [
      { ...base, status: 'completed' },
      { ...base, status: 'rejected', code: 'altro', error: 'x' },
      { ...base, status: 'running', footage: { id: 'piscina-03', scenes: 1, durationSeconds: 1 } },
      { ...base, status: 'fatto' },
    ];
    for (const value of bad) expect(VideoFootageJobSchema.safeParse(value).success, JSON.stringify(value)).toBe(false);
  });

  it('every synchronous rejection is also a valid engine error', () => {
    for (const code of VideoFootageRejectionReasonSchema.options) {
      const body = { error: 'ripresa rifiutata', operation_state: 'rejected', code };
      expect(VideoEngineFootageRejectedSchema.safeParse(body).success, code).toBe(true);
      expect(VideoEngineErrorSchema.safeParse(body).success, code).toBe(true);
    }
    expect(VideoEngineFootageRejectedSchema.safeParse({ error: 'x', operation_state: 'rejected', code: 'altro' }).success).toBe(false);
  });
});

describe('footage add: catalog', () => {
  it('describes the two transports', () => {
    const { contracts, transports } = getPortableCapabilityContracts();
    expect(transports.videoEngineFootageAdd).toMatchObject({
      method: 'POST', path: '/api/footage', authHeader: INTERNAL_SECRET_HEADER, queryContract: 'videoEngineFootageAddQuery',
      responseContract: 'videoEngineFootageJobAccepted', errorContract: 'videoEngineError',
      bodyMediaTypes: [...VIDEO_FOOTAGE_MEDIA_TYPES], maxBodyBytes: VIDEO_FOOTAGE_MAX_BYTES,
    });
    expect(transports.videoEngineFootageJobGet).toMatchObject({
      method: 'GET', path: '/api/footage/jobs/:jobId', authHeader: INTERNAL_SECRET_HEADER, queryContract: 'videoEngineFootageJobQuery',
      responseContract: 'videoEngineFootageJob', errorContract: 'videoEngineError',
    });
    expect(officinaVideoFootageAddContract.responseStatus).toBe(202);
    expect(officinaVideoFootageJobGetContract.paramsSchema.safeParse({ jobId }).success).toBe(true);
    for (const name of ['videoEngineFootageAddQuery', 'videoEngineFootageJobAccepted', 'videoEngineFootageRejected', 'videoEngineFootageJobQuery', 'videoEngineFootageJob']) {
      expect(contracts[name]?.supported, name).toBe(true);
    }
  });
});

type Verdicts = Record<string, { ok: boolean; value?: unknown }>;

function pythonVerdicts(contract: string, values: Record<string, unknown>): Verdicts {
  const directory = mkdtempSync(join(tmpdir(), 'bridge-footage-parity-'));
  const catalogPath = join(directory, 'catalog.json');
  writeFileSync(catalogPath, JSON.stringify(getPortableCapabilityContracts()));
  execFileSync('node', [resolve('scripts/generate-portable-capability-contracts.mjs'), '--catalog', catalogPath, '--output', directory], { stdio: 'pipe' });
  const out = execFileSync('python3', ['-B', '-c', `
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location('generated_footage', sys.argv[1])
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
result = {}
for name, value in json.load(sys.stdin).items():
    try:
        result[name] = dict(ok=True, value=module.validate_contract(sys.argv[2], value))
    except ValueError:
        result[name] = dict(ok=False)
print(json.dumps(result))
`, join(directory, 'x9_forge_contracts_capabilities.py'), contract], { input: JSON.stringify(values), encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  return JSON.parse(out) as Verdicts;
}

describe('footage add: zod and the generated Python give the same verdict', () => {
  const queries: Record<string, unknown> = {
    'good': query,
    'good with group and note': { ...query, group: 'piscina-01', note: 'sole alto' },
    'person path': { ...query, person: '../x' },
    'person uppercase': { ...query, person: 'Stefano' },
    'extra field': { ...query, extra: 1 },
    'outfit blank': { ...query, outfit: '  ' },
    'outfit to trim': { ...query, outfit: ' maglietta grigia ' },
  };
  const python = pythonVerdicts('videoEngineFootageAddQuery', queries);
  for (const [name, value] of Object.entries(queries)) {
    it(`query: ${name}`, () => {
      const zod = VideoFootageAddQuerySchema.safeParse(value);
      expect(python[name]!.ok).toBe(zod.success);
      if (zod.success) expect(python[name]!.value).toEqual(zod.data);
    });
  }

  const jobCases: Record<string, unknown> = {
    completed: jobs.completed,
    rejected: jobs.rejected,
    'completed without footage': { ...base, status: 'completed' },
    'status fatto': { ...base, status: 'fatto' },
  };
  const pythonJobs = pythonVerdicts('videoEngineFootageJob', jobCases);
  for (const [name, value] of Object.entries(jobCases)) {
    it(`job: ${name}`, () => {
      const zod = VideoFootageJobSchema.safeParse(value);
      expect(pythonJobs[name]!.ok).toBe(zod.success);
      if (zod.success) expect(pythonJobs[name]!.value).toEqual(zod.data);
    });
  }
});
