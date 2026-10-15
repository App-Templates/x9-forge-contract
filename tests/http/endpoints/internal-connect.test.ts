import { describe, expect, it } from 'vitest';
import { VAULT_ACCESS_ERROR_CODES } from '../../../src/http/endpoints/internal-vault-connection.js';
import { CONNECT_PERMIT_MAX_TTL_SECONDS } from '../../../src/capability/connect/index.js';
import {
  ConnectErrorResponseSchema,
  ConnectStateParamsSchema,
  IssueConnectAccessTokenBodySchema,
  IssueConnectAccessTokenResponseSchema,
  issueConnectAccessTokenContract,
  IssueConnectPermitBodySchema,
  IssueConnectPermitResponseSchema,
  getConnectStateContract,
  issueConnectPermitContract,
  revokeConnectContract,
  startConnectContract,
} from '../../../src/http/endpoints/internal-connect.js';

const start = {
  agentId: 'x9',
  personRef: 'p1',
  conversationId: 'c1',
  provider: 'google',
  scopes: ['calendar_events'],
};
const permit = { agentId: 'x9', provider: 'google', scopes: ['mail_send'], issuedAt: 1000, expiresAt: 1600 };
const token = 'a'.repeat(32);

describe('internal connect contracts', () => {
  it('accepts a valid payload for every schema', () => {
    expect(startConnectContract.bodySchema.safeParse(start).success).toBe(true);
    expect(startConnectContract.responseSchema.safeParse({ ok: true, linkUrl: 'https://x.test/l', expiresAt: 2000 }).success).toBe(true);
    expect(ConnectStateParamsSchema.safeParse({ agentId: 'agent-1', provider: 'google' }).success).toBe(true);
    expect(getConnectStateContract.responseSchema.safeParse({ agentId: 'x9', provider: 'google', status: 'connected', scopes: [] }).success).toBe(true);
    expect(revokeConnectContract.bodySchema.safeParse({ agentId: 'x9', provider: 'google' }).success).toBe(true);
    expect(revokeConnectContract.responseSchema.safeParse({ ok: true, status: 'revoked' }).success).toBe(true);
    expect(IssueConnectPermitBodySchema.safeParse({ agentId: 'x9', provider: 'google', scopes: ['mail_send'] }).success).toBe(true);
    expect(IssueConnectPermitResponseSchema.safeParse({ ok: true, permit, token }).success).toBe(true);
    expect(IssueConnectPermitResponseSchema.safeParse({ ok: false, error: 'nope' }).success).toBe(true);
    expect(ConnectErrorResponseSchema.safeParse({ ok: false, error: 'x' }).success).toBe(true);
  });

  it('declares secret auth and the expected paths', () => {
    for (const c of [startConnectContract, getConnectStateContract, revokeConnectContract, issueConnectPermitContract]) {
      expect(c.authType).toBe('secret');
      expect(c.path.startsWith('/internal/connect/')).toBe(true);
    }
  });

  it('rejects extra fields (strict)', () => {
    // Mutazione: togliere .strict() da un body fa fallire questi casi.
    expect(startConnectContract.bodySchema.safeParse({ ...start, extra: 1 }).success).toBe(false);
    expect(revokeConnectContract.bodySchema.safeParse({ agentId: 'x9', provider: 'google', extra: 1 }).success).toBe(false);
    expect(IssueConnectPermitBodySchema.safeParse({ agentId: 'x9', provider: 'google', scopes: ['mail_send'], extra: 1 }).success).toBe(false);
    expect(ConnectStateParamsSchema.safeParse({ agentId: 'x9', provider: 'google', extra: 1 }).success).toBe(false);
  });

  it('rejects an unknown provider', () => {
    expect(startConnectContract.bodySchema.safeParse({ ...start, provider: 'dropbox' }).success).toBe(false);
    expect(ConnectStateParamsSchema.safeParse({ agentId: 'x9', provider: 'dropbox' }).success).toBe(false);
    expect(IssueConnectPermitBodySchema.safeParse({ agentId: 'x9', provider: 'dropbox', scopes: ['mail_send'] }).success).toBe(false);
  });

  it('rejects empty or duplicate scopes on permit requests', () => {
    expect(IssueConnectPermitBodySchema.safeParse({ agentId: 'x9', provider: 'google', scopes: [] }).success).toBe(false);
    expect(IssueConnectPermitBodySchema.safeParse({ agentId: 'x9', provider: 'google', scopes: ['mail_send', 'mail_send'] }).success).toBe(false);
  });

  it('rejects invalid state params agentId', () => {
    expect(ConnectStateParamsSchema.safeParse({ agentId: '', provider: 'google' }).success).toBe(false);
    expect(ConnectStateParamsSchema.safeParse({ agentId: 'A/../b', provider: 'google' }).success).toBe(false);
  });

  it('rejects a permit that outlives the maximum ttl', () => {
    const long = { ...permit, expiresAt: permit.issuedAt + CONNECT_PERMIT_MAX_TTL_SECONDS + 1 };
    expect(IssueConnectPermitResponseSchema.safeParse({ ok: true, permit: long, token }).success).toBe(false);
  });

  it('rejects a short token and a permit response without a token', () => {
    expect(IssueConnectPermitResponseSchema.safeParse({ ok: true, permit, token: 'short' }).success).toBe(false);
    expect(IssueConnectPermitResponseSchema.safeParse({ ok: true, permit }).success).toBe(false);
  });

  it('rejects a start response with an http link', () => {
    expect(startConnectContract.responseSchema.safeParse({ ok: true, linkUrl: 'http://x.test/l', expiresAt: 2000 }).success).toBe(false);
  });

  it('never allows a value or token field in the state response', () => {
    const base = { agentId: 'x9', provider: 'google', status: 'connected', scopes: [] };
    expect(getConnectStateContract.responseSchema.safeParse({ ...base, value: 'ya29.x' }).success).toBe(false);
    expect(getConnectStateContract.responseSchema.safeParse({ ...base, token: 'ya29.x' }).success).toBe(false);
    expect(getConnectStateContract.responseSchema.safeParse({ ...base, accessToken: 'ya29.x' }).success).toBe(false);
  });
});

describe('internal connect access-token contract', () => {
  const body = { agentId: '12', provider: 'google', scope: 'calendar_events', personRef: 'p1' };
  const ok = { ok: true, accessToken: 'ya29.token', expiresAt: 1760000000000, scopes: ['calendar_events'] };

  it('declares the route as a secret-authenticated POST', () => {
    expect(issueConnectAccessTokenContract.method).toBe('POST');
    expect(issueConnectAccessTokenContract.path).toBe('/internal/connect/access-token');
    expect(issueConnectAccessTokenContract.authType).toBe('secret');
  });

  it('accepts a valid body and a valid success response', () => {
    expect(IssueConnectAccessTokenBodySchema.safeParse(body).success).toBe(true);
    expect(IssueConnectAccessTokenResponseSchema.safeParse(ok).success).toBe(true);
  });

  it('rejects mail_send, empty or missing personRef, non numeric agentId, extra keys', () => {
    expect(IssueConnectAccessTokenBodySchema.safeParse({ ...body, scope: 'mail_send' }).success).toBe(false);
    expect(IssueConnectAccessTokenBodySchema.safeParse({ ...body, personRef: '' }).success).toBe(false);
    const { personRef: _omit, ...noPerson } = body;
    expect(IssueConnectAccessTokenBodySchema.safeParse(noPerson).success).toBe(false);
    expect(IssueConnectAccessTokenBodySchema.safeParse({ ...body, agentId: 'x9' }).success).toBe(false);
    expect(IssueConnectAccessTokenBodySchema.safeParse({ ...body, extra: 1 }).success).toBe(false);
  });

  it('rejects refreshToken, value and unknown fields in the success response', () => {
    expect(IssueConnectAccessTokenResponseSchema.safeParse({ ...ok, refreshToken: 'r' }).success).toBe(false);
    expect(IssueConnectAccessTokenResponseSchema.safeParse({ ...ok, value: 'v' }).success).toBe(false);
    expect(IssueConnectAccessTokenResponseSchema.safeParse({ ok: true, expiresAt: 1, scopes: [] }).success).toBe(false);
  });

  it('passes every Vault error code unchanged plus the two connect codes', () => {
    for (const error of [...VAULT_ACCESS_ERROR_CODES, 'person_not_determinable', 'unavailable']) {
      expect(IssueConnectAccessTokenResponseSchema.safeParse({ ok: false, error }).success).toBe(true);
    }
    expect(IssueConnectAccessTokenResponseSchema.safeParse({ ok: false, error: 'boom' }).success).toBe(false);
    expect(IssueConnectAccessTokenResponseSchema.safeParse({ ok: false, error: 'expired', extra: 1 }).success).toBe(false);
  });
});
