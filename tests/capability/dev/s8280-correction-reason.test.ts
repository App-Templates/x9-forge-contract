import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  DEV_SESSION_ACCEPTANCE_MAX_CRITERIA, DevSessionAcceptanceSchema,
  DevSessionCriterionReferenceSchema, DevSessionCorrectionReasonSchema,
} from '../../../src/capability/dev/session-acceptance.js';
import {
  devSessionAssignmentCanonicalJson, renderDevSessionBlock, parseDevSessionBlock,
} from '../../../src/capability/dev/session-assignment.js';

// R56 shape from the task, not a copy of the unavailable production correction.
const saved = {
  version: 1,
  template: { id: 'sviluppo-pezzo-app', version: 1 },
  input: {
    userPath: ['Apre la lista', 'Sceglie un prodotto'], data: 'veri',
    proofScripts: ['test:e2e'], visualSource: { kind: 'nessuna' },
  },
  criteria: [{
    id: 'c-1', text: 'La scheda mostra il prodotto scelto', attestor: 'referente',
    proof: 'Lo apre e lo vede', origin: 'ritorno', reference: 'Correggere la scheda come richiesto',
  }],
};
const assignment = {
  version: 1, tenantId: 'tenant-1', ownerId: '7', organizationId: 'good-choice',
  companyId: 'good-choice', projectId: 'good-choice-app', businessUnit: { slug: 'sviluppo' },
  requestedBy: { managementAgentId: 'capo-sviluppo', runtimeAgentId: 'capo-sviluppo', vaultAgentId: 62 },
  productKind: 'code', title: 'Modulo A', task: 'Correggi il Modulo A.',
  miniPlan: '1. Correggere. 2. Test.', materials: [],
  destination: { repo: 'App-Templates/goodchoice-backtest' }, createdAt: '2026-10-27T15:00:00+01:00',
};
// Frozen canonical bytes for the legacy shape, independent of the serializer under test.
const SAVED_CANONICAL = '{"assignment":{"acceptance":{"criteria":[{"attestor":"referente","id":"c-1","origin":"ritorno","proof":"Lo apre e lo vede","reference":"Correggere la scheda come richiesto","text":"La scheda mostra il prodotto scelto"}],"input":{"data":"veri","proofScripts":["test:e2e"],"userPath":["Apre la lista","Sceglie un prodotto"],"visualSource":{"kind":"nessuna"}},"template":{"id":"sviluppo-pezzo-app","version":1},"version":1},"businessUnit":{"slug":"sviluppo"},"companyId":"good-choice","createdAt":"2026-10-27T15:00:00+01:00","destination":{"repo":"App-Templates/goodchoice-backtest"},"materials":[],"miniPlan":"1. Correggere. 2. Test.","organizationId":"good-choice","ownerId":"7","productKind":"code","projectId":"good-choice-app","requestedBy":{"managementAgentId":"capo-sviluppo","runtimeAgentId":"capo-sviluppo","vaultAgentId":62},"task":"Correggi il Modulo A.","tenantId":"tenant-1","title":"Modulo A","version":1},"domain":"x9.cap-dev.session-assignment"}';
const sha = (text: string) => createHash('sha256').update(text).digest('hex');
const references = [{ kind: 'requirement', id: 'c-1' }, { kind: 'decision', requestId: 'decision_56' }];
const reasons = [{ kind: 'requirements', ids: ['c-1', 'D-12'] }, { kind: 'decision', requestId: 'decision_56' }];
const withReference = (reference: unknown, origin = 'ritorno') => ({
  ...saved, criteria: [{ ...saved.criteria[0], origin, reference }],
});
const withReason = (correctionReason: unknown) => ({ ...saved, input: { ...saved.input, correctionReason } });

describe('s8280 correction contract', () => {
  it('s8280 motivo-tipato', () => {
    const canonicalForms = new Set<string>();
    for (const reference of references) {
      expect(DevSessionAcceptanceSchema.parse(withReference(reference))).toEqual(withReference(reference));
      for (const correctionReason of reasons) {
        const acceptance = { ...withReference(reference), input: { ...saved.input, correctionReason } };
        expect(DevSessionAcceptanceSchema.parse(acceptance)).toEqual(acceptance);
        expect(DevSessionCriterionReferenceSchema.parse(reference)).toEqual(reference);
        expect(DevSessionCorrectionReasonSchema.parse(correctionReason)).toEqual(correctionReason);
        const full = { ...assignment, acceptance };
        const canonical = devSessionAssignmentCanonicalJson(full);
        const parsed = parseDevSessionBlock(renderDevSessionBlock(full, sha(canonical)));
        expect(parsed).toEqual({ ok: true, assignment: full, digest: sha(canonical) });
        if (!parsed.ok) throw new Error('Expected a valid signed-block shape');
        expect(devSessionAssignmentCanonicalJson(parsed.assignment)).toBe(canonical);
        expect(JSON.parse(canonical).assignment.acceptance).toEqual(acceptance);
        canonicalForms.add(canonical);
      }
    }
    expect(canonicalForms.size).toBe(4);
    for (const reason of reasons) expect(DevSessionAcceptanceSchema.parse(withReason(reason))).toEqual(withReason(reason));
  });

  it('s8280 salvato-libero', () => {
    expect(DevSessionAcceptanceSchema.parse(saved)).toEqual(saved);
    expect(JSON.stringify(DevSessionAcceptanceSchema.parse(saved))).toBe(JSON.stringify(saved));
    expect(devSessionAssignmentCanonicalJson({ ...assignment, acceptance: saved })).toBe(SAVED_CANONICAL);
    const block = parseDevSessionBlock(renderDevSessionBlock({ ...assignment, acceptance: saved }, sha(SAVED_CANONICAL)));
    expect(block).toEqual({ ok: true, assignment: { ...assignment, acceptance: saved }, digest: sha(SAVED_CANONICAL) });
    expect(DevSessionCriterionReferenceSchema.parse('  Saved free text  ')).toBe('Saved free text');
    expect(DevSessionCriterionReferenceSchema.safeParse(' ').success).toBe(false);
    expect(DevSessionCriterionReferenceSchema.parse('x'.repeat(200))).toBe('x'.repeat(200));
    expect(DevSessionCriterionReferenceSchema.safeParse('x'.repeat(201)).success).toBe(false);
  });

  it('s8280 ritorno-senza-reference', () => {
    const parsed = DevSessionAcceptanceSchema.safeParse(withReference(undefined));
    expect(parsed.success).toBe(false);
    if (parsed.success) throw new Error('Missing reference must fail');
    expect(parsed.error.issues).toContainEqual(expect.objectContaining({ path: ['criteria', 0, 'reference'], message: 'reference_iff_return' }));
  });

  it('s8280 non-ritorno-con-reference', () => {
    for (const origin of ['capo', 'mandato']) for (const reference of [saved.criteria[0]!.reference, ...references]) {
      const parsed = DevSessionAcceptanceSchema.safeParse(withReference(reference, origin));
      expect(parsed.success).toBe(false);
      if (parsed.success) throw new Error('Non-return reference must fail');
      expect(parsed.error.issues).toContainEqual(expect.objectContaining({ path: ['criteria', 0, 'reference'], message: 'reference_iff_return' }));
    }
  });

  it('s8280 id-inesistente-di-forma', () => {
    for (const id of ['', 'bad id', 'x'.repeat(41)]) {
      expect(DevSessionAcceptanceSchema.safeParse(withReference({ kind: 'requirement', id })).success).toBe(false);
      expect(DevSessionAcceptanceSchema.safeParse(withReason({ kind: 'requirements', ids: [id] })).success).toBe(false);
    }
  });

  it('s8280 decision-id-malformato', () => {
    for (const requestId of ['', 'short', 'bad id!', 'd'.repeat(65)]) {
      expect(DevSessionAcceptanceSchema.safeParse(withReference({ kind: 'decision', requestId })).success).toBe(false);
      expect(DevSessionAcceptanceSchema.safeParse(withReason({ kind: 'decision', requestId })).success).toBe(false);
    }
  });
  it('s8280 lista-vuota', () => {
    expect(DevSessionAcceptanceSchema.safeParse(withReason({ kind: 'requirements', ids: [] })).success).toBe(false);
  });
  it('s8280 doppioni', () => {
    expect(DevSessionAcceptanceSchema.safeParse(withReason({ kind: 'requirements', ids: ['c-1', 'c-1'] })).success).toBe(false);
  });
  it('s8280 troppi-id', () => {
    const ids = Array.from({ length: DEV_SESSION_ACCEPTANCE_MAX_CRITERIA }, (_, index) => `c-${index}`);
    expect(DevSessionAcceptanceSchema.parse(withReason({ kind: 'requirements', ids }))).toEqual(withReason({ kind: 'requirements', ids }));
    expect(DevSessionAcceptanceSchema.safeParse(withReason({ kind: 'requirements', ids: [...ids, 'overflow'] })).success).toBe(false);
  });
  it('s8280 campo-estraneo', () => {
    for (const reference of references) {
      expect(DevSessionAcceptanceSchema.safeParse(withReference({ ...reference, extra: true })).success).toBe(false);
    }
    for (const reason of reasons) {
      expect(DevSessionAcceptanceSchema.safeParse(withReason({ ...reason, extra: true })).success).toBe(false);
    }
    expect(DevSessionAcceptanceSchema.safeParse(withReason({ kind: 'other', ids: ['c-1'] })).success).toBe(false);
    expect(DevSessionAcceptanceSchema.safeParse(withReference({ kind: 'other', id: 'c-1' })).success).toBe(false);
  });
  it('s8280 versione', () => {
    const pkg = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'));
    const changelog = readFileSync(new URL('../../../CHANGELOG.md', import.meta.url), 'utf8');
    expect(pkg.version).toBe('1.275.0');
    expect([...changelog.matchAll(/^## v(\S+)/gm)][0]?.[1]).toBe('1.275.0');
  });
});
