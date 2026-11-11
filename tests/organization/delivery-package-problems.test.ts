import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  DELIVERY_PACKAGE_PROBLEM_CODES,
  deliveryPackageProblems,
} from '../../src/organization/delivery-package.js';
import {
  DevSessionAssignmentSchema,
  devSessionAssignmentCanonicalJson,
  parseDevSessionBlock,
  renderDevSessionBlock,
} from '../../src/capability/dev/session-assignment.js';

// Digest of the canonical text of the assignment below, computed on HEAD 1.160.0 before the field existed.
const TODAY_DIGEST = 'ef2cee93f58924724cca6a0825213e34266596cc93dc97e6b72b7169261b47e7';

const asset = {
  assetId: 'asset-design-1',
  sha256: 'a'.repeat(64),
  name: 'home.png',
  mediaType: 'image/png',
  sizeBytes: 2048,
  origin: { kind: 'email' as const, messageId: 'msg-1', attachmentName: 'home.png' },
  tenantId: 'tenant-1',
  companyId: 'good-choice',
  projectId: 'good-choice-app',
  createdAt: '2026-10-27T10:00:00+01:00',
};

const assignment = {
  version: 1 as const,
  tenantId: 'tenant-1',
  ownerId: '7',
  organizationId: 'good-choice',
  companyId: 'good-choice',
  projectId: 'good-choice-app',
  businessUnit: { slug: 'sviluppo' },
  requestedBy: { managementAgentId: 'capo-sviluppo', runtimeAgentId: 'capo-sviluppo', vaultAgentId: 62 },
  productKind: 'code' as const,
  title: 'Modulo A: scansione prodotto',
  task: 'Costruisci il Modulo A come PWA con test.',
  miniPlan: '1. Struttura. 2. Scansione. 3. Test.',
  materials: [
    { kind: 'asset' as const, asset },
    { kind: 'github_link' as const, url: 'https://github.com/App-Templates/gz-mockups/tree/main/home', note: 'prototipi' },
  ],
  destination: { repo: 'App-Templates/goodchoice-backtest' },
  createdAt: '2026-10-27T15:00:00+01:00',
};

const pkg = () => ({
  version: 1,
  title: 'Home redesign',
  forReferent: {
    whatIs: 'A redesign of the home page.',
    whatToLook: 'The two key screens.',
    whatToDecide: 'Approve the direction.',
    limits: ['No dark mode yet.'],
  },
  keyScreens: [
    { path: 'design/home.png', caption: 'Home' },
    { path: 'design/detail.png', caption: 'Detail' },
  ],
  overviewSheet: { path: 'design/panoramica.pdf' },
  preview: { path: 'design/anteprima.html' },
  documents: [{ path: 'design/revisione.pdf', caption: 'Review' }],
});

const ALL = [
  'CONSEGNA.json',
  'design/home.png',
  'design/detail.png',
  'design/panoramica.pdf',
  'design/anteprima.html',
  'design/revisione.pdf',
];
const digest = (text: string) => createHash('sha256').update(text).digest('hex');

describe('s6308 foglio-firmato: the signed assignment says whether the delivery package is required, the same for code and design, and deliveryPackageProblems names every missing cited file and every second manifest', () => {
  it('accepts deliveryPackage on code and design assignments and signs it in the canonical text', () => {
    for (const productKind of ['code', 'design'] as const) {
      const signed = { ...assignment, productKind, deliveryPackage: 'required' as const };
      expect(DevSessionAssignmentSchema.safeParse(signed).success).toBe(true);
      expect(devSessionAssignmentCanonicalJson(signed)).toContain('"deliveryPackage":"required"');
    }
    expect(DevSessionAssignmentSchema.safeParse({ ...assignment, deliveryPackage: 'maybe' }).success).toBe(false);
  });

  it('lists nothing for a complete delivery', () => {
    expect(DELIVERY_PACKAGE_PROBLEM_CODES).toContain('manifest_not_at_root');
    expect(deliveryPackageProblems(pkg(), ALL)).toEqual([]);
  });

  it('names a cited file missing from the delivery', () => {
    const delivered = ALL.filter((path) => path !== 'design/revisione.pdf');
    expect(deliveryPackageProblems(pkg(), delivered)).toEqual([{ code: 'cited_file_missing', path: 'design/revisione.pdf' }]);
  });

  it('names a second manifest outside the root, together with the missing file', () => {
    const delivered = [...ALL.filter((path) => path !== 'design/revisione.pdf'), 'design/CONSEGNA.json'];
    expect(deliveryPackageProblems(pkg(), delivered)).toEqual([
      { code: 'manifest_not_at_root', path: 'design/CONSEGNA.json' },
      { code: 'cited_file_missing', path: 'design/revisione.pdf' },
    ]);
    expect(deliveryPackageProblems(pkg(), [...ALL, 'design/CONSEGNA.json'])).toEqual([
      { code: 'manifest_not_at_root', path: 'design/CONSEGNA.json' },
    ]);
  });

  it('names the manifest missing from the root', () => {
    expect(deliveryPackageProblems(pkg(), ALL.slice(1))).toEqual([{ code: 'manifest_missing' }]);
    expect(deliveryPackageProblems(pkg(), [...ALL.slice(1), 'design/CONSEGNA.json'])).toEqual([
      { code: 'manifest_missing' },
      { code: 'manifest_not_at_root', path: 'design/CONSEGNA.json' },
    ]);
  });

  it('gives one invalid_package per schema problem', () => {
    const bad = { ...pkg(), extra: true, title: '' };
    const problems = deliveryPackageProblems(bad, ALL);
    expect(problems).toHaveLength(2);
    expect(problems.every((problem) => problem.code === 'invalid_package')).toBe(true);
    expect(problems.map((problem) => problem.path).sort()).toEqual(['', 'title']);
    expect(problems.every((problem) => typeof problem.message === 'string')).toBe(true);
  });

  it('treats an absent package as invalid', () => {
    expect(deliveryPackageProblems(undefined, ALL).map((problem) => problem.code)).toEqual(['invalid_package']);
  });

  it('keeps the signature of an assignment written today and reads today\'s block (dry run on production shapes)', () => {
    expect(digest(devSessionAssignmentCanonicalJson(assignment))).toBe(TODAY_DIGEST);
    const block = renderDevSessionBlock(assignment, TODAY_DIGEST);
    expect(block).not.toContain('deliveryPackage');
    const parsed = parseDevSessionBlock(`Body\n\n${block}`);
    expect(parsed.ok && parsed.digest).toBe(TODAY_DIGEST);
    expect(parsed.ok && parsed.assignment.deliveryPackage).toBeUndefined();
  });
});
