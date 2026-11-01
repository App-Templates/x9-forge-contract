import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import {
  INTERNAL_MEMORY_ASSETS_LIST_PATH,
  INTERNAL_MEMORY_ASSETS_PATH,
  InternalMemoryAssetIngestRequestSchema,
  InternalMemoryAssetListRequestSchema,
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
const context = {
  schemaVersion: 1, runId: 'run-1', organizationId: 'org-1', ownerId: 'owner-1',
  identity: { managementAgentId: 'director', runtimeAgentId: 'director' }, issuer: 'x9',
  issuedAt: '2026-10-24T07:00:00.000Z', expiresAt: '2026-10-24T09:00:00.000Z',
};
const list = { context, projectId: 'project-1' };

describe('internal memory assets: provider attribution', () => {
  it('accepts a sender email for service resolution without changing the request', () => {
    const input = { context, asset, contentBase64: 'AAEC', providedByEmail: 'massimo@example.com' };
    expect(InternalMemoryAssetIngestRequestSchema.parse(input)).toEqual(input);
  });

  it('rejects a sender email combined with an asserted provider', () => {
    const result = InternalMemoryAssetIngestRequestSchema.safeParse({
      context,
      asset: { ...asset, providedBy: { personRef: 'massimo' } },
      contentBase64: 'AAEC',
      providedByEmail: 'massimo@example.com',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual({
      code: 'custom', path: ['asset', 'providedBy'], message: 'provided_by_is_resolved_by_the_service',
    });
  });

  it.each(['', 'massimo', 'massimo@', 'massimo@example.com ', 'massimo@example.com\n'])(
    'rejects an invalid sender email %j', (providedByEmail) => {
      expect(InternalMemoryAssetIngestRequestSchema.safeParse({
        context, asset, contentBase64: 'AAEC', providedByEmail,
      }).success).toBe(false);
    },
  );

  it('preserves an ingest request without either provider field', () => {
    const input = { context, asset, contentBase64: 'AAEC' };
    expect(InternalMemoryAssetIngestRequestSchema.parse(input)).toEqual(input);
  });

  it('accepts an already resolved provider without a sender email', () => {
    const input = { context, asset: { ...asset, providedBy: { personRef: 'massimo' } }, contentBase64: 'AAEC' };
    expect(InternalMemoryAssetIngestRequestSchema.parse(input)).toEqual(input);
  });

  it('inherits provider attribution in list responses', () => {
    const input = { assets: [{ ...asset, providedBy: { personRef: 'massimo' }, links: [] }] };
    expect(InternalMemoryAssetListResponseSchema.parse(input)).toEqual(input);
  });
});

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
      method: 'POST',
      path: INTERNAL_MEMORY_ASSETS_LIST_PATH,
      authType: 'secret',
      bodySchema: InternalMemoryAssetListRequestSchema,
      responseSchema: InternalMemoryAssetListResponseSchema,
    });

    const built = createRequire(import.meta.url)('../dist/http/endpoints/index.cjs') as Record<string, unknown>;
    expect(built.internalMemoryAssetIngestContract).toMatchObject({
      method: 'POST', path: INTERNAL_MEMORY_ASSETS_PATH, authType: 'secret',
    });
    expect(built.internalMemoryAssetListContract).toMatchObject({
      method: 'POST', path: INTERNAL_MEMORY_ASSETS_LIST_PATH, authType: 'secret',
    });
  }, 30_000);

  it('exports the path from the endpoints index', () => {
    expect(INTERNAL_MEMORY_ASSETS_PATH).toBe('/internal/memory/assets');
    expect(INTERNAL_MEMORY_ASSETS_LIST_PATH).toBe('/internal/memory/assets/list');
  });

  it('accepts a valid ingest request', () => {
    expect(InternalMemoryAssetIngestRequestSchema.safeParse({ context, asset, contentBase64: 'AAEC' }).success).toBe(true);
  });

  it('rejects an asset without sha256', () => {
    const { sha256: _sha, ...noSha } = asset;
    expect(InternalMemoryAssetIngestRequestSchema.safeParse({ context, asset: noSha, contentBase64: 'AAEC' }).success).toBe(false);
  });

  it('rejects an extra key (strict)', () => {
    expect(
      InternalMemoryAssetIngestRequestSchema.safeParse({ context, asset, contentBase64: 'AAEC', extra: 1 }).success,
    ).toBe(false);
  });

  it('accepts file and archive responses, archive with null preview', () => {
    expect(InternalMemoryAssetIngestResponseSchema.safeParse({ kind: 'file', assetId: 'asset_000001', sha256: 'a'.repeat(64) }).success).toBe(true);
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
    expect(InternalMemoryAssetListRequestSchema.safeParse({ ...list, limit: 1 }).success).toBe(true);
    expect(InternalMemoryAssetListRequestSchema.safeParse({ ...list, limit: 200 }).success).toBe(true);
    expect(InternalMemoryAssetListRequestSchema.safeParse({ ...list, limit: 0 }).success).toBe(false);
    expect(InternalMemoryAssetListRequestSchema.safeParse({ ...list, limit: 201 }).success).toBe(false);
    // The deprecated query keeps parsing for anyone still importing it.
    expect(InternalMemoryAssetListQuerySchema.safeParse({ ...query, limit: 1 }).success).toBe(true);
  });

  it('accepts a list response with links', () => {
    expect(
      InternalMemoryAssetListResponseSchema.safeParse({
        assets: [{ ...asset, links: [{ recordId: 'rec-1', recordKind: 'decision' }] }],
      }).success,
    ).toBe(true);
  });
});

describe('internal memory assets: links and company/BU filter', () => {
  const linkAsset = {
    ...asset,
    name: 'brief',
    mediaType: 'text/uri-list',
    sizeBytes: 0,
    origin: { kind: 'link', url: 'https://example.com/brief' },
  };

  it('accepts a link ingest without content', () => {
    expect(InternalMemoryAssetIngestRequestSchema.safeParse({ context, asset: linkAsset }).success).toBe(true);
  });

  it('rejects a link ingest with content (link_has_no_content)', () => {
    const r = InternalMemoryAssetIngestRequestSchema.safeParse({ context, asset: linkAsset, contentBase64: 'AAEC' });
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.error?.issues)).toContain('link_has_no_content');
  });

  it('rejects an email ingest without content (content_required)', () => {
    const r = InternalMemoryAssetIngestRequestSchema.safeParse({ context, asset });
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.error?.issues)).toContain('content_required');
  });

  it('accepts a list query with companyId and buSlug', () => {
    expect(
      InternalMemoryAssetListRequestSchema.safeParse({ ...list, companyId: 'company-1', buSlug: 'design' }).success,
    ).toBe(true);
  });

  it('rejects a list query with an invalid buSlug', () => {
    expect(InternalMemoryAssetListRequestSchema.safeParse({ ...list, buSlug: 'Design' }).success).toBe(false);
  });

  it('accepts a list response asset with assetType and buSlug', () => {
    expect(
      InternalMemoryAssetListResponseSchema.safeParse({
        assets: [{ ...asset, assetType: 'image', buSlug: 'design', links: [] }],
      }).success,
    ).toBe(true);
  });
});

describe('internal memory assets: signed context (1.63.0)', () => {
  it('rejects an ingest without the signed context of the run or of the connector', () => {
    const r = InternalMemoryAssetIngestRequestSchema.safeParse({ asset, contentBase64: 'AAEC' });
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.error?.issues)).toContain('context');
  });

  it('rejects a context with free-form fields or expired before issued', () => {
    expect(InternalMemoryAssetIngestRequestSchema.safeParse({
      context: { ...context, secret: 'x' }, asset, contentBase64: 'AAEC',
    }).success).toBe(false);
    expect(InternalMemoryAssetIngestRequestSchema.safeParse({
      context: { ...context, expiresAt: '2026-10-24T06:00:00.000Z' }, asset, contentBase64: 'AAEC',
    }).success).toBe(false);
  });

  it('rejects a list without context, and tenant or agent given in the body', () => {
    expect(InternalMemoryAssetListRequestSchema.safeParse({ projectId: 'project-1' }).success).toBe(false);
    expect(InternalMemoryAssetListRequestSchema.safeParse({ ...list, tenantId: 'tenant-1' }).success).toBe(false);
    expect(InternalMemoryAssetListRequestSchema.safeParse({ ...list, agentId: 'agent-1' }).success).toBe(false);
  });

  it('answers a file ingest with its sha256 fingerprint', () => {
    expect(InternalMemoryAssetIngestResponseSchema.safeParse({ kind: 'file', assetId: 'asset_000001' }).success).toBe(false);
    expect(InternalMemoryAssetIngestResponseSchema.safeParse({ kind: 'file', assetId: 'asset_000001', sha256: 'z'.repeat(64) }).success).toBe(false);
  });
});
