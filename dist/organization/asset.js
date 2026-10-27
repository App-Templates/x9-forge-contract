import { z } from 'zod';
import { AgentIdSchema } from "../agent/agent-identity.js";
import { BusinessUnitLeadBirthRequestSchema } from "./business-unit-lead.js";
export const ASSET_ORIGIN_KINDS = ['email', 'archive', 'session', 'link', 'generated'];
export const AssetSha256Schema = z.string().regex(/^[0-9a-f]{64}$/);
/** Kind of a company asset (logo, brand-book, price-list...), lowercase slug. */
export const AssetTypeSchema = z.string().min(1).max(40).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const AssetIdSchema = z.string().regex(/^[A-Za-z0-9_-]{6,64}$/);
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
        entryPath: z.string().min(1).max(1024).refine((entryPath) => !entryPath.startsWith('/') && !entryPath.split('/').includes('..'), { message: 'Entry path must be relative and contain no parent segments' }),
    }),
    z.strictObject({
        kind: z.literal(ASSET_ORIGIN_KINDS[2]),
        sessionId: z.string().min(1).max(128),
        /**
         * Where a verified delivery of the session lives (1.74.0, optional: older refs carry only the session). The
         * three fields go together: `repo` and `commit` name the delivery, `path` the file inside it. A ref with
         * only some of them is not a delivery pointer and is rejected.
         */
        repo: z.string().regex(/^[A-Za-z0-9-]{1,39}\/(?!\.{1,2}$)[A-Za-z0-9_.-]{1,100}$/).optional(),
        commit: z.string().regex(/^[0-9a-f]{40}$/).optional(),
        path: z.string().min(1).max(1024).refine((path) => !path.startsWith('/') && !path.includes('\\') && !path.split('/').some((segment) => segment === '' || segment === '..' || segment === '.'), { message: 'Delivery path must be relative and contain no empty or parent segments' }).optional(),
    }).refine((origin) => (origin.repo === undefined) === (origin.commit === undefined) && (origin.repo === undefined) === (origin.path === undefined), {
        message: 'Session delivery pointer needs repo, commit and path together',
    }),
    z.strictObject({
        kind: z.literal(ASSET_ORIGIN_KINDS[3]),
        url: z.url({ protocol: /^https?$/ }).max(2048),
    }),
    z.strictObject({
        kind: z.literal(ASSET_ORIGIN_KINDS[4]),
        agentId: AgentIdSchema,
        sourceAssetIds: z.array(AssetIdSchema).max(50).optional(),
    }),
]);
/**
 * Shared reference scoped to a tenant, company and project.
 * `companyId` is the client company, `projectId` the project.
 * For a `link` origin `sha256` is the fingerprint of the URL and `sizeBytes` is 0.
 */
export const AssetRefSchema = z.strictObject({
    assetId: AssetIdSchema,
    sha256: AssetSha256Schema,
    name: z.string().min(1).max(255).regex(/^[^/\\]+$/),
    mediaType: z.string().regex(/^[a-z0-9.+-]+\/[a-z0-9.+-]+$/),
    sizeBytes: z.number().int().min(0),
    origin: AssetOriginSchema,
    tenantId: z.string().min(1),
    companyId: BusinessUnitLeadBirthRequestSchema.shape.company.shape.companyId,
    projectId: z.string().min(1).max(64),
    assetType: AssetTypeSchema.optional(),
    buSlug: z.string().min(1).max(30).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).optional(),
    createdAt: z.iso.datetime({ offset: true }),
});
//# sourceMappingURL=asset.js.map