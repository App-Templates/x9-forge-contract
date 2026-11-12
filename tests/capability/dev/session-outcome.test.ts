import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  DEV_SESSION_ANSWER_BLOCK_MARKER,
  DEV_SESSION_ANSWER_KINDS,
  DEV_SESSION_OUTCOME_BLOCK_MARKER,
  DEV_SESSION_OUTCOME_REASONS,
  DEV_SESSION_OUTCOME_STATES,
  DevSessionAnswerSchema,
  DevSessionGitRefSchema,
  DevSessionOutcomeSchema,
  devSessionAnswerCanonicalJson,
  devSessionOutcomeCanonicalJson,
  parseDevSessionAnswerBlock,
  parseDevSessionOutcomeBlock,
  renderDevSessionAnswerBlock,
  renderDevSessionOutcomeBlock,
} from '../../../src/capability/dev/session-outcome.js';
import {
  DEV_SESSION_MAX_MATERIALS,
  devSessionAssignmentCanonicalJson,
  parseDevSessionBlock,
  renderDevSessionBlock,
} from '../../../src/capability/dev/session-assignment.js';

const sha = (text: string) => createHash('sha256').update(text).digest('hex');
const createdAt = '2026-11-11T16:00:00+01:00';
const disposition = { nature: 'missing_data', retry: 'never', nextMove: 'fix_input' } as const;
const missingMaterials = [{
  ref: 'https://github.com/acme/orto/tree/consegna/20',
  error: 'riferimento non trovato nel repository',
}];
const outcome = {
  version: 1 as const,
  sessionId: 'R21',
  attempt: 1,
  state: 'failed' as const,
  reason: { code: 'materials_not_obtained' as const, text: 'materiali non ottenuti dopo 3 richieste' },
  missingMaterials,
  disposition,
  executorVersion: '0.1.0',
  createdAt,
};
const answer = {
  version: 1 as const,
  sessionId: 'R21',
  kind: 'usa_ramo' as const,
  repo: 'acme/orto',
  ref: 'refs/heads/consegna/20',
};

describe('session outcomes', () => {
  it('s6342 esito-sessione: R21 carries reason, missing materials, disposition and executor version and accepts a full lead git ref', () => {
    expect(DevSessionOutcomeSchema.parse(outcome)).toEqual(outcome);
    const digest = sha(devSessionOutcomeCanonicalJson(outcome));
    const block = renderDevSessionOutcomeBlock(outcome, digest);
    expect(block.split('\n')[0]).toBe(`<!-- ${DEV_SESSION_OUTCOME_BLOCK_MARKER} sha256:${digest} -->`);
    expect(parseDevSessionOutcomeBlock(`Esito della sessione capo-orto-design\n${block}\nFine`))
      .toEqual({ ok: true, outcome, digest });
    expect(DevSessionOutcomeSchema.safeParse({ ...outcome, disposition: undefined }).success).toBe(false);
    expect(DevSessionAnswerSchema.parse(answer)).toEqual(answer);
    const answerDigest = sha(devSessionAnswerCanonicalJson(answer));
    expect(parseDevSessionAnswerBlock(renderDevSessionAnswerBlock(answer, answerDigest)))
      .toEqual({ ok: true, answer, digest: answerDigest });
  });

  it('accepts every reason only in its declared state', () => {
    expect(Object.keys(DEV_SESSION_OUTCOME_REASONS)).toEqual([...DEV_SESSION_OUTCOME_STATES]);
    for (const state of DEV_SESSION_OUTCOME_STATES) {
      for (const code of DEV_SESSION_OUTCOME_REASONS[state]) {
        const cancelled = code === 'cancelled_by_answer' || code === 'closed_on_board';
        const raw = {
          ...outcome, state, reason: { code, text: code },
          disposition: state === 'delivered' ? undefined : { ...disposition, nature: cancelled ? 'cancelled' : 'technical_failure' },
          missingMaterials: code === 'materials_requested' || code === 'materials_not_obtained' ? missingMaterials : undefined,
          commit: state === 'delivered' ? 'c'.repeat(40) : undefined,
        };
        expect(DevSessionOutcomeSchema.safeParse(raw).success, `${state}/${code}`).toBe(true);
        for (const foreignState of DEV_SESSION_OUTCOME_STATES.filter((candidate) => candidate !== state)) {
          expect(DevSessionOutcomeSchema.safeParse({ ...raw, state: foreignState }).success).toBe(false);
        }
      }
    }
  });

  it.each([
    ['non-delivered without disposition (M1)', { disposition: undefined }],
    ['delivered with disposition', { state: 'delivered', reason: { code: 'tests_green', text: 'ok' }, missingMaterials: undefined }],
    ['foreign reason', { reason: { code: 'tests_green', text: 'ok' } }],
    ['requested without materials', { state: 'waiting_materials', reason: { code: 'materials_requested', text: 'missing' }, missingMaterials: undefined }],
    ['retrieval failed without materials', { missingMaterials: undefined }],
    ['empty missing materials', { missingMaterials: [] }],
    ['materials on another reason', { reason: { code: 'tests_red', text: 'red' } }],
    ['empty materials on another reason', { reason: { code: 'tests_red', text: 'red' }, missingMaterials: [] }],
    ['cancelled by answer with technical failure', { state: 'discarded', reason: { code: 'cancelled_by_answer', text: 'cancel' }, missingMaterials: undefined, disposition: { ...disposition, nature: 'technical_failure' } }],
    ['board closure with technical failure', { state: 'discarded', reason: { code: 'closed_on_board', text: 'closed' }, missingMaterials: undefined, disposition: { ...disposition, nature: 'technical_failure' } }],
    ['cancellation nature for another reason', { disposition: { ...disposition, nature: 'cancelled' } }],
    ['commit on failure', { commit: 'a'.repeat(40) }],
    ['unknown key', { extra: true }],
    ['reason unknown key', { reason: { ...outcome.reason, extra: true } }],
    ['invalid disposition', { disposition: { ...disposition, retry: 'next_turn' } }],
    ['attempt zero', { attempt: 0 }],
    ['attempt over limit', { attempt: 51 }],
    ['fractional attempt', { attempt: 1.5 }],
    ['invalid session', { sessionId: 'R0' }],
    ['invalid version', { version: 2 }],
    ['executor version suffix', { executorVersion: '0.1.0-dev' }],
    ['executor version missing', { executorVersion: undefined }],
    ['invalid timestamp', { createdAt: 'yesterday' }],
    ['multiline reason', { reason: { ...outcome.reason, text: 'first\nsecond' } }],
    ['trailing newline reason', { reason: { ...outcome.reason, text: 'first\n' } }],
    ['carriage return reason', { reason: { ...outcome.reason, text: 'first\rsecond' } }],
    ['empty reason', { reason: { ...outcome.reason, text: '' } }],
    ['long reason', { reason: { ...outcome.reason, text: 'a'.repeat(501) } }],
    ['empty material ref', { missingMaterials: [{ ref: '', error: 'missing' }] }],
    ['long material ref', { missingMaterials: [{ ref: 'a'.repeat(513), error: 'missing' }] }],
    ['empty material error', { missingMaterials: [{ ref: 'ref', error: '' }] }],
    ['long material error', { missingMaterials: [{ ref: 'ref', error: 'a'.repeat(301) }] }],
    ['too many missing materials', { missingMaterials: Array.from({ length: DEV_SESSION_MAX_MATERIALS + 1 }, () => missingMaterials[0]) }],
  ])('refuses %s', (_label, patch) => {
    expect(DevSessionOutcomeSchema.safeParse({ ...outcome, ...patch }).success).toBe(false);
  });
});

describe('lead answers', () => {
  it('round-trips all six strict answer branches', () => {
    const branches = [
      { kind: 'riprova', note: 'Retry the same session' },
      { kind: 'annulla' },
      answer,
      { kind: 'materiale', materials: [{ kind: 'github_link', url: 'https://github.com/acme/orto' }], note: 'Source' },
      { kind: 'decisione', text: 'Use the supplied design', block: 'design-21' },
      { kind: 'chiarimento', text: 'The branch contains the material' },
    ];
    expect(branches.map((branch) => branch.kind)).toEqual([...DEV_SESSION_ANSWER_KINDS]);
    for (const branch of branches) {
      const raw = { version: 1, sessionId: 'R21', ...branch };
      const digest = sha(devSessionAnswerCanonicalJson(raw));
      expect(parseDevSessionAnswerBlock(renderDevSessionAnswerBlock(raw, digest))).toEqual({ ok: true, answer: raw, digest });
    }
    expect(DevSessionGitRefSchema.parse('refs/tags/release/1.170.0')).toBe('refs/tags/release/1.170.0');
    expect(DevSessionGitRefSchema.parse('a'.repeat(40))).toBe('a'.repeat(40));
  });

  it.each(['consegna/20', 'refs/heads/a/../b', 'refs/heads/a..b', 'refs/heads/', 'refs/remotes/origin/main', 'refs/heads/a b', 'refs/heads/main\n', 'a'.repeat(39), `refs/heads/${'a'.repeat(245)}`])('refuses ambiguous git ref %s', (ref) => {
    expect(DevSessionGitRefSchema.safeParse(ref).success).toBe(false);
    expect(DevSessionAnswerSchema.safeParse({ ...answer, ref }).success).toBe(false);
  });

  it.each([
    { kind: 'riprova', extra: true },
    { kind: 'annulla', note: 'unexpected' },
    { kind: 'materiale' },
    { kind: 'materiale', materials: [] },
    { kind: 'materiale', materials: Array.from({ length: 11 }, () => ({ kind: 'github_link', url: 'https://github.com/acme/orto' })) },
    { kind: 'decisione', text: '' },
    { kind: 'chiarimento', text: 'a'.repeat(4001) },
    { kind: 'decisione', text: 'ok', block: 'UPPER' },
    { kind: 'chiarimento', text: 'ok', block: 'ab' },
    { kind: 'riprova', note: 'a'.repeat(501) },
    { kind: 'riprova', sessionId: '21' },
    { kind: 'riprova', version: 2 },
    { ...answer, repo: 'not-a-repo' },
  ])('refuses invalid answer %#', (branch) => {
    expect(DevSessionAnswerSchema.safeParse({ version: 1, sessionId: 'R21', ...branch }).success).toBe(false);
  });
});

describe('shared block codec', () => {
  const codecs = [
    { marker: DEV_SESSION_OUTCOME_BLOCK_MARKER, raw: outcome, canonical: devSessionOutcomeCanonicalJson, render: renderDevSessionOutcomeBlock, parse: parseDevSessionOutcomeBlock, invalid: 'invalid_outcome', domain: 'x9.cap-dev.session-outcome', key: 'outcome' },
    { marker: DEV_SESSION_ANSWER_BLOCK_MARKER, raw: answer, canonical: devSessionAnswerCanonicalJson, render: renderDevSessionAnswerBlock, parse: parseDevSessionAnswerBlock, invalid: 'invalid_answer', domain: 'x9.cap-dev.session-answer', key: 'answer' },
  ];

  it.each(codecs)('parses only entire marker lines for $marker (M2)', (codec) => {
    const digest = sha(codec.canonical(codec.raw));
    const block = codec.render(codec.raw, digest);
    expect(codec.parse('No block')).toEqual({ ok: false, reason: 'absent' });
    expect(codec.parse('Esito: FALLITO (non è fatto)\nMotivo: materiali mancanti')).toEqual({ ok: false, reason: 'absent' });
    expect(codec.parse(`testo ${block}`)).toEqual({ ok: false, reason: 'absent' });
    expect(codec.parse(`${block}\n${block}`)).toEqual({ ok: false, reason: 'multiple' });
    expect(codec.parse(`${block.split('\n')[0]}\nwrong fence`)).toEqual({ ok: false, reason: 'malformed' });
    expect(codec.parse(`${block.split('\n')[0]}\n\`\`\`json\n{broken\n\`\`\``)).toEqual({ ok: false, reason: 'invalid_json' });
    expect(codec.parse(`${block.split('\n')[0]}\n\`\`\`json\n{}\n\`\`\``)).toEqual({ ok: false, reason: codec.invalid });
    expect(codec.parse(block.replace(digest, 'bad-digest'))).toEqual({ ok: false, reason: 'absent' });
    expect(codec.parse(block.replaceAll('\n', '\r\n')).ok).toBe(true);
  });

  it.each(codecs)('canonicalizes, escapes markup and leaves digest verification to the service for $marker', (codec) => {
    const raw = codec.raw === outcome
      ? { ...outcome, reason: { ...outcome.reason, text: 'Missing <source>' } }
      : { ...answer, note: 'Use <source>' };
    const canonical = codec.canonical(raw);
    expect(JSON.parse(canonical)).toEqual({ domain: codec.domain, [codec.key]: raw });
    expect(codec.canonical(Object.fromEntries(Object.entries(raw).reverse()))).toBe(canonical);
    const block = codec.render(raw, 'b'.repeat(64));
    expect(block.split('\n')).toHaveLength(4);
    expect(block.split('\n')[2]).toContain('\\u003csource>');
    expect(block.split('\n')[2]).not.toContain('<');
    expect(codec.parse(block)).toEqual({ ok: true, [codec.key]: raw, digest: 'b'.repeat(64) });
    expect(() => codec.render(raw, 'invalid')).toThrow();
    expect(() => codec.render({}, 'b'.repeat(64))).toThrow();
    expect(() => codec.canonical({})).toThrow();
  });

  it.each(['R22', 'R24'])('reads the production assignment shape for %s alongside an outcome without changing persisted forms', (sessionId) => {
    const assignment = {
      version: 1, tenantId: '1', ownerId: '1', organizationId: 'good-choice',
      companyId: 'good-choice', projectId: 'orto-facile', businessUnit: { slug: 'design' },
      requestedBy: { managementAgentId: 'capo-orto-design', runtimeAgentId: 'capo-orto-design', vaultAgentId: 21 },
      productKind: 'design', title: 'Design Orto Facile', task: 'Prepare the project design', miniPlan: 'Read materials and deliver the design',
      materials: [], destination: { repo: 'acme/orto' }, createdAt,
    };
    const assignmentDigest = sha(devSessionAssignmentCanonicalJson(assignment));
    const assignmentBlock = renderDevSessionBlock(assignment, assignmentDigest);
    const raw = { ...outcome, sessionId };
    const digest = sha(devSessionOutcomeCanonicalJson(raw));
    const body = `${assignmentBlock}\n${renderDevSessionOutcomeBlock(raw, digest)}`;
    expect(parseDevSessionBlock(assignmentBlock)).toEqual({ ok: true, assignment, digest: assignmentDigest });
    expect(parseDevSessionBlock(body)).toEqual({ ok: true, assignment, digest: assignmentDigest });
    expect(parseDevSessionOutcomeBlock(body)).toEqual({ ok: true, outcome: raw, digest });
    expect(assignment).not.toHaveProperty('deliverableKey');
    const answerBlock = renderDevSessionAnswerBlock(answer, sha(devSessionAnswerCanonicalJson(answer)));
    expect(parseDevSessionOutcomeBlock(`${body}\n${answerBlock}`).ok).toBe(true);
    expect(parseDevSessionAnswerBlock(`${body}\n${answerBlock}`).ok).toBe(true);
  });
});
