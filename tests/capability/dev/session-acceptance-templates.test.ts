import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import * as acceptanceTemplates from '../../../src/capability/dev/session-acceptance-templates.js';
import * as designScore from '../../../src/capability/design-score.js';
import { describe, expect, it } from 'vitest';
import {
  DESIGN_SCORE_PROBLEMS, DESIGN_SCORE_SCHEMA_ISSUES, DESIGN_TASTE_APP_CHECK_IDS, DESIGN_TASTE_GRID_ITEMS, DESIGN_TASTE_MAX,
  DesignScoreThresholdsSchema, DesignTasteScoreSchema, DesignTasteThresholdsSchema,
  designTasteAppFailures, designTasteProblems, designTasteTotal,
} from '../../../src/capability/design-score.js';
import { DEV_SESSION_ACCEPTANCE_CATALOG, DEV_SESSION_ACCEPTANCE_NEEDS } from '../../../src/capability/dev/session-acceptance-catalog.js';
import {
  DEV_SESSION_TEMPLATE_IDS, DevSessionTemplateIdSchema, DEV_SESSION_TEMPLATE_MATERIALS,
  DEV_SESSION_TEMPLATES, DEV_SESSION_TEMPLATES_V2, DEV_SESSION_MATERIAL_ASSET_TYPES, devSessionMaterialsByRole, devSessionScoreThresholds, devSessionTasteThresholds, DEV_SESSION_REQUIREMENT_ORIGINS, DEV_SESSION_REQUIREMENT_PROBLEMS,
  DEV_SESSION_ACCEPTANCE_TEMPLATE_PROBLEMS, VISUAL_IMAGES_MISSING_MOVE, devSessionTemplateSupportsEngine,
  devSessionRequirements, devSessionAcceptanceTemplateProblem,
} from '../../../src/capability/dev/session-acceptance-templates.js';
import {
  DevSessionAcceptanceSchema, DevSessionAcceptanceInputSchema,
  type DevSessionAcceptance,
} from '../../../src/capability/dev/session-acceptance.js';
import {
  DevSessionAssignmentSchema, DevSessionKindSchema, devSessionAssignmentCanonicalJson, parseDevSessionBlock,
  type DevSessionAssignment, type DevSessionMaterial,
} from '../../../src/capability/dev/session-assignment.js';
import { devSessionAcceptanceCriteriaTexts, devSessionContractDocumentBody } from '../../../src/capability/dev/session-acceptance-paperclip.js';
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
    expect(DEV_SESSION_ACCEPTANCE_NEEDS).toEqual(['commit', 'prove_run', 'browser', 'screenshot', 'skill_log', 'gate', 'detector', 'static_scan', 'package', 'file_list', 'clean_install', 'score_file', 'taste_check']);
    const expected = {
      'D-01': ['esecutore', ['skill_log']], 'D-02': ['esecutore', ['gate']],
      'D-03': ['esecutore', ['detector']], 'D-04': ['esecutore', ['static_scan']],
      'D-05': ['esecutore', ['screenshot']], 'D-06': ['esecutore', ['static_scan']], 'D-07': ['sessione', []], 'D-08': ['sessione', []],
      'D-09': ['esecutore', ['package']], 'D-11': ['referente', []],
      'D-12': ['esecutore', ['skill_log']], 'D-13': ['esecutore', ['skill_log']], 'D-14': ['esecutore', ['skill_log']],
      'D-15': ['esecutore', ['skill_log']], 'D-16': ['esecutore', ['skill_log', 'file_list']],
      'D-17': ['esecutore', ['skill_log']], 'D-18': ['esecutore', ['score_file']],
      'D-19': ['esecutore', ['detector']], 'D-20': ['esecutore', ['skill_log']], 'D-21': ['referente', []],
      'D-22': ['esecutore', ['skill_log', 'static_scan']], 'D-23': ['esecutore', ['taste_check']],
      'D-24': ['esecutore', ['skill_log', 'static_scan']],
      'S-01': ['esecutore', ['commit']], 'S-02': ['esecutore', ['prove_run']],
      'S-03': ['esecutore', ['browser']], 'S-04': ['esecutore', ['screenshot']],
      'S-05': ['esecutore', ['prove_run']], 'S-06': ['referente', []],
      'S-07': ['esecutore', ['file_list']], 'S-08': ['sessione', []],
      'S-09': ['esecutore', ['package']], 'S-10': ['referente', []],
      'S-11': ['esecutore', ['clean_install']],
    };
    expect(Object.keys(DEV_SESSION_ACCEPTANCE_CATALOG).sort()).toEqual(Object.keys(expected).sort());
    expect(Object.keys(DEV_SESSION_ACCEPTANCE_CATALOG)).toHaveLength(34);
    expect(new Set(Object.keys(DEV_SESSION_ACCEPTANCE_CATALOG)).size).toBe(34);
    for (const [id, entry] of Object.entries(DEV_SESSION_ACCEPTANCE_CATALOG)) {
      expect([entry.attestor, entry.needs]).toEqual(expected[id as keyof typeof expected]);
      expect(entry.attestor === 'esecutore').toBe(entry.needs.length > 0);
      for (const text of [entry.text, entry.proof]) {
        expect(text.length).toBeGreaterThanOrEqual(1);
        expect(text.length).toBeLessThanOrEqual(500);
      }
    }
    expect(DEV_SESSION_ACCEPTANCE_CATALOG).toHaveProperty('D-06', expect.objectContaining({ attestor: 'esecutore', needs: ['static_scan'] }));
    expect(DEV_SESSION_ACCEPTANCE_CATALOG).not.toHaveProperty('D-10');
    expect(DEV_SESSION_ACCEPTANCE_CATALOG['D-01'].proof).toBe('riga dello strumento `Skill` nel registro della sessione');
    expect(DEV_SESSION_ACCEPTANCE_CATALOG['D-05'].text).toBe("C'è almeno un'immagine per ogni sezione chiesta, ogni comportamento chiesto (stati e interazioni principali), ogni formato e ogni elemento identificativo (ingresso, navigazione, schermata del risultato)");
    expect(DEV_SESSION_ACCEPTANCE_CATALOG['D-09'].text).toBe("Il pacchetto per il referente ha un pdf con ogni schermata disponibile della consegna e il collegamento alla demo navigabile, senza un numero fisso di schermate");
  });

  it('s7561_modelli', () => {
    expect(DEV_SESSION_TEMPLATE_IDS).toEqual(['sviluppo-pezzo-app', 'design-sito', 'design-schermata-app', 'design-ritocco']);
    expect(DevSessionTemplateIdSchema.options).toEqual(DEV_SESSION_TEMPLATE_IDS);
    expect(DevSessionTemplateIdSchema.safeParse('unknown').success).toBe(false);
    expect(DEV_SESSION_TEMPLATE_MATERIALS).toEqual(['visual_images', 'retouch_file', 'approved_images', 'brand_assets', 'excellence_examples']);
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
    expect(devSessionAcceptanceTemplateProblem(value)).toEqual({ code: 'visual_images_missing', detail: VISUAL_IMAGES_MISSING_MOVE });
    value.materials = [{ kind: 'github_link', url: 'https://github.com/App-Templates/gz-mockups' }];
    expect(devSessionAcceptanceTemplateProblem(value)).toEqual({ code: 'visual_images_missing', detail: VISUAL_IMAGES_MISSING_MOVE });
    const image = assignment().materials[0];
    if (image?.kind !== 'asset') throw new Error('Missing fixture image');
    value.materials = [{ ...image, asset: { ...image.asset, mediaType: 'application/pdf' } }];
    expect(devSessionAcceptanceTemplateProblem(value)).toEqual({ code: 'visual_images_missing', detail: VISUAL_IMAGES_MISSING_MOVE });
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
    // Version 2 appended score_file and taste_check after clean_install: the existing order is kept, never reshuffled.
    expect(DEV_SESSION_ACCEPTANCE_NEEDS.at(-3)).toBe('clean_install');
    expect(DEV_SESSION_ACCEPTANCE_NEEDS.at(-2)).toBe('score_file');
    expect(DEV_SESSION_ACCEPTANCE_NEEDS.at(-1)).toBe('taste_check');
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

// Version 2 design models (task 8463). Helpers live inside the block so the older cases keep their own.
describe('s8463 modelli di design versione 2', () => {
  const digest = 'a'.repeat(64);
  const designIds = ['design-sito', 'design-schermata-app', 'design-ritocco'] as const;
  type DesignId = (typeof designIds)[number];
  const originalForms = {
    'design-sito': ['D-01', 'D-02', 'D-03', 'D-04', 'D-05', 'D-08', 'D-09', 'D-11', 'D-12', 'D-13', 'D-14'],
    'design-schermata-app': ['D-01', 'D-03', 'D-04', 'D-05', 'D-07', 'D-08', 'D-09', 'D-11', 'D-12', 'D-13', 'D-14'],
    'design-ritocco': ['D-01', 'D-03', 'D-08', 'D-11', 'D-13', 'D-14'],
  };
  const newForms = {
    'design-sito': ['D-01', 'D-02', 'D-03', 'D-04', 'D-05', 'D-06', 'D-08', 'D-09', 'D-11', 'D-12', 'D-13', 'D-14', 'D-15', 'D-16', 'D-17', 'D-18', 'D-19', 'D-20', 'D-21', 'D-24'],
    'design-schermata-app': ['D-01', 'D-03', 'D-04', 'D-05', 'D-06', 'D-07', 'D-08', 'D-09', 'D-11', 'D-12', 'D-13', 'D-14', 'D-15', 'D-16', 'D-17', 'D-18', 'D-19', 'D-20', 'D-21', 'D-22', 'D-23', 'D-24'],
    'design-ritocco': ['D-01', 'D-03', 'D-06', 'D-08', 'D-11', 'D-13', 'D-14', 'D-15', 'D-19', 'D-20', 'D-21', 'D-23', 'D-24'],
  };
  const thresholds = { dimensionMin: 3, auditTotalMin: 16, critiqueMin: 30, critiqueOutOf: 40, critiqueMinScored: 8, gapMax: 1 };

  function contract(id: DesignId, version = 2): DevSessionAcceptance {
    return DevSessionAcceptanceSchema.parse({
      version: 1, template: { id, version },
      input: {
        screens: [{ name: 'dispensa', purpose: 'Aggiungere un prodotto alla dispensa' }],
        states: ['pieno', 'vuoto'], formats: ['telefono', 'computer'],
        retouch: { target: 'aggiungi.png', defect: 'Gerarchia e dettagli del modulo' },
        visualSource: { kind: 'nessuna' },
      },
      criteria: [{ id: 'add-product', text: 'Si può aggiungere un prodotto.', attestor: 'referente', proof: 'Provare il modulo.', origin: 'capo' }],
    });
  }

  function material(assetId: string, assetType?: string, mediaType = 'image/png'): DevSessionMaterial {
    return {
      kind: 'asset', asset: {
        assetId, sha256: digest, name: 'aggiungi.png', mediaType, sizeBytes: 2048,
        origin: { kind: 'email', messageId: 'message-64', attachmentName: 'aggiungi.png' },
        tenantId: 'tenant-1', companyId: 'good-choice', projectId: 'dispensa-pronta',
        ...(assetType === undefined ? {} : { assetType }), createdAt: '2026-11-22T10:00:00Z',
      },
    };
  }

  function assignment(acceptance: DevSessionAcceptance): DevSessionAssignment {
    return DevSessionAssignmentSchema.parse({
      version: 1, tenantId: 'tenant-1', ownerId: '7', organizationId: 'good-choice',
      companyId: 'good-choice', projectId: 'dispensa-pronta', businessUnit: { slug: 'design' },
      requestedBy: { managementAgentId: 'capo-design', runtimeAgentId: 'capo-design', vaultAgentId: 62 },
      productKind: 'design', title: 'Dispensa Pronta', task: 'Disegna il modulo per aggiungere un prodotto.',
      miniPlan: 'Esaminare i materiali, scegliere la direzione e verificare il modulo.',
      materials: [material('asset-design-64')], destination: { repo: 'App-Templates/goodchoice-backtest' },
      createdAt: '2026-11-22T10:00:00Z', acceptance,
    });
  }

  function formIds(acceptance: DevSessionAcceptance): string[] {
    const expanded = devSessionRequirements(acceptance);
    if (!expanded.ok) throw new Error(expanded.code);
    return expanded.requirements.filter(({ origin }) => origin === 'modello').map(({ id }) => id);
  }

  describe('s8463 design templates version 2', () => {
    it('s8463 regressione-r64-design-v2-con-le-prove-di-eccellenza', () => {
      for (const id of designIds) {
        const acceptance = contract(id);
        expect(devSessionRequirements(acceptance).ok, id).toBe(true);
        expect(formIds(acceptance), id).toEqual(newForms[id]);
        expect(devSessionAcceptanceTemplateProblem(assignment(acceptance)), id).toBeNull();
      }
      for (const id of ['D-12', 'D-16', 'D-17', 'D-18']) {
        expect(formIds(contract('design-ritocco'))).not.toContain(id);
      }
    });

    it('s8463 versione-1-resta-uguale', () => {
      for (const id of designIds) {
        const acceptance = contract(id, 1);
        expect(formIds(acceptance), id).toEqual(originalForms[id]);
        expect(DEV_SESSION_TEMPLATES[id].formCriteria, id).toEqual(originalForms[id]);
        expect(DEV_SESSION_TEMPLATES[id].version, id).toBe(1);
        expect(DEV_SESSION_TEMPLATES[id]).not.toHaveProperty('scoreThresholds');
        expect(devSessionScoreThresholds(acceptance)).toBeUndefined();
        expect(devSessionAcceptanceTemplateProblem(assignment(acceptance)), id).toBeNull();
      }
      // Fixed production digests catch a wire-shape change as well as a wrong version lookup.
      const fixture = z.object({ blocchi: z.array(z.object({ id: z.string(), blocco: z.string(), impronta: z.string() })) })
        .parse(JSON.parse(readFileSync(new URL('../../../fixtures/dev/s8261-saved-contracts.json', import.meta.url), 'utf8')));
      expect(fixture.blocchi.map(({ id }) => id)).toEqual(['R56', 'R57', 'R58', 'R59', 'R60', 'R61']);
      for (const saved of fixture.blocchi) {
        const parsed = parseDevSessionBlock(saved.blocco);
        expect(parsed.ok, saved.id).toBe(true);
        if (!parsed.ok) throw new Error(parsed.reason);
        expect(parsed.assignment).toEqual(JSON.parse(saved.blocco.split('\n')[2]!));
        expect(parsed.digest).toBe(saved.impronta);
        expect(createHash('sha256').update(devSessionAssignmentCanonicalJson(parsed.assignment)).digest('hex')).toBe(saved.impronta);
        if (saved.id === 'R58') {
          expect(parsed.assignment).not.toHaveProperty('acceptance');
        } else {
          const acceptance = parsed.assignment.acceptance;
          if (acceptance === undefined) throw new Error(`${saved.id}: missing acceptance`);
          expect(acceptance.template).toEqual({ id: 'sviluppo-pezzo-app', version: 1 });
          expect(formIds(acceptance)).toEqual(['S-01', 'S-02', 'S-05', 'S-07', 'S-08', 'S-10', 'S-11']);
          expect(devSessionScoreThresholds(acceptance)).toBeUndefined();
        }
      }
    });

    it('s8463 il-rifiuto-dice-che-un-pdf-non-vale', () => {
      expect(VISUAL_IMAGES_MISSING_MOVE).toMatch(/pdf non vale/i);
      for (const word of ['png', 'jpeg', 'visualSource', 'nessuna']) expect(VISUAL_IMAGES_MISSING_MOVE).toContain(word);
      for (const version of [1, 2]) {
        for (const id of designIds) {
          for (const kind of ['figma', 'tavola_approvata'] as const) {
            const acceptance = contract(id, version);
            acceptance.input.visualSource = { kind, reference: 'asset-design-64' };
            const value = assignment(acceptance);
            value.acceptance = acceptance;
            value.materials = [material('asset-design-64', 'design-approvato', 'application/pdf')];
            expect(devSessionAcceptanceTemplateProblem(value)).toEqual({ code: 'visual_images_missing', detail: VISUAL_IMAGES_MISSING_MOVE });
            for (const mediaType of ['image/png', 'image/jpeg']) {
              value.materials = [material('asset-design-64', 'design-approvato', mediaType)];
              expect(devSessionAcceptanceTemplateProblem(value)).toBeNull();
            }
            acceptance.input.visualSource = { kind: 'nessuna' };
            value.materials = [material('asset-design-64', undefined, 'application/pdf')];
            expect(devSessionAcceptanceTemplateProblem(value)).toBeNull();
          }
        }
      }
    });

    it('s8463 ricerca-per-id-e-versione-senza-promozione-implicita', () => {
      for (const id of ['unknown', 'constructor', '__proto__', 'toString']) {
        const acceptance = { ...contract('design-sito'), template: { id, version: 2 } };
        expect(devSessionRequirements(acceptance)).toEqual({ ok: false, code: 'template_unknown' });
        // Prototype keys are not valid slugs, so bypass the assignment schema and probe the lookup directly.
        expect(devSessionAcceptanceTemplateProblem({ ...assignment(contract('design-sito')), acceptance })).toEqual({ code: 'template_unknown' });
        expect(devSessionScoreThresholds(acceptance)).toBeUndefined();
      }
      for (const id of [...designIds, 'sviluppo-pezzo-app'] as const) {
        const versions = id === 'sviluppo-pezzo-app' ? [2, 3] : [3, 99];
        for (const version of versions) {
          const acceptance = { ...contract('design-sito'), template: { id, version } };
          expect(devSessionRequirements(acceptance)).toEqual({ ok: false, code: 'template_version_unknown' });
          expect(devSessionAcceptanceTemplateProblem(assignment(acceptance))).toEqual({ code: 'template_version_unknown' });
          expect(devSessionScoreThresholds(acceptance)).toBeUndefined();
        }
      }
    });

    it('s8463 soglie-e-materiali-vivono-nei-tre-modelli', () => {
      expect(Object.keys(DEV_SESSION_TEMPLATES_V2)).toEqual(designIds);
      for (const id of designIds) {
        const template = DEV_SESSION_TEMPLATES_V2[id];
        expect(template.version).toBe(2);
        expect(template.requiredInput).toEqual(DEV_SESSION_TEMPLATES[id].requiredInput);
        expect(template.supportedEngines).toEqual(['claude']);
        expect(template.optionalCriteria).toEqual([]);
        expect(template.scoreThresholds).toEqual(thresholds);
        expect(DesignScoreThresholdsSchema.parse(template.scoreThresholds)).toEqual(thresholds);
        expect(devSessionScoreThresholds(contract(id))).toBe(template.scoreThresholds);
        expect(template.materials).toEqual([
          ...(id === 'design-ritocco' ? ['retouch_file'] : []),
          'visual_images', 'approved_images', 'brand_assets', 'excellence_examples',
        ]);
        const value = assignment(contract(id));
        // Declaring examples and brand assets does not make them mandatory at admission.
        if (id !== 'design-ritocco') value.materials = [];
        expect(devSessionAcceptanceTemplateProblem(value)).toBeNull();
      }
      for (const id of ['D-18', 'D-21'] as const) {
        expect(DEV_SESSION_ACCEPTANCE_CATALOG[id].text).not.toMatch(/\d/);
        expect(DEV_SESSION_ACCEPTANCE_CATALOG[id].proof).not.toMatch(/\d/);
      }
    });

    it('s8463 il-ruolo-del-materiale-viene-solo-da-assetType', () => {
      expect(DEV_SESSION_MATERIAL_ASSET_TYPES).toEqual({
        approved_images: 'design-approvato', brand_assets: 'asset-marchio', excellence_examples: 'esempio-eccellenza',
      });
      const approved = material('asset-approved', 'design-approvato');
      const brand = material('asset-brand-pdf', 'asset-marchio', 'application/pdf');
      const example = material('asset-example', 'esempio-eccellenza');
      const materials: DevSessionMaterial[] = [
        approved, brand, example, material('asset-no-role'), material('asset-other', 'altro'),
        { kind: 'github_link', url: 'https://github.com/App-Templates/design-approvato', note: 'asset-marchio esempio-eccellenza' },
      ];
      const before = structuredClone(materials);
      expect(devSessionMaterialsByRole(materials, 'approved_images')).toEqual([approved]);
      expect(devSessionMaterialsByRole(materials, 'brand_assets')).toEqual([brand]);
      expect(devSessionMaterialsByRole(materials, 'excellence_examples')).toEqual([example]);
      expect(devSessionMaterialsByRole(materials, 'brand_assets')[0]).toBe(brand);
      expect(devSessionMaterialsByRole([], 'approved_images')).toEqual([]);
      expect(materials).toEqual(before);
    });

    it('s8463 documento-stabile-con-soglie-solo-per-la-versione-2', () => {
      for (const id of designIds) {
        for (const version of [1, 2]) {
          const acceptance = contract(id, version);
          const before = structuredClone(acceptance);
          const document = devSessionContractDocumentBody({ acceptance, issueNumber: 64, digest });
          expect(document.key).toBe('contratto-r64');
          expect(document.title).toBe('Contratto della sessione R64');
          expect(document.body).toContain(`Modello: ${id} versione ${version}`);
          const scoreLines = document.body.split('\n').filter((line) => line.startsWith('Soglie dei punteggi:'));
          expect(scoreLines).toEqual(version === 1 ? [] : [
            'Soglie dei punteggi: minimo per dimensione 3/4; audit almeno 16/20; critique almeno 30/40 in proporzione, con almeno 8 voci valutate; scarto massimo per dimensione 1/4.',
          ]);
          for (const criterionId of version === 1 ? originalForms[id] : newForms[id]) {
            expect(document.body).toContain(`- ${criterionId} —`);
          }
          expect(document.body).toContain('- add-product —');
          expect(document.body).toContain('- D-11 —');
          if (version === 2) expect(document.body).toContain('— attesta: referente');
          expect(acceptance).toEqual(before);
        }
      }
    });

    it('s8463 versione-2-conserva-i-controlli-di-ingresso', () => {
      for (const id of designIds) {
        const acceptance = contract(id);
        const value = assignment(acceptance);
        expect(devSessionAcceptanceTemplateProblem({ ...value, productKind: 'code' })).toEqual({ code: 'template_kind_mismatch' });
        delete acceptance.input.formats;
        expect(devSessionAcceptanceTemplateProblem({ ...value, acceptance })).toEqual({ code: 'input_missing', detail: 'formats' });
        acceptance.input.formats = ['computer'];
        acceptance.template.optionalIds = ['D-15'];
        expect(devSessionRequirements(acceptance)).toEqual({ ok: false, code: 'template_optional_not_offered' });
        delete acceptance.template.optionalIds;
        for (const criterionId of ['D-06', 'D-15', 'D-16', 'D-17', 'D-18', 'D-19', 'D-20', 'D-21', 'D-22', 'D-23', 'D-24']) {
          expect(devSessionRequirements({ ...acceptance, criteria: [{ ...acceptance.criteria[0]!, id: criterionId }] }))
            .toEqual({ ok: false, code: 'criterion_id_clashes_catalog' });
        }
      }
    });
  });
});

// Taste grid and the shared list of Taste checks valid for apps (task 8465).
describe('s8465 griglia del gusto', () => {
  const digest = 'b'.repeat(64);
  const tasteThresholds = { itemMin: 3, totalMin: 21, itemMaxWithFail: 2 };
  const grid = (values: number[]) => {
    const scores = Object.fromEntries(DESIGN_TASTE_GRID_ITEMS.map((item, index) => [item, values[index]!]));
    return { scores, total: values.reduce((a, b) => a + b, 0), max: DESIGN_TASTE_MAX };
  };
  const contract = (id: 'design-sito' | 'design-schermata-app' | 'design-ritocco', version = 2): DevSessionAcceptance => DevSessionAcceptanceSchema.parse({
    version: 1, template: { id, version },
    input: {
      screens: [{ name: 'dispensa', purpose: 'Aggiungere un prodotto alla dispensa' }], states: ['pieno'], formats: ['telefono'],
      retouch: { target: 'aggiungi.png', defect: 'Gusto del modulo' }, visualSource: { kind: 'nessuna' },
    },
    criteria: [{ id: 'add-product', text: 'Si può aggiungere un prodotto.', attestor: 'referente', proof: 'Provare il modulo.', origin: 'capo' }],
  });
  const ids = (acceptance: DevSessionAcceptance): string[] => {
    const result = devSessionRequirements(acceptance);
    if (!result.ok) throw new Error(result.code);
    return result.requirements.map((entry) => entry.id);
  };

  it('s8465 regressione-r64-design-approvato-senza-giudicare-il-gusto', () => {
    // R64 "Dispensa Pronta": the app screen was approved on audit correctness alone.
    const screen = ids(contract('design-schermata-app'));
    expect(screen).toEqual([...newFormsBefore('design-schermata-app'), 'D-22', 'D-23', 'D-24', 'add-product']);
    const retouch = ids(contract('design-ritocco'));
    expect(retouch).toContain('D-23');
    expect(retouch).not.toContain('D-22');
    expect(devSessionTasteThresholds(contract('design-schermata-app'))).toEqual(tasteThresholds);
    expect(devSessionTasteThresholds(contract('design-ritocco'))).toEqual(tasteThresholds);
    const schema = DesignTasteThresholdsSchema.parse(tasteThresholds);
    const good = DesignTasteScoreSchema.parse(grid([4, 4, 3, 3, 3, 4]));
    expect(good.total).toBe(21);
    expect(designTasteProblems(good, schema)).toEqual([]);
    expect(designTasteProblems(DesignTasteScoreSchema.parse(grid([4, 3, 3, 3, 3, 4])), schema)).toEqual([{ code: 'taste_total_below' }]);
    const low = designTasteProblems(DesignTasteScoreSchema.parse(grid([4, 4, 4, 4, 2, 4])), schema);
    expect(low).toEqual([{ code: 'taste_item_below', item: 'delight' }]);
    // a FAIL of fake-button with "controls" at 4: the grid cannot outvote the check
    const failed = designTasteProblems(DesignTasteScoreSchema.parse(grid([4, 4, 4, 4, 4, 4])), schema, ['fake-button']);
    expect(failed).toEqual([{ code: 'taste_item_above_failed_check', item: 'controls' }]);
  });

  it('s8465 elenco-condiviso-dei-controlli-per-le-app', () => {
    const entries = Object.entries(DESIGN_TASTE_APP_CHECK_IDS);
    expect(entries).toHaveLength(25);
    for (const item of DESIGN_TASTE_GRID_ITEMS) expect(entries.some(([, value]) => value === item)).toBe(true);
    for (const id of ['font-load', 'heading-scale', 'body-size']) expect(DESIGN_TASTE_APP_CHECK_IDS).toHaveProperty(id, 'typography');
    expect(DESIGN_TASTE_APP_CHECK_IDS['fake-button']).toBe('controls');
    expect(DESIGN_TASTE_APP_CHECK_IDS['empty-visual']).toBe('imagery');
    expect(DESIGN_TASTE_APP_CHECK_IDS['button-contrast']).toBe('color_material');
    expect(DESIGN_TASTE_APP_CHECK_IDS['focus-ring']).toBe('delight');
    expect(DESIGN_TASTE_APP_CHECK_IDS.tilt).toBe('composition');
    // checks that only make sense on sites are not in the list
    for (const siteOnly of ['hero-height', 'nav-sticky', 'footer-links']) expect(DESIGN_TASTE_APP_CHECK_IDS).not.toHaveProperty(siteOnly);
    expect(designTasteAppFailures(['tilt', 'hero-height', 'tilt', 'fake-button', 'toString'])).toEqual([
      { id: 'tilt', item: 'composition' }, { id: 'fake-button', item: 'controls' },
    ]);
    expect(designTasteAppFailures([])).toEqual([]);
  });

  it('s8465 voci-dei-criteri-e-dei-tipi', () => {
    expect(DEV_SESSION_ACCEPTANCE_NEEDS.at(-1)).toBe('taste_check');
    expect(DEV_SESSION_ACCEPTANCE_NEEDS.at(-2)).toBe('score_file');
    expect([DEV_SESSION_ACCEPTANCE_CATALOG['D-22'].attestor, DEV_SESSION_ACCEPTANCE_CATALOG['D-22'].needs]).toEqual(['esecutore', ['skill_log', 'static_scan']]);
    expect([DEV_SESSION_ACCEPTANCE_CATALOG['D-23'].attestor, DEV_SESSION_ACCEPTANCE_CATALOG['D-23'].needs]).toEqual(['esecutore', ['taste_check']]);
    for (const id of ['D-22', 'D-23'] as const) {
      expect(DEV_SESSION_ACCEPTANCE_CATALOG[id].text).not.toMatch(/\d/);
      expect(DEV_SESSION_ACCEPTANCE_CATALOG[id].text).not.toMatch(/fake-button|font-load/);
    }
    expect(DESIGN_SCORE_PROBLEMS.slice(-4, -1)).toEqual(['taste_total_below', 'taste_item_below', 'taste_item_above_failed_check']);
    expect(DESIGN_SCORE_SCHEMA_ISSUES).toContain('taste_total_mismatch');
    expect(DesignTasteScoreSchema.safeParse({ ...grid([4, 4, 4, 4, 4, 4]), total: 23 }).success).toBe(false);
    expect(DesignTasteScoreSchema.safeParse(grid([5, 4, 4, 4, 4, 4])).success).toBe(false);
    expect(designTasteTotal(grid([1, 2, 3, 4, 0, 1]).scores as never)).toBe(11);
    expect(DesignTasteThresholdsSchema.safeParse({ ...tasteThresholds, itemMin: 5 }).success).toBe(false);
  });

  it('s8465 documento-con-le-soglie-del-gusto', () => {
    const line = 'Soglie del gusto: ogni voce almeno 3/4; totale almeno 21/24; una voce con un FAIL di Taste al massimo 2/4.';
    for (const [id, expected] of [['design-schermata-app', true], ['design-ritocco', true], ['design-sito', true]] as const) {
      const body = devSessionContractDocumentBody({ acceptance: contract(id), issueNumber: 64, digest }).body;
      expect(body.split('\n').filter((l) => l.startsWith('Soglie del gusto:'))).toEqual(expected ? [line] : []);
    }
    const v1 = devSessionContractDocumentBody({ acceptance: contract('design-schermata-app', 1), issueNumber: 64, digest }).body;
    expect(v1).not.toContain('Soglie del gusto');
  });

  it('s8465 sito-e-versione-1-invariati', () => {
    expect(ids(contract('design-sito'))).not.toContain('D-22');
    expect(ids(contract('design-sito'))).not.toContain('D-23');
    expect(devSessionTasteThresholds(contract('design-sito'))).toEqual(tasteThresholds);
    for (const id of ['design-sito', 'design-schermata-app', 'design-ritocco'] as const) {
      expect(devSessionTasteThresholds(contract(id, 1))).toBeUndefined();
      expect(ids(contract(id, 1))).not.toContain('D-23');
    }
  });
});

// Form of the app screen at version 2 before the taste criteria, as 8463 left it.
function newFormsBefore(id: 'design-schermata-app'): string[] {
  return id === 'design-schermata-app'
    ? ['D-01', 'D-03', 'D-04', 'D-05', 'D-06', 'D-07', 'D-08', 'D-09', 'D-11', 'D-12', 'D-13', 'D-14', 'D-15', 'D-16', 'D-17', 'D-18', 'D-19', 'D-20', 'D-21']
    : [];
}

// Referee judgement form (task 8471).
describe('s8471 voto del referente', () => {
  const taste = (values: number[]) => ({
    scores: Object.fromEntries(DESIGN_TASTE_GRID_ITEMS.map((item, i) => [item, values[i]!])),
    total: values.reduce((a, b) => a + b, 0), max: DESIGN_TASTE_MAX,
  });
  const audit = (values: number[]) => ({
    scores: Object.fromEntries(designScore.DESIGN_AUDIT_DIMENSIONS.map((d, i) => [d, values[i]!])),
    total: values.reduce((a, b) => a + b, 0), max: 20,
  });
  const critique = (values: number[]) => ({
    scores: Object.fromEntries(designScore.DESIGN_CRITIQUE_HEURISTICS.map((h, i) => [h, values[i]!])),
    total: values.reduce((a, b) => a + b, 0), max: 40,
  });
  const thresholds = {
    score: { dimensionMin: 3, auditTotalMin: 16, critiqueMin: 30, critiqueOutOf: 40, critiqueMinScored: 8, gapMax: 1 },
    taste: { itemMin: 3, totalMin: 21, itemMaxWithFail: 2 },
  };
  const r67 = (verdict: 'APPROVA' | 'RIFARE') => ({
    taste: taste([2, 1, 2, 2, 1, 2]),
    audit: audit([3, 3, 3, 4, 2]),
    critique: critique([3, 3, 3, 3, 3, 3, 3, 3, 3, 0]),
    brand: null, examplesLevel: 2,
    tasteFailedIds: ['button-styles', 'text-contrast', 'container-edges', 'focus-ring'],
    copyLint: { words: 6, failedIds: [] }, verdict,
  });
  const codes = (j: unknown) => designScore.designRefereeJudgementProblems(designScore.DesignRefereeJudgementSchema.parse(j), thresholds).map((p) => p.code);

  it('s8471 regressione-r67-voto-del-referente-a-mano', () => {
    // R67 "Dispensa Pronta": 10/24, audit 15/20, critique 27/40, level 2/4, RIFARE, written by hand.
    const vote = r67('RIFARE');
    expect(designScore.DesignRefereeJudgementSchema.safeParse(vote).success).toBe(true);
    expect(codes(vote)).toEqual([
      'taste_total_below', 'taste_item_below', 'taste_item_below', 'taste_item_below', 'taste_item_below', 'taste_item_below', 'taste_item_below',
      'audit_total_below', 'audit_dimension_below', 'critique_total_below', 'not_at_examples_level',
    ]);
    const problems = designScore.designRefereeJudgementProblems(designScore.DesignRefereeJudgementSchema.parse(vote), thresholds);
    expect(problems.find((p) => p.code === 'audit_dimension_below')?.dimension).toBe('implementation_integrity');
    expect(codes(r67('APPROVA')).at(-1)).toBe('verdict_approves_below_thresholds');
    const good = { ...r67('APPROVA'), taste: taste([4, 3, 4, 4, 3, 3]), audit: audit([4, 4, 3, 3, 3]), critique: critique([3, 3, 3, 3, 3, 3, 3, 3, 3, 3]), examplesLevel: 3, tasteFailedIds: [] };
    expect(codes(good)).toEqual([]);
    expect(codes({ ...good, verdict: 'RIFARE' })).toEqual([]);
    // a FAIL of fake-button caps "controls", hero-height (a site check) does not
    expect(codes({ ...good, verdict: 'RIFARE', tasteFailedIds: ['fake-button'] })).toEqual(['taste_item_above_failed_check']);
    expect(codes({ ...good, tasteFailedIds: ['fake-button'] })).toEqual(['taste_item_above_failed_check', 'verdict_approves_below_thresholds']);
    expect(codes({ ...good, tasteFailedIds: ['hero-height'] })).toEqual([]);
  });

  it('s8471 forma-del-voto', () => {
    const vote = r67('RIFARE');
    const parse = (v: unknown) => designScore.DesignRefereeJudgementSchema.safeParse(v).success;
    expect(designScore.DESIGN_REFEREE_VERDICTS).toEqual(['APPROVA', 'RIFARE']);
    expect(designScore.DESIGN_SCORE_PROBLEMS.at(-1)).toBe('verdict_approves_below_thresholds');
    expect(designScore.DESIGN_SCORE_SCHEMA_ISSUES.at(-1)).toBe('check_ids_not_unique');
    expect(parse({ ...vote, verdict: 'MAYBE' })).toBe(false);
    expect(parse({ ...vote, extra: 1 })).toBe(false);
    expect(parse({ ...vote, tasteFailedIds: ['Bad Id'] })).toBe(false);
    expect(parse({ ...vote, tasteFailedIds: ['focus-ring', 'focus-ring'] })).toBe(false);
    expect(parse({ ...vote, copyLint: { words: 6, failedIds: ['a', 'a'] } })).toBe(false);
    expect(parse({ ...vote, examplesLevel: 5 })).toBe(false);
    expect(parse({ ...vote, brand: 3 })).toBe(true);
    const low = designScore.designRefereeJudgementProblems(designScore.DesignRefereeJudgementSchema.parse({ ...vote, brand: 2 }), thresholds).map((p) => p.code);
    expect(low).toContain('brand_below');
    // the version 1 vote stays as it was
    expect(designScore.DesignRefereeVoteSchema.safeParse({ audit: audit([4, 4, 4, 4, 4]), brand: null, atExamplesLevel: true }).success).toBe(true);
  });

  it('s8471 sito-con-la-griglia-copy-lint-e-scostamenti', () => {
    expect(DEV_SESSION_ACCEPTANCE_CATALOG['D-23'].proof).toMatch(/copy-lint\.mjs --kind software --json`\)$/);
    const dev = designScore.DesignBrandDeviationsSchema;
    const ok = { colors: [{ value: '#FF0000', reason: 'Alert red requested by the client' }], fonts: [] };
    expect(dev.safeParse(ok).success).toBe(true);
    expect(dev.safeParse({ colors: [{ value: '#FF0000' }], fonts: [] }).success).toBe(false);
    expect(dev.safeParse({ colors: [{ value: '#FF0000', reason: '   ' }], fonts: [] }).success).toBe(false);
    expect(dev.safeParse({ colors: [], fonts: [{ value: 'Inter', reason: 'x'.repeat(501) }] }).success).toBe(false);
    const values = designScore.designBrandDeviationValues(dev.parse(ok));
    expect(values).toEqual({ colors: ['#FF0000'], fonts: [] });
    const tokens = designScore.DesignBrandTokensSchema.parse({ colors: ['#000000'], fonts: ['Inter'], logoIds: [] });
    expect(designScore.designBrandTokenProblems(tokens, { colors: ['#ff0000'], fonts: ['Inter'] }, values)).toEqual([]);
    expect(designScore.designBrandTokenProblems(tokens, { colors: ['#ff0000'], fonts: [] })).toEqual([{ code: 'color_not_token', value: '#ff0000' }]);
  });
});

// R67 lacked domain references: research must precede taste even when no board is supplied.
describe('s8472 giro su Dribbble', () => {
  const designIds = ['design-sito', 'design-schermata-app', 'design-ritocco'] as const;
  const digest = 'c'.repeat(64);
  function contract(id: string, version = 2): DevSessionAcceptance {
    return DevSessionAcceptanceSchema.parse({
      version: 1, template: { id, version },
      input: {
        screens: [{ name: 'dispensa', purpose: 'Aggiungere un prodotto alla dispensa' }],
        states: ['pieno', 'vuoto'], formats: ['telefono'],
        retouch: { target: 'aggiungi.png', defect: 'Gerarchia e dettagli del modulo' },
        visualSource: { kind: 'nessuna' },
      },
      criteria: [{ id: 'add-product', text: 'Si può aggiungere un prodotto.', attestor: 'referente', proof: 'Provare il modulo.', origin: 'capo' }],
    });
  }

  it('s8472 regressione-r67-design-senza-riferimenti-di-livello', () => {
    const screen = devSessionRequirements(contract('design-schermata-app'));
    if (!screen.ok) throw new Error(screen.code);
    expect(screen.requirements.map(({ id }) => id)).toEqual([
      ...newFormsBefore('design-schermata-app'), 'D-22', 'D-23', 'D-24', 'add-product',
    ]);
    expect(acceptanceTemplates).toHaveProperty('devSessionDribbbleShotsMin', expect.any(Function));
    for (const id of designIds) {
      const acceptance = contract(id);
      expect(DEV_SESSION_TEMPLATES_V2[id].formCriteria.at(-1), id).toBe('D-24');
      expect(DEV_SESSION_TEMPLATES_V2[id]).toHaveProperty('dribbbleShotsMin', 6);
      expect(acceptanceTemplates.devSessionDribbbleShotsMin(acceptance), id).toBe(6);
      const expanded = devSessionRequirements(acceptance);
      if (!expanded.ok) throw new Error(expanded.code);
      expect(expanded.requirements.filter(({ id }) => id === 'D-24')).toEqual([
        { id: 'D-24', origin: 'modello', ...DEV_SESSION_ACCEPTANCE_CATALOG['D-24'] },
      ]);
    }
    const entry = DEV_SESSION_ACCEPTANCE_CATALOG['D-24'];
    expect(entry.attestor).toBe('esecutore');
    expect(entry.needs).toEqual(['skill_log', 'static_scan']);
    expect(entry.text).toBe('Prima di Taste e del primo file di interfaccia la sessione ha fatto il giro su Dribbble: ha aperto lavori del dominio del progetto, ne ha salvato e guardato le immagini e ha scritto per ognuno che cosa prende');
    expect(entry.proof).toBe('registro della sessione (pagine `dribbble.com/shots/` e immagini `cdn.dribbble.com` aperte con curl o Playwright, immagini salvate lette con `Read`, prima della skill Taste e del primo file di interfaccia) e file `design/riferimenti/DRIBBBLE.md` con link, autore, immagine e che cosa prende per ogni lavoro');
    expect(entry.text + entry.proof).not.toMatch(/\d/);
  });

  it('s8472 documento-con-il-giro-su-dribbble', () => {
    for (const id of designIds) {
      const document = devSessionContractDocumentBody({ acceptance: contract(id), issueNumber: 67, digest });
      expect(document.key).toBe('contratto-r67');
      const lines = document.body.split('\n');
      const expected = 'Giro su Dribbble: almeno 6 lavori del dominio aperti prima di Taste e del primo file di interfaccia, in design/riferimenti/DRIBBBLE.md.';
      expect(lines.filter((line) => line.startsWith('Giro su Dribbble:'))).toEqual([expected]);
      const tasteIndex = lines.findIndex((line) => line.startsWith('Soglie del gusto:'));
      expect(tasteIndex).toBeGreaterThanOrEqual(0);
      expect(lines[tasteIndex + 1]).toBe(expected);
    }
  });

  it('s8472 versione-1-e-criteri-del-capo-invariati', () => {
    for (const id of [...designIds, 'sviluppo-pezzo-app'] as const) {
      const v1 = contract(id, 1);
      expect(acceptanceTemplates.devSessionDribbbleShotsMin(v1)).toBeUndefined();
      expect(DEV_SESSION_TEMPLATES[id]).not.toHaveProperty('dribbbleShotsMin');
      const expanded = devSessionRequirements(v1);
      if (!expanded.ok) throw new Error(expanded.code);
      expect(expanded.requirements.map(({ id }) => id)).not.toContain('D-24');
      expect(devSessionContractDocumentBody({ acceptance: v1, issueNumber: 67, digest }).body).not.toContain('Giro su Dribbble:');
    }
    for (const id of designIds) {
      const v2 = contract(id);
      expect(devSessionAcceptanceCriteriaTexts(v2)).toEqual(['Si può aggiungere un prodotto.']);
      const expanded = devSessionRequirements(v2);
      if (!expanded.ok) throw new Error(expanded.code);
      expect(expanded.requirements.filter(({ origin }) => origin === 'capo')).toEqual(v2.criteria.map((criterion) => ({ ...criterion, needs: [] })));
    }
    for (const [id, version] of [['unknown', 2], ['design-schermata-app', 99], ['sviluppo-pezzo-app', 2]] as const) {
      expect(acceptanceTemplates.devSessionDribbbleShotsMin(contract(id, version))).toBeUndefined();
    }
  });
});
