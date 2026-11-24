import { z } from 'zod';
import { AgentIdSchema } from "../agent/agent-identity.js";
import { AssetRefSchema, AssetSha256Schema, AssetTypeSchema } from "./asset.js";
import { ConfirmationSetDecisionSubjectSchema, DecisionRequestIdSchema, DecisionSubjectSchema, confirmationSetDigest, } from "./decision-request.js";
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
        // Decision subjects reuse map schemas; resolve the identifier after both modules initialize.
        requestId: z.lazy(() => DecisionRequestIdSchema),
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
/** Entry selected for a confirmation request, within its level and kind. */
export const CompanyMapConfirmTargetSchema = z.strictObject({
    level: CompanyMapLevelSchema,
    projectId: CompanyMapScopeFieldsSchema.shape.projectId,
    buSlug: CompanyMapScopeFieldsSchema.shape.buSlug,
    kind: CompanyMapEntryKindSchema,
    entryRef: z.string().min(1).max(200),
}).superRefine(checkCompanyMapLevelScope);
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
/** Owner choices when confirming an existing company map entry. */
export const COMPANY_MAP_CONFIRM_OPTIONS = [
    { optionId: 'confermo', label: 'Confermo' },
    { optionId: 'e-cambiato', label: 'È cambiato' },
];
/** Bind a confirmation to the exact entry version and digest the owner read. */
export function companyMapConfirmationSubject(entry) {
    return DecisionSubjectSchema.parse({
        kind: 'confirmation',
        planId: 'map-' + entry.digest.slice(0, 40),
        planVersion: entry.version,
        digest: entry.digest,
    });
}
/** Bind one owner confirmation to the current entries of a single client company. */
export function companyMapConfirmationSetSubject(entries) {
    const clientId = entries[0]?.clientId;
    if (entries.some((entry) => entry.clientId !== clientId)) {
        throw new Error('Confirmation set entries must belong to the same client');
    }
    const targets = entries.map((entry) => ({
        level: entry.level,
        ...(entry.projectId !== undefined ? { projectId: entry.projectId } : {}),
        ...(entry.buSlug !== undefined ? { buSlug: entry.buSlug } : {}),
        kind: entry.kind,
        entryRef: companyMapEntryKey(entry),
        entryVersion: entry.version,
        entryDigest: entry.digest,
    }));
    const digest = confirmationSetDigest(targets);
    return ConfirmationSetDecisionSubjectSchema.parse({
        kind: 'confirmation_set', planId: 'mapset-' + digest.slice(0, 40), planVersion: 1,
        digest, clientId, entries: targets,
    });
}
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
/** Refusal codes of the referent lookup. */
export const REFERENT_FOR_UNIT_REFUSALS = ['referent_not_in_map', 'referent_superseded'];
/** Stable content identity for flat referent entries, excluding storage and confirmation metadata. */
function referentContentKey(entry) {
    return JSON.stringify(Object.entries(entry)
        .filter(([key]) => key !== 'version' && key !== 'supersedes' && key !== 'digest')
        .filter(([key]) => key !== 'source' && key !== 'confirmedAt')
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0)));
}
/**
 * One rule to find the referent of a unit: business unit level, then project, then client.
 * The first level with a matching entry wins; within it the highest version. Never crosses
 * tenant, organization, client or project. Entries may include history: a different pointed
 * version must exist at the same full key and have unchanged content. Success returns the current entry.
 */
export function referentForUnit(input) {
    const { entries, scope, referent } = input;
    const sameReferent = entries.filter((entry) => entry.tenantId === scope.tenantId &&
        entry.organizationId === scope.organizationId &&
        entry.clientId === scope.clientId &&
        entry.personRef === referent.personRef);
    const levels = [
        ['business_unit', (e) => e.level === 'business_unit' && e.projectId === scope.projectId && e.buSlug === scope.buSlug],
        ['project', (e) => e.level === 'project' && e.projectId === scope.projectId],
        ['client', (e) => e.level === 'client'],
    ];
    for (const [level, matches] of levels) {
        const found = sameReferent.filter(matches);
        if (found.length === 0)
            continue;
        const entry = found.reduce((best, candidate) => (candidate.version > best.version ? candidate : best));
        if (referent.entryVersion !== undefined && referent.entryVersion !== entry.version) {
            const pointed = found.find((candidate) => candidate.version === referent.entryVersion &&
                candidate.kind === entry.kind &&
                candidate.projectId === entry.projectId &&
                candidate.buSlug === entry.buSlug &&
                companyMapEntryKey(candidate) === companyMapEntryKey(entry));
            if (pointed === undefined || referentContentKey(pointed) !== referentContentKey(entry)) {
                return { ok: false, code: 'referent_superseded' };
            }
        }
        return { ok: true, entry, level };
    }
    return { ok: false, code: 'referent_not_in_map' };
}
const ConfirmedReferentScopeSchema = z
    .strictObject({
    level: CompanyMapLevelSchema,
    projectId: CompanyMapScopeFieldsSchema.shape.projectId,
    buSlug: CompanyMapScopeFieldsSchema.shape.buSlug,
})
    .superRefine(checkCompanyMapLevelScope);
/**
 * Where a NEW referent confirmation is written. A client-level source confirmed inside a project
 * goes to that project; without a project it stays at client level. Project and business unit
 * sources keep their scope and must belong to the confirmation project. Decides the write scope
 * only: the source entry, its content and its digest are never touched.
 */
export function companyMapConfirmedReferentScope(scope, confirmationProjectId) {
    const source = ConfirmedReferentScopeSchema.parse({
        level: scope.level,
        ...(scope.projectId !== undefined ? { projectId: scope.projectId } : {}),
        ...(scope.buSlug !== undefined ? { buSlug: scope.buSlug } : {}),
    });
    if (confirmationProjectId === undefined)
        return source;
    const projectId = CompanyMapScopeFieldsSchema.shape.projectId.unwrap().parse(confirmationProjectId);
    if (source.level === 'client') {
        return { level: 'project', projectId: confirmationProjectId };
    }
    if (source.projectId !== projectId) {
        throw new Error('Confirmation project differs from the project of the source entry');
    }
    return source;
}
/**
 * Referents of a project: per person the project entry of that project, else the client entry.
 * The highest version is chosen only within the same level and key; a client version is never
 * compared with a project version. Other tenants, organizations, clients, projects and business
 * units are excluded. Returns the original entries sorted by personRef.
 */
export function companyMapReferentsForProject(input) {
    const { entries, scope } = input;
    const priority = ['project', 'client'];
    const inCompany = entries.filter((entry) => entry.tenantId === scope.tenantId &&
        entry.organizationId === scope.organizationId &&
        entry.clientId === scope.clientId &&
        (entry.level === 'client' || (entry.level === 'project' && entry.projectId === scope.projectId)));
    const personRefs = [...new Set(inCompany.map((entry) => entry.personRef))].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const result = [];
    for (const personRef of personRefs) {
        for (const level of priority) {
            const found = inCompany.filter((entry) => entry.personRef === personRef && entry.level === level);
            if (found.length === 0)
                continue;
            result.push(found.reduce((best, candidate) => (candidate.version > best.version ? candidate : best)));
            break;
        }
    }
    return result;
}
/** Refusal codes of the delivery referent lookup (one per cause). */
export const DELIVERY_REFERENT_REFUSALS = [
    'delivery_referent_missing',
    'delivery_referent_several_addresses',
    'delivery_referent_address_differs',
];
/** Comparison key of a referent address: trimmed and lowercased. */
export function referentAddressKey(email) {
    return email.trim().toLowerCase();
}
/**
 * One rule to find the address a delivery goes to. The first level with at least one row
 * decides; its rows are counted by distinct address, not by row. Pure: reads and writes nothing.
 */
export function deliveryReferentAddress(input) {
    const decisive = input.levels.find((candidate) => candidate.entries.length > 0);
    if (decisive === undefined)
        return { ok: false, code: 'delivery_referent_missing' };
    const addresses = new Set(decisive.entries.map((entry) => referentAddressKey(entry.email)));
    if (addresses.size > 1)
        return { ok: false, code: 'delivery_referent_several_addresses' };
    const [email] = [...addresses];
    if (input.requestedAddress !== undefined && referentAddressKey(input.requestedAddress) !== email) {
        return { ok: false, code: 'delivery_referent_address_differs' };
    }
    return { ok: true, email, level: decisive.level, personRefs: decisive.entries.map((entry) => entry.personRef) };
}
//# sourceMappingURL=company-map.js.map