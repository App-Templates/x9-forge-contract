import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  DevSessionAssetReadSchema,
  readDevSessionAssetContract,
  type DevSessionAssetRead,
} from '../../src/http/endpoints/internal-dev-session-asset-content.js';
import { AssetOriginSchema, AssetRefSchema } from '../../src/organization/asset.js';
import { CapabilityAgentParamsSchema } from '../../src/http/endpoints/internal-capability-agent.js';
import { CapabilityAgentScopeSchema } from '../../src/capability/capability-call-context.js';
import { DevProductionArtifactChunkSchema } from '../../src/capability/dev/production-artifact-content.js';
import {
  readDevSessionAssetContract as exportedContract,
  DevSessionAssetReadSchema as exportedReadSchema,
} from '../../src/http/index.js';

const request: DevSessionAssetRead = {
  scope: { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' },
  asset: {
    assetId: 'asset-123',
    sha256: 'a'.repeat(64),
    name: 'brief.pdf',
    mediaType: 'application/pdf',
    sizeBytes: 1024,
    origin: { kind: 'session', sessionId: 'session-123' },
    tenantId: 'tenant-1',
    companyId: 'company-1',
    projectId: 'project-1',
    createdAt: '2026-10-22T10:00:00+02:00',
  },
  offset: 0,
  length: 1024,
};
const contract = readDevSessionAssetContract;

describe('internal dev session asset content', () => {
  it('accepts a session asset and valid chunk boundaries', () => {
    expect(DevSessionAssetReadSchema.parse(request)).toEqual(request);
    for (const length of [1, 262144]) {
      expect(DevSessionAssetReadSchema.safeParse({ ...request, length }).success).toBe(true);
    }
    expect(contract.paramsSchema.parse({ agentId: 'agent-1', sessionId: 'session-123' }))
      .toEqual({ agentId: 'agent-1', sessionId: 'session-123' });
  });

  it('rejects email origin and detects removal of the session refinement', () => {
    const email = { ...request, asset: { ...request.asset, origin: { kind: 'email', messageId: 'message-123' } } };
    expect(AssetRefSchema.safeParse(email.asset).success).toBe(true);
    const assertEmailRejected = (schema: z.ZodType) => {
      expect(schema.safeParse(email).success).toBe(false);
    };
    assertEmailRejected(DevSessionAssetReadSchema);
    // Rebuild the same strict shape without object refinements, in memory only.
    const withoutSessionRefinement = z.strictObject(DevSessionAssetReadSchema.shape);
    expect(withoutSessionRefinement.safeParse(email).success).toBe(true);
    expect(() => assertEmailRejected(withoutSessionRefinement)).toThrow();
    assertEmailRejected(DevSessionAssetReadSchema);
  });

  it.each([
    { length: 0 }, { length: 262145 }, { length: 1.5 },
    { offset: -1 }, { offset: 0.5 }, { extra: true },
  ])('rejects invalid request fields %j', (patch) => {
    expect(DevSessionAssetReadSchema.safeParse({ ...request, ...patch }).success).toBe(false);
  });

  it('uses the internal secret-authenticated POST and canonical schemas', () => {
    expect(contract.method).toBe('POST');
    expect(contract.path).toBe('/internal/capability/agents/:agentId/dev/sessions/:sessionId/assets/read');
    expect(contract.path).toContain('/internal/');
    expect(contract.authType).toBe('secret');
    expect(contract.bodySchema).toBe(DevSessionAssetReadSchema);
    expect(contract.responseSchema).toBe(DevProductionArtifactChunkSchema);
    expect(contract.paramsSchema.shape.agentId).toBe(CapabilityAgentParamsSchema.shape.agentId);
    expect(contract.paramsSchema.shape.sessionId).toBe(AssetOriginSchema.options[2].shape.sessionId);
    expect(DevSessionAssetReadSchema.shape.scope).toBe(CapabilityAgentScopeSchema);
    expect(DevSessionAssetReadSchema.shape.asset).toBe(AssetRefSchema);
  });

  it.each(['', 's'.repeat(129)])('rejects invalid session parameter %j', (sessionId) => {
    expect(contract.paramsSchema.safeParse({ agentId: 'agent-1', sessionId }).success).toBe(false);
  });

  it('exports the contract through the HTTP index', () => {
    expect(exportedContract).toBe(contract);
    expect(exportedReadSchema).toBe(DevSessionAssetReadSchema);
  });
});
