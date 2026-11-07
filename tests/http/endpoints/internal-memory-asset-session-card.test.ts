import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { InternalMemoryAssetIngestRequestSchema } from '../../../src/http/endpoints/index.js';
import type * as SrcEndpoints from '../../../src/http/endpoints/index.js';

const asset = {
  assetId: 'asset_000013',
  sha256: 'a'.repeat(64),
  name: 'a.pdf',
  mediaType: 'application/pdf',
  sizeBytes: 12,
  origin: {
    kind: 'session', sessionId: 's-13', repo: 'App-Templates/x',
    commit: 'c'.repeat(40), path: 'consegna/a.pdf',
  },
  tenantId: 'tenant-1',
  companyId: 'company-1',
  projectId: 'project-1',
  createdAt: '2026-11-05T09:38:00Z',
};
const context = {
  schemaVersion: 1, runId: 'run-13', organizationId: 'org-1', ownerId: 'owner-1',
  identity: { managementAgentId: 'director', runtimeAgentId: 'director' }, issuer: 'x9',
  issuedAt: '2026-11-05T09:00:00.000Z', expiresAt: '2026-11-05T11:00:00.000Z',
};
const built = createRequire(import.meta.url)('../../../dist/http/endpoints/index.cjs') as Pick<
  typeof SrcEndpoints, 'InternalMemoryAssetIngestRequestSchema'
>;

describe.each([
  { name: 'source', schema: InternalMemoryAssetIngestRequestSchema },
  { name: 'built CommonJS', schema: built.InternalMemoryAssetIngestRequestSchema },
])('session asset card ($name)', ({ schema }) => {
  it('accepts a session card without bytes and preserves the declared metadata', () => {
    const input = { context, asset };
    expect(schema.parse(input)).toStrictEqual(input);
  });

  it('rejects session bytes with exactly session_has_no_content', () => {
    const result = schema.safeParse({ context, asset, contentBase64: 'AAEC' });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toStrictEqual([
      { code: 'custom', path: ['contentBase64'], message: 'session_has_no_content' },
    ]);
  });
});

describe('session card metadata and unchanged other origins', () => {
  it.each(['sha256', 'sizeBytes'] as const)('rejects a session card without %s', (field) => {
    const { [field]: _missing, ...incompleteAsset } = asset;
    const result = InternalMemoryAssetIngestRequestSchema.safeParse({ context, asset: incompleteAsset });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path)).toStrictEqual([['asset', field]]);
  });

  it.each([
    { kind: 'email', messageId: 'msg-13', attachmentName: 'a.pdf' },
    { kind: 'archive', archiveSha256: 'b'.repeat(64), entryPath: 'consegna/a.pdf' },
    { kind: 'generated', agentId: 'design-lead' },
  ])('still requires bytes for $kind and accepts it with bytes', (origin) => {
    const input = { context, asset: { ...asset, origin } };
    const result = InternalMemoryAssetIngestRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toStrictEqual([
      { code: 'custom', path: ['contentBase64'], message: 'content_required' },
    ]);
    const withBytes = { ...input, contentBase64: 'AAEC' };
    expect(InternalMemoryAssetIngestRequestSchema.parse(withBytes)).toStrictEqual(withBytes);
  });

  it('still accepts a link without bytes and rejects link bytes with link_has_no_content', () => {
    const input = {
      context,
      asset: { ...asset, sizeBytes: 0, origin: { kind: 'link', url: 'https://example.com/a.pdf' } },
    };
    expect(InternalMemoryAssetIngestRequestSchema.parse(input)).toStrictEqual(input);
    const result = InternalMemoryAssetIngestRequestSchema.safeParse({ ...input, contentBase64: 'AAEC' });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toStrictEqual([
      { code: 'custom', path: ['contentBase64'], message: 'link_has_no_content' },
    ]);
  });
});
