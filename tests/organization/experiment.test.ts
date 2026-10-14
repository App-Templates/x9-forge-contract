import { describe, expect, it } from 'vitest';
import { ExperimentSchema } from '../../src/organization/experiment.js';

const base = {
  context: {
    schemaVersion: 1,
    runId: 'run-1',
    organizationId: 'org-1',
    ownerId: 'owner-1',
    identity: { managementAgentId: 'agent-1', runtimeAgentId: 'runtime-1' },
    issuer: 'x9',
    issuedAt: '2026-10-14T10:00:00.000Z',
    expiresAt: '2026-10-14T11:00:00.000Z',
  },
  experimentId: 'exp-1',
  hypothesisRef: 'hyp-1',
  domainVersionRef: { kind: 'document', ref: 'domain@v3', grantsRead: false },
  baselineRef: { kind: 'metric', ref: 'baseline-1', grantsRead: false },
  criterionRef: 'crit-1',
};

const parse = (v: unknown) => ExperimentSchema.safeParse(v);

describe('ExperimentSchema', () => {
  it('accepts proposed', () => {
    expect(parse({ ...base, status: 'proposed' }).success).toBe(true);
  });

  it('accepts running', () => {
    expect(parse({ ...base, status: 'running' }).success).toBe(true);
  });

  it('accepts concluded with conclusion', () => {
    const v = { ...base, status: 'concluded', conclusion: 'criterion met' };
    expect(ExperimentSchema.parse(v)).toEqual(v);
  });

  it('accepts abandoned with reason', () => {
    expect(parse({ ...base, status: 'abandoned', reason: 'budget exhausted' }).success).toBe(true);
  });

  it('rejects concluded without conclusion', () => {
    const r = parse({ ...base, status: 'concluded' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues).toContainEqual(
        expect.objectContaining({ path: ['conclusion'], code: 'custom' }),
      );
    }
  });

  it.each(['proposed', 'running', 'abandoned'])('rejects conclusion with status %s', (status) => {
    const r = parse({ ...base, status, conclusion: 'x', reason: 'y' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues).toContainEqual(
        expect.objectContaining({ path: ['conclusion'], code: 'custom' }),
      );
    }
  });

  it('rejects abandoned without reason', () => {
    const r = parse({ ...base, status: 'abandoned' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues).toContainEqual(
        expect.objectContaining({ path: ['reason'], code: 'custom' }),
      );
    }
  });

  it('rejects reason outside abandoned', () => {
    expect(parse({ ...base, status: 'running', reason: 'x' }).success).toBe(false);
  });

  it('rejects empty or too long reason', () => {
    expect(parse({ ...base, status: 'abandoned', reason: '' }).success).toBe(false);
    expect(parse({ ...base, status: 'abandoned', reason: 'a'.repeat(301) }).success).toBe(false);
    expect(parse({ ...base, status: 'abandoned', reason: 'a'.repeat(300) }).success).toBe(true);
  });

  it('rejects unknown status', () => {
    expect(parse({ ...base, status: 'paused' }).success).toBe(false);
  });

  it('rejects extra fields', () => {
    expect(parse({ ...base, status: 'proposed', notes: 'x' }).success).toBe(false);
  });

  it('rejects missing refs and invalid context', () => {
    const { criterionRef: _c, ...noCriterion } = base;
    expect(parse({ ...noCriterion, status: 'proposed' }).success).toBe(false);
    expect(parse({
      ...base,
      status: 'proposed',
      context: { ...base.context, expiresAt: base.context.issuedAt },
    }).success).toBe(false);
  });

  it('rejects evidence refs that grant read', () => {
    expect(parse({
      ...base,
      status: 'proposed',
      baselineRef: { kind: 'metric', ref: 'b', grantsRead: true },
    }).success).toBe(false);
  });

  it('accepts a pinned corpus and stays valid without one', () => {
    const corpus = {
      corpusId: 'c-1',
      scenarios: [{ scenarioId: 's-1', version: 1, contentSha256: 'a1'.repeat(32) }],
    };
    expect(parse({ ...base, status: 'proposed', corpus }).success).toBe(true);
    expect(parse({ ...base, status: 'proposed' }).success).toBe(true);
    expect(parse({ ...base, status: 'proposed', corpus: { corpusId: 'c-1', scenarios: [] } }).success).toBe(false);
  });
});
