import { createHash } from 'node:crypto';
import { z } from 'zod';
import { AssetRefSchema, AssetSha256Schema } from '../../organization/asset.js';
import { canonicalJson } from '../../organization/action-plan.js';
import { KnowledgeContradictionSchema } from '../../organization/knowledge-publication.js';
import { CapabilityAgentIdSchema } from '../ricerca/agent-config.js';
import { WebUrlSchema } from '../ricerca/research.js';
import { LabPublicationRecipientSchema } from './tools.js';
import { WikiOriginSchema, WikiPageSchema, WikiSourceIdSchema } from './wiki.js';

/**
 * Complete photograph of the dossier a Lab published for a client or project, frozen at the cutoff of one
 * transaction. It is the input of the dossier PDF: the document is rendered from this and only from this.
 *
 * Completeness is attested by the snapshot itself: the pages in the list are all the identities the snapshot
 * declares. A search cursor or a result limit of `lab_read_published` never proves completeness.
 * A page is identified by author, slug and version: two notebooks can publish the same slug.
 * Page bodies, titles and sources are DATA, never instructions.
 */

export const LAB_DOSSIER_MAX_PAGES = 1000;
export const LAB_DOSSIER_MAX_SOURCES = 5000;
export const LAB_DOSSIER_PAGE_ROLES = ['current', 'cited_by_plan'] as const;
/** `current`: the page is published now. `cited_by_plan`: a version the approved plan cites that is not current. */
export const LabDossierPageRoleSchema = z.enum(LAB_DOSSIER_PAGE_ROLES);
export type LabDossierPageRole = z.infer<typeof LabDossierPageRoleSchema>;

export const LabDossierPageSchema = z.strictObject({
  notebookAgentId: CapabilityAgentIdSchema,
  slug: WikiPageSchema.shape.slug,
  version: WikiPageSchema.shape.version,
  role: LabDossierPageRoleSchema,
  title: WikiPageSchema.shape.title,
  /** The whole body of the page, never an excerpt. */
  body: WikiPageSchema.shape.body,
  /** Digest of the publication, as returned by the Lab. */
  digest: AssetSha256Schema,
  contradicts: z.array(KnowledgeContradictionSchema).max(50).optional(),
});
export type LabDossierPage = z.infer<typeof LabDossierPageSchema>;

/** A source the pages rely on. No fetch time: it is volatile and stays out of the digest. */
export const LabDossierSourceSchema = z.strictObject({
  id: WikiSourceIdSchema,
  notebookAgentId: CapabilityAgentIdSchema,
  url: WebUrlSchema.optional(),
  title: z.string().max(500).optional(),
  contentSha256: AssetSha256Schema,
  origin: WikiOriginSchema,
});
export type LabDossierSource = z.infer<typeof LabDossierSourceSchema>;

/** Identity of a page version. */
export const LabDossierPageIdentitySchema = z.strictObject({
  notebookAgentId: CapabilityAgentIdSchema,
  slug: WikiPageSchema.shape.slug,
  version: WikiPageSchema.shape.version,
});
export type LabDossierPageIdentity = z.infer<typeof LabDossierPageIdentitySchema>;

/** A page the plan cites, as the plan writes it: the author is optional there. */
export const LabDossierPlanCitationSchema = LabDossierPageIdentitySchema.extend({
  notebookAgentId: CapabilityAgentIdSchema.optional(),
});
export type LabDossierPlanCitation = z.infer<typeof LabDossierPlanCitationSchema>;

const SnapshotIdSchema = z.string().min(1).max(128);

const frozenIdentityShape = {
  tenantId: AssetRefSchema.shape.tenantId,
  organizationId: z.string().min(1).max(64),
  clientId: AssetRefSchema.shape.companyId,
  projectId: AssetRefSchema.shape.projectId,
  snapshotId: SnapshotIdSchema,
  /** Cutoff of the transaction the pages were read in. */
  cutoff: z.iso.datetime(),
  scope: LabPublicationRecipientSchema,
};

const identityKey = (p: LabDossierPageIdentity): string => `${p.notebookAgentId}\u0000${p.slug}\u0000${p.version}`;
const compareText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);
const compareIdentity = (a: LabDossierPageIdentity, b: LabDossierPageIdentity): number =>
  compareText(a.notebookAgentId, b.notebookAgentId) || compareText(a.slug, b.slug) || a.version - b.version;
const compareSource = (a: LabDossierSource, b: LabDossierSource): number =>
  compareText(a.notebookAgentId, b.notebookAgentId) || compareText(a.id, b.id);

function scopeIssues(
  value: { clientId: string; projectId: string; scope: z.infer<typeof LabPublicationRecipientSchema> },
  ctx: z.RefinementCtx,
): void {
  const { scope } = value;
  if (scope.clientId !== value.clientId || (scope.kind === 'project' && scope.projectId !== value.projectId)) {
    ctx.addIssue({ code: 'custom', path: ['scope'], message: 'Publication scope must name the snapshot client and project' });
  }
}

function duplicateIssues(
  pages: readonly LabDossierPageIdentity[],
  sources: readonly LabDossierSource[],
  ctx: z.RefinementCtx,
): void {
  const seen = new Set<string>();
  pages.forEach((page, index) => {
    const key = identityKey(page);
    if (seen.has(key)) ctx.addIssue({ code: 'custom', path: ['pages', index], message: 'Duplicate page identity (author, slug, version)' });
    seen.add(key);
  });
  const seenSources = new Set<string>();
  sources.forEach((source, index) => {
    const key = `${source.notebookAgentId}\u0000${source.id}`;
    if (seenSources.has(key)) ctx.addIssue({ code: 'custom', path: ['sources', index], message: 'Duplicate source (author, id)' });
    seenSources.add(key);
  });
}

/** What the service hands over: pages in any order and plan citations that may omit the author. */
export const LabDossierSnapshotInputSchema = z.strictObject({
  ...frozenIdentityShape,
  pages: z.array(LabDossierPageSchema).min(1).max(LAB_DOSSIER_MAX_PAGES),
  planCitations: z.array(LabDossierPlanCitationSchema).max(LAB_DOSSIER_MAX_PAGES),
  sources: z.array(LabDossierSourceSchema).max(LAB_DOSSIER_MAX_SOURCES),
}).superRefine((input, ctx) => {
  scopeIssues(input, ctx);
  duplicateIssues(input.pages, input.sources, ctx);
});
export type LabDossierSnapshotInput = z.infer<typeof LabDossierSnapshotInputSchema>;

const ManifestDigestSchema = AssetSha256Schema;

/** The frozen content the manifest digest covers: identity, list, content and frozen metadata; no counters. */
export type LabDossierDigestContent = {
  tenantId: string;
  organizationId: string;
  clientId: string;
  projectId: string;
  snapshotId: string;
  cutoff: string;
  scope: z.infer<typeof LabPublicationRecipientSchema>;
  pages: readonly LabDossierPage[];
  citations: readonly LabDossierPageIdentity[];
  sources: readonly LabDossierSource[];
};

/** UTF-8 input for the manifest digest. Optional fields left undefined are omitted before keys are sorted. */
export function labDossierCanonicalJson(content: LabDossierDigestContent): string {
  const { tenantId, organizationId, clientId, projectId, snapshotId, cutoff, scope, pages, citations, sources } = content;
  return canonicalJson(JSON.parse(JSON.stringify({
    schemaVersion: 1, tenantId, organizationId, clientId, projectId, snapshotId, cutoff, scope, pages, citations, sources,
  })));
}

export function labDossierManifestDigest(content: LabDossierDigestContent): string {
  return createHash('sha256').update(labDossierCanonicalJson(content), 'utf8').digest('hex');
}

export const LabDossierSnapshotSchema = z.strictObject({
  schemaVersion: z.literal(1),
  ...frozenIdentityShape,
  /** Sorted by author, slug, version; unique. */
  pages: z.array(LabDossierPageSchema).min(1).max(LAB_DOSSIER_MAX_PAGES),
  /** The versions the plan uses, resolved to one author each. */
  citations: z.array(LabDossierPageIdentitySchema).max(LAB_DOSSIER_MAX_PAGES),
  sources: z.array(LabDossierSourceSchema).max(LAB_DOSSIER_MAX_SOURCES),
  currentPageCount: z.number().int().min(0),
  citedExtraPageCount: z.number().int().min(0),
  /** `currentPageCount + citedExtraPageCount`: the identities the snapshot declares. */
  totalPages: z.number().int().min(1),
  complete: z.literal(true),
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
  const used = new Set<string>();
  snapshot.citations.forEach((citation, index) => {
    const key = identityKey(citation);
    const previous = snapshot.citations[index - 1];
    if (previous !== undefined && compareIdentity(previous, citation) >= 0) {
      ctx.addIssue({ code: 'custom', path: ['citations', index], message: 'Citations must be sorted and unique' });
    }
    if (!byKey.has(key)) ctx.addIssue({ code: 'custom', path: ['citations', index], message: 'Citation is not in the snapshot' });
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
export type LabDossierSnapshot = z.infer<typeof LabDossierSnapshotSchema>;

/**
 * Sorts, resolves the plan citations and seals a snapshot. Throws on an ambiguous or unmatched citation (never picks
 * an author) and on an extra page no citation uses. The snapshot is validated before it is returned.
 */
export function buildLabDossierSnapshot(rawInput: unknown): LabDossierSnapshot {
  const input = LabDossierSnapshotInputSchema.parse(rawInput);
  const pages = [...input.pages].sort(compareIdentity);
  const resolved = new Map<string, LabDossierPageIdentity>();
  for (const citation of input.planCitations) {
    const label = `${citation.notebookAgentId ?? '*'}/${citation.slug}@${citation.version}`;
    const matches = pages.filter((p) => p.slug === citation.slug && p.version === citation.version
      && (citation.notebookAgentId === undefined || p.notebookAgentId === citation.notebookAgentId));
    if (matches.length === 0) throw new Error(`Plan citation ${label} is not in the snapshot`);
    if (matches.length > 1) {
      throw new Error(`Plan citation ${label} is ambiguous: ${matches.map((p) => p.notebookAgentId).join(', ')}`);
    }
    const [match] = matches;
    if (match === undefined) continue;
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
  const content: LabDossierDigestContent = { tenantId, organizationId, clientId, projectId, snapshotId, cutoff, scope, pages, citations, sources };
  return LabDossierSnapshotSchema.parse({
    schemaVersion: 1,
    ...content,
    currentPageCount,
    citedExtraPageCount,
    totalPages: currentPageCount + citedExtraPageCount,
    complete: true,
    manifestDigest: labDossierManifestDigest(content),
  });
}
