import { describe, expect, it } from 'vitest';
import {
  LabDossierSnapshotInputSchema,
  LabDossierSnapshotSchema,
  buildLabDossierSnapshot,
  labDossierManifestDigest,
} from '../../src/capability/lab/index.js';

const hex = (char: string) => char.repeat(64);
const page = (agent: string, slug: string, version: number, role: 'current' | 'cited_by_plan', body = `Body of ${slug}`) => ({
  notebookAgentId: agent,
  slug,
  version,
  role,
  title: `Title ${slug} v${version}`,
  body,
  digest: hex('d'),
});

/** 63 current publications (two authors share the slug `shared`) plus one cited historical version: 64 identities. */
const input = () => {
  const pages = [
    page('agent-lab-a', 'shared', 1, 'current'),
    page('agent-lab-b', 'shared', 1, 'current'),
    ...Array.from({ length: 61 }, (_, i) => page('agent-lab-a', `topic-${String(i).padStart(2, '0')}`, i === 10 ? 2 : 1, 'current')),
    page('agent-lab-a', 'topic-10', 1, 'cited_by_plan', 'Old body of topic-10'),
  ];
  return {
    tenantId: 'tenant-a',
    organizationId: 'org-1',
    clientId: 'client-1',
    projectId: 'project-1',
    snapshotId: 'snap-9',
    cutoff: '2026-11-23T10:00:00.000Z',
    scope: { kind: 'project' as const, clientId: 'client-1', projectId: 'project-1' },
    pages: [...pages].reverse(),
    planCitations: [{ slug: 'topic-10', version: 1 }, { slug: 'shared', version: 1, notebookAgentId: 'agent-lab-a' }],
    sources: [{ id: 'src-1', notebookAgentId: 'agent-lab-a', title: 'Source', contentSha256: hex('5'), origin: 'human' as const }],
  };
};

describe('s8305 Lab dossier snapshot', () => {
  it('s8305 rejects a complete snapshot with fewer pages than its total', () => {
    const complete = buildLabDossierSnapshot(input());
    expect(LabDossierSnapshotSchema.safeParse(complete).success).toBe(true);
    const partialPages = complete.pages.slice(0, 50);
    const partial = {
      ...complete,
      pages: partialPages,
      manifestDigest: labDossierManifestDigest({ ...complete, pages: partialPages }),
    };
    expect(partial.totalPages).toBe(64);
    expect(LabDossierSnapshotSchema.safeParse(partial).success).toBe(false);
  });

  it('counts 63 current and 1 cited page as 64 distinct identities, even with a shared slug', () => {
    const snapshot = buildLabDossierSnapshot(input());
    expect(snapshot).toMatchObject({ currentPageCount: 63, citedExtraPageCount: 1, totalPages: 64, complete: true });
    expect(snapshot.pages).toHaveLength(64);
    expect(snapshot.pages.filter((p) => p.slug === 'shared').map((p) => p.notebookAgentId)).toEqual(['agent-lab-a', 'agent-lab-b']);
    expect(snapshot.citations).toEqual([
      { notebookAgentId: 'agent-lab-a', slug: 'shared', version: 1 },
      { notebookAgentId: 'agent-lab-a', slug: 'topic-10', version: 1 },
    ]);
    const keys = snapshot.pages.map((p) => `${p.notebookAgentId}/${p.slug}/${String(p.version).padStart(6, '0')}`);
    expect(keys).toEqual([...keys].sort());
  });

  it('rejects an empty dossier', () => {
    expect(LabDossierSnapshotInputSchema.safeParse({ ...input(), pages: [], planCitations: [] }).success).toBe(false);
  });

  it('rejects the same page identity twice', () => {
    const data = input();
    const duplicated = { ...data, pages: [...data.pages, data.pages[0]] };
    expect(LabDossierSnapshotInputSchema.safeParse(duplicated).success).toBe(false);
  });

  it('rejects a historical reference that two authors make ambiguous, and one that matches nothing', () => {
    const data = input();
    const ambiguous = { ...data, planCitations: [{ slug: 'shared', version: 1 }] };
    expect(() => buildLabDossierSnapshot(ambiguous)).toThrow(/ambiguous/);
    const missing = { ...data, planCitations: [{ slug: 'nowhere', version: 1 }] };
    expect(() => buildLabDossierSnapshot(missing)).toThrow(/not in the snapshot/);
  });

  it('rejects an extra page that no plan citation uses', () => {
    const data = input();
    expect(() => buildLabDossierSnapshot({ ...data, planCitations: [] })).toThrow(/cited/);
  });

  it('changes the digest when the last page changes, not when order of input changes', () => {
    const data = input();
    const first = buildLabDossierSnapshot(data);
    const reordered = buildLabDossierSnapshot({ ...data, pages: [...data.pages].reverse() });
    expect(reordered.manifestDigest).toBe(first.manifestDigest);
    const last = first.pages[first.pages.length - 1];
    const edited = buildLabDossierSnapshot({
      ...data,
      pages: data.pages.map((p) => (p.slug === last.slug && p.notebookAgentId === last.notebookAgentId && p.version === last.version ? { ...p, body: `${p.body} edited` } : p)),
    });
    expect(edited.manifestDigest).not.toBe(first.manifestDigest);
  });

  it('rejects a snapshot whose digest, counts, order or completeness flag disagree with its pages', () => {
    const snapshot = buildLabDossierSnapshot(input());
    const check = (over: Record<string, unknown>) => LabDossierSnapshotSchema.safeParse({ ...snapshot, ...over }).success;
    expect(check({ manifestDigest: hex('0') })).toBe(false);
    expect(check({ currentPageCount: 62, citedExtraPageCount: 2 })).toBe(false);
    expect(check({ totalPages: 65 })).toBe(false);
    expect(check({ complete: false })).toBe(false);
    expect(check({ pages: [...snapshot.pages].reverse() })).toBe(false);
    expect(check({ extra: 1 })).toBe(false);
  });

  it('keeps the digest independent of volatile timestamps and covers frozen metadata', () => {
    const data = input();
    const base = buildLabDossierSnapshot(data).manifestDigest;
    expect(buildLabDossierSnapshot({ ...data, sources: [{ ...data.sources[0], contentSha256: hex('6') }] }).manifestDigest).not.toBe(base);
    expect(buildLabDossierSnapshot({ ...data, snapshotId: 'snap-10' }).manifestDigest).not.toBe(base);
  });
});
