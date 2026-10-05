import { describe, it, expect } from 'vitest';
import {
  COMPETENCE_MAX_LEVEL,
  CompetenceGapSchema,
  CompetenceNodeViewSchema,
  LAB_TOOLS,
  LabIngestInputSchema,
  LabProjectConfigSchema,
  WikiClaimSchema,
  WikiLinkSchema,
  WikiPageSchema,
  WikiSourceSchema,
} from '../../../src/capability/lab/index';
import { capToolCallPath } from '../../../src/http/index';

const fails = (r: { success: boolean }, label: string) => expect(r.success, label).toBe(false);

const labProject = {
  projectId: 'food-samira', version: 1, domain: 'cucina',
  conventions: 'Una pagina per tecnica o ingrediente; ogni affermazione con le sue fonti; dosi in grammi.',
  pageKinds: ['tecnica', 'ingrediente', 'abbinamento', 'domanda'],
  linkKinds: ['richiede', 'si_abbina_a', 'contraddice'],
};

describe('cap-lab project config (v1.28.0)', () => {
  it('the project chooses its own kinds of pages and links', () => {
    expect(LabProjectConfigSchema.safeParse(labProject).success).toBe(true);
    expect(LabProjectConfigSchema.safeParse({ ...labProject, domain: 'processi', pageKinds: ['processo'], linkKinds: ['passa_a'] }).success).toBe(true);
  });

  it('kinds are slugs, at least one, never repeated', () => {
    fails(LabProjectConfigSchema.safeParse({ ...labProject, pageKinds: [] }), 'no page kinds');
    fails(LabProjectConfigSchema.safeParse({ ...labProject, linkKinds: [] }), 'no link kinds');
    fails(LabProjectConfigSchema.safeParse({ ...labProject, pageKinds: ['Tecnica'] }), 'uppercase');
    fails(LabProjectConfigSchema.safeParse({ ...labProject, pageKinds: ['tecnica', 'tecnica'] }), 'repeated');
  });

  it('the conventions are bounded and required', () => {
    fails(LabProjectConfigSchema.safeParse({ ...labProject, conventions: '' }), 'empty');
    fails(LabProjectConfigSchema.safeParse({ ...labProject, conventions: 'x'.repeat(8001) }), 'long');
  });
});

describe('cap-lab wiki (v1.28.0)', () => {
  const source = {
    id: 's-1', projectId: 'food-samira', url: 'https://e.org/hollandaise', fetchedAt: '2026-10-05T18:00:00Z',
    contentSha256: 'a'.repeat(64), origin: 'web',
  };

  it('a stored source has a fingerprint; a web source has an address', () => {
    expect(WikiSourceSchema.safeParse(source).success).toBe(true);
    const { url: _u, ...noUrl } = source;
    fails(WikiSourceSchema.safeParse(noUrl), 'web without url');
    expect(WikiSourceSchema.safeParse({ ...noUrl, origin: 'dataset' }).success).toBe(true);
    fails(WikiSourceSchema.safeParse({ ...source, url: 'file:///etc/passwd' }), 'file url');
    fails(WikiSourceSchema.safeParse({ ...source, contentSha256: 'xyz' }), 'hash');
  });

  it('a page is versioned markdown of a kind', () => {
    const page = { projectId: 'food-samira', slug: 'hollandaise', kind: 'tecnica', title: 'Hollandaise', body: '# Hollandaise', version: 1, updatedAt: '2026-10-05T18:00:00Z' };
    expect(WikiPageSchema.safeParse(page).success).toBe(true);
    fails(WikiPageSchema.safeParse({ ...page, slug: 'Holl andaise' }), 'slug');
    fails(WikiPageSchema.safeParse({ ...page, version: 0 }), 'version');
    fails(WikiPageSchema.safeParse({ ...page, body: 'x'.repeat(40001) }), 'body');
  });

  it('every claim rests on at least one source', () => {
    const claim = { id: 'c-1', pageSlug: 'hollandaise', text: 'Oltre 65 °C il tuorlo coagula.', sourceIds: ['s-1'], status: 'aperta', origin: 'web' };
    expect(WikiClaimSchema.safeParse(claim).success).toBe(true);
    fails(WikiClaimSchema.safeParse({ ...claim, sourceIds: [] }), 'no source');
    fails(WikiClaimSchema.safeParse({ ...claim, status: 'vera' }), 'status');
  });

  it('a link joins two different pages', () => {
    expect(WikiLinkSchema.safeParse({ from: 'bearnese', to: 'hollandaise', kind: 'richiede' }).success).toBe(true);
    fails(WikiLinkSchema.safeParse({ from: 'hollandaise', to: 'hollandaise', kind: 'richiede' }), 'self link');
  });
});

describe('cap-lab competence and tools (v1.28.0)', () => {
  it('levels stay on the contest scale', () => {
    const node = { nodeId: 'tec_hollandaise', label: 'Hollandaise', requires: ['tec_emulsione_calda'], level: 2, score: 0.9 };
    expect(CompetenceNodeViewSchema.safeParse(node).success).toBe(true);
    fails(CompetenceNodeViewSchema.safeParse({ ...node, level: COMPETENCE_MAX_LEVEL + 1 }), 'level 5');
    fails(CompetenceNodeViewSchema.safeParse({ ...node, level: 1.5 }), 'fractional');
    fails(CompetenceNodeViewSchema.safeParse({ ...node, score: -0.1 }), 'negative score');
  });

  it('a gap is a question with a reason', () => {
    expect(CompetenceGapSchema.safeParse({ projectId: 'food-samira', question: 'Perché la béarnaise impazzisce?', reason: 'non_so' }).success).toBe(true);
    fails(CompetenceGapSchema.safeParse({ projectId: 'food-samira', question: 'q', reason: 'boh' }), 'reason');
  });

  it('ingest takes a cap-ricerca result as cap-ricerca defines it', () => {
    const result = {
      researchId: 'r-1', projectId: 'food-samira', state: 'completed', question: 'q',
      findings: [{ text: 't', sourceUrls: ['https://e.org/a'], origin: 'web' }], newQuestions: [],
      sources: [{ url: 'https://e.org/a', opened: true }],
      cost: { usd: 0.3, inputTokens: 1, outputTokens: 1, webCalls: 1, uncertain: false },
    };
    expect(LabIngestInputSchema.safeParse({ result }).success).toBe(true);
    fails(LabIngestInputSchema.safeParse({ result: { ...result, findings: [{ text: 't', sourceUrls: [], origin: 'web' }] } }), 'finding without source');
  });

  it('tool names come from the contract', () => {
    expect(capToolCallPath(LAB_TOOLS.ingest)).toBe('/call/lab_ingest');
    expect(Object.values(LAB_TOOLS)).toEqual(['lab_ingest', 'lab_query', 'lab_gaps', 'lab_competence']);
  });
});
