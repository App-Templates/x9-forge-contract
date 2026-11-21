import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  DEV_SESSION_CODE_OPENING_MOVES, DEV_SESSION_ACCEPTANCE_SCHEMA_ISSUES,
  DevSessionAcceptanceSchema, DevSessionAcceptanceInputSchema,
} from '../../../src/capability/dev/session-acceptance.js';
import { ToolErrorDispositionSchema } from '../../../src/capability/tool-error-disposition.js';
import {
  DevSessionAssignmentSchema, devSessionAssignmentCanonicalJson, renderDevSessionBlock, parseDevSessionBlock,
} from '../../../src/capability/dev/session-assignment.js';

const sha = (text: string) => createHash('sha256').update(text).digest('hex');
const OBJECTIVE = "L'utente potrà scegliere un prodotto e vederne la scheda con i dati veri.";

// Shape of R56: version 1, development template v1, capo criteria.
const acceptance = {
  version: 1,
  template: { id: 'sviluppo-pezzo-app', version: 1 },
  input: {
    userPath: ['Apre la lista', 'Sceglie un prodotto'],
    data: 'veri',
    proofScripts: ['test:e2e'],
    visualSource: { kind: 'nessuna' },
  },
  criteria: [{ id: 'c-1', text: 'La scheda mostra il prodotto scelto', attestor: 'referente', proof: 'Lo apre e lo vede', origin: 'capo' }],
};
const assignment = {
  businessUnit: { slug: 'sviluppo' }, companyId: 'good-choice', createdAt: '2026-10-27T15:00:00+01:00',
  destination: { repo: 'App-Templates/goodchoice-backtest' }, materials: [], miniPlan: '1. Struttura. 2. Test.',
  organizationId: 'good-choice', ownerId: '7', productKind: 'code', projectId: 'good-choice-app',
  requestedBy: { managementAgentId: 'capo-sviluppo', runtimeAgentId: 'capo-sviluppo', vaultAgentId: 62 },
  task: 'Costruisci il Modulo A.', tenantId: 'tenant-1', title: 'Modulo A', version: 1,
};
const withObjective = (objective: unknown) => ({ ...acceptance, input: { ...acceptance.input, objective } });

describe('s8260 obiettivo', () => {
  it('s8260 obiettivo-nella-forma', () => {
    const parsed = DevSessionAcceptanceSchema.parse(withObjective(OBJECTIVE));
    expect(parsed.input.objective).toBe(OBJECTIVE);
    const full = { ...assignment, acceptance: withObjective(OBJECTIVE) };
    const text = devSessionAssignmentCanonicalJson(full);
    expect(text).toContain('"objective"');
    const block = parseDevSessionBlock(renderDevSessionBlock(full, sha(text)));
    expect(block.ok).toBe(true);
    if (!block.ok) throw new Error('block must parse');
    expect(block.assignment.acceptance?.input.objective).toBe(OBJECTIVE);
    expect(sha(devSessionAssignmentCanonicalJson(block.assignment))).toBe(block.digest);
    expect(DevSessionAssignmentSchema.parse(full)).toEqual(block.assignment);
  });

  it('s8260 salvato-senza-obiettivo', () => {
    const parsed = DevSessionAcceptanceSchema.parse(acceptance);
    expect(parsed).toEqual(acceptance);
    expect('objective' in parsed.input).toBe(false);
    expect(JSON.stringify(parsed)).toBe(JSON.stringify(acceptance));
    expect(devSessionAssignmentCanonicalJson({ ...assignment, acceptance })).not.toContain('objective');
  });

  it('s8260 obiettivo-vuoto', () => {
    expect(DevSessionAcceptanceInputSchema.safeParse({ objective: '   ' }).success).toBe(false);
  });
  it('s8260 obiettivo-lungo', () => {
    expect(DevSessionAcceptanceInputSchema.safeParse({ objective: 'a'.repeat(500) }).success).toBe(true);
    expect(DevSessionAcceptanceInputSchema.safeParse({ objective: 'a'.repeat(501) }).success).toBe(false);
  });
  it('s8260 campo-sconosciuto', () => {
    expect(DevSessionAcceptanceInputSchema.safeParse({ objective: OBJECTIVE, goal: 'x' }).success).toBe(false);
  });

  it('s8260 tre-mosse', () => {
    expect(Object.keys(DEV_SESSION_CODE_OPENING_MOVES).sort()).toEqual(['base_required', 'objective_missing', 'piece_missing']);
    const fields = { objective_missing: 'objective', piece_missing: 'piece', base_required: 'base' } as const;
    for (const [code, move] of Object.entries(DEV_SESSION_CODE_OPENING_MOVES)) {
      expect(move.field).toBe(fields[code as keyof typeof fields]);
      expect(move.actor).toBe('capo');
      expect(move.move.length).toBeGreaterThan(10);
      expect(ToolErrorDispositionSchema.safeParse(move.disposition).success).toBe(true);
      expect(move.disposition).toEqual({ nature: 'missing_data', retry: 'never', nextMove: 'fix_input' });
      expect((DEV_SESSION_ACCEPTANCE_SCHEMA_ISSUES as readonly string[]).includes(code)).toBe(false);
    }
  });

  it('s8260 versione', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')).version;
    const entries = [...readFileSync('CHANGELOG.md', 'utf8').matchAll(/^## v(\S+)/gm)].map((m) => m[1]);
    expect(pkg).toBe('1.269.0');
    expect(entries[0]).toBe('1.269.0');
    expect(entries[1]).toBe('1.268.0');
  });
});
