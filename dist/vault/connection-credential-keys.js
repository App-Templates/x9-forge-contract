export const CONNECTION_CREDENTIAL_KEY_PREFIX = 'CONNECTION_';
/** Setting containing the connection port secret, separate from Vault's internal token. */
export const CONNECT_VAULT_SECRET_ENV = 'CONNECT_VAULT_SECRET';
export function connectionCredentialKey(provider) {
    return `${CONNECTION_CREDENTIAL_KEY_PREFIX}${provider.toUpperCase()}`;
}
/** Recognise agent-only connection entries without resolving their values. */
export function isConnectionCredentialKey(key) {
    // The final assertion also rejects trailing newlines, which `$` alone allows.
    return /^CONNECTION_[A-Z0-9_]+$(?![\s\S])/.test(key);
}
//# sourceMappingURL=connection-credential-keys.js.map