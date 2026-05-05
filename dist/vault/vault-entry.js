import { z } from 'zod';
import { VaultTierSchema } from "./vault-tier.js";
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
export const AES_WIRE_FORMAT_REGEX = /^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]{2,}$/;
const AES_WIRE_FORMAT_ERROR = 'expected AES-256-GCM wire format: iv_hex(24):authTag_hex(32):ciphertext_hex(lowercase, ≥2 hex chars)';
const VaultEntryBase = z.object({
    id: z.number().int().nonnegative(),
    key: z.string().min(1),
    isCustomized: z.boolean(),
    tier: VaultTierSchema,
    agentId: z.number().int().nullable(),
    ownerId: z.number().int().nullable(),
    /**
     * Row creation timestamp. Optional because some DTO projections (e.g. vault
     * UI list) omit it. Aligned with Drizzle `vault_entries.created_at`.
     *
     * NOTE: CONTEXT D-08 originally proposed `updatedAt`; reconciled to
     * `createdAt` against Forge Drizzle schema — `vault_entries` has NO
     * `updated_at` column (only `workspace_files` does). See 05-01-PLAN.md Q1.
     */
    createdAt: z.string().datetime({ offset: true }).optional(),
});
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
export const VaultEntryPlainSchema = VaultEntryBase.extend({
    value: z.string(),
    isSecret: z.boolean(),
}).refine((data) => !(data.isSecret && AES_WIRE_FORMAT_REGEX.test(data.value)), { message: 'Plain secret value matches AES wire format — decrypt was not performed?' });
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
export const VaultEntryEncryptedSchema = VaultEntryBase.extend({
    value: z.string().regex(AES_WIRE_FORMAT_REGEX, { message: AES_WIRE_FORMAT_ERROR }),
    isSecret: z.literal(true),
});
//# sourceMappingURL=vault-entry.js.map