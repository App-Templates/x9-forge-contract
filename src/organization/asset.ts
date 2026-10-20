import { z } from 'zod';
import { BusinessUnitLeadBirthRequestSchema } from './business-unit-lead.js';

export const ASSET_ORIGIN_KINDS = ['email', 'archive', 'session'] as const;

export const AssetSha256Schema = z.string().regex(/^[0-9a-f]{64}$/);
export type AssetSha256 = z.infer<typeof AssetSha256Schema>;

/** Provenance of a company file, without embedding its contents. */
export const AssetOriginSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal(ASSET_ORIGIN_KINDS[0]),
    messageId: z.string().min(1).max(512),
    attachmentName: z.string().min(1).max(255).optional(),
  }),
  z.strictObject({
    kind: z.literal(ASSET_ORIGIN_KINDS[1]),
    archiveSha256: AssetSha256Schema,
    entryPath: z.string().min(1).max(1024).refine(
      (entryPath) => !entryPath.startsWith('/') && !entryPath.split('/').includes('..'),
      { message: 'Entry path must be relative and contain no parent segments' },
    ),
  }),
  z.strictObject({
    kind: z.literal(ASSET_ORIGIN_KINDS[2]),
    sessionId: z.string().min(1).max(128),
  }),
]);
export type AssetOrigin = z.infer<typeof AssetOriginSchema>;

/** Shared reference scoped to a tenant, company and project. */
export const AssetRefSchema = z.strictObject({
  assetId: z.string().regex(/^[A-Za-z0-9_-]{6,64}$/),
  sha256: AssetSha256Schema,
  name: z.string().min(1).max(255).regex(/^[^/\\]+$/),
  mediaType: z.string().regex(/^[a-z0-9.+-]+\/[a-z0-9.+-]+$/),
  sizeBytes: z.number().int().min(0),
  origin: AssetOriginSchema,
  tenantId: z.string().min(1),
  companyId: BusinessUnitLeadBirthRequestSchema.shape.company.shape.companyId,
  projectId: z.string().min(1).max(64),
  createdAt: z.iso.datetime({ offset: true }),
});
export type AssetRef = z.infer<typeof AssetRefSchema>;
