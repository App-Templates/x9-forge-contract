import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  PAPERCLIP_ASK_QUESTION_ID, PAPERCLIP_INTERACTION_PENDING_WAKE, PaperclipAnswerInteractionBodySchema,
  PaperclipAskInteractionBodySchema, PaperclipNativeAssignInputSchema as NativeAssign,
  PaperclipNativeAssignRefInputSchema as NativeAssignRef, paperclipAnswerInteractionBody,
  paperclipAskIdempotencyKey, paperclipAskInteractionBody,
  PAPERCLIP_CHECK_LATER_MAX_SECONDS, PAPERCLIP_NATIVE_WAIT_TOOLS, PAPERCLIP_TOOLS, PaperclipCheckLaterInputSchema as CheckLater,
  PaperclipCheckLaterOutputSchema as CheckLaterOutput, PaperclipCreateIssueInputSchema as Create,
  PaperclipNativeCreateIssueInputSchema as NativeCreate, PaperclipNativeReviewInputSchema as NativeReview,
  PaperclipReviewInputSchema as Review, PAPERCLIP_WAIT_REFUSALS, PAPERCLIP_WAIT_UNBLOCKERS, paperclipUnblockDescriptor,
} from '../src/capability/paperclip/index.js';

const issueId = 'f13dd515-1bad-4e0d-a697-7d19bfac6100';
const child = 'f13dd515-1bad-4e0d-a697-7d19bfac6101';
const other = 'f13dd515-1bad-4e0d-a697-7d19bfac6102';

describe('native review: blocked says what it waits for (P-04)', () => {
  it('accepts every input of the existing review unchanged', () => {
    for (const input of [{ issueId, status: 'done' }, { issueId, status: 'in_review', comment: 'Fatto' },
      { issueId, status: 'blocked' }]) {
      expect(Review.parse(input)).toEqual(input);
      expect(NativeReview.parse(input)).toEqual(input);
    }
  });
  it('accepts blocked with the tasks it waits for or with the action the agent owns', () => {
    const blockers = { issueId, status: 'blocked', blockedByIssueIds: [child, other] };
    expect(NativeReview.parse(blockers)).toEqual(blockers);
    const external = { issueId, status: 'blocked', waitingFor: { action: 'Il referente manda gli accessi', unblockedBy: 'external' }, comment: 'In attesa' };
    expect(NativeReview.parse(external)).toEqual(external);
  });
  it('refuses a wait reason without blocked', () => {
    for (const status of ['done', 'in_review']) {
      expect(NativeReview.safeParse({ issueId, status, blockedByIssueIds: [child] }).success).toBe(false);
      expect(NativeReview.safeParse({ issueId, status, waitingFor: { action: 'x' } }).success).toBe(false);
    }
  });
  it('refuses duplicate, empty, too many, malformed or self blockers', () => {
    for (const blockedByIssueIds of [[child, child], [], Array.from({ length: 21 }, () => crypto.randomUUID()), ['SOC-1'], [issueId]]) {
      expect(NativeReview.safeParse({ issueId, status: 'blocked', blockedByIssueIds }).success).toBe(false);
    }
  });
  it('refuses blank, oversized or extra-keyed actions and unknown keys', () => {
    for (const waitingFor of [{ action: '  ' }, { action: 'x'.repeat(2001) }, { action: 'x', owner: 'board' }, {}]) {
      expect(NativeReview.safeParse({ issueId, status: 'blocked', waitingFor }).success).toBe(false);
    }
    expect(NativeReview.safeParse({ issueId, status: 'blocked', unblockDescriptor: {} }).success).toBe(false);
  });
  it('leaves the existing review strict', () => {
    expect(Review.safeParse({ issueId, status: 'blocked', blockedByIssueIds: [child] }).success).toBe(false);
  });
});

describe('native review: keep working with a scheduled check (P-15)', () => {
  const checkLater = { afterSeconds: 120, notes: 'Stato della ricerca', serviceName: 'cap-ricerca' };
  it('accepts in_progress only with checkLater', () => {
    expect(NativeReview.parse({ issueId, status: 'in_progress', checkLater })).toEqual({ issueId, status: 'in_progress', checkLater });
    expect(NativeReview.safeParse({ issueId, status: 'in_progress' }).success).toBe(false);
  });
  it('refuses checkLater with any other status, and out-of-bounds checks', () => {
    for (const status of ['done', 'blocked', 'in_review']) {
      expect(NativeReview.safeParse({ issueId, status, checkLater }).success).toBe(false);
    }
    for (const bad of [{ ...checkLater, afterSeconds: 10 }, { ...checkLater, notes: ' ' }, { ...checkLater, externalRef: 'x' }]) {
      expect(NativeReview.safeParse({ issueId, status: 'in_progress', checkLater: bad }).success).toBe(false);
    }
  });
  it('the existing review never keeps in_progress', () => {
    expect(Review.safeParse({ issueId, status: 'in_progress' }).success).toBe(false);
  });
});

describe('native create: delegate and declare the wait in one call (P-03, P-04)', () => {
  const base = { title: 'Verifica le lacune', assigneeRoleRef: 'rd-lab', parentIssueId: issueId };
  it('accepts waitForChild with a parent and an assignee, and every existing create input', () => {
    expect(NativeCreate.parse({ ...base, waitForChild: true })).toEqual({ ...base, waitForChild: true });
    expect(NativeCreate.parse(base)).toEqual(Create.parse(base));
    expect(NativeCreate.parse({ title: 'Solo titolo' })).toEqual({ title: 'Solo titolo' });
  });
  it('refuses waitForChild without parent or without assignee', () => {
    const { parentIssueId: _p, ...noParent } = base;
    const { assigneeRoleRef: _a, ...noAssignee } = base;
    expect(NativeCreate.safeParse({ ...noParent, waitForChild: true }).success).toBe(false);
    expect(NativeCreate.safeParse({ ...noAssignee, waitForChild: true }).success).toBe(false);
    expect(NativeCreate.safeParse({ ...noParent, waitForChild: false }).success).toBe(true);
  });
  it('leaves the existing create strict', () => {
    expect(Create.safeParse({ ...base, waitForChild: true }).success).toBe(false);
  });
});

describe('check later: a one-shot Paperclip monitor (P-15)', () => {
  it('accepts a bounded delay and Paperclip-sized notes', () => {
    const input = { issueId, afterSeconds: 120, notes: 'Controllo lo stato della ricerca', serviceName: 'cap-ricerca' };
    expect(CheckLater.parse(input)).toEqual(input);
    expect(CheckLater.parse({ ...input, afterSeconds: 3601 })).toEqual({ ...input, afterSeconds: 3601 });
  });
  it('refuses delays outside 30..PAPERCLIP_CHECK_LATER_MAX_SECONDS s, oversized notes or service names, extra keys', () => {
    for (const afterSeconds of [29, PAPERCLIP_CHECK_LATER_MAX_SECONDS + 1, 1.5]) {
      expect(CheckLater.safeParse({ issueId, afterSeconds, notes: 'x' }).success).toBe(false);
    }
    expect(CheckLater.safeParse({ issueId, afterSeconds: 60, notes: 'x'.repeat(501) }).success).toBe(false);
    expect(CheckLater.safeParse({ issueId, afterSeconds: 60, notes: 'x', serviceName: 'y'.repeat(121) }).success).toBe(false);
    expect(CheckLater.safeParse({ issueId, afterSeconds: 60, notes: 'x', externalRef: 'secret' }).success).toBe(false);
  });
  it('returns the task and the scheduled check', () => {
    const issue = { id: issueId, companyId: issueId, identifier: 'SOC-1', title: 'Ricerca', description: null,
      status: 'in_progress', assigneeAgentId: child };
    expect(CheckLaterOutput.parse({ issue, nextCheckAt: '2026-10-30T18:00:00.000Z' })).toEqual({ issue, nextCheckAt: '2026-10-30T18:00:00.000Z' });
  });
  it('keeps the tool name out of the existing tool list', () => {
    expect(Object.values(PAPERCLIP_TOOLS)).not.toContain(PAPERCLIP_NATIVE_WAIT_TOOLS.checkLater);
    expect(PAPERCLIP_NATIVE_WAIT_TOOLS.checkLater).toMatch(/^paperclip_[a-z_]+$/);
  });
  it('produces JSON schemas for a manifest', () => {
    for (const schema of [NativeReview, NativeCreate, CheckLater]) {
      expect(z.toJSONSchema(schema)).toMatchObject({ type: 'object' });
    }
  });
});

describe('s7275 chiedi-a-un-agente: ask in review and the answer in assign', () => {
  const ask = { roleRef: 'director', question: 'Quale ambiente uso per la prova?' };
  const issueRef = 'SOC-12';

  it('(a) accepts ask only with in_review and no other wait', () => {
    expect(NativeReview.safeParse({ issueId, status: 'in_review', ask }).success).toBe(true);
    expect(NativeReview.safeParse({ issueId, status: 'in_review', comment: 'Serve una decisione', ask }).success).toBe(true);
    for (const status of ['done', 'blocked', 'in_progress']) {
      expect(NativeReview.safeParse({ issueId, status, ask }).success).toBe(false);
    }
    expect(NativeReview.safeParse({ issueId, status: 'in_review', ask, waitingFor: { action: 'x' } }).success).toBe(false);
    expect(NativeReview.safeParse({ issueId, status: 'in_review', ask, blockedByIssueIds: [child] }).success).toBe(false);
    expect(NativeReview.safeParse({ issueId, status: 'in_review', ask, checkLater: { afterSeconds: 60, notes: 'x' } }).success).toBe(false);
    expect(NativeReview.safeParse({ issueId, status: 'in_review', ask: { ...ask, roleRef: '' } }).success).toBe(false);
    expect(NativeReview.safeParse({ issueId, status: 'in_review', ask: { ...ask, question: '' } }).success).toBe(false);
    expect(NativeReview.safeParse({ issueId, status: 'in_review', ask: { ...ask, question: 'q'.repeat(2001) } }).success).toBe(false);
    expect(NativeReview.safeParse({ issueId, status: 'in_review', ask: { ...ask, question: 'q'.repeat(2000) } }).success).toBe(true);
    expect(NativeReview.safeParse({ issueId, status: 'in_review', ask: { ...ask, extra: 1 } }).success).toBe(false);
    expect(NativeReview.safeParse({ issueId, status: 'in_review' }).success).toBe(true);
  });

  it('(b) assign carries answersInteractionId only with the answer text', () => {
    const base = { issueId, roleRef: 'sviluppo' };
    for (const schema of [NativeAssign]) {
      expect(schema.safeParse({ ...base, answersInteractionId: other, comment: 'Usa lo staging' }).success).toBe(true);
      expect(schema.safeParse({ ...base, answersInteractionId: other }).success).toBe(false);
      expect(schema.safeParse({ ...base, answersInteractionId: 'non-uuid', comment: 'x' }).success).toBe(false);
      expect(schema.safeParse({ ...base, answersInteractionId: other, comment: 'x'.repeat(4001) }).success).toBe(false);
      expect(schema.safeParse({ ...base, comment: 'x', surprise: 1 }).success).toBe(false);
      expect(schema.safeParse(base).success).toBe(true);
      expect(schema.safeParse({ ...base, comment: 'x' }).success).toBe(true);
    }
    const ref = { issueId: issueRef, roleRef: 'sviluppo' };
    expect(NativeAssignRef.safeParse({ ...ref, answersInteractionId: other, comment: 'ok' }).success).toBe(true);
    expect(NativeAssignRef.safeParse({ ...ref, answersInteractionId: other }).success).toBe(false);
    expect(NativeAssignRef.safeParse(ref).success).toBe(true);
    expect(NativeAssignRef.safeParse({ ...ref, answersInteractionId: other, comment: 'ok', surprise: 1 }).success).toBe(false);
  });

  it('(c) builds the Paperclip creation body with two equal views and no resolverPolicy', () => {
    const key = paperclipAskIdempotencyKey(issueId, 'call-1');
    expect(key).toBe(`ask:${issueId}:call-1`);
    const body = paperclipAskInteractionBody({ question: ask.question, addresseeAgentId: child, idempotencyKey: key });
    expect(PaperclipAskInteractionBodySchema.parse(body)).toEqual(body);
    expect(Object.keys(body)).not.toContain('resolverPolicy');
    expect(body.kind).toBe('ask_user_questions');
    expect(body.continuationPolicy).toBe('wake_assignee');
    expect(body.addresseeAgentId).toBe(child);
    const [set] = body.payload.questionSet.questions;
    const [view] = body.payload.questions;
    expect(set).toMatchObject({ id: PAPERCLIP_ASK_QUESTION_ID, prompt: ask.question, required: true });
    expect(view).toMatchObject({ id: set?.id, prompt: set?.prompt, required: set?.required });
    expect(view?.options).toHaveLength(1);
    expect(view?.options[0]?.freeText).toBe(true);
    expect(PaperclipAskInteractionBodySchema.safeParse({ ...body, resolverPolicy: 'human_only' }).success).toBe(false);
    expect(PaperclipAskInteractionBodySchema.safeParse({ ...body, addresseeAgentId: 'nope' }).success).toBe(false);
    const diverging = { ...body, payload: { ...body.payload, questions: [{ ...view, prompt: 'altro' }] } };
    expect(PaperclipAskInteractionBodySchema.safeParse(diverging).success).toBe(false);
    expect(() => paperclipAskInteractionBody({ question: '', addresseeAgentId: child, idempotencyKey: key })).toThrow();
    expect(() => paperclipAskInteractionBody({ question: 'q'.repeat(2001), addresseeAgentId: child, idempotencyKey: key })).toThrow();
    expect(() => paperclipAskInteractionBody({ question: 'q', addresseeAgentId: child, idempotencyKey: 'k'.repeat(256) })).toThrow();
    expect(() => paperclipAskIdempotencyKey(issueId, 'c'.repeat(300))).toThrow();
    expect(PAPERCLIP_INTERACTION_PENDING_WAKE).toBe('interaction_pending');
  });

  it('(d) builds the answer body: trimmed text, empty optionIds, bounded', () => {
    const body = paperclipAnswerInteractionBody('  Usa lo staging \n');
    expect(body).toEqual({ answers: [{ questionId: PAPERCLIP_ASK_QUESTION_ID, optionIds: [], otherText: 'Usa lo staging' }] });
    expect(PaperclipAnswerInteractionBodySchema.parse(body)).toEqual(body);
    expect(() => paperclipAnswerInteractionBody('   ')).toThrow();
    expect(() => paperclipAnswerInteractionBody('')).toThrow();
    expect(() => paperclipAnswerInteractionBody('x'.repeat(4001))).toThrow();
    expect(paperclipAnswerInteractionBody('x'.repeat(4000)).answers[0]?.otherText).toHaveLength(4000);
    expect(paperclipAnswerInteractionBody(`${' '.repeat(10)}${'x'.repeat(4000)}`).answers[0]?.otherText).toHaveLength(4000);
  });
});

describe('s7290 attesa-dichiarata: the wait says who unblocks it (closed list, text never read)', () => {
  const agentId = 'f13dd515-1bad-4e0d-a697-7d19bfac6200';
  const labAction = 'ripristino del servizio Lab per ingestione e pubblicazione dei risultati delle ricerche';
  // Paperclip's strict unblock descriptor (validators/issue.ts:693-704), copied here: owner by agentId, action text, nothing else.
  const PaperclipDescriptor = z.strictObject({ owner: z.strictObject({ agentId: z.uuid() }), action: z.string().min(1) });

  it('(a) the lists are closed and exact', () => {
    expect([...PAPERCLIP_WAIT_UNBLOCKERS]).toEqual(['self', 'external', 'company_agent']);
    expect([...PAPERCLIP_WAIT_REFUSALS]).toEqual(['wait_for_company_agent']);
  });
  it('(b) unblockedBy is mandatory and only the three values pass', () => {
    for (const unblockedBy of PAPERCLIP_WAIT_UNBLOCKERS) {
      expect(NativeReview.safeParse({ issueId, status: 'blocked', waitingFor: { action: 'x', unblockedBy } }).success).toBe(true);
    }
    for (const waitingFor of [{ action: 'x' }, { action: 'x', unblockedBy: 'board' }, { action: 'x', unblockedBy: 'user' },
      { action: 'x', unblockedBy: 'Self' }, { action: 'x', unblockedBy: '' }, { action: 'x', unblockedBy: 'self', extra: 1 }]) {
      expect(NativeReview.safeParse({ issueId, status: 'blocked', waitingFor }).success).toBe(false);
    }
  });
  it('(c) self and external give the descriptor X9 stores today (same keys, same order, strict Paperclip schema)', () => {
    // Shapes copied from X9 director-lab-production-seats.test.ts:93 (Lab action) and director-ask-resume.test.ts:23.
    for (const action of [labAction, 'Il referente manda gli accessi']) {
      for (const unblockedBy of ['self', 'external'] as const) {
        const out = paperclipUnblockDescriptor({ action, unblockedBy }, agentId);
        expect(out).toEqual({ ok: true, descriptor: { owner: { agentId }, action } });
        if (!out.ok) throw new Error('unexpected refusal');
        expect(JSON.stringify(out.descriptor)).toBe(JSON.stringify({ owner: { agentId }, action }));
        expect(Object.keys(out.descriptor)).toEqual(['owner', 'action']);
        expect(PaperclipDescriptor.safeParse(out.descriptor).success).toBe(true);
      }
    }
  });
  it('(d) company_agent is refused with its reason and no descriptor, whatever the action says', () => {
    for (const action of ['aspetto me stesso', 'aspetto il Director', labAction]) {
      const out = paperclipUnblockDescriptor({ action, unblockedBy: 'company_agent' }, agentId);
      expect(out).toEqual({ ok: false, refusal: 'wait_for_company_agent' });
      expect('descriptor' in out).toBe(false);
    }
  });
  it('(e) a non-uuid agentId throws', () => {
    for (const bad of ['', 'director', '123']) {
      expect(() => paperclipUnblockDescriptor({ action: 'x', unblockedBy: 'self' }, bad)).toThrow();
    }
  });
});
