/**
 * Platform-internal credentials — vault keys that live at the `platform` tier
 * but are NOT inherited by tenants.
 *
 * The `platform` tier mixes two things:
 *   - inheritable defaults every agent may use (e.g. `OPENAI_API_KEY`);
 *   - credentials only a platform service uses on its own behalf (e.g. the
 *     Telegram *user* session Forge factory-svc uses to talk to @BotFather).
 *
 * Keys listed here are resolved only by the service that owns them (Forge
 * factory-svc reads the platform row directly). They MUST NOT be projected
 * into an agent's `credentials` (context.json, vault `/resolve`, agent `.env`).
 *
 * Why: SEC 2026-10-01 — Forge copied every platform-tier row into every
 * tenant's `context.json`, so the BotFather userbot session reached all
 * agents of all owners. No X9 code reads it from a tenant context.
 *
 * Leaf module (no imports) so `src/agent` can depend on it without a cycle.
 */
/**
 * - `TELEGRAM_SESSION_STRING` — Forge factory-svc @BotFather userbot session.
 * - `APPROVALS_SIGNING_KEY` — Ed25519 private key cap-approvals signs permits with (phase 59); clients only ever see
 *   the public key (`approvalKeysContract`), so the key must never be projected into any agent.
 * - `CONNECT_GOOGLE_CLIENT_ID` — Google OAuth client id, solo il servizio Connessioni.
 * - `CONNECT_GOOGLE_CLIENT_SECRET` — Google OAuth client secret, solo il servizio Connessioni.
 * - `CONNECT_VAULT_SECRET` — segreto del servizio Connessioni verso il Vault; mai proiettato in un agente.
 */
export declare const PLATFORM_INTERNAL_CREDENTIAL_KEYS: readonly ["TELEGRAM_SESSION_STRING", "APPROVALS_SIGNING_KEY", "CONNECT_GOOGLE_CLIENT_ID", "CONNECT_GOOGLE_CLIENT_SECRET", "CONNECT_VAULT_SECRET"];
export type PlatformInternalCredentialKey = (typeof PLATFORM_INTERNAL_CREDENTIAL_KEYS)[number];
export declare function isPlatformInternalCredentialKey(key: string): key is PlatformInternalCredentialKey;
/** Copy of `credentials` without platform-internal keys (input untouched). */
export declare function stripPlatformInternalCredentials<T extends Record<string, string>>(credentials: T): T;
//# sourceMappingURL=platform-internal-credentials.d.ts.map