import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import {
  DEV_SESSION_ACCEPTANCE_MAX_CRITERIA, DEV_SESSION_CRITERION_TEXT_MAX,
  DevSessionAcceptanceSchema, DevSessionCriterionSchema,
  type DevSessionAcceptance,
} from '../../../src/capability/dev/session-acceptance.js';
import { DEV_SESSION_ACCEPTANCE_CATALOG } from '../../../src/capability/dev/session-acceptance-catalog.js';
import { devSessionRequirements } from '../../../src/capability/dev/session-acceptance-templates.js';
import { DevSessionDeliveredFileSchema } from '../../../src/capability/dev/session-assignment.js';
import {
  DEV_SESSION_ATTESTATION_FILE, DEV_SESSION_ATTESTATION_STATUSES,
  DEV_SESSION_PROOF_ORIGINS, DEV_SESSION_RESPONSIBLES,
  DEV_SESSION_ATTESTATION_MAX_ENTRIES, DEV_SESSION_VERDICT_PROBLEMS,
  DevSessionAttestationEntrySchema, DevSessionAttestationSchema,
  DevSessionManifestAttestationSchema, devSessionAcceptanceVerdict,
} from '../../../src/capability/dev/session-attestation.js';

type Entry = z.infer<typeof DevSessionAttestationEntrySchema>;
type Satisfied = Extract<Entry, { status: 'soddisfatto' }>;
const digest = 'a'.repeat(64);
const proofDigest = 'b'.repeat(64);
const common = { criterionId: 'C-01', attempt: 2, templateVersion: 1, contractDigest: digest };
const satisfied = (criterionId = 'C-01', proofOrigin: Satisfied['proofOrigin'] = 'sessione'): Satisfied => ({
  ...common, criterionId, status: 'soddisfatto', proof: { path: `proofs/${criterionId}.txt`, sha256: proofDigest }, proofOrigin,
});
const negative: Entry = {
  ...common, status: 'non_soddisfatto', reason: 'Missing approved data', responsible: 'capo', nextAction: 'Supply the approved data',
};
const review: Entry = { ...common, status: 'da_revisionare', reason: 'Needs a second review' };

function acceptance(): DevSessionAcceptance {
  return DevSessionAcceptanceSchema.parse({
    version: 1, template: { id: 'sviluppo-pezzo-app', version: 1 },
    input: { userPath: ['Open and save'], data: 'di_prova', proofScripts: ['test:save'], visualSource: { kind: 'nessuna' } },
    criteria: [
      { id: 'C-01', text: 'Save the requested item', attestor: 'sessione', proof: 'Saved item', origin: 'capo' },
      { id: 'C-02', text: 'Review the result', attestor: 'revisore', proof: 'Review', origin: 'mandato' },
    ],
  });
}

function completeInput(value = acceptance()) {
  const resolved = devSessionRequirements(value);
  if (!resolved.ok) throw new Error(resolved.code);
  const session = resolved.requirements.filter(({ attestor, unit }) => attestor === 'sessione' && unit === undefined);
  const executor = resolved.requirements.filter(({ attestor, unit }) => attestor === 'esecutore' && unit === undefined);
  const entries: Entry[] = session.map(({ id }) => satisfied(id));
  const results: Entry[] = executor.map(({ id }) => satisfied(id, 'base'));
  return {
    acceptance: value, attestation: { version: 1 as const, entries }, results, attempt: 2, contractDigest: digest,
    proofs: [...session, ...executor].map(({ id }) => ({ ...satisfied(id).proof, sizeBytes: 32 })),
  };
}

function rejects(schema: z.ZodType, value: unknown, path: (string | number)[], code: string) {
  const parsed = schema.safeParse(value);
  expect(parsed.success).toBe(false);
  if (parsed.success) throw new Error('Expected a contract violation');
  expect(parsed.error.issues).toContainEqual(expect.objectContaining({ path, code }));
}

describe('s7562_forma', () => {
  it('defines the closed vocabulary and reuses boundary schemas', () => {
    expect(DEV_SESSION_ATTESTATION_FILE).toBe('ATTESTAZIONE.json');
    expect(DEV_SESSION_ATTESTATION_STATUSES).toEqual(['soddisfatto', 'non_soddisfatto', 'da_revisionare']);
    expect(DEV_SESSION_PROOF_ORIGINS).toEqual(['base', 'esecutore', 'sessione']);
    expect(DEV_SESSION_RESPONSIBLES).toEqual(['sessione', 'capo', 'referente', 'director']);
    expect(DEV_SESSION_ATTESTATION_MAX_ENTRIES).toBe(40);
    expect(DEV_SESSION_ATTESTATION_MAX_ENTRIES).toBe(DEV_SESSION_ACCEPTANCE_MAX_CRITERIA + Object.keys(DEV_SESSION_ACCEPTANCE_CATALOG).length);
    expect(DEV_SESSION_VERDICT_PROBLEMS).toEqual([
      'requirements_unresolved', 'criterion_unknown', 'attestor_not_session', 'attestor_not_executor',
      'entry_duplicate', 'attempt_stale', 'template_version_mismatch', 'contract_digest_mismatch',
      'proof_missing', 'proof_modified', 'proof_origin_session', 'entry_missing', 'executor_result_missing',
    ]);
    for (const option of DevSessionAttestationEntrySchema.options) {
      expect(option.shape.criterionId).toBe(DevSessionCriterionSchema.shape.id);
      expect(option.shape.contractDigest).toBe(DevSessionDeliveredFileSchema.shape.sha256);
    }
    const proof = DevSessionAttestationEntrySchema.options[0].shape.proof;
    expect(proof.shape.path).toBe(DevSessionDeliveredFileSchema.shape.path);
    expect(proof.shape.sha256).toBe(DevSessionDeliveredFileSchema.shape.sha256);
  });

  it('accepts all three variants and their exact lower and upper boundaries', () => {
    for (const entry of [satisfied(), negative, review]) expect(DevSessionAttestationEntrySchema.parse(entry)).toEqual(entry);
    for (const origin of ['base', 'esecutore', 'sessione']) {
      expect(DevSessionAttestationEntrySchema.parse({ ...satisfied(), proofOrigin: origin })).toHaveProperty('proofOrigin', origin);
    }
    for (const responsible of ['sessione', 'capo', 'referente', 'director']) {
      expect(DevSessionAttestationEntrySchema.parse({ ...negative, responsible })).toHaveProperty('responsible', responsible);
    }
    for (const criterionId of ['a', 'A-1_b.C', 'a'.repeat(40)]) {
      expect(DevSessionAttestationEntrySchema.parse({ ...satisfied(), criterionId })).toHaveProperty('criterionId', criterionId);
    }
    for (const entry of [satisfied(), negative, review]) {
      expect(DevSessionAttestationEntrySchema.parse({ ...entry, attempt: 1, templateVersion: 1 })).toMatchObject({ attempt: 1, templateVersion: 1 });
      expect(DevSessionAttestationEntrySchema.parse({ ...entry, attempt: 100, templateVersion: 100 })).toMatchObject({ attempt: 100, templateVersion: 100 });
    }
    for (const text of ['x', 'x'.repeat(DEV_SESSION_CRITERION_TEXT_MAX)]) {
      expect(DevSessionAttestationEntrySchema.parse({ ...negative, reason: ` ${text} `, nextAction: ` ${text} ` }))
        .toMatchObject({ reason: text, nextAction: text });
      expect(DevSessionAttestationEntrySchema.parse({ ...review, reason: ` ${text} ` })).toHaveProperty('reason', text);
    }
    const longestPath = ['a'.repeat(256), ...Array<string>(3).fill('a'.repeat(255))].join('/');
    expect(longestPath).toHaveLength(1024);
    for (const path of ['a', 'a'.repeat(255), longestPath]) {
      expect(DevSessionAttestationEntrySchema.parse({ ...satisfied(), proof: { path, sha256: proofDigest } }))
        .toHaveProperty('proof.path', path);
    }
    for (const sha256 of ['0'.repeat(64), 'f'.repeat(64)]) {
      expect(DevSessionAttestationEntrySchema.parse({ ...satisfied(), contractDigest: sha256, proof: { path: 'a', sha256 } }))
        .toMatchObject({ contractDigest: sha256, proof: { sha256 } });
    }
  });

  it('rejects every invalid entry field, missing field and extra key with its path and code', () => {
    rejects(DevSessionAttestationEntrySchema, { ...satisfied(), status: 'impossibile' }, ['status'], 'invalid_union');
    for (const entry of [satisfied(), negative, review]) {
      for (const key of ['criterionId', 'attempt', 'templateVersion', 'contractDigest']) {
        const missing: Record<string, unknown> = { ...entry };
        delete missing[key];
        rejects(DevSessionAttestationEntrySchema, missing, [key], 'invalid_type');
      }
      const missingStatus: Record<string, unknown> = { ...entry };
      delete missingStatus.status;
      rejects(DevSessionAttestationEntrySchema, missingStatus, ['status'], 'invalid_union');
      rejects(DevSessionAttestationEntrySchema, { ...entry, criterionId: '' }, ['criterionId'], 'too_small');
      rejects(DevSessionAttestationEntrySchema, { ...entry, criterionId: 'x'.repeat(41) }, ['criterionId'], 'too_big');
      for (const criterionId of ['a b', '-a', 'a-', 'a..b', 'a/b']) {
        rejects(DevSessionAttestationEntrySchema, { ...entry, criterionId }, ['criterionId'], 'invalid_format');
      }
      for (const key of ['attempt', 'templateVersion']) {
        rejects(DevSessionAttestationEntrySchema, { ...entry, [key]: 0 }, [key], 'too_small');
        rejects(DevSessionAttestationEntrySchema, { ...entry, [key]: 1.5 }, [key], 'invalid_type');
        rejects(DevSessionAttestationEntrySchema, { ...entry, [key]: '1' }, [key], 'invalid_type');
      }
      for (const contractDigest of ['a'.repeat(63), 'a'.repeat(65), 'A'.repeat(64), 'g'.repeat(64)]) {
        rejects(DevSessionAttestationEntrySchema, { ...entry, contractDigest }, ['contractDigest'], 'invalid_format');
      }
      rejects(DevSessionAttestationEntrySchema, { ...entry, complete: true }, [], 'unrecognized_keys');
    }
    for (const [entry, keys] of [[satisfied(), ['proof', 'proofOrigin']], [negative, ['reason', 'responsible', 'nextAction']], [review, ['reason']]] as const) {
      for (const key of keys) {
        const missing: Record<string, unknown> = { ...entry };
        delete missing[key];
        // A missing enum field is reported by Zod as an invalid option, not as a wrong type.
        rejects(DevSessionAttestationEntrySchema, missing, [key], key === 'proofOrigin' || key === 'responsible' ? 'invalid_value' : 'invalid_type');
      }
    }
    for (const entry of [negative, review]) {
      for (const reason of ['', '   ']) rejects(DevSessionAttestationEntrySchema, { ...entry, reason }, ['reason'], 'too_small');
      rejects(DevSessionAttestationEntrySchema, { ...entry, reason: 'x'.repeat(DEV_SESSION_CRITERION_TEXT_MAX + 1) }, ['reason'], 'too_big');
    }
    for (const nextAction of ['', '   ']) rejects(DevSessionAttestationEntrySchema, { ...negative, nextAction }, ['nextAction'], 'too_small');
    rejects(DevSessionAttestationEntrySchema, { ...negative, nextAction: 'x'.repeat(DEV_SESSION_CRITERION_TEXT_MAX + 1) }, ['nextAction'], 'too_big');
    rejects(DevSessionAttestationEntrySchema, { ...negative, responsible: 'esecutore' }, ['responsible'], 'invalid_value');
    rejects(DevSessionAttestationEntrySchema, { ...satisfied(), proofOrigin: 'altro' }, ['proofOrigin'], 'invalid_value');
    rejects(DevSessionAttestationEntrySchema, { ...review, proof: satisfied().proof }, [], 'unrecognized_keys');
    rejects(DevSessionAttestationEntrySchema, { ...negative, proofOrigin: 'base' }, [], 'unrecognized_keys');
    rejects(DevSessionAttestationEntrySchema, { ...satisfied(), reason: 'extra' }, [], 'unrecognized_keys');
    rejects(DevSessionAttestationEntrySchema, { ...satisfied(), proof: { ...satisfied().proof, sizeBytes: 1 } }, ['proof'], 'unrecognized_keys');
    for (const key of ['path', 'sha256']) {
      const proof: Record<string, unknown> = { ...satisfied().proof };
      delete proof[key];
      rejects(DevSessionAttestationEntrySchema, { ...satisfied(), proof }, ['proof', key], 'invalid_type');
    }
    rejects(DevSessionAttestationEntrySchema, { ...satisfied(), proof: { path: '', sha256: proofDigest } }, ['proof', 'path'], 'too_small');
    rejects(DevSessionAttestationEntrySchema, { ...satisfied(), proof: { path: 'a/'.repeat(512) + 'a', sha256: proofDigest } }, ['proof', 'path'], 'too_big');
    for (const path of ['../a', 'proofs/../a', '/a', 'a//b', './a', 'a\\b', 'a b', 'a'.repeat(256)]) {
      rejects(DevSessionAttestationEntrySchema, { ...satisfied(), proof: { path, sha256: proofDigest } }, ['proof', 'path'], 'custom');
    }
    for (const sha256 of ['b'.repeat(63), 'b'.repeat(65), 'B'.repeat(64), 'g'.repeat(64)]) {
      rejects(DevSessionAttestationEntrySchema, { ...satisfied(), proof: { path: 'a', sha256 } }, ['proof', 'sha256'], 'invalid_format');
    }
  });

  it('validates the attestation and manifest including 40 entries and 100 indexed proofs', () => {
    const attestation = { version: 1, entries: [satisfied(), negative, review] };
    expect(DevSessionAttestationSchema.parse(attestation)).toEqual(attestation);
    expect(DevSessionAttestationSchema.parse({ version: 1, entries: [] }).entries).toEqual([]);
    const entries = Array.from({ length: 40 }, (_, index) => satisfied(`C-${index}`));
    expect(DevSessionAttestationSchema.parse({ version: 1, entries }).entries).toHaveLength(40);
    rejects(DevSessionAttestationSchema, { version: 1, entries: [...entries, satisfied('C-40')] }, ['entries'], 'too_big');
    rejects(DevSessionAttestationSchema, { ...attestation, version: 2 }, ['version'], 'invalid_value');
    rejects(DevSessionAttestationSchema, { entries: [] }, ['version'], 'invalid_value');
    rejects(DevSessionAttestationSchema, { version: 1 }, ['entries'], 'invalid_type');
    rejects(DevSessionAttestationSchema, { ...attestation, complete: true }, [], 'unrecognized_keys');
    rejects(DevSessionAttestationSchema, { version: 1, entries: [{ ...satisfied(), attempt: 0 }] }, ['entries', 0, 'attempt'], 'too_small');
    const file = { ...satisfied().proof, sizeBytes: 0 };
    const manifest = { sha256: digest, attestation, proofs: [file] };
    expect(DevSessionManifestAttestationSchema.shape.sha256).toBe(DevSessionDeliveredFileSchema.shape.sha256);
    expect(DevSessionManifestAttestationSchema.shape.attestation).toBe(DevSessionAttestationSchema);
    expect(DevSessionManifestAttestationSchema.parse(manifest)).toEqual(manifest);
    expect(DevSessionManifestAttestationSchema.parse({ ...manifest, proofs: [] }).proofs).toEqual([]);
    expect(DevSessionManifestAttestationSchema.parse({ ...manifest, proofs: Array.from({ length: 100 }, () => file) }).proofs).toHaveLength(100);
    rejects(DevSessionManifestAttestationSchema, { ...manifest, proofs: Array.from({ length: 101 }, () => file) }, ['proofs'], 'too_big');
    for (const key of ['sha256', 'attestation', 'proofs']) {
      const missing: Record<string, unknown> = { ...manifest };
      delete missing[key];
      rejects(DevSessionManifestAttestationSchema, missing, [key], 'invalid_type');
    }
    rejects(DevSessionManifestAttestationSchema, { ...manifest, complete: true }, [], 'unrecognized_keys');
    rejects(DevSessionManifestAttestationSchema, { ...manifest, attestation: null }, ['attestation'], 'invalid_type');
    rejects(DevSessionManifestAttestationSchema, { ...manifest, sha256: 'g'.repeat(64) }, ['sha256'], 'invalid_format');
    rejects(DevSessionManifestAttestationSchema, { ...manifest, proofs: [{ ...file, path: '../a' }] }, ['proofs', 0, 'path'], 'custom');
    rejects(DevSessionManifestAttestationSchema, { ...manifest, proofs: [{ ...file, sha256: 'g'.repeat(64) }] }, ['proofs', 0, 'sha256'], 'invalid_format');
    rejects(DevSessionManifestAttestationSchema, { ...manifest, proofs: [{ ...file, sizeBytes: -1 }] }, ['proofs', 0, 'sizeBytes'], 'too_small');
    rejects(DevSessionManifestAttestationSchema, { ...manifest, proofs: [{ ...file, sizeBytes: 1.5 }] }, ['proofs', 0, 'sizeBytes'], 'invalid_type');
    rejects(DevSessionManifestAttestationSchema, { ...manifest, proofs: [{ path: file.path, sha256: file.sha256 }] }, ['proofs', 0, 'sizeBytes'], 'invalid_type');
    rejects(DevSessionManifestAttestationSchema, { ...manifest, proofs: [{ ...file, complete: true }] }, ['proofs', 0], 'unrecognized_keys');
  });
});

describe('session acceptance verdict', () => {
  it('s7562_completa', () => {
    const input = completeInput();
    const before = structuredClone(input);
    const verdict = devSessionAcceptanceVerdict(input);
    expect(Object.keys(verdict).sort()).toEqual(['awaiting', 'criteria', 'problems', 'sessionComplete']);
    expect(verdict).toEqual({
      sessionComplete: true, problems: [],
      awaiting: [{ id: 'S-10', attestor: 'referente' }, { id: 'C-02', attestor: 'revisore' }],
      criteria: [
        ...['S-01', 'S-02', 'S-05', 'S-07'].map((id) => ({ id, attestor: 'esecutore', origin: 'modello', status: 'soddisfatto', proofPath: `proofs/${id}.txt`, proofOrigin: 'base' })),
        { id: 'S-08', attestor: 'sessione', origin: 'modello', status: 'soddisfatto', proofPath: 'proofs/S-08.txt', proofOrigin: 'sessione' },
        { id: 'S-10', attestor: 'referente', origin: 'modello', status: 'in_attesa' },
        { id: 'S-11', attestor: 'esecutore', origin: 'modello', status: 'soddisfatto', proofPath: 'proofs/S-11.txt', proofOrigin: 'base' },
        { id: 'C-01', attestor: 'sessione', origin: 'capo', status: 'soddisfatto', proofPath: 'proofs/C-01.txt', proofOrigin: 'sessione' },
        { id: 'C-02', attestor: 'revisore', origin: 'mandato', status: 'in_attesa' },
      ],
    });
    expect(input).toEqual(before);
    expect(devSessionAcceptanceVerdict(input)).toEqual(verdict);
    input.results = input.results.map((entry) => entry.status === 'soddisfatto' ? { ...entry, proofOrigin: 'esecutore' } : entry);
    expect(devSessionAcceptanceVerdict(input).sessionComplete).toBe(true);
  });

  it('s7562_requirements_unresolved', () => {
    for (const template of [
      { id: 'unknown', version: 1 }, { id: 'toString', version: 1 },
      { id: 'sviluppo-pezzo-app', version: 2 }, { id: 'sviluppo-pezzo-app', version: 1, optionalIds: ['D-01'] },
    ]) {
      const input = completeInput();
      input.acceptance.template = template;
      expect(devSessionAcceptanceVerdict(input)).toEqual({ sessionComplete: false, awaiting: [], criteria: [], problems: [{ code: 'requirements_unresolved', criterionId: null }] });
    }
  });

  it('s7562_criterion_unknown', () => {
    const input = completeInput();
    input.attestation.entries.push(satisfied('UNKNOWN-1'));
    input.results.push(satisfied('UNKNOWN-2', 'base'));
    expect(devSessionAcceptanceVerdict(input).problems).toEqual([
      { code: 'criterion_unknown', criterionId: 'UNKNOWN-1' }, { code: 'criterion_unknown', criterionId: 'UNKNOWN-2' },
    ]);
    expect(devSessionAcceptanceVerdict(input).sessionComplete).toBe(false);
  });

  it('s7562_attestor_not_session', () => {
    const input = completeInput();
    input.results = input.results.filter(({ criterionId }) => criterionId !== 'S-01');
    input.attestation.entries.push(satisfied('S-01'));
    input.attestation.entries.push(satisfied('C-02'), satisfied('S-10'));
    const verdict = devSessionAcceptanceVerdict(input);
    expect(verdict.problems).toEqual([
      { code: 'attestor_not_session', criterionId: 'S-01' },
      { code: 'attestor_not_session', criterionId: 'C-02' },
      { code: 'attestor_not_session', criterionId: 'S-10' },
      { code: 'executor_result_missing', criterionId: 'S-01' },
    ]);
    expect(verdict.criteria.find(({ id }) => id === 'S-01')).toHaveProperty('status', 'in_attesa');
  });

  it('s7562_attestor_not_executor', () => {
    const input = completeInput();
    input.attestation.entries = input.attestation.entries.filter(({ criterionId }) => criterionId !== 'C-01');
    input.results.push(satisfied('C-01', 'base'), satisfied('C-02', 'base'), satisfied('S-10', 'base'));
    expect(devSessionAcceptanceVerdict(input).problems).toEqual([
      { code: 'attestor_not_executor', criterionId: 'C-01' },
      { code: 'attestor_not_executor', criterionId: 'C-02' },
      { code: 'attestor_not_executor', criterionId: 'S-10' },
      { code: 'entry_missing', criterionId: 'C-01' },
    ]);
  });

  it('s7562_entry_duplicate', () => {
    const input = completeInput();
    input.attestation.entries.push(satisfied('C-01'));
    input.results.push(satisfied('S-01', 'base'));
    const verdict = devSessionAcceptanceVerdict(input);
    expect(verdict.problems).toEqual([{ code: 'entry_duplicate', criterionId: 'C-01' }, { code: 'entry_duplicate', criterionId: 'S-01' }]);
    expect(verdict.sessionComplete).toBe(false);
    // A later duplicate cannot repair an invalid first claim.
    input.attestation.entries = [{ ...satisfied('C-01'), attempt: 1 }, satisfied('C-01'), satisfied('S-08')];
    input.results.pop();
    expect(devSessionAcceptanceVerdict(input).problems).toEqual([
      { code: 'attempt_stale', criterionId: 'C-01' }, { code: 'entry_duplicate', criterionId: 'C-01' }, { code: 'entry_missing', criterionId: 'C-01' },
    ]);
  });

  it('s7562_attempt_stale', () => {
    for (const attempt of [1, 3]) {
      const input = completeInput();
      input.attestation.entries = input.attestation.entries.map((entry) => entry.criterionId === 'C-01' ? { ...entry, attempt } : entry);
      input.results = input.results.map((entry) => entry.criterionId === 'S-01' ? { ...entry, attempt } : entry);
      const verdict = devSessionAcceptanceVerdict(input);
      expect(verdict.problems).toEqual([
        { code: 'attempt_stale', criterionId: 'C-01' }, { code: 'attempt_stale', criterionId: 'S-01' },
        { code: 'entry_missing', criterionId: 'C-01' }, { code: 'executor_result_missing', criterionId: 'S-01' },
      ]);
      expect(verdict.sessionComplete).toBe(false);
      expect(verdict.criteria.find(({ id }) => id === 'C-01')).toHaveProperty('status', 'in_attesa');
    }
  });

  it('s7562_template_version_mismatch', () => {
    const input = completeInput();
    input.attestation.entries = input.attestation.entries.map((entry) => entry.criterionId === 'C-01' ? { ...entry, templateVersion: 2 } : entry);
    input.results = input.results.map((entry) => entry.criterionId === 'S-01' ? { ...entry, templateVersion: 2 } : entry);
    expect(devSessionAcceptanceVerdict(input).problems).toEqual([
      { code: 'template_version_mismatch', criterionId: 'C-01' }, { code: 'template_version_mismatch', criterionId: 'S-01' },
      { code: 'entry_missing', criterionId: 'C-01' }, { code: 'executor_result_missing', criterionId: 'S-01' },
    ]);
  });

  it('s7562_contract_digest_mismatch', () => {
    const input = completeInput();
    input.attestation.entries = input.attestation.entries.map((entry) => entry.criterionId === 'C-01' ? { ...entry, contractDigest: proofDigest } : entry);
    input.results = input.results.map((entry) => entry.criterionId === 'S-01' ? { ...entry, contractDigest: proofDigest } : entry);
    expect(devSessionAcceptanceVerdict(input).problems).toEqual([
      { code: 'contract_digest_mismatch', criterionId: 'C-01' }, { code: 'contract_digest_mismatch', criterionId: 'S-01' },
      { code: 'entry_missing', criterionId: 'C-01' }, { code: 'executor_result_missing', criterionId: 'S-01' },
    ]);
  });

  it('s7562_proof_missing', () => {
    const input = completeInput();
    input.proofs = input.proofs.filter(({ path }) => path !== 'proofs/C-01.txt' && path !== 'proofs/S-01.txt');
    expect(devSessionAcceptanceVerdict(input).problems).toEqual([
      { code: 'proof_missing', criterionId: 'C-01' }, { code: 'proof_missing', criterionId: 'S-01' },
      { code: 'entry_missing', criterionId: 'C-01' }, { code: 'executor_result_missing', criterionId: 'S-01' },
    ]);
  });

  it('s7562_proof_modified', () => {
    const input = completeInput();
    input.proofs = input.proofs.map((file) => ['proofs/C-01.txt', 'proofs/S-01.txt'].includes(file.path) ? { ...file, sha256: 'c'.repeat(64) } : file);
    const verdict = devSessionAcceptanceVerdict(input);
    expect(verdict.problems).toEqual([
      { code: 'proof_modified', criterionId: 'C-01' }, { code: 'proof_modified', criterionId: 'S-01' },
      { code: 'entry_missing', criterionId: 'C-01' }, { code: 'executor_result_missing', criterionId: 'S-01' },
    ]);
    expect(verdict.sessionComplete).toBe(false);
  });

  it('s7562_proof_origin_session', () => {
    const input = completeInput();
    input.results = input.results.map((entry) => entry.criterionId === 'S-01' ? satisfied('S-01', 'sessione') : entry);
    const verdict = devSessionAcceptanceVerdict(input);
    expect(verdict.problems).toEqual([
      { code: 'proof_origin_session', criterionId: 'S-01' }, { code: 'executor_result_missing', criterionId: 'S-01' },
    ]);
    expect(verdict.criteria.find(({ id }) => id === 'S-01')).toEqual({
      id: 'S-01', attestor: 'esecutore', origin: 'modello', status: 'da_revisionare', proofPath: 'proofs/S-01.txt', proofOrigin: 'sessione',
    });
    expect(verdict.sessionComplete).toBe(false);
  });

  it('s7562_entry_missing', () => {
    const input = completeInput();
    input.attestation.entries = input.attestation.entries.filter(({ criterionId }) => criterionId !== 'C-01');
    const verdict = devSessionAcceptanceVerdict(input);
    expect(verdict.problems).toEqual([{ code: 'entry_missing', criterionId: 'C-01' }]);
    expect(verdict.criteria.find(({ id }) => id === 'C-01')).toEqual({ id: 'C-01', attestor: 'sessione', origin: 'capo', status: 'in_attesa' });
    expect(verdict.sessionComplete).toBe(false);
  });

  it('s7562_executor_result_missing', () => {
    const input = completeInput();
    input.results = input.results.filter(({ criterionId }) => criterionId !== 'S-01');
    const verdict = devSessionAcceptanceVerdict(input);
    expect(verdict.problems).toEqual([{ code: 'executor_result_missing', criterionId: 'S-01' }]);
    expect(verdict.criteria.find(({ id }) => id === 'S-01')).toEqual({ id: 'S-01', attestor: 'esecutore', origin: 'modello', status: 'in_attesa' });
    expect(verdict.sessionComplete).toBe(false);
  });

  it('s7562_negativi', () => {
    for (const entry of [negative, review]) {
      for (const target of ['sessione', 'esecutore'] as const) {
        const input = completeInput();
        const id = target === 'sessione' ? 'C-01' : 'S-01';
        if (target === 'sessione') input.attestation.entries = input.attestation.entries.map((current) => current.criterionId === id ? { ...entry, criterionId: id } : current);
        else input.results = input.results.map((current) => current.criterionId === id ? { ...entry, criterionId: id } : current);
        const verdict = devSessionAcceptanceVerdict(input);
        expect(verdict.problems).toEqual([]);
        expect(verdict.sessionComplete).toBe(false);
        expect(verdict.criteria.find((criterion) => criterion.id === id)).toEqual({
          id, attestor: target, origin: target === 'sessione' ? 'capo' : 'modello', status: entry.status, reason: entry.reason,
          ...(entry.status === 'non_soddisfatto' ? { responsible: 'capo', nextAction: 'Supply the approved data' } : {}),
        });
      }
    }
    // Negative entries still carry the current attempt, version and contract.
    const input = completeInput();
    input.attestation.entries = [{ ...negative, attempt: 1 }, { ...review, criterionId: 'S-08', templateVersion: 2 }];
    input.results = [{ ...negative, criterionId: 'S-01', contractDigest: proofDigest }, ...input.results.filter(({ criterionId }) => criterionId !== 'S-01')];
    expect(devSessionAcceptanceVerdict(input).problems).toEqual([
      { code: 'attempt_stale', criterionId: 'C-01' }, { code: 'template_version_mismatch', criterionId: 'S-08' },
      { code: 'contract_digest_mismatch', criterionId: 'S-01' },
      { code: 'entry_missing', criterionId: 'S-08' }, { code: 'entry_missing', criterionId: 'C-01' },
      { code: 'executor_result_missing', criterionId: 'S-01' },
    ]);
  });

  it('s7562_attestazione_nulla', () => {
    const verdict = devSessionAcceptanceVerdict({ ...completeInput(), attestation: null });
    expect(verdict.problems).toEqual([{ code: 'entry_missing', criterionId: 'S-08' }, { code: 'entry_missing', criterionId: 'C-01' }]);
    expect(verdict.sessionComplete).toBe(false);
    expect(verdict.awaiting).toEqual([{ id: 'S-10', attestor: 'referente' }, { id: 'C-02', attestor: 'revisore' }]);
  });

  it('s7562_altra_bu', () => {
    for (const attestor of ['sessione', 'revisore', 'referente'] as const) {
      const value = acceptance();
      // A unit denotes a mandate requirement owned by another business unit.
      if (attestor === 'sessione') {
        value.criteria.push({ id: 'BU-01', text: 'External work', proof: 'External proof', attestor, origin: 'capo', unit: 'sicurezza' });
      } else {
        value.criteria.push(DevSessionCriterionSchema.parse({ id: 'BU-01', text: 'External work', proof: 'External proof', attestor, origin: 'mandato', unit: 'sicurezza' }));
      }
      const verdict = devSessionAcceptanceVerdict(completeInput(value));
      expect(verdict.problems).toEqual([]);
      expect(verdict.sessionComplete).toBe(true);
      expect(verdict.awaiting).toEqual([{ id: 'S-10', attestor: 'referente' }, { id: 'C-02', attestor: 'revisore' }, { id: 'BU-01', attestor, unit: 'sicurezza' }]);
      expect(verdict.criteria.find(({ id }) => id === 'BU-01')).toEqual({ id: 'BU-01', attestor, origin: attestor === 'sessione' ? 'capo' : 'mandato', status: 'in_attesa', unit: 'sicurezza' });
    }
  });

  it('s7562_altra_bu_non_attestabile', () => {
    const value = acceptance();
    value.criteria.push({ id: 'BU-01', text: 'External work', proof: 'External proof', attestor: 'sessione', origin: 'capo', unit: 'sicurezza' });
    const input = completeInput(value);
    // Neither the session nor the executor may attest a requirement owned by another unit.
    input.attestation.entries.push(satisfied('BU-01'));
    input.results.push(satisfied('BU-01', 'base'));
    const verdict = devSessionAcceptanceVerdict(input);
    expect(verdict.problems).toEqual([{ code: 'attestor_not_session', criterionId: 'BU-01' }, { code: 'attestor_not_executor', criterionId: 'BU-01' }]);
    expect(verdict.criteria.find(({ id }) => id === 'BU-01')).toHaveProperty('status', 'in_attesa');
  });

  it('s7562_forma_del_modello', () => {
    const value = DevSessionAcceptanceSchema.parse({
      version: 1, template: { id: 'design-sito', version: 1 },
      input: { screens: [{ name: 'home', purpose: 'Entry' }], formats: ['telefono', 'computer'], visualSource: { kind: 'nessuna' } },
      criteria: Array.from({ length: 20 }, (_, index) => ({ id: `C-${index}`, text: 'Deliver this section', attestor: 'sessione', proof: 'Section proof', origin: 'capo' })),
    });
    const input = completeInput(value);
    expect(DevSessionAttestationSchema.parse(input.attestation).entries).toHaveLength(21);
    const manifest = DevSessionManifestAttestationSchema.parse({ sha256: digest, attestation: input.attestation, proofs: input.proofs });
    expect(manifest.proofs).toHaveLength(27);
    const verdict = devSessionAcceptanceVerdict(input);
    expect(verdict.criteria).toHaveLength(28);
    expect(verdict.criteria.map(({ id }) => id)).toEqual(['D-01', 'D-02', 'D-03', 'D-04', 'D-05', 'D-08', 'D-09', 'D-11', ...value.criteria.map(({ id }) => id)]);
    expect(verdict.criteria.filter(({ status }) => status === 'soddisfatto')).toHaveLength(27);
    expect(verdict.awaiting).toEqual([{ id: 'D-11', attestor: 'referente' }]);
    expect(verdict.problems).toEqual([]);
    expect(verdict.sessionComplete).toBe(true);
  });
});
