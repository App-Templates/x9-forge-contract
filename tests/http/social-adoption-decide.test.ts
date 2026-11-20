import { describe, expect, it } from 'vitest';
import {
  socialAdoptionDecideContract,
  SocialAdoptionDecideBodySchema,
  SocialAdoptionDecideErrorSchema,
} from '../../src/http/endpoints/internal-capability-agent';
import { SOCIAL_ADOPTION_TOOLS } from '../../src/capability/social-listening/save-wiki';

const scope = { tenantId: 't', ownerId: 'o', agentId: 'a' };
const body = { scope, actorRole: 'owner', input: { proposalId: 'p1', decision: 'adopted' } };

describe('s9761 decide-rotta', () => {
  it('s9761 (a) the contract is a secret POST on the adoption-decisions path', () => {
    expect(socialAdoptionDecideContract.method).toBe('POST');
    expect(socialAdoptionDecideContract.path).toBe('/internal/capability/agents/:agentId/adoption-decisions');
    expect(socialAdoptionDecideContract.authType).toBe('secret');
  });

  it('s9761 (b) the body carries a verified role restricted to owner/superadmin', () => {
    const ok = SocialAdoptionDecideBodySchema;
    expect(ok.safeParse(body).success).toBe(true);
    expect(ok.safeParse({ ...body, actorRole: 'superadmin', input: { proposalId: 'p1', decision: 'rejected' } }).success).toBe(true);
    expect(ok.safeParse({ ...body, actorRole: 'member' }).success).toBe(false);
    expect(ok.safeParse({ ...body, actorRole: 'admin' }).success).toBe(false);
    const { actorRole: _omit, ...noRole } = body;
    expect(ok.safeParse(noRole).success).toBe(false);
    expect(ok.safeParse({ ...body, input: { proposalId: 'p1', decision: 'proposed' } }).success).toBe(false);
    expect(ok.safeParse({ ...body, extra: 1 }).success).toBe(false);
    expect(ok.safeParse({ ...body, scope: { ownerId: 'o', agentId: 'a' } }).success).toBe(false);
  });

  it('s9761 (c) response and error schemas', () => {
    const base = {
      identity: scope, proposalId: 'p1', topicId: 'tp', kind: 'rule', text: 'x',
      proposedAt: '2026-11-20T10:00:00Z',
    };
    const res = socialAdoptionDecideContract.responseSchema;
    expect(res.safeParse({ proposal: { ...base, state: 'adopted', decidedBy: 'owner', decidedAt: '2026-11-20T11:00:00Z' } }).success).toBe(true);
    expect(res.safeParse({ proposal: { ...base, state: 'proposed', decidedBy: 'owner' } }).success).toBe(false);
    for (const error of ['not_allowed', 'already_decided', 'unknown_proposal']) {
      expect(SocialAdoptionDecideErrorSchema.safeParse({ error }).success).toBe(true);
    }
    expect(SocialAdoptionDecideErrorSchema.safeParse({ error: 'other' }).success).toBe(false);
  });

  it('s9761 (d) params reject an empty agentId', () => {
    expect(socialAdoptionDecideContract.paramsSchema.safeParse({ agentId: '' }).success).toBe(false);
    expect(socialAdoptionDecideContract.paramsSchema.safeParse({ agentId: 'a' }).success).toBe(true);
  });

  it('s9761 (e) the tool names are unchanged', () => {
    expect(Object.values(SOCIAL_ADOPTION_TOOLS)).toEqual(['social_adoption_propose', 'social_adoption_list', 'social_adoption_decide']);
  });
});
