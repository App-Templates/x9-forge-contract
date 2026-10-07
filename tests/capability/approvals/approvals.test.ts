import { createPrivateKey, createPublicKey, sign, verify } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  APPROVAL_MAX_TTL_SEC,
  ApprovalBindingsSchema,
  ApprovalPermitSchema,
  CreateApprovalRequestBodySchema,
  DeliverApprovalPermitResponseSchema,
  PendingApprovalsResponseSchema,
  SignedApprovalPermitSchema,
  approvalKeysContract,
  canonicalApprovalPermit,
  checkApprovalPermit,
  createApprovalRequestContract,
  deliverApprovalPermitContract,
  pendingApprovalsContract,
  type ApprovalPermit,
  type ApprovalPermitExpectation,
} from '../../../src/capability/index.js';

// TEST-ONLY Ed25519 key of the shared signature vector. Never used outside tests.
const TEST_JWK = { crv: 'Ed25519', d: 'urZKVkT9kXXyBra55KvFVDwVtSC1CfGiNHjBKsxrAVU', x: 'SNndtwKQD4C3D5ZHPYvX8mQ6VNH4QT8GOIbVvpUExPU', kty: 'OKP' } as const;
const TEST_SPKI = 'MCowBQYDK2VwAyEASNndtwKQD4C3D5ZHPYvX8mQ6VNH4QT8GOIbVvpUExPU=';

const permit: ApprovalPermit = {
  v: 1,
  type: 'backup.create',
  client: 'backup',
  tenantId: 'tenant-stefano',
  ownerId: 'owner-stefano',
  agentId: 'master-chief',
  requestId: 'req_0123456789abcdef',
  textSha256: 'a'.repeat(64),
  bindings: { resource: 'hostinger:vm:123456', release: 'pre-phase-60-agent-x9', overwrites: 325 },
  issuedAt: '2026-10-07T19:00:00Z',
  expiresAt: '2026-10-07T19:10:00Z',
  nonce: 'AAAAAAAAAAAAAAAAAAAAAA',
};

const CANONICAL =
  'x9-approval-permit-v1\n' +
  '{"agentId":"master-chief","bindings":{"overwrites":325,"release":"pre-phase-60-agent-x9","resource":"hostinger:vm:123456"},' +
  '"client":"backup","expiresAt":"2026-10-07T19:10:00Z","issuedAt":"2026-10-07T19:00:00Z","nonce":"AAAAAAAAAAAAAAAAAAAAAA",' +
  '"ownerId":"owner-stefano","requestId":"req_0123456789abcdef","tenantId":"tenant-stefano","textSha256":"' + 'a'.repeat(64) + '",' +
  '"type":"backup.create","v":1}';
const SIGNATURE = 'lBq1RyG56YLrn2VwTSerMh-wEVvAWCRp4GiycATUdiM6iaLyWXqW26t2wNZKoHH2e-BqhcnpsenIOqaYX29DAw';

const expectation: ApprovalPermitExpectation = {
  type: 'backup.create',
  client: 'backup',
  scope: { tenantId: 'tenant-stefano', ownerId: 'owner-stefano', agentId: 'master-chief' },
  requestId: 'req_0123456789abcdef',
  textSha256: 'a'.repeat(64),
  bindings: { release: 'pre-phase-60-agent-x9', overwrites: 325, resource: 'hostinger:vm:123456' },
};
const NOW = Date.parse('2026-10-07T19:05:00Z');

describe('canonical permit and signature vector', () => {
  it('serializes with the domain prefix and keys sorted at every level', () => {
    expect(canonicalApprovalPermit(permit)).toBe(CANONICAL);
  });

  it('does not depend on key insertion order', () => {
    const reordered = { ...permit, bindings: { overwrites: 325, resource: 'hostinger:vm:123456', release: 'pre-phase-60-agent-x9' } };
    expect(canonicalApprovalPermit(reordered)).toBe(CANONICAL);
  });

  it('matches the shared Ed25519 vector (sign and verify)', () => {
    const key = createPrivateKey({ key: TEST_JWK, format: 'jwk' });
    expect(sign(null, Buffer.from(CANONICAL, 'utf8'), key).toString('base64url')).toBe(SIGNATURE);
    const pub = createPublicKey({ key: Buffer.from(TEST_SPKI, 'base64'), format: 'der', type: 'spki' });
    expect(verify(null, Buffer.from(CANONICAL, 'utf8'), pub, Buffer.from(SIGNATURE, 'base64url'))).toBe(true);
    const tampered = canonicalApprovalPermit({ ...permit, bindings: { ...permit.bindings, release: 'pre-phase-61-agent-x9' } });
    expect(verify(null, Buffer.from(tampered, 'utf8'), pub, Buffer.from(SIGNATURE, 'base64url'))).toBe(false);
  });

  it('refuses to serialize an invalid permit', () => {
    expect(() => canonicalApprovalPermit({ ...permit, type: 'dev.approve' })).toThrow();
  });

  it('accepts the signed envelope shape only', () => {
    expect(SignedApprovalPermitSchema.safeParse({ permit, keyId: 'approvals-2026-10', signature: SIGNATURE }).success).toBe(true);
    expect(SignedApprovalPermitSchema.safeParse({ permit, keyId: 'approvals-2026-10', signature: SIGNATURE.slice(1) }).success).toBe(false);
    expect(SignedApprovalPermitSchema.safeParse({ permit, keyId: 'approvals-2026-10', signature: SIGNATURE, extra: 1 }).success).toBe(false);
  });
});

describe('permit schema', () => {
  it('accepts the vector permit', () => {
    expect(ApprovalPermitSchema.safeParse(permit).success).toBe(true);
  });

  it.each([
    ['type of another client', { type: 'dev.approve' }],
    ['version 2', { v: 2 }],
    ['lifetime over the ceiling', { expiresAt: new Date(Date.parse(permit.issuedAt) + (APPROVAL_MAX_TTL_SEC + 1) * 1000).toISOString().replace(/\.000Z$/, 'Z') }],
    ['lifetime under the floor', { expiresAt: '2026-10-07T19:00:59Z' }],
    ['expiry before issue', { expiresAt: '2026-10-07T18:59:00Z' }],
    ['milliseconds in instants', { issuedAt: '2026-10-07T19:00:00.000Z' }],
    ['impossible date', { issuedAt: '2026-02-30T19:00:00Z' }],
    ['short nonce', { nonce: 'AAAA' }],
    ['upper-case text hash', { textSha256: 'A'.repeat(64) }],
    ['unknown field', { extra: true }],
  ])('rejects %s', (_label, patch) => {
    expect(ApprovalPermitSchema.safeParse({ ...permit, ...patch }).success).toBe(false);
  });

  it('bounds the bindings: 1..16 flat strings or safe integers', () => {
    expect(ApprovalBindingsSchema.safeParse({}).success).toBe(false);
    expect(ApprovalBindingsSchema.safeParse(Object.fromEntries(Array.from({ length: 17 }, (_, i) => ['k' + i, i]))).success).toBe(false);
    expect(ApprovalBindingsSchema.safeParse({ amount: 1.5 }).success).toBe(false);
    expect(ApprovalBindingsSchema.safeParse({ nested: { a: 1 } }).success).toBe(false);
    expect(ApprovalBindingsSchema.safeParse({ text: 'line\nbreak' }).success).toBe(false);
    expect(ApprovalBindingsSchema.safeParse({ Bad: 'x' }).success).toBe(false);
    expect(ApprovalBindingsSchema.safeParse({ payee: 'IT60X0542811101000000123456', amount: 1200, currency: 'EUR' }).success).toBe(true);
  });
});

describe('checkApprovalPermit', () => {
  it('accepts a permit that matches the client expectation inside its window', () => {
    expect(checkApprovalPermit(permit, expectation, NOW)).toEqual({ ok: true, permit });
  });

  it.each([
    ['client_mismatch', { client: 'dev' }, {}],
    ['type_mismatch', { type: 'backup.restore' }, {}],
    ['scope_mismatch', { scope: { ...expectation.scope, agentId: 'other-agent' } }, {}],
    ['scope_mismatch', { scope: { ...expectation.scope, tenantId: 'tenant-other' } }, {}],
    ['scope_mismatch', { scope: { ...expectation.scope, ownerId: 'owner-other' } }, {}],
    ['request_mismatch', { requestId: 'req_ffffffffffffffff' }, {}],
    ['text_mismatch', { textSha256: 'b'.repeat(64) }, {}],
    ['bindings_mismatch', { bindings: { ...expectation.bindings, release: 'pre-phase-61-agent-x9' } }, {}],
    ['bindings_mismatch', { bindings: { ...expectation.bindings, extra: 'x' } }, {}],
    ['bindings_mismatch', { bindings: { ...expectation.bindings, overwrites: '325' } }, {}],
  ] as const)('rejects with %s', (reason, expPatch, permitPatch) => {
    expect(checkApprovalPermit({ ...permit, ...permitPatch }, { ...expectation, ...expPatch } as ApprovalPermitExpectation, NOW)).toEqual({ ok: false, reason });
  });

  it('rejects an invalid permit before comparing anything', () => {
    expect(checkApprovalPermit({ ...permit, nonce: 'x' }, expectation, NOW)).toEqual({ ok: false, reason: 'invalid' });
  });

  it('enforces the time window with a 30 s skew on issue only', () => {
    expect(checkApprovalPermit(permit, expectation, Date.parse('2026-10-07T18:59:31Z')).ok).toBe(true);
    expect(checkApprovalPermit(permit, expectation, Date.parse('2026-10-07T18:59:29Z'))).toEqual({ ok: false, reason: 'not_yet_valid' });
    expect(checkApprovalPermit(permit, expectation, Date.parse('2026-10-07T19:09:59Z')).ok).toBe(true);
    expect(checkApprovalPermit(permit, expectation, Date.parse('2026-10-07T19:10:00Z'))).toEqual({ ok: false, reason: 'expired' });
  });
});

describe('endpoint contracts', () => {
  it('pins method, path and auth of every endpoint', () => {
    expect([createApprovalRequestContract, deliverApprovalPermitContract, pendingApprovalsContract, approvalKeysContract].map((c) => [c.method, c.path, c.authType])).toEqual([
      ['POST', '/internal/approvals/requests', 'secret'],
      ['POST', '/approvals/permit', 'secret'],
      ['POST', '/internal/approvals/pending', 'secret'],
      ['GET', '/internal/approvals/keys', 'secret'],
    ]);
  });

  const request = {
    scope: expectation.scope,
    client: 'backup',
    type: 'backup.create',
    text: 'Rilascio pre-phase-60-agent-x9: creo lo snapshot? Sovrascrive quello del 03/10 18:20.',
    bindings: expectation.bindings,
    ttlSec: 600,
    severity: 'normal',
  };

  it('validates the approval request a client sends', () => {
    expect(CreateApprovalRequestBodySchema.safeParse(request).success).toBe(true);
    expect(CreateApprovalRequestBodySchema.safeParse({ ...request, type: 'dev.approve' }).success).toBe(false);
    expect(CreateApprovalRequestBodySchema.safeParse({ ...request, ttlSec: APPROVAL_MAX_TTL_SEC + 1 }).success).toBe(false);
    expect(CreateApprovalRequestBodySchema.safeParse({ ...request, ttlSec: 59 }).success).toBe(false);
    expect(CreateApprovalRequestBodySchema.safeParse({ ...request, text: '   ' }).success).toBe(false);
    // the text is hashed as sent: it is refused, never silently trimmed (client and signer must hash the same bytes)
    expect(CreateApprovalRequestBodySchema.safeParse({ ...request, text: ' ' + request.text }).success).toBe(false);
    expect(CreateApprovalRequestBodySchema.safeParse({ ...request, text: request.text + '\n' }).success).toBe(false);
    expect((CreateApprovalRequestBodySchema.parse(request) as { text: string }).text).toBe(request.text);
    expect(CreateApprovalRequestBodySchema.safeParse({ ...request, severity: 'critical' }).success).toBe(false);
    expect(CreateApprovalRequestBodySchema.safeParse({ ...request, scope: { ...request.scope, userId: 'u' } }).success).toBe(false);
  });

  it('only lists https links and bounded results', () => {
    const item = { requestId: 'req_0123456789abcdef', type: 'backup.create', text: 't', severity: 'normal', expiresAt: '2026-10-07T19:10:00Z', link: 'https://approva.example.com/approva/conferma' };
    expect(PendingApprovalsResponseSchema.safeParse({ approvals: [item] }).success).toBe(true);
    expect(PendingApprovalsResponseSchema.safeParse({ approvals: [{ ...item, link: 'http://approva.example.com/x' }] }).success).toBe(false);
    expect(PendingApprovalsResponseSchema.safeParse({ approvals: Array.from({ length: 51 }, () => item) }).success).toBe(false);
  });

  it('keeps the phone-page text of a delivery short and non-empty', () => {
    expect(DeliverApprovalPermitResponseSchema.safeParse({ ok: true, text: 'Snapshot avviato.' }).success).toBe(true);
    expect(DeliverApprovalPermitResponseSchema.safeParse({ ok: false, text: '' }).success).toBe(false);
    expect(DeliverApprovalPermitResponseSchema.safeParse({ ok: true, text: 'x'.repeat(501) }).success).toBe(false);
  });
});
