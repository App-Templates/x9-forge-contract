import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from '../../../src/auth/auth-headers.js';
import { getPortableCapabilityContracts, portableJsonSchema } from '../../../src/capability/portable-contracts.js';
import { VideoOutfitStyleRequestSchema, VideoOutfitStyleResultSchema } from '../../../src/capability/video/abito-stile.js';
import { VideoEngineErrorSchema } from '../../../src/capability/video/engine.js';
import { VideoModelIdSchema, VideoModelScopeQuerySchema } from '../../../src/capability/video/modella.js';
import * as endpoints from '../../../src/http/endpoints/officina-video.js';
import { parallelCharacterExportContract, officinaVideoParallelImportContract } from '../../../src/http/endpoints/parallel-personaggi.js';

const contract = endpoints.officinaVideoModelOutfitStyleContract;
const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };

// SUMMARY: changing /abito-stile to /abiti-stile in the contract makes
// "publishes its method, path and composition status" fail. Tests and mutations run at the gate.
describe('character outfit style route', () => {
  it('publishes its method, path and composition status', () => {
    expect(contract).toMatchObject({ method: 'POST', path: '/api/modelle/:modelId/abito-stile', responseStatus: 200 });
  });

  it('reuses canonical schemas for path, query, request, response and errors', () => {
    expect(contract.paramsSchema.shape.modelId).toBe(VideoModelIdSchema);
    expect(contract.querySchema).toBe(VideoModelScopeQuerySchema);
    expect(contract.requestSchema).toBe(VideoOutfitStyleRequestSchema);
    expect(contract.responseSchema).toBe(VideoOutfitStyleResultSchema);
    expect(contract.errorSchema).toBe(VideoEngineErrorSchema);
  });

  it('rejects uppercase and 49-character model IDs and strict parameter violations', () => {
    for (const modelId of ['livia', 'a'.repeat(48)]) {
      expect(contract.paramsSchema.safeParse({ modelId }).success).toBe(true);
    }
    for (const params of [{}, { modelId: 'Livia' }, { modelId: 'a'.repeat(49) }, { modelId: 'livia', extra: 1 }]) {
      expect(contract.paramsSchema.safeParse(params).success).toBe(false);
    }
  });

  it('accepts da-parallel as a model ID without colliding with the import route', () => {
    expect(contract.paramsSchema.safeParse({ modelId: 'da-parallel' }).success).toBe(true);
    const outfitPath = contract.path.replace(':modelId', 'da-parallel');
    expect(outfitPath).toBe('/api/modelle/da-parallel/abito-stile');
    expect(officinaVideoParallelImportContract.path).toBe('/api/modelle/da-parallel');
    expect(outfitPath).not.toBe(officinaVideoParallelImportContract.path);
  });

  it('requires explicit identity in query and keeps it out of the body', () => {
    expect(contract.querySchema.safeParse(identity).success).toBe(true);
    for (const key of Object.keys(identity)) {
      const missing = Object.fromEntries(Object.entries(identity).filter(([field]) => field !== key));
      expect(contract.querySchema.safeParse(missing).success, key).toBe(false);
      expect(contract.requestSchema.safeParse({ request: 'abito da sera', [key]: identity[key as keyof typeof identity] }).success, key).toBe(false);
    }
    expect(contract.querySchema.safeParse({ ...identity, extra: 1 }).success).toBe(false);
  });

  it('rejects empty and 301-character requests while accepting the 300-character boundary', () => {
    expect(contract.requestSchema.safeParse({ request: 'abito da sera' }).success).toBe(true);
    expect(contract.requestSchema.safeParse({ request: 'a'.repeat(300) }).success).toBe(true);
    for (const request of [{}, { request: '' }, { request: '   ' }, { request: 'a'.repeat(301) }]) {
      expect(contract.requestSchema.safeParse(request).success).toBe(false);
    }
  });

  it('accepts all three rule states and rejects a response with unknown rules', () => {
    const response = { description: 'Abito blu dalle linee semplici', constraints: ['Colori sobri'], rules: 'complete' };
    for (const rules of ['complete', 'senza_regole', 'senza_stile']) {
      expect(contract.responseSchema.safeParse({ ...response, rules }).success, rules).toBe(true);
    }
    expect(contract.responseSchema.safeParse({ ...response, rules: 'ignote' }).success).toBe(false);
  });

  it('publishes the transport and supported canonical request, response, query and error contracts', () => {
    const { contracts, transports } = getPortableCapabilityContracts();
    expect(transports.videoEngineOutfitStyle).toMatchObject({
      method: 'POST', path: '/api/modelle/:modelId/abito-stile', authHeader: INTERNAL_SECRET_HEADER,
      paramsSchema: z.toJSONSchema(contract.paramsSchema),
      queryContract: 'videoEngineModelQuery', requestContract: 'videoEngineOutfitStyleRequest',
      responseContract: 'videoEngineOutfitStyleResult', errorContract: 'videoEngineError',
    });
    const schemas = [
      ['videoEngineModelQuery', VideoModelScopeQuerySchema],
      ['videoEngineOutfitStyleRequest', VideoOutfitStyleRequestSchema],
      ['videoEngineOutfitStyleResult', VideoOutfitStyleResultSchema],
      ['videoEngineError', VideoEngineErrorSchema],
    ] as const;
    for (const [name, schema] of schemas) {
      expect(contracts[name], name).toMatchObject({ supported: true, customRefinements: 0, gates: [], rules: [] });
      expect(contracts[name]!.schema, name).toEqual(portableJsonSchema(schema));
    }
  });

  it('keeps catalog method and path pairs unique including models, both long groups, Parallel and environments', () => {
    const previous = [
      endpoints.officinaVideoModelCreateContract, endpoints.officinaVideoModelListContract,
      endpoints.officinaVideoModelGetContract, endpoints.officinaVideoModelVersionCreateContract,
      endpoints.officinaVideoModelRefAddContract, endpoints.officinaVideoModelRefGetContract,
      endpoints.officinaVideoModelApproveContract,
      endpoints.officinaVideoLongCreateContract, endpoints.officinaVideoLongListContract,
      endpoints.officinaVideoLongGetContract, endpoints.officinaVideoLongDraftPutContract,
      endpoints.officinaVideoLongDraftGetContract, endpoints.officinaVideoLongDraftApproveContract,
      endpoints.officinaVideoLongCostGetContract,
      endpoints.officinaVideoLongResearchStartContract, endpoints.officinaVideoLongResearchGetContract,
      endpoints.officinaVideoLongDossierPutContract, endpoints.officinaVideoLongDossierGetContract,
      endpoints.officinaVideoLongChaptersPutContract, endpoints.officinaVideoLongChaptersGetContract,
      endpoints.officinaVideoLongChaptersApproveContract,
      parallelCharacterExportContract, officinaVideoParallelImportContract,
      endpoints.officinaVideoEnvironmentCreateContract, endpoints.officinaVideoEnvironmentListContract,
      endpoints.officinaVideoEnvironmentGetContract, endpoints.officinaVideoEnvironmentVersionCreateContract,
      endpoints.officinaVideoEnvironmentAngleAddContract, endpoints.officinaVideoEnvironmentAngleGetContract,
      endpoints.officinaVideoEnvironmentApproveContract,
    ];
    const keys = Object.values(getPortableCapabilityContracts().transports)
      .map(transport => `${transport.method} ${transport.path}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const route of [...previous, contract]) expect(keys).toContain(`${route.method} ${route.path}`);
  });
});
