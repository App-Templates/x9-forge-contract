"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONNECT_VAULT_SECRET_ENV = exports.CONNECTION_CREDENTIAL_KEY_PREFIX = void 0;
exports.connectionCredentialKey = connectionCredentialKey;
exports.isConnectionCredentialKey = isConnectionCredentialKey;
exports.CONNECTION_CREDENTIAL_KEY_PREFIX = 'CONNECTION_';
/** Setting containing the connection port secret, separate from Vault's internal token. */
exports.CONNECT_VAULT_SECRET_ENV = 'CONNECT_VAULT_SECRET';
function connectionCredentialKey(provider) {
    return `${exports.CONNECTION_CREDENTIAL_KEY_PREFIX}${provider.toUpperCase()}`;
}
/** Recognise agent-only connection entries without resolving their values. */
function isConnectionCredentialKey(key) {
    // The final assertion also rejects trailing newlines, which `$` alone allows.
    return /^CONNECTION_[A-Z0-9_]+$(?![\s\S])/.test(key);
}
//# sourceMappingURL=connection-credential-keys.js.map