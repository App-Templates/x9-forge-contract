import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  SOCIAL_ADOPTION_KINDS,
  SOCIAL_ADOPTION_STATES,
  SOCIAL_ADOPTION_TOOLS,
  SocialAdoptionKindSchema,
  SocialAdoptionStateSchema,
  SocialAdoptionProposalSchema,
  SocialAdoptionProposeInputSchema,
  SocialAdoptionProposeOutputSchema,
  SocialAdoptionListInputSchema,
  SocialAdoptionListOutputSchema,
  SocialAdoptionDecideInputSchema,
  SocialAdoptionDecideOutputSchema,
  SocialAdoptionToolErrorSchema,
  socialAdoptionDecision,
} from '../../../src/capability/social-listening/save-wiki.js';

const proposal = {
  identity: { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' },
  proposalId: 'proposal-1',
  topicId: 'cluster-1',
  kind: 'rule',
  text: 'Require a cited source before adopting a new rule.',
  state: 'proposed',
  proposedAt: '2026-11-19T08:00:00Z',
} as const;
const decidedAt = '2026-11-19T10:00:00+01:00';
const adopted = { ...proposal, state: 'adopted', decidedBy: 'owner', decidedAt } as const;
const decisionInput = { proposalId: proposal.proposalId, decision: 'adopted' } as const;
const proposeInput = { topicId: proposal.topicId, kind: proposal.kind, text: proposal.text };

describe('social adoption', () => {
  it('(a) requires decision metadata exactly for decided proposals', () => {
    expect(SocialAdoptionProposalSchema.parse(proposal)).toEqual(proposal);
    for (const state of ['adopted', 'rejected'] as const) {
      expect(SocialAdoptionProposalSchema.parse({ ...adopted, state })).toEqual({ ...adopted, state });
      for (const metadata of [{}, { decidedBy: 'owner' }, { decidedAt }]) {
        expect(SocialAdoptionProposalSchema.safeParse({ ...proposal, state, ...metadata }).success).toBe(false);
      }
    }
    for (const metadata of [{ decidedBy: 'owner' }, { decidedAt }, { decidedBy: 'owner', decidedAt }]) {
      expect(SocialAdoptionProposalSchema.safeParse({ ...proposal, ...metadata }).success).toBe(false);
    }
  });

  it('(a) validates scoped persisted rows, limits and timestamps', () => {
    for (const kind of ['rule', 'mod', 'skill'] as const) {
      expect(SocialAdoptionProposalSchema.safeParse({ ...proposal, kind }).success).toBe(true);
    }
    expect(SocialAdoptionProposalSchema.parse({ ...proposal, text: '  A cited rule.  ' }).text).toBe('A cited rule.');
    expect(SocialAdoptionProposalSchema.safeParse({
      ...proposal, proposalId: 'p'.repeat(100), topicId: 't'.repeat(100), text: 'x'.repeat(2000),
    }).success).toBe(true);
    for (const invalid of [
      { ...proposal, identity: { ownerId: 'owner-1', agentId: 'x9' } },
      { ...proposal, identity: { ...proposal.identity, tenantId: '' } },
      { ...proposal, identity: { ...proposal.identity, role: 'owner' } },
      { ...proposal, proposalId: '' },
      { ...proposal, proposalId: 'p'.repeat(101) },
      { ...proposal, topicId: '' },
      { ...proposal, topicId: 't'.repeat(101) },
      { ...proposal, kind: 'plugin' },
      { ...proposal, state: 'pending' },
      { ...proposal, text: ' \n ' },
      { ...proposal, text: 'x'.repeat(2001) },
      { ...proposal, proposedAt: '2026-02-30T08:00:00Z' },
      { ...adopted, decidedAt: 'not-a-date' },
      { ...adopted, decidedBy: 'admin' },
      { ...proposal, role: 'owner' },
    ]) {
      expect(SocialAdoptionProposalSchema.safeParse(invalid).success).toBe(false);
    }
  });

  it('(b) lets owner and superadmin adopt or reject without changing the original row', () => {
    for (const actorRole of ['owner', 'superadmin'] as const) {
      for (const decision of ['adopted', 'rejected'] as const) {
        const result = socialAdoptionDecision({ proposal, actorRole, decision, decidedAt });
        expect(result).toEqual({ ok: true, proposal: { ...proposal, state: decision, decidedBy: actorRole, decidedAt } });
        if (!result.ok) throw new Error('expected an authorized decision');
        expect(SocialAdoptionProposalSchema.safeParse(result.proposal).success).toBe(true);
        expect(result.proposal).not.toBe(proposal);
      }
    }
    expect(proposal.state).toBe('proposed');
    expect(proposal).not.toHaveProperty('decidedBy');
    expect(proposal).not.toHaveProperty('decidedAt');
  });

  it('(c) refuses other roles and never decides an already decided proposal again', () => {
    for (const actorRole of ['member', 'admin', '', null, undefined]) {
      expect(socialAdoptionDecision({ proposal, actorRole, decision: 'adopted', decidedAt }))
        .toEqual({ ok: false, error: 'not_allowed' });
    }
    for (const state of ['adopted', 'rejected'] as const) {
      for (const decision of ['adopted', 'rejected'] as const) {
        expect(socialAdoptionDecision({ proposal: { ...adopted, state }, actorRole: 'superadmin', decision, decidedAt }))
          .toEqual({ ok: false, error: 'already_decided' });
      }
    }
    expect(socialAdoptionDecision({ proposal: adopted, actorRole: 'member', decision: 'rejected', decidedAt }))
      .toEqual({ ok: false, error: 'not_allowed' });
  });

  it('(d) rejects role or identity injection in every tool input', () => {
    expect(SocialAdoptionProposeInputSchema.parse(proposeInput)).toEqual(proposeInput);
    expect(SocialAdoptionListInputSchema.parse({})).toEqual({});
    expect(SocialAdoptionListInputSchema.parse({ state: 'proposed' })).toEqual({ state: 'proposed' });
    expect(SocialAdoptionDecideInputSchema.parse(decisionInput)).toEqual(decisionInput);
    for (const injected of [{ role: 'owner' }, { actorRole: 'owner' }, { identity: proposal.identity }]) {
      expect(SocialAdoptionProposeInputSchema.safeParse({ ...proposeInput, ...injected }).success).toBe(false);
      expect(SocialAdoptionListInputSchema.safeParse(injected).success).toBe(false);
      expect(SocialAdoptionDecideInputSchema.safeParse({ ...decisionInput, ...injected }).success).toBe(false);
    }
    expect(SocialAdoptionProposeInputSchema.safeParse({ ...proposeInput, kind: 'plugin' }).success).toBe(false);
    expect(SocialAdoptionProposeInputSchema.safeParse({ ...proposeInput, text: '' }).success).toBe(false);
    expect(SocialAdoptionProposeInputSchema.safeParse({ ...proposeInput, text: ' \n ' }).success).toBe(false);
    expect(SocialAdoptionListInputSchema.safeParse({ state: 'pending' }).success).toBe(false);
    expect(SocialAdoptionDecideInputSchema.safeParse({ ...decisionInput, decision: 'proposed' }).success).toBe(false);
    expect(SocialAdoptionDecideInputSchema.safeParse({ ...decisionInput, proposalId: '' }).success).toBe(false);
  });

  it('(d) validates proposal outputs and caps the list at 100 rows', () => {
    expect(SocialAdoptionProposeOutputSchema.parse({ proposal })).toEqual({ proposal });
    expect(SocialAdoptionDecideOutputSchema.parse({ proposal: adopted })).toEqual({ proposal: adopted });
    expect(SocialAdoptionListOutputSchema.parse({ proposals: [] })).toEqual({ proposals: [] });
    const proposals = Array.from({ length: 100 }, (_, i) => ({ ...proposal, proposalId: `proposal-${i}` }));
    expect(SocialAdoptionListOutputSchema.parse({ proposals }).proposals).toHaveLength(100);
    expect(SocialAdoptionListOutputSchema.safeParse({ proposals: [...proposals, proposal] }).success).toBe(false);
    expect(SocialAdoptionListOutputSchema.safeParse({ proposals: [{ ...adopted, decidedAt: undefined }] }).success).toBe(false);
    expect(SocialAdoptionProposeOutputSchema.safeParse({ proposal, extra: true }).success).toBe(false);
    expect(SocialAdoptionDecideOutputSchema.safeParse({ proposal: adopted, extra: true }).success).toBe(false);
    expect(SocialAdoptionListOutputSchema.safeParse({ proposals: [], extra: true }).success).toBe(false);
  });

  it('(e) exposes the adoption vocabulary, three tool names and error codes', () => {
    expect(SOCIAL_ADOPTION_KINDS).toEqual(['rule', 'mod', 'skill']);
    expect(SocialAdoptionKindSchema.options).toEqual(SOCIAL_ADOPTION_KINDS);
    expect(SOCIAL_ADOPTION_STATES).toEqual(['proposed', 'adopted', 'rejected']);
    expect(SocialAdoptionStateSchema.options).toEqual(SOCIAL_ADOPTION_STATES);
    expect(SOCIAL_ADOPTION_TOOLS).toEqual({
      propose: 'social_adoption_propose', list: 'social_adoption_list', decide: 'social_adoption_decide',
    });
    expect(SocialAdoptionToolErrorSchema.options).toEqual([
      'invalid_request', 'unknown_topic', 'unknown_proposal', 'not_allowed', 'already_decided',
    ]);
  });

  it('(e) returns invalid_input for malformed proposals, decisions and timestamps', () => {
    for (const invalid of [null, undefined, {}, { ...proposal, topicId: '' }, { ...proposal, decidedBy: 'owner' }]) {
      expect(socialAdoptionDecision({ proposal: invalid, actorRole: 'owner', decision: 'adopted', decidedAt }))
        .toEqual({ ok: false, error: 'invalid_input' });
    }
    for (const decision of ['proposed', 'invalid', null, undefined]) {
      expect(socialAdoptionDecision({ proposal, actorRole: 'owner', decision, decidedAt }))
        .toEqual({ ok: false, error: 'invalid_input' });
    }
    for (const timestamp of ['', '2026-02-30T08:00:00Z', null, undefined]) {
      expect(socialAdoptionDecision({ proposal, actorRole: 'owner', decision: 'adopted', decidedAt: timestamp }))
        .toEqual({ ok: false, error: 'invalid_input' });
    }
  });

  it('(e) catches throwing accessors on both the row and decision arguments', () => {
    for (const field of Object.keys(proposal)) {
      const unreadable = Object.defineProperty({ ...proposal }, field, {
        get() { throw new Error('unreadable proposal field'); },
      });
      expect(socialAdoptionDecision({ proposal: unreadable, actorRole: 'owner', decision: 'adopted', decidedAt }))
        .toEqual({ ok: false, error: 'invalid_input' });
    }
    const input = { proposal, actorRole: 'owner', decision: 'adopted', decidedAt };
    for (const field of Object.keys(input)) {
      const unreadable = Object.defineProperty({ ...input }, field, {
        get() { throw new Error('unreadable decision argument'); },
      });
      expect(socialAdoptionDecision(unreadable)).toEqual({ ok: false, error: 'invalid_input' });
    }
  });

  it('(f) reuses the shared editor role schema without inline role enums', () => {
    const source = readFileSync(new URL('../../../src/capability/social-listening/save-wiki.ts', import.meta.url), 'utf8');
    expect(source).not.toMatch(/z\.enum\(\s*\[\s*['"](?:superadmin|owner)['"]/);
    expect(source).toContain('CapabilityParameterEditorRoleSchema');
  });
});
