import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { constants, Script } from 'node:vm';
import { beforeAll, describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../..');
const require = createRequire(import.meta.url);
const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
type Mod = Record<string, unknown>;
type Schema = {
  parse(value: unknown): Record<string, unknown>;
  safeParse(value: unknown): { success: boolean; data?: unknown };
};
type Snapshot = {
  snapshotId: string; manifestDigest: string; scope: { kind: string }; pages: unknown[]; complete: boolean;
};
// Native Node loaders exercise emitted code without Vitest transforming its dependency graph.
const nativeImport = new Script('(specifier) => import(specifier)', {
  importModuleDynamically: constants.USE_MAIN_CONTEXT_DEFAULT_LOADER,
}).runInThisContext() as (specifier: string) => Promise<Mod>;
const paths = {
  capability: 'capability/index',
  tools: 'capability/document-tools',
  dossier: 'capability/lab/dossier',
  endpoint: 'http/endpoints/internal-capability-lab-dossier',
  decisions: 'organization/decision-request',
  plans: 'organization/action-plan',
} as const;
type Entry = keyof typeof paths;
type Mode = 'ESM' | 'CJS';
const load = async (mode: Mode, entry: Entry): Promise<Mod> => {
  const subpath = entry === 'capability' ? 'capability' : paths[entry];
  const specifier = `@x9-forge/contracts/${subpath}`;
  const key = `./${subpath}`;
  const exported = manifest.exports[key] ?? manifest.exports[`./${subpath.split('/')[0]}/*`];
  const remainder = subpath.slice(subpath.indexOf('/') + 1);
  const target = (mode === 'ESM' ? exported.import : exported.require).replace('*', remainder);
  const file = resolve(root, target);
  expect(file).toBe(resolve(root, `dist/${paths[entry]}.${mode === 'ESM' ? 'js' : 'cjs'}`));
  if (mode === 'CJS') {
    expect(require.resolve(specifier)).toBe(file);
    return require(specifier) as Mod;
  }
  return nativeImport(pathToFileURL(file).href);
};

it('s8317 reserves exactly version 1.324.0', () => {
  expect(manifest.version).toBe('1.324.0');
});

for (const mode of ['ESM', 'CJS'] as const) {
  describe(`s8317 ${mode} reference-only dossier inputs`, () => {
    let tools: Record<string, Schema> & { DOCUMENT_PDF_MAX_BYTES: number };
    let capability: Record<string, Schema>;
    let dossier: Record<string, Schema> & { buildLabDossierSnapshot(value: unknown): Snapshot };
    let endpoint: Record<string, Schema> & { internalLabDossierSnapshotContract: { bodySchema: Schema } };
    beforeAll(async () => {
      tools = await load(mode, 'tools') as typeof tools;
      capability = await load(mode, 'capability') as typeof capability;
      dossier = await load(mode, 'dossier') as typeof dossier;
      endpoint = await load(mode, 'endpoint') as typeof endpoint;
    });
    const hex = (char: string) => char.repeat(64);

    const references = (tenant = 'tenant-a', organization = 'org-1', project = 'project-1') => ({
      tenantId: tenant,
      organizationId: organization,
      clientId: 'client-1',
      projectId: project,
      snapshotId: 'snap-1',
      scope: { kind: 'project' as const, clientId: 'client-1', projectId: project },
      planId: 'plan_001',
      planVersion: 3,
      planDigest: hex('a'),
    });
    const pdfReferenceInput = (refs: unknown = references()) => ({ kind: 'lab_dossier', language: 'en', references: refs });
    const labReferenceInput = (refs: unknown = references()) => ({
      references: refs,
      planCitations: [{ slug: 'analysis', version: 1 }, { slug: 'shared', version: 2, notebookAgentId: 'agent-lab-a' }],
    });
    const runContext = (organizationId = 'org-1', agent = 'agent-x9') => ({
      schemaVersion: 1,
      runId: 'run-1',
      organizationId,
      ownerId: 'owner-1',
      identity: { managementAgentId: agent, runtimeAgentId: agent, vaultAgentId: 7 },
      issuer: 'x9',
      issuedAt: '2026-11-23T10:00:00.000Z',
      expiresAt: '2026-11-23T11:00:00.000Z',
    });

    // A historical complete body, built with the real builder, to prove the old inputs keep their parse.
    const page = (slug: string) => ({
      notebookAgentId: 'agent-lab-a', slug, version: 1, role: 'current' as const,
      title: `Title ${slug}`, body: `Body of ${slug}`, digest: hex('d'),
    });
    const historicalInput = () => ({
      tenantId: 'tenant-a', organizationId: 'org-1', clientId: 'client-1', projectId: 'project-1',
      snapshotId: 'snap-9', cutoff: '2026-11-23T10:00:00.000Z',
      scope: { kind: 'client' as const, clientId: 'client-1' },
      pages: [page('b'), page('a')],
      planCitations: [{ slug: 'a', version: 1 }],
      sources: [],
    });
    const historicalSnapshot = () => dossier.buildLabDossierSnapshot(historicalInput());
    const historicalDelivery = () => {
      const snapshot = historicalSnapshot();
      return {
        planId: 'plan_001', planVersion: 1, planDigest: hex('a'),
        dossierSnapshotId: snapshot.snapshotId, dossierDigest: snapshot.manifestDigest,
      };
    };
    const genericDocument = () => ({
      kind: 'document',
      document: {
        title: 'Report', language: 'en', source: { kind: 'document', id: 'report' },
        blocks: [{ kind: 'paragraph', content: [{ text: 'Complete final paragraph' }] }],
      },
      language: 'en',
    });

    const labBody = () => ({ context: runContext(), input: labReferenceInput() });

    it(`s8317 ${mode} exports the reference schemas from the existing subpaths`, () => {
      expect(dossier.LabDossierReferencesSchema).toHaveProperty('parse');
      expect(dossier.LabDossierReferenceRequestSchema).toHaveProperty('parse');
      expect(tools.DocumentPdfReferencesInputSchema).toHaveProperty('parse');
      expect(tools.DocumentPdfRequestSchema).toHaveProperty('parse');
      expect(capability.DocumentPdfRequestSchema).toBe(tools.DocumentPdfRequestSchema);
      expect(endpoint.InternalLabDossierSnapshotRequestSchema).toHaveProperty('parse');
    });

    it(`s8317 ${mode} accepts reference-only PDF inputs for two tenants without a caller snapshot`, () => {
      for (const refs of [references('tenant-a', 'org-1', 'project-1'), references('tenant-b', 'org-2', 'project-9')]) {
        const input = pdfReferenceInput(refs);
        expect(tools.DocumentPdfReferencesInputSchema?.safeParse(input).success ?? false).toBe(true);
        expect(tools.DocumentPdfReferencesInputSchema.parse(input)).toEqual(input);
        expect(tools.DocumentPdfRequestSchema.parse(input)).toEqual(input);
        expect(Object.keys(tools.DocumentPdfRequestSchema.parse(input)).sort()).toEqual(['kind', 'language', 'references']);
        expect(Object.keys(refs).sort()).not.toContain('pages');
      }
    });

    it(`s8317 ${mode} accepts reference-only Lab HTTP bodies for two tenants without a caller snapshot`, () => {
      for (const [organization, tenant, agent] of [['org-1', 'tenant-a', 'agent-x9'], ['org-2', 'tenant-b', 'agent-forge']] as const) {
        const body = { context: runContext(organization, agent), input: labReferenceInput(references(tenant, organization)) };
        const parsed = endpoint.internalLabDossierSnapshotContract.bodySchema.parse(body);
        expect(parsed).toEqual(body);
        expect(parsed.input).not.toHaveProperty('pages');
        expect(parsed.input).not.toHaveProperty('cutoff');
        expect(parsed.input).not.toHaveProperty('sources');
      }
    });

    it(`s8317 ${mode} keeps the renderer input complete: a reference input is not a renderer source`, () => {
      expect(tools.DocumentPdfInputSchema.safeParse(pdfReferenceInput()).success).toBe(false);
      expect(endpoint.InternalLabDossierSnapshotResponseSchema.safeParse({ ok: true, snapshot: references() }).success).toBe(false);
      expect(dossier.LabDossierSnapshotSchema.safeParse(references()).success).toBe(false);
      expect(dossier.LabDossierSnapshotInputSchema.safeParse(labReferenceInput().references).success).toBe(false);
    });

    it(`s8317 ${mode} keeps historical inputs and stored values identical`, () => {
      const snapshot = historicalSnapshot();
      const dossierInput = { kind: 'lab_dossier', snapshot, language: 'en', deliveryContext: historicalDelivery() };
      for (const input of [dossierInput, genericDocument()]) {
        expect(tools.DocumentPdfRequestSchema.parse(input)).toEqual(tools.DocumentPdfInputSchema.parse(input));
        expect(tools.DocumentPdfRequestSchema.parse(input)).toEqual(input);
      }
      const body = { context: runContext(), input: historicalInput() };
      const parsed = endpoint.internalLabDossierSnapshotContract.bodySchema.parse(body);
      expect(parsed).toEqual(body);
      expect(parsed.input).toEqual(dossier.LabDossierSnapshotInputSchema.parse(historicalInput()));
      expect(dossier.LabDossierSnapshotSchema.parse(snapshot)).toEqual(snapshot);
      expect(endpoint.InternalLabDossierSnapshotResponseSchema.parse({ ok: true, snapshot })).toEqual({ ok: true, snapshot });
      // The historical client scope stays valid in the historical shapes.
      expect(snapshot.scope.kind).toBe('client');
    });

    it(`s8317 ${mode} rejects missing fields only in the new shape`, () => {
      for (const key of Object.keys(references())) {
        const { [key]: _removed, ...rest } = references() as Record<string, unknown>;
        expect(tools.DocumentPdfRequestSchema.safeParse(pdfReferenceInput(rest)).success, `pdf ${key}`).toBe(false);
        expect(endpoint.internalLabDossierSnapshotContract.bodySchema.safeParse({ context: runContext(), input: labReferenceInput(rest) }).success, `lab ${key}`).toBe(false);
      }
      expect(endpoint.internalLabDossierSnapshotContract.bodySchema.safeParse({ context: runContext(), input: { references: references() } }).success).toBe(false);
    });

    it(`s8317 ${mode} rejects an invalid plan triple`, () => {
      for (const edit of [{ planVersion: 0 }, { planVersion: 1.5 }, { planVersion: -1 }, { planDigest: 'xyz' }, { planDigest: hex('A') }, { planId: 'x' }]) {
        const refs = { ...references(), ...edit };
        expect(tools.DocumentPdfRequestSchema.safeParse(pdfReferenceInput(refs)).success, JSON.stringify(edit)).toBe(false);
        expect(dossier.LabDossierReferencesSchema.safeParse(refs).success, JSON.stringify(edit)).toBe(false);
      }
    });

    it(`s8317 ${mode} rejects incompatible tenant, project and scope`, () => {
      const refs = references();
      for (const edit of [
        { scope: { kind: 'client', clientId: 'client-1' } },
        { scope: { kind: 'project', clientId: 'client-2', projectId: 'project-1' } },
        { scope: { kind: 'project', clientId: 'client-1', projectId: 'project-2' } },
        { scope: { kind: 'project', clientId: 'client-1' } },
        { tenantId: '' },
        { projectId: '' },
      ]) {
        expect(dossier.LabDossierReferencesSchema.safeParse({ ...refs, ...edit }).success, JSON.stringify(edit)).toBe(false);
        expect(tools.DocumentPdfRequestSchema.safeParse(pdfReferenceInput({ ...refs, ...edit })).success, JSON.stringify(edit)).toBe(false);
      }
    });

    it(`s8317 ${mode} rejects unknown fields and hybrid new-and-old payloads`, () => {
      const snapshot = historicalSnapshot();
      const unknown = { ...references(), extra: 1 };
      expect(dossier.LabDossierReferencesSchema.safeParse(unknown).success).toBe(false);
      expect(tools.DocumentPdfRequestSchema.safeParse({ ...pdfReferenceInput(), extra: true }).success).toBe(false);
      expect(tools.DocumentPdfRequestSchema.safeParse({ ...pdfReferenceInput(), snapshot }).success).toBe(false);
      expect(tools.DocumentPdfRequestSchema.safeParse({ ...pdfReferenceInput(), deliveryContext: historicalDelivery() }).success).toBe(false);
      expect(tools.DocumentPdfRequestSchema.safeParse({
        kind: 'lab_dossier', language: 'en', snapshot, deliveryContext: historicalDelivery(), references: references(),
      }).success).toBe(false);
      const body = (input: unknown) => ({ context: runContext(), input });
      const contract = endpoint.internalLabDossierSnapshotContract.bodySchema;
      expect(contract.safeParse(body({ ...labReferenceInput(), pages: historicalInput().pages })).success).toBe(false);
      expect(contract.safeParse(body({ ...labReferenceInput(), cutoff: '2026-11-23T10:00:00.000Z' })).success).toBe(false);
      expect(contract.safeParse(body({ ...historicalInput(), references: references() })).success).toBe(false);
    });

    it(`s8317 ${mode} rejects a partial photograph passed off as a response`, () => {
      const snapshot = historicalSnapshot();
      const response = endpoint.InternalLabDossierSnapshotResponseSchema;
      expect(response.safeParse({ ok: true, snapshot: { ...snapshot, pages: [] } }).success).toBe(false);
      expect(response.safeParse({ ok: true, snapshot: { ...snapshot, pages: snapshot.pages.slice(0, 1) } }).success).toBe(false);
      expect(response.safeParse({ ok: true, snapshot: { ...snapshot, totalPages: 5 } }).success).toBe(false);
      expect(response.safeParse({ ok: true, snapshot: { ...snapshot, complete: false } }).success).toBe(false);
      expect(response.safeParse({ ok: true, snapshot: { ...snapshot, manifestDigest: hex('e') } }).success).toBe(false);
      const { complete: _complete, ...withoutComplete } = snapshot;
      expect(response.safeParse({ ok: true, snapshot: withoutComplete }).success).toBe(false);
      expect(response.safeParse({ ok: true, snapshot: references() }).success).toBe(false);
    });

    it(`s8317 ${mode} applies the cumulative UTF-8 limit to the new PDF input`, () => {
      const big = { ...references(), tenantId: 'é'.repeat(tools.DOCUMENT_PDF_MAX_BYTES) };
      expect(tools.DocumentPdfReferencesInputSchema.safeParse(pdfReferenceInput(big)).success).toBe(false);
      expect(tools.DocumentPdfRequestSchema.safeParse(pdfReferenceInput(big)).success).toBe(false);
    });

    it(`s8317 ${mode} rejects a foreign reference organization`, () => {
      // Internally coherent references, but their organization differs from the signed run context.
      const body = { context: runContext('org-1'), input: labReferenceInput(references('tenant-a', 'org-2')) };
      expect(dossier.LabDossierReferencesSchema.safeParse(references('tenant-a', 'org-2')).success).toBe(true);
      const result = endpoint.internalLabDossierSnapshotContract.bodySchema.safeParse(body);
      expect(result.success).toBe(false);
    });

    it(`s8317 ${mode} rejects a foreign reference project`, () => {
      // Same body, other valid shape: only scope.projectId differs from projectId.
      const foreign = { ...references(), scope: { kind: 'project' as const, clientId: 'client-1', projectId: 'project-2' } };
      const result = endpoint.internalLabDossierSnapshotContract.bodySchema.safeParse({
        context: runContext(), input: labReferenceInput(foreign),
      });
      expect(result.success).toBe(false);
    });

    it(`s8317 ${mode} exposes all 9 expected runtime symbol slots and portable declarations`, async () => {
      const symbols = {
        capability: ['DocumentPdfReferencesInputSchema', 'DocumentPdfRequestSchema'],
        tools: ['DocumentPdfReferencesInputSchema', 'DocumentPdfRequestSchema'],
        dossier: ['LabDossierReferencesSchema', 'LabDossierReferenceRequestSchema'],
        endpoint: ['InternalLabDossierSnapshotRequestSchema', 'InternalLabDossierSnapshotResponseSchema', 'internalLabDossierSnapshotContract'],
      } as const;
      for (const entry of Object.keys(symbols) as Array<keyof typeof symbols>) {
        const module = await load(mode, entry);
        for (const name of symbols[entry]) expect(module[name], `${entry}.${name}`).toBeDefined();
        const suffix = mode === 'ESM' ? 'd.ts' : 'd.cts';
        const declaration = readFileSync(resolve(root, `dist/${paths[entry]}.${suffix}`), 'utf8');
        if (entry === 'capability') {
          expect(declaration).toMatch(/export \* from ['"]\.\/document-tools\.c?js['"]/);
        } else {
          for (const name of symbols[entry]) {
            expect(declaration, `${entry} declaration for ${name}`).toContain(name);
            if (name.endsWith('Schema')) expect(declaration).toMatch(new RegExp(`export type ${name.slice(0, -6)}\\b`));
          }
        }
      }
    });

    const plan = async (): Promise<Record<string, unknown> & { digest: string }> => {
      const module = await load(mode, 'plans');
      const ActionPlanSchema = module.ActionPlanSchema as Schema;
      const actionPlanCanonicalJson = module.actionPlanCanonicalJson as (value: unknown) => string;
      const value = ActionPlanSchema.parse({
        planId: 'plan_001', version: 1, digest: hex('a'),
        tenantId: 'tenant-1', organizationId: 'org-1', clientId: 'client-1', projectId: 'project-1',
        objective: { request: 'Find clients', expectedResult: 'One contract', measure: 'Contracts' },
        analysis: {
          startingPoint: 'New service', marketAndAlternatives: { text: 'Outreach', sources: ['https://example.org/research'] },
          recommendedMethod: { method: 'Interviews', why: 'Validate demand' },
        },
        strategy: { approach: 'Start small', choices: ['Direct sales'], discardedAlternatives: [] },
        objectiveTree: { project: { expectedResult: 'One client', deliveryCriteria: ['Agreement'] }, businessUnits: [] },
        milestones: [{ number: 1, delivery: 'Report', buSlug: 'sales', closeCriterion: 'Accepted', blockedBy: [] }],
        criticalPath: [1], businessUnits: [{
          buSlug: 'sales', typeId: 'marketing', mandate: 'Find clients', competencies: ['outreach'],
          lead: { role: 'capo-bu' }, executor: 'agent', referent: { personRef: 'jane', entryVersion: 1 },
          firstActivities: ['Interview buyers'], start: { kind: 'now' },
        }], exchanges: [], budget: { currency: 'EUR', total: 0, perBu: [] },
        risks: [], assumptions: [], missingMaterials: [], questions: [],
        ifApproved: { startNow: ['sales'], startLater: [], verticalPlanDueBy: [], updates: { how: 'Report', every: 'Week' } },
      });
      return { ...value, digest: createHash('sha256').update(actionPlanCanonicalJson(value)).digest('hex') };
    };

    it(`s8317 ${mode} preserves action_plan and all historical receipt roles without documents`, async () => {
      const value = await plan();
      const input = {
        kind: 'action_plan', plan: value, language: 'en',
        deliveryContext: {
          planId: value.planId, planVersion: value.version, planDigest: value.digest,
          dossierSnapshotId: 'snap-9', dossierDigest: hex('b'),
        },
      };
      expect(tools.DocumentPdfRequestSchema.parse(input)).toEqual(input);
      expect(tools.DocumentPdfInputSchema.parse(input)).toEqual(input);
      expect(capability.DOCUMENT_PDF_RECEIPT_ROLES).toEqual(['action_plan', 'lab_dossier', 'document']);
      expect((await load(mode, 'dossier')).LAB_DOSSIER_PAGE_ROLES).toEqual(['current', 'cited_by_plan']);
      const errors = ['scope_foreign', 'dossier_empty', 'cited_version_missing', 'cited_version_ambiguous', 'dossier_too_large', 'snapshot_unavailable'];
      expect((await load(mode, 'endpoint')).LAB_DOSSIER_SNAPSHOT_ERRORS).toEqual(errors);
      for (const error of errors) {
        const body = { ok: false, error };
        expect(endpoint.InternalLabDossierSnapshotErrorSchema.parse(body)).toEqual(body);
      }
      const base = {
        schemaVersion: 1, tenantId: 'tenant-a', organizationId: 'org-1', clientId: 'client-1', projectId: 'project-1',
        documentDigest: hex('d'),
        asset: {
          assetId: 'asset_pdf_01', sha256: hex('c'), name: 'doc.pdf', mediaType: 'application/pdf', sizeBytes: 2048,
          origin: { kind: 'generated', agentId: 'agent-qa' }, tenantId: 'tenant-a', companyId: 'client-1',
          projectId: 'project-1', createdAt: '2026-11-23T10:00:00.000Z',
        },
        renderer: { name: 'pdfmake', version: '0.2.18' }, fontSet: { name: 'roboto-embedded', version: '1.0.0' },
        pageCount: 2, createdAt: '2026-11-23T10:00:01.000Z', producedBy: { agentId: 'agent-qa' },
      };
      for (const variant of [
        { role: 'document', source: { kind: 'document', sha256: hex('d') } },
        { role: 'action_plan', source: { kind: 'action_plan', planId: value.planId, version: value.version, digest: value.digest }, deliveryContext: input.deliveryContext },
        { role: 'lab_dossier', source: { kind: 'lab_dossier', snapshotId: 'snap-9', digest: hex('b') }, deliveryContext: input.deliveryContext },
      ]) {
        const receipt = { ...base, ...variant };
        expect(capability.DocumentPdfReceiptSchema.parse(receipt)).toEqual(receipt);
      }
      const decisions = await load(mode, 'decisions');
      for (const kind of ['action_plan', 'vertical_plan', 'confirmation']) {
        const request = {
          requestId: 'request_01', tenantId: 'tenant-a', organizationId: 'org-1', projectId: 'project-1',
          subject: { kind, planId: 'plan_0001', planVersion: 3, digest: hex('a') },
          question: 'Approve this plan?', options: [{ optionId: 'approve', label: 'Approve' }],
          requestedBy: { managementAgentId: 'agent-director', runtimeAgentId: 'agent-director', vaultAgentId: 1 },
          addressedTo: { ownerId: 'owner-1' }, channel: 'email', createdAt: '2026-11-23T10:00:02.000Z',
        };
        expect((decisions.DecisionRequestSchema as Schema).parse(request)).toEqual(request);
        const outcome = {
          requestId: request.requestId, subject: request.subject, outcome: 'approved', optionId: 'approve',
          decidedBy: { kind: 'owner', ownerId: 'owner-1' }, channel: 'email',
          decidedAt: '2026-11-23T12:00:00.000Z', sourceRef: 'email-message-1',
        };
        expect((decisions.DecisionOutcomeSchema as Schema).parse(outcome)).toEqual(outcome);
      }
    });

    it(`s8317 ${mode} matches the other reader on every valid and invalid matrix case`, async () => {
      const other = mode === 'ESM' ? 'CJS' : 'ESM';
      const modules = {
        tools: [await load(mode, 'tools'), await load(other, 'tools')],
        dossier: [await load(mode, 'dossier'), await load(other, 'dossier')],
        endpoint: [await load(mode, 'endpoint'), await load(other, 'endpoint')],
      };
      type Case = { entry: keyof typeof modules; name: string; input: unknown; valid: boolean };
      const cases: Case[] = [];
      const addReferences = (refs: unknown, valid: boolean) => {
        cases.push(
          { entry: 'dossier', name: 'LabDossierReferencesSchema', input: refs, valid },
          { entry: 'dossier', name: 'LabDossierReferenceRequestSchema', input: labReferenceInput(refs), valid },
          { entry: 'tools', name: 'DocumentPdfReferencesInputSchema', input: pdfReferenceInput(refs), valid },
          { entry: 'tools', name: 'DocumentPdfRequestSchema', input: pdfReferenceInput(refs), valid },
          { entry: 'endpoint', name: 'InternalLabDossierSnapshotRequestSchema', input: { context: runContext(), input: labReferenceInput(refs) }, valid },
        );
      };
      addReferences(references(), true);
      const secondTenant = references('tenant-b', 'org-2', 'project-9');
      cases.push(
        { entry: 'dossier', name: 'LabDossierReferencesSchema', input: secondTenant, valid: true },
        { entry: 'dossier', name: 'LabDossierReferenceRequestSchema', input: labReferenceInput(secondTenant), valid: true },
        { entry: 'tools', name: 'DocumentPdfReferencesInputSchema', input: pdfReferenceInput(secondTenant), valid: true },
        { entry: 'tools', name: 'DocumentPdfRequestSchema', input: pdfReferenceInput(secondTenant), valid: true },
        { entry: 'endpoint', name: 'InternalLabDossierSnapshotRequestSchema', input: { context: runContext('org-2'), input: labReferenceInput(secondTenant) }, valid: true },
      );
      for (const key of Object.keys(references())) {
        const { [key]: removed, ...rest } = references() as Record<string, unknown>;
        void removed;
        addReferences(rest, false);
      }
      for (const edit of [
        { planVersion: 0 }, { planVersion: 1.5 }, { planVersion: -1 }, { planDigest: 'xyz' }, { planDigest: hex('A') }, { planId: 'x' },
        { scope: { kind: 'client', clientId: 'client-1' } },
        { scope: { kind: 'project', clientId: 'client-2', projectId: 'project-1' } },
        { scope: { kind: 'project', clientId: 'client-1', projectId: 'project-2' } },
        { scope: { kind: 'project', clientId: 'client-1' } }, { tenantId: '' }, { projectId: '' }, { extra: true },
      ]) addReferences({ ...references(), ...edit }, false);
      const snapshot = historicalSnapshot();
      for (const edit of [
        { snapshot }, { pages: historicalInput().pages }, { cutoff: historicalInput().cutoff },
        { sources: [] }, { dossierDigest: snapshot.manifestDigest }, { deliveryContext: historicalDelivery() }, { extra: true },
      ]) {
        cases.push(
          { entry: 'tools', name: 'DocumentPdfRequestSchema', input: { ...pdfReferenceInput(), ...edit }, valid: false },
          { entry: 'endpoint', name: 'InternalLabDossierSnapshotRequestSchema', input: { context: runContext(), input: { ...labReferenceInput(), ...edit } }, valid: false },
        );
      }
      for (const changed of [
        references(), { ...snapshot, pages: [] }, { ...snapshot, pages: snapshot.pages.slice(0, 1) },
        { ...snapshot, totalPages: 5 }, { ...snapshot, complete: false }, { ...snapshot, manifestDigest: hex('e') },
      ]) cases.push({ entry: 'endpoint', name: 'InternalLabDossierSnapshotResponseSchema', input: { ok: true, snapshot: changed }, valid: false });
      const { complete: removed, ...incomplete } = snapshot as Snapshot & { complete?: boolean };
      void removed;
      cases.push(
        { entry: 'endpoint', name: 'InternalLabDossierSnapshotResponseSchema', input: { ok: true, snapshot: incomplete }, valid: false },
        { entry: 'endpoint', name: 'InternalLabDossierSnapshotResponseSchema', input: { ok: true, snapshot }, valid: true },
        { entry: 'endpoint', name: 'InternalLabDossierSnapshotRequestSchema', input: { context: runContext(), input: historicalInput() }, valid: true },
        { entry: 'endpoint', name: 'InternalLabDossierSnapshotRequestSchema', input: { context: runContext(), input: { references: references() } }, valid: false },
        { entry: 'endpoint', name: 'InternalLabDossierSnapshotRequestSchema', input: { context: runContext(), input: { ...historicalInput(), references: references() } }, valid: false },
        { entry: 'endpoint', name: 'InternalLabDossierSnapshotRequestSchema', input: { context: runContext(), input: labReferenceInput(references('tenant-a', 'org-2')) }, valid: false },
        { entry: 'tools', name: 'DocumentPdfRequestSchema', input: { kind: 'lab_dossier', snapshot, language: 'en', deliveryContext: historicalDelivery() }, valid: true },
        { entry: 'tools', name: 'DocumentPdfRequestSchema', input: genericDocument(), valid: true },
        { entry: 'tools', name: 'DocumentPdfInputSchema', input: pdfReferenceInput(), valid: false },
        { entry: 'tools', name: 'DocumentPdfRequestSchema', input: pdfReferenceInput({ ...references(), tenantId: 'é'.repeat(tools.DOCUMENT_PDF_MAX_BYTES) }), valid: false },
      );
      expect(cases).toHaveLength(150);
      for (const pair of Object.values(modules)) {
        const names = (module: Mod) => Object.keys(module).filter(name => name !== 'default' && name !== '__esModule').sort();
        expect(names(pair[0])).toEqual(names(pair[1]));
      }
      for (const [index, sample] of cases.entries()) {
        const results = modules[sample.entry].map(module => {
          const result = (module[sample.name] as Schema).safeParse(sample.input);
          return result.success ? { success: true, data: result.data } : { success: false };
        });
        expect(results[0].success, `matrix case ${index}: ${sample.name}`).toBe(sample.valid);
        expect(results[1], `matrix case ${index}: ${sample.name}`).toEqual(results[0]);
      }
    });
  });
}
