import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from '../../../src/auth/auth-headers.js';
import { getPortableCapabilityContracts } from '../../../src/capability/portable-contracts.js';
import { VideoEngineErrorSchema } from '../../../src/capability/video/engine.js';
import {
  VideoEnvironmentScopeQuerySchema, VideoEnvironmentCreateRequestSchema, VideoEnvironmentVersionCreateRequestSchema,
  VideoEnvironmentAngleRequestSchema, VideoEnvironmentApproveRequestSchema, VideoEnvironmentSchema,
  VideoEnvironmentListSchema, VideoEnvironmentVersionSchema,
} from '../../../src/capability/video/ambiente.js';
import * as endpoints from '../../../src/http/endpoints/officina-video.js';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const ids = { environmentId: 'studio-podcast', version: '1', angle: 'a1' };
const routes = [
  ['videoEngineEnvironmentCreate', endpoints.officinaVideoEnvironmentCreateContract, 'POST', '/api/ambienti', 201, 'videoEngineEnvironmentCreateRequest', 'videoEngineEnvironment'],
  ['videoEngineEnvironmentList', endpoints.officinaVideoEnvironmentListContract, 'GET', '/api/ambienti', 200, undefined, 'videoEngineEnvironmentList'],
  ['videoEngineEnvironmentGet', endpoints.officinaVideoEnvironmentGetContract, 'GET', '/api/ambienti/:environmentId', 200, undefined, 'videoEngineEnvironment'],
  ['videoEngineEnvironmentVersionCreate', endpoints.officinaVideoEnvironmentVersionCreateContract, 'POST', '/api/ambienti/:environmentId/versioni', 201, 'videoEngineEnvironmentVersionCreateRequest', 'videoEngineEnvironmentVersion'],
  ['videoEngineEnvironmentAngleAdd', endpoints.officinaVideoEnvironmentAngleAddContract, 'POST', '/api/ambienti/:environmentId/versioni/:version/angolazioni', 201, 'videoEngineEnvironmentAngleRequest', 'videoEngineEnvironmentVersion'],
  ['videoEngineEnvironmentAngleGet', endpoints.officinaVideoEnvironmentAngleGetContract, 'GET', '/api/ambienti/:environmentId/versioni/:version/angolazioni/:angle', 200, undefined, undefined],
  ['videoEngineEnvironmentApprove', endpoints.officinaVideoEnvironmentApproveContract, 'POST', '/api/ambienti/:environmentId/versioni/:version/approva', 200, 'videoEngineEnvironmentApproveRequest', 'videoEngineEnvironmentVersion'],
] as const;

// SUMMARY: changing /angolazioni to /angolazione in the AngleAdd contract must fail
// the "publishes its method, path and status" case.
describe('environment routes', () => {
  for (const [name, contract, method, path, responseStatus] of routes) {
    it(`${name} publishes its method, path and status`, () => {
      expect(contract).toMatchObject({ method, path, responseStatus, errorSchema: VideoEngineErrorSchema });
      expect(contract.querySchema).toBe(VideoEnvironmentScopeQuerySchema);
      expect(contract.querySchema.safeParse(identity).success).toBe(true);
      for (const key of ['tenantId', 'ownerId', 'agentId']) {
        const missing = Object.fromEntries(Object.entries(identity).filter(([field]) => field !== key));
        expect(contract.querySchema.safeParse(missing).success, key).toBe(false);
      }
    });
  }

  it('keeps path parameters strict and rejects Studio, version 0 and angle A1', () => {
    for (const [name, contract, , path] of routes) {
      const params = Object.fromEntries(Object.entries(ids).filter(([key]) => path.includes(`:${key}`)));
      expect(contract.paramsSchema.safeParse(params).success, name).toBe(true);
      expect(contract.paramsSchema.safeParse({ ...params, extra: 1 }).success, name).toBe(false);
      for (const [key, bad] of [['environmentId', 'Studio'], ['version', '0'], ['angle', 'A1']] as const) {
        if (key in params) expect(contract.paramsSchema.safeParse({ ...params, [key]: bad }).success, `${name} ${key}`).toBe(false);
      }
    }
  });

  it('reuses canonical bodies and responses, keeping identity in the query', () => {
    const requests = [
      [endpoints.officinaVideoEnvironmentCreateContract, VideoEnvironmentCreateRequestSchema],
      [endpoints.officinaVideoEnvironmentVersionCreateContract, VideoEnvironmentVersionCreateRequestSchema],
      [endpoints.officinaVideoEnvironmentAngleAddContract, VideoEnvironmentAngleRequestSchema],
      [endpoints.officinaVideoEnvironmentApproveContract, VideoEnvironmentApproveRequestSchema],
    ] as const;
    for (const [contract, schema] of requests) {
      expect(contract.requestSchema).toBe(schema);
      for (const field of ['identity', 'tenantId', 'ownerId', 'agentId']) expect(schema.shape).not.toHaveProperty(field);
    }
    for (const [, contract, , , , request] of routes) {
      if (!request) expect(contract).not.toHaveProperty('requestSchema');
    }
    expect(endpoints.officinaVideoEnvironmentCreateContract.responseSchema).toBe(VideoEnvironmentSchema);
    expect(endpoints.officinaVideoEnvironmentGetContract.responseSchema).toBe(VideoEnvironmentSchema);
    expect(endpoints.officinaVideoEnvironmentListContract.responseSchema).toBe(VideoEnvironmentListSchema);
    for (const contract of [endpoints.officinaVideoEnvironmentVersionCreateContract, endpoints.officinaVideoEnvironmentAngleAddContract, endpoints.officinaVideoEnvironmentApproveContract]) {
      expect(contract.responseSchema).toBe(VideoEnvironmentVersionSchema);
    }
  });

  it('declares the angle image as a binary response', () => {
    const contract = endpoints.officinaVideoEnvironmentAngleGetContract;
    expect(contract).not.toHaveProperty('responseSchema');
    expect(contract.responseMediaTypes.length).toBeGreaterThan(0);
  });

  it('publishes the seven transports with supported contracts', () => {
    const { contracts, transports } = getPortableCapabilityContracts();
    expect(Object.keys(transports).filter(name => name.startsWith('videoEngineEnvironment')).sort())
      .toEqual(routes.map(([name]) => name).sort());
    for (const [name, contract, method, path, , requestContract, responseContract] of routes) {
      const transport = transports[name];
      expect(transport, name).toMatchObject({
        method, path, authHeader: INTERNAL_SECRET_HEADER,
        paramsSchema: z.toJSONSchema(contract.paramsSchema),
        queryContract: 'videoEngineEnvironmentQuery', errorContract: 'videoEngineError',
      });
      expect(transport!.requestContract).toBe(requestContract);
      expect(transport!.responseContract).toBe(responseContract);
      for (const target of ['videoEngineEnvironmentQuery', requestContract, responseContract, 'videoEngineError']) {
        if (target) expect(contracts[target], target).toMatchObject({ supported: true, customRefinements: 0, gates: [], rules: [] });
      }
    }
  });

  it('adds no duplicate method and path pairs and none under existing prefixes', () => {
    const endpointKeys = Object.values(endpoints).flatMap(contract =>
      'path' in contract ? [`${contract.method} ${contract.path}`] : []);
    expect(new Set(endpointKeys).size).toBe(endpointKeys.length);
    const transports = Object.values(getPortableCapabilityContracts().transports);
    const transportKeys = transports.map(transport => `${transport.method} ${transport.path}`);
    expect(new Set(transportKeys).size).toBe(transportKeys.length);
    for (const [, contract] of routes) expect(contract.path.startsWith('/api/ambienti')).toBe(true);
    for (const transport of transports.filter(t => !t.path.startsWith('/api/ambienti'))) {
      expect(transport.path.startsWith('/api/ambienti')).toBe(false);
    }
  });
});
