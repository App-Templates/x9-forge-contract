import { describe, expect, it } from 'vitest';
import {
  DeleteVaultConnectionResponseSchema,
  GetVaultConnectionStateResponseSchema,
  GetVaultConnectionValueResponseSchema,
  PutVaultConnectionBodySchema,
  PutVaultConnectionResponseSchema,
  VAULT_CONNECTION_VALUE_MAX_LENGTH,
  VaultConnectionErrorResponseSchema,
  VaultConnectionParamsSchema,
  deleteVaultConnectionContract,
  getVaultConnectionStateContract,
  getVaultConnectionValueContract,
  putVaultConnectionContract,
  VAULT_ACCESS_TOKEN_MAX_LENGTH,
  VAULT_ACCESS_ERROR_CODES,
  VaultAccessErrorCodeSchema,
  VaultAccessScopeSchema,
  PostVaultAccessTokenBodySchema,
  PostVaultAccessTokenResponseSchema,
  VaultAccessErrorResponseSchema,
  ListVaultConnectionsParamsSchema,
  ListVaultConnectionsResponseSchema,
  postVaultAccessTokenContract,
  listVaultConnectionsContract,
  RevokeVaultConnectionResponseSchema,
  revokeVaultConnectionContract,
} from '../../../src/http/endpoints/internal-vault-connection.js';

const body = { value: 'secret-value', scopes: ['calendar_events'] };
const state = { agentId: '7', provider: 'google', status: 'connected', scopes: ['mail_send'] };

describe('vault connection contract', () => {
  it('accepts valid payloads for every schema', () => {
    // Mutazione: rendere params non validi (es. regex rotta) fa fallire.
    expect(VaultConnectionParamsSchema.safeParse({ agentId: '123', provider: 'google' }).success).toBe(true);
    expect(PutVaultConnectionBodySchema.safeParse({ ...body, accountLabel: 'a@b.c' }).success).toBe(true);
    expect(PutVaultConnectionResponseSchema.safeParse({ ok: true, status: 'connected' }).success).toBe(true);
    expect(DeleteVaultConnectionResponseSchema.safeParse({ ok: true, status: 'revoked' }).success).toBe(true);
    expect(GetVaultConnectionStateResponseSchema.safeParse(state).success).toBe(true);
    expect(GetVaultConnectionValueResponseSchema.safeParse({ ok: true, value: 'v' }).success).toBe(true);
    expect(VaultConnectionErrorResponseSchema.safeParse({ ok: false, error: 'x' }).success).toBe(true);
  });

  it('rejects extra fields everywhere', () => {
    // Mutazione: togliere .strict() da uno schema fa passare il campo extra.
    expect(VaultConnectionParamsSchema.safeParse({ agentId: '1', provider: 'google', x: 1 }).success).toBe(false);
    expect(PutVaultConnectionBodySchema.safeParse({ ...body, x: 1 }).success).toBe(false);
    expect(PutVaultConnectionResponseSchema.safeParse({ ok: true, status: 'connected', x: 1 }).success).toBe(false);
    expect(DeleteVaultConnectionResponseSchema.safeParse({ ok: true, status: 'revoked', x: 1 }).success).toBe(false);
    expect(GetVaultConnectionValueResponseSchema.safeParse({ ok: true, value: 'v', x: 1 }).success).toBe(false);
    expect(VaultConnectionErrorResponseSchema.safeParse({ ok: false, error: 'e', x: 1 }).success).toBe(false);
  });

  it.each(['0', 'abc', '01', '12345678901', ''])('rejects agentId %j', (agentId) => {
    // Mutazione: regex /^[0-9]+$/ accetterebbe '0' e '01'; senza {0,9} accetterebbe undici cifre.
    expect(VaultConnectionParamsSchema.safeParse({ agentId, provider: 'google' }).success).toBe(false);
  });

  it('accepts the maximum agentId of ten digits', () => {
    // Mutazione: limite {0,8} lo rifiuterebbe.
    expect(VaultConnectionParamsSchema.safeParse({ agentId: '1234567890', provider: 'google' }).success).toBe(true);
  });

  it('rejects unknown provider', () => {
    // Mutazione: provider z.string() lo accetterebbe.
    expect(VaultConnectionParamsSchema.safeParse({ agentId: '1', provider: 'dropbox' }).success).toBe(false);
    expect(PutVaultConnectionBodySchema.safeParse({ ...body, provider: 'google' }).success).toBe(false);
  });

  it('enforces value length bounds', () => {
    // Mutazione: togliere min(1) o alzare max accetterebbe i casi limite.
    expect(VAULT_CONNECTION_VALUE_MAX_LENGTH).toBe(8192);
    expect(PutVaultConnectionBodySchema.safeParse({ ...body, value: '' }).success).toBe(false);
    expect(PutVaultConnectionBodySchema.safeParse({ ...body, value: 'a'.repeat(8192) }).success).toBe(true);
    expect(PutVaultConnectionBodySchema.safeParse({ ...body, value: 'a'.repeat(8193) }).success).toBe(false);
    expect(GetVaultConnectionValueResponseSchema.safeParse({ ok: true, value: '' }).success).toBe(false);
  });

  it('rejects empty, duplicate and unknown scopes and long labels', () => {
    // Mutazione: togliere min(1), il refine sui duplicati o max(200).
    expect(PutVaultConnectionBodySchema.safeParse({ ...body, scopes: [] }).success).toBe(false);
    expect(PutVaultConnectionBodySchema.safeParse({ ...body, scopes: ['mail_send', 'mail_send'] }).success).toBe(false);
    expect(PutVaultConnectionBodySchema.safeParse({ ...body, scopes: ['mail_read'] }).success).toBe(false);
    expect(PutVaultConnectionBodySchema.safeParse({ ...body, accountLabel: 'a'.repeat(201) }).success).toBe(false);
    expect(PutVaultConnectionBodySchema.safeParse({ value: 'v' }).success).toBe(false);
  });

  it('rejects status carrying token or value', () => {
    // Mutazione: usare uno schema di stato non strict (o con campo value) li accetterebbe.
    for (const key of ['accessToken', 'refreshToken', 'value']) {
      expect(GetVaultConnectionStateResponseSchema.safeParse({ ...state, [key]: 'x' }).success, key).toBe(false);
    }
  });

  it('rejects wrong literals in responses', () => {
    // Mutazione: z.string() al posto dei literal accetterebbe stati diversi.
    expect(PutVaultConnectionResponseSchema.safeParse({ ok: true, status: 'revoked' }).success).toBe(false);
    expect(DeleteVaultConnectionResponseSchema.safeParse({ ok: true, status: 'connected' }).success).toBe(false);
    expect(VaultConnectionErrorResponseSchema.safeParse({ ok: true, error: 'x' }).success).toBe(false);
  });

  it('declares secret auth, methods and paths under /internal/vault/connections/', () => {
    // Mutazione: authType 'token' o un path fuori prefisso fa fallire.
    const contracts = [
      [putVaultConnectionContract, 'PUT'],
      [deleteVaultConnectionContract, 'DELETE'],
      [getVaultConnectionStateContract, 'GET'],
      [getVaultConnectionValueContract, 'GET'],
      [revokeVaultConnectionContract, 'POST'],
    ] as const;
    for (const [contract, method] of contracts) {
      expect(contract.authType).toBe('secret');
      expect(contract.method).toBe(method);
      expect(contract.path.startsWith('/internal/vault/connections/')).toBe(true);
    }
    expect(getVaultConnectionValueContract.path).toBe('/internal/vault/connections/:agentId/:provider/value');
  });
});

describe('vault access tokens and connection inventory', () => {
  const request = { scope: 'calendar_events', personRef: 'person-7' };
  const response = { ok: true, accessToken: 'short-lived-token', expiresAt: 1800000000, scopes: ['calendar_events'] };
  const connection = { provider: 'google', status: 'connected', scopes: ['calendar_events'] };
  const inventory = { ok: true, connections: [connection] };

  it('accepts supported access scopes and rejects sending and unknown scopes', () => {
    // Removing the scope refinement must allow mail_send and fail this test.
    for (const scope of ['calendar_events', 'contacts_read', 'mail_draft']) {
      expect(VaultAccessScopeSchema.safeParse(scope).success).toBe(true);
      expect(PostVaultAccessTokenBodySchema.safeParse({ ...request, scope }).success).toBe(true);
    }
    for (const scope of ['mail_send', 'mail_read', '']) {
      expect(VaultAccessScopeSchema.safeParse(scope).success).toBe(false);
      expect(PostVaultAccessTokenBodySchema.safeParse({ ...request, scope }).success).toBe(false);
    }
    for (const invalid of [{ scope: request.scope }, { ...request, personRef: '' }, { personRef: 'person-7' }]) {
      expect(PostVaultAccessTokenBodySchema.safeParse(invalid).success).toBe(false);
    }
  });

  it('enforces access token length and positive integer unix expiration', () => {
    expect(VAULT_ACCESS_TOKEN_MAX_LENGTH).toBe(4096);
    expect(PostVaultAccessTokenResponseSchema.safeParse(response).success).toBe(true);
    for (const accessToken of ['a', 'a'.repeat(4096)]) {
      expect(PostVaultAccessTokenResponseSchema.safeParse({ ...response, accessToken }).success).toBe(true);
    }
    for (const accessToken of ['', 'a'.repeat(4097), 123]) {
      expect(PostVaultAccessTokenResponseSchema.safeParse({ ...response, accessToken }).success).toBe(false);
    }
    for (const expiresAt of [0, -1, 1800000000.5, '1800000000']) {
      expect(PostVaultAccessTokenResponseSchema.safeParse({ ...response, expiresAt }).success).toBe(false);
    }
    expect(PostVaultAccessTokenResponseSchema.safeParse({ ...response, scopes: ['mail_read'] }).success).toBe(false);
    expect(PostVaultAccessTokenResponseSchema.safeParse({ ...response, ok: false }).success).toBe(false);
  });

  it('accepts exactly the four access failure codes', () => {
    const codes = ['not_connected', 'revoked', 'scope_missing', 'expired'];
    expect(VAULT_ACCESS_ERROR_CODES).toEqual(codes);
    for (const error of codes) {
      expect(VaultAccessErrorCodeSchema.safeParse(error).success).toBe(true);
      expect(VaultAccessErrorResponseSchema.safeParse({ ok: false, error }).success).toBe(true);
    }
    expect(VaultAccessErrorCodeSchema.safeParse('unknown_error').success).toBe(false);
    expect(VaultAccessErrorResponseSchema.safeParse({ ok: false, error: 'unknown_error' }).success).toBe(false);
    expect(VaultAccessErrorResponseSchema.safeParse({ ok: true, error: 'expired' }).success).toBe(false);
  });

  it('validates inventory identities, providers, states, scopes and label bounds', () => {
    expect(ListVaultConnectionsParamsSchema.safeParse({ agentId: '7' }).success).toBe(true);
    expect(ListVaultConnectionsParamsSchema.safeParse({ agentId: '1234567890' }).success).toBe(true);
    for (const agentId of ['', '0', '01', 'abc', '12345678901']) {
      expect(ListVaultConnectionsParamsSchema.safeParse({ agentId }).success).toBe(false);
    }
    expect(ListVaultConnectionsParamsSchema.safeParse({ agentId: '7', provider: 'google' }).success).toBe(false);
    expect(ListVaultConnectionsResponseSchema.safeParse(inventory).success).toBe(true);
    expect(ListVaultConnectionsResponseSchema.safeParse({ ok: true, connections: [] }).success).toBe(true);
    for (const status of ['not_connected', 'connected', 'needs_reconnect', 'revoked']) {
      expect(ListVaultConnectionsResponseSchema.safeParse({ ok: true, connections: [{
        ...connection, status, scopes: ['calendar_events', 'contacts_read', 'mail_send', 'mail_draft'], accountLabel: 'a'.repeat(200),
      }] }).success).toBe(true);
    }
    for (const invalid of [
      { ...connection, provider: 'dropbox' },
      { ...connection, status: 'unknown' },
      { ...connection, scopes: ['mail_read'] },
      { ...connection, accountLabel: 'a'.repeat(201) },
    ]) {
      expect(ListVaultConnectionsResponseSchema.safeParse({ ok: true, connections: [invalid] }).success).toBe(false);
    }
    expect(ListVaultConnectionsResponseSchema.safeParse({ ...inventory, ok: false }).success).toBe(false);
  });

  it('rejects secret fields and extra fields at every new object boundary', () => {
    // Each assertion fails if the corresponding object loses strict validation.
    for (const key of ['refreshToken', 'refresh_token', 'value', 'extra']) {
      expect(PostVaultAccessTokenBodySchema.safeParse({ ...request, [key]: 'x' }).success, key).toBe(false);
      expect(PostVaultAccessTokenResponseSchema.safeParse({ ...response, [key]: 'x' }).success, key).toBe(false);
      expect(VaultAccessErrorResponseSchema.safeParse({ ok: false, error: 'expired', [key]: 'x' }).success, key).toBe(false);
      expect(ListVaultConnectionsParamsSchema.safeParse({ agentId: '7', [key]: 'x' }).success, key).toBe(false);
      expect(ListVaultConnectionsResponseSchema.safeParse({ ...inventory, [key]: 'x' }).success, key).toBe(false);
      expect(ListVaultConnectionsResponseSchema.safeParse({ ok: true, connections: [{ ...connection, [key]: 'x' }] }).success, key).toBe(false);
    }
    expect(ListVaultConnectionsResponseSchema.safeParse({ ...inventory, accessToken: 'x' }).success).toBe(false);
    expect(ListVaultConnectionsResponseSchema.safeParse({ ok: true, connections: [{ ...connection, accessToken: 'x' }] }).success).toBe(false);
  });

  it('declares distinct secret routes and binds the new schemas', () => {
    expect(postVaultAccessTokenContract).toEqual({
      method: 'POST', path: '/internal/vault/connections/:agentId/:provider/access-token', authType: 'secret',
      paramsSchema: VaultConnectionParamsSchema, bodySchema: PostVaultAccessTokenBodySchema,
      responseSchema: PostVaultAccessTokenResponseSchema,
    });
    expect(listVaultConnectionsContract).toEqual({
      method: 'GET', path: '/internal/vault/connections/:agentId', authType: 'secret',
      paramsSchema: ListVaultConnectionsParamsSchema, responseSchema: ListVaultConnectionsResponseSchema,
    });
    const existing = [putVaultConnectionContract, deleteVaultConnectionContract, getVaultConnectionStateContract, getVaultConnectionValueContract];
    const added = [postVaultAccessTokenContract, listVaultConnectionsContract];
    for (const contract of added) {
      expect(existing.map((item) => item.path)).not.toContain(contract.path);
    }
    expect(new Set(added.map((contract) => contract.path)).size).toBe(2);
  });

  it('revoke contract: path, params and strict response with two statuses', () => {
    // Mutazione: cambiare 'not_connected' o togliere .strict() fa fallire.
    expect(revokeVaultConnectionContract.method).toBe('POST');
    expect(revokeVaultConnectionContract.path).toBe('/internal/vault/connections/:agentId/:provider/revoke');
    expect(revokeVaultConnectionContract.paramsSchema).toBe(VaultConnectionParamsSchema);
    expect('bodySchema' in revokeVaultConnectionContract).toBe(false);
    for (const status of ['revoked', 'not_connected']) {
      expect(RevokeVaultConnectionResponseSchema.safeParse({ ok: true, status }).success).toBe(true);
    }
    expect(RevokeVaultConnectionResponseSchema.safeParse({ ok: true, status: 'connected' }).success).toBe(false);
    expect(RevokeVaultConnectionResponseSchema.safeParse({ ok: false, status: 'revoked' }).success).toBe(false);
    expect(RevokeVaultConnectionResponseSchema.safeParse({ ok: true, status: 'revoked', value: 'x' }).success).toBe(false);
  });
});
