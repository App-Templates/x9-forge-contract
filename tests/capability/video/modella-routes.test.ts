import { describe, expect, it } from 'vitest';
import { INTERNAL_SECRET_HEADER } from '../../../src/auth/auth-headers.js';
import { getPortableCapabilityContracts } from '../../../src/capability/portable-contracts.js';
import { VideoEngineErrorSchema } from '../../../src/capability/video/engine.js';
import {
  VIDEO_MODEL_REF_MEDIA_TYPES, VIDEO_MODEL_REF_MAX_BYTES,
  VideoModelScopeQuerySchema, VideoModelRefAddQuerySchema, VideoModelCreateRequestSchema,
  VideoModelVersionCreateRequestSchema, VideoModelApproveRequestSchema,
  VideoModelSchema, VideoModelListSchema, VideoModelVersionSchema,
} from '../../../src/capability/video/modella.js';
import {
  officinaVideoModelCreateContract, officinaVideoModelListContract, officinaVideoModelGetContract,
  officinaVideoModelVersionCreateContract, officinaVideoModelRefAddContract,
  officinaVideoModelRefGetContract, officinaVideoModelApproveContract,
} from '../../../src/http/endpoints/officina-video.js';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const description = { face: 'Oval face', body: 'Tall', hair: 'Long brown hair' };
const generation = { model: 'img-model-1', seed: null, parameters: [] };
const routes = [
  ['videoEngineModelCreate', officinaVideoModelCreateContract, 'POST', '/api/modelle', 201, 'videoEngineModelCreateRequest', 'videoEngineModel'],
  ['videoEngineModelList', officinaVideoModelListContract, 'GET', '/api/modelle', 200, undefined, 'videoEngineModelList'],
  ['videoEngineModelGet', officinaVideoModelGetContract, 'GET', '/api/modelle/:modelId', 200, undefined, 'videoEngineModel'],
  ['videoEngineModelVersionCreate', officinaVideoModelVersionCreateContract, 'POST', '/api/modelle/:modelId/versioni', 201, 'videoEngineModelVersionCreateRequest', 'videoEngineModelVersion'],
  ['videoEngineModelRefAdd', officinaVideoModelRefAddContract, 'POST', '/api/modelle/:modelId/versioni/:version/riferimenti', 200, undefined, 'videoEngineModelVersion'],
  ['videoEngineModelRefGet', officinaVideoModelRefGetContract, 'GET', '/api/modelle/:modelId/versioni/:version/riferimenti/:kind', 200, undefined, undefined],
  ['videoEngineModelApprove', officinaVideoModelApproveContract, 'POST', '/api/modelle/:modelId/versioni/:version/approva', 200, 'videoEngineModelApproveRequest', 'videoEngineModelVersion'],
] as const;

describe('model routes', () => {
  for (const [name, contract, method, path, responseStatus] of routes) {
    it(`${name} publishes its route and requires the complete query identity`, () => {
      expect(contract).toMatchObject({ method, path, responseStatus, errorSchema: VideoEngineErrorSchema });
      const query = contract === officinaVideoModelRefAddContract ? { ...identity, kind: 'frontale' } : identity;
      expect(contract.querySchema.safeParse(query).success).toBe(true);
      for (const key of ['tenantId', 'agentId', 'ownerId']) {
        const missing = Object.fromEntries(Object.entries(query).filter(([field]) => field !== key));
        expect(contract.querySchema.safeParse(missing).success, key).toBe(false);
      }
      expect(contract.querySchema).toBe(contract === officinaVideoModelRefAddContract ? VideoModelRefAddQuerySchema : VideoModelScopeQuerySchema);
    });
  }

  it('reuses canonical request and response schemas and keeps identity out of bodies', () => {
    const requests = [
      [officinaVideoModelCreateContract, VideoModelCreateRequestSchema, { name: 'Giulia', description, generation }],
      [officinaVideoModelVersionCreateContract, VideoModelVersionCreateRequestSchema, { description, generation }],
      [officinaVideoModelApproveContract, VideoModelApproveRequestSchema, { digest: 'c'.repeat(64) }],
    ] as const;
    for (const [contract, schema, body] of requests) {
      expect(contract.requestSchema).toBe(schema);
      expect(contract.requestSchema.safeParse(body).success).toBe(true);
      expect(contract.requestSchema.safeParse({ ...body, identity }).success).toBe(false);
    }
    for (const [, contract] of routes) {
      if ('requestSchema' in contract) continue;
      expect(contract).not.toHaveProperty('requestSchema');
    }
    expect(officinaVideoModelCreateContract.responseSchema).toBe(VideoModelSchema);
    expect(officinaVideoModelListContract.responseSchema).toBe(VideoModelListSchema);
    expect(officinaVideoModelGetContract.responseSchema).toBe(VideoModelSchema);
    for (const contract of [officinaVideoModelVersionCreateContract, officinaVideoModelRefAddContract, officinaVideoModelApproveContract]) {
      expect(contract.responseSchema).toBe(VideoModelVersionSchema);
    }
  });

  it('describes binary image upload and download', () => {
    expect(VIDEO_MODEL_REF_MEDIA_TYPES).toEqual(['image/png', 'image/jpeg']);
    expect(VIDEO_MODEL_REF_MAX_BYTES).toBe(10 * 1024 * 1024);
    expect(officinaVideoModelRefAddContract.bodyMediaTypes).toBe(VIDEO_MODEL_REF_MEDIA_TYPES);
    expect(officinaVideoModelRefAddContract.maxBodyBytes).toBe(VIDEO_MODEL_REF_MAX_BYTES);
    expect(officinaVideoModelRefAddContract).not.toHaveProperty('requestSchema');
    expect(officinaVideoModelRefGetContract.responseMediaTypes).toBe(VIDEO_MODEL_REF_MEDIA_TYPES);
    expect(officinaVideoModelRefGetContract).not.toHaveProperty('responseSchema');
  });

  it('refuses unsafe model, version and angle path parameters', () => {
    for (const [, contract] of routes) {
      const params = {
        ...('modelId' in contract.paramsSchema.shape ? { modelId: 'giulia-1' } : {}),
        ...('version' in contract.paramsSchema.shape ? { version: '1' } : {}),
        ...('kind' in contract.paramsSchema.shape ? { kind: 'frontale' } : {}),
      };
      expect(contract.paramsSchema.safeParse(params).success).toBe(true);
      expect(contract.paramsSchema.safeParse({ ...params, extra: 1 }).success).toBe(false);
      if ('modelId' in params) expect(contract.paramsSchema.safeParse({ ...params, modelId: '../x' }).success).toBe(false);
      if ('version' in params) {
        for (const version of ['0', '100', '01']) expect(contract.paramsSchema.safeParse({ ...params, version }).success, version).toBe(false);
      }
      if ('kind' in params) expect(contract.paramsSchema.safeParse({ ...params, kind: 'laterale' }).success).toBe(false);
    }
  });

  it('publishes all model transports and all eight supported archive contracts', () => {
    const { contracts, transports } = getPortableCapabilityContracts();
    const expectedNames = [
      ...routes.map(([name]) => name),
      'videoEngineModelProductionCreate', 'videoEngineModelRegiaApply', 'videoEngineModelState',
      'videoEngineModelFrame', 'videoEngineModelFrameApprove',
    ].sort();
    expect(Object.keys(transports).filter(name => name.startsWith('videoEngineModel')).sort()).toEqual(expectedNames);
    for (const [name, contract, , , , requestContract, responseContract] of routes) {
      const transport = transports[name];
      const queryContract = contract === officinaVideoModelRefAddContract ? 'videoEngineModelRefAddQuery' : 'videoEngineModelQuery';
      expect(transport, name).toMatchObject({
        method: contract.method, path: contract.path, authHeader: INTERNAL_SECRET_HEADER,
        queryContract, errorContract: 'videoEngineError',
      });
      expect(transport!.requestContract).toBe(requestContract);
      expect(transport!.responseContract).toBe(responseContract);
      for (const target of [queryContract, requestContract, responseContract, 'videoEngineError']) {
        if (target) expect(contracts[target]?.supported, target).toBe(true);
      }
    }
    const schemas = {
      videoEngineModelQuery: VideoModelScopeQuerySchema,
      videoEngineModelRefAddQuery: VideoModelRefAddQuerySchema,
      videoEngineModelCreateRequest: VideoModelCreateRequestSchema,
      videoEngineModelVersionCreateRequest: VideoModelVersionCreateRequestSchema,
      videoEngineModelApproveRequest: VideoModelApproveRequestSchema,
      videoEngineModel: VideoModelSchema,
      videoEngineModelList: VideoModelListSchema,
      videoEngineModelVersion: VideoModelVersionSchema,
    };
    for (const name of Object.keys(schemas)) {
      expect(contracts[name], name).toMatchObject({ supported: true, customRefinements: 0, gates: [], rules: [] });
    }
    expect(transports.videoEngineModelRefAdd).toMatchObject({ bodyMediaTypes: VIDEO_MODEL_REF_MEDIA_TYPES, maxBodyBytes: VIDEO_MODEL_REF_MAX_BYTES });
    expect(transports.videoEngineModelRefGet).not.toHaveProperty('responseContract');
  });
});
