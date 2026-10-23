"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyMapEntrySchema = exports.CompanyMapSourceSchema = exports.CompanyMapEntryKindSchema = exports.COMPANY_MAP_ENTRY_KINDS = exports.CompanyMapLevelSchema = exports.COMPANY_MAP_LEVELS = void 0;
const zod_1 = require("zod");
const asset_js_1 = require("./asset.cjs");
const decision_request_js_1 = require("./decision-request.cjs");
const SlugSchema = (min, max) => zod_1.z.string().min(min).max(max).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
/** Levels of the client company map: client company → project → business unit. */
exports.COMPANY_MAP_LEVELS = ['client', 'project', 'business_unit'];
exports.CompanyMapLevelSchema = zod_1.z.enum(exports.COMPANY_MAP_LEVELS);
/** Entry kinds of the map; only the referent exists for now. */
exports.COMPANY_MAP_ENTRY_KINDS = ['referent'];
exports.CompanyMapEntryKindSchema = zod_1.z.enum(exports.COMPANY_MAP_ENTRY_KINDS);
/** An entry comes only from a seed or from an approved decision, never from a model. */
exports.CompanyMapSourceSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({ kind: zod_1.z.literal('seed') }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('decision'),
        requestId: decision_request_js_1.DecisionRequestIdSchema,
        planVersion: zod_1.z.number().int().min(1),
    }),
]);
/** Versioned «referent» entry of the client company map. */
exports.CompanyMapEntrySchema = zod_1.z
    .strictObject({
    tenantId: asset_js_1.AssetRefSchema.shape.tenantId,
    organizationId: zod_1.z.string().min(1).max(64),
    clientId: asset_js_1.AssetRefSchema.shape.companyId,
    projectId: zod_1.z.string().min(1).max(64).optional(),
    buSlug: SlugSchema(1, 30).optional(),
    level: exports.CompanyMapLevelSchema,
    kind: zod_1.z.literal('referent'),
    personRef: SlugSchema(1, 40),
    name: zod_1.z.string().min(1).max(120),
    role: zod_1.z.string().min(1).max(120),
    email: zod_1.z.email(),
    source: exports.CompanyMapSourceSchema,
    confirmedAt: zod_1.z.iso.datetime({ offset: true }),
    supersedes: zod_1.z.number().int().min(1).optional(),
    version: zod_1.z.number().int().min(1),
    digest: asset_js_1.AssetSha256Schema,
})
    .superRefine((entry, ctx) => {
    const wantsProject = entry.level !== 'client';
    const wantsBu = entry.level === 'business_unit';
    if (wantsProject !== (entry.projectId !== undefined)) {
        ctx.addIssue({
            code: 'custom',
            message: wantsProject ? 'projectId is required for this level' : 'projectId is not allowed at client level',
            path: ['projectId'],
        });
    }
    if (wantsBu !== (entry.buSlug !== undefined)) {
        ctx.addIssue({
            code: 'custom',
            message: wantsBu ? 'buSlug is required at business_unit level' : 'buSlug is only allowed at business_unit level',
            path: ['buSlug'],
        });
    }
    if (entry.supersedes !== undefined && entry.supersedes >= entry.version) {
        ctx.addIssue({ code: 'custom', message: 'supersedes must be lower than version', path: ['supersedes'] });
    }
});
//# sourceMappingURL=company-map.js.map