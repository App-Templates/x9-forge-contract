import { z } from 'zod';
/**
 * AES-256-GCM wire format regex for vault-stored encrypted secrets.
 *
 * Format: `iv_hex:auth_tag_hex:ciphertext_hex` (all lowercase).
 *   - iv       = 12 bytes → 24 hex chars
 *   - auth tag = 16 bytes → 32 hex chars (GCM default)
 *   - ciphertext ≥ 1 byte → ≥ 2 hex chars
 *
 * Node `Buffer.toString('hex')` always produces lowercase — case-insensitivity
 * is intentionally NOT enabled to catch callers that hand-roll ciphertext in
 * wrong case.
 *
 * @see forge-v2/services/vault/src/lib/crypto.ts:29-36 (encrypt)
 */
export declare const AES_WIRE_FORMAT_REGEX: RegExp;
/**
 * Vault entry DTO — plaintext value (already decrypted by Forge vault.service).
 *
 * Security guard (T-05-01): if `isSecret=true` and `value` matches
 * AES_WIRE_FORMAT_REGEX, parse is rejected. This catches a decrypted-secret
 * DTO that still carries ciphertext (i.e. decrypt was skipped upstream).
 *
 * `isCustomized` derivation `isCustomized === (tier === 'agent')` is a Forge
 * consumer invariant (D-11), NOT enforced here.
 *
 * @see forge-v2/services/vault/src/services/vault.service.ts:42-51 (VaultEntry)
 */
export declare const VaultEntryPlainSchema: z.ZodObject<{
    id: z.ZodNumber;
    key: z.ZodString;
    isCustomized: z.ZodBoolean;
    tier: z.ZodEnum<{
        platform: "platform";
        owner: "owner";
        agent: "agent";
    }>;
    agentId: z.ZodNullable<z.ZodNumber>;
    ownerId: z.ZodNullable<z.ZodNumber>;
    createdAt: z.ZodOptional<z.ZodString>;
    value: z.ZodString;
    isSecret: z.ZodBoolean;
}, z.core.$strip>;
export type VaultEntryPlain = z.infer<typeof VaultEntryPlainSchema>;
/**
 * Vault entry DTO — encrypted wire format value (DB-row / pre-decrypt).
 *
 * `isSecret` is `z.literal(true)`: only secret entries are encrypted. Rows
 * with `isSecret=false` live entirely under VaultEntryPlain (Forge stores
 * non-secrets in plaintext in the same DB column).
 *
 * This type is rarely used in API responses — Forge decrypts before returning.
 * Ship it for defensive typing of any future storage-layer endpoint.
 *
 * @see forge-v2/services/vault/src/repositories/vault.repo.ts:7-16 (VaultRow)
 */
export declare const VaultEntryEncryptedSchema: z.ZodObject<{
    id: z.ZodNumber;
    key: z.ZodString;
    isCustomized: z.ZodBoolean;
    tier: z.ZodEnum<{
        platform: "platform";
        owner: "owner";
        agent: "agent";
    }>;
    agentId: z.ZodNullable<z.ZodNumber>;
    ownerId: z.ZodNullable<z.ZodNumber>;
    createdAt: z.ZodOptional<z.ZodString>;
    value: z.ZodString;
    isSecret: z.ZodLiteral<true>;
}, z.core.$strip>;
export type VaultEntryEncrypted = z.infer<typeof VaultEntryEncryptedSchema>;
//# sourceMappingURL=vault-entry.d.ts.map