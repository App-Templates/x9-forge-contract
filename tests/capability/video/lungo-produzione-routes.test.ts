import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from '../../../src/auth/auth-headers.js';
import { getPortableCapabilityContracts } from '../../../src/capability/portable-contracts.js';
import { VideoEngineErrorSchema } from '../../../src/capability/video/engine.js';
import { VideoLongScopeQuerySchema, VideoLongProjectIdSchema } from '../../../src/capability/video/lungo.js';
import { VideoCostByStepSchema } from '../../../src/capability/video/costo-passi.js';
import * as endpoints from '../../../src/http/endpoints/officina-video.js';
import { parallelCharacterExportContract, officinaVideoParallelImportContract } from '../../../src/http/endpoints/parallel-personaggi.js';
import { VideoLongFramesDocumentSchema, VideoLongFramesSchema, VideoLongFramesApproveRequestSchema } from '../../../src/capability/video/lungo-fotogrammi.js';
import { VideoLongProductionSettingsSchema, VideoLongProductionSchema, VideoLongRunQuoteRequestSchema, VideoLongRunQuoteSchema, VideoLongRunRequestSchema, VideoLongChapterRunSchema, VideoLongChapterFramesSchema, VideoLongChapterFramesApproveRequestSchema, VideoLongJoinRequestSchema, VideoLongFinalVideoSchema } from '../../../src/capability/video/lungo-produzione.js';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const projectId = 'a'.repeat(32);
const routes = [
  ['videoEngineLongFramesPut', endpoints.officinaVideoLongFramesPutContract, 'PUT', '/api/lunghi/:projectId/fotogrammi', 200, 'videoEngineLongFramesDocument', 'videoEngineLongFrames'],
  ['videoEngineLongFramesGet', endpoints.officinaVideoLongFramesGetContract, 'GET', '/api/lunghi/:projectId/fotogrammi', 200, undefined, 'videoEngineLongFrames'],
  ['videoEngineLongFramesApprove', endpoints.officinaVideoLongFramesApproveContract, 'POST', '/api/lunghi/:projectId/fotogrammi/approva', 200, 'videoEngineLongFramesApproveRequest', 'videoEngineLongFrames'],
  ['videoEngineLongProductionSettingsPut', endpoints.officinaVideoLongProductionSettingsPutContract, 'PUT', '/api/lunghi/:projectId/produzione/impostazioni', 200, 'videoEngineLongProductionSettings', 'videoEngineLongProduction'],
  ['videoEngineLongProductionGet', endpoints.officinaVideoLongProductionGetContract, 'GET', '/api/lunghi/:projectId/produzione', 200, undefined, 'videoEngineLongProduction'],
  ['videoEngineLongRunQuote', endpoints.officinaVideoLongRunQuoteContract, 'POST', '/api/lunghi/:projectId/produzione/preventivo', 200, 'videoEngineLongRunQuoteRequest', 'videoEngineLongRunQuote'],
  ['videoEngineLongRunStart', endpoints.officinaVideoLongRunStartContract, 'POST', '/api/lunghi/:projectId/produzione/avvia', 202, 'videoEngineLongRunRequest', 'videoEngineLongChapterRun'],
  ['videoEngineLongChapterFramesGet', endpoints.officinaVideoLongChapterFramesGetContract, 'GET', '/api/lunghi/:projectId/capitoli/:chapterIndex/fotogrammi', 200, undefined, 'videoEngineLongChapterFrames'],
  ['videoEngineLongChapterFramesApprove', endpoints.officinaVideoLongChapterFramesApproveContract, 'POST', '/api/lunghi/:projectId/capitoli/:chapterIndex/fotogrammi/approva', 200, 'videoEngineLongChapterFramesApproveRequest', 'videoEngineLongChapterFrames'],
  ['videoEngineLongChapterFrameImageGet', endpoints.officinaVideoLongChapterFrameImageGetContract, 'GET', '/api/lunghi/:projectId/capitoli/:chapterIndex/fotogrammi/:file', 200, undefined, undefined],
  ['videoEngineLongJoin', endpoints.officinaVideoLongJoinContract, 'POST', '/api/lunghi/:projectId/unione', 200, 'videoEngineLongJoinRequest', 'videoEngineLongProduction'],
  ['videoEngineLongVideoGet', endpoints.officinaVideoLongVideoGetContract, 'GET', '/api/lunghi/:projectId/video', 200, undefined, 'videoEngineLongFinalVideo'],
  ['videoEngineLongVideoFileGet', endpoints.officinaVideoLongVideoFileGetContract, 'GET', '/api/lunghi/:projectId/video/file', 200, undefined, undefined],
 ] as const;

// SUMMARY: changing /produzione/avvia to /produzione/avvio must fail the RunStart path case.
// SUMMARY: removing the chapter range or imagePath check must fail the invalid path cases.
// R-34/R-37: additive bridge contracts; engine, tools and page integration follow in later tasks.
describe('long shot plan and chapter production routes', () => {
  for (const [name, contract, method, path, responseStatus] of routes) {
    it(`${name} publishes its method, path and status`, () => {
      expect(contract).toMatchObject({ method, path, responseStatus });
      expect(contract.errorSchema).toBe(VideoEngineErrorSchema);
      expect(contract.querySchema).toBe(VideoLongScopeQuerySchema);
      expect(contract.querySchema.safeParse(identity).success).toBe(true);
      for (const key of Object.keys(identity)) {
        const missing = Object.fromEntries(Object.entries(identity).filter(([field]) => field !== key));
        expect(contract.querySchema.safeParse(missing).success, key).toBe(false);
      }
      expect(contract.querySchema.safeParse({ ...identity, extra: 1 }).success).toBe(false);
    });
  }

  it('requires canonical project IDs and strict parameters on all thirteen routes', () => {
    for (const [name, contract, , path] of routes) {
      const params = { projectId, ...(path.includes(':chapterIndex') ? { chapterIndex: '1' } : {}), ...(path.includes(':file') ? { file: 'shot_1.png' } : {}) };
      expect(contract.paramsSchema.shape.projectId).toBe(VideoLongProjectIdSchema);
      expect(contract.paramsSchema.safeParse(params).success, name).toBe(true);
      expect(contract.paramsSchema.safeParse({ ...params, projectId: 'abc' }).success, name).toBe(false);
      expect(contract.paramsSchema.safeParse({ ...params, projectId: undefined }).success, name).toBe(false);
      expect(contract.paramsSchema.safeParse({ ...params, extra: 1 }).success, name).toBe(false);
    }
  });

  it('rejects chapter zero, 25, noncanonical strings and missing indexes', () => {
    for (const [, contract, , path] of routes) {
      if (!path.includes(':chapterIndex')) continue;
      const params = { projectId, ...(path.includes(':file') ? { file: 'shot_1.png' } : {}) };
      for (const chapterIndex of ['1', '9', '10', '24']) {
        expect(contract.paramsSchema.safeParse({ ...params, chapterIndex }).success).toBe(true);
      }
      for (const chapterIndex of ['0', '25', '99', '01', '-1', '1.5', '1/2', 1, undefined]) {
        expect(contract.paramsSchema.safeParse({ ...params, chapterIndex }).success, String(chapterIndex)).toBe(false);
      }
    }
  });

  it('uses the canonical image path and rejects traversal or missing files', () => {
    const contract = endpoints.officinaVideoLongChapterFrameImageGetContract;
    const params = { projectId, chapterIndex: '1' };
    for (const file of ['shot_1.png', 'shot-2.jpg', 'shot3.jpeg']) {
      expect(contract.paramsSchema.safeParse({ ...params, file }).success).toBe(true);
    }
    for (const file of ['..', '../shot.png', 'a/shot.png', 'a\\shot.png', 'shot..png', 'shot.mp4', undefined]) {
      expect(contract.paramsSchema.safeParse({ ...params, file }).success, String(file)).toBe(false);
    }
  });

  it('reuses canonical request and response schemas with identity only in the query', () => {
    const requests = [
      [endpoints.officinaVideoLongFramesPutContract, VideoLongFramesDocumentSchema],
      [endpoints.officinaVideoLongFramesApproveContract, VideoLongFramesApproveRequestSchema],
      [endpoints.officinaVideoLongProductionSettingsPutContract, VideoLongProductionSettingsSchema],
      [endpoints.officinaVideoLongRunQuoteContract, VideoLongRunQuoteRequestSchema],
      [endpoints.officinaVideoLongRunStartContract, VideoLongRunRequestSchema],
      [endpoints.officinaVideoLongChapterFramesApproveContract, VideoLongChapterFramesApproveRequestSchema],
      [endpoints.officinaVideoLongJoinContract, VideoLongJoinRequestSchema],
    ] as const;
    for (const [contract, schema] of requests) {
      expect(contract.requestSchema).toBe(schema);
      for (const key of ['identity', ...Object.keys(identity)]) expect(schema.shape).not.toHaveProperty(key);
    }
    const responses = [
      [endpoints.officinaVideoLongFramesPutContract, VideoLongFramesSchema],
      [endpoints.officinaVideoLongFramesGetContract, VideoLongFramesSchema],
      [endpoints.officinaVideoLongFramesApproveContract, VideoLongFramesSchema],
      [endpoints.officinaVideoLongProductionSettingsPutContract, VideoLongProductionSchema],
      [endpoints.officinaVideoLongProductionGetContract, VideoLongProductionSchema],
      [endpoints.officinaVideoLongRunQuoteContract, VideoLongRunQuoteSchema],
      [endpoints.officinaVideoLongRunStartContract, VideoLongChapterRunSchema],
      [endpoints.officinaVideoLongChapterFramesGetContract, VideoLongChapterFramesSchema],
      [endpoints.officinaVideoLongChapterFramesApproveContract, VideoLongChapterFramesSchema],
      [endpoints.officinaVideoLongJoinContract, VideoLongProductionSchema],
      [endpoints.officinaVideoLongVideoGetContract, VideoLongFinalVideoSchema],
    ] as const;
    for (const [contract, schema] of responses) expect(contract.responseSchema).toBe(schema);
    for (const [, contract, , , , request, response] of routes) {
      if (!request) expect(contract).not.toHaveProperty('requestSchema');
      if (!response) expect(contract).not.toHaveProperty('responseSchema');
    }
    expect(endpoints.officinaVideoLongChapterFrameImageGetContract.responseMediaTypes)
      .toEqual(endpoints.officinaVideoEnvironmentAngleGetContract.responseMediaTypes);
    expect(endpoints.officinaVideoLongVideoFileGetContract.responseMediaTypes).toEqual(['video/mp4']);
  });

  it('publishes all thirteen transports with supported query, request, response and error contracts', () => {
    const { contracts, transports } = getPortableCapabilityContracts();
    expect(routes).toHaveLength(13);
    for (const [name, contract, method, path, , requestContract, responseContract] of routes) {
      expect(transports[name], name).toMatchObject({
        method, path, authHeader: INTERNAL_SECRET_HEADER, paramsSchema: z.toJSONSchema(contract.paramsSchema),
        queryContract: 'videoEngineLongQuery', errorContract: 'videoEngineError',
      });
      expect(transports[name]!.requestContract, name).toBe(requestContract);
      expect(transports[name]!.responseContract, name).toBe(responseContract);
      for (const target of ['videoEngineLongQuery', requestContract, responseContract, 'videoEngineError']) {
        if (!target) continue;
        expect(contracts[target], target).toMatchObject({ supported: true, customRefinements: 0, gates: [], rules: [] });
        expect(contracts[target]!.schema, target).not.toBeNull();
      }
    }
  });

  it('adds no duplicate method and path pairs to long, model, environment or Parallel routes', () => {
    const all = [...Object.values(endpoints), parallelCharacterExportContract, officinaVideoParallelImportContract];
    const keys = all.flatMap(contract => 'path' in contract ? [`${contract.method} ${contract.path}`] : []);
    expect(new Set(keys).size).toBe(keys.length);
    const transportKeys = Object.values(getPortableCapabilityContracts().transports).map(transport => `${transport.method} ${transport.path}`);
    expect(new Set(transportKeys).size).toBe(transportKeys.length);
  });

  it('returns the extended cost ledger including chapter and model breakdowns', () => {
    const contract = endpoints.officinaVideoLongCostGetContract;
    expect(contract.responseSchema).toBe(VideoCostByStepSchema);
    const ledger = {
      projectId,
      steps: [{ step: 'fotogrammi', estimatedUsd: 2, confirmedUsd: 2, entries: [{
        step: 'fotogrammi', provider: 'fal', model: 'frame-model', quantity: 2, unit: 'image', costUsd: 2,
        basis: 'misurato', chapterIndex: 1, at: '2026-11-25T10:00:00Z',
      }] }],
      totalUsd: 2, finishedSeconds: 60, usdPerMinute: 2,
      models: [{ step: 'fotogrammi', provider: 'fal', model: 'frame-model', quantity: 2, unit: 'image', costUsd: 2, basis: 'misurato' }],
      chapters: [{ chapterIndex: 1, costUsd: 2, seconds: 60, usdPerMinute: 2 }],
      usdPerMinuteBasis: 'misurato', unmeasuredEntries: 0,
    };
    expect(contract.responseSchema.parse(ledger)).toEqual(ledger);
    expect(contract.responseSchema.safeParse({ ...ledger, chapters: [{ ...ledger.chapters[0], chapterIndex: 25 }] }).success).toBe(false);
    expect(contract.responseSchema.safeParse({ ...ledger, usdPerMinuteBasis: 'zero' }).success).toBe(false);
    const catalog = getPortableCapabilityContracts();
    expect(catalog.transports.videoEngineLongCostGet!.responseContract).toBe('videoEngineLongCostByStep');
    expect(catalog.contracts.videoEngineLongCostByStep!.schema).toEqual(z.toJSONSchema(VideoCostByStepSchema, { io: 'input', target: 'draft-2020-12' }));
  });
});
