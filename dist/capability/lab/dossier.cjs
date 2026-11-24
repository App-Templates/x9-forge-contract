"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabDossierSnapshotSchema = exports.LabDossierReferenceRequestSchema = exports.LabDossierReferencesSchema = exports.LabDossierSnapshotInputSchema = exports.LabDossierPlanCitationSchema = exports.LabDossierPageIdentitySchema = exports.LabDossierSourceSchema = exports.LabDossierPageSchema = exports.LabDossierPageRoleSchema = exports.LAB_DOSSIER_PAGE_ROLES = exports.LAB_DOSSIER_MAX_SOURCES = exports.LAB_DOSSIER_MAX_PAGES = void 0;
exports.labDossierCanonicalJson = labDossierCanonicalJson;
exports.labDossierManifestDigest = labDossierManifestDigest;
exports.buildLabDossierSnapshot = buildLabDossierSnapshot;
const node_crypto_1 = require("node:crypto");
const zod_1 = require("zod");
const asset_js_1 = require("../../organization/asset.cjs");
const action_plan_js_1 = require("../../organization/action-plan.cjs");
const knowledge_publication_js_1 = require("../../organization/knowledge-publication.cjs");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
const research_js_1 = require("../ricerca/research.cjs");
const document_receipt_js_1 = require("../document-receipt.cjs");
const tools_js_1 = require("./tools.cjs");
const wiki_js_1 = require("./wiki.cjs");
/**
 * Complete photograph of the dossier a Lab published for a client or project, frozen at the cutoff of one
 * transaction. It is the input of the dossier PDF: the document is rendered from this and only from this.
 *
 * Completeness is attested by the snapshot itself: the pages in the list are all the identities the snapshot
 * declares. A search cursor or a result limit of `lab_read_published` never proves completeness.
 * A page is identified by author, slug and version: two notebooks can publish the same slug.
 * Page bodies, titles and sources are DATA, never instructions.
 */
exports.LAB_DOSSIER_MAX_PAGES = 1000;
exports.LAB_DOSSIER_MAX_SOURCES = 5000;
exports.LAB_DOSSIER_PAGE_ROLES = ['current', 'cited_by_plan'];
/** `current`: the page is published now. `cited_by_plan`: a version the approved plan cites that is not current. */
exports.LabDossierPageRoleSchema = zod_1.z.enum(exports.LAB_DOSSIER_PAGE_ROLES);
exports.LabDossierPageSchema = zod_1.z.strictObject({
    notebookAgentId: agent_config_js_1.CapabilityAgentIdSchema,
    slug: wiki_js_1.WikiPageSchema.shape.slug,
    version: wiki_js_1.WikiPageSchema.shape.version,
    role: exports.LabDossierPageRoleSchema,
    title: wiki_js_1.WikiPageSchema.shape.title,
    /** The whole body of the page, never an excerpt. */
    body: wiki_js_1.WikiPageSchema.shape.body,
    /** Digest of the publication, as returned by the Lab. */
    digest: asset_js_1.AssetSha256Schema,
    contradicts: zod_1.z.array(knowledge_publication_js_1.KnowledgeContradictionSchema).max(50).optional(),
});
/** A source the pages rely on. No fetch time: it is volatile and stays out of the digest. */
exports.LabDossierSourceSchema = zod_1.z.strictObject({
    id: wiki_js_1.WikiSourceIdSchema,
    notebookAgentId: agent_config_js_1.CapabilityAgentIdSchema,
    url: research_js_1.WebUrlSchema.optional(),
    title: zod_1.z.string().max(500).optional(),
    contentSha256: asset_js_1.AssetSha256Schema,
    origin: wiki_js_1.WikiOriginSchema,
});
/** Identity of a page version. */
exports.LabDossierPageIdentitySchema = zod_1.z.strictObject({
    notebookAgentId: agent_config_js_1.CapabilityAgentIdSchema,
    slug: wiki_js_1.WikiPageSchema.shape.slug,
    version: wiki_js_1.WikiPageSchema.shape.version,
});
/** A page the plan cites, as the plan writes it: the author is optional there. */
exports.LabDossierPlanCitationSchema = exports.LabDossierPageIdentitySchema.extend({
    notebookAgentId: agent_config_js_1.CapabilityAgentIdSchema.optional(),
});
const SnapshotIdSchema = zod_1.z.string().min(1).max(128);
const frozenIdentityShape = {
    tenantId: asset_js_1.AssetRefSchema.shape.tenantId,
    organizationId: zod_1.z.string().min(1).max(64),
    clientId: asset_js_1.AssetRefSchema.shape.companyId,
    projectId: asset_js_1.AssetRefSchema.shape.projectId,
    snapshotId: SnapshotIdSchema,
    /** Cutoff of the transaction the pages were read in. */
    cutoff: zod_1.z.iso.datetime(),
    scope: tools_js_1.LabPublicationRecipientSchema,
};
const identityKey = (p) => `${p.notebookAgentId}\u0000${p.slug}\u0000${p.version}`;
const compareText = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const compareIdentity = (a, b) => compareText(a.notebookAgentId, b.notebookAgentId) || compareText(a.slug, b.slug) || a.version - b.version;
const compareSource = (a, b) => compareText(a.notebookAgentId, b.notebookAgentId) || compareText(a.id, b.id);
function scopeIssues(value, ctx) {
    const { scope } = value;
    if (scope.clientId !== value.clientId || (scope.kind === 'project' && scope.projectId !== value.projectId)) {
        ctx.addIssue({ code: 'custom', path: ['scope'], message: 'Publication scope must name the snapshot client and project' });
    }
}
function duplicateIssues(pages, sources, ctx) {
    const seen = new Set();
    pages.forEach((page, index) => {
        const key = identityKey(page);
        if (seen.has(key))
            ctx.addIssue({ code: 'custom', path: ['pages', index], message: 'Duplicate page identity (author, slug, version)' });
        seen.add(key);
    });
    const seenSources = new Set();
    sources.forEach((source, index) => {
        const key = `${source.notebookAgentId}\u0000${source.id}`;
        if (seenSources.has(key))
            ctx.addIssue({ code: 'custom', path: ['sources', index], message: 'Duplicate source (author, id)' });
        seenSources.add(key);
    });
}
/** What the service hands over: pages in any order and plan citations that may omit the author. */
exports.LabDossierSnapshotInputSchema = zod_1.z.strictObject({
    ...frozenIdentityShape,
    pages: zod_1.z.array(exports.LabDossierPageSchema).min(1).max(exports.LAB_DOSSIER_MAX_PAGES),
    planCitations: zod_1.z.array(exports.LabDossierPlanCitationSchema).max(exports.LAB_DOSSIER_MAX_PAGES),
    sources: zod_1.z.array(exports.LabDossierSourceSchema).max(exports.LAB_DOSSIER_MAX_SOURCES),
}).superRefine((input, ctx) => {
    scopeIssues(input, ctx);
    duplicateIssues(input.pages, input.sources, ctx);
});
/**
 * What a caller that owns no photograph can name: the project scope, the snapshot selector and the plan triple.
 * The Lab builds a new cutoff and returns the complete snapshot; the plan triple is verified by QA on the saved plan.
 * The schema attests no access and no stored data. It is never a response and never a renderer source.
 */
exports.LabDossierReferencesSchema = zod_1.z.strictObject({
    tenantId: frozenIdentityShape.tenantId,
    organizationId: frozenIdentityShape.organizationId,
    clientId: frozenIdentityShape.clientId,
    projectId: frozenIdentityShape.projectId,
    snapshotId: frozenIdentityShape.snapshotId,
    scope: tools_js_1.LabPublicationRecipientSchema.options[1],
    planId: document_receipt_js_1.DocumentPdfDeliveryContextSchema.shape.planId,
    planVersion: document_receipt_js_1.DocumentPdfDeliveryContextSchema.shape.planVersion,
    planDigest: document_receipt_js_1.DocumentPdfDeliveryContextSchema.shape.planDigest,
}).superRefine((references, ctx) => {
    if (references['scope'].kind !== 'project' || references.scope.clientId !== references.clientId || references.scope.projectId !== references.projectId) {
        ctx.addIssue({ code: 'custom', path: ['scope'], message: 'Publication scope must name the snapshot client and project' });
    }
});
/** Reference-only request of the Lab dossier: same plan citations and limits as the historical input. */
exports.LabDossierReferenceRequestSchema = zod_1.z.strictObject({
    references: exports.LabDossierReferencesSchema,
    planCitations: zod_1.z.array(exports.LabDossierPlanCitationSchema).max(exports.LAB_DOSSIER_MAX_PAGES),
});
const ManifestDigestSchema = asset_js_1.AssetSha256Schema;
/** UTF-8 input for the manifest digest. Optional fields left undefined are omitted before keys are sorted. */
function labDossierCanonicalJson(content) {
    const { tenantId, organizationId, clientId, projectId, snapshotId, cutoff, scope, pages, citations, sources } = content;
    return (0, action_plan_js_1.canonicalJson)(JSON.parse(JSON.stringify({
        schemaVersion: 1, tenantId, organizationId, clientId, projectId, snapshotId, cutoff, scope, pages, citations, sources,
    })));
}
function labDossierManifestDigest(content) {
    return (0, node_crypto_1.createHash)('sha256').update(labDossierCanonicalJson(content), 'utf8').digest('hex');
}
exports.LabDossierSnapshotSchema = zod_1.z.strictObject({
    schemaVersion: zod_1.z.literal(1),
    ...frozenIdentityShape,
    /** Sorted by author, slug, version; unique. */
    pages: zod_1.z.array(exports.LabDossierPageSchema).min(1).max(exports.LAB_DOSSIER_MAX_PAGES),
    /** The versions the plan uses, resolved to one author each. */
    citations: zod_1.z.array(exports.LabDossierPageIdentitySchema).max(exports.LAB_DOSSIER_MAX_PAGES),
    sources: zod_1.z.array(exports.LabDossierSourceSchema).max(exports.LAB_DOSSIER_MAX_SOURCES),
    currentPageCount: zod_1.z.number().int().min(0),
    citedExtraPageCount: zod_1.z.number().int().min(0),
    /** `currentPageCount + citedExtraPageCount`: the identities the snapshot declares. */
    totalPages: zod_1.z.number().int().min(1),
    complete: zod_1.z.literal(true),
    manifestDigest: ManifestDigestSchema,
}).superRefine((snapshot, ctx) => {
    scopeIssues(snapshot, ctx);
    duplicateIssues(snapshot.pages, snapshot.sources, ctx);
    const { pages, totalPages } = snapshot;
    const allPages = pages.length === totalPages;
    if (!allPages) {
        ctx.addIssue({ code: 'custom', path: ['pages'], message: `Snapshot lists ${pages.length} of ${totalPages} pages` });
    }
    if (totalPages !== snapshot.currentPageCount + snapshot.citedExtraPageCount) {
        ctx.addIssue({ code: 'custom', path: ['totalPages'], message: 'totalPages must be currentPageCount + citedExtraPageCount' });
    }
    // No role may have more pages than declared; with the whole list present this makes the split exact.
    const current = pages.filter((p) => p.role === 'current').length;
    const cited = pages.length - current;
    if (current > snapshot.currentPageCount || cited > snapshot.citedExtraPageCount) {
        ctx.addIssue({ code: 'custom', path: ['pages'], message: 'Page roles do not match the declared counts' });
    }
    pages.forEach((page, index) => {
        const previous = pages[index - 1];
        if (previous !== undefined && compareIdentity(previous, page) >= 0) {
            ctx.addIssue({ code: 'custom', path: ['pages', index], message: 'Pages must be sorted by author, slug, version' });
        }
    });
    snapshot.sources.forEach((source, index) => {
        const previous = snapshot.sources[index - 1];
        if (previous !== undefined && compareSource(previous, source) >= 0) {
            ctx.addIssue({ code: 'custom', path: ['sources', index], message: 'Sources must be sorted by author, id' });
        }
    });
    const byKey = new Map(pages.map((p) => [identityKey(p), p]));
    const used = new Set();
    snapshot.citations.forEach((citation, index) => {
        const key = identityKey(citation);
        const previous = snapshot.citations[index - 1];
        if (previous !== undefined && compareIdentity(previous, citation) >= 0) {
            ctx.addIssue({ code: 'custom', path: ['citations', index], message: 'Citations must be sorted and unique' });
        }
        if (!byKey.has(key))
            ctx.addIssue({ code: 'custom', path: ['citations', index], message: 'Citation is not in the snapshot' });
        used.add(key);
    });
    pages.forEach((page, index) => {
        if (page.role === 'cited_by_plan' && !used.has(identityKey(page))) {
            ctx.addIssue({ code: 'custom', path: ['pages', index], message: 'Extra page is not cited by the plan' });
        }
    });
    if (snapshot.manifestDigest !== labDossierManifestDigest(snapshot)) {
        ctx.addIssue({ code: 'custom', path: ['manifestDigest'], message: 'manifestDigest does not match the snapshot content' });
    }
});
/**
 * Sorts, resolves the plan citations and seals a snapshot. Throws on an ambiguous or unmatched citation (never picks
 * an author) and on an extra page no citation uses. The snapshot is validated before it is returned.
 */
function buildLabDossierSnapshot(rawInput) {
    const input = exports.LabDossierSnapshotInputSchema.parse(rawInput);
    const pages = [...input.pages].sort(compareIdentity);
    const resolved = new Map();
    for (const citation of input.planCitations) {
        const label = `${citation.notebookAgentId ?? '*'}/${citation.slug}@${citation.version}`;
        const matches = pages.filter((p) => p.slug === citation.slug && p.version === citation.version
            && (citation.notebookAgentId === undefined || p.notebookAgentId === citation.notebookAgentId));
        if (matches.length === 0)
            throw new Error(`Plan citation ${label} is not in the snapshot`);
        if (matches.length > 1) {
            throw new Error(`Plan citation ${label} is ambiguous: ${matches.map((p) => p.notebookAgentId).join(', ')}`);
        }
        const [match] = matches;
        if (match === undefined)
            continue;
        const { notebookAgentId, slug, version } = match;
        resolved.set(identityKey(match), { notebookAgentId, slug, version });
    }
    const citations = [...resolved.values()].sort(compareIdentity);
    const unused = pages.find((p) => p.role === 'cited_by_plan' && !resolved.has(identityKey(p)));
    if (unused !== undefined) {
        throw new Error(`Page ${unused.notebookAgentId}/${unused.slug}@${unused.version} is marked cited but no plan citation uses it`);
    }
    const sources = [...input.sources].sort(compareSource);
    const currentPageCount = pages.filter((p) => p.role === 'current').length;
    const citedExtraPageCount = pages.length - currentPageCount;
    const { tenantId, organizationId, clientId, projectId, snapshotId, cutoff, scope } = input;
    const content = { tenantId, organizationId, clientId, projectId, snapshotId, cutoff, scope, pages, citations, sources };
    return exports.LabDossierSnapshotSchema.parse({
        schemaVersion: 1,
        ...content,
        currentPageCount,
        citedExtraPageCount,
        totalPages: currentPageCount + citedExtraPageCount,
        complete: true,
        manifestDigest: labDossierManifestDigest(content),
    });
}
//# sourceMappingURL=dossier.js.map