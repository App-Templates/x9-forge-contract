import { describe, expect, it } from 'vitest';
import {
  ASSET_ORIGIN_KINDS,
  AssetOriginSchema,
  AssetRefSchema,
  AssetSha256Schema,
  type AssetOrigin,
  type AssetRef,
} from '../../src/organization/asset.js';
import { BusinessUnitLeadBirthRequestSchema } from '../../src/organization/business-unit-lead.js';

const origins = [
  { kind: 'email', messageId: 'message-123', attachmentName: 'brief.pdf' },
  { kind: 'archive', archiveSha256: 'b'.repeat(64), entryPath: 'materials/brief.pdf' },
  { kind: 'session', sessionId: 'session-123' },
] satisfies AssetOrigin[];

const asset: AssetRef = {
  assetId: 'asset-123',
  sha256: 'a'.repeat(64),
  name: 'brief.pdf',
  mediaType: 'application/pdf',
  sizeBytes: 1024,
  origin: origins[0],
  tenantId: 'tenant-1',
  companyId: 'company-1',
  projectId: 'project-1',
  createdAt: '2026-10-20T21:00:00+02:00',
};

describe('AssetRefSchema', () => {
  it('preserves an asset without provider attribution', () => {
    expect(AssetRefSchema.parse(asset)).toEqual(asset);
  });

  it.each(['massimo', 'massimo-rossi', 'a', 'a'.repeat(40)])('accepts provider personRef %s', (personRef) => {
    const input = { ...asset, providedBy: { personRef } };
    expect(AssetRefSchema.parse(input)).toEqual(input);
  });

  it.each(['', 'Massimo', 'massimo rossi', 'massimo@example.com', '-massimo', 'massimo-', 'massimo--rossi', 'a'.repeat(41)])(
    'rejects an invalid provider personRef %s', (personRef) => {
      expect(AssetRefSchema.safeParse({ ...asset, providedBy: { personRef } }).success).toBe(false);
    },
  );

  it('rejects extra keys inside provider attribution', () => {
    expect(AssetRefSchema.safeParse({
      ...asset, providedBy: { personRef: 'massimo', email: 'massimo@example.com' },
    }).success).toBe(false);
  });

  it('requires personRef when provider attribution is present', () => {
    expect(AssetRefSchema.safeParse({ ...asset, providedBy: {} }).success).toBe(false);
    expect(AssetRefSchema.safeParse({ ...asset, providedBy: null }).success).toBe(false);
  });

  it.each(origins)('accepts an asset with $kind origin', (origin) => {
    const input = { ...asset, origin };
    expect(AssetRefSchema.parse(input)).toEqual(input);
  });

  it('exports the canonical origins and reuses the company identifier schema', () => {
    expect(ASSET_ORIGIN_KINDS).toEqual(['email', 'archive', 'session', 'link', 'generated']);
    expect(AssetRefSchema.shape.companyId).toBe(
      BusinessUnitLeadBirthRequestSchema.shape.company.shape.companyId,
    );
  });

  it('rejects an uppercase or short sha256', () => {
    for (const sha256 of ['A'.repeat(64), 'a'.repeat(63)]) {
      expect(AssetSha256Schema.safeParse(sha256).success).toBe(false);
      expect(AssetRefSchema.safeParse({ ...asset, sha256 }).success).toBe(false);
      expect(AssetOriginSchema.safeParse({
        kind: 'archive', archiveSha256: sha256, entryPath: 'brief.pdf',
      }).success).toBe(false);
    }
  });

  it('rejects an archive entry that escapes the archive', () => {
    for (const entryPath of ['../x', '/etc/x', 'folder/../x', '..', 'folder/..']) {
      expect(AssetRefSchema.safeParse({
        ...asset,
        origin: { kind: 'archive', archiveSha256: 'b'.repeat(64), entryPath },
      }).success).toBe(false);
    }
  });

  it.each(['folder/brief.pdf', 'folder\\brief.pdf'])('rejects a name with a path separator: %s', (name) => {
    expect(AssetRefSchema.safeParse({ ...asset, name }).success).toBe(false);
  });

  it.each([-1, 1.5])('rejects a negative or fractional sizeBytes: %s', (sizeBytes) => {
    expect(AssetRefSchema.safeParse({ ...asset, sizeBytes }).success).toBe(false);
  });

  it('accepts an empty file and an email without an attachment name', () => {
    expect(AssetRefSchema.safeParse({
      ...asset, sizeBytes: 0, origin: { kind: 'email', messageId: 'message-123' },
    }).success).toBe(true);
  });

  it('rejects an unsupported origin kind', () => {
    expect(AssetRefSchema.safeParse({ ...asset, origin: { kind: 'drive' } }).success).toBe(false);
  });

  it('rejects an asset without projectId', () => {
    const { projectId, ...withoutProject } = asset;
    expect(projectId).toBe('project-1');
    expect(AssetRefSchema.safeParse(withoutProject).success).toBe(false);
  });

  it('rejects extra keys on the asset and each origin', () => {
    expect(AssetRefSchema.safeParse({ ...asset, extra: true }).success).toBe(false);
    for (const origin of origins) {
      expect(AssetRefSchema.safeParse({ ...asset, origin: { ...origin, extra: true } }).success).toBe(false);
    }
  });

  it.each([
    { assetId: 'short' }, { assetId: 'a'.repeat(65) }, { assetId: 'asset.dot' },
    { name: '' }, { name: 'a'.repeat(256) },
    { mediaType: 'Application/PDF' }, { mediaType: 'application' },
    { tenantId: '' }, { companyId: '' }, { companyId: 'a'.repeat(65) },
    { projectId: '' }, { projectId: 'a'.repeat(65) },
    { createdAt: '2026-10-20T21:00:00' },
  ])('rejects invalid asset fields: %j', (fields) => {
    expect(AssetRefSchema.safeParse({ ...asset, ...fields }).success).toBe(false);
  });

  it.each([
    { kind: 'email', messageId: '' },
    { kind: 'email', messageId: 'a'.repeat(513) },
    { kind: 'email', messageId: 'message-123', attachmentName: '' },
    { kind: 'email', messageId: 'message-123', attachmentName: 'a'.repeat(256) },
    { kind: 'archive', archiveSha256: 'b'.repeat(64), entryPath: '' },
    { kind: 'archive', archiveSha256: 'b'.repeat(64), entryPath: 'a'.repeat(1025) },
    { kind: 'session', sessionId: '' },
    { kind: 'session', sessionId: 'a'.repeat(129) },
  ])('rejects invalid origin fields: %j', (origin) => {
    expect(AssetRefSchema.safeParse({ ...asset, origin }).success).toBe(false);
  });
});
