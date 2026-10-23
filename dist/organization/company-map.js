import { z } from 'zod';
import { AgentIdSchema } from "../agent/agent-identity.js";
import { AssetRefSchema, AssetSha256Schema, AssetTypeSchema } from "./asset.js";
import { DecisionRequestIdSchema } from "./decision-request.js";
const SlugSchema = (min, max) => z.string().min(min).max(max).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
/** Levels of the client company map: client company → project → business unit. */
export const COMPANY_MAP_LEVELS = ['client', 'project', 'business_unit'];
export const CompanyMapLevelSchema = z.enum(COMPANY_MAP_LEVELS);
/** Entry kinds of the map: referent (F1B-03), person, responsibility, asset and access (F3B-01). */
export const COMPANY_MAP_ENTRY_KINDS = ['referent', 'person', 'responsibility', 'asset', 'access'];
export const CompanyMapEntryKindSchema = z.enum(COMPANY_MAP_ENTRY_KINDS);
/** An entry comes only from a seed or from an approved decision, never from a model. */
export const CompanyMapSourceSchema = z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('seed') }),
    z.strictObject({
        kind: z.literal('decision'),
        requestId: DecisionRequestIdSchema,
        planVersion: z.number().int().min(1),
    }),
]);
/** Scope and provenance fields shared by every entry kind. */
export const CompanyMapScopeFieldsSchema = z.strictObject({
    tenantId: AssetRefSchema.shape.tenantId,
    organizationId: z.string().min(1).max(64),
    clientId: AssetRefSchema.shape.companyId,
    projectId: z.string().min(1).max(64).optional(),
    buSlug: SlugSchema(1, 30).optional(),
    level: CompanyMapLevelSchema,
});
/** Version fields assigned by the memory when the entry is stored. */
export const CompanyMapVersionFieldsSchema = z.strictObject({
    source: CompanyMapSourceSchema,
    confirmedAt: z.iso.datetime({ offset: true }),
    supersedes: z.number().int().min(1).optional(),
    version: z.number().int().min(1),
    digest: AssetSha256Schema,
});
/** Level rules shared by entries, write bodies and queries. */
export function checkCompanyMapLevelScope(scope, ctx) {
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
function checkEntry(entry, ctx) {
    checkCompanyMapLevelScope(entry, ctx);
    if (entry.supersedes !== undefined && entry.supersedes >= entry.version) {
        ctx.addIssue({ code: 'custom', message: 'supersedes must be lower than version', path: ['supersedes'] });
    }
}
/** Fields of the «referent» entry (F1B-03). */
export const CompanyMapReferentFieldsSchema = z.strictObject({
    kind: z.literal('referent'),
    personRef: SlugSchema(1, 40),
    name: z.string().min(1).max(120),
    role: z.string().min(1).max(120),
    email: z.email(),
});
/** Fields of a person of the client company. */
export const CompanyMapPersonFieldsSchema = z.strictObject({
    kind: z.literal('person'),
    personRef: SlugSchema(1, 40),
    name: z.string().min(1).max(120),
    role: z.string().min(1).max(120).optional(),
    email: z.email().optional(),
});
/** What a person answers for. */
export const CompanyMapResponsibilityFieldsSchema = z.strictObject({
    kind: z.literal('responsibility'),
    personRef: SlugSchema(1, 40),
    responsibility: z.string().min(1).max(500),
});
/** Reference to a company asset with its type and version (never its content). */
export const CompanyMapAssetFieldsSchema = z.strictObject({
    kind: z.literal('asset'),
    asset: z.strictObject({
        assetId: AssetRefSchema.shape.assetId,
        assetType: AssetTypeSchema,
        version: z.number().int().min(1),
        sha256: AssetSha256Schema,
    }),
});
/** Access as a reference only: provider, resource and the agent holding the credential in the Vault. No value. */
export const CompanyMapAccessFieldsSchema = z.strictObject({
    kind: z.literal('access'),
    accessRef: SlugSchema(1, 40),
    provider: SlugSchema(1, 40),
    resource: z.string().min(1).max(200),
    holderAgentId: AgentIdSchema,
});
/** Versioned «referent» entry of the client company map. */
export const CompanyMapEntrySchema = z
    .strictObject({
    ...CompanyMapScopeFieldsSchema.shape,
    ...CompanyMapReferentFieldsSchema.shape,
    ...CompanyMapVersionFieldsSchema.shape,
})
    .superRefine(checkEntry);
export const CompanyMapPersonEntrySchema = z
    .strictObject({
    ...CompanyMapScopeFieldsSchema.shape,
    ...CompanyMapPersonFieldsSchema.shape,
    ...CompanyMapVersionFieldsSchema.shape,
})
    .superRefine(checkEntry);
export const CompanyMapResponsibilityEntrySchema = z
    .strictObject({
    ...CompanyMapScopeFieldsSchema.shape,
    ...CompanyMapResponsibilityFieldsSchema.shape,
    ...CompanyMapVersionFieldsSchema.shape,
})
    .superRefine(checkEntry);
export const CompanyMapAssetEntrySchema = z
    .strictObject({
    ...CompanyMapScopeFieldsSchema.shape,
    ...CompanyMapAssetFieldsSchema.shape,
    ...CompanyMapVersionFieldsSchema.shape,
})
    .superRefine(checkEntry);
export const CompanyMapAccessEntrySchema = z
    .strictObject({
    ...CompanyMapScopeFieldsSchema.shape,
    ...CompanyMapAccessFieldsSchema.shape,
    ...CompanyMapVersionFieldsSchema.shape,
})
    .superRefine(checkEntry);
/** Any entry of the map, by kind. */
export const CompanyMapAnyEntrySchema = z.discriminatedUnion('kind', [
    CompanyMapEntrySchema,
    CompanyMapPersonEntrySchema,
    CompanyMapResponsibilityEntrySchema,
    CompanyMapAssetEntrySchema,
    CompanyMapAccessEntrySchema,
]);
/** Key of an entry inside its level and kind: the person, the asset or the access. */
export function companyMapEntryKey(entry) {
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