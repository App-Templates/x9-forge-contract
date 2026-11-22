import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  CompanyContractBreakSchema,
  CompanyContractInstanceSchema,
  CompanyContractRequirementSchema,
  CompanyContractsReadSchema,
  COMPANY_CONTRACT_TYPES,
  COMPANY_CONTRACTS_PACKAGE,
  companyContractCatalog,
  companyContractsNoBreakProven,
  companyContractsScopeProblem,
  internalCompanyContractsContract,
  internalDevCompanyContractsContract,
  internalPaperclipCompanyContractsContract,
} from '../../src/http/endpoints/internal-company-contracts.js';
import {
  DEV_SESSION_ACCEPTANCE_CATALOG,
  DEV_SESSION_TEMPLATES,
  DEV_SESSION_TEMPLATES_V2,
  devSessionAssignmentCanonicalJson,
  devSessionRequirements,
  parseDevSessionBlock,
} from '../../src/capability/dev/index.js';
import { AgentQuestionDetailsSchema, AgentRequestSchema } from '../../src/organization/agent-request.js';
import { ReconciledMandateSchema } from '../../src/organization/business-unit-mandate.js';
import { DecisionRequestSchema } from '../../src/organization/decision-request.js';
import { PaperclipLabRequestSchema } from '../../src/capability/paperclip/native-wait.js';

const SHA = 'a'.repeat(64);
const AT = '2026-11-22T10:00:00.000Z';
const SCOPE = { tenantId: 't1', ownerId: 'o1', organizationId: 'org1', clientId: 'c1', projectId: 'p1', unitId: 'u1' };
const NOT_KNOWN = (reason: string) => ({ state: 'non_noto' as const, reason });
const KNOWN = <T>(value: T) => ({ state: 'noto' as const, value, source: 'saved block' });

function instance(overrides: Record<string, unknown> = {}) {
  return {
    type: 'code_session', variant: 'sviluppo-pezzo-app', scope: SCOPE,
    reference: KNOWN({ kind: 'assignment', id: 'R56' }),
    digest: KNOWN(SHA),
    model: KNOWN({ templateId: 'sviluppo-pezzo-app', version: 1 }),
    nativeRevision: NOT_KNOWN('no revision recorded in the saved block'),
    author: NOT_KNOWN('the block names no author'),
    writtenAt: NOT_KNOWN('the block carries no date'),
    requirements: NOT_KNOWN('requirement snapshot is not reconstructable: template.version stayed 1'),
    ...overrides,
  };
}
const SOURCE_OK = { source: 'paperclip', complete: true, readAt: AT, sampledAt: AT };
function read(overrides: Record<string, unknown> = {}) {
  return {
    scope: SCOPE, published: { package: '@x9-forge/contracts', version: COMPANY_CONTRACTS_PACKAGE.version, commit: null },
    applied: [instance()], breaks: [],
    sources: [SOURCE_OK, { ...SOURCE_OK, source: 'dev' }],
    page: { complete: true, nextCursor: null },
    ...overrides,
  };
}
const BREAK = { assignment: 'GOO-56', requirementId: 'S-05', proof: 'proof/out.txt', origin: 'modello', source: 'dev' };

function fieldsOf(schema: z.ZodObject): { name: string; required: boolean }[] {
  return Object.entries(schema.shape).map(([name, field]) => ({ name, required: !(field as z.ZodType).isOptional() }));
}
const sortByName = <T extends { name: string }>(rows: T[]) => [...rows].sort((a, b) => a.name.localeCompare(b.name));

describe('s8207 catalog', () => {
  const catalog = companyContractCatalog();

  it('s8207 otto tipi esatti e tre varianti di design', () => {
    expect(COMPANY_CONTRACT_TYPES).toEqual([
      'mandate', 'code_session', 'design_session', 'referent_email', 'lab_request', 'chief_question', 'unit_exchange', 'document_unit',
    ]);
    expect([...new Set(catalog.map((entry) => entry.type))].sort()).toEqual([...COMPANY_CONTRACT_TYPES].sort());
    expect(catalog.filter((entry) => entry.type === 'design_session').map((entry) => entry.variant).sort())
      .toEqual(['design-ritocco', 'design-schermata-app', 'design-sito']);
    expect(catalog.filter((entry) => entry.type !== 'design_session')).toHaveLength(7);
  });

  it('s8207 i campi corrispondono agli schemi originali', () => {
    const expected: Record<string, z.ZodObject> = {
      mandate: ReconciledMandateSchema as unknown as z.ZodObject,
      referent_email: DecisionRequestSchema as unknown as z.ZodObject,
      lab_request: PaperclipLabRequestSchema as unknown as z.ZodObject,
      chief_question: AgentQuestionDetailsSchema as unknown as z.ZodObject,
      unit_exchange: AgentRequestSchema as unknown as z.ZodObject,
    };
    for (const [type, schema] of Object.entries(expected)) {
      const entry = catalog.find((candidate) => candidate.type === type)!;
      expect(sortByName(entry.fields), type).toEqual(sortByName(fieldsOf(schema)));
      expect(entry.origin.schema.length, type).toBeGreaterThan(0);
      expect(entry.published.package).toBe('@x9-forge/contracts');
    }
    const document = catalog.find((entry) => entry.type === 'document_unit')!;
    expect(document.fields.map((field) => field.name).sort()).toEqual(
      ['deliveryCriteria', 'documentFormat', 'documentSources', 'expectedGoal', 'id', 'title']);
    expect(document.fields.find((field) => field.name === 'id')?.required).toBe(true);
    expect(document.fields.find((field) => field.name === 'documentFormat')?.required).toBe(false);
  });

  it('s8207 le sessioni proiettano modelli e requisiti dal catalogo del ponte', () => {
    const code = catalog.find((entry) => entry.type === 'code_session')!;
    const [codeModel] = code.models;
    expect(codeModel!.version).toBe(DEV_SESSION_TEMPLATES['sviluppo-pezzo-app'].version);
    expect(codeModel!.requirements.filter((requirement) => !requirement.optional).map((requirement) => requirement.id)).toEqual([...DEV_SESSION_TEMPLATES['sviluppo-pezzo-app'].formCriteria]);
    expect(codeModel!.requirements.filter((requirement) => requirement.optional).map((requirement) => requirement.id)).toEqual([...DEV_SESSION_TEMPLATES['sviluppo-pezzo-app'].optionalCriteria]);
    for (const requirement of codeModel!.requirements) {
      const source = DEV_SESSION_ACCEPTANCE_CATALOG[requirement.id as keyof typeof DEV_SESSION_ACCEPTANCE_CATALOG];
      expect({ text: requirement.text, attestor: requirement.attestor, proof: requirement.proof })
        .toEqual({ text: source.text, attestor: source.attestor, proof: source.proof });
      expect(requirement.origin).toBe('modello');
    }
    for (const id of ['design-sito', 'design-schermata-app', 'design-ritocco'] as const) {
      const entry = catalog.find((candidate) => candidate.variant === id)!;
      expect(entry.models.map((model) => model.version)).toEqual([1, 2]);
      expect(entry.models[0]!.requirements.map((requirement) => requirement.id)).toEqual([...DEV_SESSION_TEMPLATES[id].formCriteria]);
      expect(entry.models[1]!.requirements.map((requirement) => requirement.id)).toEqual([...DEV_SESSION_TEMPLATES_V2[id].formCriteria]);
    }
    // The three design models stay distinct.
    const ids = catalog.filter((entry) => entry.type === 'design_session').map((entry) => entry.models[0]!.requirements.map((r) => r.id).join());
    expect(new Set(ids).size).toBe(3);
  });

  it('s8207 la versione assente ha il motivo e non si inventa v1', () => {
    for (const type of ['mandate', 'referent_email', 'lab_request', 'chief_question', 'document_unit'] as const) {
      const entry = catalog.find((candidate) => candidate.type === type)!;
      expect(entry.version.kind, type).toBe('absent');
      if (entry.version.kind === 'absent') expect(entry.version.reason.length).toBeGreaterThan(5);
    }
    const exchange = catalog.find((entry) => entry.type === 'unit_exchange')!;
    expect(exchange.version).toEqual({ kind: 'numeric', value: 1, from: 'schemaVersion' });
  });

  it('s8207 il catalogo pubblicato non dice «in vigore» e non finge lo snapshot storico', () => {
    for (const entry of catalog.filter((candidate) => candidate.type.endsWith('_session'))) {
      expect(entry.historicalSnapshot.state).toBe('non_noto');
      expect(entry).not.toHaveProperty('inForce');
    }
    expect(companyContractCatalog({ commit: 'abc1234' })[0]!.published.commit).toBe('abc1234');
    expect(catalog[0]!.published).toEqual({ package: '@x9-forge/contracts', version: COMPANY_CONTRACTS_PACKAGE.version, commit: null });
  });

  it('s8207 la versione del pacchetto è quella di package.json', () => {
    const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { version: string };
    expect(COMPANY_CONTRACTS_PACKAGE.version).toBe(pkg.version);
    expect(pkg.version).toBe('1.306.0');
  });
});

describe('s8207 istanze applicate', () => {
  it('s8207 autore e data assenti restano non noti, senza nome finto', () => {
    const parsed = CompanyContractInstanceSchema.parse(instance());
    expect(parsed.author).toEqual({ state: 'non_noto', reason: 'the block names no author' });
    expect(CompanyContractInstanceSchema.safeParse(instance({ author: { state: 'non_noto', reason: 'x unknown', value: 'Mario' } })).success).toBe(false);
    expect(CompanyContractInstanceSchema.safeParse(instance({ author: KNOWN('') })).success).toBe(false);
    expect(CompanyContractInstanceSchema.safeParse(instance({ author: { state: 'noto', value: 'Mario' } })).success).toBe(false);
    expect(CompanyContractInstanceSchema.safeParse(instance({ author: NOT_KNOWN('') })).success).toBe(false);
  });

  it('s8207 modello storico e catalogo corrente restano separati', () => {
    const historical = CompanyContractInstanceSchema.parse(instance());
    expect(historical.requirements.state).toBe('non_noto');
    expect(historical.model).toEqual(KNOWN({ templateId: 'sviluppo-pezzo-app', version: 1 }));
    expect(historical).not.toHaveProperty('published');
  });

  const requirement = { id: 'S-05', text: 'The path works', attestor: 'esecutore', proof: 'run output', origin: 'modello' };
  it('s8207 tutte le forme di stato dei requisiti', () => {
    const forms = [
      { state: 'noto', value: 'soddisfatto', proof: { path: 'a.txt', sha256: SHA }, proofOrigin: 'esecutore' },
      { state: 'noto', value: 'non_soddisfatto', reason: 'fails', responsible: 'capo', nextAction: 'fix it' },
      { state: 'noto', value: 'da_revisionare', reason: 'self written proof' },
      { state: 'noto', value: 'in_attesa', observed: 'attestation_absent' },
      { state: 'non_noto', reason: 'source unreachable' },
    ];
    for (const status of forms) expect(CompanyContractRequirementSchema.safeParse({ ...requirement, status }).success, JSON.stringify(status)).toBe(true);
  });

  it('s8207 uno stato non diventa verde senza prova', () => {
    const bad = [
      { state: 'noto', value: 'soddisfatto' },
      { state: 'non_noto', reason: 'x unknown', value: 'soddisfatto' },
      { state: 'noto', value: 'non_soddisfatto', reason: 'fails' },
      { state: 'noto', value: 'in_attesa' },
      { state: 'non_noto' },
      { state: 'noto', value: 'passed' },
    ];
    for (const status of bad) expect(CompanyContractRequirementSchema.safeParse({ ...requirement, status }).success, JSON.stringify(status)).toBe(false);
  });

  it('s8207 una rottura porta incarico, codice o requisito, prova, origine e fonte', () => {
    expect(CompanyContractBreakSchema.safeParse(BREAK).success).toBe(true);
    expect(CompanyContractBreakSchema.safeParse({ ...BREAK, requirementId: undefined, code: 'proof_missing' }).success).toBe(true);
    for (const key of ['assignment', 'proof', 'origin', 'source'] as const) {
      expect(CompanyContractBreakSchema.safeParse({ ...BREAK, [key]: undefined }).success, key).toBe(false);
    }
    expect(CompanyContractBreakSchema.safeParse({ ...BREAK, requirementId: undefined }).success).toBe(false);
    expect(CompanyContractBreakSchema.safeParse({ ...BREAK, blocked: true }).success).toBe(false);
    expect(CompanyContractBreakSchema.safeParse({ ...BREAK, source: '' }).success).toBe(false);
  });
});

describe('s8207 lettura', () => {
  it('s8207 lettura completa valida', () => {
    expect(CompanyContractsReadSchema.safeParse(read()).success).toBe(true);
  });

  it('s8207 la pagina incompleta è esplicita e non prova «nessuna rottura»', () => {
    const paged = read({ page: { complete: false, nextCursor: 'cur', reason: 'more pages' } });
    const parsed = CompanyContractsReadSchema.parse(paged);
    expect(companyContractsNoBreakProven(parsed)).toBe(false);
    expect(companyContractsNoBreakProven(CompanyContractsReadSchema.parse(read()))).toBe(true);
    expect(companyContractsNoBreakProven(CompanyContractsReadSchema.parse(read({ breaks: [BREAK] })))).toBe(false);
    expect(CompanyContractsReadSchema.safeParse(read({ page: { complete: false, nextCursor: 'cur' } })).success).toBe(false);
    expect(CompanyContractsReadSchema.safeParse(read({ page: { complete: true, nextCursor: 'cur' } })).success).toBe(false);
    const unreadable = { source: 'dev', complete: false, reason: 'cap-dev unreachable', readAt: null, sampledAt: null };
    const withGap = read({ sources: [SOURCE_OK, unreadable], page: { complete: true, nextCursor: null } });
    expect(CompanyContractsReadSchema.safeParse(withGap).success, 'complete page over an unread source').toBe(false);
    const honest = CompanyContractsReadSchema.parse(read({ sources: [SOURCE_OK, unreadable], page: { complete: false, nextCursor: null, reason: 'dev not read' } }));
    expect(companyContractsNoBreakProven(honest)).toBe(false);
  });

  it('s8207 le fonti dichiarano motivi, readAt e sampledAt', () => {
    const sources = z.array(CompanyContractsReadSchema.shape.sources.element);
    expect(sources.safeParse([{ ...SOURCE_OK, reason: 'x unknown' }]).success).toBe(false);
    expect(sources.safeParse([{ source: 'dev', complete: false, readAt: AT, sampledAt: null }]).success).toBe(false);
    expect(sources.safeParse([{ source: 'dev', complete: true, readAt: null, sampledAt: null }]).success).toBe(false);
    expect(sources.safeParse([{ source: 'dev', complete: true, readAt: AT }]).success).toBe(false);
    expect(CompanyContractsReadSchema.safeParse(read({ sources: [SOURCE_OK, SOURCE_OK] })).success).toBe(false);
  });

  it('s8207 uno scope estraneo non passa e lo scope non si perde', () => {
    expect(CompanyContractsReadSchema.safeParse(read({ applied: [instance({ scope: { ...SCOPE, projectId: 'other' } })] })).success).toBe(false);
    expect(CompanyContractsReadSchema.safeParse(read({ applied: [instance({ scope: { ...SCOPE, tenantId: 't2' } })] })).success).toBe(false);
    const { organizationId: _lost, ...withoutOrganization } = SCOPE;
    expect(CompanyContractsReadSchema.safeParse(read({ applied: [instance({ scope: withoutOrganization })] })).success).toBe(false);
    expect(CompanyContractsReadSchema.safeParse(read({ breaks: [{ ...BREAK, assignment: '' }] })).success).toBe(false);
    const parsed = CompanyContractsReadSchema.parse(read());
    expect(companyContractsScopeProblem(SCOPE, parsed)).toBeUndefined();
    expect(companyContractsScopeProblem({ ...SCOPE, projectId: 'p2' }, parsed)).toBe('projectId');
    expect(companyContractsScopeProblem({ ...SCOPE, ownerId: 'o2' }, parsed)).toBe('ownerId');
    expect(companyContractsScopeProblem({ ...SCOPE, unitId: undefined }, parsed)).toBe('unitId');
  });

  it('s8207 nessuna credenziale nella risposta', () => {
    expect(CompanyContractsReadSchema.safeParse({ ...read(), token: 'secret' }).success).toBe(false);
    expect(CompanyContractsReadSchema.safeParse(read({ applied: [{ ...instance(), apiKey: 'k' }] })).success).toBe(false);
  });
});

describe('s8207 contratti degli endpoint', () => {
  const contracts = [
    [internalPaperclipCompanyContractsContract, '/internal/paperclip/company-contracts'],
    [internalDevCompanyContractsContract, '/internal/dev/company-contracts'],
    [internalCompanyContractsContract, '/internal/company-board/contracts'],
  ] as const;

  it('s8207 metodo, percorso, autenticazione e risposta', () => {
    for (const [contract, path] of contracts) {
      expect(contract.method).toBe('GET');
      expect(contract.path).toBe(path);
      expect(contract.authType).toBe('secret');
      expect(contract.responseSchema).toBe(CompanyContractsReadSchema);
      expect(contract.refusalSchema.safeParse({ error: 'scope_foreign' }).success).toBe(true);
      expect(contract.refusalSchema.safeParse({ error: 'blocked' }).success).toBe(false);
    }
  });

  it('s8207 gli scopi derivano dalle forme dei servizi e rifiutano chiavi estranee', () => {
    const base = { tenantId: 't1', ownerId: 'o1', organizationId: 'org1', projectId: 'p1' };
    expect(internalPaperclipCompanyContractsContract.querySchema.safeParse(base).success).toBe(true);
    expect(internalCompanyContractsContract.querySchema.safeParse({ ...base, limit: 50, cursor: 'c' }).success).toBe(true);
    expect(internalCompanyContractsContract.querySchema.safeParse({ ...base, limit: 101 }).success).toBe(false);
    expect(internalCompanyContractsContract.querySchema.safeParse({ ...base, token: 'x' }).success).toBe(false);
    for (const key of ['tenantId', 'ownerId', 'organizationId', 'projectId']) {
      const { [key]: _drop, ...rest } = base as Record<string, string>;
      expect(internalPaperclipCompanyContractsContract.querySchema.safeParse(rest).success, `paperclip ${key}`).toBe(false);
      expect(internalCompanyContractsContract.querySchema.safeParse(rest).success, `board ${key}`).toBe(false);
    }
    // cap-dev reads on behalf of an agent: the agent scope of the capability is part of the query.
    expect(internalDevCompanyContractsContract.querySchema.safeParse(base).success).toBe(false);
    expect(internalDevCompanyContractsContract.querySchema.safeParse({ ...base, agentId: 'a1' }).success).toBe(true);
  });
});

describe('s8207 contratti salvati R56-R61', () => {
  const fixture = z.strictObject({
    fonte: z.string(), depurazione: z.string(), controllo: z.string(),
    blocchi: z.array(z.strictObject({ id: z.string(), issue: z.number(), blocco: z.string(), impronta: z.string() })),
  }).parse(JSON.parse(readFileSync(new URL('../../fixtures/dev/s8261-saved-contracts.json', import.meta.url), 'utf8')));

  it('s8207 le letture R56-R61 non cambiano dati né impronte', () => {
    expect(fixture.blocchi.map(({ id }) => id).sort()).toEqual(['R56', 'R57', 'R58', 'R59', 'R60', 'R61']);
    const applied: unknown[] = [];
    for (const saved of fixture.blocchi) {
      const before = JSON.stringify(saved);
      const parsed = parseDevSessionBlock(saved.blocco);
      if (!parsed.ok) throw new Error(`${saved.id}: ${parsed.reason}`);
      const acceptance = parsed.assignment.acceptance;
      const template = acceptance?.template;
      const requirements = acceptance === undefined ? NOT_KNOWN('the saved block has no acceptance') : (() => {
        const expanded = devSessionRequirements(acceptance);
        if (!expanded.ok) return NOT_KNOWN(`requirements not expandable: ${expanded.code}`);
        // Only what the capo wrote is certain; the model text has changed since template.version 1.
        return NOT_KNOWN('the form criteria of the model changed while template.version stayed 1; the original snapshot is not preserved');
      })();
      applied.push(instance({
        type: parsed.assignment.productKind === 'design' ? 'design_session' : 'code_session',
        variant: template?.id,
        reference: KNOWN({ kind: 'assignment', id: saved.id }),
        digest: KNOWN(saved.impronta),
        model: template === undefined ? NOT_KNOWN('the saved block declares no template') : KNOWN({ templateId: template.id, version: template.version }),
        requirements,
      }));
      expect(parsed.digest).toBe(saved.impronta);
      expect(devSessionAssignmentCanonicalJson(parsed.assignment)).toContain('x9.cap-dev.session-assignment');
      expect(JSON.stringify(saved), saved.id).toBe(before);
    }
    const result = CompanyContractsReadSchema.parse(read({ applied }));
    expect(result.applied).toHaveLength(6);
    expect(result.applied.map((entry) => entry.digest.state === 'noto' ? entry.digest.value : null).sort())
      .toEqual(fixture.blocchi.map(({ impronta }) => impronta).sort());
  });
});
