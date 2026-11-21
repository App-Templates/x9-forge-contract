import { describe, expect, it } from 'vitest';
import {
  PaperclipLabAnswerSchema, PaperclipLabCreateIssueAgentInputSchema, PaperclipLabCreateIssueInputSchema,
  PaperclipLabNativeCreateIssueAgentInputSchema, PaperclipLabRequestSchema, PaperclipLabReviewSchema,
  PaperclipNativeCreateIssueAgentInputSchema, PaperclipNativeReviewInputSchema,
  paperclipLabAcceptanceCriteria, paperclipLabAnswerRecord, paperclipLabCoverageProblem, paperclipLabFreeTextProblem,
  paperclipLabRequestRecord, paperclipLabReviewRecord, parsePaperclipLabAnswerRecord, parsePaperclipLabRequestRecord,
  parsePaperclipLabReviewRecord,
} from '../../../src/capability/paperclip/native-wait.js';
import { PaperclipFiglioCreaCorpoSchema } from '../../../src/capability/paperclip-protocollo/wire-creazione.js';

const uuid = (n: number) => `${String(n).repeat(8)}-1111-4111-8111-${String(n).repeat(12)}`;
const [parent, child, requester, comment, assignee] = [uuid(1), uuid(2), uuid(3), uuid(4), uuid(5)];
const digest = 'a'.repeat(64);
const recipient = { kind: 'client', clientId: uuid(6) } as const;
const request = { question: 'Cosa sa il Lab della consegna?', why: 'Serve al piano del cliente.', topics: ['tempi di consegna', 'zone servite'], recipient };
const page = { slug: 'consegne', version: 3, digest };
const answer = { topics: [
  { topic: 'tempi di consegna', coverage: 'covered', pages: [page] },
  { topic: 'zone servite', coverage: 'gap', reason: 'Nessuna pagina pubblicata sulle zone.' },
] };
const req = () => PaperclipLabRequestSchema.parse(request);
const ans = (value: unknown) => PaperclipLabAnswerSchema.parse(value);
const review = { childIssueId: child, answerCommentId: comment, outcome: 'changes_requested', comment: 'Manca una zona.', missingTopics: ['zone servite'] } as const;
const nativeParse = (extra: object) => PaperclipNativeReviewInputSchema.safeParse({ issueId: parent, ...extra });

describe('s8382 contratto-lab', () => {
  it('s8382 regressione: two topics make two native criteria; the answer covers one with a page and declares the other gap', () => {
    const create = PaperclipLabCreateIssueAgentInputSchema.parse({ title: 'Chiedi al Lab', assigneeAgentId: assignee, parentIssueId: parent, labRequest: request });
    const criteria = paperclipLabAcceptanceCriteria(create.labRequest!);
    expect(criteria).toEqual(['tempi di consegna', 'zone servite']);
    expect(PaperclipFiglioCreaCorpoSchema.safeParse({ title: 'Chiedi al Lab', acceptanceCriteria: criteria }).success).toBe(true);
    expect(paperclipLabCoverageProblem(req(), ans(answer))).toBeUndefined();
    expect(nativeParse({ status: 'done', comment: 'Risposta.', labAnswer: answer }).success).toBe(true);
    const record = paperclipLabRequestRecord({ ...req(), requesterAgentId: requester, parentIssueId: parent });
    expect(parsePaperclipLabRequestRecord(`Testo\n${record}\nfine`)).toEqual({ ...req(), requesterAgentId: requester, parentIssueId: parent });
    expect(parsePaperclipLabAnswerRecord(paperclipLabAnswerRecord(ans(answer)))).toEqual(ans(answer));
    const rev = PaperclipLabReviewSchema.parse(review);
    expect(parsePaperclipLabReviewRecord(paperclipLabReviewRecord(rev))).toEqual(rev);
  });

  it('s8382 argomento omesso: a subset of the topics is a problem (mutant)', () => {
    expect(paperclipLabCoverageProblem(req(), ans({ topics: [answer.topics[0]] }))).toMatch(/exactly one row/);
  });
  it('s8382 due righe per lo stesso argomento: refused by schema and by the coverage function', () => {
    const twice = { topics: [answer.topics[0], answer.topics[0]] };
    expect(PaperclipLabAnswerSchema.safeParse(twice).success).toBe(false);
    const single = PaperclipLabRequestSchema.parse({ ...request, topics: ['tempi di consegna'] });
    expect(paperclipLabCoverageProblem(single, twice as never)).toMatch(/more than once/);
  });
  it('s8382 argomento estraneo: an invented topic in place of a requested one fails', () => {
    const foreign = ans({ topics: [answer.topics[0], { topic: 'inventato', coverage: 'gap', reason: 'x' }] });
    expect(paperclipLabCoverageProblem(req(), foreign)).toMatch(/not requested/);
    expect(paperclipLabCoverageProblem(req(), ans({ topics: [...answer.topics, { topic: 'inventato', coverage: 'gap', reason: 'x' }] }))).toMatch(/exactly one row/);
  });
  it('s8382 pagina senza versione o digest, gap senza motivo', () => {
    const cover = (pages: object[]) => PaperclipLabAnswerSchema.safeParse({ topics: [{ topic: 't', coverage: 'covered', pages }] }).success;
    expect(cover([{ slug: 'consegne', digest }])).toBe(false);
    expect(cover([{ slug: 'consegne', version: 3 }])).toBe(false);
    expect(cover([])).toBe(false);
    expect(PaperclipLabAnswerSchema.safeParse({ topics: [{ topic: 't', coverage: 'gap' }] }).success).toBe(false);
    expect(PaperclipLabAnswerSchema.safeParse({ topics: [{ topic: 't', coverage: 'gap', reason: '  ' }] }).success).toBe(false);
  });
  it('s8382 limiti: 21 topics, text over 500, blank, duplicates, missing recipient', () => {
    const topics = (list: string[]) => PaperclipLabRequestSchema.safeParse({ ...request, topics: list }).success;
    expect(topics(Array.from({ length: 20 }, (_, i) => `t${i}`))).toBe(true);
    expect(topics(Array.from({ length: 21 }, (_, i) => `t${i}`))).toBe(false);
    expect(topics(['x'.repeat(501)])).toBe(false);
    expect(topics([' '])).toBe(false);
    expect(topics([])).toBe(false);
    expect(topics(['a', 'a'])).toBe(false);
    expect(PaperclipLabRequestSchema.safeParse({ ...request, recipient: undefined }).success).toBe(false);
    expect(PaperclipLabRequestSchema.safeParse({ ...request, extra: 1 }).success).toBe(false);
    expect(PaperclipLabRequestSchema.safeParse({ ...request, why: 'x'.repeat(2001) }).success).toBe(false);
  });
  it('s8382 labReview: needs commentId; missing topics only for changes_requested', () => {
    expect(PaperclipLabReviewSchema.safeParse({ ...review, answerCommentId: undefined }).success).toBe(false);
    expect(PaperclipLabReviewSchema.safeParse({ ...review, missingTopics: undefined }).success).toBe(false);
    expect(PaperclipLabReviewSchema.safeParse({ ...review, missingTopics: [] }).success).toBe(false);
    expect(PaperclipLabReviewSchema.safeParse({ ...review, outcome: 'accepted' }).success).toBe(false);
    expect(PaperclipLabReviewSchema.safeParse({ ...review, outcome: 'accepted', missingTopics: undefined }).success).toBe(true);
  });
  it('s8382 review: labAnswer only done and alone; labReview keeps the parent in_progress with checkLater', () => {
    const check = { afterSeconds: 600, notes: 'Controllo la revisione.' };
    expect(nativeParse({ status: 'in_review', labAnswer: answer }).success).toBe(false);
    expect(nativeParse({ status: 'done', labAnswer: answer, resolution: { kind: 'answer', mode: 'response' } }).success).toBe(false);
    expect(nativeParse({ status: 'done', labAnswer: answer, ask: { roleRef: 'x', question: 'q' } }).success).toBe(false);
    expect(nativeParse({ status: 'in_progress', checkLater: check, labReview: review }).success).toBe(true);
    expect(nativeParse({ status: 'done', labReview: review }).success).toBe(false);
    expect(nativeParse({ status: 'in_progress', labReview: review }).success).toBe(false);
    expect(nativeParse({ status: 'in_progress', checkLater: check, labReview: review, labAnswer: answer }).success).toBe(false);
    expect(nativeParse({ status: 'in_progress', checkLater: check, labReview: review, resolution: { kind: 'answer', mode: 'response' } }).success).toBe(false);
  });
  it('s8382 record: duplicated, broken or absent blocks; reserved markers in free text', () => {
    const record = paperclipLabAnswerRecord(ans(answer));
    expect(parsePaperclipLabAnswerRecord('testo storico')).toBeUndefined();
    expect(() => parsePaperclipLabAnswerRecord(`${record}\n${record}`)).toThrow();
    expect(() => parsePaperclipLabAnswerRecord('```x9-lab-answer:v1\n{rotto\n```')).toThrow();
    expect(() => parsePaperclipLabAnswerRecord('x9-lab-answer:v1 senza blocco')).toThrow();
    expect(() => parsePaperclipLabAnswerRecord('```x9-lab-answer:v1\n{"topics":[]}\n```')).toThrow();
    expect(paperclipLabFreeTextProblem('x9-lab-review:v1')).toBeDefined();
    expect(paperclipLabFreeTextProblem('x9-lab-request:v1')).toBeDefined();
    expect(paperclipLabFreeTextProblem('testo normale')).toBeUndefined();
    expect(() => paperclipLabAnswerRecord(ans({ topics: [{ topic: 't', coverage: 'gap', reason: 'x9-lab-request:v1' }] }))).toThrow();
    // The request record never takes the requester or the parent from the contract alone.
    expect(() => paperclipLabRequestRecord({ ...req(), requesterAgentId: 'nope', parentIssueId: parent })).toThrow();
  });
  it('s8382 storici: create and review inputs without the new fields are unchanged', () => {
    const base = { title: 'Incarico', assigneeAgentId: assignee, parentIssueId: parent, waitForChild: true };
    expect(PaperclipNativeCreateIssueAgentInputSchema.parse(base)).toEqual(PaperclipLabNativeCreateIssueAgentInputSchema.parse(base));
    expect(PaperclipLabNativeCreateIssueAgentInputSchema.safeParse({ title: 'x', waitForChild: true, labRequest: request }).success).toBe(false);
    expect(PaperclipLabNativeCreateIssueAgentInputSchema.safeParse({ ...base, labRequest: request }).success).toBe(true);
    expect(PaperclipLabCreateIssueInputSchema.safeParse({ title: 'x', assigneeRoleRef: 'lab', labRequest: request }).success).toBe(true);
    expect(PaperclipLabCreateIssueInputSchema.safeParse({ title: 'x', labRequest: { ...request, topics: [] } }).success).toBe(false);
    expect(nativeParse({ status: 'done', comment: 'ok' }).success).toBe(true);
    expect(nativeParse({ status: 'done', comment: 'ok' }).data).not.toHaveProperty('labAnswer');
  });
});
