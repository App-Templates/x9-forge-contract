import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { KNOWN_CREDENTIAL_KEYS } from '../../src/agent/index.js';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/auth-headers.js';
import * as vault from '../../src/vault/index.js';

const key = 'PAPERCLIP_OWNER_BOARD_KEY' as const;
const contract = vault.internalVaultOwnerPersonKeyContract;

describe('owner-person credentials', () => {
  it('(c1) recognises only owner-person credential keys', () => {
    expect(vault.OWNER_PERSON_CREDENTIAL_KEYS).toEqual([key]);
    expect(vault.isOwnerPersonCredentialKey(key)).toBe(true);
    for (const other of ['OPENAI_API_KEY', 'PAPERCLIP_API_KEY', `${key}_EXTRA`, '']) {
      expect(vault.isOwnerPersonCredentialKey(other)).toBe(false);
    }
  });

  it('(c2) strips the owner-person key and preserves other entries and the input', () => {
    const input = Object.freeze({
      PAPERCLIP_OWNER_BOARD_KEY: 'test-owner-person-value',
      OPENAI_API_KEY: 'test-provider-value',
      PAPERCLIP_API_KEY: 'test-agent-value',
    });
    const output = vault.stripOwnerPersonCredentials(input);
    expect(output).toEqual({
      OPENAI_API_KEY: 'test-provider-value',
      PAPERCLIP_API_KEY: 'test-agent-value',
    });
    expect(output).not.toBe(input);
    expect(input).toEqual({
      PAPERCLIP_OWNER_BOARD_KEY: 'test-owner-person-value',
      OPENAI_API_KEY: 'test-provider-value',
      PAPERCLIP_API_KEY: 'test-agent-value',
    });
    expect(vault.stripOwnerPersonCredentials({})).toEqual({});
  });

  it('(c3) authenticates the port and rejects invalid owners or keys', () => {
    expect(contract.method).toBe('GET');
    expect(contract.path).toBe('/internal/vault/owner-person-key/:ownerId/:key');
    expect(contract.authType).toBe('secret');
    expect(contract.authHeader).toBe(INTERNAL_SECRET_HEADER);
    expect(contract.secretEnv).toBe('OWNER_PERSON_VAULT_SECRET');
    expect(contract.secretEnv).toBe(vault.OWNER_PERSON_VAULT_SECRET_ENV);
    for (const ownerId of ['1', '12', '1234567890']) {
      expect(contract.paramsSchema.parse({ ownerId, key })).toEqual({ ownerId, key });
    }
    for (const ownerId of ['abc', '', '0', '-1', '1.5', '1e2', ' 1', '1 ', '01', 1, null, undefined]) {
      expect(contract.paramsSchema.safeParse({ ownerId, key }).success).toBe(false);
    }
    for (const other of ['OPENAI_API_KEY', 'PAPERCLIP_API_KEY', `${key}_EXTRA`, '', undefined]) {
      expect(contract.paramsSchema.safeParse({ ownerId: '1', key: other }).success).toBe(false);
    }
    expect(contract.paramsSchema.safeParse({ ownerId: '1', key, extra: true }).success).toBe(false);
  });

  it('(c4) accepts strict success and not-found responses and rejects extra fields', () => {
    const success = { ok: true, key, value: 'test-owner-person-value' };
    const notFound = { ok: false, error: 'not_found' };
    for (const response of [success, notFound]) {
      expect(contract.responseSchema.parse(response)).toEqual(response);
      expect(contract.responseSchema.safeParse({ ...response, extra: true }).success).toBe(false);
    }
    for (const response of [
      { ...success, key: 'OPENAI_API_KEY' },
      { ...success, value: '' },
      { ok: true, key },
      { ok: false, error: 'other_error' },
      { ...notFound, value: 'test-owner-person-value' },
    ]) {
      expect(contract.responseSchema.safeParse(response).success).toBe(false);
    }
  });

  it('(c5) keeps owner-person keys separate from agent and platform credentials', () => {
    for (const ownerPersonKey of vault.OWNER_PERSON_CREDENTIAL_KEYS) {
      expect(KNOWN_CREDENTIAL_KEYS).not.toContain(ownerPersonKey);
      expect(vault.PLATFORM_INTERNAL_CREDENTIAL_KEYS).not.toContain(ownerPersonKey);
    }
    expect(KNOWN_CREDENTIAL_KEYS).not.toContain(vault.OWNER_PERSON_VAULT_SECRET_ENV);
    expect(vault.PLATFORM_INTERNAL_CREDENTIAL_KEYS).not.toContain(vault.OWNER_PERSON_VAULT_SECRET_ENV);
    expect(vault.isOwnerPersonCredentialKey(vault.OWNER_PERSON_VAULT_SECRET_ENV)).toBe(false);
  });

  it('(c6) exports the rules and contract from the CommonJS vault dist', () => {
    const built: typeof vault = createRequire(import.meta.url)('../../dist/vault/index.cjs');
    expect(built.OWNER_PERSON_CREDENTIAL_KEYS).toEqual([key]);
    expect(built.OWNER_PERSON_VAULT_SECRET_ENV).toBe(vault.OWNER_PERSON_VAULT_SECRET_ENV);
    expect(built.isOwnerPersonCredentialKey(key)).toBe(true);
    expect(built.isOwnerPersonCredentialKey('OPENAI_API_KEY')).toBe(false);
    expect(built.stripOwnerPersonCredentials({ [key]: 'test-value', OPENAI_API_KEY: 'test-provider-value' }))
      .toEqual({ OPENAI_API_KEY: 'test-provider-value' });
    expect(built.OwnerPersonCredentialKeySchema.parse(key)).toBe(key);
    expect(built.OwnerPersonKeyParamsSchema.parse({ ownerId: '1', key })).toEqual({ ownerId: '1', key });
    const success = { ok: true, key, value: 'test-owner-person-value' };
    const notFound = { ok: false, error: 'not_found' };
    expect(built.OwnerPersonKeyOkResponseSchema.parse(success)).toEqual(success);
    expect(built.OwnerPersonKeyNotFoundResponseSchema.parse(notFound)).toEqual(notFound);
    expect(built.OwnerPersonKeyResponseSchema.parse(notFound)).toEqual(notFound);
    const builtContract = built.internalVaultOwnerPersonKeyContract;
    expect(builtContract).toMatchObject({
      method: contract.method,
      path: contract.path,
      authType: contract.authType,
      authHeader: INTERNAL_SECRET_HEADER,
      secretEnv: vault.OWNER_PERSON_VAULT_SECRET_ENV,
    });
    expect(builtContract.paramsSchema.safeParse({ ownerId: 'abc', key }).success).toBe(false);
    expect(builtContract.paramsSchema.safeParse({ ownerId: '1', key: 'OPENAI_API_KEY' }).success).toBe(false);
    expect(builtContract.responseSchema.parse(success)).toEqual(success);
    expect(builtContract.responseSchema.parse(notFound)).toEqual(notFound);
    expect(builtContract.responseSchema.safeParse({ ...success, extra: true }).success).toBe(false);
  });
});
