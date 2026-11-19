import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import * as acceptanceContract from '../../../src/capability/dev/session-acceptance.js';
import {
  DevSessionAcceptanceSchema, DevSessionAcceptanceInputSchema,
  DevSessionCriterionSchema, DevSessionAttestorSchema, DevSessionCriterionOriginSchema,
} from '../../../src/capability/dev/session-acceptance.js';
import {
  DevSessionAssignmentSchema, devSessionAssignmentCanonicalJson,
  renderDevSessionBlock, parseDevSessionBlock,
} from '../../../src/capability/dev/session-assignment.js';
import { PAPERCLIP_CRITERI_MASSIMI, PAPERCLIP_CRITERIO_MAX } from '../../../src/capability/paperclip-protocollo/wire-creazione.js';

// Captured from the pre-acceptance implementation, not rendered by the code under test.
const OLD_CANONICAL = '{"assignment":{"businessUnit":{"slug":"sviluppo"},"companyId":"good-choice","createdAt":"2026-10-27T15:00:00+01:00","destination":{"repo":"App-Templates/goodchoice-backtest"},"materials":[{"asset":{"assetId":"asset-design-1","companyId":"good-choice","createdAt":"2026-10-27T10:00:00+01:00","mediaType":"image/png","name":"home.png","origin":{"attachmentName":"home.png","kind":"email","messageId":"msg-1"},"projectId":"good-choice-app","sha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","sizeBytes":2048,"tenantId":"tenant-1"},"kind":"asset"},{"kind":"github_link","note":"prototipi","url":"https://github.com/App-Templates/gz-mockups/tree/main/home"}],"miniPlan":"1. Struttura. 2. Scansione. 3. Test.","organizationId":"good-choice","ownerId":"7","productKind":"code","projectId":"good-choice-app","requestedBy":{"managementAgentId":"capo-sviluppo","runtimeAgentId":"capo-sviluppo","vaultAgentId":62},"task":"Costruisci il Modulo A come PWA con test.","tenantId":"tenant-1","title":"Modulo A: scansione prodotto","version":1},"domain":"x9.cap-dev.session-assignment"}';
const OLD_DIGEST = 'ef2cee93f58924724cca6a0825213e34266596cc93dc97e6b72b7169261b47e7';
const OLD_BLOCK = '<!-- x9:dev-session:v1 sha256:ef2cee93f58924724cca6a0825213e34266596cc93dc97e6b72b7169261b47e7 -->\n```json\n{"businessUnit":{"slug":"sviluppo"},"companyId":"good-choice","createdAt":"2026-10-27T15:00:00+01:00","destination":{"repo":"App-Templates/goodchoice-backtest"},"materials":[{"asset":{"assetId":"asset-design-1","companyId":"good-choice","createdAt":"2026-10-27T10:00:00+01:00","mediaType":"image/png","name":"home.png","origin":{"attachmentName":"home.png","kind":"email","messageId":"msg-1"},"projectId":"good-choice-app","sha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","sizeBytes":2048,"tenantId":"tenant-1"},"kind":"asset"},{"kind":"github_link","note":"prototipi","url":"https://github.com/App-Templates/gz-mockups/tree/main/home"}],"miniPlan":"1. Struttura. 2. Scansione. 3. Test.","organizationId":"good-choice","ownerId":"7","productKind":"code","projectId":"good-choice-app","requestedBy":{"managementAgentId":"capo-sviluppo","runtimeAgentId":"capo-sviluppo","vaultAgentId":62},"task":"Costruisci il Modulo A come PWA con test.","tenantId":"tenant-1","title":"Modulo A: scansione prodotto","version":1}\n```';

const OLD_KEY_CANONICAL = '{"assignment":{"businessUnit":{"slug":"sviluppo"},"companyId":"good-choice","createdAt":"2026-10-27T15:00:00+01:00","deliverableKey":"design-calendario","deliveryPackage":"required","destination":{"repo":"App-Templates/goodchoice-backtest"},"materials":[{"asset":{"assetId":"asset-design-1","companyId":"good-choice","createdAt":"2026-10-27T10:00:00+01:00","mediaType":"image/png","name":"home.png","origin":{"attachmentName":"home.png","kind":"email","messageId":"msg-1"},"projectId":"good-choice-app","sha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","sizeBytes":2048,"tenantId":"tenant-1"},"kind":"asset"},{"kind":"github_link","note":"prototipi","url":"https://github.com/App-Templates/gz-mockups/tree/main/home"}],"miniPlan":"1. Struttura. 2. Scansione. 3. Test.","organizationId":"good-choice","ownerId":"7","productKind":"code","projectId":"good-choice-app","requestedBy":{"managementAgentId":"capo-sviluppo","runtimeAgentId":"capo-sviluppo","vaultAgentId":62},"task":"Costruisci il Modulo A come PWA con test.","tenantId":"tenant-1","title":"Modulo A: scansione prodotto","version":1},"domain":"x9.cap-dev.session-assignment"}';
const OLD_KEY_DIGEST = '9b93fc3d897ba3a4143eacc784a24c09f4d0710d190810e4debbde6e25ab2a01';
const OLD_KEY_BLOCK = '<!-- x9:dev-session:v1 sha256:9b93fc3d897ba3a4143eacc784a24c09f4d0710d190810e4debbde6e25ab2a01 -->\n```json\n{"businessUnit":{"slug":"sviluppo"},"companyId":"good-choice","createdAt":"2026-10-27T15:00:00+01:00","deliverableKey":"design-calendario","deliveryPackage":"required","destination":{"repo":"App-Templates/goodchoice-backtest"},"materials":[{"asset":{"assetId":"asset-design-1","companyId":"good-choice","createdAt":"2026-10-27T10:00:00+01:00","mediaType":"image/png","name":"home.png","origin":{"attachmentName":"home.png","kind":"email","messageId":"msg-1"},"projectId":"good-choice-app","sha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","sizeBytes":2048,"tenantId":"tenant-1"},"kind":"asset"},{"kind":"github_link","note":"prototipi","url":"https://github.com/App-Templates/gz-mockups/tree/main/home"}],"miniPlan":"1. Struttura. 2. Scansione. 3. Test.","organizationId":"good-choice","ownerId":"7","productKind":"code","projectId":"good-choice-app","requestedBy":{"managementAgentId":"capo-sviluppo","runtimeAgentId":"capo-sviluppo","vaultAgentId":62},"task":"Costruisci il Modulo A come PWA con test.","tenantId":"tenant-1","title":"Modulo A: scansione prodotto","version":1}\n```';

const OLD_BASE_CANONICAL = '{"assignment":{"base":{"commit":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","ramo":"consegna/49"},"businessUnit":{"slug":"sviluppo"},"companyId":"good-choice","createdAt":"2026-10-27T15:00:00+01:00","destination":{"repo":"App-Templates/goodchoice-backtest"},"materials":[{"asset":{"assetId":"asset-design-1","companyId":"good-choice","createdAt":"2026-10-27T10:00:00+01:00","mediaType":"image/png","name":"home.png","origin":{"attachmentName":"home.png","kind":"email","messageId":"msg-1"},"projectId":"good-choice-app","sha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","sizeBytes":2048,"tenantId":"tenant-1"},"kind":"asset"},{"kind":"github_link","note":"prototipi","url":"https://github.com/App-Templates/gz-mockups/tree/main/home"}],"miniPlan":"1. Struttura. 2. Scansione. 3. Test.","organizationId":"good-choice","ownerId":"7","productKind":"code","projectId":"good-choice-app","requestedBy":{"managementAgentId":"capo-sviluppo","runtimeAgentId":"capo-sviluppo","vaultAgentId":62},"task":"Costruisci il Modulo A come PWA con test.","tenantId":"tenant-1","title":"Modulo A: scansione prodotto","version":1},"domain":"x9.cap-dev.session-assignment"}';
const OLD_BASE_DIGEST = 'b2bf777bd73b189de75b2f9c9afe4d3efe3e54bb27e70b505042d81641bd2bf0';
const OLD_BASE_BLOCK = '<!-- x9:dev-session:v1 sha256:b2bf777bd73b189de75b2f9c9afe4d3efe3e54bb27e70b505042d81641bd2bf0 -->\n```json\n{"base":{"commit":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","ramo":"consegna/49"},"businessUnit":{"slug":"sviluppo"},"companyId":"good-choice","createdAt":"2026-10-27T15:00:00+01:00","destination":{"repo":"App-Templates/goodchoice-backtest"},"materials":[{"asset":{"assetId":"asset-design-1","companyId":"good-choice","createdAt":"2026-10-27T10:00:00+01:00","mediaType":"image/png","name":"home.png","origin":{"attachmentName":"home.png","kind":"email","messageId":"msg-1"},"projectId":"good-choice-app","sha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","sizeBytes":2048,"tenantId":"tenant-1"},"kind":"asset"},{"kind":"github_link","note":"prototipi","url":"https://github.com/App-Templates/gz-mockups/tree/main/home"}],"miniPlan":"1. Struttura. 2. Scansione. 3. Test.","organizationId":"good-choice","ownerId":"7","productKind":"code","projectId":"good-choice-app","requestedBy":{"managementAgentId":"capo-sviluppo","runtimeAgentId":"capo-sviluppo","vaultAgentId":62},"task":"Costruisci il Modulo A come PWA con test.","tenantId":"tenant-1","title":"Modulo A: scansione prodotto","version":1}\n```';

const sha = (text: string) => createHash('sha256').update(text).digest('hex');
const criterion = { id: 'A1.check_ok', text: 'The user can save.', attestor: 'revisore', proof: 'Observe the saved item.', origin: 'capo' };
const acceptance = { version: 1, template: { id: 'web-app', version: 1 }, input: {}, criteria: [criterion] };
const items = (count: number) => Array.from({ length: count }, (_, i) => ({ ...criterion, id: `c${i}` }));
const names = (count: number) => Array.from({ length: count }, (_, i) => `item-${i}`);

function rejects(schema: z.ZodType, value: unknown, path: (string | number)[], code: string, message?: string) {
  const result = schema.safeParse(value);
  expect(result.success).toBe(false);
  if (result.success) throw new Error('Expected a contract violation');
  expect(result.error.issues).toEqual(expect.arrayContaining([
    expect.objectContaining({ path, code, ...(message === undefined ? {} : { message }) }),
  ]));
}

type InvalidCase = { name: string; value: unknown; path: (string | number)[]; code: string; message?: string };

describe('s7560_criterio', () => {
  it('accepts the documented alphabets and trims free text', () => {
    expect(DevSessionCriterionSchema.parse({ ...criterion, text: ' ok ', proof: ' evidence ' })).toEqual({ ...criterion, text: 'ok', proof: 'evidence' });
    expect(acceptanceContract.DEV_SESSION_ATTESTORS).toEqual(['sessione', 'esecutore', 'revisore', 'referente']);
    expect(acceptanceContract.DEV_SESSION_CRITERION_ORIGINS).toEqual(['mandato', 'capo', 'ritorno']);
    for (const attestor of ['sessione', 'esecutore', 'revisore', 'referente']) expect(DevSessionAttestorSchema.parse(attestor)).toBe(attestor);
    for (const origin of ['mandato', 'capo', 'ritorno']) expect(DevSessionCriterionOriginSchema.parse(origin)).toBe(origin);
    rejects(DevSessionAttestorSchema, 'inventato', [], 'invalid_value');
    rejects(DevSessionCriterionOriginSchema, 'modello', [], 'invalid_value');
    for (const attestor of ['sessione', 'revisore', 'referente']) expect(DevSessionCriterionSchema.parse({ ...criterion, attestor }).attestor).toBe(attestor);
    for (const id of ['a', 'A-1_b.C', 'a'.repeat(40)]) expect(DevSessionCriterionSchema.parse({ ...criterion, id }).id).toBe(id);
  });

  const invalid: InvalidCase[] = [
    { name: 'id empty', value: { ...criterion, id: '' }, path: ['id'], code: 'too_small' },
    { name: 'id long', value: { ...criterion, id: 'a'.repeat(41) }, path: ['id'], code: 'too_big' },
    ...['a b', '-a', 'a-', 'a..b', 'a/_b'].map((id) => ({ name: `id ${id}`, value: { ...criterion, id }, path: ['id'], code: 'invalid_format' })),
    { name: 'attestor enum', value: { ...criterion, attestor: 'other' }, path: ['attestor'], code: 'invalid_value' },
    { name: 'origin enum', value: { ...criterion, origin: 'modello' }, path: ['origin'], code: 'invalid_value' },
    { name: 'strict', value: { ...criterion, extra: true }, path: [], code: 'unrecognized_keys' },
    { name: 'reference empty', value: { ...criterion, origin: 'ritorno', reference: ' ' }, path: ['reference'], code: 'too_small' },
    { name: 'reference long', value: { ...criterion, origin: 'ritorno', reference: 'r'.repeat(201) }, path: ['reference'], code: 'too_big' },
    { name: 'unit empty', value: { ...criterion, origin: 'mandato', unit: '' }, path: ['unit'], code: 'too_small' },
    { name: 'unit long', value: { ...criterion, origin: 'mandato', unit: 'u'.repeat(31) }, path: ['unit'], code: 'too_big' },
    ...['A', 'a_b', 'a--b', '-a'].map((unit) => ({ name: `unit ${unit}`, value: { ...criterion, origin: 'mandato', unit }, path: ['unit'], code: 'invalid_format' })),
  ];
  for (const field of ['text', 'proof']) {
    invalid.push({ name: `${field} empty`, value: { ...criterion, [field]: ' ' }, path: [field], code: 'too_small' });
    invalid.push({ name: `${field} long`, value: { ...criterion, [field]: 'x'.repeat(501) }, path: [field], code: 'too_big' });
  }
  for (const field of ['id', 'text', 'attestor', 'proof', 'origin']) {
    const value: Record<string, unknown> = { ...criterion };
    delete value[field];
    invalid.push({ name: `${field} required`, value, path: [field], code: field === 'attestor' || field === 'origin' ? 'invalid_value' : 'invalid_type' });
  }
  it.each(invalid)('rejects $name', ({ value, path, code }) => rejects(DevSessionCriterionSchema, value, path, code));
  it.each(['text', 'proof'])('accepts %s at both length boundaries', (field) => {
    for (const length of [1, 500]) expect(DevSessionCriterionSchema.parse({ ...criterion, [field]: 'x'.repeat(length) })).toMatchObject({ [field]: 'x'.repeat(length) });
  });
  it('accepts reference and unit at both length boundaries', () => {
    for (const length of [1, 200]) expect(DevSessionCriterionSchema.parse({ ...criterion, origin: 'ritorno', reference: ` ${'r'.repeat(length)} ` }).reference).toBe('r'.repeat(length));
    for (const length of [1, 30]) expect(DevSessionCriterionSchema.parse({ ...criterion, origin: 'mandato', unit: 'u'.repeat(length) }).unit).toBe('u'.repeat(length));
  });
});

describe('s7560_regole', () => {
  it('reference_iff_return', () => {
    for (const origin of ['mandato', 'capo']) {
      expect(DevSessionCriterionSchema.parse({ ...criterion, origin })).toMatchObject({ origin });
      rejects(DevSessionCriterionSchema, { ...criterion, origin, reference: 'R1' }, ['reference'], 'custom', 'reference_iff_return');
    }
    expect(DevSessionCriterionSchema.parse({ ...criterion, origin: 'ritorno', reference: 'R1' }).reference).toBe('R1');
    rejects(DevSessionCriterionSchema, { ...criterion, origin: 'ritorno' }, ['reference'], 'custom', 'reference_iff_return');
  });
  it('executor_only_from_catalog', () => {
    expect(DevSessionCriterionSchema.parse(criterion)).toEqual(criterion);
    for (const origin of ['mandato', 'capo', 'ritorno']) rejects(DevSessionCriterionSchema, { ...criterion, origin, attestor: 'esecutore', ...(origin === 'ritorno' ? { reference: 'R1' } : {}) }, ['attestor'], 'custom', 'executor_only_from_catalog');
  });
  it('mandate_not_session', () => {
    expect(DevSessionCriterionSchema.parse({ ...criterion, origin: 'mandato' }).origin).toBe('mandato');
    expect(DevSessionCriterionSchema.parse({ ...criterion, attestor: 'sessione' }).attestor).toBe('sessione');
    rejects(DevSessionCriterionSchema, { ...criterion, origin: 'mandato', attestor: 'sessione' }, ['attestor'], 'custom', 'mandate_not_session');
  });
  it('unit_only_mandate', () => {
    expect(DevSessionCriterionSchema.parse({ ...criterion, origin: 'mandato', unit: 'web-app' }).unit).toBe('web-app');
    expect(DevSessionCriterionSchema.parse(criterion)).not.toHaveProperty('unit');
    for (const origin of ['capo', 'ritorno']) rejects(DevSessionCriterionSchema, { ...criterion, origin, unit: 'web-app', ...(origin === 'ritorno' ? { reference: 'R1' } : {}) }, ['unit'], 'custom', 'unit_only_mandate');
  });
});

describe('s7560_limiti', () => {
  it('accepts one and twenty distinct criteria', () => {
    for (const count of [1, 20]) expect(DevSessionAcceptanceSchema.parse({ ...acceptance, criteria: items(count) }).criteria).toHaveLength(count);
  });
  it.each([0, 21])('rejects %i criteria', (count) => rejects(DevSessionAcceptanceSchema, { ...acceptance, criteria: items(count) }, ['criteria'], count === 0 ? 'too_small' : 'too_big'));
  it('rejects duplicate ids', () => rejects(DevSessionAcceptanceSchema, { ...acceptance, criteria: [criterion, criterion] }, ['criteria'], 'custom', 'criterion_ids_not_unique'));
});

describe('s7560_ingresso', () => {
  const full = {
    userPath: [' Open the page '], data: 'veri', proofScripts: ['test:web.unit-1'],
    screens: [{ name: 'home', purpose: ' Save an item ' }], behaviors: ['finestra', 'modulo', 'conferma'],
    states: ['pieno', 'vuoto', 'errore', 'caricamento'], formats: ['telefono', 'computer'],
    visualSource: { kind: 'figma', reference: ' design-1 ' }, retouch: { target: ' Home ', defect: ' Wrong spacing ' },
  };
  it('accepts all optional fields and the exact enum alphabets', () => {
    expect(DevSessionAcceptanceInputSchema.parse({})).toEqual({});
    expect(DevSessionAcceptanceInputSchema.parse(full)).toEqual({ ...full, userPath: ['Open the page'], screens: [{ name: 'home', purpose: 'Save an item' }], visualSource: { kind: 'figma', reference: 'design-1' }, retouch: { target: 'Home', defect: 'Wrong spacing' } });
    expect(acceptanceContract.DEV_SESSION_INPUT_DATA).toEqual(['veri', 'di_prova', 'da_inventare']);
    expect(acceptanceContract.DEV_SESSION_INPUT_STATES).toEqual(['pieno', 'vuoto', 'errore', 'caricamento']);
    expect(acceptanceContract.DEV_SESSION_INPUT_FORMATS).toEqual(['telefono', 'computer']);
    expect(acceptanceContract.DEV_SESSION_INPUT_VISUAL_SOURCES).toEqual(['figma', 'tavola_approvata', 'nessuna']);
    for (const data of ['veri', 'di_prova', 'da_inventare']) expect(DevSessionAcceptanceInputSchema.parse({ data }).data).toBe(data);
    for (const kind of ['figma', 'tavola_approvata']) expect(DevSessionAcceptanceInputSchema.parse({ visualSource: { kind, reference: 'ref' } }).visualSource).toEqual({ kind, reference: 'ref' });
    expect(DevSessionAcceptanceInputSchema.parse({ visualSource: { kind: 'nessuna' } }).visualSource).toEqual({ kind: 'nessuna' });
  });

  const invalid: InvalidCase[] = [
    { name: 'strict input', value: { extra: true }, path: [], code: 'unrecognized_keys' },
    { name: 'data enum', value: { data: 'other' }, path: ['data'], code: 'invalid_value' },
    { name: 'states enum', value: { states: ['other'] }, path: ['states', 0], code: 'invalid_value' },
    { name: 'formats enum', value: { formats: ['other'] }, path: ['formats', 0], code: 'invalid_value' },
    { name: 'screens duplicate', value: { screens: [full.screens[0], full.screens[0]] }, path: ['screens'], code: 'custom', message: 'screens_not_unique' },
    { name: 'behaviors duplicate', value: { behaviors: ['home', 'home'] }, path: ['behaviors'], code: 'custom', message: 'behaviors_not_unique' },
    { name: 'states duplicate', value: { states: ['pieno', 'pieno'] }, path: ['states'], code: 'custom', message: 'list_not_unique' },
    { name: 'formats duplicate', value: { formats: ['telefono', 'telefono'] }, path: ['formats'], code: 'custom', message: 'list_not_unique' },
    { name: 'visual enum', value: { visualSource: { kind: 'other' } }, path: ['visualSource', 'kind'], code: 'invalid_value' },
    { name: 'visual missing kind', value: { visualSource: {} }, path: ['visualSource', 'kind'], code: 'invalid_value' },
    { name: 'visual strict', value: { visualSource: { kind: 'nessuna', extra: true } }, path: ['visualSource'], code: 'unrecognized_keys' },
    { name: 'figma missing reference', value: { visualSource: { kind: 'figma' } }, path: ['visualSource', 'reference'], code: 'custom', message: 'visual_reference_rule' },
    { name: 'approved missing reference', value: { visualSource: { kind: 'tavola_approvata' } }, path: ['visualSource', 'reference'], code: 'custom', message: 'visual_reference_rule' },
    { name: 'none with reference', value: { visualSource: { kind: 'nessuna', reference: 'ref' } }, path: ['visualSource', 'reference'], code: 'custom', message: 'visual_reference_rule' },
    { name: 'visual reference empty', value: { visualSource: { kind: 'figma', reference: ' ' } }, path: ['visualSource', 'reference'], code: 'too_small' },
    { name: 'visual reference long', value: { visualSource: { kind: 'figma', reference: 'r'.repeat(513) } }, path: ['visualSource', 'reference'], code: 'too_big' },
    { name: 'retouch strict', value: { retouch: { target: 'home', defect: 'spacing', extra: true } }, path: ['retouch'], code: 'unrecognized_keys' },
    { name: 'screen strict', value: { screens: [{ name: 'home', purpose: 'save', extra: true }] }, path: ['screens', 0], code: 'unrecognized_keys' },
  ];
  for (const [field, maximum] of [['userPath', 20], ['proofScripts', 10], ['screens', 20], ['behaviors', 20]] as const) {
    const values = field === 'screens' ? names(maximum + 1).map((name) => ({ name, purpose: 'save' })) : names(maximum + 1);
    invalid.push({ name: `${field} empty`, value: { [field]: [] }, path: [field], code: 'too_small' });
    invalid.push({ name: `${field} long`, value: { [field]: values }, path: [field], code: 'too_big' });
    it(`accepts ${field} at both count boundaries`, () => {
      for (const count of [1, maximum]) expect(DevSessionAcceptanceInputSchema.parse({ [field]: values.slice(0, count) })).toMatchObject({ [field]: values.slice(0, count) });
    });
  }
  for (const [field, valid] of [['states', 'pieno'], ['formats', 'telefono']] as const) {
    it(`allows empty ${field} because the template owns required inputs`, () => expect(DevSessionAcceptanceInputSchema.parse({ [field]: [] })).toEqual({ [field]: [] }));
    it(`accepts a single ${field} value`, () => expect(DevSessionAcceptanceInputSchema.parse({ [field]: [valid] })).toEqual({ [field]: [valid] }));
  }
  for (const [label, maximum, wrap, path] of [
    ['user path', 500, (text: unknown) => ({ userPath: [text] }), ['userPath', 0]],
    ['screen purpose', 200, (text: unknown) => ({ screens: [{ name: 'home', purpose: text }] }), ['screens', 0, 'purpose']],
    ['retouch target', 500, (text: unknown) => ({ retouch: { target: text, defect: 'spacing' } }), ['retouch', 'target']],
    ['retouch defect', 500, (text: unknown) => ({ retouch: { target: 'home', defect: text } }), ['retouch', 'defect']],
  ] as const) {
    invalid.push({ name: `${label} empty`, value: wrap(' '), path: [...path], code: 'too_small' });
    invalid.push({ name: `${label} long`, value: wrap('x'.repeat(maximum + 1)), path: [...path], code: 'too_big' });
    invalid.push({ name: `${label} required`, value: wrap(undefined), path: [...path], code: 'invalid_type' });
    it(`accepts ${label} at both text boundaries`, () => {
      for (const count of [1, maximum]) expect(DevSessionAcceptanceInputSchema.parse(wrap('x'.repeat(count)))).toEqual(wrap('x'.repeat(count)));
    });
  }
  for (const [label, wrap, path] of [
    ['screen name', (name: unknown) => ({ screens: [{ name, purpose: 'save' }] }), ['screens', 0, 'name']],
    ['behavior', (name: unknown) => ({ behaviors: [name] }), ['behaviors', 0]],
  ] as const) {
    invalid.push({ name: `${label} empty`, value: wrap(''), path: [...path], code: 'too_small' });
    invalid.push({ name: `${label} long`, value: wrap('a'.repeat(41)), path: [...path], code: 'too_big' });
    invalid.push({ name: `${label} required`, value: wrap(undefined), path: [...path], code: 'invalid_type' });
    for (const name of ['A', 'a_b', 'a--b', 'a b']) invalid.push({ name: `${label} regex ${name}`, value: wrap(name), path: [...path], code: 'invalid_format' });
    it(`accepts ${label} at both slug boundaries`, () => {
      for (const name of ['a', 'a-b', 'a'.repeat(40)]) expect(DevSessionAcceptanceInputSchema.parse(wrap(name))).toEqual(wrap(name));
    });
  }
  for (const name of ['', 'pnpm test', 'x;sh', 'a/b', '-a', 'A', 'a'.repeat(61)]) invalid.push({ name: `proof name ${name}`, value: { proofScripts: [name] }, path: ['proofScripts', 0], code: 'invalid_format', message: 'proof_script_name' });
  it('accepts proof script names at both boundaries', () => {
    for (const name of ['a', 'a:_.-0', 'a'.repeat(60)]) expect(DevSessionAcceptanceInputSchema.parse({ proofScripts: [name] }).proofScripts).toEqual([name]);
  });
  it('accepts visual references at both boundaries', () => {
    for (const length of [1, 512]) expect(DevSessionAcceptanceInputSchema.parse({ visualSource: { kind: 'figma', reference: 'r'.repeat(length) } }).visualSource?.reference).toBe('r'.repeat(length));
  });
  it.each(invalid)('rejects $name', ({ value, path, code, message }) => rejects(DevSessionAcceptanceInputSchema, value, path, code, message));

  const invalidAcceptance: InvalidCase[] = [
    { name: 'acceptance version', value: { ...acceptance, version: 2 }, path: ['version'], code: 'invalid_value' },
    { name: 'acceptance strict', value: { ...acceptance, extra: true }, path: [], code: 'unrecognized_keys' },
    { name: 'template strict', value: { ...acceptance, template: { ...acceptance.template, extra: true } }, path: ['template'], code: 'unrecognized_keys' },
    { name: 'template id short', value: { ...acceptance, template: { id: 'a', version: 1 } }, path: ['template', 'id'], code: 'too_small' },
    { name: 'template id long', value: { ...acceptance, template: { id: 'a'.repeat(41), version: 1 } }, path: ['template', 'id'], code: 'too_big' },
    { name: 'template id regex', value: { ...acceptance, template: { id: 'A_', version: 1 } }, path: ['template', 'id'], code: 'invalid_format' },
    { name: 'template version zero', value: { ...acceptance, template: { id: 'web', version: 0 } }, path: ['template', 'version'], code: 'too_small' },
    { name: 'template version fraction', value: { ...acceptance, template: { id: 'web', version: 1.5 } }, path: ['template', 'version'], code: 'invalid_type' },
    { name: 'optionalIds duplicate', value: { ...acceptance, template: { ...acceptance.template, optionalIds: ['x', 'x'] } }, path: ['template', 'optionalIds'], code: 'custom', message: 'list_not_unique' },
    { name: 'optionalIds empty', value: { ...acceptance, template: { ...acceptance.template, optionalIds: [] } }, path: ['template', 'optionalIds'], code: 'too_small' },
    { name: 'optionalIds long', value: { ...acceptance, template: { ...acceptance.template, optionalIds: names(11) } }, path: ['template', 'optionalIds'], code: 'too_big' },
    { name: 'optional id empty', value: { ...acceptance, template: { ...acceptance.template, optionalIds: [''] } }, path: ['template', 'optionalIds', 0], code: 'too_small' },
    { name: 'optional id long', value: { ...acceptance, template: { ...acceptance.template, optionalIds: ['a'.repeat(41)] } }, path: ['template', 'optionalIds', 0], code: 'too_big' },
    { name: 'optional id regex', value: { ...acceptance, template: { ...acceptance.template, optionalIds: ['a b'] } }, path: ['template', 'optionalIds', 0], code: 'invalid_format' },
  ];
  for (const field of ['version', 'template', 'input', 'criteria']) {
    const value: Record<string, unknown> = { ...acceptance };
    delete value[field];
    invalidAcceptance.push({ name: `${field} required`, value, path: [field], code: field === 'version' ? 'invalid_value' : 'invalid_type' });
  }
  for (const field of ['id', 'version']) {
    const template: Record<string, unknown> = { ...acceptance.template };
    delete template[field];
    invalidAcceptance.push({ name: `template ${field} required`, value: { ...acceptance, template }, path: ['template', field], code: 'invalid_type' });
  }
  it.each(invalidAcceptance)('rejects $name', ({ value, path, code, message }) => rejects(DevSessionAcceptanceSchema, value, path, code, message));
  it('accepts template and optional id boundaries without inventing required inputs', () => {
    for (const id of ['ab', 'a'.repeat(40)]) for (const version of [1, 2]) expect(DevSessionAcceptanceSchema.parse({ ...acceptance, template: { id, version } }).template).toEqual({ id, version });
    for (const optionalIds of [['a'], names(10), ['A-1_b.C', 'a'.repeat(40)]]) expect(DevSessionAcceptanceSchema.parse({ ...acceptance, template: { ...acceptance.template, optionalIds } }).template.optionalIds).toEqual(optionalIds);
  });
});

describe('s7560_blocco_nuovo', () => {
  it('round trips acceptance and base inside the digest', () => {
    for (const canonical of [OLD_CANONICAL, OLD_BASE_CANONICAL]) {
      const assignment = { ...JSON.parse(canonical).assignment, acceptance };
      const text = devSessionAssignmentCanonicalJson(assignment);
      expect(text).toContain('"acceptance"');
      expect(sha(text)).not.toBe(sha(canonical));
      const parsed = parseDevSessionBlock(renderDevSessionBlock(assignment, sha(text)));
      expect(parsed).toEqual({ ok: true, assignment, digest: sha(text) });
      if (!parsed.ok) throw new Error('New block must parse');
      expect(sha(devSessionAssignmentCanonicalJson(parsed.assignment))).toBe(parsed.digest);
    }
  });
  it('rejects extra keys in assignments and nested acceptance', () => {
    const assignment = JSON.parse(OLD_CANONICAL).assignment;
    rejects(DevSessionAssignmentSchema, { ...assignment, acceptance, extra: true }, [], 'unrecognized_keys');
    rejects(DevSessionAssignmentSchema, { ...assignment, acceptance: { ...acceptance, extra: true } }, ['acceptance'], 'unrecognized_keys');
  });
});

describe('s7560_storico', () => {
  it.each([
    ['original', OLD_CANONICAL, OLD_DIGEST, OLD_BLOCK],
    ['key and package', OLD_KEY_CANONICAL, OLD_KEY_DIGEST, OLD_KEY_BLOCK],
    ['base', OLD_BASE_CANONICAL, OLD_BASE_DIGEST, OLD_BASE_BLOCK],
  ])('storico_canonico and storico_blocco: %s', (_name, canonical, digest, block) => {
    const assignment = JSON.parse(canonical).assignment;
    expect(devSessionAssignmentCanonicalJson(assignment)).toBe(canonical);
    expect(sha(canonical)).toBe(digest);
    expect(renderDevSessionBlock(assignment, digest)).toBe(block);
    const parsed = parseDevSessionBlock(block);
    expect(parsed).toEqual({ ok: true, assignment, digest });
    if (!parsed.ok) throw new Error('Frozen block must parse');
    expect('acceptance' in parsed.assignment).toBe(false);
    expect(devSessionAssignmentCanonicalJson(parsed.assignment)).toBe(canonical);
    expect(sha(devSessionAssignmentCanonicalJson(parsed.assignment))).toBe(digest);
    if (_name === 'base') expect(parsed.assignment.base).toEqual({ ramo: 'consegna/49', commit: 'a'.repeat(40) });
  });
});

it('s7560_alias uses the Paperclip limits rather than copying their numbers', () => {
  expect(acceptanceContract.DEV_SESSION_ACCEPTANCE_MAX_CRITERIA).toBe(PAPERCLIP_CRITERI_MASSIMI);
  expect(acceptanceContract.DEV_SESSION_CRITERION_TEXT_MAX).toBe(PAPERCLIP_CRITERIO_MAX);
  const source = readFileSync(new URL('../../../src/capability/dev/session-acceptance.ts', import.meta.url), 'utf8');
  expect(source).toContain("from '../paperclip-protocollo/wire-creazione.js'");
  expect(source).toMatch(/DEV_SESSION_ACCEPTANCE_MAX_CRITERIA\s*=\s*PAPERCLIP_CRITERI_MASSIMI/);
  expect(source).toMatch(/DEV_SESSION_CRITERION_TEXT_MAX\s*=\s*PAPERCLIP_CRITERIO_MAX/);
  expect(source).not.toMatch(/=\s*(?:20|500)\b/);
});

