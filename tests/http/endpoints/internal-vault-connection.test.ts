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
    ] as const;
    for (const [contract, method] of contracts) {
      expect(contract.authType).toBe('secret');
      expect(contract.method).toBe(method);
      expect(contract.path.startsWith('/internal/vault/connections/')).toBe(true);
    }
    expect(getVaultConnectionValueContract.path).toBe('/internal/vault/connections/:agentId/:provider/value');
  });
});
