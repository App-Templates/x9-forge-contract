import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from '../../../src/auth/auth-headers.js';
import { getPortableCapabilityContracts } from '../../../src/capability/portable-contracts.js';
import { VideoEngineErrorSchema } from '../../../src/capability/video/engine.js';
import { VideoLongScopeQuerySchema, VideoLongProjectIdSchema } from '../../../src/capability/video/lungo.js';
import {
  VideoLongResearchStartRequestSchema, VideoLongResearchSchema,
  VideoLongDossierDocumentSchema, VideoLongDossierSchema,
  VideoLongChaptersDocumentSchema, VideoLongChaptersSchema,
  VideoLongChaptersApproveRequestSchema,
} from '../../../src/capability/video/lungo-ricerca.js';
import * as endpoints from '../../../src/http/endpoints/officina-video.js';
import { parallelCharacterExportContract, officinaVideoParallelImportContract } from '../../../src/http/endpoints/parallel-personaggi.js';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const routes = [
  ['videoEngineLongResearchStart', endpoints.officinaVideoLongResearchStartContract, 'POST', '/api/lunghi/:projectId/ricerca', 202, 'videoEngineLongResearchStartRequest', 'videoEngineLongResearch', VideoLongResearchSchema],
  ['videoEngineLongResearchGet', endpoints.officinaVideoLongResearchGetContract, 'GET', '/api/lunghi/:projectId/ricerca', 200, undefined, 'videoEngineLongResearch', VideoLongResearchSchema],
  ['videoEngineLongDossierPut', endpoints.officinaVideoLongDossierPutContract, 'PUT', '/api/lunghi/:projectId/dossier', 200, 'videoEngineLongDossierDocument', 'videoEngineLongDossier', VideoLongDossierSchema],
  ['videoEngineLongDossierGet', endpoints.officinaVideoLongDossierGetContract, 'GET', '/api/lunghi/:projectId/dossier', 200, undefined, 'videoEngineLongDossier', VideoLongDossierSchema],
  ['videoEngineLongChaptersPut', endpoints.officinaVideoLongChaptersPutContract, 'PUT', '/api/lunghi/:projectId/capitoli', 200, 'videoEngineLongChaptersDocument', 'videoEngineLongChapters', VideoLongChaptersSchema],
  ['videoEngineLongChaptersGet', endpoints.officinaVideoLongChaptersGetContract, 'GET', '/api/lunghi/:projectId/capitoli', 200, undefined, 'videoEngineLongChapters', VideoLongChaptersSchema],
  ['videoEngineLongChaptersApprove', endpoints.officinaVideoLongChaptersApproveContract, 'POST', '/api/lunghi/:projectId/capitoli/approva', 200, 'videoEngineLongChaptersApproveRequest', 'videoEngineLongChapters', VideoLongChaptersSchema],
] as const;

// SUMMARY: changing /ricerca to /ricerche in either research contract must fail
// its "publishes its method, path and status" case. Mutation runs at the gate.
describe('long research, dossier and chapter routes', () => {
  for (const [name, contract, method, path, responseStatus, , , responseSchema] of routes) {
    it(`${name} publishes its method, path and status`, () => {
      expect(contract).toMatchObject({ method, path, responseStatus });
      expect(contract.errorSchema).toBe(VideoEngineErrorSchema);
      expect(contract.responseSchema).toBe(responseSchema);
      expect(contract.querySchema).toBe(VideoLongScopeQuerySchema);
      expect(contract.querySchema.safeParse(identity).success).toBe(true);
      for (const key of Object.keys(identity)) {
        const missing = Object.fromEntries(Object.entries(identity).filter(([field]) => field !== key));
        expect(contract.querySchema.safeParse(missing).success, key).toBe(false);
      }
      expect(contract.querySchema.safeParse({ ...identity, extra: 1 }).success).toBe(false);
    });
  }

  it('requires canonical project IDs and strict path parameters on all seven routes', () => {
    for (const [, contract] of routes) {
      expect(contract.paramsSchema.shape.projectId).toBe(VideoLongProjectIdSchema);
      expect(contract.paramsSchema.safeParse({ projectId: 'a'.repeat(32) }).success).toBe(true);
      for (const params of [{}, { projectId: 'abc' }, { projectId: 'a'.repeat(32), extra: 1 }]) {
        expect(contract.paramsSchema.safeParse(params).success).toBe(false);
      }
    }
  });

  it('reuses canonical request schemas and keeps identity out of the body', () => {
    const requests = [
      [endpoints.officinaVideoLongResearchStartContract, VideoLongResearchStartRequestSchema],
      [endpoints.officinaVideoLongDossierPutContract, VideoLongDossierDocumentSchema],
      [endpoints.officinaVideoLongChaptersPutContract, VideoLongChaptersDocumentSchema],
      [endpoints.officinaVideoLongChaptersApproveContract, VideoLongChaptersApproveRequestSchema],
    ] as const;
    for (const [contract, schema] of requests) {
      expect(contract.requestSchema).toBe(schema);
      for (const key of ['identity', ...Object.keys(identity)]) expect(schema.shape).not.toHaveProperty(key);
    }
    for (const [, contract, , , , requestContract] of routes) {
      if (!requestContract) expect(contract).not.toHaveProperty('requestSchema');
    }
  });

  it('publishes all seven transports and supported query, request, response and error contracts', () => {
    const { contracts, transports } = getPortableCapabilityContracts();
    for (const [name, contract, method, path, , requestContract, responseContract] of routes) {
      const transport = transports[name];
      expect(transport, name).toMatchObject({
        method, path, authHeader: INTERNAL_SECRET_HEADER,
        paramsSchema: z.toJSONSchema(contract.paramsSchema),
        queryContract: 'videoEngineLongQuery', responseContract, errorContract: 'videoEngineError',
      });
      expect(transport!.requestContract).toBe(requestContract);
      for (const target of ['videoEngineLongQuery', requestContract, responseContract, 'videoEngineError']) {
        if (target) {
          expect(contracts[target], target).toMatchObject({ supported: true, customRefinements: 0, gates: [], rules: [] });
          expect(contracts[target]!.schema, target).not.toBeNull();
        }
      }
    }
  });

  it('adds no duplicate method and path pairs, including the seven previous long routes and both Parallel routes', () => {
    const previous = [
      endpoints.officinaVideoLongCreateContract, endpoints.officinaVideoLongListContract,
      endpoints.officinaVideoLongGetContract, endpoints.officinaVideoLongDraftPutContract,
      endpoints.officinaVideoLongDraftGetContract, endpoints.officinaVideoLongDraftApproveContract,
      endpoints.officinaVideoLongCostGetContract,
    ];
    const all = [...Object.values(endpoints), parallelCharacterExportContract, officinaVideoParallelImportContract];
    const keys = all.map(contract => `${contract.method} ${contract.path}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const contract of [...previous, ...routes.map(([, contract]) => contract)]) {
      expect(keys).toContain(`${contract.method} ${contract.path}`);
    }
    const transportKeys = Object.values(getPortableCapabilityContracts().transports)
      .map(transport => `${transport.method} ${transport.path}`);
    expect(new Set(transportKeys).size).toBe(transportKeys.length);
  });
});
