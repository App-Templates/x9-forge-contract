import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from '../../../src/auth/auth-headers.js';
import { getPortableCapabilityContracts } from '../../../src/capability/portable-contracts.js';
import { VideoEngineErrorSchema } from '../../../src/capability/video/engine.js';
import { VideoModelScopeQuerySchema } from '../../../src/capability/video/modella.js';
import { VideoParallelExportQuerySchema, VideoParallelExportSchema, VideoParallelExportErrorSchema } from '../../../src/capability/video/personaggio-parallel.js';
import { VideoParallelImportRequestSchema, VideoParallelImportResultSchema } from '../../../src/capability/video/personaggio-parallel-import.js';
import { parallelCharacterExportContract, officinaVideoParallelImportContract } from '../../../src/http/endpoints/parallel-personaggi.js';
import * as endpoints from '../../../src/http/endpoints/index.js';
import * as videoEndpoints from '../../../src/http/endpoints/officina-video.js';

const routes = [
  ['parallelCharacterExport', parallelCharacterExportContract, 'GET', '/companion/export-characters', 200, 'parallelCharacterExportQuery', undefined, 'parallelCharacterExport', 'parallelCharacterExportError'],
  ['videoEngineParallelImport', officinaVideoParallelImportContract, 'POST', '/api/modelle/da-parallel', 201, 'videoEngineModelQuery', 'videoEngineParallelImportRequest', 'videoEngineParallelImportResult', 'videoEngineError'],
] as const;

// SUMMARY: changing /companion/export-characters to /companion/export makes
// "parallelCharacterExport publishes its method, path and status" fail.
// Accepting a 25-character communityId breaks the query validation case;
// dropping a registration breaks the supported portable contracts case.
// Tests and mutations are delegated to the acceptance gate.
describe('Parallel character routes', () => {
  for (const [name, contract, method, path, responseStatus] of routes) {
    it(`${name} publishes its method, path and status`, () => {
      expect(contract).toMatchObject({ method, path, responseStatus });
      expect(contract.paramsSchema.safeParse({}).success).toBe(true);
      expect(contract.paramsSchema.safeParse({ extra: 1 }).success).toBe(false);
    });
  }

  it('exports both contracts from the HTTP endpoint barrel', () => {
    expect(endpoints.parallelCharacterExportContract).toBe(parallelCharacterExportContract);
    expect(endpoints.officinaVideoParallelImportContract).toBe(officinaVideoParallelImportContract);
    expect(parallelCharacterExportContract.path.startsWith('/api/')).toBe(false);
    expect(parallelCharacterExportContract).not.toHaveProperty('requestSchema');
  });

  it('reuses the canonical query, body, response and error schemas', () => {
    expect(parallelCharacterExportContract.querySchema).toBe(VideoParallelExportQuerySchema);
    expect(parallelCharacterExportContract.responseSchema).toBe(VideoParallelExportSchema);
    expect(parallelCharacterExportContract.errorSchema).toBe(VideoParallelExportErrorSchema);
    expect(officinaVideoParallelImportContract.querySchema).toBe(VideoModelScopeQuerySchema);
    expect(officinaVideoParallelImportContract.querySchema).toBe(videoEndpoints.officinaVideoModelCreateContract.querySchema);
    expect(officinaVideoParallelImportContract.requestSchema).toBe(VideoParallelImportRequestSchema);
    expect(officinaVideoParallelImportContract.responseSchema).toBe(VideoParallelImportResultSchema);
    expect(officinaVideoParallelImportContract.errorSchema).toBe(VideoEngineErrorSchema);
  });

  it('rejects a 25-character communityId and requires explicit import identity', () => {
    expect(parallelCharacterExportContract.querySchema.safeParse({ communityId: 'A'.repeat(26) }).success).toBe(true);
    for (const query of [{}, { communityId: 'A'.repeat(25) }, { communityId: 'A'.repeat(26), extra: 1 }]) {
      expect(parallelCharacterExportContract.querySchema.safeParse(query).success).toBe(false);
    }
    const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
    expect(officinaVideoParallelImportContract.querySchema.safeParse(identity).success).toBe(true);
    for (const key of Object.keys(identity)) {
      const missing = Object.fromEntries(Object.entries(identity).filter(([field]) => field !== key));
      expect(officinaVideoParallelImportContract.querySchema.safeParse(missing).success, key).toBe(false);
      expect(officinaVideoParallelImportContract.requestSchema.shape).not.toHaveProperty(key);
    }
  });

  it('publishes both transports with supported portable contracts', () => {
    const { contracts, transports } = getPortableCapabilityContracts();
    for (const [name, contract, method, path, , queryContract, requestContract, responseContract, errorContract] of routes) {
      const transport = transports[name];
      expect(transport, name).toMatchObject({
        method, path, authHeader: INTERNAL_SECRET_HEADER,
        paramsSchema: z.toJSONSchema(contract.paramsSchema), queryContract, responseContract, errorContract,
      });
      expect(transport!.requestContract).toBe(requestContract);
      for (const target of [queryContract, requestContract, responseContract, errorContract]) {
        if (target) {
          expect(contracts[target], target).toMatchObject({ supported: true, customRefinements: 0, gates: [], rules: [] });
          expect(contracts[target]!.schema, target).not.toBeNull();
        }
      }
    }
  });

  it('adds no duplicate method and path pairs, including the seven long project routes', () => {
    const existingKeys = Object.values(videoEndpoints).flatMap(contract =>
      'path' in contract ? [`${contract.method} ${contract.path}`] : []);
    const longRoutes = [
      videoEndpoints.officinaVideoLongCreateContract, videoEndpoints.officinaVideoLongListContract,
      videoEndpoints.officinaVideoLongGetContract, videoEndpoints.officinaVideoLongDraftPutContract,
      videoEndpoints.officinaVideoLongDraftGetContract, videoEndpoints.officinaVideoLongDraftApproveContract,
      videoEndpoints.officinaVideoLongCostGetContract,
    ];
    for (const contract of longRoutes) expect(existingKeys).toContain(`${contract.method} ${contract.path}`);
    const keys = [...existingKeys, ...routes.map(([, contract]) => `${contract.method} ${contract.path}`)];
    expect(new Set(keys).size).toBe(keys.length);
    const transports = Object.values(getPortableCapabilityContracts().transports)
      .map(transport => `${transport.method} ${transport.path}`);
    expect(new Set(transports).size).toBe(transports.length);
  });
});
