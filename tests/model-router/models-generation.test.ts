import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  ModelsGenerationSchema, compareModelsGeneration, modelsEtag, parseModelsEtag,
  type ModelsEtagInput, type ModelsGeneration,
} from '../../src/model-router/index.js';

const g = (presetId: number | null, agentGeneration: number, presetGeneration: number): ModelsGeneration =>
  ({ presetId, agentGeneration, presetGeneration });

describe('compareModelsGeneration', () => {
  const table: Array<[string, ModelsGeneration, ModelsGeneration, string]> = [
    ['uguale', g(3, 5, 7), g(3, 5, 7), 'same'],
    ['uguale senza preset', g(null, 2, 0), g(null, 2, 0), 'same'],
    ['solo agente su', g(3, 6, 7), g(3, 5, 7), 'newer'],
    ['solo preset su', g(3, 5, 8), g(3, 5, 7), 'newer'],
    ['entrambi su', g(3, 6, 8), g(3, 5, 7), 'newer'],
    ['solo agente giù', g(3, 4, 7), g(3, 5, 7), 'older'],
    ['solo preset giù', g(3, 5, 6), g(3, 5, 7), 'older'],
    ['entrambi giù', g(3, 4, 6), g(3, 5, 7), 'older'],
    ['agente su e preset giù', g(3, 6, 6), g(3, 5, 7), 'incomparable'],
    ['agente giù e preset su', g(3, 4, 8), g(3, 5, 7), 'incomparable'],
    ['preset diverso, agente su', g(4, 6, 0), g(3, 5, 9), 'newer'],
    ['preset diverso, agente giù', g(4, 4, 9), g(3, 5, 0), 'older'],
    ['preset diverso, agente uguale', g(4, 5, 1), g(3, 5, 1), 'incomparable'],
    ['preset diverso, presetGeneration più alto ma agente più basso', g(4, 4, 99), g(3, 5, 1), 'older'],
    ['preset diverso, presetGeneration più basso ma agente più alto', g(4, 6, 0), g(3, 5, 99), 'newer'],
    ['da nessun preset a un preset, agente su', g(3, 6, 0), g(null, 5, 0), 'newer'],
    ['da un preset a nessuno, agente su', g(null, 6, 0), g(3, 5, 4), 'newer'],
    ['da nessun preset a un preset, agente uguale', g(3, 5, 0), g(null, 5, 0), 'incomparable'],
    ['preset cancellato e ricreato (id nuovo, contatori a 0), agente su', g(9, 6, 0), g(3, 5, 12), 'newer'],
    ['preset cancellato e ricreato, ma risposta vecchia dell\'agente', g(3, 5, 12), g(9, 6, 0), 'older'],
  ];
  for (const [name, next, current, expected] of table) {
    it(`${name} → ${expected}`, () => expect(compareModelsGeneration(next, current)).toBe(expected));
  }
});

describe('ModelsGenerationSchema', () => {
  it('accetta contatori validi e preset nullo con contatore a 0', () => {
    expect(ModelsGenerationSchema.safeParse(g(1, 0, 0)).success).toBe(true);
    expect(ModelsGenerationSchema.safeParse(g(null, 4, 0)).success).toBe(true);
  });
  it.each([
    ['preset 0', g(0, 1, 1)], ['preset negativo', g(-1, 1, 1)], ['preset non intero', g(1.5, 1, 1)],
    ['agente negativo', g(1, -1, 0)], ['preset-generation non intera', g(1, 0, 0.5)],
    ['nessun preset ma contatore di preset > 0', g(null, 1, 1)],
    ['campo in più', { ...g(1, 1, 1), extra: true }], ['campo mancante', { presetId: 1, agentGeneration: 1 }],
  ])('rifiuta %s', (_name, value) => expect(ModelsGenerationSchema.safeParse(value).success).toBe(false));
});

describe('modelsEtag / parseModelsEtag', () => {
  const base = (): ModelsEtagInput => ({
    mode: 'v2',
    identity: { managementAgentId: 'synthetic-agent', runtimeAgentId: 'synthetic-runtime', vaultAgentId: 12 },
    generation: g(3, 5, 7),
  });

  it('ha la forma m2-<mode>-<vaultAgentId>-<presetId>-<agentGeneration>-<presetGeneration>-<hash16>', () => {
    expect(modelsEtag(base())).toMatch(/^m2-v2-12-3-5-7-[0-9a-f]{16}$/);
    expect(modelsEtag({ ...base(), generation: g(null, 5, 0) })).toMatch(/^m2-v2-12-null-5-0-[0-9a-f]{16}$/);
  });

  it('l\'hash è il sha256 del JSON canonico dei campi, primi 16 esadecimali', () => {
    const canonical = JSON.stringify({
      mode: 'v2', managementAgentId: 'synthetic-agent', runtimeAgentId: 'synthetic-runtime', vaultAgentId: 12,
      presetId: 3, agentGeneration: 5, presetGeneration: 7,
    });
    expect(modelsEtag(base()).endsWith('-' + createHash('sha256').update(canonical).digest('hex').slice(0, 16))).toBe(true);
  });

  it('è stabile con le chiavi in ordine diverso', () => {
    const reordered: ModelsEtagInput = {
      generation: { presetGeneration: 7, agentGeneration: 5, presetId: 3 },
      identity: { vaultAgentId: 12, runtimeAgentId: 'synthetic-runtime', managementAgentId: 'synthetic-agent' },
      mode: 'v2',
    };
    expect(modelsEtag(reordered)).toBe(modelsEtag(base()));
  });

  const variants: Array<[string, (i: ModelsEtagInput) => ModelsEtagInput]> = [
    ['mode', i => ({ ...i, mode: 'v1' })],
    ['managementAgentId', i => ({ ...i, identity: { ...i.identity, managementAgentId: 'synthetic-other' } })],
    ['runtimeAgentId', i => ({ ...i, identity: { ...i.identity, runtimeAgentId: 'synthetic-other' } })],
    ['vaultAgentId', i => ({ ...i, identity: { ...i.identity, vaultAgentId: 13 } })],
    ['presetId', i => ({ ...i, generation: { ...i.generation, presetId: 4 } })],
    ['agentGeneration', i => ({ ...i, generation: { ...i.generation, agentGeneration: 6 } })],
    ['presetGeneration', i => ({ ...i, generation: { ...i.generation, presetGeneration: 8 } })],
  ];
  for (const [field, change] of variants) {
    it(`cambia se cambia ${field}`, () => expect(modelsEtag(change(base()))).not.toBe(modelsEtag(base())));
  }

  it('la parte in chiaro non basta: cambiare solo runtimeAgentId o managementAgentId cambia l\'hash', () => {
    const hashOf = (value: string) => value.slice(-16);
    const changed = (identity: Partial<ModelsEtagInput['identity']>) => modelsEtag({ ...base(), identity: { ...base().identity, ...identity } });
    expect(hashOf(changed({ runtimeAgentId: 'synthetic-other' }))).not.toBe(hashOf(modelsEtag(base())));
    expect(hashOf(changed({ managementAgentId: 'synthetic-other' }))).not.toBe(hashOf(modelsEtag(base())));
  });

  it('rifiuta input non valido', () => {
    expect(() => modelsEtag({ ...base(), generation: g(null, 1, 1) })).toThrow();
    expect(() => modelsEtag({ ...base(), mode: 'v3' as never })).toThrow();
  });

  it('parseModelsEtag restituisce i campi', () => {
    expect(parseModelsEtag(modelsEtag(base()))).toEqual({ mode: 'v2', vaultAgentId: 12, generation: g(3, 5, 7) });
    expect(parseModelsEtag(modelsEtag({ ...base(), mode: 'v1', generation: g(null, 2, 0) })))
      .toEqual({ mode: 'v1', vaultAgentId: 12, generation: g(null, 2, 0) });
  });

  it.each([
    ['stringa vuota', ''], ['testo qualsiasi', 'x'], ['numero', 42], ['null', null], ['oggetto', {}],
    ['numeri non interi', 'm2-v2-12-3-5.5-7-0123456789abcdef'], ['vault non intero', 'm2-v2-1.2-3-5-7-0123456789abcdef'],
    ['numero negativo', 'm2-v2-12-3--5-7-0123456789abcdef'], ['mode sconosciuto', 'm2-v3-12-3-5-7-0123456789abcdef'],
    ['hash corto', 'm2-v2-12-3-5-7-0123'], ['hash non esadecimale', 'm2-v2-12-3-5-7-zzzzzzzzzzzzzzzz'],
    ['vaultAgentId 0', 'm2-v2-0-3-5-7-0123456789abcdef'], ['presetId 0', 'm2-v2-12-0-5-7-0123456789abcdef'],
    ['senza preset ma contatore di preset > 0', 'm2-v2-12-null-5-7-0123456789abcdef'],
    ['numero oltre il massimo intero sicuro', 'm2-v2-12-3-99999999999999999999-7-0123456789abcdef'],
    ['prefisso diverso', 'm1-v2-12-3-5-7-0123456789abcdef'], ['parte in più', 'm2-v2-12-3-5-7-0123456789abcdef-x'],
  ])('parseModelsEtag dà null su %s senza eccezioni', (_name, value) => expect(parseModelsEtag(value)).toBeNull());
});
