import { describe, expect, it } from 'vitest';
import {
  PaperclipAnswerCheckSourceSchema,
  PaperclipDirectorAnswerSchema,
  PaperclipNativeReviewInputSchema,
  paperclipDirectorAnswerLines,
  type PaperclipAnswerCheckSource,
} from '../src/capability/paperclip/native-wait.js';
import { internalMemoryDecisionRequestReadContract } from '../src/http/endpoints/internal-memory-decision-requests.js';

// Synthetic decision and reader identities; no production data is used.
const source = { service: 'memory', requestId: 'decision_s8206' } as const satisfies PaperclipAnswerCheckSource;
const howToFix = { move: 'Rileggi la decisione e il suo esito.', who: 'asker', tool: 'paperclip_review' } as const;
const answer = {
  outcome: 'forbidden',
  howToFix,
  liftCondition: { kind: 'check_after', afterSeconds: 120, source },
} as const;
const done = {
  issueId: '11111111-1111-4111-8111-111111111111',
  status: 'done',
  comment: 'Risposta del Director.',
} as const;
const historicalLines = [
  'Esito: vietato.',
  'Come correggere: Rileggi la decisione e il suo esito. (chi: tu; strumento: paperclip_review).',
  'Il divieto va ricontrollato fra 120 secondi: usa un controllo programmato (checkLater afterSeconds 120).',
];

describe('s8206 Director check source', () => {
  it('s8206 exports a strict memory source compatible with decision read params', () => {
    expect(PaperclipAnswerCheckSourceSchema.parse(source)).toEqual(source);
    expect(PaperclipAnswerCheckSourceSchema.shape.requestId.description).toBe('Decision read by the check source');
    const other = { service: 'memory', requestId: 'another-decision_8206' } as const;
    expect(PaperclipAnswerCheckSourceSchema.parse(other)).toEqual(other);
    expect(internalMemoryDecisionRequestReadContract.paramsSchema.parse({ requestId: other.requestId }))
      .toEqual({ requestId: other.requestId });
  });

  it('s8206 preserves the memory decision source through parsing and comments', () => {
    const parsed = PaperclipDirectorAnswerSchema.parse(answer);
    expect(parsed).toEqual(answer);
    const lift = parsed.liftCondition;
    if (lift?.kind !== 'check_after' || lift.source === undefined) {
      throw new Error('The parsed check must keep its memory source');
    }
    expect(internalMemoryDecisionRequestReadContract.paramsSchema.parse({ requestId: lift.source.requestId }))
      .toEqual({ requestId: source.requestId });
    expect(paperclipDirectorAnswerLines(parsed)).toBe([
      ...historicalLines,
      `Fonte del ricontrollo: Memoria, richiesta ${source.requestId}. Al ricontrollo nativo rileggi la richiesta e l'esito: né il tempo trascorso né lo stato decided danno da soli il via libera.`,
    ].join('\n'));
    expect(PaperclipNativeReviewInputSchema.parse({ ...done, answer })).toEqual({ ...done, answer });
  });

  it.each([
    { label: 'a different service', value: { ...source, service: 'research' } },
    { label: 'an empty request id', value: { ...source, requestId: '' } },
    { label: 'a missing request id', value: { service: 'memory' } },
    { label: 'a malformed request id', value: { ...source, requestId: 'not a decision' } },
    { label: 'a request id containing a URL', value: { ...source, requestId: 'https://example.invalid/decision' } },
    { label: 'an extra URL', value: { ...source, url: 'https://example.invalid/decision' } },
    { label: 'an extra state', value: { ...source, state: 'decided' } },
    { label: 'a missing service', value: { requestId: source.requestId } },
  ])('s8206 rejects $label in the check source', ({ value }) => {
    expect(PaperclipAnswerCheckSourceSchema.safeParse(value).success).toBe(false);
    expect(PaperclipDirectorAnswerSchema.safeParse({
      ...answer,
      liftCondition: { ...answer.liftCondition, source: value },
    }).success).toBe(false);
  });

  it('s8206 rejects a source on the issue blocker branch', () => {
    expect(PaperclipDirectorAnswerSchema.safeParse({
      ...answer,
      liftCondition: { kind: 'blocked_by_issue', issueId: done.issueId, source },
    }).success).toBe(false);
  });

  it('s8206 keeps the historical check without a source and its exact text', () => {
    const historical = { ...answer, liftCondition: { kind: 'check_after', afterSeconds: 120 } } as const;
    const parsed = PaperclipDirectorAnswerSchema.parse(historical);
    expect(parsed).toEqual(historical);
    expect(parsed.liftCondition).not.toHaveProperty('source');
    expect(paperclipDirectorAnswerLines(parsed)).toBe(historicalLines.join('\n'));
    expect(PaperclipNativeReviewInputSchema.parse({ ...done, answer: historical }))
      .toEqual({ ...done, answer: historical });
  });

  it('s8206 keeps historical issue blocker parsing and text', () => {
    const historical = { ...answer, liftCondition: { kind: 'blocked_by_issue', issueId: done.issueId } } as const;
    const parsed = PaperclipDirectorAnswerSchema.parse(historical);
    expect(parsed).toEqual(historical);
    expect(paperclipDirectorAnswerLines(parsed)).toBe([
      ...historicalLines.slice(0, 2),
      `Il divieto cade quando l'incarico ${done.issueId} è chiuso: blocca il tuo incarico con blockedByIssueIds.`,
    ].join('\n'));
  });

  it('s8206 preserves outcome obligations with a memory source', () => {
    const { howToFix: _howToFix, ...withoutFix } = answer;
    const { liftCondition: _liftCondition, ...withoutLift } = answer;
    expect(PaperclipDirectorAnswerSchema.safeParse(withoutFix).success).toBe(false);
    expect(PaperclipDirectorAnswerSchema.safeParse(withoutLift).success).toBe(false);
    expect(PaperclipDirectorAnswerSchema.safeParse({ ...answer, outcome: 'approved' }).success).toBe(false);
    expect(PaperclipDirectorAnswerSchema.safeParse({ ...answer, outcome: 'not_approved' }).success).toBe(false);
    expect(PaperclipDirectorAnswerSchema.safeParse({ ...answer, source }).success).toBe(false);
  });

  it('s8206 preserves closures without an answer and explicit response resolutions', () => {
    expect(PaperclipNativeReviewInputSchema.parse(done)).toEqual(done);
    const response = { ...done, answer, resolution: { kind: 'answer', mode: 'response' } } as const;
    expect(PaperclipNativeReviewInputSchema.parse(response)).toEqual(response);
    expect(PaperclipNativeReviewInputSchema.safeParse({
      ...done, resolution: { kind: 'answer', mode: 'response' },
    }).success).toBe(false);
    expect(PaperclipNativeReviewInputSchema.safeParse({
      ...response, resolution: { kind: 'answer', mode: 'clearance' },
    }).success).toBe(false);
  });
});
