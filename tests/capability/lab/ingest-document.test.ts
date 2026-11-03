import { describe, expect, it } from 'vitest';
import {
  LabIngestDocumentSchema,
  LabIngestInputSchema,
  type LabIngestInput,
} from '../../../src/capability/lab/index.js';
import type { ResearchResult } from '../../../src/capability/ricerca/research.js';
import type { AssetRef } from '../../../src/organization/asset.js';

const result: ResearchResult = {
  researchId: 'research-brief-1',
  agentId: 'samira',
  state: 'completed',
  question: 'Which requirements should the project brief include?',
  findings: [{
    text: 'The brief records the project objectives and expected deliverables.',
    sourceUrls: ['https://example.org/project-brief'],
    origin: 'web',
  }],
  newQuestions: [],
  sources: [{ url: 'https://example.org/project-brief', opened: true }],
  cost: { usd: 0.1, inputTokens: 100, outputTokens: 50, webCalls: 1, uncertain: false },
};

const asset: AssetRef = {
  assetId: 'asset-brief-1',
  sha256: 'a'.repeat(64),
  name: 'project-brief.txt',
  mediaType: 'text/plain',
  sizeBytes: 512,
  origin: { kind: 'session', sessionId: 'brief-session-1' },
  tenantId: 'tenant-1',
  companyId: 'company-1',
  projectId: 'project-1',
  createdAt: '2026-10-21T09:00:00Z',
};

const document = {
  asset,
  title: 'Project brief from Stefano',
  excerpts: ['The business unit should retain the materials produced for each project.'],
};

describe('lab_ingest document input', () => {
  it('accepts a completed research as today', () => {
    const input: LabIngestInput = { result };
    expect(LabIngestInputSchema.parse(input)).toEqual(input);
  });

  it('accepts a document with its asset reference', () => {
    const input: LabIngestInput = { document };
    expect(LabIngestDocumentSchema.parse(document)).toEqual(document);
    expect(LabIngestInputSchema.parse(input)).toEqual(input);
  });

  it('refuses a document without excerpts', () => {
    expect(LabIngestInputSchema.safeParse({
      document: { asset, title: document.title },
    }).success).toBe(false);
    expect(LabIngestInputSchema.safeParse({
      document: { ...document, excerpts: [] },
    }).success).toBe(false);
    expect(LabIngestInputSchema.safeParse({
      document: { ...document, excerpts: [''] },
    }).success).toBe(false);
  });

  it('refuses both result and document together', () => {
    expect(LabIngestInputSchema.safeParse({ result, document }).success).toBe(false);
  });

  it('refuses an asset with a malformed sha256', () => {
    expect(LabIngestInputSchema.safeParse({
      document: { ...document, asset: { ...asset, sha256: 'not-a-sha256' } },
    }).success).toBe(false);
  });
});
