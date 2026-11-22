import { describe, expect, it } from 'vitest';
import { DEV_SESSION_ACCEPTANCE_CATALOG } from '../../../src/capability/dev/session-acceptance-catalog.js';
import { DEV_SESSION_TEMPLATES, devSessionRequirements } from '../../../src/capability/dev/session-acceptance-templates.js';
import { devSessionAcceptanceReference } from '../../../src/capability/dev/session-acceptance-paperclip.js';
import { DevSessionAcceptanceSchema } from '../../../src/capability/dev/session-acceptance.js';

const digest = 'b'.repeat(64);
const criterion = { id: 'piece-save', text: 'The user can save.', attestor: 'revisore' as const, proof: 'Observe the saved item.', origin: 'capo' as const };

function contract(id: 'design-sito' | 'design-schermata-app') {
  return DevSessionAcceptanceSchema.parse({
    version: 1, template: { id, version: 1 },
    input: {
      screens: [{ name: 'home', purpose: 'Save an item' }], states: ['vuoto'], formats: ['telefono', 'computer'],
      visualSource: { kind: 'tavola_approvata', reference: 'asset-design-1' },
    },
    criteria: [criterion],
  });
}

function d09Text(id: 'design-sito' | 'design-schermata-app'): string {
  const resolved = devSessionRequirements(contract(id));
  if (!resolved.ok) throw new Error(resolved.code);
  const found = resolved.requirements.find((r) => r.id === 'D-09');
  if (found === undefined) throw new Error('D-09 missing');
  return found.text;
}

describe('s8188', () => {
  it('s8188 d09-senza-numero', () => {
    for (const id of ['design-sito', 'design-schermata-app'] as const) {
      const text = d09Text(id);
      expect(text).toContain('pdf');
      expect(text).toContain('ogni schermata disponibile della consegna');
      expect(text).toContain('demo navigabile');
      expect(text).not.toContain('al massimo');
      expect(text).not.toMatch(/\d/);
      expect(devSessionAcceptanceReference(contract(id), 42, digest)).toContain(`- D-09 (esecutore): ${text}`);
    }
  });

  it('s8188 resto-uguale', () => {
    const d09 = DEV_SESSION_ACCEPTANCE_CATALOG['D-09'];
    expect(d09.attestor).toBe('esecutore');
    expect(d09.needs).toEqual(['package']);
    expect(d09.proof).toBe('controllo del pacchetto');
    expect(DEV_SESSION_TEMPLATES['design-sito'].formCriteria).toContain('D-09');
    expect(DEV_SESSION_TEMPLATES['design-schermata-app'].formCriteria).toContain('D-09');
    expect(DEV_SESSION_TEMPLATES['design-ritocco'].formCriteria).not.toContain('D-09');
    expect(DEV_SESSION_TEMPLATES['sviluppo-pezzo-app'].formCriteria).not.toContain('D-09');
    for (const t of Object.values(DEV_SESSION_TEMPLATES)) expect(t.version).toBe(1);
    expect(Object.keys(DEV_SESSION_ACCEPTANCE_CATALOG)).toHaveLength(33);
    expect(DEV_SESSION_ACCEPTANCE_CATALOG['D-05'].text).toBe("C'è almeno un'immagine per ogni sezione chiesta, ogni comportamento chiesto (stati e interazioni principali), ogni formato e ogni elemento identificativo (ingresso, navigazione, schermata del risultato)");
    expect(devSessionRequirements(contract('design-sito')).ok).toBe(true);
  });
});
