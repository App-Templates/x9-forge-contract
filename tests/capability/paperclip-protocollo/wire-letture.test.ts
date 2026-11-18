import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_STATI_INCARICO,
  PaperclipAgenteMeSchema,
  PaperclipBloccoSchema,
  PaperclipCommentiSchema,
  PaperclipCommentoSchema,
  PaperclipContestoTurnoSchema,
  PaperclipElencoIncarichiSchema,
  PaperclipErroreRispostaSchema,
  PaperclipIncaricoSchema,
  PaperclipStatoIncaricoSchema,
  paperclipCommentoPiuRecente,
} from '../../../src/capability/paperclip-protocollo/wire-letture.js';

const issueId = '11111111-1111-4111-8111-111111111111';
const goalId = '22222222-2222-4222-8222-222222222222';
const agentId = '33333333-3333-4333-8333-333333333333';
const blockerId = '44444444-4444-4444-8444-444444444444';
const commentId = '55555555-5555-4555-8555-555555555555';

const issue = {
  id: issueId,
  identifier: 'BU-12',
  title: 'Mandato BU Vendite',
  description: 'Verificare le lacune prima del piano.',
  status: 'blocked',
  parentId: null,
  goalId,
  assigneeAgentId: agentId,
  blockedBy: [{
    id: blockerId,
    identifier: 'BU-13',
    title: 'Verifica lacune',
    status: 'done',
    assigneeAgentId: agentId,
    workMode: 'standard',
  }],
  workMode: 'standard',
  priority: 'medium',
};

const comment = {
  id: commentId,
  body: 'Lacune verificate: tornare al capo prima del piano.',
  authorAgentId: agentId,
  authorUserId: null,
  createdAt: '2026-10-30T09:00:00.000Z',
  issueId,
};

describe('Paperclip wire readings', () => {
  it('s7411_vista_completa', () => {
    const complete = {
      ...issue,
      identifier: 'PAP-224',
      companyId: goalId,
      priority: 'high',
      createdByAgentId: agentId,
      executionRunId: null,
      blocks: [{ id: blockerId, status: 'todo' }],
      updatedAt: '2026-11-18T09:00:00.000Z',
    };
    expect(PaperclipIncaricoSchema.parse(complete)).toEqual(complete);
    expect(PaperclipIncaricoSchema.parse(issue)).toEqual(issue);
    const minimal = { id: issueId, title: 'Mandato', status: 'todo' };
    expect(PaperclipIncaricoSchema.parse(minimal)).toEqual(minimal);
    const nullable = {
      ...minimal, identifier: null, createdByAgentId: null, executionRunId: null,
    };
    expect(PaperclipIncaricoSchema.parse(nullable)).toEqual(nullable);
    expect(PaperclipIncaricoSchema.parse({ ...complete, executionRunId: commentId }).executionRunId)
      .toBe(commentId);
    for (const invalid of [
      { createdByAgentId: 'x' },
      { priority: 'urgent' },
      { identifier: 224 },
      { companyId: 'x' },
      { executionRunId: 'x' },
      { blocks: [{ id: blockerId }] },
      { blocks: null },
      { updatedAt: 42 },
    ]) {
      expect(PaperclipIncaricoSchema.safeParse({ ...complete, ...invalid }).success)
        .toBe(false);
    }
  });

  it('s7411_elenco', () => {
    expect(PaperclipElencoIncarichiSchema.parse([issue])).toEqual([issue]);
    expect(PaperclipElencoIncarichiSchema.parse([])).toEqual([]);
    expect(PaperclipElencoIncarichiSchema.parse(Array.from({ length: 1000 }, () => issue)))
      .toHaveLength(1000);
    expect(PaperclipElencoIncarichiSchema.safeParse(Array.from({ length: 1001 }, () => issue)).success)
      .toBe(false);
    expect(PaperclipElencoIncarichiSchema.safeParse([
      issue, { id: issueId, status: 'todo' },
    ]).success).toBe(false);
  });

  it('s7411_commento_piu_recente', () => {
    const oldest = { ...comment, body: 'Oldest', createdAt: '2026-11-17T10:00:00.000Z' };
    const newest = { ...comment, body: 'Newest', createdAt: '2026-11-18T10:00:00.000Z' };
    const undated = { id: commentId, body: 'Undated' };
    const otherUndated = { id: blockerId, body: 'Other undated' };
    const invalidDate = { ...undated, createdAt: 'not-a-date' };
    const descending = [newest, oldest];
    // Taking .at(-1) from Paperclip's default descending order selects the oldest comment.
    expect(descending.at(-1)).toBe(oldest);
    for (const order of ['asc', 'desc'] as const) {
      expect(paperclipCommentoPiuRecente([oldest, newest], order)).toBe(newest);
      expect(paperclipCommentoPiuRecente(descending, order)).toBe(newest);
      expect(paperclipCommentoPiuRecente([undated, newest, oldest], order)).toBe(newest);
      expect(paperclipCommentoPiuRecente([oldest, newest, invalidDate], order)).toBe(newest);
      expect(paperclipCommentoPiuRecente([], order)).toBeNull();
    }
    expect(paperclipCommentoPiuRecente(descending)).toBe(newest);
    expect(paperclipCommentoPiuRecente([undated, otherUndated])).toBe(undated);
    expect(paperclipCommentoPiuRecente([undated, otherUndated], 'desc')).toBe(undated);
    expect(paperclipCommentoPiuRecente([undated, otherUndated], 'asc')).toBe(otherUndated);
    expect(paperclipCommentoPiuRecente([invalidDate, undated], 'desc')).toBe(invalidDate);
    expect(paperclipCommentoPiuRecente([invalidDate, undated], 'asc')).toBe(undated);
  });

  it('accetta_incarico_reale_con_blocchi', () => {
    expect(PaperclipIncaricoSchema.parse(issue)).toEqual(issue);
  });

  it('rifiuta_stato_sconosciuto', () => {
    expect(PaperclipIncaricoSchema.safeParse({ ...issue, status: 'in-progress' }).success)
      .toBe(false);
    expect(PaperclipStatoIncaricoSchema.safeParse('unknown').success).toBe(false);
    expect(PAPERCLIP_STATI_INCARICO).toEqual([
      'backlog', 'todo', 'in_progress', 'in_review', 'done', 'blocked', 'cancelled',
    ]);
    for (const status of PAPERCLIP_STATI_INCARICO) {
      expect(PaperclipStatoIncaricoSchema.parse(status)).toBe(status);
    }
  });

  it('rifiuta_blocco_senza_stato', () => {
    const result = PaperclipIncaricoSchema.safeParse({
      ...issue,
      blockedBy: [{ id: blockerId, title: 'Verifica lacune' }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((entry) => entry.path))
        .toContainEqual(['blockedBy', 0, 'status']);
    }
  });

  it('contesto_turno_con_commento_di_sveglia', () => {
    const context = {
      issue,
      ancestors: [{ id: goalId, title: 'Mandato principale', status: 'in_progress', identifier: 'BU-1' }],
      wakeComment: comment,
      companyId: goalId,
    };
    expect(PaperclipContestoTurnoSchema.parse(context)).toEqual(context);
  });

  it('accetta_campi_opzionali_assenti_o_nulli', () => {
    const minimal = { id: issueId, title: 'Mandato', status: 'todo' };
    expect(PaperclipIncaricoSchema.parse(minimal)).toEqual(minimal);
    const nullable = {
      ...minimal, description: null, parentId: null, goalId: null, assigneeAgentId: null,
    };
    expect(PaperclipIncaricoSchema.parse(nullable)).toEqual(nullable);
    const block = { id: blockerId, status: 'done', identifier: null, assigneeAgentId: null };
    expect(PaperclipBloccoSchema.parse(block)).toEqual(block);
    expect(PaperclipBloccoSchema.parse({ id: blockerId, status: 'done' }))
      .toEqual({ id: blockerId, status: 'done' });
    for (const context of [
      { issue: minimal, ancestors: [{ id: goalId }] },
      { issue: minimal, ancestors: [], wakeComment: null },
    ]) {
      expect(PaperclipContestoTurnoSchema.parse(context)).toEqual(context);
    }
  });

  it('commenti_sono_un_array_e_conservano_i_campi_extra', () => {
    expect(PaperclipCommentiSchema.parse([comment])).toEqual([comment]);
    expect(PaperclipCommentiSchema.parse([])).toEqual([]);
    expect(PaperclipCommentiSchema.safeParse({ comments: [comment] }).success).toBe(false);
    const minimal = { id: commentId, body: '' };
    expect(PaperclipCommentoSchema.parse(minimal)).toEqual(minimal);
    const nullable = { ...minimal, authorAgentId: null, authorUserId: 'user-1' };
    expect(PaperclipCommentoSchema.parse(nullable)).toEqual(nullable);
  });

  it('agente_me_ed_errore_conservano_i_campi_extra', () => {
    const agent = { id: agentId, companyId: goalId, name: 'Lab' };
    expect(PaperclipAgenteMeSchema.parse(agent)).toEqual(agent);
    const error = { error: 'Issue not found', code: 'not_found' };
    expect(PaperclipErroreRispostaSchema.parse(error)).toEqual(error);
  });

  it('richiede_campi_obbligatori_e_tipi_validi', () => {
    for (const value of [
      { title: 'Mandato', status: 'todo' },
      { id: issueId, status: 'todo' },
      { id: issueId, title: 'Mandato' },
      { ...issue, id: 'not-a-guid' },
      { ...issue, parentId: 'not-a-guid' },
      { ...issue, goalId: 'not-a-guid' },
      { ...issue, assigneeAgentId: 'not-a-guid' },
      { ...issue, description: 42 },
      { ...issue, blockedBy: null },
      { ...issue, blockedBy: [{ id: blockerId, status: 'in-progress' }] },
    ]) {
      expect(PaperclipIncaricoSchema.safeParse(value).success).toBe(false);
    }
    expect(PaperclipContestoTurnoSchema.safeParse({ issue }).success).toBe(false);
    expect(PaperclipContestoTurnoSchema.safeParse({ ancestors: [] }).success).toBe(false);
    expect(PaperclipContestoTurnoSchema.safeParse({
      issue, ancestors: [{ id: goalId, status: 'in-progress' }],
    }).success).toBe(false);
    expect(PaperclipCommentoSchema.safeParse({ id: commentId }).success).toBe(false);
    expect(PaperclipCommentoSchema.safeParse({ body: 'Comment' }).success).toBe(false);
    expect(PaperclipCommentoSchema.safeParse({ ...comment, authorAgentId: 'not-a-guid' }).success)
      .toBe(false);
    expect(PaperclipAgenteMeSchema.safeParse({ id: agentId }).success).toBe(false);
    expect(PaperclipAgenteMeSchema.safeParse({ id: agentId, companyId: 'not-a-guid' }).success)
      .toBe(false);
    expect(PaperclipErroreRispostaSchema.safeParse({}).success).toBe(false);
    expect(PaperclipErroreRispostaSchema.safeParse({ error: 404 }).success).toBe(false);
  });

  it('accetta_guid_senza_vincoli_di_versione_uuid', () => {
    const id = '12345678-1234-1234-1234-123456789abc';
    expect(PaperclipIncaricoSchema.parse({ id, title: 'Mandato', status: 'todo' }).id)
      .toBe(id);
  });
});
