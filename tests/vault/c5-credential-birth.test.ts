import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import * as vault from '../../src/vault/index.js';
import * as http from '../../src/http/index.js';
import { INTERNAL_TOKEN_HEADER, AuthInternalTokenSchema } from '../../src/auth/auth-headers.js';

const schema = (name: string): z.ZodType => Reflect.get(vault, name) as z.ZodType | undefined ?? z.unknown();
const identity = () => ({ managementAgentId: 'forge-new', runtimeAgentId: 'runtime-new', vaultAgentId: 21 });
const source = () => ({ kind: 'master', identity: { managementAgentId: 'forge-master', runtimeAgentId: 'runtime-master', vaultAgentId: 31 } });
const scope = () => ({ agentId: 'runtime-new', ownerId: 'owner-a', tenantId: 'tenant-a' });
const snapshot = 'a'.repeat(64);
const preview = () => ({ ok: true, source: source(), snapshot, entries: [{ key: 'OPENAI_API_KEY', version: 3 }, { key: 'AGENTMAIL_API_KEY', version: 7 }] });
const request = () => ({ requestId: 'request-0001', birthId: '11111111-1111-4111-8111-111111111111', scope: scope(), identity: identity(), source: source(), expectedSnapshot: snapshot });
const result = () => ({ ok: true, requestId: 'request-0001', birthId: '11111111-1111-4111-8111-111111111111', scope: scope(), identity: identity(), source: source(), snapshot, outcome: 'created', references: preview().entries.map(entry => ({ ...entry, source: source() })) });
const receipt = () => ({ request: request(), result: result() });
const without = (value: Record<string, unknown>, key: string) => { const copy = { ...value }; delete copy[key]; return copy; };
const mutate = (input: unknown, path: string, value: unknown) => {
  const copy = structuredClone(input) as Record<string, unknown>;
  const parts = path.split('.'); let current = copy;
  for (const part of parts.slice(0, -1)) current = current[part] as Record<string, unknown>;
  current[parts.at(-1)!] = value; return copy;
};
const replay = (previous: unknown, incoming: unknown): unknown => {
  const fn = Reflect.get(vault, 'credentialBirthReplay') as ((a: unknown, b: unknown) => unknown) | undefined;
  return fn ? fn(previous, incoming) : { action: 'bind' };
};

describe('C5 credential birth metadata boundary', () => {
  for (const name of ['CredentialBirthSourceSchema', 'CredentialBirthSnapshotSchema', 'CredentialBirthEntrySchema', 'CredentialBirthReferenceSchema', 'CredentialBirthPreviewRequestSchema', 'CredentialBirthPreviewSuccessSchema', 'CredentialBirthPreviewResponseSchema', 'CredentialBirthBindRequestSchema', 'CredentialBirthBindResultSchema', 'CredentialBirthBindResponseSchema', 'CredentialBirthReceiptSchema', 'CredentialBirthErrorResponseSchema', 'createCredentialBirthBindRequest', 'credentialBirthReplay']) {
    it(`CB01 exports ${name}`, () => expect(Reflect.get(vault, name)).toBeDefined());
  }
  const positives: [string, () => unknown][] = [
    ['CredentialBirthSourceSchema', source], ['CredentialBirthPreviewRequestSchema', () => ({ source: source() })],
    ['CredentialBirthEntrySchema', () => preview().entries[0]], ['CredentialBirthReferenceSchema', () => result().references[0]],
    ['CredentialBirthPreviewSuccessSchema', preview], ['CredentialBirthPreviewResponseSchema', preview],
    ['CredentialBirthBindRequestSchema', request], ['CredentialBirthBindResultSchema', result],
    ['CredentialBirthBindResponseSchema', result], ['CredentialBirthReceiptSchema', receipt],
  ];
  for (const [name, fixture] of positives) {
    it(`CB02 ${name} round trips metadata`, () => expect(schema(name).parse(fixture())).toEqual(fixture()));
    for (const extra of ['value', 'storedHash', 'applied', 'ttl']) it(`CB03 ${name} rejects extra ${extra}`, () => expect(schema(name).safeParse({ ...fixture() as object, [extra]: 'synthetic-only' }).success).toBe(false));
    const keys = Object.keys(fixture() as object);
    for (const field of keys) {
      it(`CB04 ${name} requires ${field}`, () => expect(schema(name).safeParse(without(fixture() as Record<string, unknown>, field)).success).toBe(false));
      it(`CB05 ${name} rejects null ${field}`, () => expect(schema(name).safeParse({ ...fixture() as object, [field]: null }).success).toBe(false));
    }
  }
  for (const name of ['CredentialBirthSourceSchema', 'CredentialBirthBindRequestSchema', 'CredentialBirthBindResultSchema']) {
    const fixture = name === 'CredentialBirthSourceSchema' ? source : name === 'CredentialBirthBindRequestSchema' ? request : result;
    for (const field of ['managementAgentId', 'runtimeAgentId', 'vaultAgentId']) {
      it(`CB06 ${name} requires complete ${field}`, () => expect(schema(name).safeParse({ ...fixture(), identity: without(fixture().identity, field) }).success).toBe(false));
      for (const invalid of field === 'vaultAgentId' ? [0, -1, 1.5, '21'] : ['', '  ', null]) it(`CB07 ${name} rejects ${field}=${String(invalid)}`, () => expect(schema(name).safeParse(mutate(fixture(), `identity.${field}`, invalid)).success).toBe(false));
    }
  }
  for (const kind of ['group', 'platform', 'own', '', null]) it(`CB08 unsupported source ${String(kind)} cannot fall back`, () => expect(schema('CredentialBirthSourceSchema').safeParse({ ...source(), kind }).success).toBe(false));
  it('CB09 source has no hardcoded Master slug', () => expect(schema('CredentialBirthSourceSchema').safeParse({ kind: 'master', identity: { managementAgentId: 'other-master', runtimeAgentId: 'other-runtime', vaultAgentId: 123 } }).success).toBe(true));
  for (const invalid of ['', 'a'.repeat(63), 'a'.repeat(65), 'g'.repeat(64), 'A'.repeat(64), null]) it(`CB10 snapshot rejects ${String(invalid)?.slice(0, 6)}`, () => expect(schema('CredentialBirthSnapshotSchema').safeParse(invalid).success).toBe(false));
  it('CB11 snapshot accepts opaque lowercase SHA256', () => expect(schema('CredentialBirthSnapshotSchema').parse(snapshot)).toBe(snapshot));
  for (const name of ['CredentialBirthBindRequestSchema', 'CredentialBirthBindResultSchema']) {
    const fixture = name === 'CredentialBirthBindRequestSchema' ? request : result;
    for (const field of ['agentId', 'ownerId', 'tenantId']) it(`CB42 ${name} requires scope ${field}`, () => expect(schema(name).safeParse({ ...fixture(), scope: without(fixture().scope, field) }).success).toBe(false));
    for (const field of ['agentId', 'ownerId', 'tenantId']) for (const invalid of ['', '  ', null]) it(`CB12 ${name} rejects scope ${field}=${String(invalid)}`, () => expect(schema(name).safeParse(mutate(fixture(), `scope.${field}`, invalid)).success).toBe(false));
    it(`CB13 ${name} rejects foreign runtime scope`, () => expect(schema(name).safeParse(mutate(fixture(), 'scope.agentId', 'other-runtime')).success).toBe(false));
    for (const field of ['managementAgentId', 'runtimeAgentId', 'vaultAgentId']) it(`CB14 ${name} refuses self source ${field}`, () => expect(schema(name).safeParse(mutate(fixture(), `source.identity.${field}`, identity()[field as keyof ReturnType<typeof identity>])).success).toBe(false));
    it(`CB15 ${name} refuses self source cross alias`, () => expect(schema(name).safeParse(mutate(fixture(), 'source.identity.runtimeAgentId', identity().managementAgentId)).success).toBe(false));
    for (const field of ['requestId', 'birthId']) for (const invalid of ['', 'short', 'spaces are bad', null]) it(`CB16 ${name} rejects ${field}=${String(invalid)}`, () => expect(schema(name).safeParse({ ...fixture(), [field]: invalid }).success).toBe(false));
  }
  for (const name of ['CredentialBirthEntrySchema', 'CredentialBirthReferenceSchema']) {
    const fixture = name === 'CredentialBirthEntrySchema' ? () => preview().entries[0]! : () => result().references[0]!;
    for (const key of ['', 'invalid key', 'TELEGRAM_SESSION_STRING', 'APPROVALS_SIGNING_KEY']) it(`CB17 ${name} rejects unavailable key ${key}`, () => expect(schema(name).safeParse({ ...fixture(), key }).success).toBe(false));
    for (const version of [0, -1, 1.5, '3', null]) it(`CB18 ${name} rejects version ${String(version)}`, () => expect(schema(name).safeParse({ ...fixture(), version }).success).toBe(false));
  }
  for (const name of ['CredentialBirthBindRequestSchema', 'CredentialBirthBindResultSchema']) {
    const fixture = name === 'CredentialBirthBindRequestSchema' ? request : result;
    for (const birthId of ['birth-000001', 'request-00001', 'not-a-uuid', '11111111-1111-1111-1111-111111111111']) it(`CB41 ${name} birthId must be a reserved UUID ${birthId}`, () => expect(schema(name).safeParse({ ...fixture(), birthId }).success).toBe(false));
  }
  it('CB19 preview accepts observed empty source', () => expect(schema('CredentialBirthPreviewSuccessSchema').parse({ ...preview(), entries: [] })).toEqual({ ...preview(), entries: [] }));
  it('CB20 bind accepts empty reference vector without implying applied', () => expect(schema('CredentialBirthBindResultSchema').parse({ ...result(), references: [] })).toEqual({ ...result(), references: [] }));
  it('CB21 preview rejects duplicate keys', () => { const value = preview(); value.entries.push(value.entries[0]!); expect(schema('CredentialBirthPreviewSuccessSchema').safeParse(value).success).toBe(false); });
  it('CB22 result rejects duplicate references', () => { const value = result(); value.references.push(value.references[0]!); expect(schema('CredentialBirthBindResultSchema').safeParse(value).success).toBe(false); });
  for (const field of ['managementAgentId', 'runtimeAgentId', 'vaultAgentId']) it(`CB23 result rejects reference source ${field} mismatch`, () => expect(schema('CredentialBirthBindResultSchema').safeParse(mutate(result(), `references.0.source.identity.${field}`, field === 'vaultAgentId' ? 88 : 'foreign')).success).toBe(false));
  for (const outcome of ['created', 'unchanged']) it(`CB24 result accepts ${outcome}`, () => expect(schema('CredentialBirthBindResultSchema').safeParse({ ...result(), outcome }).success).toBe(true));
  for (const outcome of ['applied', 'ok', 'partial', 'failed', null]) it(`CB25 result rejects ${String(outcome)}`, () => expect(schema('CredentialBirthBindResultSchema').safeParse({ ...result(), outcome }).success).toBe(false));
  const receiptMismatches: [string, unknown][] = [['requestId', 'request-0002'], ['birthId', '22222222-2222-4222-8222-222222222222'], ['scope.ownerId', 'other-owner'], ['scope.tenantId', 'other-tenant'], ['identity.managementAgentId', 'other-management'], ['identity.vaultAgentId', 22], ['source.identity.managementAgentId', 'other-source'], ['source.identity.runtimeAgentId', 'other-runtime'], ['source.identity.vaultAgentId', 32], ['snapshot', 'b'.repeat(64)]];
  for (const field of ['managementAgentId', 'runtimeAgentId', 'vaultAgentId']) it(`CB46 receipt rejects coherently changed result source ${field}`, () => { const value = result(); const changed = field === 'vaultAgentId' ? 88 : 'foreign-source'; Object.assign(value.source.identity, { [field]: changed }); for (const entry of value.references) Object.assign(entry.source.identity, { [field]: changed }); expect(schema('CredentialBirthReceiptSchema').safeParse({ request: request(), result: value }).success).toBe(false); });
  for (const [path, value] of receiptMismatches) it(`CB26 receipt rejects result ${path} mismatch`, () => expect(schema('CredentialBirthReceiptSchema').safeParse({ request: request(), result: mutate(result(), path, value) }).success).toBe(false));
  for (const error of ['invalid_request', 'identity_mismatch', 'source_unavailable', 'snapshot_conflict', 'idempotency_conflict', 'birth_not_found']) {
    const value = { ok: false, error };
    for (const name of ['CredentialBirthErrorResponseSchema', 'CredentialBirthPreviewResponseSchema', 'CredentialBirthBindResponseSchema']) it(`CB27 ${name} represents ${error}`, () => expect(schema(name).parse(value)).toEqual(value));
  }
  it('CB28 errors cannot carry value', () => expect(schema('CredentialBirthErrorResponseSchema').safeParse({ ok: false, error: 'source_unavailable', value: 'synthetic-only' }).success).toBe(false));
  it('CB43 receipt rejects coherently changed result runtime scope', () => { const value = result(); value.identity.runtimeAgentId = 'other-runtime'; value.scope.agentId = 'other-runtime'; expect(schema('CredentialBirthReceiptSchema').safeParse({ request: request(), result: value }).success).toBe(false); });
  it('CB44 replay conflicts on coherently changed runtime scope', () => { const value = request(); value.identity.runtimeAgentId = 'other-runtime'; value.scope.agentId = 'other-runtime'; expect(replay(receipt(), value)).toEqual({ action: 'conflict', error: 'idempotency_conflict' }); });
  it('CB29 errors cannot carry unknown reason', () => expect(schema('CredentialBirthErrorResponseSchema').safeParse({ ok: false, error: 'arbitrary' }).success).toBe(false));
  it('CB30 typed writer returns a detached complete request', () => {
    const fn = Reflect.get(vault, 'createCredentialBirthBindRequest') as ((value: unknown) => unknown) | undefined;
    expect(fn).toBeTypeOf('function'); const value = request(); const parsed = fn?.(value); expect(parsed).toEqual(value); expect(parsed).not.toBe(value);
  });
  it('CB31 first request is a bind disposition', () => expect(replay(null, request())).toEqual({ action: 'bind' }));
  it('CB32 identical intent returns detached stored result', () => { const value = receipt(); const disposition = replay(value, request()); expect(disposition).toEqual({ action: 'replay', result: result() }); expect(disposition).not.toBe(value); });
  it('CB33 property ordering does not change intent', () => { const value = request(); const reversed = Object.fromEntries(Object.entries(value).reverse()); expect(replay(receipt(), reversed)).toEqual({ action: 'replay', result: result() }); });
  for (const [path, value] of [['requestId', 'request-0002'], ['birthId', '22222222-2222-4222-8222-222222222222'], ['scope.ownerId', 'other-owner'], ['scope.tenantId', 'other-tenant'], ['identity.managementAgentId', 'other-management'], ['identity.vaultAgentId', 22], ['source.identity.managementAgentId', 'other-source'], ['source.identity.runtimeAgentId', 'other-runtime'], ['source.identity.vaultAgentId', 32], ['expectedSnapshot', 'b'.repeat(64)]] as [string, unknown][]) it(`CB34 replay conflicts on ${path}`, () => expect(replay(receipt(), mutate(request(), path, value))).toEqual({ action: 'conflict', error: 'idempotency_conflict' }));
  it('CB35 replay rejects invalid incoming intent before initial bind', () => expect(() => replay(null, { ...request(), identity: {} })).toThrow());
  it('CB36 replay rejects corrupt stored receipt', () => expect(() => replay({ ...receipt(), result: mutate(result(), 'snapshot', 'b'.repeat(64)) }, request())).toThrow());
  for (const [name, path, body, response] of [
    ['internalCredentialBirthPreviewContract', '/internal/credentials/birth/preview', 'CredentialBirthPreviewRequestSchema', 'CredentialBirthPreviewResponseSchema'],
    ['internalCredentialBirthBindContract', '/internal/credentials/birth/bind', 'CredentialBirthBindRequestSchema', 'CredentialBirthBindResponseSchema'],
  ]) {
    it(`CB37 ${name} exports`, () => expect(Reflect.get(http, name!)).toBeDefined());
    for (const [field, expected] of [['method', 'POST'], ['path', path], ['authType', 'token'], ['authHeader', INTERNAL_TOKEN_HEADER], ['authSchema', AuthInternalTokenSchema]]) it(`CB38 ${name} ${field}`, () => expect(Reflect.get(http, name!)?.[field as string]).toBe(expected));
    it(`CB39 ${name} shares canonical body schema`, () => { expect(Reflect.get(vault, body!)).toBeDefined(); expect(Reflect.get(http, name!)?.bodySchema).toBe(Reflect.get(vault, body!)); });
    it(`CB40 ${name} shares canonical response schema`, () => { expect(Reflect.get(vault, response!)).toBeDefined(); expect(Reflect.get(http, name!)?.responseSchema).toBe(Reflect.get(vault, response!)); });
  }
});
