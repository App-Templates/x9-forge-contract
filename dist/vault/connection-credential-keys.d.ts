import type { ConnectProvider } from "../capability/connect/index.js";
export declare const CONNECTION_CREDENTIAL_KEY_PREFIX = "CONNECTION_";
/** Setting containing the connection port secret, separate from Vault's internal token. */
export declare const CONNECT_VAULT_SECRET_ENV = "CONNECT_VAULT_SECRET";
export declare function connectionCredentialKey(provider: ConnectProvider): string;
/** Recognise agent-only connection entries without resolving their values. */
export declare function isConnectionCredentialKey(key: string): boolean;
//# sourceMappingURL=connection-credential-keys.d.ts.map