import { describe, expect, it } from 'vitest';
import {
  CONNECTION_CREDENTIAL_KEY_PREFIX,
  CONNECT_VAULT_SECRET_ENV,
  PLATFORM_INTERNAL_CREDENTIAL_KEYS,
  connectionCredentialKey,
  isConnectionCredentialKey,
} from '../../src/vault/index.js';

describe('connection credential keys', () => {
  it('exports the shared prefix and port secret setting', () => {
    // Mutation: changing the prefix or conflating the port secret with an internal token fails.
    expect(CONNECTION_CREDENTIAL_KEY_PREFIX).toBe('CONNECTION_');
    expect(CONNECT_VAULT_SECRET_ENV).toBe('CONNECT_VAULT_SECRET');
  });

  it('generates the uppercase Google key', () => {
    // Mutation: removing the prefix or uppercase conversion fails.
    expect(connectionCredentialKey('google')).toBe('CONNECTION_GOOGLE');
  });

  it('recognises generated keys', () => {
    // Mutation: removing uppercase conversion or the generated prefix fails.
    expect(isConnectionCredentialKey(connectionCredentialKey('google'))).toBe(true);
  });

  it.each(['CONNECTION_GOOGLE', 'CONNECTION_A0_B', 'CONNECTION_0', 'CONNECTION__'])(
    'accepts the valid key %j',
    (key) => {
      // Mutation: restricting the uppercase/digit/underscore suffix grammar fails.
      expect(isConnectionCredentialKey(key)).toBe(true);
    },
  );

  it.each([
    'connection_google', 'CONNECTION_google', 'GOOGLE', '', 'CONNECTION_',
    ' CONNECTION_GOOGLE', 'CONNECTION_GOOGLE ', 'CONNECTION_GO OGLE',
    'XCONNECTION_GOOGLE', 'CONNECTION_GOOGLE!', 'CONNECTION_GOOGLE\n',
    'CONNECTION_GOOGLE\r', 'CONNECTION_GOOGLE\t', 'CONNECTION_GOOGLE\nOTHER',
    'CONNECT_GOOGLE_CLIENT_ID',
  ])('rejects the invalid key %j', (key) => {
    // Mutation: removing the prefix, uppercase restriction, nonempty suffix or full anchoring fails.
    expect(isConnectionCredentialKey(key)).toBe(false);
  });

  it('excludes every platform-internal credential key', () => {
    // Mutation: removing the CONNECTION_ prefix check admits these uppercase keys.
    for (const key of PLATFORM_INTERNAL_CREDENTIAL_KEYS) {
      expect(isConnectionCredentialKey(key)).toBe(false);
    }
  });
});
