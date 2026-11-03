import { describe, expect, it } from 'vitest';
import {
  CONNECT_RETURN_PATH,
  ConnectReturnQuerySchema,
  ConnectReturnResponseSchema,
  OpenConnectLinkParamsSchema,
  OpenConnectLinkResponseSchema,
  connectReturnContract,
  openConnectLinkContract,
} from '../../../src/http/endpoints/connect-public.js';

const token = 'a'.repeat(32);
const state = 's'.repeat(32);

describe('connect public contracts', () => {
  it('accepts valid payloads', () => {
    expect(OpenConnectLinkParamsSchema.safeParse({ token }).success).toBe(true);
    expect(OpenConnectLinkResponseSchema.safeParse({ kind: 'redirect', location: 'https://accounts.google.com/o/oauth2/v2/auth?x=1' }).success).toBe(true);
    for (const reason of ['expired', 'invalid', 'used']) {
      expect(OpenConnectLinkResponseSchema.safeParse({ kind: 'error', reason }).success).toBe(true);
    }
    expect(ConnectReturnQuerySchema.safeParse({ state, code: 'c' }).success).toBe(true);
    expect(ConnectReturnQuerySchema.safeParse({ state, error: 'access_denied' }).success).toBe(true);
    expect(ConnectReturnResponseSchema.safeParse({ kind: 'done', scopes: [] }).success).toBe(true);
    expect(ConnectReturnResponseSchema.safeParse({ kind: 'done', accountLabel: 'a@b.c', scopes: ['mail_send'] }).success).toBe(true);
    for (const reason of ['invalid_state', 'denied', 'exchange_failed', 'vault_error']) {
      expect(ConnectReturnResponseSchema.safeParse({ kind: 'error', reason }).success).toBe(true);
    }
  });

  it('declares no auth and the expected paths', () => {
    expect(openConnectLinkContract.authType).toBe('none');
    expect(connectReturnContract.authType).toBe('none');
    expect(openConnectLinkContract.path).toBe('/connect/link/:token');
    expect(connectReturnContract.path).toBe(CONNECT_RETURN_PATH);
    expect(CONNECT_RETURN_PATH).toBe('/connect/return');
  });

  it('rejects short or out-of-set tokens', () => {
    expect(OpenConnectLinkParamsSchema.safeParse({ token: 'a'.repeat(31) }).success).toBe(false);
    expect(OpenConnectLinkParamsSchema.safeParse({ token: 'a'.repeat(129) }).success).toBe(false);
    expect(OpenConnectLinkParamsSchema.safeParse({ token: `${'a'.repeat(31)}/` }).success).toBe(false);
    expect(OpenConnectLinkParamsSchema.safeParse({ token: `${'a'.repeat(31)}.` }).success).toBe(false);
    expect(OpenConnectLinkParamsSchema.safeParse({ token, extra: 1 }).success).toBe(false);
  });

  it('rejects non-https redirects and unknown reasons', () => {
    expect(OpenConnectLinkResponseSchema.safeParse({ kind: 'redirect', location: 'http://x.test/' }).success).toBe(false);
    expect(OpenConnectLinkResponseSchema.safeParse({ kind: 'error', reason: 'other' }).success).toBe(false);
    expect(ConnectReturnResponseSchema.safeParse({ kind: 'error', reason: 'other' }).success).toBe(false);
  });

  it('rejects extra or short query fields', () => {
    expect(ConnectReturnQuerySchema.safeParse({ state, extra: 'x' }).success).toBe(false);
    expect(ConnectReturnQuerySchema.safeParse({ state: 'short' }).success).toBe(false);
    expect(ConnectReturnQuerySchema.safeParse({}).success).toBe(false);
  });

  it('never allows code or tokens in a response', () => {
    for (const field of ['code', 'access_token', 'refresh_token']) {
      expect(ConnectReturnResponseSchema.safeParse({ kind: 'done', scopes: [], [field]: 'secret' }).success).toBe(false);
      expect(ConnectReturnResponseSchema.safeParse({ kind: 'error', reason: 'denied', [field]: 'secret' }).success).toBe(false);
      expect(OpenConnectLinkResponseSchema.safeParse({ kind: 'redirect', location: 'https://x.test/', [field]: 'secret' }).success).toBe(false);
    }
  });
});
