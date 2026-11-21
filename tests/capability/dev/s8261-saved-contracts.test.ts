import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  DevSessionAcceptanceSchema,
  DevSessionAssignmentSchema,
  devSessionAssignmentCanonicalJson,
  devSessionRequirements,
  parseDevSessionBlock,
} from '../../../src/capability/dev/index.js';

// Only the fixture envelope is described here; session contracts come from the bridge.
const savedBlockSchema = z.strictObject({
  id: z.string(),
  issue: z.number().int(),
  blocco: z.string().min(1),
  impronta: z.string().regex(/^[0-9a-f]{64}$/),
});
const fixture = z.strictObject({
  fonte: z.string().min(1),
  depurazione: z.string().min(1),
  controllo: z.string().min(1),
  blocchi: z.array(savedBlockSchema),
}).parse(JSON.parse(readFileSync(new URL('../../../fixtures/dev/s8261-saved-contracts.json', import.meta.url), 'utf8')));

const savedIds = ['R56', 'R57', 'R58', 'R59', 'R60', 'R61'];
type SavedBlock = z.infer<typeof savedBlockSchema>;

function assertCompleteSavedIds(blocks: readonly SavedBlock[]): void {
  expect(blocks.map(({ id }) => id).sort(), 'exact saved set R56–R61 (6/6)').toEqual(savedIds);
}

function readSaved(saved: SavedBlock) {
  const label = `${saved.id} (#${saved.issue}; ${fixture.fonte})`;
  expect(saved.id, label).toBe(`R${saved.issue}`);
  const lines = saved.blocco.split('\n');
  expect(lines, `${label}: four original block lines`).toHaveLength(4);
  const savedJson = lines[2]!;
  const expectedAssignment: unknown = JSON.parse(savedJson);
  // The coordinator supplied the already sorted JSON line and its signed digest.
  // Frame that fixed text, without parsing/sorting it through the schema under test.
  const expectedCanonical = `{"assignment":${savedJson},"domain":"x9.cap-dev.session-assignment"}`;
  const parsed = parseDevSessionBlock(saved.blocco);
  expect(parsed.ok, `${label}: saved block rejected (${parsed.ok ? 'ok' : parsed.reason})`).toBe(true);
  if (!parsed.ok) throw new Error(`${label}: ${parsed.reason}`);

  expect(parsed.assignment, `${label}: entire saved assignment`).toEqual(expectedAssignment);
  expect(DevSessionAssignmentSchema.parse(expectedAssignment), `${label}: assignment schema`).toEqual(expectedAssignment);
  expect(parsed.digest, `${label}: declared digest`).toBe(saved.impronta);
  const canonical = devSessionAssignmentCanonicalJson(parsed.assignment);
  expect(canonical, `${label}: fixed canonical text`).toBe(expectedCanonical);
  expect(createHash('sha256').update(canonical).digest('hex'), `${label}: canonical digest`).toBe(saved.impronta);
  return parsed.assignment;
}

describe('s8261 saved contracts', () => {
  it('s8261 salvati-r56-r61', () => {
    assertCompleteSavedIds(fixture.blocchi);
    expect(fixture.fonte).toContain('21/11/2026');
    let accepted = 0;
    let withAcceptance = 0;
    const returnReferences: { id: string; references: (string | undefined)[] }[] = [];
    for (const saved of fixture.blocchi) {
      const assignment = readSaved(saved);
      const acceptance = assignment.acceptance;
      if (saved.id === 'R58') {
        expect(assignment, 'R58: no invented acceptance').not.toHaveProperty('acceptance');
      } else {
        expect(acceptance, `${saved.id}: saved acceptance present`).toBeDefined();
        if (acceptance === undefined) throw new Error(`${saved.id}: acceptance missing`);
        expect(DevSessionAcceptanceSchema.parse(acceptance), `${saved.id}: acceptance schema`).toEqual(acceptance);
        expect(acceptance.version, saved.id).toBe(1);
        expect(acceptance.template.version, saved.id).toBe(1);
        expect(acceptance.template, `${saved.id}: optionalIds absent in source`).not.toHaveProperty('optionalIds');
        expect(acceptance.input, `${saved.id}: objective absent in source`).not.toHaveProperty('objective');
        const expanded = devSessionRequirements(acceptance);
        expect(expanded.ok, `${saved.id}: requirements accepted`).toBe(true);
        if (!expanded.ok) throw new Error(`${saved.id}: ${expanded.code}`);
        expect(expanded.requirements.filter(({ origin }) => origin !== 'modello')).toEqual(
          acceptance.criteria.map((criterion) => ({ ...criterion, needs: [] })),
        );
        expect(expanded.requirements.some(({ origin }) => origin === 'modello'), saved.id).toBe(true);
        returnReferences.push({
          id: saved.id,
          references: acceptance.criteria.filter(({ origin }) => origin === 'ritorno').map(({ reference }) => reference),
        });
        // Diagnostic only: 8271 may expand version 1 and change a delivery verdict.
        console.info(`s8261 ${saved.id}: expanded model requirements ${expanded.requirements.filter(({ origin }) => origin === 'modello').map(({ id }) => id).join(',')}; saved contract unchanged`);
        withAcceptance += 1;
      }
      accepted += 1;
      console.info(`s8261 ${saved.id}: source ${fixture.fonte}; accepted; canonical and digest unchanged; acceptance ${acceptance === undefined ? 'absent (saved)' : 'accepted'}`);
    }
    expect(returnReferences).toEqual([
      { id: 'R56', references: [] },
      { id: 'R57', references: [] },
      { id: 'R59', references: [] },
      { id: 'R60', references: ['Indicazione del Director in GOO-303 per la correzione di S-05 in GOO-295'] },
      { id: 'R61', references: ['R57-S-05'] },
    ]);
    expect(withAcceptance).toBe(5);
    expect(accepted).toBe(6);
    console.info('s8261 saved contracts accepted 6/6; acceptance and requirements accepted 5/5; absent acceptance preserved 1/1');
  });

  it('s8261 digest-alterato', () => {
    assertCompleteSavedIds(fixture.blocchi);
    const saved = fixture.blocchi[0]!;
    const altered = `${saved.impronta[0] === '0' ? '1' : '0'}${saved.impronta.slice(1)}`;
    // Change both declarations: only recomputing the actual canonical hash detects this.
    expect(() => readSaved({
      ...saved,
      impronta: altered,
      blocco: saved.blocco.replace(`sha256:${saved.impronta}`, `sha256:${altered}`),
    })).toThrow(/R56.*canonical digest/);
  });

  it('s8261 modello-sconosciuto', () => {
    assertCompleteSavedIds(fixture.blocchi);
    const assignment = readSaved(fixture.blocchi[0]!);
    const acceptance = assignment.acceptance;
    if (acceptance === undefined) throw new Error('R56: acceptance missing');
    const unknownVersion = DevSessionAcceptanceSchema.parse({
      ...acceptance,
      template: { ...acceptance.template, version: Number.MAX_SAFE_INTEGER },
    });
    expect(devSessionRequirements(unknownVersion)).toEqual({ ok: false, code: 'template_version_unknown' });
  });

  it('s8261 fixture-mancante', () => {
    assertCompleteSavedIds(fixture.blocchi);
    expect(() => assertCompleteSavedIds([])).toThrow(/exact saved set/);
    expect(() => assertCompleteSavedIds(fixture.blocchi.slice(1))).toThrow(/exact saved set/);
    expect(() => assertCompleteSavedIds([...fixture.blocchi.slice(1), fixture.blocchi[1]!])).toThrow(/exact saved set/);
    expect(() => assertCompleteSavedIds([...fixture.blocchi, fixture.blocchi[0]!])).toThrow(/exact saved set/);
  });
});
