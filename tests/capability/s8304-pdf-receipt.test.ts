import { describe, expect, it } from 'vitest';
import { DocumentPdfReceiptSchema } from '../../src/capability/index.js';

const hex = (char: string) => char.repeat(64);
const AGENT = 'agent-qa';
const asset = (over: Record<string, unknown> = {}) => ({
  assetId: 'asset_pdf_01',
  sha256: hex('c'),
  name: 'piano.pdf',
  mediaType: 'application/pdf',
  sizeBytes: 2048,
  origin: { kind: 'generated', agentId: AGENT },
  tenantId: 'tenant-a',
  companyId: 'client-1',
  projectId: 'project-1',
  createdAt: '2026-11-23T10:00:00.000Z',
  ...over,
});
const context = () => ({
  planId: 'plan_0001',
  planVersion: 3,
  planDigest: hex('a'),
  dossierSnapshotId: 'snap-9',
  dossierDigest: hex('b'),
});
const base = () => ({
  schemaVersion: 1,
  tenantId: 'tenant-a',
  organizationId: 'org-1',
  clientId: 'client-1',
  projectId: 'project-1',
  documentDigest: hex('d'),
  asset: asset(),
  renderer: { name: 'pdfmake', version: '0.2.18' },
  fontSet: { name: 'roboto-embedded', version: '1.0.0' },
  pageCount: 4,
  createdAt: '2026-11-23T10:00:01.000Z',
  producedBy: { agentId: AGENT },
});
const plan = (over: Record<string, unknown> = {}) => ({
  ...base(),
  role: 'action_plan',
  source: { kind: 'action_plan', planId: 'plan_0001', version: 3, digest: hex('a') },
  deliveryContext: context(),
  ...over,
});
const dossier = (over: Record<string, unknown> = {}) => ({
  ...base(),
  role: 'lab_dossier',
  source: { kind: 'lab_dossier', snapshotId: 'snap-9', digest: hex('b') },
  deliveryContext: context(),
  ...over,
});
const generic = (over: Record<string, unknown> = {}) => ({
  ...base(),
  role: 'document',
  source: { kind: 'document', sha256: hex('d') },
  ...over,
});

const paths = (value: unknown) => {
  const result = DocumentPdfReceiptSchema.safeParse(value);
  return result.success ? null : result.error.issues.map((issue) => issue.path.join('.'));
};

describe('s8304 PDF receipt', () => {
  it('s8304 accepts receipts for the three roles', () => {
    expect(DocumentPdfReceiptSchema.safeParse(plan()).success).toBe(true);
    expect(DocumentPdfReceiptSchema.safeParse(dossier()).success).toBe(true);
    expect(DocumentPdfReceiptSchema.safeParse(generic()).success).toBe(true);
  });

  it('s8304 rejects a receipt for Markdown even when its name ends in pdf', () => {
    const result = paths(plan({ asset: asset({ mediaType: 'text/markdown', name: 'piano.pdf' }) }));
    expect(result).toContain('asset.mediaType');
  });

  it('s8304 rejects a missing source and a source of another role', () => {
    const { source: _source, ...withoutSource } = plan();
    expect(DocumentPdfReceiptSchema.safeParse(withoutSource).success).toBe(false);
    expect(paths(plan({ source: { kind: 'document', sha256: hex('d') } }))).toContain('source.kind');
  });

  it('s8304 rejects zero pages', () => {
    expect(paths(generic({ pageCount: 0 }))).toContain('pageCount');
  });

  it('s8304 rejects a link origin and a producer that is not the generating agent', () => {
    expect(paths(generic({ asset: asset({ origin: { kind: 'link', url: 'https://example.invalid/a.pdf' } }) })))
      .toContain('asset.origin.kind');
    expect(paths(generic({ producedBy: { agentId: 'someone-else' } }))).toContain('producedBy.agentId');
  });

  it('s8304 rejects an asset of another scope and names the field without the foreign value', () => {
    const result = DocumentPdfReceiptSchema.safeParse(plan({ asset: asset({ tenantId: 'tenant-SECRET-b' }) }));
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.map((issue) => issue.path.join('.'))).toContain('asset.tenantId');
    expect(JSON.stringify(result.error.issues)).not.toContain('tenant-SECRET-b');
    expect(paths(plan({ asset: asset({ companyId: 'client-2' }) }))).toContain('asset.companyId');
    expect(paths(plan({ asset: asset({ projectId: 'project-2' }) }))).toContain('asset.projectId');
  });

  it('s8304 rejects missing renderer, font set and plan versions', () => {
    expect(DocumentPdfReceiptSchema.safeParse(generic({ renderer: { name: 'pdfmake' } })).success).toBe(false);
    expect(DocumentPdfReceiptSchema.safeParse(generic({ renderer: { name: 'pdfmake', version: '^0.2' } })).success).toBe(false);
    expect(DocumentPdfReceiptSchema.safeParse(generic({ fontSet: { name: 'roboto-embedded' } })).success).toBe(false);
    expect(DocumentPdfReceiptSchema.safeParse(plan({
      source: { kind: 'action_plan', planId: 'plan_0001', digest: hex('a') },
    })).success).toBe(false);
  });

  it('s8304 does not accept the PDF SHA in place of the plan digest or the data digest', () => {
    expect(paths(plan({
      source: { kind: 'action_plan', planId: 'plan_0001', version: 3, digest: hex('c') },
      deliveryContext: { ...context(), planDigest: hex('c') },
    }))).toContain('source.digest');
    expect(paths(generic({ documentDigest: hex('c'), source: { kind: 'document', sha256: hex('c') } })))
      .toContain('documentDigest');
  });

  it('s8304 requires a delivery context that matches the source for plan and dossier, and forbids it for generic', () => {
    const { deliveryContext: _a, ...planNoContext } = plan();
    const { deliveryContext: _b, ...dossierNoContext } = dossier();
    expect(paths(planNoContext)).toContain('deliveryContext');
    expect(paths(dossierNoContext)).toContain('deliveryContext');
    expect(paths(plan({ deliveryContext: { ...context(), planVersion: 4 } }))).toContain('deliveryContext');
    expect(paths(dossier({ deliveryContext: { ...context(), dossierDigest: hex('e') } }))).toContain('deliveryContext');
    expect(paths(generic({ deliveryContext: context() }))).toContain('deliveryContext');
  });

  it('s8304 rejects an empty asset and a source digest that disagrees with the document data', () => {
    expect(paths(generic({ asset: asset({ sizeBytes: 0 }) }))).toContain('asset.sizeBytes');
    expect(paths(generic({ source: { kind: 'document', sha256: hex('e') } }))).toContain('source.sha256');
  });
});
