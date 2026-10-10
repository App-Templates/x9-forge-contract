import { describe, it, expect } from 'vitest';
import * as publicAgent from '../../src/agent/index.js';
import { VoiceLiveCallStartRequestSchema } from '../../src/capability/voice-live/index.js';
// Public exports are asserted first so a missing implementation fails semantically.
const api = publicAgent;
const now = Date.parse('2026-01-01T00:00:00Z');
const binding = () => ({ scope: { agentId: 'runtime-a', ownerId: 'owner-a', tenantId: 'tenant-a' },
  identity: { managementAgentId: 'managed-a', runtimeAgentId: 'runtime-a', vaultAgentId: 17 } });
const book = () => ({ ...binding(), status: 'complete' as const, version: 7, observedAt: '2026-01-01T00:00:00Z',
  emails: ['Person@Example.test'], phoneNumbers: ['+12345678'] });
function schema() { expect(api.AgentKnowledgeAddressBookSchema).toBeDefined(); return api.AgentKnowledgeAddressBookSchema; }
function current(b: unknown, scope: unknown = binding(), time = now, ttl?: number) {
  expect(api.isAgentKnowledgeAddressBookCurrent).toBeTypeOf('function');
  return api.isAgentKnowledgeAddressBookCurrent(b, scope, time, ttl);
}
describe('canonical knowledge address-book', () => {
  it('reuses the exact public phone schema', () => { expect(api.AgentKnowledgePhoneNumberSchema).toBe(VoiceLiveCallStartRequestSchema.shape.to_number); });
  it('normalizes emails and detaches the typed writer output', () => {
    expect(api.createAgentKnowledgeAddressBook).toBeTypeOf('function');
    const input = book(), out = api.createAgentKnowledgeAddressBook(input);
    expect(out.emails).toEqual(['person@example.test']); expect(out.phoneNumbers).toEqual(input.phoneNumbers);
    input.identity.vaultAgentId = 88; input.phoneNumbers.push('+22345678'); expect(out.identity.vaultAgentId).toBe(17); expect(out.phoneNumbers).toHaveLength(1);
  });
  it('supports complete empty sources without inventing admissions', () => { const b = { ...book(), emails: [], phoneNumbers: [] }; expect(schema().parse(b)).toEqual(b); expect(current(b)).toBe(true); });
  it.each(['partial', 'unavailable'])('preserves explicit %s sources', status => { const b = { ...book(), status, emails: null, phoneNumbers: null, version: null, observedAt: null }; expect(schema().parse(b)).toEqual(b); expect(current(b)).toBe(false); });
  for (const status of ['partial', 'unavailable']) for (const field of ['emails', 'phoneNumbers']) {
    it(`${status} cannot publish ${field}`, () => { const b = { ...book(), status, emails: null, phoneNumbers: null, [field]: [] }; expect(schema().safeParse(b).success).toBe(false); });
  }
  for (const field of ['scope', 'identity', 'status', 'version', 'observedAt', 'emails', 'phoneNumbers']) {
    it(`requires ${field}`, () => { const b: Record<string, unknown> = book(); delete b[field]; expect(schema().safeParse(b).success).toBe(false); });
  }
  for (const field of ['version', 'observedAt', 'emails', 'phoneNumbers']) {
    it(`complete requires nonnull ${field}`, () => { expect(schema().safeParse({ ...book(), [field]: null }).success).toBe(false); });
  }
  it.each(['+1234567', '+012345678', '12345678', '+1234567890123456', '+1 2345678', '+12345678x'])('rejects noncanonical number %s', value => { expect(schema().safeParse({ ...book(), phoneNumbers: [value] }).success).toBe(false); });
  it.each(['+12345678', '+123456789012345'])('accepts exact E.164 boundary %s', value => { expect(schema().safeParse({ ...book(), phoneNumbers: [value] }).success).toBe(true); });
  it('rejects duplicate phones', () => { expect(schema().safeParse({ ...book(), phoneNumbers: ['+12345678', '+12345678'] }).success).toBe(false); });
  it('rejects normalized duplicate emails', () => { expect(schema().safeParse({ ...book(), emails: ['A@example.test', 'a@example.test'] }).success).toBe(false); });
  for (const field of ['emails', 'phoneNumbers']) {
    const values = Array.from({ length: 2048 }, (_, n) => field === 'emails' ? `a${n}@example.test` : `+1${String(n).padStart(7, '0')}`);
    it(`accepts 2048 ${field}`, () => { expect(schema().safeParse({ ...book(), [field]: values }).success).toBe(true); });
    it(`rejects 2049 ${field}`, () => { expect(schema().safeParse({ ...book(), [field]: [...values, field === 'emails' ? 'last@example.test' : '+99999999'] }).success).toBe(false); });
  }
  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, '7'])('rejects invalid version %s', version => { expect(schema().safeParse({ ...book(), version }).success).toBe(false); });
  it('rejects invalid time', () => { expect(schema().safeParse({ ...book(), observedAt: 'yesterday' }).success).toBe(false); });
  for (const field of ['agentId', 'ownerId', 'tenantId']) for (const value of ['', '   ']) {
    it(`rejects blank scope ${field}/${value.length}`, () => { const b = book(); b.scope[field as keyof typeof b.scope] = value; expect(schema().safeParse(b).success).toBe(false); });
  }
  for (const field of ['managementAgentId', 'runtimeAgentId', 'vaultAgentId']) {
    it(`requires identity ${field}`, () => { const b = book(); delete (b.identity as Record<string, unknown>)[field]; expect(schema().safeParse(b).success).toBe(false); });
  }
  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, '17'])('rejects invalid Vault %s', vaultAgentId => { expect(schema().safeParse({ ...book(), identity: { ...binding().identity, vaultAgentId } }).success).toBe(false); });
  it.each(['managementAgentId', 'runtimeAgentId'])('rejects blank identity %s', field => { expect(schema().safeParse({ ...book(), identity: { ...binding().identity, [field]: '   ' } }).success).toBe(false); });
  it('rejects runtime/scope disagreement', () => { const b = book(); b.identity.runtimeAgentId = 'runtime-b'; expect(schema().safeParse(b).success).toBe(false); });
  it.each(['root', 'scope', 'identity'])('rejects extra fields on %s', where => { const b = book(); const target = (where === 'root' ? b : where === 'scope' ? b.scope : b.identity) as Record<string, unknown>; target.unexpected = 'x'; expect(schema().safeParse(b).success).toBe(false); });
  it('projects into the exact C1 book and admission gate', () => {
    expect(api.toAgentChannelAddressBook).toBeTypeOf('function'); const input = book(); expect(() => api.toAgentChannelAddressBook(input)).not.toThrow(); const result = api.toAgentChannelAddressBook(input);
    const expected = { scope: input.scope, identity: input.identity, status: input.status, version: input.version, observedAt: input.observedAt, emails: ['person@example.test'], phones: ['+12345678'] }; expect(result).toEqual(expected);
    expect(publicAgent.AgentChannelAddressBookSchema.parse(result)).toEqual(expected);
    expect(publicAgent.isEmailSenderAdmitted({ kind: 'email', mode: 'address-book' }, 'PERSON@example.test', result, binding(), now)).toBe(true);
    expect(publicAgent.isEmailSenderAdmitted({ kind: 'email', mode: 'address-book' }, 'stranger@example.test', result, binding(), now)).toBe(false);
    expect(publicAgent.AgentChannelAddressBookSchema.safeParse(input).success).toBe(false);
  });
  it('preserves exact telephone admission through Knowledge projection', () => {
    const input = book(); const result = api.toAgentChannelAddressBook(input);
    expect(publicAgent.isPhoneNumberInAddressBook('+12345678', result, binding(), now)).toBe(true);
    expect(publicAgent.isPhoneNumberInAddressBook('+22345678', result, binding(), now)).toBe(false);
    input.phoneNumbers.push('+22345678');
    expect(publicAgent.isPhoneNumberInAddressBook('+22345678', result, binding(), now)).toBe(false);
    const unavailable = api.toAgentChannelAddressBook({ ...book(), status: 'partial', emails: null, phoneNumbers: null });
    expect(unavailable.phones).toBeNull();
    expect(publicAgent.isPhoneNumberInAddressBook('+12345678', unavailable, binding(), now)).toBe(false);
  });
  it('refuses an invalid book at projection boundary', () => { expect(api.toAgentChannelAddressBook).toBeTypeOf('function'); expect(() => api.toAgentChannelAddressBook({ ...book(), phoneNumbers: null })).toThrow(); });
  it('keeps partial unavailable in C1 projection', () => { expect(api.toAgentChannelAddressBook).toBeTypeOf('function'); expect(() => api.toAgentChannelAddressBook({ ...book(), status: 'partial', emails: null, phoneNumbers: null })).not.toThrow(); const result = api.toAgentChannelAddressBook({ ...book(), status: 'partial', emails: null, phoneNumbers: null }); expect(result.emails).toBeNull(); expect(publicAgent.isEmailSenderAdmitted({ kind: 'email', mode: 'address-book' }, 'person@example.test', result, binding(), now)).toBe(false); });
  it('requires well formed book and binding', () => { expect(current(null)).toBe(false); expect(current(book(), null)).toBe(false); });
  for (const field of ['agentId', 'ownerId', 'tenantId']) it(`denies foreign scope ${field}`, () => { const scope = binding(); scope.scope[field as keyof typeof scope.scope] = 'foreign'; expect(current(book(), scope)).toBe(false); });
  for (const field of ['managementAgentId', 'runtimeAgentId', 'vaultAgentId']) it(`denies foreign identity ${field}`, () => { const scope = binding(); (scope.identity as Record<string, unknown>)[field] = field === 'vaultAgentId' ? 88 : 'foreign'; expect(current(book(), scope)).toBe(false); });
  it('does not infer a missing trusted Vault', () => { const scope = binding(); delete (scope.identity as Record<string, unknown>).vaultAgentId; expect(current(book(), scope)).toBe(false); });
  it('accepts inclusive age boundaries and zero TTL', () => { expect(current(book())).toBe(true); expect(current(book(), binding(), now + 60000)).toBe(true); expect(current(book(), binding(), now, 0)).toBe(true); });
  it('denies future observation', () => { expect(current(book(), binding(), now - 1)).toBe(false); });
  it('denies stale observation', () => { expect(current(book(), binding(), now + 60001)).toBe(false); });
  it.each([NaN, Infinity, -Infinity])('denies invalid clock %s', value => { expect(current(book(), binding(), value)).toBe(false); });
  it.each([NaN, Infinity, -Infinity, -1])('denies invalid TTL %s', value => { expect(current(book(), binding(), now, value)).toBe(false); });
  it('denies incomplete source even with fresh metadata', () => { expect(current({ ...book(), status: 'partial', emails: null, phoneNumbers: null })).toBe(false); });
  it('rejects invalid values at mandatory writer boundary', () => { expect(api.createAgentKnowledgeAddressBook).toBeTypeOf('function'); expect(() => api.createAgentKnowledgeAddressBook({ ...book(), phoneNumbers: null })).toThrow(); });
  it('keeps the caller input detached during projection', () => { expect(api.toAgentChannelAddressBook).toBeTypeOf('function'); const input = book(); expect(() => api.toAgentChannelAddressBook(input)).not.toThrow(); const result = api.toAgentChannelAddressBook(input); input.scope.ownerId = 'other'; input.emails.push('other@example.test'); expect(result.scope.ownerId).toBe('owner-a'); expect(result.emails).toEqual(['person@example.test']); });
});
