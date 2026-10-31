"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPANY_MAP_CONFIRM_OPTIONS = exports.CompanyMapAnyEntrySchema = exports.CompanyMapAccessEntrySchema = exports.CompanyMapAssetEntrySchema = exports.CompanyMapResponsibilityEntrySchema = exports.CompanyMapPersonEntrySchema = exports.CompanyMapEntrySchema = exports.CompanyMapAccessFieldsSchema = exports.CompanyMapAssetFieldsSchema = exports.CompanyMapResponsibilityFieldsSchema = exports.CompanyMapPersonFieldsSchema = exports.CompanyMapReferentFieldsSchema = exports.CompanyMapConfirmTargetSchema = exports.CompanyMapVersionFieldsSchema = exports.CompanyMapScopeFieldsSchema = exports.CompanyMapSourceSchema = exports.CompanyMapEntryKindSchema = exports.COMPANY_MAP_ENTRY_KINDS = exports.CompanyMapLevelSchema = exports.COMPANY_MAP_LEVELS = void 0;
exports.checkCompanyMapLevelScope = checkCompanyMapLevelScope;
exports.companyMapConfirmationSubject = companyMapConfirmationSubject;
exports.companyMapEntryKey = companyMapEntryKey;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
const asset_js_1 = require("./asset.cjs");
const decision_request_js_1 = require("./decision-request.cjs");
const SlugSchema = (min, max) => zod_1.z.string().min(min).max(max).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
/** Levels of the client company map: client company → project → business unit. */
exports.COMPANY_MAP_LEVELS = ['client', 'project', 'business_unit'];
exports.CompanyMapLevelSchema = zod_1.z.enum(exports.COMPANY_MAP_LEVELS);
/** Entry kinds of the map: referent (F1B-03), person, responsibility, asset and access (F3B-01). */
exports.COMPANY_MAP_ENTRY_KINDS = ['referent', 'person', 'responsibility', 'asset', 'access'];
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
/** Scope and provenance fields shared by every entry kind. */
exports.CompanyMapScopeFieldsSchema = zod_1.z.strictObject({
    tenantId: asset_js_1.AssetRefSchema.shape.tenantId,
    organizationId: zod_1.z.string().min(1).max(64),
    clientId: asset_js_1.AssetRefSchema.shape.companyId,
    projectId: zod_1.z.string().min(1).max(64).optional(),
    buSlug: SlugSchema(1, 30).optional(),
    level: exports.CompanyMapLevelSchema,
});
/** Version fields assigned by the memory when the entry is stored. */
exports.CompanyMapVersionFieldsSchema = zod_1.z.strictObject({
    source: exports.CompanyMapSourceSchema,
    confirmedAt: zod_1.z.iso.datetime({ offset: true }),
    supersedes: zod_1.z.number().int().min(1).optional(),
    version: zod_1.z.number().int().min(1),
    digest: asset_js_1.AssetSha256Schema,
});
/** Level rules shared by entries, write bodies and queries. */
function checkCompanyMapLevelScope(scope, ctx) {
    const wantsProject = scope.level !== 'client';
    const wantsBu = scope.level === 'business_unit';
    if (wantsProject !== (scope.projectId !== undefined)) {
        ctx.addIssue({
            code: 'custom',
            message: wantsProject ? 'projectId is required for this level' : 'projectId is not allowed at client level',
            path: ['projectId'],
        });
    }
    if (wantsBu !== (scope.buSlug !== undefined)) {
        ctx.addIssue({
            code: 'custom',
            message: wantsBu ? 'buSlug is required at business_unit level' : 'buSlug is only allowed at business_unit level',
            path: ['buSlug'],
        });
    }
}
/** Entry selected for a confirmation request, within its level and kind. */
exports.CompanyMapConfirmTargetSchema = zod_1.z.strictObject({
    level: exports.CompanyMapLevelSchema,
    projectId: exports.CompanyMapScopeFieldsSchema.shape.projectId,
    buSlug: exports.CompanyMapScopeFieldsSchema.shape.buSlug,
    kind: exports.CompanyMapEntryKindSchema,
    entryRef: zod_1.z.string().min(1).max(200),
}).superRefine(checkCompanyMapLevelScope);
function checkEntry(entry, ctx) {
    checkCompanyMapLevelScope(entry, ctx);
    if (entry.supersedes !== undefined && entry.supersedes >= entry.version) {
        ctx.addIssue({ code: 'custom', message: 'supersedes must be lower than version', path: ['supersedes'] });
    }
}
/** Fields of the «referent» entry (F1B-03). */
exports.CompanyMapReferentFieldsSchema = zod_1.z.strictObject({
    kind: zod_1.z.literal('referent'),
    personRef: SlugSchema(1, 40),
    name: zod_1.z.string().min(1).max(120),
    role: zod_1.z.string().min(1).max(120),
    email: zod_1.z.email(),
});
/** Fields of a person of the client company. */
exports.CompanyMapPersonFieldsSchema = zod_1.z.strictObject({
    kind: zod_1.z.literal('person'),
    personRef: SlugSchema(1, 40),
    name: zod_1.z.string().min(1).max(120),
    role: zod_1.z.string().min(1).max(120).optional(),
    email: zod_1.z.email().optional(),
});
/** What a person answers for. */
exports.CompanyMapResponsibilityFieldsSchema = zod_1.z.strictObject({
    kind: zod_1.z.literal('responsibility'),
    personRef: SlugSchema(1, 40),
    responsibility: zod_1.z.string().min(1).max(500),
});
/** Reference to a company asset with its type and version (never its content). */
exports.CompanyMapAssetFieldsSchema = zod_1.z.strictObject({
    kind: zod_1.z.literal('asset'),
    asset: zod_1.z.strictObject({
        assetId: asset_js_1.AssetRefSchema.shape.assetId,
        assetType: asset_js_1.AssetTypeSchema,
        version: zod_1.z.number().int().min(1),
        sha256: asset_js_1.AssetSha256Schema,
    }),
});
/** Access as a reference only: provider, resource and the agent holding the credential in the Vault. No value. */
exports.CompanyMapAccessFieldsSchema = zod_1.z.strictObject({
    kind: zod_1.z.literal('access'),
    accessRef: SlugSchema(1, 40),
    provider: SlugSchema(1, 40),
    resource: zod_1.z.string().min(1).max(200),
    holderAgentId: agent_identity_js_1.AgentIdSchema,
});
/** Versioned «referent» entry of the client company map. */
exports.CompanyMapEntrySchema = zod_1.z
    .strictObject({
    ...exports.CompanyMapScopeFieldsSchema.shape,
    ...exports.CompanyMapReferentFieldsSchema.shape,
    ...exports.CompanyMapVersionFieldsSchema.shape,
})
    .superRefine(checkEntry);
exports.CompanyMapPersonEntrySchema = zod_1.z
    .strictObject({
    ...exports.CompanyMapScopeFieldsSchema.shape,
    ...exports.CompanyMapPersonFieldsSchema.shape,
    ...exports.CompanyMapVersionFieldsSchema.shape,
})
    .superRefine(checkEntry);
exports.CompanyMapResponsibilityEntrySchema = zod_1.z
    .strictObject({
    ...exports.CompanyMapScopeFieldsSchema.shape,
    ...exports.CompanyMapResponsibilityFieldsSchema.shape,
    ...exports.CompanyMapVersionFieldsSchema.shape,
})
    .superRefine(checkEntry);
exports.CompanyMapAssetEntrySchema = zod_1.z
    .strictObject({
    ...exports.CompanyMapScopeFieldsSchema.shape,
    ...exports.CompanyMapAssetFieldsSchema.shape,
    ...exports.CompanyMapVersionFieldsSchema.shape,
})
    .superRefine(checkEntry);
exports.CompanyMapAccessEntrySchema = zod_1.z
    .strictObject({
    ...exports.CompanyMapScopeFieldsSchema.shape,
    ...exports.CompanyMapAccessFieldsSchema.shape,
    ...exports.CompanyMapVersionFieldsSchema.shape,
})
    .superRefine(checkEntry);
/** Any entry of the map, by kind. */
exports.CompanyMapAnyEntrySchema = zod_1.z.discriminatedUnion('kind', [
    exports.CompanyMapEntrySchema,
    exports.CompanyMapPersonEntrySchema,
    exports.CompanyMapResponsibilityEntrySchema,
    exports.CompanyMapAssetEntrySchema,
    exports.CompanyMapAccessEntrySchema,
]);
/** Owner choices when confirming an existing company map entry. */
exports.COMPANY_MAP_CONFIRM_OPTIONS = [
    { optionId: 'confermo', label: 'Confermo' },
    { optionId: 'e-cambiato', label: 'È cambiato' },
];
/** Bind a confirmation to the exact entry version and digest the owner read. */
function companyMapConfirmationSubject(entry) {
    return decision_request_js_1.DecisionSubjectSchema.parse({
        kind: 'confirmation',
        planId: 'map-' + entry.digest.slice(0, 40),
        planVersion: entry.version,
        digest: entry.digest,
    });
}
/** Key of an entry inside its level and kind: the person, the asset or the access. */
function companyMapEntryKey(entry) {
    switch (entry.kind) {
        case 'asset':
            return entry.asset.assetId;
        case 'access':
            return entry.accessRef;
        default:
            return entry.personRef;
    }
}
//# sourceMappingURL=company-map.js.map