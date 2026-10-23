import { describe, expect, it, vi } from 'vitest';
import { AssetOriginSchema, AssetRefSchema, type AssetRef } from '../../src/organization/asset.js';

const base = {
  assetId: 'asset-123',
  sha256: 'a'.repeat(64),
  name: 'brief.pdf',
  mediaType: 'application/pdf',
  sizeBytes: 1024,
  origin: { kind: 'email', messageId: 'message-123', attachmentName: 'brief.pdf' },
  tenantId: 'tenant-1',
  companyId: 'company-1',
  projectId: 'project-1',
  createdAt: '2026-10-20T21:00:00+02:00',
} satisfies Record<string, unknown>;

const link = { kind: 'link', url: 'https://example.com/brand' };
const generated = { kind: 'generated', agentId: 'agent-design', sourceAssetIds: ['asset-123', 'asset-456'] };

describe('AssetRefSchema additive fields', () => {
  it('still accepts an asset without the new fields', () => {
    expect(AssetRefSchema.parse(base)).toEqual(base);
  });

  it('accepts a link asset with assetType and buSlug', () => {
    const input = { ...base, sizeBytes: 0, origin: link, assetType: 'link', buSlug: 'design' };
    expect(AssetRefSchema.parse(input)).toEqual(input);
  });

  it('accepts a generated asset with sourceAssetIds', () => {
    const input: unknown = { ...base, origin: generated, assetType: 'dossier', buSlug: 'design' };
    expect(AssetRefSchema.parse(input)).toEqual(input);
  });

  it('accepts a generated origin without sourceAssetIds', () => {
    expect(AssetOriginSchema.safeParse({ kind: 'generated', agentId: 'agent-design' }).success).toBe(true);
  });

  it.each([
    ['ftp link', { origin: { kind: 'link', url: 'ftp://x.example/a' } }],
    ['invalid link url', { origin: { kind: 'link', url: 'not a url' } }],
    ['generated without agentId', { origin: { kind: 'generated' } }],
    ['uppercase assetType', { assetType: 'PNG' }],
    ['uppercase buSlug', { buSlug: 'Design' }],
    ['extra key in link origin', { origin: { ...link, extra: 1 } }],
    ['extra key in generated origin', { origin: { ...generated, extra: 1 } }],
  ])('rejects %s', (_label, patch) => {
    expect(AssetRefSchema.safeParse({ ...base, ...patch }).success).toBe(false);
  });

  it('fails the link case when ASSET_ORIGIN_KINDS lacks link', async () => {
    vi.resetModules();
    vi.doMock('../../src/organization/asset.js', async (importOriginal) => {
      const mod = await importOriginal<typeof import('../../src/organization/asset.js')>();
      return { ...mod, ASSET_ORIGIN_KINDS: mod.ASSET_ORIGIN_KINDS.filter((k) => k !== 'link') };
    });
    const mod = await import('../../src/organization/asset.js');
    expect(mod.ASSET_ORIGIN_KINDS).not.toContain('link');
    vi.doUnmock('../../src/organization/asset.js');
    vi.resetModules();
  });
});

export type _Unused = AssetRef;
