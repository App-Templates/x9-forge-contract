import { describe, expect, it } from 'vitest';
import {
  LAB_TOOLS,
  LabGapsRefSchema,
  LabPublicationRecipientSchema,
  LabPublishInputSchema,
  LabPublishOutputSchema,
  LabReadPublishedInputSchema,
  LabReadPublishedOutputSchema,
  LabBriefGapsInputSchema,
  LabBriefGapsOutputSchema,
} from '../../../src/capability/lab/index.js';
import { ResearchRequestSchema } from '../../../src/capability/ricerca/index.js';

const client = { kind: 'client', clientId: 'client-acme' };
const project = { kind: 'project', clientId: 'client-acme', projectId: 'launch-2026' };
const page = {
  slug: 'acme-market', version: 2, digest: 'a'.repeat(64),
  title: 'Acme market', content: '# Existing market analysis',
};
const brief = { topics: ['Market', 'Competitors'], clientId: client.clientId };
const gaps = {
  gapsRef: 'brief_123', hasContext: true,
  covered: [{ slug: page.slug, version: page.version }], gaps: [{ topic: 'Competitors' }],
};
const published = {
  slug: page.slug, version: page.version, digest: page.digest,
  recipient: project, publishedAt: '2026-10-22T12:00:00Z',
};

describe('lab publication and brief gaps', () => {
  it('validates the three tools and research gap references', () => {
    expect([LAB_TOOLS.publish, LAB_TOOLS.readPublished, LAB_TOOLS.briefGaps])
      .toEqual(['lab_publish', 'lab_read_published', 'lab_brief_gaps']);
    for (const recipient of [client, project]) {
      expect(LabPublicationRecipientSchema.parse(recipient)).toEqual(recipient);
      expect(LabPublishInputSchema.parse({ slug: page.slug, recipient }))
        .toEqual({ slug: page.slug, recipient });
      expect(LabPublishInputSchema.safeParse({ slug: page.slug, version: 2, recipient }).success).toBe(true);
      expect(LabPublishOutputSchema.safeParse({ ...published, recipient }).success).toBe(true);
      expect(LabReadPublishedInputSchema.safeParse({ recipient }).success).toBe(true);
      expect(LabReadPublishedInputSchema.safeParse({ recipient, query: 'market', limit: 50 }).success).toBe(true);
    }
    expect(LabReadPublishedOutputSchema.parse({ pages: [page] })).toEqual({ pages: [page] });
    expect(LabBriefGapsInputSchema.parse(brief)).toEqual(brief);
    expect(LabBriefGapsInputSchema.safeParse({ ...brief, projectId: project.projectId }).success).toBe(true);
    expect(LabBriefGapsOutputSchema.parse(gaps)).toEqual(gaps);
    expect(LabBriefGapsOutputSchema.safeParse({ ...gaps, hasContext: false, covered: [], gaps: [] }).success).toBe(true);
    expect(LabPublicationRecipientSchema.safeParse({ kind: 'organization', clientId: client.clientId }).success).toBe(false);
    expect(LabPublicationRecipientSchema.safeParse({ kind: 'project', clientId: client.clientId }).success).toBe(false);
    expect(LabBriefGapsInputSchema.safeParse({ ...brief, topics: [] }).success).toBe(false);
    expect(LabBriefGapsInputSchema.safeParse({ ...brief, topics: ['Market', 'Market'] }).success).toBe(false);
    expect(LabBriefGapsOutputSchema.safeParse({ ...gaps, gapsRef: 'abc' }).success).toBe(false);
    expect(ResearchRequestSchema.parse({ question: 'What is missing?', labGapsRef: gaps.gapsRef }))
      .toEqual({ question: 'What is missing?', labGapsRef: gaps.gapsRef });
    expect(ResearchRequestSchema.safeParse({ question: 'What is missing?', labGapsRef: 'brief 123' }).success).toBe(false);
    expect(ResearchRequestSchema.parse({ question: 'Legacy research' })).toEqual({ question: 'Legacy research' });
  });

  it('a research may name the project it serves (F1L-03), bounded like the asset project', () => {
    expect(ResearchRequestSchema.parse({ question: 'Gap', projectId: 'p1', labGapsRef: 'gaps_Ab12-x' }))
      .toEqual({ question: 'Gap', projectId: 'p1', labGapsRef: 'gaps_Ab12-x' });
    for (const projectId of ['', 'p'.repeat(65)]) {
      expect(ResearchRequestSchema.safeParse({ question: 'Gap', projectId }).success).toBe(false);
    }
  });

  it('enforces bounds, explicit identities and strict nested payloads', () => {
    expect(LabPublicationRecipientSchema.safeParse({ kind: 'client', clientId: '' }).success).toBe(false);
    expect(LabPublicationRecipientSchema.safeParse({ ...project, projectId: '' }).success).toBe(false);
    expect(LabPublicationRecipientSchema.safeParse({ ...client, projectId: project.projectId }).success).toBe(false);
    for (const version of [0, 1.5]) {
      expect(LabPublishInputSchema.safeParse({ slug: page.slug, version, recipient: client }).success).toBe(false);
      expect(LabPublishOutputSchema.safeParse({ ...published, version }).success).toBe(false);
    }
    expect(LabPublishInputSchema.safeParse({ slug: 'Bad Slug', recipient: client }).success).toBe(false);
    expect(LabPublishInputSchema.safeParse({ slug: page.slug, recipient: client, extra: true }).success).toBe(false);
    expect(LabPublishOutputSchema.safeParse({ ...published, digest: 'bad' }).success).toBe(false);
    expect(LabPublishOutputSchema.safeParse({ ...published, publishedAt: 'yesterday' }).success).toBe(false);
    expect(LabPublishOutputSchema.safeParse({ ...published, extra: true }).success).toBe(false);
    for (const query of ['', 'x'.repeat(2001)]) {
      expect(LabReadPublishedInputSchema.safeParse({ recipient: client, query }).success).toBe(false);
    }
    for (const limit of [0, 51, 1.5]) {
      expect(LabReadPublishedInputSchema.safeParse({ recipient: client, limit }).success).toBe(false);
    }
    expect(LabReadPublishedInputSchema.safeParse({ recipient: client, extra: true }).success).toBe(false);
    expect(LabReadPublishedOutputSchema.safeParse({ pages: Array.from({ length: 51 }, () => page) }).success).toBe(false);
    expect(LabReadPublishedOutputSchema.safeParse({ pages: [{ ...page, extra: true }] }).success).toBe(false);
    expect(LabReadPublishedOutputSchema.safeParse({ pages: [], extra: true }).success).toBe(false);
    expect(LabBriefGapsInputSchema.safeParse({ ...brief, topics: ['   '] }).success).toBe(false);
    expect(LabBriefGapsInputSchema.safeParse({ ...brief, topics: ['Market', ' Market '] }).success).toBe(false);
    expect(LabBriefGapsInputSchema.safeParse({ ...brief, topics: Array.from({ length: 21 }, (_, i) => `Topic ${i}`) }).success).toBe(false);
    expect(LabBriefGapsInputSchema.safeParse({ ...brief, extra: true }).success).toBe(false);
    expect(LabBriefGapsOutputSchema.safeParse({ ...gaps, covered: Array.from({ length: 101 }, () => gaps.covered[0]) }).success).toBe(false);
    expect(LabBriefGapsOutputSchema.safeParse({ ...gaps, gaps: Array.from({ length: 51 }, () => gaps.gaps[0]) }).success).toBe(false);
    expect(LabBriefGapsOutputSchema.safeParse({ ...gaps, covered: [{ slug: page.slug, version: 0 }] }).success).toBe(false);
    expect(LabBriefGapsOutputSchema.safeParse({ ...gaps, gaps: [{ topic: '' }] }).success).toBe(false);
    expect(LabBriefGapsOutputSchema.safeParse({ ...gaps, covered: [{ ...gaps.covered[0], extra: true }] }).success).toBe(false);
    expect(LabBriefGapsOutputSchema.safeParse({ ...gaps, gaps: [{ topic: 'Market', extra: true }] }).success).toBe(false);
    expect(LabBriefGapsOutputSchema.safeParse({ ...gaps, hasContext: 'yes' }).success).toBe(false);
    expect(LabBriefGapsOutputSchema.safeParse({ ...gaps, extra: true }).success).toBe(false);
    for (const ref of ['abc', 'a'.repeat(65), 'brief 123']) {
      expect(LabGapsRefSchema.safeParse(ref).success).toBe(false);
      expect(ResearchRequestSchema.safeParse({ question: 'Research', labGapsRef: ref }).success).toBe(false);
    }
    for (const ref of ['a'.repeat(6), 'Z_9-'.repeat(16)]) {
      expect(LabGapsRefSchema.safeParse(ref).success).toBe(true);
    }
  });
});
