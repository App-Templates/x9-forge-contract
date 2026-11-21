import { describe, expect, it } from 'vitest';
import { DevSessionAcceptanceSchema } from '../../../src/capability/dev/session-acceptance.js';
import { devSessionBranch } from '../../../src/capability/dev/session-assignment.js';
import { devSessionRequirements } from '../../../src/capability/dev/session-acceptance-templates.js';
import {
  devSessionContractDocumentKey, devSessionContractDocumentBody,
} from '../../../src/capability/dev/session-acceptance-paperclip.js';
import {
  PAPERCLIP_DOCUMENT_BODY_MAX, PaperclipDocumentoChiaveSchema, PaperclipDocumentoScriviCorpoSchema,
} from '../../../src/capability/paperclip-protocollo/wire-documenti.js';

const digest = '0123456789abcdef'.repeat(4);

// Production-shaped R61 input: no live issue or session-board access is needed by these tests.
const r61 = DevSessionAcceptanceSchema.parse({
  version: 1,
  template: { id: 'sviluppo-pezzo-app', version: 1 },
  input: {
    userPath: ['Apre il backtest', 'Sceglie il periodo', 'Lancia il calcolo', 'Legge il risultato'],
    data: 'di_prova',
    proofScripts: ['test:unit', 'test:build', 'test:lint', 'test:types', 'test:path', 'test:smoke'],
    visualSource: { kind: 'tavola_approvata', reference: 'asset-design-1' },
    look: { kind: 'prototipo', tryPath: ['Apri il backtest', 'Scegli il periodo', 'Leggi il risultato'] },
  },
  criteria: [
    { id: 'm-1', text: 'Il risultato rispetta il mandato.', attestor: 'referente', proof: 'Risposta del referente.', origin: 'mandato' },
    { id: 'c-1', text: 'Il percorso richiesto funziona.', attestor: 'sessione', proof: 'Attestazione del percorso.', origin: 'capo' },
    { id: 'r-1', text: 'Il difetto segnalato è risolto.', attestor: 'revisore', proof: 'Revisione del risultato.', origin: 'ritorno', reference: 'R57: risultato mancante' },
  ],
});

// The saved R56 shape already covered by session-acceptance-templates.test.ts, without look.
const r56 = DevSessionAcceptanceSchema.parse({
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
});

describe('s8160 session contract document', () => {
  it('s8160 chiave-e-testo', () => {
    const before = structuredClone(r61);
    const base = { ramo: 'consegna/57', commit: 'b'.repeat(40) };
    const document = devSessionContractDocumentBody({ acceptance: r61, issueNumber: 61, digest, base, deliverableKey: 'backtest' });
    expect(devSessionContractDocumentKey(61)).toBe('contratto-r61');
    expect(document.key).toBe('contratto-r61');
    expect(PaperclipDocumentoChiaveSchema.parse(document.key)).toBe(document.key);
    const { key, ...wire } = document;
    expect(key).toBe('contratto-r61');
    expect(PaperclipDocumentoScriviCorpoSchema.parse({ ...wire, format: 'markdown' })).toEqual({ ...wire, format: 'markdown' });
    expect(document.title).toBe('Contratto della sessione R61');
    expect(document.changeSummary).toBe(`Apertura della sessione R61: contratto con impronta ${digest.slice(0, 12)}`);
    expect(document.body.split('\n').slice(0, 5)).toEqual([
      `Impronta: ${digest}`, 'Modello: sviluppo-pezzo-app versione 1', 'Pezzo: backtest',
      `Base di partenza: ${base.ramo} (commit ${base.commit})`, 'Da guardare: prototipo',
    ]);
    for (const step of r61.input.look?.tryPath ?? []) expect(document.body).toContain(`- ${step}`);
    const groups = document.body.split('### ');
    expect(groups.slice(1).map((group) => group.split('\n')[0])).toEqual(['Sessione', 'Esecutore', 'Referente/revisore']);
    const resolved = devSessionRequirements(r61);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) throw new Error(resolved.code);
    for (const criterion of resolved.requirements) {
      const group = criterion.attestor === 'sessione' ? groups[1] : criterion.attestor === 'esecutore' ? groups[2] : groups[3];
      const origin = criterion.reference === undefined ? criterion.origin : `${criterion.origin} (${criterion.reference})`;
      expect(group).toContain(`- ${criterion.id} — ${criterion.text} — prova: ${criterion.proof} — origine: ${origin}`);
      if (criterion.attestor === 'referente' || criterion.attestor === 'revisore') expect(group).toContain(`— attesta: ${criterion.attestor}`);
    }
    expect(document.body).not.toContain('\\');
    expect(document.body).not.toContain('```');
    expect(document.body.length).toBeLessThan(PAPERCLIP_DOCUMENT_BODY_MAX);
    expect(r61).toEqual(before);
  });

  it('s8160 numero-non-valido', () => {
    for (const issueNumber of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => devSessionBranch(issueNumber)).toThrow('issue number must be a positive integer');
      expect(() => devSessionContractDocumentKey(issueNumber)).toThrow('issue number must be a positive integer');
      expect(() => devSessionContractDocumentBody({ acceptance: r61, issueNumber, digest })).toThrow('issue number must be a positive integer');
    }
  });

  it('s8160 impronta-non-valida', () => {
    for (const invalid of ['a'.repeat(63), 'a'.repeat(65), 'A'.repeat(64), 'g'.repeat(64), `${'a'.repeat(63)}\n`]) {
      expect(() => devSessionContractDocumentBody({ acceptance: r61, issueNumber: 61, digest: invalid }))
        .toThrow('digest must be 64 lowercase hexadecimal characters');
    }
  });

  it('s8160 niente-backslash-n', () => {
    const acceptance = DevSessionAcceptanceSchema.parse({
      ...r61,
      input: { ...r61.input, look: { kind: 'prototipo', tryPath: ['Apri\\nuovo', 'Prova\\tabella'] } },
      criteria: [{ id: 'r-1', text: 'Testo\\nuovo', attestor: 'revisore', proof: 'prove\\testo', origin: 'ritorno', reference: 'R57\\nota' }],
    });
    const document = devSessionContractDocumentBody({
      acceptance, issueNumber: 61, digest, deliverableKey: 'pezzo\\nuovo',
      base: { ramo: 'ramo\\nuovo', commit: 'b'.repeat(40) },
    });
    expect(document.body).not.toContain('\\');
    for (const text of ['Testo/nuovo', 'prove/testo', 'R57/nota', 'Apri/nuovo', 'Prova/tabella', 'pezzo/nuovo', 'ramo/nuovo']) {
      expect(document.body).toContain(text);
    }
    expect(acceptance.criteria[0]?.text).toBe('Testo\\nuovo');
  });

  it('s8160 contratto-salvato-uguale', () => {
    const before = structuredClone(r56);
    const first = devSessionContractDocumentBody({ acceptance: r56, issueNumber: 56, digest });
    const second = devSessionContractDocumentBody({ acceptance: r56, issueNumber: 56, digest });
    expect(first).toEqual(second);
    expect(first.body).toContain('Base di partenza: ramo principale');
    expect(first.body).not.toContain('Pezzo:');
    expect(first.body).not.toContain('Da guardare:');
    expect(first.body.length).toBeLessThan(PAPERCLIP_DOCUMENT_BODY_MAX);
    const { key, ...wire } = first;
    expect(key).toBe('contratto-r56');
    expect(PaperclipDocumentoScriviCorpoSchema.safeParse({ ...wire, format: 'markdown' }).success).toBe(true);
    expect(r56).toEqual(before);
  });

  it('s8160 modello-non-risolto', () => {
    for (const [template, code] of [
      [{ id: 'sconosciuto', version: 1 }, 'template_unknown'],
      [{ id: 'sviluppo-pezzo-app', version: 2 }, 'template_version_unknown'],
      [{ id: 'sviluppo-pezzo-app', version: 1, optionalIds: ['D-01'] }, 'template_optional_not_offered'],
    ] as const) {
      const acceptance = DevSessionAcceptanceSchema.parse({ ...r61, template });
      expect(() => devSessionContractDocumentBody({ acceptance, issueNumber: 61, digest })).toThrow(code);
    }
    const acceptance = DevSessionAcceptanceSchema.parse({ ...r61, criteria: [{ ...r61.criteria[0], id: 'S-11' }] });
    expect(() => devSessionContractDocumentBody({ acceptance, issueNumber: 61, digest })).toThrow('criterion_id_clashes_catalog');
  });

  it('s8160 limite-documento', () => {
    expect(() => devSessionContractDocumentBody({
      acceptance: r61, issueNumber: 61, digest, deliverableKey: 'x'.repeat(PAPERCLIP_DOCUMENT_BODY_MAX),
    })).toThrow();
  });
});
