import { describe, expect, it } from 'vitest';
import { LabIngestInputSchema, type LabIngestInput } from '../../../src/capability/lab/index.js';
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

describe('lab_ingest research reference', () => {
  it('accepts a research id without copying the result', () => {
    const input: LabIngestInput = { researchId: 'r-1' };
    expect(LabIngestInputSchema.parse(input)).toEqual(input);
  });

  it('rejects an empty research id', () => {
    expect(LabIngestInputSchema.safeParse({ researchId: '' }).success).toBe(false);
  });

  it('rejects a research id combined with a result or document', () => {
    expect(LabIngestInputSchema.safeParse({ researchId: 'r-1', result }).success).toBe(false);
    expect(LabIngestInputSchema.safeParse({ researchId: 'r-1', document }).success).toBe(false);
  });

  it('preserves the existing result and document inputs', () => {
    const resultInput: LabIngestInput = { result };
    const documentInput: LabIngestInput = { document };
    expect(LabIngestInputSchema.parse(resultInput)).toEqual(resultInput);
    expect(LabIngestInputSchema.parse(documentInput)).toEqual(documentInput);
    expect(LabIngestInputSchema.safeParse({ result, document }).success).toBe(false);
  });
});
