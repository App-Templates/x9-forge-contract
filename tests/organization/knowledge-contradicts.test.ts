import { describe, expect, it } from 'vitest';
import {
  KnowledgeContradictionTargetSchema,
  KnowledgePublicationSchema,
} from '../../src/organization/knowledge-publication.js';
import { LabPublishInputSchema, LabReadPublishedOutputSchema } from '../../src/capability/lab/tools.js';

const publication = {
  ref: {
    context: {
      schemaVersion: 1,
      runId: 'run-1',
      organizationId: 'org-1',
      ownerId: 'owner-1',
      identity: { managementAgentId: 'agent-1', runtimeAgentId: 'runtime-1' },
      issuer: 'x9',
      issuedAt: '2026-10-14T10:00:00.000Z',
      expiresAt: '2026-10-14T11:00:00.000Z',
    },
    sourceScope: 'team',
    slug: 'refund-procedure',
    version: 2,
    digest: 'a'.repeat(64),
    recipient: { kind: 'organization', id: 'org-1' },
  },
  kind: 'procedure',
  status: 'current',
  evidence: [{ kind: 'run_receipt', id: 'rcpt-1', digest: 'b'.repeat(64) }],
  validFrom: '2026-10-15T08:00:00.000Z',
};

const decision = { target: 'decision', requestId: 'req-123456', planVersion: 2 };
const mapEntry = { target: 'map_entry', kind: 'referent', key: 'stefano', version: 1 };

describe('contradicts towards a decision or a map entry (F3B-01)', () => {
  it('keeps the slug form of today', () => {
    const r = KnowledgePublicationSchema.safeParse({ ...publication, contradicts: ['altra-pagina'] });
    expect(r.success, JSON.stringify(r.error?.issues)).toBe(true);
  });
  it('accepts a decision and a referent entry target, mixed with slugs', () => {
    expect(KnowledgePublicationSchema.safeParse({ ...publication, contradicts: ['altra-pagina', decision, mapEntry] }).success).toBe(true);
  });
  it('lab_publish and a published page accept contradicts, and still pass without it', () => {
    const recipient = { kind: 'project', clientId: 'good-choice', projectId: 'sito' };
    expect(LabPublishInputSchema.safeParse({ slug: 'refund-policy', recipient }).success).toBe(true);
    expect(LabPublishInputSchema.safeParse({ slug: 'refund-policy', recipient, contradicts: ['altra', mapEntry] }).success).toBe(true);
    const page = { slug: 'refund-policy', version: 1, digest: 'c'.repeat(64), title: 'Rimborsi', content: 'Testo' };
    expect(LabReadPublishedOutputSchema.safeParse({ pages: [page] }).success).toBe(true);
    expect(LabReadPublishedOutputSchema.safeParse({ pages: [{ ...page, contradicts: [decision] }] }).success).toBe(true);
  });

  it('rejects an unknown target, a decision without planVersion, an unknown kind, a key with a space', () => {
    expect(KnowledgeContradictionTargetSchema.safeParse({ target: 'model', id: 'x' }).success).toBe(false);
    expect(KnowledgeContradictionTargetSchema.safeParse({ target: 'decision', requestId: 'req-123456' }).success).toBe(false);
    expect(KnowledgeContradictionTargetSchema.safeParse({ ...mapEntry, kind: 'other' }).success).toBe(false);
    expect(KnowledgeContradictionTargetSchema.safeParse({ ...mapEntry, key: 'con spazio' }).success).toBe(false);
  });
  it('rejects a slug with capitals and more than 50 elements', () => {
    expect(KnowledgePublicationSchema.safeParse({ ...publication, contradicts: ['Maiuscole'] }).success).toBe(false);
    expect(KnowledgePublicationSchema.safeParse({ ...publication, contradicts: Array(51).fill('pagina') }).success).toBe(false);
  });
});
