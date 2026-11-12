import { describe, expect, it } from 'vitest';
import {
  INTERNAL_MEMORY_ASSET_READ_PATH,
  InternalMemoryAssetReadRequestSchema,
  InternalMemoryAssetReadResponseSchema,
  internalMemoryAssetReadContract,
} from '../../../src/http/endpoints/index.js';
import {
  PROJECT_DELIVERY_ASSET_TYPE,
  PROJECT_DELIVERY_DUPLICATE_UNIT,
  ProjectDeliveryRecordSchema,
  ProjectDeliveryToolOutputSchema,
  projectDeliveryRecordAssetId,
  projectDeliveryRecordName,
} from '../../../src/organization/index.js';
import { EMAIL_SEND_TOOL } from '../../../src/capability/email-tools.js';

const context = {
  schemaVersion: 1,
  runId: 'run-6102',
  organizationId: 'org-1',
  ownerId: 'owner-1',
  identity: { managementAgentId: 'director', runtimeAgentId: 'director' },
  issuer: 'x9',
  issuedAt: '2026-11-10T07:00:00.000Z',
  expiresAt: '2026-11-10T09:00:00.000Z',
};
const name = projectDeliveryRecordName({ kind: 'final', digest: 'a'.repeat(64), stage: 'sent', attempt: 1 });
const assetId = projectDeliveryRecordAssetId({
  tenantId: 'tenant-1', organizationId: context.organizationId, projectId: 'project-1', name,
});
const request = { context, projectId: 'project-1', assetId };
const projectAsset = {
  assetId,
  sha256: 'a'.repeat(64),
  name,
  mediaType: 'application/json',
  sizeBytes: 120,
  origin: { kind: 'generated', agentId: 'director' },
  tenantId: 'tenant-1',
  companyId: 'company-1',
  projectId: 'project-1',
  assetType: PROJECT_DELIVERY_ASSET_TYPE,
  createdAt: '2026-11-10T08:00:00Z',
};

describe('internal memory asset read', () => {
  it('s6102 consegna-registrata-oltre-200-asset: a project asset is read back by id through internalMemoryAssetReadContract', () => {
    expect(INTERNAL_MEMORY_ASSET_READ_PATH).toBe('/internal/memory/assets/read');
    expect(internalMemoryAssetReadContract).toEqual({
      method: 'POST', path: INTERNAL_MEMORY_ASSET_READ_PATH, authType: 'secret',
      bodySchema: InternalMemoryAssetReadRequestSchema,
      responseSchema: InternalMemoryAssetReadResponseSchema,
    });
    // Known IDs do not depend on a page or list limit. Ownership is verified by Memory, not this schema.
    expect(internalMemoryAssetReadContract.bodySchema.parse(request)).toEqual(request);
    expect(internalMemoryAssetReadContract.bodySchema.safeParse({ context, assetId }).success).toBe(false);
    expect(internalMemoryAssetReadContract.responseSchema.parse({ asset: projectAsset })).toEqual({ asset: projectAsset });
    expect(projectAsset.assetType).toBe('consegna-progetto');
    expect(projectAsset).not.toHaveProperty('buSlug');
    expect(internalMemoryAssetReadContract.responseSchema.parse({ asset: null })).toEqual({ asset: null });
  });

  it('s6102 the read request refuses extra keys and a missing assetId', () => {
    expect(InternalMemoryAssetReadRequestSchema.safeParse({ ...request, limit: 200 }).success).toBe(false);
    expect(InternalMemoryAssetReadRequestSchema.safeParse({ context, projectId: request.projectId }).success).toBe(false);
    expect(InternalMemoryAssetReadRequestSchema.safeParse({ ...request, assetId: '' }).success).toBe(false);
    expect(InternalMemoryAssetReadRequestSchema.safeParse({ ...request, context: { ...context, extra: true } }).success).toBe(false);
  });

  it('s6102 the read response refuses links', () => {
    expect(InternalMemoryAssetReadResponseSchema.safeParse({ asset: { ...projectAsset, links: [] } }).success).toBe(false);
    expect(InternalMemoryAssetReadResponseSchema.safeParse({ asset: projectAsset, links: [] }).success).toBe(false);
  });

  it('s6102 reads a design session delivery in the production asset shape', () => {
    // Synthetic identifiers, retaining the supplied production fields and origin shape.
    const asset = {
      ...projectAsset, assetId: 'asset_design_6102', name: 'CONSEGNA.json', buSlug: 'design',
      origin: { kind: 'session', sessionId: 'session-design-6102' },
    };
    expect(InternalMemoryAssetReadResponseSchema.parse({ asset })).toEqual({ asset });
  });

  it('s6102 exports the project delivery record and the email send tool', () => {
    expect(EMAIL_SEND_TOOL).toBe('email_send');
    expect(PROJECT_DELIVERY_DUPLICATE_UNIT).toBe('project_delivery_duplicate_unit');
    expect(ProjectDeliveryRecordSchema.safeParse({
      stage: 'released', kind: 'final', digest: 'a'.repeat(64), attempt: 1,
      reason: 'Send failed before delivery', releasedAt: '2026-11-10T08:00:00Z',
    }).success).toBe(true);
    expect(ProjectDeliveryToolOutputSchema.shape.reconciliation).toBeDefined();
    expect(name).toMatch(/^consegna-progetto-final-[0-9a-f]{16}-sent\.json$/);
    expect(assetId).toMatch(/^a_[0-9a-f]{40}$/);
  });
});
