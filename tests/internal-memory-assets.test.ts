import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import {
  INTERNAL_MEMORY_ASSETS_PATH,
  InternalMemoryAssetIngestRequestSchema,
  InternalMemoryAssetIngestResponseSchema,
  InternalMemoryAssetListQuerySchema,
  InternalMemoryAssetListResponseSchema,
  internalMemoryAssetIngestContract,
  internalMemoryAssetListContract,
} from '../src/http/endpoints/index.js';

const asset = {
  assetId: 'asset_000001',
  sha256: 'a'.repeat(64),
  name: 'logo.png',
  mediaType: 'image/png',
  sizeBytes: 12,
  origin: { kind: 'email', messageId: 'msg-1', attachmentName: 'logo.png' },
  tenantId: 'tenant-1',
  companyId: 'company-1',
  projectId: 'project-1',
  createdAt: '2026-10-22T10:00:00Z',
};
const query = { tenantId: 'tenant-1', agentId: 'agent-1', projectId: 'project-1' };

describe('internal memory assets contract', () => {
  it('exports ingest and list contracts from source and the built CommonJS index', () => {
    expect(internalMemoryAssetIngestContract).toEqual({
      method: 'POST',
      path: INTERNAL_MEMORY_ASSETS_PATH,
      authType: 'secret',
      bodySchema: InternalMemoryAssetIngestRequestSchema,
      responseSchema: InternalMemoryAssetIngestResponseSchema,
    });
    expect(internalMemoryAssetListContract).toEqual({
      method: 'GET',
      path: INTERNAL_MEMORY_ASSETS_PATH,
      authType: 'secret',
      querySchema: InternalMemoryAssetListQuerySchema,
      responseSchema: InternalMemoryAssetListResponseSchema,
    });

    const built = createRequire(import.meta.url)('../dist/http/endpoints/index.cjs') as Record<string, unknown>;
    expect(built.internalMemoryAssetIngestContract).toMatchObject({
      method: 'POST', path: INTERNAL_MEMORY_ASSETS_PATH, authType: 'secret',
    });
    expect(built.internalMemoryAssetListContract).toMatchObject({
      method: 'GET', path: INTERNAL_MEMORY_ASSETS_PATH, authType: 'secret',
    });
  }, 30_000);

  it('exports the path from the endpoints index', () => {
    expect(INTERNAL_MEMORY_ASSETS_PATH).toBe('/internal/memory/assets');
  });

  it('accepts a valid ingest request', () => {
    expect(InternalMemoryAssetIngestRequestSchema.safeParse({ asset, contentBase64: 'AAEC' }).success).toBe(true);
  });

  it('rejects an asset without sha256', () => {
    const { sha256: _sha, ...noSha } = asset;
    expect(InternalMemoryAssetIngestRequestSchema.safeParse({ asset: noSha, contentBase64: 'AAEC' }).success).toBe(false);
  });

  it('rejects an extra key (strict)', () => {
    expect(
      InternalMemoryAssetIngestRequestSchema.safeParse({ asset, contentBase64: 'AAEC', extra: 1 }).success,
    ).toBe(false);
  });

  it('accepts file and archive responses, archive with null preview', () => {
    expect(InternalMemoryAssetIngestResponseSchema.safeParse({ kind: 'file', assetId: 'asset_000001' }).success).toBe(true);
    expect(
      InternalMemoryAssetIngestResponseSchema.safeParse({
        kind: 'archive',
        archiveAssetId: 'asset_000002',
        entries: [{ assetId: 'asset_000003', path: 'a/logo.png', mediaType: 'image/png', preview: false }],
        previewAssetId: null,
      }).success,
    ).toBe(true);
  });

  it('bounds the list limit to 1..200', () => {
    expect(InternalMemoryAssetListQuerySchema.safeParse({ ...query, limit: 1 }).success).toBe(true);
    expect(InternalMemoryAssetListQuerySchema.safeParse({ ...query, limit: 200 }).success).toBe(true);
    expect(InternalMemoryAssetListQuerySchema.safeParse({ ...query, limit: 0 }).success).toBe(false);
    expect(InternalMemoryAssetListQuerySchema.safeParse({ ...query, limit: 201 }).success).toBe(false);
  });

  it('accepts a list response with links', () => {
    expect(
      InternalMemoryAssetListResponseSchema.safeParse({
        assets: [{ ...asset, links: [{ recordId: 'rec-1', recordKind: 'decision' }] }],
      }).success,
    ).toBe(true);
  });
});
