import { expect, it } from 'vitest';
import { RagAuthorizedQueryContextSchema as Context, isRagAuthorizedContextCurrent as current } from '../src/rag/index.js';
import { fixtures as f } from './capability/meditation-contract-fixtures.js';
const c = f.RagAuthorizedQueryContext, a = f.RagCorpusAssignment, now = new Date(c.observed_at);
it('separates principal/person and keeps current scoped authorization', () => {
  expect(Context.safeParse(c).success).toBe(true); expect(current(c, a, a.identity, now)).toBe(true);
  expect(c.principal.principal_id).not.toBe(c.principal.person_id);
});
it.each(['tenant_id', 'owner_id', 'agent_id'])('refuses foreign %s', key => expect(current(c, a, { ...a.identity, [key]: 'foreign' }, now)).toBe(false));
it.each([{ state: 'revoked' }, { assignment_id: '40000000-0000-4000-8000-000000000002' }, { corpus_id: '30000000-0000-4000-8000-000000000002' }, { corpus_revision: 'other' }, { authorization_revision: 'other' }, { observed_at: '2100-01-01T00:00:00Z' }])('refuses changed current assignment %j', change => expect(current(c, { ...a, ...change }, a.identity, now)).toBe(false));
it('fails closed on expiry, missing ACL, malformed clock and long authority', () => {
  expect(current(c, { ...a, identity: { ...a.identity, owner_id: 'foreign' } }, a.identity, now)).toBe(false);
  const foreign = { ...c, principal: { ...c.principal, identity: { ...a.identity, owner_id: 'foreign' } }, assignment: { ...a, identity: { ...a.identity, owner_id: 'foreign' } } };
  expect(current(foreign, a, a.identity, now)).toBe(false);
  expect(current(c, null, a.identity, now)).toBe(false); expect(current(c, a, a.identity, new Date(c.expires_at))).toBe(false);
  expect(current(c, a, a.identity, new Date(NaN))).toBe(false);
  expect(Context.safeParse({ ...c, expires_at: '2100-01-01T00:00:00Z' }).success).toBe(false);
});
