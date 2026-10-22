/**
 * Environment variables that MUST exist at Forge service boot and that CANNOT
 * live in the vault (bootstrap recursion: the vault is encrypted with
 * `VAULT_KEY`, so `VAULT_KEY` itself cannot be a vault entry).
 *
 * This is a **type-only** contract — there is no runtime Zod schema and no
 * parser. The type documents the 4 known bootstrap keys; services load them
 * from process env (docker secret, hPanel, etc.), NOT from the vault.
 *
 * Threat mitigated: T-05-02 (bootstrap recursion / DoS). If `VAULT_KEY` were
 * vaulted, Forge would fail to decrypt the vault on boot.
 *
 * @see forge-v2/services/vault/src/lib/crypto.ts:21 (VAULT_KEY loading)
 * @see .planning/PROJECT.md §"Key Decisions" — bootstrap recursion
 */
export type PlatformBootstrapEnv = {
    /** AES-256 key, hex-encoded 32 bytes. Used to decrypt vault entries. */
    VAULT_KEY: string;
    /** Postgres/Drizzle connection string. */
    DATABASE_URL: string;
    /** Clerk server-side secret key. */
    CLERK_SECRET_KEY: string;
    /** Hardcoded super-admin Clerk user id (RNTM-03: removable post v1). */
    SUPERADMIN_CLERK_ID: string;
};
//# sourceMappingURL=platform-bootstrap-env.d.ts.map