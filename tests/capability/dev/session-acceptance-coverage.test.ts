import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DevSessionAcceptanceSchema } from '../../../src/capability/dev/session-acceptance.js';
import { DevSessionDeliveredFileSchema } from '../../../src/capability/dev/session-assignment.js';
import {
  DEV_SESSION_COVERAGE_IDENTITY, DevSessionCoverageImageSchema,
  devSessionCoverageSlots, devSessionCoverageMissing,
} from '../../../src/capability/dev/session-acceptance-coverage.js';
import {
  devSessionAcceptanceCriteriaTexts, devSessionAcceptanceReference,
} from '../../../src/capability/dev/session-acceptance-paperclip.js';
import { PaperclipFiglioCreaCampiSchema } from '../../../src/capability/paperclip-protocollo/wire-creazione.js';

const digest = 'a'.repeat(64);
const image = (covers: string[], index = 0) => ({ path: `proofs/image-${index}.png`, sha256: digest, covers });
const acceptance = DevSessionAcceptanceSchema.parse({
  version: 1, template: { id: 'design-sito', version: 1 }, input: {},
  criteria: [{ id: 'C-01', text: 'Show the requested page', attestor: 'referente', proof: 'Preview', origin: 'capo' }],
});

describe('session acceptance coverage and Paperclip', () => {
  it('s7565_slot', () => {
    expect(DEV_SESSION_COVERAGE_IDENTITY).toEqual(['ingresso', 'navigazione', 'risultato']);
    expect(devSessionCoverageSlots({
      screens: [{ name: 'home', purpose: 'Entry' }, { name: 'result', purpose: 'Result' }],
      behaviors: ['submit'], states: ['vuoto', 'pieno'], formats: ['telefono', 'computer'],
    })).toEqual([
      'screen:home', 'screen:result', 'behavior:submit', 'state:vuoto', 'state:pieno',
      'format:telefono', 'format:computer', 'identity:ingresso', 'identity:navigazione', 'identity:risultato',
    ]);
    expect(devSessionCoverageSlots({ behaviors: ['submit'], states: ['errore'], formats: ['telefono'] }))
      .toEqual(['behavior:submit', 'state:errore', 'format:telefono']);
    expect(devSessionCoverageSlots({})).toEqual([]);
    expect(devSessionCoverageSlots({ screens: [] })).toEqual([]);
    expect(devSessionCoverageSlots({ screens: [{ name: 'home', purpose: 'Entry' }] }))
      .toEqual(['screen:home', 'identity:ingresso', 'identity:navigazione', 'identity:risultato']);
  });

  it('s7565_copertura', () => {
    const screens = Array.from({ length: 20 }, (_, index) => ({ name: `page-${index}`, purpose: 'Page' }));
    const slots = devSessionCoverageSlots({ screens });
    const images = screens.map(({ name }, index) => DevSessionCoverageImageSchema.parse(image([
      `screen:${name}`, ...(index === 0 ? ['identity:ingresso', 'identity:navigazione', 'identity:risultato'] : []),
    ], index)));
    expect(devSessionCoverageMissing(slots, images.slice(0, 9))).toEqual(screens.slice(9).map(({ name }) => `screen:${name}`));
    expect(devSessionCoverageMissing(slots, images)).toEqual([]);
    const source = readFileSync(new URL('../../../src/capability/dev/session-acceptance-coverage.ts', import.meta.url), 'utf8');
    expect(source).not.toContain('business-unit-type');
  });

  it('s7565_manca', () => {
    const slots = ['screen:home', 'behavior:submit', 'state:vuoto', 'format:telefono'];
    expect(devSessionCoverageMissing(slots, [])).toEqual(slots);
    expect(devSessionCoverageMissing(slots, slots.map((slot, index) => image([slot], index)))).toEqual([]);
    expect(devSessionCoverageMissing(slots, [image(['screen:other'])])).toEqual(slots);
    expect(devSessionCoverageMissing([], [image(['screen:other'])])).toEqual([]);
    expect(devSessionCoverageMissing(slots, [image(['screen:home', 'state:vuoto', 'format:telefono'])]))
      .toEqual(['behavior:submit']);
    expect(devSessionCoverageMissing(slots, [image(['behavior:submit', 'identity:ingresso'])]))
      .toEqual(['screen:home', 'state:vuoto', 'format:telefono']);
  });

  it('s7565_immagine', () => {
    const valid = image(['screen:home', 'behavior:submit', 'state:vuoto', 'format:telefono', 'identity:ingresso']);
    expect(DevSessionCoverageImageSchema.parse(valid)).toEqual(valid);
    expect(DevSessionCoverageImageSchema.shape.path).toBe(DevSessionDeliveredFileSchema.shape.path);
    expect(DevSessionCoverageImageSchema.shape.sha256).toBe(DevSessionDeliveredFileSchema.shape.sha256);
    for (const kind of ['screen', 'behavior', 'state', 'format']) {
      const parsed = DevSessionCoverageImageSchema.safeParse(image([`${kind}:first`, `${kind}:second`]));
      expect(parsed.success).toBe(false);
      if (!parsed.success) expect(parsed.error.issues).toContainEqual(expect.objectContaining({ message: 'cover_kind_repeated' }));
      expect(DevSessionCoverageImageSchema.safeParse(image([`${kind}:first`, `${kind}:first`])).success).toBe(false);
    }
    for (const covers of [
      ['screen:'], ['screen:Home'], ['screen:-home'], ['screen:a.b'], ['screen:home/other'],
      ['screen:' + 'a'.repeat(41)], ['unknown:home'], ['screen:home\n'], [],
      Array.from({ length: 11 }, (_, index) => `identity:item-${index}`),
    ]) expect(DevSessionCoverageImageSchema.safeParse(image(covers)).success).toBe(false);
    expect(DevSessionCoverageImageSchema.safeParse(image(['identity:a'])).success).toBe(true);
    expect(DevSessionCoverageImageSchema.safeParse(image(Array.from({ length: 10 }, (_, index) => `identity:item-${index}`))).success).toBe(true);
    expect(DevSessionCoverageImageSchema.safeParse(image(['screen:' + 'a'.repeat(40), 'identity:a_b-0'])).success).toBe(true);
    for (const invalid of [
      { ...valid, path: 'proofs/../image.png' }, { ...valid, sha256: 'a'.repeat(63) },
      { ...valid, sha256: 'A'.repeat(64) }, { ...valid, extra: true },
    ]) expect(DevSessionCoverageImageSchema.safeParse(invalid).success).toBe(false);
  });

  it('s7565_testi', () => {
    const full = DevSessionAcceptanceSchema.parse({
      ...acceptance,
      criteria: Array.from({ length: 20 }, (_, index) => ({
        ...acceptance.criteria[0], id: `C-${index}`, text: `${index}`.padEnd(500, 'x'),
      })),
    });
    const texts = devSessionAcceptanceCriteriaTexts(full);
    expect(texts).toEqual(full.criteria.map(({ text }) => text));
    expect(texts).toHaveLength(20);
    expect(texts.every((text) => text.length === 500)).toBe(true);
    expect(PaperclipFiglioCreaCampiSchema.shape.acceptanceCriteria.parse(texts)).toEqual(texts);
    expect(devSessionAcceptanceCriteriaTexts(acceptance)).toEqual(['Show the requested page']);
  });

  it('s7565_riferimento', () => {
    const reference = devSessionAcceptanceReference(acceptance, 42, digest);
    expect(reference).toBe([
      `Contratto di accettazione dell'incarico di sessione #42, impronta ${digest}`,
      'Modello: design-sito versione 1',
      'Criteri di forma:',
      '- D-01 (esecutore): La skill obbligatoria è stata caricata prima del primo file di interfaccia',
      '- D-02 (esecutore): Il cancello finale passa sui file consegnati',
      '- D-03 (esecutore): Il rilevatore non trova difetti bloccanti sui file consegnati',
      "- D-04 (esecutore): Nessun errore di movimento dell'elenco, movimento ridotto gestito",
      "- D-05 (esecutore): C'è almeno un'immagine per ogni sezione chiesta, ogni comportamento chiesto (stati e interazioni principali), ogni formato e ogni elemento identificativo (ingresso, navigazione, schermata del risultato)",
      '- D-08 (sessione): Scostamenti dal brand dichiarati con il motivo',
      "- D-09 (esecutore): Il pacchetto per il referente ha un pdf con ogni schermata disponibile della consegna e il collegamento alla demo navigabile, senza un numero fisso di schermate",
      '- D-11 (referente): Il design è quello che serve',
    ].join('\n'));
    expect(reference.length).toBeLessThan(4000);
    const development = { ...acceptance, template: { id: 'sviluppo-pezzo-app', version: 1, optionalIds: ['S-03'] } };
    const developmentReference = devSessionAcceptanceReference(development, 7, digest);
    expect(developmentReference).toBe([
      `Contratto di accettazione dell'incarico di sessione #7, impronta ${digest}`,
      'Modello: sviluppo-pezzo-app versione 1',
      'Criteri di forma:',
      '- S-01 (esecutore): I sorgenti sono in un commit raggiungibile',
      "- S-02 (esecutore): Le prove passano sull'albero del commit",
      "- S-05 (esecutore): Il percorso dell'utente funziona dall'inizio alla fine sui dati dichiarati",
      '- S-07 (esecutore): I file cambiati stanno nel perimetro',
      '- S-08 (sessione): Che cosa è stato fatto e che cosa no, in parole',
      "- S-10 (referente): L'utente può usare il pezzo",
      "- S-11 (esecutore): Il lavoro si costruisce da un'installazione pulita: se il progetto ha un package.json, le dipendenze si installano dal lockfile consegnato prima delle prove",
      '- S-03 (esecutore): Le prove nel browser passano dopo il commit',
    ].join('\n'));
    expect(developmentReference.length).toBeLessThan(4000);
    for (const issueNumber of [0, -1, 1.5, NaN, Infinity]) {
      expect(() => devSessionAcceptanceReference(acceptance, issueNumber, digest)).toThrow();
    }
    for (const invalidDigest of ['a'.repeat(63), 'a'.repeat(65), 'A'.repeat(64), 'g'.repeat(64), digest + '\n']) {
      expect(() => devSessionAcceptanceReference(acceptance, 42, invalidDigest)).toThrow();
    }
    for (const template of [
      { id: 'unknown', version: 1 }, { id: 'toString', version: 1 },
      { id: 'design-sito', version: 2 }, { id: 'design-sito', version: 1, optionalIds: ['S-03'] },
    ]) expect(() => devSessionAcceptanceReference({ ...acceptance, template }, 42, digest)).toThrow();
    expect(() => devSessionAcceptanceReference({
      ...acceptance, criteria: [{ ...acceptance.criteria[0]!, id: 'D-01' }],
    }, 42, digest)).toThrow();
  });
});
