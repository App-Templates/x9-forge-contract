import { describe, expect, it } from 'vitest';
import { DEV_SESSION_ACCEPTANCE_CATALOG, DEV_SESSION_ACCEPTANCE_NEEDS } from '../../../src/capability/dev/session-acceptance-catalog.js';
import {
  DEV_SESSION_TEMPLATE_IDS, DevSessionTemplateIdSchema, DEV_SESSION_TEMPLATE_MATERIALS,
  DEV_SESSION_TEMPLATES, DEV_SESSION_REQUIREMENT_ORIGINS, DEV_SESSION_REQUIREMENT_PROBLEMS,
  DEV_SESSION_ACCEPTANCE_TEMPLATE_PROBLEMS, devSessionTemplateSupportsEngine,
  devSessionRequirements, devSessionAcceptanceTemplateProblem,
} from '../../../src/capability/dev/session-acceptance-templates.js';
import {
  DevSessionAcceptanceSchema, DevSessionAcceptanceInputSchema,
  type DevSessionAcceptance,
} from '../../../src/capability/dev/session-acceptance.js';
import { DevSessionAssignmentSchema, DevSessionKindSchema, type DevSessionAssignment } from '../../../src/capability/dev/session-assignment.js';
import { devSessionAcceptanceVerdict } from '../../../src/capability/dev/session-attestation.js';
import { DevelopmentSessionEngineSchema } from '../../../src/capability/connect/development-session.js';

const criterion = { id: 'piece-save', text: 'The user can save.', attestor: 'revisore' as const, proof: 'Observe the saved item.', origin: 'capo' as const };
const siteForm = ['D-01', 'D-02', 'D-03', 'D-04', 'D-05', 'D-08', 'D-09', 'D-11', 'D-12', 'D-13', 'D-14'];
const codeForm = ['S-01', 'S-02', 'S-05', 'S-07', 'S-08', 'S-10', 'S-11'];
const codeOptional = ['S-03', 'S-04', 'S-06', 'S-09'];

function acceptance(): DevSessionAcceptance {
  return DevSessionAcceptanceSchema.parse({
    version: 1, template: { id: 'design-sito', version: 1 },
    input: { screens: [{ name: 'home', purpose: 'Save an item' }], formats: ['telefono', 'computer'], visualSource: { kind: 'tavola_approvata', reference: 'asset-design-1' } },
    criteria: [criterion],
  });
}

// Same scoped production-shaped assignment and image as the 7560 fixture.
function assignment(): DevSessionAssignment {
  return DevSessionAssignmentSchema.parse({
    version: 1, tenantId: 'tenant-1', ownerId: '7', organizationId: 'good-choice',
    companyId: 'good-choice', projectId: 'good-choice-app', businessUnit: { slug: 'design' },
    requestedBy: { managementAgentId: 'capo-sviluppo', runtimeAgentId: 'capo-sviluppo', vaultAgentId: 62 },
    productKind: 'design', title: 'Modulo A: scansione prodotto', task: 'Disegna il Modulo A.',
    miniPlan: '1. Struttura. 2. Scansione. 3. Test.',
    materials: [{ kind: 'asset', asset: {
      assetId: 'asset-design-1', sha256: 'a'.repeat(64), name: 'home.png', mediaType: 'image/png', sizeBytes: 2048,
      origin: { kind: 'email', messageId: 'msg-1', attachmentName: 'home.png' },
      tenantId: 'tenant-1', companyId: 'good-choice', projectId: 'good-choice-app', createdAt: '2026-10-27T10:00:00+01:00',
    } }], destination: { repo: 'App-Templates/goodchoice-backtest' }, createdAt: '2026-10-27T15:00:00+01:00',
    acceptance: acceptance(),
  });
}

describe('s7561', () => {
  it('s7561_catalogo', () => {
    expect(DEV_SESSION_ACCEPTANCE_NEEDS).toEqual(['commit', 'prove_run', 'browser', 'screenshot', 'skill_log', 'gate', 'detector', 'static_scan', 'package', 'file_list', 'clean_install']);
    const expected = {
      'D-01': ['esecutore', ['skill_log']], 'D-02': ['esecutore', ['gate']],
      'D-03': ['esecutore', ['detector']], 'D-04': ['esecutore', ['static_scan']],
      'D-05': ['esecutore', ['screenshot']], 'D-07': ['sessione', []], 'D-08': ['sessione', []],
      'D-09': ['esecutore', ['package']], 'D-11': ['referente', []],
      'D-12': ['esecutore', ['skill_log']], 'D-13': ['esecutore', ['skill_log']], 'D-14': ['esecutore', ['skill_log']],
      'S-01': ['esecutore', ['commit']], 'S-02': ['esecutore', ['prove_run']],
      'S-03': ['esecutore', ['browser']], 'S-04': ['esecutore', ['screenshot']],
      'S-05': ['esecutore', ['prove_run']], 'S-06': ['referente', []],
      'S-07': ['esecutore', ['file_list']], 'S-08': ['sessione', []],
      'S-09': ['esecutore', ['package']], 'S-10': ['referente', []],
      'S-11': ['esecutore', ['clean_install']],
    };
    expect(Object.keys(DEV_SESSION_ACCEPTANCE_CATALOG).sort()).toEqual(Object.keys(expected).sort());
    expect(Object.keys(DEV_SESSION_ACCEPTANCE_CATALOG)).toHaveLength(23);
    expect(new Set(Object.keys(DEV_SESSION_ACCEPTANCE_CATALOG)).size).toBe(23);
    for (const [id, entry] of Object.entries(DEV_SESSION_ACCEPTANCE_CATALOG)) {
      expect([entry.attestor, entry.needs]).toEqual(expected[id as keyof typeof expected]);
      expect(entry.attestor === 'esecutore').toBe(entry.needs.length > 0);
      for (const text of [entry.text, entry.proof]) {
        expect(text.length).toBeGreaterThanOrEqual(1);
        expect(text.length).toBeLessThanOrEqual(500);
      }
    }
    expect(DEV_SESSION_ACCEPTANCE_CATALOG).not.toHaveProperty('D-06');
    expect(DEV_SESSION_ACCEPTANCE_CATALOG).not.toHaveProperty('D-10');
    expect(DEV_SESSION_ACCEPTANCE_CATALOG['D-01'].proof).toBe('riga dello strumento `Skill` nel registro della sessione');
    expect(DEV_SESSION_ACCEPTANCE_CATALOG['D-05'].text).toBe("C'è almeno un'immagine per ogni sezione chiesta, ogni comportamento chiesto (stati e interazioni principali), ogni formato e ogni elemento identificativo (ingresso, navigazione, schermata del risultato)");
    expect(DEV_SESSION_ACCEPTANCE_CATALOG['D-09'].text).toBe("Il pacchetto per il referente ha un pdf con ogni schermata disponibile della consegna e il collegamento alla demo navigabile, senza un numero fisso di schermate");
  });

  it('s7561_modelli', () => {
    expect(DEV_SESSION_TEMPLATE_IDS).toEqual(['sviluppo-pezzo-app', 'design-sito', 'design-schermata-app', 'design-ritocco']);
    expect(DevSessionTemplateIdSchema.options).toEqual(DEV_SESSION_TEMPLATE_IDS);
    expect(DevSessionTemplateIdSchema.safeParse('unknown').success).toBe(false);
    expect(DEV_SESSION_TEMPLATE_MATERIALS).toEqual(['visual_images', 'retouch_file']);
    expect(Object.keys(DEV_SESSION_TEMPLATES)).toEqual(DEV_SESSION_TEMPLATE_IDS);
    const expected = [
      { productKind: 'code', supportedEngines: ['codex', 'claude'], requiredInput: ['userPath', 'data', 'proofScripts', 'visualSource'], materials: ['visual_images'], formCriteria: codeForm, optionalCriteria: codeOptional },
      { productKind: 'design', supportedEngines: ['claude'], requiredInput: ['screens', 'formats', 'visualSource'], materials: ['visual_images'], formCriteria: siteForm, optionalCriteria: [] },
      { productKind: 'design', supportedEngines: ['claude'], requiredInput: ['screens', 'states', 'formats', 'visualSource'], materials: ['visual_images'], formCriteria: ['D-01', 'D-03', 'D-04', 'D-05', 'D-07', 'D-08', 'D-09', 'D-11', 'D-12', 'D-13', 'D-14'], optionalCriteria: [] },
      { productKind: 'design', supportedEngines: ['claude'], requiredInput: ['retouch', 'formats', 'visualSource'], materials: ['retouch_file', 'visual_images'], formCriteria: ['D-01', 'D-03', 'D-08', 'D-11', 'D-13', 'D-14'], optionalCriteria: [] },
    ];
    DEV_SESSION_TEMPLATE_IDS.forEach((id, index) => {
      const template = DEV_SESSION_TEMPLATES[id];
      expect(template).toEqual({ version: 1, ...expected[index] });
      expect(DevSessionKindSchema.safeParse(template.productKind).success).toBe(true);
      for (const engine of template.supportedEngines) expect(DevelopmentSessionEngineSchema.safeParse(engine).success).toBe(true);
      for (const key of template.requiredInput) expect(DevSessionAcceptanceInputSchema.shape).toHaveProperty(key);
      const criteria = [...template.formCriteria, ...template.optionalCriteria];
      expect(new Set(criteria).size).toBe(criteria.length);
      for (const key of criteria) expect(DEV_SESSION_ACCEPTANCE_CATALOG).toHaveProperty(key);
    });
  });

  it('s7561_motori', () => {
    for (const id of ['design-sito', 'design-schermata-app', 'design-ritocco']) {
      expect(devSessionTemplateSupportsEngine(id, 'codex')).toBe(false);
      expect(devSessionTemplateSupportsEngine(id, 'claude')).toBe(true);
    }
    for (const engine of ['codex', 'claude'] as const) expect(devSessionTemplateSupportsEngine('sviluppo-pezzo-app', engine)).toBe(true);
    for (const id of ['unknown', 'constructor', '__proto__', 'toString']) expect(devSessionTemplateSupportsEngine(id, 'claude')).toBe(false);
  });

  it('s7561_requisiti', () => {
    expect(DEV_SESSION_REQUIREMENT_ORIGINS).toEqual(['modello', 'mandato', 'capo', 'ritorno']);
    expect(DEV_SESSION_REQUIREMENT_PROBLEMS).toEqual(['template_unknown', 'template_version_unknown', 'template_optional_not_offered', 'criterion_id_clashes_catalog']);
    const value = acceptance();
    value.template = { id: 'sviluppo-pezzo-app', version: 1, optionalIds: ['S-09', 'S-03'] };
    value.criteria = [criterion, { ...criterion, id: 'mandate-check', attestor: 'referente', origin: 'mandato', unit: 'design' }, { ...criterion, id: 'return-check', attestor: 'sessione', origin: 'ritorno', reference: 'decision-1' }];
    const result = devSessionRequirements(value);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.code);
    expect(result.requirements.map((entry) => entry.id)).toEqual([...codeForm, 'S-09', 'S-03', 'piece-save', 'mandate-check', 'return-check']);
    expect(result.requirements.slice(0, codeForm.length + 2)).toEqual([...codeForm, 'S-09', 'S-03'].map((id) => ({ id, ...DEV_SESSION_ACCEPTANCE_CATALOG[id as keyof typeof DEV_SESSION_ACCEPTANCE_CATALOG], origin: 'modello' })));
    expect(result.requirements.slice(codeForm.length + 2)).toEqual(value.criteria.map((entry) => ({ ...entry, needs: [] })));
    const failures: [DevSessionAcceptance, string][] = [
      [{ ...value, template: { id: 'unknown', version: 2 } }, 'template_unknown'],
      [{ ...value, template: { id: 'constructor', version: 1 } }, 'template_unknown'],
      [{ ...value, template: { ...value.template, version: 2 } }, 'template_version_unknown'],
      [{ ...value, template: { ...value.template, optionalIds: ['S-01'] } }, 'template_optional_not_offered'],
      [{ ...value, template: { ...value.template, optionalIds: ['unknown'] } }, 'template_optional_not_offered'],
      [{ ...value, criteria: [{ ...criterion, id: 'D-02' }] }, 'criterion_id_clashes_catalog'],
    ];
    for (const [input, code] of failures) {
      expect(devSessionRequirements(input)).toEqual({ ok: false, code });
      expect(devSessionAcceptanceTemplateProblem({ ...assignment(), acceptance: input })).toEqual({ code });
    }
  });

  it('s7561_quota', () => {
    const value = assignment();
    const input = acceptance();
    input.criteria = Array.from({ length: 20 }, (_, i) => ({ ...criterion, id: `piece-${i}` }));
    value.acceptance = DevSessionAcceptanceSchema.parse(input);
    const result = devSessionRequirements(value.acceptance);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.code);
    expect(result.requirements).toHaveLength(31);
    expect(result.requirements.map((entry) => entry.id)).toEqual([...siteForm, ...input.criteria.map((entry) => entry.id)]);
    expect(devSessionAcceptanceTemplateProblem(value)).toBeNull();
  });

  it('s7561_problemi', () => {
    expect(DEV_SESSION_ACCEPTANCE_TEMPLATE_PROBLEMS).toEqual([...DEV_SESSION_REQUIREMENT_PROBLEMS, 'template_kind_mismatch', 'input_missing', 'visual_images_missing', 'visual_reference_not_material', 'retouch_file_missing']);
    expect(devSessionAcceptanceTemplateProblem(assignment())).toBeNull();
    expect(devSessionAcceptanceTemplateProblem({ ...assignment(), productKind: 'code' })).toEqual({ code: 'template_kind_mismatch' });
    const value = assignment();
    value.acceptance = { ...acceptance(), input: {} };
    expect(devSessionAcceptanceTemplateProblem(value)).toEqual({ code: 'input_missing', detail: 'screens' });
    // Requirements precede kind, kind precedes inputs, inputs precede materials.
    value.productKind = 'code';
    expect(devSessionAcceptanceTemplateProblem(value)).toEqual({ code: 'template_kind_mismatch' });
    value.acceptance.template.id = 'unknown';
    expect(devSessionAcceptanceTemplateProblem(value)).toEqual({ code: 'template_unknown' });
  });

  it('s7561_materiali', () => {
    const value = assignment();
    const input = acceptance();
    value.acceptance = input;
    input.input.visualSource = { kind: 'figma', reference: 'node-1' };
    value.materials = [];
    expect(devSessionAcceptanceTemplateProblem(value)).toEqual({ code: 'visual_images_missing' });
    value.materials = [{ kind: 'github_link', url: 'https://github.com/App-Templates/gz-mockups' }];
    expect(devSessionAcceptanceTemplateProblem(value)).toEqual({ code: 'visual_images_missing' });
    const image = assignment().materials[0];
    if (image?.kind !== 'asset') throw new Error('Missing fixture image');
    value.materials = [{ ...image, asset: { ...image.asset, mediaType: 'application/pdf' } }];
    expect(devSessionAcceptanceTemplateProblem(value)).toEqual({ code: 'visual_images_missing' });
    value.materials = [image];
    expect(devSessionAcceptanceTemplateProblem(value)).toBeNull();
    input.input.visualSource = { kind: 'tavola_approvata', reference: 'another-asset' };
    expect(devSessionAcceptanceTemplateProblem(value)).toEqual({ code: 'visual_reference_not_material' });
    value.materials.push({ ...image, asset: { ...image.asset, assetId: 'another-asset', mediaType: 'application/pdf' } });
    expect(devSessionAcceptanceTemplateProblem(value)).toEqual({ code: 'visual_reference_not_material' });
    input.input.visualSource.reference = 'asset-design-1';
    expect(devSessionAcceptanceTemplateProblem(value)).toBeNull();
    input.input.visualSource = { kind: 'nessuna' };
    value.materials = [];
    expect(devSessionAcceptanceTemplateProblem(value)).toBeNull();
    input.template.id = 'design-ritocco';
    input.input = { retouch: { target: 'Home', defect: 'Spacing' }, formats: ['computer'], visualSource: { kind: 'nessuna' } };
    expect(devSessionAcceptanceTemplateProblem(value)).toEqual({ code: 'retouch_file_missing' });
    value.materials = [{ kind: 'github_link', url: 'https://github.com/App-Templates/gz-mockups' }];
    expect(devSessionAcceptanceTemplateProblem(value)).toBeNull();
    value.materials = [{ ...image, asset: { ...image.asset, mediaType: 'application/pdf' } }];
    expect(devSessionAcceptanceTemplateProblem(value)).toBeNull();
    value.productKind = 'code';
    input.template.id = 'sviluppo-pezzo-app';
    input.input = { userPath: ['Open and save'], data: 'di_prova', proofScripts: ['test:save'] };
    expect(devSessionAcceptanceTemplateProblem(value)).toEqual({ code: 'input_missing', detail: 'visualSource' });
  });

  it('s7561_vecchio', () => {
    const value = assignment();
    delete value.acceptance;
    value.materials = [];
    expect(devSessionAcceptanceTemplateProblem(value)).toBeNull();
  });
});

const savedR56 = {
  version: 1,
  template: { id: 'sviluppo-pezzo-app', version: 1 },
  input: {
    userPath: ['Apre il backtest', 'Sceglie il periodo', 'Lancia il calcolo', 'Legge il risultato'],
    data: 'di_prova',
    proofScripts: ['test:unit', 'test:build', 'test:lint', 'test:types', 'test:path', 'test:smoke'],
    screens: [{ name: 'home', purpose: 'Open' }, { name: 'periodo', purpose: 'Pick' }, { name: 'calcolo', purpose: 'Run' }, { name: 'risultato', purpose: 'Read' }],
    behaviors: ['apri', 'scegli', 'lancia', 'leggi', 'riprova'],
    states: ['pieno', 'vuoto', 'errore', 'caricamento'],
    formats: ['telefono'],
    visualSource: { kind: 'tavola_approvata', reference: 'asset-design-1' },
  },
  criteria: [
    { id: 'm-1', text: 'The mandate holds.', attestor: 'referente', proof: 'Decision.', origin: 'mandato' },
    { id: 'm-2', text: 'The mandate also holds.', attestor: 'referente', proof: 'Decision.', origin: 'mandato' },
    { id: 'm-3', text: 'Third.', attestor: 'referente', proof: 'Decision.', origin: 'mandato' },
    { id: 'c-1', text: 'The capo asks.', attestor: 'sessione', proof: 'Attestation.', origin: 'capo' },
    { id: 'c-2', text: 'The capo asks more.', attestor: 'sessione', proof: 'Attestation.', origin: 'capo' },
    { id: 'c-3', text: 'And more.', attestor: 'sessione', proof: 'Attestation.', origin: 'capo' },
    { id: 'c-4', text: 'Last.', attestor: 'sessione', proof: 'Attestation.', origin: 'capo' },
  ],
};

describe('s8079 installazione pulita', () => {
  it('s8079_catalogo', () => {
    const entry = DEV_SESSION_ACCEPTANCE_CATALOG['S-11'];
    expect(entry.attestor).toBe('esecutore');
    expect(entry.needs).toEqual(['clean_install']);
    expect(entry.text).toContain('installazione pulita');
    expect(entry.text).toContain('package.json');
    expect(DEV_SESSION_ACCEPTANCE_NEEDS.at(-1)).toBe('clean_install');
  });

  it('s8079_modello', () => {
    const form = DEV_SESSION_TEMPLATES['sviluppo-pezzo-app'].formCriteria;
    expect(form.at(-1)).toBe('S-11');
    expect(DEV_SESSION_TEMPLATES['sviluppo-pezzo-app'].version).toBe(1);
    for (const id of ['design-sito', 'design-schermata-app', 'design-ritocco'] as const) {
      expect((DEV_SESSION_TEMPLATES[id].formCriteria as readonly string[]).includes('S-11')).toBe(false);
    }
  });

  it('s8079_contratto_salvato: saved version 1 contracts resolve with S-11', () => {
    const parsed = DevSessionAcceptanceSchema.parse(savedR56);
    expect(parsed).toEqual(savedR56);
    const result = devSessionRequirements(parsed);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.code);
    expect(result.requirements.map((entry) => entry.id)).toEqual([...codeForm, ...savedR56.criteria.map((entry) => entry.id)]);
    expect(result.requirements.find((entry) => entry.id === 'S-11')).toMatchObject({ attestor: 'esecutore', origin: 'modello', needs: ['clean_install'] });
    const verdict = devSessionAcceptanceVerdict({ acceptance: parsed, attestation: { version: 1, entries: [] }, results: [], attempt: 1, contractDigest: 'a'.repeat(64), proofs: [] });
    const missing = (code: string) => verdict.problems.filter((problem) => problem.code === code).map((problem) => problem.criterionId);
    expect(missing('executor_result_missing')).toContain('S-11');
    expect(missing('entry_missing').sort()).toEqual(['S-08', 'c-1', 'c-2', 'c-3', 'c-4']);
  });

  it('s8079_libero_rifiutato', () => {
    const free = { id: 'x-1', text: 'Free.', attestor: 'esecutore', proof: 'Self.', origin: 'capo' };
    const refused = DevSessionAcceptanceSchema.safeParse({ ...savedR56, criteria: [free] });
    expect(refused.success).toBe(false);
    if (refused.success) throw new Error('Expected refusal');
    expect(refused.error.issues).toContainEqual(expect.objectContaining({ path: ['criteria', 0, 'attestor'], message: 'executor_only_from_catalog' }));
    const clash = DevSessionAcceptanceSchema.parse({ ...savedR56, criteria: [{ ...free, id: 'S-11', attestor: 'sessione' }] });
    expect(devSessionRequirements(clash)).toEqual({ ok: false, code: 'criterion_id_clashes_catalog' });
  });
});

describe('s8210 design-strumenti', () => {
  const tools = ['D-12', 'D-13', 'D-14'];
  const designTemplates = (id: string): DevSessionAcceptance => {
    const value = acceptance();
    value.template = { id, version: 1 };
    if (id === 'design-schermata-app') value.input = { ...value.input, states: ['pieno', 'vuoto'] };
    if (id === 'design-ritocco') value.input = { retouch: { target: 'Home', defect: 'Spacing' }, formats: ['computer'], visualSource: { kind: 'nessuna' } };
    return value;
  };
  const requirementsOf = (id: string) => {
    const result = devSessionRequirements(designTemplates(id));
    if (!result.ok) throw new Error(result.code);
    return result.requirements;
  };

  it('s8210 design-sotto-contratto', () => {
    for (const id of ['design-sito', 'design-schermata-app']) {
      const ids = requirementsOf(id).map((entry) => entry.id);
      expect(ids.slice(-4)).toEqual(['D-12', 'D-13', 'D-14', 'piece-save']);
      expect(ids.indexOf('D-11')).toBe(ids.indexOf('D-12') - 1);
      for (const toolId of tools) {
        expect(requirementsOf(id).find((entry) => entry.id === toolId)).toMatchObject({ attestor: 'esecutore', needs: ['skill_log'], origin: 'modello' });
      }
    }
    const retouch = requirementsOf('design-ritocco').map((entry) => entry.id);
    expect(retouch).toEqual(['D-01', 'D-03', 'D-08', 'D-11', 'D-13', 'D-14', 'piece-save']);
  });

  it('s8210 ritocco-senza-verifica-finale', () => {
    expect(requirementsOf('design-ritocco').map((entry) => entry.id)).not.toContain('D-12');
    expect(DEV_SESSION_TEMPLATES['design-ritocco'].formCriteria as readonly string[]).not.toContain('D-12');
  });

  it('s8210 testi', () => {
    const { 'D-12': d12, 'D-13': d13, 'D-14': d14 } = DEV_SESSION_ACCEPTANCE_CATALOG;
    expect(d12.text).toContain('audit o critique');
    expect(d12.text).toContain('polish');
    expect(d13.text).toContain('emil-design-eng');
    expect(d13.text).toContain('soddisfatto');
    expect(d14.text).toContain('390');
    expect(d14.text).toContain('1440');
  });

  it('s8210 codice-e-versioni-invariati', () => {
    const code = devSessionRequirements(DevSessionAcceptanceSchema.parse(savedR56));
    if (!code.ok) throw new Error(code.code);
    expect(code.requirements.filter((entry) => entry.origin === 'modello').map((entry) => entry.id)).toEqual(['S-01', 'S-02', 'S-05', 'S-07', 'S-08', 'S-10', 'S-11']);
    for (const id of DEV_SESSION_TEMPLATE_IDS) expect(DEV_SESSION_TEMPLATES[id].version).toBe(1);
    expect(devSessionRequirements(DevSessionAcceptanceSchema.parse(savedR56)).ok).toBe(true);
  });

  it('s8210 id-nuovi-protetti', () => {
    for (const id of tools) {
      const value = acceptance();
      value.criteria = [{ ...criterion, id }];
      expect(devSessionRequirements(value)).toEqual({ ok: false, code: 'criterion_id_clashes_catalog' });
    }
  });
});
