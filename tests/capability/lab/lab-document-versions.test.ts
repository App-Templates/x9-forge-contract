import { createRequire } from 'node:module';
import { expect, it } from 'vitest';
import {
  LAB_TOOLS,
  LabIngestDocumentSchema,
  LabIngestInputSchema,
  LabWithdrawInputSchema,
  LabWithdrawOutputSchema,
  type LabWithdrawInput,
  type LabWithdrawOutput,
} from '../../../src/capability/lab/tools.js';
import type { AssetRef } from '../../../src/organization/asset.js';

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
const document = { asset, title: 'Project brief from Stefano' };

it('s5942 a document without excerpts is accepted', () => {
  expect(LabIngestDocumentSchema.parse(document)).toEqual(document);
  expect(LabIngestInputSchema.parse({ document })).toEqual({ document });
});

it('s5942 empty excerpts are still refused', () => {
  for (const excerpts of [[], [''], ['x'.repeat(4001)], Array(51).fill('excerpt'), null]) {
    expect(LabIngestInputSchema.safeParse({ document: { ...document, excerpts } }).success).toBe(false);
  }
  for (const excerpts of [['x'.repeat(4000)], Array(50).fill('excerpt')]) {
    expect(LabIngestInputSchema.parse({ document: { ...document, excerpts } })).toEqual({
      document: { ...document, excerpts },
    });
  }
});

it('s5942 supersedes takes an asset id', () => {
  const version = { ...document, supersedes: 'asset-brief-0' };
  expect(LabIngestDocumentSchema.parse(version)).toEqual(version);
  expect(LabIngestInputSchema.parse({ document: version })).toEqual({ document: version });
  for (const supersedes of ['', 'short', 'asset.dot', 'a'.repeat(65), 1, null]) {
    expect(LabIngestDocumentSchema.safeParse({ ...document, supersedes }).success).toBe(false);
  }
});

it('s5942 lab_withdraw input and output parse and refuse extra fields', () => {
  const input: LabWithdrawInput = { assetId: asset.assetId, reason: 'Outdated document' };
  const output: LabWithdrawOutput = {
    assetId: asset.assetId, sourcesWithdrawn: 0, pagesRewritten: 2,
    withdrawnAt: '2026-11-09T10:00:00+01:00',
  };
  expect(LAB_TOOLS.withdraw).toBe('lab_withdraw');
  expect(LabWithdrawInputSchema.parse(input)).toEqual(input);
  expect(LabWithdrawOutputSchema.parse(output)).toEqual(output);
  expect(LabWithdrawInputSchema.parse({ ...input, reason: '  Outdated document  ' })).toEqual(input);
  expect(LabWithdrawInputSchema.parse({ ...input, reason: 'x'.repeat(500) }).reason).toHaveLength(500);
  for (const value of [
    { ...input, extra: true }, { ...input, assetId: 'short' },
    { ...input, reason: '' }, { ...input, reason: '   ' },
    { ...input, reason: 'x'.repeat(501) }, { assetId: input.assetId },
    { reason: input.reason },
  ]) expect(LabWithdrawInputSchema.safeParse(value).success).toBe(false);
  for (const value of [
    { ...output, extra: true }, { ...output, assetId: 'short' },
    { ...output, withdrawnAt: '2026-11-09T10:00:00' },
    { ...output, withdrawnAt: 'not-a-date' }, { ...output, withdrawnAt: undefined },
    { ...output, assetId: undefined },
  ]) expect(LabWithdrawOutputSchema.safeParse(value).success).toBe(false);
  for (const field of ['sourcesWithdrawn', 'pagesRewritten'] as const) {
    for (const count of [-1, 0.5, '1', undefined]) {
      expect(LabWithdrawOutputSchema.safeParse({ ...output, [field]: count }).success).toBe(false);
    }
    expect(LabWithdrawOutputSchema.parse({ ...output, [field]: 0 })[field]).toBe(0);
  }
});

it("s5942 today's document with excerpts still parses", () => {
  // Same payload shape as the saved lab.ingest.payload and the existing document test.
  const current = {
    ...document,
    excerpts: ['The business unit should retain the materials produced for each project.'],
  };
  expect(LabIngestDocumentSchema.parse(current)).toEqual(current);
  expect(LabIngestInputSchema.parse({ document: current })).toEqual({ document: current });
});

it('s5942 the CommonJS dist exports LabWithdrawInputSchema', () => {
  const cjs: {
    LabWithdrawInputSchema: typeof LabWithdrawInputSchema;
    LabWithdrawOutputSchema: typeof LabWithdrawOutputSchema;
  } = createRequire(import.meta.url)('@x9-forge/contracts/capability/lab/tools');
  const input = { assetId: asset.assetId, reason: 'Outdated document' };
  expect(cjs.LabWithdrawInputSchema.parse(input)).toEqual(input);
  expect(cjs.LabWithdrawOutputSchema.safeParse({}).success).toBe(false);
});
