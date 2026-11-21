import { describe, expect, it } from 'vitest';
import {
  PaperclipDirectorResolutionSchema,
  PaperclipNativeReviewInputSchema,
  paperclipDirectorAnswerLines,
} from '../../../src/capability/paperclip/native-wait.js';

const issueId = '11111111-1111-4111-8111-111111111111';
const agent = '33333333-3333-4333-8333-333333333333';
const comment = 'Risposta del Director.';
const howToFix = { move: 'Riassegna a chi spetta.', who: 'director', tool: 'paperclip_assign_agent' } as const;
const notApproved = { outcome: 'not_approved', howToFix } as const;
const approved = { outcome: 'approved' } as const;
const fault = { kind: 'technical_fault', faultCode: 'assign_failed' } as const;
const parse = (extra: object) => PaperclipNativeReviewInputSchema.safeParse({ issueId, comment, ...extra });

describe('s8381 risoluzione-director', () => {
  it('s8381 regressione: GOO-318/319 a fault is told apart from an answer, with code and move', () => {
    expect(parse({ status: 'in_review', resolution: fault, answer: notApproved }).success).toBe(true);
    expect(parse({ status: 'done', resolution: { kind: 'answer', mode: 'response' }, answer: notApproved }).success).toBe(true);
    expect(parse({ status: 'done', resolution: { kind: 'answer', mode: 'clearance' }, answer: approved }).success).toBe(true);
    expect(parse({ status: 'in_review', resolution: { kind: 'reroute', assigneeAgentId: agent }, answer: notApproved }).success).toBe(true);
    // A fault cannot be closed as answered.
    expect(parse({ status: 'done', resolution: fault, answer: notApproved }).success).toBe(false);
    // The 4b form stays valid and unchanged.
    expect(parse({ status: 'done', answer: notApproved }).success).toBe(true);
    expect(parse({ status: 'done' }).success).toBe(true);
    expect(paperclipDirectorAnswerLines(notApproved)).toBe(
      'Esito: non approvato.\nCome correggere: Riassegna a chi spetta. (chi: il Director; strumento: paperclip_assign_agent).');
  });

  it('s8381 resolution without answer is refused', () => {
    expect(parse({ status: 'in_review', resolution: fault }).success).toBe(false);
    expect(parse({ status: 'done', resolution: { kind: 'answer', mode: 'response' } }).success).toBe(false);
  });

  it('s8381 fault code empty or too long is refused', () => {
    expect(PaperclipDirectorResolutionSchema.safeParse({ kind: 'technical_fault', faultCode: '' }).success).toBe(false);
    expect(PaperclipDirectorResolutionSchema.safeParse({ kind: 'technical_fault', faultCode: 'x'.repeat(121) }).success).toBe(false);
    expect(PaperclipDirectorResolutionSchema.safeParse({ kind: 'technical_fault', faultCode: 'x'.repeat(120) }).success).toBe(true);
  });

  it('s8381 reroute by role or a non-id is refused; mixed branches are refused', () => {
    expect(PaperclipDirectorResolutionSchema.safeParse({ kind: 'reroute', assigneeRoleRef: 'cfo' }).success).toBe(false);
    expect(PaperclipDirectorResolutionSchema.safeParse({ kind: 'reroute', assigneeAgentId: 'cfo' }).success).toBe(false);
    expect(PaperclipDirectorResolutionSchema.safeParse({ kind: 'reroute', assigneeAgentId: agent, faultCode: 'x' }).success).toBe(false);
    expect(PaperclipDirectorResolutionSchema.safeParse({ kind: 'answer', mode: 'other' }).success).toBe(false);
  });

  it('s8381 clearance needs an approved answer; response needs a comment', () => {
    expect(parse({ status: 'done', resolution: { kind: 'answer', mode: 'clearance' }, answer: notApproved }).success).toBe(false);
    expect(parse({ status: 'done', comment: undefined, resolution: { kind: 'answer', mode: 'response' }, answer: approved }).success).toBe(false);
    expect(parse({ status: 'done', comment: '', resolution: { kind: 'answer', mode: 'response' }, answer: approved }).success).toBe(false);
  });

  it('s8381 incoherent status and waits are refused', () => {
    const r = { kind: 'answer', mode: 'response' } as const;
    expect(parse({ status: 'in_review', resolution: r, answer: approved }).success).toBe(false);
    expect(parse({ status: 'done', resolution: { kind: 'reroute', assigneeAgentId: agent }, answer: notApproved }).success).toBe(false);
    expect(parse({ status: 'blocked', resolution: fault, answer: notApproved, blockedByIssueIds: [issueId.replace('1', '2')] }).success).toBe(false);
    expect(parse({ status: 'in_review', resolution: fault, answer: notApproved, waitingFor: { kind: 'external', what: 'x' } }).success).toBe(false);
    expect(parse({ status: 'in_review', resolution: fault, answer: notApproved, ask: { roleRef: 'cfo', question: 'ok?' } }).success).toBe(false);
  });

  it('s8381 reroute and fault with an approved answer are refused; no comment is refused', () => {
    expect(parse({ status: 'in_review', resolution: fault, answer: approved }).success).toBe(false);
    expect(parse({ status: 'in_review', resolution: { kind: 'reroute', assigneeAgentId: agent }, answer: approved }).success).toBe(false);
    expect(parse({ status: 'in_review', comment: undefined, resolution: fault, answer: notApproved }).success).toBe(false);
  });

  it('s8381 with a resolution a negative answer needs a non-empty tool', () => {
    const noTool = { outcome: 'not_approved', howToFix: { move: 'Riassegna.', who: 'director' } };
    expect(parse({ status: 'in_review', resolution: fault, answer: noTool }).success).toBe(false);
    expect(parse({ status: 'in_review', resolution: fault, answer: { outcome: 'not_approved', howToFix: { ...howToFix, tool: '' } } }).success).toBe(false);
    // Without resolution the 4b answer keeps its optional tool.
    expect(parse({ status: 'done', answer: noTool }).success).toBe(true);
  });
});
