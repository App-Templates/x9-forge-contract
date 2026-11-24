import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { constants, Script } from 'node:vm';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../..');
const require = createRequire(import.meta.url);
const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

const SUBPATHS = {
  capability: 'dist/capability/index',
  lab: 'dist/capability/lab/index',
  http: 'dist/http/index',
  'organization/decision-request': 'dist/organization/decision-request',
} as const;
type Subpath = keyof typeof SUBPATHS;
type Mod = Record<string, unknown>;

// Use Node's native loader: Vitest otherwise transforms the entire built dependency graph.
const nativeImport = new Script('(specifier) => import(specifier)', {
  importModuleDynamically: constants.USE_MAIN_CONTEXT_DEFAULT_LOADER,
}).runInThisContext() as (specifier: string) => Promise<Mod>;
const esm = (name: Subpath) => nativeImport(pathToFileURL(resolve(root, `${SUBPATHS[name]}.js`)).href);
const cjs = (name: Subpath) => require(resolve(root, `${SUBPATHS[name]}.cjs`)) as Mod;

const NEW_SYMBOLS: Record<Subpath, string[]> = {
  capability: [
    'DocumentDataSchema', 'documentDataCanonicalJson', // 8303
    'DocumentPdfReceiptSchema', 'DocumentPdfReceiptSourceSchema', 'DocumentPdfDeliveryContextSchema',
    'DocumentPdfReceiptRoleSchema', 'DOCUMENT_PDF_RECEIPT_ROLES', // 8304
    'DOCUMENT_PDF_TOOL', 'DocumentPdfInputSchema', 'DocumentPdfOutputSchema', // 8307
  ],
  lab: [
    'LabDossierSnapshotSchema', 'LabDossierSnapshotInputSchema', 'buildLabDossierSnapshot',
    'labDossierManifestDigest', 'labDossierCanonicalJson', 'LAB_DOSSIER_PAGE_ROLES', // 8305
    'LabDossierPageSchema', 'LabDossierSourceSchema', 'LabDossierPageIdentitySchema',
    'LabDossierPlanCitationSchema', 'LabDossierPageRoleSchema', 'LAB_DOSSIER_MAX_PAGES', 'LAB_DOSSIER_MAX_SOURCES',
  ],
  http: [
    'internalLabDossierSnapshotContract', 'internalLabDossierSnapshotPath',
    'InternalLabDossierSnapshotRequestSchema', 'InternalLabDossierSnapshotResponseSchema',
    'InternalLabDossierSnapshotErrorSchema', 'LAB_DOSSIER_SNAPSHOT_ERRORS', // 8306
  ],
  'organization/decision-request': [
    'ActionPlanDecisionSubjectSchema', 'actionPlanPdfDeliveryProblems', 'DecisionRequestSchema', // 8308
  ],
};

const hex = (char: string) => char.repeat(64);
const receipt = (over: Record<string, unknown> = {}) => ({
  schemaVersion: 1,
  tenantId: 'tenant-a',
  organizationId: 'org-1',
  clientId: 'client-1',
  projectId: 'project-1',
  documentDigest: hex('d'),
  asset: {
    assetId: 'asset_pdf_01', sha256: hex('c'), name: 'doc.pdf', mediaType: 'application/pdf',
    sizeBytes: 2048, origin: { kind: 'generated', agentId: 'agent-qa' }, tenantId: 'tenant-a',
    companyId: 'client-1', projectId: 'project-1', createdAt: '2026-11-23T10:00:00.000Z',
  },
  renderer: { name: 'pdfmake', version: '0.2.18' },
  fontSet: { name: 'roboto-embedded', version: '1.0.0' },
  pageCount: 2,
  createdAt: '2026-11-23T10:00:01.000Z',
  producedBy: { agentId: 'agent-qa' },
  role: 'document',
  source: { kind: 'document', sha256: hex('d') },
  ...over,
});
const falseReceipt = () => receipt({ asset: { ...receipt().asset, mediaType: 'text/markdown' } });
type Schema = { parse(v: unknown): unknown; safeParse(v: unknown): { success: boolean } };
type Snapshot = { pages: Array<{ body: string }>; manifestDigest: string; totalPages: number };
const dossierInput = () => ({
  tenantId: 'tenant-a', organizationId: 'org-1', clientId: 'client-1', projectId: 'project-1',
  snapshotId: 'snap-1', cutoff: '2026-11-23T10:00:00.000Z',
  scope: { kind: 'project', clientId: 'client-1', projectId: 'project-1' },
  pages: Array.from({ length: 64 }, (_, i) => ({
    notebookAgentId: 'agent-lab', slug: `topic-${String(i).padStart(2, '0')}`, version: 1,
    role: i === 63 ? 'cited_by_plan' : 'current', title: `Topic ${i}`, body: `Complete page ${i}`, digest: hex('a'),
  })),
  planCitations: [{ notebookAgentId: 'agent-lab', slug: 'topic-63', version: 1 }], sources: [],
});

describe('s8309 built package exports the PDF contracts', () => {
  it('s8309 built ESM and CJS export the same PDF contracts at least at version 1.318.0', () => {
    const [a, b] = [manifest.version as string, '1.318.0'].map((v) => v.split('.').map(Number));
    const newer = a[0] !== b[0] ? a[0] > b[0] : a[1] !== b[1] ? a[1] > b[1] : a[2] >= b[2];
    expect(newer).toBe(true);
  });

  it('s8309 native loaders start in both dependency orders with fresh module caches', () => {
    for (const mode of ['esm', 'cjs']) {
      for (const order of [Object.keys(SUBPATHS), Object.keys(SUBPATHS).reverse()]) {
        const script = `
          const { createRequire } = await import('node:module');
          const require = createRequire(import.meta.url);
          const result = {};
          for (const name of JSON.parse(process.argv[2])) {
            const path = '@x9-forge/contracts/' + (name === 'lab' ? 'capability/lab' : name);
            const mod = process.argv[1] === 'esm' ? await import(path) : require(path);
            result[name] = Object.keys(mod);
          }
          process.stdout.write(JSON.stringify(result));
        `;
        const loaded = JSON.parse(execFileSync(process.execPath,
          ['--input-type=module', '-e', script, mode, JSON.stringify(order)],
          { cwd: root, env: {}, encoding: 'utf8' })) as Record<Subpath, string[]>;
        for (const name of order as Subpath[]) {
          expect(loaded[name]).toEqual(expect.arrayContaining(NEW_SYMBOLS[name]));
        }
      }
    }
  });

  for (const name of Object.keys(SUBPATHS) as Subpath[]) {
    it(`s8309 ${name}: manifest points at the built files`, () => {
      const key = name === 'lab' ? './capability/lab' : `./${name}`;
      const entry = manifest.exports[key] ?? manifest.exports[`./${name.split('/')[0]}/*`];
      expect(entry.import).toContain('./dist/');
      expect(entry.require).toContain('./dist/');
    });

    it(`s8309 ${name}: ESM and CJS export identical names including the new symbols`, async () => {
      const [e, c] = [await esm(name), cjs(name)];
      const names = (m: Mod) => Object.keys(m).filter((k) => k !== 'default' && k !== '__esModule').sort();
      expect(names(e)).toEqual(names(c));
      for (const symbol of NEW_SYMBOLS[name]) {
        expect(e[symbol], `ESM ${symbol}`).toBeDefined();
        expect(c[symbol], `CJS ${symbol}`).toBeDefined();
        expect(typeof e[symbol]).toBe(typeof c[symbol]);
      }
    });
  }

  it('s8309 both entries accept a valid PDF receipt and refuse a false one', async () => {
    for (const mod of [await esm('capability'), cjs('capability')]) {
      const schema = mod.DocumentPdfReceiptSchema as { safeParse(v: unknown): { success: boolean } };
      expect(schema.safeParse(receipt()).success).toBe(true);
      expect(schema.safeParse(falseReceipt()).success).toBe(false);
      const output = mod.DocumentPdfOutputSchema as Schema;
      expect(output.parse({ receipt: receipt() })).toEqual({ receipt: receipt() });
      expect(output.safeParse({ receipt: falseReceipt() }).success).toBe(false);
      expect(output.safeParse({}).success).toBe(false);
      const input = mod.DocumentPdfInputSchema as Schema;
      const valid = { kind: 'document', markdown: '# Report\n\nComplete report.', language: 'en' };
      expect(input.parse(valid)).toEqual(valid);
      expect(input.safeParse({ ...valid, receipt: receipt() }).success).toBe(false);
    }
  });

  it('s8309 both entries keep historical decision requests parsing identically', async () => {
    const [e, c] = [await esm('organization/decision-request'), cjs('organization/decision-request')];
    const problems = [e.actionPlanPdfDeliveryProblems, c.actionPlanPdfDeliveryProblems] as Array<(r: unknown) => string[]>;
    expect(typeof problems[0]).toBe('function');
    expect(typeof problems[1]).toBe('function');
    const [a, b] = [e.DecisionRequestSchema, c.DecisionRequestSchema] as Schema[];
    expect(a.safeParse({}).success).toBe(false);
    expect(b.safeParse({}).success).toBe(false);
    for (const kind of ['action_plan', 'vertical_plan', 'confirmation']) {
      const historical = {
        requestId: 'request_01', tenantId: 'tenant-a', organizationId: 'org-1', projectId: 'project-1',
        subject: { kind, planId: 'plan_0001', planVersion: 3, digest: hex('a') },
        question: 'Approve this plan?', options: [{ optionId: 'approve', label: 'Approve' }],
        requestedBy: { managementAgentId: 'agent-director', runtimeAgentId: 'agent-director', vaultAgentId: 1 },
        addressedTo: { ownerId: 'owner-1' }, channel: 'email', createdAt: '2026-11-23T10:00:02.000Z',
      };
      for (const mod of [e, c]) {
        expect((mod.DecisionRequestSchema as Schema).parse(historical)).toEqual(historical);
        const outcome = {
          requestId: historical.requestId, subject: historical.subject, outcome: 'approved', optionId: 'approve',
          decidedBy: { kind: 'owner', ownerId: 'owner-1' }, channel: 'email',
          decidedAt: '2026-11-23T12:00:00.000Z', sourceRef: 'email-message-1',
        };
        expect((mod.DecisionOutcomeSchema as Schema).parse(outcome)).toEqual(outcome);
        const validate = mod.actionPlanPdfDeliveryProblems as (r: unknown) => string[];
        expect(validate(historical)).toEqual(kind === 'action_plan' ? ['missing_pdf_documents'] : []);
      }
    }
  });

  it('s8309 both entries digest a document and a dossier identically', async () => {
    const [ce, cc] = [await esm('capability'), cjs('capability')];
    const canon = [ce.documentDataCanonicalJson, cc.documentDataCanonicalJson] as Array<(v: unknown) => string>;
    const sample = {
      title: 'Analisi',
      language: 'it-IT',
      source: { kind: 'dossier', id: 'published-dossier', version: '7', sha256: 'a'.repeat(64) },
      blocks: [{ kind: 'paragraph', content: [{ text: 'Ultimo blocco' }] }],
    };
    expect(canon[0](sample)).toBe(canon[1](sample));
    expect(canon[0](sample)).toContain('Ultimo blocco');
    const [le, lc] = [await esm('lab'), cjs('lab')];
    const digest = [le.labDossierManifestDigest, lc.labDossierManifestDigest] as Array<(v: unknown) => string>;
    expect(typeof digest[0]).toBe('function');
    expect(typeof digest[1]).toBe('function');
    const snapshots = [le, lc].map((mod) => {
      const build = mod.buildLabDossierSnapshot as (v: unknown) => Snapshot;
      return build(dossierInput());
    });
    expect(snapshots[0]).toEqual(snapshots[1]);
    expect(snapshots[0].pages).toHaveLength(64);
    expect(snapshots[0].totalPages).toBe(64);
    for (const mod of [le, lc]) {
      const canonical = mod.labDossierCanonicalJson as (v: unknown) => string;
      const hash = mod.labDossierManifestDigest as (v: unknown) => string;
      const schema = mod.LabDossierSnapshotSchema as Schema;
      expect(schema.parse(snapshots[0])).toEqual(snapshots[0]);
      expect(hash(snapshots[0])).toBe(snapshots[0].manifestDigest);
      expect(hash(snapshots[0])).toBe(createHash('sha256').update(canonical(snapshots[0])).digest('hex'));
      const changed = { ...snapshots[0], pages: snapshots[0].pages.map((page, i) => i === 63 ? { ...page, body: 'Changed last page' } : page) };
      expect(hash(changed)).not.toBe(snapshots[0].manifestDigest);
      expect(schema.safeParse(changed).success).toBe(false);
      expect(schema.safeParse({ ...snapshots[0], pages: snapshots[0].pages.slice(0, 63) }).success).toBe(false);
    }
  });
});
