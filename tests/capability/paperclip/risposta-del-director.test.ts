import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_CHECK_LATER_MAX_SECONDS,
  PaperclipNativeReviewInputSchema,
  paperclipDirectorAnswerLines,
} from '../../../src/capability/paperclip/native-wait.js';

const issueId = '11111111-1111-4111-8111-111111111111';
const blocker = '22222222-2222-4222-8222-222222222222';
const howToFix = { move: 'Aggiungi la sezione prezzi e riconsegna.', who: 'asker', tool: 'paperclip_review' } as const;
const done = { issueId, status: 'done', comment: 'Risposta del Director.' } as const;
const review = (answer: unknown, extra: object = {}) => PaperclipNativeReviewInputSchema.safeParse({ ...done, ...extra, answer });

describe('s8250 risposta-del-director', () => {
  it('s8250 risposta-del-director: not_approved with howToFix passes and the lines are fixed', () => {
    const answer = { outcome: 'not_approved', howToFix };
    expect(review(answer).success).toBe(true);
    expect(paperclipDirectorAnswerLines(answer as never)).toBe([
      'Esito: non approvato.',
      'Come correggere: Aggiungi la sezione prezzi e riconsegna. (chi: tu; strumento: paperclip_review).',
    ].join('\n'));
    expect(paperclipDirectorAnswerLines({ outcome: 'approved' })).toBe('Esito: approvato.');
    const noTool = { outcome: 'not_approved', howToFix: { move: 'Scrivi al referente.', who: 'director' } };
    expect(paperclipDirectorAnswerLines(noTool as never)).toBe(
      'Esito: non approvato.\nCome correggere: Scrivi al referente. (chi: il Director).');
    const byIssue = { outcome: 'forbidden', howToFix: { ...howToFix, who: 'referent' }, liftCondition: { kind: 'blocked_by_issue', issueId: blocker } };
    expect(review(byIssue).success).toBe(true);
    expect(paperclipDirectorAnswerLines(byIssue as never)).toBe([
      'Esito: vietato.',
      'Come correggere: Aggiungi la sezione prezzi e riconsegna. (chi: il referente; strumento: paperclip_review).',
      `Il divieto cade quando l'incarico ${blocker} è chiuso: blocca il tuo incarico con blockedByIssueIds.`,
    ].join('\n'));
    const byTime = { outcome: 'forbidden', howToFix, liftCondition: { kind: 'check_after', afterSeconds: 3600 } };
    expect(review(byTime).success).toBe(true);
    expect(paperclipDirectorAnswerLines(byTime as never).split('\n')[2]).toBe(
      'Il divieto va ricontrollato fra 3600 secondi: usa un controllo programmato (checkLater afterSeconds 3600).');
  });

  it('s8250 senza-come-correggere: not_approved and forbidden without howToFix are refused', () => {
    expect(review({ outcome: 'not_approved' }).success).toBe(false);
    expect(review({ outcome: 'forbidden', liftCondition: { kind: 'check_after', afterSeconds: 60 } }).success).toBe(false);
    expect(review({ outcome: 'not_approved', howToFix, liftCondition: { kind: 'check_after', afterSeconds: 60 } }).success).toBe(false);
  });

  it('s8250 divieto-senza-condizione: forbidden needs liftCondition; approved carries neither', () => {
    expect(review({ outcome: 'forbidden', howToFix }).success).toBe(false);
    expect(review({ outcome: 'approved' }).success).toBe(true);
    expect(review({ outcome: 'approved', howToFix }).success).toBe(false);
    expect(review({ outcome: 'approved', liftCondition: { kind: 'check_after', afterSeconds: 60 } }).success).toBe(false);
  });

  it('s8250 controllo-con-l-ora: afterSeconds is bounded like checkLater', () => {
    const lift = (afterSeconds: number) => ({ outcome: 'forbidden', howToFix, liftCondition: { kind: 'check_after', afterSeconds } });
    expect(review(lift(29)).success).toBe(false);
    expect(review(lift(PAPERCLIP_CHECK_LATER_MAX_SECONDS + 1)).success).toBe(false);
    expect(review(lift(30)).success).toBe(true);
    expect(review(lift(PAPERCLIP_CHECK_LATER_MAX_SECONDS)).success).toBe(true);
  });

  it('s8250 forma-di-oggi: a done closure with only a comment is unchanged; answer needs done and no wait', () => {
    expect(PaperclipNativeReviewInputSchema.safeParse(done).success).toBe(true);
    const answer = { outcome: 'not_approved', howToFix };
    expect(review(answer, { status: 'blocked', blockedByIssueIds: [blocker] }).success).toBe(false);
    expect(review(answer, { status: 'in_review' }).success).toBe(false);
    expect(review(answer, { status: 'in_review', ask: { roleRef: 'capo', question: 'Come?' } }).success).toBe(false);
    expect(review(answer, { status: 'in_progress', checkLater: { afterSeconds: 60, notes: 'x' } }).success).toBe(false);
  });
});
