import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_ASK_DECLARED_CHOICES, PAPERCLIP_ASK_QUESTION_MAX, PAPERCLIP_ASK_REFUSALS, PAPERCLIP_ASK_TARGETS,
  PAPERCLIP_CONFIRMATION_OUTCOMES, PAPERCLIP_CONTINUATION_POLICIES, PAPERCLIP_INTERACTION_CREATABLE_KINDS,
  PAPERCLIP_INTERACTION_KINDS, PAPERCLIP_INTERACTION_STATUSES, PAPERCLIP_QUESTION_EXPIRATION_REASONS,
  PAPERCLIP_QUESTION_OUTCOMES, PAPERCLIP_RESOLVER_POLICIES, PAPERCLIP_RESOLVER_POLICY_ALIASES,
  PaperclipAddressedAskSchema, PaperclipAskInteractionBodySchema, PaperclipAskPersonInteractionBodySchema,
  PaperclipConfermaConPoliticheCorpoSchema, PaperclipConfirmationResultSchema, PaperclipContinuationPolicySchema,
  PaperclipInteractionReadSchema, PaperclipNativeAssignAgentInputSchema, PaperclipNativeAssignAgentRefInputSchema,
  PaperclipNativeAssignInputSchema, PaperclipNativeCreateIssueAgentInputSchema, PaperclipNativeCreateIssueInputSchema,
  PaperclipNativeReviewAddressedInputSchema, PaperclipNativeReviewInputSchema, PaperclipQuestionResultSchema,
  PaperclipResolverPolicyReadSchema, PaperclipResolverPolicySchema, decidePaperclipAsk, paperclipAskIdempotencyKey,
  paperclipAskInteractionBody, paperclipAskPersonIdempotencyKey, paperclipAskPersonInteractionBody,
  paperclipNormalizeResolverPolicy,
} from '../src/capability/paperclip/index.js';
import { PaperclipConfermaCorpoSchema } from '../src/capability/paperclip-protocollo/wire-scritture.js';

const ISSUE = '3f1c2a54-7d3e-4b8a-9c1d-5e6f7a8b9c0d';
const OTHER_ISSUE = '4a2d3b65-8e4f-4c9b-8d2e-6f708192a3b4';
const PARENT = '5b3e4c76-9f50-4dac-9e3f-70819203b4c5';
const CARD = '6c4f5d87-a061-4ebd-8f40-8192a3b4c5d6';
const AGENT = '7d506e98-b172-4fce-9051-92a3b4c5d6e7';
const SELF = '8e617fa9-c283-40df-a162-a3b4c5d6e7f8';
const REVISION = '9f7280ba-d394-41e0-b273-b4c5d6e7f809';
const CHECK = { afterSeconds: 60, notes: 'controllo del lavoro asincrono' };

const agentAsk = { to: 'agent', addresseeAgentId: AGENT, question: 'Quale tono usiamo?' };
const personAsk = { to: 'person', question: 'Approvi il budget?' };
const review = (extra: Record<string, unknown>) => ({ issueId: ISSUE, status: 'in_review', ...extra });

describe('PC-14 domanda indirizzata per id', () => {
  it('s7412_vocabolari_chiusi', () => {
    expect(PAPERCLIP_INTERACTION_KINDS).toEqual([
      'suggest_tasks', 'ask_user_questions', 'request_confirmation', 'request_checkbox_confirmation', 'request_item_verdicts', 'connection_intent',
    ]);
    expect(PAPERCLIP_INTERACTION_CREATABLE_KINDS).toEqual([
      'suggest_tasks', 'ask_user_questions', 'request_confirmation', 'request_checkbox_confirmation', 'request_item_verdicts',
    ]);
    expect(PAPERCLIP_INTERACTION_CREATABLE_KINDS).not.toContain('connection_intent');
    expect(PAPERCLIP_INTERACTION_STATUSES).toEqual(['pending', 'accepted', 'rejected', 'answered', 'cancelled', 'expired', 'failed']);
    expect(PAPERCLIP_CONTINUATION_POLICIES).toEqual(['none', 'wake_assignee', 'wake_assignee_on_accept']);
    expect(PAPERCLIP_RESOLVER_POLICIES).toEqual(['anyone', 'not_creator', 'human_only']);
    expect(PAPERCLIP_RESOLVER_POLICY_ALIASES).toEqual(['board_or_agents', 'board_only']);
    expect(PAPERCLIP_QUESTION_OUTCOMES).toEqual(['skipped', 'withdrawn', 'issue_closed', 'addressee_deleted']);
    expect(PAPERCLIP_QUESTION_EXPIRATION_REASONS).toEqual(['superseded_by_comment', 'superseded_by_newer_interaction']);
    expect(PAPERCLIP_CONFIRMATION_OUTCOMES).toEqual([
      'accepted', 'rejected', 'superseded_by_comment', 'superseded_by_newer_request', 'stale_target', 'skipped', 'withdrawn', 'issue_closed',
      'addressee_deleted',
    ]);
    expect(PAPERCLIP_ASK_TARGETS).toEqual(['agent', 'person']);
  });

  it('s7412_politica_scritta_canonica', () => {
    for (const policy of PAPERCLIP_RESOLVER_POLICIES) expect(PaperclipResolverPolicySchema.safeParse(policy).success).toBe(true);
    for (const policy of ['board_only', 'board_or_agents', 'everyone', 'Human_Only']) {
      expect(PaperclipResolverPolicySchema.safeParse(policy).success).toBe(false);
    }
    const alias = PaperclipResolverPolicyReadSchema.parse('board_or_agents');
    expect(paperclipNormalizeResolverPolicy(alias)).toBe('anyone');
    expect(paperclipNormalizeResolverPolicy(PaperclipResolverPolicyReadSchema.parse('board_only'))).toBe('human_only');
    for (const policy of PAPERCLIP_RESOLVER_POLICIES) {
      expect(paperclipNormalizeResolverPolicy(PaperclipResolverPolicyReadSchema.parse(policy))).toBe(policy);
    }
    expect(PaperclipResolverPolicyReadSchema.safeParse('everyone').success).toBe(false);
    expect(PaperclipContinuationPolicySchema.safeParse('wake_origin_agent').success).toBe(false);
    expect(PaperclipContinuationPolicySchema.safeParse('wake_assignee_on_accept').success).toBe(true);
  });

  it('s7412_carta_letta_chiusa', () => {
    const card = { id: CARD, kind: 'ask_user_questions', status: 'pending', addresseeAgentId: AGENT, payload: { extra: true }, createdAt: 'x' };
    expect(PaperclipInteractionReadSchema.safeParse(card).success).toBe(true);
    expect(PaperclipInteractionReadSchema.safeParse({ ...card, addresseeAgentId: null }).success).toBe(true);
    const { addresseeAgentId: _omitted, ...senzaIndirizzato } = card;
    expect(PaperclipInteractionReadSchema.safeParse(senzaIndirizzato).success).toBe(true);
    expect(PaperclipInteractionReadSchema.safeParse({ ...card, kind: 'free_text' }).success).toBe(false);
    expect(PaperclipInteractionReadSchema.safeParse({ ...card, status: 'done' }).success).toBe(false);
    expect(PaperclipInteractionReadSchema.safeParse({ ...card, id: 'non-un-guid' }).success).toBe(false);
    expect(PaperclipInteractionReadSchema.safeParse({ ...card, addresseeAgentId: 'rd-lab' }).success).toBe(false);
    for (const kind of PAPERCLIP_INTERACTION_KINDS) expect(PaperclipInteractionReadSchema.safeParse({ ...card, kind }).success).toBe(true);
    for (const status of PAPERCLIP_INTERACTION_STATUSES) expect(PaperclipInteractionReadSchema.safeParse({ ...card, status }).success).toBe(true);

    expect(PaperclipQuestionResultSchema.safeParse({ outcome: 'issue_closed', other: 1 }).success).toBe(true);
    expect(PaperclipQuestionResultSchema.safeParse({ expirationReason: 'superseded_by_comment' }).success).toBe(true);
    expect(PaperclipQuestionResultSchema.safeParse({ outcome: 'accepted' }).success).toBe(false);
    expect(PaperclipQuestionResultSchema.safeParse({ expirationReason: 'tired' }).success).toBe(false);
    for (const outcome of PAPERCLIP_CONFIRMATION_OUTCOMES) expect(PaperclipConfirmationResultSchema.safeParse({ outcome }).success).toBe(true);
    expect(PaperclipConfirmationResultSchema.safeParse({ outcome: 'answered' }).success).toBe(false);
    expect(PaperclipConfirmationResultSchema.safeParse({}).success).toBe(false);
  });

  it('s7412_domanda_per_id_o_persona', () => {
    expect(PaperclipAddressedAskSchema.safeParse(agentAsk).success).toBe(true);
    expect(PaperclipAddressedAskSchema.safeParse(personAsk).success).toBe(true);
    expect(PaperclipAddressedAskSchema.safeParse({ roleRef: 'director', question: 'Ciao?' }).success).toBe(false);
    expect(PaperclipAddressedAskSchema.safeParse({ to: 'agent', question: 'Ciao?' }).success).toBe(false);
    expect(PaperclipAddressedAskSchema.safeParse({ ...agentAsk, addresseeAgentId: 'director' }).success).toBe(false);
    expect(PaperclipAddressedAskSchema.safeParse({ ...personAsk, addresseeAgentId: AGENT }).success).toBe(false);
    expect(PaperclipAddressedAskSchema.safeParse({ ...personAsk, addresseeUserId: 'u-1' }).success).toBe(false);
    expect(PaperclipAddressedAskSchema.safeParse({ ...agentAsk, to: 'manager' }).success).toBe(false);
    expect(PaperclipAddressedAskSchema.safeParse({ ...agentAsk, question: '' }).success).toBe(false);
    expect(PaperclipAddressedAskSchema.safeParse({ ...agentAsk, question: ' '.repeat(5) }).success).toBe(false);
    expect(PaperclipAddressedAskSchema.safeParse({ ...agentAsk, question: 'a'.repeat(2001) }).success).toBe(false);
    expect(PaperclipAddressedAskSchema.safeParse({ ...agentAsk, question: 'a'.repeat(2000) }).success).toBe(true);
  });

  it('s7412_review_con_domanda_tiene_le_regole', () => {
    for (const ask of [agentAsk, personAsk]) {
      expect(PaperclipNativeReviewAddressedInputSchema.safeParse(review({ ask })).success).toBe(true);
      for (const status of ['done', 'blocked', 'in_progress']) {
        expect(PaperclipNativeReviewAddressedInputSchema.safeParse(review({ ask, status })).success).toBe(false);
      }
      expect(PaperclipNativeReviewAddressedInputSchema.safeParse(review({ ask, blockedByIssueIds: [OTHER_ISSUE] })).success).toBe(false);
      expect(PaperclipNativeReviewAddressedInputSchema.safeParse(review({ ask, waitingFor: { action: 'x', unblockedBy: 'self' } })).success).toBe(false);
      expect(PaperclipNativeReviewAddressedInputSchema.safeParse(review({ ask, checkLater: CHECK })).success).toBe(false);
    }
    // Le regole di oggi restano.
    expect(PaperclipNativeReviewAddressedInputSchema.safeParse(review({ status: 'blocked', blockedByIssueIds: [OTHER_ISSUE] })).success).toBe(true);
    expect(PaperclipNativeReviewAddressedInputSchema.safeParse(review({ status: 'blocked', blockedByIssueIds: [ISSUE] })).success).toBe(false);
    expect(PaperclipNativeReviewAddressedInputSchema.safeParse(review({ status: 'in_progress', checkLater: CHECK })).success).toBe(true);
    expect(PaperclipNativeReviewAddressedInputSchema.safeParse(review({ status: 'in_progress' })).success).toBe(false);
    expect(PaperclipNativeReviewAddressedInputSchema.safeParse(review({ status: 'in_review', checkLater: CHECK })).success).toBe(false);
    expect(PaperclipNativeReviewAddressedInputSchema.safeParse(review({ blockedByIssueIds: [OTHER_ISSUE] })).success).toBe(false);
  });

  it('s7412_review_vecchia_invariata', () => {
    const vecchia = review({ ask: { roleRef: 'director', question: 'Quale tono usiamo?' } });
    expect(PaperclipNativeReviewInputSchema.safeParse(vecchia).success).toBe(true);
    expect(PaperclipNativeReviewAddressedInputSchema.safeParse(vecchia).success).toBe(false);
    expect(PaperclipNativeReviewInputSchema.safeParse(review({ ask: agentAsk })).success).toBe(false);
    expect(PaperclipNativeReviewInputSchema.safeParse(review({ ask: personAsk })).success).toBe(false);
    // Le regole della forma vecchia non cambiano.
    expect(PaperclipNativeReviewInputSchema.safeParse(review({ ask: { roleRef: 'director', question: 'q' }, status: 'done' })).success).toBe(false);
    expect(PaperclipNativeReviewInputSchema.safeParse(review({ status: 'blocked', blockedByIssueIds: [ISSUE] })).success).toBe(false);
    expect(PaperclipNativeReviewInputSchema.safeParse(review({ status: 'in_progress', checkLater: CHECK })).success).toBe(true);
  });

  it('s7412_assegna_e_crea_per_id_nelle_forme_native', () => {
    const assign = { issueId: ISSUE, assigneeAgentId: AGENT };
    expect(PaperclipNativeAssignAgentInputSchema.safeParse(assign).success).toBe(true);
    expect(PaperclipNativeAssignAgentInputSchema.safeParse({ ...assign, answersInteractionId: CARD }).success).toBe(false);
    expect(PaperclipNativeAssignAgentInputSchema.safeParse({ ...assign, answersInteractionId: CARD, comment: 'La risposta' }).success).toBe(true);
    expect(PaperclipNativeAssignAgentInputSchema.safeParse({ issueId: ISSUE, assigneeRoleRef: 'director' }).success).toBe(false);
    expect(PaperclipNativeAssignAgentInputSchema.safeParse({ ...assign, assigneeRoleRef: 'director' }).success).toBe(false);
    expect(PaperclipNativeAssignAgentRefInputSchema.safeParse({ ...assign, answersInteractionId: CARD }).success).toBe(false);
    expect(PaperclipNativeAssignAgentRefInputSchema.safeParse({ ...assign, answersInteractionId: CARD, comment: 'La risposta' }).success).toBe(true);
    expect(PaperclipNativeAssignInputSchema.safeParse({ issueId: ISSUE, roleRef: 'director' }).success).toBe(true);

    const child = { title: 'Figlio', description: 'Da fare', waitForChild: true };
    expect(PaperclipNativeCreateIssueAgentInputSchema.safeParse({ ...child, parentIssueId: PARENT, assigneeAgentId: AGENT }).success).toBe(true);
    expect(PaperclipNativeCreateIssueAgentInputSchema.safeParse({ ...child, assigneeAgentId: AGENT }).success).toBe(false);
    expect(PaperclipNativeCreateIssueAgentInputSchema.safeParse({ ...child, parentIssueId: PARENT }).success).toBe(false);
    expect(PaperclipNativeCreateIssueAgentInputSchema.safeParse({ ...child, parentIssueId: PARENT, assigneeRoleRef: 'director' }).success).toBe(false);
    expect(PaperclipNativeCreateIssueAgentInputSchema.safeParse({ ...child, waitForChild: false }).success).toBe(true);
    // La forma vecchia resta.
    expect(PaperclipNativeCreateIssueInputSchema.safeParse({ ...child, parentIssueId: PARENT, assigneeRoleRef: 'director' }).success).toBe(true);
    expect(PaperclipNativeCreateIssueInputSchema.safeParse({ ...child, parentIssueId: PARENT }).success).toBe(false);
  });

  it('s7412_agente_non_si_indirizza', () => {
    expect(PAPERCLIP_ASK_REFUSALS).toEqual(['ask_to_self']);
    const verso = (id: string) => PaperclipAddressedAskSchema.parse({ ...agentAsk, addresseeAgentId: id });
    expect(decidePaperclipAsk(SELF, verso(SELF))).toEqual({ ok: false, refusal: 'ask_to_self' });
    expect(decidePaperclipAsk(SELF, verso(AGENT))).toEqual({ ok: true });
    expect(decidePaperclipAsk(SELF, PaperclipAddressedAskSchema.parse(personAsk))).toEqual({ ok: true });
  });

  it('s7412_domanda_a_persona_human_only', () => {
    const key = paperclipAskPersonIdempotencyKey(ISSUE, 'call-1');
    const body = paperclipAskPersonInteractionBody({ question: 'Approvi il budget?', idempotencyKey: key });
    expect(body.resolverPolicy).toBe('human_only');
    expect(body.continuationPolicy).toBe('wake_assignee');
    expect(body.kind).toBe('ask_user_questions');
    expect('addresseeAgentId' in body).toBe(false);
    expect('title' in body).toBe(false);
    expect(paperclipAskPersonInteractionBody({ question: 'q', idempotencyKey: key, title: 'Budget' }).title).toBe('Budget');

    for (const mutate of [
      { resolverPolicy: 'anyone' }, { resolverPolicy: 'board_only' }, { resolverPolicy: undefined }, { continuationPolicy: 'none' },
      { addresseeAgentId: AGENT }, { kind: 'request_confirmation' },
    ]) {
      expect(PaperclipAskPersonInteractionBodySchema.safeParse({ ...body, ...mutate }).success).toBe(false);
    }
    const due = { ...body, payload: { ...body.payload, questions: [{ ...body.payload.questions[0], prompt: 'Un altro testo' }] } };
    expect(PaperclipAskPersonInteractionBodySchema.safeParse(due).success).toBe(false);

    const callId255 = 'c'.repeat(255 - `ask-person:${ISSUE}:`.length);
    expect(paperclipAskPersonIdempotencyKey(ISSUE, callId255)).toHaveLength(255);
    expect(() => paperclipAskPersonIdempotencyKey(ISSUE, `${callId255}c`)).toThrow();
    expect(key.startsWith('ask-person:')).toBe(true);
    expect(key).not.toBe(paperclipAskIdempotencyKey(ISSUE, 'call-1'));
    expect(key.startsWith('ask:')).toBe(false);
  });

  it('s7412_domanda_a_agente_senza_politica', () => {
    const body = paperclipAskInteractionBody({
      question: 'Quale tono usiamo?', addresseeAgentId: AGENT, idempotencyKey: paperclipAskIdempotencyKey(ISSUE, 'call-1'),
    });
    expect('resolverPolicy' in body).toBe(false);
    expect(body.addresseeAgentId).toBe(AGENT);
    expect(PaperclipAskInteractionBodySchema.safeParse({ ...body, resolverPolicy: 'human_only' }).success).toBe(false);
    expect(PaperclipAskInteractionBodySchema.safeParse(body).success).toBe(true);
    const due = { ...body, payload: { ...body.payload, questions: [{ ...body.payload.questions[0], prompt: 'Un altro testo' }] } };
    expect(PaperclipAskInteractionBodySchema.safeParse(due).success).toBe(false);
  });

  it('s7412_conferma_con_politiche', () => {
    const oggi = { kind: 'request_confirmation', payload: { version: 1, prompt: 'Confermi il piano?', target: { type: 'issue_document', key: 'plan', revisionId: REVISION } } };
    expect(PaperclipConfermaConPoliticheCorpoSchema.parse(oggi)).toEqual(PaperclipConfermaCorpoSchema.parse(oggi));
    expect(Object.keys(PaperclipConfermaConPoliticheCorpoSchema.parse(oggi)).sort()).toEqual(['kind', 'payload']);

    const withPolicies = { ...oggi, resolverPolicy: 'human_only', continuationPolicy: 'wake_assignee_on_accept' };
    expect(PaperclipConfermaConPoliticheCorpoSchema.parse(withPolicies)).toMatchObject({ resolverPolicy: 'human_only', continuationPolicy: 'wake_assignee_on_accept' });
    expect(PaperclipConfermaConPoliticheCorpoSchema.safeParse({ ...oggi, continuationPolicy: 'wake_assignee' }).success).toBe(true);
    expect(PaperclipConfermaConPoliticheCorpoSchema.safeParse({ ...oggi, resolverPolicy: 'anyone' }).success).toBe(true);
    expect(PaperclipConfermaConPoliticheCorpoSchema.safeParse({ ...oggi, continuationPolicy: 'wake_origin_agent' }).success).toBe(false);
    expect(PaperclipConfermaConPoliticheCorpoSchema.safeParse({ ...oggi, resolverPolicy: 'board_only' }).success).toBe(false);
    expect(PaperclipConfermaConPoliticheCorpoSchema.safeParse({ ...oggi, toolAction: 'x' }).success).toBe(false);
    expect(PaperclipConfermaConPoliticheCorpoSchema.safeParse({
      ...oggi, payload: { ...oggi.payload, target: { ...oggi.payload.target, key: 'other' } },
    }).success).toBe(false);
    expect(PaperclipConfermaCorpoSchema.safeParse(withPolicies).success).toBe(false);
  });

  it('s7412_restrizioni_dichiarate', () => {
    expect(PAPERCLIP_ASK_DECLARED_CHOICES).toEqual({
      questionsPerCard: { ours: 1, paperclip: 64 }, promptMax: { ours: 2000, paperclip: 4000 },
    });
    expect(PAPERCLIP_ASK_DECLARED_CHOICES.promptMax.ours).toBe(PAPERCLIP_ASK_QUESTION_MAX);

    const build = (question: string) => paperclipAskInteractionBody({ question, addresseeAgentId: AGENT, idempotencyKey: 'k' });
    expect(build('a'.repeat(PAPERCLIP_ASK_DECLARED_CHOICES.promptMax.ours)).payload.questions[0].prompt).toHaveLength(2000);
    expect(() => build('a'.repeat(PAPERCLIP_ASK_DECLARED_CHOICES.promptMax.ours + 1))).toThrow();
    expect(() => paperclipAskPersonInteractionBody({ question: 'a'.repeat(2001), idempotencyKey: 'k' })).toThrow();

    const body = build('Una domanda');
    const second = { ...body.payload.questionSet.questions[0], id: 'second' };
    const twoInSet = { ...body, payload: { ...body.payload, questionSet: { ...body.payload.questionSet, questions: [body.payload.questionSet.questions[0], second] } } };
    expect(PaperclipAskInteractionBodySchema.safeParse(twoInSet).success).toBe(false);
    const secondView = { ...body.payload.questions[0], id: 'second' };
    const twoViews = { ...body, payload: { ...body.payload, questions: [body.payload.questions[0], secondView] } };
    expect(PaperclipAskInteractionBodySchema.safeParse(twoViews).success).toBe(false);
    const personTwo = { ...paperclipAskPersonInteractionBody({ question: 'q', idempotencyKey: 'k' }) };
    const personTwoViews = { ...personTwo, payload: { ...personTwo.payload, questions: [personTwo.payload.questions[0], secondView] } };
    expect(PaperclipAskPersonInteractionBodySchema.safeParse(personTwoViews).success).toBe(false);
  });
});
