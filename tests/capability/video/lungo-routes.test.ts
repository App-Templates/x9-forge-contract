import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from '../../../src/auth/auth-headers.js';
import { getPortableCapabilityContracts } from '../../../src/capability/portable-contracts.js';
import { VideoEngineErrorSchema } from '../../../src/capability/video/engine.js';
import {
  VideoLongScopeQuerySchema, VideoLongProjectIdSchema, VideoLongCreateRequestSchema,
  VideoLongProjectSchema, VideoLongProjectListSchema,
} from '../../../src/capability/video/lungo.js';
import {
  VideoLongDraftDocumentSchema, VideoLongDraftSchema, VideoLongDraftApproveRequestSchema,
} from '../../../src/capability/video/lungo-bozza.js';
import { VideoCostByStepSchema } from '../../../src/capability/video/costo-passi.js';
import * as endpoints from '../../../src/http/endpoints/officina-video.js';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const routes = [
  ['videoEngineLongCreate', endpoints.officinaVideoLongCreateContract, 'POST', '/api/lunghi', 201, 'videoEngineLongCreateRequest', 'videoEngineLongProject'],
  ['videoEngineLongList', endpoints.officinaVideoLongListContract, 'GET', '/api/lunghi', 200, undefined, 'videoEngineLongProjectList'],
  ['videoEngineLongGet', endpoints.officinaVideoLongGetContract, 'GET', '/api/lunghi/:projectId', 200, undefined, 'videoEngineLongProject'],
  ['videoEngineLongDraftPut', endpoints.officinaVideoLongDraftPutContract, 'PUT', '/api/lunghi/:projectId/bozza', 200, 'videoEngineLongDraftDocument', 'videoEngineLongDraft'],
  ['videoEngineLongDraftGet', endpoints.officinaVideoLongDraftGetContract, 'GET', '/api/lunghi/:projectId/bozza', 200, undefined, 'videoEngineLongDraft'],
  ['videoEngineLongDraftApprove', endpoints.officinaVideoLongDraftApproveContract, 'POST', '/api/lunghi/:projectId/bozza/approva', 200, 'videoEngineLongDraftApproveRequest', 'videoEngineLongDraft'],
  ['videoEngineLongCostGet', endpoints.officinaVideoLongCostGetContract, 'GET', '/api/lunghi/:projectId/costi', 200, undefined, 'videoEngineLongCostByStep'],
] as const;

// SUMMARY: changing a contract path from /api/lunghi to /api/lungo must fail
// the corresponding "publishes its method, path and status" case.
describe('long project routes', () => {
  for (const [name, contract, method, path, responseStatus] of routes) {
    it(`${name} publishes its method, path and status`, () => {
      expect(contract).toMatchObject({ method, path, responseStatus, errorSchema: VideoEngineErrorSchema });
      expect(contract.querySchema).toBe(VideoLongScopeQuerySchema);
      expect(contract.querySchema.safeParse(identity).success).toBe(true);
      for (const key of ['tenantId', 'ownerId', 'agentId']) {
        const missing = Object.fromEntries(Object.entries(identity).filter(([field]) => field !== key));
        expect(contract.querySchema.safeParse(missing).success, key).toBe(false);
      }
    });
  }

  it('requires canonical project IDs and strict path parameters', () => {
    for (const [, contract, , path] of routes) {
      const params = path.includes(':projectId') ? { projectId: 'a'.repeat(32) } : {};
      expect(contract.paramsSchema.safeParse(params).success).toBe(true);
      expect(contract.paramsSchema.safeParse({ ...params, extra: 1 }).success).toBe(false);
      expect(contract.paramsSchema.safeParse({ projectId: 'abc' }).success).toBe(false);
      if ('projectId' in contract.paramsSchema.shape) {
        expect(contract.paramsSchema.shape.projectId).toBe(VideoLongProjectIdSchema);
        expect(contract.paramsSchema.safeParse({}).success).toBe(false);
      }
    }
  });

  it('reuses canonical bodies and responses, keeping identity in the query', () => {
    const requests = [
      [endpoints.officinaVideoLongCreateContract, VideoLongCreateRequestSchema],
      [endpoints.officinaVideoLongDraftPutContract, VideoLongDraftDocumentSchema],
      [endpoints.officinaVideoLongDraftApproveContract, VideoLongDraftApproveRequestSchema],
    ] as const;
    for (const [contract, schema] of requests) {
      expect(contract.requestSchema).toBe(schema);
      for (const field of ['identity', 'tenantId', 'ownerId', 'agentId']) {
        expect(schema.shape).not.toHaveProperty(field);
      }
    }
    for (const [, contract, , , , request] of routes) {
      if (!request) expect(contract).not.toHaveProperty('requestSchema');
    }
    expect(endpoints.officinaVideoLongCreateContract.responseSchema).toBe(VideoLongProjectSchema);
    expect(endpoints.officinaVideoLongGetContract.responseSchema).toBe(VideoLongProjectSchema);
    expect(endpoints.officinaVideoLongListContract.responseSchema).toBe(VideoLongProjectListSchema);
    for (const contract of [endpoints.officinaVideoLongDraftPutContract, endpoints.officinaVideoLongDraftGetContract, endpoints.officinaVideoLongDraftApproveContract]) {
      expect(contract.responseSchema).toBe(VideoLongDraftSchema);
    }
    expect(endpoints.officinaVideoLongCostGetContract.responseSchema).toBe(VideoCostByStepSchema);
  });

  it('publishes all seven transports with supported query, body, response and error contracts', () => {
    const { contracts, transports } = getPortableCapabilityContracts();
    expect(Object.keys(transports).filter(name => name.startsWith('videoEngineLong')).sort())
      .toEqual(routes.map(([name]) => name).sort());
    for (const [name, contract, method, path, , requestContract, responseContract] of routes) {
      const transport = transports[name];
      expect(transport, name).toMatchObject({
        method, path, authHeader: INTERNAL_SECRET_HEADER,
        paramsSchema: z.toJSONSchema(contract.paramsSchema),
        queryContract: 'videoEngineLongQuery', responseContract, errorContract: 'videoEngineError',
      });
      expect(transport!.requestContract).toBe(requestContract);
      for (const target of ['videoEngineLongQuery', requestContract, responseContract, 'videoEngineError']) {
        if (target) expect(contracts[target], target).toMatchObject({ supported: true, customRefinements: 0, gates: [], rules: [] });
      }
    }
  });

  it('adds no duplicate method and path pairs to existing routes or portable transports', () => {
    const endpointKeys = Object.values(endpoints).flatMap(contract =>
      'path' in contract ? [`${contract.method} ${contract.path}`] : []);
    expect(new Set(endpointKeys).size).toBe(endpointKeys.length);
    const transportKeys = Object.values(getPortableCapabilityContracts().transports)
      .map(transport => `${transport.method} ${transport.path}`);
    expect(new Set(transportKeys).size).toBe(transportKeys.length);
  });
});
