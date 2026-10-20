"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetRefSchema = exports.AssetOriginSchema = exports.AssetSha256Schema = exports.ASSET_ORIGIN_KINDS = void 0;
const zod_1 = require("zod");
const business_unit_lead_js_1 = require("./business-unit-lead.cjs");
exports.ASSET_ORIGIN_KINDS = ['email', 'archive', 'session'];
exports.AssetSha256Schema = zod_1.z.string().regex(/^[0-9a-f]{64}$/);
/** Provenance of a company file, without embedding its contents. */
exports.AssetOriginSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({
        kind: zod_1.z.literal(exports.ASSET_ORIGIN_KINDS[0]),
        messageId: zod_1.z.string().min(1).max(512),
        attachmentName: zod_1.z.string().min(1).max(255).optional(),
    }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal(exports.ASSET_ORIGIN_KINDS[1]),
        archiveSha256: exports.AssetSha256Schema,
        entryPath: zod_1.z.string().min(1).max(1024).refine((entryPath) => !entryPath.startsWith('/') && !entryPath.split('/').includes('..'), { message: 'Entry path must be relative and contain no parent segments' }),
    }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal(exports.ASSET_ORIGIN_KINDS[2]),
        sessionId: zod_1.z.string().min(1).max(128),
    }),
]);
/** Shared reference scoped to a tenant, company and project. */
exports.AssetRefSchema = zod_1.z.strictObject({
    assetId: zod_1.z.string().regex(/^[A-Za-z0-9_-]{6,64}$/),
    sha256: exports.AssetSha256Schema,
    name: zod_1.z.string().min(1).max(255).regex(/^[^/\\]+$/),
    mediaType: zod_1.z.string().regex(/^[a-z0-9.+-]+\/[a-z0-9.+-]+$/),
    sizeBytes: zod_1.z.number().int().min(0),
    origin: exports.AssetOriginSchema,
    tenantId: zod_1.z.string().min(1),
    companyId: business_unit_lead_js_1.BusinessUnitLeadBirthRequestSchema.shape.company.shape.companyId,
    projectId: zod_1.z.string().min(1).max(64),
    createdAt: zod_1.z.iso.datetime({ offset: true }),
});
//# sourceMappingURL=asset.js.map